/**
 * Lit-local host adapter for A2UI v0.9 server-to-client messages (s104-m01).
 *
 * Single entry point: `renderA2uiSurface(createMsg, updateMsg, dataModel)`
 * takes a paired createSurface + updateComponents message stream and a data
 * model, renders the component tree through lit-html into a happy-dom
 * DocumentFragment, and returns it alongside renderer-side diagnostics.
 *
 * Adapter shape per mission-start audit (s104-m01) axis (b):
 *   - Per-component dispatch table keyed by component type — the dispatch
 *     table IS the implicit Forge catalog (oods-forge:catalog/v1) binding.
 *   - The catalogId on createSurface is asserted to match
 *     `FORGE_CATALOG_ID = 'oods-forge:catalog/v1'` or the pattern
 *     `oods-forge:<urn>` (per the emitter's catalogIdFor convention).
 *   - Lookup table built per updateComponents call: Map<id, A2uiComponent>.
 *   - Rendering walks from root via root.children (Column) / root.child
 *     (single-child wrappers when applicable).
 *
 * The harness's value over AJV alone (axis (a)): AJV proves wire-shape
 * conformance — this proves DataBinding paths resolve against the data
 * model AND child/children references actually bind to components in
 * the same surface AND the tree composes into a renderable DOM fragment.
 */

import { html, render, type TemplateResult } from 'lit-html';

import {
  FORGE_CATALOG_ID,
  type A2uiButtonComponent,
  type A2uiColumnComponent,
  type A2uiComponent,
  type A2uiCreateSurfaceMessage,
  type A2uiDataBinding,
  type A2uiDynamicString,
  type A2uiImageComponent,
  type A2uiTextComponent,
  type A2uiUpdateComponentsMessage,
} from '../../codegen/a2ui-runtime-emitter.js';
import { resolvePath } from './data-model.js';
import type {
  HostDataModel,
  HostRenderDiagnostic,
  HostRenderResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Adapter entry point
// ---------------------------------------------------------------------------

/**
 * Render a single A2UI surface (createSurface + updateComponents pair) into
 * a DocumentFragment using lit-html. Returns the fragment plus renderer
 * diagnostics.
 *
 * Preconditions:
 *   - `createMsg.createSurface.surfaceId === updateMsg.updateComponents.surfaceId`
 *     — paired messages must reference the same surface. A mismatch is a
 *     caller bug, surfaced via thrown Error rather than diagnostic
 *     (the emitter pairs surfaces strictly in send order).
 *   - The host environment provides `document` (happy-dom in test, real DOM
 *     in browser). The Node entry point of lit-html will throw a clear error
 *     if `document` is missing.
 */
export function renderA2uiSurface(
  createMsg: A2uiCreateSurfaceMessage,
  updateMsg: A2uiUpdateComponentsMessage,
  dataModel: HostDataModel,
): HostRenderResult {
  const surfaceId = createMsg.createSurface.surfaceId;
  if (updateMsg.updateComponents.surfaceId !== surfaceId) {
    throw new Error(
      `host-conformance: createSurface.surfaceId=${surfaceId} does not match updateComponents.surfaceId=${updateMsg.updateComponents.surfaceId}`,
    );
  }

  const catalogId = createMsg.createSurface.catalogId;
  const components = updateMsg.updateComponents.components;

  const diagnostics: HostRenderDiagnostic[] = [];
  const lookup = new Map<string, A2uiComponent>();
  for (const c of components) lookup.set(c.id, c);

  const root = lookup.get('root');
  if (!root) {
    throw new Error(
      `host-conformance: surface "${surfaceId}" has no component with id="root"`,
    );
  }

  const template = renderComponent(root, lookup, dataModel, diagnostics);
  const fragment = document.createDocumentFragment();

  // Wrap in a host container so the surfaceId is queryable from tests.
  const hostTemplate = html`
    <div data-a2ui-surface=${surfaceId} data-a2ui-catalog=${catalogId}>
      ${template}
    </div>
  `;

  render(hostTemplate, fragment);

  return {
    fragment,
    diagnostics,
    meta: {
      surfaceId,
      catalogId,
      componentsRendered: components.length,
    },
  };
}

/**
 * Canonical Forge catalogId expected by the host adapter at v1. See
 * `FORGE_CATALOG_ID` exported from the runtime emitter for the source of truth.
 */
export const HOST_EXPECTED_CATALOG_ID = FORGE_CATALOG_ID;

/**
 * Validate that a createSurface.catalogId matches the Forge catalog
 * convention. The emitter uses two forms:
 *   - global Forge id: `oods-forge:catalog/v1`
 *   - per-entity id:   `oods-forge:<entity-urn>` (catalogIdFor in the emitter)
 *
 * Both are accepted by the host adapter — at v1 there is one Forge catalog
 * and the per-entity form is the emitter's convention for tying a surface to
 * its source entity. Any other catalogId triggers an unknown-catalog
 * diagnostic.
 */
export function isAcceptedCatalogId(catalogId: string): boolean {
  if (catalogId === HOST_EXPECTED_CATALOG_ID) return true;
  return catalogId.startsWith('oods-forge:');
}

// ---------------------------------------------------------------------------
// Per-component dispatch
// ---------------------------------------------------------------------------

function renderComponent(
  component: A2uiComponent,
  lookup: Map<string, A2uiComponent>,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): TemplateResult {
  switch (component.component) {
    case 'Text':
      return renderText(component, dataModel, diagnostics);
    case 'Column':
      return renderColumn(component, lookup, dataModel, diagnostics);
    case 'Button':
      return renderButton(component, lookup, dataModel, diagnostics);
    case 'Image':
      return renderImage(component, dataModel, diagnostics);
    default: {
      const unknown = component as { component: string; id: string };
      diagnostics.push({
        code: 'OODS-HOST-UNKNOWN-COMPONENT',
        message: `Component type "${unknown.component}" is not in the Forge catalog (Text/Row/Column/Button/TextField/Image). AJV should have rejected this — harness drift relative to the emitter is likely.`,
        componentId: unknown.id,
      });
      return html`<span
        data-a2ui-unknown=${unknown.component}
        data-a2ui-id=${unknown.id}
      ></span>`;
    }
  }
}

function renderText(
  component: A2uiTextComponent,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): TemplateResult {
  const text = resolveDynamicString(
    component.text,
    component.id,
    dataModel,
    diagnostics,
  );
  const tag = component.variant ?? 'body';
  // Variants map to semantic tags inside the surface wrapper. Tests query by
  // data-a2ui-id which is stable across variants.
  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5') {
    return html`<h2 data-a2ui-id=${component.id} data-a2ui-component="Text" data-a2ui-variant=${tag}>${text}</h2>`;
  }
  if (tag === 'caption') {
    return html`<small data-a2ui-id=${component.id} data-a2ui-component="Text" data-a2ui-variant="caption">${text}</small>`;
  }
  return html`<p data-a2ui-id=${component.id} data-a2ui-component="Text" data-a2ui-variant=${tag}>${text}</p>`;
}

