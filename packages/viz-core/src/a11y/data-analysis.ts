import type { NormalizedVizSpec, TraitBinding } from '../spec/normalized-viz-spec.js';
import { deriveTrend, pearson, toNumber } from '../analysis/stats.js';
import { isProvablyAdditive } from '../analysis/field-name-hints.js';
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
  /**
   * s155 m04: whether summing `measureField` across rows is a PROVABLY meaningful aggregate
   * (isProvablyAdditive). The cartesian analyzeVizSpec sets it (true/false); the input-shaped
   * analyzers (sankey/hierarchy/network) and the pre-built-analysis path leave it UNDEFINED. The
   * narrative Total gate suppresses ONLY on an explicit `false`, so those paths stay byte-identical.
   */
  readonly measureAdditive?: boolean;
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
  /**
   * s155 m04: cartesian-only additive-measure verdict (isProvablyAdditive of measureField +
   * the caller's declared aggregate). Non-cartesian sources leave it undefined → the narrative
   * Total is unchanged for them (gate suppresses only on explicit false).
   */
  readonly measureAdditive?: boolean;
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
    measureAdditive: input.measureAdditive,
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

/**
 * s154 F3: the ONE derivation of the spec's KNOWN normalized marks — every mark trait mapped
 * through normalizeMark with 'unknown' (MarkRect/MarkRule/…) filtered out. Shared by resolveMark
 * AND isSequenceComposition so the two can never desync again (the s150 share-the-derivation
 * recipe). Before this, isSequenceComposition read the RAW marks (an 'unknown' failed its `.every`)
 * while resolveMark filtered 'unknown', so a line+rect spec collapsed to mark='line' yet had its
 * trend suppressed → the false "remains relatively flat" on rising data (s153 F3 MED).
 */
function knownNormalizedMarks(spec: NormalizedVizSpec): ChartShape[] {
  return spec.marks.map((mark) => normalizeMark(mark.trait)).filter((mark) => mark !== 'unknown');
}

/**
 * s154 F3 (Variant A): a first→last trend is meaningful only when every KNOWN mark is a sequence
 * mark — line or area, whose X is an ordered axis (time/continuum). Filtering 'unknown' (rather
 * than failing `.every` on it) RECONCILES with resolveMark: line+rect (rect→'unknown') is a line
 * composition at BOTH sites, so its honest directional trend is restored (the s153 F3 MED desync).
 * `point` is a KNOWN mark that is DELIBERATELY not line/area, so a point+line combo still fails the
 * `.every` and stays suppressed — a scatter's honest signal is the order-invariant correlation, not
 * a first-vs-last delta. A spec whose marks are ALL unknown (known.length === 0) is not a sequence.
 * MODULE-LOCAL (the a11y barrel is `export *`; tested via analyzeVizSpec/narrative effects).
 */
function isSequenceComposition(spec: NormalizedVizSpec): boolean {
  const known = knownNormalizedMarks(spec);
  return known.length > 0 && known.every((mark) => mark === 'line' || mark === 'area');
}

/**
 * s154 F3: a FACETED layout (small multiples) renders one panel per facet key, but the analyzers
 * walk the FLAT spec.data.values, concatenating every panel's rows. A first→last delta across that
 * concatenation is a guaranteed cross-panel phantom — it sign-inverts vs every real per-panel
 * series (confirmed HIGH: facet-small-multiples-line "Trend decreasing: -33.1%" while all panels
 * rise). rows / columns / rows+columns (matrix) / wrap are all LayoutFacet sub-shapes, so this one
 * predicate covers them all. LayoutLayer (shared axis, a real single series) and LayoutConcat
 * (deliberately out of scope — fork 2) are NOT faceted and keep their trend.
 */
function isFacetedLayout(spec: NormalizedVizSpec): boolean {
  return spec.layout?.trait === 'LayoutFacet';
}

