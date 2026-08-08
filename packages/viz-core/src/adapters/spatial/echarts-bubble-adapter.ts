// Bubble-map (symbol) ECharts adapter (sprint-112 m01 port).
// Ported from src/viz/adapters/spatial/echarts-bubble-adapter.ts; only the imports
// are repointed (slim spatial spec + local tooltip config) and echarts is a
// TYPE-ONLY import.
//
// PORT PARITY IS DELIBERATELY BROKEN AS OF SPRINT-172 m06, in exactly one place: how
// symbolSize is emitted.
//
// THE DEFECT this file now fixes. The port emitted `series.symbolSize` as a FUNCTION
// closure — correct in a browser, where ECharts calls it per datum. But this adapter feeds
// the HEADLESS path, and viz.render projects every option through
// JSON.parse(JSON.stringify(option)) before returning it, because functions are neither
// JSON-transmittable over the MCP wire nor structured-cloneable for the specRef cache. A
// function key does not survive JSON.stringify at all: it is dropped silently. So the served
// bubble_map option carried NO size encoding whatsoever — not a wrong size, no size — and a
// caller's declared `sizeField` was lost with no error, no warning and no trace in the bytes.
// Reproduced on the served output before the fix: the series' keys were
// coordinateSystem/data/encode/geoIndex/name/tooltip/type, with symbolSize absent.
//
// THE FIX. The same scale maths now runs at BUILD time and writes a plain NUMBER onto each
// data item (`symbolSize` is a valid per-datum property in ECharts, and a data-item value
// takes precedence over the series-level one). Identical range [6,28], identical
// linear/sqrt/log curve, identical degenerate-domain midpoint — the numbers a browser would
// have computed from the closure, computed here instead. JSON-safe by construction, so the
// encoding reaches the wire.
//
// WHY THE src/viz TWIN IS UNTOUCHED. That copy renders in the browser, where the closure
// works and is arguably the better shape (it re-evaluates on data updates). The defect is
// wire-serialization-only, so it exists only here. Its snapshot deliberately still pins
// "symbolSize": "[function]" and is NOT a mover for this change. This header is the record
// that the divergence is intentional rather than drift.

import type { FeatureCollection } from 'geojson';
import type { EChartsOption, GeoComponentOption, ScatterSeriesOption, VisualMapComponentOption } from 'echarts';
import {
  isSymbolLayer,
  type SizeScaleType,
  type SpatialSpec,
  type SymbolLayer,
} from '../../spec/spatial.js';
import { buildEChartsTooltipFormatter, createBubbleTooltipFields } from './spatial-tooltip-config.js';
import { registerGeoJson, type GeoRegistration } from './echarts-geo-registration.js';
import { createVisualMapForScale } from './echarts-visualmap-generator.js';
import { resolveColor } from './geo-token-color.js';
import type { DataRecord } from './geo-data-joiner.js';
import { resolveOodsEchartsChrome } from '../../tokens/oods-echarts-chrome.js';

const DEFAULT_MAP_NAME = 'custom-geo';
const DEFAULT_BUBBLE_RANGE: [number, number] = [6, 28];
// SERIES colour ramp (sequential) — certify-graded, NEVER themed as chrome (guardrail).
const DEFAULT_COLOR_RANGE = [
  'var(--oods-viz-scale-sequential-03, #a5d8ff)',
  'var(--oods-viz-scale-sequential-05, #5ea3ff)',
  'var(--oods-viz-scale-sequential-07, #1f6feb)',
];
// Geo region fills/borders re-pointed onto --oods-sys-* (hex-neutral, memo §2).
const DEFAULT_AREA_COLOR = 'var(--oods-sys-surface-strong, #f2f2f2)';
const DEFAULT_BORDER_COLOR = 'var(--oods-sys-border-subtle, #e0e0e0)';

interface BubbleBuildResult {
  readonly series: ScatterSeriesOption;
  readonly visualMap?: VisualMapComponentOption;
  readonly geo: GeoComponentOption;
  readonly registration?: GeoRegistration;
}

function pruneUndefined<T extends object>(input: T): T {
  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).filter(([, value]) => value !== undefined)
  ) as T;
}

