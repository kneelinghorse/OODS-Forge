/**
 * Concordance client error classes (sprint-97 F2/m03).
 *
 * Locked HTTP-status → error-class mapping lives in cmos/foundational-docs/technical/concordance-integration.md §Auth Error Mapping.
 * F2 lands the ones used by the validator + future client surface; F2/F3 add the rest as needed.
 */

export interface ConcordanceDiagnostics {
  /** UUIDv4 x-request-id header captured from the response. */
  requestId: string | null;
  /** concordance-schema-version header captured from the response. */
  schemaVersion: string | null;
  /** HTTP status code of the response. Null when the error is pre-network. */
  status: number | null;
  /** Milliseconds spent on the wire (Date.now() based). */
  durationMs: number | null;
}

export class ConcordanceError extends Error {
  readonly code: string = 'concordance_error';
  /** Populated when the error rides a network response. Null for pre-network errors (missing key, version mismatch detected before the call). */
  diagnostics: ConcordanceDiagnostics | null = null;
  constructor(message: string) {
    super(message);
    this.name = 'ConcordanceError';
  }
}

export class ConcordanceVersionError extends ConcordanceError {
  override readonly code = 'concordance_version_mismatch';
  constructor(
    public readonly expected: string,
    public readonly observed: string,
  ) {
    super(
      `Concordance schema_version major mismatch: expected ${expected}, observed ${observed}`,
    );
    this.name = 'ConcordanceVersionError';
  }
}

export class ConcordanceAuthError extends ConcordanceError {
  override readonly code = 'concordance_auth_error';
  constructor(public readonly reason: 'missing' | 'invalid') {
    super(`Concordance authentication ${reason}`);
    this.name = 'ConcordanceAuthError';
  }
}

export class ConcordancePermissionError extends ConcordanceError {
  override readonly code = 'concordance_auth_forbidden';
  constructor(public readonly workspace: string | null) {
    super(
      `Concordance permission denied${workspace ? ` for workspace ${workspace}` : ''}`,
    );
    this.name = 'ConcordancePermissionError';
  }
}

export class ConcordanceValidationError extends ConcordanceError {
  override readonly code = 'concordance_validation_error';
  constructor(
    message: string,
    public readonly detailErrors: ReadonlyArray<unknown>,
  ) {
    super(message);
    this.name = 'ConcordanceValidationError';
  }
}
