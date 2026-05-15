/**
 * AJV-based Concordance manifest validator (sprint-97 F2 skeleton).
 *
 * Loads the vendored Concordance contracts at module init and exposes a
 * single validateManifest(payload) entry. No network calls — that's m03.
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md
 *
 * Version policy:
 *   The local vendored manifest.schema.json is at wire 1.0.0 (no schema_version
 *   property at the root, additionalProperties:false). The hosted service is at
 *   wire 1.1.0 (schema_version added as optional). To honor both:
 *
 *     1. If the incoming payload has schema_version, run it through the version
 *        policy (warn on minor mismatch, throw on major).
 *     2. Strip schema_version before handing to AJV so the strict
 *        additionalProperties:false check doesn't reject it.
 *
 *   When the upstream contracts/manifest.schema.json gets the 1.1.0 update
 *   (adding schema_version to its properties list), the strip step becomes a
 *   no-op — but the policy logic still applies for cross-version drift.
 */

// Match the existing lib/ajv.ts pattern: ajv's empty exports map breaks NodeNext
// subpath resolution at type-check time, and ajv-formats ships CJS with default
// export riding on module.exports. The interop dance below is exactly what
// lib/ajv.ts does.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support
import Ajv2020Import from 'ajv/dist/2020.js';
import type { ErrorObject, ValidateFunction } from 'ajv';
import addFormatsImport from 'ajv-formats';
import manifestSchema from './contracts/manifest.schema.json' with { type: 'json' };
import { applyVersionPolicy } from './version-policy.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;
const addFormats: any = (addFormatsImport as any).default ?? addFormatsImport;

export interface ValidationResult {
  valid: boolean;
  /** AJV-native error shape — instancePath/message/keyword/params preserved for downstream mapping (T3/T4 422 → Pydantic detail.errors[]). */
  errors: ErrorObject[];
  /** Non-fatal version-policy notes (e.g. minor schema_version drift). */
  warnings: string[];
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const manifestValidator: ValidateFunction = ajv.compile(manifestSchema);

export function validateManifest(payload: unknown): ValidationResult {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [
        {
          keyword: 'type',
          instancePath: '',
          schemaPath: '#/type',
          params: { type: 'object' },
          message: 'must be object',
        },
      ],
      warnings: [],
    };
  }

  const raw = payload as Record<string, unknown>;
  const warnings: string[] = [];

  const observed = typeof raw.schema_version === 'string' ? raw.schema_version : null;
  if (observed !== null) {
    const warning = applyVersionPolicy(observed);
    if (warning) warnings.push(warning);
  }

  const stripped: Record<string, unknown> = { ...raw };
  delete stripped.schema_version;

  const valid = manifestValidator(stripped) as boolean;

  return {
    valid,
    errors: valid ? [] : [...(manifestValidator.errors ?? [])],
    warnings,
  };
}

export { manifestSchema };
