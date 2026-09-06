#!/usr/bin/env node
// Sprint 185 m01 — nucleus pin control.
//
// Applies the single-literal mutation (adds 'DetailHeader' to
// NUCLEUS_COMPONENT_IDS with no other change), rebuilds the component-contracts
// dist, runs the typechecks and suites the mission names, classifies every
// failure by its reason, reverts the mutation, and leaves the workspace clean.
//
//   --mode red    measured at the sprint base before any pin is retired; the
//                 failing sites ARE the pin inventory (decision #1725).
//   --mode green  measured after the pins derive; the identical mutation may
//                 fail only for TypeScript totality, derived-coverage
//                 assertions, or OODS-N015 — never for a frozen literal.

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

const workspace = path.resolve(argument("--workspace") ?? "");
const outputRoot = path.resolve(argument("--output-root") ?? "");
const mode = argument("--mode");
const patchPath = path.resolve(argument("--patch") ?? "");
// --only <id,id>: run a subset of the checks (a mechanics smoke; never a measurement).
// --allow-dirty: do not abort on a dirty workspace (smoke only; recorded in the summary).
const only = argument("--only") ? new Set(argument("--only").split(",")) : null;
const allowDirty = args.includes("--allow-dirty");
// --reclassify: re-run only the classifier over an existing summary.json in
// --output-root (messages and sites are kept; reasons are recomputed).
const reclassify = args.includes("--reclassify");
const CLASSIFIER_VERSION = 2;

if (!argument("--workspace") || !argument("--output-root") || !["red", "green"].includes(mode) || !argument("--patch")) {
  throw new Error(
    "Usage: node scripts/product-reality/s185-m01-pin-control.mjs --workspace <worktree> --output-root <directory> --mode red|green --patch <mutation.patch>",
  );
}

const FORBIDDEN_TOKENS = /\b14\b|\b28\b|stale|frozen|check-promotion/i;
const NUCLEUS_LITERAL_LIST = /['"]Badge['"],\s*['"]Banner['"],\s*['"]Button['"],\s*['"]Card['"]/;
const DERIVED_EXPRESSION = /NUCLEUS_COMPONENT_IDS|sharedScenarios|componentContracts|COMPONENT_STYLE_IDS|canonicalIds|readiness|implementations/;

const environment = { ...process.env, CI: "1", FORCE_COLOR: "0", NO_COLOR: "1" };

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function run(command, commandArgs, options = {}) {
  const startedAt = new Date().toISOString();
  const started = process.hrtime.bigint();
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? workspace,
    encoding: "utf8",
    env: environment,
    maxBuffer: 256 * 1024 * 1024,
  });
  return {
    command: [command, ...commandArgs].join(" "),
    cwd: path.relative(workspace, options.cwd ?? workspace) || ".",
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs: Number(process.hrtime.bigint() - started) / 1_000_000,
    loadAverage: os.loadavg(),
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function writeLog(relativePath, result) {
  const absolutePath = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, [
    `$ ${result.command}`,
    `cwd=${result.cwd}`,
    `exitCode=${result.exitCode}`,
    `startedAt=${result.startedAt}`,
    `endedAt=${result.endedAt}`,
    `durationMs=${result.durationMs.toFixed(3)}`,
    "[stdout]",
    result.stdout,
    "[stderr]",
    result.stderr,
  ].join("\n"));
  const bytes = fs.readFileSync(absolutePath);
  return { path: relativePath, bytes: bytes.byteLength, sha256: sha256(bytes) };
}

function receipt(id, result, extra = {}) {
  const log = writeLog(`logs/${id}.log`, result);
  return {
    id,
    command: result.command,
    cwd: result.cwd,
    exitCode: result.exitCode,
    signal: result.signal,
    startedAt: result.startedAt,
    endedAt: result.endedAt,
    durationMs: result.durationMs,
    loadAverage: result.loadAverage,
    log,
    ...extra,
  };
}

function git(...commandArgs) {
  return run("git", commandArgs);
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
      if (compilerLeak.test(entry.name) || relativePath === "packages/mcp-server/test/__scratch__") {
        matches.push(relativePath);
        continue;
      }
      if (entry.name !== "node_modules" && entry.name !== "dist") pending.push(absolutePath);
    }
  }
  return matches.sort();
}

