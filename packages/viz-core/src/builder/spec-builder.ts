// Headless rows -> NormalizedVizSpec builder (sprint-109 m02).
//
// Two modes:
//   - EXPLICIT: caller supplies chartType + encodings. ZERO recommender
//     involvement; we just assemble a valid, data-bound spec.
//   - SUGGEST: chartType omitted. A lightweight, clearly-gated field-profile
//     inferencer turns the rows into a count-based SchemaIntent, the existing
//     recommender picks a chartType, and we auto-assign encodings.
//
// In BOTH modes a11y.description is ALWAYS synthesized non-empty (the AJV trap),
// and the result is run through assertNormalizedVizSpec so the builder can never
// return an invalid spec.

import {
  assertNormalizedVizSpec,
  type NormalizedVizSpec,
  type TraitBinding,
} from '../spec/normalized-viz-spec.js';
import type { ChartType, FieldType, IntentGoal } from '../patterns/index.js';
import {
  suggestPatterns,
  type SchemaIntent,
  CORRELATION_RELATIONSHIP_GATE,
  DENSITY_DENSE_ROW_COUNT,
  DENSITY_SPARSE_ROW_COUNT,
  HIGH_CARDINALITY_DIMENSION,
  PART_TO_WHOLE_MAX_CARDINALITY,
} from '../patterns/suggest-chart.js';
import {
  mean,
  pearson,
  populationStdDev,
  round,
  skewness,
  toNumber,
  tukeyOutlierCount,
} from '../analysis/stats.js';
import { detectGeoFields, type GeoFieldDetection } from '../analysis/geo-detection.js';
import {
  everyValueIsTemporal,
  summarizeTemporal,
  type TemporalGranularity,
} from '../analysis/temporal.js';

// Re-export so the data-aware temporal granularity type is reachable from the
// package root (e.g. the viz.render handler/schema in mcp-server).
export type { TemporalGranularity } from '../analysis/temporal.js';

export type EncodingChannel = 'x' | 'y' | 'color' | 'size' | 'shape' | 'detail';

/** Per-channel binding input. A bare string is shorthand for `{ field }`. */
export interface EncodingInput {
  readonly field: string;
  readonly aggregate?: TraitBinding['aggregate'];
  readonly scale?: TraitBinding['scale'];
  readonly timeUnit?: TraitBinding['timeUnit'];
  readonly sort?: TraitBinding['sort'];
  readonly title?: string;
}

export interface BuildVizSpecInput {
  readonly rows: ReadonlyArray<Record<string, unknown>>;
  /** Omit to enter suggest mode (infer profiles -> recommender -> chartType). */
  readonly chartType?: ChartType;
  /** Explicit channel bindings. Required in explicit mode (needs at least x + y). */
  readonly encodings?: Partial<Record<EncodingChannel, EncodingInput | string>>;
  readonly id?: string;
  readonly name?: string;
  /** Override the synthesized a11y description. */
  readonly description?: string;
}

/** Geographic role detected from a field's NAME (advisory typing; no rendering). */
export type GeoKind = 'lat' | 'lon' | 'region' | 'none';

/**
 * Inferred per-field profile. `cardinality` is the count of distinct non-null
 * values. The sprint-110 data-aware fields are all OPTIONAL and only present
 * when meaningful for the field's type, so every existing caller stays valid and
 * a profile carries no noise stats it cannot fill.
 */
export interface FieldProfile {
  readonly name: string;
  readonly type: FieldType;
  readonly role: 'measure' | 'dimension';
  readonly cardinality: number;
  /** Distinct-non-null count ÷ present-value count, in [0,1]. */
  readonly distinctRatio?: number;
  // Numeric-field statistics (present when every value is numeric — quantitative
  // or ordinal fields). All rounded to 6dp for cross-platform golden stability.
  readonly min?: number;
  readonly max?: number;
  readonly mean?: number;
  readonly stddev?: number;
  readonly skew?: number;
  readonly outlierCount?: number;
  readonly hasNegative?: boolean;
  readonly hasZero?: boolean;
  readonly isInteger?: boolean;
  // Temporal-field statistics (present when type === 'temporal').
  readonly temporalGranularity?: TemporalGranularity;
  readonly temporalRegular?: boolean;
  /** Detected geographic role; omitted when 'none' (advisory — geo rendering deferred). */
  readonly geoKind?: GeoKind;
}

