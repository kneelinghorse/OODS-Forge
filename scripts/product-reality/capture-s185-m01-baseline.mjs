#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function argument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const workspaceArgument = argument("--workspace");
const outputArgument = argument("--output-root");
const sprintId = argument("--sprint") ?? "sprint-185";
const missionId = argument("--mission") ?? "s185-m01";
const captureLabel = argument("--label") ?? "baseline";
const testTimeout = Number(argument('--test-timeout') ?? 20_000);
const serial = args.includes('--serial');
const loadThreshold = Number(argument('--load-threshold') ?? os.cpus().length);
if (!Number.isFinite(loadThreshold) || loadThreshold <= 0) throw new Error('--load-threshold must be a positive number.');
if (!Number.isInteger(testTimeout) || testTimeout < 1) throw new Error('--test-timeout must be a positive integer.');
const runCount = Number.parseInt(argument("--runs") ?? "2", 10);
// --suites <id,id>: a NAMED RETRY of a subset (recorded in the aggregate); the
// default is all five suites; root-core's project set is unchanged.
const suiteSelection = argument("--suites") ? argument("--suites").split(",") : null;

if (!workspaceArgument || !outputArgument || !Number.isInteger(runCount) || runCount < 1) {
  throw new Error(
    "Usage: node scripts/product-reality/capture-s185-m01-baseline.mjs --workspace <clean-worktree> --output-root <directory> [--sprint sprint-185] [--mission s185-m01] [--label before|after] [--runs 2]",
  );
}

const workspace = path.resolve(workspaceArgument);
const outputRoot = path.resolve(outputArgument);
const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "oods-s185-m01-baseline-"),
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

const allSuites = [
  {
    id: "viz-core",
    literalCommand: "pnpm --filter @oods/viz-core exec vitest run",
    command: "pnpm",
    args: ["--filter", "@oods/viz-core", "exec", "vitest", "run"],
    // s204-m01 measured six parallel runs and three serial. Parallel run 1 — taken at the highest
    // load observed all session — failed chart-titles.s201's label-overlap assertion, which reads
    // the placed positions of an ECharts FORCE-DIRECTED graph: an iterative layout whose settled
    // positions depend on how much wall clock it got. Runs 2-6 and all three serial runs were
    // clean at 1,546/1,546/0. Kept serial anyway, because the arithmetic does not favour the
    // risk: the whole suite is 28s of a 2,472s capture, so parallelism buys back seconds while
    // admitting a timing-sensitive geometry assertion into a receipt that has to be trusted.
    serialRequired: "s204-m01: chart-titles.s201 reads settled force-layout positions and failed once under parallel scheduling at high load; the suite is 28s, so the saving does not pay for the flake",
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
    // s204-m01 measured this rather than assuming it. The suite is serial because
    // packages/mcp-server/vitest.config.ts sets fileParallelism:false itself — its pack specs run
    // prepack builds that replace shared workspace dist trees, and parallel readers see a
    // half-built workspace. Forced parallel (--file-parallelism) at 8ef91bd13: 120 failed suites,
    // only 6,801 of the serial 7,263 tests even collected, with the predicted signatures
    // ("Component Stack is not emission-eligible", "Preview host runtime is missing", "the preview
    // app must be built"). Wall fell 1,420s to 1,001s — a 30% saving for a destroyed run.
    // Un-serialising this suite requires isolating the pack-lifecycle specs first; the flag is
    // named here so the receipt states the constraint instead of inheriting it silently.
    serialRequired: "packages/mcp-server/vitest.config.ts fileParallelism:false — pack prepack builds replace shared dist trees; measured in s204-m01",
  },
  {
    id: "root-core",
    literalCommand: "pnpm exec vitest run --project core",
    command: "pnpm",
    args: ["exec", "vitest", "run", "--project", "core"],
    // Policy #1833: root-core's git-range mover specs go red under parallel file scheduling. That
    // finding is about THIS suite; s204-m01 proved the other four equal their serial baselines
    // under package defaults, so the serialisation stays where the evidence is.
    serialRequired: "policy #1833: root-core git-range mover specs go red under parallel scheduling",
  },
  {
    id: "component-packages",
    literalCommand: "node scripts/product-reality/component-package-suite.mjs component-contracts component-styles components-react components-vue",
    command: "node",
    args: ["scripts/product-reality/component-package-suite.mjs", "component-contracts", "component-styles", "components-react", "components-vue"],
  },
];

const suites = suiteSelection ? allSuites.filter(({ id }) => suiteSelection.includes(id)) : allSuites;
if (suites.length === 0) throw new Error("--suites selected no known suite");

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function commandText(command, commandArgs) {
  return [command, ...commandArgs].join(" ");
}