function cleanliness() {
  const status = git("status", "--porcelain=v1", "--untracked-files=all");
  const leaks = forbiddenLeaks();
  return {
    porcelain: status.stdout.split(/\r?\n/).filter(Boolean),
    forbiddenLeaks: leaks,
    clean: status.exitCode === 0 && status.stdout.trim() === "" && leaks.length === 0,
  };
}

function sourceLine(relativeFile, line) {
  try {
    const lines = fs.readFileSync(path.join(workspace, relativeFile), "utf8").split(/\r?\n/);
    return lines[line - 1] ?? null;
  } catch {
    return null;
  }
}

function handWrittenListIdentifiers(relativeFile) {
  try {
    const text = fs.readFileSync(path.join(workspace, relativeFile), "utf8");
    const identifiers = [];
    for (const match of text.matchAll(/const\s+(\w+)\s*=\s*(?:Object\.freeze\()?\[\s*['"]Badge['"],\s*['"]Banner['"]/g)) {
      identifiers.push(match[1]);
    }
    return identifiers;
  } catch {
    return [];
  }
}

function scrubMessage(message) {
  return message
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:at |❯ )/.test(line))
    .join("\n")
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, "<timestamp>")
    .replace(/\b\d+(?:\.\d+)?\s?ms\b/g, "<duration>")
    .replace(/\b[0-9a-f]{40,64}\b/g, "<hash>")
    // tsc "file(line,col)" and "file:line:col" position markers are not literals.
    .replace(/\(\d+,\d+\)/g, "(<pos>)")
    .replace(/:\d+:\d+\b/g, ":<pos>");
}

const TOTALITY_TEXT = /TS2741|is missing in type|missing the following properties/;

function sourceWindow(relativeFile, line, before = 3) {
  try {
    const lines = fs.readFileSync(path.join(workspace, relativeFile), "utf8").split(/\r?\n/);
    return lines.slice(Math.max(0, line - 1 - before), line).join("\n");
  } catch {
    return "";
  }
}

function classify({ file, line, message, kind }) {
  const source = file && line ? sourceLine(file, line) : null;
  const scrubbed = scrubMessage(message ?? "");
  const listIdentifiers = file ? handWrittenListIdentifiers(file) : [];
  const forbiddenHits = [];
  for (const [label, text] of [["message", scrubbed], ["source", source ?? ""]]) {
    const hit = text.match(FORBIDDEN_TOKENS);
    if (hit) forbiddenHits.push(`${label}:${hit[0]}`);
  }
  if (source && (NUCLEUS_LITERAL_LIST.test(source) || listIdentifiers.some((identifier) => new RegExp(`\\b${identifier}\\b`).test(source)))) {
    forbiddenHits.push("source:hand-written-id-list");
  }
  let reason;
  if (forbiddenHits.length > 0) reason = "frozen-literal";
  else if (kind === "typescript" && TOTALITY_TEXT.test(message ?? "")) reason = "typescript-totality";
  else if (kind === "typescript") reason = "typescript-other";
  // A packing spec whose prepack build failed on the Record totality error.
  else if (TOTALITY_TEXT.test(message ?? "") && /prepack|error TS/.test(message ?? "")) reason = "typescript-totality";
  else if (/OODS-N015/.test(message ?? "")) reason = "oods-n015";
  else if (source && DERIVED_EXPRESSION.test(source)) reason = "derived-coverage";
  else if (file && line && DERIVED_EXPRESSION.test(sourceWindow(file, line))) reason = "derived-coverage";
  else reason = "other";
  return { reason, forbiddenHits, source };
}

function parseTsc(result, directory = ".") {
  const errors = [];
  for (const line of `${result.stdout}\n${result.stderr}`.split(/\r?\n/)) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
    if (!match) continue;
    // tsc prints paths relative to the package it ran in; normalize to the workspace.
    let file = path.isAbsolute(match[1]) ? path.relative(workspace, match[1]) : match[1];
    if (!fs.existsSync(path.join(workspace, file)) && fs.existsSync(path.join(workspace, directory, file))) {
      file = path.join(directory, file);
    }
    errors.push({ file, line: Number(match[2]), column: Number(match[3]), code: match[4], message: match[5] });
  }
  return errors;
}

