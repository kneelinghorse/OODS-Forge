import type {
  TraitBinding as NormalizedTraitBinding,
  Transform as NormalizedSpecTransform,
} from '../spec/normalized-viz-spec.types.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';
import { resolveCategoricalPalette, toHex } from '../tokens/categorical-palette.js';
import { resolveOodsVegaConfig } from '../tokens/oods-vega-config.js';
import { getVizScaleTokens } from '../tokens/scale-token-mapper.js';
import { resolveTokenToColor } from './echarts/token-resolver.js';
import { buildVegaLiteSpec } from './vega-lite-layout-mapper.js';

const VEGA_LITE_SCHEMA_URL = 'https://vega.github.io/schema/vega-lite/v6.json';
const CHANNEL_ORDER = ['x', 'x2', 'y', 'y2', 'color', 'size', 'shape', 'detail'] as const;
const QUANT_SCALE_TYPES = new Set(['linear', 'log', 'sqrt']);
const ORDINAL_SCALE_TYPES = new Set(['band', 'point']);

// sprint-156 m04: the OODS diverging viz-scale, resolved ONCE to canonical hex through the
// SAME token→color chain the categorical bake + certify use, so the diverging range that
// renders is the diverging range that would be graded ("rendered == certified"). A diverging
// color is a continuous gradient (role-B exempt), so this is a bake, not a graded palette.
const OODS_DIVERGING_RANGE: readonly string[] = getVizScaleTokens('diverging')
  .map((token) => toHex(resolveTokenToColor(token) ?? ''))
  .filter((color): color is string => Boolean(color));
const MARK_TRAIT_MAP = {
  MarkBar: 'bar',
  MarkLine: 'line',
  MarkPoint: 'point',
  MarkArea: 'area',
  MarkRect: 'rect',
} as const;

type AdapterTransform = Record<string, unknown>;
type NormalizedEncoding = NormalizedVizSpec['encoding'];
type NormalizedMark = NormalizedVizSpec['marks'][number];
type NormalizedTransform = NormalizedSpecTransform;
type ChannelName = (typeof CHANNEL_ORDER)[number];
type EncodingBinding = NormalizedTraitBinding;

interface ConvertedLayer {
  readonly key: string;
  readonly mark: Record<string, unknown>;
  readonly encoding: Record<string, unknown>;
  readonly data?: Record<string, unknown>;
}

interface AdapterInteractionParam {
  readonly name: string;
  readonly select: Record<string, unknown>;
}

export interface VegaLiteUserMeta {
  readonly specId?: string;
  readonly name?: string;
  readonly theme?: string;
  readonly tokens?: Record<string, string | number>;
  readonly a11y: NormalizedVizSpec['a11y'];
  readonly portability?: NormalizedVizSpec['portability'];
}

export interface BaseAdapterSpec {
  readonly $schema?: string;
  readonly title?: string;
  readonly description: string;
  readonly data: Record<string, unknown>;
  // Item #16 (s151 m03): Vega-Lite native top-level named-datasets map that layer
  // `data:{name}` references resolve against; omitted when spec.datasets is absent.
  readonly datasets?: NormalizedVizSpec['datasets'];
  readonly transform?: readonly AdapterTransform[];
  readonly params?: readonly AdapterInteractionParam[];
  readonly width?: number;
  readonly height?: number;
  readonly padding?: number;
  readonly config?: Record<string, unknown>;
  readonly usermeta?: {
    readonly oods: VegaLiteUserMeta;
  };
}

export type VegaLiteAdapterSpec =
  | (BaseAdapterSpec & {
      readonly mark: Record<string, unknown>;
      readonly encoding: Record<string, unknown>;
    })
  | (BaseAdapterSpec & {
      readonly layer: readonly {
        readonly mark: Record<string, unknown>;
        readonly encoding: Record<string, unknown>;
        readonly data?: Record<string, unknown>;
      }[];
    });

export class VegaLiteAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VegaLiteAdapterError';
  }
}

