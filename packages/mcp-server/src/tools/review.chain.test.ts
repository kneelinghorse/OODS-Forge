import { describe, expect, it } from 'vitest';
import { handle, type ReviewChainInput } from './review.chain.js';
import type { PolicyBundle } from '../codegen/review-policy.js';
import { isToolError } from '../errors/tool-error.js';

const FLAG_BELOW_05: PolicyBundle = {
  id: 'flag-below-0.5',
  policies: [
    {
      id: 'low-confidence-defer',
      when: { kind: 'confidence_threshold', threshold: 0.5, matchUnknown: true },
      then: 'defer',
      reason: 'Score below 0.5 — defer to human review',
    },
  ],
};

const DISMISS_ALL: PolicyBundle = {
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

// The mission success criterion names "at least 3 fixtures" (subscription-low +
// article + content-pack). These exercise the canonical flagged-defer case,
// the all-high default-action path, and the mixed multi-entity manifest.
const SMOKE_FIXTURES = ['subscription-low-confidence', 'article', 'content-pack'] as const;
const BUNDLES = [
  ['flag-below-0.5', FLAG_BELOW_05],
  ['dismiss-all', DISMISS_ALL],
] as const;

describe('tools/review.chain', () => {
  describe('happy path — trio × 2 bundles produces all four artifacts', () => {
    for (const fixture of SMOKE_FIXTURES) {
      for (const [bundleName, bundle] of BUNDLES) {
        it(`${fixture} × ${bundleName} runs end-to-end and returns the chain payload`, async () => {
          const out = await handle({ fixture, policies: bundle });
          expect(out.queue.entries.length).toBeGreaterThan(0);
          expect(out.resolutions.length).toBe(out.diagnostics.entityCount);
          expect(out.auditTrail.entityCount).toBe(out.diagnostics.entityCount);
          expect(Array.isArray(out.conflictDetails)).toBe(true);
          expect(out.summary.entries.length).toBe(out.resolutions.length);
          expect(out.diagnostics.fixture).toBe(fixture);
          expect(out.diagnostics.fixtureSource).toBe('allow-list');
          expect(out.diagnostics.policyBundleId).toBe(bundleName);
        });
      }
    }
  });

  describe('chain composition invariants', () => {
    it('resolutions and summary entries are one-for-one and order-preserved', async () => {
      const out = await handle({ fixture: 'content-pack', policies: FLAG_BELOW_05 });
      expect(out.summary.entries.length).toBe(out.resolutions.length);
      for (let i = 0; i < out.resolutions.length; i++) {
        expect(out.summary.entries[i].urn).toBe(out.resolutions[i].urn);
        expect(out.summary.entries[i].decision).toBe(out.resolutions[i].decision);
        expect(out.summary.entries[i].policyId).toBe(out.resolutions[i].policyId);
      }
    });

    it('conflictDetails covers exactly the flagged entries in queue.entries', async () => {
      const out = await handle({
        fixture: 'subscription-low-confidence',
        policies: FLAG_BELOW_05,
      });
      const flaggedUrns = new Set(
        out.queue.entries.filter((e) => e.flaggedForReview).map((e) => e.urn),
      );
      const detailUrns = new Set(out.conflictDetails.map((d) => d.urn));
      expect(detailUrns.size).toBe(flaggedUrns.size);
      for (const urn of flaggedUrns) {
        expect(detailUrns.has(urn)).toBe(true);
      }
    });

    it('subscription-low-confidence × flag-below-0.5 → 1 defer matched, 0 default', async () => {
      const out = await handle({
        fixture: 'subscription-low-confidence',
        policies: FLAG_BELOW_05,
      });
      expect(out.summary.summary.decisionCounts.defer).toBe(1);
      expect(out.summary.summary.defaultActionUsed).toBe(0);
      expect(out.summary.summary.matchedPolicyIds).toEqual(['low-confidence-defer']);
    });

    it('article × flag-below-0.5 → defaultActionUsed > 0 (all-high entities)', async () => {
      const out = await handle({ fixture: 'article', policies: FLAG_BELOW_05 });
      expect(out.summary.summary.defaultActionUsed).toBeGreaterThan(0);
    });

    it('dismiss-all → every entry is dismiss + catch-all-dismiss', async () => {
      const out = await handle({ fixture: 'content-pack', policies: DISMISS_ALL });
      for (const entry of out.summary.entries) {
        expect(entry.decision).toBe('dismiss');
        expect(entry.policyId).toBe('catch-all-dismiss');
      }
      expect(out.summary.summary.defaultActionUsed).toBe(0);
    });

    it('decisionCounts sum to entriesTotal', async () => {
      const out = await handle({ fixture: 'content-pack', policies: FLAG_BELOW_05 });
      const c = out.summary.summary.decisionCounts;
      expect(c.accept + c.patch + c.defer + c.dismiss).toBe(out.summary.summary.entriesTotal);
    });
  });

  describe('diagnostics', () => {
    it('omits policyBundleId when the bundle has no id', async () => {
      const noIdBundle: PolicyBundle = {
        policies: [
          {
            id: 'noop',
            when: { kind: 'entity_urn_match', pattern: 'never-matches-anything' },
            then: 'accept',
          },
        ],
      };
      const out = await handle({ fixture: 'user', policies: noIdBundle });
      expect(out.diagnostics.policyBundleId).toBeUndefined();
    });

    it('reports flaggedCount equal to queue.summary.flaggedCount', async () => {
      const out = await handle({
        fixture: 'subscription-low-confidence',
        policies: FLAG_BELOW_05,
      });
      expect(out.diagnostics.flaggedCount).toBe(out.queue.summary.flaggedCount);
    });
  });

  describe('error paths', () => {
    it('returns OODS-RC-001 for unknown fixtures', async () => {
      try {
        await handle({ fixture: 'no-such-fixture', policies: FLAG_BELOW_05 } as ReviewChainInput);
        throw new Error('expected OODS-RC-001 to be thrown');
      } catch (err) {
        expect(isToolError(err)).toBe(true);
        expect((err as { opiCode: string }).opiCode).toBe('OODS-RC-001');
      }
    });

    it('rejects empty fixture name with OODS-RC-011', async () => {
      try {
        await handle({ fixture: '', policies: FLAG_BELOW_05 } as ReviewChainInput);
        throw new Error('expected OODS-RC-011 to be thrown');
      } catch (err) {
        expect(isToolError(err)).toBe(true);
        expect((err as { opiCode: string }).opiCode).toBe('OODS-RC-011');
      }
    });

    it('rejects missing policies with OODS-RC-012', async () => {
      try {
        await handle({ fixture: 'user' } as unknown as ReviewChainInput);
        throw new Error('expected OODS-RC-012 to be thrown');
      } catch (err) {
        expect(isToolError(err)).toBe(true);
        expect((err as { opiCode: string }).opiCode).toBe('OODS-RC-012');
      }
    });

    it('re-surfaces review.resolve bundle errors (OODS-RR-014) without rewrapping', async () => {
      const bundleWithDuplicateIds: PolicyBundle = {
        policies: [
          {
            id: 'dup',
            when: { kind: 'entity_urn_match', pattern: '*' },
            then: 'accept',
          },
          {
            id: 'dup',
            when: { kind: 'entity_urn_match', pattern: '*' },
            then: 'defer',
          },
        ],
      };
      try {
        await handle({ fixture: 'user', policies: bundleWithDuplicateIds });
        throw new Error('expected OODS-RR-014 to be thrown');
      } catch (err) {
        expect(isToolError(err)).toBe(true);
        expect((err as { opiCode: string }).opiCode).toBe('OODS-RR-014');
      }
    });
  });
});
