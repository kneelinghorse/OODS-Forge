/**
 * I1 — Authenticated hosted smoke (sprint-97 m04).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md §T4
 *       cmos/messages/outbound/2026-05-15-concordance-preflight-ack.md
 *
 * Two-gate guard, in this order:
 *   1. RUN_HOSTED_SMOKE=1     (sprint-level gate; default pnpm test skips)
 *   2. CONCORDANCE_API_KEY    (key presence; skip if absent, with clear reason)
 *
 * When both are set, the smoke does the minimum to prove the auth path is live:
 *   Step 1 — POST /manifests/validate with the User fixture
 *            (smallest valid Forge payload; validate has no entity-creation side effect).
 *   Step 2 — POST /manifests with the Subscription fixture
 *            (exercises relationships.edges[]); assert ingested_entities matches and
 *            GET /entities/{urn} returns the canonical kernel.
 *
 * Auth hygiene: nothing in this file logs, asserts against, or echoes the
 * literal key. The client itself reads CONCORDANCE_API_KEY at request time.
 * A separate audit test (auth-hygiene.test.ts in this folder) greps the
 * concordance source tree to catch any future leaks.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { ConcordanceClient } from '../../src/concordance/client.js';
import { HOSTED_BASE_URL } from '../../src/concordance/config.js';
import {
  ConcordanceAuthError,
  ConcordanceValidationError,
} from '../../src/concordance/errors.js';
import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../../src/object-catalog/fixtures/product.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };
import billingFixture from '../fixtures/object-catalog/billing-multi-entity.json' with { type: 'json' };
import { createHash } from 'node:crypto';

const RUN = process.env.RUN_HOSTED_SMOKE === '1';
const KEY_PRESENT = typeof process.env.CONCORDANCE_API_KEY === 'string' && process.env.CONCORDANCE_API_KEY.length > 0;
const ENABLED = RUN && KEY_PRESENT;

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

/**
 * Drop the oods.* extension layer from a SemanticEntity payload, leaving the
 * concordance canonical kernel. Per D1, the Object Catalog is
 * SemanticEntity-extended: oods.* is Forge's overlay; concordance owns the
 * kernel.
 */
function stripOodsExtension(entity: Record<string, unknown>): Record<string, unknown> {
  const { oods: _oods, ...kernel } = entity;
  return kernel;
}

/**
 * Empty-default sentinels concordance's Pydantic model materializes for
 * optional fields a client omitted. These are not destructive mutations; they
 * are the Python-side representation of "absent." When concordance has a value
 * for one of these fields that is NOT a sentinel, that means the kernel was
 * mutated and the kernel-stability claim has failed.
 */
function isOptionalDefault(value: unknown): boolean {
  if (value === null) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Deep equality with the kernel-stability semantic:
 *   - every key/value in `expected` must appear in `actual` with the same value
 *   - `actual` MAY carry additional keys, but only if the values are optional
 *     defaults (null / [] / {}). Any non-default extra is a contract violation.
 *
 * This is the operational form of "concordance preserves the kernel verbatim
 * and only materializes optional-field defaults." Returns a list of dot-path
 * diffs; empty array means the kernel is stable.
 */
function diffKernel(
  expected: unknown,
  actual: unknown,
  path = '',
): string[] {
  const diffs: string[] = [];

  if (expected === null || typeof expected !== 'object') {
    if (expected !== actual) diffs.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return diffs;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      diffs.push(`${path}: expected array, got ${typeof actual}`);
      return diffs;
    }
    if (expected.length !== actual.length) {
      diffs.push(`${path}: expected length ${expected.length}, got ${actual.length}`);
      return diffs;
    }
    for (let i = 0; i < expected.length; i++) {
      diffs.push(...diffKernel(expected[i], actual[i], `${path}[${i}]`));
    }
    return diffs;
  }

  if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
    diffs.push(`${path}: expected object, got ${actual === null ? 'null' : typeof actual}`);
    return diffs;
  }

  const expectedObj = expected as Record<string, unknown>;
  const actualObj = actual as Record<string, unknown>;
  for (const key of Object.keys(expectedObj)) {
    if (!(key in actualObj)) {
      diffs.push(`${path}.${key}: missing in actual (forge declared, concordance dropped)`);
      continue;
    }
    diffs.push(...diffKernel(expectedObj[key], actualObj[key], `${path}.${key}`));
  }
  // Concordance may add optional-default keys; reject any extra carrying a real value.
  for (const key of Object.keys(actualObj)) {
    if (key in expectedObj) continue;
    if (!isOptionalDefault(actualObj[key])) {
      diffs.push(`${path}.${key}: concordance added non-default value ${JSON.stringify(actualObj[key])}`);
    }
  }
  return diffs;
}

