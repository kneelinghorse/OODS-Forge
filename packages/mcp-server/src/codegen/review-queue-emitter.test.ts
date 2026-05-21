/**
 * Unit tests for the C5 review-queue emitter (sprint-104 m02).
 *
 * Covers:
 *   - Per-entry tier classification + score passthrough
 *   - lowestSignals selection (default N=3, custom N, ceiling at signals.length)
 *   - flagged-for-review marking (mirrors review-emitter.needsReview)
 *   - flaggedOnly filter (tierCounts + flaggedCount remain population-based)
 *   - Sort order: score ascending, null-tier first, urn lexicographic for ties
 *   - Summary aggregation: tierCounts, flaggedCount, reviewThreshold, lowestSignalsN
 *   - Missing oods.confidence_decomposition → unknown tier + empty lowestSignals
 *   - source propagation from manifest.source
 *   - JSON serialization round-trip (code parses back to queue)
 *
 * AJV schema conformance is covered separately in the Q3 E2E gate.
 */

import { describe, expect, it } from 'vitest';

import subscriptionLowConf from '../../test/fixtures/object-catalog/subscription-low-confidence.json' with { type: 'json' };
import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };
import articleFixture from '../object-catalog/fixtures/content/article.json' with { type: 'json' };

import type { ObjectCatalogManifest } from '../object-catalog/types.js';
import { emit } from './review-queue-emitter.js';

const subscriptionLow = subscriptionLowConf as ObjectCatalogManifest;
const user = userFixture as ObjectCatalogManifest;
const product = productFixture as ObjectCatalogManifest;
const article = articleFixture as ObjectCatalogManifest;

// ---------------------------------------------------------------------------
// Top-level shape
// ---------------------------------------------------------------------------

describe('review-queue-emitter — top-level shape', () => {
  it('returns status=ok and framework=review-queue for a normal fixture', () => {
    const r = emit(user);
    expect(r.status).toBe('ok');
    expect(r.framework).toBe('review-queue');
    expect(r.fileExtension).toBe('.json');
    expect(r.errors).toBeUndefined();
  });

  it('code is a JSON-parseable string matching queue', () => {
    const r = emit(user);
    const parsed = JSON.parse(r.code);
    expect(parsed).toEqual(r.queue);
  });

  it('meta mirrors source manifest provenance fields', () => {
    const r = emit(user);
    expect(r.meta.catalogVersion).toBe(user.source?.oods_catalog_version);
    expect(r.meta.sourceAgent).toBe(user.source?.agent);
  });
});

// ---------------------------------------------------------------------------
// Per-entry projection
// ---------------------------------------------------------------------------

