#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const historicalCapture = path.join(
  scriptDirectory,
  "capture-s182-m05-closeout-row.mjs",
);

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
  assert(values.id, "--id is required.");
  assert(values.workspace, "--workspace is required.");
  assert(values["output-root"], "--output-root is required.");
  assert(values["base-sha"], "--base-sha is required.");
  assert(values["review-head"], "--review-head is required.");
  return values;
}

function git(workspace, args) {
  const result = spawnSync("git", args, { cwd: workspace, encoding: "utf8" });
  assert(result.status === 0, `git ${args.join(" ")} failed in ${workspace}.`);
  return result.stdout.trim();
}

function resultPath(values) {
  return path.join(
    path.resolve(values["output-root"]),
    "gate-results",
    `${values.id.toLowerCase()}.json`,
  );
}

function rel(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
}

function rebrandHistoricalCapture(values) {
  const child = spawnSync(
    process.execPath,
    [historicalCapture, ...process.argv.slice(2)],
    {
      cwd: repositoryRoot,
      env: process.env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 128 * 1024 * 1024,
      timeout: 2 * 60 * 60_000,
    },
  );
  process.stdout.write(child.stdout ?? "");
  process.stderr.write(child.stderr ?? "");
  if (child.status !== 0) {
    process.exitCode = child.status ?? 1;
    return;
  }

  const capturePath = resultPath(values);
  const capture = JSON.parse(fs.readFileSync(capturePath, "utf8"));
  const oldLogPath = path.resolve(repositoryRoot, capture.log.path);
  const newLogPath = path.join(
    path.resolve(values["output-root"]),
    "logs",
    `s183-m06-${values.id.toLowerCase()}.log`,
  );
  fs.mkdirSync(path.dirname(newLogPath), { recursive: true });
  if (path.resolve(oldLogPath) !== path.resolve(newLogPath)) {
    fs.renameSync(oldLogPath, newLogPath);
  }
  capture.missionId = "s183-m06";
  capture.sprintId = "sprint-183";
  capture.evidenceId = `s183-m06-${values.id.toLowerCase()}`;
  capture.log.path = rel(newLogPath);
  fs.writeFileSync(capturePath, `${JSON.stringify(capture, null, 2)}\n`);
}

function captureDecisionCounts(values) {
  assert(
    values["allow-head-mismatch"] === "true",
    "L-04 must explicitly pass --allow-head-mismatch true.",
  );
  const workspace = path.resolve(values.workspace);
  const outputRoot = path.resolve(values["output-root"]);
  const query =
    "SELECT m.id AS mission_id, COUNT(d.id) AS decision_count FROM missions m LEFT JOIN strategic_decisions d ON d.mission_id = m.id AND d.project_id = m.project_id WHERE m.sprint_id = 'sprint-183' AND m.project_id = 'forge' GROUP BY m.id ORDER BY m.id;";
  const literalCommand = `sqlite3 -header -column cmos/db/cmos.sqlite ${JSON.stringify(query)}`;
  const before = git(workspace, ["status", "--porcelain=v1"])
    .split(/\r?\n/)
    .filter(Boolean);
  const startedAt = new Date().toISOString();
  const result = spawnSync(
    "sqlite3",
    ["-header", "-column", "cmos/db/cmos.sqlite", query],
    { cwd: workspace, encoding: "utf8" },
  );
  const endedAt = new Date().toISOString();
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(output);
  const logContents = Buffer.from(output);
  const logPath = path.join(outputRoot, "logs", "s183-m06-l-04.log");
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, logContents);
  const measuredHead = git(workspace, ["rev-parse", "HEAD"]);
  const symbolic = spawnSync("git", ["symbolic-ref", "-q", "HEAD"], {
    cwd: workspace,
  });
  const after = git(workspace, ["status", "--porcelain=v1"])
    .split(/\r?\n/)
    .filter(Boolean);
  const capture = {
    schemaVersion: "1.0.0",
    missionId: "s183-m06",
    sprintId: "sprint-183",
    rowId: "L-04",
    evidenceId: "s183-m06-l-04",
    baseSha: values["base-sha"],
    reviewHead: values["review-head"],
    measuredHead,
    headMismatchAllowed: true,
    detachedHead: symbolic.status === 1,
    cwd: workspace,
    environment: {
      PR_LABELS: "",
      TOKEN_GOV_BASE_REF: null,
      CHROMATIC_PROJECT_TOKEN: null,
    },
    literalCommands: [literalCommand],
    literalCommand,
    executionCommands: [literalCommand],
    executedCommand: literalCommand,
    startedAt,
    endedAt,
    exitCode: result.status,
    status: result.status === 0 ? "pass" : "fail",
    log: {
      path: rel(logPath),
      bytes: logContents.byteLength,
      sha256: sha256(logContents),
    },
    gitStatusBefore: before,
    gitStatusAfter: after,
    sideEffects: [],
  };
  const capturePath = resultPath(values);
  fs.mkdirSync(path.dirname(capturePath), { recursive: true });
  fs.writeFileSync(capturePath, `${JSON.stringify(capture, null, 2)}\n`);
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}

try {
  const values = parseArguments(process.argv.slice(2));
  if (values.id === "L-04") captureDecisionCounts(values);
  else rebrandHistoricalCapture(values);
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
}