export function toVegaLiteSpec(spec: NormalizedVizSpec): VegaLiteAdapterSpec {
  if (spec.marks.length === 0) {
    throw new VegaLiteAdapterError('Normalized viz spec must contain at least one mark.');
  }

  // Brand-fidelity (sprint-138 m02): resolve the OODS categorical palette ONCE here,
  // at the only level that can see spec.config.tokens, then THREAD the resolved hex[]
  // down into convertBinding (multi-series scale.range) and createMark (single-series
  // mark.color). convertBinding's (channel, binding) signature cannot reach the spec,
  // so the palette must be passed in — never re-resolved per binding (memo §6 blocker-2).
  const categoricalPalette = resolveCategoricalPalette(spec);
  // A single-series chart carries NO color channel anywhere; it renders one mark color,
  // so bake categorical-01 as mark.color so the render matches the slot certify grades
  // (memo §6 — else the hollow survives silently for the common single-series case).
  const hasColorEncoding =
    Boolean(spec.encoding?.color) || spec.marks.some((mark) => Boolean(mark.encodings?.color));
  const singleSeriesColor =
    !hasColorEncoding && categoricalPalette.length > 0 ? categoricalPalette[0] : undefined;

  // Cartesian chrome theme (sprint-144 m02): resolve the OODS-tokened Vega `config`
  // theme ONCE here — the only level that sees spec.config.tokens — and attach it
  // top-level below (merged with the caller's config.mark). Unlike the palette it
  // needs no per-binding threading: config is a top-level Vega-Lite block that
  // applies to every nested view. Chrome only — series color stays in the bake above.
  const oodsConfig = resolveOodsVegaConfig(spec);

  const interactions = normalizeInteractions(spec.interactions);
  const data = convertData(spec);
  const transform = mergeTransforms(convertTransforms(spec.transforms), buildInteractionTransforms(interactions));
  const baseEncoding = convertEncodingMap(spec.encoding, categoricalPalette);
  const interactionParams = convertInteractionParams(interactions);
  const interactionEncoding = convertInteractionBindings(interactions);
  const convertedLayers = spec.marks.map((mark) =>
    createLayer(mark, baseEncoding, interactionEncoding, categoricalPalette, singleSeriesColor),
  );
  const orderedLayers = applyLayerOrdering(spec.layout, convertedLayers);
  const requiresLayer = orderedLayers.length > 1 || orderedLayers.some((layer) => layer.data !== undefined);

  const layout = spec.config?.layout ?? {};
  // Merge, don't overwrite (backward-compat #84): the OODS chrome config carries no
  // `mark` key (chrome-only guardrail), and the caller's config.mark is spread LAST
  // so it wins its own key — zero collision. The baked config is now unconditionally
  // present (was conditional on a caller mark), which is correct and additive.
  const config = {
    ...oodsConfig,
    ...(spec.config?.mark ? { mark: spec.config.mark } : {}),
  };

  const baseSpec = removeUndefined({
    $schema: VEGA_LITE_SCHEMA_URL,
    title: spec.name,
    description: spec.a11y.description,
    data,
    // Item #16 (s151 m03): thread the named-datasets map onto Vega-Lite's NATIVE top-level
    // `datasets` block so a layer's `data:{name:mark.from}` (createLayer) resolves instead
    // of dangling. `removeUndefined` strips the key when spec.datasets is absent → a spec
    // without the slot compiles byte-identically to pre-#16 (the gate). Only `from`-
    // referenced layers gain a data:{name}; the primary layer stays inline (top-level data).
    datasets: spec.datasets,
    transform,
    params: interactionParams,
    width: layout.width,
    height: layout.height,
    padding: layout.padding,
    config,
    usermeta: buildUserMeta(spec),
  });

  const primitive = requiresLayer
    ? {
        layer: orderedLayers.map((layer) =>
          removeUndefined({
            mark: layer.mark,
            encoding: layer.encoding,
            data: layer.data,
          })
        ),
      }
    : removeUndefined({
        mark: orderedLayers[0]?.mark,
        encoding: orderedLayers[0]?.encoding,
        data: orderedLayers[0]?.data,
      });

  return buildVegaLiteSpec(spec, { base: baseSpec, primitive });
}

function createLayer(
  mark: NormalizedMark,
  baseEncoding?: Record<string, unknown>,
  interactionEncoding?: Record<string, unknown>,
  palette?: readonly string[],
  singleSeriesColor?: string
): ConvertedLayer {
  const markEncodings = convertEncodingMap(mark.encodings, palette);
  const encoding = mergeEncodings(mergeEncodings(baseEncoding, markEncodings), interactionEncoding);

  if (Object.keys(encoding).length === 0) {
    throw new VegaLiteAdapterError(`Mark ${mark.trait} does not provide any encodings.`);
  }

  return {
    key: inferLayerKey(mark),
    mark: createMark(mark, singleSeriesColor),
    encoding: applyBaselineToEncoding(mark, encoding),
    data: mark.from ? { name: mark.from } : undefined,
  };
}

