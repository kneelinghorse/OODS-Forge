#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const defaultChecklistPath = path.join(
  repositoryRoot,
  "cmos/foundational-docs/closeout-checklist.md",
);
const defaultOutputRoot = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-182/m05",
);
const canonicalOperationalCheckout =
  "/Users/systemsystems/portfolio/Design-Tools/OODS-Forge";

const EXPECTED_SIDE_EFFECTS = {
  "CI-07": [
    "artifacts/tokens/closeout-brand-a-report.json",
    "artifacts/tokens/closeout-brand-a-comment.md",
    "artifacts/tokens/closeout-brand-b-report.json",
    "artifacts/tokens/closeout-brand-b-comment.md",
  ],
  "CI-08": ["diagnostics.json"],
};

const EXPECTED_BLOCKS = {
  ci: {
    startMarker: "<!-- closeout-ci-rows:start -->",
    endMarker: "<!-- closeout-ci-rows:end -->",
    sha256: "9c4a2bf72ea7b562720bb8b769cb680e77b25293f92565ca243233f60fe8db98",
    rowIds: Array.from(
      { length: 15 },
      (_, index) => `CI-${String(index + 1).padStart(2, "0")}`,
    ),
  },
  local: {
    startMarker: "<!-- closeout-local-rows:start -->",
    endMarker: "<!-- closeout-local-rows:end -->",
    sha256: "e546cac9a1fdf200c25f972673b6e6a68ac7426ff0d961e7fc4175f45357aa12",
    rowIds: Array.from(
      { length: 9 },
      (_, index) => `L-${String(index + 1).padStart(2, "0")}`,
    ),
  },
};

const CANONICAL_ROW_IDS = [
  ...EXPECTED_BLOCKS.ci.rowIds,
  ...EXPECTED_BLOCKS.local.rowIds,
];

const REQUIRED_CAPTURE_ALIASES = [
  ...Array.from(
    { length: 11 },
    (_, index) => `CI-${String(index + 1).padStart(2, "0")}`,
  ),
  "CI-12-setup",
  "CI-13",
  "CI-14-setup",
  "CI-15",
  "L-01-viz-core",
  "L-01-mcp-server",
  "L-01-root-core",
  "L-02",
  "L-03",
  "L-04",
  "L-05",
  "L-06-diff",
  "L-07-scale",
  "L-07-soak",
  "L-08-after-governance",
  "L-08-final",
  "L-09",
];

const STATIC_ALIASES = {
  "CI-12": ["CI-12-setup", "L-07-scale"],
  "CI-14": ["CI-14-setup", "L-07-soak"],
  "L-01": ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"],
  "L-07": [
    "L-01-viz-core",
    "L-01-mcp-server",
    "L-01-root-core",
    "L-07-scale",
    "L-07-soak",
  ],
  "L-08": ["L-08-after-governance", "L-08-final"],
};

const CHROMATIC_PRESENCE_COMMAND =
  'if test -n "${CHROMATIC_PROJECT_TOKEN:-}"; then echo "CHROMATIC_PROJECT_TOKEN=present"; else echo "CHROMATIC_PROJECT_TOKEN=absent"; fi';
const AQUEX_ADDRESS = "cmos://derek/aquex-mcp";
const L06_DEPLOY_COMMAND = `if test "$PWD" != "${canonicalOperationalCheckout}"; then rsync -a --delete packages/mcp-server/dist/ "${canonicalOperationalCheckout}/packages/mcp-server/dist/"; rsync -a --delete packages/mcp-bridge/dist/ "${canonicalOperationalCheckout}/packages/mcp-bridge/dist/"; fi`;
const CANONICAL_MUTATION_RECEIPTS = [
  "B-01/drop",
  "B-01/duplicate",
  "B-02",
  "B-03/foundation",
  "B-03/emission",
  "B-04",
  "B-05",
  "B-06",
  "B-07",
  "B-08",
  "B-09",
  "B-10",
  "B-11",
  "B-12/missing-tarball",
  "B-12/missing-root-export",
  "B-13/missing-dependency",
  "B-13/missing-css-export",
  "B-14",
  "B-15",
].map(
  (gatePath) =>
    `artifacts/product-reality/sprint-182/gates/${gatePath}/receipt.json`,
);
const FINAL_PACKAGE_REPORT =
  "artifacts/product-reality/sprint-182/m05/final-package-verification/package-foundations/report.json";
const SPRINT_MISSION_IDS = [
  "s182-m01",
  "s182-m01a",
  "s182-m01b",
  "s182-m02",
  "s182-m03",
  "s182-m04",
  "s182-m05",
];

const ALLOWED_SOURCE_TOKENS = new Set([
  "BASE_SHA",
  "HEAD_SHA",
  "PR_LABELS_CSV",
  "SPRINT_ID",
  "DECLARED_REHASH_PATHS",
  "AQUEX_ADDRESS",
  "ADVERTISED_MOVERS",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function isParkedStatisticalFloorFailure(contents) {
  const text = stripAnsi(contents.toString("utf8"));
  return (
    /echarts-render-soak\.s179\.spec\.ts:283(?::\d+)?/.test(text) &&
    /positiveTrendLower99/.test(text) &&
    /Test Files\s+1 failed/.test(text) &&
    /Tests\s+1 failed\s*\|\s*2 passed\s*\(3\)/.test(text)
  );
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function toRepoPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function parseArguments(argv) {
  const args = {};
  let mode = null;
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (name === "--write" || name === "--check") {
      assert(mode === null, "Supply exactly one of --write or --check.");
      mode = name.slice(2);
      continue;
    }
    assert(
      ["--base-sha", "--review-head", "--output-root", "--checklist"].includes(
        name,
      ),
      `Unexpected argument: ${name}`,
    );
    assert(!(name in args), `Duplicate argument: ${name}`);
    const value = argv[index + 1];
    assert(value && !value.startsWith("--"), `Missing value for ${name}`);
    args[name] = value;
    index += 1;
  }
  assert(mode !== null, "Supply exactly one of --write or --check.");
  assert(args["--base-sha"], "--base-sha is required.");
  assert(args["--review-head"], "--review-head is required.");
  return {
    mode,
    baseSha: args["--base-sha"],
    reviewHead: args["--review-head"],
    outputRoot: path.resolve(args["--output-root"] ?? defaultOutputRoot),
    checklistPath: path.resolve(args["--checklist"] ?? defaultChecklistPath),
  };
}

function resolveExactCommit(value, label) {
  assert(
    /^[0-9a-f]{40}$/.test(value),
    `${label} must be a full lowercase 40-hex commit SHA.`,
  );
  let resolved;
  try {
    resolved = execFileSync(
      "git",
      ["rev-parse", "--verify", `${value}^{commit}`],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
  } catch (error) {
    throw new Error(
      `${label} is not a commit available in this repository: ${value}`,
      { cause: error },
    );
  }
  assert(resolved === value, `${label} resolved to ${resolved}, not ${value}.`);
}

function countOccurrences(contents, needle) {
  let count = 0;
  let offset = 0;
  while ((offset = contents.indexOf(needle, offset)) !== -1) {
    count += 1;
    offset += needle.length;
  }
  return count;
}

function splitMarkdownRow(line) {
  const cells = [];
  let cell = "";
  let inCode = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === "`" && line[index - 1] !== "\\") inCode = !inCode;
    if (character === "|" && !inCode && line[index - 1] !== "\\") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  if (cells[0] === "") cells.shift();
  if (cells.at(-1) === "") cells.pop();
  return cells;
}

function extractBlock(checklist, blockName, spec) {
  assert(
    !checklist.includes("\r"),
    "Closeout checklist must contain LF line endings only.",
  );
  assert(
    countOccurrences(checklist, spec.startMarker) === 1,
    `${blockName} start marker must occur exactly once.`,
  );
  assert(
    countOccurrences(checklist, spec.endMarker) === 1,
    `${blockName} end marker must occur exactly once.`,
  );
  const markerStart = checklist.indexOf(spec.startMarker);
  const contentStart = checklist.indexOf("\n", markerStart);
  const markerEnd = checklist.indexOf(spec.endMarker, contentStart + 1);
  assert(
    contentStart !== -1 && markerEnd !== -1,
    `Unable to extract ${blockName} source block.`,
  );
  const contents = checklist.slice(contentStart + 1, markerEnd);
  assert(
    contents.endsWith("\n"),
    `${blockName} source block must retain one final LF.`,
  );
  assert(
    !contents.endsWith("\n\n"),
    `${blockName} source block must have exactly one final LF.`,
  );
  const digest = sha256(contents);
  assert(
    digest === spec.sha256,
    `${blockName} source block SHA-256 ${digest} does not match locked ${spec.sha256}.`,
  );

  const rows = contents
    .split("\n")
    .filter((line) => /^\| (?:CI|L)-\d{2} \|/.test(line))
    .map((line, index) => {
      const cells = splitMarkdownRow(line);
      assert(
        cells.length === 4,
        `${blockName} row ${index + 1} must contain exactly four cells.`,
      );
      return {
        id: cells[0],
        label: cells[1].replaceAll("`", ""),
        sourceDisposition: cells[2],
        invocationCell: cells[3],
        sourceRowSha256: sha256(`${line}\n`),
        sourceInvocationSha256: sha256(`${cells[3]}\n`),
      };
    });
  const rowIds = rows.map((row) => row.id);
  assert(
    JSON.stringify(rowIds) === JSON.stringify(spec.rowIds),
    `${blockName} source rows must be exactly ${spec.rowIds.join(", ")}; received ${rowIds.join(", ")}.`,
  );
  return { contents, digest, rows };
}

function inlineCodeSpans(value) {
  return [...value.matchAll(/`([^`]*)`/g)].map((match) => match[1]);
}

function looksLikeCommand(value) {
  return /^(?:pnpm(?:\s|$)|node\s|python3\s|portable_[a-z_]+=|\(cd\s|cmp\s|tar\s|test\s|find\s|rg\s|git\s|sqlite3\s|curl\s|for\s|while\s|PR_LABELS=|shasum\s)/.test(
    value,
  );
}

function extractCommandTemplates(row) {
  if (row.id === "CI-10") return [];
  if (row.id === "L-06" || row.id === "L-07") {
    return inlineCodeSpans(row.invocationCell).filter(looksLikeCommand);
  }
  const commands = [];
  for (const segment of row.invocationCell.split("<br>")) {
    const command = inlineCodeSpans(segment).find(looksLikeCommand);
    if (command) commands.push(command);
  }
  return commands;
}

function assertNoUnresolvedTokens(value, label) {
  const serialized =
    typeof value === "string"
      ? value
      : JSON.stringify(value, (key, item) =>
          key === "pastedOutput" ? undefined : item,
        );
  for (const token of ALLOWED_SOURCE_TOKENS) {
    assert(
      !serialized.includes(`{${token}}`),
      `${label} retains unresolved token {${token}}.`,
    );
  }
  const genericToken = serialized.match(/(?<!\$)\{[A-Z][A-Z0-9_]*\}/);
  assert(
    !genericToken,
    `${label} retains unresolved token ${genericToken?.[0]}.`,
  );
}

function instantiateTemplate(template, replacements) {
  const instantiated = template.replaceAll(/\{([A-Z_]+)\}/g, (token, name) => {
    assert(
      ALLOWED_SOURCE_TOKENS.has(name),
      `Unknown checklist token ${token}.`,
    );
    assert(
      name in replacements,
      `No literal replacement supplied for ${token}.`,
    );
    return replacements[name];
  });
  assertNoUnresolvedTokens(instantiated, "Instantiated checklist command");
  return instantiated;
}

function readJson(filePath, label) {
  assert(fs.existsSync(filePath), `Missing ${label}: ${toRepoPath(filePath)}`);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${toRepoPath(filePath)}`, {
      cause: error,
    });
  }
}

function walkRegularFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareCodePoint(left.name, right.name))) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      else {
        assert(
          entry.isFile(),
          `Evidence tree contains a non-regular entry: ${toRepoPath(absolutePath)}`,
        );
        files.push(path.relative(root, absolutePath).split(path.sep).join("/"));
      }
    }
  };
  visit(root);
  return files;
}

function relativeEvidencePath(filePath) {
  return toRepoPath(filePath);
}

function validateTimestamp(value, label) {
  assert(
    typeof value === "string",
    `${label} must be an ISO timestamp string.`,
  );
  const parsed = new Date(value);
  assert(
    !Number.isNaN(parsed.valueOf()),
    `${label} is not a valid timestamp: ${value}`,
  );
  assert(
    parsed.toISOString() === value,
    `${label} must use canonical UTC ISO form: ${value}`,
  );
  return parsed.valueOf();
}

function resultPathFor(outputRoot, alias) {
  return path.join(outputRoot, "gate-results", `${alias.toLowerCase()}.json`);
}

function validateCapture(alias, outputRoot, baseSha, reviewHead) {
  const resultPath = resultPathFor(outputRoot, alias);
  const raw = readJson(resultPath, `${alias} command result`);
  assert(
    raw.schemaVersion === "1.0.0",
    `${alias} has an unsupported schemaVersion.`,
  );
  assert(
    raw.missionId === "s182-m05",
    `${alias} has missionId ${raw.missionId}.`,
  );
  assert(
    raw.rowId === alias,
    `${alias} command result identifies row ${raw.rowId}.`,
  );
  assert(
    raw.evidenceId === `s182-m05-${alias.toLowerCase()}`,
    `${alias} evidenceId is inconsistent.`,
  );
  assert(
    raw.baseSha === baseSha,
    `${alias} baseSha does not match --base-sha.`,
  );
  assert(
    raw.reviewHead === reviewHead,
    `${alias} reviewHead does not match --review-head.`,
  );
  assert(
    /^[0-9a-f]{40}$/.test(raw.measuredHead),
    `${alias} measuredHead must be a full lowercase 40-hex commit SHA.`,
  );
  assert(
    typeof raw.headMismatchAllowed === "boolean",
    `${alias} headMismatchAllowed must be boolean.`,
  );
  assert(
    typeof raw.detachedHead === "boolean",
    `${alias} detachedHead must be boolean.`,
  );
  if (alias === "L-04") {
    assert(
      raw.headMismatchAllowed === true,
      "L-04 must explicitly allow its operational-checkout HEAD mismatch.",
    );
  } else {
    assert(
      raw.headMismatchAllowed === false,
      `${alias} may not allow a measured HEAD mismatch.`,
    );
    assert(
      raw.measuredHead === reviewHead,
      `${alias} measuredHead does not equal the review HEAD.`,
    );
    assert(raw.detachedHead, `${alias} did not run from detached HEAD.`);
  }
  assert(
    typeof raw.cwd === "string" && path.isAbsolute(raw.cwd),
    `${alias} cwd must be absolute.`,
  );
  if (alias === "L-04") {
    assert(
      path.resolve(raw.cwd) === canonicalOperationalCheckout,
      `L-04 must run from the canonical operational checkout ${canonicalOperationalCheckout}.`,
    );
  } else {
    assert(
      path.resolve(raw.cwd) !== canonicalOperationalCheckout,
      `${alias} must run from the isolated review checkout, not the canonical operational checkout.`,
    );
  }
  assert(
    raw.environment &&
      typeof raw.environment === "object" &&
      !Array.isArray(raw.environment),
    `${alias} environment is missing.`,
  );
  assert(
    JSON.stringify(Object.keys(raw.environment).sort(compareCodePoint)) ===
      JSON.stringify([
        "CHROMATIC_PROJECT_TOKEN",
        "PR_LABELS",
        "TOKEN_GOV_BASE_REF",
      ]),
    `${alias} environment keys do not match the capture interface.`,
  );
  assert(
    typeof raw.environment.PR_LABELS === "string",
    `${alias} PR_LABELS must be literal.`,
  );
  assert(
    raw.environment.TOKEN_GOV_BASE_REF === (alias === "CI-08" ? baseSha : null),
    `${alias} TOKEN_GOV_BASE_REF is inconsistent.`,
  );
  assert(
    raw.environment.CHROMATIC_PROJECT_TOKEN ===
      (alias === "CI-10" ? raw.environment.CHROMATIC_PROJECT_TOKEN : null),
    `${alias} CHROMATIC_PROJECT_TOKEN disclosure is inconsistent.`,
  );
  if (alias === "CI-10") {
    assert(
      ["present", "absent"].includes(raw.environment.CHROMATIC_PROJECT_TOKEN),
      "CI-10 must disclose CHROMATIC_PROJECT_TOKEN as present or absent.",
    );
  }
  assert(
    Array.isArray(raw.literalCommands) && raw.literalCommands.length > 0,
    `${alias} literalCommands are missing.`,
  );
  assert(
    raw.literalCommands.every(
      (command) => typeof command === "string" && command.length > 0,
    ),
    `${alias} contains an empty command.`,
  );
  assert(
    raw.literalCommand === raw.literalCommands.join(" && "),
    `${alias} literalCommand does not match literalCommands.`,
  );
  assert(
    Array.isArray(raw.executionCommands) && raw.executionCommands.length > 0,
    `${alias} executionCommands are missing.`,
  );
  const expectedExecution = expectedExecutionCommands(
    alias,
    raw.literalCommands,
  );
  assert(
    JSON.stringify(raw.executionCommands) === JSON.stringify(expectedExecution),
    `${alias} executionCommands do not preserve the locked command semantics.`,
  );
  assert(
    raw.executedCommand === raw.executionCommands.join(" && "),
    `${alias} executedCommand does not match executionCommands.`,
  );
  assertNoUnresolvedTokens(raw.literalCommands, `${alias} literalCommands`);
  assertNoUnresolvedTokens(raw.executionCommands, `${alias} executionCommands`);
  assertNoUnresolvedTokens(raw.environment, `${alias} environment`);

  const startedMs = validateTimestamp(raw.startedAt, `${alias} startedAt`);
  const endedMs = validateTimestamp(raw.endedAt, `${alias} endedAt`);
  assert(endedMs >= startedMs, `${alias} ended before it started.`);
  assert(
    Number.isInteger(raw.exitCode),
    `${alias} exitCode must be an integer.`,
  );
  const allowedParkedFailure =
    alias === "L-07-soak" &&
    raw.exitCode !== 0 &&
    raw.status === "parked-failure";
  assert(
    (raw.exitCode === 0 && raw.status === "pass") || allowedParkedFailure,
    `${alias} is not admissible evidence: exit=${raw.exitCode}, status=${raw.status}.`,
  );

  assert(
    raw.log && typeof raw.log === "object" && !Array.isArray(raw.log),
    `${alias} log metadata is missing.`,
  );
  assert(
    typeof raw.log.path === "string" && raw.log.path.length > 0,
    `${alias} log path is missing.`,
  );
  assert(
    Number.isInteger(raw.log.bytes) && raw.log.bytes >= 0,
    `${alias} log byte count is invalid.`,
  );
  assert(
    /^[0-9a-f]{64}$/.test(raw.log.sha256),
    `${alias} log SHA-256 is invalid.`,
  );
  const expectedLogName = `${raw.evidenceId}.log`;
  assert(
    path.basename(raw.log.path) === expectedLogName,
    `${alias} log name does not match its evidenceId.`,
  );
  const logPath = path.resolve(repositoryRoot, raw.log.path);
  const expectedLogPath = path.join(outputRoot, "logs", expectedLogName);
  assert(
    logPath === expectedLogPath,
    `${alias} log path is outside its canonical output directory.`,
  );
  assert(fs.existsSync(logPath), `${alias} log is missing: ${raw.log.path}`);
  const logContents = fs.readFileSync(logPath);
  assert(
    logContents.byteLength === raw.log.bytes,
    `${alias} log byte count does not match its file.`,
  );
  assert(
    sha256(logContents) === raw.log.sha256,
    `${alias} log SHA-256 does not match its file.`,
  );
  if (allowedParkedFailure) {
    assert(
      isParkedStatisticalFloorFailure(logContents),
      "L-07-soak parked failure is not the named one-sided 99% statistical-floor failure.",
    );
  }

  assert(
    Array.isArray(raw.gitStatusBefore),
    `${alias} gitStatusBefore must be an array.`,
  );
  assert(
    Array.isArray(raw.gitStatusAfter),
    `${alias} gitStatusAfter must be an array.`,
  );
  assert(
    raw.gitStatusBefore.every((entry) => typeof entry === "string"),
    `${alias} gitStatusBefore contains a non-string entry.`,
  );
  assert(
    raw.gitStatusAfter.every((entry) => typeof entry === "string"),
    `${alias} gitStatusAfter contains a non-string entry.`,
  );

  const sideEffects = raw.sideEffects ?? [];
  assert(
    Array.isArray(sideEffects),
    `${alias} sideEffects must be an array when present.`,
  );
  const validatedSideEffects = sideEffects.map((sideEffect, index) => {
    assert(
      sideEffect &&
        typeof sideEffect === "object" &&
        !Array.isArray(sideEffect),
      `${alias} sideEffects[${index}] must be an object.`,
    );
    assert(
      typeof sideEffect.sourcePath === "string" &&
        sideEffect.sourcePath.length > 0 &&
        !path.isAbsolute(sideEffect.sourcePath) &&
        !sideEffect.sourcePath.split("/").includes(".."),
      `${alias} sideEffects[${index}].sourcePath must be a repository-relative path.`,
    );
    assert(
      typeof sideEffect.capturedPath === "string" &&
        sideEffect.capturedPath.length > 0,
      `${alias} sideEffects[${index}].capturedPath is missing.`,
    );
    assert(
      Number.isInteger(sideEffect.bytes) && sideEffect.bytes >= 0,
      `${alias} sideEffects[${index}].bytes is invalid.`,
    );
    assert(
      /^[0-9a-f]{64}$/.test(sideEffect.sha256),
      `${alias} sideEffects[${index}].sha256 is invalid.`,
    );
    const capturedPath = path.resolve(repositoryRoot, sideEffect.capturedPath);
    const expectedCapturedPath = path.join(
      outputRoot,
      "gate-side-effects",
      alias.toLowerCase(),
      sideEffect.sourcePath,
    );
    assert(
      capturedPath === expectedCapturedPath,
      `${alias} side effect ${sideEffect.sourcePath} is outside its canonical capture path.`,
    );
    assert(
      fs.existsSync(capturedPath),
      `${alias} side effect capture is missing: ${sideEffect.capturedPath}`,
    );
    const contents = fs.readFileSync(capturedPath);
    assert(
      contents.byteLength === sideEffect.bytes,
      `${alias} side effect byte count does not match ${sideEffect.capturedPath}.`,
    );
    assert(
      sha256(contents) === sideEffect.sha256,
      `${alias} side effect SHA-256 does not match ${sideEffect.capturedPath}.`,
    );
    return {
      sourcePath: sideEffect.sourcePath,
      capturedPath: sideEffect.capturedPath,
      bytes: sideEffect.bytes,
      sha256: sideEffect.sha256,
    };
  });
  const expectedSideEffectPaths = EXPECTED_SIDE_EFFECTS[alias] ?? [];
  assert(
    JSON.stringify(validatedSideEffects.map((entry) => entry.sourcePath)) ===
      JSON.stringify(expectedSideEffectPaths),
    `${alias} side-effect set is inconsistent; expected ${expectedSideEffectPaths.join(", ") || "none"}.`,
  );

  return {
    evidenceId: raw.evidenceId,
    capturedRowId: alias,
    resultPath: relativeEvidencePath(resultPath),
    baseSha: raw.baseSha,
    reviewHead: raw.reviewHead,
    measuredHead: raw.measuredHead,
    headMismatchAllowed: raw.headMismatchAllowed,
    detachedHead: raw.detachedHead,
    cwd: raw.cwd,
    environment: {
      PR_LABELS: raw.environment.PR_LABELS,
      TOKEN_GOV_BASE_REF: raw.environment.TOKEN_GOV_BASE_REF,
      CHROMATIC_PROJECT_TOKEN: raw.environment.CHROMATIC_PROJECT_TOKEN,
    },
    literalCommands: raw.literalCommands,
    literalCommand: raw.literalCommand,
    executionCommands: raw.executionCommands,
    executedCommand: raw.executedCommand,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt,
    durationMs: endedMs - startedMs,
    exitCode: raw.exitCode,
    captureStatus: raw.status,
    log: {
      path: raw.log.path,
      bytes: raw.log.bytes,
      sha256: raw.log.sha256,
    },
    gitStatusBefore: raw.gitStatusBefore,
    gitStatusAfter: raw.gitStatusAfter,
    sideEffects: validatedSideEffects,
    _startedMs: startedMs,
    _endedMs: endedMs,
    _logContents: logContents,
  };
}

