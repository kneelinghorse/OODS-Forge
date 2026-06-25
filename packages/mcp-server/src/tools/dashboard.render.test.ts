import fs, { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { getAjv } from '../lib/ajv.js';
import type { DashboardRenderInput } from '../schemas/generated.js';
import { handle, toA11yContrastBlock } from './dashboard.render.js';
import { resetMeasureRegistryCache } from './measure-registry.js';
import { scanBrandContrast } from './dashboard.render.html.js';

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

  it('accepts an inert measureRef on the KPI panel at the boundary and re-bakes NO KPI number or a11y string (sprint-116)', async () => {
    // metricOverview() merges its argument at the ENVELOPE top level, so a
    // top-level measureRef would be rejected by the dashboard-level
    // additionalProperties:false. Deep-clone it INTO the KPI panel instead
    // (a separate cloned fixture — never the shared metricOverview() output reused
    // across assertions). measureRef is a governed-measure provenance tag; the
    // contract is "accepted at the boundary, unread by compute, never echoed".
    const base = metricOverview();
    const panels = base.panels.map((p) => ({ ...(p as Record<string, unknown>) }));
    (panels[0] as Record<string, unknown>).measureRef = 'gm.revenue';
    const withRef = { ...base, panels } as DashboardRenderInput;

    // (1) The input boundary ACCEPTS the descriptor.
    expect(validateInput(withRef)).toBe(true);

    // (2) Compute is byte-identical to the s114 baseline — measureRef is unread.
    const out = await handle(withRef);
    expect(validateOutput(out)).toBe(true);
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.value).toBe(390);
    expect(kpi.delta).toBe(90);
    expect(kpi.thresholdBreached).toBe(true);
    expect(kpi.a11yDescription).toBe('Total Revenue: 390 (increasing, delta 90).');

    // (3) measureRef is NEVER echoed onto the output KPI panel.
    expect((kpi as Record<string, unknown>).measureRef).toBeUndefined();
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

describe('dashboard.render — governed-measure resolution (sprint-117)', () => {
  // Inject a measureRef INTO a cloned KPI panel (never a top-level envelope merge —
  // the dashboard-level additionalProperties:false rejects a top-level measureRef).
  // resolveMeasures IS a top-level render control, so it merges via metricOverview's
  // `extra`. Clone panels so the shared metricOverview() output is never mutated.
  function withMeasureRef(ref: string, extra: Record<string, unknown> = {}): DashboardRenderInput {
    const base = metricOverview(extra);
    const panels = base.panels.map((p) => ({ ...(p as Record<string, unknown>) }));
    panels[0] = { ...(panels[0] as Record<string, unknown>), measureRef: ref };
    return { ...base, panels } as DashboardRenderInput;
  }

  it('(a) resolves a KNOWN measureRef to the SAME numbers as the raw-field golden', async () => {
    const ir = withMeasureRef('gm.revenue.total', { resolveMeasures: true });
    expect(validateInput(ir)).toBe(true);
    const out = await handle(ir);
    expect(validateOutput(out)).toBe(true);
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    // gm.revenue.total resolves to field 'revenue' / aggregate 'sum'; the author
    // already supplied comparison/threshold (?? fill is a no-op) -> the golden numbers.
    expect(kpi.value).toBe(390);
    expect(kpi.delta).toBe(90);
    expect(kpi.thresholdBreached).toBe(true);
    expect(kpi.a11yDescription).toBe('Total Revenue: 390 (increasing, delta 90).');
    // Resolution is strictly input-side: measureRef/field are NEVER echoed to output.
    expect((kpi as Record<string, unknown>).measureRef).toBeUndefined();
    expect((kpi as Record<string, unknown>).field).toBeUndefined();
  });

  it('(b) an UNKNOWN measureRef (placeholder) -> OODS-V130 error panel, DISTINCT from the legacy silent-empty missing-datasetId path', async () => {
    const ir = withMeasureRef('gm.nope.unknown', { resolveMeasures: true });
    const out = await handle(ir);
    expect(validateOutput(out)).toBe(true);
    expect(out.status).toBe('ok'); // sibling panels are NOT voided
    const errPanel = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'error' }>;
    expect(errPanel.kind).toBe('error');
    expect(errPanel.error.code).toBe('OODS-V130');
    expect(errPanel.error.severity).toBe('error');
    expect(errPanel.a11yDescription).toContain('unknown governed measure "gm.nope.unknown"');
    expect(out.meta?.errorPanelCount).toBe(1);

    // CONTRAST: a missing datasetId is the LEGACY silent-empty path — a kpi panel
    // with value 0, NOT an OODS-V130 error (D6: that asymmetry is unchanged this sprint).
    const silent = await handle({
      schemaVersion: 'v0.1',
      datasets: [{ id: 'sales', rows: SALES }],
      panels: [{ id: 'kpi-rev', kind: 'kpi', title: 'Total Revenue', datasetId: 'does-not-exist', field: 'revenue', aggregate: 'sum' }],
      a11y: { description: 'silent-empty contrast' },
    } as DashboardRenderInput);
    const silentKpi = silent.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof silent.panels[number], { kind: 'kpi' }>;
    expect(silentKpi.kind).toBe('kpi');
    expect(silentKpi.value).toBe(0);
    expect(silent.meta?.errorPanelCount).toBe(0);
  });

  it('(b) an UNKNOWN measureRef under onPanelError:"omit" warns + drops the panel; siblings unaffected', async () => {
    const ir = withMeasureRef('gm.nope.unknown', { resolveMeasures: true, onPanelError: 'omit' });
    const out = await handle(ir);
    expect(validateOutput(out)).toBe(true);
    expect(out.panels.find((p) => p.id === 'kpi-rev')).toBeUndefined(); // dropped
    expect((out.warnings ?? []).some((w) => w.code === 'OODS-V130' && w.severity === 'warning' && w.message.includes('kpi-rev'))).toBe(true);
    // the chart siblings still render.
    expect(out.panels.find((p) => p.id === 'trend')).toBeDefined();
    expect(out.panels.find((p) => p.id === 'breakdown')).toBeDefined();
  });

  it('(c) resolveMeasures false + an inert measureRef is byte-identical to the s116 inert path', async () => {
    const ir = withMeasureRef('gm.revenue.total', { resolveMeasures: false });
    const out = await handle(ir);
    const kpi = out.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    // flag off -> measureRef stays inert; the author field computes the golden numbers.
    expect(kpi.value).toBe(390);
    expect(kpi.delta).toBe(90);
    expect(kpi.thresholdBreached).toBe(true);
    expect(kpi.a11yDescription).toBe('Total Revenue: 390 (increasing, delta 90).');
    expect((kpi as Record<string, unknown>).measureRef).toBeUndefined();
  });

  it('(d) a11y: an UNTITLED resolved panel labels by the RESOLVED field; a TITLED panel stays title-stable', async () => {
    // UNTITLED panel — author field 'month'/aggregate 'count' are the inert echo; the
    // registry OVERRIDES them to revenue/sum, so the a11y label (panel.title ??
    // panel.field) must read the RESOLVED field 'revenue', NOT the author's 'month'.
    const untitled = {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'sales', rows: SALES }],
      panels: [{ id: 'kpi', kind: 'kpi', datasetId: 'sales', field: 'month', aggregate: 'count', measureRef: 'gm.revenue.total' }],
      a11y: { description: 'untitled resolved panel' },
      resolveMeasures: true,
    } as DashboardRenderInput;
    const outU = await handle(untitled);
    const kpiU = outU.panels.find((p) => p.id === 'kpi') as Extract<typeof outU.panels[number], { kind: 'kpi' }>;
    expect(kpiU.value).toBe(390); // resolved to revenue/sum (NOT month/count)
    // label = RESOLVED field; registry defaults (target 300 / above 350) ?? fill too.
    expect(kpiU.a11yDescription).toBe('revenue: 390 (increasing, delta 90).');

    // TITLED panel (the golden) — the title is the label, stable across the override.
    const titled = withMeasureRef('gm.revenue.total', { resolveMeasures: true });
    const outT = await handle(titled);
    const kpiT = outT.panels.find((p) => p.id === 'kpi-rev') as Extract<typeof outT.panels[number], { kind: 'kpi' }>;
    expect(kpiT.a11yDescription).toBe('Total Revenue: 390 (increasing, delta 90).');
  });
});

