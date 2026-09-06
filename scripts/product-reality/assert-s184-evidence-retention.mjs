#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "../..");
const sprintRoots = [
  "artifacts/product-reality/sprint-183",
  "artifacts/product-reality/sprint-184",
  "artifacts/product-reality/sprint-185",
];

function evidenceIndexesUnder(repositoryRoot, repositoryPath) {
  const absoluteRoot = path.join(repositoryRoot, repositoryPath);
  if (!fs.existsSync(absoluteRoot)) return [];
  const pending = [absoluteRoot];
  const matches = [];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(absolutePath);
      if (entry.isFile() && entry.name === "evidence-index.json") {
        matches.push(path.relative(repositoryRoot, absolutePath));
      }
    }
  }
  return matches.sort();
}

export function collectNamedLogPaths(value, output = new Set()) {
  if (typeof value === "string") {
    const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
    if (
      /^artifacts\/product-reality\/sprint-(?:183|184|185)\/.*\.log$/.test(
        normalized,
      )
    ) {
      output.add(normalized);
    }
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectNamedLogPaths(entry, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectNamedLogPaths(entry, output);
    }
  }
  return output;
}

export function findUntrackedNamedLogs(namedLogPaths, trackedPaths) {
  const tracked = new Set(trackedPaths);
  return namedLogPaths.filter((logPath) => !tracked.has(logPath));
}

function gitTrackedPaths(repositoryRoot) {
  const result = spawnSync("git", ["ls-files"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr.trim()}`);
  }
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

export function auditEvidenceRetention(repositoryRoot = defaultRepositoryRoot) {
  const evidenceIndexes = sprintRoots.flatMap((sprintRoot) =>
    evidenceIndexesUnder(repositoryRoot, sprintRoot),
  );
  const namedLogPaths = [
    ...evidenceIndexes.reduce((logs, evidenceIndexPath) => {
      const value = JSON.parse(
        fs.readFileSync(path.join(repositoryRoot, evidenceIndexPath), "utf8"),
      );
      collectNamedLogPaths(value, logs);
      return logs;
    }, new Set()),
  ].sort();
  const missingFromWorkingTree = namedLogPaths.filter(
    (logPath) => !fs.existsSync(path.join(repositoryRoot, logPath)),
  );
  const untracked = findUntrackedNamedLogs(
    namedLogPaths,
    gitTrackedPaths(repositoryRoot),
  );

  return {
    schemaVersion: "1.0.0",
    sprintId: "sprint-184",
    missionId: "s184-m01",
    kind: "evidence-log-retention-audit",
    evidenceIndexes,
    namedLogCount: namedLogPaths.length,
    namedLogPaths,
    missingFromWorkingTree,
    untracked,
    status:
      missingFromWorkingTree.length === 0 && untracked.length === 0
        ? "passed"
        : "failed",
  };
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  const audit = auditEvidenceRetention();
  process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
  if (audit.status !== "passed") process.exitCode = 1;
}
