const VALID_OUTCOMES = new Set(["approved", "rejected"]);
const VALID_REVIEW_DISPOSITIONS = new Set(["accepted", "rejected"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function compareCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function canonicalCells(cells) {
  if (!Array.isArray(cells)) return null;
  const normalized = [];
  for (const cell of cells) {
    if (
      !isObject(cell) ||
      typeof cell.target !== "string" ||
      cell.target.length === 0 ||
      typeof cell.componentId !== "string" ||
      cell.componentId.length === 0
    ) {
      return null;
    }
    normalized.push({ target: cell.target, componentId: cell.componentId });
  }
  return normalized.sort((left, right) =>
    compareCodePoint(
      `${left.target}:${left.componentId}`,
      `${right.target}:${right.componentId}`,
    ),
  );
}

function rawApprovalBooleanPaths(value, prefix = "record") {
  if (!isObject(value) && !Array.isArray(value)) return [];
  const paths = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${prefix}.${key}`;
    if (
      typeof child === "boolean" &&
      /^(?:(?:is)?approved?|approval|independentReviewApproved)$/i.test(key)
    ) {
      paths.push(childPath);
    }
    paths.push(...rawApprovalBooleanPaths(child, childPath));
  }
  return paths;
}

function addMismatch(reasons, code, label, expected, actual) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    reasons.push({
      code,
      message: `${label} does not match the independently fixed expectation`,
    });
  }
}

function canonicalPrincipal(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().toLocaleLowerCase("en-US")
    : null;
}

/**
 * Evaluate a review record against a caller-owned, immutable expectation.
 *
 * The record contains categorical dispositions rather than a mutable approval
 * boolean. The caller fixes the producer, reviewer, authorizer, source heads,
 * cell scope, and verification membership independently of the record being
 * evaluated. A record cannot authorize the expectations used to validate
 * itself.
 */
export function evaluateIndependentReviewApproval({ record, expectation }) {
  if (record === null || record === undefined) {
    return { outcome: "missing", reasons: [] };
  }

  const reasons = [];
  if (!isObject(record)) {
    return {
      outcome: "invalid",
      reasons: [
        {
          code: "record-shape",
          message: "Independent-review record must be an object",
        },
      ],
    };
  }
  if (!isObject(expectation)) {
    return {
      outcome: "invalid",
      reasons: [
        {
          code: "expectation-shape",
          message: "Independent-review expectation must be an object",
        },
      ],
    };
  }

  const rawBooleanPaths = rawApprovalBooleanPaths(record);
  if (rawBooleanPaths.length > 0) {
    reasons.push({
      code: "raw-approval-boolean",
      message: `Approval must be a validated categorical disposition, not a raw boolean: ${rawBooleanPaths.join(", ")}`,
    });
  }

  addMismatch(
    reasons,
    "schema-drift",
    "schemaVersion",
    "1.0.0",
    record.schemaVersion,
  );
  addMismatch(
    reasons,
    "kind-drift",
    "kind",
    "independent-review-approval",
    record.kind,
  );
  addMismatch(
    reasons,
    "predicate-drift",
    "predicate",
    expectation.predicate,
    record.predicate,
  );

  const subject = isObject(record.subject) ? record.subject : {};
  const review = isObject(record.review) ? record.review : {};
  const authorization = isObject(record.authorization)
    ? record.authorization
    : {};

  addMismatch(
    reasons,
    "producer-session-drift",
    "producer session",
    expectation.producerSessionId,
    subject.producerSessionId,
  );
  addMismatch(
    reasons,
    "producer-actor-drift",
    "producer actor",
    expectation.producerActor,
    subject.producerActor,
  );
  addMismatch(
    reasons,
    "review-session-drift",
    "review session",
    expectation.reviewSessionId,
    review.sessionId,
  );
  addMismatch(
    reasons,
    "reviewer-actor-drift",
    "reviewer actor",
    expectation.reviewerActor,
    review.reviewerActor,
  );
  addMismatch(
    reasons,
    "authorization-session-drift",
    "authorization session",
    expectation.authorizationSessionId,
    authorization.sessionId,
  );
  addMismatch(
    reasons,
    "authorizer-principal-drift",
    "authorizer principal",
    expectation.authorizerPrincipal,
    authorization.authorizedBy,
  );
  addMismatch(
    reasons,
    "derivation-head-drift",
    "derivation head",
    expectation.derivationHead,
    subject.derivationHead,
  );
  addMismatch(
    reasons,
    "review-head-drift",
    "reviewed head",
    expectation.reviewedHead,
    review.reviewedHead,
  );
  addMismatch(
    reasons,
    "review-decision-drift",
    "review decision",
    expectation.reviewDecisionId,
    review.decisionId,
  );
  addMismatch(
    reasons,
    "review-timestamp-drift",
    "review timestamp",
    expectation.reviewedAt,
    review.reviewedAt,
  );
  addMismatch(
    reasons,
    "authorization-decision-drift",
    "authorization decision",
    expectation.authorizationDecisionId,
    authorization.decisionId,
  );
  addMismatch(
    reasons,
    "authorization-timestamp-drift",
    "authorization timestamp",
    expectation.authorizedAt,
    authorization.authorizedAt,
  );
  if (typeof expectation.reviewDisposition === "string") {
    addMismatch(
      reasons,
      "review-disposition-drift",
      "review disposition",
      expectation.reviewDisposition,
      review.disposition,
    );
  }
  if (typeof expectation.authorizationDisposition === "string") {
    addMismatch(
      reasons,
      "authorization-disposition-drift",
      "authorization disposition",
      expectation.authorizationDisposition,
      authorization.disposition,
    );
  }

  const sessions = [
    subject.producerSessionId,
    review.sessionId,
    authorization.sessionId,
  ];
  if (
    sessions.some((sessionId) => typeof sessionId !== "string") ||
    new Set(sessions).size !== sessions.length
  ) {
    reasons.push({
      code: "self-review",
      message:
        "Producer, independent reviewer, and authorizing session must be three distinct sessions",
    });
  }

  const principals = [
    canonicalPrincipal(subject.producerActor),
    canonicalPrincipal(review.reviewerActor),
    canonicalPrincipal(authorization.authorizedBy),
  ];
  if (
    principals.some((principal) => principal === null) ||
    new Set(principals).size !== principals.length
  ) {
    reasons.push({
      code: "self-review-actor",
      message:
        "Producer actor, independent reviewer actor, and authorizing principal must be three distinct identities",
    });
  }

  const reviewedAt = Date.parse(review.reviewedAt);
  const authorizedAt = Date.parse(authorization.authorizedAt);
  if (
    !Number.isFinite(reviewedAt) ||
    new Date(reviewedAt).toISOString() !== review.reviewedAt
  ) {
    reasons.push({
      code: "review-timestamp",
      message: "Review timestamp must be a canonical ISO instant",
    });
  }
  if (
    !Number.isFinite(authorizedAt) ||
    new Date(authorizedAt).toISOString() !== authorization.authorizedAt
  ) {
    reasons.push({
      code: "authorization-timestamp",
      message: "Authorization timestamp must be a canonical ISO instant",
    });
  }
  if (
    Number.isFinite(reviewedAt) &&
    Number.isFinite(authorizedAt) &&
    authorizedAt < reviewedAt
  ) {
    reasons.push({
      code: "authorization-before-review",
      message: "Authorization cannot predate the independent review",
    });
  }

  const actualCells = canonicalCells(authorization.cells);
  const expectedCells = canonicalCells(expectation.cells);
  if (
    actualCells === null ||
    expectedCells === null ||
    new Set(
      (actualCells ?? []).map((cell) => `${cell.target}:${cell.componentId}`),
    ).size !== (actualCells ?? []).length ||
    JSON.stringify(actualCells) !== JSON.stringify(expectedCells)
  ) {
    reasons.push({
      code: "scope-drift",
      message: "Authorization cell scope differs from the exact expected scope",
    });
  }

  const verificationRows = Array.isArray(review.verifications)
    ? review.verifications
    : [];
  const actualVerificationIds = verificationRows.map((row) => row?.id);
  if (
    verificationRows.some(
      (row) =>
        !isObject(row) || typeof row.id !== "string" || row.status !== "passed",
    ) ||
    new Set(actualVerificationIds).size !== actualVerificationIds.length ||
    JSON.stringify(actualVerificationIds) !==
      JSON.stringify(expectation.verificationIds)
  ) {
    reasons.push({
      code: "verification-drift",
      message:
        "Review verifications must be the exact expected rows, in order, with passed status",
    });
  }

  if (Array.isArray(expectation.residuals)) {
    const actualResiduals = Array.isArray(record.residuals)
      ? record.residuals.map((residual) => ({
          id: residual?.id,
          disposition: residual?.disposition,
        }))
      : [];
    addMismatch(
      reasons,
      "residual-drift",
      "review residuals",
      expectation.residuals,
      actualResiduals,
    );
  }

  if (!VALID_REVIEW_DISPOSITIONS.has(review.disposition)) {
    reasons.push({
      code: "review-disposition",
      message: "Review disposition must be accepted or rejected",
    });
  }
  if (!VALID_OUTCOMES.has(authorization.disposition)) {
    reasons.push({
      code: "authorization-disposition",
      message: "Authorization disposition must be approved or rejected",
    });
  }
  if (
    authorization.disposition === "approved" &&
    review.disposition !== "accepted"
  ) {
    reasons.push({
      code: "review-authorization-conflict",
      message: "A rejected independent review cannot be authorized as approved",
    });
  }

  if (reasons.length > 0) return { outcome: "invalid", reasons };
  return { outcome: authorization.disposition, reasons: [] };
}
