import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CANONICAL_COMPONENT_IDS,
  M05_BASELINE_COMMIT,
  M05_MUTATION_CASES,
  MUTATION_CASES,
  S182_M01B_MUTATION_CASE,
  assertExactCanonicalExports,
  buildR02Resolution,
  canonicalJson,
  replayStoredPatch,
} from "../../../../scripts/product-reality/s183-m06-evidence.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const evidenceRoot = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-183/m06",
);

function readJson(relativePath: string) {
  return JSON.parse(
    fs.readFileSync(path.join(evidenceRoot, relativePath), "utf8"),
  );
}

describe("Sprint 183 M06 mutation replay and R-02 resolution", () => {
  it("replays exactly four M05 patches plus the repaired M01b patch from committed baselines", async () => {
    expect(M05_MUTATION_CASES).toHaveLength(4);
    expect(MUTATION_CASES).toEqual([
      ...M05_MUTATION_CASES,
      S182_M01B_MUTATION_CASE,
    ]);

    for (const definition of MUTATION_CASES) {
      const replay = await replayStoredPatch(definition);
      expect(replay).toMatchObject({
        id: definition.id,
        sourceMission: definition.sourceMission,
        status: "passed",
        baseline: {
          commit: M05_BASELINE_COMMIT,
          path: definition.baselinePath,
          targetFile: definition.targetFile,
        },
        patch: {
          path: definition.patchPath,
          checkExitCode: 0,
          applyExitCode: 0,
        },
        reverse: {
          checkExitCode: 0,
          applyExitCode: 0,
          byteIdentical: true,
        },
      });
      expect(replay.reverse.restoredSha256).toBe(replay.baseline.sha256);
      expect(replay.mutatedSha256).not.toBe(replay.baseline.sha256);
      if (definition.transformPath) {
        expect(replay.descriptor).toMatchObject({
          beforeSha256: replay.baseline.sha256,
          afterSha256: replay.mutatedSha256,
          patchSha256: replay.patch.sha256,
        });
      }
    }
  }, 30_000);

  it("publishes five applied, reversed, and actually discriminating mutation controls with no waiver", () => {
    const summary = readJson("mutation-replay/report.json");
    expect(summary).toMatchObject({
      schemaVersion: "1.0.0",
      mission: "s183-m06",
      kind: "archived-mutation-patch-replay",
      status: "passed",
      baselineCommit: M05_BASELINE_COMMIT,
      selected: 5,
      passed: 5,
      failed: 0,
      skipped: 0,
      unrunChecks: [],
    });
    expect(summary.cases.map(({ id }: { id: string }) => id)).toEqual(
      MUTATION_CASES.map(({ id }) => id),
    );
    for (const entry of summary.cases) {
      const report = readJson(`mutation-replay/${entry.id}/report.json`);
      expect(report).toMatchObject({
        id: entry.id,
        status: "passed",
        mutatedSha256: entry.mutatedSha256,
        reverse: {
          restoredSha256: entry.restoredSha256,
          byteIdentical: true,
        },
        redControl: { executed: true },
      });
      if (report.sourceMission === "s183-m05") {
        expect(report.redControl).toMatchObject({
          patchByteIdenticalToStoredArtifact: true,
          status: "detected",
          expected: { gate: "interaction-evidence", status: "failed" },
          observed: { gate: "interaction-evidence", status: "failed" },
          browser: {
            mount: "passed",
            hydration: "passed",
            hydrationInvariantEqual: true,
            runtimeErrors: [],
          },
        });
      }
    }

    const m01b = readJson(
      `mutation-replay/${S182_M01B_MUTATION_CASE.id}/report.json`,
    );
    expect(m01b.patch.committedAtBaseline).toBe(false);
    expect(m01b.redControl).toMatchObject({
      verifier: "actual @oods/component-styles selected Vitest carrier",
      preGreen: { exitCode: 0 },
      selectedRed: { exitCode: 1 },
      restoredGreen: { exitCode: 0 },
      byteIdenticalRestoration: true,
    });
    expect(
      fs.readFileSync(
        path.join(
          repositoryRoot,
          "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/mutation.patch",
        ),
        "utf8",
      ),
    ).toContain("[data-intent='primary']");
  });

  it("replaces R-02 workspace-dist references with hashes for two tracked tarball declarations", async () => {
    const published = readJson("r02-package-export-resolution.json");
    const freshlyDerived = await buildR02Resolution();
    expect(canonicalJson(published)).toBe(canonicalJson(freshlyDerived));
    expect(published).toMatchObject({
      schemaVersion: "1.0.0",
      mission: "s183-m06",
      risk: "R-02",
      kind: "package-export-evidence-resolution",
      status: "resolved",
      selected: 28,
      passed: 28,
      failed: 0,
      skipped: 0,
      workspaceBuildOutputRequired: false,
      freshCloneAvailable: true,
      canonicalComponentIds: CANONICAL_COMPONENT_IDS,
      selectedTargets: ["react", "vue"],
      selectedCells: 28,
    });
    expect(published.packages).toHaveLength(2);
    for (const packageEvidence of published.packages) {
      expect(packageEvidence).toMatchObject({
        tarball: {
          committedAt: M05_BASELINE_COMMIT,
          tracked: true,
        },
        declaration: {
          archiveEntry: "package/dist/index.d.ts",
          extractedFromCommittedTarball: true,
        },
        canonicalNucleusExports: CANONICAL_COMPONENT_IDS,
        canonicalNucleusExportCount: 14,
      });
      expect(packageEvidence.tarball.sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(packageEvidence.declaration.sha256).toMatch(
        /^sha256:[a-f0-9]{64}$/,
      );
    }
    expect(published.cells).toHaveLength(28);
    expect(
      new Set(
        published.cells.map(
          ({ componentId, target }: { componentId: string; target: string }) =>
            `${componentId}:${target}`,
        ),
      ).size,
    ).toBe(28);
    expect(JSON.stringify(published)).not.toMatch(
      /packages\/components-(?:react|vue)\/dist\/index\.d\.ts/,
    );
  });

  it("rejects a declaration when one canonical package export disappears", () => {
    const declarations = [
      ...CANONICAL_COMPONENT_IDS.map(
        (name) => `declare const ${name}: unknown;`,
      ),
      `export { ${CANONICAL_COMPONENT_IDS.join(", ")} };`,
    ].join("\n");
    expect(assertExactCanonicalExports(declarations, "control")).toEqual(
      CANONICAL_COMPONENT_IDS,
    );
    expect(() =>
      assertExactCanonicalExports(
        declarations.replace(", Text,", ","),
        "mutated-control",
      ),
    ).toThrow(/declaration canonical exports differ/);
  });
});
