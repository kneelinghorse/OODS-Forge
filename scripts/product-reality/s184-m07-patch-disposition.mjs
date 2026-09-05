import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const REPOSITORY_ROOT = path.resolve(scriptDirectory, "../..");
export const AUDIT_HEAD = "cbcbce242f922c18ccfeefbe071bbb26d450dabf";
export const DISPOSITION_PATH =
  "artifacts/product-reality/sprint-184/m07/patch-disposition.json";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? REPOSITORY_ROOT,
    encoding: options.encoding ?? null,
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    stdout: result.stdout ?? Buffer.alloc(0),
    stderr: result.stderr ?? Buffer.alloc(0),
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function requireGreen(result, label) {
  if (result.exitCode !== 0) {
    throw new Error(
      `${label} failed (${result.exitCode}): ${result.stderr.toString("utf8") || result.error || "no diagnostic"}`,
    );
  }
  return result;
}

export function sha256Urn(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

export function gitObjectBytes(commit, repoPath) {
  return requireGreen(
    run("git", ["show", `${commit}:${repoPath}`]),
    `read ${commit}:${repoPath}`,
  ).stdout;
}

export function gitObjectExists(commit, repoPath) {
  return run("git", ["cat-file", "-e", `${commit}:${repoPath}`]).exitCode === 0;
}

export function trackedPatchPaths(commit = AUDIT_HEAD) {
  return requireGreen(
    run("git", ["ls-tree", "-r", "--name-only", commit, "--", "artifacts"], {
      encoding: "utf8",
    }),
    `list tracked artifacts at ${commit}`,
  )
    .stdout.trim()
    .split("\n")
    .filter((repoPath) => repoPath.endsWith(".patch"))
    .sort();
}

export function readDisposition() {
  return JSON.parse(
    fs.readFileSync(path.join(REPOSITORY_ROOT, DISPOSITION_PATH), "utf8"),
  );
}

export function patchTargetPaths(patchBytes) {
  const targets = [];
  for (const line of patchBytes.toString("utf8").split("\n")) {
    const match = /^(?:---|\+\+\+)\s+([^\t ]+)/.exec(line);
    if (!match || match[1] === "/dev/null") continue;
    const normalized = match[1].replace(/^[ab]\//, "");
    if (!targets.includes(normalized)) targets.push(normalized);
  }
  return targets;
}

function applyPatch(cwd, patchBytes, extraArgs = []) {
  return run("git", ["apply", ...extraArgs, "--whitespace=nowarn", "-"], {
    cwd,
    input: patchBytes,
  });
}

function baselineChain(record, baselineId) {
  const baseline = record.baselines[baselineId];
  if (!baseline) throw new Error(`Unknown baseline ${baselineId}.`);
  if (baseline.kind === "git-commit") {
    return { baseline, commit: baseline.commit, bootstrapPatchPaths: [] };
  }
  if (baseline.kind !== "derived-patch-result") {
    throw new Error(`Unsupported baseline kind ${baseline.kind}.`);
  }
  const parent = baselineChain(record, baseline.parentBaselineId);
  return {
    baseline: parent.baseline,
    commit: parent.commit,
    bootstrapPatchPaths: [...parent.bootstrapPatchPaths, baseline.patchPath],
  };
}

function sourcePathForTarget(baseline, targetPath) {
  return baseline.workspaceRoot
    ? path.posix.join(baseline.workspaceRoot, targetPath)
    : targetPath;
}

async function prepareBaseline(entry, record, baselineId) {
  const chain = baselineChain(record, baselineId);
  const patchBytes = gitObjectBytes(record.auditHead, entry.path);
  const bootstrapPatches = chain.bootstrapPatchPaths.map((patchPath) => ({
    patchPath,
    bytes: gitObjectBytes(record.auditHead, patchPath),
  }));
  const targets = [
    ...new Set([
      ...patchTargetPaths(patchBytes),
      ...bootstrapPatches.flatMap(({ bytes }) => patchTargetPaths(bytes)),
    ]),
  ];
  const temporaryRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), "oods-s184-m07-patch-"),
  );
  for (const targetPath of targets) {
    const sourcePath = sourcePathForTarget(chain.baseline, targetPath);
    const destination = path.join(temporaryRoot, targetPath);
    await fsp.mkdir(path.dirname(destination), { recursive: true });
    await fsp.writeFile(destination, gitObjectBytes(chain.commit, sourcePath));
  }
  for (const bootstrap of bootstrapPatches) {
    requireGreen(
      applyPatch(temporaryRoot, bootstrap.bytes, ["--check"]),
      `check bootstrap ${bootstrap.patchPath}`,
    );
    requireGreen(
      applyPatch(temporaryRoot, bootstrap.bytes),
      `apply bootstrap ${bootstrap.patchPath}`,
    );
  }
  return { temporaryRoot, targets, patchBytes };
}

