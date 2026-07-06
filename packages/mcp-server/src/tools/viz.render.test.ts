import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateNormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../lib/ajv.js';
import type { VizRenderInput } from '../schemas/generated.js';
import { handle } from './viz.render.js';
import { createValueRef, resolveValueRef } from './schema-ref.js';
import { getDefinition, isRetryable } from '../errors/registry.js';

const outputSchema = JSON.parse(
  readFileSync(new URL('../schemas/viz.render.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const inputSchema = JSON.parse(
  readFileSync(new URL('../schemas/viz.render.input.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);
const validateInput = getAjv().compile(inputSchema);

const render = (input: Record<string, unknown>) => handle(input as unknown as VizRenderInput);

const SALES = [
  { region: 'North', quarter: '2024-01', revenue: 120000 },
  { region: 'South', quarter: '2024-01', revenue: 135000 },
  { region: 'North', quarter: '2024-02', revenue: 128000 },
  { region: 'South', quarter: '2024-02', revenue: 142000 },
];

describe('viz.render handler', () => {
  it('explicit mode returns a valid, data-bound Vega-Lite spec', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });

    expect(out.status).toBe('ok');
    expect(out.mode).toBe('explicit');
    expect(out.chartType).toBe('bar');
    expect(validateOutput(out)).toBe(true);

    const spec = out.spec as Record<string, any>;
    expect(spec.mark).toMatchObject({ type: 'bar' });
    expect(spec.data.values).toHaveLength(4);
    expect(spec.data.values).toEqual(SALES); // data bound byte-equal
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
    expect(out.meta?.renderer).toBe('vega-lite');
    expect(out.meta?.mark).toBe('MarkBar');
    expect(out.meta?.rowCount).toBe(4);
    // explicit mode: no recommender suggestion
    expect(out.suggestion).toBeUndefined();
  });

  it.each(['bar', 'line', 'area', 'scatter', 'heatmap'])(
    'renders %s: output is AJV-valid and the embedded normalizedSpec passes the IR validator',
    async (chartType) => {
      const out = await render({
        rows: SALES,
        chartType,
        encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
        output: { includeNormalizedSpec: true },
      });
      expect(out.status).toBe('ok');
      expect(out.chartType).toBe(chartType);
      expect(validateOutput(out)).toBe(true);
      // the embedded IR is itself a valid NormalizedVizSpec
      expect(validateNormalizedVizSpec(out.normalizedSpec).valid).toBe(true);
      expect((out.spec as Record<string, any>).data.values).toEqual(SALES);
    },
  );

  it('defaults to compact (tokenCssRef) and omits echartsSpec', async () => {
    const out = await render({ rows: SALES, chartType: 'bar', encodings: { x: 'region', y: 'revenue' } });
    expect(out.tokenCssRef).toBe('tokens.build');
    expect(out.output?.compact).toBe(true);
    expect(out.echartsSpec).toBeUndefined();
    expect(validateOutput(out)).toBe(true);
  });

  it('compact:false omits the tokenCssRef', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: 'revenue' },
      output: { compact: false },
    });
    expect(out.tokenCssRef).toBeUndefined();
    expect(out.output?.compact).toBe(false);
    expect(validateOutput(out)).toBe(true);
  });

  it('accepts encodings.*.type and lets a caller override the inferred field type (m02 escape hatch)', async () => {
    // Before m02 an encoding object carrying `type` was AJV-REJECTED
    // (additionalProperties:false on the binding). revenue is a quantitative
    // measure; forcing it to nominal proves the schema accepts `type` AND the
    // caller override wins over the engine's inference and reaches the spec + IR.
    const input = {
      rows: SALES,
      chartType: 'scatter',
      encodings: { x: 'region', y: { field: 'revenue', type: 'nominal' } },
      output: { includeNormalizedSpec: true },
    };
    expect(validateInput(input)).toBe(true);

    const out = await render(input);
    expect(out.status).toBe('ok');
    expect((out.spec as Record<string, any>).encoding.y.type).toBe('nominal');
    expect((out.normalizedSpec as Record<string, any>).encoding.y.type).toBe('nominal');
  });

  it('echarts opt-in also returns an ECharts option', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'line',
      encodings: { x: 'quarter', y: 'revenue' },
      output: { echarts: true },
    });
    expect(out.status).toBe('ok');
    expect(out.echartsSpec).toBeTruthy();
    expect(out.output?.echarts).toBe(true);
    expect(validateOutput(out)).toBe(true);
  });

  it('includeNormalizedSpec returns the NormalizedVizSpec IR', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: 'revenue' },
      output: { includeNormalizedSpec: true },
    });
    const ir = out.normalizedSpec as Record<string, any>;
    expect(ir?.marks?.[0]?.trait).toBe('MarkBar');
    expect(validateOutput(out)).toBe(true);
  });

  it('suggest mode (no chartType) lets the recommender choose', async () => {
    const out = await render({ rows: SALES });
    expect(out.status).toBe('ok');
    expect(out.mode).toBe('suggest');
    expect(out.suggestion?.patternId).toBeTruthy();
    expect(typeof out.suggestion?.score).toBe('number');
    expect(out.meta?.inferredFields).toHaveLength(3);
    expect((out.spec as Record<string, any>).data.values).toHaveLength(4);
    expect(validateOutput(out)).toBe(true);
  });

  it('emits a specRef trio that resolves back within TTL', async () => {
    const out = await render({ rows: SALES, chartType: 'bar', encodings: { x: 'region', y: 'revenue' } });
    expect(out.specRef).toBeTruthy();
    expect(out.specRefCreatedAt).toBeTruthy();
    expect(out.specRefExpiresAt).toBeTruthy();

    const resolved = resolveValueRef(out.specRef as string);
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      // the cached value is the produced Vega-Lite spec
      expect(JSON.stringify(resolved.value)).toEqual(JSON.stringify(out.spec));
    }
  });

  it('datasetRef round-trips: a cached rows array renders the same data', async () => {
    const record = createValueRef(SALES, 'viz.render.dataset');
    const out = await render({
      datasetRef: record.ref,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });
    expect(out.status).toBe('ok');
    expect((out.spec as Record<string, any>).data.values).toEqual(SALES);
    expect(validateOutput(out)).toBe(true);
  });

  it('returns a valid error payload for an unknown datasetRef', async () => {
    const out = await render({ datasetRef: 'does-not-exist-123' });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V123');
    expect(out.spec).toEqual({});
    expect(out.warnings).toEqual([]);
    expect(validateOutput(out)).toBe(true);
  });

  it('determinism: identical input yields an identical spec', async () => {
    const a = await render({ rows: SALES });
    const b = await render({ rows: SALES });
    expect(JSON.stringify(b.spec)).toEqual(JSON.stringify(a.spec));
  });

  it('registered-path parity: the full input->handle->output round-trip against the REGISTERED schemas yields a spec byte-identical to direct handle()', async () => {
    const input = {
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    };
    // direct handler invocation (the aquex-adapter / in-process path)
    const direct = await render(input);

    // registered tool path = exactly what the dispatcher (and thus the :4466
    // bridge) does: AJV-validate the input against the registered input schema,
    // call handle, AJV-validate the output against the registered output schema.
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);

    // No serving-path drift: the spec payload is byte-identical across paths.
    // (The specRef trio is intentionally unique per call, so only the spec
    // payload itself is compared.)
    expect(JSON.stringify(dispatched.spec)).toEqual(JSON.stringify(direct.spec));
    expect(dispatched.chartType).toEqual(direct.chartType);
    expect(dispatched.a11yDescription).toEqual(direct.a11yDescription);
  });
});

