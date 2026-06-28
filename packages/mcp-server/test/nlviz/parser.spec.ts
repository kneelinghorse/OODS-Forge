import { afterEach, describe, expect, it, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import {
  INTENT_TOOL,
  NlVizError,
  createClaudeIntentProvider,
  createReplayIntentProvider,
  normalizeIntent,
  parseTextToIntent,
} from '../../src/nlviz/index.js';

// The 5 governed measures (measure-registry.json). The parser keeps a measureRef ONLY
// for one of these — an unknown gm.* is a hard OODS-V130 at viz.render.ts:141-148.
const GOVERNED = [
  'gm.revenue.total',
  'gm.revenue.latest',
  'gm.revenue.distinct',
  'gm.export.value.total',
  'gm.export.unit_price',
];

const ROWS = [{ year: 2020, export_value: 100, country: 'Brazil', commodity: 'Soy', revenue: 5, month: 'Jan' }];

// Recorded raw provider outputs (what Claude would emit) — the offline replay corpus.
// Several are DELIBERATELY malformed to prove the parser's normalization guarantees.
const FIXTURES = new Map<string, unknown>([
  ['trend of export value over the years', { goal: 'trend', measures: [{ name: 'export_value' }], dimensions: [{ name: 'year' }], chartFamily: 'line' }],
  ['governed revenue vs target by month', { goal: 'comparison', measures: [{ name: 'revenue' }], dimensions: [{ name: 'month' }], chartFamily: 'bar', measureRef: 'gm.revenue.total' }],
  // omits `dimensions` AND carries a non-governed measureRef + an invalid field type
  ['messy request', { goal: 'trend', measures: [{ name: 'export_value', type: 'bogus' }], measureRef: 'gm.not.real' }],
  // out-of-enum goal
  ['forecast next year', { goal: 'forecast', measures: [{ name: 'export_value' }], dimensions: [] }],
  // explicit-only family (treemap) — not one of the 5 tabular marks
  ['treemap of exports by country', { goal: 'comparison', measures: [{ name: 'export_value' }], dimensions: [{ name: 'country' }], chartFamily: 'treemap' }],
]);

const replay = () => createReplayIntentProvider(FIXTURES);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('nlviz contract', () => {
  it('forces the emit_viz_intent tool with the 7-goal and 5-family enums', () => {
    expect(INTENT_TOOL.name).toBe('emit_viz_intent');
    const props = INTENT_TOOL.input_schema.properties as Record<string, { enum?: string[] }>;
    expect(props.goal.enum).toHaveLength(7);
    expect(props.goal.enum).toContain('part-to-whole');
    expect(props.chartFamily.enum).toEqual(['bar', 'line', 'area', 'scatter', 'heatmap']);
    expect(INTENT_TOOL.input_schema.required).toEqual(['goal', 'measures', 'dimensions']);
  });
});

describe('parseTextToIntent (offline replay)', () => {
  it('parses a well-formed intent and keeps goal/measures/dimensions/chartFamily', async () => {
    const intent = await parseTextToIntent('trend of export value over the years', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED });
    expect(intent).toEqual({
      goal: 'trend',
      measures: [{ name: 'export_value' }],
      dimensions: [{ name: 'year' }],
      chartFamily: 'line',
    });
  });

  it('GUARANTEE 1 — always emits measures:[] AND dimensions:[] (a missing array would TypeError at spec-builder.ts:336)', async () => {
    const intent = await parseTextToIntent('messy request', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED });
    expect(Array.isArray(intent.measures)).toBe(true);
    expect(Array.isArray(intent.dimensions)).toBe(true);
    expect(intent.dimensions).toEqual([]); // model omitted it -> defaulted, never undefined
  });

  it('GUARANTEE 2 — keeps a governed measureRef, drops an unknown gm.* (unknown = hard OODS-V130)', async () => {
    const governedIntent = await parseTextToIntent('governed revenue vs target by month', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED });
    expect(governedIntent.measureRef).toBe('gm.revenue.total');

    const droppedIntent = await parseTextToIntent('messy request', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED });
    expect(droppedIntent.measureRef).toBeUndefined(); // gm.not.real is not governed -> omitted, not passed through to V130
  });

  it('GUARANTEE 3a — throws NlVizError on an out-of-enum goal (a chart needs a valid goal)', async () => {
    await expect(parseTextToIntent('forecast next year', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED })).rejects.toBeInstanceOf(NlVizError);
  });

  it('GUARANTEE 3b — drops a non-tabular chartFamily (explicit-only types are recommender-unrankable)', async () => {
    const intent = await parseTextToIntent('treemap of exports by country', ROWS, { provider: replay(), governedMeasureRefs: GOVERNED });
    expect(intent.chartFamily).toBeUndefined(); // treemap dropped -> recommender chooses among the 5 marks
    expect(intent.goal).toBe('comparison');
  });

  it('offline replay is deterministic — same utterance, byte-identical normalized intent', async () => {
    const a = await parseTextToIntent('trend of export value over the years', ROWS, { provider: createReplayIntentProvider(FIXTURES), governedMeasureRefs: GOVERNED });
    const b = await parseTextToIntent('trend of export value over the years', ROWS, { provider: createReplayIntentProvider(FIXTURES), governedMeasureRefs: GOVERNED });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('defaults the governed allow-list to the measure registry (gm.revenue.total survives; bogus dropped)', async () => {
    // No governedMeasureRefs passed -> loaded from measure-registry.json (the 5 gm.*).
    const kept = await parseTextToIntent('governed revenue vs target by month', ROWS, { provider: replay() });
    expect(kept.measureRef).toBe('gm.revenue.total');
    const dropped = await parseTextToIntent('messy request', ROWS, { provider: replay() });
    expect(dropped.measureRef).toBeUndefined();
  });
});

