#!/usr/bin/env node
/**
 * Run every gate in scripts/product-reality/on-demand-gates.json.
 *
 * s204-m01. m06-gate-bites.s184 left the five-suite capture because it costs 170s for one test and
 * proves gate integrity rather than a per-sprint regression. The risk in moving a proof out of a
 * default suite is that it becomes a proof nobody runs — the same failure the Stage1 e2e fixtures
 * hit. So the roster is executable: pre-freeze part B calls this one script, and adding a future
 * on-demand gate to the roster is enough to make closeout run it.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rosterPath = path.join(repositoryRoot, "scripts/product-reality/on-demand-gates.json");
const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));

const args = process.argv.slice(2);
const argument = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const outputRoot = argument("--output-root") ? path.resolve(argument("--output-root")) : null;
const only = argument("--only");

const selected = only ? roster.gates.filter(({ id }) => id === only) : roster.gates;
if (selected.length === 0) throw new Error(`--only ${only} selected no gate in the roster`);

const startedAt = new Date().toISOString();
const started = process.hrtime.bigint();
const results = [];
for (const gate of selected) {
  const [command, ...commandArgs] = gate.command;
  const gateStarted = process.hrtime.bigint();
  const outcome = spawnSync(command, commandArgs, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, CI: "1", FORCE_COLOR: "0", NO_COLOR: "1" },
    maxBuffer: 64 * 1024 * 1024,
  });
  const durationMs = Number(process.hrtime.bigint() - gateStarted) / 1_000_000;
  const exitCode = outcome.status ?? 127;
  results.push({
    id: gate.id,
    executedCommand: gate.command.join(" "),
    specFile: gate.specFile,
    exitCode,
    durationMs: Number(durationMs.toFixed(1)),
    stdout: outcome.stdout ?? "",
    stderr: outcome.stderr ?? "",
  });
  process.stdout.write(`${exitCode === 0 ? "ok  " : "FAIL"} ${gate.id} ${(durationMs / 1000).toFixed(1)}s\n`);
}

const failed = results.filter(({ exitCode }) => exitCode !== 0);
const report = {
  schemaVersion: "1.0.0",
  kind: "on-demand-gate-run",
  startedAt,
  endedAt: new Date().toISOString(),
  durationMs: Number((Number(process.hrtime.bigint() - started) / 1_000_000).toFixed(1)),
  rosterPath: path.relative(repositoryRoot, rosterPath),
  rosterGateIds: roster.gates.map(({ id }) => id),
  selectedGateIds: selected.map(({ id }) => id),
  host: { hostname: os.hostname(), cpuCount: os.cpus().length, loadAverage: os.loadavg() },
  gates: results,
  status: failed.length === 0 ? "passed" : "failed",
  failedGateIds: failed.map(({ id }) => id),
};
if (outputRoot) {
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, "on-demand-gates.json"), `${JSON.stringify(report, null, 2)}\n`);
}
process.stdout.write(`on-demand gates: ${report.status} (${selected.length} run)\n`);
if (failed.length) process.exitCode = 1;
