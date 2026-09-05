#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const defaultOutputRoot = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-183/m06",
);
const checklistPath = path.join(
  repositoryRoot,
  "cmos/foundational-docs/closeout-checklist.md",
);
const historicalCapturePath = path.join(
  repositoryRoot,
  "scripts/product-reality/capture-s182-m05-closeout-row.mjs",
);
const HISTORICAL_CAPTURE_SHA256 =
  "ea7a519e4d57cb49fb3d99ae1f160011acc3a3296d5aadc6903eb3cbd0c31962";
export const SPRINT_BASE_SHA = "ca8d84bbce165b656fd5cd83cc097c28fa774f19";
const SPRINT_MISSION_IDS = Object.freeze(
  Array.from({ length: 6 }, (_, index) => `s183-m0${index + 1}`),
);
const S182_L01_ATTRIBUTION_PATH =
  "artifacts/product-reality/sprint-182/m05/l01-suite-attribution.json";
const S182_L01_ATTRIBUTION_SHA256 =
  "e84bc2f8701618386040296ec8e55fb6dc557772e8e6acedfdb5685506e8e70a";
const L09_REFERENCE_PATTERN =
  "(?i)(?<![-A-Za-z0-9])(?:sprint[- ]?\\d{1,3}|s\\d{2,3}(?:-m\\d+[a-z]?)?)(?![A-Za-z0-9])";
export const L09_COUNTING_METHOD = Object.freeze({
  unit: "qualifying sprint-or-mission reference occurrence on an added line in the frozen L-09 diff",
  pattern: L09_REFERENCE_PATTERN,
  diffHeaderRule:
    "Exclude only true `+++ ` file headers; retain outer-added nested-patch lines beginning `++++`.",
  exclusions: [
    "OODS-S### diagnostic identifiers are error codes, not sprint references.",
  ],
});
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
const ADVERTISED_SURFACE_PATHS = Object.freeze([
  "packages/mcp-adapter/tool-descriptions.json",
  "packages/mcp-server/src/schemas",
  "packages/mcp-server/src/schemas/generated.ts",
  "packages/mcp-server/src/tools/registry.json",
  "configs/agent/policy.json",
  "packages/mcp-server/src/security/policy.json",
  "docs/api",
]);

const EXPECTED_BLOCKS = {
  ci: {
    start: "<!-- closeout-ci-rows:start -->",
    end: "<!-- closeout-ci-rows:end -->",
    sha256: "9c4a2bf72ea7b562720bb8b769cb680e77b25293f92565ca243233f60fe8db98",
    ids: Array.from(
      { length: 15 },
      (_, index) => `CI-${String(index + 1).padStart(2, "0")}`,
    ),
  },
  local: {
    start: "<!-- closeout-local-rows:start -->",
    end: "<!-- closeout-local-rows:end -->",
    sha256: "f2596223424f2b2619131fbbfb7fe6ac4ae3fa7bcec2122f3d9f2104b2f7ad40",
    ids: Array.from(
      { length: 9 },
      (_, index) => `L-${String(index + 1).padStart(2, "0")}`,
    ),
  },
};

const ROW_ALIASES = {
  "CI-01": ["CI-01"],
  "CI-02": ["CI-02"],
  "CI-03": ["CI-03"],
  "CI-04": ["CI-04"],
  "CI-05": ["CI-05"],
  "CI-06": ["CI-06"],
  "CI-07": ["CI-07"],
  "CI-08": ["CI-08"],
  "CI-09": ["CI-09"],
  "CI-10": ["CI-10"],
  "CI-11": ["CI-11"],
  "CI-12": ["CI-12-setup", "L-07-scale"],
  "CI-13": ["CI-13"],
  "CI-14": ["CI-14-setup", "L-07-soak"],
  "CI-15": ["CI-15"],
  "L-01": ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"],
  "L-02": ["L-02"],
  "L-03": ["L-03"],
  "L-04": ["L-04"],
  "L-05": ["L-05"],
  "L-06": ["L-06-diff"],
  "L-07": [
    "L-01-viz-core",
    "L-01-mcp-server",
    "L-01-root-core",
    "L-07-scale",
    "L-07-soak",
  ],
  "L-08": ["L-08-after-governance", "L-08-final"],
  "L-09": ["L-09"],
};

const CANONICAL_IDS = [...EXPECTED_BLOCKS.ci.ids, ...EXPECTED_BLOCKS.local.ids];

const POST_SOURCE_CLOSEOUT_PATHS = new Set([
  ...[...new Set([...Object.values(ROW_ALIASES).flat(), "L-06-rebuild"])].map(
    (alias) =>
      `artifacts/product-reality/sprint-183/m06/gate-results/${alias.toLowerCase()}.json`,
  ),
  ...[...new Set([...Object.values(ROW_ALIASES).flat(), "L-06-rebuild"])].map(
    (alias) =>
      `artifacts/product-reality/sprint-183/m06/logs/s183-m06-${alias.toLowerCase()}.log`,
  ),
  ...Object.entries(EXPECTED_SIDE_EFFECTS).flatMap(([alias, sourcePaths]) =>
    sourcePaths.map(
      (sourcePath) =>
        `artifacts/product-reality/sprint-183/m06/gate-side-effects/${alias.toLowerCase()}/${sourcePath}`,
    ),
  ),
  "artifacts/product-reality/sprint-183/m06/rehash-paths.txt",
  "artifacts/product-reality/sprint-183/m06/l01-suite-attribution.json",
  "artifacts/product-reality/sprint-183/m06/l06-reconnect.json",
  "artifacts/product-reality/sprint-183/m06/l09-review.json",
  "artifacts/product-reality/sprint-183/m06/focused-suite-receipt.json",
  "artifacts/product-reality/sprint-183/m06/logs/s183-m06-focused-suite.log",
  "artifacts/product-reality/sprint-183/m06/gate-record.json",
  "artifacts/product-reality/sprint-183/m06/gate-record.md",
  "artifacts/product-reality/sprint-183/m06/mission-contracts.json",
  "artifacts/product-reality/sprint-183/m06/claim-ledger.json",
  "artifacts/product-reality/sprint-183/m06/claim-audit.json",
  "artifacts/product-reality/sprint-183/m06/review-handoff.json",
  "artifacts/product-reality/sprint-183/m06/evidence-index.json",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function collectL09ReferenceOccurrences(contents) {
  const pattern =
    /(?<![-A-Za-z0-9])(?:sprint[- ]?\d{1,3}|s\d{2,3}(?:-m\d+[a-z]?)?)(?![A-Za-z0-9])/gi;
  return stripAnsi(contents.toString("utf8"))
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++ "))
    .flatMap((line, lineIndex) =>
      [...line.matchAll(pattern)].map((match) => ({
        value: match[0],
        line: lineIndex + 1,
      })),
    );
}

export function countL09ReferenceOccurrences(contents) {
  return collectL09ReferenceOccurrences(contents).length;
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

function repoPath(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
}

function parseArguments(argv) {
  const values = {};
  let mode = null;
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (name === "--write" || name === "--check") {
      assert(mode === null, "Supply exactly one of --write or --check.");
      mode = name.slice(2);
      continue;
    }
    assert(
      ["--base-sha", "--review-head", "--output-root"].includes(name),
      `Unexpected argument: ${name}`,
    );
    const value = argv[index + 1];
    assert(value && !value.startsWith("--"), `Missing value for ${name}.`);
    values[name] = value;
    index += 1;
  }
  assert(mode !== null, "Supply exactly one of --write or --check.");
  assert(values["--base-sha"], "--base-sha is required.");
  assert(values["--review-head"], "--review-head is required.");
  return {
    mode,
    baseSha: values["--base-sha"],
    reviewHead: values["--review-head"],
    outputRoot: path.resolve(values["--output-root"] ?? defaultOutputRoot),
  };
}

function resolveCommit(value, label) {
  assert(
    /^[0-9a-f]{40}$/.test(value),
    `${label} must be a full lowercase commit SHA.`,
  );
  const resolved = execFileSync(
    "git",
    ["rev-parse", "--verify", `${value}^{commit}`],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  ).trim();
  assert(resolved === value, `${label} resolved to ${resolved}.`);
}

function assertStrictAncestor(baseSha, reviewHead) {
  assert(
    baseSha === SPRINT_BASE_SHA,
    `base SHA must be the Sprint-183 start commit ${SPRINT_BASE_SHA}.`,
  );
  assert(baseSha !== reviewHead, "base SHA and review HEAD must be distinct.");
  let status = null;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", baseSha, reviewHead], {
      cwd: repositoryRoot,
      stdio: "ignore",
    });
    status = 0;
  } catch (error) {
    status = error?.status ?? 1;
  }
  assert(
    status === 0,
    `Sprint base ${baseSha} is not an ancestor of review HEAD ${reviewHead}.`,
  );
}

