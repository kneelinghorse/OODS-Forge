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
import { suggestPatterns, type SchemaIntent } from '../patterns/suggest-chart.js';

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

/**
 * Inferred per-field profile. `cardinality` is the count of distinct non-null
 * values, surfaced for downstream tie-breaking and the recommender.
 */
export interface FieldProfile {
  readonly name: string;
  readonly type: FieldType;
  readonly role: 'measure' | 'dimension';
  readonly cardinality: number;
}

export interface BuildVizSpecResult {
  readonly spec: NormalizedVizSpec;
  readonly chartType: ChartType;
  readonly mode: 'explicit' | 'suggest';
  /** Present in suggest mode only: the recommender pick that drove the chartType. */
  readonly suggestion?: { readonly patternId: string; readonly score: number };
  /** Present in suggest mode only: the inferred field profiles. */
  readonly inferredFields?: ReadonlyArray<FieldProfile>;
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
const CHART_TYPE_MARK: Record<ChartType, string> = {
  bar: 'MarkBar',
  line: 'MarkLine',
  area: 'MarkArea',
  scatter: 'MarkPoint',
  heatmap: 'MarkRect',
};

const CHART_TYPE_LABEL: Record<ChartType, string> = {
  bar: 'Bar chart',
  line: 'Line chart',
  area: 'Area chart',
  scatter: 'Scatter plot',
  heatmap: 'Heatmap',
};

const ISO_DATE = /^\d{4}-\d{2}(-\d{2})?([T ]\d{2}:\d{2}(:\d{2})?)?/;

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
 * Lightweight, deterministic per-field type/role/cardinality inference.
 * Heuristics (documented): a field is `quantitative`/measure if every present
 * value is a finite number (or a finite numeric string); `temporal` if every
 * present value is an ISO-date-shaped, Date-parseable string; otherwise
 * `nominal`/dimension.
 *
 * MISCLASSIFICATION RISK (surfaced intentionally): numeric-looking categorical
 * codes (e.g. zip codes, "2024" year labels that are NOT YYYY-MM dates) classify
 * as quantitative; free-form date text that is not ISO-shaped classifies as
 * nominal. This inferencer therefore gates SUGGEST mode only — explicit mode,
 * where the caller declares chartType + encodings, never relies on it.
 */
export function inferFieldProfile(
  rows: ReadonlyArray<Record<string, unknown>>,
  fieldNames?: ReadonlyArray<string>,
): FieldProfile[] {
  const names = fieldNames ?? collectFieldNames(rows);
  return names.map((name) => {
    const values = rows.map((row) => row[name]);
    const present = values.filter((v) => v !== null && v !== undefined && v !== '');
    const type = inferFieldType(present);
    const cardinality = new Set(present.map((v) => String(v))).size;
    return { name, type, role: type === 'quantitative' ? 'measure' : 'dimension', cardinality };
  });
}

/** Derive the count-based SchemaIntent the recommender consumes from field profiles. */
export function toSchemaIntent(profiles: ReadonlyArray<FieldProfile>): SchemaIntent {
  const measures = profiles.filter((f) => f.type === 'quantitative').length;
  const temporals = profiles.filter((f) => f.type === 'temporal').length;
  const dimensions = profiles.filter((f) => f.type === 'nominal' || f.type === 'ordinal').length;

  let goal: IntentGoal;
  if (temporals >= 1) {
    goal = 'trend';
  } else if (measures >= 2 && dimensions === 0) {
    goal = 'relationship';
  } else {
    goal = 'comparison';
  }

  return {
    measures,
    dimensions,
    temporals,
    goal,
    multiMetrics: measures >= 2,
    requiresGrouping: dimensions >= 2,
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
  const intent = toSchemaIntent(profiles);
  const [top] = suggestPatterns(intent, { limit: 1 });
  const chartType: ChartType = top?.pattern.chartType ?? 'bar';

  const encoding = autoAssignEncodings(profiles, chartType);
  if (!encoding.x || !encoding.y) {
    throw new VizSpecBuilderError(
      'Suggest mode could not infer at least two usable fields (x and y) from the provided rows.',
    );
  }

  const spec = assembleSpec(input, chartType, encoding);
  return {
    spec,
    chartType,
    mode: 'suggest',
    suggestion: top ? { patternId: top.pattern.id, score: top.score } : undefined,
    inferredFields: profiles,
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

function inferFieldType(present: ReadonlyArray<unknown>): FieldType {
  if (present.length === 0) {
    return 'nominal';
  }
  if (present.every((v) => typeof v === 'number' && Number.isFinite(v))) {
    return 'quantitative';
  }
  if (
    present.every(
      (v) => typeof v === 'string' && ISO_DATE.test(v) && !Number.isNaN(Date.parse(v)),
    )
  ) {
    return 'temporal';
  }
  if (present.every((v) => typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)))) {
    return 'quantitative';
  }
  return 'nominal';
}