// sprint-147 m03 (F5) — explicit color range validation teeth: V143 (range shorter
// than cardinality, WARN), V144 (non-hex, WARN belt), V145 (range on a surface that
// cannot consume it — FAIL-LOUD on ECharts-primary types, WARN on a continuous
// cartesian color scale), plus the schema-level guards (color-only def + hex pattern).
const THREE_REGIONS = [
  { region: 'North', value: 10 },
  { region: 'South', value: 12 },
  { region: 'East', value: 9 },
  { region: 'West', value: 7 },
];
const HIER = {
  type: 'nested' as const,
  data: { name: 'root', value: 3, children: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }] },
};

describe('viz.render handler — F5 explicit color range validation (sprint-147 m03)', () => {
  it('a valid range at/above cardinality renders clean — no range warnings, scale.range = the agent range', async () => {
    const out = await render({
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: {
        x: { field: 'region' },
        y: { field: 'value', aggregate: 'sum' },
        color: { field: 'region', type: 'nominal', range: ['#1F6FEB', '#D1242F', '#279669', '#B78827'] },
      },
    });
    expect(out.status).toBe('ok');
    expect(validateOutput(out)).toBe(true);
    expect((out.spec as Record<string, any>).encoding?.color?.scale?.range).toEqual([
      '#1F6FEB',
      '#D1242F',
      '#279669',
      '#B78827',
    ]);
    expect(out.warnings.filter((w) => w.code.startsWith('OODS-V14'))).toEqual([]);
  });

  it('V143: a range shorter than the distinct series count WARNs (colors will recycle) but still renders', async () => {
    const out = await render({
      chartType: 'bar',
      rows: THREE_REGIONS, // 4 distinct regions
      encodings: {
        x: { field: 'region' },
        y: { field: 'value', aggregate: 'sum' },
        color: { field: 'region', type: 'nominal', range: ['#1F6FEB', '#D1242F'] }, // only 2 colors
      },
    });
    expect(out.status).toBe('ok');
    const v143 = out.warnings.find((w) => w.code === 'OODS-V143');
    expect(v143).toBeDefined();
    expect(v143?.severity).toBe('warning');
    expect(v143?.message).toContain('4 distinct series');
    // The range still baked (WARN, not a block).
    expect((out.spec as Record<string, any>).encoding?.color?.scale?.range).toHaveLength(2);
    expect(isRetryable('OODS-V143')).toBe(true);
  });

  it('V144: a non-hex color WARNs on the direct-handler path (schema is the primary gate; this is the belt)', async () => {
    // handle() bypasses AJV (dispatch validates upstream) — the belt catches a non-hex
    // color that would otherwise make certify hexToRgb throw -> silent conformant:true.
    const out = await render({
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: {
        x: { field: 'region' },
        y: { field: 'value', aggregate: 'sum' },
        color: { field: 'region', type: 'nominal', range: ['#1F6FEB', 'rebeccapurple'] },
      },
    });
    expect(out.status).toBe('ok');
    const v144 = out.warnings.find((w) => w.code === 'OODS-V144');
    expect(v144).toBeDefined();
    expect(v144?.message).toContain('rebeccapurple');
  });

  it('V145 (Fork D): a color range on a treemap (ECharts-primary) FAILS LOUD — never silently dropped', async () => {
    const out = await render({
      chartType: 'treemap',
      hierarchy: HIER,
      encodings: { color: { field: 'name', type: 'nominal', range: ['#1F6FEB', '#D1242F'] } },
    });
    expect(out.status).toBe('error');
    const err = out.errors?.[0];
    expect(err?.code).toBe('OODS-V145');
    // Failure-UX bar: the error names the allowed surfaces (Meridian's praised standard).
    expect(err?.message).toContain('cartesian');
    expect(err?.message.toLowerCase()).toContain('treemap');
    expect(isRetryable('OODS-V145')).toBe(false);
  });

  it('V145 (Fork D): a color range on a sankey also fails loud (all ECharts-primary types)', async () => {
    const out = await render({
      chartType: 'sankey',
      sankey: {
        nodes: [{ name: 'a' }, { name: 'b' }],
        links: [{ source: 'a', target: 'b', value: 5 }],
      },
      encodings: { color: { field: 'name', type: 'nominal', range: ['#1F6FEB', '#D1242F'] } },
    });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V145');
  });

  it('a treemap with a color encoding but NO range still renders (V145 is range-specific, not a regression)', async () => {
    const out = await render({
      chartType: 'treemap',
      hierarchy: HIER,
      encodings: { color: { field: 'name', type: 'nominal' } },
    });
    expect(out.status).toBe('ok');
  });

  it('a range on a CONTINUOUS color scale WARNs (gradient-ignored) instead of silently dropping', async () => {
    const out = await render({
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: {
        x: { field: 'region' },
        y: { field: 'value', aggregate: 'sum' },
        color: { field: 'value', type: 'quantitative', range: ['#1F6FEB', '#D1242F'] },
      },
    });
    expect(out.status).toBe('ok');
    const v145 = out.warnings.find((w) => w.code === 'OODS-V145');
    expect(v145).toBeDefined();
    expect(v145?.severity).toBe('warning');
    expect(v145?.message).toContain('categorical');
    // The continuous scale did NOT bake the range (gradient behavior preserved).
    expect((out.spec as Record<string, any>).encoding?.color?.scale?.range).toBeUndefined();
  });

  it('schema (AJV) rejects a range on a NON-color channel — the color-only def holds (memo D-ii)', () => {
    const onColor = {
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: { x: { field: 'region' }, y: { field: 'value' }, color: { field: 'region', range: ['#111', '#eee'] } },
    };
    const onX = {
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: { x: { field: 'region', range: ['#111', '#eee'] }, y: { field: 'value' } },
    };
    expect(validateInput(onColor)).toBe(true);
    expect(validateInput(onX)).toBe(false);
  });

  it('schema (AJV) rejects a non-hex color and a single-item range (the D-iii pattern + minItems)', () => {
    const nonHex = {
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: { x: { field: 'region' }, y: { field: 'value' }, color: { field: 'region', range: ['red', '#eee'] } },
    };
    const single = {
      chartType: 'bar',
      rows: THREE_REGIONS,
      encodings: { x: { field: 'region' }, y: { field: 'value' }, color: { field: 'region', range: ['#111'] } },
    };
    expect(validateInput(nonHex)).toBe(false);
    expect(validateInput(single)).toBe(false);
  });
});

