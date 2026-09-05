#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function argument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const workspaceArgument = argument("--workspace");
const outputArgument = argument("--output-root");

if (!workspaceArgument || !outputArgument) {
  throw new Error(
    "Usage: node scripts/product-reality/capture-s184-m01-baseline.mjs --workspace <clean-worktree> --output-root <directory>",
  );
}

const workspace = path.resolve(workspaceArgument);
const outputRoot = path.resolve(outputArgument);
const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "oods-s184-m01-baseline-"),
);

const setupCommands = [
  {
    id: "install",
    command: "pnpm",
    args: ["install", "--frozen-lockfile"],
  },
  {
    id: "build-tokens",
    command: "pnpm",
    args: ["run", "build:tokens"],
  },
  {
    id: "build-packages",
    command: "pnpm",
    args: ["run", "build:packages"],
  },
  {
    id: "build-publishable-package",
    command: "pnpm",
    args: ["run", "pkg:build"],
  },
];

const suites = [
  {
    id: "viz-core",
    literalCommand: "pnpm --filter @oods/viz-core exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/viz-core", "exec", "vitest", "run"],
  },
  {
    id: "viz-render",
    literalCommand: "pnpm --filter @oods/viz-render exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/viz-render", "exec", "vitest", "run"],
  },
  {
    id: "mcp-server",
    literalCommand: "pnpm --filter @oods/mcp-server exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/mcp-server", "exec", "vitest", "run"],
  },
  {
    id: "root-core",
    literalCommand: "pnpm exec vitest run --project core",
    command: "pnpm",
    args: ["exec", "vitest", "run", "--project", "core"],
  },
];

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function commandText(command, commandArgs) {
  return [command, ...commandArgs].join(" ");
}