describe('review-queue-emitter — per-entry projection', () => {
  it('classifies article fixture entity as high tier (score 0.9)', () => {
    const r = emit(article);
    const entry = r.queue.entries[0];
    expect(entry.urn).toBe(article.entities[0].urn);
    expect(entry.tier).toBe('high');
    expect(entry.score).toBe(0.9);
    expect(entry.flaggedForReview).toBe(false);
  });

  it('classifies subscription-low-confidence as low tier and flags for review', () => {
    const r = emit(subscriptionLow);
    const entry = r.queue.entries[0];
    expect(entry.tier).toBe('low');
    expect(entry.score).toBe(0.4);
    expect(entry.flaggedForReview).toBe(true);
  });

  it('mirrors element.name and element.type into the entry', () => {
    const r = emit(article);
    const entry = r.queue.entries[0];
    expect(entry.elementName).toBe(article.entities[0].element.name);
    expect(entry.elementType).toBe(article.entities[0].element.type);
  });

  it('emits unknown tier + null score + empty lowestSignals when confidence_decomposition is absent (user fixture has none)', () => {
    // The user fixture is the canonical no-confidence-decomposition fixture
    // in the suite. Emitter must produce unknown tier + null score +
    // flaggedForReview=true (needsReview semantics: missing tier is always
    // flagged regardless of threshold).
    const r = emit(user);
    const entry = r.queue.entries[0];
    expect(entry.tier).toBe('unknown');
    expect(entry.score).toBeNull();
    expect(entry.lowestSignals).toEqual([]);
    expect(entry.flaggedForReview).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// lowestSignals selection
// ---------------------------------------------------------------------------

describe('review-queue-emitter — lowestSignals selection', () => {
  it('defaults to top-3 lowest signals (ascending by score)', () => {
    const r = emit(subscriptionLow);
    const entry = r.queue.entries[0];
    expect(entry.lowestSignals).toHaveLength(3);
    const scores = entry.lowestSignals.map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    // Lowest score in the fixture is trait_membership=0.32
    expect(entry.lowestSignals[0].name).toBe('trait_membership');
    expect(entry.lowestSignals[0].score).toBe(0.32);
  });

  it('honors a custom lowestSignalsN', () => {
    const r = emit(subscriptionLow, { lowestSignalsN: 2 });
    expect(r.queue.entries[0].lowestSignals).toHaveLength(2);
  });

  it('clamps lowestSignalsN at signals.length when N > signals.length', () => {
    // The subscription-low fixture has 4 signals; requesting 10 should return 4.
    const r = emit(subscriptionLow, { lowestSignalsN: 10 });
    expect(r.queue.entries[0].lowestSignals).toHaveLength(4);
  });

  it('returns empty lowestSignals when lowestSignalsN=0', () => {
    const r = emit(subscriptionLow, { lowestSignalsN: 0 });
    expect(r.queue.entries[0].lowestSignals).toEqual([]);
  });

  it('preserves hint field when present', () => {
    const r = emit(subscriptionLow);
    const sig = r.queue.entries[0].lowestSignals[0];
    expect(sig.hint).toBeDefined();
    expect(typeof sig.hint).toBe('string');
  });

  it('omits hint field when source signal has no hint', () => {
    const manifest: ObjectCatalogManifest = {
      ...subscriptionLow,
      entities: subscriptionLow.entities.map((e) => ({
        ...e,
        oods: e.oods && {
          ...e.oods,
          confidence_decomposition: e.oods.confidence_decomposition && {
            ...e.oods.confidence_decomposition,
            signals: e.oods.confidence_decomposition.signals.map(({ name, score }) => ({ name, score })),
          },
        },
      })),
    };
    const r = emit(manifest);
    for (const sig of r.queue.entries[0].lowestSignals) {
      expect(sig).not.toHaveProperty('hint');
    }
  });
});

// ---------------------------------------------------------------------------
// Sort order
// ---------------------------------------------------------------------------

describe('review-queue-emitter — sort order', () => {
  it('sorts entries by score ascending (lowest first)', () => {
    // Multi-entity manifest: product (0.92 high) + article (0.9 high) + subscriptionLow (0.4 low)
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [
        ...subscriptionLow.entities,
        ...article.entities,
        ...product.entities,
      ],
    };
    const r = emit(combined);
    const scores = r.queue.entries.map((e) => e.score);
    expect(scores).toEqual([0.4, 0.9, 0.92]);
  });

  it('places null-score (unknown tier) entries before all numeric scores', () => {
    // Combine article (0.9 high) with a cloned-unknown variant (no confidence).
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [
        ...article.entities, // 0.9
        ...article.entities.map((e) => ({
          ...e,
          urn: 'urn:proto:semantic:article-detail-unknown@1.0.0',
          oods: e.oods ? { ...e.oods, confidence_decomposition: undefined } : undefined,
        })),
      ],
    };
    const r = emit(combined);
    expect(r.queue.entries[0].score).toBeNull();
    expect(r.queue.entries[1].score).toBe(0.9);
  });

  it('tie-breaks equal scores by urn lexicographically (deterministic output)', () => {
    // article has 0.9 confidence; cloning preserves it, so two entities tie at 0.9.
    const e1 = { ...article.entities[0], urn: 'urn:b' };
    const e2 = { ...article.entities[0], urn: 'urn:a' };
    const r = emit({ ...article, entities: [e1, e2] });
    expect(r.queue.entries.map((e) => e.urn)).toEqual(['urn:a', 'urn:b']);
  });
});

// ---------------------------------------------------------------------------
// Summary aggregation
// ---------------------------------------------------------------------------

describe('review-queue-emitter — summary', () => {
  it('counts tiers across the full manifest population', () => {
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [
        ...subscriptionLow.entities, // low
        ...article.entities,         // high (0.9)
        ...product.entities,         // high (0.92)
      ],
    };
    const r = emit(combined);
    expect(r.queue.summary.tierCounts).toEqual({
      high: 2,
      medium: 0,
      low: 1,
      unknown: 0,
    });
  });

  it('flaggedCount matches needsReview() over all entities', () => {
    const r = emit(subscriptionLow);
    expect(r.queue.summary.flaggedCount).toBe(1);
  });

  it('echoes effective reviewThreshold, lowestSignalsN, flaggedOnly', () => {
    const r = emit(article, {
      reviewThreshold: 0.85,
      lowestSignalsN: 5,
      flaggedOnly: true,
    });
    expect(r.queue.summary.reviewThreshold).toBe(0.85);
    expect(r.queue.summary.lowestSignalsN).toBe(5);
    expect(r.queue.summary.flaggedOnly).toBe(true);
  });

  it('entitiesTotal counts ALL manifest entities even with flaggedOnly=true', () => {
    // Combine article (high, NOT flagged at default 0.7 threshold) with
    // subscriptionLow (low, flagged). flaggedOnly should drop article.
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [...subscriptionLow.entities, ...article.entities],
    };
    const r = emit(combined, { flaggedOnly: true });
    expect(r.queue.summary.entitiesTotal).toBe(2);
    expect(r.queue.summary.entitiesIncluded).toBe(1); // only the flagged one (subscriptionLow)
  });
});