// sprint-111 m02 — treemap reaches the agent surface. Hierarchy charts are
// EXPLICIT-ONLY and ECharts-primary (no Vega-Lite equivalent): the data is the
// SEPARATE `hierarchy` branch and the renderable payload is echartsSpec, which is
// auto-promoted (returned without opting into output.echarts).
const ORG_TREE = {
  type: 'adjacency_list',
  data: [
    { id: 'co', parentId: null, value: 0, name: 'Company' },
    { id: 'eng', parentId: 'co', value: 0, name: 'Engineering' },
    { id: 'sales', parentId: 'co', value: 0, name: 'Sales' },
    { id: 'fe', parentId: 'eng', value: 12, name: 'Frontend' },
    { id: 'be', parentId: 'eng', value: 18, name: 'Backend' },
    { id: 'amer', parentId: 'sales', value: 9, name: 'AMER' },
  ],
};
const NESTED_TREE = {
  type: 'nested',
  data: { name: 'Portfolio', value: 100, children: [{ name: 'Growth', value: 60 }, { name: 'Income', value: 40 }] },
};

describe('viz.render handler — treemap (hierarchy) path', () => {
  it('renders an adjacency_list hierarchy into a renderable ECharts treemap (AJV-valid output)', async () => {
    const out = await render({ chartType: 'treemap', hierarchy: ORG_TREE });

    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('treemap');
    expect(out.mode).toBe('explicit');
    expect(validateOutput(out)).toBe(true);

    // The renderable payload is a real ECharts treemap built from the hierarchy
    // input (the root and its reparented children), not from any tabular rows.
    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('treemap');
    expect(series[0].data[0].name).toBe('Company');
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkTreemap');
    expect(out.meta?.rowCount).toBe(ORG_TREE.data.length);
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('renders a nested hierarchy as well', async () => {
    const out = await render({ chartType: 'treemap', hierarchy: NESTED_TREE, name: 'Portfolio mix' });
    expect(out.status).toBe('ok');
    expect(validateOutput(out)).toBe(true);
    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].data[0].name).toBe('Portfolio');
  });

  it('ECharts-primary: echartsSpec is auto-promoted WITHOUT opting into output.echarts; Vega-Lite spec is the empty placeholder', async () => {
    const out = await render({ chartType: 'treemap', hierarchy: ORG_TREE });
    expect(out.echartsSpec).toBeTruthy();
    expect(out.spec).toEqual({});
    expect(out.output?.echarts).toBe(true);
    expect(validateOutput(out)).toBe(true);
  });

  it('compact default returns a tokenCssRef + a resolvable specRef trio (referencing the ECharts payload)', async () => {
    const out = await render({ chartType: 'treemap', hierarchy: ORG_TREE });
    expect(out.output?.compact).toBe(true);
    expect(out.tokenCssRef).toBe('tokens.build');
    expect(out.specRef).toBeTruthy();
    expect(out.specRefCreatedAt).toBeTruthy();
    expect(out.specRefExpiresAt).toBeTruthy();
    const resolved = resolveValueRef(out.specRef as string);
    expect(resolved.ok).toBe(true);
  });

  it('input schema couples treemap with the hierarchy branch (rejects rows / missing hierarchy)', () => {
    expect(validateInput({ chartType: 'treemap', hierarchy: ORG_TREE })).toBe(true);
    expect(validateInput({ chartType: 'treemap', rows: SALES })).toBe(false);
    expect(validateInput({ chartType: 'treemap' })).toBe(false);
  });

  it('determinism: identical treemap input yields an identical echartsSpec', async () => {
    const a = await render({ chartType: 'treemap', hierarchy: ORG_TREE });
    const b = await render({ chartType: 'treemap', hierarchy: ORG_TREE });
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });

  it('registered-path parity: input/output AJV-validate and the echartsSpec is byte-identical across paths', async () => {
    const input = { chartType: 'treemap', hierarchy: ORG_TREE };
    const direct = await render(input);
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);
    expect(JSON.stringify(dispatched.echartsSpec)).toEqual(JSON.stringify(direct.echartsSpec));
    expect(dispatched.chartType).toEqual(direct.chartType);
    expect(dispatched.a11yDescription).toEqual(direct.a11yDescription);
  });
});

