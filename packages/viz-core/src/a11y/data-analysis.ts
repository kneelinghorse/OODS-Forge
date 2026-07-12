import type { NormalizedVizSpec, TraitBinding } from '../spec/normalized-viz-spec.js';
import { deriveTrend, pearson, toNumber } from '../analysis/stats.js';
import { formatDimension, formatNumeric } from './format.js';

export type ChartShape = 'bar' | 'line' | 'point' | 'area' | 'mixed' | 'unknown';

export interface DataPoint {
  readonly label: string;
  readonly value: number;
}

export interface VizDataAnalysis {
  readonly mark: ChartShape;
  readonly dimensionField?: string;
  readonly measureField?: string;
  readonly colorField?: string;
  readonly sizeField?: string;
  readonly rows: readonly Record<string, unknown>[];
  readonly rowCount: number;
  readonly dimensionValues: readonly string[];
  readonly numericValues: readonly number[];
  readonly sizeValues: readonly number[];
  readonly colorCategories: readonly string[];
  readonly min?: DataPoint;
  readonly max?: DataPoint;
  readonly first?: DataPoint;
  readonly last?: DataPoint;
  readonly total?: number;
  readonly mean?: number;
  readonly trend?: 'increasing' | 'decreasing' | 'flat';
  readonly trendDelta?: number;
  readonly correlation?: number;
}

/**
 * Bindings + pre-built data points for one analysis. The cartesian path
 * (analyzeVizSpec) resolves these from a NormalizedVizSpec; the input-shaped
 * non-cartesian analyzers (analyzeHierarchy/analyzeSankey/analyzeNetwork,
 * sprint-128 m01) build their own rows + data points and pass them here, so
 * every chart type computes its extrema/total/mean through ONE implementation.
 */
export interface VizDataAnalysisInput {
  readonly mark: ChartShape;
  readonly rows: readonly Record<string, unknown>[];
  readonly dataPoints: readonly DataPoint[];
  readonly dimensionField?: string;
  readonly measureField?: string;
  readonly colorField?: string;
  readonly sizeField?: string;
  /**
   * Cartesian-only: derive a first→last trend. Non-cartesian rows have no
   * inherent ordering, so the analyzers leave this off (no spurious trend).
   * s150: analyzeVizSpec ALSO leaves this off for a MarkRect grid (heatmap) — its
   * row-major melt order is arbitrary and X/Y are both dimensions, so a first→last
   * read is a phantom trend (the same class F6b suppressed for KPIs).
   */
  readonly computeTrend?: boolean;
  /** Cartesian-only Pearson r; non-cartesian sources leave this undefined. */
  readonly correlation?: number;
}

/**
 * The shared extrema/total/mean/category core. Pure: given the rows, the
 * measure data points, and the field bindings, produce the VizDataAnalysis the
 * table + narrative generators consume. analyzeVizSpec is the cartesian wrapper;
 * the non-cartesian analyzers are the input-shaped wrappers.
 */
export function buildVizDataAnalysis(input: VizDataAnalysisInput): VizDataAnalysis {
  const { mark, rows, dataPoints, dimensionField, measureField, colorField, sizeField } = input;
  const min = findExtreme(dataPoints, 'min');
  const max = findExtreme(dataPoints, 'max');
  const first = dataPoints.at(0);
  const last = dataPoints.at(-1);
  const numericValues = dataPoints.map((point) => point.value);
  const total = numericValues.length > 0 ? numericValues.reduce((sum, value) => sum + value, 0) : undefined;
  const mean = numericValues.length > 0 && total !== undefined ? total / numericValues.length : undefined;
  const dimensionValues = dimensionField ? extractDimensions(rows, dimensionField) : [];
  const sizeValues = sizeField ? extractNumericValues(rows, sizeField) : [];
  const colorCategories = colorField ? extractCategories(rows, colorField) : [];
  const trendInfo = input.computeTrend && first && last ? deriveTrend(first.value, last.value) : undefined;

  return {
    mark,
    dimensionField,
    measureField,
    colorField,
    sizeField,
    rows,
    rowCount: rows.length,
    dimensionValues,
    numericValues,
    sizeValues,
    colorCategories,
    min,
    max,
    first,
    last,
    total,
    mean,
    trend: trendInfo?.trend,
    trendDelta: trendInfo?.delta,
    correlation: input.correlation,
  } satisfies VizDataAnalysis;
}

/** s150: a MarkRect grid (heatmap) — X and Y are BOTH dimensions, the melt order is arbitrary. */
export function isMarkRectGrid(spec: NormalizedVizSpec): boolean {
  return spec.marks.length > 0 && spec.marks.every((m) => m.trait === 'MarkRect');
}

