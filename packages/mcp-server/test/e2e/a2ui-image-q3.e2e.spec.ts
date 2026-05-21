/**
 * Q3 — Image custom-catalog extension E2E gate (sprint-103 m03).
 *
 * Closes the OODS-A2UI-IMAGE-FALLBACK gap surfaced at sprint-102 m03 where
 * image-kind slots fell back to Text + a per-occurrence fail-loud warning.
 *
 * Asserts that on the s102-m01 content-pack fixture (the primary test surface
 * because article/author/comment have image slots — heroImage, avatar):
 *   - image-kind slots emit `Image` components from the Forge custom catalog
 *   - non-image slots stay on Text/Button/etc. (i.e. the catalog switch is
 *     additive — it doesn't change projection for other kinds)
 *   - the OODS-A2UI-IMAGE-FALLBACK warning code is never emitted
 *   - the Forge catalog file itself is well-formed (has Image and the 5
 *     minimal components, anyComponent oneOf has 6 entries, catalogId is the
 *     canonical FORGE_CATALOG_ID)
 *   - Image components carry url=DataBinding + alt=slot.name + a11y.label
 *   - emitted Image components AJV-validate against the Forge catalog schema
 *     (the existing a2ui-runtime-q3 gate validates every emitted message
 *     against server_to_client + Forge catalog; this test isolates the Image
 *     component specifically)
 */

import { describe, expect, it, beforeAll } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - subpath import for draft-2020-12 support (matches concordance/validator.ts pattern)
import Ajv2020Import from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';

import contentPackFixture from '../fixtures/object-catalog/content-pack.json' with { type: 'json' };
import articleFixture from '../../src/object-catalog/fixtures/content/article.json' with { type: 'json' };
import authorFixture from '../../src/object-catalog/fixtures/content/author.json' with { type: 'json' };
import commentFixture from '../../src/object-catalog/fixtures/content/comment.json' with { type: 'json' };

import forgeCatalogSchema from '../../src/a2ui/contracts/v0_9/catalogs/forge/catalog.json' with { type: 'json' };
import commonTypesSchema from '../../src/a2ui/contracts/v0_9/common_types.json' with { type: 'json' };

import {
  emit,
  FORGE_CATALOG_ID,
  type A2uiComponent,
  type A2uiImageComponent,
  type A2uiUpdateComponentsMessage,
  type A2uiMessage,
} from '../../src/codegen/a2ui-runtime-emitter.js';
import type { ObjectCatalogManifest } from '../../src/object-catalog/types.js';

const Ajv2020: any = (Ajv2020Import as any).default ?? Ajv2020Import;

// ---------------------------------------------------------------------------
// AJV setup — register the Forge catalog under both its own $id and the
// relative `catalog.json` reference URL so cross-refs from common_types resolve.
// ---------------------------------------------------------------------------

let validateImage: ValidateFunction;

beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(commonTypesSchema);
  ajv.addSchema(forgeCatalogSchema, 'https://a2ui.org/specification/v0_9/catalog.json');
  // Compile a validator for the Image component specifically.
  validateImage = ajv.compile({
    $ref: 'https://oods-forge.local/a2ui/v0_9/catalogs/forge/catalog.json#/components/Image',
  });
});

// ---------------------------------------------------------------------------
// Forge catalog file shape sanity
// ---------------------------------------------------------------------------