// sprint-111 m03 — sunburst + sankey reach the agent surface, reusing the m02
// ECharts-primary plumbing. Sunburst rides the hierarchy branch; sankey rides a new
// network/flow branch (nodes + value-weighted links).
const BUDGET_TREE = {
  type: 'nested',
  data: {
    name: 'Budget',
    value: 100,
    children: [
      { name: 'Engineering', value: 60, children: [{ name: 'Salaries', value: 50 }, { name: 'Tools', value: 10 }] },
      { name: 'Marketing', value: 40 },
    ],
  },
};
const ENERGY_FLOW = {
  nodes: [{ name: 'Coal' }, { name: 'Grid' }, { name: 'Homes' }, { name: 'Industry' }],
  links: [
    { source: 'Coal', target: 'Grid', value: 100 },
    { source: 'Grid', target: 'Homes', value: 60 },
    { source: 'Grid', target: 'Industry', value: 40 },
  ],
};

describe('viz.render handler — sunburst (hierarchy) path', () => {
  it('renders a nested hierarchy into a renderable ECharts sunburst (AJV-valid output)', async () => {
    const out = await render({ chartType: 'sunburst', hierarchy: BUDGET_TREE });
    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('sunburst');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('sunburst');
    expect(series[0].data[0].name).toBe('Budget');
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkSunburst');
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('input schema couples sunburst with the hierarchy branch', () => {
    expect(validateInput({ chartType: 'sunburst', hierarchy: BUDGET_TREE })).toBe(true);
    expect(validateInput({ chartType: 'sunburst' })).toBe(false);
    expect(validateInput({ chartType: 'sunburst', sankey: ENERGY_FLOW })).toBe(false);
  });

  it('determinism: identical sunburst input yields an identical echartsSpec', async () => {
    const a = await render({ chartType: 'sunburst', hierarchy: BUDGET_TREE });
    const b = await render({ chartType: 'sunburst', hierarchy: BUDGET_TREE });
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });
});

describe('viz.render handler — sankey (flow) path', () => {
  it('renders nodes+links into a renderable ECharts sankey (AJV-valid output)', async () => {
    const out = await render({ chartType: 'sankey', sankey: ENERGY_FLOW });
    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('sankey');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('sankey');
    expect(series[0].data).toHaveLength(4); // 4 nodes
    expect(series[0].links).toHaveLength(3);
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkSankey');
    expect(out.meta?.rowCount).toBe(4);
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('a sankey with an invalid link (no value) returns a structured error, not a crash', async () => {
    // Schema rejects this on the registered path; the handler also validates and
    // maps SankeyValidationError -> a structured error code (defense in depth).
    const out = await render({
      chartType: 'sankey',
      sankey: { nodes: [{ name: 'A' }, { name: 'B' }], links: [{ source: 'A', target: 'B', value: Number.NaN }] },
    });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V126');
    expect(validateOutput(out)).toBe(true);
  });

  it('input schema couples sankey with the sankey branch + requires link values', () => {
    expect(validateInput({ chartType: 'sankey', sankey: ENERGY_FLOW })).toBe(true);
    expect(validateInput({ chartType: 'sankey', hierarchy: BUDGET_TREE })).toBe(false);
    expect(
      validateInput({ chartType: 'sankey', sankey: { nodes: [{ name: 'A' }], links: [{ source: 'A', target: 'A' }] } }),
    ).toBe(false);
  });

  it('registered-path parity: input/output AJV-validate and the echartsSpec is byte-identical across paths', async () => {
    const input = { chartType: 'sankey', sankey: ENERGY_FLOW };
    const direct = await render(input);
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);
    expect(JSON.stringify(dispatched.echartsSpec)).toEqual(JSON.stringify(direct.echartsSpec));
  });
});

// sprint-120 m01 — chord reaches the agent surface via a NEW dedicated 'chord'
// data branch (sankey-shaped: required source/target/value). It is the 7th
// explicit-only ECharts-primary type — a native series.type:'chord' ribbon
// diagram (ring of category arcs; ribbon width = edge.value). The IR reuses
// SankeyInput; the 'network' branch stays untouched.
const TRADE_CHORD = {
  nodes: [{ name: 'AMER' }, { name: 'EMEA' }, { name: 'APAC' }],
  links: [
    { source: 'AMER', target: 'EMEA', value: 42 },
    { source: 'EMEA', target: 'APAC', value: 31 },
    { source: 'APAC', target: 'AMER', value: 25 },
  ],
};

describe('viz.render handler — chord (ring) path', () => {
  it('renders nodes+links into a renderable native ECharts chord (AJV-valid output)', async () => {
    const out = await render({ chartType: 'chord', chord: TRADE_CHORD });
    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('chord');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('chord');
    // chord lays out its own ring — it rides no cartesian/polar grid.
    expect(series[0].coordinateSystem).toBe('none');
    expect(series[0].nodes).toHaveLength(3); // 3 ring arcs
    expect(series[0].links).toHaveLength(3);
    // edges match arcs BY NAME, and value (the ribbon width) survives unprecomputed.
    expect(series[0].links[0]).toMatchObject({ source: 'AMER', target: 'EMEA', value: 42 });
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkChord');
    expect(out.meta?.rowCount).toBe(3);
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('emits a JSON-transmittable STRING tooltip formatter (no closure dropped over the wire)', async () => {
    // The critic gate: a FUNCTION formatter is dropped by JSON.parse(JSON.stringify)
    // at the render boundary AND invisible to the jsonSafe golden — chord must use a
    // string template so the custom tooltip survives transport.
    const out = await render({ chartType: 'chord', chord: TRADE_CHORD });
    expect(typeof (out.echartsSpec as Record<string, any>).tooltip.formatter).toBe('string');
  });

  it('input schema couples chord with the chord branch + requires link values', () => {
    expect(validateInput({ chartType: 'chord', chord: TRADE_CHORD })).toBe(true);
    // missing branch entirely
    expect(validateInput({ chartType: 'chord' })).toBe(false);
    // wrong branch (sankey/network do not satisfy the chord requirement)
    expect(validateInput({ chartType: 'chord', sankey: ENERGY_FLOW })).toBe(false);
    expect(validateInput({ chartType: 'chord', network: SERVICE_MAP })).toBe(false);
    // a link without a numeric value (the ribbon width) is rejected
    expect(
      validateInput({ chartType: 'chord', chord: { nodes: [{ name: 'A' }, { name: 'B' }], links: [{ source: 'A', target: 'B' }] } }),
    ).toBe(false);
  });

  it('the chord branch leaves the network branch untouched (force_graph still rejects a chord branch)', () => {
    // Proves the dedicated branch did not widen/re-gate the network coupling.
    expect(validateInput({ chartType: 'force_graph', chord: TRADE_CHORD })).toBe(false);
  });

  it('determinism: identical chord input yields an identical echartsSpec', async () => {
    const a = await render({ chartType: 'chord', chord: TRADE_CHORD });
    const b = await render({ chartType: 'chord', chord: TRADE_CHORD });
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });

  it('registered-path parity: input/output AJV-validate and the echartsSpec is byte-identical across paths', async () => {
    const input = { chartType: 'chord', chord: TRADE_CHORD };
    const direct = await render(input);
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);
    expect(JSON.stringify(dispatched.echartsSpec)).toEqual(JSON.stringify(direct.echartsSpec));
  });
});

// sprint-111 m04 — force_graph reaches the agent surface via the network branch.
// Determinism scope (mission-start audit): the OPTION (nodes/links + force params)
// is golden-able; the iterative force layout runs client-side and is out of scope.
const SERVICE_MAP = {
  nodes: [
    { id: 'web', group: 'frontend', value: 9 },
    { id: 'api', group: 'backend', value: 6 },
    { id: 'db', group: 'data' },
  ],
  links: [
    { source: 'web', target: 'api', value: 3 },
    { source: 'api', target: 'db', value: 2 },
  ],
};

describe('viz.render handler — force_graph (network) path', () => {
  it('renders nodes+links into a renderable ECharts force graph (AJV-valid output)', async () => {
    const out = await render({ chartType: 'force_graph', network: SERVICE_MAP });
    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('force_graph');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('graph');
    expect(series[0].layout).toBe('force');
    expect(series[0].data).toHaveLength(3);
    expect(series[0].links).toHaveLength(2);
    // force PARAMS are part of the deterministic option (not rendered coordinates)
    expect(series[0].force).toMatchObject({ repulsion: 100, gravity: 0.1, edgeLength: 30, friction: 0.6 });
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkGraph');
    expect(out.meta?.rowCount).toBe(3);
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('input schema couples force_graph with the network branch (rejects wrong/missing branch)', () => {
    expect(validateInput({ chartType: 'force_graph', network: SERVICE_MAP })).toBe(true);
    expect(validateInput({ chartType: 'force_graph' })).toBe(false);
    expect(validateInput({ chartType: 'force_graph', sankey: ENERGY_FLOW })).toBe(false);
    expect(validateInput({ chartType: 'force_graph', network: { nodes: [{ group: 'x' }], links: [] } })).toBe(false);
  });

  it('determinism: identical force_graph input yields an identical echartsSpec', async () => {
    const a = await render({ chartType: 'force_graph', network: SERVICE_MAP });
    const b = await render({ chartType: 'force_graph', network: SERVICE_MAP });
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });

  it('registered-path parity: input/output AJV-validate and the echartsSpec is byte-identical across paths', async () => {
    const input = { chartType: 'force_graph', network: SERVICE_MAP };
    const direct = await render(input);
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);
    expect(JSON.stringify(dispatched.echartsSpec)).toEqual(JSON.stringify(direct.echartsSpec));
  });
});

// sprint-112 m02 — choropleth + bubble_map reach the agent surface, reusing the
// ECharts-primary plumbing via the new 'geo' data branch (inline geometry + per-type
// encoding). UNLIKE the hierarchy/flow types these are NOT self-contained: the
// FeatureCollection rides back on echartsSpec.__registration so the client can
// re-register the map by name before rendering.
const US_STATES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'CA',
      properties: { region: 'CA', state_name: 'California' },
      geometry: { type: 'Polygon', coordinates: [[[-124, 32], [-114, 32], [-114, 42], [-124, 42], [-124, 32]]] },
    },
    {
      type: 'Feature',
      id: 'NV',
      properties: { region: 'NV', state_name: 'Nevada' },
      geometry: { type: 'Polygon', coordinates: [[[-120, 35], [-114, 35], [-114, 42], [-120, 42], [-120, 35]]] },
    },
  ],
};
const SALES_BY_STATE = [
  { state: 'CA', sales: 580 },
  { state: 'NV', sales: 96 },
];
const STATES_TOPO = {
  type: 'Topology',
  arcs: [[[-124, 32], [-114, 32], [-114, 42], [-124, 42], [-124, 32]]],
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [{ type: 'Polygon', properties: { region: 'CA', state_name: 'California' }, arcs: [[0]] }],
    },
  },
};
const CITIES = [
  { city: 'San Francisco', lng: -122.4, lat: 37.8, pop: 874 },
  { city: 'Las Vegas', lng: -115.1, lat: 36.2, pop: 646 },
];