function frameOf(message) {
  const pattern = /((?:\/|[A-Za-z]:\\)?[^\s():]+?\.(?:tsx?|mjs|mts|js))(?::|\()(\d+)(?::|,)(\d+)/g;
  for (const match of message.matchAll(pattern)) {
    let file = match[1];
    if (file.includes("node_modules")) continue;
    if (path.isAbsolute(file)) {
      if (!file.startsWith(workspace)) continue;
      file = path.relative(workspace, file);
    }
    return { file, line: Number(match[2]), column: Number(match[3]) };
  }
  return { file: null, line: null, column: null };
}

function parseVitest(reportPath, packageDirectory) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const failures = [];
  for (const fileResult of report.testResults ?? []) {
    const relativeFile = path.relative(workspace, fileResult.name);
    if (fileResult.status !== "passed" && (fileResult.assertionResults ?? []).length === 0) {
      failures.push({ file: relativeFile, line: null, test: "<file>", message: fileResult.message ?? "" });
    }
    for (const assertion of fileResult.assertionResults ?? []) {
      if (assertion.status !== "failed") continue;
      const message = (assertion.failureMessages ?? []).join("\n");
      const frame = frameOf(message);
      failures.push({
        file: frame.file ?? relativeFile,
        line: frame.line,
        test: assertion.fullName,
        message,
      });
    }
  }
  return {
    success: report.success === true,
    files: { total: (report.testResults ?? []).length, failed: (report.testResults ?? []).filter((entry) => entry.status !== "passed").length },
    tests: {
      total: report.numTotalTests ?? 0,
      passed: report.numPassedTests ?? 0,
      failed: report.numFailedTests ?? 0,
      skipped: report.numPendingTests ?? 0,
    },
    failures,
    packageDirectory,
  };
}

function finalize(summary) {
  const byReason = {};
  for (const failure of summary.failures) byReason[failure.reason] = (byReason[failure.reason] ?? 0) + 1;
  summary.failuresByReason = byReason;
  summary.frozenLiteralFailures = summary.failures.filter((failure) => failure.reason === "frozen-literal");
  summary.failingSites = [...new Set(summary.failures.map((failure) => `${failure.file}:${failure.line ?? "?"}`))].sort();
  const acceptableReasons = new Set(["typescript-totality", "derived-coverage", "oods-n015"]);
  summary.greenForTheRightReason =
    summary.failures.length > 0 &&
    summary.failures.every((failure) => acceptableReasons.has(failure.reason));
  summary.classifierVersion = CLASSIFIER_VERSION;
  summary.status =
    summary.error === undefined && summary.revertExitCode === 0 && summary.rebuildExitCode === 0 && summary.workspaceRestored
      ? (summary.mode === "red" ? "measured" : summary.greenForTheRightReason ? "passed" : "failed")
      : "failed";
  return byReason;
}

if (reclassify) {
  const summaryPath = path.join(outputRoot, "summary.json");
  const existing = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  existing.failures = existing.failures.map((failure) => {
    const classified = classify({ file: failure.file, line: failure.line, message: failure.message, kind: failure.kind });
    return { ...failure, reason: classified.reason, forbiddenHits: classified.forbiddenHits, source: classified.source ?? failure.source };
  });
  const byReason = finalize(existing);
  existing.reclassifiedAt = new Date().toISOString();
  fs.writeFileSync(summaryPath, `${JSON.stringify(existing, null, 2)}\n`);
  process.stdout.write(`s185-m01 ${mode} control reclassified (v${CLASSIFIER_VERSION}): ${existing.status}; failures ${existing.failures.length} ${JSON.stringify(byReason)}; frozen-literal ${existing.frozenLiteralFailures.length}\n`);
  process.exit(existing.status === "failed" ? 1 : 0);
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), `oods-s185-m01-${mode}-`));
fs.mkdirSync(outputRoot, { recursive: true });