function deriveMapName(spec: SpatialSpec): string {
  if (spec.geo?.feature && typeof spec.geo.feature === 'string') {
    return spec.geo.feature;
  }
  if (spec.geo?.source && typeof spec.geo.source === 'string') {
    const segments = spec.geo.source.split('/');
    return segments[segments.length - 1] || DEFAULT_MAP_NAME;
  }
  if (spec.id) {
    return `map-${spec.id}`;
  }
  if (spec.name) {
    return spec.name.toLowerCase().replace(/\\s+/g, '-');
  }
  return DEFAULT_MAP_NAME;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function numericDomain(values: number[]): [number, number] {
  if (values.length === 0) {
    return [0, 1];
  }
  return [Math.min(...values), Math.max(...values)];
}

function buildGeoComponent(mapName: string, roam: boolean): GeoComponentOption {
  return pruneUndefined({
    map: mapName,
    roam,
    label: { show: false },
    itemStyle: {
      areaColor: resolveColor(DEFAULT_AREA_COLOR),
      borderColor: resolveColor(DEFAULT_BORDER_COLOR),
    },
  });
}

/**
 * The per-datum size scale. Kept as a factory returning a function because the maths is
 * per-value; s172 m06 changed only WHERE it is called — at build time, once per datum, so a
 * NUMBER lands in the option instead of this closure landing on the series (see the header).
 * Exported so the scale maths can be unit-tested directly against the emitted numbers.
 */
export function buildSizeFunction(
  domain: [number, number],
  range: [number, number],
  scale: SizeScaleType | undefined
): (value: unknown) => number {
  const [minValue, maxValue] = domain;
  const [minSize, maxSize] = range;

  if (minValue === maxValue) {
    const size = (minSize + maxSize) / 2;
    return () => size;
  }

  const span = maxValue - minValue;
  const clamp = (value: number): number => Math.max(0, Math.min(1, value));

  return (value: unknown): number => {
    const numeric = Array.isArray(value) ? coerceNumber(value[2]) : coerceNumber(value);
    if (numeric === null) {
      return minSize;
    }
    const ratio = clamp((numeric - minValue) / span);
    const scaled =
      scale === 'log'
        ? Math.log10(1 + ratio * 9) // Normalize log curve between 0-1
        : scale === 'sqrt'
          ? Math.sqrt(ratio)
          : ratio;
    return minSize + (maxSize - minSize) * scaled;
  };
}

function resolveColorPalette(range?: readonly string[]): readonly string[] {
  const palette = range && range.length > 0 ? range : DEFAULT_COLOR_RANGE;
  // Resolve to concrete colours — the ordinal itemStyle path writes these straight
  // into the option, where the headless canvas cannot resolve a CSS var().
  return palette.map(resolveColor);
}

function buildOrdinalColorMap(values: Array<string | null>, palette: readonly string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  let index = 0;
  for (const value of values) {
    if (!value || colorMap.has(value)) {
      continue;
    }
    const color = palette[index % palette.length];
    colorMap.set(value, color);
    index += 1;
  }
  return colorMap;
}

export function buildBubbleSeries(
  spec: SpatialSpec,
  layer: SymbolLayer,
  data: DataRecord[],
  geoData: FeatureCollection | undefined
): BubbleBuildResult {
  const mapName = deriveMapName(spec);
  const sizeEncoding = layer.encoding.size;
  const colorEncoding = layer.encoding.color;
  const sizeRange: [number, number] = sizeEncoding?.range
    ? [sizeEncoding.range[0], sizeEncoding.range[1]]
    : DEFAULT_BUBBLE_RANGE;

  const sizeValues = data
    .map((datum) => coerceNumber(sizeEncoding?.field ? datum[sizeEncoding.field] : null))
    .filter((value): value is number => value !== null);

  const sizeDomain = numericDomain(sizeValues);
  // Evaluated per datum below; NOT attached to the series (s172 m06 — a closure there is
  // dropped by viz.render's JSON projection, taking the whole size encoding with it).
  const sizeFor = buildSizeFunction(sizeDomain, sizeRange, sizeEncoding?.scale);

  const colorPalette = resolveColorPalette(colorEncoding?.range);
  const colorField = colorEncoding?.field;
  const colorValues = colorField
    ? data.map((datum) => {
        const value = datum[colorField];
        return value === null || value === undefined ? null : String(value);
      })
    : [];
  const colorMap =
    colorEncoding?.scale === 'ordinal' && colorField ? buildOrdinalColorMap(colorValues, colorPalette) : undefined;

  const seriesData = data.map((datum, index) => {
    const longitude = coerceNumber(datum[layer.encoding.longitude.field]);
    const latitude = coerceNumber(datum[layer.encoding.latitude.field]);
    const sizeValue = sizeEncoding?.field ? coerceNumber(datum[sizeEncoding.field]) : null;
    const colorValue = colorField ? coerceNumber(datum[colorField]) ?? null : sizeValue;
    // sprint-125 m06: a coordinate is never a label — drop the longitude/latitude
    // fallbacks that named every bubble after its own coordinate (e.g. '-115.1').
    // Fall back to a non-coordinate encoded dimension (colorField) if present, else
    // a stable point-index. With a numeric colorField (e.g. 'pop') the label is the
    // value, not a place name — honest given the data, no schema change.
    const name = String((colorField ? datum[colorField] : undefined) ?? `point-${index}`);

    const itemColor =
      colorEncoding?.scale === 'ordinal' && colorField
        ? colorMap?.get(String(datum[colorField] ?? '')) ?? undefined
        : undefined;

    return pruneUndefined({
      name,
      value: [longitude, latitude, sizeValue, colorValue],
      // A plain number, computed from the SAME scale the series closure used to carry.
      // Survives JSON transport, so the declared size encoding reaches the consumer.
      symbolSize: sizeFor(sizeValue),
      raw: datum,
      itemStyle: itemColor ? { color: itemColor } : undefined,
    });
  });

  const geo = buildGeoComponent(mapName, Boolean(spec.interactions?.some((interaction) => interaction.type === 'panZoom')));
  const registration = geoData ? registerGeoJson(mapName, geoData) : undefined;
  const tooltipFormatter = buildEChartsTooltipFormatter(
    createBubbleTooltipFields({
      longitudeField: layer.encoding.longitude.field,
      latitudeField: layer.encoding.latitude.field,
      sizeField: layer.encoding.size?.field,
      colorField: layer.encoding.color?.field,
    })
  );

  const series = pruneUndefined({
    type: 'scatter',
    coordinateSystem: 'geo',
    geoIndex: 0,
    name: spec.name ?? 'Bubble Map',
    data: seriesData,
    // No series-level `symbolSize`: it would be a function, and a function is dropped by the
    // JSON projection. Each data item carries its own numeric size instead (s172 m06).
    encode: {
      lng: 0,
      lat: 1,
      value: colorEncoding?.field ? 3 : 2,
    },
    tooltip: { formatter: tooltipFormatter },
  }) as unknown as ScatterSeriesOption;

  let visualMap: VisualMapComponentOption | undefined;
  if (colorEncoding?.field && colorEncoding.scale !== 'ordinal') {
    const numericColors = data
      .map((datum) => coerceNumber(datum[colorEncoding.field as string]))
      .filter((value): value is number => value !== null);
    visualMap = createVisualMapForScale({
      scale: colorEncoding.scale,
      domain: (colorEncoding.domain as [number, number] | undefined) ?? undefined,
      range: colorEncoding.range,
      values: numericColors,
    });
    visualMap.dimension = 3;
  }

  return { series, visualMap, geo, registration };
}

export function adaptBubbleToECharts(
  spec: SpatialSpec,
  geoData: FeatureCollection | undefined,
  data: DataRecord[],
  dimensions: { readonly width: number; readonly height: number }
): EChartsOption {
  if (!data || data.length === 0) {
    throw new Error('Bubble map requires tabular data records.');
  }

  const symbolLayer = spec.layers.find(isSymbolLayer);
  if (!symbolLayer) {
    throw new Error('Spatial spec must include at least one symbol layer for bubble map rendering.');
  }

  const result = buildBubbleSeries(spec, symbolLayer, data, geoData);
  const chrome = resolveOodsEchartsChrome(spec);
  const tooltipFormatter = buildEChartsTooltipFormatter(
    createBubbleTooltipFields({
      longitudeField: symbolLayer.encoding.longitude.field,
      latitudeField: symbolLayer.encoding.latitude.field,
      sizeField: symbolLayer.encoding.size?.field,
      colorField: symbolLayer.encoding.color?.field,
    })
  );
  const option = pruneUndefined({
    backgroundColor: chrome.background,
    geo: result.geo,
    // Bake the visualMap tick label onto text-neutral when a value-driven scale is shown
    // (memo §6); no visualMap → nothing to bake.
    visualMap: result.visualMap
      ? { ...result.visualMap, textStyle: { color: chrome.visualMapLabel } }
      : undefined,
    series: [result.series],
    tooltip: { trigger: 'item', formatter: tooltipFormatter },
    aria: { enabled: true, description: spec.a11y?.description },
    title: spec.name ? { text: spec.name } : undefined,
    usermeta: {
      oods: pruneUndefined({
        specId: spec.id,
        name: spec.name,
        theme: spec.config?.theme,
        tokens: spec.config?.tokens,
        a11y: spec.a11y,
        layout: spec.config?.layout,
        dimensions,
      }),
    },
  }) as unknown as EChartsOption;

  if (result.registration) {
    (option as Record<string, unknown>).__registration = result.registration;
  }

  return option;
}

export type { BubbleBuildResult };
