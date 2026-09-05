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
  validateNoticeRecord,
  validateNoticeShape,
} from "../../../../scripts/product-reality/s184-m07-reconnect.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../../..");
const planBytes = fs.readFileSync(path.join(repositoryRoot, PLAN_PATH));
const plan: any = JSON.parse(planBytes.toString("utf8"));

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
