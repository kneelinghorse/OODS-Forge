import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { validateDtcgIntake } from "../../src/lib/dtcg-intake/index.js";
import {
  FORGE_SCALAR_DTCG_1_GRAMMAR,
  FORGE_SCALAR_DTCG_1_RULE_IDS,
  FORGE_SCALAR_DTCG_1_TYPES,
  validateForgeScalarDtcgDocument,
} from "../../src/lib/dtcg-intake/grammar.js";
import {
  DTCG_INTAKE_REQUEST_SCHEMA,
  validateDtcgIntakeRequestStructure,
} from "../../src/lib/dtcg-intake/schema.js";
import type {
  DtcgIntakeRequest,
  DtcgIntakeReceipt,
  DtcgIntakeThemeDocument,
} from "../../src/lib/dtcg-intake/types.js";

interface FixtureProvenance {
  readonly consumer_repository: {
    readonly path: string;
    readonly commit: string;
    readonly source_introduction_commit: string;
  };
  readonly delivered_envelope: {
    readonly path: string;
    readonly sha256: string;
    readonly bytes: number;
    readonly integrity_fields: string;
  };
  readonly source_manifest: {
    readonly path: string;
    readonly sha256: string;
    readonly bytes: number;
  };
  readonly documents: readonly {
    readonly source_theme_id: string;
    readonly target_theme: "light" | "dark" | "hc" | null;
    readonly target_brand_document: "base" | "dark" | "hc" | null;
    readonly mapping_status:
      | "PROPOSED-NOT-EXECUTABLE"
      | "UNMAPPED-REQUIRES-VARIANT-SUPPORT";
    readonly source_path: string;
    readonly fixture: string;
    readonly sha256: string;
    readonly bytes: number;
    readonly source_order_compact_json_sha256: string;
    readonly source_order_compact_json_bytes: number;
    readonly member_count: number;
  }[];
  readonly totals: {
    readonly documents: number;
    readonly members: number;
  };
}

interface TokenLeaf {
  readonly tokenName: string;
  readonly location: string;
}

