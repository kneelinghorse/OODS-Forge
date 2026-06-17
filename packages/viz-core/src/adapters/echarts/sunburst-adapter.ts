// Sunburst ECharts adapter (sprint-111 m03 port from
// src/viz/adapters/echarts/sunburst-adapter.ts). Pure TS, spec+data DECOUPLED:
// the hierarchy data arrives as the SEPARATE `input` param, NOT through the IR.
// Reuses the already-ported hierarchy-utils (treemap shares them) and the shared
// token-resolver. Echarts is a TYPE-only import (erased at build).

import type { EChartsOption, SunburstSeriesOption } from 'echarts';

import type { HierarchyInput } from '../../spec/network-flow.js';
import type { NormalizedVizSpec } from '../../spec/normalized-viz-spec.js';
import { getVizScaleTokens } from '../../tokens/scale-token-mapper.js';

import { convertToEChartsTreeData, generateHierarchyTooltip } from './hierarchy-utils.js';
import { resolveTokenToColor } from './token-resolver.js';

const START_ANGLE = 90;

// Fallback colors if tokens aren't available (matches categorical scale)
const FALLBACK_PALETTE = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',
];

// UI token fallbacks (for borders, labels - these work in SVG but not canvas fill)
const BORDER_COLOR = '#e0e0e0';
const EMPHASIS_BORDER_COLOR = '#666666';
const LABEL_COLOR = '#333333';
const SURFACE_COLOR = '#ffffff';

export function adaptSunburstToECharts(spec: NormalizedVizSpec, input: HierarchyInput): EChartsOption {
  const data = convertToEChartsTreeData(input);
  const palette = buildPalette();
  const dimensions = resolveDimensions(spec);

  const series = pruneUndefined({
    type: 'sunburst' as const,
    name: spec.name ?? 'Sunburst',
    data: assignColorsToData(data, palette),
    radius: ['0%', '90%'],
    startAngle: START_ANGLE,
    sort: 'desc',
    emphasis: {
      focus: 'ancestor',
      itemStyle: {
        borderColor: EMPHASIS_BORDER_COLOR,
        borderWidth: 3,
        shadowBlur: 10,
      },
    },
    label: {
      rotate: 'radial',
      color: LABEL_COLOR,
    },
    itemStyle: {
      borderRadius: 4,
      borderWidth: 2,
      borderColor: SURFACE_COLOR,
    },
    levels: buildSunburstLevels(),
    width: dimensions.width,
    height: dimensions.height,
  }) as SunburstSeriesOption;

  return pruneUndefined({
    color: palette,
    series: [series],
    tooltip: generateHierarchyTooltip(spec, 'sunburst'),
    aria: { enabled: true, description: spec.a11y?.description },
    title: spec.name ? { text: spec.name } : undefined,
    usermeta: {
      oods: pruneUndefined({
        specId: spec.id,
        name: spec.name,
        theme: spec.config?.theme,
        tokens: spec.config?.tokens,
        layout: spec.config?.layout,
        a11y: spec.a11y,
      }),
    },
  }) as unknown as EChartsOption;
}

function buildPalette(): readonly string[] {
  const tokens = getVizScaleTokens('categorical', { count: 9 });
  const resolved = tokens.map(resolveTokenToColor);

  // If no tokens resolved, use fallback palette
  if (resolved.every((c) => c === undefined)) {
    return FALLBACK_PALETTE;
  }

  return resolved.map((color, i) => color ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length]);
}

/**
 * Assign colors from palette to the first visible level of data nodes.
 * For hierarchical data with a single root, colors go on the root's children.
 * For multiple roots, colors go on each root.
 * ECharts inherits colors down the hierarchy from these nodes.
 */
function assignColorsToData(
  data: Record<string, unknown>[],
  palette: readonly string[]
): Record<string, unknown>[] {
  // If we have a single root with children, color the children
  if (data.length === 1 && Array.isArray(data[0].children) && (data[0].children as unknown[]).length > 0) {
    const root = data[0];
    const coloredChildren = (root.children as Record<string, unknown>[]).map((child, index) => ({
      ...child,
      itemStyle: {
        ...(child.itemStyle as Record<string, unknown> | undefined),
        color: palette[index % palette.length],
      },
    }));
    return [{ ...root, children: coloredChildren }];
  }

  // Multiple roots or flat data - color each top-level node
  return data.map((node, index) => ({
    ...node,
    itemStyle: {
      ...(node.itemStyle as Record<string, unknown> | undefined),
      color: palette[index % palette.length],
    },
  }));
}

function resolveDimensions(spec: NormalizedVizSpec): { width?: number; height?: number } {
  const layout = spec.config?.layout;
  return {
    width: typeof layout?.width === 'number' ? layout.width : undefined,
    height: typeof layout?.height === 'number' ? layout.height : undefined,
  };
}

function buildSunburstLevels(): SunburstSeriesOption['levels'] {
  return [
    {},
    {
      r0: '12%',
      r: '32%',
      label: { rotate: 'tangential' },
      itemStyle: { borderWidth: 1, borderColor: BORDER_COLOR },
    },
    {
      r0: '32%',
      r: '68%',
      label: { align: 'right' },
      itemStyle: { borderWidth: 1, borderColor: BORDER_COLOR },
    },
    {
      r0: '68%',
      r: '72%',
      label: { show: false },
      itemStyle: { borderWidth: 2, borderColor: BORDER_COLOR },
    },
  ];
}

function pruneUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
