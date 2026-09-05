import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  AUDIT_HEAD,
  CANONICAL_ADVERTISED_SCOPE,
  DESTINATIONS,
  DISPOSITION_PATH,
  NOTICES_PATH,
  PLAN_PATH,
  REPOSITORY_ROOT,
  SPRINT_183_RANGE,
  SPRINT_184_M06_RANGE,
  SPRINT_184_M06_SCOPE,
  SPRINT_184_RECORD_PATHS,
  buildReconnectRequests,
  canonicalJson,
  deriveReconnectPlan,
  validateDispositionRecord,
  validateDispositionShape,
  validateNoticeRecord,
  validateNoticeShape,
} from "../../../../scripts/product-reality/s184-m07-reconnect.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../../..");
const planBytes = fs.readFileSync(path.join(repositoryRoot, PLAN_PATH));
const plan: any = JSON.parse(planBytes.toString("utf8"));
const dispositionPath = path.join(repositoryRoot, DISPOSITION_PATH);
const dispositionRecord: any = JSON.parse(
  fs.readFileSync(dispositionPath, "utf8"),
);

function git(args: string[], encoding: BufferEncoding | null = "utf8") {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding,
    maxBuffer: 64 * 1024 * 1024,
  });
}

function gitBytes(revision: string, repositoryPath: string) {
  return git(["show", `${revision}:${repositoryPath}`], null) as Buffer;
}

function readFrozenJson(revision: string, repositoryPath: string) {
  return JSON.parse(gitBytes(revision, repositoryPath).toString("utf8"));
}

function isIndependentTestPath(repositoryPath: string) {
  return (
    /(^|\/)(?:__tests__|test|tests)\//.test(repositoryPath) ||
    /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(repositoryPath)
  );
}

function independentlyDiff(
  baseCommit: string,
  implementationCommit: string,
  includedPaths: string[],
  excludeTests = false,
) {
  return (
    git([
      "diff",
      "--name-only",
      `${baseCommit}..${implementationCommit}`,
      "--",
      ...includedPaths,
    ]) as string
  )
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(
      (repositoryPath) =>
        !excludeTests || !isIndependentTestPath(repositoryPath),
    )
    .sort();
}

function digest(bytes: Buffer) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function unique(pathLists: string[][]) {
  return [...new Set(pathLists.flat())].sort();
}

function independentlyDeriveRecordedTranche(repositoryPath: string) {
  const record = readFrozenJson(AUDIT_HEAD, repositoryPath);
  const includedPaths =
    record.derivation.includedPrefixes ?? record.derivation.includedPaths;
  return {
    record,
    movers: independentlyDiff(
      record.baseCommit,
      record.measuredImplementationCommit,
      includedPaths,
      true,
    ),
  };
}

function extractMoverSection(body: string, label: string) {
  const lines = body.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`${label} (`));
  expect(start, label).toBeGreaterThanOrEqual(0);
  const movers: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("- ")) break;
    movers.push(line.slice(2));
  }
  return movers;
}