const summary = {
  schemaVersion: "1.0.0",
  sprintId: "sprint-185",
  missionId: "s185-m01",
  kind: `nucleus-pin-control-${mode}`,
  mode,
  workspace,
  measuredHead: git("rev-parse", "HEAD").stdout.trim(),
  mutation: { patch: path.relative(workspace, patchPath), sha256: sha256(fs.readFileSync(patchPath)) },
  host: { hostname: os.hostname(), platform: os.platform(), release: os.release(), architecture: os.arch(), cpuModel: os.cpus()[0]?.model ?? null, cpuCount: os.cpus().length, node: process.version },
  cleanBefore: cleanliness(),
  subset: only ? [...only] : null,
  allowDirty,
  steps: [],
  checks: [],
  failures: [],
  status: "running",
};

function step(id, command, commandArgs, options) {
  const result = run(command, commandArgs, options);
  const record = receipt(id, result);
  summary.steps.push(record);
  return { result, record };
}

const typechecks = [
  { id: "typecheck-root", directory: ".", command: "pnpm", args: ["typecheck"] },
  { id: "typecheck-component-contracts", directory: "packages/component-contracts", command: "pnpm", args: ["--filter", "@oods/component-contracts", "run", "typecheck"] },
  { id: "typecheck-components-react", directory: "packages/components-react", command: "pnpm", args: ["--filter", "@oods/components-react", "run", "typecheck"] },
  { id: "typecheck-components-vue", directory: "packages/components-vue", command: "pnpm", args: ["--filter", "@oods/components-vue", "run", "typecheck"] },
  { id: "typecheck-component-styles", directory: "packages/component-styles", command: "pnpm", args: ["--filter", "@oods/component-styles", "run", "typecheck"] },
  { id: "typecheck-mcp-server", directory: "packages/mcp-server", command: "pnpm", args: ["--filter", "@oods/mcp-server", "exec", "tsc", "--noEmit", "--pretty", "false", "-p", "tsconfig.json"] },
];

const suites = [
  { id: "test-component-contracts", filter: "@oods/component-contracts", directory: "packages/component-contracts", extra: ["--config", "vitest.config.ts"] },
  { id: "test-components-react", filter: "@oods/components-react", directory: "packages/components-react", extra: ["--config", "vitest.config.ts"] },
  { id: "test-components-vue", filter: "@oods/components-vue", directory: "packages/components-vue", extra: ["--config", "vitest.config.ts"] },
  { id: "test-component-styles", filter: "@oods/component-styles", directory: "packages/component-styles", extra: ["--config", "vitest.config.ts"] },
  { id: "test-mcp-server-product-reality", filter: "@oods/mcp-server", directory: "packages/mcp-server", extra: ["test/product-reality"] },
];

