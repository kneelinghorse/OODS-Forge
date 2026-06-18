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

// Strip the additive export surface — the html field, the output echo, the per-call
// specRef trio, AND the export-computed a11y.narrative (m04) — leaving the composed
// payload (panels/layout/links/meta/the rest of a11y) the export MUST NOT perturb.
// The absent-path-vs-s114 byte-identity (seam e) is proven by the fidelity golden.
function corePayload(out: Record<string, unknown>): Record<string, unknown> {
  const { html: _h, output: _o, specRef: _r, specRefCreatedAt: _c, specRefExpiresAt: _e, a11y, ...rest } = out as Record<string, unknown>;
  const { narrative: _n, ...a11yRest } = (a11y ?? {}) as Record<string, unknown>;
  return { ...rest, a11y: a11yRest };
}

describe('dashboard.render — output.html export (sprint-115 m03)', () => {
  it('omits the html field entirely when output.html is absent (opt-in additive)', async () => {
    const out = await handle(metricOverview());
    expect(validateOutput(out)).toBe(true);
    expect(out.html).toBeUndefined();
    expect(out.output).toEqual({ compact: true }); // no html echo
  });

  it('composes a self-contained, AJV-valid HTML document when output.html=true', async () => {
    const out = await handle(metricOverview({ output: { html: true } }));
    expect(validateOutput(out)).toBe(true);
    const html = out.html as string;

    // Self-contained document shell.
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<style>');
    expect(html.trimEnd().endsWith('</html>')).toBe(true);
    expect(out.output).toEqual({ compact: true, html: true }); // echoed control

    // Vega-Lite panels (trend + breakdown) rendered to INLINE SVG (the moat: pixels).
    const svgCount = (html.match(/<svg/g) ?? []).length;
    expect(svgCount).toBeGreaterThanOrEqual(2);

    // KPI tile carries the computed value + its a11y string.
    expect(html).toContain('Total Revenue');
    expect(html).toContain('390');
    expect(html).toContain('Total Revenue: 390 (increasing, delta 90).');

    // ECharts-primary (geo) panel -> a11y-described placeholder, NOT rendered.
    expect(html).toContain('oods-placeholder-geo');

    // Layout + dashboard a11y are present by construction.
    expect(html).toContain('grid-template-columns:repeat(12,1fr)');
    expect(html).toContain('role="region"');
    expect(html).toContain('Revenue overview dashboard.');
  });

  it('places panels per the resolved grid while DOM order is KPI-first (a11y reading order)', async () => {
    const out = await handle(metricOverview({ output: { html: true } }));
    const html = out.html as string;
    // KPI gridSpan 3 -> grid-column span 3, row 1.
    expect(html).toContain('grid-column:1/span 3;grid-row:1/span');
    // KPI tile appears before the first chart <figure> in document order (reading order).
    expect(html.indexOf('Total Revenue')).toBeLessThan(html.indexOf('<figure'));
  });

  it('leaves the composed payload byte-identical to the no-export path (export adds only html + narrative)', async () => {
    const base = await handle(metricOverview());
    const withHtml = await handle(metricOverview({ output: { html: true } }));
    // panels, layout, links, meta, status, schemaVersion, tokenCssRef + the rest of a11y unchanged.
    expect(JSON.stringify(corePayload(withHtml))).toBe(JSON.stringify(corePayload(base)));
    // the export ADDS a computed narrative; the no-export path keeps the author echo (absent here).
    expect((base.a11y as Record<string, unknown>).narrative).toBeUndefined();
    expect((withHtml.a11y as Record<string, unknown>).narrative).toBeDefined();
  });

  it('produces byte-identical HTML for identical input (determinism gate)', async () => {
    const a = await handle(metricOverview({ output: { html: true } }));
    const b = await handle(metricOverview({ output: { html: true } }));
    expect(a.html).toBe(b.html);
  });
});

describe('dashboard.render — on-brand + accessible export (sprint-115 m04)', () => {
  it('inlines RESOLVED brand tokens as a :root block (no var() references, self-contained)', async () => {
    const out = await handle(metricOverview({ output: { html: true } }));
    const html = out.html as string;
    const rootMatch = html.match(/:root\{([^}]*)\}/);
    expect(rootMatch).not.toBeNull();
    const root = rootMatch?.[1] ?? '';
    // The export's CSS custom properties are bound to RESOLVED values, not references —
    // so the artifact is on-brand standalone without an external token bundle.
    expect(root).toContain('--oods-color-fg:');
    expect(root).toContain('--oods-color-bg:');
    expect(root).not.toContain('var(');
  });

  it('does NOT inline tokens into the compact JSON path (export-only; tokenCssRef stays deferred)', async () => {
    const out = await handle(metricOverview()); // no output.html
    expect(out.tokenCssRef).toBe('tokens.build'); // compact JSON keeps the deferred ref
    expect(out.html).toBeUndefined();
  });

  it('COMPUTES the dashboard narrative from KPI flags (summary + key findings)', async () => {
    const out = await handle(metricOverview({ output: { html: true } }));
    const narrative = (out.a11y as Record<string, unknown>).narrative as { summary: string; keyFindings: string[] };
    expect(narrative.summary).toContain('1 key metric');
    expect(narrative.summary).toContain('breached threshold'); // KPI 390 breaches the 350 threshold
    expect(narrative.keyFindings.some((f) => f.includes('Total Revenue: 390') && f.includes('threshold breached'))).toBe(true);
    // ...and it is embedded in the export markup (the agent-readable summary).
    expect(out.html).toContain('oods-dashboard-narrative');
    expect(out.html).toContain('1 key metric');
  });

  it('lets an author-supplied narrative WIN byte-identically (reused override fallback)', async () => {
    const authored = { summary: 'Q3 revenue is on track.', keyFindings: ['West leads', 'East lagging'] };
    const out = await handle(
      metricOverview({ output: { html: true }, a11y: { description: 'Revenue overview dashboard.', readingOrder: 'kpi-first', narrative: authored } }),
    );
    expect((out.a11y as Record<string, unknown>).narrative).toEqual(authored);
    expect(out.html).toContain('Q3 revenue is on track.');
    expect(out.html).toContain('West leads');
  });

  it('carries the cross-panel summary + per-panel a11y roles + reading order in the markup', async () => {
    const html = (await handle(metricOverview({ output: { html: true } }))).html as string;
    expect(html).toContain('role="region"'); // dashboard container
    expect(html).toContain('Revenue overview dashboard.'); // cross-panel summary
    expect(html).toMatch(/<section class="oods-panel oods-kpi"[^>]*aria-label=/); // KPI tile labelled
    expect(html).toMatch(/<figure class="oods-panel oods-chart" role="figure"[^>]*aria-label=/); // chart figure labelled
    expect(html).toContain('oods-placeholder-geo'); // geo placeholder present
    expect(html).toMatch(/role="img"[^>]*aria-label="Choropleth/); // geo placeholder a11y-described
  });
});
