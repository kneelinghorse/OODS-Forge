/**
 * C-track A2UI runtime emitter — fourth runPreEmit() consumer.
 *
 * Fourth (and load-bearing) rung on the OODS fidelity ladder per D2: takes
 * Object Catalog manifests from build-time codegen into runtime composition by
 * emitting A2UI v0.9 server-to-client messages that A2UI hosts (Google ADK,
 * Lit web renderer, Flutter GenUI SDK) can consume directly.
 *
 * Differs from C1/C2/C3-branded-mockup on the OUTPUT FORMAT axis (JSON message
 * stream, not HTML); the semantic anchors (entity URN, slot name, slot field)
 * are preserved through different vehicles (surfaceId, component id, DataBinding
 * path).
 *
 * Targets the A2UI **minimal** catalog (Text / Row / Column / Button /
 * TextField) so emitted messages validate against the v0.9 spec without
 * declaring a custom Forge catalog. Image-kind slots are surfaced as Text with
 * a fail-loud warning (Rule 12) — extending the catalog with an Image
 * component is named as future work, not silently filled in.
 *
 * Consumes runPreEmit() unchanged. Per the s102-m03 mission-end protocol, the
 * D2 generalization assessment is captured as a separate decision; this
 * emitter records its strain (or lack thereof) by what it does, not what it
 * asserts.
 */

import type {
  ObjectCatalogManifest,
  OodsSlot,
  SemanticEntity,
} from '../object-catalog/types.js';
import { runPreEmit } from './pre-emit.js';

// ---------------------------------------------------------------------------
// A2UI v0.9 message + component types (subset emitted by this prototype).
// Schemas vendored at packages/mcp-server/src/a2ui/contracts/v0_9/ —
// these TS types are the structural mirror used at emit time. AJV validation
// against the vendored schemas in the Q3 E2E gate is the canonical conformance
// check.
// ---------------------------------------------------------------------------

export interface A2uiDataBinding {
  path: string;
}

export type A2uiDynamicString = string | A2uiDataBinding;

export interface A2uiAccessibilityAttributes {
  label?: A2uiDynamicString;
  description?: A2uiDynamicString;
}

export interface A2uiTextComponent {
  id: string;
  component: 'Text';
  text: A2uiDynamicString;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'caption' | 'body';
  accessibility?: A2uiAccessibilityAttributes;
}

export interface A2uiColumnComponent {
  id: string;
  component: 'Column';
  children: string[];
  justify?:
    | 'start'
    | 'center'
    | 'end'
    | 'spaceBetween'
    | 'spaceAround'
    | 'spaceEvenly'
    | 'stretch';
  align?: 'start' | 'center' | 'end' | 'stretch';
  accessibility?: A2uiAccessibilityAttributes;
}

export interface A2uiButtonComponent {
  id: string;
  component: 'Button';
  child: string;
  action: {
    event: {
      name: string;
      context?: Record<string, unknown>;
    };
  };
  variant?: 'primary' | 'borderless';
  accessibility?: A2uiAccessibilityAttributes;
}

export type A2uiComponent =
  | A2uiTextComponent
  | A2uiColumnComponent
  | A2uiButtonComponent;

export interface A2uiCreateSurfaceMessage {
  version: 'v0.9';
  createSurface: {
    surfaceId: string;
    catalogId: string;
    theme?: { primaryColor?: string };
    sendDataModel?: boolean;
  };
}

export interface A2uiUpdateComponentsMessage {
  version: 'v0.9';
  updateComponents: {
    surfaceId: string;
    components: A2uiComponent[];
  };
}

export type A2uiMessage = A2uiCreateSurfaceMessage | A2uiUpdateComponentsMessage;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface A2uiRuntimeOptions {
  /** When set, only this projection variant is emitted per entity. */
  variant?: string;
  /** Override the per-entity catalogId. Default: `oods-forge:<urn>` per entity. */
  catalogId?: string;
  /** Theme primary color (CSS hex). Overrides brand→hex resolution. */
  primaryColor?: string;
  /** Map of brand_overlay name → primary hex. Defaults provided for brand-a / brand-b. */
  brandOverlayHexMap?: Record<string, string>;
}

export interface A2uiRuntimeIssue {
  code: string;
  message: string;
  entity?: string;
  slot?: string;
}

export interface A2uiRuntimeResult {
  status: 'ok' | 'error';
  framework: 'a2ui-runtime';
  /** Server-to-client messages in send order: per-surface createSurface followed by updateComponents. */
  messages: A2uiMessage[];
  /** Pretty-printed JSON-array serialization of `messages`, suitable for save-to-disk. */
  code: string;
  fileExtension: '.json';
  warnings: A2uiRuntimeIssue[];
  errors?: A2uiRuntimeIssue[];
  meta: {
    a2uiSpecVersion: 'v0.9';
    catalogProfile: 'minimal';
    entitiesRendered: number;
    surfacesRendered: number;
    componentsRendered: number;
    catalogVersion?: string;
    sourceAgent?: string;
  };
}

