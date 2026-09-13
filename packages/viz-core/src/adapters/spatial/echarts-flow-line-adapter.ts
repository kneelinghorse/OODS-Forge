import type { TokenScope } from '../echarts/token-resolver.js';
// Flow-map (route/flow-line) ECharts adapter (sprint-119 m01).
// The 6th explicit-only geo type: origin→destination ARC lines. Mirrors the bubble
// adapter's structure — echarts is a TYPE-ONLY import, the series is built from the
// SEPARATE tabular `data` param on a 'geo' coordinate system, and a numeric strength
// field drives a continuous visualMap over lineWidth. Native arc support comes from
// the ECharts 'lines' series + lineStyle.curveness (no plugin); the option is
// deterministic (the tooltip-formatter closure is dropped by the viz.render JSON
// projection, so it never breaks byte-identity).

import type { FeatureCollection } from 'geojson';
import type { EChartsOption, GeoComponentOption, LinesSeriesOption, VisualMapComponentOption } from 'echarts';
import { isRouteLayer, type RouteLayer, type SpatialSpec } from '../../spec/spatial.js';
import { buildEChartsTooltipFormatter, createFlowLineTooltipFields } from './spatial-tooltip-config.js';
import { registerGeoJson, type GeoRegistration } from './echarts-geo-registration.js';
import { resolveColor } from './geo-token-color.js';
import type { DataRecord } from './geo-data-joiner.js';
import { resolveOodsEchartsChrome } from '../../tokens/oods-echarts-chrome.js';

const DEFAULT_MAP_NAME = 'custom-geo';
const DEFAULT_CURVENESS = 0.3;
const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_LINE_WIDTH_RANGE: [number, number] = [1, 6];
const DEFAULT_LINE_OPACITY = 0.6;
// SERIES arc colour (sequential) — certify-graded, NEVER themed as chrome (guardrail).
const DEFAULT_LINE_COLOR = 'var(--oods-viz-scale-sequential-06, #3b82f6)';
// Geo region fills/borders re-pointed onto --oods-sys-* (hex-neutral, memo §2).
const DEFAULT_AREA_COLOR = 'var(--oods-sys-surface-strong, #f2f2f2)';
const DEFAULT_BORDER_COLOR = 'var(--oods-sys-border-subtle, #e0e0e0)';

