// Chord ECharts adapter (sprint-120 m01). The 7th EXPLICIT-ONLY ECharts-primary
// type: a NATIVE ECharts 6.0.0 series.type:'chord' ribbon diagram (a ring of
// category arcs connected by weighted ribbons; ribbon width IS the edge value).
//
// Pure TS, spec+data DECOUPLED: the flow data arrives as the SEPARATE `input`
// param. It REUSES the SankeyInput contract (required-value links) — a chord is a
// closed, symmetric flow between the SAME category set, so the sankey-shaped
// {nodes[{name}], links[{source,target,value}]} fits exactly with zero new IR.
//
// WRITTEN FRESH for type:'chord' — it is NOT a graph-adapter clone: chord has no
// force layout / roam / draggable / categories[] array. Instead each node IS its
// own ring arc, so nodes are coloured per-index from the palette and ribbons
// inherit the SOURCE node colour (lineStyle.color:'source', the native default).
// Edges match nodes BY NAME (not id). Echarts is a TYPE-only import (erased at
// build); the consumer's bundle must register ChordChart to render the option.
//
// Determinism boundary: the emitted OPTION is a pure, deterministic function of
// (spec, input) — nodes/links .map() over the input in order, the palette is a
// sorted token lookup, and the ring geometry is static config. The tooltip uses a
// STRING template (NOT a formatter closure) so it survives JSON transport (the MCP
// wire / specRef cache) and is visible to the jsonSafe golden.

import type { ChordSeriesOption, EChartsOption } from 'echarts';

import type { SankeyInput, SankeyLink, SankeyNode } from '../../spec/network-flow.js';
import type { NormalizedVizSpec } from '../../spec/normalized-viz-spec.js';
import { getVizScaleTokens } from '../../tokens/scale-token-mapper.js';

import { resolveTokenToColor } from './token-resolver.js';

// Fallback colors if tokens aren't available (matches the categorical scale used
// by the sibling network/flow adapters).
const FALLBACK_PALETTE = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',
];

// UI token fallbacks (for labels, node borders).
const LABEL_COLOR = '#333333';
const BORDER_COLOR = '#e0e0e0';

// Native ECharts chord ring/ribbon defaults (ChordSeries.js defaultOption), pinned
// here so the emitted option is self-documenting and the golden is explicit.
const DEFAULT_START_ANGLE = 90;
const DEFAULT_PAD_ANGLE = 3;
const DEFAULT_MIN_ANGLE = 0;
const DEFAULT_CURVENESS = 0.5;
const DEFAULT_LINK_OPACITY = 0.5;

interface ChordSpecExtensions {
  readonly layout?: {
    readonly startAngle?: number;
    readonly padAngle?: number;
    readonly clockwise?: boolean;
  };
  readonly encoding?: NormalizedVizSpec['encoding'] & {
    readonly link?: {
      readonly curveness?: number;
    };
    readonly label?: {
      readonly show?: boolean;
    };
  };
}

type ChordStorySpec = NormalizedVizSpec & ChordSpecExtensions;

interface EChartsChordNode {
  readonly name: string;
  readonly itemStyle: { readonly color: string };
}

interface EChartsChordLink {
  readonly source: string;
  readonly target: string;
  readonly value: number;
}

/**
 * Adapt a SankeyInput to a NATIVE ECharts ChordSeriesOption.
 *
 * Ribbon width is driven by `link.value` natively (ECharts sizes each ribbon from
 * the edge value at render time — we do NOT precompute a width). Ring node order
 * is the input order (deterministic); each node is coloured by its index.
 */
export function adaptChordToECharts(spec: NormalizedVizSpec, input: SankeyInput): EChartsOption {
  const chordSpec = spec as ChordStorySpec;
  const palette = buildPalette();
  const dimensions = resolveDimensions(chordSpec);

  const nodes = buildNodes(input.nodes, palette);
  const links = buildLinks(input.links);

  const series = pruneUndefined({
    type: 'chord' as const,
    name: chordSpec.name ?? 'Chord',
    // chord rides no cartesian/polar grid — it lays out its own ring.
    coordinateSystem: 'none' as const,

    // Ring nodes (keyed by NAME) + ribbons (matched to nodes by name).
    nodes,
    links,

    // Ring geometry (native chord defaults; overridable via spec.layout).
    clockwise: chordSpec.layout?.clockwise ?? true,
    startAngle: chordSpec.layout?.startAngle ?? DEFAULT_START_ANGLE,
    padAngle: chordSpec.layout?.padAngle ?? DEFAULT_PAD_ANGLE,
    minAngle: DEFAULT_MIN_ANGLE,

    // Arc labels sit OUTSIDE the ring.
    label: {
      show: chordSpec.encoding?.label?.show !== false,
      position: 'outside' as const,
      color: LABEL_COLOR,
    },

    // Ribbons inherit the SOURCE arc's colour (native default) + a curved bow.
    lineStyle: {
      color: 'source' as const,
      curveness: chordSpec.encoding?.link?.curveness ?? DEFAULT_CURVENESS,
      opacity: DEFAULT_LINK_OPACITY,
    },

    // Node arc border.
    itemStyle: {
      borderWidth: 1,
      borderColor: BORDER_COLOR,
    },

    // Highlight a node + its ribbons on hover.
    emphasis: {
      focus: 'adjacency' as const,
    },

    // Dimensions (provenance-only; the client sizes the canvas).
    width: dimensions.width,
    height: dimensions.height,
  }) as ChordSeriesOption;

  return pruneUndefined({
    color: palette,
    series: [series],
    // STRING-template tooltip (NOT a formatter closure): {b} = arc/ribbon name,
    // {c} = value. Survives JSON.parse(JSON.stringify) at the viz.render boundary
    // and is visible to the jsonSafe golden (a function would be dropped by both).
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    aria: { enabled: true, description: chordSpec.a11y?.description },
    title: chordSpec.name ? { text: chordSpec.name } : undefined,
    usermeta: {
      oods: pruneUndefined({
        specId: chordSpec.id,
        name: chordSpec.name,
        theme: chordSpec.config?.theme,
        tokens: chordSpec.config?.tokens,
        layout: chordSpec.config?.layout,
        a11y: chordSpec.a11y,
      }),
    },
  }) as unknown as EChartsOption;
}

// Ring nodes keyed by NAME; each arc coloured by its index in the palette. A chord
// node IS its own category (one ring arc), so there is no separate group field.
function buildNodes(nodes: readonly SankeyNode[], palette: readonly string[]): EChartsChordNode[] {
  return nodes.map((node, index) => ({
    name: node.name,
    itemStyle: { color: palette[index % palette.length] },
  }));
}

// Ribbons carry {source, target, value} as the SAME name strings the nodes use
// (ECharts matches edges to ring arcs by name); value drives ribbon width natively.
function buildLinks(links: readonly SankeyLink[]): EChartsChordLink[] {
  return links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value,
  }));
}

function buildPalette(): readonly string[] {
  const tokens = getVizScaleTokens('categorical', { count: 9 });
  const resolved = tokens.map(resolveTokenToColor);

  // If no tokens resolved, use the fallback palette.
  if (resolved.every((c) => c === undefined)) {
    return FALLBACK_PALETTE;
  }

  return resolved.map((color, i) => color ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length]);
}

function resolveDimensions(spec: ChordStorySpec): { width?: number; height?: number } {
  const layout = spec.config?.layout;
  return {
    width: typeof layout?.width === 'number' ? layout.width : undefined,
    height: typeof layout?.height === 'number' ? layout.height : undefined,
  };
}

function pruneUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