/** Local mutable view used while assembling a FieldProfile incrementally. */
type MutableFieldProfile = { -readonly [K in keyof FieldProfile]: FieldProfile[K] };

export interface BuildVizSpecResult {
  readonly spec: NormalizedVizSpec;
  readonly chartType: ChartType;
  readonly mode: 'explicit' | 'suggest';
  /**
   * Present in suggest mode only: the recommender pick that drove the chartType,
   * including the scorer's `signals` (the human-readable rationale).
   */
  readonly suggestion?: {
    readonly patternId: string;
    readonly score: number;
    readonly signals: ReadonlyArray<string>;
  };
  /** Present in suggest mode only: the inferred field profiles. */
  readonly inferredFields?: ReadonlyArray<FieldProfile>;
  /**
   * Present in suggest mode only: true when no pattern matched confidently — the
   * chartType is then a low-confidence fallback rather than a positive pick. Makes
   * the previously-silent `bar` default detectable to callers.
   */
  readonly lowConfidence?: boolean;
  /** Present in suggest mode only: the runner-up recommendations (next best picks). */
  readonly alternatives?: ReadonlyArray<{
    readonly patternId: string;
    readonly score: number;
    readonly chartType: ChartType;
  }>;
}

export class VizSpecBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VizSpecBuilderError';
  }
}

const ENCODING_TRAIT: Record<EncodingChannel, string> = {
  x: 'EncodingPositionX',
  y: 'EncodingPositionY',
  color: 'EncodingColor',
  size: 'EncodingSize',
  shape: 'EncodingShape',
  detail: 'EncodingDetail',
};

// chartType -> mark trait, matching the adapter MARK_TRAIT_MAP (scatter => point/MarkPoint).
// The network/hierarchy types (treemap/sunburst/sankey) keep these Record<ChartType>
// maps total; they are explicit-only and render through their dedicated adapters,
// never through this builder's assembleSpec, so the entries are for type-exhaustiveness,
// not exercised code paths (sprint-111 m01/m03).
const CHART_TYPE_MARK: Record<ChartType, string> = {
  bar: 'MarkBar',
  line: 'MarkLine',
  area: 'MarkArea',
  scatter: 'MarkPoint',
  heatmap: 'MarkRect',
  treemap: 'MarkTreemap',
  sunburst: 'MarkSunburst',
  sankey: 'MarkSankey',
  force_graph: 'MarkGraph',
  choropleth: 'MarkChoropleth',
  bubble_map: 'MarkBubble',
  flow_map: 'MarkFlow',
};

const CHART_TYPE_LABEL: Record<ChartType, string> = {
  bar: 'Bar chart',
  line: 'Line chart',
  area: 'Area chart',
  scatter: 'Scatter plot',
  heatmap: 'Heatmap',
  treemap: 'Treemap',
  sunburst: 'Sunburst',
  sankey: 'Sankey diagram',
  force_graph: 'Force-directed graph',
  choropleth: 'Choropleth map',
  bubble_map: 'Bubble map',
  flow_map: 'Flow map',
};

// --- semantic-type thresholds (literature-defensible, documented — NOT magic) -
// A small, repeated set of integers reads as an ordinal scale (a rank/code), not
// a quantitative measure. The cardinality cap mirrors the common "treat ≤N
// distinct integers as ordinal" practice; the min-rows + distinct-ratio guards
// keep small fixtures and genuine high-distinct measures out of the bucket.
const ORDINAL_MIN_ROWS = 8;
const ORDINAL_MAX_CARDINALITY = 12;
const ORDINAL_MAX_DISTINCT_RATIO = 0.5;
// Plausible 4-digit calendar-year window for the name-gated year → temporal check.
const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

// Suggest-mode confidence floor: a confident pick clears the count-shape match
// (a goal match alone is +5, each range match +4). Below this the top pick is a
// weak/fallback recommendation and `lowConfidence` is flagged. m04 surfaces a
// normalized confidence; this is the in-engine "is the bar a real pick?" gate.
const LOW_CONFIDENCE_SCORE = 8;

// --- public API -------------------------------------------------------------