function publicExecution(capture) {
  const {
    _startedMs: ignoredStartedMs,
    _endedMs: ignoredEndedMs,
    _logContents: logContents,
    ...execution
  } = capture;
  return { ...execution, pastedOutput: logContents.toString("utf8") };
}

function assertCommands(actual, expected, label) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} literal commands differ from the locked checklist row.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`,
  );
}

function expectedExecutionCommands(alias, literalCommands) {
  if (alias !== "L-09") return literalCommands;
  assert(
    literalCommands.length === 2,
    "L-09 requires exactly two locked literal commands.",
  );
  const unsafeFragment =
    'git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?;';
  const safeFragment =
    'set +e; git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; set -e;';
  assert(
    literalCommands[1].includes(unsafeFragment),
    "L-09 locked scan command no longer matches its safety seam.",
  );
  return [
    literalCommands[0],
    "git ls-files --others --exclude-standard >/dev/null",
    literalCommands[1].replace(unsafeFragment, safeFragment),
  ];
}

function assertOrdered(captures, aliases, label) {
  for (let index = 1; index < aliases.length; index += 1) {
    const previous = captures.get(aliases[index - 1]);
    const current = captures.get(aliases[index]);
    assert(
      current._startedMs >= previous._endedMs,
      `${label} is not sequential: ${current.capturedRowId} started before ${previous.capturedRowId} ended.`,
    );
  }
}

function parseHealthProbe(capture) {
  let health;
  try {
    health = JSON.parse(capture._logContents.toString("utf8").trim());
  } catch (error) {
    throw new Error("L-05 live probe log is not a JSON health response.", {
      cause: error,
    });
  }
  assert(
    health.status === "ok",
    `L-05 live probe status is ${health.status}, not ok.`,
  );
  assert(
    health.bridge === "ready",
    `L-05 live probe bridge is ${health.bridge}, not ready.`,
  );
  assert(
    Number.isInteger(health.toolset?.enabledCount),
    "L-05 live probe omits toolset.enabledCount.",
  );
  return {
    status: health.status,
    bridge: health.bridge,
    enabledCount: health.toolset.enabledCount,
    registrySource: health.toolset.registrySource ?? null,
  };
}

function parseDecisionCounts(capture) {
  const lines = capture._logContents
    .toString("utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  assert(lines.length >= 3, "L-04 decision-count output is incomplete.");
  assert(
    /^mission_id\s+decision_count$/.test(lines[0].trim()),
    "L-04 decision-count header is not canonical.",
  );
  assert(/^-+\s+-+$/.test(lines[1].trim()), "L-04 separator is missing.");
  const rows = lines.slice(2).map((line) => {
    const match = line.trim().match(/^(\S+)\s+(\d+)$/);
    assert(match, `L-04 contains an unparsable row: ${line}`);
    return { missionId: match[1], decisionCount: Number(match[2]) };
  });
  assert(
    JSON.stringify(rows.map((row) => row.missionId)) ===
      JSON.stringify(SPRINT_MISSION_IDS),
    `L-04 mission set is inconsistent: ${rows.map((row) => row.missionId).join(", ")}`,
  );
  assert(
    rows.every(
      (row) => Number.isInteger(row.decisionCount) && row.decisionCount >= 1,
    ),
    "L-04 found a non-descoped mission with decisionCount < 1.",
  );
  return rows;
}

function parseVitestSummary(capture, label) {
  const lines = stripAnsi(capture._logContents.toString("utf8")).split(/\r?\n/);
  const parseLine = (prefix) => {
    const matches = lines.filter((line) =>
      new RegExp(`^\\s*${prefix}\\s+`).test(line),
    );
    assert(
      matches.length === 1,
      `${label} has ${matches.length} ${prefix} summaries.`,
    );
    const line = matches[0];
    const totalMatch = line.match(/\((\d+)\)\s*$/);
    assert(totalMatch, `${label} ${prefix} summary has no total: ${line}`);
    const count = (status) =>
      Number(line.match(new RegExp(`(\\d+)\\s+${status}`))?.[1] ?? 0);
    const summary = {
      passed: count("passed"),
      failed: count("failed"),
      skipped: count("skipped"),
      todo: count("todo"),
      total: Number(totalMatch[1]),
    };
    assert(
      summary.passed + summary.failed + summary.skipped + summary.todo ===
        summary.total,
      `${label} ${prefix} counts do not add to ${summary.total}.`,
    );
    return summary;
  };
  const summary = {
    files: parseLine("Test Files"),
    tests: parseLine("Tests"),
  };
  assert(
    summary.files.failed === 0 && summary.tests.failed === 0,
    `${label} includes failed files or tests.`,
  );
  return summary;
}

function validateSuiteCountShape(value, label, allowNegative = false) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object.`,
  );
  assert(
    JSON.stringify(Object.keys(value).sort(compareCodePoint)) ===
      JSON.stringify(["files", "tests"]),
    `${label} must contain exactly files and tests.`,
  );
  for (const group of ["files", "tests"]) {
    const counts = value[group];
    assert(
      counts && typeof counts === "object" && !Array.isArray(counts),
      `${label}.${group} must be an object.`,
    );
    assert(
      JSON.stringify(Object.keys(counts).sort(compareCodePoint)) ===
        JSON.stringify(["failed", "passed", "skipped", "todo", "total"]),
      `${label}.${group} has an invalid field set.`,
    );
    for (const field of ["passed", "failed", "skipped", "todo", "total"]) {
      assert(
        Number.isInteger(counts[field]) &&
          (allowNegative || counts[field] >= 0),
        `${label}.${group}.${field} is invalid.`,
      );
    }
    assert(
      counts.passed + counts.failed + counts.skipped + counts.todo ===
        counts.total,
      `${label}.${group} status counts do not add to total.`,
    );
  }
}