const FIXTURE_ROOT = new URL("../fixtures/dtcg-intake/", import.meta.url);
const provenance = JSON.parse(
  readFileSync(new URL("provenance.json", FIXTURE_ROOT), "utf8"),
) as FixtureProvenance;
const tokenLintBaseline = JSON.parse(
  readFileSync(
    new URL("../../../../tools/token-lint/baseline.json", import.meta.url),
    "utf8",
  ),
) as {
  readonly entries: readonly {
    readonly ruleId: string;
    readonly file: string;
  }[];
};
const explorerLiteralColourBaseline = JSON.parse(
  readFileSync(
    new URL(
      "../../../../scripts/tokens/lint-semantic-baseline.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as { readonly entries: readonly { readonly file: string }[] };

const compactIntegrityByTheme = {
  light: {
    sha256: "6339240ed895c87f48de686ae89d336de4f070fe97039148336ac251ce089a7a",
    bytes: 36_459,
  },
  "light-mobile": {
    sha256: "3b64092ac81034fb564d4d5b12a16f57169a013b2d570aba4d77faf66a195f2f",
    bytes: 34_269,
  },
  "light-high-contrast-experimental": {
    sha256: "1101fd0641e8f21e23d94e0bf3f1bbfa91f86a72cfc8dae93d7cd742ddb7abd9",
    bytes: 36_485,
  },
  "dark-experimental": {
    sha256: "16b4fbe8190e49171c483b311016c6ada2d8a31e76f29ffc99ba7c9f6f7e4404",
    bytes: 36_519,
  },
} as const;

const mappingByTheme = {
  light: {
    target_theme: "light",
    target_brand_document: "base",
    mapping_status: "PROPOSED-NOT-EXECUTABLE",
  },
  "light-mobile": {
    target_theme: null,
    target_brand_document: null,
    mapping_status: "UNMAPPED-REQUIRES-VARIANT-SUPPORT",
  },
  "light-high-contrast-experimental": {
    target_theme: "hc",
    target_brand_document: "hc",
    mapping_status: "PROPOSED-NOT-EXECUTABLE",
  },
  "dark-experimental": {
    target_theme: "dark",
    target_brand_document: "dark",
    mapping_status: "PROPOSED-NOT-EXECUTABLE",
  },
} as const;

function sha256(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Independent corpus denominator: do not use the production grammar to establish expected membership. */
function flattenTokenLeaves(document: unknown): TokenLeaf[] {
  const leaves: TokenLeaf[] = [];

  const visit = (value: unknown, path: readonly string[]): void => {
    if (!isRecord(value)) return;
    if (Object.hasOwn(value, "$value") || Object.hasOwn(value, "$type")) {
      leaves.push({ tokenName: path.at(-1) ?? "", location: path.join(".") });
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (!key.startsWith("$")) visit(child, [...path, key]);
    }
  };

  visit(document, []);
  return leaves.sort(
    (a, b) =>
      a.tokenName.localeCompare(b.tokenName) ||
      a.location.localeCompare(b.location),
  );
}

function readFixture(name: string): {
  readonly bytes: Buffer;
  readonly document: unknown;
} {
  const bytes = readFileSync(new URL(name, FIXTURE_ROOT));
  return { bytes, document: JSON.parse(bytes.toString("utf8")) as unknown };
}

const corpus = provenance.documents.map((entry) => {
  const { bytes, document } = readFixture(entry.fixture);
  const leaves = flattenTokenLeaves(document);
  return { entry, bytes, document, leaves };
});

const expectedMembersByTheme = new Map(
  corpus.map(({ entry, leaves }) => [
    entry.source_theme_id,
    leaves.map(({ tokenName }) => `${entry.source_theme_id}::${tokenName}`),
  ]),
);
const expectedLocationsByInstance = new Map(
  corpus.flatMap(({ entry, leaves }) =>
    leaves.map(
      ({ tokenName, location }) =>
        [`${entry.source_theme_id}::${tokenName}`, location] as const,
    ),
  ),
);

function buildThemeDocument(
  item: (typeof corpus)[number],
): DtcgIntakeThemeDocument {
  const themeId = item.entry.source_theme_id as keyof typeof mappingByTheme;
  const compact = JSON.stringify(item.document);
  const integrity = compactIntegrityByTheme[themeId];
  return {
    source_theme_id: themeId,
    ...mappingByTheme[themeId],
    source_file_sha256: item.entry.sha256,
    source_file_bytes: item.entry.bytes,
    source_order_compact_json_sha256: integrity.sha256,
    source_order_compact_json_bytes: integrity.bytes,
    document_operand: { kind: "inline-document", document: item.document },
  };
}

const corpusRequest: DtcgIntakeRequest = {
  apply: false,
  brand_id: "Polaris",
  profile: "FORGE-SCALAR-DTCG-1",
  theme_documents: corpus.map(buildThemeDocument),
};

const expectedSubmitted = [...expectedMembersByTheme.values()].flat().sort();
const expectedNotAccepted = [
  ...(expectedMembersByTheme.get("light-mobile") ?? []),
].sort();
const expectedAccepted = expectedSubmitted.filter(
  (member) => !member.startsWith("light-mobile::"),
);

function syntheticThemeDocument(document: unknown): DtcgIntakeThemeDocument {
  const compact = JSON.stringify(document);
  return {
    source_theme_id: "light",
    target_theme: "light",
    target_brand_document: "base",
    mapping_status: "PROPOSED-NOT-EXECUTABLE",
    // Raw-source bytes are provenance assertions: the parsed object cannot reconstruct whitespace.
    source_file_sha256: "a".repeat(64),
    source_file_bytes: 1,
    source_order_compact_json_sha256: sha256(compact),
    source_order_compact_json_bytes: Buffer.byteLength(compact),
    document_operand: { kind: "inline-document", document },
  };
}

function syntheticRequest(
  document: unknown = {
    tokens: { "color-bg": { $type: "color", $value: "#ffffff" } },
  },
): DtcgIntakeRequest {
  return {
    apply: false,
    brand_id: "Polaris",
    profile: "FORGE-SCALAR-DTCG-1",
    theme_documents: [syntheticThemeDocument(document)],
  };
}

function reconciliationFailures(receipt: DtcgIntakeReceipt): string[] {
  const failures: string[] = [];
  const submitted = receipt.submitted_token_instance_denominator;
  const accepted = receipt.accepted_token_instance_denominator;
  const notAccepted = receipt.not_accepted_token_instance_denominator;
  const submittedMinusAccepted = receipt.submitted_minus_accepted_denominator;
  const acceptedMinusSubmitted = receipt.accepted_minus_submitted_denominator;

  for (const [name, value] of [
    ["submitted", submitted],
    ["accepted", accepted],
    ["not-accepted", notAccepted],
    ["submitted-minus-accepted", submittedMinusAccepted],
    ["accepted-minus-submitted", acceptedMinusSubmitted],
  ] as const) {
    if (value.count !== value.membership.length) failures.push(`${name}-count`);
    if (new Set(value.membership).size !== value.membership.length) {
      failures.push(`${name}-duplicates`);
    }
  }

  if (
    JSON.stringify(submitted.membership) !== JSON.stringify(expectedSubmitted)
  ) {
    failures.push("submitted-membership");
  }
  if (
    JSON.stringify(accepted.membership) !== JSON.stringify(expectedAccepted)
  ) {
    failures.push("accepted-membership");
  }
  if (
    JSON.stringify(notAccepted.membership) !==
    JSON.stringify(expectedNotAccepted)
  ) {
    failures.push("not-accepted-membership");
  }

  const submittedSet = new Set(submitted.membership);
  const acceptedSet = new Set(accepted.membership);
  const actualSubmittedMinusAccepted = submitted.membership.filter(
    (member) => !acceptedSet.has(member),
  );
  const actualAcceptedMinusSubmitted = accepted.membership.filter(
    (member) => !submittedSet.has(member),
  );
  if (
    JSON.stringify(submittedMinusAccepted.membership) !==
    JSON.stringify(actualSubmittedMinusAccepted)
  ) {
    failures.push("submitted-minus-accepted-relation");
  }
  if (
    JSON.stringify(acceptedMinusSubmitted.membership) !==
    JSON.stringify(actualAcceptedMinusSubmitted)
  ) {
    failures.push("accepted-minus-submitted-relation");
  }
  return failures;
}

function reasonIntegrityFailures(receipt: DtcgIntakeReceipt): string[] {
  const failures: string[] = [];
  const denominator = receipt.not_accepted_token_reason_denominator;
  if (denominator.count !== denominator.membership.length)
    failures.push("reason-count");

  const notAccepted = new Set(
    receipt.not_accepted_token_instance_denominator.membership,
  );
  const reasoned = new Set<string>();
  for (const entry of denominator.membership) {
    if (!notAccepted.has(entry.token_instance_id))
      failures.push("reason-outside-not-accepted");
    reasoned.add(entry.token_instance_id);
    if (entry.ruleId.trim().length === 0) failures.push("blank-rule-id");
    if (entry.location.trim().length === 0) failures.push("blank-location");
    if (entry.reason.trim().length === 0) failures.push("blank-reason");
  }
  for (const member of notAccepted) {
    if (!reasoned.has(member)) failures.push("not-accepted-without-reason");
  }
  if (denominator.membership.length !== notAccepted.size) {
    failures.push("reason-membership-count");
  }
  if (reasoned.size !== denominator.membership.length) {
    failures.push("duplicate-reason-member");
  }
  if (
    JSON.stringify([...reasoned].sort()) !==
    JSON.stringify([...notAccepted].sort())
  ) {
    failures.push("reason-membership-not-exact");
  }
  return failures;
}

describe("s180 m03 DTCG intake fixture provenance", () => {
  it("pins the delivered envelope, consumer revision, and all four vendored document byte identities", () => {
    expect(provenance.consumer_repository).toEqual({
      path: "Design-Tools/Shopify-Forge",
      commit: "97e9aa8317bdfdf3cf6d85d81e90112c5e5789ff",
      source_introduction_commit: "bb56c5a33fc096062b859cdaaf46e50e643ec1cd",
    });
    expect(provenance.delivered_envelope).toEqual({
      path: "src/token-brand/forge/polaris-brand-definition.json",
      sha256:
        "f9672ed678f249c3e8180e0b24c9ddeb3b4903a418d8d1f6f97ddbf081c0d3d1",
      bytes: 668_543,
      integrity_fields:
        "proposed_request.theme_documents.members[].source_file_sha256 and source_file_bytes",
    });
    expect(provenance.source_manifest).toEqual({
      path: "src/token-brand/published/manifest.json",
      sha256:
        "4b8409f69f161064e12b8917ef5115055c8562f694d2fcb6697bc56e23588fea",
      bytes: 280_120,
    });
    expect(provenance.totals).toEqual({ documents: 4, members: 1_812 });
    expect(readdirSync(FIXTURE_ROOT).sort()).toEqual([
      "polaris-dark-experimental.tokens.json",
      "polaris-light-high-contrast-experimental.tokens.json",
      "polaris-light-mobile.tokens.json",
      "polaris-light.tokens.json",
      "provenance.json",
    ]);

    for (const { entry, bytes, document, leaves } of corpus) {
      expect(bytes.byteLength, `${entry.fixture} bytes`).toBe(entry.bytes);
      expect(sha256(bytes), `${entry.fixture} SHA-256`).toBe(entry.sha256);
      expect(entry.member_count, `${entry.fixture} declared membership`).toBe(
        453,
      );
      expect(leaves, `${entry.fixture} independent membership`).toHaveLength(
        453,
      );
      expect(new Set(leaves.map(({ tokenName }) => tokenName)).size).toBe(453);

      const extension = (document as Record<string, unknown>)
        .$extensions as Record<string, Record<string, unknown>>;
      expect(extension["com.aquex.shopify-forge"]).toEqual({
        profile: "FORGE-SCALAR-DTCG-1",
        value_model: "scalar-string-or-number",
        official_dtcg_2025_10_conformance: false,
      });

      const compact = JSON.stringify(document);
      const compactIntegrity =
        compactIntegrityByTheme[
          entry.source_theme_id as keyof typeof compactIntegrityByTheme
        ];
      expect({
        target_theme: entry.target_theme,
        target_brand_document: entry.target_brand_document,
        mapping_status: entry.mapping_status,
      }).toEqual(
        mappingByTheme[entry.source_theme_id as keyof typeof mappingByTheme],
      );
      expect({
        sha256: entry.source_order_compact_json_sha256,
        bytes: entry.source_order_compact_json_bytes,
      }).toEqual(compactIntegrity);
      expect(Buffer.byteLength(compact), `${entry.fixture} compact bytes`).toBe(
        compactIntegrity.bytes,
      );
      expect(sha256(compact), `${entry.fixture} compact SHA-256`).toBe(
        compactIntegrity.sha256,
      );
    }

    const baselineNames = corpus[0]!.leaves.map(({ tokenName }) => tokenName);
    for (const { entry, leaves } of corpus.slice(1)) {
      expect(
        leaves.map(({ tokenName }) => tokenName),
        `${entry.fixture} member parity`,
      ).toEqual(baselineNames);
    }
    expect(corpus.reduce((total, item) => total + item.leaves.length, 0)).toBe(
      1_812,
    );
  });
});

describe("FORGE-SCALAR-DTCG-1 acceptance grammar", () => {
  it("pins the 61-entry token guardrail baseline and excludes the 27-entry explorer literal-colour baseline", () => {
    expect(tokenLintBaseline.entries).toHaveLength(61);
    expect(
      Object.fromEntries(
        [...new Set(tokenLintBaseline.entries.map(({ ruleId }) => ruleId))]
          .sort()
          .map((ruleId) => [
            ruleId,
            tokenLintBaseline.entries.filter((entry) => entry.ruleId === ruleId)
              .length,
          ]),
      ),
    ).toEqual({
      "dtcg/alias-is-full-value": 40,
      "dtcg/token-name-kebab-case": 21,
    });
    expect(
      tokenLintBaseline.entries.every(({ file }) =>
        file.startsWith("packages/tokens/src/"),
      ),
    ).toBe(true);

    expect(explorerLiteralColourBaseline.entries).toHaveLength(27);
    expect(
      explorerLiteralColourBaseline.entries.every(({ file }) =>
        file.startsWith("apps/explorer/"),
      ),
    ).toBe(true);
    expect(FORGE_SCALAR_DTCG_1_GRAMMAR.baseline_suppressions_applied).toBe(0);
  });

  it("publishes the named scalar subset without applying the repository lint baseline", () => {
    expect(FORGE_SCALAR_DTCG_1_GRAMMAR).toEqual({
      profile: "FORGE-SCALAR-DTCG-1",
      description:
        '$type:"content" string values may contain literal braces without triggering dtcg/alias-is-full-value; syntactically complete full-value aliases still resolve.',
      scope:
        "nested DTCG token leaves with string/number values or full-value aliases",
      allowed_types: FORGE_SCALAR_DTCG_1_TYPES,
      alias_shape: "{lowercase.kebab-case.token.path}",
      rule_ids: FORGE_SCALAR_DTCG_1_RULE_IDS,
      baseline_suppressions_applied: 0,
    });
    expect(FORGE_SCALAR_DTCG_1_TYPES).toEqual([
      "color",
      "dimension",
      "fontFamily",
      "fontWeight",
      "duration",
      "number",
      "content",
      "other",
    ]);
    expect(FORGE_SCALAR_DTCG_1_RULE_IDS).toEqual([
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
    ]);
  });

  it('grammar description discloses the $type:"content" brace carve-out and its 18-of-1,359 dependence', () => {
    const serializedGrammar = JSON.parse(
      JSON.stringify(FORGE_SCALAR_DTCG_1_GRAMMAR),
    ) as { description?: string };
    expect(serializedGrammar.description).toBe(
      '$type:"content" string values may contain literal braces without triggering dtcg/alias-is-full-value; syntactically complete full-value aliases still resolve.',
    );

    let disabledCarveOuts = 0;
    const disableContentBraceCarveOut = (value: unknown): unknown => {
      if (Array.isArray(value)) {
        return value.map(disableContentBraceCarveOut);
      }
      if (!isRecord(value)) return value;

      const isContentToken = value.$type === "content" && "$value" in value;
      if (isContentToken) disabledCarveOuts += 1;
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          // `color` is allowed and non-content; under this validator it changes only the brace-alias rule.
          key === "$type" && isContentToken
            ? "color"
            : disableContentBraceCarveOut(child),
        ]),
      );
    };
    const requestWithoutCarveOut: DtcgIntakeRequest = {
      ...corpusRequest,
      theme_documents: corpus.map((item) => {
        const document = disableContentBraceCarveOut(item.document);
        const compact = JSON.stringify(document);
        return {
          ...buildThemeDocument(item),
          source_order_compact_json_sha256: sha256(compact),
          source_order_compact_json_bytes: Buffer.byteLength(compact),
          document_operand: { kind: "inline-document", document },
        };
      }),
    };

    const receiptWithCarveOut = validateDtcgIntake(corpusRequest);
    const receiptWithoutCarveOut = validateDtcgIntake(requestWithoutCarveOut);

    expect(disabledCarveOuts).toBe(24);
    expect(receiptWithCarveOut.accepted_token_instance_denominator.count).toBe(
      1_359,
    );
    expect(
      receiptWithoutCarveOut.accepted_token_instance_denominator.count,
    ).toBe(1_341);
    expect(receiptWithoutCarveOut.validated).toBe(true);
    const acceptedWithoutCarveOut = new Set(
      receiptWithoutCarveOut.accepted_token_instance_denominator.membership,
    );
    const carveOutDependentMembers =
      receiptWithCarveOut.accepted_token_instance_denominator.membership.filter(
        (member) => !acceptedWithoutCarveOut.has(member),
      );
    expect(
      carveOutDependentMembers.map(
        (member) =>
          receiptWithoutCarveOut.not_accepted_token_reason_denominator.membership.find(
            ({ token_instance_id: tokenInstanceId }) =>
              tokenInstanceId === member,
          )?.ruleId,
      ),
    ).toEqual(Array(18).fill("dtcg/alias-is-full-value"));
  });

  it("accepts scalar CSS keyframe content with literal braces and preserves leaf identity separately from location", () => {
    const validation = validateForgeScalarDtcgDocument({
      polaris: {
        light: {
          motion: {
            "motion-keyframes-fade-in": {
              $type: "content",
              $value: "{ from { opacity: 0 } to { opacity: 1 } }",
            },
          },
        },
      },
    });

    expect(validation.candidates).toEqual([
      expect.objectContaining({
        token_name: "motion-keyframes-fade-in",
        location: "polaris.light.motion.motion-keyframes-fade-in",
      }),
    ]);
    expect(validation.accepted_token_names).toEqual([
      "motion-keyframes-fade-in",
    ]);
    expect(validation.not_accepted_token_names).toEqual([]);
    expect(validation.reasons).toEqual([]);
  });

  it("still resolves syntactically complete aliases carried by content tokens", () => {
    const validation = validateForgeScalarDtcgDocument({
      content: {
        "missing-alias": {
          $type: "content",
          $value: "{content.absent}",
        },
      },
    });

    expect(validation.accepted_token_names).toEqual([]);
    expect(validation.not_accepted_token_names).toEqual(["missing-alias"]);
    expect(validation.reasons).toContainEqual({
      token_name: "missing-alias",
      ruleId: "dtcg/alias-must-resolve",
      location: "content.missing-alias",
      reason:
        'Alias target "content.absent" referenced by "missing-alias" does not exist in this document.',
    });
  });

  it("reports scalar, structure, alias, cycle, name, and duplicate-leaf failures by exact rule and location", () => {
    const validation = validateForgeScalarDtcgDocument({
      palette: {
        base: { $type: "color", $value: "#ffffff" },
      },
      aliases: {
        valid: { $type: "color", $value: "{palette.base}" },
        missing: { $type: "color", $value: "{palette.absent}" },
        partial: { $type: "dimension", $value: "calc({space.base} * 2)" },
        malformed: { $type: "color", $value: "calc({Missing Alias)" },
        a: { $type: "color", $value: "{aliases.b}" },
        b: { $type: "color", $value: "{aliases.a}" },
      },
      malformed: {
        array: { $type: "dimension", $value: ["1rem"] },
        "missing-value": { $type: "number" },
        "missing-type": { $value: 1 },
        "unsupported-type": { $type: "boolean", $value: "true" },
      },
      "bad.group": {
        token: { $type: "number", $value: 1 },
      },
      $illegal: { $type: "number", $value: 1 },
      one: { duplicate: { $type: "number", $value: 1 } },
      two: { duplicate: { $type: "number", $value: 2 } },
    });

    expect(validation.accepted_token_names).toEqual(["base", "valid"]);
    expect(validation.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token_name: "partial",
          ruleId: "dtcg/alias-is-full-value",
          location: "aliases.partial",
        }),
        expect.objectContaining({
          token_name: "malformed",
          ruleId: "dtcg/alias-is-full-value",
          location: "aliases.malformed",
        }),
        expect.objectContaining({
          token_name: "missing",
          ruleId: "dtcg/alias-must-resolve",
          location: "aliases.missing",
        }),
        expect.objectContaining({
          token_name: "a",
          ruleId: "dtcg/alias-no-circular-references",
          location: "aliases.a",
        }),
        expect.objectContaining({
          token_name: "array",
          ruleId: "forge-scalar/value-must-be-scalar",
          location: "malformed.array",
        }),
        expect.objectContaining({
          token_name: "missing-value",
          ruleId: "dtcg/token-must-have-value",
          location: "malformed.missing-value",
        }),
        expect.objectContaining({
          token_name: "missing-type",
          ruleId: "dtcg/token-must-have-type",
          location: "malformed.missing-type",
        }),
        expect.objectContaining({
          token_name: "unsupported-type",
          ruleId: "dtcg/token-type-is-official",
          location: "malformed.unsupported-type",
        }),
        expect.objectContaining({
          token_name: "token",
          ruleId: "dtcg/token-name-no-illegal-chars",
          location: "bad.group.token",
        }),
        expect.objectContaining({
          token_name: "$illegal",
          ruleId: "dtcg/token-name-no-dollar-prefix",
          location: "$illegal",
        }),
        expect.objectContaining({
          token_name: "duplicate",
          ruleId: "forge-scalar/token-name-must-be-unique",
          location: "one.duplicate",
        }),
      ]),
    );
  });
});

