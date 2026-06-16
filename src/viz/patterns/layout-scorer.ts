// Re-export shim — this module moved to @oods/viz-core (sprint-109 m01 beachhead
// extraction). Kept so in-repo design-system/Storybook/test consumers stay
// source-compatible; the full consumer rewire is deferred to Phase 1 (#681).
export * from '../../../packages/viz-core/src/patterns/layout-scorer.js';
