#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const defaultOutputRoot = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-183/m06",
);

const executions = [
  {
    id: "s183-product-reality",
    testFiles: [
      "packages/mcp-server/test/product-reality/runnable-artifact.s183.spec.ts",
      "packages/mcp-server/test/product-reality/typed-action-protocol.s183.spec.ts",
      "packages/mcp-server/test/product-reality/validation-profiles.s183.spec.ts",
      "packages/mcp-server/test/product-reality/saved-schema-compiler.s183.spec.ts",
      "packages/mcp-server/test/product-reality/saved-schema-consumers.s183.spec.ts",
      "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts",
      "packages/mcp-server/test/product-reality/s183-m06-replay-r02.spec.ts",
      "packages/mcp-server/test/product-reality/closeout.s183.spec.ts",
    ],
    command: "pnpm",
    args: [
      "--filter",
      "@oods/mcp-server",
      "exec",
      "vitest",
      "run",
      "test/product-reality/runnable-artifact.s183.spec.ts",
      "test/product-reality/typed-action-protocol.s183.spec.ts",
      "test/product-reality/validation-profiles.s183.spec.ts",
      "test/product-reality/saved-schema-compiler.s183.spec.ts",
      "test/product-reality/saved-schema-consumers.s183.spec.ts",
      "test/product-reality/independent-review-approval.s183.spec.ts",
      "test/product-reality/s183-m06-replay-r02.spec.ts",
      "test/product-reality/closeout.s183.spec.ts",
    ],
  },
  {
    id: "s183-maintenance-wire",
    testFiles: ["packages/mcp-server/test/contracts/dtcg-intake.s180.spec.ts"],
    command: "pnpm",
    args: [
      "--filter",
      "@oods/mcp-server",
      "exec",
      "vitest",
      "run",
      "test/contracts/dtcg-intake.s180.spec.ts",
    ],
  },
  {
    id: "s183-maintenance-docs",
    testFiles: [
      "tests/verification/how-forge-works.contract.test.ts",
      "tests/verification/s177-prose-carriers.contract.test.ts",
    ],
    command: "pnpm",
    args: [
      "exec",
      "vitest",
      "run",
      "tests/verification/how-forge-works.contract.test.ts",
      "tests/verification/s177-prose-carriers.contract.test.ts",
    ],
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    assert(
      name?.startsWith("--") && value,
      `Invalid argument at position ${index}.`,
    );
    values[name.slice(2)] = value;
  }
  assert(values.workspace, "--workspace is required.");
  assert(values["base-sha"], "--base-sha is required.");
  assert(values["review-head"], "--review-head is required.");
  return {
    workspace: path.resolve(values.workspace),
    outputRoot: path.resolve(values["output-root"] ?? defaultOutputRoot),
    baseSha: values["base-sha"],
    reviewHead: values["review-head"],
  };
}

function git(workspace, args) {
  const result = spawnSync("git", args, { cwd: workspace, encoding: "utf8" });
  assert(result.status === 0, `git ${args.join(" ")} failed in ${workspace}.`);
  return result.stdout.trim();
}

