/**
 * Unit tests for the C5 apply-summary emitter (sprint-104 m04).
 *
 * Covers:
 *   - Top-level shape + JSON round-trip
 *   - Per-entry projection (mirrors review.resolve EvaluationResult)
 *   - element.name + element.type join from source manifest
 *   - Decision count aggregation across the 4 PolicyDecision values
 *   - defaultActionUsed counting (entries where policyId === 'default')
 *   - matchedPolicyIds preservation + dedup
 *   - Audit trail echo (evaluatedAt, defaultAction, entityCount, policyBundleId, matchedPolicyIds)
 *   - source.sourceManifest + source.manifestPath propagation
 *   - Empty-resolutions case
 *   - Defensive: urn-not-in-manifest warning + empty element fields
 *
 * Composes with review.resolve directly via the in-process handle() — no MCP
 * round-trip needed at this layer.
 */

import { describe, expect, it } from 'vitest';

import subscriptionLowConf from '../../test/fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };
import productFixture from '../../src/object-catalog/fixtures/product.json' with { type: 'json' };
import billingFixture from '../../test/fixtures/object-catalog/billing-multi-entity.json' with { type: 'json' };

import type { ObjectCatalogManifest } from '../object-catalog/types.js';
import type { EvaluationResult, PolicyBundle } from './review-policy.js';
import type { AuditTrail } from '../tools/review.resolve.js';
import { handle as reviewResolve } from '../tools/review.resolve.js';
import { emit } from './apply-summary-emitter.js';

const subscriptionLow = subscriptionLowConf as ObjectCatalogManifest;
const product = productFixture as ObjectCatalogManifest;
const billing = billingFixture as ObjectCatalogManifest;

// ---------------------------------------------------------------------------
// Helpers — build review.resolve outputs in-process
// ---------------------------------------------------------------------------

const FLAG_BELOW_05_BUNDLE: PolicyBundle = {
  id: 'flag-below-0.5',
  policies: [
    {
      id: 'low-confidence-defer',
      when: { kind: 'confidence_threshold', threshold: 0.5 },
      then: 'defer',
      reason: 'Score below 0.5 — defer to human review',
    },
  ],
};

const DISMISS_ALL_BUNDLE: PolicyBundle = {
  id: 'dismiss-all',
  policies: [
    {
      id: 'catch-all-dismiss',
      when: { kind: 'entity_urn_match', pattern: '*' },
      then: 'dismiss',
      reason: 'Catch-all dismiss',
    },
  ],
};

async function runResolve(manifest: ObjectCatalogManifest, bundle: PolicyBundle) {
  const out = await reviewResolve({
    manifest: manifest as unknown as Record<string, unknown>,
    policies: bundle,
  });
  return { resolutions: out.resolutions, auditTrail: out.auditTrail };
}

function makeAuditTrail(overrides: Partial<AuditTrail> = {}): AuditTrail {
  return {
    evaluatedAt: '2026-05-21T00:00:00.000Z',
    defaultAction: 'defer',
    entityCount: 0,
    policyBundle: { id: 'test-bundle', policies: [] },
    matchedPolicyIds: [],
    ...overrides,
  };
}

function makeResolution(overrides: Partial<EvaluationResult>): EvaluationResult {
  return {
    urn: overrides.urn ?? 'urn:test',
    decision: overrides.decision ?? 'defer',
    reason: overrides.reason ?? 'reason',
    policyId: overrides.policyId ?? 'default',
    evaluatedScore: overrides.evaluatedScore ?? null,
    evaluatedTier: overrides.evaluatedTier ?? 'unknown',
  };
}

// ---------------------------------------------------------------------------
// Top-level shape
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — top-level shape', () => {
  it('returns status=ok and framework=apply-summary', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(r.status).toBe('ok');
    expect(r.framework).toBe('apply-summary');
    expect(r.fileExtension).toBe('.json');
    expect(r.errors).toBeUndefined();
  });

  it('code is a JSON-parseable string matching summary artifact', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(JSON.parse(r.code)).toEqual(r.summary);
  });

  it('meta surfaces entriesRendered, defaultActionUsed, distinctMatchedPolicies', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(r.meta.entriesRendered).toBe(resolutions.length);
    expect(r.meta.distinctMatchedPolicies).toBe(auditTrail.matchedPolicyIds.length);
  });
});