describe("DTCG intake request schema boundary", () => {
  it("requires the complete request level, including explicit apply:false", () => {
    expect(validateDtcgIntakeRequestStructure(corpusRequest)).toEqual({
      valid: true,
      errors: [],
    });

    const missingApply = structuredClone(corpusRequest) as unknown as Record<
      string,
      unknown
    >;
    delete missingApply.apply;
    expect(validateDtcgIntakeRequestStructure(missingApply)).toEqual({
      valid: false,
      errors: expect.arrayContaining([
        expect.objectContaining({ instancePath: "", keyword: "required" }),
      ]),
    });

    expect(DTCG_INTAKE_REQUEST_SCHEMA.required).toContain("apply");
  });
});

describe("s180 m03 dry-run intake reconciliation", () => {
  it("reconciles all 1,812 submitted instances into 1,359 accepted and 453 explicitly unmapped", () => {
    const receipt = validateDtcgIntake(corpusRequest);

    expect(receipt).toMatchObject({
      mode: "PREVIEW-ONLY",
      grammar_profile: "FORGE-SCALAR-DTCG-1",
      requested: {
        apply: false,
        brand_id: "Polaris",
        profile: "FORGE-SCALAR-DTCG-1",
      },
      validated: true,
      applied: false,
      brand_created: false,
      request_issues: [],
    });
    expect(
      receipt.theme_documents.map((document) => ({
        source_theme_id: document.source_theme_id,
        mapping_status: document.mapping_status,
        target_theme: document.target_theme,
        target_brand_document: document.target_brand_document,
        operand_kind: document.operand_kind,
        validated: document.validated,
        submitted: document.submitted_token_instance_denominator.count,
        accepted: document.accepted_token_instance_denominator.count,
        not_accepted: document.not_accepted_token_instance_denominator.count,
      })),
    ).toEqual([
      {
        source_theme_id: "light",
        mapping_status: "PROPOSED-NOT-EXECUTABLE",
        target_theme: "light",
        target_brand_document: "base",
        operand_kind: "inline-document",
        validated: true,
        submitted: 453,
        accepted: 453,
        not_accepted: 0,
      },
      {
        source_theme_id: "light-mobile",
        mapping_status: "UNMAPPED-REQUIRES-VARIANT-SUPPORT",
        target_theme: null,
        target_brand_document: null,
        operand_kind: "inline-document",
        validated: true,
        submitted: 453,
        accepted: 0,
        not_accepted: 453,
      },
      {
        source_theme_id: "light-high-contrast-experimental",
        mapping_status: "PROPOSED-NOT-EXECUTABLE",
        target_theme: "hc",
        target_brand_document: "hc",
        operand_kind: "inline-document",
        validated: true,
        submitted: 453,
        accepted: 453,
        not_accepted: 0,
      },
      {
        source_theme_id: "dark-experimental",
        mapping_status: "PROPOSED-NOT-EXECUTABLE",
        target_theme: "dark",
        target_brand_document: "dark",
        operand_kind: "inline-document",
        validated: true,
        submitted: 453,
        accepted: 453,
        not_accepted: 0,
      },
    ]);

    expect(receipt.submitted_token_instance_denominator).toEqual({
      count: 1_812,
      membership: expectedSubmitted,
    });
    expect(receipt.accepted_token_instance_denominator).toEqual({
      count: 1_359,
      membership: expectedAccepted,
    });
    expect(receipt.not_accepted_token_instance_denominator).toEqual({
      count: 453,
      membership: expectedNotAccepted,
    });
    expect(receipt.submitted_minus_accepted_denominator).toEqual({
      count: 453,
      membership: expectedNotAccepted,
    });
    expect(receipt.accepted_minus_submitted_denominator).toEqual({
      count: 0,
      membership: [],
    });
    expect(receipt.build_artifact_denominator).toEqual({
      count: 0,
      membership: [],
    });
    expect(receipt.preview).toEqual({
      classification: "PREVIEW-ONLY",
      persisted: false,
      accepted_population: { count: 1_359, membership: expectedAccepted },
      disclosure:
        "Accepted members passed dry-run validation only. No token build artifact was emitted or persisted; persisted artifact labeling belongs to the deferred brand.intake tool rung.",
    });

    expect(receipt.theme_documents[1]!.issues).toEqual([
      {
        ruleId: "unmapped-target",
        location: "<request>.theme_documents[1].mapping_status",
        reason:
          "Source theme has no current Forge target; variant support is required before acceptance.",
      },
    ]);
    expect(
      receipt.theme_documents
        .filter((_, index) => index !== 1)
        .flatMap(({ issues }) => issues),
    ).toEqual([]);
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 453,
      membership: expectedNotAccepted.map((tokenInstanceId) => ({
        token_instance_id: tokenInstanceId,
        ruleId: "unmapped-target",
        location: expectedLocationsByInstance.get(tokenInstanceId)!,
        reason:
          "Source theme has no current Forge target; variant support is required before acceptance.",
      })),
    });
  });

  it("B-04 catches a silently dropped submitted member through totals, identity, and difference sets", () => {
    const receipt = validateDtcgIntake(corpusRequest);
    expect(reconciliationFailures(receipt)).toEqual([]);

    const mutant = structuredClone(receipt);
    (mutant.submitted_token_instance_denominator.membership as string[]).splice(
      0,
      1,
    );
    expect(reconciliationFailures(mutant)).toEqual([
      "submitted-count",
      "submitted-membership",
      "accepted-minus-submitted-relation",
    ]);
  });

  it("B-05 requires every not-accepted member to carry non-blank rule, location, and reason fields", () => {
    const receipt = validateDtcgIntake(corpusRequest);
    expect(reasonIntegrityFailures(receipt)).toEqual([]);

    const mutant = structuredClone(receipt);
    const firstReason =
      mutant.not_accepted_token_reason_denominator.membership[0]!;
    (
      mutant.not_accepted_token_reason_denominator
        .membership as (typeof firstReason)[]
    )[0] = {
      ...firstReason,
      reason: "",
    };
    expect(reasonIntegrityFailures(mutant)).toEqual(["blank-reason"]);
  });

  it("keeps the reason denominator exactly one-to-one when one member violates multiple rules", () => {
    const receipt = validateDtcgIntake(
      syntheticRequest({ tokens: { invalid: {} } }),
    );

    expect(receipt.not_accepted_token_instance_denominator).toEqual({
      count: 1,
      membership: ["light::invalid"],
    });
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 1,
      membership: [
        {
          token_instance_id: "light::invalid",
          ruleId: "dtcg/token-must-have-type",
          location: "tokens.invalid",
          reason: 'Token "invalid" is missing a "$type".',
        },
      ],
    });
    expect(reasonIntegrityFailures(receipt)).toEqual([]);
  });
});