/**
 * `mark.options.baseline` → `encoding.<quantitative>.scale.zero` (s168 m02).
 *
 * This lives in the ENCODING region and not in `createMark` because its target IS an
 * encoding: OODS's `baseline` says where the measure axis starts, which Vega-Lite spells
 * `scale.zero`. Emitting it as a mark property is what made four committed fixtures
 * schema-invalid — `MarkDef.baseline` is `TextBaseline` (`'alphabetic' | 'top' | ...`),
 * so `'zero'` failed an enum check and the numeric `0` failed a type check.
 *
 * Three accepted spellings, all of them observed:
 *   `'zero'` → `zero: true`   (declared by mark-area.parameters.schema.json)
 *   `'min'`  → `zero: false`  (declared, no committed occurrence)
 *   `0`      → `zero: true`   (NOT declared anywhere — it comes from the committed
 *                              MarkBar fixtures, which is why a declared-surface-only
 *                              derivation would have missed it)
 * Anything else is dropped rather than guessed at.
 *
 * CHANNEL CHOICE, stated because it is a judgement call: `y` if it is quantitative,
 * else `x`. `baseline` names the measure axis; the channel's own TYPE is the signal used
 * to find it. If neither positional channel is quantitative, nothing is emitted, and a
 * caller-declared `scale.zero` always wins.
 *
 * s169 m05 CORRECTION: this comment used to justify the choice partly by saying
 * `orientation` "is itself an OODS-only key with no MarkDef target, so it cannot be relied
 * on here". The first half is no longer true — `orientation` now translates to
 * `MarkDef.orient`. The channel choice is UNCHANGED and still correct, because
 * quantitative-ness is the direct signal and `orient` is advisory (Vega-Lite ignores it on
 * stacked charts). The stale half of the rationale is removed rather than left to be read
 * as a live constraint.
 */
function applyBaselineToEncoding(
  mark: NormalizedMark,
  encoding: Record<string, unknown>,
): Record<string, unknown> {
  const baseline = (mark.options as Record<string, unknown> | undefined)?.baseline;
  if (baseline === undefined) return encoding;

  const zero =
    baseline === 'zero' || baseline === 0 ? true : baseline === 'min' ? false : undefined;
  if (zero === undefined) return encoding;

  for (const channel of ['y', 'x'] as const) {
    const definition = encoding[channel] as Record<string, unknown> | undefined;
    if (!definition || definition.type !== 'quantitative') continue;
    const scale = (definition.scale as Record<string, unknown> | undefined) ?? {};
    if (scale.zero !== undefined) return encoding;
    return { ...encoding, [channel]: { ...definition, scale: { ...scale, zero } } };
  }

  return encoding;
}

/**
 * Every property the Vega-Lite v6 `MarkDef` accepts (88 of them), as an ALLOWLIST.
 *
 * s167 m03 shipped a two-entry DENYLIST (`id`, `curve`) derived from the fixture CORPUS.
 * That was the wrong operand. The declared surface is
 * `schemas/traits/mark-*.parameters.schema.json` — closed per-trait vocabularies that
 * s167 never consulted — and unioned with the corpus and the keys the ECharts adapter
 * and the React views read off the IR, **14 distinct keys are not MarkDef properties**:
 * `areaStyle`, `bandPadding`, `curve`, `enableMarkers`, `id`, `itemStyle`, `join`,
 * `lineStyle`, `name`, `orientation`, `stack`, `stacking`, `symbolSize`, `title`.
 * A denylist can only ever cover the keys someone remembered to enumerate; an allowlist
 * covers the twelve the denylist missed *and* every key a future trait adds.
 *
 * STATIC ON PURPOSE (s168 m02). Deriving this from the vega-lite schema at runtime would
 * let a dependency bump silently change what the adapter emits. The list is pinned here
 * and `tests/viz/mark-options-schema-validity-s167.test.ts` derives the same set from the
 * installed schema and asserts the two still match — so a bump fails a test instead of
 * quietly altering output.
 */
