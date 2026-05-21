/**
 * Q3 — Real-data E2E gate for the C5 conflict-detail emitter (sprint-104 m03).
 *
 * Per-entity emitter, so the gate iterates manifest.entities × emit(entity)
 * across the standard 8 Q3 fixtures PLUS subscription-low-confidence. This
 * exercises:
 *   - the missing-confidence-decomposition case (user / subscription /
 *     billing-account-card / payment-method-row) → confidence_decomposition
 *     gap fires + tier=unknown + flaggedForReview=true
 *   - the high-tier no-gap case (article / author / comment / product /
 *     invoice-detail-card) → empty gaps[]
 *   - the low-tier with-gaps case (subscription-low) → 3 signal gaps +
 *     tier=low + flaggedForReview=true (subscription-low has 4 signals at
 *     0.32 / 0.41 / 0.48 / 0.55; first three fall under the default 0.5
 *     evidenceGapThreshold)
 *
 * Output AJV-validated against src/schemas/conflict-detail.output.json.
 * Schema is closed at every level (additionalProperties:false), so any new
 * field landed in the emitter without a matching schema update fails the gate.
 */

import { describe, expect, it, beforeAll } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support (matches existing patterns)
import Ajv2020Import from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';

import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../../src/object-catalog/fixtures/product.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };
import billingFixture from '../fixtures/object-catalog/billing-multi-entity.json' with { type: 'json' };
import articleFixture from '../../src/object-catalog/fixtures/content/article.json' with { type: 'json' };
import authorFixture from '../../src/object-catalog/fixtures/content/author.json' with { type: 'json' };
import commentFixture from '../../src/object-catalog/fixtures/content/comment.json' with { type: 'json' };
import contentPackFixture from '../fixtures/object-catalog/content-pack.json' with { type: 'json' };
import subscriptionLowConfFixture from '../fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };

import conflictDetailSchema from '../../src/schemas/conflict-detail.output.json' with { type: 'json' };

import type { ObjectCatalogManifest } from '../../src/object-catalog/types.js';
import { emit } from '../../src/codegen/conflict-detail-emitter.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;

type GateFixture = readonly [name: string, manifest: ObjectCatalogManifest];

const fixtures: ReadonlyArray<GateFixture> = [
  ['user', userFixture as ObjectCatalogManifest],
  ['product', productFixture as ObjectCatalogManifest],
  ['subscription', subscriptionFixture as ObjectCatalogManifest],
  ['billing (3 entities, mixed confidence)', billingFixture as ObjectCatalogManifest],
  ['content-article', articleFixture as ObjectCatalogManifest],
  ['content-author', authorFixture as ObjectCatalogManifest],
  ['content-comment', commentFixture as ObjectCatalogManifest],
  ['content-pack (3 entities)', contentPackFixture as ObjectCatalogManifest],
  ['subscription-low-confidence (LOW-tier exercise)', subscriptionLowConfFixture as ObjectCatalogManifest],
];

// ---------------------------------------------------------------------------
// AJV setup
// ---------------------------------------------------------------------------

let validateDetail: ValidateFunction;

beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  validateDetail = ajv.compile(conflictDetailSchema);
});

function expectDetailValidates(detail: unknown, label: string) {
  const valid = validateDetail(detail);
  if (!valid) {
    const errors = validateDetail.errors ?? [];
    throw new Error(
      `${label} failed conflict-detail.output schema validation:\n${JSON.stringify(errors, null, 2)}\nDetail:\n${JSON.stringify(detail, null, 2).slice(0, 4000)}`,
    );
  }
  expect(valid).toBe(true);
}

// ---------------------------------------------------------------------------
// Per-fixture, per-entity
// ---------------------------------------------------------------------------

