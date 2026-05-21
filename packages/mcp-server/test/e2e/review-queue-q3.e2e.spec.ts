/**
 * Q3 — Real-data E2E gate for the C5 review-queue emitter (sprint-104 m02).
 *
 * Per quality bar, every new emitter ships with a Q3 gate that runs against
 * the canonical fixture set AND validates output structure against an AJV
 * schema. For review-queue, the canonical fixture set is the standard 8 Q3
 * fixtures (user / product / subscription / billing-multi-entity / article /
 * author / comment / content-pack) PLUS the synthetic
 * subscription-low-confidence fixture (s99-m04) — the ONLY fixture in the
 * suite that emits a LOW tier and exercises the flagged-for-review branch.
 *
 * Output AJV-validated against src/schemas/review-queue.output.json. The
 * schema is closed (additionalProperties:false at every level), so any new
 * field landed in the emitter without a matching schema update fails the gate.
 */

import { describe, expect, it, beforeAll } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support (matches existing concordance + a2ui patterns)
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

import reviewQueueSchema from '../../src/schemas/review-queue.output.json' with { type: 'json' };

import type { ObjectCatalogManifest } from '../../src/object-catalog/types.js';
import { emit } from '../../src/codegen/review-queue-emitter.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;

type GateFixture = readonly [name: string, manifest: ObjectCatalogManifest];

const fixtures: ReadonlyArray<GateFixture> = [
  ['user (internal — informational, high tier)', userFixture as ObjectCatalogManifest],
  ['product (internal — action-shaped, high tier)', productFixture as ObjectCatalogManifest],
  ['subscription (internal — relationships.edges, high tier)', subscriptionFixture as ObjectCatalogManifest],
  ['billing (external — multi-entity)', billingFixture as ObjectCatalogManifest],
  ['content-article (s102-m01)', articleFixture as ObjectCatalogManifest],
  ['content-author (s102-m01)', authorFixture as ObjectCatalogManifest],
  ['content-comment (s102-m01)', commentFixture as ObjectCatalogManifest],
  ['content-pack (s102-m01 multi-entity)', contentPackFixture as ObjectCatalogManifest],
  ['subscription-low-confidence (s99-m04 LOW-tier exercise)', subscriptionLowConfFixture as ObjectCatalogManifest],
];

// ---------------------------------------------------------------------------
// AJV setup
// ---------------------------------------------------------------------------

let validateQueue: ValidateFunction;

beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  validateQueue = ajv.compile(reviewQueueSchema);
});

function expectQueueValidates(queue: unknown, label: string) {
  const valid = validateQueue(queue);
  if (!valid) {
    const errors = validateQueue.errors ?? [];
    throw new Error(
      `${label} failed review-queue.output schema validation:\n${JSON.stringify(errors, null, 2)}\nQueue:\n${JSON.stringify(queue, null, 2).slice(0, 4000)}`,
    );
  }
  expect(valid).toBe(true);
}

// ---------------------------------------------------------------------------
// Gate — per fixture
// ---------------------------------------------------------------------------

describe('Q3 — review-queue-emitter real-data E2E gate (9 fixtures × AJV)', () => {
  describe.each(fixtures)('%s', (_name, manifest) => {
    const result = emit(manifest);

    it('emits status=ok with no errors', () => {
      expect(result.status).toBe('ok');
      expect(result.errors ?? []).toEqual([]);
    });

    it('queue validates against the review-queue.output.json schema', () => {
      expectQueueValidates(result.queue, `fixture queue`);
    });

    it('code is a JSON-parseable string equal to queue (round-trip)', () => {
      const parsed = JSON.parse(result.code);
      expect(parsed).toEqual(result.queue);
    });

    it('every manifest entity is represented in entries by URN (default flaggedOnly=false)', () => {
      const entryUrns = new Set(result.queue.entries.map((e) => e.urn));
      for (const entity of manifest.entities) {
        expect(entryUrns.has(entity.urn), `manifest entity ${entity.urn} missing from queue`).toBe(true);
      }
    });

    it('entitiesTotal + entitiesIncluded match the manifest', () => {
      expect(result.queue.summary.entitiesTotal).toBe(manifest.entities.length);
      expect(result.queue.summary.entitiesIncluded).toBe(manifest.entities.length);
    });

    it('tierCounts sum to entitiesTotal', () => {
      const sum =
        result.queue.summary.tierCounts.high +
        result.queue.summary.tierCounts.medium +
        result.queue.summary.tierCounts.low +
        result.queue.summary.tierCounts.unknown;
      expect(sum).toBe(result.queue.summary.entitiesTotal);
    });

    it('entries are sorted by score ascending with null scores first', () => {
      const scores = result.queue.entries.map((e) => e.score);
      for (let i = 1; i < scores.length; i++) {
        const prev = scores[i - 1];
        const cur = scores[i];
        // null precedes any number; otherwise non-decreasing
        if (prev === null) continue;
        if (cur === null) {
          throw new Error(`null score at index ${i} after non-null score at ${i - 1}`);
        }
        expect(prev).toBeLessThanOrEqual(cur);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Cross-fixture summary
// ---------------------------------------------------------------------------

describe('Q3 — review-queue-emitter cross-fixture summary', () => {
  it('every fixture passes AJV validation', () => {
    for (const [name, manifest] of fixtures) {
      const r = emit(manifest);
      expectQueueValidates(r.queue, `fixture ${name}`);
    }
  });

  it('low-tier branch is exercised by subscription-low-confidence fixture', () => {
    const r = emit(subscriptionLowConfFixture as ObjectCatalogManifest);
    expect(r.queue.summary.tierCounts.low).toBeGreaterThan(0);
    expect(r.queue.summary.flaggedCount).toBeGreaterThan(0);
    const flagged = r.queue.entries.filter((e) => e.flaggedForReview);
    expect(flagged.length).toBeGreaterThan(0);
    for (const entry of flagged) {
      expect(entry.lowestSignals.length).toBeGreaterThan(0);
    }
  });

  it('flaggedOnly=true filter is consistent across all fixtures', () => {
    for (const [name, manifest] of fixtures) {
      const all = emit(manifest);
      const onlyFlagged = emit(manifest, { flaggedOnly: true });
      // tierCounts must match (population-based)
      expect(onlyFlagged.queue.summary.tierCounts, `${name} tierCounts mismatch under flaggedOnly`).toEqual(
        all.queue.summary.tierCounts,
      );
      // flaggedCount matches all-population count
      expect(onlyFlagged.queue.summary.flaggedCount).toBe(all.queue.summary.flaggedCount);
      // entries.length equals flaggedCount
      expect(onlyFlagged.queue.entries.length).toBe(all.queue.summary.flaggedCount);
      // every included entry must be flaggedForReview
      for (const entry of onlyFlagged.queue.entries) {
        expect(entry.flaggedForReview).toBe(true);
      }
    }
  });
});
