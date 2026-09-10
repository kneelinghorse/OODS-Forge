#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { finished } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import {
  buildRuntimeManifest,
  canonicalJson,
  RUNTIME_ARCHIVE_FILE,
  RUNTIME_ARCHIVE_SHA256_FILE,
  RUNTIME_MANIFEST_FILE,
  RUNTIME_PACKAGES,
  RUNTIME_SBOM_FILE,
  sha256File,
  verifyEmbeddedManifest,
  walkTree,
} from "./manifest.mjs";
import {
  buildSbomLite,
  buildSbomLiteFromFile,
  EXPECTED_THIRD_PARTY_COUNT,
} from "./sbom-lite.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const PNPM_VERSION = "9.12.2";
const DIST_PACKAGES = RUNTIME_PACKAGES.filter((name) => name !== "mcp-adapter");
const PACKAGE_RUNTIME_DIRECTORIES = Object.freeze({
  "component-contracts": ["registry"],
  "components-react": ["evidence"],
  "components-vue": ["evidence"],
});
const ADAPTER_RUNTIME_FILES = [
  "index.js",
  "sanitize-schema.js",
  "tool-descriptions.json",
  "package.json",
];

const TRACKED_BOUNDARY_COUNTS = Object.freeze({
  domains: 14,
  objects: 8,
  schemas: 52,
  traits: 68,
  // Sprint 187 retains the existing 19 files plus the approved component/token refresh pair.
  // Sprint 188 retains three named component/token snapshot pairs (six files).
  "artifacts/structured-data": 27,
});

const ABSOLUTE_PATH_EXEMPTIONS = new Set([
  "packages/mcp-server/dist/security/policy.json",
  "packages/mcp-server/dist/security/redactions.json",
]);

function bytewiseCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeRelative(filePath) {
  return filePath.split(path.sep).join("/");
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

const LEFT_PATH_BOUNDARIES = new Set([
  '"',
  "'",
  "`",
  "=",
  ":",
  "(",
  ",",
  "[",
  "{",
]);
const RIGHT_PATH_BOUNDARIES = new Set([
  '"',
  "'",
  "`",
  "/",
  "\\",
  ":",
  ")",
  ",",
  ";",
  "]",
  "}",
]);

export function containsExactPathRoot(text, absoluteRoot) {
  assert.equal(typeof text, "string", "path scan input must be text");
  assert(
    typeof absoluteRoot === "string" && absoluteRoot.length > 0,
    "path scan root must be non-empty",
  );

  let offset = 0;
  while (offset < text.length) {
    const index = text.indexOf(absoluteRoot, offset);
    if (index < 0) return false;
    const before = index > 0 ? text[index - 1] : undefined;
    const after = text[index + absoluteRoot.length];
    const leftBoundary =
      before === undefined ||
      /\s/.test(before) ||
      LEFT_PATH_BOUNDARIES.has(before) ||
      text.slice(Math.max(0, index - "file://".length), index) === "file://";
    const rightBoundary =
      after === undefined ||
      /\s/.test(after) ||
      RIGHT_PATH_BOUNDARIES.has(after);
    if (leftBoundary && rightBoundary) return true;
    offset = index + 1;
  }
  return false;
}

function assertExactPathRootMatcher() {
  assert.equal(containsExactPathRoot("/repo/file.js", "/repo"), true);
  assert.equal(containsExactPathRoot('source="/repo"', "/repo"), true);
  assert.equal(containsExactPathRoot("file:///repo/file.js", "/repo"), true);
  assert.equal(containsExactPathRoot("/repository/file.js", "/repo"), false);
  assert.equal(containsExactPathRoot("/some/repo/file.js", "/repo"), false);
  assert.equal(containsExactPathRoot("https://repo/file.js", "/repo"), false);
}

function parseArgs(argv) {
  const parsed = { final: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--final") parsed.final = true;
    else if (arg === "--out-dir" || arg === "--work-dir") {
      const value = argv[++index];
      if (!value) throw new Error(`missing value for ${arg}`);
      parsed[arg === "--out-dir" ? "outDir" : "workDir"] = path.resolve(value);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!parsed.outDir || !parsed.workDir) {
    throw new Error(
      "usage: assemble.mjs --out-dir <dir> --work-dir <dir> [--final]",
    );
  }
  return parsed;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: options.stdio ?? "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed (${code ?? signal ?? "unknown"})`,
          ),
        );
    });
  });
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolve(stdout);
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed (${code ?? signal ?? "unknown"}): ${stderr.trim()}`,
          ),
        );
    });
  });
}

async function ensureEmptyDirectory(directory, label) {
  await fsp.mkdir(directory, { recursive: true });
  const entries = await fsp.readdir(directory);
  if (entries.length > 0)
    throw new Error(`${label} must be empty: ${directory}`);
}

function pnpmEnvironment() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    const normalized = key.toUpperCase();
    if (
      normalized === "NODE_PATH" ||
      normalized === "NPM_CONFIG_USERCONFIG" ||
      normalized === "NPM_CONFIG_GLOBALCONFIG"
    ) {
      delete env[key];
    }
  }
  env.NPM_CONFIG_USERCONFIG = "/dev/null";
  env.NPM_CONFIG_GLOBALCONFIG = "/dev/null";
  return env;
}

async function copyFile(source, destination) {
  const stat = await fsp.lstat(source);
  assert(stat.isFile(), `required regular file is missing: ${source}`);
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.copyFile(source, destination);
}

async function copyWorkspaceInputs(builderRoot) {
  const packagesRoot = path.join(builderRoot, "packages");
  await fsp.mkdir(packagesRoot, { recursive: true });
  for (const packageDirectory of DIST_PACKAGES) {
    const sourceRoot = path.join(REPO_ROOT, "packages", packageDirectory);
    const destinationRoot = path.join(packagesRoot, packageDirectory);
    await fsp.mkdir(destinationRoot, { recursive: true });
    await copyFile(
      path.join(sourceRoot, "package.json"),
      path.join(destinationRoot, "package.json"),
    );
    const sourceDist = path.join(sourceRoot, "dist");
    const distStat = await fsp.stat(sourceDist).catch(() => null);
    assert(
      distStat?.isDirectory(),
      `built dist is missing for packages/${packageDirectory}`,
    );
    await fsp.cp(sourceDist, path.join(destinationRoot, "dist"), {
      recursive: true,
      dereference: false,
      verbatimSymlinks: true,
    });
    for (const directory of PACKAGE_RUNTIME_DIRECTORIES[packageDirectory] ??
      []) {
      const sourceDirectory = path.join(sourceRoot, directory);
      const sourceStat = await fsp.stat(sourceDirectory).catch(() => null);
      assert(
        sourceStat?.isDirectory(),
        `runtime asset directory is missing: packages/${packageDirectory}/${directory}`,
      );
      await fsp.cp(sourceDirectory, path.join(destinationRoot, directory), {
        recursive: true,
        dereference: false,
        verbatimSymlinks: true,
      });
    }
  }

  const adapterSource = path.join(REPO_ROOT, "packages", "mcp-adapter");
  const adapterDestination = path.join(packagesRoot, "mcp-adapter");
  await fsp.mkdir(adapterDestination, { recursive: true });
  for (const filename of ADAPTER_RUNTIME_FILES) {
    await copyFile(
      path.join(adapterSource, filename),
      path.join(adapterDestination, filename),
    );
  }

  await copyFile(
    path.join(REPO_ROOT, "pnpm-workspace.yaml"),
    path.join(builderRoot, "pnpm-workspace.yaml"),
  );
  await copyFile(
    path.join(REPO_ROOT, ".npmrc"),
    path.join(builderRoot, ".npmrc"),
  );
  await copyFile(
    path.join(REPO_ROOT, "pnpm-lock.yaml"),
    path.join(builderRoot, "pnpm-lock.yaml"),
  );
  const syntheticPackage = {
    name: "@oods/portable-runtime-builder",
    private: true,
    packageManager: `pnpm@${PNPM_VERSION}`,
  };
  await fsp.writeFile(
    path.join(builderRoot, "package.json"),
    canonicalJson(syntheticPackage),
    { encoding: "utf8", flag: "wx", mode: 0o644 },
  );
}

async function installProductionClosure(builderRoot) {
  const env = pnpmEnvironment();
  const observedVersion = (
    await runCapture("pnpm", ["--version"], { cwd: builderRoot, env })
  ).trim();
  assert.equal(
    observedVersion,
    PNPM_VERSION,
    `portable runtime requires pnpm ${PNPM_VERSION}`,
  );
  await run(
    "pnpm",
    [
      "install",
      "--no-frozen-lockfile",
      "--prod",
      "--no-optional",
      "--ignore-scripts",
      "--prefer-offline",
      "--config.node-linker=isolated",
      "--config.auto-install-peers=false",
      "--filter",
      "@oods/mcp-server...",
      "--filter",
      "@oods/mcp-adapter",
    ],
    { cwd: builderRoot, env },
  );
}

async function installedClosureCount(root) {
  const virtualStore = path.join(root, "node_modules", ".pnpm");
  const entries = await fsp.readdir(virtualStore, { withFileTypes: true });
  return entries.filter(
    (entry) => entry.isDirectory() && entry.name !== "node_modules",
  ).length;
}

async function installedPackageIdentities(root) {
  const virtualStore = path.join(root, "node_modules", ".pnpm");
  const storeEntries = await fsp.readdir(virtualStore, {
    withFileTypes: true,
  });
  const identities = new Set();

  async function recordIdentity(packageRoot) {
    const packageJsonPath = path.join(packageRoot, "package.json");
    const bytes = await fsp.readFile(packageJsonPath, "utf8").catch((error) => {
      if (error?.code === "ENOENT") return null;
      throw error;
    });
    if (bytes === null) return;
    const packageJson = JSON.parse(bytes);
    assert.equal(
      typeof packageJson.name,
      "string",
      `installed package name is missing: ${packageJsonPath}`,
    );
    assert.equal(
      typeof packageJson.version,
      "string",
      `installed package version is missing: ${packageJsonPath}`,
    );
    identities.add(`${packageJson.name}@${packageJson.version}`);
  }

  for (const storeEntry of storeEntries) {
    if (!storeEntry.isDirectory() || storeEntry.name === "node_modules")
      continue;
    const modulesRoot = path.join(
      virtualStore,
      storeEntry.name,
      "node_modules",
    );
    const packageEntries = await fsp
      .readdir(modulesRoot, { withFileTypes: true })
      .catch((error) => {
        if (error?.code === "ENOENT") return [];
        throw error;
      });
    for (const packageEntry of packageEntries) {
      if (packageEntry.name.startsWith(".")) continue;
      const packageRoot = path.join(modulesRoot, packageEntry.name);
      if (!packageEntry.name.startsWith("@")) {
        await recordIdentity(packageRoot);
        continue;
      }
      const scopedEntries = await fsp.readdir(packageRoot, {
        withFileTypes: true,
      });
      for (const scopedEntry of scopedEntries) {
        await recordIdentity(path.join(packageRoot, scopedEntry.name));
      }
    }
  }

  return [...identities].sort(bytewiseCompare);
}

async function gitTrackedBoundaryFiles() {
  const pathspecs = [
    ...Object.keys(TRACKED_BOUNDARY_COUNTS),
    "docs/integration/stage1-entity-aliases.json",
    "LICENSE",
  ];
  const output = await runCapture(
    "git",
    ["ls-files", "-z", "--", ...pathspecs],
    { cwd: REPO_ROOT },
  );
  const files = output.split("\0").filter(Boolean).sort(bytewiseCompare);
  for (const [prefix, expected] of Object.entries(TRACKED_BOUNDARY_COUNTS)) {
    const count = files.filter(
      (file) => file === prefix || file.startsWith(`${prefix}/`),
    ).length;
    assert.equal(
      count,
      expected,
      `${prefix} tracked boundary count must be ${expected}`,
    );
  }
  assert(
    files.includes("docs/integration/stage1-entity-aliases.json"),
    "stage1 entity aliases are not tracked",
  );
  assert(files.includes("LICENSE"), "root LICENSE is not tracked");
  assert(
    files.every((file) => file !== "cmos" && !file.startsWith("cmos/")),
    "cmos path entered tracked boundary",
  );
  return files;
}

async function copyTrackedBoundary(payloadRoot) {
  const files = await gitTrackedBoundaryFiles();
  for (const relative of files) {
    await copyFile(
      path.join(REPO_ROOT, relative),
      path.join(payloadRoot, relative),
    );
  }
  return files;
}

async function prunePnpmMetadata(root) {
  async function visit(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const normalized = normalizeRelative(path.relative(root, absolute));
      if (entry.isDirectory()) {
        if (
          entry.name === ".bin" &&
          normalized.split("/").includes("node_modules")
        ) {
          await fsp.rm(absolute, { recursive: true, force: true });
          continue;
        }
        await visit(absolute);
      } else if (entry.isFile()) {
        const parent = path.basename(path.dirname(absolute));
        const remove =
          (entry.name === ".modules.yaml" && parent === "node_modules") ||
          normalized.endsWith("node_modules/.pnpm/lock.yaml") ||
          normalized.endsWith("node_modules/.pnpm-workspace-state-v1.json");
        if (remove) await fsp.rm(absolute, { force: true });
      }
    }
  }
  await visit(root);
}

async function prunePackageDists(payloadRoot, { fixtures }) {
  async function visit(directory, distRoot) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = normalizeRelative(path.relative(distRoot, absolute));
      if (entry.isDirectory()) {
        const removeDirectory =
          entry.name === "__tests__" ||
          (fixtures && relative === "tools/__fixtures__");
        if (removeDirectory) {
          await fsp.rm(absolute, { recursive: true, force: true });
          continue;
        }
        await visit(absolute, distRoot);
      } else if (entry.isFile()) {
        const sourceArtifact =
          entry.name.endsWith(".map") ||
          entry.name.endsWith(".d.ts") ||
          entry.name.endsWith(".ts");
        const testArtifact = entry.name.includes(".test.");
        if (sourceArtifact || testArtifact)
          await fsp.rm(absolute, { force: true });
      }
    }
  }

  for (const packageDirectory of DIST_PACKAGES) {
    const distRoot = path.join(
      payloadRoot,
      "packages",
      packageDirectory,
      "dist",
    );
    await visit(distRoot, distRoot);
  }
}

async function normalizeModes(payloadRoot) {
  const entries = await walkTree(payloadRoot);
  const pending = [];
  async function flush() {
    if (pending.length === 0) return;
    await Promise.all(pending.splice(0));
  }
  for (const entry of entries) {
    if (entry.type === "symlink") continue;
    const mode =
      entry.type === "directory" ? 0o755 : entry.mode & 0o111 ? 0o755 : 0o644;
    pending.push(fsp.chmod(entry.absolute, mode));
    if (pending.length >= 128) await flush();
  }
  await flush();
}

function allowedCmosProvenance(relative) {
  return (
    relative === "artifacts/structured-data/manifest.json" ||
    relative === "packages/component-contracts/dist/index.cjs" ||
    relative === "packages/component-contracts/dist/index.js" ||
    relative ===
      "packages/component-contracts/registry/component-reconciliation.proposed.v1.json" ||
    relative === "packages/component-contracts/registry/component-reconciliation.proposed.v2.json" ||
    /^artifacts\/structured-data\/oods-components-(?:\d{4}-\d{2}-\d{2}|s188-m04|s188-m05(?:-checkpoint)?)\.json$/.test(
      relative,
    ) ||
    /^traits\/viz\/layout-facet\.trait\.(?:ts|yaml)$/.test(relative)
  );
}

async function scanPayload(payloadRoot, { workRoot }) {
  const entries = await walkTree(payloadRoot);
  const cmosMembers = entries.filter(
    (entry) => entry.relative === "cmos" || entry.relative.startsWith("cmos/"),
  );
  assert.equal(
    cmosMembers.length,
    0,
    `cmos archive members rejected: ${cmosMembers.map((entry) => entry.relative).join(", ")}`,
  );

  const absoluteFindings = [];
  const cmosProvenanceFindings = [];
  const executableCmosFindings = [];
  const dynamicPatterns = [
    path.resolve(REPO_ROOT),
    path.resolve(workRoot),
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  for (const entry of entries) {
    if (entry.type !== "file") continue;
    const bytes = await fsp.readFile(entry.absolute);
    const text = bytes.toString("latin1");
    const exempt = ABSOLUTE_PATH_EXEMPTIONS.has(entry.relative);
    // Third-party declaration files and READMEs legitimately contain platform
    // path examples (for example @types/node and escalade). They are immutable
    // dependency content, not leaked build paths. Keep the generic platform
    // sentinel on first-party files and executable dependency JavaScript; the
    // exact repo/work roots below remain forbidden everywhere.
    const isThirdPartyDependency = entry.relative
      .split("/")
      .includes("node_modules");
    const isExecutableDependency =
      isThirdPartyDependency && /\.(?:cjs|mjs|js)$/.test(entry.relative);
    const scanGenericPlatformRoot =
      !isThirdPartyDependency || isExecutableDependency;
    const hasUserPath =
      scanGenericPlatformRoot &&
      (text.includes("/Users/") ||
        text.includes("/home/runner/work/") ||
        /[A-Za-z]:[\\/]Users[\\/]/.test(text));
    const hasDynamicPath = dynamicPatterns.some((pattern) =>
      containsExactPathRoot(text, pattern),
    );
    if ((!exempt && hasUserPath) || hasDynamicPath)
      absoluteFindings.push(entry.relative);
    if (
      text.includes("cmos/planning") &&
      !allowedCmosProvenance(entry.relative)
    ) {
      cmosProvenanceFindings.push(entry.relative);
    }
    if (
      /^packages\/(?:[^/]+\/dist\/.*|mcp-adapter\/[^/]+)\.js$/.test(entry.relative) &&
      /["']cmos["']/.test(text)
    ) {
      executableCmosFindings.push(entry.relative);
    }
  }

  assert.equal(
    absoluteFindings.length,
    0,
    `absolute developer/build paths rejected: ${[...new Set(absoluteFindings)].sort(bytewiseCompare).join(", ")}`,
  );
  assert.equal(
    cmosProvenanceFindings.length,
    0,
    `unexpected cmos/planning reference outside provenance allowlist: ${cmosProvenanceFindings.join(", ")}`,
  );
  assert.equal(
    executableCmosFindings.length,
    0,
    `quoted cmos path segment in bundled executable JS: ${executableCmosFindings.join(", ")}`,
  );
  return { entryCount: entries.length };
}

async function findTarImplementation() {
  const candidates = [
    ...new Set([process.env.GNU_TAR, "gtar", "tar"].filter(Boolean)),
  ];
  for (const candidate of candidates) {
    try {
      const version = await runCapture(candidate, ["--version"]);
      if (/GNU tar/.test(version)) {
        return {
          command: candidate,
          kind: "gnu",
          method: "GNU tar normalized stream + gzip -9n",
          determinismCertified: true,
        };
      }
    } catch {
      // Try the next candidate.
    }
  }
  try {
    const version = await runCapture("tar", ["--version"]);
    if (/bsdtar/i.test(version)) {
      return {
        command: "tar",
        kind: "bsdtar",
        method: "bsdtar normalized restricted-pax local stream + gzip -9n",
        determinismCertified: false,
      };
    }
  } catch {
    // Fall through to the actionable failure below.
  }
  throw new Error(
    "no supported tar implementation found (GNU tar for certified CI, or bsdtar for a non-certified local bundle)",
  );
}

function waitForExit(child, label) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${label} failed (${code ?? signal ?? "unknown"})`));
    });
  });
}