const MARK_DEF_PROPERTIES: ReadonlySet<string> = new Set([
  'align', 'angle', 'aria', 'ariaRole', 'ariaRoleDescription', 'aspect', 'bandSize',
  'baseline', 'binSpacing', 'blend', 'clip', 'color', 'continuousBandSize', 'cornerRadius',
  'cornerRadiusBottomLeft', 'cornerRadiusBottomRight', 'cornerRadiusEnd',
  'cornerRadiusTopLeft', 'cornerRadiusTopRight', 'cursor', 'description', 'dir',
  'discreteBandSize', 'dx', 'dy', 'ellipsis', 'fill', 'fillOpacity', 'filled', 'font',
  'fontSize', 'fontStyle', 'fontWeight', 'height', 'href', 'innerRadius', 'interpolate',
  'invalid', 'limit', 'line', 'lineBreak', 'lineHeight', 'minBandSize', 'opacity', 'order',
  'orient', 'outerRadius', 'padAngle', 'point', 'radius', 'radius2', 'radius2Offset',
  'radiusOffset', 'shape', 'size', 'smooth', 'stroke', 'strokeCap', 'strokeDash',
  'strokeDashOffset', 'strokeJoin', 'strokeMiterLimit', 'strokeOffset', 'strokeOpacity',
  'strokeWidth', 'style', 'tension', 'text', 'theta', 'theta2', 'theta2Offset',
  'thetaOffset', 'thickness', 'time', 'timeUnitBandPosition', 'timeUnitBandSize', 'tooltip',
  'type', 'url', 'width', 'x', 'x2', 'x2Offset', 'xOffset', 'y', 'y2', 'y2Offset',
  'yOffset',
]);

/**
 * `MarkDef.interpolate`'s accepted values. OODS's `curve` vocabulary
 * (`linear` | `monotone` | `step`) is a literal subset, so the translation below is a
 * rename, not a mapping — but the guard still checks membership, because `mark.options`
 * is a free-form object and nothing stops a caller putting `curve: 'wobbly'` in a spec.
 */
const VEGA_LITE_INTERPOLATE: ReadonlySet<string> = new Set([
  'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open',
  'cardinal-closed', 'catmull-rom', 'linear', 'linear-closed', 'monotone', 'natural',
  'step', 'step-before', 'step-after',
]);

/**
 * `MarkDef.orient` (`Orientation`) and `MarkDef.strokeJoin` (`StrokeJoin`), verified
 * against the INSTALLED vega-lite 6.4.1 schema rather than from memory. Both are EXACT
 * matches for the OODS trait vocabularies they translate from:
 *
 *   `schemas/traits/mark-bar.parameters.schema.json` `orientation` — ["vertical","horizontal"]
 *   `schemas/traits/mark-line.parameters.schema.json` `join`       — ["miter","round","bevel"]
 *
 * Same-set, different name — so these are renames, and the membership guard exists for the
 * same reason `curve`'s does: `mark.options` is free-form and nothing stops a caller
 * writing `orientation: 'sideways'`.
 */
const VEGA_LITE_ORIENTATION: ReadonlySet<string> = new Set(['horizontal', 'vertical']);
const VEGA_LITE_STROKE_JOIN: ReadonlySet<string> = new Set(['miter', 'round', 'bevel']);

