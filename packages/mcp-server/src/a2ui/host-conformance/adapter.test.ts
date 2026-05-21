/**
 * @vitest-environment happy-dom
 *
 * Unit tests for the A2UI host conformance adapter (s104-m01).
 *
 * Per-file environment override: happy-dom provides the DOM globals that
 * lit-html `render()` needs (document.createDocumentFragment, Element APIs).
 * The default vitest environment in this package is 'node'; only adapter
 * tests and the host-conformance Q3 gate switch to happy-dom.
 *
 * Coverage:
 *   - Forge catalog acceptance (HOST_EXPECTED_CATALOG_ID + oods-forge:* prefix)
 *   - DataBinding resolution against a data model
 *   - Path-unresolved diagnostic (axis (a) — AJV-vs-host gate boundary)
 *   - Child-dangling diagnostic (Column.children, Button.child)
 *   - Surface mismatch throws (paired-message contract)
 *   - Unknown component type diagnostic (catalog drift)
 *   - DOM tree structure: data-a2ui-id + data-a2ui-component attributes
 *     reachable via querySelector
 */

import { describe, expect, it } from 'vitest';

import type {
  A2uiCreateSurfaceMessage,
  A2uiUpdateComponentsMessage,
} from '../../codegen/a2ui-runtime-emitter.js';
import {
  HOST_EXPECTED_CATALOG_ID,
  isAcceptedCatalogId,
  renderA2uiSurface,
} from './adapter.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCreate(
  surfaceId = 'urn:proto:semantic:test@1.0.0#default',
  catalogId = HOST_EXPECTED_CATALOG_ID,
): A2uiCreateSurfaceMessage {
  return {
    version: 'v0.9',
    createSurface: { surfaceId, catalogId, theme: { primaryColor: '#1351c4' } },
  };
}

function makeUpdate(
  components: unknown[],
  surfaceId = 'urn:proto:semantic:test@1.0.0#default',
): A2uiUpdateComponentsMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId,
      components: components as never,
    },
  };
}

function fragmentToElement(fragment: DocumentFragment): Element {
  // Wrap so querySelector behaves naturally — fragments themselves accept
  // querySelector but happy-dom edge cases prefer an Element wrapper.
  const container = document.createElement('div');
  container.appendChild(fragment);
  return container;
}

// ---------------------------------------------------------------------------
// Catalog acceptance
// ---------------------------------------------------------------------------

describe('adapter — catalog acceptance', () => {
  it('accepts the canonical Forge catalog id', () => {
    expect(isAcceptedCatalogId(HOST_EXPECTED_CATALOG_ID)).toBe(true);
  });

  it('accepts per-entity oods-forge:* catalog ids the emitter produces', () => {
    expect(isAcceptedCatalogId('oods-forge:urn:proto:semantic:user-card@1.0.0')).toBe(true);
  });

  it('rejects non-Forge catalog ids', () => {
    expect(isAcceptedCatalogId('a2ui-minimal:catalog/v1')).toBe(false);
    expect(isAcceptedCatalogId('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Successful rendering
// ---------------------------------------------------------------------------

describe('adapter — renderA2uiSurface success path', () => {
  it('renders a single-slot Column+Text surface with DataBinding resolved', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['name'] },
      {
        id: 'name',
        component: 'Text',
        variant: 'h2',
        text: { path: '/user/name' },
      },
    ]);
    const dataModel = { user: { name: 'Ada Lovelace' } };

    const result = renderA2uiSurface(createMsg, updateMsg, dataModel);

    expect(result.diagnostics).toEqual([]);
    expect(result.meta.componentsRendered).toBe(2);
    expect(result.meta.surfaceId).toBe(createMsg.createSurface.surfaceId);
    expect(result.meta.catalogId).toBe(HOST_EXPECTED_CATALOG_ID);

    const el = fragmentToElement(result.fragment);
    const nameEl = el.querySelector('[data-a2ui-id="name"]');
    expect(nameEl).not.toBeNull();
    expect(nameEl!.textContent?.trim()).toBe('Ada Lovelace');
  });

  it('emits the surfaceId + catalogId as host wrapper data-* attributes', () => {
    const createMsg = makeCreate('urn:test#desktop');
    const updateMsg = makeUpdate(
      [
        { id: 'root', component: 'Column', children: ['n'] },
        { id: 'n', component: 'Text', text: { path: '/n' } },
      ],
      'urn:test#desktop',
    );
    const dataModel = { n: 'x' };

    const result = renderA2uiSurface(createMsg, updateMsg, dataModel);
    const el = fragmentToElement(result.fragment);
    const wrapper = el.querySelector('[data-a2ui-surface]');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute('data-a2ui-surface')).toBe('urn:test#desktop');
    expect(wrapper!.getAttribute('data-a2ui-catalog')).toBe(HOST_EXPECTED_CATALOG_ID);
  });

  it('renders an Image component with src bound from DataBinding', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['hero'] },
      {
        id: 'hero',
        component: 'Image',
        url: { path: '/article/hero_url' },
        alt: 'hero',
      },
    ]);
    const dataModel = { article: { hero_url: 'https://cdn.test/h.jpg' } };

    const result = renderA2uiSurface(createMsg, updateMsg, dataModel);
    expect(result.diagnostics).toEqual([]);

    const el = fragmentToElement(result.fragment);
    const img = el.querySelector('[data-a2ui-id="hero"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://cdn.test/h.jpg');
    expect(img.getAttribute('alt')).toBe('hero');
  });

  it('renders a Button with action.event.name surfaced for downstream wiring', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['cta'] },
      {
        id: 'cta__label',
        component: 'Text',
        variant: 'body',
        text: { path: '/cta_label' },
      },
      {
        id: 'cta',
        component: 'Button',
        variant: 'primary',
        child: 'cta__label',
        action: { event: { name: 'addToCart' } },
      },
    ]);
    const dataModel = { cta_label: 'Add to cart' };

    const result = renderA2uiSurface(createMsg, updateMsg, dataModel);
    expect(result.diagnostics).toEqual([]);

    const el = fragmentToElement(result.fragment);
    const btn = el.querySelector('[data-a2ui-id="cta"]')!;
    expect(btn.getAttribute('data-a2ui-event')).toBe('addToCart');
    expect(btn.textContent?.trim()).toBe('Add to cart');
  });
});

