/**
 * Integration gates — T2 (local) and T3 (hosted unauthenticated) for the
 * ConcordanceClient (sprint-97 F2/m03).
 *
 * Both gates are NETWORK-AWARE NOT SILENT: at module load the test file probes
 * each base URL once. Unreachable services cause `describe.skipIf(...)` to skip
 * the whole block with a clear test-runner message. Within a reachable block,
 * auth-dependent steps are gated on CONCORDANCE_API_KEY presence.
 *
 * Opt-out: set CONCORDANCE_SKIP_INTEGRATION=1 to skip both gates entirely (for
 * fully air-gapped CI environments).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md §"Contract Test Matrix"
 */

import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { ConcordanceClient } from './client.js';
import { ConcordanceAuthError, ConcordanceError } from './errors.js';
import { HOSTED_BASE_URL, LOCAL_BASE_URL } from './config.js';
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };

const FORCE_SKIP = process.env.CONCORDANCE_SKIP_INTEGRATION === '1';

async function reach(url: string, timeoutMs = 2000): Promise<boolean> {
  if (FORCE_SKIP) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Top-level reachability probes. Top-level await is supported by vitest's ESM runner.
const localReachable = await reach(LOCAL_BASE_URL);
const hostedReachable = await reach(HOSTED_BASE_URL);

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonicalize((value as Record<string, unknown>)[k]))
      .join(',') +
    '}'
  );
}

function hashOf(value: unknown): string {
  return createHash('sha256').update(canonicalize(value)).digest('hex');
}

describe.skipIf(!localReachable)('T2 — Local Concordance round-trip', () => {
  const client = new ConcordanceClient({ baseUrl: LOCAL_BASE_URL });

  it('T2e: GET /version returns wire 1.1.0 + service metadata', async () => {
    const result = await client.version();
    expect(result.data.schema_version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(typeof result.data.service_version).toBe('string');
    expect(result.data.current_sprint_id).toMatch(/^sprint-\d+$/);
    expect(result.diagnostics.requestId).not.toBeNull();
  });

  describe.skipIf(!process.env.CONCORDANCE_API_KEY)('T2f/T2round-trip (authenticated)', () => {
    it('POST /manifests with product fixture returns ingested_entities == 1', async () => {
      const result = await client.submitManifest(productFixture);
      expect(result.diagnostics.status).toBe(200);
      const ingested = (result.data as { ingested_entities?: number }).ingested_entities;
      expect(ingested).toBe(1);
    });

    it('GET /entities/{urn} is hash-stable across two consecutive reads', async () => {
      const urn = productFixture.entities[0].urn;
      const first = await client.getEntity(urn);
      const second = await client.getEntity(urn);
      expect(hashOf(first.data)).toBe(hashOf(second.data));
    });
  });
});

describe.skipIf(!hostedReachable)('T3 — Hosted Concordance unauthenticated probes', () => {
  const client = new ConcordanceClient({ baseUrl: HOSTED_BASE_URL });

  it('T3a: GET /health returns 200 with status:ok and diagnostics headers', async () => {
    const result = await client.health();
    expect(result.data.status).toBe('ok');
    expect(result.diagnostics.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(result.diagnostics.schemaVersion).toBe('1.1.0');
    expect(result.diagnostics.status).toBe(200);
  });

  it('T3b: GET /version returns schema_version 1.1.0 with all required fields', async () => {
    const result = await client.version();
    expect(result.data.schema_version).toBe('1.1.0');
    expect(typeof result.data.service_version).toBe('string');
    expect(typeof result.data.recipe_versions).toBe('object');
    expect(result.data.current_sprint_id).toMatch(/^sprint-\d+$/);
  });

  it('T3c/T3d: Concordance-Schema-Version + X-Request-Id headers are captured on every call', async () => {
    const a = await client.health();
    const b = await client.version();
    for (const r of [a, b]) {
      expect(r.diagnostics.schemaVersion).toBe('1.1.0');
      expect(r.diagnostics.requestId).not.toBeNull();
    }
    // X-Request-Id varies per call.
    expect(a.diagnostics.requestId).not.toBe(b.diagnostics.requestId);
  });

  it('T3e: GET /openapi.json returns a parseable spec with info.version', async () => {
    const result = await client.openapi();
    expect(result.data.info?.version).toMatch(/^\d/);
    expect(typeof result.data.paths).toBe('object');
  });

  it('T3.docs: GET /docs returns 200', async () => {
    const result = await client.docs();
    expect(result.diagnostics.status).toBe(200);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('T3.redoc: GET /redoc returns 200', async () => {
    const result = await client.redoc();
    expect(result.diagnostics.status).toBe(200);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('T3 negative: no Bearer required for probes; an authenticated call without a key fails before the network', async () => {
    const probeOnly = new ConcordanceClient({ baseUrl: HOSTED_BASE_URL });
    // Sanity: a probe still works with no key set.
    delete process.env.CONCORDANCE_API_KEY;
    const probe = await probeOnly.health();
    expect(probe.data.status).toBe('ok');
    // Authenticated call should refuse before the network.
    try {
      await probeOnly.submitManifest({});
      throw new Error('expected ConcordanceAuthError(missing)');
    } catch (err) {
      expect(err).toBeInstanceOf(ConcordanceAuthError);
      // Pre-network errors have no diagnostics (no response was received).
      expect((err as ConcordanceError).diagnostics).toBe(null);
    }
  });
});