export function buildVizSpecFromRows(input: BuildVizSpecInput): BuildVizSpecResult {
  const rows = input.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new VizSpecBuilderError('buildVizSpecFromRows requires a non-empty rows array.');
  }

  if (input.chartType) {
    return buildExplicit(input, input.chartType);
  }
  return buildSuggested(input);
}

/**
 * Deterministic, DATA-AWARE per-field profiler (sprint-110 m01). Beyond
 * type/role/cardinality it computes real statistics — numeric range/mean/stddev/
 * skew/outliers/negativity, distinct-ratio, integer-ness, temporal granularity +
 * regularity, and a name-detected geographic role — in a single pass per field.
 *
 * Type inference is hardened against the #686 misclassifications: numeric-looking
 * year/zip/currency-code columns no longer read as quantitative measures, and
 * non-ISO date text (MM/DD/YYYY, "Mar 2024", YYYY-Qn) is recognised as temporal.
 * Determinism is the contract — same rows yield a byte-identical FieldProfile[]
 * (fixed reduction order, 6dp rounding, UTC-pinned date parsing).
 *
 * Still gates SUGGEST mode only — explicit mode (caller declares chartType +
 * encodings) never relies on inference.
 */
export function inferFieldProfile(
  rows: ReadonlyArray<Record<string, unknown>>,
  fieldNames?: ReadonlyArray<string>,
): FieldProfile[] {
  const names = fieldNames ?? collectFieldNames(rows);
  const geo = detectGeoFields(rows);
  return names.map((name) => buildFieldProfile(name, rows, geo));
}

function buildFieldProfile(
  name: string,
  rows: ReadonlyArray<Record<string, unknown>>,
  geo: GeoFieldDetection,
): FieldProfile {
  const present = rows
    .map((row) => row[name])
    .filter((v) => v !== null && v !== undefined && v !== '');
  const type = inferFieldType(name, present);
  const cardinality = new Set(present.map((v) => String(v))).size;
  const role: 'measure' | 'dimension' = type === 'quantitative' ? 'measure' : 'dimension';

  const profile: MutableFieldProfile = { name, type, role, cardinality };

  const geoKind = geoKindFor(name, geo);
  if (geoKind !== 'none') {
    profile.geoKind = geoKind;
  }
  if (present.length > 0) {
    profile.distinctRatio = round(cardinality / present.length);
  }

  if (type === 'temporal') {
    const summary = summarizeTemporal(present);
    if (summary) {
      profile.temporalGranularity = summary.granularity;
      profile.temporalRegular = summary.regular;
    }
    return profile;
  }

  // Numeric statistics for numeric-typed fields (quantitative + ordinal). The
  // values are all numeric by construction of the type decision below.
  if (type === 'quantitative' || type === 'ordinal') {
    const nums = present.map((v) => toNumber(v)).filter((n): n is number => n !== null);
    if (nums.length > 0) {
      const meanValue = mean(nums);
      const stdDev = populationStdDev(nums, meanValue);
      profile.min = round(Math.min(...nums));
      profile.max = round(Math.max(...nums));
      profile.mean = round(meanValue);
      profile.stddev = round(stdDev);
      profile.skew = round(skewness(nums, meanValue, stdDev));
      profile.outlierCount = tukeyOutlierCount(nums);
      profile.hasNegative = nums.some((n) => n < 0);
      profile.hasZero = nums.some((n) => n === 0);
      profile.isInteger = nums.every((n) => Number.isInteger(n));
    }
  }

  return profile;
}

function geoKindFor(name: string, geo: GeoFieldDetection): GeoKind {
  if (geo.latField === name) return 'lat';
  if (geo.lonField === name) return 'lon';
  if (geo.regionField === name) return 'region';
  return 'none';
}

/**
 * Pearson correlation between two fields' numeric values (per-pair, row-aligned —
 * a row contributes only when BOTH cells are numeric). Routes through the single
 * stats.pearson implementation; returns null for <3 paired points or zero
 * variance. m02 consumes this to derive SchemaIntent.correlationStrength.
 */
export function fieldCorrelation(
  rows: ReadonlyArray<Record<string, unknown>>,
  fieldA: string,
  fieldB: string,
): number | null {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const row of rows) {
    const x = toNumber(row[fieldA]);
    const y = toNumber(row[fieldB]);
    if (x === null || y === null) {
      continue;
    }
    xs.push(x);
    ys.push(y);
  }
  return pearson(xs, ys);
}