// ---------------------------------------------------------------------------
// Diagnostics — the AJV-vs-host gate boundary (axis a)
// ---------------------------------------------------------------------------

describe('adapter — renderer diagnostics', () => {
  it('OODS-HOST-PATH-UNRESOLVED when DataBinding target is missing in data model', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['name'] },
      { id: 'name', component: 'Text', text: { path: '/user/name' } },
    ]);
    // Intentionally empty — wire shape is valid but data is missing.
    const dataModel = {};

    const result = renderA2uiSurface(createMsg, updateMsg, dataModel);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'OODS-HOST-PATH-UNRESOLVED',
      componentId: 'name',
      path: '/user/name',
    });

    // Renders empty text rather than crashing — fail-loud via diagnostic.
    const el = fragmentToElement(result.fragment);
    expect(el.querySelector('[data-a2ui-id="name"]')!.textContent?.trim()).toBe('');
  });

  it('OODS-HOST-CHILD-DANGLING when Column.children references a missing component', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['ghost'] },
    ]);
    const result = renderA2uiSurface(createMsg, updateMsg, {});
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'OODS-HOST-CHILD-DANGLING',
      componentId: 'root',
    });
  });

  it('OODS-HOST-CHILD-DANGLING when Button.child references a missing component', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['btn'] },
      {
        id: 'btn',
        component: 'Button',
        child: 'ghost-label',
        action: { event: { name: 'evt' } },
      },
    ]);
    const result = renderA2uiSurface(createMsg, updateMsg, {});
    const dangling = result.diagnostics.filter(
      (d) => d.code === 'OODS-HOST-CHILD-DANGLING',
    );
    expect(dangling).toHaveLength(1);
    expect(dangling[0].componentId).toBe('btn');
  });

  it('OODS-HOST-UNKNOWN-COMPONENT for component types outside the Forge catalog', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'root', component: 'Column', children: ['custom'] },
      // Hypothetical component type not in the Forge catalog — would be
      // AJV-rejected upstream, but the harness fail-louds it here too.
      { id: 'custom', component: 'CarouselExtension', text: 'x' },
    ]);
    const result = renderA2uiSurface(createMsg, updateMsg, {});
    const unknown = result.diagnostics.filter(
      (d) => d.code === 'OODS-HOST-UNKNOWN-COMPONENT',
    );
    expect(unknown).toHaveLength(1);
    expect(unknown[0].componentId).toBe('custom');
  });
});

// ---------------------------------------------------------------------------
// Contract — paired-message invariant
// ---------------------------------------------------------------------------

describe('adapter — paired-message contract', () => {
  it('throws when createSurface and updateComponents reference different surfaceIds', () => {
    const createMsg = makeCreate('urn:test#a');
    const updateMsg = makeUpdate(
      [{ id: 'root', component: 'Column', children: [] }],
      'urn:test#b',
    );
    expect(() => renderA2uiSurface(createMsg, updateMsg, {})).toThrow(
      /surfaceId.*does not match/,
    );
  });

  it('throws when updateComponents.components has no root', () => {
    const createMsg = makeCreate();
    const updateMsg = makeUpdate([
      { id: 'other', component: 'Text', text: 'x' },
    ]);
    expect(() => renderA2uiSurface(createMsg, updateMsg, {})).toThrow(
      /no component with id="root"/,
    );
  });
});