describe('Q3 — conflict-detail-emitter real-data E2E gate (9 fixtures × per-entity × AJV)', () => {
  describe.each(fixtures)('%s', (_name, manifest) => {
    for (const entity of manifest.entities) {
      describe(`entity ${entity.urn}`, () => {
        const result = emit(entity);

        it('emits status=ok with no errors', () => {
          expect(result.status).toBe('ok');
          expect(result.errors ?? []).toEqual([]);
        });

        it('detail validates against the conflict-detail.output.json schema', () => {
          expectDetailValidates(result.detail, entity.urn);
        });

        it('code is a JSON-parseable string equal to detail (round-trip)', () => {
          expect(JSON.parse(result.code)).toEqual(result.detail);
        });

        it('urn / element.name / element.type mirror the source entity', () => {
          expect(result.detail.urn).toBe(entity.urn);
          expect(result.detail.element.name).toBe(entity.element.name);
          expect(result.detail.element.type).toBe(entity.element.type);
        });

        it('signals.length equals confidence_decomposition.signals.length (or 0 when absent)', () => {
          const expected = entity.oods?.confidence_decomposition?.signals.length ?? 0;
          expect(result.detail.signals.length).toBe(expected);
        });

        it('signals are sorted ascending by score', () => {
          const scores = result.detail.signals.map((s) => s.score);
          for (let i = 1; i < scores.length; i++) {
            expect(scores[i - 1]).toBeLessThanOrEqual(scores[i]);
          }
        });
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-fixture invariants
// ---------------------------------------------------------------------------

describe('Q3 — conflict-detail-emitter cross-fixture invariants', () => {
  it('every (fixture, entity) pair validates against the schema', () => {
    for (const [name, manifest] of fixtures) {
      for (const entity of manifest.entities) {
        const r = emit(entity);
        expectDetailValidates(r.detail, `${name}: ${entity.urn}`);
      }
    }
  });

  it('subscription-low fixture produces exactly 3 signal gaps + 0 evidence_refs gaps + 0 confidence_decomposition gaps', () => {
    const entity = (subscriptionLowConfFixture as ObjectCatalogManifest).entities[0];
    const r = emit(entity);
    const signalGaps = r.detail.gaps.filter((g) => g.source === 'signal');
    const evidenceGaps = r.detail.gaps.filter((g) => g.source === 'evidence_refs');
    const cdGaps = r.detail.gaps.filter((g) => g.source === 'confidence_decomposition');
    expect(signalGaps).toHaveLength(3);
    expect(evidenceGaps).toHaveLength(0); // subscription-low has 1 evidence_ref
    expect(cdGaps).toHaveLength(0); // it has confidence_decomposition
  });

  it('user fixture (no confidence_decomposition) produces exactly 1 confidence_decomposition gap and 0 signal gaps', () => {
    const entity = (userFixture as ObjectCatalogManifest).entities[0];
    const r = emit(entity);
    const signalGaps = r.detail.gaps.filter((g) => g.source === 'signal');
    const cdGaps = r.detail.gaps.filter((g) => g.source === 'confidence_decomposition');
    expect(signalGaps).toHaveLength(0); // no decomposition → no signal gaps
    expect(cdGaps).toHaveLength(1);
  });

  it('every high-tier entity (article / author / comment / product / invoice) has zero gaps', () => {
    const highTierEntities = [
      (articleFixture as ObjectCatalogManifest).entities[0],
      (authorFixture as ObjectCatalogManifest).entities[0],
      (commentFixture as ObjectCatalogManifest).entities[0],
      (productFixture as ObjectCatalogManifest).entities[0],
    ];
    for (const entity of highTierEntities) {
      const r = emit(entity);
      expect(r.detail.tier, `${entity.urn} should be high tier`).toBe('high');
      expect(r.detail.gaps, `${entity.urn} should have no gaps`).toEqual([]);
    }
  });

  it('content-pack entities surface schemaorg via context.schemaorg', () => {
    const manifest = contentPackFixture as ObjectCatalogManifest;
    for (const entity of manifest.entities) {
      const r = emit(entity);
      expect(
        r.detail.context?.schemaorg,
        `${entity.urn} should surface schemaorg`,
      ).toBeDefined();
      expect(r.detail.context!.schemaorg!.startsWith('https://schema.org/')).toBe(true);
    }
  });
});
