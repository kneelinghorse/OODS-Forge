/**
 * Unit tests for the C5 conflict-detail emitter (sprint-104 m03).
 *
 * Covers:
 *   - Top-level result shape + JSON round-trip
 *   - Tier classification + flaggedForReview propagation
 *   - FULL signals output (not top-N), sorted ascending by score
 *   - Evidence gap detection: signal gaps (< evidenceGapThreshold),
 *     evidence_refs gaps (empty/absent), confidence_decomposition gap (missing)
 *   - Context surfacing: projectionVariants, brandOverlay, schemaorg
 *     (each independently optional)
 *   - sourceManifestId propagation
 *   - Element mirror: name + type required, object + action optional
 *
 * AJV schema conformance is covered separately in the Q3 E2E gate.
 */

import { describe, expect, it } from 'vitest';

import subscriptionLowConf from '../../test/fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };
import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };
import articleFixture from '../object-catalog/fixtures/content/article.json' with { type: 'json' };

import type { ObjectCatalogManifest, SemanticEntity } from '../object-catalog/types.js';
import { emit } from './conflict-detail-emitter.js';

const subscriptionLow = (subscriptionLowConf as ObjectCatalogManifest).entities[0];
const user = (userFixture as ObjectCatalogManifest).entities[0];
const product = (productFixture as ObjectCatalogManifest).entities[0];
const article = (articleFixture as ObjectCatalogManifest).entities[0];

