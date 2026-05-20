/**
 * Q3 — Real-data E2E gate for the C-track A2UI runtime emitter.
 *
 * Per quality bar (cmos/foundational-docs/quality-bars.md), every new
 * Capability-track render mission must run its emitter end-to-end against:
 *   1. the three internal sprint-97 Object Catalog fixtures (user / product /
 *      subscription) covering informational / action-shaped / relationships
 *      variants,
 *   2. at least one independently-sourced external-shape fixture exercising
 *      multi-entity rendering (billing-multi-entity), AND
 *   3. the sprint-102 content domain pack (Article / Author / Comment) both
 *      as single-entity fixtures and as a multi-entity content-pack.
 *
 * **A2UI-specific conformance gate:** emitted messages are AJV-validated
 * against the vendored A2UI v0.9 JSON Schemas at
 * `packages/mcp-server/src/a2ui/contracts/v0_9/`:
 *
 *   - `server_to_client.json` — message envelope (createSurface / updateComponents)
 *   - `common_types.json`     — DataBinding / DynamicString / Accessibility / ChildList
 *   - `catalogs/minimal/catalog.json` — component definitions for Text / Row /
 *     Column / Button / TextField. Registered under the relative-resolved URL
 *     `https://a2ui.org/specification/v0_9/catalog.json` so the server_to_client
 *     and common_types $refs to `catalog.json` resolve correctly (per
 *     `acceptsInlineCatalogs:true` semantics in the spec).
 *
 * Each emitted message is independently validated; AJV failures fail the gate
 * with the full error list surfaced.
 */

import { describe, expect, it, beforeAll } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support (matches concordance/validator.ts pattern)
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

import serverToClientSchema from '../../src/a2ui/contracts/v0_9/server_to_client.json' with { type: 'json' };
import commonTypesSchema from '../../src/a2ui/contracts/v0_9/common_types.json' with { type: 'json' };
import minimalCatalogSchema from '../../src/a2ui/contracts/v0_9/catalogs/minimal/catalog.json' with { type: 'json' };

import type {
  ObjectCatalogManifest,
  OodsSlot,
  SemanticEntity,
} from '../../src/object-catalog/types.js';
import {
  emit,
  type A2uiCreateSurfaceMessage,
  type A2uiUpdateComponentsMessage,
  type A2uiMessage,
} from '../../src/codegen/a2ui-runtime-emitter.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;

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

// ---------------------------------------------------------------------------
// AJV setup — register schemas under the URLs that cross-references expect.
// ---------------------------------------------------------------------------

let validateMessage: ValidateFunction;

beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(commonTypesSchema);
  // Register the minimal catalog under the relative-resolved URL so refs like
  // `$ref: "catalog.json#/$defs/..."` in server_to_client.json resolve. AJV
  // indexes the schema under both the override key AND its inherent $id, so a
  // single addSchema call covers both lookups.
  ajv.addSchema(
    minimalCatalogSchema,
    'https://a2ui.org/specification/v0_9/catalog.json',
  );
  validateMessage = ajv.compile(serverToClientSchema);
});

function expectMessageValidates(m: A2uiMessage, label: string) {
  const valid = validateMessage(m);
  if (!valid) {
    const errors = validateMessage.errors ?? [];
    throw new Error(
      `${label} failed A2UI v0.9 schema validation:\n${JSON.stringify(errors, null, 2)}\nMessage:\n${JSON.stringify(m, null, 2)}`,
    );
  }
  expect(valid).toBe(true);
}

function expectedVariantSurfaces(entity: SemanticEntity): string[] {
  const variants = entity.oods?.projection_variants;
  if (variants && variants.length > 0) return variants.map((v) => v.surface);
  return ['default'];
}

