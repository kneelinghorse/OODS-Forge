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

function frozenReference(repositoryPath) {
  const bytes = gitFileBytes(AUDIT_HEAD, repositoryPath);
  return {
    path: repositoryPath,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function deriveRecordedTranche(repositoryPath) {
  const sourceRecord = readJsonAt(AUDIT_HEAD, repositoryPath);
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
    { excludeTests: true },
  );
  const recordedMovers = [...sourceRecord.movers].sort(compareCodePoint);
  const missingFromRecord = setDifference(movers, recordedMovers);
  const extraInRecord = setDifference(recordedMovers, movers);
  return {
    missionId: sourceRecord.missionId,
    sourceRecord: frozenReference(repositoryPath),
    baseCommit: resolveCommit(sourceRecord.baseCommit),
    implementationCommit: resolveCommit(
      sourceRecord.measuredImplementationCommit,
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

export function deriveReconnectPlan() {
  const sprint183Movers = gitDiffPaths(
    SPRINT_183_RANGE.baseCommit,
    SPRINT_183_RANGE.implementationCommit,
    CANONICAL_ADVERTISED_SCOPE,
  );
  const priorNotice = readJsonAt(AUDIT_HEAD, PRIOR_NOTICE_PATH);
  const priorMovers = [...priorNotice.advertisedMovers].sort(compareCodePoint);
  const recordedTranches = SPRINT_184_RECORD_PATHS.map((repositoryPath) =>
    deriveRecordedTranche(repositoryPath),
  );
  const m06Movers = gitDiffPaths(
    SPRINT_184_M06_RANGE.baseCommit,
    SPRINT_184_M06_RANGE.implementationCommit,
    SPRINT_184_M06_SCOPE,
    { excludeTests: true },
  );
  const m06 = {
    missionId: "s184-m06",
    baseCommit: resolveCommit(SPRINT_184_M06_RANGE.baseCommit),
    implementationCommit: resolveCommit(
      SPRINT_184_M06_RANGE.implementationCommit,
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
      baseCommit: resolveCommit(SPRINT_183_RANGE.baseCommit),
      implementationCommit: resolveCommit(
        SPRINT_183_RANGE.implementationCommit,
      ),
      canonicalAdvertisedScope: [...CANONICAL_ADVERTISED_SCOPE],
      derivedCount: sprint183Movers.length,
      movers: sprint183Movers,
      priorNotice: {
        sourceRecord: frozenReference(PRIOR_NOTICE_PATH),
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
  } else {
    throw new Error(`Unknown action ${action}.`);
  }
}