// ---------------------------------------------------------------------------
// Per-entry projection
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — per-entry projection', () => {
  it('mirrors EvaluationResult fields verbatim into entry', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    const entry = r.summary.entries[0];
    const resolution = resolutions[0];
    expect(entry.urn).toBe(resolution.urn);
    expect(entry.decision).toBe(resolution.decision);
    expect(entry.reason).toBe(resolution.reason);
    expect(entry.policyId).toBe(resolution.policyId);
    expect(entry.evaluatedScore).toBe(resolution.evaluatedScore);
    expect(entry.evaluatedTier).toBe(resolution.evaluatedTier);
  });

  it('joins element.name + element.type from source manifest', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    const entry = r.summary.entries[0];
    const entity = subscriptionLow.entities[0];
    expect(entry.elementName).toBe(entity.element.name);
    expect(entry.elementType).toBe(entity.element.type);
  });

  it('preserves resolutions[] iteration order (no re-sort by decision)', async () => {
    const { resolutions, auditTrail } = await runResolve(billing, DISMISS_ALL_BUNDLE);
    const r = emit(resolutions, auditTrail, billing);
    const urnOrderInResolutions = resolutions.map((res) => res.urn);
    const urnOrderInEntries = r.summary.entries.map((e) => e.urn);
    expect(urnOrderInEntries).toEqual(urnOrderInResolutions);
  });
});

// ---------------------------------------------------------------------------
// Decision count aggregation
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — decision counts', () => {
  it('counts all 4 PolicyDecision values, zero-filled for absent decisions', () => {
    const resolutions = [
      makeResolution({ urn: 'urn:1', decision: 'accept', policyId: 'p1' }),
      makeResolution({ urn: 'urn:2', decision: 'accept', policyId: 'p1' }),
      makeResolution({ urn: 'urn:3', decision: 'defer', policyId: 'p2' }),
    ];
    const manifest: ObjectCatalogManifest = {
      ...subscriptionLow,
      entities: resolutions.map((r) => ({
        urn: r.urn,
        element: { name: r.urn, type: 'ui.test' },
        semantics: { purpose: 'p', human_meaning: 'm' },
      } as never)),
    };
    const r = emit(resolutions, makeAuditTrail(), manifest);
    expect(r.summary.summary.decisionCounts).toEqual({
      accept: 2,
      patch: 0,
      defer: 1,
      dismiss: 0,
    });
    expect(r.summary.summary.entriesTotal).toBe(3);
  });

  it('defaultActionUsed counts entries with policyId === default', () => {
    const resolutions = [
      makeResolution({ urn: 'urn:1', policyId: 'default' }),
      makeResolution({ urn: 'urn:2', policyId: 'matched-policy' }),
      makeResolution({ urn: 'urn:3', policyId: 'default' }),
    ];
    const manifest: ObjectCatalogManifest = {
      ...subscriptionLow,
      entities: resolutions.map((r) => ({
        urn: r.urn,
        element: { name: r.urn, type: 'ui.test' },
        semantics: { purpose: 'p', human_meaning: 'm' },
      } as never)),
    };
    const r = emit(resolutions, makeAuditTrail(), manifest);
    expect(r.summary.summary.defaultActionUsed).toBe(2);
  });

  it('summary.matchedPolicyIds mirrors auditTrail.matchedPolicyIds', () => {
    const audit = makeAuditTrail({ matchedPolicyIds: ['p1', 'p2', 'p3'] });
    const r = emit([], audit, subscriptionLow);
    expect(r.summary.summary.matchedPolicyIds).toEqual(['p1', 'p2', 'p3']);
  });
});

// ---------------------------------------------------------------------------
// Audit trail echo
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — audit trail echo', () => {
  it('echoes evaluatedAt, defaultAction, entityCount, matchedPolicyIds', () => {
    const audit = makeAuditTrail({
      evaluatedAt: '2026-05-21T12:00:00.000Z',
      defaultAction: 'dismiss',
      entityCount: 5,
      matchedPolicyIds: ['p-a', 'p-b'],
    });
    const r = emit([], audit, subscriptionLow);
    expect(r.summary.auditTrail.evaluatedAt).toBe('2026-05-21T12:00:00.000Z');
    expect(r.summary.auditTrail.defaultAction).toBe('dismiss');
    expect(r.summary.auditTrail.entityCount).toBe(5);
    expect(r.summary.auditTrail.matchedPolicyIds).toEqual(['p-a', 'p-b']);
  });

  it('echoes policyBundleId when bundle has an id', () => {
    const audit = makeAuditTrail({
      policyBundle: { id: 'my-bundle', policies: [] },
    });
    const r = emit([], audit, subscriptionLow);
    expect(r.summary.auditTrail.policyBundleId).toBe('my-bundle');
  });

  it('omits policyBundleId when bundle has no id', () => {
    const audit = makeAuditTrail({
      policyBundle: { policies: [] },
    });
    const r = emit([], audit, subscriptionLow);
    expect(r.summary.auditTrail).not.toHaveProperty('policyBundleId');
  });

  it('NEVER echoes the full policy bundle (keeps artifact lean)', () => {
    const audit = makeAuditTrail({
      policyBundle: {
        id: 'huge-bundle',
        policies: Array.from({ length: 50 }, (_, i) => ({
          id: `p-${i}`,
          when: { kind: 'confidence_threshold' as const, threshold: 0.5 },
          then: 'defer' as const,
        })),
      },
    });
    const r = emit([], audit, subscriptionLow);
    expect(r.summary.auditTrail).not.toHaveProperty('policyBundle');
    expect(r.summary.auditTrail).not.toHaveProperty('policies');
  });
});