// ---------------------------------------------------------------------------
// Brand → theme.primaryColor resolution
// ---------------------------------------------------------------------------

const DEFAULT_PRIMARY = '#1351c4';

const DEFAULT_BRAND_HEX: Record<string, string> = {
  'brand-a': '#1351c4',
  'brand-b': '#1e8f4a',
};

function resolveThemeColor(
  brandOverlay: string | undefined,
  options: A2uiRuntimeOptions,
): string {
  if (options.primaryColor) return options.primaryColor;
  if (brandOverlay) {
    const merged = { ...DEFAULT_BRAND_HEX, ...(options.brandOverlayHexMap ?? {}) };
    if (merged[brandOverlay]) return merged[brandOverlay];
  }
  return DEFAULT_PRIMARY;
}

// ---------------------------------------------------------------------------
// Slot-kind inference (mirrors branded-mockup-emitter conventions; inline
// per Rule 2 — no abstraction extracted at n=2).
// ---------------------------------------------------------------------------

type SlotKind =
  | 'image'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'meta'
  | 'price'
  | 'action'
  | 'status'
  | 'generic';

const IMAGE_SLOT_NAMES = new Set([
  'avatar',
  'thumb',
  'thumbnail',
  'hero',
  'media',
  'image',
  'photo',
  'cover',
]);
const HEADING_SLOT_NAMES = new Set(['title', 'headline', 'heading', 'name']);
const SUBHEADING_SLOT_NAMES = new Set(['subtitle', 'byline', 'tagline']);
const BODY_SLOT_NAMES = new Set(['body', 'excerpt', 'description', 'bio', 'content']);
const META_SLOT_NAMES = new Set(['timestamp', 'date', 'meta', 'related']);
const PRICE_SLOT_NAMES = new Set(['price', 'amount', 'total', 'cost']);
const STATUS_SLOT_NAMES = new Set(['status', 'state', 'badge']);

function inferSlotKind(slot: OodsSlot): SlotKind {
  const name = slot.name.toLowerCase();
  if (IMAGE_SLOT_NAMES.has(name)) return 'image';
  if (HEADING_SLOT_NAMES.has(name)) return 'heading';
  if (SUBHEADING_SLOT_NAMES.has(name)) return 'subheading';
  if (BODY_SLOT_NAMES.has(name)) return 'body';
  if (META_SLOT_NAMES.has(name)) return 'meta';
  if (PRICE_SLOT_NAMES.has(name)) return 'price';
  if (STATUS_SLOT_NAMES.has(name)) return 'status';
  if (name.includes('action') || name === 'cta') return 'action';
  return 'generic';
}

// ---------------------------------------------------------------------------
// Field path → JSON Pointer (A2UI DataBinding.path semantics)
// ---------------------------------------------------------------------------

/**
 * Translate a dot-and-bracket field path (e.g. `article.headline`,
 * `users[0].email`) into a JSON Pointer (`/article/headline`,
 * `/users/0/email`). Path components are JSON-Pointer-escaped (~→~0, /→~1).
 */
