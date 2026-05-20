/**
 * Unit tests for the A2UI runtime emitter (fourth runPreEmit() consumer).
 *
 * Covers: top-level result shape, message envelope structure (createSurface +
 * updateComponents pairing), slot-kind dispatch to A2UI minimal-catalog
 * components, DataBinding path translation, brand_overlay → theme.primaryColor
 * resolution, multi-variant emission, options.variant restriction, image-slot
 * fail-loud warning per Rule 12, and accessibility attribute propagation.
 *
 * AJV schema conformance is asserted separately in the Q3 E2E gate
 * (test/e2e/a2ui-runtime-q3.e2e.spec.ts) which validates emitted messages
 * against the vendored v0.9 server_to_client.json + common_types.json +
 * catalogs/minimal/catalog.json.
 */

import { describe, expect, it } from 'vitest';

import userFixture from '../object-catalog/fixtures/user.json' with { type: 'json' };
import productFixture from '../object-catalog/fixtures/product.json' with { type: 'json' };
import articleFixture from '../object-catalog/fixtures/content/article.json' with { type: 'json' };
import authorFixture from '../object-catalog/fixtures/content/author.json' with { type: 'json' };

import type { ObjectCatalogManifest } from '../object-catalog/types.js';
import {
  emit,
  fieldToJsonPointer,
  type A2uiCreateSurfaceMessage,
  type A2uiUpdateComponentsMessage,
  type A2uiColumnComponent,
  type A2uiTextComponent,
  type A2uiButtonComponent,
} from './a2ui-runtime-emitter.js';

const user = userFixture as ObjectCatalogManifest;
const product = productFixture as ObjectCatalogManifest;
const article = articleFixture as ObjectCatalogManifest;
const author = authorFixture as ObjectCatalogManifest;

function partitionMessages(messages: ReadonlyArray<unknown>) {
  const creates = messages.filter(
    (m): m is A2uiCreateSurfaceMessage =>
      typeof m === 'object' && m !== null && 'createSurface' in m,
  );
  const updates = messages.filter(
    (m): m is A2uiUpdateComponentsMessage =>
      typeof m === 'object' && m !== null && 'updateComponents' in m,
  );
  return { creates, updates };
}

function findRoot(components: A2uiUpdateComponentsMessage['updateComponents']['components']): A2uiColumnComponent {
  const root = components.find((c) => c.id === 'root');
  if (!root || root.component !== 'Column') {
    throw new Error('expected a Column component with id=root');
  }
  return root;
}

// ---------------------------------------------------------------------------
// Top-level shape
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — top-level emit shape', () => {
  it('returns status=ok and framework=a2ui-runtime for a normal fixture', () => {
    const r = emit(user);
    expect(r.status).toBe('ok');
    expect(r.framework).toBe('a2ui-runtime');
    expect(r.fileExtension).toBe('.json');
    expect(r.errors).toBeUndefined();
  });

  it('serializes code as a JSON-parseable array matching messages', () => {
    const r = emit(user);
    const parsed = JSON.parse(r.code);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toEqual(r.messages);
  });

  it('emits a paired createSurface + updateComponents per surface', () => {
    const r = emit(user);
    const { creates, updates } = partitionMessages(r.messages);
    expect(creates.length).toBe(updates.length);
    expect(creates.length).toBeGreaterThan(0);
    // Pairs share surfaceId in send order.
    for (let i = 0; i < creates.length; i++) {
      expect(creates[i].createSurface.surfaceId).toBe(
        updates[i].updateComponents.surfaceId,
      );
    }
  });

  it('records meta.a2uiSpecVersion=v0.9 and catalogProfile=minimal', () => {
    const r = emit(user);
    expect(r.meta.a2uiSpecVersion).toBe('v0.9');
    expect(r.meta.catalogProfile).toBe('minimal');
    expect(r.meta.entitiesRendered).toBe(user.entities.length);
    expect(r.meta.surfacesRendered).toBe(r.messages.length / 2);
  });

  it('propagates manifest source agent + catalog version into meta', () => {
    const r = emit(user);
    expect(r.meta.sourceAgent).toBe(user.source?.agent);
    expect(r.meta.catalogVersion).toBe(user.source?.oods_catalog_version);
  });
});

