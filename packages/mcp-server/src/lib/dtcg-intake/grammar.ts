import type {
  DtcgIntakeIssue,
  ForgeScalarDtcgDocumentValidation,
  ForgeScalarDtcgTokenCandidate,
} from "./types.js";

export const FORGE_SCALAR_DTCG_1_PROFILE = "FORGE-SCALAR-DTCG-1" as const;

/**
 * The error-level subset lifted from tools/token-lint/dtcg-guardrails.config.yaml.
 * The file-path runner's warn-only array/interpolation rules and its 61-entry
 * repository baseline are intentionally not imported into external intake.
 */
export const FORGE_SCALAR_DTCG_1_RULE_IDS = [
  "dtcg/token-name-kebab-case",
  "dtcg/token-name-no-illegal-chars",
  "dtcg/token-name-no-dollar-prefix",
  "dtcg/token-must-have-value",
  "dtcg/token-must-have-type",
  "dtcg/token-type-is-official",
  "dtcg/alias-is-full-value",
  "dtcg/alias-no-circular-references",
  "dtcg/alias-must-resolve",
  "forge-scalar/token-name-must-be-unique",
  "forge-scalar/token-name-no-instance-delimiter",
  "forge-scalar/value-must-be-scalar",
] as const;

export const FORGE_SCALAR_DTCG_1_TYPES = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "number",
  "content",
  "other",
] as const;

