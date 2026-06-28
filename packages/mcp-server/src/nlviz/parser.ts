// The free-text -> StructuredIntent parser (sprint-132 m02). Sits ABOVE the
// viz.render boundary: it calls a provider for the raw intent, then NORMALIZES it to
// the FROZEN s131 StructuredIntent, enforcing the three critic-verified guarantees so
// the result survives the viz.render AJV gate (never call buildFromIntent raw):
//   1. ALWAYS emit measures:[] AND dimensions:[] — buildFromIntent spreads both raw
//      (spec-builder.ts:336); a missing array throws a TypeError before any gate.
//   2. measureRef ONLY for a KNOWN governed gm.* — an unknown ref is a hard OODS-V130
//      regardless of includeA11y (viz.render.ts:141-148); drop it rather than guess.
//   3. goal constrained to the 7 IntentGoal values; chartFamily to the 5 tabular marks.
import type { StructuredIntent, IntentField } from '@oods/viz-core';
import { loadMeasureRegistry } from '../tools/measure-registry.js';
import { createClaudeIntentProvider } from './claude-provider.js';
import { INTENT_GOALS, isChartFamily, isFieldType, NlVizError, type IntentProvider } from './intent-contract.js';

export interface ParseOptions {
  /** The provider to use. Defaults to a live Claude provider (governed set auto-loaded from the registry). */
  provider?: IntentProvider;
  /** The governed `gm.*` allow-list. Defaults to the keys of the loaded measure registry. */
  governedMeasureRefs?: ReadonlyArray<string>;
}

/**
 * Parse a free-text utterance + its dataset rows into a governed `StructuredIntent`.
 * The parse is ADVISORY/non-deterministic (it calls the LLM provider); the returned
 * intent is meant to be routed through viz.render (which validates + renders
 * deterministically) and echoed so the agent can re-run viz.render(intent).
 */
export async function parseTextToIntent(
  text: string,
  rows: ReadonlyArray<Record<string, unknown>>,
  opts: ParseOptions = {},
): Promise<StructuredIntent> {
  const governed = opts.governedMeasureRefs ?? Array.from(loadMeasureRegistry().keys());
  const provider = opts.provider ?? createClaudeIntentProvider({ governedMeasureRefs: governed });
  const raw = await provider(text, rows);
  return normalizeIntent(raw, governed);
}

/**
 * Coerce a raw provider output into a valid `StructuredIntent`, enforcing the three
 * guarantees above. Throws `NlVizError` only when the goal is unusable (missing /
 * out-of-enum) — a chart cannot be built without a goal. Everything else degrades
 * safely: unknown fields dropped, missing arrays defaulted to [], a non-governed or
 * non-tabular value omitted.
 */
export function normalizeIntent(raw: unknown, governedMeasureRefs: ReadonlyArray<string>): StructuredIntent {
  if (typeof raw !== 'object' || raw === null) {
    throw new NlVizError(`parser output is not an object: ${JSON.stringify(raw)}`);
  }
  const obj = raw as Record<string, unknown>;

  // Guarantee 3 (goal): the 7 IntentGoal values, fail loud otherwise.
  if (!(typeof obj.goal === 'string' && (INTENT_GOALS as readonly string[]).includes(obj.goal))) {
    throw new NlVizError(
      `parser emitted an out-of-enum goal ${JSON.stringify(obj.goal)} (allowed: ${INTENT_GOALS.join(', ')}).`,
    );
  }

  const intent: StructuredIntent = {
    goal: obj.goal as StructuredIntent['goal'],
    // Guarantee 1: ALWAYS arrays (never omit) — empty if the model omitted them.
    measures: normalizeFields(obj.measures),
    dimensions: normalizeFields(obj.dimensions),
    // Guarantee 3 (family): keep only a valid tabular mark; otherwise omit (recommender chooses).
    ...(isChartFamily(obj.chartFamily) ? { chartFamily: obj.chartFamily } : {}),
    // Guarantee 2: keep measureRef only for a KNOWN governed gm.* entry.
    ...(typeof obj.measureRef === 'string' && governedMeasureRefs.includes(obj.measureRef)
      ? { measureRef: obj.measureRef }
      : {}),
  };
  return intent;
}

/** Coerce a raw measures/dimensions value into well-formed IntentField[] (always an array). */
function normalizeFields(raw: unknown): IntentField[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: IntentField[] = [];
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const name = (item as Record<string, unknown>).name;
      if (typeof name === 'string' && name.length > 0) {
        const type = (item as Record<string, unknown>).type;
        out.push(isFieldType(type) ? { name, type } : { name });
      }
    }
  }
  return out;
}