function validateTimestamp(value, label) {
  assert(
    typeof value === "string",
    `${label} must be an ISO timestamp string.`,
  );
  const parsed = new Date(value);
  assert(!Number.isNaN(parsed.valueOf()), `${label} is invalid: ${value}.`);
  assert(
    parsed.toISOString() === value,
    `${label} must use canonical UTC ISO form: ${value}.`,
  );
  return parsed.valueOf();
}

function extractBlock(checklist, name, expected) {
  assert(
    !checklist.includes("\r"),
    "Closeout checklist must use LF line endings.",
  );
  const start = checklist.indexOf(expected.start);
  const end = checklist.indexOf(expected.end);
  assert(start >= 0 && end > start, `Missing ${name} closeout row markers.`);
  assert(
    checklist.indexOf(expected.start, start + 1) === -1,
    `Duplicate ${name} start marker.`,
  );
  assert(
    checklist.indexOf(expected.end, end + 1) === -1,
    `Duplicate ${name} end marker.`,
  );
  let contents = checklist.slice(start + expected.start.length, end);
  if (contents.startsWith("\n")) contents = contents.slice(1);
  if (!contents.endsWith("\n")) contents += "\n";
  const digest = sha256(contents);
  assert(
    digest === expected.sha256,
    `${name} closeout source block drifted: ${digest}.`,
  );
  const rows = contents
    .split("\n")
    .map((line) =>
      line.match(/^\|\s*((?:CI|L)-\d{2})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/),
    )
    .filter(Boolean)
    .map((match) => ({
      id: match[1],
      label: match[2].trim(),
      sourceDisposition: match[3].trim(),
    }));
  assert(
    JSON.stringify(rows.map(({ id }) => id)) === JSON.stringify(expected.ids),
    `${name} closeout row IDs drifted.`,
  );
  return { contents, digest, rows };
}

function loadLockedCommandTemplates() {
  const contents = fs.readFileSync(historicalCapturePath);
  assert(
    sha256(contents) === HISTORICAL_CAPTURE_SHA256,
    "The historically attested closeout capture carrier drifted.",
  );
  const source = contents.toString("utf8");
  const startMarker = "const rowCommands = ";
  const endMarker = "\n\nfunction parseArguments";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(
    start >= 0 && end > start,
    "Unable to extract locked closeout commands.",
  );
  const expression = source
    .slice(start + startMarker.length, end)
    .trim()
    .replace(/;$/, "");
  const templates = vm.runInNewContext(`(${expression})`, Object.create(null));
  assert(
    templates && typeof templates === "object" && !Array.isArray(templates),
    "Locked closeout command table is not an object.",
  );
  return templates;
}

function instantiateCommands(commands, replacements) {
  return commands.map((command) =>
    command.replaceAll(/\{([A-Z_]+)\}/g, (_, token) => {
      assert(token in replacements, `No replacement supplied for {${token}}.`);
      return replacements[token];
    }),
  );
}

function loadDeclaredRehashPaths(outputRoot, baseSha, reviewHead) {
  const rehashPath = path.join(outputRoot, "rehash-paths.txt");
  assert(
    fs.existsSync(rehashPath),
    `Missing declared rehash path list: ${repoPath(rehashPath)}.`,
  );
  const contents = fs.readFileSync(rehashPath, "utf8");
  assert(
    contents.endsWith("\n") &&
      !contents.endsWith("\n\n") &&
      !contents.includes("\r"),
    "Declared rehash path list must use LF and retain exactly one final LF.",
  );
  const declared = contents.trimEnd().split("\n");
  assert(declared.length > 0, "Declared rehash path list is empty.");
  assert(
    declared.every(
      (repositoryPath) =>
        repositoryPath.length > 0 &&
        !/\s/.test(repositoryPath) &&
        !repositoryPath.includes("\\") &&
        !repositoryPath.startsWith("-") &&
        !path.posix.isAbsolute(repositoryPath) &&
        path.posix.normalize(repositoryPath) === repositoryPath &&
        !repositoryPath.split("/").includes(".."),
    ),
    "Declared rehash paths must be whitespace-free normalized repository-relative operands.",
  );
  assert(
    new Set(declared).size === declared.length,
    "Declared rehash path list contains duplicates.",
  );
  assert(
    JSON.stringify(declared) ===
      JSON.stringify([...declared].sort(compareCodePoint)),
    "Declared rehash path list is not code-point sorted.",
  );
  const changed = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      `${baseSha}..${reviewHead}`,
      "--",
    ],
    { cwd: repositoryRoot, encoding: "utf8" },
  )
    .split(/\r?\n/)
    .filter(Boolean);
  assert(
    changed.every(
      (repositoryPath) =>
        path.posix.normalize(repositoryPath) === repositoryPath,
    ),
    "Sprint diff emitted a non-normalized path.",
  );
  const expected = changed
    .filter((repositoryPath) => !POST_SOURCE_CLOSEOUT_PATHS.has(repositoryPath))
    .sort(compareCodePoint);
  assert(
    JSON.stringify(declared) === JSON.stringify(expected),
    `Declared rehash paths do not equal the Sprint-183 source diff. Expected ${expected.length}, received ${declared.length}.`,
  );
  return declared;
}