function renderColumn(
  component: A2uiColumnComponent,
  lookup: Map<string, A2uiComponent>,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): TemplateResult {
  const children = resolveChildren(
    component.children,
    component.id,
    lookup,
    diagnostics,
  );
  const childTemplates = children.map((child) =>
    renderComponent(child, lookup, dataModel, diagnostics),
  );
  return html`<div
    data-a2ui-id=${component.id}
    data-a2ui-component="Column"
  >${childTemplates}</div>`;
}

function renderButton(
  component: A2uiButtonComponent,
  lookup: Map<string, A2uiComponent>,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): TemplateResult {
  const child = lookup.get(component.child);
  if (!child) {
    diagnostics.push({
      code: 'OODS-HOST-CHILD-DANGLING',
      message: `Button child reference "${component.child}" does not resolve to a component in surface lookup.`,
      componentId: component.id,
    });
    return html`<button
      data-a2ui-id=${component.id}
      data-a2ui-component="Button"
      data-a2ui-dangling-child=${component.child}
    ></button>`;
  }
  const childTemplate = renderComponent(child, lookup, dataModel, diagnostics);
  const eventName = component.action.event.name;
  return html`<button
    data-a2ui-id=${component.id}
    data-a2ui-component="Button"
    data-a2ui-event=${eventName}
  >${childTemplate}</button>`;
}

function renderImage(
  component: A2uiImageComponent,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): TemplateResult {
  const url = resolveDynamicString(
    component.url,
    component.id,
    dataModel,
    diagnostics,
  );
  const alt =
    component.alt !== undefined
      ? resolveDynamicString(component.alt, component.id, dataModel, diagnostics)
      : '';
  return html`<img
    data-a2ui-id=${component.id}
    data-a2ui-component="Image"
    src=${url}
    alt=${alt}
  />`;
}

// ---------------------------------------------------------------------------
// DynamicString + child resolution
// ---------------------------------------------------------------------------

function resolveDynamicString(
  value: A2uiDynamicString,
  componentId: string,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): string {
  if (typeof value === 'string') return value;
  return resolveDataBinding(value, componentId, dataModel, diagnostics);
}

function resolveDataBinding(
  binding: A2uiDataBinding,
  componentId: string,
  dataModel: HostDataModel,
  diagnostics: HostRenderDiagnostic[],
): string {
  const result = resolvePath(dataModel, binding.path);
  if (!result.resolved) {
    diagnostics.push({
      code: 'OODS-HOST-PATH-UNRESOLVED',
      message: `DataBinding path "${binding.path}" did not resolve against the data model.`,
      componentId,
      path: binding.path,
    });
    return '';
  }
  if (result.value === null || result.value === undefined) return '';
  return String(result.value);
}

function resolveChildren(
  refs: ReadonlyArray<string>,
  parentId: string,
  lookup: Map<string, A2uiComponent>,
  diagnostics: HostRenderDiagnostic[],
): A2uiComponent[] {
  const resolved: A2uiComponent[] = [];
  for (const ref of refs) {
    const child = lookup.get(ref);
    if (!child) {
      diagnostics.push({
        code: 'OODS-HOST-CHILD-DANGLING',
        message: `Children reference "${ref}" does not resolve to a component in surface lookup.`,
        componentId: parentId,
      });
      continue;
    }
    resolved.push(child);
  }
  return resolved;
}
