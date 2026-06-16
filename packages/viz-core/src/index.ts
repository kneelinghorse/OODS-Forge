// @oods/viz-core — headless visualization engine (sprint-109 Phase-0 beachhead).
//
// Public surface mirrors the original src/viz/index.ts headless exports (minus
// the React hooks, which stay in src/viz) and additionally exposes the chart
// recommender so the MCP viz.render handler can consume it. The deferred
// spatial / network / echarts-complex clusters are NOT part of this beachhead
// (Phase 1).

// Spec IR + AJV validator
export * from './spec/normalized-viz-spec.js';

// Spec -> renderer adapters (pure, headless transformers)
export * from './adapters/vega-lite-adapter.js';
export * from './adapters/echarts-adapter.js';
export * from './adapters/echarts-interactions.js';
export * from './adapters/renderer-selector.js';

// Chart recommender + pattern catalogue
export * from './patterns/suggest-chart.js';
export * from './patterns/index.js';

// Headless rows -> NormalizedVizSpec builder (explicit + suggest modes)
export * from './builder/spec-builder.js';

// Accessibility synthesis (table / narrative / equivalence / data-analysis)
export * from './a11y/index.js';

// Transforms, encoding, token mapping
export * from './transforms/stack-transform.js';
export * from './encoding/color-intensity-mapper.js';
export * from './tokens/scale-token-mapper.js';