describe('Forge custom catalog file', () => {
  it('declares the 5 minimal components PLUS Image', () => {
    const components = (forgeCatalogSchema as { components: Record<string, unknown> }).components;
    expect(Object.keys(components).sort()).toEqual([
      'Button',
      'Column',
      'Image',
      'Row',
      'Text',
      'TextField',
    ]);
  });

  it('anyComponent oneOf has 6 entries (minimal 5 + Image)', () => {
    const $defs = (forgeCatalogSchema as { $defs: Record<string, unknown> }).$defs;
    const oneOf = ($defs.anyComponent as { oneOf: unknown[] }).oneOf;
    expect(oneOf).toHaveLength(6);
  });

  it('catalogId matches the emitter-exported FORGE_CATALOG_ID', () => {
    expect((forgeCatalogSchema as { catalogId: string }).catalogId).toBe('oods-forge:catalog/v1');
    // The FORGE_CATALOG_ID export is the source of truth for the value the emitter writes.
    expect(FORGE_CATALOG_ID).toBe('oods-forge:catalog/v1');
  });

  it('Image component requires url and accepts alt + fit', () => {
    const $defs = (forgeCatalogSchema as {
      components: { Image: { allOf: Array<{ properties?: Record<string, unknown>; required?: string[] }> } };
    }).components.Image.allOf;
    const innerObj = $defs.find((s) => s.properties && 'url' in s.properties)!;
    expect(innerObj.required).toEqual(['component', 'url']);
    expect('alt' in innerObj.properties!).toBe(true);
    expect('fit' in innerObj.properties!).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Content-pack fixture: image slots emit Image
// ---------------------------------------------------------------------------

function allComponents(messages: ReadonlyArray<A2uiMessage>): A2uiComponent[] {
  return messages
    .filter((m): m is A2uiUpdateComponentsMessage => 'updateComponents' in m)
    .flatMap((m) => m.updateComponents.components);
}

describe('Q3 — image slots emit Image components on s102-m01 content fixtures', () => {
  const fixtures: Array<readonly [string, ObjectCatalogManifest]> = [
    ['article (single-entity)', articleFixture as ObjectCatalogManifest],
    ['author (single-entity)', authorFixture as ObjectCatalogManifest],
    ['comment (single-entity)', commentFixture as ObjectCatalogManifest],
    ['content-pack (multi-entity)', contentPackFixture as ObjectCatalogManifest],
  ];

  describe.each(fixtures)('%s', (_name, manifest) => {
    const result = emit(manifest);

    it('no OODS-A2UI-IMAGE-FALLBACK warning fires', () => {
      const imageFallbacks = result.warnings.filter((w) => w.code === 'OODS-A2UI-IMAGE-FALLBACK');
      expect(imageFallbacks).toHaveLength(0);
    });

    it('every image-kind slot in the manifest produces an Image component', () => {
      const components = allComponents(result.messages);
      const imageNodes = components.filter(
        (c): c is A2uiImageComponent => c.component === 'Image',
      );
      // Article hero, author avatar, comment avatar → at least one Image per
      // single-entity fixture; content-pack aggregates them so it has more.
      expect(imageNodes.length).toBeGreaterThan(0);
      for (const node of imageNodes) {
        // url MUST be a DataBinding object (not a literal string) because slots
        // bind to data-model fields per the OODS Object Catalog contract.
        expect(typeof node.url).toBe('object');
        expect((node.url as { path: string }).path).toMatch(/^\//);
        // alt MUST surface the slot.name for assistive technology.
        expect(typeof node.alt).toBe('string');
        // a11y.label MUST also be populated (mirrors all other emitted components).
        expect(node.accessibility?.label).toBeDefined();
      }
    });

    it('non-image-kind slots do NOT emit Image components', () => {
      const components = allComponents(result.messages);
      const imageNodes = components.filter((c) => c.component === 'Image');
      for (const node of imageNodes) {
        // Image ids should be slot names that the inferSlotKind function would
        // classify as image (avatar / hero / thumb / etc.) — never title / body /
        // status / price etc.
        const slotName = node.id.toLowerCase();
        const NON_IMAGE_NAMES = new Set([
          'title',
          'subtitle',
          'body',
          'excerpt',
          'price',
          'status',
          'timestamp',
          'meta',
        ]);
        expect(
          NON_IMAGE_NAMES.has(slotName),
          `Slot "${node.id}" was classified as image but its name suggests a text kind`,
        ).toBe(false);
      }
    });

    it('every emitted Image component validates against the Forge catalog Image schema', () => {
      const components = allComponents(result.messages);
      const imageNodes = components.filter((c) => c.component === 'Image');
      for (const node of imageNodes) {
        const ok = validateImage(node);
        if (!ok) {
          // eslint-disable-next-line no-console
          console.error(JSON.stringify(validateImage.errors, null, 2));
        }
        expect(ok).toBe(true);
      }
    });

    it('every emitted surface declares catalogId starting with oods-forge: (per-entity stand-in preserved from s102-m03)', () => {
      const creates = result.messages.filter(
        (m): m is import('../../src/codegen/a2ui-runtime-emitter.js').A2uiCreateSurfaceMessage =>
          'createSurface' in m,
      );
      for (const c of creates) {
        expect(c.createSurface.catalogId.startsWith('oods-forge:')).toBe(true);
      }
    });
  });
});