describe('dashboard.render — measure governance: additivity gate + fail-closed registry (sprint-118 m03)', () => {
  // A KPI panel resolving a governed measure under resolveMeasures:true. gm.export.value.total
  // is ADDITIVE (resolves + computes); gm.export.unit_price is NON-additive (a value/quantity
  // ratio) and a `sum` rollup is BLOCKED with V133; a malformed registry FAILS CLOSED with V132.
  function exportKpi(measureRef: string, extra: Record<string, unknown> = {}): DashboardRenderInput {
    return {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'flows', rows: [{ value: 100, unit_price: 0.4 }, { value: 200, unit_price: 0.6 }] }],
      panels: [{ id: 'kpi', kind: 'kpi', title: 'Measure', datasetId: 'flows', field: 'value', aggregate: 'sum', measureRef }],
      a11y: { description: 'measure governance' },
      resolveMeasures: true,
      ...extra,
    } as DashboardRenderInput;
  }

  it('an ADDITIVE measure (gm.export.value.total) resolves to value/sum and computes — no V133', async () => {
    const out = await handle(exportKpi('gm.export.value.total'));
    expect(validateOutput(out)).toBe(true);
    const kpi = out.panels.find((p) => p.id === 'kpi') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.kind).toBe('kpi'); // NOT an error panel
    expect(kpi.value).toBe(300); // sum of value (100 + 200); registry field overrides author
    expect(out.meta?.errorPanelCount).toBe(0);
  });

  it('a NON-additive measure (gm.export.unit_price) summed is BLOCKED with an OODS-V133 error panel', async () => {
    const out = await handle(exportKpi('gm.export.unit_price'));
    expect(validateOutput(out)).toBe(true);
    expect(out.status).toBe('ok'); // siblings are not voided
    const err = out.panels.find((p) => p.id === 'kpi') as Extract<typeof out.panels[number], { kind: 'error' }>;
    expect(err.kind).toBe('error');
    expect(err.error.code).toBe('OODS-V133');
    expect(err.error.severity).toBe('error');
    expect(err.a11yDescription).toContain('cannot be summed');
    expect(out.meta?.errorPanelCount).toBe(1);
  });

  it('a NON-additive measure under onPanelError:"omit" warns (V133) + drops the panel', async () => {
    const out = await handle(exportKpi('gm.export.unit_price', { onPanelError: 'omit' }));
    expect(out.panels.find((p) => p.id === 'kpi')).toBeUndefined();
    expect((out.warnings ?? []).some((w) => w.code === 'OODS-V133' && w.severity === 'warning' && w.message.includes('kpi'))).toBe(true);
  });

  it('only SUMMATION is blocked — a non-additive measure is unaffected when resolveMeasures is off', async () => {
    const out = await handle(exportKpi('gm.export.unit_price', { resolveMeasures: false }));
    // flag off -> measureRef stays inert (s116 path), the author field/aggregate compute; no V133.
    const kpi = out.panels.find((p) => p.id === 'kpi') as Extract<typeof out.panels[number], { kind: 'kpi' }>;
    expect(kpi.kind).toBe('kpi');
    expect(out.meta?.errorPanelCount).toBe(0);
  });

  it('a MALFORMED registry FAILS CLOSED with OODS-V132 — NOT a silent V130 unknown-measure miss', async () => {
    // Well-formed JSON that VIOLATES the schema (entry missing required entityField/aggregate/
    // measureRole). The loader must fail closed, NOT degrade to an empty Map (which would
    // surface as V130 and mask the config rot). Spy the shared node:fs object property.
    const spy = vi.spyOn(fs, 'readFileSync').mockReturnValue('{"measures":{"gm.bad":{"name":"Bad"}}}');
    resetMeasureRegistryCache();
    try {
      const out = await handle(exportKpi('gm.bad'));
      expect(validateOutput(out)).toBe(true);
      const err = out.panels.find((p) => p.id === 'kpi') as Extract<typeof out.panels[number], { kind: 'error' }>;
      expect(err.kind).toBe('error');
      expect(err.error.code).toBe('OODS-V132'); // fail closed, NOT V130
    } finally {
      spy.mockRestore();
      resetMeasureRegistryCache(); // restore the real registry for subsequent tests
    }
  });
});

