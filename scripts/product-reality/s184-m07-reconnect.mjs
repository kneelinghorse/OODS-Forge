#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const REPOSITORY_ROOT = path.resolve(scriptDirectory, "../..");
export const MISSION_ID = "s184-m07";
export const AUDIT_HEAD = "cbcbce242f922c18ccfeefbe071bbb26d450dabf";
export const PLAN_PATH =
  "artifacts/product-reality/sprint-184/m07/reconnect-plan.json";
export const NOTICES_PATH =
  "artifacts/product-reality/sprint-184/m07/reconnect-notices.json";
export const DISPOSITION_PATH =
  "artifacts/product-reality/sprint-184/m07/reconnect-attempts.json";

export const SPRINT_183_RANGE = Object.freeze({
  baseCommit: "8ce349076e7e3ba3f0b2f3f667d4fbb5c6a4b63b",
  implementationCommit: "9a4202fe3ff8560a791cc92c114ef364739a1c45",
});

export const CANONICAL_ADVERTISED_SCOPE = Object.freeze([
  "configs/agent/policy.json",
  "docs/api",
  "packages/mcp-adapter/tool-descriptions.json",
  "packages/mcp-server/src/schemas",
  "packages/mcp-server/src/schemas/generated.ts",
  "packages/mcp-server/src/security/policy.json",
  "packages/mcp-server/src/tools/registry.json",
]);

export const SPRINT_184_RECORD_PATHS = Object.freeze([
  "artifacts/product-reality/sprint-184/m03/advertised-movers.json",
  "artifacts/product-reality/sprint-184/m04/advertised-movers.json",
  "artifacts/product-reality/sprint-184/m05/advertised-movers.json",
]);

export const SPRINT_184_M06_RANGE = Object.freeze({
  baseCommit: "9d73aa8b622bfeb3bd345a91a5980fbc3c658904",
  implementationCommit: "b17b0df8f5a56e66ba15716cfa5754641b176a13",
});

export const SPRINT_184_M06_SCOPE = Object.freeze([
  "packages/mcp-server/src/codegen",
  "packages/mcp-server/src/schemas/code.generate.output.json",
  "packages/mcp-server/src/schemas/generated.ts",
  "packages/mcp-server/src/schemas/pipeline.output.json",
]);

export const DESTINATIONS = Object.freeze([
  Object.freeze({
    targetAddress: "cmos://derek/aquex-mcp",
    consumerKind: "live-mcp",
  }),
  Object.freeze({
    targetAddress: "cmos://derek/dashboard-demos",
    consumerKind: "vendored",
  }),
  Object.freeze({
    targetAddress: "cmos://derek/forge-demos",
    consumerKind: "vendored",
  }),
]);

const PRIOR_NOTICE_PATH =
  "artifacts/product-reality/sprint-183/m06/l06-reconnect.json";

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function runGit(args, repositoryRoot = REPOSITORY_ROOT, encoding = "utf8") {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr;
    throw new Error(
      `git ${args.join(" ")} failed (${result.status ?? 127}): ${stderr.trim()}`,
    );
  }
  return result.stdout;
}

export function resolveCommit(revision, repositoryRoot = REPOSITORY_ROOT) {
  return runGit(["rev-parse", `${revision}^{commit}`], repositoryRoot).trim();
}

export function gitFileBytes(
  revision,
  repositoryPath,
  repositoryRoot = REPOSITORY_ROOT,
) {
  return runGit(
    ["show", `${revision}:${repositoryPath}`],
    repositoryRoot,
    null,
  );
}

export function readJsonAt(
  revision,
  repositoryPath,
  repositoryRoot = REPOSITORY_ROOT,
) {
  return JSON.parse(
    gitFileBytes(revision, repositoryPath, repositoryRoot).toString("utf8"),
  );
}

export function isTestPath(repositoryPath) {
  return (
    /(^|\/)(?:__tests__|test|tests)\//.test(repositoryPath) ||
    /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(repositoryPath)
  );
}

export function gitDiffPaths(
  baseCommit,
  implementationCommit,
  includedPaths,
  { excludeTests = false, repositoryRoot = REPOSITORY_ROOT } = {},
) {
  const output = runGit(
    [
      "diff",
      "--name-only",
      `${resolveCommit(baseCommit, repositoryRoot)}..${resolveCommit(implementationCommit, repositoryRoot)}`,
      "--",
      ...includedPaths,
    ],
    repositoryRoot,
  );
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((repositoryPath) => !excludeTests || !isTestPath(repositoryPath))
    .sort(compareCodePoint);
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value)).sort(compareCodePoint);
}

function uniquePaths(pathLists) {
  return [...new Set(pathLists.flat())].sort(compareCodePoint);
}

