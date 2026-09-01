export type ForgeTargetTheme = "light" | "dark" | "hc";
export type ForgeTargetBrandDocument = "base" | "dark" | "hc";

export type DtcgIntakeMappingStatus =
  | "PROPOSED-NOT-EXECUTABLE"
  | "UNMAPPED-REQUIRES-VARIANT-SUPPORT";

export interface InlineDocumentOperand {
  readonly kind: "inline-document";
  readonly document: unknown;
}

export interface AuthorizedContentAddressedReferenceOperand {
  readonly kind: "authorized-content-addressed-reference";
  /** Content address only. Filesystem paths are not part of this grammar. */
  readonly uri: string;
  /** Required so an unresolved reference can still produce a no-silent-drop receipt. */
  readonly token_names: readonly string[];
}

export type DtcgDocumentOperand =
  | InlineDocumentOperand
  | AuthorizedContentAddressedReferenceOperand;

export interface DtcgIntakeThemeDocument {
  readonly source_theme_id: string;
  readonly target_theme: ForgeTargetTheme | null;
  readonly target_brand_document: ForgeTargetBrandDocument | null;
  readonly mapping_status: DtcgIntakeMappingStatus;
  /** Integrity of the delivered source file; validated as provenance, not recomputed. */
  readonly source_file_sha256: string;
  readonly source_file_bytes: number;
  /** Integrity of JSON.stringify(document), which this in-memory engine can recompute. */
  readonly source_order_compact_json_sha256: string;
  readonly source_order_compact_json_bytes: number;
  readonly document_operand: DtcgDocumentOperand;
}

export interface DtcgIntakeRequest {
  /** Dry-run only. Required and forced false; true is a typed rejection. */
  readonly apply: false;
  readonly brand_id: string;
  readonly profile: "FORGE-SCALAR-DTCG-1";
  readonly theme_documents: readonly DtcgIntakeThemeDocument[];
}

export interface DtcgIntakeIssue {
  readonly ruleId: string;
  readonly location: string;
  readonly reason: string;
}

export interface DtcgNotAcceptedTokenReason extends DtcgIntakeIssue {
  /** Primary reason; this denominator has exactly one member per not-accepted token instance. */
  readonly token_instance_id: string;
}

export interface DtcgMembershipDenominator<T = string> {
  readonly count: number;
  readonly membership: readonly T[];
}

export interface DtcgIntakeThemeDocumentReceipt {
  readonly source_theme_id: string;
  readonly mapping_status: DtcgIntakeMappingStatus | null;
  readonly target_theme: ForgeTargetTheme | null;
  readonly target_brand_document: ForgeTargetBrandDocument | null;
  readonly operand_kind: DtcgDocumentOperand["kind"] | null;
  /** True when the document's member evaluation ran; inspect accepted/not-accepted for its verdict. */
  readonly validated: boolean;
  readonly submitted_token_instance_denominator: DtcgMembershipDenominator;
  readonly accepted_token_instance_denominator: DtcgMembershipDenominator;
  readonly not_accepted_token_instance_denominator: DtcgMembershipDenominator;
  readonly issues: readonly DtcgIntakeIssue[];
}

export interface DtcgIntakeReceipt {
  readonly mode: "PREVIEW-ONLY";
  readonly grammar_profile: "FORGE-SCALAR-DTCG-1";
  readonly requested: {
    readonly apply: boolean | null;
    readonly brand_id: string | null;
    readonly profile: string | null;
  };
  readonly validated: boolean;
  readonly applied: false;
  readonly brand_created: false;
  readonly request_issues: readonly DtcgIntakeIssue[];
  readonly theme_documents: readonly DtcgIntakeThemeDocumentReceipt[];
  readonly submitted_token_instance_denominator: DtcgMembershipDenominator;
  readonly accepted_token_instance_denominator: DtcgMembershipDenominator;
  readonly not_accepted_token_instance_denominator: DtcgMembershipDenominator;
  readonly submitted_minus_accepted_denominator: DtcgMembershipDenominator;
  readonly accepted_minus_submitted_denominator: DtcgMembershipDenominator;
  readonly not_accepted_token_reason_denominator: DtcgMembershipDenominator<DtcgNotAcceptedTokenReason>;
  readonly build_artifact_denominator: DtcgMembershipDenominator<never>;
  readonly preview: {
    readonly classification: "PREVIEW-ONLY";
    readonly persisted: false;
    readonly accepted_population: DtcgMembershipDenominator;
    readonly disclosure: string;
  };
}

export interface ForgeScalarDtcgTokenCandidate {
  /** Source token name used in the <source_theme_id>::<token_name> identity. */
  readonly token_name: string;
  /** Full dot path used for rule diagnostics and alias resolution. */
  readonly location: string;
  /** Unjoined source keys, retained so an illegal literal '.' cannot be normalized away. */
  readonly path_segments: readonly string[];
  readonly node: unknown;
}

export interface ForgeScalarDtcgDocumentValidation {
  readonly candidates: readonly ForgeScalarDtcgTokenCandidate[];
  readonly accepted_token_names: readonly string[];
  readonly not_accepted_token_names: readonly string[];
  readonly reasons: readonly (DtcgIntakeIssue & {
    readonly token_name: string;
  })[];
  readonly issues: readonly DtcgIntakeIssue[];
}