/**
 * s155 m03: the fields that SPLIT the flat data walk into multiple ordered series — the color AND
 * detail groupings. resolveBinding reads the top-level encoding FIRST, then marks[].encodings, so
 * both the generated shape (top-level color) and the pattern-fixture shape (per-mark color, e.g.
 * focus-context-line) are covered. s155 m05 (adversarial-verify closure): BOTH channels are
 * returned, not `color ?? detail` — a genuine `detail`-grouped multi-series was slipping through
 * when a constant `color` binding shadowed the detail field. detail is conservative: it only ever
 * SUPPRESSES a genuine multi-series overlay, never invents a claim.
 */
// ── s158 m1: the STRUCTURAL SPINE (replaces the seriesGroupingFields / projectionGroupingFields
// per-channel allow-lists the s150→s157 meta-pattern indicts). ONE classification of every encoding
// channel, COMPILE-EXHAUSTIVE over the CLOSED EncodingMap (`keyof NormalizedVizSpec['encoding']`) —
// adding a 9th channel is a TYPE ERROR here, so a new grouping channel can NEVER silently under-key
// the projection or the trend gate (the recurrence's actual generator). Roles: 'positional' = x/y
// (an axis — contributes a grouping field only as a SECOND dimension: a field that is neither the
// primary dimension nor the measure, e.g. a heatmap y=hour); 'positional-range' = x2/y2 (band
// endpoints, never a grouping field); 'retinal' = color/size/shape (group marks ONLY when
// categorical; shape/size only on the marks Vega-Lite splits — point/line/area, NOT bar/rect);
// 'detail' = a pure series-grouping channel, always categorical.
type ChannelGroupingRole = 'positional' | 'positional-range' | 'retinal' | 'detail';

const CHANNEL_GROUPING_ROLE: Record<keyof NormalizedVizSpec['encoding'], ChannelGroupingRole> = {
  x: 'positional',
  y: 'positional',
  x2: 'positional-range',
  y2: 'positional-range',
  color: 'retinal',
  size: 'retinal',
  shape: 'retinal',
  detail: 'detail',
};

const POSITIONAL_CHANNELS = (
  Object.keys(CHANNEL_GROUPING_ROLE) as (keyof NormalizedVizSpec['encoding'])[]
).filter((channel) => CHANNEL_GROUPING_ROLE[channel] === 'positional');

// color, size, shape, detail — the discrete channels Vega-Lite can split drawn marks by.
const RETINAL_GROUPING_CHANNELS = (
  Object.keys(CHANNEL_GROUPING_ROLE) as (keyof NormalizedVizSpec['encoding'])[]
).filter((channel) => CHANNEL_GROUPING_ROLE[channel] === 'retinal' || CHANNEL_GROUPING_ROLE[channel] === 'detail');

// shape/size split marks into groups only on point/line/area (a symbol / size varies a line into
// multiple series); on bar/rect they are not drawn as separate marks.
function markSplitsByRetina(mark: ChartShape): boolean {
  return mark === 'point' || mark === 'line' || mark === 'area';
}

/**
 * s158 m2 (was the s155/s157 seriesGroupingFields allow-list, now DERIVED off the m1 role table):
 * the discrete channels that SPLIT the flat data walk into multiple ordered/drawn series. color /
 * detail / size preserve the s155/s157 behaviour; SHAPE is now included — Vega-Lite groups lines and
 * areas by shape exactly like color (decision #1255's "shape draws one path" premise was FALSE;
 * verified against the Vega-Lite line docs + equivalence-rules.ts:83, which already treats shape as a
 * series-distinguishing channel), mark-gated to point/line/area. detail/size/shape only ever SUPPRESS
 * a phantom, never invent one. A new EncodingMap channel forces a role above, so it cannot be missed.
 */
function seriesGroupingFields(spec: NormalizedVizSpec): string[] {
  const mark = resolveMark(spec);
  const fields: string[] = [];
  for (const channel of RETINAL_GROUPING_CHANNELS) {
    const field = resolveBinding(spec, channel)?.field;
    if (!field) {
      continue;
    }
    // shape carries series identity only on the marks Vega-Lite draws per-group (point/line/area);
    // on bar/rect it is not a separate drawn mark. (size preserves its prior unconditional handling.)
    if (channel === 'shape' && !markSplitsByRetina(mark)) {
      continue;
    }
    fields.push(field);
  }
  return fields;
}

