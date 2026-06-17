// Treemap ECharts adapter (sprint-111 m01 port from
// src/viz/adapters/echarts/treemap-adapter.ts). Pure TS, spec+data DECOUPLED:
// the hierarchy data arrives as the SEPARATE `input` param, NOT through the IR.
// Echarts is a TYPE-only import (erased at build). The ~70-LOC token-resolution
// block that used to live here is now shared via ./token-resolver.

import type { EChartsOption, TreemapSeriesOption } from 'echarts';

import type { HierarchyInput } from '../../spec/network-flow.js';
import type { NormalizedVizSpec } from '../../spec/normalized-viz-spec.js';
import { getVizScaleTokens } from '../../tokens/scale-token-mapper.js';

import { convertToEChartsTreeData, generateHierarchyTooltip } from './hierarchy-utils.js';
import { resolveTokenToColor } from './token-resolver.js';

const TREEMAP_SQUARE_RATIO = 1.618;

// Fallback colors if tokens aren't available (matches categorical scale)
const FALLBACK_PALETTE = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
];

// UI token fallbacks (for borders, labels - these work in SVG but not canvas fill)
const BORDER_COLOR = '#e0e0e0';
const EMPHASIS_BORDER_COLOR = '#666666';
const LABEL_COLOR = '#333333';
const HEADER_COLOR = '#1a1a1a';
const SURFACE_COLOR = '#ffffff';

interface InteractionFlags {
  readonly drilldown: boolean;
  readonly zoom: boolean;
  readonly breadcrumb: boolean;
}

export function adaptTreemapToECharts(spec: NormalizedVizSpec, input: HierarchyInput): EChartsOption {
  const data = convertToEChartsTreeData(input);
  const palette = buildPalette();
  const dimensions = resolveDimensions(spec);
  const interactions = extractInteractionFlags(spec);

  const series = pruneUndefined({
    type: 'treemap' as const,
    name: spec.name ?? 'Treemap',
    data: assignColorsToData(data, palette),
    width: dimensions.width,
    height: dimensions.height,
    squareRatio: TREEMAP_SQUARE_RATIO,
    roam: interactions.zoom,
    nodeClick: interactions.drilldown ? 'zoomToNode' : false,
    breadcrumb: {
      show: interactions.breadcrumb,
      itemStyle: {
        color: SURFACE_COLOR,
        borderColor: BORDER_COLOR,
      },
      textStyle: { color: LABEL_COLOR },
    },
    label: {
      show: true,
      formatter: '{b}',
      color: LABEL_COLOR,
    },
    upperLabel: {
      show: true,
      height: 28,
      color: HEADER_COLOR,
    },
    itemStyle: {
      borderColor: BORDER_COLOR,
      borderWidth: 1,
      gapWidth: 1,
    },
    levels: buildTreemapLevels(),
    emphasis: {
      focus: 'ancestor',
      itemStyle: {
        borderColor: EMPHASIS_BORDER_COLOR,
        borderWidth: 2,
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
      },
    },
  }) as TreemapSeriesOption;

  return pruneUndefined({
    color: palette,
    series: [series],
    tooltip: generateHierarchyTooltip(spec, 'treemap'),
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
  const tokens = getVizScaleTokens('categorical', { count: 8 });
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

function extractInteractionFlags(spec: NormalizedVizSpec): InteractionFlags {
  const inline = (spec as { interaction?: { drilldown?: boolean; zoom?: boolean; breadcrumb?: boolean } }).interaction ?? {};
  const interactions = spec.interactions ?? [];
  const hasZoomInteraction = interactions.some(
    (interaction) => (interaction.rule as { bindTo?: string } | undefined)?.bindTo === 'zoom'
  );

  return {
    drilldown: inline.drilldown ?? true,
    zoom: inline.zoom ?? hasZoomInteraction ?? false,
    breadcrumb: inline.breadcrumb ?? true,
  };
}

function buildTreemapLevels(): TreemapSeriesOption['levels'] {
  return [
    {
      itemStyle: { borderWidth: 0, gapWidth: 4 },
      upperLabel: { show: false },
    },
    {
      itemStyle: { borderWidth: 2, gapWidth: 2, borderColor: BORDER_COLOR },
    },
    {
      itemStyle: { borderWidth: 1, gapWidth: 1, borderColor: BORDER_COLOR },
    },
  ];
}

function pruneUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
