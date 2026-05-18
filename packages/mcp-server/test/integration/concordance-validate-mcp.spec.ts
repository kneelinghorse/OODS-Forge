/**
 * concordance.validate — MCP harness round-trip integration.
 *
 * Drives the tool through the same input/output schema validation chain the
 * stdio server applies in src/index.ts:
 *   1. Compile the tool's input JSON schema, validate the call arguments.
 *   2. Invoke handle().
 *   3. Compile the tool's output JSON schema, validate the result.
 *
 * Both the sprint-97 internal fixtures (valid) and a deliberately-broken
 * mutation (invalid) round-trip through the chain without losing the AJV
 * native error shape.
 */

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };

import { getAjv } from '../../src/lib/ajv.js';
import { handle } from '../../src/tools/concordance.validate.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = path.join(HERE, '..', '..', 'src', 'schemas');

function loadSchema(name: string): object {
  return JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, name), 'utf8'));
}

const inputSchema = loadSchema('concordance.validate.input.json');
const outputSchema = loadSchema('concordance.validate.output.json');

const ajv = getAjv();
const validateIn = ajv.compile(inputSchema);
const validateOut = ajv.compile(outputSchema);

describe('concordance.validate — MCP harness round-trip', () => {
  it('round-trips a valid inline manifest through input + output validation', async () => {
    const args = { manifest: userFixture };
    expect(validateIn(args), `input schema errors: ${JSON.stringify(validateIn.errors)}`).toBe(true);

    const result = await handle(args);
    expect(validateOut(result), `output schema errors: ${JSON.stringify(validateOut.errors)}`).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.diagnostics.source).toBe('inline');
    expect(result.diagnostics.expectedSchemaVersion).toBe('1.1.0');
  });

  it('round-trips a valid manifest with relationships.edges', async () => {
    const args = { manifest: subscriptionFixture };
    expect(validateIn(args)).toBe(true);
    const result = await handle(args);
    expect(validateOut(result)).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.diagnostics.entityCount).toBe(1);
  });

  it('round-trips an invalid manifest preserving AJV error shape', async () => {
    const broken = { ...(userFixture as Record<string, unknown>) };
    delete broken.manifest_version;
    const args = { manifest: broken };
    expect(validateIn(args)).toBe(true);

    const result = await handle(args);
    expect(validateOut(result)).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // Every error preserves AJV-native shape.
    for (const e of result.errors) {
      expect(typeof e.keyword).toBe('string');
      expect(typeof e.instancePath).toBe('string');
      expect(typeof e.message).toBe('string');
    }
  });

  it('rejects an input that fails the input schema (both manifest and manifestPath omitted)', () => {
    expect(validateIn({})).toBe(false);
  });

  it('rejects an input with both manifest and manifestPath supplied (oneOf)', () => {
    expect(
      validateIn({ manifest: { manifest_version: '4.0', entities: [] }, manifestPath: 'whatever.json' }),
    ).toBe(false);
  });

  it('round-trips a major-version mismatch as a structured error in the output', async () => {
    const drift = { ...(userFixture as Record<string, unknown>), schema_version: '2.0.0' };
    const args = { manifest: drift };
    expect(validateIn(args)).toBe(true);
    const result = await handle(args);
    expect(validateOut(result)).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.versionPolicy).toBe('major');
    expect(result.errors[0].keyword).toBe('schema_version');
  });
});
