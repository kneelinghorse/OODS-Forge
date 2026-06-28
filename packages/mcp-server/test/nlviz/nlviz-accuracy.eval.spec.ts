// nvBench-style NL→viz ACCURACY EVAL gate (sprint-132 m04) — the governance surface
// that makes the non-deterministic LLM parser measurable.
//
// REPORT-ONLY posture (the DSV-045 split's honesty check): the harness computes +
// LOGS chartType-accuracy (primary) and schema-validity (the >5%-invalid alarm). It
// does NOT gate the build on the LLM's accuracy — the report-only→blocking threshold
// flip is deferred to s133+ (Derek picks the number). Two modes:
//   - OFFLINE fixture-replay (DEFAULT): the "parse" replays each case's LABEL, so the
//     pipeline (normalizeIntent → viz.render) is exercised deterministically. The
//     offline asserts below are CORPUS-INTEGRITY checks (every label schema-valid and
//     → its expected chartType; every thin-goal negative fails loud) — they are NOT the
//     LLM accuracy threshold, and they are deterministic so they never flake.
//   - LIVE (opt-in, NLVIZ_EVAL_LIVE=1): a real Claude parse; metrics are LOGGED ONLY
//     (report-only — no threshold assertion). This is the scheduled/labeled accuracy run.
//
// PLACEMENT: under test/ as a *.spec.ts so the ROOT vitest 'core' project picks it up,
// named OUTSIDE the ci-golden-list guard regex /^(viz\.render|dashboard\.render)…/, and
// NOT in the viz-determinism colocated run-string (ci.yml). It runs in its OWN
// nlviz-accuracy CI job (the seam where the threshold flip + the live run land).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAjv } from '../../src/lib/ajv.js';
import type { VizRenderInput } from '../../src/schemas/generated.js';
import { handle as vizRenderHandle } from '../../src/tools/viz.render.js';
import {
  createClaudeIntentProvider,
  createReplayIntentProvider,
  parseTextToIntent,
  NlVizError,
  type IntentProvider,
} from '../../src/nlviz/index.js';
import { TRADEFLOW_ROWS, EXPORT_VALUE_TIMESERIES } from '../../src/tools/__fixtures__/faostat-tradeflow.fixture.js';

const TF = TRADEFLOW_ROWS as unknown as Array<Record<string, unknown>>; // cross-sectional 2023 corridors
const TS = EXPORT_VALUE_TIMESERIES as unknown as Array<Record<string, unknown>>; // multi-year (2019-2023)
const GOVERNED = ['gm.revenue.total', 'gm.revenue.latest', 'gm.revenue.distinct', 'gm.export.value.total', 'gm.export.unit_price'];

interface EvalCase {
  id: string;
  utterance: string;
  intent: Record<string, unknown>; // the LABEL — the ideal intent the parser should emit
  rows: Array<Record<string, unknown>>;
  expectedChartType?: string; // present for positives; absent for thin-goal negatives (fail-loud)
}