interface FlowLineBuildResult {
  readonly series: LinesSeriesOption;
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
    return spec.name.toLowerCase().replace(/\s+/g, '-');
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

function buildGeoComponent(mapName: string, roam: boolean, scope: TokenScope): GeoComponentOption {
  return pruneUndefined({
    map: mapName,
    roam,
    label: { show: false },
    itemStyle: {
      // HC owns a declared system canvas; the legacy light/dark fallback stays scoped.
      areaColor: resolveColor(scope.theme === 'hc' ? '--oods-sys-surface-canvas' : DEFAULT_AREA_COLOR, scope),
      borderColor: resolveColor(DEFAULT_BORDER_COLOR, scope),
    },
  });
}

function requireEndpoint(field: string | undefined, which: string): string {
  if (!field) {
    throw new Error(`Flow map route layer is missing the ${which} coordinate field.`);
  }
  return field;
}

export function buildFlowLineSeries(
  spec: SpatialSpec,
  layer: RouteLayer,
  data: DataRecord[],
  geoData: FeatureCollection | undefined,
  scope: TokenScope = {}
): FlowLineBuildResult {
  const mapName = deriveMapName(spec);
  const startLng = requireEndpoint(layer.encoding.start.longitude, 'start longitude');
  const startLat = requireEndpoint(layer.encoding.start.latitude, 'start latitude');
  const endLng = requireEndpoint(layer.encoding.end.longitude, 'end longitude');
  const endLat = requireEndpoint(layer.encoding.end.latitude, 'end latitude');

  const widthEncoding = layer.encoding.strokeWidth;
  const strengthField = widthEncoding?.field;
  const widthRange: [number, number] = widthEncoding?.range
    ? [widthEncoding.range[0], widthEncoding.range[1]]
    : DEFAULT_LINE_WIDTH_RANGE;
  const staticWidth = widthEncoding?.value ?? DEFAULT_LINE_WIDTH;
  const curveness = layer.encoding.curvature?.value ?? DEFAULT_CURVENESS;
  const opacity = layer.encoding.opacity?.value ?? DEFAULT_LINE_OPACITY;
  const lineColor = resolveColor(layer.encoding.color?.value ?? DEFAULT_LINE_COLOR, scope);

  const strengthValues = strengthField
    ? data.map((datum) => coerceNumber(datum[strengthField])).filter((value): value is number => value !== null)
    : [];

  const seriesData = data.map((datum) => {
    const originLongitude = coerceNumber(datum[startLng]);
    const originLatitude = coerceNumber(datum[startLat]);
    const destinationLongitude = coerceNumber(datum[endLng]);
    const destinationLatitude = coerceNumber(datum[endLat]);
    const strength = strengthField ? coerceNumber(datum[strengthField]) : null;
    return pruneUndefined({
      coords: [
        [originLongitude, originLatitude],
        [destinationLongitude, destinationLatitude],
      ],
      value: strength ?? undefined,
      // Reuse the shared `raw` datum key so the existing tooltip extractor picks up
      // the source row with ZERO change to its private branch logic.
      raw: datum,
    });
  });

  const tooltipFormatter = buildEChartsTooltipFormatter(
    createFlowLineTooltipFields({
      originLongitudeField: startLng,
      originLatitudeField: startLat,
      destinationLongitudeField: endLng,
      destinationLatitudeField: endLat,
      strengthField,
    })
  );

  const series = pruneUndefined({
    type: 'lines',
    coordinateSystem: 'geo',
    geoIndex: 0,
    polyline: false,
    name: spec.name ?? 'Flow Map',
    data: seriesData,
    // When strength drives width, the visualMap's inRange.lineWidth owns it; otherwise
    // pin a static width so the arc is visible.
    lineStyle: pruneUndefined({
      color: lineColor,
      curveness,
      opacity,
      width: strengthField ? undefined : staticWidth,
    }),
    tooltip: { formatter: tooltipFormatter },
  }) as unknown as LinesSeriesOption;

  const geo = buildGeoComponent(
    mapName,
    Boolean(spec.interactions?.some((interaction) => interaction.type === 'panZoom')), scope);
  const registration = geoData ? registerGeoJson(mapName, geoData) : undefined;

  let visualMap: VisualMapComponentOption | undefined;
  if (strengthField) {
    const [min, max] = numericDomain(strengthValues);
    visualMap = pruneUndefined({
      type: 'continuous',
      min,
      max,
      calculable: true,
      show: false,
      seriesIndex: 0,
      inRange: { lineWidth: widthRange },
    }) as unknown as VisualMapComponentOption;
  }

  return { series, visualMap, geo, registration };
}

export function adaptFlowLineToECharts(
  spec: SpatialSpec,
  geoData: FeatureCollection | undefined,
  data: DataRecord[],
  dimensions: { readonly width: number; readonly height: number },
  scope: TokenScope = {}
): EChartsOption {
  if (!data || data.length === 0) {
    throw new Error('Flow map requires tabular data records (the origin→destination flows).');
  }

  const routeLayer = spec.layers.find(isRouteLayer);
  if (!routeLayer) {
    throw new Error('Spatial spec must include at least one route layer for flow map rendering.');
  }

  const result = buildFlowLineSeries(spec, routeLayer, data, geoData, scope);
  const chrome = resolveOodsEchartsChrome(spec, scope);
  const tooltipFormatter = buildEChartsTooltipFormatter(
    createFlowLineTooltipFields({
      originLongitudeField: requireEndpoint(routeLayer.encoding.start.longitude, 'start longitude'),
      originLatitudeField: requireEndpoint(routeLayer.encoding.start.latitude, 'start latitude'),
      destinationLongitudeField: requireEndpoint(routeLayer.encoding.end.longitude, 'end longitude'),
      destinationLatitudeField: requireEndpoint(routeLayer.encoding.end.latitude, 'end latitude'),
      strengthField: routeLayer.encoding.strokeWidth?.field,
    })
  );

  const option = pruneUndefined({
    backgroundColor: chrome.background,
    geo: result.geo,
    // Bake the visualMap tick label onto text-neutral when a strength-driven scale exists
    // (memo §6); the flow visualMap is show:false, so this is inert-but-consistent chrome.
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

export type { FlowLineBuildResult };
