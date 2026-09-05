#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const SUITES = Object.freeze([
  {
    id: "viz-core",
    literalCommand: "pnpm --filter @oods/viz-core exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/viz-core", "exec", "vitest", "run"],
    listArgs: ["--filter", "@oods/viz-core", "exec", "vitest", "list"],
  },
  {
    id: "viz-render",
    literalCommand: "pnpm --filter @oods/viz-render exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/viz-render", "exec", "vitest", "run"],
    listArgs: ["--filter", "@oods/viz-render", "exec", "vitest", "list"],
  },
  {
    id: "mcp-server",
    literalCommand: "pnpm --filter @oods/mcp-server exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/mcp-server", "exec", "vitest", "run"],
    listArgs: ["--filter", "@oods/mcp-server", "exec", "vitest", "list"],
  },
  {
    id: "root-core",
    literalCommand: "pnpm exec vitest run --project core",
    command: "pnpm",
    args: ["exec", "vitest", "run", "--project", "core"],
    listArgs: ["exec", "vitest", "list", "--project", "core"],
  },
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const workspaceArgument = argument("--workspace");
const outputArgument = argument("--output-root");
const repositoryOutputPrefix =
  argument("--repository-output-prefix") ??
  "artifacts/product-reality/sprint-184/m07/closeout-inputs/suites/current";
if (!workspaceArgument || !outputArgument) {
  throw new Error(
    "Usage: node scripts/product-reality/capture-s184-m07-suites.mjs --workspace <clean-frozen-worktree> --output-root <outside-worktree-directory> [--repository-output-prefix <artifacts/.../closeout-inputs/path>] [--collection-only --suite <id> --expected-files <n> --expected-tests <n> --expected-skipped-tests <n>]",
  );
}