async function normalizeTimestamps(payloadRoot) {
  const epoch = new Date(0);
  const entries = await walkTree(payloadRoot);
  for (const entry of [...entries].reverse()) {
    if (entry.type === "symlink") {
      if (typeof fsp.lutimes === "function")
        await fsp.lutimes(entry.absolute, epoch, epoch);
    } else {
      await fsp.utimes(entry.absolute, epoch, epoch);
    }
  }
  await fsp.utimes(payloadRoot, epoch, epoch);
}

async function createArchive(
  payloadRoot,
  archivePath,
  workRoot,
  tarImplementation,
) {
  const entries = await walkTree(payloadRoot);
  for (const entry of entries) {
    if (entry.relative.includes("\n") || entry.relative.includes("\r")) {
      throw new Error(
        `newline in archive member is unsupported: ${JSON.stringify(entry.relative)}`,
      );
    }
  }
  const listPath = path.join(workRoot, "archive-members.txt");
  const memberList = entries
    .map((entry) => entry.relative)
    .sort(bytewiseCompare)
    .join("\n");
  await fsp.writeFile(listPath, `${memberList}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o644,
  });

  const partialPath = `${archivePath}.partial-${process.pid}`;
  const output = fs.createWriteStream(partialPath, {
    flags: "wx",
    mode: 0o644,
  });
  const tarArgs =
    tarImplementation.kind === "gnu"
      ? [
          "--sort=name",
          "--mtime=@0",
          "--owner=0",
          "--group=0",
          "--numeric-owner",
          "--format=gnu",
          "--no-recursion",
          "--verbatim-files-from",
          "-cf",
          "-",
          "-T",
          listPath,
        ]
      : [
          "-cf",
          "-",
          "--format",
          "paxr",
          "--uid",
          "0",
          "--gid",
          "0",
          "--uname",
          "",
          "--gname",
          "",
          "--numeric-owner",
          "--no-acls",
          "--no-fflags",
          "--no-mac-metadata",
          "--no-xattrs",
          "--no-recursion",
          "-T",
          listPath,
        ];
  const tar = spawn(tarImplementation.command, tarArgs, {
    cwd: payloadRoot,
    env: { ...process.env, LC_ALL: "C", TZ: "UTC", COPYFILE_DISABLE: "1" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const gzip = spawn("gzip", ["-9n"], {
    env: { ...process.env, LC_ALL: "C", TZ: "UTC" },
    stdio: ["pipe", "pipe", "inherit"],
  });
  tar.stdout.pipe(gzip.stdin);
  gzip.stdout.pipe(output);

  try {
    await Promise.all([
      waitForExit(tar, tarImplementation.command),
      waitForExit(gzip, "gzip -9n"),
      finished(output),
    ]);
    await fsp.rename(partialPath, archivePath);
  } catch (error) {
    tar.kill("SIGKILL");
    gzip.kill("SIGKILL");
    output.destroy();
    await fsp.rm(partialPath, { force: true });
    throw error;
  }
}

async function main() {
  assertExactPathRootMatcher();
  const args = parseArgs(process.argv.slice(2));
  assert(
    !isInside(REPO_ROOT, args.workDir),
    "--work-dir must be outside the repository",
  );
  assert(args.outDir !== args.workDir, "--out-dir and --work-dir must differ");
  await ensureEmptyDirectory(args.workDir, "work directory");
  await ensureEmptyDirectory(args.outDir, "output directory");

  const sourceLockHashBefore = await sha256File(
    path.join(REPO_ROOT, "pnpm-lock.yaml"),
  );
  const builderRoot = path.join(args.workDir, "builder");
  const payloadRoot = path.join(args.workDir, "payload");
  await fsp.mkdir(builderRoot);
  await fsp.mkdir(payloadRoot);

  const sbom = await buildSbomLite(REPO_ROOT);
  await copyWorkspaceInputs(builderRoot);
  await installProductionClosure(builderRoot);
  const installedSbom = await buildSbomLiteFromFile(
    path.join(builderRoot, "node_modules/.pnpm/lock.yaml"),
  );
  assert.deepEqual(
    installedSbom.packages,
    sbom.packages,
    "post-install virtual-store identities/integrities diverged from the source-lock SBOM",
  );
  const closureCount = await installedClosureCount(builderRoot);
  assert.equal(
    closureCount,
    EXPECTED_THIRD_PARTY_COUNT,
    `installed .pnpm closure must be ${EXPECTED_THIRD_PARTY_COUNT}`,
  );
  assert.equal(
    closureCount,
    sbom.summary.packageCount,
    "installed closure and SBOM-lite closure diverged",
  );
  assert.deepEqual(
    await installedPackageIdentities(builderRoot),
    sbom.packages.map((entry) => entry.id),
    "installed package identities diverged from the SBOM-lite closure",
  );

  await fsp.rename(
    path.join(builderRoot, "packages"),
    path.join(payloadRoot, "packages"),
  );
  await fsp.rename(
    path.join(builderRoot, "node_modules"),
    path.join(payloadRoot, "node_modules"),
  );
  await copyTrackedBoundary(payloadRoot);
  const sbomBytes = canonicalJson(sbom);
  await fsp.writeFile(path.join(payloadRoot, RUNTIME_SBOM_FILE), sbomBytes, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o644,
  });

  await prunePnpmMetadata(payloadRoot);
  await prunePackageDists(payloadRoot, { fixtures: false });
  await normalizeModes(payloadRoot);
  await scanPayload(payloadRoot, { workRoot: args.workDir });
  await prunePackageDists(payloadRoot, { fixtures: true });
  await normalizeModes(payloadRoot);
  const finalScan = await scanPayload(payloadRoot, { workRoot: args.workDir });
  const tarImplementation = await findTarImplementation();

  const manifest = await buildRuntimeManifest({
    repoRoot: REPO_ROOT,
    payloadRoot,
    sbom,
    final: args.final,
    archiveSha256File: RUNTIME_ARCHIVE_SHA256_FILE,
    archivePacking: {
      method: tarImplementation.method,
      determinismCertified: tarImplementation.determinismCertified,
    },
  });
  const manifestBytes = canonicalJson(manifest);
  await fsp.writeFile(
    path.join(payloadRoot, RUNTIME_MANIFEST_FILE),
    manifestBytes,
    {
      encoding: "utf8",
      flag: "wx",
      mode: 0o644,
    },
  );
  await verifyEmbeddedManifest(payloadRoot);
  await normalizeTimestamps(payloadRoot);

  const archivePath = path.join(args.outDir, RUNTIME_ARCHIVE_FILE);
  await createArchive(
    payloadRoot,
    archivePath,
    args.workDir,
    tarImplementation,
  );
  const archiveSha256 = await sha256File(archivePath);
  const sha256Bytes = `${archiveSha256}  ${RUNTIME_ARCHIVE_FILE}\n`;
  await fsp.writeFile(
    path.join(args.outDir, RUNTIME_ARCHIVE_SHA256_FILE),
    sha256Bytes,
    {
      encoding: "utf8",
      flag: "wx",
      mode: 0o644,
    },
  );
  await fsp.writeFile(
    path.join(args.outDir, RUNTIME_MANIFEST_FILE),
    manifestBytes,
    {
      encoding: "utf8",
      flag: "wx",
      mode: 0o644,
    },
  );
  await fsp.writeFile(path.join(args.outDir, RUNTIME_SBOM_FILE), sbomBytes, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o644,
  });

  const sourceLockHashAfter = await sha256File(
    path.join(REPO_ROOT, "pnpm-lock.yaml"),
  );
  assert.equal(
    sourceLockHashAfter,
    sourceLockHashBefore,
    "repository pnpm-lock.yaml moved during assembly",
  );
  process.stdout.write(
    `${canonicalJson({
      archive: archivePath,
      archiveSha256,
      archiveSha256File: path.join(args.outDir, RUNTIME_ARCHIVE_SHA256_FILE),
      manifest: path.join(args.outDir, RUNTIME_MANIFEST_FILE),
      sbomLite: path.join(args.outDir, RUNTIME_SBOM_FILE),
      payloadRoot,
      thirdPartyCount: closureCount,
      payloadEntryCount: finalScan.entryCount + 1,
      dirty: manifest.dirty,
      archivePacking: manifest.archivePacking,
      tarCommand: tarImplementation.command,
    })}`,
  );
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  main().catch((error) => {
    process.stderr.write(
      `assemble: ${error.stack ?? error.message ?? String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
