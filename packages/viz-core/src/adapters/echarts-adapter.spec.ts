import { describe, expect, it } from 'vitest';
import { toEChartsOption } from './echarts-adapter.js';
import { toVegaLiteSpec } from './vega-lite-adapter.js';
import { resolveOodsEchartsChrome } from '../tokens/oods-echarts-chrome.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';

// Item #16 (sprint-151 m03): a layered mark's `from` must resolve against the new
// top-level `datasets` slot. Before m03 the ECharts adapter emitted `dataset: [dataset]`
// (the single primary) while a `from`-referenced series already carried
// `datasetId = mark.from` (echarts-adapter.ts:291) — a DANGLING reference (the id named
// no registered dataset). m03 builds the dataset ARRAY so `datasetId` resolves.
//
// Imports the SOURCE adapter directly (relative, not the @oods/viz-core barrel) so a src
// regression fails HERE at the viz-core unit level — mirrors the s143 m03 discipline that
// keeps the vega-lite-adapter palette-bake guard from being silently removed.

// Median rows are intentionally keyed in a DIFFERENT order than the mark's encoding
// channels (site before median, i.e. y-field first) so the field-name-binding assertion
// below proves ECharts binds by dimension NAME via `encode`, never by column position.
const MEDIAN_ROWS = [
  { site: 'Gov A', median: 80 },
  { site: 'Gov B', median: 80 },
];

const LADDER_ROWS = [
  { site: 'Site A', score: 92 },
  { site: 'Site B', score: 74 },
];

function ladderSpec(withDatasets: boolean): NormalizedVizSpec {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'ladder',
    name: 'Accessibility Ladder',
    data: { name: 'ladder', values: LADDER_ROWS },
    marks: [
      // primary bar layer — INLINE, no `from`; resolves against the primary dataset
      {
        trait: 'MarkBar',
        encodings: {
          x: { field: 'site', trait: 'EncodingX' },
          y: { field: 'score', trait: 'EncodingY' },
        },
      },
      // secondary rule/line layer — resolves against datasets['gov_median']
      {
        trait: 'MarkLine',
        from: withDatasets ? 'gov_median' : undefined,
        encodings: {
          x: { field: 'median', trait: 'EncodingX' },
          y: { field: 'site', trait: 'EncodingY' },
        },
      },
    ],
    encoding: {
      x: { field: 'site', trait: 'EncodingX' },
      y: { field: 'score', trait: 'EncodingY' },
    },
    a11y: { description: 'Accessibility ladder with a government-median rule overlay.' },
    ...(withDatasets ? { datasets: { gov_median: MEDIAN_ROWS } } : {}),
  } as NormalizedVizSpec;
}

interface EChartsDatasetLike {
  readonly id: string;
  readonly source?: readonly Record<string, unknown>[];
  readonly dimensions?: readonly string[];
}
interface EChartsSeriesLike {
  readonly type: string;
  readonly datasetId?: string;
  readonly encode?: { x?: string; y?: string };
}

describe('echarts-adapter — item #16 datasets slot resolves Mark.from', () => {
  it('builds a multi-dataset array so a from-referenced series datasetId resolves (fails at HEAD: single dataset)', () => {
    const option = toEChartsOption(ladderSpec(true)) as unknown as {
      dataset: readonly EChartsDatasetLike[];
      series: readonly EChartsSeriesLike[];
    };

    // The dataset array now carries the primary PLUS every spec.datasets entry.
    expect(option.dataset.length).toBe(2);
    expect(option.dataset[0]?.id).toBe('ladder');
    const govDataset = option.dataset.find((d) => d.id === 'gov_median');
    expect(govDataset).toBeDefined();
    expect(govDataset?.source).toEqual(MEDIAN_ROWS);

    // The secondary series' datasetId (mark.from) now names a REGISTERED dataset.
    const lineSeries = option.series.find((s) => s.type === 'line');
    expect(lineSeries?.datasetId).toBe('gov_median');
  });

  it('binds a from-referenced series by field NAME, not column order (dimensions preserve names + encode references names)', () => {
    const option = toEChartsOption(ladderSpec(true)) as unknown as {
      dataset: readonly EChartsDatasetLike[];
      series: readonly EChartsSeriesLike[];
    };

    const govDataset = option.dataset.find((d) => d.id === 'gov_median');
    // dimensions come from the row keys (site-first here) — the point is that BOTH names
    // are present so ECharts can resolve `encode` by name irrespective of column order.
    expect(govDataset?.dimensions).toEqual(['site', 'median']);

    const lineSeries = option.series.find((s) => s.type === 'line');
    // encode references the mark's OWN encoding field NAMES (x:'median', y:'site'), so a
    // row keyed {site, median} still binds median→x and site→y — never positionally.
    expect(lineSeries?.encode?.x).toBe('median');
    expect(lineSeries?.encode?.y).toBe('site');
  });

  it('primary (inline) series is byte-UNCHANGED by the datasets slot (mixed-spec contract)', () => {
    const withDs = toEChartsOption(ladderSpec(true)) as unknown as { series: readonly EChartsSeriesLike[] };
    const noDs = toEChartsOption(ladderSpec(false)) as unknown as { series: readonly EChartsSeriesLike[] };

    const primaryWith = withDs.series.find((s) => s.type === 'bar');
    const primaryNo = noDs.series.find((s) => s.type === 'bar');
    // The primary bar resolves against the primary dataset id ('ladder') in BOTH — adding
    // datasets to the spec must not move the inline primary's data path.
    expect(primaryWith?.datasetId).toBe('ladder');
    expect(primaryWith).toEqual(primaryNo);
  });

  it('OMITS the extra datasets when spec.datasets is absent → byte-identical single-dataset array (gate-leak guard)', () => {
    const option = toEChartsOption(ladderSpec(false)) as unknown as { dataset: readonly EChartsDatasetLike[] };
    // No spec.datasets → the dataset array is exactly the single primary, as before #16.
    expect(option.dataset.length).toBe(1);
    expect(option.dataset[0]?.id).toBe('ladder');
  });
});