describe('viz.render handler — choropleth (geo) path', () => {
  const CHORO_INPUT = {
    chartType: 'choropleth',
    geo: {
      geojson: US_STATES,
      rows: SALES_BY_STATE,
      join: { dataKey: 'state', featureProperty: 'region' },
      valueField: 'sales',
      colorScale: 'linear',
    },
    name: 'Sales by state',
  };

  it('renders a join into a renderable ECharts choropleth (series type map, AJV-valid output)', async () => {
    const out = await render(CHORO_INPUT);

    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('choropleth');
    expect(out.mode).toBe('explicit');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('map');
    // Region names from the join geoKey; values from the merged rows.
    expect(series[0].data.map((d: any) => d.name)).toEqual(['CA', 'NV']);
    expect(series[0].data.map((d: any) => d.value)).toEqual([580, 96]);
    expect(out.meta?.renderer).toBe('echarts');
    expect(out.meta?.mark).toBe('MarkChoropleth');
    expect(out.meta?.rowCount).toBe(US_STATES.features.length);
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
  });

  it('carries the FeatureCollection back on echartsSpec.__registration (NOT self-contained)', async () => {
    const out = await render(CHORO_INPUT);
    const registration = (out.echartsSpec as Record<string, any>).__registration;
    expect(registration?.geoJson?.type).toBe('FeatureCollection');
    expect(registration.geoJson.features).toHaveLength(2);
    // The join merged the tabular value into the feature so the client has it too.
    expect(registration.geoJson.features[0].properties.sales).toBe(580);
  });

  it('converts inline TopoJSON to a FeatureCollection', async () => {
    const out = await render({
      chartType: 'choropleth',
      geo: { topojson: STATES_TOPO, topoObjectName: 'states', valueField: 'sales' },
    });
    expect(out.status).toBe('ok');
    expect(validateOutput(out)).toBe(true);
    const registration = (out.echartsSpec as Record<string, any>).__registration;
    expect(registration.geoJson.features).toHaveLength(1);
    expect(registration.geoJson.features[0].properties.region).toBe('CA');
  });

  it('ECharts-primary: echartsSpec auto-promoted without output.echarts; Vega-Lite spec is the empty placeholder', async () => {
    const out = await render(CHORO_INPUT);
    expect(out.echartsSpec).toBeTruthy();
    expect(out.spec).toEqual({});
    expect(out.output?.echarts).toBe(true);
  });

  it('input schema couples choropleth with a valued geo branch (rejects rows-only / missing valueField / missing geometry)', () => {
    expect(validateInput(CHORO_INPUT)).toBe(true);
    expect(validateInput({ chartType: 'choropleth', rows: SALES_BY_STATE })).toBe(false);
    expect(validateInput({ chartType: 'choropleth', geo: { geojson: US_STATES } })).toBe(false); // no valueField
    expect(validateInput({ chartType: 'choropleth', geo: { valueField: 'sales' } })).toBe(false); // no geometry
  });

  it('defensive guard: a direct call missing valueField fails loud with OODS-V126', async () => {
    const out = await render({ chartType: 'choropleth', geo: { geojson: US_STATES } });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V126');
  });

  it('determinism: identical choropleth input yields an identical echartsSpec', async () => {
    const a = await render(CHORO_INPUT);
    const b = await render(CHORO_INPUT);
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });
});

