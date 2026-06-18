import { describe, expect, it } from 'vitest';
import type { DashboardRenderInput, DashboardRenderOutput } from '../schemas/generated.js';
import { handle } from './dashboard.render.js';

// Dashboard render-fidelity goldens (sprint-113 m06), layer 2 of 2 — the
// mcp-server BOUNDARY. Pins the composed metric-overview payload so any drift in
// the per-panel composition (layout + KPI + chart specs + geo registration) must
// update a committed snapshot, with a run-twice byte-identity sibling. The
// per-call-unique specRef trio is REDACTED before snapshotting (per
// viz.render.geo-fidelity.test.ts). NOTE: this file is colocated under src/tools/**,
// which the root core/coverage vitest projects EXCLUDE — it is wired into CI by
// name at .github/workflows/ci.yml or it would silently never run.

const GEO = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'West' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] } },
    { type: 'Feature', properties: { name: 'East' }, geometry: { type: 'Polygon', coordinates: [[[2, 0], [4, 0], [4, 2], [2, 2], [2, 0]]] } },
  ],
};

const METRIC_OVERVIEW: DashboardRenderInput = {
  schemaVersion: 'v0.1',
  title: 'Revenue Overview',
  datasets: [
    {
      id: 'sales',
      rows: [
        { region: 'West', month: 'Jan', revenue: 100 },
        { region: 'East', month: 'Jan', revenue: 80 },
        { region: 'West', month: 'Feb', revenue: 120 },
        { region: 'East', month: 'Feb', revenue: 90 },
      ],
    },
  ],
  panels: [
    { id: 'kpi-rev', kind: 'kpi', title: 'Total Revenue', datasetId: 'sales', field: 'revenue', aggregate: 'sum', comparison: { basis: 'target', value: 300 }, threshold: { direction: 'above', value: 350 } },
    { id: 'trend', kind: 'chart', chartType: 'line', datasetId: 'sales', encodings: { x: 'month', y: { field: 'revenue', aggregate: 'sum' } } },
    { id: 'breakdown', kind: 'chart', chartType: 'bar', datasetId: 'sales', encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } } },
    { id: 'geo', kind: 'chart', chartType: 'choropleth', geo: { geojson: GEO, valueField: 'revenue', join: { dataKey: 'region', featureProperty: 'name' }, rows: [{ region: 'West', revenue: 220 }, { region: 'East', revenue: 170 }] } },
  ],
  layout: { columns: 12, placements: [{ panelId: 'kpi-rev', gridSpan: 3 }] },
  links: [{ source: 'breakdown', target: 'trend', sourceField: 'region', operator: 'in' }],
  a11y: { description: 'Revenue overview dashboard.', readingOrder: 'kpi-first' },
} as DashboardRenderInput;

// Strip the per-call-unique specRef trio so the committed golden is stable.
function redact(out: DashboardRenderOutput): Omit<DashboardRenderOutput, 'specRef' | 'specRefCreatedAt' | 'specRefExpiresAt'> {
  const { specRef: _r, specRefCreatedAt: _c, specRefExpiresAt: _e, ...rest } = out;
  return rest;
}

// Period-axis variant (sprint-114 m05): an explicit periodField drives the KPI
// onto a parsed + sorted time axis. Rows are intentionally out of period order
// so the snapshot locks the SORTED compute (latest = max period) + the period-
// gated a11y wording, distinct from the row-order METRIC_OVERVIEW above.
const PERIOD_OVERVIEW: DashboardRenderInput = {
  schemaVersion: 'v0.1',
  title: 'Monthly Revenue (period axis)',
  datasets: [
    {
      id: 'sales',
      rows: [
        { region: 'West', month: '2024-03', revenue: 120 },
        { region: 'West', month: '2024-01', revenue: 100 },
        { region: 'West', month: '2024-02', revenue: 110 },
      ],
    },
  ],
  panels: [
    { id: 'kpi-rev', kind: 'kpi', title: 'Latest Revenue', datasetId: 'sales', field: 'revenue', periodField: 'month', aggregate: 'latest', comparison: { basis: 'prior_period' } },
    { id: 'trend', kind: 'chart', chartType: 'line', datasetId: 'sales', encodings: { x: 'month', y: { field: 'revenue', aggregate: 'sum' } } },
  ],
  a11y: { description: 'Monthly revenue with an explicit period axis.' },
} as DashboardRenderInput;

describe('dashboard.render render-fidelity goldens (sprint-113 m06)', () => {
  it('the metric-overview composed payload matches the committed golden', async () => {
    const out = await handle(METRIC_OVERVIEW);
    expect(out.status).toBe('ok');
    expect(redact(out)).toMatchSnapshot();
  });

  it('same input -> byte-identical composed payload (determinism gate)', async () => {
    const a = redact(await handle(METRIC_OVERVIEW));
    const b = redact(await handle(METRIC_OVERVIEW));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('the period-axis composed payload matches the committed golden (v0.2)', async () => {
    const out = await handle(PERIOD_OVERVIEW);
    expect(out.status).toBe('ok');
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.value).toBe(120); // max period (2024-03)
    expect(kpi.delta).toBe(10); // vs prior period (2024-02 = 110)
    expect(kpi.a11yDescription).toBe('Latest Revenue: 120 (increasing, delta 10 vs prior period).');
    expect(redact(out)).toMatchSnapshot();
  });

  it('period-axis: same input -> byte-identical composed payload (determinism gate)', async () => {
    const a = redact(await handle(PERIOD_OVERVIEW));
    const b = redact(await handle(PERIOD_OVERVIEW));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