export function buildExpectedCommandMap({ baseSha, reviewHead, rehashPaths }) {
  const templates = loadLockedCommandTemplates();
  const replacements = {
    BASE_SHA: baseSha,
    HEAD_SHA: reviewHead,
    DECLARED_REHASH_PATHS: rehashPaths.join(" "),
    PR_LABELS_CSV: "",
    BRIDGE_RUNTIME_ROOT: canonicalOperationalCheckout,
    FINAL_PACKAGE_ARTIFACT_ROOT: "",
  };
  const expected = new Map();
  for (const alias of new Set([
    ...Object.values(ROW_ALIASES).flat(),
    "L-06-rebuild",
  ])) {
    assert(
      Array.isArray(templates[alias]),
      `Locked command table omits ${alias}.`,
    );
    expected.set(alias, instantiateCommands(templates[alias], replacements));
  }
  expected.set("L-04", [
    `sqlite3 -header -column cmos/db/cmos.sqlite ${JSON.stringify(
      "SELECT m.id AS mission_id, COUNT(d.id) AS decision_count FROM missions m LEFT JOIN strategic_decisions d ON d.mission_id = m.id AND d.project_id = m.project_id WHERE m.sprint_id = 'sprint-183' AND m.project_id = 'forge' GROUP BY m.id ORDER BY m.id;",
    )}`,
  ]);
  return expected;
}

function expectedCommandsByAlias({ outputRoot, baseSha, reviewHead }) {
  const rehashPathList = loadDeclaredRehashPaths(
    outputRoot,
    baseSha,
    reviewHead,
  );
  const expected = buildExpectedCommandMap({
    baseSha,
    reviewHead,
    rehashPaths: rehashPathList,
  });
  return { expected, rehashPaths: rehashPathList };
}

export function expectedExecutionCommands(alias, literalCommands) {
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

export function parseVitestCounts(contents, alias) {
  const lines = stripAnsi(contents.toString("utf8")).split(/\r?\n/);
  const parseLine = (prefix) => {
    const matches = lines.filter((line) =>
      new RegExp(`^\\s*${prefix}\\s+`).test(line),
    );
    assert(
      matches.length === 1,
      `${alias} has ${matches.length} ${prefix} summaries.`,
    );
    const line = matches[0];
    const totalMatch = line.match(/\((\d+)\)\s*$/);
    assert(totalMatch, `${alias} ${prefix} summary has no total: ${line}`);
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
      `${alias} ${prefix} counts do not add to ${summary.total}.`,
    );
    assert(summary.total > 0, `${alias} ${prefix} total must be positive.`);
    assert(summary.failed === 0, `${alias} ${prefix} contains failed work.`);
    return summary;
  };
  return {
    files: parseLine("Test Files"),
    tests: parseLine("Tests"),
  };
}

function validateSuiteCountShape(value, label, allowNegative = false) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object.`,
  );
  assert(
    JSON.stringify(Object.keys(value).sort()) ===
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
      JSON.stringify(Object.keys(counts).sort()) ===
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
    if (!allowNegative) {
      assert(
        counts.passed + counts.failed + counts.skipped + counts.todo ===
          counts.total,
        `${label}.${group} status counts do not add to total.`,
      );
    }
  }
}

function parseSnapshotCensus(contents) {
  const lines = contents.toString("utf8").split(/\r?\n/);
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
    moverCount: movers.length,
    files,
    entries,
    movers,
  };
}

function parseHealth(contents, label, { finalLine = false } = {}) {
  const text = stripAnsi(contents.toString("utf8")).trim();
  const jsonText = finalLine
    ? text.split(/\r?\n/).filter(Boolean).at(-1)
    : text;
  let health;
  try {
    health = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`${label} did not emit JSON health.`, { cause: error });
  }
  assert(health.status === "ok", `${label} health status is not ok.`);
  assert(health.bridge === "ready", `${label} bridge is not ready.`);
  assert(
    Number.isInteger(health.toolset?.enabledCount) &&
      health.toolset.enabledCount > 0,
    `${label} enabled tool count is invalid.`,
  );
  return health;
}

function parseRehashResults(capture, expectedPaths) {
  const rows = capture.logContents
    .toString("utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([0-9a-f]{64})\s+(.+)$/);
      assert(match, `L-03 emitted an invalid hash row: ${line}`);
      return { sha256: match[1], path: match[2] };
    });
  assert(
    JSON.stringify(rows.map((row) => row.path)) ===
      JSON.stringify(expectedPaths),
    "L-03 hashed paths differ from the declared rehash list.",
  );
  for (const row of rows) {
    const absolutePath = path.resolve(capture.cwd, row.path);
    const relative = path.relative(capture.cwd, absolutePath);
    assert(
      relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative),
      `L-03 path escapes its captured review checkout: ${row.path}.`,
    );
    assert(fs.existsSync(absolutePath), `L-03 path is missing: ${row.path}.`);
    assert(
      sha256(fs.readFileSync(absolutePath)) === row.sha256,
      `L-03 current digest hash differs for ${row.path}.`,
    );
  }
  return rows;
}

function assertExecutionOrder(captures, aliases, label) {
  for (let index = 1; index < aliases.length; index += 1) {
    const previous = captures.get(aliases[index - 1]);
    const current = captures.get(aliases[index]);
    assert(
      Date.parse(current.startedAt) >= Date.parse(previous.endedAt),
      `${label} order is invalid: ${current.alias} overlaps or predates ${previous.alias}.`,
    );
  }
}

function readJson(absolutePath, label) {
  assert(
    fs.existsSync(absolutePath),
    `Missing ${label}: ${repoPath(absolutePath)}.`,
  );
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${repoPath(absolutePath)}.`, {
      cause: error,
    });
  }
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
  assert(
    Number.isInteger(reference.bytes) && reference.bytes >= 0,
    `${label}.bytes is invalid.`,
  );
  assert(
    /^[0-9a-f]{64}$/.test(reference.sha256),
    `${label}.sha256 is invalid.`,
  );
  const absolutePath = path.join(repositoryRoot, reference.path);
  assert(
    fs.existsSync(absolutePath),
    `${label} is missing: ${reference.path}.`,
  );
  const contents = fs.readFileSync(absolutePath);
  assert(
    contents.byteLength === reference.bytes &&
      sha256(contents) === reference.sha256,
    `${label} byte count or digest is stale.`,
  );
  return reference;
}

function fileReference(absolutePath) {
  const contents = fs.readFileSync(absolutePath);
  return {
    path: repoPath(absolutePath),
    bytes: contents.byteLength,
    sha256: sha256(contents),
  };
}

function loadFrozenSuiteBaseline() {
  const absolutePath = path.join(repositoryRoot, S182_L01_ATTRIBUTION_PATH);
  const reference = fileReference(absolutePath);
  assert(
    reference.sha256 === S182_L01_ATTRIBUTION_SHA256,
    "Frozen Sprint-182 L-01 suite attribution drifted.",
  );
  const payload = readJson(absolutePath, "frozen Sprint-182 L-01 attribution");
  assert(
    payload.missionId === "s182-m05" && payload.rowId === "L-01",
    "Frozen Sprint-182 L-01 attribution provenance drifted.",
  );
  const expectedSuites = ["viz-core", "mcp-server", "root-core"];
  assert(
    JSON.stringify(payload.suiteComparisons?.map((row) => row.suite)) ===
      JSON.stringify(expectedSuites),
    "Frozen Sprint-182 L-01 suite set drifted.",
  );
  const counts = Object.fromEntries(
    payload.suiteComparisons.map((row) => {
      validateSuiteCountShape(row.current, `Sprint-182 ${row.suite} baseline`);
      return [row.suite, row.current];
    }),
  );
  return { reference, counts };
}

