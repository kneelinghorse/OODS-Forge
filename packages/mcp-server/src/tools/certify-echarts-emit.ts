// artifact.certify's ECharts RE-EMIT + determinism proof (sprint-172 m02).
//
// The cartesian determinism proof is `first = canonicalize(toVegaLiteSpec(spec))`, a
// SECOND independent compile byte-compared against it, and `sha256(first)`. This module
// is that same mechanism on the ECharts-primary operand, and its honesty depends
// entirely on replaying viz.render's emission EXACTLY:
//
//   1. the SAME pure adapter call — (spec, branchData), geo via the shared builder;
//   2. the SAME JSON projection — JSON.parse(JSON.stringify(option)), which drops the
//      tooltip `formatter` closure (and bubble_map's symbolSize function) because those
//      are what the MCP wire drops;
//   3. the SAME __joinDiagnostics strip, and __registration DELIBERATELY KEPT — it rides
//      the served bytes for the geo types, so a hash taken without it would be a hash of
//      something no consumer receives;
//   4. sha256(canonicalize(projected)) over that object.
//
// Get any of those four wrong and certify's contentHash can never equal viz.render's for
// the same (spec, data). That equality is the pillar's whole claim, and it is asserted
// LIVE cross-tool (no pinned hashes) in artifact.certify.echarts-determinism.spec.ts.
//
// SCOPE, stated because the pillar would otherwise overclaim:
//   - the proof is over the OPTION, not the picture. force_graph's on-screen layout is
//     runtime physics with no baked seed, so a stable option does not mean a stable
//     rendering. The note says so on force_graph verdicts.
//   - palette/chrome resolution reads the INSTALLED @oods/tokens bundle at module load
//     (viz-core token-resolver.ts), so hash identity across processes assumes one bundle
//     version. The note says so on every verdict.
//   - the claim is scoped to the (spec, data) pair SUPPLIED TO BOTH TOOLS. certify says
//     nothing about what the caller actually rendered.

import { canonicalize, sha256 } from '@oods/artifacts';
import {
  adaptChordToECharts,
  adaptGraphToECharts,
  adaptSankeyToECharts,
  adaptSunburstToECharts,
  adaptTreemapToECharts,
  type HierarchyInput,
  type NetworkInput,
  type NormalizedVizSpec,
  type SankeyInput,
} from '@oods/viz-core';
import type { EChartsPrimaryType } from './echarts-primary.js';
import { renderGeoOption, type GeoBranch, type GeoChartType } from './echarts-geo-option.js';

export type EChartsPrimaryOption = ReturnType<typeof adaptTreemapToECharts>;

/**
 * Build the raw adapter option for (spec, branchData) — the pre-projection object, with
 * its tooltip formatter closure still attached. Throws exactly what viz.render's adapters
 * throw; the caller maps the throw onto the same error partition.
 */
export function emitRawEChartsOption(
  spec: NormalizedVizSpec,
  chartType: EChartsPrimaryType,
  branchData: unknown,
): EChartsPrimaryOption {
  switch (chartType) {
    case 'treemap':
      return adaptTreemapToECharts(spec, branchData as HierarchyInput);
    case 'sunburst':
      return adaptSunburstToECharts(spec, branchData as HierarchyInput);
    case 'sankey':
      return adaptSankeyToECharts(spec, branchData as SankeyInput);
    case 'chord':
      return adaptChordToECharts(spec, branchData as SankeyInput);
    case 'force_graph':
      return adaptGraphToECharts(spec, branchData as NetworkInput);
    default:
      // choropleth / bubble_map / flow_map, through the s172 m01-extracted shared builder —
      // the SAME identity resolution viz.render uses (spec.id already carries
      // `input.id ?? 'viz:<chartType>'`, so the two paths land on the same id).
      //
      // That last clause was FALSE from s172 until s173 m01: it described the builder's
      // contract, while viz.render's own call site dropped a falsy id before the builder
      // ever saw it (defects 1+2 of the s172 review). Both call sites now pass `id`
      // unconditionally; artifact.certify.geo-id-parity.spec.ts enumerates the three values
      // an optional identity can take and compares the two paths' emitted bytes on each.
      return renderGeoOption(
        { id: spec.id, ...(spec.name ? { name: spec.name } : {}) },
        chartType as GeoChartType,
        branchData as GeoBranch,
        spec.a11y.description,
      ).option;
  }
}