// s155 m05: distinct GROUP count over a field, counting null/undefined as ITS OWN bucket. A color
// field split into null rows (a reference series) + labelled rows (a forecast series) is two series;
// dropping the nulls under-counted it to one and let a phantom trend through. A field that is
// entirely null (or entirely one value) stays a single bucket → not multi-series.
function distinctGroupCount(rows: readonly Record<string, unknown>[], field: string): number {
  const buckets = new Set<string>();
  for (const row of rows) {
    const value = row[field as keyof typeof row];
    buckets.add(value === null || value === undefined ? ' null' : String(value));
  }
  return buckets.size;
}

/**
 * s155 m03 (CLAIM-ON-POSITIVE-EVIDENCE): a first→last trend is a cross-series PHANTOM unless the
 * spec is provably a SINGLE ordered series. Multi-series ⟺ a FACETED layout (one panel per facet
 * key) OR a color/detail grouping field resolving to MORE THAN ONE distinct group over the rows.
 * This POSITIVE, data-grounded precondition (fail-safe to omission) folds the shipped facet fix +
 * LayoutConcat (fork-2, via its color arm — focus-context-line carries color=region ×3) +
 * color-grouped (fork-4) under ONE gate, replacing the s154 NEGATIVE `!isFacetedLayout`
 * enumeration that was false on every un-named series-concatenation surface. NO concat-structural
 * clause is needed: a real single-series concat has 0/1-distinct color, so it is NOT suppressed
 * and keeps its honest trend.
 */
function isMultiSeriesComposition(spec: NormalizedVizSpec, rows: readonly Record<string, unknown>[]): boolean {
  if (isFacetedLayout(spec)) {
    return true;
  }
  return seriesGroupingFields(spec).some((field) => distinctGroupCount(rows, field) > 1);
}

/**
 * s155 m03 (sort-by-X, memo §5): for a single ordered series, canonicalize the data points by the
 * X binding so the directional claim is a property of the DATA, not the incidental row order in
 * `data.values`. This closes the row-permutation phantom (#910) for LEGIT single lines too — a
 * time series stored newest-first no longer narrates "declines" for rising data. Numeric compare
 * when both cells parse as finite numbers (years / ordinals); else a stable string compare (ISO
 * dates, zero-padded period labels). Pure + stable (Array.sort is stable) for determinism.
 */
function sortRowsByField(
  rows: readonly Record<string, unknown>[],
  field: string,
): Record<string, unknown>[] {
  return [...rows].sort((a, b) => compareCells(a[field as keyof typeof a], b[field as keyof typeof b]));
}

// s157 m05 (V1): a STRING carrying a decimal dot is a version/release axis label
// (1.9 → 1.10 → 1.11), NOT a continuous number — Number('1.10')=1.1 collapses the trailing zero
// and sorts 1.10 BEFORE 1.9, narrating a phantom decline on a rising release series. A genuinely
// continuous value arrives as a NUMBER (1.5), never a dotted string, so gating on string-with-dot
// routes ONLY version labels to the chunk-wise naturalCompare (which reads each dotted part as an
// integer: 1.9 < 1.10 < 1.11 — a TOTAL order, so row-permutation-invariance holds); numeric axes
// keep the exact numeric fast-path.
function isDottedVersionString(value: unknown): boolean {
  return typeof value === 'string' && value.includes('.');
}

