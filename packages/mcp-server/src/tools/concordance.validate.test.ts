/**
 * concordance.validate tool handler unit tests.
 *
 * Covers:
 *   - valid manifest: passes through with versionPolicy=exact|minor|patch
 *   - invalid manifest: AJV-native error shape preserved
 *   - inline vs file source paths
 *   - path safety: absolute path / parent-traversal / missing file all rejected
 *   - throwOnVersionError flag toggle (major mismatch surfaces as error vs ToolError)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };

import { handle } from './concordance.validate.js';
import { isToolError } from '../errors/tool-error.js';

const userManifest = userFixture as Record<string, unknown>;
const productManifest = productFixture as Record<string, unknown>;

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'concordance-validate-'));
});

afterEach(() => {
  if (tmpRoot && fs.existsSync(tmpRoot)) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

describe('concordance.validate — inline manifest path', () => {
  it('returns valid=true with no errors for a sprint-97 fixture', async () => {
    const out = await handle({ manifest: userManifest });
    expect(out.valid).toBe(true);
    expect(out.errors).toEqual([]);
    expect(out.diagnostics.source).toBe('inline');
    expect(out.diagnostics.manifestPath).toBeNull();
    expect(out.diagnostics.entityCount).toBe(1);
  });

  it('reports schema_version observed and version policy outcome', async () => {
    const out = await handle({ manifest: userManifest });
    expect(out.schemaVersion).toBe('1.1.0');
    // FORGE_SCHEMA_VERSION_PIN is currently 1.1.0 — exact match.
    expect(out.versionPolicy).toBe('exact');
    expect(out.diagnostics.expectedSchemaVersion).toBe('1.1.0');
  });

  it('returns warnings on a minor version mismatch', async () => {
    const drift = { ...userManifest, schema_version: '1.2.0' };
    const out = await handle({ manifest: drift });
    expect(out.versionPolicy).toBe('minor');
    expect(out.warnings.length).toBeGreaterThan(0);
    expect(out.warnings[0]).toMatch(/minor mismatch/);
    // Validation itself still passes (the strip-then-AJV pathway tolerates new minor).
    expect(out.valid).toBe(true);
  });

  it('reports versionPolicy=absent when schema_version is missing', async () => {
    const withoutVersion = { ...userManifest } as Record<string, unknown>;
    delete withoutVersion.schema_version;
    const out = await handle({ manifest: withoutVersion });
    expect(out.versionPolicy).toBe('absent');
    expect(out.schemaVersion).toBeNull();
  });
});

describe('concordance.validate — invalid manifest surfaces structured errors', () => {
  it('reports missing manifest_version with AJV-native shape', async () => {
    const broken = { ...userManifest } as Record<string, unknown>;
    delete broken.manifest_version;
    const out = await handle({ manifest: broken });
    expect(out.valid).toBe(false);
    expect(out.errors.length).toBeGreaterThan(0);
    const missing = out.errors.find(
      (e) => e.keyword === 'required' && (e.params as { missingProperty?: string })?.missingProperty === 'manifest_version',
    );
    expect(missing, 'expected required-manifest_version error').toBeDefined();
    expect(missing?.instancePath).toBe('');
  });

  it('reports additionalProperties violations (Forge-only keys must fail)', async () => {
    const broken = { ...userManifest, forge_only_field: 'should fail' };
    const out = await handle({ manifest: broken });
    expect(out.valid).toBe(false);
    const extra = out.errors.find((e) => e.keyword === 'additionalProperties');
    expect(extra, 'expected additionalProperties error').toBeDefined();
  });

  it('rejects non-object payloads at the handler boundary (ToolError OODS-CV-010)', async () => {
    // The MCP harness layer also rejects this via the input JSON schema; the
    // handler enforces the same contract for direct callers.
    try {
      await handle({ manifest: 'not-an-object' as unknown as Record<string, unknown> });
      expect.fail('should have rejected non-object manifest');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-010');
    }
  });
});

describe('concordance.validate — major version mismatch policy', () => {
  it('surfaces a structured error by default (throwOnVersionError omitted)', async () => {
    const majorDrift = { ...userManifest, schema_version: '2.0.0' };
    const out = await handle({ manifest: majorDrift });
    expect(out.valid).toBe(false);
    expect(out.versionPolicy).toBe('major');
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].keyword).toBe('schema_version');
    expect(out.errors[0].params).toMatchObject({ expected: '1.1.0', observed: '2.0.0' });
  });

  it('throws ToolError when throwOnVersionError=true', async () => {
    const majorDrift = { ...userManifest, schema_version: '2.0.0' };
    await expect(
      handle({ manifest: majorDrift, throwOnVersionError: true }),
    ).rejects.toMatchObject({ opiCode: 'OODS-CV-012' });
  });
});

describe('concordance.validate — file-path source', () => {
  function writeFixture(name: string, payload: unknown): string {
    const filename = path.join(tmpRoot, name);
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2), 'utf8');
    return name;
  }

  it('loads and validates a manifest from a project-relative path', async () => {
    const relName = writeFixture('product.json', productManifest);
    const out = await handle({ manifestPath: relName, projectRoot: tmpRoot });
    expect(out.valid).toBe(true);
    expect(out.diagnostics.source).toBe('file');
    expect(out.diagnostics.manifestPath).toBe('product.json');
    expect(out.diagnostics.entityCount).toBe(1);
  });

  it('rejects absolute manifestPath', async () => {
    const absPath = path.join(tmpRoot, 'whatever.json');
    fs.writeFileSync(absPath, '{}', 'utf8');
    try {
      await handle({ manifestPath: absPath, projectRoot: tmpRoot });
      expect.fail('should have rejected absolute path');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-002');
    }
  });

  it('rejects parent-directory traversal in manifestPath', async () => {
    try {
      await handle({ manifestPath: '../etc/passwd', projectRoot: tmpRoot });
      expect.fail('should have rejected parent traversal');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-003');
    }
  });

  it('rejects a manifestPath that does not exist on disk', async () => {
    try {
      await handle({ manifestPath: 'missing.json', projectRoot: tmpRoot });
      expect.fail('should have rejected missing file');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-005');
    }
  });

  it('rejects a manifestPath whose file is not valid JSON', async () => {
    fs.writeFileSync(path.join(tmpRoot, 'corrupt.json'), '{not json', 'utf8');
    try {
      await handle({ manifestPath: 'corrupt.json', projectRoot: tmpRoot });
      expect.fail('should have rejected malformed JSON');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-007');
    }
  });
});

describe('concordance.validate — input contract guards', () => {
  it('rejects empty input', async () => {
    try {
      await handle({} as Parameters<typeof handle>[0]);
      expect.fail('should have rejected empty input');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-011');
    }
  });

  it('rejects non-object manifest payload', async () => {
    try {
      await handle({ manifest: 42 as unknown as Record<string, unknown> });
      expect.fail('should have rejected non-object manifest');
    } catch (err) {
      expect(isToolError(err)).toBe(true);
      expect((err as { opiCode: string }).opiCode).toBe('OODS-CV-010');
    }
  });
});
