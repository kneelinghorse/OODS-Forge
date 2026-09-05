import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  auditEvidenceRetention,
  collectNamedLogPaths,
  findUntrackedNamedLogs,
} from "../../../../scripts/product-reality/assert-s184-evidence-retention.mjs";
import { validateFreezeRows } from "../../../../scripts/product-reality/s184-freeze-inventory.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const sprint182IndexPath = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-182/m05/evidence-index.json",
);
const freezeInventoryPath = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-184/m01/freeze-inventory.json",
);
const savedSchemaFreezePath = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-184/m01/saved-schema-freeze.json",
);
const pinnedVueOutputPrefix =
  "artifacts/product-reality/sprint-182/m03/package-verification/";

function sha256(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

describe("Sprint 184 m01 — evidence survives and frozen surfaces stay classified", () => {
  it("lets product-reality logs pass the later ignore rule", () => {
    const probe =
      "artifacts/product-reality/sprint-184/m01/novel-retention-probe.log";
    const result = spawnSync("git", ["check-ignore", probe], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    expect(result.status).toBe(1);

    const rules = fs.readFileSync(
      path.join(repositoryRoot, ".gitignore"),
      "utf8",
    );
    expect(
      rules.indexOf("!/artifacts/product-reality/**/*.log"),
    ).toBeGreaterThan(rules.indexOf("*.log"));
  });

  it("asserts the 34 frozen rows by their three real row classes", () => {
    const inventory = JSON.parse(fs.readFileSync(freezeInventoryPath, "utf8"));
    expect(inventory.status).toBe("passed");
    expect(inventory.rowCount).toBe(34);
    expect(inventory.uniquePathCount).toBe(33);
    expect(inventory.countsByRowClass).toEqual({
      "git-show-and-working-tree": 24,
      "working-tree-only": 8,
      "build-output": 2,
    });
    expect(inventory.historicalGitObjectMissing).toBe(10);
    expect(
      inventory.rows.filter((row: any) => "gitShowSha256" in row),
    ).toHaveLength(24);
    for (const row of inventory.rows.filter(
      (candidate: any) => candidate.rowClass === "build-output",
    )) {
      if (row.workingTreeSha256 === null) {
        expect(inventory.unbuilt).toContain(row.path);
      } else {
        expect(row.workingTreeSha256).toBe(row.recordedSha256);
      }
    }
  });

  it("bites if a required working-tree digest drifts", () => {
    const inventory = JSON.parse(fs.readFileSync(freezeInventoryPath, "utf8"));
    const rows = structuredClone(inventory.rows);
    const guarded = rows.find(
      (row: any) => row.rowClass === "git-show-and-working-tree",
    );
    guarded.workingTreeSha256 = "0".repeat(64);
    expect(validateFreezeRows(rows)).toContainEqual(
      expect.objectContaining({
        path: guarded.path,
        assertion: "working-tree-sha256",
      }),
    );
  });

  it("freezes the three saved schemas consumed by the greenfield workflow", () => {
    const freeze = JSON.parse(fs.readFileSync(savedSchemaFreezePath, "utf8"));
    expect(freeze.files).toHaveLength(3);
    for (const row of freeze.files) {
      const filePath = path.join(repositoryRoot, row.path);
      expect(fs.statSync(filePath).size, row.path).toBe(row.bytes);
      expect(sha256(filePath), row.path).toBe(row.sha256);
    }
  });

  it("keeps all 35 formerly orphaned Sprint 183 m05 logs in the index", () => {
    const result = spawnSync(
      "git",
      ["ls-files", "artifacts/product-reality/sprint-183/m05/**/*.log"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout.split(/\r?\n/).filter(Boolean)).toHaveLength(35);
  });

  it("requires every log named by Sprint 183/184 evidence indexes to be tracked", () => {
    const audit = auditEvidenceRetention(repositoryRoot);
    expect(audit.evidenceIndexes).toContain(
      "artifacts/product-reality/sprint-183/m06/evidence-index.json",
    );
    expect(audit.namedLogCount).toBeGreaterThan(0);
    expect(audit.missingFromWorkingTree).toEqual([]);
    expect(audit.untracked).toEqual([]);
    expect(audit.status).toBe("passed");
  });

  it("the retention audit bites when an indexed log is absent from git", () => {
    const named = [
      ...collectNamedLogPaths({
        path: "artifacts/product-reality/sprint-184/m01/proof.log",
      }),
    ];
    expect(findUntrackedNamedLogs(named, [])).toEqual(named);
  });

  it("re-hashes all eight Sprint 182 files the old Vue runner overwrote", () => {
    const index = JSON.parse(fs.readFileSync(sprint182IndexPath, "utf8"));
    const pinnedRows = index.files.filter(({ path: rowPath }: any) =>
      rowPath.startsWith(pinnedVueOutputPrefix),
    );
    expect(pinnedRows).toHaveLength(8);
    for (const row of pinnedRows) {
      expect(sha256(path.join(repositoryRoot, row.path)), row.path).toBe(
        row.sha256,
      );
    }
  });

  it("makes the Vue packed runner require an explicit artifact root", () => {
    const result = spawnSync(
      process.execPath,
      ["packages/components-vue/test/packed-import.mjs"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Usage: node test/packed-import.mjs --artifact-root <directory>",
    );
  });

  it("builds the publishable root package before running the root-core suite", () => {
    const captureScript = fs.readFileSync(
      path.join(
        repositoryRoot,
        "scripts/product-reality/capture-s184-m01-baseline.mjs",
      ),
      "utf8",
    );
    expect(captureScript).toContain('args: ["run", "pkg:build"]');
  });
});