// s151 m05/m05b: the scale types that read as a quantitative measure — for a color channel
// (heatmap measure detection) AND for a position channel (point/scatter measure-channel
// detection). A documented local mirror of the cartesian adapter's QUANT_SCALE_TYPES
// (vega-lite-adapter.ts:12) — kept a local copy, not an import, so the a11y measure-detector
// carries no dependency on the adapter module.
const QUANT_SCALE_TYPES = new Set(['linear', 'log', 'sqrt']);

/**
 * s151 m05/m05b: a binding reads as a quantitative MEASURE per the field profiler's stamped
 * type/scale, NOT a coercive raw-cell `toNumber` probe (which mis-read numeric-string
 * categoricals as measures — s150 carry #895). Mirrors the adapter's own color/axis typing
 * (vega-lite-adapter.ts inferFieldType). Both branches are load-bearing: an UNSCALED
 * quantitative binding (the explicit-mode data-aware path stamps `type:'quantitative'`;
 * viz-a11y-equivalence-emission.spec.ts:53 'val') carries only `type`; a pinned binding carries
 * only `scale`. MODULE-LOCAL: the a11y barrel is `export *`, so a bare fn is not re-exported.
 */
function bindingIsQuantitative(binding: TraitBinding | undefined): boolean {
  if (!binding) return false;
  return binding.type === 'quantitative' || (binding.scale !== undefined && QUANT_SCALE_TYPES.has(binding.scale));
}

/**
 * s150 (fixes s149 F6d): a heatmap binds its MEASURE to COLOR only when color is a REAL
 * quantitative measure. Missing/categorical color → false → measure falls back to Y (pre-F6d),
 * the correct measure for a numeric-Y heatmap, which restores A11Y-R-11. ONE predicate,
 * evaluated on the SAME spec at BOTH the binding site (resolvePrimaryBindings) and the label
 * site (narrative-generator.resolveNarrativeInputs), so measure-values and measure-label can
 * never diverge again (the root cause of the s149 mislabel).
 *
 * s151 m05 (closes s150 carry #895): "quantitative" is decided by the field profiler's stamped
 * TYPE/SCALE (bindingIsQuantitative), NOT a coercive raw-cell probe. A numeric-STRING
 * categorical color (years / cluster codes / store IDs) profiles as ordinal → falls back to Y
 * (as the shipped #115 prose promises) instead of SUMMING the codes. Dropping the cell probe
 * STRENGTHENS null-tolerance (never .some()→.every()): a sparse quantitative-scale heatmap with
 * null cells stays a measure, decided purely on its scale/type.
 */
export function heatmapColorIsMeasure(spec: NormalizedVizSpec): boolean {
  if (!isMarkRectGrid(spec)) return false;
  return bindingIsQuantitative(getEncodingBinding(spec, 'color'));
}

/**
 * s151 m05b: a strip plot — a MarkPoint chart with a NOMINAL dimension axis, i.e. exactly ONE
 * of x/y is a quantitative measure (one measure + one categorical dimension). Its points have
 * NO inherent order (row-major ≠ a meaningful sequence) and form no x-vs-y relationship, so a
 * first→last trend and a Pearson correlation are BOTH phantom (the same class F6b/s150 killed
 * for KPIs/heatmaps). A TRUE numeric-numeric scatter (BOTH axes quantitative) is NOT a strip
 * plot → its trend/correlation are preserved. Two nominal axes (no measure) is not a strip plot.
 * MODULE-LOCAL: the a11y barrel is `export *`, so a bare fn is not re-exported (tested via its
 * effects on analyzeVizSpec/the narrative, not as a standalone public predicate).
 */
function isStripPlot(spec: NormalizedVizSpec): boolean {
  const marks = spec.marks.map((m) => normalizeMark(m.trait));
  if (marks.length === 0 || !marks.every((m) => m === 'point')) return false;
  const xq = bindingIsQuantitative(resolveBinding(spec, 'x'));
  const yq = bindingIsQuantitative(resolveBinding(spec, 'y'));
  return xq !== yq; // exactly one quantitative axis = one measure + one nominal dimension
}

