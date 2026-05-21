/**
 * Q3 — host-conformance EMITTER precondition gate (s104-m01).
 *
 * Per the s104-m01 mission-start audit axis (d) FAILURE-MODE CONTRACT, the
 * host-conformance gate is split into two files by failure mode:
 *
 *   - THIS FILE asserts emitter-side preconditions before any rendering. A
 *     failure here signals an EMITTER REGRESSION — the emitter has produced
 *     a message stream that violates the contract the harness depends on
 *     (paired createSurface/updateComponents, status=ok, expected surface
 *     count, root component present).
 *
 *   - host-conformance-render.spec.ts asserts that emitter-ok streams render
 *     successfully under the Lit-local adapter. A failure there signals
 *     HARNESS DRIFT — the renderer / lit-html / happy-dom versions have
 *     drifted relative to wire output that is itself well-formed.
 *
 * The two files run in the same vitest invocation; which file's tests fail
 * is the side-distinction signal in CI output. No custom error-classification
 * layer needed at v1.
 *
 * The fixture set is identical to the AJV Q3 gate
 * (test/e2e/a2ui-runtime-q3.e2e.spec.ts) for parity — any divergence between
 * AJV conformance and host conformance must be observable as different
 * failures across the two gates.
 */

import { describe, expect, it } from 'vitest';

import userFixture from '../../src/object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../../src/object-catalog/fixtures/product.json' with { type: 'json' };
import subscriptionFixture from '../../src/object-catalog/fixtures/subscription.json' with { type: 'json' };
import billingFixture from '../fixtures/object-catalog/billing-multi-entity.json' with { type: 'json' };
import articleFixture from '../../src/object-catalog/fixtures/content/article.json' with { type: 'json' };
import authorFixture from '../../src/object-catalog/fixtures/content/author.json' with { type: 'json' };
import commentFixture from '../../src/object-catalog/fixtures/content/comment.json' with { type: 'json' };
import contentPackFixture from '../fixtures/object-catalog/content-pack.json' with { type: 'json' };

import type {
  ObjectCatalogManifest,
  SemanticEntity,
} from '../../src/object-catalog/types.js';
import {
  emit,
  type A2uiCreateSurfaceMessage,
  type A2uiMessage,
  type A2uiUpdateComponentsMessage,
} from '../../src/codegen/a2ui-runtime-emitter.js';

type GateFixture = readonly [name: string, manifest: ObjectCatalogManifest];

const fixtures: ReadonlyArray<GateFixture> = [
  ['user (internal — informational)', userFixture as ObjectCatalogManifest],
  ['product (internal — action-shaped)', productFixture as ObjectCatalogManifest],
  ['subscription (internal — relationships.edges source)', subscriptionFixture as ObjectCatalogManifest],
  ['billing (external — multi-entity)', billingFixture as ObjectCatalogManifest],
  ['content-article (s102-m01)', articleFixture as ObjectCatalogManifest],
  ['content-author (s102-m01)', authorFixture as ObjectCatalogManifest],
  ['content-comment (s102-m01)', commentFixture as ObjectCatalogManifest],
  ['content-pack (s102-m01 multi-entity)', contentPackFixture as ObjectCatalogManifest],
];

function expectedVariantSurfaces(entity: SemanticEntity): string[] {
  const variants = entity.oods?.projection_variants;
  if (variants && variants.length > 0) return variants.map((v) => v.surface);
  return ['default'];
}

function partitionMessages(messages: ReadonlyArray<A2uiMessage>) {
  const creates = messages.filter(
    (m): m is A2uiCreateSurfaceMessage => 'createSurface' in m,
  );
  const updates = messages.filter(
    (m): m is A2uiUpdateComponentsMessage => 'updateComponents' in m,
  );
  return { creates, updates };
}

describe('Q3 host-conformance — EMITTER precondition gate (8 fixtures)', () => {
  describe.each(fixtures)('%s', (_name, manifest) => {
    const result = emit(manifest);

    it('emitter status is ok (no errors) — precondition for host conformance', () => {
      expect(result.status).toBe('ok');
      expect(result.errors ?? []).toEqual([]);
    });

    it('message stream pairs createSurface with updateComponents in send order', () => {
      const { creates, updates } = partitionMessages(result.messages);
      const expectedSurfaceCount = manifest.entities.reduce(
        (acc, e) => acc + expectedVariantSurfaces(e).length,
        0,
      );
      expect(creates.length).toBe(expectedSurfaceCount);
      expect(updates.length).toBe(expectedSurfaceCount);

      // Strict ordering: each create is immediately followed by its update.
      let cursor = 0;
      for (let i = 0; i < result.messages.length; i += 2) {
        const c = result.messages[i];
        const u = result.messages[i + 1];
        expect('createSurface' in c, `messages[${i}] should be createSurface`).toBe(true);
        expect('updateComponents' in u, `messages[${i + 1}] should be updateComponents`).toBe(true);
        expect((c as A2uiCreateSurfaceMessage).createSurface.surfaceId).toBe(
          (u as A2uiUpdateComponentsMessage).updateComponents.surfaceId,
        );
        cursor += 1;
      }
      expect(cursor).toBe(expectedSurfaceCount);
    });

    it('every surface has exactly one component with id="root"', () => {
      const { updates } = partitionMessages(result.messages);
      for (const u of updates) {
        const roots = u.updateComponents.components.filter((c) => c.id === 'root');
        expect(
          roots.length,
          `surface ${u.updateComponents.surfaceId} expects exactly one root component`,
        ).toBe(1);
      }
    });

    it('every catalogId on createSurface matches the Forge pattern (oods-forge:*)', () => {
      const { creates } = partitionMessages(result.messages);
      for (const c of creates) {
        expect(
          c.createSurface.catalogId.startsWith('oods-forge:'),
          `surface ${c.createSurface.surfaceId} catalogId=${c.createSurface.catalogId} should start with oods-forge:`,
        ).toBe(true);
      }
    });
  });
});
