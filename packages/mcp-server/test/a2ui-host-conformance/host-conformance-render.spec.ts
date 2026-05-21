/**
 * @vitest-environment happy-dom
 *
 * Q3 — host-conformance RENDER gate (s104-m01).
 *
 * Pairs with host-conformance-emitter.spec.ts per the s104-m01 mission-start
 * audit axis (d) failure-mode contract: this file only asserts rendering
 * succeeds against emitter-ok streams. A failure here is HARNESS DRIFT,
 * a failure in the emitter file is EMITTER REGRESSION.
 *
 * What this gate proves beyond AJV (axis (a) AJV-vs-host gate boundary):
 *   1. DataBinding paths resolve against a synthesized data model that covers
 *      every path the emitter produces (by construction).
 *   2. child / children references in Column / Button resolve to components
 *      present in the same surface (no dangling refs).
 *   3. The full component tree composes into a renderable lit-html DOM
 *      fragment without throwing.
 *   4. Negative-path: a deliberately incomplete data model surfaces
 *      OODS-HOST-PATH-UNRESOLVED diagnostics rather than crashing.
 *
 * Fixture set per axis (c): all 8 Q3 fixtures, identical to the AJV gate, so
 * any divergence between AJV conformance and host conformance is observable.
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

import type { ObjectCatalogManifest } from '../../src/object-catalog/types.js';
import {
  emit,
  type A2uiCreateSurfaceMessage,
  type A2uiMessage,
  type A2uiUpdateComponentsMessage,
} from '../../src/codegen/a2ui-runtime-emitter.js';
import {
  HOST_EXPECTED_CATALOG_ID,
  isAcceptedCatalogId,
  renderA2uiSurface,
  synthesizeDataModel,
} from '../../src/a2ui/host-conformance/index.js';

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

function pairSurfaces(messages: ReadonlyArray<A2uiMessage>) {
  const pairs: Array<{
    create: A2uiCreateSurfaceMessage;
    update: A2uiUpdateComponentsMessage;
  }> = [];
  for (let i = 0; i < messages.length; i += 2) {
    const create = messages[i] as A2uiCreateSurfaceMessage;
    const update = messages[i + 1] as A2uiUpdateComponentsMessage;
    pairs.push({ create, update });
  }
  return pairs;
}

// ---------------------------------------------------------------------------
// Per-fixture render conformance — success path (synthesized data model)
// ---------------------------------------------------------------------------

describe('Q3 host-conformance — RENDER gate (8 fixtures × Lit-local renderer)', () => {
  describe.each(fixtures)('%s', (_name, manifest) => {
    const emitResult = emit(manifest);
    const dataModel = synthesizeDataModel(emitResult.messages);
    const surfaces = pairSurfaces(emitResult.messages);

    it('every surface renders into a non-empty DocumentFragment', () => {
      for (const { create, update } of surfaces) {
        const r = renderA2uiSurface(create, update, dataModel);
        expect(r.fragment).toBeDefined();
        // fragment.children is sparse in some DOM impls; coerce via wrapping.
        const container = document.createElement('div');
        container.appendChild(r.fragment);
        expect(container.children.length).toBeGreaterThan(0);
      }
    });

    it('no renderer diagnostics with a complete synthesized data model', () => {
      for (const { create, update } of surfaces) {
        const r = renderA2uiSurface(create, update, dataModel);
        expect(
          r.diagnostics,
          `surface ${create.createSurface.surfaceId} produced unexpected renderer diagnostics: ${JSON.stringify(r.diagnostics)}`,
        ).toEqual([]);
      }
    });

    it('catalogId on every surface is accepted by the host', () => {
      for (const { create } of surfaces) {
        expect(
          isAcceptedCatalogId(create.createSurface.catalogId),
          `surface ${create.createSurface.surfaceId} catalogId=${create.createSurface.catalogId} not accepted`,
        ).toBe(true);
      }
    });

    it('every emitted component instantiates as a DOM element with data-a2ui-id', () => {
      for (const { create, update } of surfaces) {
        const r = renderA2uiSurface(create, update, dataModel);
        const container = document.createElement('div');
        container.appendChild(r.fragment);
        for (const comp of update.updateComponents.components) {
          const el = container.querySelector(`[data-a2ui-id="${comp.id}"]`);
          expect(
            el,
            `surface ${create.createSurface.surfaceId} missing rendered element for component id "${comp.id}"`,
          ).not.toBeNull();
        }
      }
    });

    it('meta.componentsRendered matches updateComponents.components.length per surface', () => {
      for (const { create, update } of surfaces) {
        const r = renderA2uiSurface(create, update, dataModel);
        expect(r.meta.componentsRendered).toBe(update.updateComponents.components.length);
      }
    });

    it('surface wrapper carries data-a2ui-surface + data-a2ui-catalog attributes', () => {
      for (const { create, update } of surfaces) {
        const r = renderA2uiSurface(create, update, dataModel);
        const container = document.createElement('div');
        container.appendChild(r.fragment);
        const wrapper = container.querySelector('[data-a2ui-surface]');
        expect(wrapper).not.toBeNull();
        expect(wrapper!.getAttribute('data-a2ui-surface')).toBe(create.createSurface.surfaceId);
        expect(wrapper!.getAttribute('data-a2ui-catalog')).toBe(create.createSurface.catalogId);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// AJV-vs-host gate boundary — negative-path coverage (axis a)
// ---------------------------------------------------------------------------

describe('Q3 host-conformance — AJV-vs-host gap (negative-path)', () => {
  it('emits OODS-HOST-PATH-UNRESOLVED for an AJV-valid message with missing data-model targets', () => {
    // Use the user fixture (smallest, most stable) and render with empty data.
    const result = emit(userFixture as ObjectCatalogManifest);
    expect(result.status).toBe('ok'); // emitter side ok by construction
    const surfaces = pairSurfaces(result.messages);

    // Empty data model — every DataBinding path will fail to resolve.
    const renderResult = renderA2uiSurface(surfaces[0].create, surfaces[0].update, {});

    // Some diagnostics must fire (slot count > 0 in the user fixture).
    expect(renderResult.diagnostics.length).toBeGreaterThan(0);
    // Every diagnostic should be path-unresolved (no dangling children with our fixtures).
    for (const d of renderResult.diagnostics) {
      expect(d.code).toBe('OODS-HOST-PATH-UNRESOLVED');
    }
    // Renderer doesn't crash — fragment is still produced.
    expect(renderResult.fragment).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Cross-fixture renderer-side conformance summary
// ---------------------------------------------------------------------------

describe('Q3 host-conformance — cross-fixture summary', () => {
  it('every (fixture, surface) pair renders cleanly under a synthesized data model', () => {
    let totalSurfaces = 0;
    let cleanRenders = 0;
    let totalDiagnostics = 0;
    for (const [name, manifest] of fixtures) {
      const result = emit(manifest);
      const dataModel = synthesizeDataModel(result.messages);
      const surfaces = pairSurfaces(result.messages);
      for (const { create, update } of surfaces) {
        totalSurfaces += 1;
        const r = renderA2uiSurface(create, update, dataModel);
        if (r.diagnostics.length === 0) cleanRenders += 1;
        totalDiagnostics += r.diagnostics.length;
        // Sanity: every surface must produce a fragment.
        expect(r.fragment, `${name}: ${create.createSurface.surfaceId} missing fragment`).toBeDefined();
      }
    }
    expect(totalSurfaces).toBeGreaterThan(0);
    expect(cleanRenders).toBe(totalSurfaces);
    expect(totalDiagnostics).toBe(0);
  });

  it('every Forge catalogId across every fixture is accepted by the host', () => {
    for (const [name, manifest] of fixtures) {
      const result = emit(manifest);
      const surfaces = pairSurfaces(result.messages);
      for (const { create } of surfaces) {
        expect(
          isAcceptedCatalogId(create.createSurface.catalogId),
          `${name}: surface ${create.createSurface.surfaceId} catalogId=${create.createSurface.catalogId} not accepted`,
        ).toBe(true);
        // And specifically: the canonical Forge id is also accepted.
        expect(isAcceptedCatalogId(HOST_EXPECTED_CATALOG_ID)).toBe(true);
      }
    }
  });
});