/**
 * OODS-only option keys with an exact Vega-Lite target, translated rather than dropped.
 *
 *   `curve`         → `interpolate`  (same concept, different name)
 *   `orientation`   → `orient`       (s169 m05 — exact vocabulary match, see above)
 *   `enableMarkers` → `point`        (s169 m05 — OODS boolean; `MarkDef.point` accepts
 *                     `boolean | OverlayMarkDef | 'transparent'`, so the boolean branch is
 *                     an exact fit. Guarded on `typeof === 'boolean'` so an object or the
 *                     string `'transparent'` arriving under the OODS key is dropped rather
 *                     than smuggled through a key whose declared type is boolean.)
 *   `join`          → `strokeJoin`   (s169 m05 — exact vocabulary match, see above)
 *
 * ORIENT CAVEAT, stated because the translation is faithful and the RESULT still may not
 * be what a caller expects: Vega-Lite ignores an explicitly-specified `orient` on STACKED
 * charts, where orientation is determined by the stack. Translating `orientation` is
 * therefore value-faithful — the declared value reaches the output — but it is NOT a
 * layout swap, and on a stacked chart it will have no visible effect. That is Vega-Lite's
 * documented behaviour, not a defect in this translation, and dropping the key instead
 * would be strictly worse (silent on both counts).
 *
 *   `fill`     → `filled` (boolean) ONLY for the OODS point vocabulary `'solid'|'hollow'`.
 *                `fill` IS a real MarkDef property accepting any string as a Color, so
 *                ajv ACCEPTS `fill:'hollow'` — the allowlist cannot catch it and the mark
 *                would paint with a non-colour. Any other `fill` value is a genuine
 *                colour and passes through untouched.
 *   `baseline` → handled in the ENCODING region (`applyBaselineToEncoding`), not here.
 *                It is a real MarkDef property (TextBaseline), so the allowlist passes it
 *                and ajv then rejects `'zero'`/`'min'`/`0`. OODS has no text mark
 *                (MARK_TRAIT_MAP is bar/line/point/area/rect), so no legitimate use of
 *                MarkDef.baseline exists here and removing it from the mark def is safe.
 *
 * All three are OUTPUT-only. The IR keeps every key: the ECharts adapter reads `curve`
 * (echarts-adapter.ts:348) plus `id`/`name`/`stack`/`areaStyle`/`lineStyle`/`itemStyle`/
 * `symbolSize`, `inferLayerKey` reads `id`, and the React views read `title`/`id`. This
 * builds a NEW object and never deletes from `mark.options`.
 */
function translateMarkOption(key: string, value: unknown): [string, unknown] | undefined {
  if (key === 'baseline') return undefined;
  if (key === 'curve') {
    return typeof value === 'string' && VEGA_LITE_INTERPOLATE.has(value)
      ? ['interpolate', value]
      : undefined;
  }
  if (key === 'orientation') {
    return typeof value === 'string' && VEGA_LITE_ORIENTATION.has(value)
      ? ['orient', value]
      : undefined;
  }
  if (key === 'enableMarkers') {
    return typeof value === 'boolean' ? ['point', value] : undefined;
  }
  if (key === 'join') {
    return typeof value === 'string' && VEGA_LITE_STROKE_JOIN.has(value)
      ? ['strokeJoin', value]
      : undefined;
  }
  if (key === 'fill' && (value === 'solid' || value === 'hollow')) {
    return ['filled', value === 'solid'];
  }
  return MARK_DEF_PROPERTIES.has(key) ? [key, value] : undefined;
}

function createMark(mark: NormalizedMark, singleSeriesColor?: string): Record<string, unknown> {
  const type = MARK_TRAIT_MAP[mark.trait as keyof typeof MARK_TRAIT_MAP];

  if (!type) {
    throw new VegaLiteAdapterError(`Unsupported mark trait: ${mark.trait}`);
  }

  const result: Record<string, unknown> = { type };
  for (const [key, value] of Object.entries(mark.options ?? {})) {
    const translated = translateMarkOption(key, value);
    if (translated) {
      result[translated[0]] = translated[1];
    }
  }

  // Brand-fidelity (sprint-138 m02): single-series bake — a chart with no color encoding
  // gets categorical-01 as its mark color so it renders exactly the slot certify grades.
  // An explicit mark.options.color always wins (the spread above already set it).
  if (singleSeriesColor !== undefined && result.color === undefined) {
    result.color = singleSeriesColor;
  }

  return result;
}

function convertEncodingMap(map?: NormalizedEncoding, palette?: readonly string[]): Record<string, unknown> {
  if (!map) {
    return {};
  }

  const encoding: Record<string, unknown> = {};

  for (const channel of CHANNEL_ORDER) {
    const binding = (map as Record<string, EncodingBinding | undefined>)[channel];

    if (!binding) {
      continue;
    }

    encoding[channel] = convertBinding(channel, binding, palette);
  }

  return encoding;
}

function mergeEncodings(
  base?: Record<string, unknown>,
  overrides?: Record<string, unknown>
): Record<string, unknown> {
  if (!base && !overrides) {
    return {};
  }

  const merged: Record<string, unknown> = {};

  if (base) {
    for (const [channel, config] of Object.entries(base)) {
      merged[channel] = config;
    }
  }

  if (overrides) {
    for (const [channel, config] of Object.entries(overrides)) {
      merged[channel] = config;
    }
  }

  return merged;
}