function frozenReference(repositoryPath, repositoryRoot = REPOSITORY_ROOT) {
  const bytes = gitFileBytes(AUDIT_HEAD, repositoryPath, repositoryRoot);
  return {
    path: repositoryPath,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function deriveRecordedTranche(
  repositoryPath,
  repositoryRoot = REPOSITORY_ROOT,
) {
  const sourceRecord = readJsonAt(AUDIT_HEAD, repositoryPath, repositoryRoot);
  const includedPaths =
    sourceRecord.derivation?.includedPrefixes ??
    sourceRecord.derivation?.includedPaths;
  if (!Array.isArray(includedPaths) || includedPaths.length === 0) {
    throw new Error(`${repositoryPath} has no recorded derivation scope.`);
  }
  const movers = gitDiffPaths(
    sourceRecord.baseCommit,
    sourceRecord.measuredImplementationCommit,
    includedPaths,
    { excludeTests: true, repositoryRoot },
  );
  const recordedMovers = [...sourceRecord.movers].sort(compareCodePoint);
  const missingFromRecord = setDifference(movers, recordedMovers);
  const extraInRecord = setDifference(recordedMovers, movers);
  return {
    missionId: sourceRecord.missionId,
    sourceRecord: frozenReference(repositoryPath, repositoryRoot),
    baseCommit: resolveCommit(sourceRecord.baseCommit, repositoryRoot),
    implementationCommit: resolveCommit(
      sourceRecord.measuredImplementationCommit,
      repositoryRoot,
    ),
    scope: {
      includedPaths,
      excludedClassifiers: sourceRecord.derivation.excludedClassifiers ?? [],
      source: "frozen source record",
    },
    recordedCount: sourceRecord.movers.length,
    derivedCount: movers.length,
    movers,
    comparison: {
      missingFromRecord,
      extraInRecord,
      exact: missingFromRecord.length === 0 && extraInRecord.length === 0,
    },
  };
}

function assertDerivation(plan) {
  const failures = [];
  if (plan.sprint183.derivedCount !== 10) {
    failures.push(
      `Sprint 183 derived ${plan.sprint183.derivedCount}, expected 10.`,
    );
  }
  if (
    !plan.sprint183.movers.includes(
      "packages/mcp-server/src/schemas/catalog.list.output.json",
    )
  ) {
    failures.push("Sprint 183 derivation omitted catalog.list.output.json.");
  }
  const expectedTrancheCounts = {
    "s184-m03": 16,
    "s184-m04": 28,
    "s184-m05": 8,
    "s184-m06": 8,
  };
  for (const tranche of plan.sprint184.tranches) {
    if (tranche.derivedCount !== expectedTrancheCounts[tranche.missionId]) {
      failures.push(
        `${tranche.missionId} derived ${tranche.derivedCount}, expected ${expectedTrancheCounts[tranche.missionId]}.`,
      );
    }
    if (tranche.comparison && !tranche.comparison.exact) {
      failures.push(
        `${tranche.missionId} differs from its frozen source record.`,
      );
    }
  }
  if (plan.sprint184.union.count !== 48) {
    failures.push(
      `Sprint 184 union has ${plan.sprint184.union.count} paths, expected 48.`,
    );
  }
  if (plan.combinedUnique.count !== 51) {
    failures.push(
      `Cross-sprint union has ${plan.combinedUnique.count} paths, expected 51.`,
    );
  }
  if (failures.length > 0) throw new Error(failures.join("\n"));
}

export function deriveReconnectPlan(repositoryRoot = REPOSITORY_ROOT) {
  const sprint183Movers = gitDiffPaths(
    SPRINT_183_RANGE.baseCommit,
    SPRINT_183_RANGE.implementationCommit,
    CANONICAL_ADVERTISED_SCOPE,
    { repositoryRoot },
  );
  const priorNotice = readJsonAt(AUDIT_HEAD, PRIOR_NOTICE_PATH, repositoryRoot);
  const priorMovers = [...priorNotice.advertisedMovers].sort(compareCodePoint);
  const recordedTranches = SPRINT_184_RECORD_PATHS.map((repositoryPath) =>
    deriveRecordedTranche(repositoryPath, repositoryRoot),
  );
  const m06Movers = gitDiffPaths(
    SPRINT_184_M06_RANGE.baseCommit,
    SPRINT_184_M06_RANGE.implementationCommit,
    SPRINT_184_M06_SCOPE,
    { excludeTests: true, repositoryRoot },
  );
  const m06 = {
    missionId: "s184-m06",
    baseCommit: resolveCommit(SPRINT_184_M06_RANGE.baseCommit, repositoryRoot),
    implementationCommit: resolveCommit(
      SPRINT_184_M06_RANGE.implementationCommit,
      repositoryRoot,
    ),
    scope: {
      includedPaths: [...SPRINT_184_M06_SCOPE],
      excludedClassifiers: [
        "test directories",
        "filenames containing .test.",
        "filenames containing .spec.",
      ],
      source: "Sprint 184 M07 mission contract",
    },
    derivedCount: m06Movers.length,
    movers: m06Movers,
  };
  const tranches = [...recordedTranches, m06];
  const sprint184Union = uniquePaths(tranches.map(({ movers }) => movers));
  const combinedUnique = uniquePaths([sprint183Movers, sprint184Union]);
  const plan = {
    schemaVersion: "1.0.0",
    missionId: MISSION_ID,
    kind: "reconnect-derivation-plan",
    status: "ready-for-send",
    auditHead: AUDIT_HEAD,
    derivationRule:
      "Mover arrays are generated from committed Git ranges and declared scopes; no mover array is hand-authored.",
    sprint183: {
      baseCommit: resolveCommit(SPRINT_183_RANGE.baseCommit, repositoryRoot),
      implementationCommit: resolveCommit(
        SPRINT_183_RANGE.implementationCommit,
        repositoryRoot,
      ),
      canonicalAdvertisedScope: [...CANONICAL_ADVERTISED_SCOPE],
      derivedCount: sprint183Movers.length,
      movers: sprint183Movers,
      priorNotice: {
        sourceRecord: frozenReference(PRIOR_NOTICE_PATH, repositoryRoot),
        destination: priorNotice.request.targetAddress,
        messageId: priorNotice.response.messageId,
        recordedCount: priorMovers.length,
        missingFromPriorNotice: setDifference(sprint183Movers, priorMovers),
        extraInPriorNotice: setDifference(priorMovers, sprint183Movers),
      },
    },
    sprint184: {
      tranches,
      union: {
        sourceCount: tranches.reduce(
          (total, tranche) => total + tranche.movers.length,
          0,
        ),
        count: sprint184Union.length,
        duplicatesRemoved:
          tranches.reduce(
            (total, tranche) => total + tranche.movers.length,
            0,
          ) - sprint184Union.length,
        movers: sprint184Union,
      },
    },
    combinedUnique: {
      count: combinedUnique.length,
      crossSprintOverlap:
        sprint183Movers.length + sprint184Union.length - combinedUnique.length,
      movers: combinedUnique,
    },
    destinations: DESTINATIONS.map((destination) => ({ ...destination })),
    finalization: {
      noticeRecordPath: NOTICES_PATH,
      requiresImplementationHeadCommit: true,
      requiredMessageIds: 3,
      messageIdsMustBeNonEmptyAndUnique: true,
    },
    unrunChecks: [
      "The implementation head has not been committed.",
      "The three CMOS info_push requests have not been sent.",
      "The three unique non-empty message IDs have not been recorded.",
    ],
  };
  assertDerivation(plan);
  return plan;
}

function moverSection(label, movers) {
  return [
    `${label} (${movers.length}):`,
    ...movers.map((value) => `- ${value}`),
  ];
}

export function buildReconnectRequests(plan, implementationHead) {
  if (!/^[0-9a-f]{40}$/.test(implementationHead)) {
    throw new Error("implementationHead must be a full 40-character Git SHA.");
  }
  const body = [
    `Forge reconnect provenance: implementation head ${implementationHead}.`,
    "Reconnect to Forge and refresh cached schemas. Vendored consumers should re-vendor from this implementation head.",
    ...moverSection("Sprint 183 advertised movers", plan.sprint183.movers),
    ...moverSection(
      "Sprint 184 advertised and vendored implementation movers, de-duplicated",
      plan.sprint184.union.movers,
    ),
    `The two sprint sections contain ${plan.combinedUnique.count} unique paths after removing ${plan.combinedUnique.crossSprintOverlap} cross-sprint overlaps. Sprint 183 now includes packages/mcp-server/src/schemas/catalog.list.output.json, omitted from its prior nine-path notice.`,
  ].join("\n");
  return plan.destinations.map(({ targetAddress }) => ({
    action: "send",
    targetAddress,
    type: "info_push",
    summary: `Forge Sprint 183/184 surfaces changed through ${implementationHead}; reconnect required`,
    body,
  }));
}

function issue(code, message) {
  return { code, message };
}

export function validateNoticeShape(record, plan) {
  const issues = [];
  if (record?.status !== "passed") {
    issues.push(issue("NOTICE_STATUS", "Notice record status is not passed."));
  }
  if (!/^[0-9a-f]{40}$/.test(record?.implementationHead ?? "")) {
    issues.push(
      issue("IMPLEMENTATION_HEAD", "implementationHead is not a full Git SHA."),
    );
    return issues;
  }
  const expectedRequests = buildReconnectRequests(
    plan,
    record.implementationHead,
  );
  if (canonicalJson(record.requests) !== canonicalJson(expectedRequests)) {
    issues.push(
      issue(
        "REQUEST_BODY_MISMATCH",
        "Recorded requests do not exactly match the Git-derived reconnect bodies.",
      ),
    );
  }
  const receipts = Array.isArray(record.receipts) ? record.receipts : [];
  const expectedTargets = DESTINATIONS.map(
    ({ targetAddress }) => targetAddress,
  );
  const receiptTargets = receipts.map(({ targetAddress }) => targetAddress);
  if (
    receipts.length !== expectedTargets.length ||
    canonicalJson([...receiptTargets].sort(compareCodePoint)) !==
      canonicalJson([...expectedTargets].sort(compareCodePoint))
  ) {
    issues.push(
      issue(
        "RECEIPT_DESTINATIONS",
        "Receipts do not cover each of the three exact destinations once.",
      ),
    );
  }
  for (const destination of DESTINATIONS) {
    const receipt = receipts.find(
      ({ targetAddress }) => targetAddress === destination.targetAddress,
    );
    if (!receipt || receipt.consumerKind !== destination.consumerKind) {
      issues.push(
        issue(
          "RECEIPT_CONSUMER_KIND",
          `${destination.targetAddress} is missing its ${destination.consumerKind} receipt metadata.`,
        ),
      );
    }
    if (!receipt || receipt.success !== true) {
      issues.push(
        issue(
          "RECEIPT_SUCCESS",
          `${destination.targetAddress} does not carry success:true from the send result.`,
        ),
      );
    }
    if (
      receipt?.sentAt !== undefined &&
      (typeof receipt.sentAt !== "string" ||
        receipt.sentAt.length === 0 ||
        Number.isNaN(Date.parse(receipt.sentAt)))
    ) {
      issues.push(
        issue(
          "RECEIPT_SENT_AT",
          `${destination.targetAddress} carries an invalid sentAt value.`,
        ),
      );
    }
  }
  const messageIds = receipts.map(({ messageId }) => messageId);
  if (
    messageIds.length !== 3 ||
    messageIds.some(
      (messageId) =>
        typeof messageId !== "string" || messageId.trim().length === 0,
    )
  ) {
    issues.push(
      issue(
        "MESSAGE_IDS_NONEMPTY",
        "Exactly three non-empty message IDs are required.",
      ),
    );
  } else if (new Set(messageIds).size !== messageIds.length) {
    issues.push(
      issue("MESSAGE_IDS_UNIQUE", "The three message IDs are not unique."),
    );
  }
  if (canonicalJson(record.messageIds) !== canonicalJson(messageIds)) {
    issues.push(
      issue(
        "MESSAGE_ID_ROLLUP",
        "messageIds does not exactly roll up the receipt IDs in destination order.",
      ),
    );
  }
  const expectedDerivation = {
    sprint183Movers: plan.sprint183.derivedCount,
    sprint184UniqueMovers: plan.sprint184.union.count,
    combinedUniqueMovers: plan.combinedUnique.count,
  };
  if (canonicalJson(record.derivation) !== canonicalJson(expectedDerivation)) {
    issues.push(
      issue(
        "DERIVATION_ROLLUP",
        "Notice derivation counts do not match the committed plan.",
      ),
    );
  }
  return issues;
}

export function createNoticeRecord(implementationHead, sendResults) {
  const resolvedHead = resolveCommit(implementationHead);
  const planBytes = gitFileBytes(resolvedHead, PLAN_PATH);
  const plan = JSON.parse(planBytes.toString("utf8"));
  const requests = buildReconnectRequests(plan, resolvedHead);
  const receipts = DESTINATIONS.map(
    ({ targetAddress, consumerKind }, index) => {
      const result = sendResults[index] ?? {};
      return {
        targetAddress,
        consumerKind,
        success: result.success,
        messageId: result.messageId,
        ...(result.sentAt === undefined ? {} : { sentAt: result.sentAt }),
      };
    },
  );
  return {
    schemaVersion: "1.0.0",
    missionId: MISSION_ID,
    kind: "three-consumer-reconnect-notices",
    status: "passed",
    auditHead: AUDIT_HEAD,
    implementationHead: resolvedHead,
    plan: {
      path: PLAN_PATH,
      bytes: planBytes.byteLength,
      sha256: sha256(planBytes),
    },
    derivation: {
      sprint183Movers: plan.sprint183.derivedCount,
      sprint184UniqueMovers: plan.sprint184.union.count,
      combinedUniqueMovers: plan.combinedUnique.count,
    },
    requests,
    receipts,
    messageIds: receipts.map(({ messageId }) => messageId),
    unrunChecks: [],
  };
}

export function validateNoticeRecord(record) {
  const issues = [];
  let resolvedHead;
  try {
    resolvedHead = resolveCommit(record?.implementationHead ?? "");
  } catch (error) {
    return [
      issue(
        "IMPLEMENTATION_HEAD_COMMIT",
        error instanceof Error ? error.message : String(error),
      ),
    ];
  }
  if (resolvedHead !== record.implementationHead) {
    issues.push(
      issue(
        "IMPLEMENTATION_HEAD_CANONICAL",
        "implementationHead is not the resolved full commit SHA.",
      ),
    );
  }
  const ancestry = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", AUDIT_HEAD, resolvedHead],
    { cwd: REPOSITORY_ROOT },
  );
  if (ancestry.status !== 0) {
    issues.push(
      issue(
        "IMPLEMENTATION_HEAD_ANCESTRY",
        "implementationHead does not descend from the frozen M07 audit head.",
      ),
    );
  }
  let planBytes;
  try {
    planBytes = gitFileBytes(resolvedHead, PLAN_PATH);
  } catch (error) {
    issues.push(
      issue(
        "COMMITTED_PLAN_MISSING",
        error instanceof Error ? error.message : String(error),
      ),
    );
    return issues;
  }
  const plan = JSON.parse(planBytes.toString("utf8"));
  const expectedPlan = deriveReconnectPlan();
  if (canonicalJson(plan) !== canonicalJson(expectedPlan)) {
    issues.push(
      issue(
        "COMMITTED_PLAN_STALE",
        "The implementation-head plan differs from fresh Git derivation.",
      ),
    );
  }
  const expectedPlanReference = {
    path: PLAN_PATH,
    bytes: planBytes.byteLength,
    sha256: sha256(planBytes),
  };
  if (canonicalJson(record.plan) !== canonicalJson(expectedPlanReference)) {
    issues.push(
      issue(
        "PLAN_BINDING",
        "Notice record does not byte-bind the committed reconnect plan.",
      ),
    );
  }
  return [...issues, ...validateNoticeShape(record, plan)];
}

const RETIRED_DASHBOARD_PROJECT_ID = "0dc6bde8-2c52-4ffb-8a90-7cbe35eb031c";
const DISPOSITION_STATUS_MEANING =
  "Passed means both active consumers received the exact Git-derived notice and the archived consumer has an explicit, machine-readable retirement disposition; no message id is fabricated.";
const DASHBOARD_ARCHIVED_MESSAGE =
  "Dashboard error: Project 'dashboard-demos' is archived and no longer accepts messages.";
const DASHBOARD_TERMINAL_DISPOSITION =
  "Retired from the delivery requirement by explicit product-owner direction; no message id exists or is fabricated.";
const RETIREMENT_REASON =
  "The destination is archived, refuses messages, and is no longer an active project.";
const RETIREMENT_POLICY =
  "A retired destination is closed by machine-readable disposition, not by a fabricated successful delivery or message id.";

function hasExactKeys(value, expectedKeys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return (
    canonicalJson(Object.keys(value).sort(compareCodePoint)) ===
    canonicalJson([...expectedKeys].sort(compareCodePoint))
  );
}

function requireExactKeys(issues, value, expectedKeys, code, label) {
  if (!hasExactKeys(value, expectedKeys)) {
    issues.push(
      issue(code, `${label} does not have the exact retained evidence fields.`),
    );
  }
}

function reconnectRequestSha256(request) {
  return sha256(canonicalJson(request));
}

function expectedPlanFinalizationDisposition(plan) {
  const activeDestinations = [plan.destinations[0], plan.destinations[2]].map(
    ({ targetAddress, consumerKind }) => ({ targetAddress, consumerKind }),
  );
  const effectiveActiveRequirement = plan.finalization.requiredMessageIds - 1;
  return {
    historicalFinalization: { ...plan.finalization },
    unrunCheckDispositions: [
      {
        check: plan.unrunChecks[0],
        resolution: "satisfied",
        evidence: "implementation-head-and-plan-byte-binding",
      },
      {
        check: plan.unrunChecks[1],
        resolution: "two-active-sends-satisfied-one-retired",
        preservedRequiredSuccessfulDeliveries: effectiveActiveRequirement,
        supersededRetiredDeliveryRequirements: 1,
      },
      {
        check: plan.unrunChecks[2],
        resolution: "two-active-message-ids-satisfied-one-retired",
        preservedRequiredMessageIds: effectiveActiveRequirement,
        supersededRetiredMessageIdRequirements: 1,
      },
    ],
    supersession: {
      authority: "product-owner",
      scope: "retired-destination-only",
      effectiveDispositionRecordPath: DISPOSITION_PATH,
      strictThreeSuccessNoticeContractPreserved: true,
      retiredDestination: {
        ...plan.destinations[1],
        projectId: RETIRED_DASHBOARD_PROJECT_ID,
      },
      preservedActiveDestinations: activeDestinations,
      supersededRequirements: {
        successfulDeliveryForRetiredDestination: true,
        messageIdForRetiredDestination: true,
      },
      preservedRequirements: {
        implementationHeadCommit:
          plan.finalization.requiresImplementationHeadCommit,
        successfulActiveDeliveries: effectiveActiveRequirement,
        uniqueNonEmptyActiveMessageIds: effectiveActiveRequirement,
        activeMessageIdsMustBeNonEmptyAndUnique:
          plan.finalization.messageIdsMustBeNonEmptyAndUnique,
        activeRequestsMustRemainGitDerived: true,
      },
    },
  };
}

export function validateDispositionShape(record, plan) {
  const issues = [];
  requireExactKeys(
    issues,
    record,
    [
      "schemaVersion",
      "missionId",
      "kind",
      "status",
      "recordingStatus",
      "deliveryStatus",
      "criterionStatus",
      "statusMeaning",
      "auditHead",
      "implementationHead",
      "plan",
      "planFinalizationDisposition",
      "derivation",
      "attempts",
      "successfulMessageIds",
      "summary",
      "retirementDecision",
    ],
    "DISPOSITION_FIELDS",
    "Disposition record",
  );
  requireExactKeys(
    issues,
    record?.plan,
    ["path", "revision", "bytes", "sha256"],
    "DISPOSITION_PLAN_FIELDS",
    "Plan binding",
  );
  requireExactKeys(
    issues,
    record?.derivation,
    [
      "sprint183Movers",
      "sprint184TrancheMovers",
      "sprint184UniqueMovers",
      "sprint184DuplicatesRemoved",
      "crossSprintOverlap",
      "combinedUniqueMovers",
    ],
    "DISPOSITION_DERIVATION_FIELDS",
    "Derivation",
  );
  requireExactKeys(
    issues,
    record?.summary,
    [
      "requiredDestinations",
      "attemptedDestinations",
      "dispositionedDestinations",
      "deliveryAttempts",
      "successfulDeliveries",
      "retiredDestinations",
      "failedDeliveryAttempts",
      "unresolvedDestinations",
      "recordedMessageIds",
      "allActiveDeliveriesProven",
      "allRequiredConsumerObligationsDispositioned",
    ],
    "DISPOSITION_SUMMARY_FIELDS",
    "Summary",
  );
  const expectedFinalizationDisposition =
    expectedPlanFinalizationDisposition(plan);
  const finalizationDispositionProven =
    canonicalJson(record?.planFinalizationDisposition) ===
    canonicalJson(expectedFinalizationDisposition);
  if (!finalizationDispositionProven) {
    issues.push(
      issue(
        "PLAN_FINALIZATION_DISPOSITION",
        "Plan finalization and unrun checks are not exactly dispositioned by the narrow product-owner retirement supersession.",
      ),
    );
  }
  requireExactKeys(
    issues,
    record?.retirementDecision,
    ["authority", "targetAddress", "projectId", "reason", "policy"],
    "RETIREMENT_DECISION_FIELDS",
    "Retirement decision",
  );
  if (
    record?.schemaVersion !== "1.0.0" ||
    record?.missionId !== MISSION_ID ||
    record?.kind !== "three-consumer-reconnect-disposition"
  ) {
    issues.push(
      issue(
        "DISPOSITION_IDENTITY",
        "Disposition record identity does not match the retained M07 reconnect contract.",
      ),
    );
  }
  if (
    record?.status !== "passed" ||
    record?.recordingStatus !== "passed" ||
    record?.deliveryStatus !== "completed-with-retired-consumer" ||
    record?.criterionStatus !== "passed" ||
    record?.statusMeaning !== DISPOSITION_STATUS_MEANING
  ) {
    issues.push(
      issue(
        "DISPOSITION_STATUS",
        "Disposition status does not prove the two deliveries and retired consumer as complete.",
      ),
    );
  }
  if (record?.auditHead !== AUDIT_HEAD) {
    issues.push(
      issue(
        "DISPOSITION_AUDIT_HEAD",
        "Disposition record does not name the frozen M07 audit head.",
      ),
    );
  }

  const attempts = Array.isArray(record?.attempts) ? record.attempts : [];
  const attemptDestinations = attempts.map((attempt) => ({
    targetAddress: attempt?.targetAddress,
    consumerKind: attempt?.consumerKind,
  }));
  const destinationsExact =
    canonicalJson(attemptDestinations) === canonicalJson(plan.destinations);
  if (!destinationsExact) {
    issues.push(
      issue(
        "DISPOSITION_DESTINATIONS",
        "Attempts must cover the plan's three destinations once and in plan order.",
      ),
    );
  }

  const sentIndexes = [0, 2];
  const sentMessageIds = [];
  const activeAttemptsProven = [];
  let expectedRequests = [];
  if (/^[0-9a-f]{40}$/.test(record?.implementationHead ?? "")) {
    expectedRequests = buildReconnectRequests(plan, record.implementationHead);
  } else {
    issues.push(
      issue(
        "DISPOSITION_IMPLEMENTATION_HEAD",
        "implementationHead is not a full Git SHA for request derivation.",
      ),
    );
  }
  for (const index of sentIndexes) {
    const destination = plan.destinations[index];
    const attempt = attempts[index];
    requireExactKeys(
      issues,
      attempt,
      [
        "targetAddress",
        "consumerKind",
        "status",
        "attemptCount",
        "requestSha256",
        "result",
      ],
      "DELIVERED_ATTEMPT_FIELDS",
      `${destination?.targetAddress ?? `Destination ${index}`} attempt`,
    );
    requireExactKeys(
      issues,
      attempt?.result,
      ["success", "messageId"],
      "DELIVERED_RESULT_FIELDS",
      `${destination?.targetAddress ?? `Destination ${index}`} result`,
    );
    const messageId = attempt?.result?.messageId;
    const messageIdValid =
      typeof messageId === "string" && messageId.trim().length > 0;
    const expectedRequestSha256 = expectedRequests[index]
      ? reconnectRequestSha256(expectedRequests[index])
      : undefined;
    const requestBound =
      expectedRequestSha256 !== undefined &&
      attempt?.requestSha256 === expectedRequestSha256;
    const activeAttemptProven =
      attempt?.targetAddress === destination?.targetAddress &&
      attempt?.consumerKind === destination?.consumerKind &&
      attempt?.status === "sent" &&
      attempt?.attemptCount === 1 &&
      attempt?.result?.success === true &&
      messageIdValid &&
      requestBound;
    activeAttemptsProven.push(activeAttemptProven);
    if (
      !attempt ||
      attempt.targetAddress !== destination?.targetAddress ||
      attempt.consumerKind !== destination?.consumerKind ||
      attempt.status !== "sent" ||
      attempt.result?.success !== true
    ) {
      issues.push(
        issue(
          "DELIVERED_CONSUMER",
          `${destination?.targetAddress ?? `destination ${index}`} is not recorded as successfully sent.`,
        ),
      );
    }
    if (attempt?.attemptCount !== 1) {
      issues.push(
        issue(
          "DELIVERED_ATTEMPT_COUNT",
          `${destination?.targetAddress ?? `destination ${index}`} must record exactly one successful delivery attempt.`,
        ),
      );
    }
    if (!requestBound) {
      issues.push(
        issue(
          "DELIVERED_REQUEST_BINDING",
          `${destination?.targetAddress ?? `destination ${index}`} does not hash the exact Git-derived request for its destination and body.`,
        ),
      );
    }
    if (!messageIdValid) {
      issues.push(
        issue(
          "DELIVERED_MESSAGE_ID",
          `${destination?.targetAddress ?? `destination ${index}`} does not carry a non-empty message ID.`,
        ),
      );
    } else {
      sentMessageIds.push(messageId);
    }
  }
  if (
    sentMessageIds.length === 2 &&
    new Set(sentMessageIds).size !== sentMessageIds.length
  ) {
    issues.push(
      issue(
        "DELIVERED_MESSAGE_IDS_UNIQUE",
        "The two delivered-consumer message IDs are not unique.",
      ),
    );
  }
  const dashboardAttempt = attempts[1];
  requireExactKeys(
    issues,
    dashboardAttempt,
    [
      "targetAddress",
      "consumerKind",
      "status",
      "attemptCount",
      "result",
      "failure",
    ],
    "RETIRED_ATTEMPT_FIELDS",
    "Dashboard Demos attempt",
  );
  requireExactKeys(
    issues,
    dashboardAttempt?.result,
    ["success", "errorCode"],
    "RETIRED_RESULT_FIELDS",
    "Dashboard Demos result",
  );
  requireExactKeys(
    issues,
    dashboardAttempt?.failure,
    ["classification", "projectId", "message", "terminalDisposition"],
    "RETIRED_FAILURE_FIELDS",
    "Dashboard Demos failure",
  );
  const retiredAttemptProven =
    dashboardAttempt?.targetAddress === plan.destinations[1]?.targetAddress &&
    dashboardAttempt?.consumerKind === plan.destinations[1]?.consumerKind &&
    dashboardAttempt?.status === "retired" &&
    dashboardAttempt?.attemptCount === 2 &&
    dashboardAttempt?.result?.success === false &&
    dashboardAttempt?.result?.errorCode === "DASHBOARD_ERROR" &&
    dashboardAttempt?.failure?.classification === "archived-project" &&
    dashboardAttempt?.failure?.projectId === RETIRED_DASHBOARD_PROJECT_ID &&
    dashboardAttempt?.failure?.message === DASHBOARD_ARCHIVED_MESSAGE &&
    dashboardAttempt?.failure?.terminalDisposition ===
      DASHBOARD_TERMINAL_DISPOSITION;
  if (!retiredAttemptProven) {
    issues.push(
      issue(
        "RETIRED_CONSUMER",
        "Dashboard Demos is not recorded as the exact archived consumer retired after two rejected sends.",
      ),
    );
  }
  if (
    (dashboardAttempt &&
      Object.prototype.hasOwnProperty.call(dashboardAttempt, "messageId")) ||
    (dashboardAttempt?.result &&
      Object.prototype.hasOwnProperty.call(
        dashboardAttempt.result,
        "messageId",
      )) ||
    (dashboardAttempt?.failure &&
      Object.prototype.hasOwnProperty.call(
        dashboardAttempt.failure,
        "messageId",
      )) ||
    Object.prototype.hasOwnProperty.call(record ?? {}, "messageIds")
  ) {
    issues.push(
      issue(
        "RETIRED_MESSAGE_ID",
        "The retired Dashboard Demos consumer must not carry a fabricated message ID.",
      ),
    );
  }
  if (dashboardAttempt?.failure?.retryCondition !== undefined) {
    issues.push(
      issue(
        "RETIRED_RETRY_CONDITION",
        "A retired consumer must not retain a retry condition.",
      ),
    );
  }
  if (record?.blocker !== undefined) {
    issues.push(
      issue(
        "DISPOSITION_BLOCKER",
        "A completed consumer disposition must not retain a blocker.",
      ),
    );
  }
  const retirementDecisionInvalid =
    record?.retirementDecision?.authority !== "product-owner" ||
    record?.retirementDecision?.targetAddress !==
      plan.destinations[1]?.targetAddress ||
    record?.retirementDecision?.projectId !== RETIRED_DASHBOARD_PROJECT_ID ||
    record?.retirementDecision?.reason !== RETIREMENT_REASON ||
    record?.retirementDecision?.policy !== RETIREMENT_POLICY;
  if (retirementDecisionInvalid) {
    issues.push(
      issue(
        "RETIREMENT_DECISION",
        "Dashboard Demos lacks the exact product-owner retirement disposition.",
      ),
    );
  }

  if (
    canonicalJson(record?.successfulMessageIds) !==
    canonicalJson(sentMessageIds)
  ) {
    issues.push(
      issue(
        "DISPOSITION_MESSAGE_ID_ROLLUP",
        "successfulMessageIds does not exactly roll up the two sent receipts in destination order.",
      ),
    );
  }

  const expectedDerivation = {
    sprint183Movers: plan.sprint183.derivedCount,
    sprint184TrancheMovers: plan.sprint184.union.sourceCount,
    sprint184UniqueMovers: plan.sprint184.union.count,
    sprint184DuplicatesRemoved: plan.sprint184.union.duplicatesRemoved,
    crossSprintOverlap: plan.combinedUnique.crossSprintOverlap,
    combinedUniqueMovers: plan.combinedUnique.count,
  };
  if (canonicalJson(record?.derivation) !== canonicalJson(expectedDerivation)) {
    issues.push(
      issue(
        "DISPOSITION_DERIVATION",
        "Disposition counts do not exactly match the Git-derived 10/48/51 reconnect population.",
      ),
    );
  }

  const provenActiveDeliveries = activeAttemptsProven.filter(Boolean).length;
  const validRetiredAttempts = retiredAttemptProven ? [dashboardAttempt] : [];
  const attemptedDestinations = new Set(
    attempts.map((attempt) => attempt?.targetAddress),
  ).size;
  const dispositionedDestinations =
    provenActiveDeliveries + validRetiredAttempts.length;
  const deliveryAttempts = attempts.reduce(
    (total, attempt) =>
      total +
      (Number.isInteger(attempt?.attemptCount) && attempt.attemptCount > 0
        ? attempt.attemptCount
        : 0),
    0,
  );
  const failedDeliveryAttempts = attempts.reduce(
    (total, attempt) =>
      total +
      (attempt?.result?.success === false &&
      Number.isInteger(attempt?.attemptCount) &&
      attempt.attemptCount > 0
        ? attempt.attemptCount
        : 0),
    0,
  );
  const unresolvedDestinations = Math.max(
    plan.destinations.length - dispositionedDestinations,
    0,
  );
  const activeDeliveryProof =
    activeAttemptsProven.length === sentIndexes.length &&
    activeAttemptsProven.every(Boolean) &&
    sentMessageIds.length === sentIndexes.length &&
    new Set(sentMessageIds).size === sentMessageIds.length;
  const expectedSummary = {
    requiredDestinations: plan.destinations.length,
    attemptedDestinations,
    dispositionedDestinations,
    deliveryAttempts,
    successfulDeliveries: provenActiveDeliveries,
    retiredDestinations: validRetiredAttempts.length,
    failedDeliveryAttempts,
    unresolvedDestinations,
    recordedMessageIds: sentMessageIds.length,
    allActiveDeliveriesProven: activeDeliveryProof,
    allRequiredConsumerObligationsDispositioned:
      destinationsExact &&
      activeDeliveryProof &&
      retiredAttemptProven &&
      !retirementDecisionInvalid &&
      finalizationDispositionProven &&
      dispositionedDestinations === plan.destinations.length,
  };
  if (canonicalJson(record?.summary) !== canonicalJson(expectedSummary)) {
    issues.push(
      issue(
        "DISPOSITION_SUMMARY",
        "Summary does not prove all three consumer obligations dispositioned as two sends and one retirement.",
      ),
    );
  }
  return issues;
}

export function validateDispositionRecord(
  record,
  { repositoryRoot = REPOSITORY_ROOT } = {},
) {
  const issues = [];
  let resolvedHead;
  try {
    resolvedHead = resolveCommit(
      record?.implementationHead ?? "",
      repositoryRoot,
    );
  } catch (error) {
    return [
      issue(
        "DISPOSITION_IMPLEMENTATION_HEAD_COMMIT",
        error instanceof Error ? error.message : String(error),
      ),
    ];
  }
  if (resolvedHead !== record.implementationHead) {
    issues.push(
      issue(
        "DISPOSITION_IMPLEMENTATION_HEAD_CANONICAL",
        "implementationHead is not the resolved full commit SHA.",
      ),
    );
  }
  const ancestry = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", AUDIT_HEAD, resolvedHead],
    { cwd: repositoryRoot },
  );
  if (ancestry.status !== 0) {
    issues.push(
      issue(
        "DISPOSITION_IMPLEMENTATION_HEAD_ANCESTRY",
        "implementationHead does not descend from the frozen M07 audit head.",
      ),
    );
  }

  let planBytes;
  try {
    planBytes = gitFileBytes(resolvedHead, PLAN_PATH, repositoryRoot);
  } catch (error) {
    issues.push(
      issue(
        "DISPOSITION_COMMITTED_PLAN_MISSING",
        error instanceof Error ? error.message : String(error),
      ),
    );
    return issues;
  }
  const plan = JSON.parse(planBytes.toString("utf8"));
  if (
    canonicalJson(plan) !== canonicalJson(deriveReconnectPlan(repositoryRoot))
  ) {
    issues.push(
      issue(
        "DISPOSITION_COMMITTED_PLAN_STALE",
        "The implementation-head plan differs from fresh Git derivation.",
      ),
    );
  }
  const expectedPlanReference = {
    path: PLAN_PATH,
    revision: resolvedHead,
    bytes: planBytes.byteLength,
    sha256: sha256(planBytes),
  };
  if (canonicalJson(record?.plan) !== canonicalJson(expectedPlanReference)) {
    issues.push(
      issue(
        "DISPOSITION_PLAN_BINDING",
        "Disposition record does not byte-bind the implementation-head reconnect plan.",
      ),
    );
  }
  return [...issues, ...validateDispositionShape(record, plan)];
}