describe('viz.render handler — bubble_map (geo) path', () => {
  const BUBBLE_INPUT = {
    chartType: 'bubble_map',
    geo: {
      geojson: US_STATES,
      rows: CITIES,
      longitudeField: 'lng',
      latitudeField: 'lat',
      sizeField: 'pop',
      colorField: 'pop',
      colorScale: 'linear',
    },
    name: 'City population',
  };

  it('renders points into a geo-anchored ECharts scatter (AJV-valid output)', async () => {
    const out = await render(BUBBLE_INPUT);

    expect(out.status).toBe('ok');
    expect(out.chartType).toBe('bubble_map');
    expect(validateOutput(out)).toBe(true);

    const series = (out.echartsSpec as Record<string, any>).series;
    expect(series[0].type).toBe('scatter');
    expect(series[0].coordinateSystem).toBe('geo');
    expect(series[0].data).toHaveLength(2);
    // value = [lng, lat, size, color]
    expect(series[0].data[0].value[0]).toBe(-122.4);
    expect(out.meta?.mark).toBe('MarkBubble');
    expect(out.meta?.rowCount).toBe(CITIES.length);
  });

  it('input schema couples bubble_map with a points-bearing geo branch (rejects missing lng/lat or rows)', () => {
    expect(validateInput(BUBBLE_INPUT)).toBe(true);
    expect(validateInput({ chartType: 'bubble_map', geo: { rows: CITIES, longitudeField: 'lng' } })).toBe(false); // no lat
    expect(validateInput({ chartType: 'bubble_map', geo: { longitudeField: 'lng', latitudeField: 'lat' } })).toBe(false); // no rows
  });

  it('determinism: identical bubble_map input yields an identical echartsSpec', async () => {
    const a = await render(BUBBLE_INPUT);
    const b = await render(BUBBLE_INPUT);
    expect(JSON.stringify(b.echartsSpec)).toEqual(JSON.stringify(a.echartsSpec));
  });
});