describe("Sprint 184 M07 reconnect derivation and receipt validation", () => {
  it("re-derives all ten Sprint 183 advertised movers and exposes the catalog schema omitted from the prior notice", () => {
    expect(repositoryRoot).toBe(REPOSITORY_ROOT);
    expect(planBytes.toString("utf8")).toBe(
      canonicalJson(deriveReconnectPlan()),
    );
    expect(plan).toMatchObject({
      schemaVersion: "1.0.0",
      missionId: "s184-m07",
      kind: "reconnect-derivation-plan",
      status: "ready-for-send",
      auditHead: AUDIT_HEAD,
      unrunChecks: [
        "The implementation head has not been committed.",
        "The three CMOS info_push requests have not been sent.",
        "The three unique non-empty message IDs have not been recorded.",
      ],
    });

    const independentlyDerived = independentlyDiff(
      SPRINT_183_RANGE.baseCommit,
      SPRINT_183_RANGE.implementationCommit,
      [...CANONICAL_ADVERTISED_SCOPE],
    );
    expect(independentlyDerived).toHaveLength(10);
    expect(independentlyDerived).toContain(
      "packages/mcp-server/src/schemas/catalog.list.output.json",
    );
    expect(plan.sprint183.movers).toEqual(independentlyDerived);

    const priorNotice = readFrozenJson(
      AUDIT_HEAD,
      plan.sprint183.priorNotice.sourceRecord.path,
    );
    expect(priorNotice.advertisedMovers).toHaveLength(9);
    expect(plan.sprint183.priorNotice).toMatchObject({
      destination: "cmos://derek/aquex-mcp",
      messageId: "89f5af1b-9c9b-43e3-b42b-871041a8567d",
      recordedCount: 9,
      missingFromPriorNotice: [
        "packages/mcp-server/src/schemas/catalog.list.output.json",
      ],
      extraInPriorNotice: [],
    });
    expect(plan.sprint183.priorNotice.sourceRecord).toEqual({
      path: plan.sprint183.priorNotice.sourceRecord.path,
      bytes: gitBytes(AUDIT_HEAD, plan.sprint183.priorNotice.sourceRecord.path)
        .byteLength,
      sha256: digest(
        gitBytes(AUDIT_HEAD, plan.sprint183.priorNotice.sourceRecord.path),
      ),
    });
  });

  it("independently compares the M03, M04, and M05 records with their committed operands and recorded scopes", () => {
    const expectedCounts = new Map([
      ["s184-m03", 16],
      ["s184-m04", 28],
      ["s184-m05", 8],
    ]);
    for (const repositoryPath of SPRINT_184_RECORD_PATHS) {
      const { record, movers } =
        independentlyDeriveRecordedTranche(repositoryPath);
      const tranche = plan.sprint184.tranches.find(
        ({ missionId }: any) => missionId === record.missionId,
      );
      expect(movers, record.missionId).toHaveLength(
        expectedCounts.get(record.missionId),
      );
      expect([...record.movers].sort(), record.missionId).toEqual(movers);
      expect(tranche, record.missionId).toMatchObject({
        missionId: record.missionId,
        baseCommit: record.baseCommit,
        implementationCommit: record.measuredImplementationCommit,
        recordedCount: movers.length,
        derivedCount: movers.length,
        movers,
        comparison: {
          missingFromRecord: [],
          extraInRecord: [],
          exact: true,
        },
      });
      const frozenBytes = gitBytes(AUDIT_HEAD, repositoryPath);
      expect(tranche.sourceRecord).toEqual({
        path: repositoryPath,
        bytes: frozenBytes.byteLength,
        sha256: digest(frozenBytes),
      });
    }
  });

  it("derives the eight M06 movers and the 48-path Sprint 184 union from execution", () => {
    const recordedTranches = SPRINT_184_RECORD_PATHS.map(
      (repositoryPath) =>
        independentlyDeriveRecordedTranche(repositoryPath).movers,
    );
    const m06Movers = independentlyDiff(
      SPRINT_184_M06_RANGE.baseCommit,
      SPRINT_184_M06_RANGE.implementationCommit,
      [...SPRINT_184_M06_SCOPE],
      true,
    );
    expect(m06Movers).toHaveLength(8);
    const m06 = plan.sprint184.tranches.find(
      ({ missionId }: any) => missionId === "s184-m06",
    );
    expect(m06).toMatchObject({
      missionId: "s184-m06",
      baseCommit: SPRINT_184_M06_RANGE.baseCommit,
      implementationCommit: SPRINT_184_M06_RANGE.implementationCommit,
      derivedCount: 8,
      movers: m06Movers,
    });

    const sprint184Union = unique([...recordedTranches, m06Movers]);
    expect(sprint184Union).toHaveLength(48);
    expect(plan.sprint184.union).toEqual({
      sourceCount: 60,
      count: 48,
      duplicatesRemoved: 12,
      movers: sprint184Union,
    });
    const sprint183Movers = independentlyDiff(
      SPRINT_183_RANGE.baseCommit,
      SPRINT_183_RANGE.implementationCommit,
      [...CANONICAL_ADVERTISED_SCOPE],
    );
    const combined = unique([sprint183Movers, sprint184Union]);
    expect(plan.combinedUnique).toEqual({
      count: 51,
      crossSprintOverlap: 7,
      movers: combined,
    });
  });

  it("builds exactly three complete request bodies and rejects missing, duplicate, or rewritten receipts", () => {
    expect(plan.destinations).toEqual([
      {
        targetAddress: "cmos://derek/aquex-mcp",
        consumerKind: "live-mcp",
      },
      {
        targetAddress: "cmos://derek/dashboard-demos",
        consumerKind: "vendored",
      },
      {
        targetAddress: "cmos://derek/forge-demos",
        consumerKind: "vendored",
      },
    ]);
    const requests = buildReconnectRequests(plan, AUDIT_HEAD);
    expect(requests).toHaveLength(3);
    expect(requests.map(({ targetAddress }) => targetAddress)).toEqual(
      DESTINATIONS.map(({ targetAddress }) => targetAddress),
    );
    for (const request of requests) {
      expect(Object.keys(request).sort()).toEqual([
        "action",
        "body",
        "summary",
        "targetAddress",
        "type",
      ]);
      expect(request).toMatchObject({
        action: "send",
        type: "info_push",
      });
      expect(request.summary).toContain(AUDIT_HEAD);
      expect(request.body).toContain(`implementation head ${AUDIT_HEAD}`);
      expect(
        extractMoverSection(request.body, "Sprint 183 advertised movers"),
      ).toEqual(plan.sprint183.movers);
      expect(
        extractMoverSection(
          request.body,
          "Sprint 184 advertised and vendored implementation movers, de-duplicated",
        ),
      ).toEqual(plan.sprint184.union.movers);
    }

    const validRecord = {
      status: "passed",
      implementationHead: AUDIT_HEAD,
      derivation: {
        sprint183Movers: 10,
        sprint184UniqueMovers: 48,
        combinedUniqueMovers: 51,
      },
      requests,
      receipts: DESTINATIONS.map(({ targetAddress }, index) => ({
        targetAddress,
        consumerKind: DESTINATIONS[index].consumerKind,
        success: true,
        messageId: `message-${index + 1}`,
        ...(index === 0 ? { sentAt: "2026-09-05T12:00:00.000Z" } : {}),
      })),
      messageIds: ["message-1", "message-2", "message-3"],
    };
    expect(validateNoticeShape(validRecord, plan)).toEqual([]);

    const duplicateIds = structuredClone(validRecord);
    duplicateIds.receipts[2].messageId = "message-1";
    duplicateIds.messageIds[2] = "message-1";
    expect(validateNoticeShape(duplicateIds, plan)).toContainEqual(
      expect.objectContaining({ code: "MESSAGE_IDS_UNIQUE" }),
    );

    const missingId = structuredClone(validRecord);
    missingId.receipts[1].messageId = "";
    missingId.messageIds[1] = "";
    expect(validateNoticeShape(missingId, plan)).toContainEqual(
      expect.objectContaining({ code: "MESSAGE_IDS_NONEMPTY" }),
    );

    const failedSend = structuredClone(validRecord);
    failedSend.receipts[1].success = false;
    expect(validateNoticeShape(failedSend, plan)).toContainEqual(
      expect.objectContaining({ code: "RECEIPT_SUCCESS" }),
    );

    const invalidSentAt = structuredClone(validRecord);
    invalidSentAt.receipts[0].sentAt = "not-an-instant";
    expect(validateNoticeShape(invalidSentAt, plan)).toContainEqual(
      expect.objectContaining({ code: "RECEIPT_SENT_AT" }),
    );

    const rewrittenBody = structuredClone(validRecord);
    rewrittenBody.requests[0].body = rewrittenBody.requests[0].body.replace(
      "catalog.list.output.json",
      "catalog.list.input.json",
    );
    expect(validateNoticeShape(rewrittenBody, plan)).toContainEqual(
      expect.objectContaining({ code: "REQUEST_BODY_MISMATCH" }),
    );
  });

  it("retains a machine-checked disposition for two sends and the explicitly retired archived consumer", () => {
    expect(
      validateDispositionRecord(dispositionRecord, { repositoryRoot }),
    ).toEqual([]);
    const requests = buildReconnectRequests(
      plan,
      dispositionRecord.implementationHead,
    );
    for (const index of [0, 2]) {
      expect(dispositionRecord.attempts[index].attemptCount).toBe(1);
      expect(dispositionRecord.attempts[index].requestSha256).toBe(
        digest(Buffer.from(canonicalJson(requests[index]))),
      );
    }
    expect(
      dispositionRecord.planFinalizationDisposition.historicalFinalization,
    ).toEqual(plan.finalization);
    expect(
      dispositionRecord.planFinalizationDisposition.unrunCheckDispositions.map(
        ({ check }: any) => check,
      ),
    ).toEqual(plan.unrunChecks);
    expect(dispositionRecord.summary).toMatchObject({
      deliveryAttempts: 4,
      successfulDeliveries: 2,
      retiredDestinations: 1,
      failedDeliveryAttempts: 2,
      unresolvedDestinations: 0,
    });
    expect(
      execFileSync(
        process.execPath,
        [
          path.join(
            repositoryRoot,
            "scripts/product-reality/s184-m07-reconnect.mjs",
          ),
          "--check-disposition",
        ],
        { cwd: repositoryRoot, encoding: "utf8" },
      ).trim(),
    ).toBe("reconnect consumer disposition is valid");
  });

  it("rejects reordered consumers, invalid delivery IDs, and a fabricated retired-consumer ID", () => {
    const reordered = structuredClone(dispositionRecord);
    [reordered.attempts[0], reordered.attempts[1]] = [
      reordered.attempts[1],
      reordered.attempts[0],
    ];
    expect(validateDispositionShape(reordered, plan)).toContainEqual(
      expect.objectContaining({ code: "DISPOSITION_DESTINATIONS" }),
    );

    const missingId = structuredClone(dispositionRecord);
    missingId.attempts[0].result.messageId = " ";
    expect(validateDispositionShape(missingId, plan)).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_MESSAGE_ID" }),
    );

    const duplicateId = structuredClone(dispositionRecord);
    duplicateId.attempts[2].result.messageId =
      duplicateId.attempts[0].result.messageId;
    duplicateId.successfulMessageIds[1] = duplicateId.successfulMessageIds[0];
    expect(validateDispositionShape(duplicateId, plan)).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_MESSAGE_IDS_UNIQUE" }),
    );

    const fabricatedId = structuredClone(dispositionRecord);
    fabricatedId.attempts[1].result.messageId = "invented-dashboard-id";
    expect(validateDispositionShape(fabricatedId, plan)).toContainEqual(
      expect.objectContaining({ code: "RETIRED_MESSAGE_ID" }),
    );
  });

  it("rejects request hashes that do not bind each active destination to its exact generated body", () => {
    const rewrittenHash = structuredClone(dispositionRecord);
    rewrittenHash.attempts[0].requestSha256 = "0".repeat(64);
    expect(validateDispositionShape(rewrittenHash, plan)).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_REQUEST_BINDING" }),
    );

    const swappedHashes = structuredClone(dispositionRecord);
    [
      swappedHashes.attempts[0].requestSha256,
      swappedHashes.attempts[2].requestSha256,
    ] = [
      swappedHashes.attempts[2].requestSha256,
      swappedHashes.attempts[0].requestSha256,
    ];
    const issues = validateDispositionShape(swappedHashes, plan);
    expect(
      issues.filter(({ code }) => code === "DELIVERED_REQUEST_BINDING"),
    ).toHaveLength(2);
  });

  it("rejects a rewritten retirement, derivation, summary, or implementation-head plan binding", () => {
    const wrongProject = structuredClone(dispositionRecord);
    wrongProject.attempts[1].failure.projectId = crypto.randomUUID();
    expect(validateDispositionShape(wrongProject, plan)).toContainEqual(
      expect.objectContaining({ code: "RETIRED_CONSUMER" }),
    );

    const wrongError = structuredClone(dispositionRecord);
    wrongError.attempts[1].result.errorCode = "MESSAGE_REJECTED";
    expect(validateDispositionShape(wrongError, plan)).toContainEqual(
      expect.objectContaining({ code: "RETIRED_CONSUMER" }),
    );

    const missingTerminalDisposition = structuredClone(dispositionRecord);
    delete missingTerminalDisposition.attempts[1].failure.terminalDisposition;
    expect(validateDispositionShape(missingTerminalDisposition, plan)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "RETIRED_FAILURE_FIELDS" }),
        expect.objectContaining({ code: "RETIRED_CONSUMER" }),
      ]),
    );

    const wrongAuthority = structuredClone(dispositionRecord);
    wrongAuthority.retirementDecision.authority = "inferred-by-agent";
    expect(validateDispositionShape(wrongAuthority, plan)).toContainEqual(
      expect.objectContaining({ code: "RETIREMENT_DECISION" }),
    );

    for (const key of [
      "sprint183Movers",
      "sprint184UniqueMovers",
      "combinedUniqueMovers",
    ]) {
      const staleDerivation = structuredClone(dispositionRecord);
      staleDerivation.derivation[key] -= 1;
      expect(
        validateDispositionShape(staleDerivation, plan),
        key,
      ).toContainEqual(
        expect.objectContaining({ code: "DISPOSITION_DERIVATION" }),
      );
    }

    const falseSummary = structuredClone(dispositionRecord);
    falseSummary.summary.dispositionedDestinations = 2;
    expect(validateDispositionShape(falseSummary, plan)).toContainEqual(
      expect.objectContaining({ code: "DISPOSITION_SUMMARY" }),
    );

    const stalePlanBinding = structuredClone(dispositionRecord);
    stalePlanBinding.plan.sha256 = "0".repeat(64);
    expect(validateDispositionRecord(stalePlanBinding)).toContainEqual(
      expect.objectContaining({ code: "DISPOSITION_PLAN_BINDING" }),
    );
  });

  it("rejects drift from the immutable plan or a supersession broader than the retired destination", () => {
    const mutations = [
      (record: any) => {
        record.planFinalizationDisposition.historicalFinalization.requiredMessageIds = 2;
      },
      (record: any) => {
        record.planFinalizationDisposition.unrunCheckDispositions[1].check =
          "Only two requests were required.";
      },
      (record: any) => {
        record.planFinalizationDisposition.supersession.scope =
          "all-destinations";
      },
      (record: any) => {
        record.planFinalizationDisposition.supersession.preservedActiveDestinations.pop();
      },
      (record: any) => {
        record.planFinalizationDisposition.supersession.strictThreeSuccessNoticeContractPreserved = false;
      },
      (record: any) => {
        record.planFinalizationDisposition.supersession.preservedRequirements.uniqueNonEmptyActiveMessageIds = 1;
      },
    ];
    for (const mutate of mutations) {
      const rewritten = structuredClone(dispositionRecord);
      mutate(rewritten);
      expect(validateDispositionShape(rewritten, plan)).toContainEqual(
        expect.objectContaining({ code: "PLAN_FINALIZATION_DISPOSITION" }),
      );
    }
  });

  it("derives two failed delivery attempts without leaving an unresolved destination", () => {
    const misleadingFailureCount = structuredClone(dispositionRecord);
    misleadingFailureCount.summary.failedDeliveryAttempts = 0;
    expect(
      validateDispositionShape(misleadingFailureCount, plan),
    ).toContainEqual(expect.objectContaining({ code: "DISPOSITION_SUMMARY" }));

    const falseUnresolvedDestination = structuredClone(dispositionRecord);
    falseUnresolvedDestination.summary.unresolvedDestinations = 1;
    expect(
      validateDispositionShape(falseUnresolvedDestination, plan),
    ).toContainEqual(expect.objectContaining({ code: "DISPOSITION_SUMMARY" }));

    const extraRejectedAttempt = structuredClone(dispositionRecord);
    extraRejectedAttempt.attempts[1].attemptCount = 3;
    expect(validateDispositionShape(extraRejectedAttempt, plan)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "RETIRED_CONSUMER" }),
        expect.objectContaining({ code: "DISPOSITION_SUMMARY" }),
      ]),
    );
  });

  it("derives the summary from exact attempt semantics and rejects legacy or surplus evidence fields", () => {
    const changedAttemptCount = structuredClone(dispositionRecord);
    changedAttemptCount.attempts[0].attemptCount = 2;
    expect(validateDispositionShape(changedAttemptCount, plan)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "DELIVERED_ATTEMPT_COUNT" }),
        expect.objectContaining({ code: "DISPOSITION_SUMMARY" }),
      ]),
    );

    const forgedMatchingSummary = structuredClone(changedAttemptCount);
    forgedMatchingSummary.summary.deliveryAttempts = 5;
    forgedMatchingSummary.summary.dispositionedDestinations = 2;
    forgedMatchingSummary.summary.successfulDeliveries = 1;
    forgedMatchingSummary.summary.unresolvedDestinations = 1;
    forgedMatchingSummary.summary.allActiveDeliveriesProven = false;
    forgedMatchingSummary.summary.allRequiredConsumerObligationsDispositioned = false;
    const forgedIssues = validateDispositionShape(forgedMatchingSummary, plan);
    expect(forgedIssues).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_ATTEMPT_COUNT" }),
    );
    expect(forgedIssues).not.toContainEqual(
      expect.objectContaining({ code: "DISPOSITION_SUMMARY" }),
    );

    const surplusRecordField = structuredClone(dispositionRecord);
    surplusRecordField.requiredMessageIds = 3;
    expect(validateDispositionShape(surplusRecordField, plan)).toContainEqual(
      expect.objectContaining({ code: "DISPOSITION_FIELDS" }),
    );

    const surplusAttemptField = structuredClone(dispositionRecord);
    surplusAttemptField.attempts[0].sentAt = "2026-09-05T12:00:00.000Z";
    expect(validateDispositionShape(surplusAttemptField, plan)).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_ATTEMPT_FIELDS" }),
    );

    const surplusResultField = structuredClone(dispositionRecord);
    surplusResultField.attempts[2].result.errorCode = "NONE";
    expect(validateDispositionShape(surplusResultField, plan)).toContainEqual(
      expect.objectContaining({ code: "DELIVERED_RESULT_FIELDS" }),
    );
  });

  it("rejects stale blocked semantics after the product-owner retirement decision", () => {
    const blocked = structuredClone(dispositionRecord);
    blocked.deliveryStatus = "blocked";
    blocked.statusMeaning = "One destination still needs to be unarchived.";
    blocked.attempts[1].failure.retryCondition = "Unarchive and retry.";
    blocked.blocker = { targetAddress: DESTINATIONS[1].targetAddress };
    const issues = validateDispositionShape(blocked, plan);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "DISPOSITION_STATUS" }),
        expect.objectContaining({ code: "RETIRED_RETRY_CONDITION" }),
        expect.objectContaining({ code: "DISPOSITION_BLOCKER" }),
      ]),
    );
  });

  it("validates the committed implementation-head notice record once the sends are recorded", () => {
    const absoluteNoticePath = path.join(repositoryRoot, NOTICES_PATH);
    if (!fs.existsSync(absoluteNoticePath)) {
      expect(plan.finalization).toMatchObject({
        noticeRecordPath: NOTICES_PATH,
        requiresImplementationHeadCommit: true,
        requiredMessageIds: 3,
        messageIdsMustBeNonEmptyAndUnique: true,
      });
      return;
    }
    const noticeRecord = JSON.parse(
      fs.readFileSync(absoluteNoticePath, "utf8"),
    );
    expect(validateNoticeRecord(noticeRecord)).toEqual([]);
  });
});