describe('dashboard.render — a11y completeness: contrast scan + SR data-table + E/I/X (sprint-118 m07)', () => {
  const FLOWS = [
    { partner: 'USA', revenue: 100, flag: 'E' },
    { partner: 'Brazil', revenue: 80, flag: 'I' },
    { partner: 'India', revenue: 60, flag: 'X' },
    { partner: 'China', revenue: 40, flag: '' },
  ];
  function chartDash(extra: Record<string, unknown> = {}): DashboardRenderInput {
    return {
      schemaVersion: 'v0.1',
      datasets: [{ id: 'flows', rows: FLOWS }],
      panels: [{ id: 'bars', kind: 'chart', chartType: 'bar', datasetId: 'flows', encodings: { x: 'partner', y: { field: 'revenue', aggregate: 'sum' } } }],
      a11y: { description: 'flows' },
      ...extra,
    } as DashboardRenderInput;
  }

  // (A) contrast scan — unit-test the pure scanner with controlled palettes (the default brand
  // may pass all pairs; this proves the V135 logic independent of the brand tokens).
  it('(A) scanBrandContrast flags a low-contrast pair and passes a high-contrast one', () => {
    const failing = scanBrandContrast({ '--oods-color-fg': '#999999', '--oods-color-bg': '#aaaaaa' });
    expect(failing.some((f) => f.pair === 'fg-on-bg' && f.ratio < f.threshold)).toBe(true);
    const passing = scanBrandContrast({ '--oods-color-fg': '#000000', '--oods-color-bg': '#ffffff' });
    expect(passing.some((f) => f.pair === 'fg-on-bg')).toBe(false);
  });

  it('(A) output.contrastScan runs the scan and echoes the control; any finding is a well-formed OODS-V135', async () => {
    const out = await handle(chartDash({ output: { contrastScan: true } }));
    expect(validateOutput(out)).toBe(true);
    expect((out.output as Record<string, unknown>).contrastScan).toBe(true);
    for (const w of out.warnings ?? []) {
      if (w.code === 'OODS-V135') {
        expect(w.severity).toBe('warning');
        expect(w.message).toMatch(/contrast/i);
      }
    }
  });

  it('(A) contrastScan OFF emits no V135 + does not echo the control (default-off inert)', async () => {
    const out = await handle(chartDash());
    expect((out.warnings ?? []).some((w) => w.code === 'OODS-V135')).toBe(false);
    expect((out.output as Record<string, unknown>).contrastScan).toBeUndefined();
  });

  // (A) sprint-119 m03 — toA11yContrastBlock: the POPULATED structured-block mapping.
  // The default brand passes contrast (no failing pairs), so a non-empty a11yContrast
  // never arises end-to-end; this unit-tests the mapping with controlled findings so the
  // severity-injection + failing-count logic can actually fail if it regresses (Rule 9).
  it('(A) toA11yContrastBlock mirrors findings as warning-severity rows + counts failures', () => {
    const block = toA11yContrastBlock([
      { pair: 'fg-on-bg', ratio: 3.2, threshold: 4.5 },
      { pair: 'muted-on-panel-bg', ratio: 4.1, threshold: 4.5 },
    ]);
    expect(block.findings).toEqual([
      { pair: 'fg-on-bg', ratio: 3.2, threshold: 4.5, severity: 'warning' },
      { pair: 'muted-on-panel-bg', ratio: 4.1, threshold: 4.5, severity: 'warning' },
    ]);
    expect(block.summary).toEqual({ failing: 2 });
    // empty findings still yields a well-formed block (scan ran, found nothing).
    expect(toA11yContrastBlock([])).toEqual({ findings: [], summary: { failing: 0 } });
  });

  // (B) SR data-table.
  it('(B) output.dataTable appends an SR-only data-table whose cells equal the charted rows', async () => {
    const out = await handle(chartDash({ output: { html: true, dataTable: true } }));
    const html = out.html as string;
    expect(html).toContain('oods-chart-data');
    expect(html).toContain('oods-visually-hidden'); // SR-only
    // the charted columns (encoding fields) head the table, and the cell values are present.
    expect(html).toMatch(/<th scope="col">partner<\/th>/);
    expect(html).toContain('>USA<');
    expect(html).toContain('>Brazil<');
  });

  it('(B) output.dataTable is run-to-run deterministic', async () => {
    const a = await handle(chartDash({ output: { html: true, dataTable: true } }));
    const b = await handle(chartDash({ output: { html: true, dataTable: true } }));
    expect(a.html).toBe(b.html);
  });

  it('(B) dataTable OFF keeps the HTML free of any data-table (additive)', async () => {
    const out = await handle(chartDash({ output: { html: true } }));
    expect(out.html as string).not.toContain('oods-chart-data');
  });

  // (C) E/I/X caption tally.
  it('(C) output.dataQualityField tallies E/I/X into the data-table caption', async () => {
    const out = await handle(chartDash({ output: { html: true, dataTable: true, dataQualityField: 'flag' } }));
    const html = out.html as string;
    expect(html).toMatch(/<caption>Data quality:/);
    expect(html).toContain('1 estimated'); // one 'E' row
    expect(html).toContain('1 imputed'); // one 'I' row
    expect(html).toContain('1 external'); // one 'X' row
    expect(html).toContain('1 official'); // the blank row
  });

  it('(input) the schema accepts the new output controls', () => {
    expect(validateInput(chartDash({ output: { html: true, dataTable: true, contrastScan: true, dataQualityField: 'flag' } }))).toBe(true);
  });
});

