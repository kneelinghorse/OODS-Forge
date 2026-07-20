// VisualMap generation for the choropleth/bubble geo adapters (sprint-112 m01 port).
// Ported verbatim from src/viz/adapters/spatial/echarts-visualmap-generator.ts;
// the only change is the ColorScaleType import (now the local slim spatial spec)
// and echarts as a TYPE-ONLY import.

import type { VisualMapComponentOption } from 'echarts';
import type { ColorScaleType } from '../../spec/spatial.js';
import { resolveColor } from './geo-token-color.js';

const DEFAULT_CONTINUOUS_COLORS = [
  'var(--oods-viz-scale-sequential-01, #e0f2ff)',
  'var(--oods-viz-scale-sequential-05, #5ea3ff)',
  'var(--oods-viz-scale-sequential-07, #1f6feb)',
];

const DEFAULT_PIECEWISE_COLORS = [
  'var(--oods-viz-scale-sequential-01, #e0f2ff)',
  'var(--oods-viz-scale-sequential-03, #add3ff)',
  'var(--oods-viz-scale-sequential-05, #5ea3ff)',
  'var(--oods-viz-scale-sequential-07, #1f6feb)',
];

// sprint-156 m04: the OODS diverging viz-scale — a two-hue gradient about a neutral mid.
// A `scale:'diverging'` routes to a CONTINUOUS visualMap (not piecewise) with this palette
// so ECharts renders the same divergence the Vega side bakes (getVizScaleTokens('diverging')).
const DEFAULT_DIVERGING_COLORS = [
  'var(--oods-viz-scale-diverging-neg-05, #400031)',
  'var(--oods-viz-scale-diverging-neutral, #c0c4cb)',
  'var(--oods-viz-scale-diverging-pos-05, #400000)',
];

function pruneUndefined<T extends object>(input: T): T {
  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).filter(([, value]) => value !== undefined)
  ) as T;
}

function fallbackDomain(domain: [number, number] | undefined, values: number[]): [number, number] {
  if (domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1])) {
    return domain;
  }

  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return [0, 1];
  }

  return [Math.min(...finiteValues), Math.max(...finiteValues)];
}

function interpolatePieces(domain: [number, number], count: number): Array<{ min: number; max: number }> {
  const [min, max] = domain;
  if (count <= 1 || min === max) {
    return [{ min, max }];
  }

  const step = (max - min) / count;
  const pieces: Array<{ min: number; max: number }> = [];
  let cursor = min;
  for (let index = 0; index < count; index += 1) {
    const next = index === count - 1 ? max : cursor + step;
    pieces.push({ min: cursor, max: next });
    cursor = next;
  }
  return pieces;
}

export function createContinuousVisualMap(
  domain: [number, number],
  range: readonly string[] = DEFAULT_CONTINUOUS_COLORS
): VisualMapComponentOption {
  const [min, max] = domain;
  return pruneUndefined({
    type: 'continuous',
    min,
    max,
    calculable: true,
    inRange: { color: range.map(resolveColor) },
  });
}

export function createPiecewiseVisualMap(
  pieces: Array<{ min?: number; max?: number; label?: string; value?: number }> | undefined,
  colors: readonly string[] = DEFAULT_PIECEWISE_COLORS,
  splitNumber?: number
): VisualMapComponentOption {
  const palette = colors.length > 0 ? colors : DEFAULT_PIECEWISE_COLORS;
  const resolvedPieces =
    pieces && pieces.length > 0
      ? pieces
      : [{ min: 0, max: 1 }];

  const coloredPieces = resolvedPieces.map((piece, index) => ({
    ...piece,
    color: resolveColor(palette[index % palette.length]),
  }));

  return pruneUndefined({
    type: 'piecewise',
    splitNumber,
    pieces: coloredPieces,
  });
}

export function createVisualMapForScale(params: {
  readonly scale: ColorScaleType | undefined;
  readonly domain?: [number, number];
  readonly range?: readonly string[];
  readonly values: readonly number[];
}): VisualMapComponentOption {
  const domain = fallbackDomain(params.domain, [...params.values]);
  const hasRange = Boolean(params.range && params.range.length > 0);
  const palette = hasRange ? (params.range as readonly string[]) : DEFAULT_CONTINUOUS_COLORS;
  const { scale } = params;

  // sprint-156 m04: diverging is a CONTINUOUS scale — a caller-supplied range wins, else
  // the OODS diverging default. Grouped with linear so a diverging heatmap/geo layer emits
  // one continuous visualMap (never binned pieces).
  if (scale === 'diverging') {
    return createContinuousVisualMap(domain, hasRange ? palette : DEFAULT_DIVERGING_COLORS);
  }

  if (!scale || scale === 'linear') {
    return createContinuousVisualMap(domain, palette);
  }

  const pieceCount = palette.length || 5;
  const pieces = interpolatePieces(domain, pieceCount).map((piece, index) => ({
    ...piece,
    label: `Bin ${index + 1}`,
  }));

  return createPiecewiseVisualMap(pieces, palette, pieceCount);
}