describe("s180 m03 typed rejection boundaries", () => {
  it("rejects missing apply at the request level and fans the typed reason out to discoverable members", () => {
    const input = structuredClone(syntheticRequest()) as unknown as Record<
      string,
      unknown
    >;
    delete input.apply;
    const receipt = validateDtcgIntake(input);

    expect(receipt.requested.apply).toBeNull();
    expect(receipt.validated).toBe(false);
    expect(receipt.applied).toBe(false);
    expect(receipt.brand_created).toBe(false);
    expect(receipt.request_issues).toEqual(
      expect.arrayContaining([
        {
          ruleId: "intake/apply-required",
          location: "<request>.apply",
          reason: "The dry-run request must carry apply:false explicitly.",
        },
        expect.objectContaining({ ruleId: "intake/request-schema" }),
      ]),
    );
    expect(receipt.submitted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([]);
    expect(receipt.not_accepted_token_reason_denominator.membership).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token_instance_id: "light::color-bg",
          ruleId: "intake/apply-required",
          location: "tokens.color-bg",
        }),
      ]),
    );
  });

  it("rejects apply:true without applying, creating a brand, or emitting artifacts", () => {
    const input = { ...syntheticRequest(), apply: true };
    const receipt = validateDtcgIntake(input);

    expect(receipt.requested.apply).toBe(true);
    expect(receipt.validated).toBe(false);
    expect(receipt.applied).toBe(false);
    expect(receipt.brand_created).toBe(false);
    expect(receipt.build_artifact_denominator).toEqual({
      count: 0,
      membership: [],
    });
    expect(receipt.request_issues).toEqual(
      expect.arrayContaining([
        {
          ruleId: "intake/apply-must-be-false",
          location: "<request>.apply",
          reason: "This engine is dry-run-only; apply must be false.",
        },
        expect.objectContaining({
          ruleId: "intake/request-schema",
          location: "/apply",
        }),
      ]),
    );
    expect(receipt.not_accepted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
  });

  it("rejects an unknown profile without silently defaulting the requested value", () => {
    const input = { ...syntheticRequest(), profile: "DTCG-UNKNOWN" };
    const receipt = validateDtcgIntake(input);

    expect(receipt.grammar_profile).toBe("FORGE-SCALAR-DTCG-1");
    expect(receipt.requested.profile).toBe("DTCG-UNKNOWN");
    expect(receipt.validated).toBe(false);
    expect(receipt.request_issues).toEqual(
      expect.arrayContaining([
        {
          ruleId: "intake/unsupported-profile",
          location: "<request>.profile",
          reason:
            'Unknown profile "DTCG-UNKNOWN"; supported profile is FORGE-SCALAR-DTCG-1.',
        },
        expect.objectContaining({
          ruleId: "intake/request-schema",
          location: "/profile",
        }),
      ]),
    );
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([]);
    expect(receipt.not_accepted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
  });

  it("rejects non-canonical source IDs without trimming two submitted identities into one", () => {
    const first = syntheticThemeDocument({
      tokens: { "color-bg": { $type: "color", $value: "#ffffff" } },
    });
    const input = {
      ...syntheticRequest(),
      theme_documents: [first, { ...first, source_theme_id: " light " }],
    };

    expect(validateDtcgIntakeRequestStructure(input).valid).toBe(false);
    const receipt = validateDtcgIntake(input);
    expect(receipt.validated).toBe(false);
    expect(receipt.submitted_token_instance_denominator).toEqual({
      count: 2,
      membership: ["<invalid-theme-document-2>::color-bg", "light::color-bg"],
    });
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
    expect(receipt.not_accepted_token_instance_denominator.membership).toEqual([
      "<invalid-theme-document-2>::color-bg",
    ]);
    expect(receipt.theme_documents[1]!.issues).toContainEqual({
      ruleId: "intake/source-theme-id-must-be-trimmed",
      location: "<request>.theme_documents[1].source_theme_id",
      reason:
        "source_theme_id must not contain leading or trailing whitespace.",
    });
    expect(reasonIntegrityFailures(receipt)).toEqual([]);
  });

  it("keeps fallback identities disjoint from submitted reserved-prefix IDs", () => {
    const document = syntheticThemeDocument({
      tokens: { x: { $type: "number", $value: 1 } },
    });
    const missingSourceId = structuredClone(document) as unknown as Record<
      string,
      unknown
    >;
    delete missingSourceId.source_theme_id;
    const reservedSourceId = {
      ...document,
      source_theme_id: "<invalid-theme-document-1>",
    };
    const input = {
      ...syntheticRequest(),
      theme_documents: [missingSourceId, reservedSourceId],
    };

    expect(validateDtcgIntakeRequestStructure(input).valid).toBe(false);
    const receipt = validateDtcgIntake(input);
    expect(receipt.submitted_token_instance_denominator).toEqual({
      count: 2,
      membership: [
        "<invalid-theme-document-1>::x",
        "<invalid-theme-document-2>::x",
      ],
    });
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([]);
    expect(receipt.not_accepted_token_instance_denominator.count).toBe(2);
    expect(receipt.theme_documents[1]!.issues).toContainEqual({
      ruleId: "intake/source-theme-id-reserved-internal-prefix",
      location: "<request>.theme_documents[1].source_theme_id",
      reason:
        'source_theme_id must not start with the reserved internal prefix "<invalid-theme-document-".',
    });
    expect(reasonIntegrityFailures(receipt)).toEqual([]);
  });

  it("accepts the content-reference shape but returns memberful unresolved-content-reference receipts", () => {
    const request: DtcgIntakeRequest = {
      apply: false,
      brand_id: "Polaris",
      profile: "FORGE-SCALAR-DTCG-1",
      theme_documents: [
        {
          source_theme_id: "light",
          target_theme: "light",
          target_brand_document: "base",
          mapping_status: "PROPOSED-NOT-EXECUTABLE",
          source_file_sha256: "a".repeat(64),
          source_file_bytes: 123,
          source_order_compact_json_sha256: "b".repeat(64),
          source_order_compact_json_bytes: 99,
          document_operand: {
            kind: "authorized-content-addressed-reference",
            uri: `sha256:${"c".repeat(64)}`,
            token_names: ["space-100", "color-bg"],
          },
        },
      ],
    };
    expect(validateDtcgIntakeRequestStructure(request)).toEqual({
      valid: true,
      errors: [],
    });

    const receipt = validateDtcgIntake(request);
    expect(receipt.validated).toBe(false);
    expect(receipt.request_issues).toEqual([]);
    expect(receipt.theme_documents[0]).toMatchObject({
      operand_kind: "authorized-content-addressed-reference",
      validated: false,
      issues: [
        {
          ruleId: "unresolved-content-reference",
          location: "<request>.theme_documents[0].document_operand",
          reason:
            "Content-addressed references are schema-valid but this in-memory engine has no resolution authority.",
        },
      ],
    });
    expect(receipt.submitted_token_instance_denominator).toEqual({
      count: 2,
      membership: ["light::color-bg", "light::space-100"],
    });
    expect(receipt.accepted_token_instance_denominator).toEqual({
      count: 0,
      membership: [],
    });
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 2,
      membership: ["light::color-bg", "light::space-100"].map(
        (tokenInstanceId) => ({
          token_instance_id: tokenInstanceId,
          ruleId: "unresolved-content-reference",
          location: tokenInstanceId.replace("light::", ""),
          reason:
            "Content-addressed references are schema-valid but this in-memory engine has no resolution authority.",
        }),
      ),
    });
  });

  it("rejects a consumer-local filesystem path as non-portable at both schema and member receipt boundaries", () => {
    const input = structuredClone(syntheticRequest()) as unknown as {
      theme_documents: Array<Record<string, unknown>>;
    };
    input.theme_documents[0]!.document_operand = {
      kind: "filesystem-path",
      path: "/Users/consumer/polaris-light.tokens.json",
      token_names: ["color-bg"],
    };
    expect(validateDtcgIntakeRequestStructure(input).valid).toBe(false);

    const receipt = validateDtcgIntake(input);
    expect(receipt.validated).toBe(false);
    expect(receipt.theme_documents[0]).toMatchObject({
      operand_kind: null,
      validated: false,
    });
    expect(receipt.theme_documents[0]!.issues).toContainEqual({
      ruleId: "intake/non-portable-local-path",
      location: "<request>.theme_documents[0].document_operand",
      reason:
        "Consumer-local filesystem paths are not portable intake operands.",
    });
    expect(receipt.submitted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
    expect(
      receipt.not_accepted_token_reason_denominator.membership,
    ).toContainEqual({
      token_instance_id: "light::color-bg",
      ruleId: "intake/non-portable-local-path",
      location: "color-bg",
      reason:
        "Consumer-local filesystem paths are not portable intake operands.",
    });
  });

  it("does not accept members when a local path is smuggled beside an inline document", () => {
    const input = structuredClone(syntheticRequest()) as unknown as {
      theme_documents: Array<{
        document_operand: Record<string, unknown>;
      }>;
    };
    input.theme_documents[0]!.document_operand.path =
      "/Users/consumer/polaris-light.tokens.json";

    expect(validateDtcgIntakeRequestStructure(input).valid).toBe(false);
    const receipt = validateDtcgIntake(input);
    expect(receipt.validated).toBe(false);
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([]);
    expect(receipt.not_accepted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
    expect(receipt.theme_documents[0]!.issues).toContainEqual({
      ruleId: "intake/non-portable-local-path",
      location: "<request>.theme_documents[0].document_operand",
      reason:
        "Consumer-local filesystem paths are not portable intake operands.",
    });
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 1,
      membership: [
        {
          token_instance_id: "light::color-bg",
          ruleId: "intake/non-portable-local-path",
          location: "tokens.color-bg",
          reason:
            "Consumer-local filesystem paths are not portable intake operands.",
        },
      ],
    });
  });

  it("rejects compact-JSON integrity mutations per member while treating raw-source identity as provenance", () => {
    const input = syntheticRequest();
    const document = input.theme_documents[0]!;
    const mutated: DtcgIntakeRequest = {
      ...input,
      theme_documents: [
        {
          ...document,
          // These valid-but-arbitrary raw-source pins cannot be recomputed from a parsed object.
          source_file_sha256: "f".repeat(64),
          source_file_bytes: 9_999,
          source_order_compact_json_sha256: "0".repeat(64),
          source_order_compact_json_bytes:
            document.source_order_compact_json_bytes + 1,
        },
      ],
    };
    expect(validateDtcgIntakeRequestStructure(mutated)).toEqual({
      valid: true,
      errors: [],
    });

    const receipt = validateDtcgIntake(mutated);
    expect(receipt.validated).toBe(true);
    expect(receipt.accepted_token_instance_denominator.membership).toEqual([]);
    expect(receipt.not_accepted_token_instance_denominator.membership).toEqual([
      "light::color-bg",
    ]);
    expect(
      receipt.theme_documents[0]!.issues.map(({ ruleId }) => ruleId),
    ).toEqual([
      "intake/source-order-compact-json-bytes-mismatch",
      "intake/source-order-compact-json-sha256-mismatch",
    ]);
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 1,
      membership: [
        {
          token_instance_id: "light::color-bg",
          ...receipt.theme_documents[0]!.issues[0]!,
          location: "tokens.color-bg",
        },
      ],
    });
    expect(reasonIntegrityFailures(receipt)).toEqual([]);
  });
});