function parseSnapshotCensus(capture) {
  const lines = capture._logContents.toString("utf8").split(/\r?\n/);
  const files = [
    ...new Set(
      lines
        .filter((line) => /^\.\/.+\.snap$/.test(line))
        .map((line) => line.slice(2)),
    ),
  ].sort(compareCodePoint);
  const entries = lines
    .map((line) => line.match(/^(.+\.snap):(\d+):exports\[/))
    .filter(Boolean)
    .map((match) => ({ path: match[1], line: Number(match[2]) }));
  const movers = lines.filter((line) =>
    /^(?:[ MADRCU?!]{2})\s+.+\.snap$/.test(line),
  );
  assert(files.length > 0, "L-02 snapshot census found no snapshot files.");
  assert(entries.length > 0, "L-02 snapshot census found no snapshot entries.");
  assert(
    entries.every((entry) => files.includes(entry.path)),
    "L-02 found an entry whose snapshot file is absent from the census.",
  );
  assert(
    movers.every((line) =>
      files.includes(line.replace(/^(?:[ MADRCU?!]{2})\s+/, "")),
    ),
    "L-02 reports a snapshot mover outside the snapshot census.",
  );
  return {
    fileCount: files.length,
    entryCount: entries.length,
    files,
    entries,
    movers,
  };
}

function loadFinalPackageVerification(outputRoot, baseSha, reviewHead) {
  const captureRoot = path.join(outputRoot, "package-verification-capture");
  const capture = validateCapture(
    "M05-package-verification",
    captureRoot,
    baseSha,
    reviewHead,
  );
  const expectedResult = "m05-package-verification.json";
  const expectedLog = "s182-m05-m05-package-verification.log";
  assert(
    JSON.stringify(fs.readdirSync(path.join(captureRoot, "gate-results"))) ===
      JSON.stringify([expectedResult]),
    "Final package-verification capture has a non-canonical result set.",
  );
  assert(
    JSON.stringify(fs.readdirSync(path.join(captureRoot, "logs"))) ===
      JSON.stringify([expectedLog]),
    "Final package-verification capture has a non-canonical log set.",
  );
  const artifactRoot = path.join(outputRoot, "final-package-verification");
  assertCommands(
    capture.literalCommands,
    [
      `node scripts/product-reality/verify-package-foundations.mjs --artifact-root "${artifactRoot}"`,
    ],
    "M05-package-verification",
  );
  const reportPath = path.join(
    artifactRoot,
    "package-foundations",
    "report.json",
  );
  const report = readJson(reportPath, "final package-verification report");
  const expectedSummary = {
    selected: 4,
    passed: 4,
    failed: 0,
    skipped: 0,
    status: "passed",
  };
  assert(
    JSON.stringify(report.summary) === JSON.stringify(expectedSummary),
    "Final package-verification summary is not selected 4 / passed 4 / failed 0 / skipped 0.",
  );
  assert(
    Array.isArray(report.packages) && report.packages.length === 4,
    "Final package-verification report must contain four package records.",
  );
  for (const packageRecord of report.packages) {
    assert(
      packageRecord.passed === true &&
        packageRecord.deterministic === true &&
        Array.isArray(packageRecord.packs) &&
        packageRecord.packs.length === 2,
      `Final package verification did not produce two deterministic passing packs for ${packageRecord.expectedName}.`,
    );
    const [first, second] = packageRecord.packs;
    assert(
      first.tarballSha256 === second.tarballSha256 &&
        first.inventorySha256 === second.inventorySha256,
      `Final package verification is non-deterministic for ${packageRecord.expectedName}.`,
    );
    for (const packed of packageRecord.packs) {
      assert(
        Object.values(packed.checks ?? {}).every(
          (findings) => Array.isArray(findings) && findings.length === 0,
        ),
        `Final package verification retains findings for ${packageRecord.expectedName} run ${packed.run}.`,
      );
    }
  }
  return {
    artifactRoot: relativeEvidencePath(artifactRoot),
    report: {
      path: relativeEvidencePath(reportPath),
      bytes: fs.statSync(reportPath).size,
      sha256: sha256(fs.readFileSync(reportPath)),
      summary: report.summary,
    },
    execution: publicExecution(capture),
    _capture: capture,
  };
}

function validateArtifactReference(reference, label) {
  assert(
    reference && typeof reference === "object" && !Array.isArray(reference),
    `${label} must be an object.`,
  );
  assert(
    typeof reference.path === "string" &&
      reference.path.length > 0 &&
      !path.posix.isAbsolute(reference.path) &&
      path.posix.normalize(reference.path) === reference.path &&
      !reference.path.split("/").includes(".."),
    `${label}.path must be normalized and repository-relative.`,
  );
  const absolutePath = path.join(repositoryRoot, reference.path);
  assert(fs.existsSync(absolutePath), `${label} is missing: ${reference.path}`);
  const contents = fs.readFileSync(absolutePath);
  assert(
    reference.bytes === contents.byteLength &&
      reference.sha256 === sha256(contents),
    `${label} byte count or digest is stale.`,
  );
  return reference;
}

function loadSuiteAttribution(
  outputRoot,
  baseSha,
  reviewHead,
  captures,
  suiteCounts,
) {
  const reviewPath = path.join(outputRoot, "l01-suite-attribution.json");
  const payload = readJson(reviewPath, "L-01 suite attribution");
  assert(
    payload.schemaVersion === "1.0.0",
    "L-01 attribution schemaVersion is invalid.",
  );
  assert(
    payload.missionId === "s182-m05",
    "L-01 attribution missionId is invalid.",
  );
  assert(payload.rowId === "L-01", "L-01 attribution rowId is invalid.");
  assert(
    payload.baseSha === baseSha,
    "L-01 attribution baseSha is inconsistent.",
  );
  assert(
    payload.reviewHead === reviewHead,
    "L-01 attribution reviewHead is inconsistent.",
  );
  validateTimestamp(payload.reviewedAt, "L-01 attribution reviewedAt");
  const expectedSources = Object.entries(suiteCounts).map(([alias, counts]) => {
    const capture = captures.get(alias);
    return { evidenceId: capture.evidenceId, log: capture.log, counts };
  });
  assert(
    new Date(payload.reviewedAt).valueOf() >=
      Math.max(
        ...Object.keys(suiteCounts).map(
          (alias) => captures.get(alias)._endedMs,
        ),
      ),
    "L-01 attribution predates a captured suite.",
  );
  assert(
    JSON.stringify(payload.sourceExecutions) ===
      JSON.stringify(expectedSources),
    "L-01 attribution is not bound to the exact captured suite logs and counts.",
  );
  assert(
    Array.isArray(payload.suiteComparisons) &&
      payload.suiteComparisons.length === 3,
    "L-01 attribution must contain three suite comparisons.",
  );
  const expectedSuites = ["viz-core", "mcp-server", "root-core"];
  assert(
    JSON.stringify(payload.suiteComparisons.map((row) => row.suite)) ===
      JSON.stringify(expectedSuites),
    "L-01 suite comparisons are not in canonical order.",
  );
  for (const [index, comparison] of payload.suiteComparisons.entries()) {
    const alias = ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"][index];
    assert(
      JSON.stringify(comparison.current) === JSON.stringify(suiteCounts[alias]),
      `L-01 ${comparison.suite} current counts differ from the captured output.`,
    );
    assert(
      Array.isArray(comparison.ownerMissionIds) &&
        comparison.ownerMissionIds.length > 0 &&
        comparison.ownerMissionIds.every((missionId) =>
          SPRINT_MISSION_IDS.includes(missionId),
        ),
      `L-01 ${comparison.suite} has no valid mission owner attribution.`,
    );
    if (comparison.baseline === null) {
      assert(
        comparison.delta === null &&
          comparison.disposition === "first-comparable-closeout-capture",
        `L-01 ${comparison.suite} lacks a truthful first-capture disposition.`,
      );
    } else {
      validateSuiteCountShape(
        comparison.baseline,
        `L-01 ${comparison.suite} baseline`,
      );
      const delta = {};
      for (const group of ["files", "tests"]) {
        delta[group] = {};
        for (const field of ["passed", "failed", "skipped", "todo", "total"]) {
          delta[group][field] =
            comparison.current[group][field] -
            comparison.baseline[group][field];
        }
      }
      validateSuiteCountShape(
        comparison.delta,
        `L-01 ${comparison.suite} delta`,
        true,
      );
      assert(
        JSON.stringify(comparison.delta) === JSON.stringify(delta),
        `L-01 ${comparison.suite} delta arithmetic is inconsistent.`,
      );
    }
  }
  assert(
    Array.isArray(payload.missionAttributions) &&
      JSON.stringify(
        payload.missionAttributions.map((row) => row.missionId),
      ) === JSON.stringify(SPRINT_MISSION_IDS),
    "L-01 mission attribution set is incomplete or out of order.",
  );
  for (const mission of payload.missionAttributions) {
    assert(
      typeof mission.disposition === "string" && mission.disposition.length > 0,
      `L-01 ${mission.missionId} attribution has no disposition.`,
    );
    assert(
      Array.isArray(mission.evidence) && mission.evidence.length > 0,
      `L-01 ${mission.missionId} attribution has no evidence.`,
    );
    mission.evidence.forEach((reference, index) =>
      validateArtifactReference(
        reference,
        `L-01 ${mission.missionId} evidence[${index}]`,
      ),
    );
  }
  assert(
    Array.isArray(payload.unattributedDeltas) &&
      payload.unattributedDeltas.length === 0,
    "L-01 retains unattributed suite-count deltas.",
  );
  assert(payload.status === "pass", "L-01 attribution status is not pass.");
  return {
    path: relativeEvidencePath(reviewPath),
    bytes: fs.statSync(reviewPath).size,
    sha256: sha256(fs.readFileSync(reviewPath)),
    payload,
  };
}

function loadL09Review(
  outputRoot,
  baseSha,
  reviewHead,
  capture,
  suiteAttribution,
) {
  const reviewPath = path.join(outputRoot, "l09-review.json");
  const payload = readJson(reviewPath, "L-09 review");
  assert(
    payload.schemaVersion === "1.0.0",
    "L-09 review schemaVersion is invalid.",
  );
  assert(payload.missionId === "s182-m05", "L-09 review missionId is invalid.");
  assert(payload.rowId === "L-09", "L-09 review rowId is invalid.");
  assert(payload.baseSha === baseSha, "L-09 review baseSha is inconsistent.");
  assert(
    payload.reviewHead === reviewHead,
    "L-09 review reviewHead is inconsistent.",
  );
  const reviewedAt = validateTimestamp(payload.reviewedAt, "L-09 reviewedAt");
  assert(
    reviewedAt >= capture._endedMs,
    "L-09 review predates its captured diff.",
  );
  assert(
    JSON.stringify(payload.sourceExecution) ===
      JSON.stringify({ evidenceId: capture.evidenceId, log: capture.log }),
    "L-09 review is not bound to the exact captured diff log.",
  );
  const classifications = payload.referenceClassifications;
  assert(
    classifications &&
      typeof classifications === "object" &&
      !Array.isArray(classifications),
    "L-09 referenceClassifications are missing.",
  );
  assert(
    JSON.stringify(Object.keys(classifications).sort(compareCodePoint)) ===
      JSON.stringify([
        "historical",
        "measuredAt",
        "retainedConstraint",
        "sr22Violations",
        "testLabel",
        "total",
      ]),
    "L-09 referenceClassifications have an invalid field set.",
  );
  for (const category of [
    "historical",
    "measuredAt",
    "testLabel",
    "retainedConstraint",
  ]) {
    assert(
      Number.isInteger(classifications[category]) &&
        classifications[category] >= 0,
      `L-09 ${category} count is invalid.`,
    );
  }
  assert(
    Number.isInteger(classifications.sr22Violations) &&
      classifications.sr22Violations === 0,
    "L-09 contains an SR-22 violation.",
  );
  assert(
    Number.isInteger(classifications.total) &&
      classifications.total ===
        classifications.historical +
          classifications.measuredAt +
          classifications.testLabel +
          classifications.retainedConstraint +
          classifications.sr22Violations &&
      classifications.total > 0,
    "L-09 classification totals are incomplete.",
  );
  assert(
    Array.isArray(payload.unclassifiedReferences) &&
      payload.unclassifiedReferences.length === 0,
    "L-09 retains unclassified sprint/mission references.",
  );
  assert(
    Array.isArray(payload.forwardSprintNumberedPromises) &&
      payload.forwardSprintNumberedPromises.length === 0,
    "L-09 found forward sprint-numbered promises.",
  );
  assert(
    JSON.stringify(payload.suiteAttribution) ===
      JSON.stringify({
        path: suiteAttribution.path,
        bytes: suiteAttribution.bytes,
        sha256: suiteAttribution.sha256,
      }),
    "L-09 suite attribution reference is stale.",
  );
  assert(
    payload.reviewer?.kind === "builder-closeout-inspection" &&
      payload.reviewer.independentReview === false,
    "L-09 review must identify builder inspection without claiming independent review.",
  );
  assert(payload.status === "pass", "L-09 review status is not pass.");
  return {
    path: relativeEvidencePath(reviewPath),
    bytes: fs.statSync(reviewPath).size,
    sha256: sha256(fs.readFileSync(reviewPath)),
    payload,
  };
}

function loadReconnectEvidence(
  outputRoot,
  advertisedMovers,
  baseSha,
  reviewHead,
  expectedRequest,
  expectedLiteralInvocation,
  rebuildEndedMs,
) {
  const reconnectPath = path.join(outputRoot, "l06-reconnect.json");
  if (!fs.existsSync(reconnectPath)) {
    assert(
      advertisedMovers.length === 0,
      `L-06 advertised ${advertisedMovers.length} mover(s), but ${toRepoPath(reconnectPath)} is missing.`,
    );
    return null;
  }
  assert(
    advertisedMovers.length > 0,
    "L-06 reconnect evidence exists even though the advertised diff is empty.",
  );
  const contents = fs.readFileSync(reconnectPath);
  let payload;
  try {
    payload = JSON.parse(contents.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Invalid L-06 reconnect JSON: ${toRepoPath(reconnectPath)}`,
      { cause: error },
    );
  }
  assert(
    payload && typeof payload === "object" && !Array.isArray(payload),
    "L-06 reconnect evidence must be an object.",
  );
  assert(
    payload.schemaVersion === "1.0.0",
    "L-06 reconnect schemaVersion is invalid.",
  );
  assert(
    payload.missionId === "s182-m05",
    "L-06 reconnect missionId is invalid.",
  );
  assert(payload.rowId === "L-06", "L-06 reconnect rowId is invalid.");
  assertNoUnresolvedTokens(payload, "L-06 reconnect evidence");
  assert(
    payload.baseSha === baseSha,
    "L-06 reconnect baseSha is inconsistent.",
  );
  assert(
    payload.reviewHead === reviewHead,
    "L-06 reconnect reviewHead is inconsistent.",
  );
  assert(
    payload.headSha === reviewHead,
    "L-06 reconnect headSha is inconsistent.",
  );
  assert(
    JSON.stringify(payload.advertisedMovers) ===
      JSON.stringify(advertisedMovers),
    "L-06 reconnect advertisedMovers do not match the measured diff.",
  );
  assert(
    payload.literalInvocation === expectedLiteralInvocation,
    "L-06 reconnect literal invocation differs from the instantiated checklist template.",
  );
  assert(
    JSON.stringify(payload.request) === JSON.stringify(expectedRequest),
    "L-06 reconnect request differs from the locked target/type/summary/body.",
  );
  const directoryCheckedMs = validateTimestamp(
    payload.directoryCheckedAt,
    "L-06 directoryCheckedAt",
  );
  const sentMs = validateTimestamp(payload.sentAt, "L-06 sentAt");
  assert(
    sentMs >= directoryCheckedMs,
    "L-06 reconnect send predates its directory lookup.",
  );
  assert(
    sentMs >= rebuildEndedMs,
    "L-06 reconnect send predates the completed rebuild/restart/health sequence.",
  );
  assert(
    payload.directoryResponse &&
      typeof payload.directoryResponse === "object" &&
      !Array.isArray(payload.directoryResponse) &&
      payload.directoryResponse.isError !== true,
    "L-06 directory response is missing or reports an error.",
  );
  assert(
    JSON.stringify(payload.directoryResponse).includes(AQUEX_ADDRESS),
    `L-06 directory response does not contain ${AQUEX_ADDRESS}.`,
  );
  assert(
    typeof payload.messageId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        payload.messageId,
      ),
    "L-06 reconnect messageId is not a UUID.",
  );
  assert(
    payload.sendResponse &&
      typeof payload.sendResponse === "object" &&
      !Array.isArray(payload.sendResponse) &&
      payload.sendResponse.isError !== true,
    "L-06 send response is missing or reports an error.",
  );
  assert(
    JSON.stringify(payload.sendResponse).includes(payload.messageId),
    "L-06 send response does not contain the recorded messageId.",
  );
  return {
    path: relativeEvidencePath(reconnectPath),
    bytes: contents.byteLength,
    sha256: sha256(contents),
    payload,
  };
}

function deriveRowStatus(rowId, captures, advertisedMovers, reconnectEvidence) {
  if (rowId === "CI-10") {
    return {
      status: "structurally-non-local",
      disposition: "structurally-non-local",
    };
  }
  if (rowId === "CI-14") {
    return { status: "parked", disposition: "parked-statistical-floor" };
  }
  if (rowId === "L-05") {
    return {
      status: "pass",
      disposition: "pass-with-missing-opening-receipt-disclosed",
    };
  }
  if (
    rowId === "L-07" &&
    captures.get("L-07-soak").captureStatus === "parked-failure"
  ) {
    return { status: "pass", disposition: "pass-with-parked-soak-disclosed" };
  }
  return { status: "pass", disposition: "pass" };
}

function disclosuresFor(
  rowId,
  captures,
  advertisedMovers,
  reconnectEvidence,
  healthProbe,
) {
  const disclosures = [];
  if (rowId === "CI-07") {
    disclosures.push(
      "Live-label lookup, artifact upload, and PR comments are CI-only side effects and were not represented by the local twin.",
    );
  }
  if (rowId === "CI-08") {
    disclosures.push(
      "Label lookup and artifact upload are CI-only side effects; diagnostics.json movement remains visible in the captured before/after git statuses.",
    );
  }
  if (rowId === "CI-09") {
    disclosures.push(
      "Cache and report upload are CI-only side effects and were not represented by the local twin.",
    );
  }
  if (rowId === "CI-10") {
    const presence = captures.get("CI-10").environment.CHROMATIC_PROJECT_TOKEN;
    disclosures.push(
      `CHROMATIC_PROJECT_TOKEN was ${presence} during the safe presence probe.`,
    );
    disclosures.push(
      "Chromatic is structurally non-local: no local command or Playwright leg substitutes for chromaui/action@v1, and no local Chromatic run URL is claimed.",
    );
  }
  if (rowId === "CI-14") {
    const soak = captures.get("L-07-soak");
    disclosures.push(
      `The PK2 one-sided 99% Student-t statistical floor remains PARKED pending Linux-leg evidence; this capture recorded ${soak.captureStatus} with exit ${soak.exitCode}.`,
    );
    disclosures.push(
      "A passing local soak, if observed, does not promote the parked statistical floor to green.",
    );
  }
  if (rowId === "CI-15") {
    disclosures.push(
      "Hosted CI pins Node 24 and pnpm 9.12.2; this record preserves the local-twin operand and does not claim hosted-CI execution.",
    );
  }
  if (rowId === "L-05") {
    disclosures.push(
      "The original build-session opening-timestamp receipt is missing. This later live probe is included with its actual timestamp and is not backdated.",
    );
    disclosures.push(
      `The live probe observed status=${healthProbe.status}, bridge=${healthProbe.bridge}, and enabledCount=${healthProbe.enabledCount}.`,
    );
  }
  if (rowId === "L-04") {
    const capture = captures.get("L-04");
    disclosures.push(
      `The decision-count query ran from the canonical operational checkout ${capture.cwd}, the only checkout holding the live CMOS database.`,
    );
    disclosures.push(
      `Its measured HEAD was ${capture.measuredHead}; headMismatchAllowed=true explicitly scopes this exception to L-04 and does not treat it as review-tree evidence.`,
    );
  }
  if (rowId === "L-06") {
    if (advertisedMovers.length === 0) {
      disclosures.push(
        "NO R-d: the literal advertised-surface diff was empty, so the conditional rebuild/restart and reconnect were not run.",
      );
    } else {
      disclosures.push(
        `The advertised-surface diff named ${advertisedMovers.length} mover(s); the conditional rebuild, bridge restart, and health probe are included.`,
      );
      disclosures.push(
        `The isolated review build was deployed by the captured rsync command into the canonical PM2 runtime checkout ${canonicalOperationalCheckout} before restart.`,
      );
      disclosures.push(
        `Reconnect evidence is included from ${reconnectEvidence.path}.`,
      );
    }
  }
  if (rowId === "L-07") {
    disclosures.push(
      "The three L-01 legs, scale suite, and soak suite reuse their single captured evidence IDs and were verified to run sequentially in canonical order.",
    );
    if (captures.get("L-07-soak").captureStatus === "parked-failure") {
      disclosures.push(
        "The soak leg recorded the capture runner's explicit parked-failure disposition; it is not summarized as green.",
      );
    }
  }
  if (rowId === "L-08") {
    disclosures.push(
      "Both required probes are retained: after governance and final/run-last evidence.",
    );
  }
  return disclosures;
}

function renderMarkdown(record) {
  const lines = [
    "# Sprint 182 M05 Gate Record",
    "",
    `- Base SHA: \`${record.baseSha}\``,
    `- Review HEAD: \`${record.reviewHead}\``,
    `- Checklist: \`${record.sourceChecklist.path}\``,
    `- CI block SHA-256: \`${record.sourceChecklist.blocks.ci.sha256}\``,
    `- Local block SHA-256: \`${record.sourceChecklist.blocks.local.sha256}\``,
    `- Canonical rows: ${record.canonicalRowCount}`,
    `- Unique command-result captures: ${record.uniqueEvidenceExecutionCount}`,
    "",
    "| ID | Status | Disposition | Evidence aliases |",
    "|---|---|---|---|",
    ...record.rows.map(
      (row) =>
        `| ${row.id} | ${row.status} | ${row.disposition} | ${row.evidenceAliases.join(", ")} |`,
    ),
    "",
  ];
  const packageJson = JSON.stringify(record.finalPackageVerification, null, 2);
  const packageFence = "`".repeat(
    Math.max(
      3,
      1 +
        Math.max(
          0,
          ...[...packageJson.matchAll(/`+/g)].map((match) => match[0].length),
        ),
    ),
  );
  lines.push(
    "## Final package verification",
    "",
    `${packageFence}json`,
    packageJson,
    packageFence,
    "",
  );
  for (const row of record.rows) {
    const rowJson = JSON.stringify(row, null, 2);
    const longestBacktickRun = Math.max(
      0,
      ...[...rowJson.matchAll(/`+/g)].map((match) => match[0].length),
    );
    const fence = "`".repeat(Math.max(3, longestBacktickRun + 1));
    lines.push(`## ${row.id}`, "", `${fence}json`, rowJson, fence, "");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function buildRecord({ baseSha, reviewHead, outputRoot, checklistPath }) {
  resolveExactCommit(baseSha, "--base-sha");
  resolveExactCommit(reviewHead, "--review-head");
  assert(
    fs.existsSync(checklistPath),
    `Missing closeout checklist: ${toRepoPath(checklistPath)}`,
  );
  const checklist = fs.readFileSync(checklistPath, "utf8");
  const ciBlock = extractBlock(checklist, "CI", EXPECTED_BLOCKS.ci);
  const localBlock = extractBlock(checklist, "local", EXPECTED_BLOCKS.local);
  const sourceRows = new Map(
    [...ciBlock.rows, ...localBlock.rows].map((row) => [row.id, row]),
  );
  assert(
    sourceRows.size === 24,
    `Expected 24 unique checklist rows; received ${sourceRows.size}.`,
  );

  const captures = new Map();
  for (const alias of REQUIRED_CAPTURE_ALIASES) {
    captures.set(
      alias,
      validateCapture(alias, outputRoot, baseSha, reviewHead),
    );
  }
  const advertisedMovers = captures
    .get("L-06-diff")
    ._logContents.toString("utf8")
    .trim()
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  assert(
    new Set(advertisedMovers).size === advertisedMovers.length,
    "L-06 advertised diff contains duplicate paths.",
  );
  assert(
    JSON.stringify(advertisedMovers) ===
      JSON.stringify([...advertisedMovers].sort(compareCodePoint)),
    "L-06 advertised diff paths must be deterministically sorted.",
  );
  if (advertisedMovers.length > 0) {
    captures.set(
      "L-06-rebuild",
      validateCapture("L-06-rebuild", outputRoot, baseSha, reviewHead),
    );
  }

  const expectedResultFiles = [...captures.keys()]
    .map((alias) => `${alias.toLowerCase()}.json`)
    .sort(compareCodePoint);
  const gateResultsDirectory = path.join(outputRoot, "gate-results");
  const actualResultEntries = fs
    .readdirSync(gateResultsDirectory, { withFileTypes: true })
    .map((entry) => ({ name: entry.name, isFile: entry.isFile() }))
    .sort((left, right) => compareCodePoint(left.name, right.name));
  assert(
    actualResultEntries.every((entry) => entry.isFile),
    "Gate-result directory contains a non-file entry.",
  );
  const actualResultFiles = actualResultEntries.map((entry) => entry.name);
  assert(
    JSON.stringify(actualResultFiles) === JSON.stringify(expectedResultFiles),
    `Gate-result JSON set is inconsistent. Expected ${expectedResultFiles.join(", ")}; received ${actualResultFiles.join(", ")}.`,
  );

  const expectedLogFiles = [...captures.values()]
    .map((capture) => path.basename(capture.log.path))
    .sort(compareCodePoint);
  assert(
    new Set(expectedLogFiles).size === expectedLogFiles.length,
    "Capture results reuse a log path.",
  );
  const logsDirectory = path.join(outputRoot, "logs");
  const actualLogEntries = fs
    .readdirSync(logsDirectory, { withFileTypes: true })
    .map((entry) => ({ name: entry.name, isFile: entry.isFile() }))
    .sort((left, right) => compareCodePoint(left.name, right.name));
  assert(
    actualLogEntries.every((entry) => entry.isFile),
    "Gate log directory contains a non-file entry.",
  );
  const actualLogFiles = actualLogEntries.map((entry) => entry.name);
  assert(
    JSON.stringify(actualLogFiles) === JSON.stringify(expectedLogFiles),
    `Gate log set is inconsistent. Expected ${expectedLogFiles.join(", ")}; received ${actualLogFiles.join(", ")}.`,
  );
  const sideEffectRoot = path.join(outputRoot, "gate-side-effects");
  assert(
    fs.existsSync(sideEffectRoot),
    "Canonical gate-side-effects tree is missing.",
  );
  const expectedSideEffectFiles = [...captures.values()]
    .flatMap((capture) => capture.sideEffects)
    .map((sideEffect) =>
      path
        .relative(
          sideEffectRoot,
          path.resolve(repositoryRoot, sideEffect.capturedPath),
        )
        .split(path.sep)
        .join("/"),
    )
    .sort(compareCodePoint);
  const actualSideEffectFiles =
    walkRegularFiles(sideEffectRoot).sort(compareCodePoint);
  assert(
    JSON.stringify(actualSideEffectFiles) ===
      JSON.stringify(expectedSideEffectFiles),
    `Gate side-effect tree is inconsistent. Expected ${expectedSideEffectFiles.join(", ")}; received ${actualSideEffectFiles.join(", ")}.`,
  );

  const reviewWorkingDirectories = [
    ...new Set(
      [...captures.values()]
        .filter(
          (capture) =>
            capture.capturedRowId !== "L-04" &&
            capture.capturedRowId !== "CI-15",
        )
        .map((capture) => capture.cwd),
    ),
  ];
  assert(
    reviewWorkingDirectories.length === 1,
    `Non-L-04/CI-15 captures use inconsistent review working directories: ${reviewWorkingDirectories.join(", ")}`,
  );
  const portableTwinWorkingDirectory = captures.get("CI-15").cwd;
  assert(
    path.resolve(portableTwinWorkingDirectory) !==
      path.resolve(reviewWorkingDirectories[0]),
    "CI-15 must run from a distinct detached worktree.",
  );
  assert(
    captures.get("CI-15").gitStatusBefore.length === 0 &&
      captures.get("CI-15").gitStatusAfter.length === 0,
    "CI-15 must start and finish in a clean detached worktree.",
  );
  const finalPackageVerification = loadFinalPackageVerification(
    outputRoot,
    baseSha,
    reviewHead,
  );
  assert(
    path.resolve(finalPackageVerification._capture.cwd) ===
      path.resolve(reviewWorkingDirectories[0]),
    "Final package verification must run from the primary review worktree.",
  );
  const prLabels = [
    ...new Set(
      [...captures.values()].map((capture) => capture.environment.PR_LABELS),
    ),
  ];
  assert(
    prLabels.length === 1,
    `Captures use inconsistent PR_LABELS operands: ${prLabels.join(", ")}`,
  );

  const l03Command = captures.get("L-03").literalCommands[0];
  const rehashPrefix = "shasum -a 256 ";
  assert(
    l03Command.startsWith(rehashPrefix),
    "L-03 does not contain the canonical re-hash command.",
  );
  const declaredRehashPaths = l03Command.slice(rehashPrefix.length);
  assert(
    declaredRehashPaths.trim().length > 0,
    "L-03 has no declared re-hash paths.",
  );
  const rehashPathFile = path.join(outputRoot, "rehash-paths.txt");
  assert(
    fs.existsSync(rehashPathFile),
    "L-03 canonical rehash-paths.txt is missing.",
  );
  const rehashPathContents = fs.readFileSync(rehashPathFile, "utf8");
  assert(
    rehashPathContents.endsWith("\n") && !rehashPathContents.endsWith("\n\n"),
    "L-03 canonical rehash-paths.txt must retain exactly one final LF.",
  );
  const canonicalRehashPaths = rehashPathContents
    .trimEnd()
    .split("\n")
    .filter(Boolean);
  assert(
    canonicalRehashPaths.every(
      (repoPath) =>
        !/\s/.test(repoPath) &&
        !repoPath.includes("\\") &&
        !repoPath.startsWith("-") &&
        !path.posix.isAbsolute(repoPath) &&
        path.posix.normalize(repoPath) === repoPath &&
        !repoPath.split("/").includes(".."),
    ),
    "L-03 canonical paths must be whitespace-free, normalized repository-relative operands.",
  );
  assert(
    new Set(canonicalRehashPaths).size === canonicalRehashPaths.length,
    "L-03 canonical paths contain duplicates.",
  );
  assert(
    JSON.stringify(canonicalRehashPaths) ===
      JSON.stringify([...canonicalRehashPaths].sort(compareCodePoint)),
    "L-03 canonical paths are not code-point sorted.",
  );
  for (const requiredPath of [
    ...CANONICAL_MUTATION_RECEIPTS,
    FINAL_PACKAGE_REPORT,
  ]) {
    assert(
      canonicalRehashPaths.includes(requiredPath),
      `L-03 canonical paths omit required final evidence: ${requiredPath}`,
    );
  }
  assert(
    declaredRehashPaths === canonicalRehashPaths.join(" "),
    "L-03 command operand does not exactly match canonical rehash-paths.txt.",
  );
  const l03Capture = captures.get("L-03");
  const l03OutputLines = l03Capture._logContents
    .toString("utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  assert(
    l03OutputLines.length === canonicalRehashPaths.length,
    `L-03 produced ${l03OutputLines.length} hash rows for ${canonicalRehashPaths.length} declared paths.`,
  );
  const rehashResults = l03OutputLines.map((line, index) => {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    assert(match, `L-03 contains an invalid shasum row: ${line}`);
    const repoPath = canonicalRehashPaths[index];
    assert(
      match[2] === repoPath,
      `L-03 row ${index + 1} hashes ${match[2]}, expected ${repoPath}.`,
    );
    const absolutePath = path.join(l03Capture.cwd, repoPath);
    assert(
      fs.existsSync(absolutePath),
      `L-03 declared path is missing: ${repoPath}`,
    );
    const digest = sha256(fs.readFileSync(absolutePath));
    assert(match[1] === digest, `L-03 digest is stale for ${repoPath}.`);
    return { path: repoPath, sha256: digest };
  });
  for (const capture of captures.values()) {
    if (["L-03", "L-09", "L-08-final"].includes(capture.capturedRowId))
      continue;
    assert(
      l03Capture._startedMs >= capture._endedMs,
      `L-03 was not captured after ${capture.capturedRowId}.`,
    );
  }
  assert(
    l03Capture._startedMs >= finalPackageVerification._capture._endedMs,
    "L-03 was captured before final package verification completed.",
  );
  const replacements = {
    BASE_SHA: baseSha,
    HEAD_SHA: reviewHead,
    PR_LABELS_CSV: prLabels[0],
    SPRINT_ID: "sprint-182",
    DECLARED_REHASH_PATHS: declaredRehashPaths,
    AQUEX_ADDRESS,
    ADVERTISED_MOVERS: advertisedMovers.join(", "),
  };
  const l06MessageTemplates = inlineCodeSpans(
    sourceRows.get("L-06").invocationCell,
  ).filter((span) => span.startsWith("cmos_message("));
  assert(
    l06MessageTemplates.length === 1,
    `L-06 must contain exactly one reconnect-message template; received ${l06MessageTemplates.length}.`,
  );
  const expectedReconnectRequest = {
    action: "send",
    targetAddress: AQUEX_ADDRESS,
    type: "info_push",
    summary: `Forge advertised surface changed at ${reviewHead}; reconnect required`,
    body: `Reconnect to Forge and refresh schemas. Advertised movers: ${advertisedMovers.join(", ")}.`,
  };
  const expectedReconnectInvocation = instantiateTemplate(
    l06MessageTemplates[0],
    replacements,
  );

  const aliasesFor = (rowId) => {
    if (rowId === "L-06") {
      return advertisedMovers.length > 0
        ? ["L-06-diff", "L-06-rebuild"]
        : ["L-06-diff"];
    }
    if (STATIC_ALIASES[rowId]) return STATIC_ALIASES[rowId];
    return [rowId];
  };

  for (const rowId of CANONICAL_ROW_IDS) {
    const sourceRow = sourceRows.get(rowId);
    const templates = extractCommandTemplates(sourceRow);
    const expected = templates.map((template) =>
      instantiateTemplate(template, replacements),
    );
    const aliases = aliasesFor(rowId);
    const actual = aliases.flatMap(
      (alias) => captures.get(alias).literalCommands,
    );
    if (rowId === "CI-10") {
      assertCommands(actual, [CHROMATIC_PRESENCE_COMMAND], rowId);
    } else if (rowId === "L-06") {
      assertCommands(
        captures.get("L-06-diff").literalCommands,
        [expected[0]],
        `${rowId} diff`,
      );
      if (advertisedMovers.length > 0) {
        assert(
          expected.length === 2,
          "L-06 source row must contain diff and conditional rebuild templates.",
        );
        const rebuildCapture = captures.get("L-06-rebuild");
        assert(
          rebuildCapture.literalCommands.length === 5,
          "L-06 rebuild must contain the four locked commands plus one deployment command.",
        );
        assert(
          rebuildCapture.literalCommands.filter((command) =>
            command.includes("rsync"),
          ).length === 1,
          "L-06 rebuild must contain exactly one literal rsync deployment command.",
        );
        assert(
          rebuildCapture.literalCommands[2] === L06_DEPLOY_COMMAND,
          `L-06 deployment must copy both review dists into ${canonicalOperationalCheckout}.`,
        );
        const lockedCoreCommands = [
          rebuildCapture.literalCommands[0],
          rebuildCapture.literalCommands[1],
          rebuildCapture.literalCommands[3],
          rebuildCapture.literalCommands[4],
        ];
        assert(
          lockedCoreCommands.join(" && ") === expected[1],
          "L-06 locked build/restart/health sequence differs from the checklist row.",
        );
      }
    } else if (rowId === "L-08") {
      assert(
        expected.length === 1,
        "L-08 source row must contain one literal probe command.",
      );
      for (const alias of aliases)
        assertCommands(
          captures.get(alias).literalCommands,
          expected,
          `${rowId}/${alias}`,
        );
    } else {
      assertCommands(actual, expected, rowId);
    }
  }

  const heavyAliases = STATIC_ALIASES["L-07"];
  assertOrdered(captures, heavyAliases, "L-07 heavy-suite protocol");
  assertOrdered(captures, ["CI-12-setup", "L-07-scale"], "CI-12 aggregate");
  assertOrdered(captures, ["CI-14-setup", "L-07-soak"], "CI-14 aggregate");
  assertOrdered(
    captures,
    ["L-08-after-governance", "L-08-final"],
    "L-08 probes",
  );
  assert(
    captures.get("L-08-after-governance")._startedMs >=
      captures.get("CI-07")._endedMs &&
      captures.get("L-08-after-governance")._startedMs >=
        captures.get("CI-08")._endedMs,
    "L-08-after-governance was captured before the governance rows completed.",
  );
  const finalBuildInputProbe = captures.get("L-08-final");
  for (const capture of captures.values()) {
    if (capture.capturedRowId === "L-08-final") continue;
    assert(
      finalBuildInputProbe._startedMs >= capture._endedMs,
      `L-08-final was not run last; ${capture.capturedRowId} ended afterward.`,
    );
  }
  assert(
    finalBuildInputProbe._startedMs >=
      finalPackageVerification._capture._endedMs,
    "L-08-final was not run after final package verification.",
  );

  const chromaticCapture = captures.get("CI-10");
  assert(
    chromaticCapture._logContents.toString("utf8").trim() ===
      `CHROMATIC_PROJECT_TOKEN=${chromaticCapture.environment.CHROMATIC_PROJECT_TOKEN}`,
    "CI-10 log does not match its token-presence disclosure.",
  );
  const healthProbe = parseHealthProbe(captures.get("L-05"));
  const decisionCounts = parseDecisionCounts(captures.get("L-04"));
  const suiteCounts = Object.fromEntries(
    ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"].map((alias) => [
      alias,
      parseVitestSummary(captures.get(alias), alias),
    ]),
  );
  const snapshotCensus = parseSnapshotCensus(captures.get("L-02"));
  const suiteAttribution = loadSuiteAttribution(
    outputRoot,
    baseSha,
    reviewHead,
    captures,
    suiteCounts,
  );
  const l09Review = loadL09Review(
    outputRoot,
    baseSha,
    reviewHead,
    captures.get("L-09"),
    suiteAttribution,
  );
  const reconnectEvidence = loadReconnectEvidence(
    outputRoot,
    advertisedMovers,
    baseSha,
    reviewHead,
    expectedReconnectRequest,
    expectedReconnectInvocation,
    advertisedMovers.length > 0
      ? captures.get("L-06-rebuild")._endedMs
      : Number.NEGATIVE_INFINITY,
  );

  const rows = CANONICAL_ROW_IDS.map((rowId) => {
    const sourceRow = sourceRows.get(rowId);
    const evidenceAliases = aliasesFor(rowId);
    const rowCaptures = evidenceAliases.map((alias) => captures.get(alias));
    const rowCwds = [...new Set(rowCaptures.map((capture) => capture.cwd))];
    const rowMeasuredHeads = [
      ...new Set(rowCaptures.map((capture) => capture.measuredHead)),
    ];
    const { status, disposition } = deriveRowStatus(
      rowId,
      captures,
      advertisedMovers,
      reconnectEvidence,
    );
    const source = {
      block: rowId.startsWith("CI-") ? "ci" : "local",
      label: sourceRow.label,
      disposition: sourceRow.sourceDisposition,
      sourceRowSha256: sourceRow.sourceRowSha256,
      sourceInvocationSha256: sourceRow.sourceInvocationSha256,
    };
    const row = {
      id: rowId,
      source,
      status,
      disposition,
      evidenceAliases,
      measuredHead: rowMeasuredHeads.length === 1 ? rowMeasuredHeads[0] : null,
      measuredHeads: rowMeasuredHeads,
      cwd: rowCwds.length === 1 ? rowCwds[0] : null,
      cwds: rowCwds,
      startedAt: rowCaptures.reduce(
        (earliest, capture) =>
          capture.startedAt < earliest ? capture.startedAt : earliest,
        rowCaptures[0].startedAt,
      ),
      endedAt: rowCaptures.reduce(
        (latest, capture) =>
          capture.endedAt > latest ? capture.endedAt : latest,
        rowCaptures[0].endedAt,
      ),
      exitCodes: rowCaptures.map((capture) => capture.exitCode),
      literalCommands: rowCaptures.flatMap(
        (capture) => capture.literalCommands,
      ),
      environmentOperands: rowCaptures.map((capture) => ({
        evidenceId: capture.evidenceId,
        ...capture.environment,
      })),
      logs: rowCaptures.map((capture) => capture.log),
      sideEffects: rowCaptures.flatMap((capture) => capture.sideEffects),
      gitStatuses: rowCaptures.map((capture) => ({
        evidenceId: capture.evidenceId,
        before: capture.gitStatusBefore,
        after: capture.gitStatusAfter,
      })),
      disclosures: disclosuresFor(
        rowId,
        captures,
        advertisedMovers,
        reconnectEvidence,
        healthProbe,
      ),
      executions: rowCaptures.map(publicExecution),
    };
    if (rowId === "L-05") row.observations = { liveHealthProbe: healthProbe };
    if (rowId === "L-04") row.observations = { decisionCounts };
    if (rowId === "L-03") row.observations = { rehashResults };
    if (rowId === "L-01") {
      row.observations = {
        suiteCounts,
        attribution: suiteAttribution,
      };
    }
    if (rowId === "L-02") row.observations = { snapshotCensus };
    if (rowId === "L-09") row.observations = { review: l09Review };
    if (rowId === "L-06") {
      row.observations = {
        advertisedMovers,
        conditionalRebuildExecuted: advertisedMovers.length > 0,
        reconnectEvidence,
      };
    }
    return row;
  });

  assert(
    rows.length === 24,
    `Gate record must contain exactly 24 rows; received ${rows.length}.`,
  );
  assert(
    new Set(rows.map((row) => row.id)).size === 24,
    "Gate record row IDs are not unique.",
  );
  assert(
    JSON.stringify(rows.map((row) => row.id)) ===
      JSON.stringify(CANONICAL_ROW_IDS),
    "Gate record rows are not in canonical CI-01..CI-15/L-01..L-09 order.",
  );

  const statusCounts = rows.reduce((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, {});
  const record = {
    schemaVersion: "1.0.0",
    kind: "sprint-closeout-gate-record",
    missionId: "s182-m05",
    baseSha,
    reviewHead,
    reviewWorkingDirectory: reviewWorkingDirectories[0],
    portableTwinWorkingDirectory,
    canonicalOperationalCheckout,
    finalPackageVerification: {
      artifactRoot: finalPackageVerification.artifactRoot,
      report: finalPackageVerification.report,
      execution: finalPackageVerification.execution,
    },
    sourceChecklist: {
      path: relativeEvidencePath(checklistPath),
      extractionConvention:
        "marker lines excluded; source bytes retain exactly one final LF",
      blocks: {
        ci: {
          startMarker: EXPECTED_BLOCKS.ci.startMarker,
          endMarker: EXPECTED_BLOCKS.ci.endMarker,
          bytes: Buffer.byteLength(ciBlock.contents),
          sha256: ciBlock.digest,
          rowCount: ciBlock.rows.length,
          rowIds: EXPECTED_BLOCKS.ci.rowIds,
        },
        local: {
          startMarker: EXPECTED_BLOCKS.local.startMarker,
          endMarker: EXPECTED_BLOCKS.local.endMarker,
          bytes: Buffer.byteLength(localBlock.contents),
          sha256: localBlock.digest,
          rowCount: localBlock.rows.length,
          rowIds: EXPECTED_BLOCKS.local.rowIds,
        },
      },
    },
    evidenceRoot: relativeEvidencePath(outputRoot),
    canonicalRowCount: rows.length,
    canonicalRowIds: CANONICAL_ROW_IDS,
    uniqueEvidenceExecutionCount: captures.size + 1,
    resultSummary: statusCounts,
    rows,
  };
  assertNoUnresolvedTokens(record, "Gate record");
  return record;
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  const record = buildRecord(args);
  const jsonContents = canonicalJson(record);
  const markdownContents = renderMarkdown(record);
  const jsonPath = path.join(args.outputRoot, "gate-record.json");
  const markdownPath = path.join(args.outputRoot, "gate-record.md");

  if (args.mode === "write") {
    fs.mkdirSync(args.outputRoot, { recursive: true });
    fs.writeFileSync(jsonPath, jsonContents);
    fs.writeFileSync(markdownPath, markdownContents);
    console.log(
      `Wrote ${toRepoPath(jsonPath)} and ${toRepoPath(markdownPath)} (${record.rows.length} rows).`,
    );
    return;
  }

  assert(
    fs.existsSync(jsonPath),
    `Missing generated gate record: ${toRepoPath(jsonPath)}`,
  );
  assert(
    fs.existsSync(markdownPath),
    `Missing generated gate record: ${toRepoPath(markdownPath)}`,
  );
  assert(
    fs.readFileSync(jsonPath, "utf8") === jsonContents,
    `${toRepoPath(jsonPath)} is stale or non-canonical.`,
  );
  assert(
    fs.readFileSync(markdownPath, "utf8") === markdownContents,
    `${toRepoPath(markdownPath)} is stale or non-canonical.`,
  );
  console.log(
    `Verified ${record.rows.length} Sprint-182 M05 gate rows and all referenced evidence.`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
}
