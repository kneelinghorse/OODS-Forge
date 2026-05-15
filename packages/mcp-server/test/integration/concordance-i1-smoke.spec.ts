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

import { describe, expect, it } from 'vitest';
import { ConcordanceClient } from '../../src/concordance/client.js';
import { HOSTED_BASE_URL } from '../../src/concordance/config.js';
import {
  ConcordanceAuthError,
  ConcordanceValidationError,
} from '../../src/concordance/errors.js';
import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };
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

describe.skipIf(!ENABLED)('I1 — Authenticated hosted smoke', () => {
  const client = new ConcordanceClient({ baseUrl: HOSTED_BASE_URL });

  it('Step 1: POST /manifests/validate with User fixture returns 200 + 1.1.0 header + x-request-id', async () => {
    try {
      const result = await client.validateManifestRemote(userFixture);
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
    expect(first.diagnostics.status).toBe(200);
    // Round-trip determinism: a second read yields a byte-equal canonical hash.
    const second = await client.getEntity(urn);
    expect(hashOf(first.data)).toBe(hashOf(second.data));
  });
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
