// @oods/viz-render — the deterministic Vega-Lite -> SVG rendering runtime.
//
// The rendering runtime (vega + vega-lite) lives in THIS package only; @oods/viz-core
// stays the zero-runtime spec transformer (m01 seam (a)).

export { renderVegaLiteToSvg } from './emitter.js';
export type { VegaLiteSpec, RenderVegaLiteToSvgOptions } from './emitter.js';