try {
  if (!summary.cleanBefore.clean && !allowDirty) throw new Error(`workspace is not clean before the control: ${JSON.stringify(summary.cleanBefore)}`);

  const applyCheck = step("git-apply-check", "git", ["apply", "--check", patchPath]);
  if (applyCheck.result.exitCode !== 0) throw new Error("mutation patch does not apply");
  const apply = step("git-apply", "git", ["apply", patchPath]);
  if (apply.result.exitCode !== 0) throw new Error("mutation patch failed to apply");
  summary.mutationDiff = git("diff", "--stat").stdout.trim();

  const build = step("build-component-contracts", "pnpm", ["--filter", "@oods/component-contracts", "run", "build"]);
  summary.contractsBuild = { primaryExitCode: build.result.exitCode, typescriptErrors: parseTsc(build.result, "packages/component-contracts"), fallbackUsed: false };
  if (build.result.exitCode !== 0) {
    // The declaration bundle fails on the totality error that the mutation
    // provokes. Measurement needs a dist that carries the mutated id, so the
    // JS bundle is rebuilt without dts and declarations are emitted by tsc
    // with noEmitOnError off. dist/ is ignored by git; nothing tracked moves.
    summary.contractsBuild.fallbackUsed = true;
    const packageDirectory = path.join(workspace, "packages/component-contracts");
    const jsOnly = step("build-component-contracts-js-only", "pnpm", ["--filter", "@oods/component-contracts", "exec", "tsup", "--config", "tsup.config.ts", "--no-dts"]);
    const declarations = step("build-component-contracts-declarations", "pnpm", [
      "--filter", "@oods/component-contracts", "exec", "tsc", "-p", "tsconfig.json",
      "--declaration", "--emitDeclarationOnly", "--noEmitOnError", "false", "--outDir", "dist", "--pretty", "false",
    ]);
    for (const shim of ["index.d.ts", "index.d.cts"]) {
      fs.writeFileSync(path.join(packageDirectory, "dist", shim), "export * from './src/index.js';\n");
    }
    summary.contractsBuild.fallback = {
      jsOnlyExitCode: jsOnly.result.exitCode,
      declarationsExitCode: declarations.result.exitCode,
      declarationTypescriptErrors: parseTsc(declarations.result, "packages/component-contracts"),
      shims: ["dist/index.d.ts", "dist/index.d.cts"],
    };
  }
  const distSource = fs.readFileSync(path.join(workspace, "packages/component-contracts/dist/index.js"), "utf8");
  summary.contractsBuild.distReflectsMutation = /['"]DetailHeader['"]/.test(distSource);
  if (!summary.contractsBuild.distReflectsMutation) throw new Error("component-contracts dist does not carry the mutated id");

  for (const check of typechecks) {
    if (only && !only.has(check.id)) continue;
    const { result, record } = step(check.id, check.command, check.args);
    const errors = parseTsc(result, check.directory).map((error) => ({ ...error, ...classify({ file: error.file, line: error.line, message: `${error.code}: ${error.message}`, kind: "typescript" }) }));
    summary.checks.push({ id: check.id, kind: "typecheck", exitCode: result.exitCode, errorCount: errors.length, log: record.log });
    for (const error of errors) summary.failures.push({ check: check.id, kind: "typescript", file: error.file, line: error.line, code: error.code, message: error.message, reason: error.reason, forbiddenHits: error.forbiddenHits, source: error.source });
  }

  for (const suite of suites) {
    if (only && !only.has(suite.id)) continue;
    const reportPath = path.join(temporaryRoot, `${suite.id}.json`);
    const commandArgs = ["--filter", suite.filter, "exec", "vitest", "run", ...suite.extra, "--reporter=default", "--reporter=json", `--outputFile=${reportPath}`];
    const { result, record } = step(suite.id, "pnpm", commandArgs);
    let parsed = null;
    let reportError = null;
    try {
      parsed = parseVitest(reportPath, suite.directory);
      const copied = path.join(outputRoot, "reports", `${suite.id}.json`);
      fs.mkdirSync(path.dirname(copied), { recursive: true });
      fs.copyFileSync(reportPath, copied);
    } catch (error) {
      reportError = error instanceof Error ? error.message : String(error);
    }
    summary.checks.push({
      id: suite.id,
      kind: "vitest",
      exitCode: result.exitCode,
      files: parsed?.files ?? null,
      tests: parsed?.tests ?? null,
      failureCount: parsed?.failures.length ?? null,
      reportError,
      log: record.log,
    });
    for (const failure of parsed?.failures ?? []) {
      const classified = classify({ file: failure.file, line: failure.line, message: failure.message, kind: "vitest" });
      summary.failures.push({
        check: suite.id,
        kind: "vitest",
        file: failure.file,
        line: failure.line,
        test: failure.test,
        message: scrubMessage(failure.message).slice(0, 2000),
        reason: classified.reason,
        forbiddenHits: classified.forbiddenHits,
        source: classified.source,
      });
    }
  }
} catch (error) {
  summary.error = error instanceof Error ? error.message : String(error);
} finally {
  const revert = step("git-apply-reverse", "git", ["apply", "-R", patchPath]);
  summary.revertExitCode = revert.result.exitCode;
  const rebuild = step("rebuild-component-contracts", "pnpm", ["--filter", "@oods/component-contracts", "run", "build"]);
  summary.rebuildExitCode = rebuild.result.exitCode;
  summary.cleanAfter = cleanliness();
  summary.workspaceRestored = allowDirty
    ? JSON.stringify(summary.cleanAfter.porcelain) === JSON.stringify(summary.cleanBefore.porcelain)
    : summary.cleanAfter.clean;
  fs.rmSync(temporaryRoot, { recursive: true, force: true });

  const byReason = finalize(summary);
  fs.writeFileSync(path.join(outputRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`s185-m01 ${mode} control: ${summary.status}; failures ${summary.failures.length} ${JSON.stringify(byReason)}; frozen-literal ${summary.frozenLiteralFailures.length}; clean after ${summary.cleanAfter.clean}\n`);
  if (summary.status === "failed") process.exitCode = 1;
}