// s156-m02 (NASA #1): an explicit `scale:'log'` must win over a co-declared
// `type:'quantitative'` so the ECharts axis is not silently rendered linear while
// Vega honors the log scale (the dual-output disagreement trap). inferAxisType
// consulted `binding.type` FIRST and returned 'value' for quantitative BEFORE the
// `scale === 'log'` branch could run — unreachable whenever a type was present.
// The silent loss fires ONLY when the caller co-declares BOTH type AND scale:'log'
// (a scale-only log spec already renders correctly). RED at HEAD 7ef5f96.
const LOG_ROWS = [
  { revenue: 1, users: 10 },
  { revenue: 2, users: 1000 },
];

function logAxisSpec(): NormalizedVizSpec {
  const yBinding = {
    field: 'users',
    trait: 'EncodingY',
    // The redundant-but-valid explicit spec: field type AND a log scale together.
    type: 'quantitative' as const,
    scale: 'log' as const,
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'log-axis',
    name: 'Log Axis Scatter',
    data: { name: 'points', values: LOG_ROWS },
    marks: [
      {
        trait: 'MarkPoint',
        encodings: {
          x: { field: 'revenue', trait: 'EncodingX' },
          y: { ...yBinding },
        },
      },
    ],
    encoding: {
      x: { field: 'revenue', trait: 'EncodingX' },
      y: { ...yBinding },
    },
    a11y: { description: 'Scatter with an explicit log y-axis.' },
  } as NormalizedVizSpec;
}

interface EChartsAxisLike {
  readonly type?: string;
}

describe('echarts-adapter — item s156-m02 explicit log scale wins over quantitative type', () => {
  it('emits a log y-axis when the binding co-declares type:quantitative AND scale:log (fails at HEAD: value)', () => {
    const option = toEChartsOption(logAxisSpec()) as unknown as {
      yAxis: EChartsAxisLike | readonly EChartsAxisLike[];
    };
    const yAxis = Array.isArray(option.yAxis) ? option.yAxis[0] : option.yAxis;
    // Before m02, the quantitative short-circuit returned 'value' and the log axis
    // was silently lost — this asserted 'value', diverging from Vega.
    expect((yAxis as EChartsAxisLike)?.type).toBe('log');
  });

  it('matches Vega parity — the same spec compiles to encoding.y.scale.type:log in Vega', () => {
    const compiled = toVegaLiteSpec(logAxisSpec()) as unknown as {
      encoding?: { y?: { scale?: { type?: string } } };
    };
    // Vega already emitted scale.type:'log' at HEAD (orthogonal to field type); the
    // parity assertion pins that the two adapters now AGREE on the log axis.
    expect(compiled.encoding?.y?.scale?.type).toBe('log');
  });
});

// s156-m04 (NASA #4 / FD#18): a cartesian MarkRect heatmap whose color is a quantitative
// measure must emit an ECharts `visualMap` so the continuous color legend renders (Vega
// auto-legends; ECharts had NO visualMap key → the ECharts-only gap). Reuses the a11y
// measure predicates (isMarkRectGrid + heatmapColorIsMeasure) and the SHARED spatial
// visualmap generator; the tick label is themed onto chrome exactly like the geo path
// (visualMap.textStyle.color = chrome.visualMapLabel). RED at HEAD: option.visualMap absent.
const HEATMAP_ROWS = [
  { region: 'North', quarter: 'Q1', revenue: 120 },
  { region: 'South', quarter: 'Q1', revenue: 200 },
  { region: 'North', quarter: 'Q2', revenue: 150 },
  { region: 'South', quarter: 'Q2', revenue: 220 },
];