async function targetHashes(root, targets) {
  return Object.fromEntries(
    await Promise.all(
      targets.map(async (targetPath) => [
        targetPath,
        sha256Urn(await fsp.readFile(path.join(root, targetPath))),
      ]),
    ),
  );
}

export async function replayDispositionEntry(
  entry,
  record,
  baselineId = entry.baselineId,
) {
  const prepared = await prepareBaseline(entry, record, baselineId);
  try {
    const before = await targetHashes(prepared.temporaryRoot, prepared.targets);
    const check = applyPatch(prepared.temporaryRoot, prepared.patchBytes, [
      "--check",
    ]);
    requireGreen(check, `check ${entry.path}`);
    const apply = applyPatch(prepared.temporaryRoot, prepared.patchBytes);
    requireGreen(apply, `apply ${entry.path}`);
    const mutated = await targetHashes(
      prepared.temporaryRoot,
      prepared.targets,
    );
    if (JSON.stringify(mutated) === JSON.stringify(before)) {
      throw new Error(`${entry.path} applied without changing a target.`);
    }
    const reverseCheck = applyPatch(
      prepared.temporaryRoot,
      prepared.patchBytes,
      ["--reverse", "--check"],
    );
    requireGreen(reverseCheck, `reverse-check ${entry.path}`);
    const reverse = applyPatch(prepared.temporaryRoot, prepared.patchBytes, [
      "--reverse",
    ]);
    requireGreen(reverse, `reverse ${entry.path}`);
    const restored = await targetHashes(
      prepared.temporaryRoot,
      prepared.targets,
    );
    if (JSON.stringify(restored) !== JSON.stringify(before)) {
      throw new Error(`${entry.path} did not restore byte-identically.`);
    }
    return {
      checkExitCode: check.exitCode,
      applyExitCode: apply.exitCode,
      reverseCheckExitCode: reverseCheck.exitCode,
      reverseExitCode: reverse.exitCode,
      targetCount: prepared.targets.length,
      changed: true,
      byteIdenticalRestoration: true,
    };
  } finally {
    await fsp.rm(prepared.temporaryRoot, { recursive: true, force: true });
  }
}

export async function checkDispositionEntry(
  entry,
  record,
  baselineId = entry.baselineId,
) {
  const prepared = await prepareBaseline(entry, record, baselineId);
  try {
    const result = applyPatch(prepared.temporaryRoot, prepared.patchBytes, [
      "--check",
    ]);
    return {
      exitCode: result.exitCode,
      diagnostic: result.stderr.toString("utf8"),
    };
  } finally {
    await fsp.rm(prepared.temporaryRoot, { recursive: true, force: true });
  }
}

export async function checkPatchSyntax(patchBytes) {
  const temporaryRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), "oods-s184-m07-syntax-"),
  );
  try {
    const result = applyPatch(temporaryRoot, patchBytes, ["--check"]);
    return {
      exitCode: result.exitCode,
      diagnostic: result.stderr.toString("utf8"),
    };
  } finally {
    await fsp.rm(temporaryRoot, { recursive: true, force: true });
  }
}