/**
 * Derive the SchemaIntent the recommender consumes from field profiles.
 *
 * sprint-110 m02 makes this DATA-AWARE: it stops discarding the profile and
 * POPULATES the previously-dead scorer fields (density / allowNegative /
 * partToWhole / matrix) plus carriers (cardinality / correlationStrength), and
 * refines goal gating — `trend` requires a regular temporal axis (not just any
 * temporal field), `relationship` requires a measured correlation above the
 * documented gate (an uncorrelated pair is better compared than scatter-plotted).
 *
 * `rows` is OPTIONAL and additive: the count-based behaviour is preserved when
 * it is omitted (so existing callers keep working), while the rows path supplies
 * the real data signals — correlation and density — that need the values.
 */
export function toSchemaIntent(
  profiles: ReadonlyArray<FieldProfile>,
  rows?: ReadonlyArray<Record<string, unknown>>,
): SchemaIntent {
  const measureProfiles = profiles.filter((f) => f.type === 'quantitative');
  const temporalProfiles = profiles.filter((f) => f.type === 'temporal');
  const dimensionProfiles = profiles.filter((f) => f.type === 'nominal' || f.type === 'ordinal');

  const measures = measureProfiles.length;
  const temporals = temporalProfiles.length;
  const dimensions = dimensionProfiles.length;

  // A temporal field drives a TREND only when it is a real, regularly-spaced time
  // axis — an irregular or single-point "temporal" is not a time series.
  const hasRegularTemporal = temporalProfiles.some((f) => f.temporalRegular !== false);

  // |Pearson r| of the primary two-measure pair, when we have rows to measure it.
  let correlationStrength: number | undefined;
  if (measures >= 2 && rows && rows.length > 0) {
    const r = fieldCorrelation(rows, measureProfiles[0].name, measureProfiles[1].name);
    if (r !== null) {
      correlationStrength = Math.abs(r);
    }
  }

  let goal: IntentGoal;
  if (hasRegularTemporal) {
    goal = 'trend';
  } else if (measures >= 2 && dimensions === 0) {
    // RELATIONSHIP only when the pair is actually correlated. When correlation is
    // unmeasurable (no rows / <3 points) fall back to the count-based call so
    // existing profile-only callers keep their relationship result.
    const correlated =
      correlationStrength === undefined || correlationStrength >= CORRELATION_RELATIONSHIP_GATE;
    goal = correlated ? 'relationship' : 'comparison';
  } else {
    goal = 'comparison';
  }

  // Negative values unlock diverging encodings (the scorer weights allowNegative).
  const allowNegative = measureProfiles.some((f) => f.hasNegative === true);

  // Density preference from row count; left undefined in the indeterminate middle.
  let density: SchemaIntent['density'];
  if (rows) {
    if (rows.length >= DENSITY_DENSE_ROW_COUNT) density = 'dense';
    else if (rows.length <= DENSITY_SPARSE_ROW_COUNT) density = 'sparse';
  }

  const nominalCardinalities = dimensionProfiles.map((f) => f.cardinality);
  const maxNominalCardinality =
    nominalCardinalities.length > 0 ? Math.max(...nominalCardinalities) : undefined;
  const hasHighCardinalityDim =
    maxNominalCardinality !== undefined && maxNominalCardinality >= HIGH_CARDINALITY_DIMENSION;

  // Part-to-whole: ≥2 low-cardinality categorical series over an all-positive
  // measure reads as composition. Conservative — gated on small cardinality so a
  // high-cardinality category set never qualifies.
  const lowCardDimensions = dimensionProfiles.filter(
    (f) => f.cardinality >= 2 && f.cardinality <= PART_TO_WHOLE_MAX_CARDINALITY,
  );
  const partToWhole = measures >= 1 && !allowNegative && lowCardDimensions.length >= 2;

  // Matrix (heatmap grid): two categorical dimensions crossed by a measure, dense
  // enough to read as a grid. Gated on density so small data is not over-matrixed.
  const matrix = measures >= 1 && dimensions >= 2 && temporals === 0 && density === 'dense';

  return {
    measures,
    dimensions,
    temporals,
    goal,
    multiMetrics: measures >= 2,
    requiresGrouping: dimensions >= 2,
    allowNegative,
    ...(density ? { density } : {}),
    ...(partToWhole ? { partToWhole } : {}),
    ...(matrix ? { matrix } : {}),
    ...(maxNominalCardinality !== undefined ? { maxNominalCardinality } : {}),
    ...(hasHighCardinalityDim ? { hasHighCardinalityDim } : {}),
    ...(correlationStrength !== undefined ? { correlationStrength } : {}),
  };
}