function writeArtifact(repositoryPath, value) {
  const absolutePath = path.join(REPOSITORY_ROOT, repositoryPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, canonicalJson(value));
}

function checkPlan() {
  const expected = canonicalJson(deriveReconnectPlan());
  const actual = fs.readFileSync(path.join(REPOSITORY_ROOT, PLAN_PATH), "utf8");
  if (actual !== expected) throw new Error(`${PLAN_PATH} is stale.`);
}

const isDirectInvocation =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectInvocation) {
  const [action = "--check-plan", ...operands] = process.argv.slice(2);
  if (action === "--write-plan") {
    writeArtifact(PLAN_PATH, deriveReconnectPlan());
    process.stdout.write(`${PLAN_PATH}\n`);
  } else if (action === "--check-plan") {
    checkPlan();
    process.stdout.write("reconnect plan is current\n");
  } else if (action === "--requests") {
    const implementationHead = resolveCommit(operands[0]);
    const plan = readJsonAt(implementationHead, PLAN_PATH);
    process.stdout.write(
      canonicalJson(buildReconnectRequests(plan, implementationHead)),
    );
  } else if (action === "--write-notices") {
    const [implementationHead] = operands;
    if (!implementationHead || operands.length !== 1) {
      throw new Error(
        "--write-notices requires one implementation head; pass the three send-result objects as a JSON array on stdin.",
      );
    }
    const sendResults = JSON.parse(fs.readFileSync(0, "utf8"));
    if (!Array.isArray(sendResults) || sendResults.length !== 3) {
      throw new Error("stdin must contain exactly three send-result objects.");
    }
    const record = createNoticeRecord(implementationHead, sendResults);
    const issues = validateNoticeRecord(record);
    if (issues.length > 0) throw new Error(canonicalJson(issues));
    writeArtifact(NOTICES_PATH, record);
    process.stdout.write(`${NOTICES_PATH}\n`);
  } else if (action === "--check-notices") {
    const record = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, NOTICES_PATH), "utf8"),
    );
    const issues = validateNoticeRecord(record);
    if (issues.length > 0) throw new Error(canonicalJson(issues));
    process.stdout.write("reconnect notices are valid\n");
  } else if (action === "--check-disposition") {
    const record = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, DISPOSITION_PATH), "utf8"),
    );
    const issues = validateDispositionRecord(record);
    if (issues.length > 0) throw new Error(canonicalJson(issues));
    process.stdout.write("reconnect consumer disposition is valid\n");
  } else {
    throw new Error(`Unknown action ${action}.`);
  }
}