// s158 m5 (Fork 1, Derek-ratified): the DIMENSION axis is a version/release label (1.9, 1.10, 1.11)
// when any of its values is a dotted-version STRING. deriveCorrelation coerces the dimension via
// toNumber (Number('1.10')=1.1), so a rising release series inverts into a phantom "negative
// relationship" (the s157 dotted-version sibling of V1, in a DIFFERENT function). A version label has
// no continuous magnitude for Pearson, so SUPPRESS the correlation (same posture as the
// isMarkRectGrid / isStripPlot gate) rather than fabricate a coefficient. A genuinely continuous axis
// arrives as a NUMBER (isDottedVersionString(1.5)=false), so it is never suppressed. Reuses V1's
// discriminator; fail-safe to silence.
function isDottedVersionDimension(
  rows: readonly Record<string, unknown>[],
  dimensionField: string | undefined
): boolean {
  if (!dimensionField) {
    return false;
  }
  return rows.some((row) => isDottedVersionString(row[dimensionField as keyof typeof row]));
}

function compareCells(a: unknown, b: unknown): number {
  const na = toNumber(a);
  const nb = toNumber(b);
  if (na !== null && nb !== null && !isDottedVersionString(a) && !isDottedVersionString(b)) {
    return na - nb;
  }
  const sa = a === null || a === undefined ? '' : String(a);
  const sb = b === null || b === undefined ? '' : String(b);
  return naturalCompare(sa, sb);
}

// s155 m05 (adversarial-verify closure): a NATURAL-ORDER string comparison — split each label into
// maximal digit / non-digit chunks and compare chunk-wise, digit chunks NUMERICALLY. A plain
// lexical compare mis-ordered every non-zero-padded sequential label ('2021-9' after '2021-10',
// 'v10' before 'v9'), so sort-by-X narrated a DECLINE on rising release/monthly data. Natural order
// fixes it and is a TOTAL ORDER (transitive + deterministic — unlike a naive numeric/lexical mix),
// so the row-permutation invariant holds. Zero-padded/ISO/numeric labels are unaffected.
function naturalCompare(a: string, b: string): number {
  const ax = a.match(/\d+|\D+/g) ?? [];
  const bx = b.match(/\d+|\D+/g) ?? [];
  const n = Math.min(ax.length, bx.length);
  for (let i = 0; i < n; i += 1) {
    const as = ax[i];
    const bs = bx[i];
    if (as === bs) {
      continue;
    }
    if (/^\d/.test(as) && /^\d/.test(bs)) {
      const delta = Number(as) - Number(bs);
      if (delta !== 0) {
        return delta;
      }
    } else {
      return as < bs ? -1 : 1;
    }
  }
  return ax.length - bx.length;
}

