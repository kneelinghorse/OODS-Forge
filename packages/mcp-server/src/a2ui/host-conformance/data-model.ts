/**
 * Data-model utilities for the A2UI host conformance harness.
 *
 * Two responsibilities:
 *
 * 1. `resolvePath(model, jsonPointer)` — resolve a JSON Pointer (RFC 6901) into
 *    a value, mirroring the path semantics the emitter produces via
 *    `fieldToJsonPointer`. Returns `{ resolved: true, value }` when the target
 *    exists (including when the value is null) and `{ resolved: false }` when
 *    any segment is missing. This `resolved` discriminator is what makes the
 *    AJV-vs-host gate boundary observable: AJV cannot tell whether the
 *    data-model target exists; the harness can.
 *
 * 2. `synthesizeDataModel(emitMessages)` — build a synthetic data model by
 *    walking every DataBinding `path` reachable from the emitted messages and
 *    populating each leaf target with a placeholder string. This is what the
 *    Q3 host-conformance gate uses to render all 8 fixtures by construction,
 *    so any `OODS-HOST-PATH-UNRESOLVED` diagnostic from the gate signals a
 *    real renderer-vs-emitter drift, not test-data drift.
 */

import type { A2uiMessage } from '../../codegen/a2ui-runtime-emitter.js';
import type { HostDataModel } from './types.js';

// ---------------------------------------------------------------------------
// JSON Pointer resolution
// ---------------------------------------------------------------------------

export type ResolveResult =
  | { resolved: true; value: unknown }
  | { resolved: false };

/**
 * Resolve a JSON Pointer against a data model.
 *
 * Pointer syntax (RFC 6901):
 *   - "" resolves to the whole document
 *   - "/" resolves to the empty-string key at the root
 *   - "/a/b" descends a.b
 *   - escape: ~0 → ~, ~1 → /
 *   - numeric segments index into arrays
 *
 * Mirror of the encoding produced by
 * `a2ui-runtime-emitter.fieldToJsonPointer`. Any divergence between the two
 * paths breaks the host-conformance gate by design.
 */
export function resolvePath(
  model: HostDataModel,
  pointer: string,
): ResolveResult {
  if (pointer === '') return { resolved: true, value: model };
  if (!pointer.startsWith('/')) return { resolved: false };

  const segments = pointer
    .slice(1)
    .split('/')
    .map((seg) => seg.replace(/~1/g, '/').replace(/~0/g, '~'));

  let cursor: unknown = model;
  for (const seg of segments) {
    if (cursor === null || cursor === undefined) return { resolved: false };

    if (Array.isArray(cursor)) {
      if (!/^\d+$/.test(seg)) return { resolved: false };
      const index = Number(seg);
      if (index < 0 || index >= cursor.length) return { resolved: false };
      cursor = cursor[index];
      continue;
    }

    if (typeof cursor === 'object') {
      const obj = cursor as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(obj, seg)) {
        return { resolved: false };
      }
      cursor = obj[seg];
      continue;
    }

    return { resolved: false };
  }

  return { resolved: true, value: cursor };
}

// ---------------------------------------------------------------------------
// Synthetic data model construction
// ---------------------------------------------------------------------------

/**
 * Set a JSON-Pointer-addressed leaf on a data model, creating intermediate
 * objects/arrays as needed. Used by `synthesizeDataModel` to build a model
 * where every emitted DataBinding path resolves by construction.
 *
 * Heuristic for intermediate container type: numeric segments imply arrays.
 * If a segment is non-numeric but the existing intermediate is an array, the
 * path is malformed for our use — surface as a no-op rather than throw,
 * because the harness should be robust to oddly-shaped emitted paths and
 * any genuinely malformed path will surface separately as a renderer
 * diagnostic.
 */
function setLeaf(
  model: HostDataModel,
  pointer: string,
  value: unknown,
): void {
  if (pointer === '' || !pointer.startsWith('/')) return;

  const segments = pointer
    .slice(1)
    .split('/')
    .map((seg) => seg.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (segments.length === 0) return;

  let cursor: Record<string, unknown> | unknown[] = model;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const nextSeg = segments[i + 1];
    const nextIsArray = /^\d+$/.test(nextSeg);

    if (Array.isArray(cursor)) {
      if (!/^\d+$/.test(seg)) return; // malformed; skip
      const index = Number(seg);
      let next = cursor[index];
      if (next === undefined || next === null) {
        next = nextIsArray ? [] : {};
        cursor[index] = next;
      }
      cursor = next as Record<string, unknown> | unknown[];
      continue;
    }

    const obj = cursor as Record<string, unknown>;
    let next = obj[seg];
    if (next === undefined || next === null) {
      next = nextIsArray ? [] : {};
      obj[seg] = next;
    }
    cursor = next as Record<string, unknown> | unknown[];
  }

  const last = segments[segments.length - 1];
  if (Array.isArray(cursor)) {
    if (!/^\d+$/.test(last)) return;
    cursor[Number(last)] = value;
  } else {
    (cursor as Record<string, unknown>)[last] = value;
  }
}

/**
 * Walk an emitted A2UI message stream and collect every DataBinding `path`
 * referenced by any component. Returns the deduplicated list in encounter
 * order so the synthetic data model construction is deterministic.
 */
export function collectDataBindingPaths(
  messages: ReadonlyArray<A2uiMessage>,
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const msg of messages) {
    if (!('updateComponents' in msg)) continue;
    for (const component of msg.updateComponents.components) {
      const paths = pathsForComponent(component);
      for (const p of paths) {
        if (!seen.has(p)) {
          seen.add(p);
          ordered.push(p);
        }
      }
    }
  }

  return ordered;
}

function pathsForComponent(component: unknown): string[] {
  if (!component || typeof component !== 'object') return [];
  const paths: string[] = [];
  const comp = component as Record<string, unknown>;

  // Fields known to carry DynamicString (string | DataBinding).
  for (const field of ['text', 'url', 'alt', 'label', 'value']) {
    const v = comp[field];
    if (isDataBinding(v)) paths.push(v.path);
  }
  return paths;
}

function isDataBinding(v: unknown): v is { path: string } {
  return (
    !!v &&
    typeof v === 'object' &&
    'path' in (v as Record<string, unknown>) &&
    typeof (v as { path?: unknown }).path === 'string'
  );
}

/**
 * Build a data model whose JSON Pointer targets cover every DataBinding path
 * emitted by the message stream. Each leaf is populated with a deterministic
 * placeholder string so the renderer has something to display and the
 * resolver succeeds on every path.
 *
 * Used by the Q3 host-conformance gate to guarantee that any
 * `OODS-HOST-PATH-UNRESOLVED` diagnostic indicates a real emitter/renderer
 * divergence, not a hole in the test data.
 */
export function synthesizeDataModel(
  messages: ReadonlyArray<A2uiMessage>,
  placeholder: (path: string) => unknown = (path) => `synthetic:${path}`,
): HostDataModel {
  const model: HostDataModel = {};
  const paths = collectDataBindingPaths(messages);
  for (const path of paths) setLeaf(model, path, placeholder(path));
  return model;
}