function loadSuiteAttribution(
  outputRoot,
  baseSha,
  reviewHead,
  captures,
  suiteCounts,
) {
  const attributionPath = path.join(outputRoot, "l01-suite-attribution.json");
  const payload = readJson(attributionPath, "L-01 suite attribution");
  assert(
    payload.schemaVersion === "1.0.0",
    "L-01 attribution schemaVersion is invalid.",
  );
  assert(
    payload.missionId === "s183-m06" && payload.rowId === "L-01",
    "L-01 attribution provenance is invalid.",
  );
  assert(
    payload.baseSha === baseSha && payload.reviewHead === reviewHead,
    "L-01 attribution commit operands differ.",
  );
  for (const reserved of ["path", "bytes", "sha256", "payload", "baseline"]) {
    assert(
      !Object.hasOwn(payload, reserved),
      `L-01 attribution contains reserved verifier field ${reserved}.`,
    );
  }
  const reviewedAt = validateTimestamp(
    payload.reviewedAt,
    "L-01 attribution reviewedAt",
  );
  const suiteAliases = ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"];
  assert(
    reviewedAt >=
      Math.max(...suiteAliases.map((alias) => captures.get(alias).endedMs)),
    "L-01 attribution predates a captured suite.",
  );
  const expectedSources = suiteAliases.map((alias) => {
    const capture = captures.get(alias);
    return {
      evidenceId: capture.evidenceId,
      result: {
        path: capture.capturePath,
        bytes: capture.captureBytes,
        sha256: capture.captureSha256,
      },
      log: capture.log,
      counts: suiteCounts[alias],
    };
  });
  assert(
    JSON.stringify(payload.sourceExecutions) ===
      JSON.stringify(expectedSources),
    "L-01 attribution is not bound to the exact captured results, logs, and counts.",
  );

  const frozenBaseline = loadFrozenSuiteBaseline();
  assert(
    JSON.stringify(payload.baselineSource) ===
      JSON.stringify(frozenBaseline.reference),
    "L-01 attribution is not bound to the frozen Sprint-182 baseline.",
  );
  const expectedSuites = ["viz-core", "mcp-server", "root-core"];
  assert(
    Array.isArray(payload.suiteComparisons) &&
      JSON.stringify(payload.suiteComparisons.map((row) => row.suite)) ===
        JSON.stringify(expectedSuites),
    "L-01 suite comparisons are incomplete or out of order.",
  );
  for (const [index, comparison] of payload.suiteComparisons.entries()) {
    const alias = suiteAliases[index];
    const baseline = frozenBaseline.counts[comparison.suite];
    assert(
      JSON.stringify(comparison.current) === JSON.stringify(suiteCounts[alias]),
      `L-01 ${comparison.suite} current counts differ from the captured output.`,
    );
    assert(
      JSON.stringify(comparison.baseline) === JSON.stringify(baseline),
      `L-01 ${comparison.suite} baseline differs from frozen Sprint-182 counts.`,
    );
    validateSuiteCountShape(
      comparison.current,
      `L-01 ${comparison.suite} current`,
    );
    validateSuiteCountShape(
      comparison.baseline,
      `L-01 ${comparison.suite} baseline`,
    );
    const delta = {};
    for (const group of ["files", "tests"]) {
      delta[group] = {};
      for (const field of ["passed", "failed", "skipped", "todo", "total"]) {
        delta[group][field] =
          comparison.current[group][field] - comparison.baseline[group][field];
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
    assert(
      delta.files.skipped === 0 &&
        delta.files.todo === 0 &&
        delta.tests.skipped === 0 &&
        delta.tests.todo === 0,
      `L-01 ${comparison.suite} introduced a new skipped or todo item.`,
    );
    assert(
      Array.isArray(comparison.ownerMissionIds) &&
        comparison.ownerMissionIds.length > 0 &&
        new Set(comparison.ownerMissionIds).size ===
          comparison.ownerMissionIds.length &&
        comparison.ownerMissionIds.every((missionId) =>
          SPRINT_MISSION_IDS.includes(missionId),
        ),
      `L-01 ${comparison.suite} has an invalid mission-owner attribution.`,
    );
    assert(
      typeof comparison.disposition === "string" &&
        comparison.disposition.length > 0,
      `L-01 ${comparison.suite} has no disposition.`,
    );
  }
  assert(
    JSON.stringify(
      [
        ...new Set(
          payload.suiteComparisons.flatMap(
            (comparison) => comparison.ownerMissionIds,
          ),
        ),
      ].sort(compareCodePoint),
    ) === JSON.stringify(SPRINT_MISSION_IDS),
    "L-01 suite deltas do not cover all six Sprint-183 mission owners.",
  );
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
    ...payload,
    ...fileReference(attributionPath),
    payload,
    baseline: frozenBaseline.reference,
  };
}

function resolveEvidencePath(value) {
  return path.isAbsolute(value) ? value : path.resolve(repositoryRoot, value);
}

function loadCapture(
  outputRoot,
  alias,
  baseSha,
  reviewHead,
  commandExpectations,
) {
  const resultPath = path.join(
    outputRoot,
    "gate-results",
    `${alias.toLowerCase()}.json`,
  );
  const capture = readJson(resultPath, `${alias} capture`);
  assert(
    capture.schemaVersion === "1.0.0",
    `${alias} schemaVersion is invalid.`,
  );
  assert(
    capture.missionId === "s183-m06",
    `${alias} missionId is ${capture.missionId}.`,
  );
  assert(
    capture.sprintId === "sprint-183",
    `${alias} sprintId is ${capture.sprintId}.`,
  );
  assert(capture.rowId === alias, `${alias} rowId is ${capture.rowId}.`);
  assert(
    capture.evidenceId === `s183-m06-${alias.toLowerCase()}`,
    `${alias} evidenceId is invalid.`,
  );
  for (const reserved of [
    "alias",
    "capturePath",
    "captureBytes",
    "captureSha256",
    "logContents",
  ]) {
    assert(
      !Object.hasOwn(capture, reserved),
      `${alias} capture contains reserved verifier field ${reserved}.`,
    );
  }
  assert(capture.baseSha === baseSha, `${alias} base SHA differs.`);
  assert(capture.reviewHead === reviewHead, `${alias} review HEAD differs.`);
  if (alias === "L-04") {
    assert(
      capture.headMismatchAllowed === true,
      "L-04 must disclose its CMOS-checkout head mismatch.",
    );
    assert(
      /^[0-9a-f]{40}$/.test(capture.measuredHead),
      "L-04 measuredHead must be a full lowercase commit SHA.",
    );
  } else {
    assert(
      capture.measuredHead === reviewHead,
      `${alias} did not execute at the review HEAD.`,
    );
    assert(
      capture.detachedHead === true,
      `${alias} did not execute in a detached worktree.`,
    );
    assert(
      capture.headMismatchAllowed === false,
      `${alias} unexpectedly allowed a HEAD mismatch.`,
    );
  }
  const acceptedPark =
    alias === "L-07-soak" && capture.status === "parked-failure";
  assert(
    capture.status === "pass" || acceptedPark,
    `${alias} status is ${capture.status}.`,
  );
  assert(
    capture.exitCode === 0 || acceptedPark,
    `${alias} exit code is ${capture.exitCode}.`,
  );
  assert(
    Array.isArray(capture.literalCommands) &&
      capture.literalCommands.length > 0,
    `${alias} has no commands.`,
  );
  assert(
    JSON.stringify(capture.literalCommands) ===
      JSON.stringify(commandExpectations.get(alias)),
    `${alias} commands differ from the locked capture carrier.`,
  );
  assert(
    capture.literalCommands.every(
      (command) => typeof command === "string" && command.length > 0,
    ),
    `${alias} contains an empty command.`,
  );
  assert(
    capture.literalCommand === capture.literalCommands.join(" && "),
    `${alias} literalCommand does not match literalCommands.`,
  );
  const expectedExecution = expectedExecutionCommands(
    alias,
    capture.literalCommands,
  );
  assert(
    JSON.stringify(capture.executionCommands) ===
      JSON.stringify(expectedExecution),
    `${alias} executionCommands do not preserve the locked command semantics.`,
  );
  assert(
    capture.executedCommand === capture.executionCommands.join(" && "),
    `${alias} executedCommand does not match executionCommands.`,
  );
  assert(
    !/\{[A-Z_]+\}/.test(
      JSON.stringify([
        capture.literalCommands,
        capture.executionCommands,
        capture.environment,
      ]),
    ),
    `${alias} retains a template token.`,
  );
  const startedMs = validateTimestamp(capture.startedAt, `${alias} startedAt`);
  const endedMs = validateTimestamp(capture.endedAt, `${alias} endedAt`);
  assert(endedMs >= startedMs, `${alias} ended before it started.`);
  assert(
    Number.isInteger(capture.exitCode),
    `${alias} exitCode must be an integer.`,
  );
  assert(
    capture.environment &&
      typeof capture.environment === "object" &&
      !Array.isArray(capture.environment),
    `${alias} environment is missing.`,
  );
  assert(
    JSON.stringify(Object.keys(capture.environment).sort()) ===
      JSON.stringify([
        "CHROMATIC_PROJECT_TOKEN",
        "PR_LABELS",
        "TOKEN_GOV_BASE_REF",
      ]),
    `${alias} environment keys drifted.`,
  );
  assert(
    capture.environment?.PR_LABELS === "",
    `${alias} PR_LABELS operand is not the declared empty local value.`,
  );
  if (alias === "CI-08") {
    assert(
      capture.environment.TOKEN_GOV_BASE_REF === baseSha,
      "CI-08 TOKEN_GOV_BASE_REF differs from the base SHA.",
    );
  } else {
    assert(
      capture.environment.TOKEN_GOV_BASE_REF === null,
      `${alias} unexpectedly records TOKEN_GOV_BASE_REF.`,
    );
  }
  if (alias === "CI-10") {
    assert(
      ["present", "absent"].includes(
        capture.environment.CHROMATIC_PROJECT_TOKEN,
      ),
      "CI-10 must disclose CHROMATIC_PROJECT_TOKEN as present or absent.",
    );
  } else {
    assert(
      capture.environment.CHROMATIC_PROJECT_TOKEN === null,
      `${alias} unexpectedly records CHROMATIC_PROJECT_TOKEN.`,
    );
  }
  const logPath = resolveEvidencePath(capture.log?.path ?? "");
  const expectedLogPath = path.join(
    outputRoot,
    "logs",
    `s183-m06-${alias.toLowerCase()}.log`,
  );
  assert(
    logPath === expectedLogPath,
    `${alias} log path is outside its canonical output directory.`,
  );
  assert(
    fs.existsSync(logPath),
    `${alias} log is missing: ${capture.log?.path}.`,
  );
  const logContents = fs.readFileSync(logPath);
  assert(
    logContents.byteLength === capture.log.bytes,
    `${alias} log byte count differs.`,
  );
  assert(
    sha256(logContents) === capture.log.sha256,
    `${alias} log digest differs.`,
  );
  if (acceptedPark) {
    assert(
      capture.exitCode !== 0 && isParkedStatisticalFloorFailure(logContents),
      "L-07-soak parked failure is not the named one-sided 99% statistical-floor failure.",
    );
  }
  assert(
    Array.isArray(capture.gitStatusBefore) &&
      capture.gitStatusBefore.every((entry) => typeof entry === "string"),
    `${alias} gitStatusBefore is invalid.`,
  );
  assert(
    Array.isArray(capture.gitStatusAfter) &&
      capture.gitStatusAfter.every((entry) => typeof entry === "string"),
    `${alias} gitStatusAfter is invalid.`,
  );
  const sideEffects = capture.sideEffects ?? [];
  assert(Array.isArray(sideEffects), `${alias} sideEffects must be an array.`);
  for (const [index, sideEffect] of sideEffects.entries()) {
    assert(
      sideEffect &&
        typeof sideEffect === "object" &&
        !Array.isArray(sideEffect),
      `${alias} side effect ${index} is invalid.`,
    );
    assert(
      typeof sideEffect.sourcePath === "string" &&
        sideEffect.sourcePath.length > 0 &&
        !path.posix.isAbsolute(sideEffect.sourcePath) &&
        path.posix.normalize(sideEffect.sourcePath) === sideEffect.sourcePath &&
        !sideEffect.sourcePath.split("/").includes(".."),
      `${alias} side effect ${index} sourcePath is invalid.`,
    );
    const capturedPath = resolveEvidencePath(sideEffect.capturedPath ?? "");
    const expectedCapturedPath = path.join(
      outputRoot,
      "gate-side-effects",
      alias.toLowerCase(),
      sideEffect.sourcePath,
    );
    assert(
      capturedPath === expectedCapturedPath,
      `${alias} side effect ${index} is outside its canonical capture path.`,
    );
    assert(
      fs.existsSync(capturedPath),
      `${alias} side effect ${index} is missing: ${sideEffect.capturedPath}.`,
    );
    const contents = fs.readFileSync(capturedPath);
    assert(
      contents.byteLength === sideEffect.bytes &&
        sha256(contents) === sideEffect.sha256,
      `${alias} side effect ${index} digest differs.`,
    );
  }
  const expectedSideEffects = EXPECTED_SIDE_EFFECTS[alias] ?? [];
  assert(
    JSON.stringify(sideEffects.map(({ sourcePath }) => sourcePath)) ===
      JSON.stringify(expectedSideEffects),
    `${alias} side-effect set differs from the canonical set.`,
  );
  const resultContents = fs.readFileSync(resultPath);
  return {
    ...capture,
    alias,
    capturePath: repoPath(resultPath),
    captureBytes: resultContents.byteLength,
    captureSha256: sha256(resultContents),
    logContents,
    startedMs,
    endedMs,
  };
}

function publicCapture(capture) {
  return {
    alias: capture.alias,
    evidenceId: capture.evidenceId,
    result: {
      path: capture.capturePath,
      bytes: capture.captureBytes,
      sha256: capture.captureSha256,
    },
    log: capture.log,
    cwd: capture.cwd,
    measuredHead: capture.measuredHead,
    startedAt: capture.startedAt,
    endedAt: capture.endedAt,
    status: capture.status,
    exitCode: capture.exitCode,
    literalCommands: capture.literalCommands,
    literalCommand: capture.literalCommand,
    executionCommands: capture.executionCommands,
    executedCommand: capture.executedCommand,
    sideEffects: capture.sideEffects,
    gitStatusBefore: capture.gitStatusBefore,
    gitStatusAfter: capture.gitStatusAfter,
  };
}

function parseDecisionCounts(contents) {
  const lines = contents.toString("utf8").trim().split(/\r?\n/).filter(Boolean);
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
    JSON.stringify(rows.map(({ missionId }) => missionId)) ===
      JSON.stringify(SPRINT_MISSION_IDS),
    "L-04 mission set differs.",
  );
  assert(
    rows.every(({ decisionCount }) => decisionCount >= 1),
    "L-04 found a mission without a decision.",
  );
  return rows;
}