export function analyzeVizSpec(spec: NormalizedVizSpec): VizDataAnalysis {
  const bindings = resolvePrimaryBindings(spec);
  const rows = collectRows(spec);
  const declaredAggregate = resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  // s156 m06 (CLAIM-ON-POSITIVE-EVIDENCE): when the measure carries a DECLARED aggregate and a
  // dimension is present, the rendered chart draws ONE reduced value per distinct dimension value
  // (Vega aggregates on the visual side; dashboard.render forwards the raw cross-filtered rows +
  // the aggregate encoding). Project the raw rows to that grouped shape so extrema/total/keyFindings
  // describe the values the chart DRAWS — not the pre-aggregation rows (raw East=60 vs grouped
  // East=110), and so a count/distinct over a NON-numeric measure yields ≥2 dataPoints instead of 0
  // (the false A11Y-R-11). POSITIVE precondition + fail-safe: fires ONLY when an aggregate is
  // declared, so the no-aggregate path is byte-identical (#564 / property P3).
  const analysisRows =
    declaredAggregate && bindings.dimensionField && bindings.measureField
      ? projectAggregatedRows(
          rows,
          bindings.dimensionField,
          bindings.measureField,
          declaredAggregate,
          // s157 m02 (B1/A2) + s158 m2: a stacking aggregate (sum/count) on a mark that ACTUALLY
          // stacks (bar/area) draws a per-dimension stack total — keep it dimension-level. Every
          // other case — non-stacking aggregates (avg/min/max/median/distinct) AND summative
          // aggregates on a non-stacking mark (a color-is-measure heatmap rect) — draws one mark per
          // (dimension × second-positional × grouping) cell → project per drawn cell so extrema/total
          // name a real mark (the s158 heatmap survivor fix).
          isStackTotalAggregate(declaredAggregate) && markStacks(bindings.mark)
            ? []
            : projectionGroupingFields(spec, bindings.dimensionField, bindings.measureField),
        )
      : rows;
  // s155 m03: a first→last trend is meaningful only over a SINGLE ordered series. When the marks
  // ARE a sequence (line/area), canonicalize the points by the X binding (sort-by-X) so first/last
  // — and thus the directional claim + narrative sentence — reflect the X axis, not the row order.
  // ORIGINAL `rows` still feed dimensionValues/colorCategories/rowCount (unchanged); only the
  // dataPoints that drive first/last/trend are reordered (min/max/total/mean are order-invariant).
  const sequence = isSequenceComposition(spec);
  const orderedRows =
    sequence && bindings.dimensionField ? sortRowsByField(analysisRows, bindings.dimensionField) : analysisRows;
  const dataPoints = buildDataPoints(orderedRows, bindings);
  // s155 m04 (CLAIM-ON-POSITIVE-EVIDENCE): resolve whether the measure is PROVABLY additive from
  // its raw field name + the caller's declared aggregate — the SAME token model the profiler types
  // with (shared field-name-hints). The narrative "Total X" gate reads this so a sum-the-IDs /
  // sum-the-zips / sum-the-maxes claim (id_max, sales_id, zip) is never emitted; a declared
  // aggregate:'sum'/'count' or an additive head (revenue, id_count) still gets its honest Total.
  const measureAdditive = isProvablyAdditive(bindings.measureField, declaredAggregate);
  const analysis = buildVizDataAnalysis({
    mark: bindings.mark,
    rows,
    dataPoints,
    dimensionField: bindings.dimensionField,
    measureField: bindings.measureField,
    colorField: bindings.colorField,
    sizeField: bindings.sizeField,
    measureAdditive,
    // s155 m03 (CLAIM-ON-POSITIVE-EVIDENCE, replaces the s154 `!isFacetedLayout` negative gate): a
    // directional trend is emitted only when the spec is PROVABLY a single ordered series
    // (isMultiSeriesComposition false) AND the marks are a sequence (line/area). Multi-series —
    // faceted, or a color/detail grouping with >1 distinct value — concatenates every series into
    // one flat walk, so a first→last delta sign-inverts vs each real series (fork-2 concat, fork-4
    // color-group). isSequenceComposition still excludes bar / point / rect / true scatter (their
    // honest signal is extrema or the order-invariant correlation, not a first-vs-last delta;
    // #910). When suppressed, the line/area path (narrative-generator.ts:203-214) emits an
    // order-invariant range sentence. The correlation gate below is UNCHANGED.
    computeTrend: !isMultiSeriesComposition(spec, rows) && sequence,
    correlation:
      isMarkRectGrid(spec) || isStripPlot(spec) || isDottedVersionDimension(rows, bindings.dimensionField)
        ? undefined
        : deriveCorrelation(rows, bindings),
  });
  // s158 m3: the PERMANENT drawn-value fail-safe (Fork 2, ratified). After every derivation, null any
  // narrated extremum / Total that is NOT a real drawn mark — checked against an INDEPENDENTLY-derived
  // drawn set (drawnMarkValueSet, on the raw-rows path) so it bites a future under-key even if the
  // root fix above is one day defeated by a new channel. Inert (byte-identical) when no aggregate is
  // declared. The root fix keeps it quiet; the guard is what survives the NEXT under-enumeration.
  return enforceDrawnValueInvariant(analysis, spec, declaredAggregate);
}

