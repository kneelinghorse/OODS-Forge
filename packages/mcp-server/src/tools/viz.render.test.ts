import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateNormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../lib/ajv.js';
import type { VizRenderInput } from '../schemas/generated.js';
import { handle } from './viz.render.js';
import { createValueRef, resolveValueRef } from './schema-ref.js';

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
