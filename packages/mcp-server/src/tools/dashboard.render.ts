// dashboard.render — the Phase-2 dashboard composition handler (sprint-113 m05).
//
// Composes a declarative DashboardSpec IR into a renderable metric-overview
// dashboard. It calls the viz.render handle() PER PANEL in-process (no MCP-wire
// re-marshalling, no double AJV — the server validates the dashboard IR at the
// boundary, viz.render's handle() is a pure in-process fn), then runs the headless
// @oods/viz-core dashboard primitives: the m02 auto-layout resolver, the m03 KPI
// compute, and the m03/m04 cross-filter resolver. Per-chart specs (viz.render) are
// UNCHANGED — this composes them (Option C).
//
// Per-panel viz.render specRefs are SUPPRESSED (only their spec/echartsSpec/
// a11yDescription payloads are kept); ONE dashboard-level specRef is minted over
// the composed output. Geo panels preserve their echartsSpec.__registration.

import {
  applyCrossFilter,
  computeKpi,
  resolveCrossFilter,
  resolveDashboardLayout,
  type KpiPanel,
  type Panel,
  type SelectionState,
} from '@oods/viz-core';
import type { DashboardRenderInput, DashboardRenderOutput, VizRenderInput } from '../schemas/generated.js';
import { handle as vizRenderHandle } from './viz.render.js';
import { createValueRef, describeSchemaRef } from './schema-ref.js';

type Row = Record<string, unknown>;
type PanelResult = DashboardRenderOutput['panels'][number];
type Issue = NonNullable<DashboardRenderOutput['warnings']>[number];

const TABULAR_TYPES = new Set(['bar', 'line', 'area', 'scatter', 'heatmap']);