function heatmapMeasureSpec(): NormalizedVizSpec {
  const color = { field: 'revenue', trait: 'EncodingColor', type: 'quantitative' as const, title: 'Revenue' };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'heatmap',
    name: 'Revenue Heatmap',
    data: { name: 'grid', values: HEATMAP_ROWS },
    marks: [
      {
        trait: 'MarkRect',
        encodings: {
          x: { field: 'region', trait: 'EncodingX', scale: 'band' },
          y: { field: 'quarter', trait: 'EncodingY', scale: 'band' },
          color: { ...color },
        },
      },
    ],
    encoding: {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'quarter', trait: 'EncodingY', scale: 'band' },
      color: { ...color },
    },
    a11y: { description: 'Revenue by region and quarter.' },
  } as NormalizedVizSpec;
}

interface VisualMapLike {
  readonly type?: string;
  readonly min?: number;
  readonly max?: number;
  readonly inRange?: { color?: readonly string[] };
  readonly textStyle?: { color?: string };
}

describe('echarts-adapter — item s156-m04 cartesian heatmap emits a continuous visualMap', () => {
  it('emits a continuous visualMap for a MarkRect measure heatmap (fails at HEAD: no visualMap)', () => {
    const option = toEChartsOption(heatmapMeasureSpec()) as unknown as { visualMap?: VisualMapLike };
    expect(option.visualMap).toBeDefined();
    expect(option.visualMap?.type).toBe('continuous');
    // Domain is the color field's numeric extent across the rows.
    expect(option.visualMap?.min).toBe(120);
    expect(option.visualMap?.max).toBe(220);
  });

  it('bakes the OODS sequential range (resolved colors) as inRange.color', () => {
    const option = toEChartsOption(heatmapMeasureSpec()) as unknown as { visualMap?: VisualMapLike };
    const colors = option.visualMap?.inRange?.color;
    expect(Array.isArray(colors)).toBe(true);
    expect((colors ?? []).length).toBeGreaterThan(2);
    // Colors are RESOLVED for the headless canvas (rgb/hex), never raw `var(--token)`.
    for (const color of colors ?? []) {
      expect(color.startsWith('var(')).toBe(false);
      expect(/^(#|rgb)/.test(color)).toBe(true);
    }
  });

  it('bakes the visualMap tick label onto chrome (textStyle.color = chrome.visualMapLabel)', () => {
    const spec = heatmapMeasureSpec();
    const option = toEChartsOption(spec) as unknown as { visualMap?: VisualMapLike };
    const chrome = resolveOodsEchartsChrome(spec);
    expect(option.visualMap?.textStyle?.color).toBe(chrome.visualMapLabel);
  });

  it('OMITS the visualMap for a non-heatmap (bar) spec — gate-leak guard', () => {
    const option = toEChartsOption(logAxisSpec()) as unknown as { visualMap?: VisualMapLike };
    expect(option.visualMap).toBeUndefined();
  });

  // s157 m03 (B2): a DIVERGING cartesian heatmap centers its visualMap at data 0 (symmetric
  // [-M,+M] domain) == Vega's baked color.scale.domainMid:0 — not the asymmetric-midpoint 0.34.
  it('centers a diverging heatmap visualMap at 0 (symmetric domain == Vega domainMid)', () => {
    const color = { field: 'corr', trait: 'EncodingColor', type: 'quantitative' as const, scale: 'diverging' as const, title: 'Correlation' };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'corr',
      name: 'Correlation matrix',
      data: {
        name: 'm',
        values: [
          { region: 'A', factor: 'x', corr: -0.32 },
          { region: 'A', factor: 'y', corr: 0.5 },
          { region: 'B', factor: 'x', corr: 1 },
        ],
      },
      marks: [
        {
          trait: 'MarkRect',
          encodings: {
            x: { field: 'region', trait: 'EncodingX', scale: 'band' },
            y: { field: 'factor', trait: 'EncodingY', scale: 'band' },
            color: { ...color },
          },
        },
      ],
      encoding: {
        x: { field: 'region', trait: 'EncodingX', scale: 'band' },
        y: { field: 'factor', trait: 'EncodingY', scale: 'band' },
        color: { ...color },
      },
      a11y: { description: 'Correlation matrix with a diverging color scale.' },
    } as unknown as NormalizedVizSpec;

    const option = toEChartsOption(spec) as unknown as { visualMap?: VisualMapLike };
    expect(option.visualMap?.type).toBe('continuous');
    // M = max(|-0.32|, |1|) = 1 → [-1, 1], center 0.
    expect(option.visualMap?.min).toBe(-1);
    expect(option.visualMap?.max).toBe(1);
    expect((option.visualMap!.min! + option.visualMap!.max!) / 2).toBe(0);
  });
});
