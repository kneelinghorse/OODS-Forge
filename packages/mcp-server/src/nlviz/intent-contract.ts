// NL→viz FREE-TEXT half (sprint-132 m02) — the contract the Claude parser sits
// ABOVE the deterministic viz.render boundary to satisfy. The parser emits the
// FROZEN s131 `StructuredIntent` (no viz-core change); this module pins the
// enum vocabularies, the forced tool-use shape the model fills, and the prompts.
// The LLM lives strictly ABOVE viz.render — viz.render.handle() never calls it.
import type Anthropic from '@anthropic-ai/sdk';
import type { IntentGoal, IntentChartFamily, FieldType } from '@oods/viz-core';

/** Default Claude model — the bare current-Opus id, NO date suffix (house policy). */
export const DEFAULT_MODEL = 'claude-opus-4-8';

/** The LIVE 7-value `IntentGoal` union (viz-core patterns/index.ts). */
export const INTENT_GOALS: readonly IntentGoal[] = [
  'comparison',
  'trend',
  'composition',
  'part-to-whole',
  'relationship',
  'intensity',
  'distribution',
];

/** The 5 TABULAR chart families the recommender can rank (the explicit-only types are rejected). */
export const CHART_FAMILIES: readonly IntentChartFamily[] = ['bar', 'line', 'area', 'scatter', 'heatmap'];

/** The optional v0.1 field-type hint vocabulary (reserved; types infer from data). */
export const FIELD_TYPES: readonly FieldType[] = ['quantitative', 'temporal', 'nominal', 'ordinal'];

export function isIntentGoal(x: unknown): x is IntentGoal {
  return typeof x === 'string' && (INTENT_GOALS as readonly string[]).includes(x);
}
export function isChartFamily(x: unknown): x is IntentChartFamily {
  return typeof x === 'string' && (CHART_FAMILIES as readonly string[]).includes(x);
}
export function isFieldType(x: unknown): x is FieldType {
  return typeof x === 'string' && (FIELD_TYPES as readonly string[]).includes(x);
}

/**
 * Raised by the provider/parser when the free-text→intent step cannot produce a
 * usable structured intent (no tool call returned, missing API key in live mode,
 * malformed output, out-of-enum goal). Fail loud — never a silent fallback.
 */
export class NlVizError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NlVizError';
  }
}

/** The provider contract: free-text + rows -> the RAW (pre-normalization) tool input. */
export type IntentProvider = (
  text: string,
  rows: ReadonlyArray<Record<string, unknown>>,
) => Promise<unknown>;

/**
 * The forced tool the model fills. Its `input_schema` MIRRORS the `intent` block of
 * viz.render.input.json (7-goal enum, 5-mark family, named measures/dimensions, the
 * governed `^gm\.` measureRef) — but the AJV boundary at viz.render stays the
 * authoritative validator; the parser additionally normalizes the output (see
 * parser.ts). `strict` is intentionally NOT set: forced `tool_choice` plus the
 * downstream AJV gate make it unnecessary and avoid pattern/optional edge cases.
 */
export const INTENT_TOOL: Anthropic.Tool = {
  name: 'emit_viz_intent',
  description:
    'Emit the structured visualization intent for a natural-language chart request. ' +
    'Always call this tool; never answer in prose.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['goal', 'measures', 'dimensions'],
    properties: {
      goal: {
        type: 'string',
        enum: [...INTENT_GOALS],
        description: 'The single best analytical goal for the request.',
      },
      measures: {
        type: 'array',
        description: 'Numeric metric column(s) to plot. Always include at least one. Use EXACT dataset column names.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
            type: { type: 'string', enum: [...FIELD_TYPES] },
          },
        },
      },
      dimensions: {
        type: 'array',
        description: 'Breakdown/axis column(s) (time or category). Empty array if none apply. Use EXACT dataset column names.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
            type: { type: 'string', enum: [...FIELD_TYPES] },
          },
        },
      },
      chartFamily: {
        type: 'string',
        enum: [...CHART_FAMILIES],
        description: 'Optional. Only set when the request names or strongly implies a chart type; otherwise omit.',
      },
      measureRef: {
        type: 'string',
        description:
          'Optional governed-measure reference (gm.*). Set ONLY to one of the provided governed measures, and only ' +
          'when the request clearly refers to that governed metric; otherwise omit.',
      },
    },
  },
};

export const SYSTEM_PROMPT = [
  'You translate a natural-language data-visualization request into a STRUCTURED chart intent by calling the',
  `${INTENT_TOOL.name} tool — never answer in free prose.`,
  'Rules:',
  '- goal: pick the single best analytical goal from the allowed values.',
  '- measures: the numeric metric column(s) to plot. ALWAYS include at least one. Use EXACT column names from the provided dataset columns.',
  '- dimensions: the breakdown/axis column(s) (e.g. time or category). Use EXACT column names; use an empty array if none apply.',
  '- chartFamily: optional. Only set it when the request names or strongly implies a chart type; otherwise omit it and let the recommender choose.',
  '- measureRef: optional. Set it ONLY to one of the provided governed measures, and only when the request clearly refers to that governed metric. Otherwise omit it.',
  'Only choose column names from the provided columns; never invent a column.',
].join('\n');

/** Build the per-request user prompt: the request + the real columns + the governed-measure allow-list. */
export function buildUserPrompt(
  text: string,
  rows: ReadonlyArray<Record<string, unknown>>,
  governedMeasureRefs: ReadonlyArray<string>,
): string {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return [
    `Request: ${text}`,
    '',
    `Dataset columns (use these EXACT names for measures and dimensions): ${columns.length > 0 ? columns.join(', ') : '(none provided)'}`,
    governedMeasureRefs.length > 0
      ? `Governed measures (set measureRef ONLY to one of these, when the request clearly refers to it; otherwise omit): ${governedMeasureRefs.join(', ')}`
      : 'Governed measures: (none available — do not set measureRef)',
    '',
    `Call ${INTENT_TOOL.name} with the structured intent.`,
  ].join('\n');
}