function resolveMark(spec: NormalizedVizSpec): ChartShape {
  const uniqueMarks = [...new Set(knownNormalizedMarks(spec))];
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

// s156 m06: reduce one group's raw measure values to the declared aggregate — mirrors the Vega
// adapter's mapAggregate (average→mean). count = record count; distinct = distinct non-null values;
// sum/average/min/max/median operate on the numeric values and are UNDEFINED for a group with no
// numeric values (you cannot sum/average strings — it drops rather than reporting a phantom 0).
function reduceAggregate(
  values: readonly unknown[],
  aggregate: NonNullable<TraitBinding['aggregate']>
): number | undefined {
  if (aggregate === 'count') {
    return values.length;
  }
  if (aggregate === 'distinct') {
    const seen = new Set<string>();
    for (const value of values) {
      if (value !== null && value !== undefined) {
        seen.add(String(value));
      }
    }
    return seen.size;
  }
  const numeric: number[] = [];
  for (const value of values) {
    const n = toNumber(value);
    if (n !== null) {
      numeric.push(n);
    }
  }
  if (numeric.length === 0) {
    return undefined;
  }
  if (aggregate === 'sum') {
    return numeric.reduce((sum, value) => sum + value, 0);
  }
  if (aggregate === 'average') {
    return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
  }
  if (aggregate === 'min') {
    return Math.min(...numeric);
  }
  if (aggregate === 'max') {
    return Math.max(...numeric);
  }
  // median
  const sorted = [...numeric].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// s157 m02 (A2, ratified + adapter-verified): the OODS Vega adapter (vega-lite-adapter.ts) emits
// NO explicit stack / xOffset — mapAggregate maps average→mean; sum/count/min/max/median/distinct
// pass through — so stacking is Vega-Lite's DEFAULT: a nominal-color quantitative bar/area STACKS
// only for the SUMMATIVE aggregates. For sum/count the salient DRAWN quantity is the per-dimension
// STACK TOTAL, which is exactly the s156 dimension-level reduction (sum-over-colors == the stack
// height), so keep the projection dimension-level. average/min/max/median draw side-by-side
// (grouped, non-stacked) cells → reduce PER DRAWN CELL. distinct is summative in Vega, BUT summing
// distinct counts across a stack is non-additive (the stack total ≠ distinct-over-the-dimension →
// a value drawn on NO segment), so distinct reduces per cell too — each cell value is a real drawn
// segment height. (Recorded per the A2 verify-and-match mandate.)
function isStackTotalAggregate(aggregate: NonNullable<TraitBinding['aggregate']>): boolean {
  return aggregate === 'sum' || aggregate === 'count';
}

// s158 m2: stacking (a per-dimension total drawn as ONE bar/area height) is a bar/area concept — a
// heatmap rect colours each (x,y) cell by its OWN aggregate, so a summative heatmap draws per cell,
// not a stack total. The stack-total collapse therefore applies only when the mark actually stacks;
// otherwise a sum/count color-is-measure heatmap would collapse its second positional dimension into
// a per-x marginal (the sum-heatmap sibling of the s157 survivor).
function markStacks(mark: ChartShape): boolean {
  return mark === 'bar' || mark === 'area';
}

// s158 m2 (B1 root fix — the s157 heatmap survivor): the SECOND positional dimension the chart draws
// marks over. A heatmap binds x AND y to dimensions with the measure on color, so each (x,y) rect is
// a distinct drawn cell; the primary dimension (x) heads the projection key, but y must ALSO be in it
// or the projection collapses y into a per-x MARGINAL mean drawn on NO rect (the s157 "67.8/22.6"
// survivor). A normal cartesian chart has exactly ONE positional dimension (x=dim, y=measure) → this
// returns undefined → the projection key is byte-identical. x2/y2 are band endpoints (role
// 'positional-range'), never a dimension. Derived off the m1 POSITIONAL_CHANNELS role list.
function secondaryPositionalDimensionField(
  spec: NormalizedVizSpec,
  dimensionField: string,
  measureField: string
): string | undefined {
  for (const channel of POSITIONAL_CHANNELS) {
    const field = resolveBinding(spec, channel)?.field;
    if (field && field !== dimensionField && field !== measureField) {
      return field;
    }
  }
  return undefined;
}

// s158 m2 (was s157 projectionGroupingFields, now role-derived): the discrete fields that distinguish
// DRAWN marks for the per-cell aggregate projection — the SECOND positional dimension PLUS the
// series-grouping channels (color/detail/size/shape) — EXCLUDING the measure and the primary
// dimension (already the key head; color==dimension redundant-recolor keeps the s156 m06 fix). Empty
// ⇒ the projection stays dimension-level (fail-safe / byte-identical to s156/s157). Because both the
// second-positional term and the grouping term derive from the m1 role table, a new grouping channel
// cannot silently drop out of the key — the anti-enumeration structural close of the s157 survivor.
function projectionGroupingFields(
  spec: NormalizedVizSpec,
  dimensionField: string,
  measureField: string
): string[] {
  const secondary = secondaryPositionalDimensionField(spec, dimensionField, measureField);
  const candidates = secondary ? [secondary, ...seriesGroupingFields(spec)] : seriesGroupingFields(spec);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const field of candidates) {
    if (field === measureField || field === dimensionField || seen.has(field)) {
      continue;
    }
    seen.add(field);
    out.push(field);
  }
  return out;
}

// s156 m06 / s157 m02: group the raw rows by the dimension field PLUS the secondary discrete
// grouping channels (groupingFields — empty for stacking aggregates + the no-secondary-grouping
// case, so the key collapses to the dimension alone = byte-identical grouping to s156), each group
// a DRAWN cell, and emit ONE row per group carrying the declared reduction as the measure field.
// First-appearance order; a null/undefined key part is its own bucket (' null' sentinel — never the
// literal string "null"). A group whose reduction is undefined (sum/avg/min/max/median over a
// non-numeric cell) drops out. Deterministic: group order = first-appearance order of the keys.
function projectAggregatedRows(
  rows: readonly Record<string, unknown>[],
  dimensionField: string,
  measureField: string,
  aggregate: NonNullable<TraitBinding['aggregate']>,
  groupingFields: readonly string[]
): Record<string, unknown>[] {
  const keyFields = [dimensionField, ...groupingFields];
  const order: string[] = [];
  const groups = new Map<string, { dimValue: unknown; values: unknown[] }>();
  for (const row of rows) {
    const dimValue = row[dimensionField as keyof typeof row];
    const key = keyFields
      .map((field) => {
        const value = row[field as keyof typeof row];
        return value === null || value === undefined ? ' null' : String(value);
      })
      .join(' ');
    let group = groups.get(key);
    if (!group) {
      group = { dimValue, values: [] };
      groups.set(key, group);
      order.push(key);
    }
    group.values.push(row[measureField as keyof typeof row]);
  }
  const projected: Record<string, unknown>[] = [];
  for (const key of order) {
    const group = groups.get(key);
    if (!group) {
      continue;
    }
    const reduced = reduceAggregate(group.values, aggregate);
    if (reduced === undefined) {
      continue;
    }
    projected.push({ [dimensionField]: group.dimValue, [measureField]: reduced });
  }
  return projected;
}

// ── s158 m3: the ORACLE-INDEPENDENT drawn-mark guard (Fork 2 — the PERMANENT fail-safe of record).
// The narrative may name only a value the chart actually DRAWS. drawnMarkValueSet recomputes the set
// of drawn values on the RAW-rows path (collectRows + reduceAggregate), keyed off the m1 role table —
// calling NONE of projectAggregatedRows / projectionGroupingFields / resolvePrimaryChannels' dimension
// resolution (the functions that produced the s157 phantom). So its membership check bites a narrated
// extremum drawn on no mark on a path the projection bug cannot corrupt.

// The single measure channel — the one carrying a declared aggregate. Independent of
// resolvePrimaryChannels' dimension resolution (which loses the heatmap's y).
function findAggregatedMeasure(
  spec: NormalizedVizSpec
): { field: string; aggregate: NonNullable<TraitBinding['aggregate']> } | undefined {
  for (const channel of Object.keys(CHANNEL_GROUPING_ROLE) as (keyof NormalizedVizSpec['encoding'])[]) {
    const binding = resolveBinding(spec, channel);
    if (binding?.field && binding.aggregate) {
      return { field: binding.field, aggregate: binding.aggregate };
    }
  }
  return undefined;
}

// The reduced value the chart draws for EACH mark, WITH multiplicity (so a repeated cell value is
// summed honestly into Total). Key = every positional dimension (≠ measure) plus, for a non-stacking
// draw, the categorical grouping channels; a stacking draw (sum/count on bar/area) draws the
// per-dimension stack total, so only the positional dimensions key it. Multi-row-per-cell is
// RE-REDUCED (an avg cell reports the cell's average, never a raw row). undefined ⇒ no aggregate.
function drawnMarkValues(spec: NormalizedVizSpec): number[] | undefined {
  const measure = findAggregatedMeasure(spec);
  if (!measure) {
    return undefined;
  }
  const stacking = isStackTotalAggregate(measure.aggregate) && markStacks(resolveMark(spec));
  const keyFields: string[] = [];
  const addKey = (field: string | undefined) => {
    if (field && field !== measure.field && !keyFields.includes(field)) {
      keyFields.push(field);
    }
  };
  for (const channel of POSITIONAL_CHANNELS) {
    addKey(resolveBinding(spec, channel)?.field);
  }
  if (!stacking) {
    for (const field of seriesGroupingFields(spec)) {
      addKey(field);
    }
  }
  const order: string[] = [];
  const groups = new Map<string, unknown[]>();
  for (const row of collectRows(spec)) {
    const key =
      keyFields.length === 0
        ? '∅'
        : keyFields
            .map((field) => {
              const value = row[field as keyof typeof row];
              return value === null || value === undefined ? ' null' : String(value);
            })
            .join(' ');
    let values = groups.get(key);
    if (!values) {
      values = [];
      groups.set(key, values);
      order.push(key);
    }
    values.push(row[measure.field as keyof typeof row]);
  }
  const drawn: number[] = [];
  for (const key of order) {
    const reduced = reduceAggregate(groups.get(key) ?? [], measure.aggregate);
    if (reduced !== undefined) {
      drawn.push(reduced);
    }
  }
  return drawn;
}

// A relative-epsilon numeric compare (float aggregates such as average must not spuriously miss).
function approxEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

// s158 m3 (the guard): null ONLY the offending extreme (never couple max/min) when its value is not a
// drawn mark; null Total when it ≠ the sum of the drawn values (relative epsilon). Positive
// precondition = a declared aggregate (else byte-identical pass-through); on no violation, returns the
// analysis unchanged (byte-identical). Never re-derives or relabels — honest silence, never a
// fabricated value; never touches analysis.rows.
function enforceDrawnValueInvariant(
  analysis: VizDataAnalysis,
  spec: NormalizedVizSpec,
  declaredAggregate: TraitBinding['aggregate'] | undefined
): VizDataAnalysis {
  if (!declaredAggregate) {
    return analysis;
  }
  const drawn = drawnMarkValues(spec);
  if (!drawn || drawn.length === 0) {
    return analysis;
  }
  const isDrawnValue = (value: number | undefined): boolean =>
    value !== undefined && drawn.some((cell) => approxEqual(cell, value));
  const nextMax = analysis.max && !isDrawnValue(analysis.max.value) ? undefined : analysis.max;
  const nextMin = analysis.min && !isDrawnValue(analysis.min.value) ? undefined : analysis.min;
  const drawnSum = drawn.reduce((sum, value) => sum + value, 0);
  const nextTotal =
    analysis.total !== undefined && !approxEqual(analysis.total, drawnSum) ? undefined : analysis.total;
  if (nextMax === analysis.max && nextMin === analysis.min && nextTotal === analysis.total) {
    return analysis;
  }
  return { ...analysis, max: nextMax, min: nextMin, total: nextTotal };
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
