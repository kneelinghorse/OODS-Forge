import {
  validateDtcgIntake,
  type DtcgIntakeReceipt,
} from "../lib/dtcg-intake/index.js";

export interface BrandIntakeOutput extends DtcgIntakeReceipt {
  /** This tool only validates and receipts; it never persists an artifact. */
  readonly preview_only: true;
}

/**
 * Validate and receipt a DTCG intake request entirely in memory.
 *
 * The framework validates the wire request before this handler runs. Keeping the
 * handler as a direct, filesystem-free engine delegation makes its read-only
 * semantics explicit and prevents brand.apply's transcript writes from leaking
 * into dry-run intake.
 */
export async function handle(input: unknown): Promise<BrandIntakeOutput> {
  return {
    ...validateDtcgIntake(input),
    preview_only: true,
  };
}
