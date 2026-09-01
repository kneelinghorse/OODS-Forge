import { createHash } from "node:crypto";
import {
  FORGE_SCALAR_DTCG_1_GRAMMAR,
  FORGE_SCALAR_DTCG_1_PROFILE,
  FORGE_SCALAR_DTCG_1_RULE_IDS,
  FORGE_SCALAR_DTCG_1_TYPES,
  validateForgeScalarDtcgDocument,
} from "./grammar.js";
import {
  DTCG_INTAKE_REQUEST_SCHEMA,
  isDtcgIntakeRequest,
  validateDtcgIntakeRequestStructure,
} from "./schema.js";
import type {
  DtcgIntakeIssue,
  DtcgIntakeMappingStatus,
  DtcgIntakeReceipt,
  DtcgIntakeThemeDocumentReceipt,
  DtcgMembershipDenominator,
  DtcgNotAcceptedTokenReason,
  ForgeScalarDtcgDocumentValidation,
  ForgeTargetBrandDocument,
  ForgeTargetTheme,
} from "./types.js";

export {
  DTCG_INTAKE_REQUEST_SCHEMA,
  FORGE_SCALAR_DTCG_1_GRAMMAR,
  FORGE_SCALAR_DTCG_1_PROFILE,
  FORGE_SCALAR_DTCG_1_RULE_IDS,
  FORGE_SCALAR_DTCG_1_TYPES,
  isDtcgIntakeRequest,
  validateDtcgIntakeRequestStructure,
  validateForgeScalarDtcgDocument,
};
export type * from "./types.js";
export type { DtcgIntakeStructuralValidation } from "./schema.js";

const SHA256_PATTERN = /^[a-fA-F0-9]{64}$/;
const CONTENT_ADDRESS_PATTERN = /^sha256:[a-fA-F0-9]{64}$/;
const TARGET_THEMES = new Set<string>(["light", "dark", "hc"]);
const TARGET_DOCUMENTS = new Set<string>(["base", "dark", "hc"]);
const MAPPING_STATUSES = new Set<string>([
  "PROPOSED-NOT-EXECUTABLE",
  "UNMAPPED-REQUIRES-VARIANT-SUPPORT",
]);
const VALID_TARGET_PAIRS = new Set(["light/base", "dark/dark", "hc/hc"]);
const INVALID_SOURCE_THEME_ID_PREFIX = "<invalid-theme-document-";

