import { describe, expect, it } from 'vitest';
import { toEChartsOption } from './echarts-adapter.js';
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
