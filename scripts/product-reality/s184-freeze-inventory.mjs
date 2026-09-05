#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "../..");

export const HISTORICAL_COMMIT = "ca8d84bbce165b656fd5cd83cc097c28fa774f19";
export const PROMOTION_BINDING_PATH =
  "artifacts/product-reality/sprint-182/review/foundation-v1-promotion-binding.v1.json";
export const SPRINT_182_EVIDENCE_INDEX_PATH =
  "artifacts/product-reality/sprint-182/m05/evidence-index.json";
export const DEFAULT_FREEZE_INVENTORY_PATH =
  "artifacts/product-reality/sprint-184/m01/freeze-inventory.json";

const EXPECTED_SOURCE_COUNTS = Object.freeze({
  historicalSnapshotArtifacts: 6,
  promotionInputs: 5,
  promotionProjections: 3,
  packagePaths: 20,
});

const BUILD_OUTPUT_PATHS = new Set([
  "packages/components-react/dist/index.d.ts",
  "packages/components-vue/dist/index.d.ts",
]);

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function readJson(repositoryRoot, repositoryPath) {
  return JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, repositoryPath), "utf8"),
  );
}

function workingTreeSha256(repositoryRoot, repositoryPath) {
  const absolutePath = path.join(repositoryRoot, repositoryPath);
  return fs.existsSync(absolutePath)
    ? sha256(fs.readFileSync(absolutePath))
    : null;
}

