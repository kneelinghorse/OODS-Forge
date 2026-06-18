import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAjv } from '../lib/ajv.js';
import type { DashboardRenderInput } from '../schemas/generated.js';
import { handle } from './dashboard.render.js';

// Reconstruct the server boundary in-test: compile the SAME schema JSONs the
// dispatch loop uses with the SAME getAjv() instance, call handle() directly.
const inputSchema = JSON.parse(readFileSync(new URL('../schemas/dashboard.render.input.json', import.meta.url), 'utf8'));
const outputSchema = JSON.parse(readFileSync(new URL('../schemas/dashboard.render.output.json', import.meta.url), 'utf8'));
const validateInput = getAjv().compile(inputSchema);
const validateOutput = getAjv().compile(outputSchema);

const SALES = [
  { region: 'West', month: 'Jan', revenue: 100 },
  { region: 'East', month: 'Jan', revenue: 80 },
  { region: 'West', month: 'Feb', revenue: 120 },
  { region: 'East', month: 'Feb', revenue: 90 },
];

const GEO = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'West' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] } },
    { type: 'Feature', properties: { name: 'East' }, geometry: { type: 'Polygon', coordinates: [[[2, 0], [4, 0], [4, 2], [2, 2], [2, 0]]] } },
  ],
};

function metricOverview(extra: Partial<Record<string, unknown>> = {}): DashboardRenderInput {
  return {
    schemaVersion: 'v0.1',
    title: 'Revenue Overview',
    datasets: [{ id: 'sales', rows: SALES }],
    panels: [
      { id: 'kpi-rev', kind: 'kpi', title: 'Total Revenue', datasetId: 'sales', field: 'revenue', aggregate: 'sum', comparison: { basis: 'target', value: 300 }, threshold: { direction: 'above', value: 350 } },
      { id: 'trend', kind: 'chart', chartType: 'line', datasetId: 'sales', encodings: { x: 'month', y: { field: 'revenue', aggregate: 'sum' } } },
      { id: 'breakdown', kind: 'chart', chartType: 'bar', datasetId: 'sales', encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } } },
      { id: 'geo', kind: 'chart', chartType: 'choropleth', geo: { geojson: GEO, valueField: 'revenue', join: { dataKey: 'region', featureProperty: 'name' }, rows: [{ region: 'West', revenue: 220 }, { region: 'East', revenue: 170 }] } },
    ],
    layout: { columns: 12, placements: [{ panelId: 'kpi-rev', gridSpan: 3 }] },
    links: [{ source: 'breakdown', target: 'trend', sourceField: 'region', operator: 'in' }],
    a11y: { description: 'Revenue overview dashboard.', readingOrder: 'kpi-first' },
    ...extra,
  } as DashboardRenderInput;
}