// --- explicit mode ----------------------------------------------------------

function buildExplicit(input: BuildVizSpecInput, chartType: ChartType): BuildVizSpecResult {
  const encoding = normalizeEncodings(input.encodings ?? {});

  if (!encoding.x || !encoding.y) {
    throw new VizSpecBuilderError(
      `Explicit mode for "${chartType}" requires at least x and y encodings (got: ${Object.keys(encoding).join(', ') || 'none'}).`,
    );
  }

  const spec = assembleSpec(input, chartType, encoding);
  return { spec, chartType, mode: 'explicit' };
}

// --- suggest mode -----------------------------------------------------------

function buildSuggested(input: BuildVizSpecInput): BuildVizSpecResult {
  const profiles = inferFieldProfile(input.rows);
  const intent = toSchemaIntent(profiles, input.rows);
  const ranked = suggestPatterns(intent, { limit: 3 });
  const top = ranked[0];
  const chartType: ChartType = top?.pattern.chartType ?? 'bar';

  const encoding = autoAssignEncodings(profiles, chartType);
  if (!encoding.x || !encoding.y) {
    throw new VizSpecBuilderError(
      'Suggest mode could not infer at least two usable fields (x and y) from the provided rows.',
    );
  }

  // No top pick (every pattern scored below the filter), or a top whose score is
  // below the confidence floor, means the chartType is a fallback, not a positive
  // recommendation — surface that instead of silently returning a bar.
  // GEO HONESTY (sprint-118 m04): the pattern pool ranks only the 5 tabular marks, so geo-shaped
  // rows get a CONFIDENT bar instead of a map. Coordinate fields (lat/lon) are unambiguous map
  // intent — flag low-confidence and tell the agent to ask for choropleth/bubble_map explicitly.
  // Gate on lat/lon ONLY, NOT 'region': a 'region' column is a common categorical dimension (e.g.
  // region+revenue is a clean bar), so flagging it would wrongly low-confidence a count-shape.
  const geoShaped = profiles.some((p) => p.geoKind === 'lat' || p.geoKind === 'lon');
  const lowConfidence = geoShaped || !top || top.score < LOW_CONFIDENCE_SCORE;
  const alternatives = ranked.slice(1).map((s) => ({
    patternId: s.pattern.id,
    score: s.score,
    chartType: s.pattern.chartType,
  }));

  const geoSignal =
    'geographic coordinate fields detected but the recommender only ranks tabular charts — specify choropleth or bubble_map explicitly';

  const spec = assembleSpec(input, chartType, encoding);
  return {
    spec,
    chartType,
    mode: 'suggest',
    suggestion: top
      ? { patternId: top.pattern.id, score: top.score, signals: geoShaped ? [...top.signals, geoSignal] : top.signals }
      : undefined,
    inferredFields: profiles,
    lowConfidence,
    ...(alternatives.length > 0 ? { alternatives } : {}),
  };
}

function autoAssignEncodings(
  profiles: ReadonlyArray<FieldProfile>,
  chartType: ChartType,
): Partial<Record<EncodingChannel, TraitBinding>> {
  const temporals = profiles.filter((f) => f.type === 'temporal');
  const measures = profiles.filter((f) => f.type === 'quantitative');
  const dimensions = profiles.filter((f) => f.type === 'nominal' || f.type === 'ordinal');

  const out: Partial<Record<EncodingChannel, TraitBinding>> = {};

  if (chartType === 'scatter') {
    const x = measures[0];
    const y = measures[1] ?? measures[0];
    if (x) out.x = binding('x', x);
    if (y && y !== x) out.y = binding('y', y);
    if (dimensions[0]) out.color = binding('color', dimensions[0]);
    return out;
  }

  if (chartType === 'heatmap') {
    const x = dimensions[0] ?? temporals[0];
    const y = dimensions[1];
    const color = measures[0];
    if (x) out.x = binding('x', x);
    if (y) out.y = binding('y', y);
    if (color) out.color = binding('color', color);
    return out;
  }

  // bar / line / area: categorical-or-temporal x, measure y, optional series color
  const x = temporals[0] ?? dimensions[0];
  const y = measures[0];
  if (x) out.x = binding('x', x);
  if (y) out.y = binding('y', y);
  const series = dimensions.find((d) => d !== x);
  if (series) out.color = binding('color', series);
  return out;
}