function loadReconnect(outputRoot, movers, baseSha, reviewHead, rebuild) {
  const reconnectPath = path.join(outputRoot, "l06-reconnect.json");
  if (movers.length === 0) {
    assert(
      !fs.existsSync(reconnectPath),
      "L-06 reconnect evidence exists for an empty advertised diff.",
    );
    return null;
  }
  const reconnect = readJson(reconnectPath, "L-06 reconnect evidence");
  assert(
    reconnect.schemaVersion === "1.0.0",
    "L-06 reconnect schemaVersion is invalid.",
  );
  assert(
    reconnect.missionId === "s183-m06" && reconnect.rowId === "L-06",
    "L-06 reconnect provenance is invalid.",
  );
  assert(
    reconnect.baseSha === baseSha && reconnect.reviewHead === reviewHead,
    "L-06 reconnect commit operands differ.",
  );
  assert(reconnect.headSha === reviewHead, "L-06 reconnect headSha differs.");
  assert(
    JSON.stringify(reconnect.advertisedMovers) === JSON.stringify(movers),
    "L-06 reconnect movers differ.",
  );
  const expectedRequest = {
    action: "send",
    targetAddress: "cmos://derek/aquex-mcp",
    type: "info_push",
    summary: `Forge advertised surface changed at ${reviewHead}; reconnect required`,
    body: `Reconnect to Forge and refresh schemas. Advertised movers: ${movers.join(", ")}.`,
  };
  assert(
    JSON.stringify(reconnect.request) === JSON.stringify(expectedRequest),
    "L-06 reconnect request differs from the exact required push.",
  );
  const expectedInvocation = `cmos_message(action=${JSON.stringify(
    expectedRequest.action,
  )}, targetAddress=${JSON.stringify(
    expectedRequest.targetAddress,
  )}, type=${JSON.stringify(expectedRequest.type)}, summary=${JSON.stringify(
    expectedRequest.summary,
  )}, body=${JSON.stringify(expectedRequest.body)})`;
  assert(
    reconnect.literalInvocation === expectedInvocation,
    "L-06 reconnect literal invocation differs.",
  );
  assert(
    reconnect.response?.success === true &&
      typeof reconnect.response?.messageId === "string" &&
      reconnect.response.messageId.length > 0,
    "L-06 reconnect response is unsuccessful or has no message id.",
  );
  const sentAt = validateTimestamp(reconnect.sentAt, "L-06 reconnect sentAt");
  assert(
    sentAt >= rebuild.endedMs,
    "L-06 reconnect predates rebuild completion.",
  );
  for (const reserved of ["path", "bytes", "sha256", "payload"]) {
    assert(
      !Object.hasOwn(reconnect, reserved),
      `L-06 reconnect contains reserved verifier field ${reserved}.`,
    );
  }
  return {
    ...reconnect,
    ...fileReference(reconnectPath),
    payload: reconnect,
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
  const review = readJson(reviewPath, "L-09 builder inspection");
  assert(
    review.schemaVersion === "1.0.0",
    "L-09 review schemaVersion is invalid.",
  );
  assert(
    review.missionId === "s183-m06" && review.rowId === "L-09",
    "L-09 review provenance differs.",
  );
  assert(
    review.baseSha === baseSha && review.reviewHead === reviewHead,
    "L-09 review commit operands differ.",
  );
  const reviewedAt = validateTimestamp(review.reviewedAt, "L-09 reviewedAt");
  assert(
    reviewedAt >= capture.endedMs,
    "L-09 review predates its captured diff.",
  );
  assert(
    reviewedAt >= Date.parse(suiteAttribution.payload.reviewedAt),
    "L-09 review predates its suite attribution.",
  );
  const expectedSourceExecution = {
    evidenceId: capture.evidenceId,
    result: {
      path: capture.capturePath,
      bytes: capture.captureBytes,
      sha256: capture.captureSha256,
    },
    log: capture.log,
  };
  assert(
    JSON.stringify(review.sourceExecution) ===
      JSON.stringify(expectedSourceExecution),
    "L-09 review is not bound to the exact captured result and diff log.",
  );
  assert(
    review.reviewerKind === "builder-closeout-inspection",
    "L-09 must remain a builder inspection.",
  );
  assert(
    review.builderSelfCertified === false,
    "L-09 cannot self-certify the builder.",
  );
  assert(
    review.separateReviewRequired === true,
    "L-09 must require separate review.",
  );
  assert(
    JSON.stringify(review.countingMethod) ===
      JSON.stringify(L09_COUNTING_METHOD),
    "L-09 counting method differs from the frozen occurrence definition.",
  );
  const referenceOccurrences = collectL09ReferenceOccurrences(
    capture.logContents,
  );
  const classifications = review.referenceClassifications;
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
    classifications.total === referenceOccurrences.length,
    `L-09 classified ${classifications.total} references but the exact diff contains ${referenceOccurrences.length}.`,
  );
  assert(
    Array.isArray(review.unclassifiedReferences) &&
      review.unclassifiedReferences.length === 0,
    "L-09 retains unclassified sprint/mission references.",
  );
  assert(
    Array.isArray(review.forwardSprintNumberedPromises) &&
      review.forwardSprintNumberedPromises.length === 0,
    "L-09 found forward sprint-numbered promises.",
  );
  const futureReferences = referenceOccurrences.filter(({ value }) => {
    const sprintNumber = Number(
      value.match(/^sprint[- ]?(\d{1,3})$/i)?.[1] ??
        value.match(/^s(\d{2,3})(?:-m\d+[a-z]?)?$/i)?.[1],
    );
    return Number.isInteger(sprintNumber) && sprintNumber > 183;
  });
  assert(
    futureReferences.length === 0,
    `L-09 diff contains ${futureReferences.length} forward sprint-numbered references.`,
  );
  const suiteAttributionReference = {
    path: suiteAttribution.path,
    bytes: suiteAttribution.bytes,
    sha256: suiteAttribution.sha256,
  };
  assert(
    JSON.stringify(review.suiteAttribution) ===
      JSON.stringify(suiteAttributionReference),
    "L-09 suite attribution reference is stale.",
  );
  assert(review.status === "pass", "L-09 review status is not pass.");
  for (const reserved of ["path", "bytes", "sha256", "payload"]) {
    assert(
      !Object.hasOwn(review, reserved),
      `L-09 review contains reserved verifier field ${reserved}.`,
    );
  }
  return {
    ...review,
    ...fileReference(reviewPath),
    payload: review,
  };
}