function convertBinding(
  channel: ChannelName,
  binding: EncodingBinding,
  palette?: readonly string[]
): Record<string, unknown> {
  const normalizedChannel = channel === 'x2' ? 'x' : channel === 'y2' ? 'y' : channel;
  const definition: Record<string, unknown> = {
    field: binding.field,
    type: inferFieldType(normalizedChannel, binding),
  };

  const aggregate = mapAggregate(binding.aggregate);
  const scaleType = mapScaleType(binding.scale);

  if (aggregate) {
    definition.aggregate = aggregate;
  }

  if (typeof binding.bin === 'boolean') {
    definition.bin = binding.bin;
  }

  if (binding.timeUnit) {
    definition.timeUnit = binding.timeUnit;
  }

  if (scaleType) {
    definition.scale = { type: scaleType };
  }

  // Brand-fidelity (sprint-138 m02): multi-series bake — a nominal/ordinal color
  // channel gets the FIXED full 6-slot OODS palette as scale.range, so the compiled
  // spec renders OODS colors by construction (not Vega's default tableau10). Vega's
  // ordinal domain[i]->range[i] recycling gives >6-series cycle-6 for free, matching
  // certify's cap-at-6 as a set (memo §4 F5). A continuous (quantitative/temporal)
  // color channel is a gradient — role-B exempt — and is intentionally NOT baked.
  if (
    channel === 'color' &&
    (definition.type === 'nominal' || definition.type === 'ordinal') &&
    !binding.range?.length &&
    palette &&
    palette.length > 0
  ) {
    // s149 #853a: length-based, symmetric with the F5 range-write guard below
    // (`binding.range && binding.range.length > 0`). `!binding.range` alone stepped
    // aside for an EMPTY `range: []` too, so neither write fired and the OODS palette
    // was silently dropped (a dead-zone). `?.length` bakes on both no-range and empty-
    // range, so exactly one of the two writes fires in every case. Do NOT rewrite as
    // `=== undefined`: that reopens the `[]` dead-zone.
    const existingScale = (definition.scale as Record<string, unknown> | undefined) ?? {};
    definition.scale = { ...existingScale, range: [...palette] };
  }

  // F5 (sprint-147 m02): an explicit color range overrides the baked OODS palette
  // on a categorical color channel. Scoped to color + nominal/ordinal so a range on
  // a continuous color scale is dropped (gradient-ignored; warned by V-code in m03),
  // and a range never reaches a non-color channel (color-only schema def, memo D-ii).
  // The bake above steps aside when binding.range is set, so exactly one of these two
  // writes fires — #564 holds: field absent ⇒ identical [...palette] output.
  if (
    channel === 'color' &&
    (definition.type === 'nominal' || definition.type === 'ordinal') &&
    binding.range &&
    binding.range.length > 0
  ) {
    const existingScale = (definition.scale as Record<string, unknown> | undefined) ?? {};
    definition.scale = { ...existingScale, range: [...binding.range] };
  }

  // sprint-156 m04 (NASA #4 + band M2): a diverging color scale bakes the OODS diverging
  // range + `domainMid:0` so Vega renders the two hues about zero. Continuous (the type is
  // forced quantitative above), so it is disjoint from the nominal/ordinal categorical bakes.
  if (channel === 'color' && binding.scale === 'diverging') {
    const existingScale = (definition.scale as Record<string, unknown> | undefined) ?? {};
    definition.scale = { ...existingScale, range: [...OODS_DIVERGING_RANGE], domainMid: 0 };
  }

  if (binding.sort) {
    definition.sort = binding.sort;
  }

  if (binding.title) {
    definition.title = binding.title;
  }

  if (binding.legend) {
    definition.legend = binding.legend;
  }

  return definition;
}

function convertInteractionParams(
  interactions?: NormalizedVizSpec['interactions']
): readonly AdapterInteractionParam[] | undefined {
  if (!interactions || interactions.length === 0) {
    return undefined;
  }

  const params = interactions
    .map((interaction) => {
      const select = convertInteractionSelection(interaction.select);
      if (!select) {
        return undefined;
      }
      return {
        name: interaction.id,
        select,
      } satisfies AdapterInteractionParam;
    })
    .filter((entry): entry is AdapterInteractionParam => Boolean(entry));

  return params.length > 0 ? params : undefined;
}