// s204-m01: the run Derek stopped on 2026-09-16 left an orphaned vitest worker at PPID 1 burning
// 72% CPU for at least 26 minutes, and the review found it only by looking. The cause was
// structural: the runner used spawnSync, which blocks the event loop, so a SIGTERM handler could
// never fire while a suite was running. Each suite now runs detached in its own process group and
// is awaited, so a signal handler CAN run and reaps the whole group — vitest and every worker it
// forked — before the runner exits.
let activeChild = null;

function reapActiveGroup(signal) {
  const child = activeChild;
  if (!child?.pid) return false;
  try {
    process.kill(-child.pid, signal);
    return true;
  } catch {
    try {
      child.kill(signal);
      return true;
    } catch {
      return false;
    }
  }
}

let reaping = false;
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (reaping) return;
    reaping = true;
    const reaped = reapActiveGroup("SIGTERM");
    process.stderr.write(`capture: ${signal} received; ${reaped ? "reaped the running suite's process group" : "no suite was running"}\n`);
    // Give the group a moment to die on SIGTERM, then insist.
    setTimeout(() => {
      reapActiveGroup("SIGKILL");
      process.exit(signal === "SIGINT" ? 130 : 143);
    }, 2_000).unref();
  });
}

async function run(command, commandArgs) {
  const startedAt = new Date().toISOString();
  const started = process.hrtime.bigint();
  const loadAverageBefore = os.loadavg();
  const child = spawn(command, commandArgs, {
    cwd: workspace,
    // Its own process group: one kill(-pid) reaps vitest and every worker it forked.
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
  });
  activeChild = child;
  // spawnSync's maxBuffer is gone with the switch to spawn, so the cap is kept explicitly: a suite
  // that floods stdout must not take the capture down with it, and a truncated log says so.
  const outputLimitBytes = 128 * 1024 * 1024;
  const chunks = { stdout: [], stderr: [] };
  const bytes = { stdout: 0, stderr: 0 };
  const truncated = { stdout: false, stderr: false };
  for (const stream of ["stdout", "stderr"]) {
    child[stream].setEncoding("utf8");
    child[stream].on("data", chunk => {
      if (bytes[stream] >= outputLimitBytes) {
        if (!truncated[stream]) {
          truncated[stream] = true;
          chunks[stream].push(`\n[capture: ${stream} truncated at ${outputLimitBytes} bytes]\n`);
        }
        return;
      }
      bytes[stream] += Buffer.byteLength(chunk, "utf8");
      chunks[stream].push(chunk);
    });
  }
  const outcome = await new Promise(resolve => {
    child.on("error", error => resolve({ exitCode: 127, error: error.message }));
    child.on("close", (code, signal) => resolve({
      exitCode: code ?? 127,
      ...(signal ? { terminatingSignal: signal } : {}),
    }));
  });
  activeChild = null;
  const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
  return {
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs,
    loadAverageBefore,
    loadAverageAfter: os.loadavg(),
    stdout: chunks.stdout.join(""),
    stderr: chunks.stderr.join(""),
    ...(truncated.stdout || truncated.stderr ? { outputTruncated: { ...truncated, outputLimitBytes } } : {}),
    ...outcome,
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
  sprintId,
  missionId,
  captureLabel,
  kind: "four-suite-clean-tree-baseline",
  suiteSelection: suiteSelection ?? "all",
  namedRetry: suiteSelection !== null,
  measuredHead: head,
  workspace,
  exclusiveWorktree: true,
  suiteConcurrency: "sequential; no concurrent suite jobs",
  configuredTestTimeoutMs: testTimeout,
  fileScheduling: serial
    ? 'serial; maxWorkers=1 (--serial forced every suite)'
    : 'per suite: serial only where a policy requires it (root-core, policy #1833); package defaults elsewhere',
  host,
  retryProtocol: {
    initialFailureRetention:
      "An initial red remains a red receipt; an isolated retry may diagnose it but never replaces it.",
    isolatedRetry:
      "Re-run each failed file once in isolation, then record any later full-suite run as a separate numbered attempt.",
    acceptance:
      `Every numbered full-suite run (${runCount}) must exit zero and leave the proof worktree clean; isolated green is diagnostic only.`,
  },
  carriedDisclosure: {
    name: "load-sensitive Vue compiler rows can exceed the configured vitest timeout",
    origin:
      "Disclosed by the Sprint 183 independent review and re-measured in Sprint 184 m01; see artifacts/product-reality/sprint-184/m01/four-suite-baseline/four-suite-baseline.json#knownLimitation for the prior host numbers.",
    rule:
      "A timeout on a Vue compiler row is reported as the red it is; an isolated re-run is diagnostic and is recorded as a named retry, never substituted for the full-suite receipt.",
  },
  setup: [],
  cleanBeforeSetup: cleanliness(),
  cleanAfterSetup: null,
  // s204-m01: nothing cheap ran before the expensive thing (CMOS learning #655). The tripwire is
  // ~90s of sprint-scoped checks and it runs after the builds and before the first suite, so a
  // stale ledger, census or near.md reader costs ninety seconds instead of thirty-four minutes.
  tripwire: null,
  loadThreshold,
  hostLoadWarnings: [],
  runs: [],
  status: "running",
};

/** Sprint 203's capture ran at load average 24.6 on 8 cores and took 2.4x its Sprint 202 time; the
 * receipt said nothing about it. Every suite's load is recorded; this names the ones that were
 * measured on a machine too busy for the number to mean much. */
function noteHostLoad(label, loadAverage) {
  if (loadAverage[0] <= loadThreshold) return;
  aggregate.hostLoadWarnings.push({
    at: label,
    loadAverage1m: Number(loadAverage[0].toFixed(2)),
    loadThreshold,
    cpuCount: host.cpuCount,
    note: "measured on a loaded host; treat the duration as an upper bound, not a baseline",
  });
}

try {
  for (const setup of setupCommands) {
    const result = await run(setup.command, setup.args);
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
    const tripwireRoot = path.join(outputRoot, "tripwire");
    const tripwireArgs = [
      "scripts/product-reality/capture-tripwire.mjs",
      "--workspace", workspace,
      "--output-root", tripwireRoot,
      "--load-threshold", String(loadThreshold),
    ];
    const tripwireResult = await run("node", tripwireArgs);
    const executedCommand = commandText("node", tripwireArgs);
    noteHostLoad("tripwire", tripwireResult.loadAverageBefore);
    aggregate.tripwire = {
      executedCommand,
      exitCode: tripwireResult.exitCode,
      startedAt: tripwireResult.startedAt,
      endedAt: tripwireResult.endedAt,
      durationMs: tripwireResult.durationMs,
      loadAverageBefore: tripwireResult.loadAverageBefore,
      loadAverageAfter: tripwireResult.loadAverageAfter,
      log: writeLog("tripwire/tripwire.log", executedCommand, tripwireResult),
      report: fs.existsSync(path.join(tripwireRoot, "capture-tripwire.json"))
        ? JSON.parse(fs.readFileSync(path.join(tripwireRoot, "capture-tripwire.json"), "utf8"))
        : null,
      status: tripwireResult.exitCode === 0 ? "passed" : "failed",
    };
  }

  if (setupPassed && aggregate.tripwire?.status === "passed") {
    for (let runNumber = 1; runNumber <= runCount; runNumber += 1) {
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
        // Keep a readable reporter in the log and retain the JSON report so a
        // red receipt stays diagnosable (the Sprint 184 capture discarded both).
        const suiteSerial = serial || Boolean(suite.serialRequired);
        const executedArgs = [
          ...suite.args,
          `--testTimeout=${testTimeout}`,
          ...(suiteSerial ? ["--maxWorkers=1", "--no-file-parallelism"] : []),
          "--reporter=default",
          "--reporter=json",
          `--outputFile=${reportPath}`,
        ];
        const cleanBefore = cleanliness();
        const result = await run(suite.command, executedArgs);
        noteHostLoad(`run-${runNumber}/${suite.id}`, result.loadAverageBefore);
        const cleanAfter = cleanliness();
        let vitest = null;
        let reportError = null;
        let retainedReport = null;
        try {
          vitest = summarizeVitest(
            JSON.parse(fs.readFileSync(reportPath, "utf8")),
          );
          const retainedPath = path.join(outputRoot, `run-${runNumber}`, `${suite.id}.vitest.json`);
          fs.mkdirSync(path.dirname(retainedPath), { recursive: true });
          fs.copyFileSync(reportPath, retainedPath);
          retainedReport = path.relative(outputParent, retainedPath);
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
          sprintId,
          missionId,
          captureLabel,
          kind: "four-suite-baseline-receipt",
          run: runNumber,
          suite: suite.id,
          measuredHead: head,
          literalCommand: suite.literalCommand,
          executedCommand,
          fileScheduling: suiteSerial
            ? { mode: "serial", maxWorkers: 1, reason: serial && !suite.serialRequired ? "--serial forced every suite" : suite.serialRequired }
            : { mode: "package defaults", reason: "no policy requires serialisation for this suite" },
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
          retainedReport,
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
    aggregate.tripwire?.status === "passed" &&
    aggregate.runs.length === runCount &&
    aggregate.runs.every(
      ({ cleanBefore, cleanAfter }) => cleanBefore.clean && cleanAfter.clean,
    ) &&
    allSuites.length === suites.length * runCount &&
    allSuites.every(({ status }) => status === "passed")
      ? "passed"
      : "failed";
  aggregate.outputRoot = path.relative(outputParent, outputRoot);
  writeJson("four-suite-baseline.json", aggregate);
  process.stdout.write(
    `${missionId} ${captureLabel} four-suite capture: ${aggregate.status} (${allSuites.filter(({ status }) => status === "passed").length}/${suites.length * runCount} suite receipts passed)\n`,
  );
  if (aggregate.status !== "passed") process.exitCode = 1;
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