function run(command, commandArgs) {
  const startedAt = new Date().toISOString();
  const started = process.hrtime.bigint();
  const loadAverageBefore = os.loadavg();
  const result = spawnSync(command, commandArgs, {
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
  const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
  return {
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs,
    loadAverageBefore,
    loadAverageAfter: os.loadavg(),
    exitCode: result.status ?? 127,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function git(commandArgs) {
  return spawnSync("git", commandArgs, {
    cwd: workspace,
    encoding: "utf8",
  });
}

function forbiddenLeaks() {
  const matches = [];
  const pending = [path.join(workspace, "packages", "mcp-server")];
  const compilerLeak = /^\.(?:s182-(?:react|vue)-matrix|s183-(?:react|vue)(?:-runtime)?-actions)-/;
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
  return matches.sort();
}

function cleanliness() {
  const status = git(["status", "--porcelain=v1", "--untracked-files=all"]);
  const unstaged = git(["diff", "--quiet"]);
  const staged = git(["diff", "--cached", "--quiet"]);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]);
  const leaks = forbiddenLeaks();
  return {
    porcelain: status.stdout.split(/\r?\n/).filter(Boolean),
    statusExitCode: status.status ?? 127,
    unstagedDiffExitCode: unstaged.status ?? 127,
    stagedDiffExitCode: staged.status ?? 127,
    untracked: untracked.stdout.split(/\r?\n/).filter(Boolean),
    untrackedExitCode: untracked.status ?? 127,
    forbiddenLeaks: leaks,
    clean:
      status.status === 0 &&
      status.stdout.trim() === "" &&
      unstaged.status === 0 &&
      staged.status === 0 &&
      untracked.status === 0 &&
      untracked.stdout.trim() === "" &&
      leaks.length === 0,
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
    path: path.relative(path.dirname(outputRoot), absolutePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function writeJson(relativePath, value) {
  const absolutePath = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
  const bytes = fs.readFileSync(absolutePath);
  return {
    path: path.relative(path.dirname(outputRoot), absolutePath),
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function summarizeVitest(report) {
  const fileResults = (report.testResults ?? []).map((result) => ({
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
  }));
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

function version(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: workspace,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

const host = {
  hostname: os.hostname(),
  platform: os.platform(),
  release: os.release(),
  architecture: os.arch(),
  cpuModel: os.cpus()[0]?.model ?? null,
  cpuCount: os.cpus().length,
  totalMemoryBytes: os.totalmem(),
  node: process.version,
  v8: process.versions.v8,
  pnpm: version("pnpm", ["--version"]),
  vitest: version("pnpm", ["exec", "vitest", "--version"]),
  swVers: version("sw_vers", []),
};

const head = version("git", ["rev-parse", "HEAD"]);
const outputParent = path.dirname(outputRoot);
fs.mkdirSync(outputRoot, { recursive: true });

const aggregate = {
  schemaVersion: "1.0.0",
  sprintId: "sprint-184",
  missionId: "s184-m01",
  kind: "four-suite-clean-tree-baseline",
  measuredHead: head,
  workspace,
  exclusiveWorktree: true,
  suiteConcurrency: "sequential; no concurrent suite jobs",
  configuredTestTimeoutMs: 20_000,
  host,
  retryProtocol: {
    initialFailureRetention:
      "An initial red remains a red receipt; an isolated retry may diagnose it but never replaces it.",
    isolatedRetry:
      "Re-run each failed file once in isolation, then record any later full-suite run as a separate numbered attempt.",
    acceptance:
      "Both numbered full-suite runs must exit zero and leave the proof worktree clean; isolated green is diagnostic only.",
  },
  knownLimitation: {
    name: "load-sensitive Vue compiler rows exceed the configured timeout on the independent planning run",
    independentRunDisposition:
      "The full mcp-server and root-core attempts were retained as red; every candidate passed in isolation.",
    vueRowDurationsMs: [53_907, 27_097, 25_861],
    additionalNumericCoercionDurationMs: 23_584,
    configuredTestTimeoutMs: 20_000,
    maximumTimeoutMultiple: 2.7,
    priorMcpAttempts: [
      { status: "failed", loadAverage: 19.51, durationMs: 664_610 },
      { status: "passed", loadAverage: 9.34, durationMs: 422_940 },
    ],
    scope:
      "This baseline reports the current host and both attempts; one local green is not presented as proof that the load-sensitive margin is fixed.",
  },
  setup: [],
  cleanBeforeSetup: cleanliness(),
  cleanAfterSetup: null,
  runs: [],
  status: "running",
};

try {
  for (const setup of setupCommands) {
    const result = run(setup.command, setup.args);
    const executedCommand = commandText(setup.command, setup.args);
    const log = writeLog(`setup/${setup.id}.log`, executedCommand, result);
    aggregate.setup.push({
      id: setup.id,
      executedCommand,
      exitCode: result.exitCode,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      durationMs: result.durationMs,
      loadAverageBefore: result.loadAverageBefore,
      loadAverageAfter: result.loadAverageAfter,
      log,
    });
    if (result.exitCode !== 0) break;
  }
  aggregate.cleanAfterSetup = cleanliness();

  const setupPassed =
    aggregate.setup.length === setupCommands.length &&
    aggregate.setup.every(({ exitCode }) => exitCode === 0) &&
    aggregate.cleanAfterSetup.clean;

  if (setupPassed) {
    for (const runNumber of [1, 2]) {
      const runRecord = {
        run: runNumber,
        cleanBefore: cleanliness(),
        suites: [],
        cleanAfter: null,
      };
      for (const suite of suites) {
        const reportPath = path.join(
          temporaryRoot,
          `run-${runNumber}-${suite.id}.json`,
        );
        const executedArgs = [
          ...suite.args,
          "--reporter=json",
          `--outputFile=${reportPath}`,
        ];
        const cleanBefore = cleanliness();
        const result = run(suite.command, executedArgs);
        const cleanAfter = cleanliness();
        let vitest = null;
        let reportError = null;
        try {
          vitest = summarizeVitest(
            JSON.parse(fs.readFileSync(reportPath, "utf8")),
          );
        } catch (error) {
          reportError = error instanceof Error ? error.message : String(error);
        }
        const executedCommand = commandText(suite.command, executedArgs);
        const log = writeLog(
          `run-${runNumber}/${suite.id}.log`,
          executedCommand,
          result,
        );
        const receipt = {
          schemaVersion: "1.0.0",
          sprintId: "sprint-184",
          missionId: "s184-m01",
          kind: "four-suite-baseline-receipt",
          run: runNumber,
          suite: suite.id,
          measuredHead: head,
          literalCommand: suite.literalCommand,
          executedCommand,
          exitCode: result.exitCode,
          startedAt: result.startedAt,
          endedAt: result.endedAt,
          durationMs: result.durationMs,
          loadAverageBefore: result.loadAverageBefore,
          loadAverageAfter: result.loadAverageAfter,
          cleanBefore,
          cleanAfter,
          log,
          vitest,
          ...(reportError ? { reportError } : {}),
          status:
            result.exitCode === 0 &&
            vitest?.success === true &&
            cleanBefore.clean &&
            cleanAfter.clean
              ? "passed"
              : "failed",
        };
        const receiptReference = writeJson(
          `run-${runNumber}/${suite.id}.json`,
          receipt,
        );
        runRecord.suites.push({ ...receipt, receipt: receiptReference });
      }
      runRecord.cleanAfter = cleanliness();
      aggregate.runs.push(runRecord);
    }
  }

  const allSuites = aggregate.runs.flatMap(({ suites: runSuites }) =>
    runSuites,
  );
  aggregate.status =
    aggregate.cleanBeforeSetup.clean &&
    aggregate.cleanAfterSetup?.clean === true &&
    aggregate.runs.length === 2 &&
    aggregate.runs.every(
      ({ cleanBefore, cleanAfter }) => cleanBefore.clean && cleanAfter.clean,
    ) &&
    allSuites.length === 8 &&
    allSuites.every(({ status }) => status === "passed")
      ? "passed"
      : "failed";
  aggregate.outputRoot = path.relative(outputParent, outputRoot);
  writeJson("four-suite-baseline.json", aggregate);
  process.stdout.write(
    `Sprint 184 m01 baseline: ${aggregate.status} (${allSuites.filter(({ status }) => status === "passed").length}/8 suite receipts passed)\n`,
  );
  if (aggregate.status !== "passed") process.exitCode = 1;
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
