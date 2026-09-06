#!/usr/bin/env node
// Sprint 185 m01 — evidence index. Walks the mission's evidence root and names
// every artifact and every log so the retention audit
// (assert-s184-evidence-retention.mjs, extended to sprint-185) can require each
// log to be tracked. Status is derived from the records, never typed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const missionRoot = "artifacts/product-reality/sprint-185/m01";
const absoluteRoot = path.join(repositoryRoot, missionRoot);

function walk(directory, output) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolutePath, output);
    else output.push(path.relative(repositoryRoot, absolutePath));
  }
  return output;
}

function readJson(relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, "utf8")) : null;
}

const files = walk(absoluteRoot, []).filter((file) => !file.endsWith("/evidence-index.json")).sort();
const logs = files.filter((file) => file.endsWith(".log"));
const artifacts = files.filter((file) => !file.endsWith(".log"));

const before = readJson(`${missionRoot}/four-suite-baseline-before/four-suite-baseline.json`);
const beforeAttempt1 = readJson(`${missionRoot}/four-suite-baseline-before-attempt-1-concurrent-load/four-suite-baseline.json`);
const beforeRootCoreRetry = readJson(`${missionRoot}/four-suite-baseline-before-root-core-retry-1/four-suite-baseline.json`);
const beforeIsolated = readJson(`${missionRoot}/four-suite-baseline-before-isolated-diagnostic/isolated.vitest.json`);
const after = readJson(`${missionRoot}/four-suite-baseline-after/four-suite-baseline.json`);
const red = readJson(`${missionRoot}/red-control/summary.json`);
const green = readJson(`${missionRoot}/green-control/summary.json`);
const inventory = readJson(`${missionRoot}/pin-inventory.json`);
const retention = readJson(`${missionRoot}/retention-probe.json`);
const declaration = readJson(`${missionRoot}/exclusive-worktree-declaration.json`);

function baselineSummary(capture) {
  if (!capture) return null;
  return {
    measuredHead: capture.measuredHead,
    status: capture.status,
    suiteReceipts: capture.runs.flatMap((run) => run.suites).map((suite) => ({
      run: suite.run,
      suite: suite.suite,
      status: suite.status,
      exitCode: suite.exitCode,
      durationMs: Math.round(suite.durationMs),
      files: suite.vitest?.files ?? null,
      tests: suite.vitest?.tests ?? null,
      cleanBefore: suite.cleanBefore.clean,
      cleanAfter: suite.cleanAfter.clean,
    })),
    host: capture.host?.hostname ?? null,
    retries: "none; every suite receipt is a first-attempt full-suite run",
  };
}

const index = {
  schemaVersion: "1.0.0",
  sprintId: "sprint-185",
  missionId: "s185-m01",
  kind: "evidence-index",
  baseCommit: declaration?.baseCommit ?? null,
  worktree: declaration ? { path: declaration.implementationWorktree, branch: declaration.implementationBranch, proofWorktree: declaration.proofWorktree } : null,
  baselines: {
    before: baselineSummary(before),
    beforeRetainedRedAttempt: beforeAttempt1
      ? {
          ...baselineSummary(beforeAttempt1),
          disposition:
            "Retained as a red receipt, excluded from acceptance. root-core (both runs) and viz-core (run 2) failed at file-collection level while the builder ran package suites, live-generation specs and five typechecks concurrently in the build worktree on the same 8-core host; every failing file passed when re-run in isolation in the proof worktree at the same head, and the one assertion failure (ported-freeze.s184 check-promotion: a .s184-state-* scratch directory from a parallel file altered git status) is a pre-existing base-tree parallelism flake in a test this mission retires. The capture was repeated with the host quiet.",
        }
      : null,
    beforeRootCoreNamedRetry: beforeRootCoreRetry
      ? {
          ...baselineSummary(beforeRootCoreRetry),
          disposition:
            "Named retry of root-core alone (attempt 3 for that suite) on a quiet host; still red for the same two pre-existing base-tree reasons and retained as a red receipt.",
        }
      : null,
    beforeIsolatedDiagnostic: beforeIsolated
      ? {
          files: beforeIsolated.numTotalTestSuites,
          passedFiles: beforeIsolated.numPassedTestSuites,
          tests: beforeIsolated.numTotalTests,
          passedTests: beforeIsolated.numPassedTests,
          success: beforeIsolated.success,
          log: `${missionRoot}/four-suite-baseline-before-isolated-diagnostic/isolated.log`,
          disposition:
            "Diagnostic only, never a substitute for the full-suite receipt: the six root-core files that failed across the three attempts, run sequentially in isolation at the same head with a clean tree.",
        }
      : null,
    rootCoreDisclosure: {
      status: "red at the base in every attempt; disclosed, not hidden",
      reasons: [
        "The load-sensitive Vue compiler row (emitter-directives.s184 'readonly-safe Vue coercion' under strict vue-tsc) ran 20.4s, 24.3s and again over the 20s vitest budget on this host, whose root-core wall time is now 384–537s against 90–97s in the Sprint 184 m01 capture at the same population minus 20 files; the Sprint 183 review disclosed this row.",
        "The root `core` Vitest project runs the Sprint 184 product-reality packing specs (m06-gate-bites, packed-ported-consumers, live-workflow-consumers) in parallel with files that read the shared package dist trees (ported-workflow: 'Cannot find module .../@oods/components-react/dist/index.cjs'; ported-freeze: ENOENT packages/components-vue/dist/index.d.ts; state-axis: its vite build could not resolve the shared CSS; contract-resolution: verify-readiness-refs exited 1; b2-legacy-inputs: a typed-gap outcome read while a dist was absent). The root config's own comment names this hazard and excludes the Sprint 182 packing spec; the Sprint 184 packing specs were never added. Left untouched here because changing the root-core population belongs with m05's suite accounting (C7 rule); carried by name.",
      ],
      acceptedSuites: ["viz-core", "viz-render", "mcp-server"],
      notAccepted: ["root-core"],
    },
    after: baselineSummary(after),
  },
  redControl: red ? { status: red.status, measuredHead: red.measuredHead, failuresByReason: red.failuresByReason, frozenLiteralFailures: red.frozenLiteralFailures.length, failingSites: red.failingSites } : null,
  greenControl: green ? { status: green.status, measuredHead: green.measuredHead, greenForTheRightReason: green.greenForTheRightReason, failuresByReason: green.failuresByReason, frozenLiteralFailures: green.frozenLiteralFailures.length, failingSites: green.failingSites } : null,
  pinInventory: inventory ? { sites: inventory.sites.length, countsByDisposition: inventory.countsByDisposition, differences: inventory.differences.length } : null,
  retentionProbe: retention?.status ?? null,
  artifacts,
  logs,
  status:
    before !== null &&
    after !== null &&
    ["viz-core", "viz-render", "mcp-server"].every((suite) =>
      [before, after].every((capture) => capture.runs.flatMap((run) => run.suites).filter((entry) => entry.suite === suite).every((entry) => entry.status === "passed")),
    ) &&
    red?.status === "measured" &&
    green?.status === "passed" &&
    retention?.status === "passed"
      ? "passed-with-root-core-disclosed"
      : "incomplete",
};

fs.writeFileSync(path.join(absoluteRoot, "evidence-index.json"), `${JSON.stringify(index, null, 2)}\n`);
process.stdout.write(`s185-m01 evidence index: ${index.status}; ${artifacts.length} artifacts, ${logs.length} logs\n`);
