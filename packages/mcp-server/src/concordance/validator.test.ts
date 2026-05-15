/**
 * Unit tests for the AJV-based Concordance manifest validator (sprint-97 F2).
 *
 * Covers:
 *   - Forge Object Catalog fixtures (with optional schema_version) pass via the
 *     strip-then-AJV pathway → fully passes G1 against the vendored schema.
 *   - Strip-aware version policy emits warnings on minor mismatch and throws
 *     ConcordanceVersionError on major mismatch.
 *   - AJV error shape (instancePath, keyword, params, message) is preserved on
 *     failure so the T3/T4 422 mapping in s97-m03 can surface Pydantic-style
 *     detail.errors[] cleanly.
 *   - Non-object input is rejected with a structured error rather than crashing.
 */

import { describe, expect, it } from 'vitest';
import { validateManifest } from './validator.js';
import {
  applyVersionPolicy,
  compareSchemaVersion,
  FORGE_SCHEMA_VERSION_PIN,
} from './version-policy.js';
import { ConcordanceVersionError } from './errors.js';
import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };
import subscriptionFixture from '../object-catalog/fixtures/subscription.json' with { type: 'json' };

describe('validator — Forge fixtures pass against vendored manifest.schema.json', () => {
  for (const [name, fixture] of [
    ['user', userFixture],
    ['product', productFixture],
    ['subscription', subscriptionFixture],
  ] as const) {
    it(`${name} fixture validates (schema_version stripped via version-policy pathway)`, () => {
      const result = validateManifest(fixture);
      if (!result.valid) {
        throw new Error(
          `${name} failed: ${JSON.stringify(result.errors, null, 2)}`,
        );
      }
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  }
});

describe('validator — negative cases preserve AJV error shape', () => {
  it('rejects non-object input with a structured error', () => {
    const result = validateManifest(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe('type');
    expect(result.errors[0].instancePath).toBe('');
  });

  it('rejects a root-level Forge-only key with additionalProperties', () => {
    const bad = {
      manifest_version: '4.0',
      source: { agent: 'oods-forge', captured_at: '2026-05-15T00:00:00.000Z' },
      entities: [],
      catalog_version: '1.0.0',
    };
    const result = validateManifest(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
  });

  it('rejects missing required field (entities) with a clear AJV path', () => {
    const bad = {
      manifest_version: '4.0',
      source: { agent: 'oods-forge', captured_at: '2026-05-15T00:00:00.000Z' },
    };
    const result = validateManifest(bad);
    expect(result.valid).toBe(false);
    const requiredErr = result.errors.find((e) => e.keyword === 'required');
    expect(requiredErr).toBeDefined();
    expect(requiredErr?.params?.missingProperty).toBe('entities');
  });
});

describe('version-policy', () => {
  it('exact match returns null', () => {
    expect(applyVersionPolicy('1.1.0')).toBe(null);
  });

  it('patch mismatch returns a non-fatal note', () => {
    const note = applyVersionPolicy('1.1.1');
    expect(note).toContain('patch mismatch');
    expect(note).toContain('1.1.0');
    expect(note).toContain('1.1.1');
  });

  it('minor mismatch returns a warning', () => {
    const note = applyVersionPolicy('1.2.0');
    expect(note).toContain('minor mismatch');
    expect(note).toContain('Continuing');
  });

  it('major mismatch throws ConcordanceVersionError', () => {
    expect(() => applyVersionPolicy('2.0.0')).toThrow(ConcordanceVersionError);
  });

  it('compareSchemaVersion classifies each tier', () => {
    expect(compareSchemaVersion('1.1.0', '1.1.0').kind).toBe('exact');
    expect(compareSchemaVersion('1.1.5', '1.1.0').kind).toBe('patch');
    expect(compareSchemaVersion('1.3.0', '1.1.0').kind).toBe('minor');
    expect(compareSchemaVersion('2.0.0', '1.1.0').kind).toBe('major');
  });

  it('Forge pin is 1.1.0', () => {
    expect(FORGE_SCHEMA_VERSION_PIN).toBe('1.1.0');
  });
});

describe('validator — warnings surface from version policy without failing AJV', () => {
  it('payload with minor-mismatched schema_version yields warning + valid AJV', () => {
    const minorMismatched = {
      ...(userFixture as Record<string, unknown>),
      schema_version: '1.2.0',
    };
    const result = validateManifest(minorMismatched);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('minor mismatch');
  });

  it('payload with major-mismatched schema_version throws before AJV', () => {
    const majorMismatched = {
      ...(userFixture as Record<string, unknown>),
      schema_version: '2.0.0',
    };
    expect(() => validateManifest(majorMismatched)).toThrow(ConcordanceVersionError);
  });
});
