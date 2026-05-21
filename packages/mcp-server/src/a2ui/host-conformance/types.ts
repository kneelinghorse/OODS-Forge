/**
 * Public types for the A2UI v0.9 host conformance harness (s104-m01).
 *
 * The harness validates beyond what AJV does on the emitter side: AJV proves
 * wire-shape conformance against the vendored v0.9 schemas; the harness proves
 * that a real renderer (Lit-local) can instantiate the emitted message tree
 * against a data model — DataBinding paths resolve, child/children refs bind,
 * components compose into a renderable DOM fragment.
 *
 * Per the mission-start audit (s104-m01 captured BEFORE any code), the
 * renderer surfaces RENDERER DIAGNOSTICS distinct from EMITTER WARNINGS. The
 * failing-test-file in vitest output is the side-distinction signal (emitter
 * regression vs harness drift); diagnostics here are renderer-side only.
 */

/**
 * A renderer-side diagnostic raised while instantiating an a2ui-message tree.
 *
 * - `OODS-HOST-PATH-UNRESOLVED`: a DataBinding path did not resolve against
 *   the data model (path target missing or undefined). Differs from
 *   `OODS-HOST-CHILD-DANGLING` (a ChildList/child reference pointing to a
 *   component id not present in the lookup table) — the former is data-model
 *   coverage, the latter is intra-surface integrity.
 * - `OODS-HOST-CHILD-DANGLING`: a child / children reference points to a
 *   component id with no corresponding component in the same surface. AJV
 *   permits this (refs are strings); the host catches it.
 * - `OODS-HOST-UNKNOWN-COMPONENT`: a component type not in the Forge catalog
 *   appeared in the message stream. AJV would reject this against the v0.9
 *   schema, so a non-empty list of these from the harness indicates the
 *   AJV gate has drifted from the harness's expected catalog set.
 */
export interface HostRenderDiagnostic {
  code:
    | 'OODS-HOST-PATH-UNRESOLVED'
    | 'OODS-HOST-CHILD-DANGLING'
    | 'OODS-HOST-UNKNOWN-COMPONENT';
  message: string;
  /** Component id that triggered the diagnostic, when known. */
  componentId?: string;
  /** Data-model JSON Pointer path that failed to resolve, when applicable. */
  path?: string;
}

/**
 * Result of `renderA2uiSurface` — a rendered DocumentFragment plus diagnostics.
 *
 * `fragment` is a happy-dom DocumentFragment containing the rendered tree;
 * tests inspect it via standard DOM APIs (querySelector, textContent, etc.).
 * `diagnostics` is the renderer-side list — distinct from emitter warnings,
 * which surface through the emitter's own result type.
 */
export interface HostRenderResult {
  fragment: DocumentFragment;
  diagnostics: HostRenderDiagnostic[];
  meta: {
    surfaceId: string;
    catalogId: string;
    componentsRendered: number;
  };
}

/**
 * Data model passed into the renderer. JSON Pointers from emitted DataBindings
 * resolve against this shape. Plain JSON — no Map / Set / Date.
 */
export type HostDataModel = Record<string, unknown>;