export function analyzeVizSpec(spec: NormalizedVizSpec): VizDataAnalysis {
  const bindings = resolvePrimaryBindings(spec);
  const rows = collectRows(spec);
  const dataPoints = buildDataPoints(rows, bindings);
  return buildVizDataAnalysis({
    mark: bindings.mark,
    rows,
    dataPoints,
    dimensionField: bindings.dimensionField,
    measureField: bindings.measureField,
    colorField: bindings.colorField,
    sizeField: bindings.sizeField,
    // s152 F3: a first→last trend is only meaningful when the mark IS a sequence — line/area,
    // whose X is an ordered axis (time/continuum). For every OTHER mark the row order is
    // arbitrary, so "Trend increasing: N%" FLIPS sign on a mere row reversal: a MarkRect grid
    // (arbitrary melt, s150/F6d), a strip plot (unordered categories, s151 m05b), a nominal BAR
    // (category order is not a sequence), and a TRUE numeric-numeric SCATTER (whose honest signal
    // is the order-invariant correlation, not a first-vs-last delta that contradicts it). This
    // SEQUENCE-MARK ALLOWLIST subsumes the prior isMarkRectGrid/isStripPlot guards (heatmap→
    // 'unknown', strip→'point' both fail it) and finishes the phantom-row-order-Trend class
    // (unifies pre-existing #910). The line/area summary path (narrative-generator.ts:186-201)
    // depends on analysis.trend, so it is PRESERVED. The correlation gate below is UNCHANGED —
    // a true scatter keeps its order-invariant Correlation (only its phantom trend is dropped).
    computeTrend: bindings.mark === 'line' || bindings.mark === 'area',
    correlation: isMarkRectGrid(spec) || isStripPlot(spec) ? undefined : deriveCorrelation(rows, bindings),
  });
}

function resolveMark(spec: NormalizedVizSpec): ChartShape {
  const normalizedMarks = spec.marks.map((mark) => normalizeMark(mark.trait));
  const uniqueMarks = [...new Set(normalizedMarks.filter((mark) => mark !== 'unknown'))];
  return uniqueMarks.length === 1 ? uniqueMarks[0] : uniqueMarks.length > 1 ? 'mixed' : 'unknown';
}

/**
 * s151 m05b: the ONE derivation of which CHANNEL carries the measure vs the dimension — shared
 * by BOTH the binding site (resolvePrimaryBindings, which reads the VALUES) AND the label site
 * (narrative-generator.resolveNarrativeInputs, which reads the TITLES). A pure fn on the same
 * spec at both sites can't diverge, so measure-VALUES and measure-LABEL can never mismatch (the
 * s149 F6d root cause; the s150 KEY LEARNING — "share the derivation, don't re-derive"). Cases:
 *  - real heatmap (heatmapColorIsMeasure): measure = COLOR, dimension = X (s150).
 *  - HORIZONTAL strip plot (MarkPoint, quantitative X + nominal Y): measure = X, dimension = Y.
 *  - everything else (bar/line/area, vertical strip, numeric-numeric scatter): measure = Y,
 *    dimension = X (the pre-existing default — behaviour-preserving).
 */
export function resolvePrimaryChannels(spec: NormalizedVizSpec): {
  readonly measureChannel: 'x' | 'y' | 'color';
  readonly dimensionChannel: 'x' | 'y';
  readonly colorIsMeasure: boolean;
} {
  if (heatmapColorIsMeasure(spec)) {
    return { measureChannel: 'color', dimensionChannel: 'x', colorIsMeasure: true };
  }
  const horizontalStrip =
    resolveMark(spec) === 'point' &&
    bindingIsQuantitative(resolveBinding(spec, 'x')) &&
    !bindingIsQuantitative(resolveBinding(spec, 'y'));
  if (horizontalStrip) {
    return { measureChannel: 'x', dimensionChannel: 'y', colorIsMeasure: false };
  }
  return { measureChannel: 'y', dimensionChannel: 'x', colorIsMeasure: false };
}

function resolvePrimaryBindings(spec: NormalizedVizSpec): {
  readonly mark: ChartShape;
  readonly dimensionField?: string;
  readonly measureField?: string;
  readonly colorField?: string;
  readonly sizeField?: string;
} {
  const { measureChannel, dimensionChannel, colorIsMeasure } = resolvePrimaryChannels(spec);

  const dimensionBinding = resolveBinding(spec, dimensionChannel);
  const measureBinding = resolveBinding(spec, measureChannel);
  // COLOR IS the measure on a real heatmap — drop colorField so its values aren't listed as
  // "color category" findings. When color is categorical/absent we keep it as a normal series.
  const colorBinding = colorIsMeasure ? undefined : resolveBinding(spec, 'color');
  const sizeBinding = resolveBinding(spec, 'size');

  return {
    mark: resolveMark(spec),
    dimensionField: dimensionBinding?.field,
    measureField: measureBinding?.field,
    colorField: colorBinding?.field,
    sizeField: sizeBinding?.field,
  };
}

