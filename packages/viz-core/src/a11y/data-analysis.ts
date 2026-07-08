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

/**
 * s150 (fixes s149 F6d): a heatmap binds its MEASURE to COLOR only when color is a REAL
 * quantitative measure. Missing/categorical color → false → measure falls back to Y (pre-F6d),
 * the correct measure for a numeric-Y heatmap, which restores A11Y-R-11. ONE predicate,
 * evaluated on the SAME spec at BOTH the binding site (resolvePrimaryBindings) and the label
 * site (narrative-generator.resolveNarrativeInputs), so measure-values and measure-label can
 * never diverge again (the root cause of the s149 mislabel). Pure: marks + color raw-cell probe.
 */
export function heatmapColorIsMeasure(spec: NormalizedVizSpec): boolean {
  if (!isMarkRectGrid(spec)) return false;
  const color = getEncodingBinding(spec, 'color');
  if (!color) return false;
  return isQuantitativeField(collectRows(spec), color.field);
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
    // s150: a MarkRect grid has NO inherent first→last order (arbitrary row-major melt) and X/Y
    // are both dimensions, so a first→last trend and an x-vs-measure Pearson r are both spurious
    // (same phantom class F6b killed for KPIs). Keyed on the RAW grid predicate — order-freeness
    // is independent of the measure channel, so a numeric-Y fallback heatmap is suppressed too.
    computeTrend: !isMarkRectGrid(spec),
    correlation: isMarkRectGrid(spec) ? undefined : deriveCorrelation(rows, bindings),
  });
}

function resolvePrimaryBindings(spec: NormalizedVizSpec): {
  readonly mark: ChartShape;
  readonly dimensionField?: string;
  readonly measureField?: string;
  readonly colorField?: string;
  readonly sizeField?: string;
} {
  const normalizedMarks = spec.marks.map((mark) => normalizeMark(mark.trait));
  const uniqueMarks = [...new Set(normalizedMarks.filter((mark) => mark !== 'unknown'))];
  const mark = uniqueMarks.length === 1 ? uniqueMarks[0] : uniqueMarks.length > 1 ? 'mixed' : 'unknown';

  // s150 (fixes s149 F6d): a MarkRect heatmap encodes its MEASURE on the COLOR channel — X and
  // Y are BOTH dimensions — but ONLY when color is a real quantitative measure. s149 gated on
  // marks alone, so a numeric-Y heatmap with categorical/absent color read the (non-numeric)
  // color as the measure, emptied the analysis, and NEWLY tripped its OWN A11Y-R-11 warn. P1
  // heatmapColorIsMeasure adds the color-exists + color-numeric conditions: true → measure=COLOR
  // (the real quantitative values); false → fall back to Y (pre-F6d), the correct measure for a
  // numeric-Y heatmap, which restores R-11. The SAME predicate gates the label (narrative-
  // generator), so measure-values and measure-label can never diverge again (the mislabel root).
  const useColorMeasure = heatmapColorIsMeasure(spec);

  const dimensionBinding = resolveBinding(spec, 'x');
  const measureBinding = useColorMeasure ? resolveBinding(spec, 'color') : resolveBinding(spec, 'y');
  // COLOR IS the measure on a real heatmap — drop colorField so its values aren't listed as
  // "color category" findings. When color is categorical/absent we keep it as a normal series.
  const colorBinding = useColorMeasure ? undefined : resolveBinding(spec, 'color');
  const sizeBinding = resolveBinding(spec, 'size');

  return {
    mark,
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

/**
 * s150: does `field` carry at least one numeric cell? MODULE-LOCAL — do NOT export (the a11y
 * barrel is `export * from './data-analysis.js'`, so exporting this would leak it into
 * @oods/viz-core's public API). `.some()` is load-bearing: `.every()` would flip false on a
 * single null/missing cell and re-break genuine heatmaps. Uses `toNumber` — what buildDataPoints
 * actually consumes downstream — NOT the `type` marker (undefined on a pinned color binding).
 */
function isQuantitativeField(rows: readonly Record<string, unknown>[], field: string): boolean {
  return rows.some((row) => toNumber(row[field as keyof typeof row]) !== null);
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