function expectedSlotsForVariant(
  entity: SemanticEntity,
  variantSurface: string,
): OodsSlot[] {
  const variants = entity.oods?.projection_variants ?? [];
  const match = variants.find((v) => v.surface === variantSurface);
  if (match?.slots) return match.slots;
  return entity.oods?.render?.slots ?? [];
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

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

describe('Q3 — a2ui-runtime-emitter real-data E2E gate (8 fixtures × all variants)', () => {
  describe.each(fixtures)('%s', (_name, manifest) => {
    const result = emit(manifest);

    it('emits status=ok with no errors', () => {
      expect(result.status).toBe('ok');
      expect(result.errors ?? []).toEqual([]);
    });

    it('serializes code as a JSON-parseable array equal to messages', () => {
      const parsed = JSON.parse(result.code);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toEqual(result.messages);
    });

    it('every emitted message validates against the vendored v0.9 schemas', () => {
      for (let i = 0; i < result.messages.length; i++) {
        const m = result.messages[i];
        const label = `message[${i}] (${'createSurface' in m ? 'createSurface' : 'updateComponents'})`;
        expectMessageValidates(m, label);
      }
    });

    it('emits one createSurface + one updateComponents per (entity, variant) pair, in pairs', () => {
      const expectedSurfaceCount = manifest.entities.reduce(
        (acc, e) => acc + expectedVariantSurfaces(e).length,
        0,
      );
      const { creates, updates } = partitionMessages(result.messages);
      expect(creates.length).toBe(expectedSurfaceCount);
      expect(updates.length).toBe(expectedSurfaceCount);
      // Pair order: each create is immediately followed by its update for the same surfaceId.
      for (let i = 0; i < creates.length; i++) {
        expect(creates[i].createSurface.surfaceId).toBe(
          updates[i].updateComponents.surfaceId,
        );
      }
    });

    it('every updateComponents has exactly one component with id=root and it is a Column', () => {
      const { updates } = partitionMessages(result.messages);
      for (const u of updates) {
        const roots = u.updateComponents.components.filter(
          (c) => c.id === 'root',
        );
        expect(roots.length).toBe(1);
        expect(roots[0].component).toBe('Column');
      }
    });

    it('root.children references only resolve to component ids within the same surface', () => {
      const { updates } = partitionMessages(result.messages);
      for (const u of updates) {
        const components = u.updateComponents.components;
        const ids = new Set(components.map((c) => c.id));
        const root = components.find((c) => c.id === 'root')!;
        if (root.component !== 'Column') throw new Error('root not a Column');
        for (const ref of root.children) {
          expect(ids.has(ref), `root.children includes "${ref}" but no component matches`).toBe(true);
        }
      }
    });

    it('every declared slot becomes a component id within its surface', () => {
      const { updates } = partitionMessages(result.messages);
      let surfaceIdx = 0;
      for (const entity of manifest.entities) {
        for (const variant of expectedVariantSurfaces(entity)) {
          const u = updates[surfaceIdx];
          const ids = new Set(
            u.updateComponents.components.map((c) => c.id),
          );
          for (const slot of expectedSlotsForVariant(entity, variant)) {
            expect(
              ids.has(slot.name),
              `surface ${entity.urn}#${variant} missing slot id "${slot.name}"`,
            ).toBe(true);
          }
          surfaceIdx += 1;
        }
      }
    });

    it('Text and Button components reference data via DataBinding {path} matching slot.binding.field', () => {
      const { updates } = partitionMessages(result.messages);
      let surfaceIdx = 0;
      for (const entity of manifest.entities) {
        for (const variant of expectedVariantSurfaces(entity)) {
          const u = updates[surfaceIdx];
          const components = u.updateComponents.components;
          for (const slot of expectedSlotsForVariant(entity, variant)) {
            // Find a component bound to this slot.
            // For action slots the Text label child carries the DataBinding;
            // for non-action slots the slot-named component carries it.
            const slotComponent = components.find((c) => c.id === slot.name);
            expect(slotComponent, `slot ${slot.name} missing in surface ${entity.urn}#${variant}`).toBeDefined();
            const candidates =
              slotComponent!.component === 'Button'
                ? [components.find((c) => c.id === (slotComponent as { child: string }).child)!]
                : [slotComponent!];
            const bindingComponent = candidates[0];
            if (bindingComponent.component === 'Text') {
              expect(typeof bindingComponent.text).toBe('object');
              const dataBinding = bindingComponent.text as { path: string };
              expect(dataBinding.path).toBe('/' + slot.binding.field.replace(/\[(\d+)\]/g, '.$1').split('.').filter((p) => p.length > 0).join('/'));
            }
          }
          surfaceIdx += 1;
        }
      }
    });

    it('surface ids follow the pattern <entity.urn>#<variant.surface>', () => {
      const { creates } = partitionMessages(result.messages);
      let surfaceIdx = 0;
      for (const entity of manifest.entities) {
        for (const variant of expectedVariantSurfaces(entity)) {
          expect(creates[surfaceIdx].createSurface.surfaceId).toBe(
            `${entity.urn}#${variant}`,
          );
          expect(creates[surfaceIdx].createSurface.catalogId).toBe(
            `oods-forge:${entity.urn}`,
          );
          surfaceIdx += 1;
        }
      }
    });

    it('theme.primaryColor is a 6-digit hex for every createSurface', () => {
      const { creates } = partitionMessages(result.messages);
      for (const c of creates) {
        expect(c.createSurface.theme?.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it('meta.surfacesRendered matches the number of createSurface messages', () => {
      const { creates } = partitionMessages(result.messages);
      expect(result.meta.surfacesRendered).toBe(creates.length);
    });

    it('meta.componentsRendered equals total components across all updateComponents messages', () => {
      const { updates } = partitionMessages(result.messages);
      const expected = updates.reduce(
        (acc, u) => acc + u.updateComponents.components.length,
        0,
      );
      expect(result.meta.componentsRendered).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// Cross-fixture A2UI-spec conformance summary (separate from per-fixture gate)
// ---------------------------------------------------------------------------

describe('Q3 — a2ui-runtime-emitter cross-fixture conformance', () => {
  it('every emitted message across every fixture validates against v0.9 server_to_client schema', () => {
    let totalMessages = 0;
    let validatedMessages = 0;
    for (const [name, manifest] of fixtures) {
      const r = emit(manifest);
      for (let i = 0; i < r.messages.length; i++) {
        totalMessages += 1;
        const valid = validateMessage(r.messages[i]);
        if (valid) validatedMessages += 1;
        if (!valid) {
          throw new Error(
            `Fixture "${name}" message[${i}] failed:\n${JSON.stringify(validateMessage.errors, null, 2)}`,
          );
        }
      }
    }
    expect(totalMessages).toBeGreaterThan(0);
    expect(validatedMessages).toBe(totalMessages);
  });

  it('image-slot fallback warning fires whenever a fixture uses hero/avatar/media/thumb', () => {
    // Article has `hero`, Author has `avatar`, Product has `media`, Comment has `avatar`.
    const fixturesWithImages: GateFixture[] = [
      ['content-article', articleFixture as ObjectCatalogManifest],
      ['content-author', authorFixture as ObjectCatalogManifest],
      ['product', productFixture as ObjectCatalogManifest],
      ['content-comment', commentFixture as ObjectCatalogManifest],
    ];
    for (const [name, manifest] of fixturesWithImages) {
      const r = emit(manifest);
      const imageWarnings = r.warnings.filter(
        (w) => w.code === 'OODS-A2UI-IMAGE-FALLBACK',
      );
      expect(imageWarnings.length, `${name} expected image fallback warnings`).toBeGreaterThan(0);
    }
  });
});