export function getEncodingBinding(
  spec: NormalizedVizSpec,
  channel: keyof NormalizedVizSpec['encoding']
): TraitBinding | undefined {
  return resolveBinding(spec, channel);
}

function resolveBinding(spec: NormalizedVizSpec, channel: keyof NormalizedVizSpec['encoding']): TraitBinding | undefined {
  const topLevel = spec.encoding?.[channel];
  if (topLevel) {
    return topLevel;
  }
  for (const mark of spec.marks) {
    const binding = mark.encodings?.[channel];
    if (binding) {
      return binding;
    }
  }
  return undefined;
}

function normalizeMark(traitId: string | undefined): ChartShape {
  if (!traitId) {
    return 'unknown';
  }
  const normalized = traitId.toLowerCase();
  if (normalized.includes('markbar')) {
    return 'bar';
  }
  if (normalized.includes('markline')) {
    return 'line';
  }
  if (normalized.includes('markpoint')) {
    return 'point';
  }
  if (normalized.includes('markarea')) {
    return 'area';
  }
  return 'unknown';
}

function collectRows(spec: NormalizedVizSpec): Record<string, unknown>[] {
  if (!Array.isArray(spec.data.values)) {
    return [];
  }
  const rows: Record<string, unknown>[] = [];
  for (const entry of spec.data.values) {
    if (isRecord(entry)) {
      rows.push(entry);
    }
  }
  return rows;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildDataPoints(
  rows: readonly Record<string, unknown>[],
  bindings: ReturnType<typeof resolvePrimaryBindings>
): DataPoint[] {
  if (!bindings.measureField) {
    return [];
  }
  const points: DataPoint[] = [];
  rows.forEach((row, index) => {
    const rawValue = row[bindings.measureField as keyof typeof row];
    const numericValue = toNumber(rawValue);
    if (numericValue === null) {
      return;
    }
    const label = bindings.dimensionField
      ? formatDimension(row[bindings.dimensionField as keyof typeof row])
      : undefined;
    points.push({ label: label ?? `Row ${index + 1}`, value: numericValue });
  });
  return points;
}

function extractDimensions(rows: readonly Record<string, unknown>[], field: string): string[] {
  const values: string[] = [];
  rows.forEach((row) => {
    const label = formatDimension(row[field as keyof typeof row]);
    if (label) {
      values.push(label);
    }
  });
  return values;
}

function extractNumericValues(rows: readonly Record<string, unknown>[], field: string): number[] {
  const values: number[] = [];
  rows.forEach((row) => {
    const numeric = toNumber(row[field as keyof typeof row]);
    if (numeric !== null) {
      values.push(numeric);
    }
  });
  return values;
}

function extractCategories(rows: readonly Record<string, unknown>[], field: string): string[] {
  const set = new Set<string>();
  rows.forEach((row) => {
    const value = row[field as keyof typeof row];
    if (value === null || value === undefined) {
      return;
    }
    set.add(String(value));
  });
  return [...set];
}

function findExtreme(points: readonly DataPoint[], kind: 'min' | 'max'): DataPoint | undefined {
  if (points.length === 0) {
    return undefined;
  }
  return points.reduce((extreme, current) => {
    if (kind === 'min') {
      return current.value < extreme.value ? current : extreme;
    }
    return current.value > extreme.value ? current : extreme;
  }, points[0]);
}

function deriveCorrelation(
  rows: readonly Record<string, unknown>[],
  bindings: ReturnType<typeof resolvePrimaryBindings>
): number | undefined {
  if (!bindings.dimensionField || !bindings.measureField) {
    return undefined;
  }
  const xs: number[] = [];
  const ys: number[] = [];
  rows.forEach((row) => {
    const x = toNumber(row[bindings.dimensionField as keyof typeof row]);
    const y = toNumber(row[bindings.measureField as keyof typeof row]);
    if (x === null || y === null) {
      return;
    }
    xs.push(x);
    ys.push(y);
  });
  // The single Pearson implementation lives in analysis/stats. It returns null
  // for <3 paired points or zero variance — surfaced here as undefined, the
  // narrator's unchanged contract.
  return pearson(xs, ys) ?? undefined;
}

export function describeDataPoint(point: DataPoint | undefined, measureLabel?: string): string | undefined {
  if (!point) {
    return undefined;
  }
  const label = measureLabel ? `${measureLabel}` : 'Value';
  return `${label} ${formatNumeric(point.value)} (${point.label})`;
}