function convertInteractionSelection(selection: NonNullable<NormalizedVizSpec['interactions']>[number]['select']):
  | Record<string, unknown>
  | undefined {
  if (selection.type === 'point') {
    return removeUndefined({
      type: 'point',
      on: selection.on,
      fields: selection.fields,
    });
  }

  if (selection.type === 'interval') {
    return removeUndefined({
      type: 'interval',
      on: selection.on,
      encodings: selection.encodings,
      bind: selection.bind,
    });
  }

  return undefined;
}

function convertInteractionBindings(
  interactions?: NormalizedVizSpec['interactions']
): Record<string, unknown> | undefined {
  if (!interactions || interactions.length === 0) {
    return undefined;
  }

  const encoding: Record<string, unknown> = {};

  for (const interaction of interactions) {
    if (interaction.rule.bindTo === 'visual') {
      const { property } = interaction.rule;
      const active = interaction.rule.condition?.value;
      const inactive = interaction.rule.else?.value;

      if (!property || active === undefined) {
        continue;
      }

      encoding[property] = removeUndefined({
        condition: {
          param: interaction.id,
          value: active,
        },
        value: inactive,
      });
    }

    if (interaction.rule.bindTo === 'tooltip' && !encoding.tooltip && interaction.rule.fields.length > 0) {
      encoding.tooltip = interaction.rule.fields.map((field) => ({ field }));
    }
  }

  return Object.keys(encoding).length > 0 ? encoding : undefined;
}

function inferFieldType(channel: ChannelName, binding: EncodingBinding): 'quantitative' | 'temporal' | 'ordinal' | 'nominal' {
  // A data-aware or caller-declared field type wins over channel-default
  // inference (sprint-125: m01 stamps an unscaled binding's profiled FieldType
  // here; m02 lets a caller override it directly). The scale branches below stay
  // authoritative whenever the caller declared a scale — m01 leaves binding.type
  // unset in that case, so this short-circuit never fires for a scaled binding.
  if (binding.type) {
    return binding.type;
  }

  if (binding.timeUnit || binding.scale === 'temporal') {
    return 'temporal';
  }

  if (binding.trait === 'EncodingSize') {
    return 'quantitative';
  }

  if (binding.trait === 'EncodingColor') {
    // sprint-156 m04: a diverging color scale is a continuous quantitative gradient — it
    // must NOT default to nominal (which would render discrete swatches instead of a ramp).
    if (binding.scale === 'diverging') {
      return 'quantitative';
    }

    if (binding.scale && QUANT_SCALE_TYPES.has(binding.scale)) {
      return 'quantitative';
    }

    return 'nominal';
  }

  if (binding.aggregate) {
    return 'quantitative';
  }

  if (binding.scale && QUANT_SCALE_TYPES.has(binding.scale)) {
    return 'quantitative';
  }

  if (binding.scale && ORDINAL_SCALE_TYPES.has(binding.scale)) {
    return 'ordinal';
  }

  if (channel === 'x') {
    return 'ordinal';
  }

  if (channel === 'y') {
    return 'ordinal';
  }

  if (channel === 'shape') {
    return 'nominal';
  }

  if (channel === 'detail') {
    return 'nominal';
  }

  return 'quantitative';
}

function mapAggregate(value?: EncodingBinding['aggregate']): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value === 'average') {
    return 'mean';
  }

  return value;
}

function mapScaleType(scale?: EncodingBinding['scale']): string | undefined {
  if (!scale || scale === 'linear' || scale === 'log' || scale === 'sqrt' || scale === 'band' || scale === 'point') {
    return scale ?? undefined;
  }

  if (scale === 'temporal') {
    return 'time';
  }

  return undefined;
}

function convertData(spec: NormalizedVizSpec): Record<string, unknown> {
  const source = spec.data;
  const data: Record<string, unknown> = {};

  if (Array.isArray(source.values)) {
    data.values = source.values;
  }

  if (source.url) {
    data.url = source.url;
  }

  if (source.format && source.format !== 'auto') {
    data.format = { type: source.format };
  }

  if (source.name) {
    data.name = source.name;
  }

  return data;
}

function convertTransforms(transforms?: NormalizedVizSpec['transforms']): AdapterTransform[] | undefined {
  if (!transforms || transforms.length === 0) {
    return undefined;
  }

  const converted = transforms
    .map((transform) => convertTransform(transform))
    .filter((entry): entry is AdapterTransform => entry !== undefined);

  return converted.length > 0 ? converted : undefined;
}

