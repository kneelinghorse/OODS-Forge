// NL→viz free-text half (sprint-132 m02) — public surface. Imported by m03's
// viz.fromText tool and m04's accuracy eval harness. The parser sits ABOVE the
// deterministic viz.render boundary; nothing here changes viz-core or viz.render.
export { parseTextToIntent, normalizeIntent, type ParseOptions } from './parser.js';
export {
  createClaudeIntentProvider,
  createReplayIntentProvider,
  type ClaudeProviderOptions,
} from './claude-provider.js';
export {
  DEFAULT_MODEL,
  INTENT_TOOL,
  INTENT_GOALS,
  CHART_FAMILIES,
  FIELD_TYPES,
  NlVizError,
  type IntentProvider,
} from './intent-contract.js';
