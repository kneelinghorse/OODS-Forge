import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  AUDIT_HEAD,
  REPOSITORY_ROOT,
  checkDispositionEntry,
  checkPatchSyntax,
  gitObjectBytes,
  gitObjectExists,
  patchTargetPaths,
  readDisposition,
  replayDispositionEntry,
  sha256Urn,
  trackedPatchPaths,
} from "../../../../scripts/product-reality/s184-m07-patch-disposition.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../../..");
const record: any = readDisposition();

function readAuditJson(repoPath: string) {
  return JSON.parse(gitObjectBytes(AUDIT_HEAD, repoPath).toString("utf8"));
}

function entriesFor(classId: string) {
  return record.patches.filter((entry: any) => entry.classId === classId);
}

function digest(bytes: Buffer) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

describe("Sprint 184 M07 tracked mutation patch disposition", () => {
  it("classifies the exact 38-patch frozen population and binds every row to immutable bytes and a source-derived baseline", () => {
    expect(repositoryRoot).toBe(REPOSITORY_ROOT);
    expect(record).toMatchObject({
      schemaVersion: "1.0.0",
      mission: "s184-m07",
      kind: "tracked-mutation-patch-disposition",
      status: "passed",
      auditHead: AUDIT_HEAD,
      population: {
        tracked: 38,
        classified: 38,
        unclassified: 0,
        classCounts: {
          "class-1": 5,
          "class-2": 3,
          "class-3": 4,
          ordinary: 26,
        },
      },
      classDefinitions: {
        "class-1":
          "Historical bare-@@ archives that are not syntactically valid unified diffs.",
        "class-2":
          "The three syntactically valid repository patches identified by the Sprint 183 review whose target context had drifted at that review head: B-11, B-14, and B-15.",
        "class-3":
          "Syntactically valid patches rooted intentionally inside a generated consumer workspace, not at the repository root.",
        ordinary:
          "All other syntactically valid patches, replayed at an explicit committed or derived baseline.",
      },
      verification: {
        applicableAndByteIdenticallyRestored: 33,
        machineUnappliable: 5,
        failed: 0,
        skipped: 0,
      },
      unrunChecks: [],
    });

    const population = trackedPatchPaths();
    const classified = record.patches.map(({ path }: any) => path).sort();
    expect(population).toHaveLength(38);
    expect(new Set(classified).size).toBe(38);
    expect(classified).toEqual(population);
    expect(
      Object.fromEntries(
        Object.keys(record.population.classCounts).map((classId) => [
          classId,
          entriesFor(classId).length,
        ]),
      ),
    ).toEqual(record.population.classCounts);

    for (const entry of record.patches) {
      const auditBytes = gitObjectBytes(AUDIT_HEAD, entry.path);
      expect(sha256Urn(auditBytes), entry.path).toBe(entry.sha256);
      expect(
        fs.readFileSync(path.join(repositoryRoot, entry.path)),
        `${entry.path} changed after the population was frozen`,
      ).toEqual(auditBytes);
      expect(record.baselines[entry.baselineId], entry.path).toBeDefined();

      const baseline = record.baselines[entry.baselineId];
      if (baseline.kind !== "git-commit") continue;
      const presentAtBaseline = gitObjectExists(baseline.commit, entry.path);
      if (entry.patchCommittedAtBaseline) {
        expect(presentAtBaseline, entry.path).toBe(true);
        expect(sha256Urn(gitObjectBytes(baseline.commit, entry.path))).toBe(
          entry.sha256,
        );
      } else if (presentAtBaseline) {
        expect(sha256Urn(gitObjectBytes(baseline.commit, entry.path))).not.toBe(
          entry.sha256,
        );
      }
    }

    const gateEntries = record.patches.filter(({ path: repoPath }: any) =>
      repoPath.startsWith("artifacts/product-reality/sprint-182/gates/"),
    );
    expect(gateEntries).toHaveLength(19);
    for (const entry of gateEntries) {
      const receipt = readAuditJson(
        `${path.posix.dirname(entry.path)}/receipt.json`,
      );
      expect(receipt.reviewHead, entry.path).toBe(
        record.baselines[entry.baselineId].commit,
      );
    }
    expect(
      readAuditJson(
        "artifacts/product-reality/sprint-183/m06/mutation-replay/report.json",
      ).baselineCommit,
    ).toBe(record.baselines["s183-m05-repository"].commit);
    expect(
      readAuditJson(
        "artifacts/product-reality/sprint-184/m03/mutations/mutation-manifest.json",
      ).implementationCommit,
    ).toBe(record.baselines["s184-m03-implementation"].commit);
    expect(
      readAuditJson(
        "artifacts/product-reality/sprint-184/m06/closeout-report.json",
      ).measuredImplementationCommit,
    ).toBe(record.baselines["s184-m06-implementation"].commit);
  });

  it("executes the s183-m06-sc02 replacement over every tracked patch, with only the five invalid archives taking an explicit machine-readable non-apply path", async () => {
    const covered: string[] = [];
    for (const entry of record.patches) {
      if (entry.classId === "class-1") {
        const syntax = await checkPatchSyntax(
          gitObjectBytes(AUDIT_HEAD, entry.path),
        );
        expect(syntax.exitCode, entry.path).not.toBe(0);
        expect(syntax.diagnostic, entry.path).toMatch(
          /No valid patches in input|patch with only garbage/,
        );
        expect(entry).toMatchObject({
          disposition: "does-not-apply",
          unappliableReason: { code: expect.stringMatching(/^MISSING_/) },
        });
      } else {
        await expect(
          replayDispositionEntry(entry, record),
          entry.path,
        ).resolves.toMatchObject({
          checkExitCode: 0,
          applyExitCode: 0,
          byteIdenticalRestoration: true,
        });
      }
      covered.push(entry.path);
    }

    expect(covered.sort()).toEqual(trackedPatchPaths());
    expect(record.replacementClaim).toMatchObject({
      supersedesClaimId: "s183-m06-sc02",
      priorPopulation: 5,
      replacementPopulation: 38,
      coverage: "full-tracked-population",
      status: "passed",
    });
    const priorReplay = readAuditJson(
      "artifacts/product-reality/sprint-183/m06/mutation-replay/report.json",
    );
    expect(
      priorReplay.cases.map(({ patchPath }: any) => patchPath).sort(),
    ).toEqual([...record.replacementClaim.priorPaths].sort());
    const priorClaim = readAuditJson(
      "artifacts/product-reality/sprint-183/m06/claim-ledger.json",
    ).claims.find(({ claimId }: any) => claimId === "s183-m06-sc02");
    expect(priorClaim.executionIds).toEqual(["s183-m06-mutation-replay"]);
  }, 30_000);

  it("preserves all five Class 1 archives, proves the M03 canonical twins at two real commits, and uses the Sprint 183 M01b repair", async () => {
    const classOne = entriesFor("class-1");
    expect(classOne.map(({ path: repoPath }: any) => repoPath)).toEqual([
      "artifacts/product-reality/sprint-182/m01a/mutation/mutation.patch",
      "artifacts/product-reality/sprint-182/m01b/mutation/mutation.patch",
      "artifacts/product-reality/sprint-182/m03/gates/B-08/mutation.patch",
      "artifacts/product-reality/sprint-182/m03/gates/B-09/mutation.patch",
      "artifacts/product-reality/sprint-182/m03/gates/B-10/mutation.patch",
    ]);
    for (const entry of classOne) {
      expect(gitObjectBytes(AUDIT_HEAD, entry.path).toString("utf8")).toContain(
        "\n@@\n",
      );
    }

    const ownedEntries = classOne.filter(({ path: repoPath }: any) =>
      repoPath.includes("/m03/gates/"),
    );
    for (const owned of ownedEntries) {
      const receipt = readAuditJson(
        `${path.posix.dirname(owned.path)}/receipt.json`,
      );
      expect(receipt.reviewHead).toBe(
        record.baselines["s182-m01-review-head"].commit,
      );
      expect(record.baselines["s182-m01-review-head"]).toMatchObject({
        limitationCode: "UNCOMMITTED_MISSION_TREE_NOT_IN_COMMIT",
      });
      const committedTargetExists = gitObjectExists(
        receipt.reviewHead,
        receipt.production.path,
      );
      const committedTargetMatchesReceipt = committedTargetExists
        ? digest(
            gitObjectBytes(receipt.reviewHead, receipt.production.path),
          ) === receipt.production.sha256
        : false;
      expect(committedTargetMatchesReceipt, owned.path).toBe(false);

      const replacement = record.patches.find(
        ({ path: repoPath }: any) => repoPath === owned.replacement.path,
      );
      expect(replacement).toMatchObject({
        classId: "ordinary",
        disposition: "applies-at-declared-baseline",
      });
      for (const baselineId of owned.replacement.verifiedBaselineIds) {
        await expect(
          replayDispositionEntry(replacement, record, baselineId),
          `${replacement.path} at ${baselineId}`,
        ).resolves.toMatchObject({
          checkExitCode: 0,
          applyExitCode: 0,
          byteIdenticalRestoration: true,
        });
      }
    }

    const historical = classOne.find(({ path: repoPath }: any) =>
      repoPath.includes("/m01b/"),
    );
    expect(historical.disposition).toBe("does-not-apply");
    const historicalBytes = gitObjectBytes(AUDIT_HEAD, historical.path);
    const frozenBytes = gitObjectBytes(
      historical.historicalFreeze.commit,
      historical.path,
    );
    expect(historicalBytes).toEqual(frozenBytes);
    expect(sha256Urn(historicalBytes)).toBe(historical.historicalFreeze.sha256);
    expect(historicalBytes.toString("utf8")).not.toContain(
      "[data-intent='primary']",
    );
    const promotionBinding = readAuditJson(
      "artifacts/product-reality/sprint-182/review/foundation-v1-promotion-binding.v1.json",
    );
    expect(promotionBinding.historicalSnapshot).toMatchObject({
      commit: historical.historicalFreeze.commit,
      preservedInPlace: true,
    });
    const frozenBinding = promotionBinding.historicalSnapshot.artifacts.find(
      ({ path: repoPath }: any) => repoPath === historical.path,
    );
    expect(frozenBinding).toEqual({
      path: historical.path,
      bytes: historicalBytes.length,
      sha256: digest(historicalBytes),
      role: "frozen-mutation-patch",
      gitObject: `${historical.historicalFreeze.commit}:${historical.path}`,
    });
    expect(promotionBinding.integrityRule).toBe(
      "The ca8d84bb Sprint 182 snapshot remains byte-exact at its indexed paths; later approval is a separately addressed projection, never an in-place rewrite.",
    );
    for (const baselineId of historical.contentMismatchBaselineIds) {
      expect(
        gitObjectBytes(
          record.baselines[baselineId].commit,
          "packages/component-styles/src/components.css",
        ).toString("utf8"),
      ).toContain("[data-intent='primary']:not(:disabled)");
    }

    const repaired = record.patches.find(
      ({ path: repoPath }: any) => repoPath === historical.replacement.path,
    );
    const repairedReport = readAuditJson(historical.replacement.report);
    expect(historical.replacement).toMatchObject({
      authoredInSprint: "183",
      committedAtBaseline: false,
    });
    expect(repairedReport).toMatchObject({
      sourceMission: "s182-m01b",
      status: "passed",
      patch: {
        path: repaired.path,
        committedAtBaseline: false,
        checkExitCode: 0,
        applyExitCode: 0,
      },
      reverse: { byteIdentical: true },
    });
    await expect(
      replayDispositionEntry(repaired, record),
    ).resolves.toMatchObject({
      checkExitCode: 0,
      applyExitCode: 0,
      byteIdenticalRestoration: true,
    });
  }, 30_000);

  it("replays the three Class 2 patches at the receipt baseline and confirms their context drift at the frozen audit head", async () => {
    const classTwo = entriesFor("class-2");
    expect(classTwo.map(({ path: repoPath }: any) => repoPath)).toEqual([
      "artifacts/product-reality/sprint-182/gates/B-11/mutation.patch",
      "artifacts/product-reality/sprint-182/gates/B-14/mutation.patch",
      "artifacts/product-reality/sprint-182/gates/B-15/mutation.patch",
    ]);
    for (const entry of classTwo) {
      const receipt = readAuditJson(
        `${path.posix.dirname(entry.path)}/receipt.json`,
      );
      expect(receipt.reviewHead).toBe(
        record.baselines[entry.baselineId].commit,
      );
      await expect(
        replayDispositionEntry(entry, record),
      ).resolves.toMatchObject({
        checkExitCode: 0,
        applyExitCode: 0,
        byteIdenticalRestoration: true,
      });
      const headCheck = await checkDispositionEntry(
        entry,
        record,
        "audit-head",
      );
      expect(headCheck.exitCode, entry.path).not.toBe(0);
      expect(headCheck.diagnostic, entry.path).toMatch(/patch does not apply/);
      expect(entry.auditHeadCheck).toEqual({
        commit: AUDIT_HEAD,
        status: "does-not-apply",
        reasonCode: "TARGET_CONTEXT_DRIFT",
      });
    }
  }, 30_000);

  it("keeps all four Class 3 patches scoped to their generated consumer roots", async () => {
    const classThree = entriesFor("class-3");
    expect(classThree).toHaveLength(4);
    for (const entry of classThree) {
      const baseline = record.baselines[entry.baselineId];
      expect(baseline.workspaceRoot).toMatch(
        /^artifacts\/product-reality\/sprint-183\/m05\/consumers\/(react|vue)\/source$/,
      );
      const targets = patchTargetPaths(gitObjectBytes(AUDIT_HEAD, entry.path));
      expect(targets.length).toBeGreaterThan(0);
      for (const target of targets) {
        expect(target, entry.path).toMatch(/^src\//);
        expect(gitObjectExists(AUDIT_HEAD, target), target).toBe(false);
        expect(
          gitObjectExists(
            baseline.commit,
            path.posix.join(baseline.workspaceRoot, target),
          ),
          `${entry.path}:${target}`,
        ).toBe(true);
      }
      await expect(
        replayDispositionEntry(entry, record),
      ).resolves.toMatchObject({
        checkExitCode: 0,
        applyExitCode: 0,
        byteIdenticalRestoration: true,
      });
    }
  }, 30_000);
});
