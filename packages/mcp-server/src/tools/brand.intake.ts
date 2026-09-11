import { createHash } from "node:crypto";
import {
  validateDtcgIntake,
  type DtcgIntakeReceipt,
} from "../lib/dtcg-intake/index.js";
import type { DtcgIntakeRequest } from "../lib/dtcg-intake/types.js";

export interface BrandIntakeOutput extends DtcgIntakeReceipt {
  readonly preview_only: true;
  /** SHA256 of the source-order compact JSON envelope. */
  readonly envelopeHash: string;
  readonly delta?: Record<string, unknown>;
  readonly deltaUnavailableReason?: string;
}

// Intake documents use brand-relative, lowercase DTCG paths. Canonical brand
// documents wrap those paths in color.brand.A/B, including full-value aliases.
function brandRelativeDocument(value: unknown, brand: string): unknown {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    key === "$value" && typeof child === "string" && /^\{[a-z0-9.-]+\}$/.test(child)
      ? `{color.brand.${brand}.${child.slice(1, -1)}}`
      : brandRelativeDocument(child, brand),
  ]));
}

/** Validate without persistence; only fully accepted, mapped inline envelopes yield a delta. */
export async function handle(input: unknown): Promise<BrandIntakeOutput> {
  const receipt = validateDtcgIntake(input);
  const envelopeHash = createHash("sha256").update(JSON.stringify(input ?? null)).digest("hex");
  const request = input as DtcgIntakeRequest;
  const targets = receipt.theme_documents.map(document => document.target_brand_document);
  const consumable = receipt.validated && receipt.request_issues.length === 0 &&
    receipt.submitted_token_instance_denominator.count > 0 &&
    receipt.not_accepted_token_instance_denominator.count === 0 &&
    receipt.theme_documents.every(document => document.issues.length === 0 && document.operand_kind === "inline-document") &&
    targets.every(target => target !== null) && new Set(targets).size === targets.length &&
    (receipt.requested.brand_id === "A" || receipt.requested.brand_id === "B");
  return {
    ...receipt,
    preview_only: true,
    envelopeHash,
    ...(consumable ? {
      delta: Object.fromEntries(request.theme_documents.map(document => [
        document.target_brand_document!,
        { color: { brand: { [request.brand_id]: brandRelativeDocument(
          (document.document_operand as { document: unknown }).document, request.brand_id,
        ) } } },
      ])),
    } : {
      deltaUnavailableReason: "A delta requires fully accepted brand-relative inline documents for existing brand A or B, with unique mapped target themes. No content-reference resolver or brand-creation path exists.",
    }),
  };
}