describe('viz error-code registry (sprint-118 m02): V123-V129 resolve, not silently degraded', () => {
  // These codes are THROWN via errorOut() across viz.render.ts (V123 :57/:74/:221; V124 :57;
  // V125 :65; V126 :158/:316; V127 :159; V128 :161/:318; V129 :163/:319) and dashboard.render.ts
  // (V129 :116), but were ABSENT from errors/registry.ts — so createError() degraded them to
  // category 'server_error' / retryable:false. Now registered: V123-V126 are recoverable input
  // problems (retryable:true); V127/V128/V129 are deterministic compile/render failures
  // (retryable:false). All stay category 'validation' (V-prefix=category invariant,
  // registry.test.ts:28-42), so the thrown code strings need no renumber. This block is
  // CI-wired via the ci.yml by-name goldens list; errors/registry.test.ts is NOT in that list.
  const EXPECTED: ReadonlyArray<readonly [string, string, boolean]> = [
    ['OODS-V123', 'validation', true],
    ['OODS-V124', 'validation', true],
    ['OODS-V125', 'validation', true],
    ['OODS-V126', 'validation', true],
    ['OODS-V127', 'validation', false],
    ['OODS-V128', 'validation', false],
    ['OODS-V129', 'validation', false],
  ];
  for (const [code, category, retryable] of EXPECTED) {
    it(`${code} is registered as category ${category} / retryable ${retryable}`, () => {
      const def = getDefinition(code);
      expect(def).toBeDefined();
      expect(def?.category).toBe(category);
      expect(def?.retryable).toBe(retryable);
      // isRetryable() reads the same registered entry — parity guard against drift.
      expect(isRetryable(code)).toBe(retryable);
    });
  }
});