// ---------------------------------------------------------------------------
// flaggedOnly filter
// ---------------------------------------------------------------------------

describe('review-queue-emitter — flaggedOnly filter', () => {
  it('default flaggedOnly=false includes all manifest entities', () => {
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [...subscriptionLow.entities, ...article.entities],
    };
    const r = emit(combined);
    expect(r.queue.entries).toHaveLength(2);
  });

  it('flaggedOnly=true filters entries to needsReview()=true only', () => {
    // article (0.9 high, NOT flagged) + subscriptionLow (0.4 low, flagged)
    // → flaggedOnly drops article, keeps subscriptionLow.
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [...subscriptionLow.entities, ...article.entities],
    };
    const r = emit(combined, { flaggedOnly: true });
    expect(r.queue.entries).toHaveLength(1);
    expect(r.queue.entries[0].flaggedForReview).toBe(true);
  });

  it('flaggedOnly does NOT affect tierCounts (population-based)', () => {
    const combined: ObjectCatalogManifest = {
      ...article,
      entities: [...subscriptionLow.entities, ...article.entities],
    };
    const r = emit(combined, { flaggedOnly: true });
    expect(r.queue.summary.tierCounts).toEqual({
      high: 1,
      medium: 0,
      low: 1,
      unknown: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// Source propagation
// ---------------------------------------------------------------------------

describe('review-queue-emitter — source propagation', () => {
  it('defaults sourceManifest to manifest.source.agent', () => {
    const r = emit(user);
    expect(r.queue.source.sourceManifest).toBe(user.source?.agent);
  });

  it('honors options.sourceManifestId override', () => {
    const r = emit(user, { sourceManifestId: 'custom-id' });
    expect(r.queue.source.sourceManifest).toBe('custom-id');
  });

  it('mirrors source.agent / stage / capturedAt / catalogVersion when present', () => {
    const r = emit(user);
    expect(r.queue.source.agent).toBe(user.source?.agent);
    expect(r.queue.source.stage).toBe(user.source?.stage);
    expect(r.queue.source.capturedAt).toBe(user.source?.captured_at);
    expect(r.queue.source.catalogVersion).toBe(user.source?.oods_catalog_version);
  });

  it('falls back to sourceManifest=unknown when manifest.source is absent', () => {
    const manifest = { entities: user.entities } as ObjectCatalogManifest;
    const r = emit(manifest);
    expect(r.queue.source.sourceManifest).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// Empty manifest
// ---------------------------------------------------------------------------

describe('review-queue-emitter — empty manifest', () => {
  it('returns empty queue + zeroed summary for entities=[]', () => {
    const empty: ObjectCatalogManifest = { ...user, entities: [] };
    const r = emit(empty);
    expect(r.queue.entries).toEqual([]);
    expect(r.queue.summary.entitiesTotal).toBe(0);
    expect(r.queue.summary.entitiesIncluded).toBe(0);
    expect(r.queue.summary.flaggedCount).toBe(0);
    expect(r.queue.summary.tierCounts).toEqual({ high: 0, medium: 0, low: 0, unknown: 0 });
  });
});

// ---------------------------------------------------------------------------
// Real-fixture sanity (no specific assertion beyond shape — Q3 gate does AJV)
// ---------------------------------------------------------------------------

describe('review-queue-emitter — real-fixture sanity', () => {
  for (const [name, manifest] of [
    ['user', user],
    ['product', product],
    ['article', article],
    ['subscription-low-confidence', subscriptionLow],
  ] as const) {
    it(`emits for ${name} fixture without errors`, () => {
      const r = emit(manifest);
      expect(r.status).toBe('ok');
      expect(r.queue.entries.length).toBe(manifest.entities.length);
    });
  }
});