export async function handle(input: DashboardRenderInput): Promise<DashboardRenderOutput> {
  const compact = input.output?.compact ?? true;
  const wantEcharts = input.output?.echarts ?? false;
  const ignoreSelfSource = input.crossFilter?.ignoreSelfSource ?? true;
  const onPanelError = input.onPanelError ?? 'placeholder';
  const selection = (input.selection ?? undefined) as SelectionState | undefined;
  const crossFiltered = selection !== undefined && Object.keys(selection).length > 0;

  const datasetRows = new Map<string, Row[]>();
  for (const dataset of input.datasets) {
    datasetRows.set(dataset.id, dataset.rows as Row[]);
  }

  // Cross-filter a tabular panel's rows by the active selection (skip-self,
  // AND-across-sources). Non-tabular panels carry their own inline data branch
  // and are cross-filter SOURCES, not targets, in v1.
  const filterRows = (panelId: string, rows: Row[]): Row[] =>
    crossFiltered ? applyCrossFilter(rows, resolveCrossFilter(selection as SelectionState, panelId, { ignoreSelfSource })) : rows;

  const panelResults: PanelResult[] = [];
  const placedPanels: Panel[] = [];
  const warnings: Issue[] = [];
  let errorPanelCount = 0;

  for (const panel of input.panels as Panel[]) {
    if (panel.kind === 'kpi') {
      const rows = filterRows(panel.id, datasetRows.get(panel.datasetId) ?? []);
      panelResults.push(buildKpiResult(panel, rows));
      placedPanels.push(panel);
      continue;
    }

    // chart panel — render in-process via viz.render
    const vizInput = buildPanelVizInput(panel, datasetRows, filterRows, wantEcharts);
    const out = await vizRenderHandle(vizInput);

    if (out.status !== 'ok') {
      const issue = out.errors?.[0] ?? { code: 'OODS-V129', message: 'panel failed to render' };
      if (onPanelError === 'omit') {
        warnings.push({ code: issue.code, message: `panel "${panel.id}" omitted: ${issue.message}`, severity: 'warning' });
        continue;
      }
      // SEAM (b) default: an a11y-described error placeholder, kept in-place.
      errorPanelCount += 1;
      panelResults.push({
        id: panel.id,
        kind: 'error',
        ...(panel.title ? { title: panel.title } : {}),
        chartType: panel.chartType,
        error: { code: issue.code, message: issue.message, severity: 'error' },
        a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: ${issue.message}`,
      });
      placedPanels.push(panel);
      continue;
    }

    panelResults.push(buildChartResult(panel, out));
    placedPanels.push(panel);
  }

  // m02 deterministic auto-layout over the panels that produced a result.
  const layout = resolveDashboardLayout(placedPanels, input.layout);
  const panelOrder = readingOrder(placedPanels, input.a11y?.readingOrder, layout);

  const dashboardA11y: DashboardRenderOutput['a11y'] = {
    description: input.a11y.description,
    ...(input.a11y.ariaLabel ? { ariaLabel: input.a11y.ariaLabel } : {}),
    readingOrder: input.a11y.readingOrder ?? 'kpi-first',
    panelOrder,
    ...(input.a11y.narrative ? { narrative: input.a11y.narrative } : {}),
  };

  const result: DashboardRenderOutput = {
    status: 'ok',
    schemaVersion: input.schemaVersion,
    panels: panelResults,
    layout,
    links: (input.links ?? []) as DashboardRenderOutput['links'],
    a11y: dashboardA11y,
    warnings,
    output: { compact, ...(wantEcharts ? { echarts: true } : {}) },
    meta: {
      panelCount: panelResults.length,
      datasetCount: input.datasets.length,
      crossFiltered,
      errorPanelCount,
    },
  };

  if (compact) {
    result.tokenCssRef = 'tokens.build';
  }

  // ONE dashboard-level specRef over the composed payload (the N per-panel refs
  // viz.render minted are suppressed). Reference the deterministic payload only.
  const record = createValueRef({ panels: panelResults, layout }, 'dashboard.render');
  const ref = describeSchemaRef(record);
  result.specRef = ref.ref;
  result.specRefCreatedAt = ref.createdAt;
  result.specRefExpiresAt = ref.expiresAt;

  return result;
}

function buildKpiResult(panel: KpiPanel, rows: Row[]): PanelResult {
  const kpi = computeKpi(panel, rows);
  return {
    id: panel.id,
    kind: 'kpi',
    ...(panel.title ? { title: panel.title } : {}),
    value: kpi.value,
    formatted: kpi.formatted,
    delta: kpi.delta,
    deltaPct: kpi.deltaPct,
    trendDirection: kpi.trendDirection,
    ...(kpi.sparkline ? { sparkline: [...kpi.sparkline] } : {}),
    ...(kpi.thresholdBreached !== undefined ? { thresholdBreached: kpi.thresholdBreached } : {}),
    ...(kpi.anomaly !== undefined ? { anomaly: kpi.anomaly } : {}),
    a11yDescription: kpiA11y(panel, kpi),
  };
}

function kpiA11y(panel: KpiPanel, kpi: ReturnType<typeof computeKpi>): string {
  const label = panel.title ?? panel.field;
  if (kpi.delta === null) {
    return `${label}: ${kpi.formatted}.`;
  }
  // periodField ABSENT keeps the EXACT v0.1 string (byte-identical additivity —
  // the comparison there is by ROW, so it must NOT claim a period basis). With an
  // explicit period axis (v0.2) the basis names the period it was measured against.
  const basis = panel.periodField ? periodBasisLabel(panel.comparison) : '';
  const suffix = basis ? ` ${basis}` : '';
  return `${label}: ${kpi.formatted} (${kpi.trendDirection}, delta ${kpi.delta}${suffix}).`;
}

// The period-basis phrase for the a11y string, gated to the period-based bases
// (the frozen seam (h) wording). 'target' is not period-relative, so it adds no
// phrase even under an explicit periodField.
function periodBasisLabel(comparison: KpiPanel['comparison']): string {
  if (!comparison) {
    return '';
  }
  if (comparison.basis === 'prior_period') {
    return 'vs prior period';
  }
  if (comparison.basis === 'window') {
    const n = Math.max(1, Math.trunc(comparison.window ?? 1));
    return `over the last ${n} periods`;
  }
  return '';
}

type ChartPanel = Extract<Panel, { kind: 'chart' }>;

function buildChartResult(panel: ChartPanel, out: Awaited<ReturnType<typeof vizRenderHandle>>): PanelResult {
  const renderer = out.meta?.renderer ?? 'vega-lite';
  const result = {
    id: panel.id,
    kind: 'chart' as const,
    chartType: panel.chartType,
    renderer,
    ...(panel.title ? { title: panel.title } : {}),
    a11yDescription: out.a11yDescription ?? '',
  } as Record<string, unknown>;
  if (out.spec && Object.keys(out.spec).length > 0) {
    result.spec = out.spec;
  }
  if (out.echartsSpec) {
    result.echartsSpec = out.echartsSpec;
  }
  return result as unknown as PanelResult;
}

function buildPanelVizInput(
  panel: ChartPanel,
  datasetRows: Map<string, Row[]>,
  filterRows: (panelId: string, rows: Row[]) => Row[],
  wantEcharts: boolean,
): VizRenderInput {
  const base: Record<string, unknown> = {
    chartType: panel.chartType,
    // Per-panel compact: the dashboard owns the single tokenCssRef; panels never
    // inline token CSS. ECharts opt-in flows from the dashboard output control.
    output: { compact: true, ...(wantEcharts ? { echarts: true } : {}) },
  };
  if (panel.id) base.id = panel.id;
  if (panel.title) base.name = panel.title;
  if (panel.description) base.description = panel.description;

  if (TABULAR_TYPES.has(panel.chartType)) {
    base.rows = filterRows(panel.id, datasetRows.get(panel.datasetId ?? '') ?? []);
    base.encodings = panel.encodings;
  } else if (panel.chartType === 'treemap' || panel.chartType === 'sunburst') {
    base.hierarchy = panel.hierarchy;
  } else if (panel.chartType === 'sankey') {
    base.sankey = panel.sankey;
  } else if (panel.chartType === 'force_graph') {
    base.network = panel.network;
  } else {
    // choropleth | bubble_map
    base.geo = panel.geo;
  }
  return base as unknown as VizRenderInput;
}

// Reading/focus order (the dashboard-level a11y order). 'declared' keeps the
// authored panel order; 'kpi-first' (default) reuses the m02 layout order, which
// already surfaces the KPI row before charts.
function readingOrder(
  placed: readonly Panel[],
  order: 'kpi-first' | 'declared' | undefined,
  layout: ReadonlyArray<{ id: string }>,
): string[] {
  if (order === 'declared') {
    return placed.map((p) => p.id);
  }
  return layout.map((p) => p.id);
}
