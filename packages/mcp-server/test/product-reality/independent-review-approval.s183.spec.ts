import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { evaluateIndependentReviewApproval } from "../../../../scripts/product-reality/independent-review-approval.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const approvalPath = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-182/review/independent-review.v1.json",
);

function sha256(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

describe("Sprint 183 reusable independent-review approval gate", () => {
  let record: any;
  let closeoutGenerator: typeof import("../../../../scripts/product-reality/generate-s182-m05-closeout.mjs");
  let expectation: any;

  beforeAll(async () => {
    childProcess.execFileSync(
      "pnpm",
      ["--filter", "@oods/component-contracts", "run", "build"],
      { cwd: repositoryRoot, stdio: "pipe" },
    );
    closeoutGenerator = await import(
      "../../../../scripts/product-reality/generate-s182-m05-closeout.mjs"
    );
    expectation = closeoutGenerator.S182_FOUNDATION_REVIEW_EXPECTATION;
    record = JSON.parse(fs.readFileSync(approvalPath, "utf8"));
  });

  function evaluatePairedMutation(
    mutate: (mutatedRecord: any, mutatedExpectation: any) => void,
    resolveHead?: (head: string) => any,
  ) {
    const mutatedRecord = structuredClone(record);
    const mutatedExpectation = structuredClone(expectation);
    mutate(mutatedRecord, mutatedExpectation);
    return evaluateIndependentReviewApproval({
      record: mutatedRecord,
      expectation: mutatedExpectation,
      resolveHead,
    });
  }

  it("reconstructs the three-session approval with the exact heads, 28 cells, and 11 review rows", () => {
    expect(record).toMatchObject({
      kind: "independent-review-approval",
      predicate: "foundation-v1",
      subject: {
        producerSessionId: "PS-2026-09-04-003",
        producerActor: "Codex",
        derivationHead: "db302641acad22dc29fd0e2c6b1a0925411d4f34",
      },
      review: {
        sessionId: "PS-2026-09-04-004",
        reviewerActor: "assistant",
        decisionId: 1662,
        reviewedHead: "ca8d84bbce165b656fd5cd83cc097c28fa774f19",
        disposition: "accepted",
      },
      authorization: {
        sessionId: "PS-2026-09-04-005",
        decisionId: 1663,
        authorizedBy: "Derek",
        disposition: "approved",
      },
      residuals: [
        { id: "R-01", disposition: "resolved-before-promotion" },
        { id: "R-02", disposition: "carried-disclosed" },
      ],
    });
    expect(record.authorization.cells).toHaveLength(28);
    expect(
      record.authorization.cells.filter(
        ({ target }: any) => target === "react",
      ),
    ).toHaveLength(14);
    expect(
      record.authorization.cells.filter(({ target }: any) => target === "vue"),
    ).toHaveLength(14);
    expect(record.review.verifications.map(({ id }: any) => id)).toEqual([
      "final-head-source-equivalence",
      "package-foundations-4-of-4",
      "root-typecheck",
      "codegen-19-of-19",
      "react-root-export-14",
      "vue-root-export-14",
      "vue-no-react-radix-rjsf-runtime",
      "m01b-mutation-discrimination",
      "claim-ref-existence-654",
      "l06-reconnect",
      "maintenance-carry-1315-1322",
    ]);
    expect(evaluateIndependentReviewApproval({ record, expectation })).toEqual({
      outcome: "approved",
      reasons: [],
    });
    expect(Object.isFrozen(expectation)).toBe(true);
    expect(Object.isFrozen(expectation.cells)).toBe(true);
    expect(Object.isFrozen(expectation.verificationIds)).toBe(true);
  });

  it.each([
    [
      "zero-width and Cyrillic principal spellings",
      (mutatedRecord: any, mutatedExpectation: any) => {
        mutatedRecord.subject.producerActor = "Reviewer";
        mutatedExpectation.producerActor = "Reviewer";
        mutatedRecord.review.reviewerActor = "Rev\u200Biewer";
        mutatedExpectation.reviewerActor = "Rev\u200Biewer";
        mutatedRecord.authorization.authorizedBy = "R\u0435viewer";
        mutatedExpectation.authorizerPrincipal = "R\u0435viewer";
      },
      "self-review-actor",
    ],
    [
      "fabricated full-length heads",
      (mutatedRecord: any, mutatedExpectation: any) => {
        mutatedRecord.subject.derivationHead = "0".repeat(40);
        mutatedExpectation.derivationHead = "0".repeat(40);
        mutatedRecord.review.reviewedHead = "1".repeat(40);
        mutatedExpectation.reviewedHead = "1".repeat(40);
      },
      "derivation-head-unresolved",
    ],
    [
      "empty heads",
      (mutatedRecord: any, mutatedExpectation: any) => {
        mutatedRecord.subject.derivationHead = "";
        mutatedExpectation.derivationHead = "";
        mutatedRecord.review.reviewedHead = "";
        mutatedExpectation.reviewedHead = "";
      },
      "derivation-head-format",
    ],
    [
      "a review head equal to its derivation head",
      (mutatedRecord: any, mutatedExpectation: any) => {
        mutatedRecord.subject.derivationHead = record.review.reviewedHead;
        mutatedExpectation.derivationHead = record.review.reviewedHead;
        mutatedRecord.review.reviewedHead = record.review.reviewedHead;
        mutatedExpectation.reviewedHead = record.review.reviewedHead;
      },
      "review-head-not-independent",
    ],
  ])(
    "rejects the approval bypass using %s",
    (_name, mutate, expectedReason) => {
      const result = evaluatePairedMutation(mutate);
      expect(result.outcome).not.toBe("approved");
      expect(result.reasons.map(({ code }: any) => code)).toContain(
        expectedReason,
      );
    },
  );

  it.each([
    [
      "NFKC compatibility spelling",
      "\uFF41\uFF53\uFF53\uFF49\uFF53\uFF54\uFF41\uFF4E\uFF54",
    ],
    ["a zero-width insertion", "ass\u200Bistant"],
    ["a Cyrillic lookalike", "\u0430ssistant"],
  ])("collapses %s to the same principal", (_name, spoofedPrincipal) => {
    const result = evaluatePairedMutation(
      (mutatedRecord, mutatedExpectation) => {
        mutatedRecord.subject.producerActor = "assistant";
        mutatedExpectation.producerActor = "assistant";
        mutatedRecord.review.reviewerActor = spoofedPrincipal;
        mutatedExpectation.reviewerActor = spoofedPrincipal;
      },
    );
    expect(result.outcome).toBe("invalid");
    expect(result.reasons.map(({ code }: any) => code)).toContain(
      "self-review-actor",
    );
  });

  it("uses an injected resolver for both independently fixed commit heads", () => {
    const resolvedHeads: string[] = [];
    const result = evaluateIndependentReviewApproval({
      record,
      expectation,
      resolveHead: (head: string) => {
        resolvedHeads.push(head);
        return { status: "resolved", commit: head };
      },
    });
    expect(result).toEqual({ outcome: "approved", reasons: [] });
    expect(resolvedHeads).toEqual([
      record.subject.derivationHead,
      record.review.reviewedHead,
    ]);
  });

  it("fails a well-formed head that the injected resolver cannot find", () => {
    const result = evaluateIndependentReviewApproval({
      record,
      expectation,
      resolveHead: (head: string) =>
        head === record.subject.derivationHead
          ? { status: "not-found" }
          : { status: "resolved", commit: head },
    });
    expect(result.outcome).toBe("invalid");
    expect(result.reasons.map(({ code }: any) => code)).toContain(
      "derivation-head-unresolved",
    );
  });

  it("rejects a resolver result that aliases a head to another commit", () => {
    const result = evaluateIndependentReviewApproval({
      record,
      expectation,
      resolveHead: (head: string) => ({
        status: "resolved",
        commit:
          head === record.subject.derivationHead
            ? record.review.reviewedHead
            : head,
      }),
    });
    expect(result.outcome).toBe("invalid");
    expect(result.reasons.map(({ code }: any) => code)).toContain(
      "derivation-head-resolution-drift",
    );
  });

  it.each([
    ["empty", ""],
    ["missing", undefined],
    ["short", "a".repeat(39)],
    ["uppercase", "DB302641ACAD22DC29FD0E2C6B1A0925411D4F34"],
  ])(
    "rejects a malformed head (%s) before invoking the resolver",
    (_name, head) => {
      let resolutionCalls = 0;
      const result = evaluatePairedMutation(
        (mutatedRecord, mutatedExpectation) => {
          mutatedRecord.subject.derivationHead = head;
          mutatedExpectation.derivationHead = head;
        },
        (candidate: string) => {
          resolutionCalls += 1;
          return { status: "resolved", commit: candidate };
        },
      );
      expect(result.outcome).toBe("invalid");
      expect(result.reasons.map(({ code }: any) => code)).toContain(
        "derivation-head-format",
      );
      expect(resolutionCalls).toBe(0);
    },
  );

  it.each([
    [
      "reports unavailability",
      () => ({ status: "unverifiable", reason: "fixture has no Git data" }),
    ],
    [
      "throws",
      () => {
        throw new Error("fixture resolver failure");
      },
    ],
  ])(
    "returns unverifiable when the injected resolver %s",
    (_name, resolver) => {
      const result = evaluateIndependentReviewApproval({
        record,
        expectation,
        resolveHead: resolver,
      });
      expect(result.outcome).toBe("unverifiable");
      expect(result.reasons.map(({ code }: any) => code)).toContain(
        "head-resolution-unavailable",
      );
    },
  );

  it("returns unverifiable with a named reason outside a Git repository", () => {
    const temporaryRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "oods-independent-review-non-git-"),
    );
    try {
      const evaluatorUrl = pathToFileURL(
        path.join(
          repositoryRoot,
          "scripts/product-reality/independent-review-approval.mjs",
        ),
      ).href;
      const generatorUrl = pathToFileURL(
        path.join(
          repositoryRoot,
          "scripts/product-reality/generate-s182-m05-closeout.mjs",
        ),
      ).href;
      const childSource = [
        'import fs from "node:fs";',
        `import { evaluateIndependentReviewApproval } from ${JSON.stringify(evaluatorUrl)};`,
        `import { S182_FOUNDATION_REVIEW_EXPECTATION as expectation } from ${JSON.stringify(generatorUrl)};`,
        `const record = JSON.parse(fs.readFileSync(${JSON.stringify(approvalPath)}, "utf8"));`,
        "process.stdout.write(JSON.stringify(evaluateIndependentReviewApproval({ record, expectation })));",
      ].join("\n");
      const result = JSON.parse(
        childProcess.execFileSync(
          process.execPath,
          ["--input-type=module", "--eval", childSource],
          { cwd: temporaryRoot, encoding: "utf8" },
        ),
      );
      expect(result.outcome).toBe("unverifiable");
      expect(result.reasons.map(({ code }: any) => code)).toContain(
        "head-resolution-unavailable",
      );
    } finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("keeps unverifiable approval out of the promotion check", () => {
    const resolveHead = () => ({
      status: "unverifiable",
      reason: "fixture has no Git data",
    });
    const projection = closeoutGenerator.buildPromotionProjection({
      approvalRecord: record,
      resolveHead,
    });
    expect(projection.closeout).toMatchObject({
      independentReviewApproved: false,
      independentReviewOutcome: "unverifiable",
      summary: { foundationV1CandidateCells: 28, foundationV1Cells: 0 },
    });
    expect(() =>
      closeoutGenerator.run("--check-promotion", {
        approvalRecord: record,
        resolveHead,
      }),
    ).toThrow(/approved 28-cell projection.*approval outcome: unverifiable/i);
  });

  it("discriminates approved and missing records in both ledger directions", () => {
    const approved = closeoutGenerator.buildPromotionProjection({
      approvalRecord: record,
    });
    expect(approved.closeout).toMatchObject({
      independentReviewApproved: true,
      independentReviewOutcome: "approved",
      riskResolutions: {
        "R-02":
          "artifacts/product-reality/sprint-183/m06/r02-package-export-resolution.json",
      },
      summary: { foundationV1CandidateCells: 28, foundationV1Cells: 28 },
    });
    expect(
      approved.closeout.foundationCells.every(
        (cell: any) => cell.evaluation.foundationV1 === true,
      ),
    ).toBe(true);
    expect(
      approved.closeout.foundationCells.every((cell: any) => {
        const refs = cell.evidence.packageExport.refs as string[];
        return (
          refs.some((ref) =>
            ref.startsWith(
              "artifacts/product-reality/sprint-183/m06/r02-package-export-resolution.json#",
            ),
          ) &&
          refs.some((ref) =>
            ref.startsWith(
              "artifacts/product-reality/sprint-183/m05/submitted-packages/tarballs/",
            ),
          ) &&
          refs.every(
            (ref) =>
              !/^packages\/components-(?:react|vue)\/dist\/index\.d\.ts/.test(
                ref,
              ),
          )
        );
      }),
    ).toBe(true);

    const missing = closeoutGenerator.buildPromotionProjection({
      approvalRecord: null,
    });
    expect(missing.closeout).toMatchObject({
      independentReviewApproved: false,
      independentReviewOutcome: "missing",
      summary: { foundationV1CandidateCells: 28, foundationV1Cells: 0 },
    });
  });

  it("returns a categorical rejected outcome when an independently fixed rejection matches", () => {
    const rejectedRecord = structuredClone(record);
    const rejectedExpectation = structuredClone(expectation);
    rejectedRecord.authorization.disposition = "rejected";
    rejectedRecord.authorization.sessionId = "PS-2026-09-04-006";
    rejectedRecord.authorization.decisionId = 1664;
    rejectedExpectation.authorizationDisposition = "rejected";
    rejectedExpectation.authorizationSessionId = "PS-2026-09-04-006";
    rejectedExpectation.authorizationDecisionId = 1664;

    expect(
      evaluateIndependentReviewApproval({
        record: rejectedRecord,
        expectation: rejectedExpectation,
      }),
    ).toEqual({
      outcome: "rejected",
      reasons: [],
    });
  });

  it.each([
    [
      "producer self-review under distinct sessions",
      (mutated: any) => {
        mutated.review.reviewerActor = "CODEX";
      },
      "self-review-actor",
    ],
    [
      "reviewer self-authorization under distinct sessions",
      (mutated: any) => {
        mutated.authorization.authorizedBy = " Assistant ";
      },
      "self-review-actor",
    ],
    [
      "producer self-review",
      (mutated: any) => {
        mutated.review.sessionId = mutated.subject.producerSessionId;
      },
      "self-review",
    ],
    [
      "producer self-authorization",
      (mutated: any) => {
        mutated.authorization.sessionId = mutated.subject.producerSessionId;
      },
      "self-review",
    ],
    [
      "review session drift",
      (mutated: any) => {
        mutated.review.sessionId = "PS-2026-09-04-099";
      },
      "review-session-drift",
    ],
    [
      "authorization session drift",
      (mutated: any) => {
        mutated.authorization.sessionId = "PS-2026-09-04-099";
      },
      "authorization-session-drift",
    ],
    [
      "authorization disposition drift",
      (mutated: any) => {
        mutated.authorization.disposition = "rejected";
      },
      "authorization-disposition-drift",
    ],
    [
      "missing review timestamp",
      (mutated: any) => {
        delete mutated.review.reviewedAt;
      },
      "review-timestamp",
    ],
    [
      "authorization predating review",
      (mutated: any) => {
        mutated.authorization.authorizedAt = "2026-09-04T16:00:00.000Z";
      },
      "authorization-before-review",
    ],
    [
      "derivation head drift",
      (mutated: any) => {
        mutated.subject.derivationHead = "0".repeat(40);
      },
      "derivation-head-drift",
    ],
    [
      "reviewed head drift",
      (mutated: any) => {
        mutated.review.reviewedHead = "1".repeat(40);
      },
      "review-head-drift",
    ],
    [
      "scope drift",
      (mutated: any) => {
        mutated.authorization.cells.pop();
      },
      "scope-drift",
    ],
    [
      "verification drift",
      (mutated: any) => {
        mutated.review.verifications[0].status = "skipped";
      },
      "verification-drift",
    ],
    [
      "legacy raw boolean",
      (mutated: any) => {
        mutated.authorization.approved = true;
      },
      "raw-approval-boolean",
    ],
    [
      "approval-alias raw boolean",
      (mutated: any) => {
        mutated.authorization.isApproved = true;
      },
      "raw-approval-boolean",
    ],
  ])("returns invalid for %s", (_name, mutate, expectedReason) => {
    const mutated = structuredClone(record);
    mutate(mutated);
    const result = evaluateIndependentReviewApproval({
      record: mutated,
      expectation,
    });
    expect(result.outcome).toBe("invalid");
    expect(result.reasons.map(({ code }: any) => code)).toContain(
      expectedReason,
    );
    expect(() =>
      closeoutGenerator.buildPromotionProjection({ approvalRecord: mutated }),
    ).toThrow(/independent-review approval record is invalid/i);
  });

  it("publishes approval at new projection paths while the ca8d84bb historical paths remain byte-exact", () => {
    const immutablePaths = [
      "artifacts/product-reality/sprint-182/m01b/mutation/mutation.patch",
      "packages/component-contracts/registry/component-capability-closeout.s182.v1.json",
      "artifacts/product-reality/sprint-182/m05/claim-diff.json",
      "artifacts/product-reality/sprint-182/m05/evidence-index.json",
      "artifacts/product-reality/sprint-182/m05/gate-record.json",
      "artifacts/product-reality/sprint-182/m05/gate-record.md",
    ].map((repoPath) => path.join(repositoryRoot, repoPath));
    const before = immutablePaths.map(sha256);

    closeoutGenerator.run("--write-promotion");
    closeoutGenerator.run("--check");
    closeoutGenerator.run("--check-promotion");

    expect(immutablePaths.map(sha256)).toEqual(before);

    const historical = JSON.parse(
      fs.readFileSync(
        path.join(
          repositoryRoot,
          "packages/component-contracts/registry/component-capability-closeout.s182.v1.json",
        ),
        "utf8",
      ),
    );
    const promotion = JSON.parse(
      fs.readFileSync(
        path.join(
          repositoryRoot,
          closeoutGenerator.S182_PROMOTION_PATHS.closeout,
        ),
        "utf8",
      ),
    );
    expect(historical).toMatchObject({
      independentReviewApproved: false,
      summary: { foundationV1Cells: 0 },
    });
    expect(promotion).toMatchObject({
      independentReviewApproved: true,
      independentReviewOutcome: "approved",
      summary: { foundationV1Cells: 28 },
    });
  });

  it("content-addresses the preserved snapshot, approval inputs, and discoverable supersession", () => {
    const integrity = closeoutGenerator.S182_HISTORICAL_INTEGRITY;
    const binding = JSON.parse(
      fs.readFileSync(
        path.join(
          repositoryRoot,
          closeoutGenerator.S182_PROMOTION_PATHS.binding,
        ),
        "utf8",
      ),
    );
    expect(binding).toMatchObject({
      schemaVersion: "1.0.0",
      mission: "s183-m06",
      kind: "content-addressed-promotion-supersession",
      status: "bound",
      predicate: "foundation-v1",
      historicalSnapshot: {
        commit: "ca8d84bbce165b656fd5cd83cc097c28fa774f19",
        preservedInPlace: true,
      },
      promotion: {
        outcome: "approved",
        foundationV1Cells: 28,
      },
      discovery: {
        approvedCapabilityProjection:
          closeoutGenerator.S182_PROMOTION_PATHS.closeout,
        approvedClaimDiff: closeoutGenerator.S182_PROMOTION_PATHS.claimDiff,
        canonicalFoundationV1:
          closeoutGenerator.S182_PROMOTION_PATHS.canonicalFoundationV1,
        packageExport:
          "@oods/component-contracts/registry/capabilities/foundation-v1",
        r01CorrectedMutation:
          "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/mutation.patch",
        r01ReplayReport:
          "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/report.json",
        mutationReplayReceipt:
          "artifacts/product-reality/sprint-183/m06/mutation-replay/report.json",
      },
    });
    expect(binding.historicalSnapshot.artifacts).toEqual(
      integrity.artifacts.map((artifact: any) => ({
        ...artifact,
        gitObject: `${integrity.commit}:${artifact.path}`,
      })),
    );
    for (const artifact of integrity.artifacts) {
      const contents = childProcess.execFileSync(
        "git",
        ["show", `${integrity.commit}:${artifact.path}`],
        { cwd: repositoryRoot, maxBuffer: 32 * 1024 * 1024 },
      );
      expect(crypto.createHash("sha256").update(contents).digest("hex")).toBe(
        artifact.sha256,
      );
      expect(sha256(path.join(repositoryRoot, artifact.path))).toBe(
        artifact.sha256,
      );
    }
    for (const projection of binding.promotion.projections) {
      expect(sha256(path.join(repositoryRoot, projection.path))).toBe(
        projection.sha256,
      );
      expect(projection.historicalArtifactRewritten).toBe(false);
    }
    expect(
      sha256(
        path.join(
          repositoryRoot,
          closeoutGenerator.S182_PROMOTION_PATHS.canonicalFoundationV1,
        ),
      ),
    ).toBe(
      sha256(
        path.join(
          repositoryRoot,
          closeoutGenerator.S182_PROMOTION_PATHS.closeout,
        ),
      ),
    );
    for (const input of binding.promotion.inputs) {
      expect(sha256(path.join(repositoryRoot, input.path))).toBe(input.sha256);
    }
  });

  it("publishes the approved projection through the canonical component-contracts package surface", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(
        path.join(repositoryRoot, "packages/component-contracts/package.json"),
        "utf8",
      ),
    );
    expect(packageJson.exports["./registry/capabilities/foundation-v1"]).toBe(
      "./registry/component-capability-foundation-v1.s182.v1.json",
    );

    const require = createRequire(import.meta.url);
    const exportedPath = require.resolve(
      "@oods/component-contracts/registry/capabilities/foundation-v1",
    );
    expect(path.basename(exportedPath)).toBe(
      "component-capability-foundation-v1.s182.v1.json",
    );
    const exportedProjection = JSON.parse(
      fs.readFileSync(exportedPath, "utf8"),
    );
    expect(exportedProjection).toMatchObject({
      approvedRuntimeCensus: null,
      independentReviewApproved: true,
      summary: { foundationV1Cells: 28 },
    });
  });
});