// ---------------------------------------------------------------------------
// Top-level shape
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — top-level shape', () => {
  it('returns status=ok and framework=conflict-detail', () => {
    const r = emit(article);
    expect(r.status).toBe('ok');
    expect(r.framework).toBe('conflict-detail');
    expect(r.fileExtension).toBe('.json');
    expect(r.errors).toBeUndefined();
  });

  it('code is a JSON-parseable string matching detail', () => {
    const r = emit(article);
    expect(JSON.parse(r.code)).toEqual(r.detail);
  });

  it('meta reports counts and effective thresholds', () => {
    const r = emit(subscriptionLow, { evidenceGapThreshold: 0.5 });
    expect(r.meta.signalsRendered).toBe(r.detail.signals.length);
    expect(r.meta.gapsRendered).toBe(r.detail.gaps.length);
    expect(r.meta.reviewThreshold).toBe(0.7);
    expect(r.meta.evidenceGapThreshold).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// Tier + flagged
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — tier and flagged', () => {
  it('article fixture (0.9) is high tier and NOT flagged', () => {
    const r = emit(article);
    expect(r.detail.tier).toBe('high');
    expect(r.detail.score).toBe(0.9);
    expect(r.detail.flaggedForReview).toBe(false);
  });

  it('subscription-low (0.4) is low tier and flagged', () => {
    const r = emit(subscriptionLow);
    expect(r.detail.tier).toBe('low');
    expect(r.detail.score).toBe(0.4);
    expect(r.detail.flaggedForReview).toBe(true);
  });

  it('user fixture (no confidence_decomposition) is unknown tier and flagged', () => {
    const r = emit(user);
    expect(r.detail.tier).toBe('unknown');
    expect(r.detail.score).toBeNull();
    expect(r.detail.flaggedForReview).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FULL signals (not top-N)
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — full signals output', () => {
  it('emits ALL signals from confidence_decomposition (subscription-low has 4)', () => {
    const r = emit(subscriptionLow);
    expect(r.detail.signals).toHaveLength(4);
  });

  it('signals are sorted ascending by score', () => {
    const r = emit(subscriptionLow);
    const scores = r.detail.signals.map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it('signals[].hint is preserved verbatim when present on source', () => {
    const r = emit(subscriptionLow);
    for (const sig of r.detail.signals) {
      expect(typeof sig.hint).toBe('string');
    }
  });

  it('omits hint when source signal has no hint', () => {
    const entity: SemanticEntity = {
      ...subscriptionLow,
      oods: {
        ...subscriptionLow.oods!,
        confidence_decomposition: {
          ...subscriptionLow.oods!.confidence_decomposition!,
          signals: [
            { name: 'a', score: 0.3 },
            { name: 'b', score: 0.6 },
          ],
        },
      },
    };
    const r = emit(entity);
    for (const sig of r.detail.signals) {
      expect(sig).not.toHaveProperty('hint');
    }
  });

  it('returns empty signals when confidence_decomposition is absent', () => {
    const r = emit(user);
    expect(r.detail.signals).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Evidence gap detection
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — evidence gap detection', () => {
  it('detects signal gaps for signals.score < evidenceGapThreshold (default 0.5)', () => {
    const r = emit(subscriptionLow);
    const signalGaps = r.detail.gaps.filter((g) => g.source === 'signal');
    // subscription-low has 4 signals: 0.32, 0.41, 0.48, 0.55 — first three are < 0.5
    expect(signalGaps).toHaveLength(3);
    for (const gap of signalGaps) {
      if (gap.source !== 'signal') throw new Error('discriminant');
      expect(gap.score).toBeLessThan(0.5);
      expect(gap.threshold).toBe(0.5);
    }
  });

  it('signal gaps are sorted ascending by score', () => {
    const r = emit(subscriptionLow);
    const signalGaps = r.detail.gaps.filter((g) => g.source === 'signal');
    const scores = signalGaps.map((g) => (g.source === 'signal' ? g.score : 0));
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it('honors custom evidenceGapThreshold', () => {
    const r = emit(subscriptionLow, { evidenceGapThreshold: 0.45 });
    const signalGaps = r.detail.gaps.filter((g) => g.source === 'signal');
    // signals 0.32, 0.41 are < 0.45 → 2 gaps
    expect(signalGaps).toHaveLength(2);
  });

  it('detects confidence_decomposition gap when absent', () => {
    const r = emit(user);
    const cdGaps = r.detail.gaps.filter((g) => g.source === 'confidence_decomposition');
    expect(cdGaps).toHaveLength(1);
  });

  it('detects evidence_refs gap when absent or empty', () => {
    const entity: SemanticEntity = { ...article, evidence_refs: [] };
    const r = emit(entity);
    const erGaps = r.detail.gaps.filter((g) => g.source === 'evidence_refs');
    expect(erGaps).toHaveLength(1);
  });

  it('emits zero gaps for a high-tier entity with evidence_refs and no low signals', () => {
    const r = emit(article); // 0.9 high, all signals above 0.5, evidence_refs present
    expect(r.detail.gaps).toEqual([]);
  });

  it('confidence_decomposition gap precedes evidence_refs gap precedes signal gaps in order', () => {
    // Build an entity with all three gap sources: no decomposition AND no evidence_refs.
    const entity: SemanticEntity = {
      ...user,
      evidence_refs: undefined,
    };
    const r = emit(entity);
    const sources = r.detail.gaps.map((g) => g.source);
    // Expected: ['confidence_decomposition', 'evidence_refs'] — no signal gaps without decomposition.
    expect(sources[0]).toBe('confidence_decomposition');
    expect(sources[1]).toBe('evidence_refs');
  });
});

// ---------------------------------------------------------------------------
// Context surfacing
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — context surfacing', () => {
  it('surfaces projectionVariants when entity has oods.projection_variants', () => {
    const r = emit(article);
    expect(r.detail.context?.projectionVariants).toBeDefined();
    expect(r.detail.context!.projectionVariants!.length).toBeGreaterThan(0);
  });

  it('surfaces brandOverlay when entity has oods.render.brand_overlay', () => {
    const r = emit(article);
    expect(r.detail.context?.brandOverlay).toBeDefined();
  });

  it('surfaces schemaorg from entity.context.schemaorg', () => {
    const r = emit(article);
    expect(r.detail.context?.schemaorg).toBe('https://schema.org/Article');
  });

  it('omits context entirely when entity has no surfaceable context fields', () => {
    const entity: SemanticEntity = {
      ...article,
      context: undefined,
      oods: {
        ...article.oods!,
        projection_variants: undefined,
        render: undefined,
      },
    };
    const r = emit(entity);
    expect(r.detail.context).toBeUndefined();
  });

  it('emits context with ONLY the present fields (additionalProperties:false closure)', () => {
    const entity: SemanticEntity = {
      ...article,
      context: undefined,
      oods: {
        ...article.oods!,
        projection_variants: undefined,
        render: { ...article.oods!.render!, brand_overlay: 'brand-b' },
      },
    };
    const r = emit(entity);
    expect(r.detail.context).toEqual({ brandOverlay: 'brand-b' });
  });
});

// ---------------------------------------------------------------------------
// Element mirror
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — element mirror', () => {
  it('mirrors element.name and element.type (always required)', () => {
    const r = emit(article);
    expect(r.detail.element.name).toBe(article.element.name);
    expect(r.detail.element.type).toBe(article.element.type);
  });

  it('mirrors element.object and element.action when present', () => {
    const r = emit(product); // product has both
    expect(r.detail.element.object).toBe('Product');
    expect(r.detail.element.action).toBe('add_to_cart');
  });

  it('omits element.object/action when absent (preserves additionalProperties:false closure)', () => {
    const entity: SemanticEntity = {
      ...article,
      element: { name: article.element.name, type: article.element.type },
    };
    const r = emit(entity);
    expect(r.detail.element).toEqual({
      name: article.element.name,
      type: article.element.type,
    });
  });
});

// ---------------------------------------------------------------------------
// Source propagation
// ---------------------------------------------------------------------------

describe('conflict-detail-emitter — source propagation', () => {
  it('omits source when sourceManifestId is not provided', () => {
    const r = emit(article);
    expect(r.detail.source).toBeUndefined();
  });

  it('surfaces sourceManifestId when provided', () => {
    const r = emit(article, { sourceManifestId: 'content-pack-2026-05-21' });
    expect(r.detail.source).toEqual({ sourceManifest: 'content-pack-2026-05-21' });
  });
});