// FD#10 (sprint-128 m03): structured two-part a11y (accessible table + narrative)
// surfaced over the wire under the additive, default-off output.includeA11y flag —
// for every chart family, derived from the SAME data source the chart renders from.
describe('viz.render handler — structured a11y over MCP (output.includeA11y)', () => {
  const BAR = {
    rows: SALES,
    chartType: 'bar',
    encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
  } as const;
  const CHORO = {
    chartType: 'choropleth',
    geo: {
      geojson: US_STATES,
      rows: SALES_BY_STATE,
      join: { dataKey: 'state', featureProperty: 'region' },
      valueField: 'sales',
    },
    name: 'Sales by state',
  } as const;

  const surfaces: Array<{ name: string; input: Record<string, unknown> }> = [
    { name: 'bar (cartesian)', input: { ...BAR } },
    { name: 'treemap (hierarchy)', input: { chartType: 'treemap', hierarchy: ORG_TREE } },
    { name: 'sankey (flow)', input: { chartType: 'sankey', sankey: ENERGY_FLOW } },
    { name: 'force_graph (network)', input: { chartType: 'force_graph', network: SERVICE_MAP } },
    { name: 'choropleth (geo)', input: { ...CHORO } },
  ];

  it.each(surfaces)('emits an additive, schema-valid a11y table+narrative for $name', async ({ input }) => {
    const out = await render({ ...input, output: { includeA11y: true } });
    expect(out.status).toBe('ok');
    expect(validateOutput(out)).toBe(true);
    expect(out.output?.includeA11y).toBe(true);
    expect(out.a11y).toBeDefined();
    expect((out.a11y?.narrative?.summary ?? '').length).toBeGreaterThan(0);
    expect((out.a11y?.table?.rows ?? []).length).toBeGreaterThan(0);
    expect((out.a11y?.table?.columns ?? []).length).toBeGreaterThan(0);
  });

  it.each(surfaces)('omits a11y entirely (byte-identical) when the flag is off for $name', async ({ input }) => {
    const off = await render({ ...input });
    expect(off.a11y).toBeUndefined();
    expect(off.output?.includeA11y).toBeUndefined();
  });

  it('keeps a11yDescription unchanged whether or not includeA11y is set', async () => {
    const on = await render({ chartType: 'sankey', sankey: ENERGY_FLOW, output: { includeA11y: true } });
    const off = await render({ chartType: 'sankey', sankey: ENERGY_FLOW });
    expect(on.a11yDescription).toEqual(off.a11yDescription);
  });
});
