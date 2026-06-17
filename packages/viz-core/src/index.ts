// @oods/viz-core — headless visualization engine (sprint-109 Phase-0 beachhead).
//
// Public surface mirrors the original src/viz/index.ts headless exports (minus
// the React hooks, which stay in src/viz) and additionally exposes the chart
// recommender so the MCP viz.render handler can consume it. The deferred
// spatial / network / echarts-complex clusters are NOT part of this beachhead
// (Phase 1).

// Spec IR + AJV validator
export * from './spec/normalized-viz-spec.js';

// Network/hierarchy data contracts (treemap/sunburst/force/sankey inputs).
// These are carried as the SEPARATE adapter `input` param — decoupled from the IR.
export * from './spec/network-flow.js';

// Spec -> renderer adapters (pure, headless transformers)
export * from './adapters/vega-lite-adapter.js';
export * from './adapters/echarts-adapter.js';
export * from './adapters/echarts-interactions.js';
export * from './adapters/renderer-selector.js';

// Network/hierarchy ECharts adapters (sprint-111). Explicit-only types that build
// their ECharts series from the input data param, not the IR.
export * from './adapters/echarts/token-resolver.js';
export * from './adapters/echarts/hierarchy-utils.js';
export * from './adapters/echarts/treemap-adapter.js';
export * from './adapters/echarts/sunburst-adapter.js';
export * from './adapters/echarts/sankey-utils.js';
export * from './adapters/echarts/sankey-adapter.js';
export * from './adapters/echarts/graph-adapter.js';

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