function displayCommand(command, args) {
  return [command, ...args]
    .map((part) =>
      /^[A-Za-z0-9_@./:-]+$/.test(part) ? part : JSON.stringify(part),
    )
    .join(" ");
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function parseTestCounts(output) {
  const testsLine = stripAnsi(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .findLast((line) => /^Tests\s/.test(line));
  assert(testsLine, "Vitest output did not contain a Tests summary line.");
  const selected = Number(testsLine.match(/\((\d+)\)\s*$/)?.[1]);
  assert(
    Number.isInteger(selected) && selected > 0,
    `Invalid Vitest test total: ${testsLine}`,
  );
  const count = (label) =>
    Number(testsLine.match(new RegExp(`(\\d+)\\s+${label}`))?.[1] ?? 0);
  return {
    selected,
    passed: count("passed"),
    failed: count("failed"),
    skipped: count("skipped"),
  };
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  assert(
    /^[0-9a-f]{40}$/.test(args.baseSha),
    "--base-sha must be full lowercase hex.",
  );
  assert(
    /^[0-9a-f]{40}$/.test(args.reviewHead),
    "--review-head must be full lowercase hex.",
  );
  assert(
    git(args.workspace, ["rev-parse", "HEAD"]) === args.reviewHead,
    "Workspace is not at the review HEAD.",
  );
  const symbolic = spawnSync("git", ["symbolic-ref", "-q", "HEAD"], {
    cwd: args.workspace,
  });
  assert(
    symbolic.status === 1,
    "Focused suite requires a detached review worktree.",
  );
  const statusBefore = git(args.workspace, ["status", "--porcelain=v1"]);
  assert(
    statusBefore === "",
    `Focused suite requires a clean worktree: ${statusBefore}`,
  );

  const startedAt = new Date().toISOString();
  const results = [];
  const logParts = [];
  for (const execution of executions) {
    const literalCommand = displayCommand(execution.command, execution.args);
    const executionStartedAt = new Date().toISOString();
    const result = spawnSync(execution.command, execution.args, {
      cwd: args.workspace,
      encoding: "utf8",
      env: process.env,
      maxBuffer: 128 * 1024 * 1024,
      timeout: 20 * 60_000,
    });
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    process.stdout.write(output);
    logParts.push(
      `\n===== ${execution.id}: ${literalCommand} =====\n${output}`,
    );
    const cleanOutput = stripAnsi(output);
    const testCounts = parseTestCounts(output);
    results.push({
      id: execution.id,
      literalCommand,
      startedAt: executionStartedAt,
      endedAt: new Date().toISOString(),
      exitCode: result.status,
      signal: result.signal,
      testFiles: execution.testFiles,
      ...testCounts,
      summaryLines: cleanOutput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^(Test Files|Tests|Duration)\s/.test(line)),
    });
    if (result.status !== 0) break;
  }
  const endedAt = new Date().toISOString();
  const statusAfter = git(args.workspace, ["status", "--porcelain=v1"]);
  assert(
    statusAfter === "",
    `Focused suite changed tracked files: ${statusAfter}`,
  );
  const logContents = Buffer.from(`${logParts.join("")}\n`);
  fs.mkdirSync(path.join(args.outputRoot, "logs"), { recursive: true });
  const logPath = path.join(
    args.outputRoot,
    "logs",
    "s183-m06-focused-suite.log",
  );
  fs.writeFileSync(logPath, logContents);
  const counts = results.reduce(
    (total, result) => ({
      selected: total.selected + result.selected,
      passed: total.passed + result.passed,
      failed: total.failed + result.failed,
      skipped: total.skipped + result.skipped,
    }),
    { selected: 0, passed: 0, failed: 0, skipped: 0 },
  );
  const passed =
    results.length === executions.length &&
    results.every(({ exitCode }) => exitCode === 0) &&
    counts.failed === 0 &&
    counts.skipped === 0 &&
    counts.passed === counts.selected;
  const receipt = {
    schemaVersion: "1.0.0",
    kind: "sprint-focused-suite-receipt",
    sprintId: "sprint-183",
    missionId: "s183-m06",
    baseSha: args.baseSha,
    reviewHead: args.reviewHead,
    measuredHead: args.reviewHead,
    operand: {
      cwd: args.workspace,
      detachedHead: true,
      cleanBefore: true,
      cleanAfter: true,
    },
    startedAt,
    endedAt,
    status: passed ? "passed" : "failed",
    exitCode: passed
      ? 0
      : (results.find(({ exitCode }) => exitCode !== 0)?.exitCode ?? 1),
    command: executions
      .map(({ command, args: commandArgs }) =>
        displayCommand(command, commandArgs),
      )
      .join(" && "),
    testFiles: executions.flatMap(({ testFiles }) => testFiles),
    ...counts,
    selectedExecutionCount: executions.length,
    executedCount: results.length,
    failedCount: results.filter(({ exitCode }) => exitCode !== 0).length,
    skippedExecutionCount: executions.length - results.length,
    executions: results,
    log: {
      path: path.relative(repositoryRoot, logPath).split(path.sep).join("/"),
      bytes: logContents.byteLength,
      sha256: sha256(logContents),
    },
  };
  fs.writeFileSync(
    path.join(args.outputRoot, "focused-suite-receipt.json"),
    `${JSON.stringify(receipt, null, 2)}\n`,
  );
  console.log(
    `Focused suite: ${receipt.status}; ${results.length}/${executions.length} executions.`,
  );
  if (!passed) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
}