function binding(channel: EncodingChannel, field: FieldProfile): TraitBinding {
  const scale = scaleForType(field.type);
  return {
    field: field.name,
    trait: ENCODING_TRAIT[channel],
    channel,
    ...(scale ? { scale } : {}),
  };
}

function scaleForType(type: FieldType): TraitBinding['scale'] | undefined {
  switch (type) {
    case 'quantitative':
      return 'linear';
    case 'temporal':
      return 'temporal';
    case 'nominal':
    case 'ordinal':
      return 'band';
    default:
      return undefined;
  }
}

// --- shared assembly --------------------------------------------------------

function assembleSpec(
  input: BuildVizSpecInput,
  chartType: ChartType,
  encoding: Partial<Record<EncodingChannel, TraitBinding>>,
): NormalizedVizSpec {
  const description = input.description?.trim()
    ? input.description.trim()
    : synthesizeDescription(chartType, encoding);

  const spec: NormalizedVizSpec = {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: input.id ?? `viz:${chartType}`,
    name: input.name ?? CHART_TYPE_LABEL[chartType],
    data: { values: input.rows.map((row) => ({ ...row })) },
    marks: [{ trait: CHART_TYPE_MARK[chartType] }],
    encoding: encoding as NormalizedVizSpec['encoding'],
    a11y: { description },
  };

  // The builder's contract is a VALID spec; fail loud rather than emit a spec
  // that AJV would later reject (e.g. an empty a11y.description).
  return assertNormalizedVizSpec(spec);
}

function synthesizeDescription(
  chartType: ChartType,
  encoding: Partial<Record<EncodingChannel, TraitBinding>>,
): string {
  const label = CHART_TYPE_LABEL[chartType];
  const y = encoding.y?.field;
  const x = encoding.x?.field;
  const color = encoding.color?.field;

  if (y && x) {
    const aggregate = encoding.y?.aggregate ? `${encoding.y.aggregate} of ` : '';
    const series = color ? `, split by ${color}` : '';
    return `${label} of ${aggregate}${y} by ${x}${series}.`;
  }
  if (x) {
    return `${label} of ${x}.`;
  }
  return `${label}.`;
}

function normalizeEncodings(
  encodings: Partial<Record<EncodingChannel, EncodingInput | string>>,
): Partial<Record<EncodingChannel, TraitBinding>> {
  const out: Partial<Record<EncodingChannel, TraitBinding>> = {};
  for (const channel of Object.keys(encodings) as EncodingChannel[]) {
    const raw = encodings[channel];
    if (raw === undefined) {
      continue;
    }
    const value: EncodingInput = typeof raw === 'string' ? { field: raw } : raw;
    if (!value.field || typeof value.field !== 'string') {
      throw new VizSpecBuilderError(`Encoding "${channel}" is missing a string field.`);
    }
    out[channel] = {
      field: value.field,
      trait: ENCODING_TRAIT[channel],
      channel,
      ...(value.aggregate ? { aggregate: value.aggregate } : {}),
      ...(value.scale ? { scale: value.scale } : {}),
      ...(value.timeUnit ? { timeUnit: value.timeUnit } : {}),
      ...(value.sort ? { sort: value.sort } : {}),
      ...(value.title ? { title: value.title } : {}),
    };
  }
  return out;
}

function collectFieldNames(rows: ReadonlyArray<Record<string, unknown>>): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        order.push(key);
      }
    }
  }
  return order;
}