// ---------------------------------------------------------------------------
// Source propagation
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — source propagation', () => {
  it('defaults sourceManifest to manifest.source.agent', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(r.summary.source?.sourceManifest).toBe(subscriptionLow.source?.agent);
  });

  it('honors options.sourceManifestId override', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow, { sourceManifestId: 'custom' });
    expect(r.summary.source?.sourceManifest).toBe('custom');
  });

  it('surfaces manifestPath when provided', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow, {
      manifestPath: 'test/fixtures/object-catalog/subscription-low-confidence.json',
    });
    expect(r.summary.source?.manifestPath).toBe(
      'test/fixtures/object-catalog/subscription-low-confidence.json',
    );
  });

  it('omits source.manifestPath when not provided', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(r.summary.source).not.toHaveProperty('manifestPath');
  });
});

// ---------------------------------------------------------------------------
// Empty + defensive paths
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — empty + defensive', () => {
  it('handles empty resolutions[]: zeroed counts, empty entries[]', () => {
    const r = emit([], makeAuditTrail(), subscriptionLow);
    expect(r.summary.entries).toEqual([]);
    expect(r.summary.summary.entriesTotal).toBe(0);
    expect(r.summary.summary.decisionCounts).toEqual({
      accept: 0,
      patch: 0,
      defer: 0,
      dismiss: 0,
    });
    expect(r.summary.summary.defaultActionUsed).toBe(0);
  });

  it('emits OODS-AS-001 warning when a resolution urn is not in the manifest', () => {
    const resolutions = [
      makeResolution({ urn: 'urn:not-in-manifest' }),
    ];
    const r = emit(resolutions, makeAuditTrail(), subscriptionLow);
    expect(r.warnings.some((w) => w.code === 'OODS-AS-001')).toBe(true);
    expect(r.summary.entries[0].elementName).toBe('');
    expect(r.summary.entries[0].elementType).toBe('');
  });
});

// ---------------------------------------------------------------------------
// End-to-end chain — queue is not directly used here, but the resolve→summary
// chain is the load-bearing composition. Q3 file tests the FULL chain.
// ---------------------------------------------------------------------------

describe('apply-summary-emitter — chain composition (resolve → apply-summary)', () => {
  it('subscription-low → flag-below-0.5 bundle → defer decision via single matched policy', async () => {
    const { resolutions, auditTrail } = await runResolve(subscriptionLow, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, subscriptionLow);
    expect(r.summary.entries).toHaveLength(1);
    expect(r.summary.entries[0].decision).toBe('defer');
    expect(r.summary.entries[0].policyId).toBe('low-confidence-defer');
    expect(r.summary.summary.defaultActionUsed).toBe(0);
    expect(r.summary.summary.matchedPolicyIds).toEqual(['low-confidence-defer']);
  });

  it('product fixture (0.92 high) → flag-below-0.5 bundle → falls through to defaultAction', async () => {
    const { resolutions, auditTrail } = await runResolve(product, FLAG_BELOW_05_BUNDLE);
    const r = emit(resolutions, auditTrail, product);
    expect(r.summary.entries).toHaveLength(1);
    expect(r.summary.entries[0].decision).toBe('defer'); // default action is defer
    expect(r.summary.entries[0].policyId).toBe('default');
    expect(r.summary.summary.defaultActionUsed).toBe(1);
    expect(r.summary.summary.matchedPolicyIds).toEqual([]);
  });

  it('billing fixture (3 entities) → dismiss-all bundle → 3 dismiss decisions', async () => {
    const { resolutions, auditTrail } = await runResolve(billing, DISMISS_ALL_BUNDLE);
    const r = emit(resolutions, auditTrail, billing);
    expect(r.summary.entries).toHaveLength(3);
    expect(r.summary.summary.decisionCounts).toEqual({
      accept: 0,
      patch: 0,
      defer: 0,
      dismiss: 3,
    });
    expect(r.summary.summary.matchedPolicyIds).toEqual(['catch-all-dismiss']);
  });
});