describe.skipIf(!ENABLED)('I1 — Authenticated hosted smoke', () => {
  // Railway-hosted Concordance can cold-start past the 5s production-codegen
  // default. Smoke tests run rarely; widen the blocking timeout for THIS spec
  // only via env override, leaving production codegen timeout behavior intact.
  beforeAll(() => {
    if (!process.env.CONCORDANCE_TIMEOUT_MS_BLOCKING) {
      process.env.CONCORDANCE_TIMEOUT_MS_BLOCKING = '15000';
    }
  });

  const client = new ConcordanceClient({ baseUrl: HOSTED_BASE_URL });

  it('Step 1: POST /manifests/validate with User fixture returns 200 + 1.1.0 header + x-request-id', async () => {
    try {
      const result = await client.validateManifestRemote(userFixture);
      // eslint-disable-next-line no-console
      console.info(`[I1 step1] validate status=${result.diagnostics.status} schema_version=${result.diagnostics.schemaVersion} request_id=${result.diagnostics.requestId} duration_ms=${result.diagnostics.durationMs}`);
      expect(result.diagnostics.status).toBe(200);
      expect(result.diagnostics.schemaVersion).toBe('1.1.0');
      expect(result.diagnostics.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    } catch (err) {
      if (err instanceof ConcordanceAuthError) {
        throw new Error(
          `I1 step 1 failed: Bearer key did not authenticate against hosted Concordance — reason="${err.reason}". ` +
            `Confirm CONCORDANCE_API_KEY is the current sprint-97 key.`,
        );
      }
      if (err instanceof ConcordanceValidationError) {
        // 422 from /validate with a real fixture means the fixture is malformed against
        // the hosted Pydantic schema. Surface detail.errors[] for diagnostics.
        throw new Error(
          `I1 step 1 unexpectedly returned 422: detail.errors = ${JSON.stringify(err.detailErrors, null, 2)}`,
        );
      }
      throw err;
    }
  });

  it('Step 2a: POST /manifests with Subscription fixture returns ingested_entities matching entities.length', async () => {
    const expectedCount = subscriptionFixture.entities.length;
    try {
      const result = await client.submitManifest(subscriptionFixture);
      // eslint-disable-next-line no-console
      console.info(`[I1 step2a] submit status=${result.diagnostics.status} schema_version=${result.diagnostics.schemaVersion} request_id=${result.diagnostics.requestId} duration_ms=${result.diagnostics.durationMs} ingested=${(result.data as { ingested_entities?: number }).ingested_entities}`);
      expect([200, 201]).toContain(result.diagnostics.status ?? 0);
      const ingested = (result.data as { ingested_entities?: number }).ingested_entities;
      expect(ingested).toBe(expectedCount);
    } catch (err) {
      if (err instanceof ConcordanceAuthError) {
        throw new Error(
          `I1 step 2 auth failure: ${err.reason}. Bearer key did not authenticate.`,
        );
      }
      throw err;
    }
  });

  it('Step 2b: GET /entities/{urn} returns the canonical kernel for the ingested URN', async () => {
    const urn = subscriptionFixture.entities[0].urn;
    const first = await client.getEntity(urn);
    // eslint-disable-next-line no-console
    console.info(`[I1 step2b.read1] get status=${first.diagnostics.status} schema_version=${first.diagnostics.schemaVersion} request_id=${first.diagnostics.requestId} duration_ms=${first.diagnostics.durationMs}`);
    expect(first.diagnostics.status).toBe(200);
    // Round-trip determinism: a second read yields a byte-equal canonical hash.
    const second = await client.getEntity(urn);
    // eslint-disable-next-line no-console
    console.info(`[I1 step2b.read2] get status=${second.diagnostics.status} request_id=${second.diagnostics.requestId} duration_ms=${second.diagnostics.durationMs} hash_match=${hashOf(first.data) === hashOf(second.data)}`);
    expect(hashOf(first.data)).toBe(hashOf(second.data));
  });

  // ── G3 hosted canonical-kernel stability gate (s98-m04, extended s99-m03) ───
  //
  // Extends G3 from fixture-internal hash stability (src/object-catalog/
  // gates.test.ts) to a live hosted round-trip. Forge POSTs each fixture
  // manifest, GETs /entities/{urn} back per declared entity, strips the
  // oods.* overlay from both sides, and asserts that every Forge-declared
  // value appears verbatim in concordance's response. Concordance is allowed
  // to materialize optional fields its Pydantic model exposes (null / empty
  // array / empty object) — that is JSON-API idiom, not mutation. It is NOT
  // allowed to drop a Forge-provided value or alter one to a non-default.
  //
  // Per D1, the Object Catalog is SemanticEntity-extended; concordance owns
  // and persists the kernel. This gate makes the "concordance preserves the
  // kernel verbatim" claim executable against the live service.
  //
  // Sprint-99 m03 extends from 1 fixture (subscription, sprint-98 m04) to 4:
  //   - user (informational, no edges)
  //   - product (action-shaped)
  //   - subscription (relationships.edges with internal targets)
  //   - billing-multi-entity (3 cross-linked entities; per-entity GET pattern)
  //
  // The multi-entity fixture is the novel pattern: one manifest POST creates
  // 3 entities, then 3 separate GETs each diffKernel-checked against the
  // corresponding source entity. This proves concordance preserves cross-
  // entity relationships byte-faithful even when entities are re-emitted as
  // separate per-entity reads.
  //
  // Reuses diffKernel() unchanged per decision #440 (canonical-kernel D1
  // contract: future fixtures add by URN without modifying the helper).
  //
  // Idempotent: all fixture URNs are stable; re-runs re-POST + re-GET.

  type FixtureCase = {
    name: string;
    manifest: { entities: Array<Record<string, unknown>> };
  };

  const fixtureCases: FixtureCase[] = [
    { name: 'user', manifest: userFixture as FixtureCase['manifest'] },
    { name: 'product', manifest: productFixture as FixtureCase['manifest'] },
    { name: 'subscription', manifest: subscriptionFixture as FixtureCase['manifest'] },
    { name: 'billing-multi-entity', manifest: billingFixture as FixtureCase['manifest'] },
  ];

  for (const fixture of fixtureCases) {
    it(`G3 ${fixture.name}: POST manifest + per-entity diffKernel deep-subset preserved`, async () => {
      // POST manifest (idempotent re-ingest by URN); m03 retry surface
      // absorbs any 429/5xx Railway rate-limit blips transparently.
      const submit = await client.submitManifest(fixture.manifest);
      // eslint-disable-next-line no-console
      console.info(
        `[G3 ${fixture.name}] submit status=${submit.diagnostics.status} ingested=${(submit.data as { ingested_entities?: number }).ingested_entities} schema_version=${submit.diagnostics.schemaVersion} request_id=${submit.diagnostics.requestId} duration_ms=${submit.diagnostics.durationMs}`,
      );
      expect([200, 201]).toContain(submit.diagnostics.status ?? 0);
      expect((submit.data as { ingested_entities?: number }).ingested_entities).toBe(
        fixture.manifest.entities.length,
      );

      // Per-entity GET + diffKernel. For single-entity fixtures this is one
      // iteration; for billing-multi-entity it's three.
      for (const sourceEntity of fixture.manifest.entities) {
        const urn = (sourceEntity as { urn: string }).urn;
        const fetched = await client.getEntity(urn);
        // eslint-disable-next-line no-console
        console.info(
          `[G3 ${fixture.name}] get ${urn} status=${fetched.diagnostics.status} schema_version=${fetched.diagnostics.schemaVersion} request_id=${fetched.diagnostics.requestId} duration_ms=${fetched.diagnostics.durationMs}`,
        );
        expect(fetched.diagnostics.status).toBe(200);

        const forgeKernel = stripOodsExtension(sourceEntity as Record<string, unknown>);
        const concordanceKernel = stripOodsExtension(
          fetched.data as Record<string, unknown>,
        );

        const diffs = diffKernel(forgeKernel, concordanceKernel, '$');
        if (diffs.length > 0) {
          throw new Error(
            `G3 ${fixture.name} canonical-kernel mismatch for ${urn}:\n` +
              diffs.map((d) => `  - ${d}`).join('\n'),
          );
        }
        expect(diffs).toEqual([]);
      }
    });
  }
});

// Always-visible status: if the two-gate guard isn't satisfied, surface a
// single passing test that prints WHY so the operator isn't left guessing.
describe.skipIf(ENABLED)('I1 — gate status (no live calls)', () => {
  it('logs gate status', () => {
    const reasons: string[] = [];
    if (!RUN) reasons.push('RUN_HOSTED_SMOKE != 1');
    if (RUN && !KEY_PRESENT) reasons.push('CONCORDANCE_API_KEY unset');
    expect(reasons.length).toBeGreaterThan(0);
    // Visible in --reporter=verbose; non-failing.
    // eslint-disable-next-line no-console
    console.info(`[I1 smoke] skipped: ${reasons.join(', ')}`);
  });
});