/** Forge-held, serializable description of the acceptance grammar. */
export const FORGE_SCALAR_DTCG_1_GRAMMAR = Object.freeze({
  profile: FORGE_SCALAR_DTCG_1_PROFILE,
  scope:
    "nested DTCG token leaves with string/number values or full-value aliases",
  allowed_types: FORGE_SCALAR_DTCG_1_TYPES,
  alias_shape: "{lowercase.kebab-case.token.path}",
  rule_ids: FORGE_SCALAR_DTCG_1_RULE_IDS,
  baseline_suppressions_applied: 0,
});

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALIAS_PATTERN =
  /^\{([a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*)\}$/;
const ALLOWED_TYPES = new Set<string>(FORGE_SCALAR_DTCG_1_TYPES);
const RESERVED_GROUP_METADATA = new Set([
  "$description",
  "$deprecated",
  "$extensions",
  "$schema",
  "$type",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(
  ruleId: string,
  location: string,
  reason: string,
): DtcgIntakeIssue {
  return { ruleId, location, reason };
}

function collectCandidates(document: unknown): {
  candidates: ForgeScalarDtcgTokenCandidate[];
  issues: DtcgIntakeIssue[];
} {
  if (!isRecord(document)) {
    return {
      candidates: [],
      issues: [
        issue(
          "forge-scalar/document-must-be-object",
          "<document>",
          "FORGE-SCALAR-DTCG-1 requires a JSON object document.",
        ),
      ],
    };
  }

  const candidates: ForgeScalarDtcgTokenCandidate[] = [];

  const visit = (value: unknown, path: readonly string[]): void => {
    if (isRecord(value) && ("$value" in value || "$type" in value)) {
      candidates.push({
        token_name: path.at(-1) ?? "",
        location: path.join("."),
        path_segments: [...path],
        node: value,
      });
      return;
    }

    if (!isRecord(value)) {
      candidates.push({
        token_name: path.at(-1) ?? "",
        location: path.join("."),
        path_segments: [...path],
        node: value,
      });
      return;
    }

    const entries = Object.entries(value).filter(
      ([key]) => !RESERVED_GROUP_METADATA.has(key),
    );
    if (entries.length === 0 && path.length > 0) {
      candidates.push({
        token_name: path.at(-1) ?? "",
        location: path.join("."),
        path_segments: [...path],
        node: value,
      });
      return;
    }

    for (const [key, child] of entries) {
      visit(child, [...path, key]);
    }
  };

  visit(document, []);
  return {
    candidates: candidates
      .filter((candidate) => candidate.token_name.length > 0)
      .sort(
        (a, b) =>
          a.token_name.localeCompare(b.token_name) ||
          a.location.localeCompare(b.location),
      ),
    issues: [],
  };
}

function validateTokenCandidate(
  candidate: ForgeScalarDtcgTokenCandidate,
): DtcgIntakeIssue[] {
  const {
    token_name: tokenName,
    location,
    path_segments: pathSegments,
    node,
  } = candidate;
  const issues: DtcgIntakeIssue[] = [];

  for (const segment of pathSegments) {
    if (segment.startsWith("$")) {
      issues.push(
        issue(
          "dtcg/token-name-no-dollar-prefix",
          location,
          `Group or token name "${segment}" must not start with '$'.`,
        ),
      );
    }
    if (
      segment.includes(".") ||
      segment.includes("{") ||
      segment.includes("}")
    ) {
      issues.push(
        issue(
          "dtcg/token-name-no-illegal-chars",
          location,
          `Group or token name "${segment}" must not include '.', '{', or '}'.`,
        ),
      );
    }
    if (!NAME_PATTERN.test(segment)) {
      issues.push(
        issue(
          "dtcg/token-name-kebab-case",
          location,
          `Group or token name "${segment}" must be lowercase kebab-case (a-z, 0-9, hyphen).`,
        ),
      );
    }
  }

  if (tokenName.includes("::")) {
    issues.push(
      issue(
        "forge-scalar/token-name-no-instance-delimiter",
        location,
        `Token name "${tokenName}" must not contain the reserved token-instance delimiter "::".`,
      ),
    );
  }

  if (!isRecord(node)) {
    issues.push(
      issue(
        "dtcg/token-must-have-value",
        location,
        `Token "${tokenName}" is not a DTCG token object with a "$value".`,
      ),
      issue(
        "dtcg/token-must-have-type",
        location,
        `Token "${tokenName}" is not a DTCG token object with a "$type".`,
      ),
    );
    return issues;
  }

  if (!("$value" in node)) {
    issues.push(
      issue(
        "dtcg/token-must-have-value",
        location,
        `Token "${tokenName}" is missing a "$value".`,
      ),
    );
  }
  if (!("$type" in node)) {
    issues.push(
      issue(
        "dtcg/token-must-have-type",
        location,
        `Token "${tokenName}" is missing a "$type".`,
      ),
    );
  } else if (typeof node.$type !== "string" || !ALLOWED_TYPES.has(node.$type)) {
    issues.push(
      issue(
        "dtcg/token-type-is-official",
        location,
        `Token "${tokenName}" uses type "${String(node.$type)}", which is outside the FORGE-SCALAR-DTCG-1 type subset.`,
      ),
    );
  }

  if ("$value" in node) {
    const value = node.$value;
    const alias = typeof value === "string" ? value.match(ALIAS_PATTERN) : null;
    if (
      node.$type !== "content" &&
      typeof value === "string" &&
      value.includes("{") &&
      !alias
    ) {
      issues.push(
        issue(
          "dtcg/alias-is-full-value",
          location,
          `Token "${tokenName}" must use an alias as its entire value (for example "{namespace.token}").`,
        ),
      );
    }
    if (
      value === null ||
      (typeof value !== "string" && typeof value !== "number")
    ) {
      issues.push(
        issue(
          "forge-scalar/value-must-be-scalar",
          location,
          `Token "${tokenName}" must carry a string, finite number, or full-value alias.`,
        ),
      );
    } else if (typeof value === "number" && !Number.isFinite(value)) {
      issues.push(
        issue(
          "forge-scalar/value-must-be-scalar",
          location,
          `Token "${tokenName}" must carry a finite number.`,
        ),
      );
    }
  }

  return issues;
}

function validateAliases(
  candidates: readonly ForgeScalarDtcgTokenCandidate[],
): ReadonlyMap<string, readonly DtcgIntakeIssue[]> {
  const locations = new Set(candidates.map((candidate) => candidate.location));
  const graph = new Map<string, string>();
  const byToken = new Map<string, DtcgIntakeIssue[]>();

  for (const candidate of candidates) {
    if (!isRecord(candidate.node) || typeof candidate.node.$value !== "string")
      continue;
    const alias = candidate.node.$value.match(ALIAS_PATTERN)?.[1];
    if (!alias) continue;
    graph.set(candidate.location, alias);
    if (!locations.has(alias)) {
      byToken.set(candidate.location, [
        issue(
          "dtcg/alias-must-resolve",
          candidate.location,
          `Alias target "${alias}" referenced by "${candidate.token_name}" does not exist in this document.`,
        ),
      ]);
    }
  }

  const cycleMembers = new Set<string>();
  for (const start of graph.keys()) {
    const path: string[] = [];
    const positions = new Map<string, number>();
    let current: string | undefined = start;
    while (current !== undefined && graph.has(current)) {
      const cycleStart = positions.get(current);
      if (cycleStart !== undefined) {
        for (const member of path.slice(cycleStart)) cycleMembers.add(member);
        break;
      }
      positions.set(current, path.length);
      path.push(current);
      current = graph.get(current);
    }
  }

  const sortedCycle = [...cycleMembers].sort((a, b) => a.localeCompare(b));
  for (const member of sortedCycle) {
    const memberIssues = byToken.get(member) ?? [];
    memberIssues.push(
      issue(
        "dtcg/alias-no-circular-references",
        member,
        `Alias cycle includes: ${sortedCycle.join(", ")}.`,
      ),
    );
    byToken.set(member, memberIssues);
  }

  return byToken;
}

function validateUniqueLeafNames(
  candidates: readonly ForgeScalarDtcgTokenCandidate[],
): ReadonlyMap<string, readonly DtcgIntakeIssue[]> {
  const locationsByName = new Map<string, string[]>();
  for (const candidate of candidates) {
    const locations = locationsByName.get(candidate.token_name) ?? [];
    locations.push(candidate.location);
    locationsByName.set(candidate.token_name, locations);
  }

  const byLocation = new Map<string, DtcgIntakeIssue[]>();
  for (const [tokenName, locations] of locationsByName) {
    if (locations.length < 2) continue;
    const sortedLocations = [...locations].sort((a, b) => a.localeCompare(b));
    for (const location of sortedLocations) {
      byLocation.set(location, [
        issue(
          "forge-scalar/token-name-must-be-unique",
          location,
          `Leaf token name "${tokenName}" is not unique in this document (${sortedLocations.join(", ")}).`,
        ),
      ]);
    }
  }
  return byLocation;
}

export function validateForgeScalarDtcgDocument(
  document: unknown,
): ForgeScalarDtcgDocumentValidation {
  const { candidates, issues } = collectCandidates(document);
  const aliasIssues = validateAliases(candidates);
  const duplicateNameIssues = validateUniqueLeafNames(candidates);
  const reasons: Array<DtcgIntakeIssue & { token_name: string }> = [];
  const accepted: string[] = [];
  const notAccepted: string[] = [];

  for (const candidate of candidates) {
    const candidateIssues = [
      ...validateTokenCandidate(candidate),
      ...(aliasIssues.get(candidate.location) ?? []),
      ...(duplicateNameIssues.get(candidate.location) ?? []),
    ].sort(
      (a, b) =>
        a.ruleId.localeCompare(b.ruleId) ||
        a.location.localeCompare(b.location) ||
        a.reason.localeCompare(b.reason),
    );
    if (candidateIssues.length === 0) {
      accepted.push(candidate.token_name);
    } else {
      notAccepted.push(candidate.token_name);
      reasons.push(
        ...candidateIssues.map((entry) => ({
          token_name: candidate.token_name,
          ...entry,
        })),
      );
    }
  }

  return {
    candidates,
    accepted_token_names: accepted,
    not_accepted_token_names: notAccepted,
    reasons,
    issues,
  };
}