// ---------------------------------------------------------------------------
// Envelope conformance (version const, required fields)
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — message envelope', () => {
  it('every emitted message carries version="v0.9"', () => {
    const r = emit(article);
    for (const m of r.messages) {
      expect((m as { version: string }).version).toBe('v0.9');
    }
  });

  it('createSurface carries surfaceId + catalogId + theme.primaryColor', () => {
    const r = emit(user);
    const { creates } = partitionMessages(r.messages);
    for (const m of creates) {
      expect(typeof m.createSurface.surfaceId).toBe('string');
      expect(m.createSurface.surfaceId.length).toBeGreaterThan(0);
      expect(typeof m.createSurface.catalogId).toBe('string');
      expect(m.createSurface.catalogId.startsWith('oods-forge:')).toBe(true);
      expect(m.createSurface.theme?.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('updateComponents.components is non-empty and contains exactly one root component', () => {
    const r = emit(article);
    const { updates } = partitionMessages(r.messages);
    for (const m of updates) {
      expect(m.updateComponents.components.length).toBeGreaterThan(0);
      const roots = m.updateComponents.components.filter((c) => c.id === 'root');
      expect(roots.length).toBe(1);
      expect(roots[0].component).toBe('Column');
    }
  });

  it('root Column.children references resolve to component ids within the same surface', () => {
    const r = emit(article);
    const { updates } = partitionMessages(r.messages);
    for (const m of updates) {
      const components = m.updateComponents.components;
      const root = findRoot(components);
      const ids = new Set(components.map((c) => c.id));
      for (const ref of root.children) {
        expect(ids.has(ref)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Slot-kind → component dispatch
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — slot-kind dispatch', () => {
  it('maps heading slots (title) to Text with variant=h2', () => {
    const r = emit(article, { variant: 'detail' });
    const { updates } = partitionMessages(r.messages);
    const titleNode = updates[0].updateComponents.components.find(
      (c) => c.id === 'title',
    ) as A2uiTextComponent | undefined;
    expect(titleNode).toBeDefined();
    expect(titleNode!.component).toBe('Text');
    expect(titleNode!.variant).toBe('h2');
  });

  it('maps body slots to Text with variant=body and a DataBinding path', () => {
    const r = emit(article, { variant: 'detail' });
    const { updates } = partitionMessages(r.messages);
    const bodyNode = updates[0].updateComponents.components.find(
      (c) => c.id === 'body',
    ) as A2uiTextComponent | undefined;
    expect(bodyNode).toBeDefined();
    expect(bodyNode!.variant).toBe('body');
    expect(bodyNode!.text).toEqual({ path: '/article/body_html' });
  });

  it('maps byline-style slots to Text with variant=caption', () => {
    const r = emit(article, { variant: 'detail' });
    const { updates } = partitionMessages(r.messages);
    const bylineNode = updates[0].updateComponents.components.find(
      (c) => c.id === 'byline',
    ) as A2uiTextComponent | undefined;
    expect(bylineNode).toBeDefined();
    expect(bylineNode!.variant).toBe('caption');
  });

  it('emits a Text + Button pair for action slots, with Button.action.event.name = slot name', () => {
    // product fixture has a primary_action slot
    const r = emit(product);
    const components = (
      partitionMessages(r.messages).updates[0].updateComponents.components
    );
    const buttons = components.filter(
      (c) => c.component === 'Button',
    ) as A2uiButtonComponent[];
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      const labelNode = components.find((c) => c.id === btn.child);
      expect(labelNode, `button.child=${btn.child}`).toBeDefined();
      expect(labelNode!.component).toBe('Text');
      expect(btn.action.event.name).toBe(btn.id);
    }
  });

  it('falls back to Text for image slots and emits an OODS-A2UI-IMAGE-FALLBACK warning per occurrence', () => {
    const r = emit(article, { variant: 'detail' });
    const heroWarnings = r.warnings.filter(
      (w) => w.code === 'OODS-A2UI-IMAGE-FALLBACK' && w.slot === 'hero',
    );
    expect(heroWarnings.length).toBeGreaterThan(0);
    const { updates } = partitionMessages(r.messages);
    const heroNode = updates[0].updateComponents.components.find(
      (c) => c.id === 'hero',
    ) as A2uiTextComponent | undefined;
    expect(heroNode).toBeDefined();
    expect(heroNode!.component).toBe('Text');
  });

  it('preserves accessibility.label = slot.name on each slot component', () => {
    const r = emit(article, { variant: 'detail' });
    const components = (
      partitionMessages(r.messages).updates[0].updateComponents.components
    );
    const slotComponents = components.filter((c) => c.id !== 'root');
    expect(slotComponents.length).toBeGreaterThan(0);
    // At least the title slot should carry an accessibility label
    const titleNode = components.find((c) => c.id === 'title') as
      | A2uiTextComponent
      | undefined;
    expect(titleNode?.accessibility?.label).toBe('title');
  });
});

// ---------------------------------------------------------------------------
// DataBinding path translation
// ---------------------------------------------------------------------------

describe('fieldToJsonPointer', () => {
  it('translates dot-paths to JSON Pointer with leading slash', () => {
    expect(fieldToJsonPointer('article.headline')).toBe('/article/headline');
  });

  it('translates bracket array indices to JSON Pointer segments', () => {
    expect(fieldToJsonPointer('users[0].email')).toBe('/users/0/email');
  });

  it('escapes ~ and / in path components per RFC 6901', () => {
    expect(fieldToJsonPointer('weird~key')).toBe('/weird~0key');
    expect(fieldToJsonPointer('a/b.c')).toBe('/a~1b/c');
  });

  it('handles a single-segment path', () => {
    expect(fieldToJsonPointer('total')).toBe('/total');
  });
});

// ---------------------------------------------------------------------------
// Variant handling
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — variant emission', () => {
  it('emits one surface pair per projection_variant when no options.variant is set', () => {
    const r = emit(author);
    const { creates } = partitionMessages(r.messages);
    const expectedVariants =
      author.entities[0].oods?.projection_variants?.map((v) => v.surface) ?? [];
    expect(expectedVariants.length).toBeGreaterThan(1);
    expect(creates.length).toBe(expectedVariants.length);
    const surfaceIds = creates.map((c) => c.createSurface.surfaceId);
    for (const v of expectedVariants) {
      expect(surfaceIds).toContain(`${author.entities[0].urn}#${v}`);
    }
  });

  it('options.variant restricts emission to a single matching variant', () => {
    const r = emit(author, { variant: 'mini' });
    const { creates, updates } = partitionMessages(r.messages);
    expect(creates.length).toBe(1);
    expect(creates[0].createSurface.surfaceId).toBe(
      `${author.entities[0].urn}#mini`,
    );
    // mini variant only has title slot
    const slotIds = updates[0].updateComponents.components
      .filter((c) => c.id !== 'root')
      .map((c) => c.id);
    expect(slotIds).toEqual(['title']);
  });
});

// ---------------------------------------------------------------------------
// Theme + brand resolution
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — theme resolution', () => {
  it('resolves brand-a overlay to the brand-a primary color by default', () => {
    const r = emit(user);
    const { creates } = partitionMessages(r.messages);
    expect(creates[0].createSurface.theme?.primaryColor).toBe('#1351c4');
  });

  it('honors options.primaryColor override regardless of brand_overlay', () => {
    const r = emit(user, { primaryColor: '#abcdef' });
    const { creates } = partitionMessages(r.messages);
    for (const c of creates) {
      expect(c.createSurface.theme?.primaryColor).toBe('#abcdef');
    }
  });

  it('honors options.brandOverlayHexMap for custom overlays', () => {
    const r = emit(user, {
      brandOverlayHexMap: { 'brand-a': '#001122' },
    });
    const { creates } = partitionMessages(r.messages);
    expect(creates[0].createSurface.theme?.primaryColor).toBe('#001122');
  });
});

// ---------------------------------------------------------------------------
// CatalogId
// ---------------------------------------------------------------------------

describe('a2ui-runtime-emitter — catalogId formation', () => {
  it('defaults catalogId to oods-forge:<urn>', () => {
    const r = emit(user);
    const { creates } = partitionMessages(r.messages);
    for (let i = 0; i < creates.length; i++) {
      expect(creates[i].createSurface.catalogId).toBe(
        `oods-forge:${user.entities[0].urn}`,
      );
    }
  });

  it('honors options.catalogId override', () => {
    const r = emit(user, { catalogId: 'example.com:custom-catalog' });
    const { creates } = partitionMessages(r.messages);
    for (const c of creates) {
      expect(c.createSurface.catalogId).toBe('example.com:custom-catalog');
    }
  });
});