// ~Few-dozen labeled NL→intent pairs over the 5 tabular marks + thin-goal negatives. Data
// side reused from the s118 FAOSTAT fixture; the labeled NL side is net-new. This table is
// the s133-extensible corpus (utterance → expected-intent → expected-chartType).
const CASES: EvalCase[] = [
  // --- bar (comparison / part-to-whole / distribution) ---
  { id: 'bar-cmp-reporter', utterance: 'Compare total export value by reporter country', intent: { goal: 'comparison', measures: [{ name: 'value' }], dimensions: [{ name: 'reporter' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  { id: 'bar-cmp-partner', utterance: 'Compare export value across partner countries', intent: { goal: 'comparison', measures: [{ name: 'value' }], dimensions: [{ name: 'partner' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  { id: 'bar-ptw-commodity', utterance: "Show each commodity's share of total export value", intent: { goal: 'part-to-whole', measures: [{ name: 'value' }], dimensions: [{ name: 'commodity' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  { id: 'bar-dist-commodity', utterance: 'Bar chart of export value by commodity', intent: { goal: 'distribution', measures: [{ name: 'value' }], dimensions: [{ name: 'commodity' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  { id: 'bar-cmp-governed-value', utterance: 'Compare the governed total export value by partner', intent: { goal: 'comparison', measures: [{ name: 'value' }], dimensions: [{ name: 'partner' }], chartFamily: 'bar', measureRef: 'gm.export.value.total' }, rows: TF, expectedChartType: 'bar' },
  { id: 'bar-cmp-governed-price', utterance: 'Compare the governed export unit price by commodity', intent: { goal: 'comparison', measures: [{ name: 'unit_price' }], dimensions: [{ name: 'commodity' }], chartFamily: 'bar', measureRef: 'gm.export.unit_price' }, rows: TF, expectedChartType: 'bar' },
  // --- line (trend) ---
  { id: 'line-trend-value', utterance: 'Show the export value trend over the years', intent: { goal: 'trend', measures: [{ name: 'value' }], dimensions: [{ name: 'year' }], chartFamily: 'line' }, rows: TS, expectedChartType: 'line' },
  { id: 'line-trend-qty', utterance: 'Plot export quantity by year as a line', intent: { goal: 'trend', measures: [{ name: 'quantity' }], dimensions: [{ name: 'year' }], chartFamily: 'line' }, rows: TS, expectedChartType: 'line' },
  { id: 'line-trend-yoy', utterance: 'How has export value changed year over year', intent: { goal: 'trend', measures: [{ name: 'value' }], dimensions: [{ name: 'year' }], chartFamily: 'line' }, rows: TS, expectedChartType: 'line' },
  // --- area (trend / composition) ---
  { id: 'area-trend-value', utterance: 'Show export value over time as a filled area', intent: { goal: 'trend', measures: [{ name: 'value' }], dimensions: [{ name: 'year' }], chartFamily: 'area' }, rows: TS, expectedChartType: 'area' },
  { id: 'area-comp-qty', utterance: 'Filled area of export quantity over the years', intent: { goal: 'composition', measures: [{ name: 'quantity' }], dimensions: [{ name: 'year' }], chartFamily: 'area' }, rows: TS, expectedChartType: 'area' },
  // --- scatter (relationship) ---
  { id: 'scatter-value-qty', utterance: 'Plot export value against quantity to see the relationship', intent: { goal: 'relationship', measures: [{ name: 'value' }, { name: 'quantity' }], dimensions: [], chartFamily: 'scatter' }, rows: TF, expectedChartType: 'scatter' },
  { id: 'scatter-value-price', utterance: 'Scatter of export value versus unit price', intent: { goal: 'relationship', measures: [{ name: 'value' }, { name: 'unit_price' }], dimensions: [], chartFamily: 'scatter' }, rows: TF, expectedChartType: 'scatter' },
  { id: 'scatter-value-shipqty', utterance: 'Relationship between export value and shipment quantity', intent: { goal: 'relationship', measures: [{ name: 'value' }, { name: 'shipment_qty' }], dimensions: [], chartFamily: 'scatter' }, rows: TF, expectedChartType: 'scatter' },
  // --- heatmap (intensity) ---
  { id: 'heatmap-reporter-commodity', utterance: 'Heatmap of export value by reporter and commodity', intent: { goal: 'intensity', measures: [{ name: 'value' }], dimensions: [{ name: 'reporter' }, { name: 'commodity' }], chartFamily: 'heatmap' }, rows: TF, expectedChartType: 'heatmap' },
  { id: 'heatmap-reporter-partner', utterance: 'Show intensity of export value across reporter and partner', intent: { goal: 'intensity', measures: [{ name: 'value' }], dimensions: [{ name: 'reporter' }, { name: 'partner' }], chartFamily: 'heatmap' }, rows: TF, expectedChartType: 'heatmap' },
  { id: 'heatmap-commodity-partner', utterance: 'Heatmap of export value by commodity and partner', intent: { goal: 'intensity', measures: [{ name: 'value' }], dimensions: [{ name: 'commodity' }, { name: 'partner' }], chartFamily: 'heatmap' }, rows: TF, expectedChartType: 'heatmap' },
  // --- a few more positives for breadth ---
  { id: 'bar-cmp-quantity', utterance: 'Compare export quantity by reporter', intent: { goal: 'comparison', measures: [{ name: 'quantity' }], dimensions: [{ name: 'reporter' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  { id: 'line-trend-value-alt', utterance: 'Trend line of yearly export value', intent: { goal: 'trend', measures: [{ name: 'value' }], dimensions: [{ name: 'year' }], chartFamily: 'line' }, rows: TS, expectedChartType: 'line' },
  { id: 'bar-ptw-reporter', utterance: 'Share of total export value by reporter', intent: { goal: 'part-to-whole', measures: [{ name: 'value' }], dimensions: [{ name: 'reporter' }], chartFamily: 'bar' }, rows: TF, expectedChartType: 'bar' },
  // --- thin-goal NEGATIVES (insufficient fields → fail loud, not a chart) ---
  { id: 'neg-show-data', utterance: 'Just show me the data', intent: { goal: 'distribution', measures: [], dimensions: [] }, rows: TF },
  { id: 'neg-how-intense', utterance: 'How intense is the trade', intent: { goal: 'intensity', measures: [], dimensions: [] }, rows: TF },
  { id: 'neg-give-chart', utterance: 'Give me a chart', intent: { goal: 'comparison', measures: [], dimensions: [] }, rows: TF },
  { id: 'neg-dim-only', utterance: 'Break it down by commodity', intent: { goal: 'distribution', measures: [], dimensions: [{ name: 'commodity' }] }, rows: TF },
];

const REPLAY = createReplayIntentProvider(new Map<string, unknown>(CASES.map((c) => [c.utterance, c.intent])));

const vizRenderInputSchema = JSON.parse(
  readFileSync(new URL('../../src/schemas/viz.render.input.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateVizRenderInput = getAjv().compile(vizRenderInputSchema);

const LIVE = process.env.NLVIZ_EVAL_LIVE === '1';

async function safeParse(utterance: string, rows: Array<Record<string, unknown>>, provider: IntentProvider) {
  try {
    return await parseTextToIntent(utterance, rows, { provider, governedMeasureRefs: GOVERNED });
  } catch (e) {
    if (e instanceof NlVizError) return null; // an out-of-enum/unparseable result counts as schema-invalid
    throw e;
  }
}

describe('NL→viz accuracy eval (nvBench-style, REPORT-ONLY)', () => {
  it(`computes chartType-accuracy + schema-validity over ${CASES.length} labeled cases [${LIVE ? 'LIVE' : 'offline replay'}]`, async () => {
    const provider: IntentProvider = LIVE ? createClaudeIntentProvider({ governedMeasureRefs: GOVERNED }) : REPLAY;
    let positives = 0;
    let correct = 0;
    let schemaValidPos = 0;
    let negatives = 0;
    let failLoud = 0;
    const misses: string[] = [];

    for (const c of CASES) {
      const parsed = await safeParse(c.utterance, c.rows, provider);
      const valid = parsed != null && (validateVizRenderInput({ intent: parsed, rows: c.rows }) as boolean);
      if (c.expectedChartType) {
        positives++;
        if (valid && parsed) {
          schemaValidPos++;
          const out = await vizRenderHandle({ intent: parsed, rows: c.rows } as unknown as VizRenderInput);
          if (out.chartType === c.expectedChartType) correct++;
          else misses.push(`${c.id}: chartType=${String(out.chartType)} want ${c.expectedChartType}`);
        } else {
          misses.push(`${c.id}: parsed intent is schema-invalid (expected a ${c.expectedChartType} chart)`);
        }
      } else {
        negatives++;
        if (!valid) failLoud++;
        else misses.push(`${c.id}: thin-goal negative did NOT fail loud`);
      }
    }

    const accuracy = positives ? correct / positives : 0;
    const schemaValidity = positives ? schemaValidPos / positives : 0;
    const failLoudRate = negatives ? failLoud / negatives : 0;

    // REPORT (always — the governance surface). The threshold flip is deferred (report-only).
    // eslint-disable-next-line no-console
    console.log(
      `[nlviz-accuracy] mode=${LIVE ? 'live' : 'offline'} cases=${CASES.length} positives=${positives} ` +
        `chartTypeAccuracy=${(accuracy * 100).toFixed(1)}% schemaValidity=${(schemaValidity * 100).toFixed(1)}% ` +
        `(>5%-invalid alarm=${schemaValidity < 0.95 ? 'TRIPPED' : 'clear'}) negatives=${negatives} failLoud=${(failLoudRate * 100).toFixed(1)}%`,
    );
    if (misses.length) {
      // eslint-disable-next-line no-console
      console.log(`[nlviz-accuracy] misses:\n  ${misses.join('\n  ')}`);
    }

    // Structural floor (always): the corpus ran and is non-trivial.
    expect(CASES.length).toBeGreaterThanOrEqual(20);
    expect(positives).toBeGreaterThanOrEqual(15);
    expect(negatives).toBeGreaterThanOrEqual(3);

    if (!LIVE) {
      // OFFLINE is DETERMINISTIC: assert CORPUS INTEGRITY (every label schema-valid and →
      // its expected chartType; every negative fails loud). This catches corpus rot — it is
      // NOT the LLM accuracy threshold, which is the deferred report-only→blocking flip.
      expect(misses).toEqual([]);
      expect(accuracy).toBe(1);
      expect(schemaValidity).toBe(1);
      expect(failLoudRate).toBe(1);
    }
    // LIVE: REPORT-ONLY — metrics logged above; no accuracy threshold asserted (deferred).
  });
});