describe('dashboard.render', () => {
  it('the metric-overview IR is AJV-valid against the registered input schema', () => {
    expect(validateInput(metricOverview())).toBe(true);
  });

  it('composes a renderable, AJV-valid metric-overview dashboard', async () => {
    const out = await handle(metricOverview());
    expect(validateOutput(out)).toBe(true);
    expect(out.status).toBe('ok');
    expect(out.panels).toHaveLength(4);

    const byId = Object.fromEntries(out.panels.map((p) => [p.id, p]));

    // KPI panel — sum 390, target 300 -> delta +90, breaches the 350 threshold.
    const kpi = byId['kpi-rev'] as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.kind).toBe('kpi');
    expect(kpi.value).toBe(390);
    expect(kpi.delta).toBe(90);
    expect(kpi.trendDirection).toBe('increasing');
    expect(kpi.thresholdBreached).toBe(true);

    // tabular chart panels -> Vega-Lite specs.
    const trend = byId['trend'] as Extract<typeof out.panels[number], { kind: 'chart' }>;
    expect(trend.kind).toBe('chart');
    expect(trend.renderer).toBe('vega-lite');
    expect(trend.spec).toBeDefined();

    // geo panel -> ECharts option with the FeatureCollection preserved on __registration.
    const geo = byId['geo'] as Extract<typeof out.panels[number], { kind: 'chart' }>;
    expect(geo.renderer).toBe('echarts');
    expect(geo.echartsSpec).toBeDefined();
    expect((geo.echartsSpec as Record<string, unknown>).__registration).toBeDefined();
  });

  it('resolves a deterministic KPI-first layout honoring per-panel gridSpan', async () => {
    const out = await handle(metricOverview());
    const layout = Object.fromEntries((out.layout ?? []).map((p) => [p.id, p]));
    expect(layout['kpi-rev']).toMatchObject({ x: 0, y: 0, w: 3 }); // gridSpan 3, KPI row first
    expect(out.a11y.panelOrder?.[0]).toBe('kpi-rev');
    expect(out.specRef).toMatch(/^dashboard\.render-/);
  });

  it('applies an active cross-filter selection to dependent panels (skip-self, AND)', async () => {
    const selection = { breakdown: { sourceWidgetId: 'breakdown', dimension: 'region', values: ['West'], kind: 'categorical' } };
    const out = await handle(metricOverview({ selection }));
    expect(validateOutput(out)).toBe(true);
    expect(out.meta?.crossFiltered).toBe(true);
    // KPI is cross-filtered to West (100 + 120 = 220), down from the unfiltered 390.
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.value).toBe(220);
  });

  it('renders a failed panel as an a11y-described error placeholder (SEAM b default)', async () => {
    const ir = metricOverview();
    (ir.panels as Array<Record<string, unknown>>).push({ id: 'broken', kind: 'chart', chartType: 'bar', datasetId: 'does-not-exist', encodings: { x: 'region', y: 'revenue' } });
    const out = await handle(ir);
    expect(validateOutput(out)).toBe(true);
    expect(out.status).toBe('ok'); // the dashboard is NOT voided
    const broken = out.panels.find((p) => p.id === 'broken') as Extract<typeof out.panels[number], { kind: 'error' }>;
    expect(broken.kind).toBe('error');
    expect(broken.error.code).toMatch(/^OODS-V/);
    expect(out.meta?.errorPanelCount).toBe(1);
  });

  it('omits a failed panel when onPanelError is "omit"', async () => {
    const ir = metricOverview({ onPanelError: 'omit' });
    (ir.panels as Array<Record<string, unknown>>).push({ id: 'broken', kind: 'chart', chartType: 'bar', datasetId: 'does-not-exist', encodings: { x: 'region', y: 'revenue' } });
    const out = await handle(ir);
    expect(out.panels.find((p) => p.id === 'broken')).toBeUndefined();
    expect((out.warnings ?? []).some((w) => w.message.includes('broken'))).toBe(true);
  });

  it('builds the KPI along an explicit period axis and names the basis in the a11y string (v0.2)', async () => {
    const ir = {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'sales', rows: [
        { revenue: 200, month: '2024-03' },
        { revenue: 100, month: '2024-01' }, // intentionally out of period order
        { revenue: 150, month: '2024-02' },
      ] }],
      panels: [{ id: 'kpi', kind: 'kpi', title: 'Rev', datasetId: 'sales', field: 'revenue', periodField: 'month', aggregate: 'latest', comparison: { basis: 'prior_period' } }],
      a11y: { description: 'period dashboard' },
    } as DashboardRenderInput;
    expect(validateInput(ir)).toBe(true); // input schema accepts periodField (m02 end-to-end)
    const out = await handle(ir);
    expect(validateOutput(out)).toBe(true);
    const kpi = out.panels[0] as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.value).toBe(200); // max period (Mar), NOT the last row
    expect(kpi.delta).toBe(50); // vs the prior distinct period (Feb 150)
    expect(kpi.a11yDescription).toBe('Rev: 200 (increasing, delta 50 vs prior period).');
  });

  it('keeps the KPI a11y string byte-identical to v0.1 when periodField is absent', async () => {
    const out = await handle(metricOverview());
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    // sum 390 vs target 300 -> delta 90; periodField absent -> NO period phrase.
    expect(kpi.a11yDescription).toBe('Total Revenue: 390 (increasing, delta 90).');
  });

  it('names "over the last N periods" for a window basis under an explicit period axis (seam h)', async () => {
    const ir = {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'sales', rows: [
        { revenue: 200, month: '2024-03' },
        { revenue: 100, month: '2024-01' },
        { revenue: 150, month: '2024-02' },
      ] }],
      panels: [{ id: 'kpi', kind: 'kpi', title: 'Rev', datasetId: 'sales', field: 'revenue', periodField: 'month', aggregate: 'latest', comparison: { basis: 'window', window: 2 } }],
      a11y: { description: 'window dashboard' },
    } as DashboardRenderInput;
    const out = await handle(ir);
    const kpi = out.panels[0] as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    // value=Mar 200; window 2 excludes Feb+Mar -> prior {Jan}=100 -> delta 100.
    expect(kpi.delta).toBe(100);
    expect(kpi.a11yDescription).toBe('Rev: 200 (increasing, delta 100 over the last 2 periods).');
  });

  it('adds NO period phrase for a target basis even when periodField is set', async () => {
    const ir = {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'sales', rows: [
        { revenue: 200, month: '2024-03' },
        { revenue: 100, month: '2024-01' },
        { revenue: 150, month: '2024-02' },
      ] }],
      panels: [{ id: 'kpi', kind: 'kpi', title: 'Rev', datasetId: 'sales', field: 'revenue', periodField: 'month', aggregate: 'latest', comparison: { basis: 'target', value: 150 } }],
      a11y: { description: 'target dashboard' },
    } as DashboardRenderInput;
    const out = await handle(ir);
    const kpi = out.panels[0] as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    // target is not period-relative -> bare v0.1-shaped string (value=max-period 200 vs target 150).
    expect(kpi.a11yDescription).toBe('Rev: 200 (increasing, delta 50).');
  });
});