// FD#10 (sprint-128 m03): the dashboard surface (the s113 flagship headline)
// propagates per-panel structured a11y so a non-cartesian panel INSIDE a dashboard
// also exposes the table+narrative — not just a11yDescription.
describe('dashboard.render — per-panel structured a11y (output.includeA11y)', () => {
  it('attaches a11y.table+narrative to every chart panel (incl. the choropleth) and stays schema-valid', async () => {
    const out = await handle(metricOverview({ output: { includeA11y: true } }));
    expect(validateOutput(out)).toBe(true);
    expect(out.output?.includeA11y).toBe(true);

    const charts = out.panels.filter(
      (p): p is Extract<typeof out.panels[number], { kind: 'chart' }> => p.kind === 'chart',
    );
    expect(charts.length).toBeGreaterThanOrEqual(3); // line + bar + choropleth
    for (const panel of charts) {
      expect(panel.a11y, `panel ${panel.id} a11y`).toBeDefined();
      expect((panel.a11y?.narrative?.summary ?? '').length).toBeGreaterThan(0);
      expect((panel.a11y?.table?.rows ?? []).length).toBeGreaterThan(0);
    }
  });

  it('omits panel a11y entirely (byte-identical) when the flag is off', async () => {
    const out = await handle(metricOverview());
    const charts = out.panels.filter(
      (p): p is Extract<typeof out.panels[number], { kind: 'chart' }> => p.kind === 'chart',
    );
    for (const panel of charts) {
      expect(panel.a11y).toBeUndefined();
    }
    expect(out.output?.includeA11y).toBeUndefined();
  });

  it('(input) the schema accepts output.includeA11y', () => {
    expect(validateInput(metricOverview({ output: { includeA11y: true } }))).toBe(true);
  });
});