function gitShowSha256(repositoryRoot, gitObject) {
  const result = spawnSync("git", ["show", gitObject], {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
  return result.status === 0 && Buffer.isBuffer(result.stdout)
    ? sha256(result.stdout)
    : null;
}

function measuredHead(repositoryRoot) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`Unable to resolve HEAD: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function gitShowAndWorkingTreeRow(repositoryRoot, source, row, gitObject) {
  return {
    source,
    rowClass: "git-show-and-working-tree",
    path: row.path,
    recordedSha256: row.sha256,
    workingTreeSha256: workingTreeSha256(repositoryRoot, row.path),
    gitObject,
    gitShowSha256: gitShowSha256(repositoryRoot, gitObject),
  };
}

function workingTreeOnlyRow(repositoryRoot, source, row) {
  return {
    source,
    rowClass: "working-tree-only",
    path: row.path,
    recordedSha256: row.sha256,
    workingTreeSha256: workingTreeSha256(repositoryRoot, row.path),
  };
}

function buildOutputRow(repositoryRoot, row) {
  return {
    source: "sprint-182-evidence-index.package-path",
    rowClass: "build-output",
    path: row.path,
    recordedSha256: row.sha256,
    workingTreeSha256: workingTreeSha256(repositoryRoot, row.path),
  };
}

export function validateFreezeRows(rows) {
  const failures = [];
  for (const row of rows) {
    if (row.rowClass === "build-output" && row.workingTreeSha256 === null) {
      continue;
    }
    if (row.workingTreeSha256 !== row.recordedSha256) {
      failures.push({
        path: row.path,
        source: row.source,
        assertion: "working-tree-sha256",
        expected: row.recordedSha256,
        actual: row.workingTreeSha256,
      });
    }
    if (
      row.rowClass === "git-show-and-working-tree" &&
      row.gitShowSha256 !== row.recordedSha256
    ) {
      failures.push({
        path: row.path,
        source: row.source,
        assertion: "git-show-sha256",
        expected: row.recordedSha256,
        actual: row.gitShowSha256,
      });
    }
  }
  return failures;
}

export function buildFreezeInventory(repositoryRoot = defaultRepositoryRoot) {
  const promotionBinding = readJson(repositoryRoot, PROMOTION_BINDING_PATH);
  const evidenceIndex = readJson(
    repositoryRoot,
    SPRINT_182_EVIDENCE_INDEX_PATH,
  );
  const historical = promotionBinding.historicalSnapshot?.artifacts ?? [];
  const inputs = promotionBinding.promotion?.inputs ?? [];
  const projections = promotionBinding.promotion?.projections ?? [];
  const packageRows = (evidenceIndex.files ?? []).filter(({ path: rowPath }) =>
    rowPath.startsWith("packages/"),
  );
  const sourceCounts = {
    historicalSnapshotArtifacts: historical.length,
    promotionInputs: inputs.length,
    promotionProjections: projections.length,
    packagePaths: packageRows.length,
  };

  if (JSON.stringify(sourceCounts) !== JSON.stringify(EXPECTED_SOURCE_COUNTS)) {
    throw new Error(
      `Freeze source cardinality changed: expected ${JSON.stringify(EXPECTED_SOURCE_COUNTS)}, received ${JSON.stringify(sourceCounts)}`,
    );
  }
  if (promotionBinding.historicalSnapshot?.commit !== HISTORICAL_COMMIT) {
    throw new Error(
      `Promotion binding historical commit moved from ${HISTORICAL_COMMIT} to ${promotionBinding.historicalSnapshot?.commit ?? "missing"}`,
    );
  }

  const rows = [
    ...historical.map((row) =>
      gitShowAndWorkingTreeRow(
        repositoryRoot,
        "promotion-binding.historicalSnapshot.artifact",
        row,
        row.gitObject,
      ),
    ),
    ...inputs.map((row) =>
      workingTreeOnlyRow(
        repositoryRoot,
        "promotion-binding.promotion.input",
        row,
      ),
    ),
    ...projections.map((row) =>
      workingTreeOnlyRow(
        repositoryRoot,
        "promotion-binding.promotion.projection",
        row,
      ),
    ),
    ...packageRows.map((row) =>
      BUILD_OUTPUT_PATHS.has(row.path)
        ? buildOutputRow(repositoryRoot, row)
        : gitShowAndWorkingTreeRow(
            repositoryRoot,
            "sprint-182-evidence-index.package-path",
            row,
            `${HISTORICAL_COMMIT}:${row.path}`,
          ),
    ),
  ];
  const failures = validateFreezeRows(rows);
  const countsByRowClass = Object.fromEntries(
    ["git-show-and-working-tree", "working-tree-only", "build-output"].map(
      (rowClass) => [
        rowClass,
        rows.filter((row) => row.rowClass === rowClass).length,
      ],
    ),
  );
  const unbuilt = rows
    .filter(
      (row) =>
        row.rowClass === "build-output" && row.workingTreeSha256 === null,
    )
    .map((row) => row.path);
  const uniquePathCount = new Set(rows.map((row) => row.path)).size;
  const historicalGitObjectMissing = rows.filter(
    (row) => row.rowClass !== "git-show-and-working-tree",
  ).length;

  return {
    schemaVersion: "1.0.0",
    sprintId: "sprint-184",
    missionId: "s184-m01",
    kind: "frozen-surface-inventory",
    measuredHead: measuredHead(repositoryRoot),
    historicalCommit: HISTORICAL_COMMIT,
    sources: {
      promotionBinding: PROMOTION_BINDING_PATH,
      sprint182EvidenceIndex: SPRINT_182_EVIDENCE_INDEX_PATH,
    },
    sourceCounts,
    rowCount: rows.length,
    uniquePathCount,
    countsByRowClass,
    historicalGitObjectMissing,
    unbuilt,
    failureCount: failures.length,
    failures,
    status: failures.length === 0 ? "passed" : "failed",
    rows,
  };
}

export function writeFreezeInventory(
  repositoryRoot = defaultRepositoryRoot,
  outputPath = DEFAULT_FREEZE_INVENTORY_PATH,
) {
  const inventory = buildFreezeInventory(repositoryRoot);
  const absoluteOutput = path.join(repositoryRoot, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(inventory, null, 2)}\n`);
  return inventory;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  const inventory = writeFreezeInventory();
  process.stdout.write(
    `Sprint 184 freeze inventory: ${inventory.status} (${inventory.rowCount} rows; ${inventory.unbuilt.length} build outputs unbuilt)\n`,
  );
  if (inventory.status !== "passed") process.exitCode = 1;
}