const workspace = path.resolve(workspaceArgument);
const outputRoot = path.resolve(outputArgument);
const outputRelativeToWorkspace = path.relative(workspace, outputRoot);
if (
  outputRelativeToWorkspace === "" ||
  (!outputRelativeToWorkspace.startsWith(`..${path.sep}`) &&
    outputRelativeToWorkspace !== "..")
) {
  throw new Error("--output-root must be outside the frozen worktree.");
}
if (
  path.isAbsolute(repositoryOutputPrefix) ||
  repositoryOutputPrefix.split("/").includes("..")
) {
  throw new Error("--repository-output-prefix must be repository-relative.");
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function commandText(command, args) {
  return [command, ...args].join(" ");
}

function run(command, args) {
  const startedAt = new Date().toISOString();
  const started = process.hrtime.bigint();
  const result = spawnSync(command, args, {
    cwd: workspace,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
    maxBuffer: 128 * 1024 * 1024,
  });
  return {
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs: Number(process.hrtime.bigint() - started) / 1_000_000,
    exitCode: result.status ?? 127,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: workspace,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function forbiddenLeaks() {
  const matches = [];
  const pending = [path.join(workspace, "packages", "mcp-server")];
  const compilerLeak =
    /^\.(?:s182-(?:react|vue)-matrix|s183-(?:react|vue)(?:-runtime)?-actions)-/;
  while (pending.length > 0) {
    const directory = pending.pop();
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(workspace, absolutePath);
      if (
        compilerLeak.test(entry.name) ||
        relativePath === "packages/mcp-server/test/__scratch__"
      ) {
        matches.push(relativePath);
        continue;
      }
      if (entry.name !== "node_modules" && entry.name !== "dist") {
        pending.push(absolutePath);
      }
    }
  }
  return matches.sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

function cleanliness() {
  const rows = git(["status", "--porcelain=v1", "--untracked-files=all"])
    .split(/\r?\n/)
    .filter(Boolean);
  const leaks = forbiddenLeaks();
  return {
    rows,
    forbiddenLeaks: leaks,
    clean: rows.length === 0 && leaks.length === 0,
  };
}

function writeLog(relativePath, command, result) {
  const absolutePath = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const contents = [
    `$ ${command}`,
    `exitCode=${result.exitCode}`,
    `startedAt=${result.startedAt}`,
    `endedAt=${result.endedAt}`,
    `durationMs=${result.durationMs.toFixed(3)}`,
    "[stdout]",
    result.stdout,
    "[stderr]",
    result.stderr,
  ].join("\n");
  fs.writeFileSync(absolutePath, contents);
  const bytes = fs.readFileSync(absolutePath);
  return {
    path: path.posix.join(repositoryOutputPrefix, relativePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function writeJson(relativePath, value) {
  const absolutePath = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const contents = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(absolutePath, contents);
  const bytes = Buffer.from(contents, "utf8");
  return {
    path: path.posix.join(repositoryOutputPrefix, relativePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function summarizeVitest(report) {
  const fileResults = (report.testResults ?? [])
    .map((result) => ({
      path: path.relative(workspace, result.name),
      status: result.status,
      durationMs: result.endTime - result.startTime,
      tests: {
        total: result.assertionResults?.length ?? 0,
        passed:
          result.assertionResults?.filter(({ status }) => status === "passed")
            .length ?? 0,
        failed:
          result.assertionResults?.filter(({ status }) => status === "failed")
            .length ?? 0,
        skipped:
          result.assertionResults?.filter(({ status }) =>
            ["pending", "skipped", "disabled"].includes(status),
          ).length ?? 0,
        todo:
          result.assertionResults?.filter(({ status }) => status === "todo")
            .length ?? 0,
      },
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  return {
    success: report.success === true,
    files: {
      total: fileResults.length,
      passed: fileResults.filter(({ status }) => status === "passed").length,
      failed: fileResults.filter(({ status }) => status === "failed").length,
      skipped: fileResults.filter(({ status }) =>
        ["pending", "skipped", "disabled"].includes(status),
      ).length,
    },
    tests: {
      total: report.numTotalTests ?? 0,
      passed: report.numPassedTests ?? 0,
      failed: report.numFailedTests ?? 0,
      skipped: report.numPendingTests ?? 0,
      todo: report.numTodoTests ?? 0,
    },
    fileResults,
  };
}

function requiredInteger(name) {
  const raw = argument(name);
  const value = raw === undefined ? Number.NaN : Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return value;
}

function repositoryPath(absolutePath) {
  const resolvedPath = path.isAbsolute(absolutePath)
    ? absolutePath
    : path.resolve(workspace, absolutePath);
  return path.relative(workspace, resolvedPath).split(path.sep).join("/");
}

function captureCollectionOnly() {
  const suiteId = argument("--suite");
  const suite = SUITES.find(({ id }) => id === suiteId);
  if (!suite) {
    throw new Error(
      `--collection-only requires --suite ${SUITES.map(({ id }) => id).join("|")}.`,
    );
  }
  const expectedFiles = requiredInteger("--expected-files");
  const expectedTests = requiredInteger("--expected-tests");
  const expectedSkippedTests = requiredInteger("--expected-skipped-tests");
  const cleanBefore = cleanliness();
  if (!cleanBefore.clean) {
    throw new Error(
      `Collection requires a clean frozen worktree; found ${cleanBefore.rows.length} tracked/untracked row(s) and ${cleanBefore.forbiddenLeaks.length} forbidden leak(s).`,
    );
  }
  fs.mkdirSync(outputRoot, { recursive: true });
  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "oods-s184-m07-collection-json-"),
  );
  try {
    const testsPath = path.join(temporaryRoot, "tests.json");
    const filesPath = path.join(temporaryRoot, "files.json");
    const testsArgs = [...suite.listArgs, `--json=${testsPath}`];
    const filesArgs = [...suite.listArgs, "--filesOnly", `--json=${filesPath}`];
    const testsResult = run(suite.command, testsArgs);
    const filesResult = run(suite.command, filesArgs);
    const testRows =
      testsResult.exitCode === 0
        ? JSON.parse(fs.readFileSync(testsPath, "utf8"))
        : [];
    const fileRows =
      filesResult.exitCode === 0
        ? JSON.parse(fs.readFileSync(filesPath, "utf8"))
        : [];
    const activeTestsByFile = new Map();
    for (const row of testRows) {
      const rowPath = repositoryPath(row.file);
      activeTestsByFile.set(rowPath, (activeTestsByFile.get(rowPath) ?? 0) + 1);
    }
    const fileResults = fileRows
      .map((row) => {
        const rowPath = repositoryPath(row.file);
        return {
          path: rowPath,
          status: "collected",
          tests: {
            collectedRunnable: activeTestsByFile.get(rowPath) ?? 0,
          },
        };
      })
      .sort((left, right) =>
        left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
      );
    const collectedRunnableTests = testRows.length;
    const reconstructedTotalTests =
      collectedRunnableTests + expectedSkippedTests;
    const populationPassed =
      testsResult.exitCode === 0 &&
      filesResult.exitCode === 0 &&
      fileResults.length === expectedFiles &&
      reconstructedTotalTests === expectedTests &&
      new Set(fileResults.map(({ path: rowPath }) => rowPath)).size ===
        fileResults.length;
    const logs = {
      tests: writeLog(
        `logs/${suite.id}-list-tests.log`,
        commandText(suite.command, testsArgs),
        testsResult,
      ),
      files: writeLog(
        `logs/${suite.id}-list-files.log`,
        commandText(suite.command, filesArgs),
        filesResult,
      ),
    };
    const cleanAfter = cleanliness();
    const receipt = {
      schemaVersion: "1.0.0",
      kind: "s184-m07-suite-population-receipt",
      sprintId: "sprint-184",
      missionId: "s184-m07",
      suite: suite.id,
      measuredHead: git(["rev-parse", "HEAD"]),
      status: populationPassed && cleanAfter.clean ? "collected" : "failed",
      collectionCommands: {
        runnableTests: commandText(suite.command, testsArgs),
        allFiles: commandText(suite.command, filesArgs),
      },
      logs,
      cleanBefore,
      cleanAfter,
      vitest: {
        collectionOnly: true,
        files: {
          total: fileResults.length,
          passed: null,
          failed: null,
          skipped: null,
        },
        tests: {
          total: reconstructedTotalTests,
          collectedRunnable: collectedRunnableTests,
          skipped: expectedSkippedTests,
          passed: null,
          failed: null,
          todo: null,
        },
        fileResults,
      },
      populationValidation: {
        expectedFiles,
        expectedTests,
        expectedSkippedTests,
        collectedFiles: fileResults.length,
        collectedRunnableTests,
        reconstructedTotalTests,
        skippedTestsSource:
          "The historical executed suite receipt supplies skipped tests because vitest list --json intentionally omits skipped tests.",
        status: populationPassed ? "passed" : "failed",
      },
    };
    writeJson(`receipts/${suite.id}.json`, receipt);
    writeJson("report.json", {
      schemaVersion: "1.0.0",
      kind: "s184-m07-suite-population-capture",
      sprintId: "sprint-184",
      missionId: "s184-m07",
      measuredHead: receipt.measuredHead,
      suite: suite.id,
      receipt: path.posix.join(
        repositoryOutputPrefix,
        `receipts/${suite.id}.json`,
      ),
      status: receipt.status,
    });
    process.stdout.write(
      `Sprint 184 M07 ${suite.id} population: ${receipt.status} (${fileResults.length}/${expectedFiles} files; ${reconstructedTotalTests}/${expectedTests} tests)\n`,
    );
    if (receipt.status !== "collected") process.exitCode = 1;
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

if (process.argv.includes("--collection-only")) {
  captureCollectionOnly();
} else {
  fs.mkdirSync(outputRoot, { recursive: true });
  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "oods-s184-m07-suite-json-"),
  );
  const measuredHead = git(["rev-parse", "HEAD"]);
  const capture = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-four-suite-capture",
    sprintId: "sprint-184",
    missionId: "s184-m07",
    measuredHead,
    workspace,
    repositoryOutputPrefix,
    suiteConcurrency: "sequential; no concurrent suite jobs",
    cleanBefore: cleanliness(),
    cleanAfter: null,
    suites: [],
    status: "running",
  };

  try {
    if (!capture.cleanBefore.clean) {
      throw new Error(
        `Suite capture requires a clean frozen worktree; found ${capture.cleanBefore.rows.length} row(s).`,
      );
    }
    for (const suite of SUITES) {
      const reporterPath = path.join(temporaryRoot, `${suite.id}.json`);
      const executedArgs = [
        ...suite.args,
        "--reporter=json",
        `--outputFile=${reporterPath}`,
      ];
      const before = cleanliness();
      const result = run(suite.command, executedArgs);
      const after = cleanliness();
      let vitest = null;
      let reporterError = null;
      try {
        vitest = summarizeVitest(
          JSON.parse(fs.readFileSync(reporterPath, "utf8")),
        );
      } catch (error) {
        reporterError = error instanceof Error ? error.message : String(error);
      }
      const executedCommand = commandText(suite.command, executedArgs);
      const log = writeLog(`logs/${suite.id}.log`, executedCommand, result);
      const receipt = {
        schemaVersion: "1.0.0",
        kind: "s184-m07-suite-receipt",
        sprintId: "sprint-184",
        missionId: "s184-m07",
        suite: suite.id,
        measuredHead,
        literalCommand: suite.literalCommand,
        executedCommand,
        startedAt: result.startedAt,
        endedAt: result.endedAt,
        durationMs: result.durationMs,
        exitCode: result.exitCode,
        cleanBefore: before,
        cleanAfter: after,
        log,
        vitest,
        ...(reporterError ? { reporterError } : {}),
        status:
          result.exitCode === 0 &&
          vitest?.success === true &&
          before.clean &&
          after.clean
            ? "passed"
            : "failed",
      };
      const receiptReference = writeJson(`receipts/${suite.id}.json`, receipt);
      capture.suites.push({
        suite: suite.id,
        status: receipt.status,
        receipt: receiptReference,
      });
    }
    capture.cleanAfter = cleanliness();
    capture.status =
      capture.cleanAfter.clean &&
      capture.suites.length === SUITES.length &&
      capture.suites.every(({ status }) => status === "passed")
        ? "passed"
        : "failed";
    writeJson("report.json", capture);
    process.stdout.write(
      `Sprint 184 M07 suite capture: ${capture.status} (${capture.suites.filter(({ status }) => status === "passed").length}/${SUITES.length} suites)\n`,
    );
    if (capture.status !== "passed") process.exitCode = 1;
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