function renderMarkdown(record) {
  const lines = [
    "# Sprint 183 M06 Canonical Gate Record",
    "",
    `- Review source commit: \`${record.reviewHead}\``,
    `- Base commit: \`${record.baseSha}\``,
    `- Canonical rows: ${record.canonicalRowCount}`,
    `- Builder self-certified: **no**`,
    `- Separate review required: **yes**`,
    "",
    "| Row | Status | Evidence |",
    "|---|---|---:|",
  ];
  for (const row of record.rows) {
    lines.push(`| ${row.id} | ${row.status} | ${row.evidenceAliases.length} |`);
  }
  lines.push(
    "",
    "Structurally non-local and parked rows are disclosed, not reported as local passes.",
    "",
  );
  return lines.join("\n");
}

export function buildRecord(args) {
  resolveCommit(args.baseSha, "base SHA");
  resolveCommit(args.reviewHead, "review HEAD");
  assertStrictAncestor(args.baseSha, args.reviewHead);
  const rowAliases = Object.fromEntries(
    Object.entries(ROW_ALIASES).map(([rowId, aliases]) => [
      rowId,
      [...aliases],
    ]),
  );
  const checklist = fs.readFileSync(checklistPath, "utf8");
  const ciBlock = extractBlock(checklist, "CI", EXPECTED_BLOCKS.ci);
  const localBlock = extractBlock(checklist, "local", EXPECTED_BLOCKS.local);
  const { expected: commandExpectations, rehashPaths } =
    expectedCommandsByAlias({
      outputRoot: args.outputRoot,
      baseSha: args.baseSha,
      reviewHead: args.reviewHead,
    });
  const sourceRows = new Map(
    [...ciBlock.rows, ...localBlock.rows].map((row) => [row.id, row]),
  );
  const captures = new Map();
  for (const alias of new Set(Object.values(rowAliases).flat())) {
    captures.set(
      alias,
      loadCapture(
        args.outputRoot,
        alias,
        args.baseSha,
        args.reviewHead,
        commandExpectations,
      ),
    );
  }

  const reviewWorkingDirectory = captures.get("CI-01").cwd;
  assert(
    path.isAbsolute(reviewWorkingDirectory) &&
      path.resolve(reviewWorkingDirectory) === reviewWorkingDirectory,
    "Review working directory is not a normalized absolute path.",
  );
  assert(
    path.resolve(reviewWorkingDirectory) !== canonicalOperationalCheckout,
    "Canonical review worktree cannot be the operational CMOS checkout.",
  );
  for (const [alias, capture] of captures) {
    if (alias === "L-04") {
      assert(
        capture.cwd === canonicalOperationalCheckout,
        "L-04 did not query the canonical operational CMOS checkout.",
      );
    } else if (alias === "CI-15") {
      assert(
        path.isAbsolute(capture.cwd) &&
          path.resolve(capture.cwd) === capture.cwd &&
          path.resolve(capture.cwd) !== path.resolve(reviewWorkingDirectory) &&
          path.resolve(capture.cwd) !== canonicalOperationalCheckout,
        "CI-15 must use its own clean detached worktree.",
      );
      assert(
        capture.gitStatusBefore.length === 0 &&
          capture.gitStatusAfter.length === 0,
        "CI-15 portable twin did not remain clean.",
      );
    } else {
      assert(
        capture.cwd === reviewWorkingDirectory,
        `${alias} did not execute in the canonical review worktree.`,
      );
    }
  }

  const diffCapture = captures.get("L-06-diff");
  const advertisedMovers = diffCapture.logContents
    .toString("utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const expectedAdvertisedMovers = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      args.baseSha,
      args.reviewHead,
      "--",
      ...ADVERTISED_SURFACE_PATHS,
    ],
    { cwd: repositoryRoot, encoding: "utf8" },
  )
    .split(/\r?\n/)
    .filter(Boolean);
  assert(
    JSON.stringify(advertisedMovers) ===
      JSON.stringify(expectedAdvertisedMovers),
    "L-06 advertised movers differ from the exact Sprint-183 commit diff.",
  );
  let reconnect = null;
  if (advertisedMovers.length > 0) {
    const rebuild = loadCapture(
      args.outputRoot,
      "L-06-rebuild",
      args.baseSha,
      args.reviewHead,
      commandExpectations,
    );
    captures.set("L-06-rebuild", rebuild);
    assert(
      rebuild.cwd === reviewWorkingDirectory,
      "L-06 rebuild did not execute in the canonical review worktree.",
    );
    assertExecutionOrder(
      captures,
      ["L-06-diff", "L-06-rebuild"],
      "L-06 conditional rebuild",
    );
    rowAliases["L-06"] = ["L-06-diff", "L-06-rebuild"];
    reconnect = loadReconnect(
      args.outputRoot,
      advertisedMovers,
      args.baseSha,
      args.reviewHead,
      rebuild,
    );
  } else {
    reconnect = loadReconnect(
      args.outputRoot,
      advertisedMovers,
      args.baseSha,
      args.reviewHead,
      null,
    );
  }

  const suiteCounts = Object.fromEntries(
    ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"].map((alias) => [
      alias,
      parseVitestCounts(captures.get(alias).logContents, alias),
    ]),
  );
  const suiteAttribution = loadSuiteAttribution(
    args.outputRoot,
    args.baseSha,
    args.reviewHead,
    captures,
    suiteCounts,
  );
  const snapshotCensus = parseSnapshotCensus(captures.get("L-02").logContents);
  const rehashResults = parseRehashResults(captures.get("L-03"), rehashPaths);
  const openingHealth = parseHealth(captures.get("L-05").logContents, "L-05");
  if (advertisedMovers.length > 0) {
    parseHealth(captures.get("L-06-rebuild").logContents, "L-06 rebuild", {
      finalLine: true,
    });
  }
  const chromaticPresence = captures
    .get("CI-10")
    .logContents.toString("utf8")
    .trim();
  assert(
    chromaticPresence ===
      `CHROMATIC_PROJECT_TOKEN=${captures.get("CI-10").environment.CHROMATIC_PROJECT_TOKEN}`,
    "CI-10 token-presence capture differs from its environment record.",
  );
  assertExecutionOrder(
    captures,
    [
      "L-01-viz-core",
      "L-01-mcp-server",
      "L-01-root-core",
      "L-07-scale",
      "L-07-soak",
    ],
    "L-07 sequential heavy-suite protocol",
  );
  assertExecutionOrder(
    captures,
    ["CI-12-setup", "L-07-scale"],
    "CI-12 aggregate",
  );
  assertExecutionOrder(
    captures,
    ["CI-14-setup", "L-07-soak"],
    "CI-14 aggregate",
  );
  assert(
    captures.get("L-08-after-governance").startedMs >=
      captures.get("CI-07").endedMs &&
      captures.get("L-08-after-governance").startedMs >=
        captures.get("CI-08").endedMs,
    "L-08 after-governance check predates CI-07 or CI-08.",
  );
  const l03Capture = captures.get("L-03");
  for (const capture of captures.values()) {
    if (["L-03", "L-09", "L-08-final"].includes(capture.alias)) continue;
    assert(
      l03Capture.startedMs >= capture.endedMs,
      `L-03 final rehash predates ${capture.alias}.`,
    );
  }
  assert(
    captures.get("L-09").startedMs >=
      Date.parse(suiteAttribution.payload.reviewedAt),
    "L-09 whole-sprint scan predates the suite-attribution write.",
  );
  assertExecutionOrder(
    captures,
    ["L-03", "L-09", "L-08-final"],
    "final integrity protocol",
  );
  const openingHealthCapture = captures.get("L-05");
  for (const capture of captures.values()) {
    if (capture.alias === "L-05") continue;
    assert(
      capture.startedMs >= openingHealthCapture.endedMs,
      `L-05 opening health did not precede ${capture.alias}.`,
    );
  }
  const finalSurvival = captures.get("L-08-final");
  assert(
    Date.parse(finalSurvival.startedAt) >=
      Date.parse(captures.get("L-09").endedAt),
    "L-08 final survival check did not run after L-09.",
  );
  assert(
    [...captures.values()].every(
      (capture) =>
        capture.alias === "L-08-final" ||
        Date.parse(finalSurvival.startedAt) >= Date.parse(capture.endedAt),
    ),
    "L-08 final survival check was not the last captured execution.",
  );

  const decisionCounts = parseDecisionCounts(captures.get("L-04").logContents);
  const l09Review = loadL09Review(
    args.outputRoot,
    args.baseSha,
    args.reviewHead,
    captures.get("L-09"),
    suiteAttribution,
  );
  const rows = CANONICAL_IDS.map((id) => {
    const rowCaptures = rowAliases[id].map((alias) => captures.get(alias));
    const soakParked = rowCaptures.some(
      ({ status }) => status === "parked-failure",
    );
    const status =
      id === "CI-10"
        ? "structurally-non-local"
        : id === "CI-14"
          ? "parked-disclosed"
          : "pass";
    return {
      id,
      source: sourceRows.get(id),
      status,
      evidenceAliases: rowAliases[id],
      executions: rowCaptures.map(publicCapture),
      disclosures: [
        ...(id === "CI-10"
          ? [
              "Chromatic is SaaS-backed and secret-gated; the local capture records token presence only and does not claim a hosted run.",
            ]
          : []),
        ...(id === "CI-14"
          ? [
              "The statistical power floor remains parked by the canonical checklist; this local execution does not remove the Linux-leg evidence requirement.",
            ]
          : []),
        ...(id === "L-07" && soakParked
          ? [
              "The sequential protocol completed with the named ECharts statistical-floor failure retained as parked evidence.",
            ]
          : []),
        ...(id === "CI-07" || id === "CI-08" || id === "CI-09"
          ? [
              "Hosted label lookup, uploads, and PR comments remain CI-only side effects.",
            ]
          : []),
        ...(id === "CI-15"
          ? [
              "This is the local portable-runtime twin; hosted CI pins Node 24 and pnpm 9.12.2.",
            ]
          : []),
        ...(id === "L-01"
          ? [
              "The MCP-server and root-core carriers each retain the frozen Sprint-182 baseline of 1 skipped file / 16 skipped tests; skip and todo deltas are zero, so no new skipped work is hidden.",
            ]
          : []),
      ],
      ...(id === "L-04" ? { observations: { decisionCounts } } : {}),
      ...(id === "L-01"
        ? { observations: { suiteCounts, attribution: suiteAttribution } }
        : {}),
      ...(id === "L-02" ? { observations: { snapshotCensus } } : {}),
      ...(id === "L-03" ? { observations: { rehashResults } } : {}),
      ...(id === "L-05" ? { observations: { openingHealth } } : {}),
      ...(id === "L-06"
        ? { observations: { advertisedMovers, reconnect } }
        : {}),
      ...(id === "L-09"
        ? { observations: { builderInspection: l09Review } }
        : {}),
    };
  });
  assert(
    rows.length === 24 && new Set(rows.map(({ id }) => id)).size === 24,
    "Canonical gate row cardinality differs.",
  );
  const statusCounts = rows.reduce((counts, { status }) => {
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const record = {
    schemaVersion: "1.0.0",
    kind: "sprint-closeout-gate-record",
    sprintId: "sprint-183",
    missionId: "s183-m06",
    baseSha: args.baseSha,
    reviewHead: args.reviewHead,
    builderSelfCertified: false,
    separateReviewRequired: true,
    sourceChecklist: {
      path: repoPath(checklistPath),
      blocks: {
        ci: {
          sha256: ciBlock.digest,
          bytes: Buffer.byteLength(ciBlock.contents),
          rowIds: EXPECTED_BLOCKS.ci.ids,
        },
        local: {
          sha256: localBlock.digest,
          bytes: Buffer.byteLength(localBlock.contents),
          rowIds: EXPECTED_BLOCKS.local.ids,
        },
      },
    },
    canonicalRowCount: rows.length,
    canonicalRowIds: CANONICAL_IDS,
    uniqueExecutionCount: captures.size,
    resultSummary: statusCounts,
    rows,
  };
  assert(
    !/\{[A-Z_]+\}/.test(JSON.stringify(record)),
    "Gate record retains an unresolved closeout token.",
  );
  return record;
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  const record = buildRecord(args);
  const json = canonicalJson(record);
  const markdown = renderMarkdown(record);
  const jsonPath = path.join(args.outputRoot, "gate-record.json");
  const markdownPath = path.join(args.outputRoot, "gate-record.md");
  if (args.mode === "write") {
    fs.mkdirSync(args.outputRoot, { recursive: true });
    fs.writeFileSync(jsonPath, json);
    fs.writeFileSync(markdownPath, markdown);
    console.log(`Wrote ${repoPath(jsonPath)} and ${repoPath(markdownPath)}.`);
    return;
  }
  assert(
    fs.existsSync(jsonPath) && fs.readFileSync(jsonPath, "utf8") === json,
    "gate-record.json is missing or stale.",
  );
  assert(
    fs.existsSync(markdownPath) &&
      fs.readFileSync(markdownPath, "utf8") === markdown,
    "gate-record.md is missing or stale.",
  );
  console.log(
    `Verified ${record.canonicalRowCount} Sprint-183 M06 canonical gate rows.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  }
}