/**
 * Hardened, name-aware type inference (sprint-110 m01). Precedence:
 *   1. unambiguous date/time formats (bare years excluded) → temporal;
 *   2. a name-hinted, in-range 4-digit-year column → temporal ('year');
 *   3. numeric semantic CODES (zip/postal, currency-code by name) → nominal;
 *   4. a small repeated set of integers → ordinal (the previously-unreachable
 *      FieldType member);
 *   5. otherwise numeric → quantitative;
 *   6. anything else → nominal.
 */
function inferFieldType(name: string, present: ReadonlyArray<unknown>): FieldType {
  if (present.length === 0) {
    return 'nominal';
  }
  // (1) Unambiguous date/time strings (ISO, slash, "Mon YYYY", YYYY-Qn).
  if (everyValueIsTemporal(present)) {
    return 'temporal';
  }
  // (2) Name-gated year-only column. Gated on a year-hinting name AND a plausible
  //     4-digit window so a column of 4-digit counts/codes is not misread.
  if (nameHintsYear(name) && present.every(isBareYearInRange)) {
    return 'temporal';
  }

  const { nums, allNumeric } = numericView(present);
  if (allNumeric) {
    // (3) Numeric-looking categorical codes are dimensions, not measures.
    if (nameHintsZip(name) || nameHintsCurrencyCode(name)) {
      return 'nominal';
    }
    // (3b) A measure-named numeric column is a quantitative measure even when it is a small
    //      repeated integer set — the name disambiguates a real metric from a true ordinal
    //      scale (sprint-118 m04). Conservative tokens; EXCLUDES 'count'/'score' (which are
    //      legitimately ordinal). Only changes columns that rule (4) would otherwise type
    //      ordinal — high-cardinality measures already fall through to (5) quantitative.
    if (nameHintsMeasure(name)) {
      return 'quantitative';
    }
    // (4) A small, repeated set of integers is an ordinal scale.
    const distinct = new Set(nums).size;
    if (
      nums.every((n) => Number.isInteger(n)) &&
      present.length >= ORDINAL_MIN_ROWS &&
      distinct <= ORDINAL_MAX_CARDINALITY &&
      distinct / present.length < ORDINAL_MAX_DISTINCT_RATIO
    ) {
      return 'ordinal';
    }
    // (5) Otherwise a genuine quantitative measure.
    return 'quantitative';
  }
  // (6) Non-numeric, non-temporal → nominal dimension.
  return 'nominal';
}

/** Coerce every present value to a number; `allNumeric` is false on first miss. */
function numericView(present: ReadonlyArray<unknown>): { nums: number[]; allNumeric: boolean } {
  const nums: number[] = [];
  for (const v of present) {
    const n = toNumber(v);
    if (n === null) {
      return { nums: [], allNumeric: false };
    }
    nums.push(n);
  }
  return { nums, allNumeric: present.length > 0 };
}

function fieldNameTokens(name: string): string[] {
  return name.trim().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function nameHintsYear(name: string): boolean {
  const tokens = fieldNameTokens(name);
  return tokens.includes('year') || tokens.includes('yr') || tokens.includes('fy');
}

function nameHintsZip(name: string): boolean {
  const tokens = fieldNameTokens(name);
  return ['zip', 'zipcode', 'postal', 'postalcode', 'postcode', 'fips'].some((t) => tokens.includes(t));
}

// A conservative measure-name token set (sprint-118 m04). DELIBERATELY excludes 'count' and
// 'score' — those are commonly genuine ordinal scales, so keeping them out preserves the
// rule-(4) ordinal typing for e.g. a 'rating'/'count' column.
function nameHintsMeasure(name: string): boolean {
  const tokens = fieldNameTokens(name);
  return ['value', 'val', 'quantity', 'qty', 'amount', 'amt', 'price', 'cost', 'total', 'revenue', 'sales'].some((t) =>
    tokens.includes(t),
  );
}

function nameHintsCurrencyCode(name: string): boolean {
  const collapsed = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return collapsed === 'currency' || collapsed === 'currencycode' || collapsed === 'isocurrency';
}

function isBareYearInRange(value: unknown): boolean {
  const text = String(value).trim();
  if (!/^\d{4}$/.test(text)) {
    return false;
  }
  const year = Number(text);
  return year >= YEAR_MIN && year <= YEAR_MAX;
}
