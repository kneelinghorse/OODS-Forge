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
});