function buildInteractionTransforms(interactions?: NormalizedVizSpec['interactions']): AdapterTransform[] | undefined {
  if (!interactions || interactions.length === 0) {
    return undefined;
  }

  const filters = interactions
    .filter((interaction) => interaction.rule.bindTo === 'filter')
    .map((interaction) => ({ filter: { param: interaction.id } } satisfies AdapterTransform));

  return filters.length > 0 ? filters : undefined;
}

function mergeTransforms(
  ...pipelines: Array<AdapterTransform[] | undefined>
): AdapterTransform[] | undefined {
  const merged = pipelines.filter((pipeline): pipeline is AdapterTransform[] => Boolean(pipeline)).flat();
  return merged.length > 0 ? merged : undefined;
}

function convertTransform(transform: NormalizedTransform): AdapterTransform | undefined {
  if (transform.type === 'calculate') {
    const calculated = convertCalculateTransform(transform.params ?? {});

    if (calculated) {
      return calculated;
    }
  }

  if (!transform.params) {
    return undefined;
  }

  if (Object.keys(transform.params).length === 0) {
    return undefined;
  }

  return transform.params as AdapterTransform;
}

function convertCalculateTransform(params: Record<string, unknown>): AdapterTransform | undefined {
  if (typeof params.calculate === 'string') {
    const as = typeof params.as === 'string' ? params.as : undefined;
    return removeUndefined({
      calculate: params.calculate,
      as,
    }) as AdapterTransform;
  }

  if (typeof params.expression === 'string') {
    const as = typeof params.as === 'string' ? params.as : undefined;
    return removeUndefined({
      calculate: params.expression,
      as,
    }) as AdapterTransform;
  }

  if (typeof params.field === 'string' && typeof params.format === 'string') {
    const as = typeof params.as === 'string' ? params.as : params.field;
    return {
      calculate: `timeParse(datum["${params.field}"], "${params.format}")`,
      as,
    } as AdapterTransform;
  }

  return undefined;
}

function buildUserMeta(spec: NormalizedVizSpec): VegaLiteAdapterSpec['usermeta'] {
  const meta: VegaLiteUserMeta = {
    specId: spec.id,
    name: spec.name,
    theme: spec.config?.theme,
    tokens: spec.config?.tokens,
    portability: spec.portability,
    a11y: spec.a11y,
  };

  return {
    oods: removeUndefined(meta),
  };
}

function normalizeInteractions(
  interactions?: NormalizedVizSpec['interactions']
): NormalizedVizSpec['interactions'] | undefined {
  if (!interactions || interactions.length === 0) {
    return undefined;
  }

  const seen = new Set<string>();
  const normalized = interactions
    .map((interaction) => {
      const rawId = interaction.id?.trim();
      if (!rawId) {
        return undefined;
      }
      const baseKey = canonicalizeInteractionId(rawId);
      let candidate = rawId;
      let candidateKey = baseKey;
      let counter = 2;
      while (seen.has(candidateKey)) {
        candidate = `${rawId}-${counter}`;
        candidateKey = `${baseKey}-${counter}`;
        counter += 1;
      }
      seen.add(candidateKey);
      return {
        ...interaction,
        id: candidate,
      };
    })
    .filter((interaction): interaction is NonNullable<typeof interaction> => Boolean(interaction));

  return normalized.length > 0 ? normalized : undefined;
}

function canonicalizeInteractionId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function removeUndefined<T extends object>(input: T): T {
  const entries = Object.entries(input as Record<string, unknown>).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
}

function inferLayerKey(mark: NormalizedMark): string {
  const candidate = mark.options?.id;
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }

  return mark.trait;
}

function applyLayerOrdering(
  layout: NormalizedVizSpec['layout'],
  layers: readonly ConvertedLayer[]
): readonly ConvertedLayer[] {
  if (!layout || layout.trait !== 'LayoutLayer' || !layout.order || layout.order.length === 0) {
    return layers;
  }

  const order = layout.order;
  const remaining = new Map<string, ConvertedLayer>();
  layers.forEach((layer) => remaining.set(layer.key, layer));

  const ordered: ConvertedLayer[] = [];
  for (const key of order) {
    const match = remaining.get(key);
    if (match) {
      ordered.push(match);
      remaining.delete(key);
    }
  }

  for (const layer of layers) {
    if (!ordered.includes(layer)) {
      ordered.push(layer);
    }
  }

  return ordered;
}
