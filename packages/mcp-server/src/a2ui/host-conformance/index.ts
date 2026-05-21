/**
 * A2UI v0.9 host conformance harness — Lit-local renderer (s104-m01).
 *
 * Public surface for the conformance gate. The harness is a build-time gate
 * (runs in vitest) — not an agent-callable MCP tool. Its description is
 * "Lit local conformance gate; ADK A2uiSchemaManager is the future
 * env-gated upgrade per s104-m01 planning decision."
 */

export {
  renderA2uiSurface,
  isAcceptedCatalogId,
  HOST_EXPECTED_CATALOG_ID,
} from './adapter.js';
export {
  resolvePath,
  collectDataBindingPaths,
  synthesizeDataModel,
  type ResolveResult,
} from './data-model.js';
export type {
  HostDataModel,
  HostRenderDiagnostic,
  HostRenderResult,
} from './types.js';