export function fieldToJsonPointer(field: string): string {
  const normalized = field.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalized.split('.').filter((p) => p.length > 0);
  const escaped = parts.map((p) =>
    p.replace(/~/g, '~0').replace(/\//g, '~1'),
  );
  return '/' + escaped.join('/');
}

// ---------------------------------------------------------------------------
// Per-slot projection
// ---------------------------------------------------------------------------

const ROOT_ID = 'root';

function projectSlot(
  entityUrn: string,
  slot: OodsSlot,
  warnings: A2uiRuntimeIssue[],
): { rootRef: string; components: A2uiComponent[] } {
  const kind = inferSlotKind(slot);
  const id = slot.name;
  const path = fieldToJsonPointer(slot.binding.field);
  const dataBinding: A2uiDataBinding = { path };
  const accessibility: A2uiAccessibilityAttributes = { label: slot.name };

  switch (kind) {
    case 'image':
      warnings.push({
        code: 'OODS-A2UI-IMAGE-FALLBACK',
        message: `Slot "${slot.name}" inferred as image; A2UI minimal catalog has no Image component — emitted as Text fallback carrying the URL via DataBinding. Extend the catalog with an Image component when image rendering becomes required.`,
        entity: entityUrn,
        slot: slot.name,
      });
      return {
        rootRef: id,
        components: [
          {
            id,
            component: 'Text',
            variant: 'body',
            text: dataBinding,
            accessibility,
          },
        ],
      };
    case 'heading':
      return {
        rootRef: id,
        components: [
          {
            id,
            component: 'Text',
            variant: 'h2',
            text: dataBinding,
            accessibility,
          },
        ],
      };
    case 'subheading':
    case 'meta':
    case 'status':
      return {
        rootRef: id,
        components: [
          {
            id,
            component: 'Text',
            variant: 'caption',
            text: dataBinding,
            accessibility,
          },
        ],
      };
    case 'body':
    case 'price':
    case 'generic':
      return {
        rootRef: id,
        components: [
          {
            id,
            component: 'Text',
            variant: 'body',
            text: dataBinding,
            accessibility,
          },
        ],
      };
    case 'action': {
      const labelId = `${id}__label`;
      return {
        rootRef: id,
        components: [
          {
            id: labelId,
            component: 'Text',
            variant: 'body',
            text: dataBinding,
          },
          {
            id,
            component: 'Button',
            variant: 'primary',
            child: labelId,
            action: { event: { name: slot.name } },
            accessibility,
          },
        ],
      };
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Surface + catalog id formation
// ---------------------------------------------------------------------------

function surfaceIdFor(entityUrn: string, variantSurface: string): string {
  return `${entityUrn}#${variantSurface}`;
}

function catalogIdFor(entityUrn: string, override?: string): string {
  if (override) return override;
  return `oods-forge:${entityUrn}`;
}

// ---------------------------------------------------------------------------
// Per-entity emission (one or more variants)
// ---------------------------------------------------------------------------

interface VariantEmission {
  surfaceId: string;
  variantSurface: string;
  catalogId: string;
  primaryColor: string;
  components: A2uiComponent[];
}

function emitEntityForVariant(
  entity: SemanticEntity,
  variantSurface: string,
  options: A2uiRuntimeOptions,
  warnings: A2uiRuntimeIssue[],
): VariantEmission | null {
  const ctx = runPreEmit(entity, { variant: variantSurface });
  const catalog = ctx.catalog;
  if (!catalog) return null;
  const slots = catalog.slots;

  const components: A2uiComponent[] = [];
  const childRefs: string[] = [];
  const seenIds = new Set<string>([ROOT_ID]);

  for (const slot of slots) {
    if (seenIds.has(slot.name)) {
      warnings.push({
        code: 'OODS-A2UI-DUP-SLOT-NAME',
        message: `Slot id collision: slot name "${slot.name}" is already used. A2UI requires unique component ids within a surface — duplicates are skipped.`,
        entity: entity.urn,
        slot: slot.name,
      });
      continue;
    }
    const projected = projectSlot(entity.urn, slot, warnings);
    components.push(...projected.components);
    childRefs.push(projected.rootRef);
    for (const c of projected.components) seenIds.add(c.id);
  }

  const root: A2uiColumnComponent = {
    id: ROOT_ID,
    component: 'Column',
    children: childRefs,
    accessibility: { label: entity.element.name },
  };
  components.unshift(root);

  return {
    surfaceId: surfaceIdFor(entity.urn, variantSurface),
    variantSurface,
    catalogId: catalogIdFor(entity.urn, options.catalogId),
    primaryColor: resolveThemeColor(catalog.brandOverlay, options),
    components,
  };
}

function variantSurfacesFor(
  entity: SemanticEntity,
  options: A2uiRuntimeOptions,
): string[] {
  if (options.variant) return [options.variant];
  const variants = entity.oods?.projection_variants;
  if (variants && variants.length > 0) return variants.map((v) => v.surface);
  return ['default'];
}

// ---------------------------------------------------------------------------
// Manifest-level entry point
// ---------------------------------------------------------------------------

export function emit(
  manifest: ObjectCatalogManifest,
  options: A2uiRuntimeOptions = {},
): A2uiRuntimeResult {
  const warnings: A2uiRuntimeIssue[] = [];
  const errors: A2uiRuntimeIssue[] = [];
  const messages: A2uiMessage[] = [];
  let surfacesRendered = 0;
  let componentsRendered = 0;

  for (const entity of manifest.entities) {
    const surfaces = variantSurfacesFor(entity, options);
    for (const variantSurface of surfaces) {
      const emission = emitEntityForVariant(
        entity,
        variantSurface,
        options,
        warnings,
      );
      if (!emission) {
        errors.push({
          code: 'OODS-A2UI-NO-RENDER',
          message: `Entity has no resolvable render slots for variant "${variantSurface}".`,
          entity: entity.urn,
        });
        continue;
      }

      const createSurface: A2uiCreateSurfaceMessage = {
        version: 'v0.9',
        createSurface: {
          surfaceId: emission.surfaceId,
          catalogId: emission.catalogId,
          theme: { primaryColor: emission.primaryColor },
        },
      };
      const updateComponents: A2uiUpdateComponentsMessage = {
        version: 'v0.9',
        updateComponents: {
          surfaceId: emission.surfaceId,
          components: emission.components,
        },
      };
      messages.push(createSurface, updateComponents);
      surfacesRendered += 1;
      componentsRendered += emission.components.length;
    }
  }

  const status: 'ok' | 'error' = errors.length === 0 ? 'ok' : 'error';

  return {
    status,
    framework: 'a2ui-runtime',
    messages,
    code: JSON.stringify(messages, null, 2),
    fileExtension: '.json',
    warnings,
    errors: errors.length > 0 ? errors : undefined,
    meta: {
      a2uiSpecVersion: 'v0.9',
      catalogProfile: 'minimal',
      entitiesRendered: manifest.entities.length,
      surfacesRendered,
      componentsRendered,
      catalogVersion: manifest.source?.oods_catalog_version,
      sourceAgent: manifest.source?.agent,
    },
  };
}