/**
 * viz.render's JSON projection, replayed byte-for-byte (viz.render.ts: the
 * JSON.parse(JSON.stringify(option)) + `delete __joinDiagnostics` pair).
 *
 * __registration is NOT stripped: geo options are not self-contained and the
 * FeatureCollection rides back to the client on it, so it is part of the served payload
 * and part of its identity.
 */
export function projectEChartsOption(option: EChartsPrimaryOption): Record<string, unknown> {
  const projected = JSON.parse(JSON.stringify(option)) as Record<string, unknown>;
  delete projected.__joinDiagnostics;
  return projected;
}

export interface EChartsDeterminismResult {
  readonly stable: boolean;
  readonly contentHash: string;
}

export interface EChartsEmitFailure {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
}

export type EChartsDeterminismOutcome =
  | ({ readonly ok: true } & EChartsDeterminismResult)
  | EChartsEmitFailure;

/**
 * viz.render's own throw partition (viz.render.ts's renderEChartsPrimary catch), replayed
 * so a bad operand fails certify with the SAME code it fails render with.
 */
function emitFailure(err: unknown): EChartsEmitFailure {
  const name = err instanceof Error ? err.name : 'Error';
  const message = err instanceof Error ? err.message : String(err);
  const code =
    name === 'SankeyValidationError' || name === 'GeoInputError'
      ? 'OODS-V126'
      : name === 'EChartsAdapterError'
        ? 'OODS-V128'
        : 'OODS-V129';
  return { ok: false, code, message };
}

/**
 * The determinism proof: emit, project, canonicalize; emit a SECOND time and byte-compare.
 * The second emit IS the proof — it is not a redundant call to optimize away.
 */
export function evaluateEChartsDeterminism(
  spec: NormalizedVizSpec,
  chartType: EChartsPrimaryType,
  branchData: unknown,
): EChartsDeterminismOutcome {
  try {
    const first = canonicalize(projectEChartsOption(emitRawEChartsOption(spec, chartType, branchData)));
    const second = canonicalize(projectEChartsOption(emitRawEChartsOption(spec, chartType, branchData)));
    return { ok: true, stable: first === second, contentHash: sha256(first) };
  } catch (err) {
    return emitFailure(err);
  }
}

// ---- the notes ---------------------------------------------------------------------

/**
 * The operand-absent note (a DECLARED notes[] movement on the ECharts {spec}-only path,
 * s172 §1g). It names the remedy rather than just the state: an ECharts-primary IR is
 * metadata-only, so 'unchecked' here is a missing OPERAND, not a missing capability.
 */
export function operandAbsentDeterminismNote(trait: string): string {
  return `Determinism is unchecked for ${trait}: an ECharts-primary IR is metadata-only (data:{values:[]}, encoding:{}), so the chart's own data is not in it. Supply the matching \`data\` branch and certify re-emits the ECharts option twice and reports a real determinism verdict plus a contentHash.`;
}

/**
 * The scoping note that ships WITH a real ECharts determinism verdict. Three clauses, and
 * each is here because the verdict would otherwise be read as claiming more than it does.
 * The force_graph clause is emitted only for force_graph — it is a statement of fact about
 * that adapter, and printing it on a treemap verdict would be noise, not honesty.
 */
export function determinismScopeNote(chartType: EChartsPrimaryType): string {
  const base =
    'This determinism verdict is over the emitted ECharts OPTION for the (spec, data) pair supplied to THIS call — certify makes no claim about what the caller actually rendered. Hash identity across processes assumes one installed @oods/tokens bundle version: palette and chrome are resolved from that bundle at module load.';
  return chartType === 'force_graph'
    ? `${base} force_graph additionally: the option is deterministic, but the rendered layout is runtime force physics with no baked seed, so the picture is not covered by this verdict.`
    : base;
}