describe('normalizeIntent (unit)', () => {
  it('keeps a valid field type and drops an invalid one', () => {
    const intent = normalizeIntent(
      { goal: 'trend', measures: [{ name: 'export_value', type: 'quantitative' }, { name: 'x', type: 'bogus' }], dimensions: [{ name: 'year', type: 'temporal' }] },
      GOVERNED,
    );
    expect(intent.measures).toEqual([{ name: 'export_value', type: 'quantitative' }, { name: 'x' }]);
    expect(intent.dimensions).toEqual([{ name: 'year', type: 'temporal' }]);
  });

  it('throws on a non-object output', () => {
    expect(() => normalizeIntent(null, GOVERNED)).toThrow(NlVizError);
    expect(() => normalizeIntent('nope', GOVERNED)).toThrow(NlVizError);
  });
});

describe('createClaudeIntentProvider (live path)', () => {
  it('forces tool_choice on emit_viz_intent and returns the tool input (injected client — no network)', async () => {
    let captured: Anthropic.MessageCreateParamsNonStreaming | undefined;
    const fakeClient = {
      messages: {
        create: vi.fn(async (params: Anthropic.MessageCreateParamsNonStreaming) => {
          captured = params;
          return {
            content: [{ type: 'tool_use', id: 'toolu_x', name: 'emit_viz_intent', input: { goal: 'comparison', measures: [{ name: 'revenue' }], dimensions: [{ name: 'month' }] } }],
            stop_reason: 'tool_use',
          };
        }),
      },
    } as unknown as Anthropic;

    const provider = createClaudeIntentProvider({ client: fakeClient, governedMeasureRefs: GOVERNED });
    const raw = await provider('compare revenue by month', ROWS);

    expect(raw).toEqual({ goal: 'comparison', measures: [{ name: 'revenue' }], dimensions: [{ name: 'month' }] });
    expect(captured?.model).toBe('claude-opus-4-8');
    expect(captured?.tool_choice).toEqual({ type: 'tool', name: 'emit_viz_intent' });
    // The real columns must reach the model so it can pick valid field names.
    expect(String((captured?.messages?.[0]?.content) ?? '')).toContain('export_value');
  });

  it('throws NlVizError in live mode when no API key is available', async () => {
    const saved = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const provider = createClaudeIntentProvider({ governedMeasureRefs: GOVERNED });
      await expect(provider('anything', ROWS)).rejects.toBeInstanceOf(NlVizError);
    } finally {
      if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
    }
  });
});
