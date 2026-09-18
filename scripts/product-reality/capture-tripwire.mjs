#!/usr/bin/env node
/**
 * The cheap checks that run BEFORE anything expensive.
 *
 * s204-m01, from CMOS learning #655: both defects found on 2026-09-16 were the same narrow class —
 * a spec asserting a sprint-scoped fact (a ledger, a census, a mode block, a near.md reader) — and
 * nothing ran them first, so a two-minute discovery cost thirty-four minutes of capture. Measured
 * from the Sprint 203 part-A log, this whole set runs in about ninety seconds.
 *
 * It runs every check rather than stopping at the first red, because a builder who has to fix one
 * sprint-scoped fact would rather see all of them at once. Exit code is 1 if any check failed.
 *
 * RUN IT ON A BUILT TREE. The near-md-readers check includes tests/contracts/public-api.contract,
 * which reads dist/pkg/package.json, so on a fresh checkout it fails on a missing build artifact
 * rather than on a stale fact — and a tripwire that cries wolf is one nobody reads. Inside the
 * capture runner this is already handled: install, build:tokens, build:packages and pkg:build run
 * first, and the tripwire runs after them. Standalone, run `pnpm run pkg:build` first.
 *
 * Usage:
 *   node scripts/product-reality/capture-tripwire.mjs [--output-root <dir>] [--load-threshold <n>]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const argument = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const outputRoot = argument("--output-root") ? path.resolve(argument("--output-root")) : null;
const workspace = path.resolve(argument("--workspace") ?? process.cwd());
// Eight cores; Sprint 203's capture ran at load average 24.6 and took 2.4x its Sprint 202 time.
// One times the core count is a machine that is busy but not thrashing.
const loadThreshold = Number(argument("--load-threshold") ?? os.cpus().length);

/** Each check asserts a sprint-scoped fact and costs seconds, not minutes. */
const CHECKS = [
  ["readiness-check", "pnpm", ["exec", "tsx", "scripts/product-reality/s196-release-readiness.ts", "--check"]],
  ["docs-check", "pnpm", ["docs:check"]],
  ["generate-check", "pnpm", ["--filter", "@oods/schemas-tools", "generate:check"]],
  ["tool-truth-check", "node", ["scripts/product-reality/s193-tool-truth.mjs", "--check"]],
  ["docs-api-check", "pnpm", ["docs:api", "--", "--check"]],
  ["docs-tools-check", "pnpm", ["docs:tools", "--", "--check"]],
  ["docs-claims-check", "pnpm", ["docs:claims", "--", "--check"]],
  ["render-license-check", "node", ["scripts/license/render-license.mjs", "--check"]],
  ["third-party-notices-check", "node", ["scripts/runtime/third-party-notices.mjs", "--check"]],
  ["client-configs-check", "node", ["scripts/runtime/client-configs.mjs", "--check"]],
  ["golden-ledger-check", "pnpm", ["exec", "tsx", "scripts/product-reality/s204-golden-ledger.ts", "check"]],
  ["viz-census-check", "pnpm", ["exec", "tsx", "scripts/product-reality/s190-viz-census.ts", "--check"]],
  ["schema-types-check", "pnpm", ["run", "generate:schema-types", "--", "--check"]],
  // The near.md and prose-carrier readers: the specs that notice a sprint's own record went stale.
  ["near-md-readers", "npx", ["vitest", "run", "--project", "core", "--no-file-parallelism", "tests/verification", "tests/contracts"]],
];

const startedAt = new Date().toISOString();
const started = process.hrtime.bigint();
const loadAverageBefore = os.loadavg();
const warnings = [];
if (loadAverageBefore[0] > loadThreshold) {
  warnings.push(
    `host load average ${loadAverageBefore[0].toFixed(1)} exceeds ${loadThreshold} on ${os.cpus().length} cores; `
    + "timing-sensitive suites will run long. Check for orphaned vitest workers (pgrep -fl vitest; PPID 1 = orphan) "
    + "before trusting any measured duration.",
  );
}

const results = [];
for (const [id, command, commandArgs] of CHECKS) {
  const checkStarted = process.hrtime.bigint();
  const outcome = spawnSync(command, commandArgs, {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", FORCE_COLOR: "0", NO_COLOR: "1" },
    maxBuffer: 64 * 1024 * 1024,
  });
  const durationMs = Number(process.hrtime.bigint() - checkStarted) / 1_000_000;
  const exitCode = outcome.status ?? 127;
  results.push({
    id,
    executedCommand: [command, ...commandArgs].join(" "),
    exitCode,
    durationMs: Number(durationMs.toFixed(1)),
    ...(exitCode === 0 ? {} : { stdout: outcome.stdout ?? "", stderr: outcome.stderr ?? "" }),
  });
  process.stdout.write(`${exitCode === 0 ? "ok  " : "FAIL"} ${id} ${(durationMs / 1000).toFixed(1)}s\n`);
}

const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
const failed = results.filter(({ exitCode }) => exitCode !== 0);
const report = {
  schemaVersion: "1.0.0",
  kind: "capture-tripwire",
  startedAt,
  endedAt: new Date().toISOString(),
  durationMs: Number(durationMs.toFixed(1)),
  workspace,
  host: {
    hostname: os.hostname(),
    cpuCount: os.cpus().length,
    loadAverageBefore,
    loadAverageAfter: os.loadavg(),
    loadThreshold,
  },
  warnings,
  checks: results,
  status: failed.length === 0 ? "passed" : "failed",
  failedChecks: failed.map(({ id }) => id),
};

if (outputRoot) {
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, "capture-tripwire.json"), `${JSON.stringify(report, null, 2)}\n`);
}
for (const warning of warnings) process.stderr.write(`warning: ${warning}\n`);
process.stdout.write(
  `tripwire: ${report.status} in ${(durationMs / 1000).toFixed(1)}s`
  + `${failed.length ? ` — failed: ${report.failedChecks.join(", ")}` : ""}\n`,
);
if (failed.length) process.exitCode = 1;