interface WorkingDocument {
  readonly sourceThemeId: string;
  readonly mappingStatus: DtcgIntakeMappingStatus | null;
  readonly targetTheme: ForgeTargetTheme | null;
  readonly targetBrandDocument: ForgeTargetBrandDocument | null;
  readonly operandKind:
    | "inline-document"
    | "authorized-content-addressed-reference"
    | null;
  readonly submittedNames: readonly string[];
  readonly memberLocations: ReadonlyMap<string, string>;
  readonly grammarAcceptedNames: ReadonlySet<string>;
  readonly grammarReasons: readonly (DtcgIntakeIssue & {
    readonly token_name: string;
  })[];
  readonly issues: readonly DtcgIntakeIssue[];
  readonly evaluationCompleted: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function makeIssue(
  ruleId: string,
  location: string,
  reason: string,
): DtcgIntakeIssue {
  return { ruleId, location, reason };
}

function issueKey(issue: DtcgIntakeIssue): string {
  return `${issue.ruleId}\u0000${issue.location}\u0000${issue.reason}`;
}

function sortIssues<T extends DtcgIntakeIssue>(issues: readonly T[]): T[] {
  const unique = new Map<string, T>();
  for (const issue of issues) unique.set(issueKey(issue), issue);
  return [...unique.values()].sort(
    (a, b) =>
      a.ruleId.localeCompare(b.ruleId) ||
      a.location.localeCompare(b.location) ||
      a.reason.localeCompare(b.reason),
  );
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function denominator<T>(
  membership: readonly T[],
): DtcgMembershipDenominator<T> {
  return { count: membership.length, membership: [...membership] };
}

function stringField(
  record: Record<string, unknown> | undefined,
  key: string,
): string | null {
  return typeof record?.[key] === "string" ? record[key] : null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validByteCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function structuralRequestIssues(input: unknown): DtcgIntakeIssue[] {
  let result;
  try {
    result = validateDtcgIntakeRequestStructure(input);
  } catch (error) {
    return [
      makeIssue(
        "intake/request-schema",
        "<request>",
        `Request structure could not be evaluated: ${error instanceof Error ? error.message : String(error)}.`,
      ),
    ];
  }
  return result.errors.map((error) =>
    makeIssue(
      "intake/request-schema",
      error.instancePath || "<request>",
      `${error.keyword}: ${error.message}`,
    ),
  );
}

function explicitRequestIssues(input: unknown): DtcgIntakeIssue[] {
  if (!isRecord(input)) {
    return [
      makeIssue(
        "intake/request-must-be-object",
        "<request>",
        "The DTCG intake request must be an object.",
      ),
    ];
  }

  const issues: DtcgIntakeIssue[] = [];
  if (!("apply" in input)) {
    issues.push(
      makeIssue(
        "intake/apply-required",
        "<request>.apply",
        "The dry-run request must carry apply:false explicitly.",
      ),
    );
  } else if (input.apply !== false) {
    issues.push(
      makeIssue(
        "intake/apply-must-be-false",
        "<request>.apply",
        "This engine is dry-run-only; apply must be false.",
      ),
    );
  }

  if (
    typeof input.brand_id !== "string" ||
    input.brand_id.trim().length === 0
  ) {
    issues.push(
      makeIssue(
        "intake/brand-id-required",
        "<request>.brand_id",
        "A non-empty requested brand_id is required and is echoed without creating a brand.",
      ),
    );
  } else if (input.brand_id.includes("::")) {
    issues.push(
      makeIssue(
        "intake/brand-id-reserved-delimiter",
        "<request>.brand_id",
        'brand_id must not contain the reserved token-instance delimiter "::".',
      ),
    );
  }

  if (input.profile !== FORGE_SCALAR_DTCG_1_PROFILE) {
    issues.push(
      makeIssue(
        "intake/unsupported-profile",
        "<request>.profile",
        `Unknown profile "${String(input.profile)}"; supported profile is ${FORGE_SCALAR_DTCG_1_PROFILE}.`,
      ),
    );
  }

  if (
    !Array.isArray(input.theme_documents) ||
    input.theme_documents.length === 0
  ) {
    issues.push(
      makeIssue(
        "intake/theme-documents-required",
        "<request>.theme_documents",
        "theme_documents must be a non-empty array.",
      ),
    );
  }
  return issues;
}

function integrityIssues(
  raw: Record<string, unknown>,
  location: string,
  inlineDocument: unknown | undefined,
): DtcgIntakeIssue[] {
  const issues: DtcgIntakeIssue[] = [];
  const shaFields = [
    "source_file_sha256",
    "source_order_compact_json_sha256",
  ] as const;
  const byteFields = [
    "source_file_bytes",
    "source_order_compact_json_bytes",
  ] as const;

  for (const field of shaFields) {
    if (typeof raw[field] !== "string" || !SHA256_PATTERN.test(raw[field])) {
      issues.push(
        makeIssue(
          "intake/invalid-integrity-metadata",
          `${location}.${field}`,
          `${field} must be a 64-character hexadecimal SHA-256 digest.`,
        ),
      );
    }
  }
  for (const field of byteFields) {
    if (!validByteCount(raw[field])) {
      issues.push(
        makeIssue(
          "intake/invalid-integrity-metadata",
          `${location}.${field}`,
          `${field} must be a non-negative integer byte count.`,
        ),
      );
    }
  }

  if (inlineDocument === undefined) return issues;

  let compact: string | undefined;
  try {
    compact = JSON.stringify(inlineDocument);
  } catch (error) {
    issues.push(
      makeIssue(
        "intake/inline-document-not-json-serializable",
        `${location}.document_operand.document`,
        `Inline document is not JSON-serializable: ${error instanceof Error ? error.message : String(error)}.`,
      ),
    );
  }
  if (compact === undefined) return issues;

  const compactDigest = sha256(compact);
  const compactBytes = Buffer.byteLength(compact, "utf8");
  if (
    typeof raw.source_order_compact_json_sha256 === "string" &&
    SHA256_PATTERN.test(raw.source_order_compact_json_sha256) &&
    raw.source_order_compact_json_sha256.toLowerCase() !== compactDigest
  ) {
    issues.push(
      makeIssue(
        "intake/source-order-compact-json-sha256-mismatch",
        `${location}.source_order_compact_json_sha256`,
        `Declared compact JSON SHA-256 does not match JSON.stringify(document): expected ${compactDigest}.`,
      ),
    );
  }
  if (
    validByteCount(raw.source_order_compact_json_bytes) &&
    raw.source_order_compact_json_bytes !== compactBytes
  ) {
    issues.push(
      makeIssue(
        "intake/source-order-compact-json-bytes-mismatch",
        `${location}.source_order_compact_json_bytes`,
        `Declared compact JSON byte count does not match JSON.stringify(document): expected ${compactBytes}.`,
      ),
    );
  }
  return issues;
}

function mappingIssues(
  mappingStatus: DtcgIntakeMappingStatus | null,
  targetTheme: ForgeTargetTheme | null,
  targetDocument: ForgeTargetBrandDocument | null,
  location: string,
): DtcgIntakeIssue[] {
  if (mappingStatus === "UNMAPPED-REQUIRES-VARIANT-SUPPORT") {
    if (targetTheme !== null || targetDocument !== null) {
      return [
        makeIssue(
          "intake/invalid-unmapped-target",
          `${location}.mapping_status`,
          "An unmapped theme must carry null target_theme and target_brand_document.",
        ),
      ];
    }
    return [
      makeIssue(
        "unmapped-target",
        `${location}.mapping_status`,
        "Source theme has no current Forge target; variant support is required before acceptance.",
      ),
    ];
  }
  if (mappingStatus === "PROPOSED-NOT-EXECUTABLE") {
    if (!VALID_TARGET_PAIRS.has(`${targetTheme}/${targetDocument}`)) {
      return [
        makeIssue(
          "intake/invalid-target-mapping",
          `${location}.target_theme`,
          "Mapped targets must be one of light/base, dark/dark, or hc/hc.",
        ),
      ];
    }
    return [];
  }
  return [
    makeIssue(
      "intake/unsupported-mapping-status",
      `${location}.mapping_status`,
      "mapping_status must be PROPOSED-NOT-EXECUTABLE or UNMAPPED-REQUIRES-VARIANT-SUPPORT.",
    ),
  ];
}

function themeSourceCounts(
  themeDocuments: readonly unknown[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const raw of themeDocuments) {
    if (!isRecord(raw) || typeof raw.source_theme_id !== "string") continue;
    counts.set(raw.source_theme_id, (counts.get(raw.source_theme_id) ?? 0) + 1);
  }
  return counts;
}

function processThemeDocument(
  value: unknown,
  index: number,
  sourceCounts: ReadonlyMap<string, number>,
  structuralIssues: readonly DtcgIntakeIssue[],
): WorkingDocument {
  const location = `<request>.theme_documents[${index}]`;
  if (!isRecord(value)) {
    return {
      sourceThemeId: `<theme-document-${index + 1}>`,
      mappingStatus: null,
      targetTheme: null,
      targetBrandDocument: null,
      operandKind: null,
      submittedNames: [],
      memberLocations: new Map(),
      grammarAcceptedNames: new Set(),
      grammarReasons: [],
      issues: sortIssues([
        ...structuralIssues,
        makeIssue(
          "intake/theme-document-must-be-object",
          location,
          "Theme document must be an object.",
        ),
      ]),
      evaluationCompleted: false,
    };
  }

  const rawSourceThemeId = stringField(value, "source_theme_id");
  const sourceThemeIdIsUsable =
    rawSourceThemeId !== null &&
    rawSourceThemeId.trim().length > 0 &&
    rawSourceThemeId === rawSourceThemeId.trim() &&
    !rawSourceThemeId.includes("::") &&
    !rawSourceThemeId.startsWith(INVALID_SOURCE_THEME_ID_PREFIX) &&
    (sourceCounts.get(rawSourceThemeId) ?? 0) === 1;
  const sourceThemeId = sourceThemeIdIsUsable
    ? rawSourceThemeId
    : `${INVALID_SOURCE_THEME_ID_PREFIX}${index + 1}>`;
  const rawMappingStatus = stringField(value, "mapping_status");
  const mappingStatus =
    rawMappingStatus !== null && MAPPING_STATUSES.has(rawMappingStatus)
      ? (rawMappingStatus as DtcgIntakeMappingStatus)
      : null;
  const rawTargetTheme = value.target_theme;
  const targetTheme =
    typeof rawTargetTheme === "string" && TARGET_THEMES.has(rawTargetTheme)
      ? (rawTargetTheme as ForgeTargetTheme)
      : null;
  const rawTargetDocument = value.target_brand_document;
  const targetBrandDocument =
    typeof rawTargetDocument === "string" &&
    TARGET_DOCUMENTS.has(rawTargetDocument)
      ? (rawTargetDocument as ForgeTargetBrandDocument)
      : null;

  const issues: DtcgIntakeIssue[] = [...structuralIssues];
  if (rawSourceThemeId === null || rawSourceThemeId.trim().length === 0) {
    issues.push(
      makeIssue(
        "intake/source-theme-id-required",
        `${location}.source_theme_id`,
        "source_theme_id must be a non-empty string.",
      ),
    );
  } else if (rawSourceThemeId !== rawSourceThemeId.trim()) {
    issues.push(
      makeIssue(
        "intake/source-theme-id-must-be-trimmed",
        `${location}.source_theme_id`,
        "source_theme_id must not contain leading or trailing whitespace.",
      ),
    );
  } else if (rawSourceThemeId.includes("::")) {
    issues.push(
      makeIssue(
        "intake/source-theme-id-reserved-delimiter",
        `${location}.source_theme_id`,
        'source_theme_id must not contain the reserved token-instance delimiter "::".',
      ),
    );
  } else if (rawSourceThemeId.startsWith(INVALID_SOURCE_THEME_ID_PREFIX)) {
    issues.push(
      makeIssue(
        "intake/source-theme-id-reserved-internal-prefix",
        `${location}.source_theme_id`,
        `source_theme_id must not start with the reserved internal prefix "${INVALID_SOURCE_THEME_ID_PREFIX}".`,
      ),
    );
  }
  if (
    rawSourceThemeId !== null &&
    (sourceCounts.get(rawSourceThemeId) ?? 0) > 1
  ) {
    issues.push(
      makeIssue(
        "intake/duplicate-source-theme-id",
        `${location}.source_theme_id`,
        `source_theme_id "${rawSourceThemeId}" occurs more than once in theme_documents.`,
      ),
    );
  }

  issues.push(
    ...mappingIssues(mappingStatus, targetTheme, targetBrandDocument, location),
  );

  const operand = isRecord(value.document_operand)
    ? value.document_operand
    : undefined;
  const hasLocalPathOperand =
    operand !== undefined &&
    ("path" in operand ||
      "file_path" in operand ||
      "filesystem_path" in operand ||
      operand.kind === "filesystem-path");
  if (hasLocalPathOperand) {
    issues.push(
      makeIssue(
        "intake/non-portable-local-path",
        `${location}.document_operand`,
        "Consumer-local filesystem paths are not portable intake operands.",
      ),
    );
  }
  const operandKind =
    operand?.kind === "inline-document" ||
    operand?.kind === "authorized-content-addressed-reference"
      ? operand.kind
      : null;
  let validation: ForgeScalarDtcgDocumentValidation = {
    candidates: [],
    accepted_token_names: [],
    not_accepted_token_names: [],
    reasons: [],
    issues: [],
  };
  let submittedNames: string[] = [];
  let memberLocations = new Map<string, string>();
  let evaluationCompleted = false;
  let inlineDocument: unknown | undefined;

  if (operandKind === "inline-document") {
    inlineDocument = operand?.document;
    validation = validateForgeScalarDtcgDocument(inlineDocument);
    submittedNames = sortedUnique(
      validation.candidates.map((candidate) => candidate.token_name),
    );
    for (const candidate of validation.candidates) {
      const existing = memberLocations.get(candidate.token_name);
      if (
        existing === undefined ||
        candidate.location.localeCompare(existing) < 0
      ) {
        memberLocations.set(candidate.token_name, candidate.location);
      }
    }
    issues.push(...validation.issues);
    if (submittedNames.length === 0) {
      issues.push(
        makeIssue(
          "intake/document-has-no-token-members",
          `${location}.document_operand.document`,
          "Inline document contains no discoverable token members.",
        ),
      );
    }
    evaluationCompleted = true;
  } else if (operandKind === "authorized-content-addressed-reference") {
    const names = Array.isArray(operand?.token_names)
      ? operand.token_names.filter(
          (name): name is string => typeof name === "string" && name.length > 0,
        )
      : [];
    submittedNames = sortedUnique(names);
    memberLocations = new Map(submittedNames.map((name) => [name, name]));
    if (
      typeof operand?.uri !== "string" ||
      !CONTENT_ADDRESS_PATTERN.test(operand.uri)
    ) {
      issues.push(
        makeIssue(
          "intake/invalid-content-address",
          `${location}.document_operand.uri`,
          "Authorized content references must use sha256:<64 hexadecimal characters>.",
        ),
      );
    }
    if (submittedNames.length === 0 || submittedNames.length !== names.length) {
      issues.push(
        makeIssue(
          "intake/content-reference-members-required",
          `${location}.document_operand.token_names`,
          "An authorized content reference must carry unique, non-empty token_names.",
        ),
      );
    }
    issues.push(
      makeIssue(
        "unresolved-content-reference",
        `${location}.document_operand`,
        "Content-addressed references are schema-valid but this in-memory engine has no resolution authority.",
      ),
    );
    evaluationCompleted = false;
  } else {
    const possibleNames = Array.isArray(operand?.token_names)
      ? operand.token_names.filter(
          (name): name is string => typeof name === "string" && name.length > 0,
        )
      : [];
    submittedNames = sortedUnique(possibleNames);
    memberLocations = new Map(submittedNames.map((name) => [name, name]));
    if (!hasLocalPathOperand) {
      issues.push(
        makeIssue(
          "intake/unsupported-document-operand",
          `${location}.document_operand`,
          "document_operand must be inline-document or authorized-content-addressed-reference.",
        ),
      );
    }
  }

  issues.push(...integrityIssues(value, location, inlineDocument));

  return {
    sourceThemeId,
    mappingStatus,
    targetTheme,
    targetBrandDocument,
    operandKind,
    submittedNames,
    memberLocations,
    grammarAcceptedNames: new Set(validation.accepted_token_names),
    grammarReasons: validation.reasons,
    issues: sortIssues(issues),
    evaluationCompleted,
  };
}

function tokenInstanceId(sourceThemeId: string, tokenName: string): string {
  return `${sourceThemeId}::${tokenName}`;
}

/**
 * Evaluate a future brand.intake request without resolving references, writing files,
 * applying tokens, creating a brand, or emitting build artifacts.
 */
export function validateDtcgIntake(input: unknown): DtcgIntakeReceipt {
  const inputRecord = isRecord(input) ? input : undefined;
  const explicitIssues = explicitRequestIssues(input);
  const schemaIssues = structuralRequestIssues(input);
  const requestIssues = sortIssues([...explicitIssues, ...schemaIssues]);
  const rawThemeDocuments = Array.isArray(inputRecord?.theme_documents)
    ? inputRecord.theme_documents
    : [];
  const sourceCounts = themeSourceCounts(rawThemeDocuments);
  const workingDocuments = rawThemeDocuments.map((document, index) => {
    const schemaPrefix = `/theme_documents/${index}`;
    const documentSchemaIssues = schemaIssues.filter(
      (entry) =>
        entry.location === schemaPrefix ||
        entry.location.startsWith(`${schemaPrefix}/`),
    );
    return processThemeDocument(
      document,
      index,
      sourceCounts,
      documentSchemaIssues,
    );
  });

  // A malformed request-level control makes every discoverable member not accepted.
  // Document-level findings stay isolated to that document.
  const globalMemberIssues = requestIssues.filter(
    (entry) =>
      entry.ruleId !== "intake/request-schema" ||
      !entry.location.includes("/theme_documents/"),
  );
  const allSubmitted: string[] = [];
  const allAccepted: string[] = [];
  const allReasons: DtcgNotAcceptedTokenReason[] = [];
  const documentReceipts: DtcgIntakeThemeDocumentReceipt[] = [];

  for (const document of workingDocuments) {
    const submitted = document.submittedNames.map((name) =>
      tokenInstanceId(document.sourceThemeId, name),
    );
    const accepted: string[] = [];
    const notAccepted: string[] = [];

    for (const tokenName of document.submittedNames) {
      const member = tokenInstanceId(document.sourceThemeId, tokenName);
      const memberLocation =
        document.memberLocations.get(tokenName) ?? tokenName;
      const grammarReasons = document.grammarReasons
        .filter((entry) => entry.token_name === tokenName)
        .map(({ token_name: _tokenName, ...entry }) => entry);
      const memberRequestIssues = globalMemberIssues.map((entry) => ({
        ...entry,
        location: memberLocation,
      }));
      const memberDocumentIssues = document.issues.map((entry) => ({
        ...entry,
        location: memberLocation,
      }));
      const reasons = sortIssues([
        ...memberRequestIssues,
        ...memberDocumentIssues,
        ...grammarReasons,
      ]);
      if (
        document.grammarAcceptedNames.has(tokenName) &&
        reasons.length === 0
      ) {
        accepted.push(member);
      } else {
        notAccepted.push(member);
        const primaryReason =
          reasons.find((entry) => entry.ruleId !== "intake/request-schema") ??
          reasons[0] ??
          makeIssue(
            "intake/not-accepted-without-specific-reason",
            memberLocation,
            "The token instance was not accepted, but no more specific reason was available.",
          );
        allReasons.push({ token_instance_id: member, ...primaryReason });
      }
    }

    allSubmitted.push(...submitted);
    allAccepted.push(...accepted);
    documentReceipts.push({
      source_theme_id: document.sourceThemeId,
      mapping_status: document.mappingStatus,
      target_theme: document.targetTheme,
      target_brand_document: document.targetBrandDocument,
      operand_kind: document.operandKind,
      validated:
        document.evaluationCompleted &&
        inputRecord?.profile === FORGE_SCALAR_DTCG_1_PROFILE &&
        inputRecord.apply === false,
      submitted_token_instance_denominator: denominator(submitted),
      accepted_token_instance_denominator: denominator(accepted),
      not_accepted_token_instance_denominator: denominator(notAccepted),
      issues: document.issues,
    });
  }

  const submittedMembership = sortedUnique(allSubmitted);
  const acceptedMembership = sortedUnique(allAccepted);
  const submittedSet = new Set(submittedMembership);
  const acceptedSet = new Set(acceptedMembership);
  const submittedMinusAccepted = submittedMembership.filter(
    (member) => !acceptedSet.has(member),
  );
  const acceptedMinusSubmitted = acceptedMembership.filter(
    (member) => !submittedSet.has(member),
  );
  const notAcceptedMembership = [...submittedMinusAccepted];
  const sortedReasons = allReasons.sort(
    (a, b) =>
      a.token_instance_id.localeCompare(b.token_instance_id) ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.location.localeCompare(b.location) ||
      a.reason.localeCompare(b.reason),
  );
  const primaryReasonByMember = new Map<string, DtcgNotAcceptedTokenReason>();
  for (const reason of sortedReasons) {
    if (!primaryReasonByMember.has(reason.token_instance_id)) {
      primaryReasonByMember.set(reason.token_instance_id, reason);
    }
  }
  const reasonMembership = notAcceptedMembership.map(
    (member) =>
      primaryReasonByMember.get(member) ?? {
        token_instance_id: member,
        ruleId: "intake/not-accepted-without-specific-reason",
        location: member.split("::").at(-1) ?? member,
        reason:
          "The token instance was not accepted, but no more specific reason was available.",
      },
  );
  const structural = schemaIssues.length === 0;
  const evaluationCompleted =
    structural &&
    inputRecord?.profile === FORGE_SCALAR_DTCG_1_PROFILE &&
    inputRecord.apply === false &&
    workingDocuments.every((document) => document.evaluationCompleted);

  return {
    mode: "PREVIEW-ONLY",
    grammar_profile: FORGE_SCALAR_DTCG_1_PROFILE,
    requested: {
      apply: typeof inputRecord?.apply === "boolean" ? inputRecord.apply : null,
      brand_id: stringField(inputRecord, "brand_id"),
      profile: stringField(inputRecord, "profile"),
    },
    validated: evaluationCompleted,
    applied: false,
    brand_created: false,
    request_issues: requestIssues,
    theme_documents: documentReceipts,
    submitted_token_instance_denominator: denominator(submittedMembership),
    accepted_token_instance_denominator: denominator(acceptedMembership),
    not_accepted_token_instance_denominator: denominator(notAcceptedMembership),
    submitted_minus_accepted_denominator: denominator(submittedMinusAccepted),
    accepted_minus_submitted_denominator: denominator(acceptedMinusSubmitted),
    not_accepted_token_reason_denominator: denominator(reasonMembership),
    build_artifact_denominator: denominator<never>([]),
    preview: {
      classification: "PREVIEW-ONLY",
      persisted: false,
      accepted_population: denominator(acceptedMembership),
      disclosure:
        "Accepted members passed dry-run validation only. No token build artifact was emitted or persisted; persisted artifact labeling belongs to the deferred brand.intake tool rung.",
    },
  };
}
