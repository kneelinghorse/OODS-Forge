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
  finestGranularity,
  parseTemporalValue,
  resolveCrossFilter,
  resolveDashboardLayout,
  resolveDashboardNarrative,
  type DashboardKpiSummary,
  type KpiPanel,
  type Panel,
  type SelectionState,
  type TemporalGranularity,
} from '@oods/viz-core';
import type { DashboardRenderInput, DashboardRenderOutput, VizRenderInput } from '../schemas/generated.js';
import { handle as vizRenderHandle } from './viz.render.js';
import { createValueRef, describeSchemaRef } from './schema-ref.js';
import { composeDashboardHtml, scanBrandContrast, type ChartTableData, type ContrastFinding } from './dashboard.render.html.js';
import { loadMeasureRegistry, MalformedMeasureRegistryError } from './measure-registry.js';
import { resolveMeasurePanel } from './measure-resolver.js';
import { absentFields, referencedEncodingFields } from './field-presence.js';

type Row = Record<string, unknown>;
type PanelResult = DashboardRenderOutput['panels'][number];
type Issue = NonNullable<DashboardRenderOutput['warnings']>[number];

const TABULAR_TYPES = new Set(['bar', 'line', 'area', 'scatter', 'heatmap']);

/**
 * Project scanBrandContrast's ContrastFinding[] into the opt-in a11yContrast output
 * block (sprint-119 m03). Every finding is a failing pair (ratio < threshold), so
 * each becomes a 'warning'-severity row mirroring its OODS-V135 warning; the summary
 * carries the failing count. Pure + exported so the populated mapping is unit-testable
 * (the default brand passes contrast, so a non-empty block never arises end-to-end).
 */
export function toA11yContrastBlock(findings: ContrastFinding[]): NonNullable<DashboardRenderOutput['a11yContrast']> {
  return {
    findings: findings.map((finding) => ({ ...finding, severity: 'warning' as const })),
    summary: { failing: findings.length },
  };
}

export async function handle(input: DashboardRenderInput): Promise<DashboardRenderOutput> {
  const compact = input.output?.compact ?? true;
  const wantEcharts = input.output?.echarts ?? false;
  const wantHtml = input.output?.html ?? false;
  // A11y completeness (sprint-118 m07) — all default-off so the absent path is byte-identical.
  const wantDataTable = input.output?.dataTable ?? false;
  const wantContrastScan = input.output?.contrastScan ?? false;
  const dataQualityField = input.output?.dataQualityField;
  const ignoreSelfSource = input.crossFilter?.ignoreSelfSource ?? true;
  const onPanelError = input.onPanelError ?? 'placeholder';
  // Phase-3 governed-measure resolution (sprint-117) — gated, default OFF so the
  // absent/false path is byte-identical to s116 (measureRef stays inert).
  const resolveMeasures = input.resolveMeasures ?? false;
  // Field-presence strict check (sprint-118 m05) — gated, default OFF so the absent/false
  // path is byte-identical (the frozen-D6 silent-empty asymmetry preserved).
  const strictFields = input.strictFields ?? false;
  // D6 unknown-datasetId STRICT switch (sprint-122 m03) — gated, default OFF so the absent/false
  // path is byte-identical to the frozen-D6 silent value:0. Lifts ONLY a KPI panel whose datasetId
  // is absent from datasets[] to a fail-loud V139 (a KNOWN dataset cross-filtered to [] still
  // renders value:0; chart panels keep their own V123 path).
  const strictDatasets = input.strictDatasets ?? false;
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
      // Resolve a governed measureRef -> field/aggregate BEFORE compute when the
      // flag is on AND the panel carries one; otherwise pass through untouched
      // (the `resolveMeasures && panel.measureRef` guard keeps the default path
      // byte-identical to s116).
      let kpiPanel = panel;
      // M2 (sprint-122): a resolved governed measure may declare an expectedGrain. Hoisted OUT
      // of the resolveMeasures block (where `entry` is in scope) because the grain check needs
      // `rows`, fetched AFTER the block closes. Stays undefined on the default/unresolved path.
      let expectedGrain: TemporalGranularity | undefined;
      if (resolveMeasures && panel.measureRef) {
        let registry;
        try {
          registry = loadMeasureRegistry();
        } catch (err) {
          if (!(err instanceof MalformedMeasureRegistryError)) throw err;
          // V132 (sprint-118 m03): the registry artifact is present but malformed. FAIL
          // CLOSED through the SAME partial-panel seam — never a silent empty Map, which
          // would masquerade as a V130 unknown-measure miss and hide the config rot.
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V132',
              message: `KPI panel "${panel.id}" omitted: the governed-measure registry is malformed.`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V132',
              message: `KPI panel "${panel.id}" cannot resolve "${panel.measureRef}": the governed-measure registry is malformed.`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: the governed-measure registry is malformed.`,
          });
          placedPanels.push(panel);
          continue;
        }
        const entry = registry.get(panel.measureRef);
        if (!entry) {
          // Unresolvable governed measure = a provenance failure, NOT a silent
          // value:0. Route through the SAME partial-panel seam the chart branch
          // uses (NOT a thrown ToolError, which would void sibling panels).
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V130',
              message: `KPI panel "${panel.id}" omitted: references unknown governed measure "${panel.measureRef}".`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V130',
              message: `KPI panel "${panel.id}" references unknown governed measure "${panel.measureRef}".`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: unknown governed measure "${panel.measureRef}".`,
          });
          placedPanels.push(panel);
          continue;
        }
        if (entry.additive === false && entry.aggregate === 'sum') {
          // V133 (sprint-118 m03): a non-additive measure asked for a `sum` rollup. A
          // summed ratio/price (e.g. value/quantity) is meaningless — block it instead of
          // silently summing. ONLY summation is blocked; average/latest/min/max/distinct/
          // count are fine. (The registry aggregate OVERRIDES the author's per D4, so the
          // effective aggregate is entry.aggregate.) Route through the SAME seam.
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V133',
              message: `KPI panel "${panel.id}" omitted: non-additive measure "${panel.measureRef}" cannot be summed.`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V133',
              message: `KPI panel "${panel.id}" blocks a non-additive rollup: measure "${panel.measureRef}" cannot be summed.`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: non-additive measure "${panel.measureRef}" cannot be summed.`,
          });
          placedPanels.push(panel);
          continue;
        }
        // The entry passed the V132/V130/V133 gates — capture its optional declared time-grain
        // for the post-rows V138 check (entry goes OUT of scope when this block closes).
        expectedGrain = entry.expectedGrain;
        kpiPanel = resolveMeasurePanel(panel, registry);
      }
      // V137 (sprint-122 m01): a KPI panel resolved to NO field — a measureRef-only panel with
      // resolveMeasures OFF (the block above is skipped so field is never filled), or otherwise
      // field-less. The IR cast at the loop head types `field` as string, but a tool-input panel
      // that drops it (schema A no longer requires `field`) is `undefined` at RUNTIME. Fail loud
      // through the SAME onPanelError seam instead of letting computeKpi silently aggregate a
      // missing field to value:0. Fires UNCONDITIONALLY (NOT gated by strictFields).
      if (!kpiPanel.field) {
        if (onPanelError === 'omit') {
          warnings.push({
            code: 'OODS-V137',
            message: `KPI panel "${panel.id}" omitted: no resolvable field (measureRef unresolved).`,
            severity: 'warning',
          });
          continue;
        }
        errorPanelCount += 1;
        panelResults.push({
          id: panel.id,
          kind: 'error',
          ...(panel.title ? { title: panel.title } : {}),
          error: {
            code: 'OODS-V137',
            message: `KPI panel "${panel.id}" has no resolvable field: a measureRef-only panel requires resolveMeasures and a known governed measure.`,
            severity: 'error',
          },
          a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: no resolvable field (measureRef unresolved).`,
        });
        placedPanels.push(panel);
        continue;
      }
      // V139 (sprint-122 m03): under strictDatasets, a KPI panel referencing a datasetId NOT in
      // datasets[] fails LOUD (matching how chart panels fail via V123) instead of the frozen-D6
      // silent value:0. Read .has() on the RAW pre-filter Map BEFORE the `?? []` collapse below so
      // an UNKNOWN id (.has()===false) is distinguished from a KNOWN dataset cross-filtered to []
      // (which keeps .has()===true and STILL renders value:0 — the Derek-ratified unknown-id-ONLY
      // scope). kpiPanel.datasetId === panel.datasetId (resolveMeasurePanel never touches it).
      if (strictDatasets && !datasetRows.has(kpiPanel.datasetId)) {
        if (onPanelError === 'omit') {
          warnings.push({
            code: 'OODS-V139',
            message: `KPI panel "${panel.id}" omitted: references unknown dataset "${kpiPanel.datasetId}".`,
            severity: 'warning',
          });
          continue;
        }
        errorPanelCount += 1;
        panelResults.push({
          id: panel.id,
          kind: 'error',
          ...(panel.title ? { title: panel.title } : {}),
          error: {
            code: 'OODS-V139',
            message: `KPI panel "${panel.id}" references unknown dataset "${kpiPanel.datasetId}".`,
            severity: 'error',
          },
          a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: references unknown dataset "${kpiPanel.datasetId}".`,
        });
        placedPanels.push(panel);
        continue;
      }
      const rows = filterRows(kpiPanel.id, datasetRows.get(kpiPanel.datasetId) ?? []);
      if (strictFields) {
        // V131: a referenced field (the resolved field + optional periodField) absent from
        // every NON-empty row is a typo, NOT a silent value:0. Route through the SAME seam.
        const refs = kpiPanel.periodField ? [kpiPanel.field, kpiPanel.periodField] : [kpiPanel.field];
        const missing = absentFields(rows, refs);
        if (missing.length > 0) {
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V131',
              message: `KPI panel "${panel.id}" omitted: field(s) absent from the dataset: ${missing.join(', ')}.`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V131',
              message: `KPI panel "${panel.id}" references field(s) absent from the dataset: ${missing.join(', ')}.`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: field(s) absent from the dataset: ${missing.join(', ')}.`,
          });
          placedPanels.push(panel);
          continue;
        }
      }
      // V138 (sprint-122 m02): when the resolved governed measure declares an expectedGrain,
      // validate the panel's ACTUAL period data against it. The finest observed granularity of
      // the periodField cells must equal the declared grain, else the measure is being read at
      // the wrong cadence — route through the SAME onPanelError seam. Fires ONLY when a measure
      // resolved an expectedGrain (the default/unseeded path is byte-untouched). temporal parsing
      // is UTC-pinned/deterministic (golden-safe); rows are params (consumer-model clean).
      if (expectedGrain) {
        if (!kpiPanel.periodField) {
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V138',
              message: `KPI panel "${panel.id}" omitted: measure expects time-grain "${expectedGrain}" but the panel declares no periodField.`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V138',
              message: `KPI panel "${panel.id}" measure expects time-grain "${expectedGrain}" but the panel declares no periodField to check.`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: measure expects time-grain "${expectedGrain}" but no periodField is set.`,
          });
          placedPanels.push(panel);
          continue;
        }
        const periodField = kpiPanel.periodField;
        const parsed = rows
          .map((r) => parseTemporalValue(r[periodField], true))
          .filter((p): p is NonNullable<typeof p> => p !== null);
        const observed = finestGranularity(parsed);
        if (observed !== expectedGrain) {
          if (onPanelError === 'omit') {
            warnings.push({
              code: 'OODS-V138',
              message: `KPI panel "${panel.id}" omitted: measure expects time-grain "${expectedGrain}" but the period data is "${observed}".`,
              severity: 'warning',
            });
            continue;
          }
          errorPanelCount += 1;
          panelResults.push({
            id: panel.id,
            kind: 'error',
            ...(panel.title ? { title: panel.title } : {}),
            error: {
              code: 'OODS-V138',
              message: `KPI panel "${panel.id}" measure expects time-grain "${expectedGrain}" but the period data is "${observed}".`,
              severity: 'error',
            },
            a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: measure expects time-grain "${expectedGrain}" but the data is "${observed}".`,
          });
          placedPanels.push(panel);
          continue;
        }
      }
      panelResults.push(buildKpiResult(kpiPanel, rows));
      placedPanels.push(kpiPanel);
      continue;
    }

    // chart panel — under strictFields, a tabular panel's encoding fields must be present in the
    // resolved rows BEFORE rendering, so a typo surfaces as V131 (not a confident-wrong spec).
    if (strictFields && TABULAR_TYPES.has(panel.chartType)) {
      const chartRows = filterRows(panel.id, datasetRows.get(panel.datasetId ?? '') ?? []);
      const missing = absentFields(chartRows, referencedEncodingFields(panel.encodings));
      if (missing.length > 0) {
        if (onPanelError === 'omit') {
          warnings.push({
            code: 'OODS-V131',
            message: `panel "${panel.id}" omitted: encoding field(s) absent from the dataset: ${missing.join(', ')}.`,
            severity: 'warning',
          });
          continue;
        }
        errorPanelCount += 1;
        panelResults.push({
          id: panel.id,
          kind: 'error',
          ...(panel.title ? { title: panel.title } : {}),
          chartType: panel.chartType,
          error: {
            code: 'OODS-V131',
            message: `panel "${panel.id}" references encoding field(s) absent from the dataset: ${missing.join(', ')}.`,
            severity: 'error',
          },
          a11yDescription: `Panel "${panel.title ?? panel.id}" could not be rendered: encoding field(s) absent from the dataset: ${missing.join(', ')}.`,
        });
        placedPanels.push(panel);
        continue;
      }
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

  // Narrative (m04): on the EXPORT path, COMPUTE a cross-panel narrative from the KPI
  // signals (author-supplied narrative still wins, via the reused override). Gated on
  // wantHtml so the non-export output stays byte-identical to s114 (seam e) — absent
  // path keeps the author echo exactly. The computed narrative flows into BOTH the
  // JSON a11y block AND the HTML export (which reads dashboardA11y).
  const narrative: NonNullable<DashboardRenderOutput['a11y']>['narrative'] = wantHtml
    ? toNarrativeOutput(
        resolveDashboardNarrative(input.a11y.narrative, collectKpiSummaries(panelResults), input.a11y.description),
      )
    : input.a11y.narrative;

  const dashboardA11y: DashboardRenderOutput['a11y'] = {
    description: input.a11y.description,
    ...(input.a11y.ariaLabel ? { ariaLabel: input.a11y.ariaLabel } : {}),
    readingOrder: input.a11y.readingOrder ?? 'kpi-first',
    panelOrder,
    ...(narrative ? { narrative } : {}),
  };

  // A11y contrast scan (sprint-118 m07 piece A): when requested, scan the export's resolved
  // brand-token pairs (no fs) and surface failures as OODS-V135 warnings. Default-off ⇒ no-op.
  // sprint-119 m03: ALSO echo the SAME findings as an opt-in structured a11yContrast block
  // (no recompute — scanBrandContrast is called once; its s118 non-hex guard already applies).
  let a11yContrast: DashboardRenderOutput['a11yContrast'];
  if (wantContrastScan) {
    const contrastFindings = scanBrandContrast();
    for (const finding of contrastFindings) {
      warnings.push({
        code: 'OODS-V135',
        message: `Brand token pair "${finding.pair}" fails WCAG contrast: measured ${finding.ratio}:1, need ≥${finding.threshold}:1.`,
        severity: 'warning',
      });
    }
    a11yContrast = toA11yContrastBlock(contrastFindings);
  }

  const result: DashboardRenderOutput = {
    status: 'ok',
    schemaVersion: input.schemaVersion,
    panels: panelResults,
    layout,
    links: (input.links ?? []) as DashboardRenderOutput['links'],
    a11y: dashboardA11y,
    warnings,
    ...(a11yContrast ? { a11yContrast } : {}),
    output: {
      compact,
      ...(wantEcharts ? { echarts: true } : {}),
      ...(wantHtml ? { html: true } : {}),
      ...(wantDataTable ? { dataTable: true } : {}),
      ...(wantContrastScan ? { contrastScan: true } : {}),
    },
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

  // Opt-in render-to-SVG export (seam (b)/(e)): compose a self-contained HTML doc
  // ONLY when requested, so the absent path stays byte-identical to s114. Brand-token
  // inlining + the computed narrative land in m04.
  if (wantHtml) {
    // SR data-table (m07 piece B): thread the charted rows per tabular chart panel. Built ONLY
    // under output.dataTable so the default HTML stays byte-identical (no table appended).
    let tableData: Map<string, ChartTableData> | undefined;
    if (wantDataTable) {
      tableData = new Map<string, ChartTableData>();
      for (const panel of input.panels as Panel[]) {
        if (panel.kind === 'chart' && TABULAR_TYPES.has(panel.chartType)) {
          const rows = filterRows(panel.id, datasetRows.get(panel.datasetId ?? '') ?? []);
          tableData.set(panel.id, { columns: referencedEncodingFields(panel.encodings), rows });
        }
      }
    }
    result.html = await composeDashboardHtml({
      title: input.title,
      panels: panelResults,
      layout,
      a11y: dashboardA11y,
      columns: input.layout?.columns ?? 12,
      ...(tableData ? { tableData } : {}),
      ...(dataQualityField ? { dataQualityField } : {}),
    });
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

// Project the computed KPI panel results into the narrative input (m04). Label falls
// back to the panel id; semantic flags pass through.
function collectKpiSummaries(panels: readonly PanelResult[]): DashboardKpiSummary[] {
  return panels
    .filter((p): p is Extract<PanelResult, { kind: 'kpi' }> => p.kind === 'kpi')
    .map((k) => ({
      label: k.title ?? k.id,
      formatted: k.formatted ?? String(k.value),
      trendDirection: k.trendDirection,
      delta: k.delta ?? null,
      ...(k.thresholdBreached !== undefined ? { thresholdBreached: k.thresholdBreached } : {}),
      ...(k.anomaly !== undefined ? { anomaly: k.anomaly } : {}),
    }));
}

function toNarrativeOutput(n: {
  readonly summary: string;
  readonly keyFindings: readonly string[];
}): NonNullable<DashboardRenderOutput['a11y']>['narrative'] {
  return { summary: n.summary, keyFindings: [...n.keyFindings] };
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
