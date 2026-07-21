import { describe, expect, it } from 'vitest';
import { analyzeVizSpec, generateNarrativeSummary, type NormalizedVizSpec } from '@oods/viz-core';

// ============================================================================
// Sprint-158 m3 — DRAWN-VALUE HONESTY invariant (SSOT memo §2/§5). The narrative
// may name only a value the chart actually DRAWS. This harness's oracle is
// HAND-DERIVED from the KNOWN cell construction — it imports ZERO product
// classification code (no seriesGroupingFields / projectAggregatedRows /
// drawnMarkValues / resolvePrimaryChannels), so a property passing is INDEPENDENT
// evidence, NOT a mirror of the runtime. This is the exact per-oracle
// SUT-independence the s155/s157 mirror-oracle failures lacked, applied to the
// projection-honesty question this sprint closes.
//
// It enumerates the axes the s157 harness never did — the SECOND positional
// dimension (yCard∈{1,2,3}), multi-row-per-cell re-reduction, shape grouping,
// nominal size, x2/y2 band endpoints, correlation on a version axis — in BOTH
// directions. INV1 (extrema-membership) is RED at HEAD for yCard>1 and the
// sum-heatmap (the s157 survivor + its summative sibling); GREEN after the root
// fix, and the runtime guard keeps it GREEN even if the projection under-keys.
// ============================================================================

type Agg = 'average' | 'sum' | 'min' | 'max' | 'median' | 'distinct' | 'count';
const AGGREGATES: Agg[] = ['average', 'sum', 'min', 'max', 'median', 'distinct', 'count'];

// ---- HAND-DERIVED oracle: reduce a group's raw values (independent reimplementation) -------------
function oracleReduce(values: number[], agg: Agg): number {
  const sorted = [...values].sort((a, b) => a - b);
  switch (agg) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'count':
      return values.length;
    case 'distinct':
      return new Set(values).size;
    case 'min':
      return sorted[0];
    case 'max':
      return sorted[sorted.length - 1];
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'median': {
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }
  }
}

// A region×hour grid of raw temperatures. Cell values are DISTINCT per (region,hour) so a per-region
// marginal mean over hour (the s157 "67.8/22.6" phantom) differs from every real drawn cell.
type Grid = Record<string, Record<string, number[]>>;

const GRIDS: Record<number, Grid> = {
  1: { North: { '9': [10] }, South: { '9': [50] } },
  2: { North: { '9': [10], '10': [30] }, South: { '9': [50], '10': [90] } },
  3: {
    North: { '9': [10], '10': [30], '11': [22] },
    South: { '9': [50], '10': [90], '11': [66] },
    East: { '9': [41], '10': [17], '11': [73] },
  },
};
// a multi-row-per-cell grid to prove RE-REDUCTION (the drawn cell is the cell's aggregate, not a raw row)
const MULTIROW_GRID: Grid = { North: { '9': [10, 20], '10': [40, 60] }, South: { '9': [50, 70], '10': [80, 100] } };

function heatmapSpec(grid: Grid, agg: Agg): NormalizedVizSpec {
  const values: Record<string, unknown>[] = [];
  for (const region of Object.keys(grid)) {
    for (const hour of Object.keys(grid[region])) {
      for (const temp of grid[region][hour]) {
        values.push({ region, hour, temp });
      }
    }
  }
  const encoding = {
    x: { field: 'region', trait: 'EncodingX', scale: 'band' },
    y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
    color: { field: 'temp', trait: 'EncodingColor', channel: 'color', scale: 'linear', aggregate: agg },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'heat',
    name: 'Temperature heatmap',
    data: { name: 'h', values },
    marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
    encoding,
    a11y: { description: 'Temperature by region and hour.' },
  } as unknown as NormalizedVizSpec;
}

// A heatmap draws one rect PER (region,hour) cell, so the drawn values are the per-cell reductions —
// for EVERY aggregate (a rect never stacks). This is the independent ground truth.
function expectedDrawnCells(grid: Grid, agg: Agg): number[] {
  const cells: number[] = [];
  for (const region of Object.keys(grid)) {
    for (const hour of Object.keys(grid[region])) {
      cells.push(oracleReduce(grid[region][hour], agg));
    }
  }
  return cells;
}

const approx = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

describe('s158 INV1 — heatmap extrema name a DRAWN cell across the second positional dimension', () => {
  for (const yCard of [1, 2, 3]) {
    for (const agg of AGGREGATES) {
      it(`yCard=${yCard} agg=${agg}: max/min ∈ drawn (region,hour) cells, never a marginal mean`, () => {
        const grid = GRIDS[yCard];
        const cells = expectedDrawnCells(grid, agg);
        const analysis = analyzeVizSpec(heatmapSpec(grid, agg));
        // The narrated extremum, if present, MUST be a real drawn cell (membership — the load-bearing
        // signal: 67.8 sat INSIDE the value range, so only membership, not a bounds check, bites).
        if (analysis.max) {
          expect(cells.some((c) => approx(c, analysis.max!.value))).toBe(true);
          expect(analysis.max.value).toBeCloseTo(Math.max(...cells), 9);
        }
        if (analysis.min) {
          expect(cells.some((c) => approx(c, analysis.min!.value))).toBe(true);
          expect(analysis.min.value).toBeCloseTo(Math.min(...cells), 9);
        }
      });
    }
  }

  it('multi-row-per-cell is RE-REDUCED (the drawn cell is the cell average, never a raw row)', () => {
    const cells = expectedDrawnCells(MULTIROW_GRID, 'average'); // North/9=15, North/10=50, South/9=60, South/10=90
    const analysis = analyzeVizSpec(heatmapSpec(MULTIROW_GRID, 'average'));
    expect(analysis.max?.value).toBeCloseTo(90, 9); // South/10 = (80+100)/2
    expect(analysis.min?.value).toBeCloseTo(15, 9); // North/9  = (10+20)/2
    // 55 = the North marginal mean over hour ((15+50)/2) — drawn on NO rect — must NOT be named.
    expect(cells).not.toContain(55);
    expect(analysis.max?.value).not.toBe(55);
  });

  it('the shipped narrative names the drawn max, never the s157 marginal (67.8/22.6 class)', () => {
    // The exact s157 survivor shape: North(10,30) South(50,90) avg → marginals 20/70 drawn on no rect.
    const grid: Grid = { North: { '9': [10], '10': [30] }, South: { '9': [50], '10': [90] } };
    const { keyFindings } = generateNarrativeSummary(heatmapSpec(grid, 'average'));
    const high = keyFindings.find((f) => /^High /.test(f));
    expect(high).toBeDefined();
    expect(high).toContain('90'); // drawn South/hour-10
    expect(keyFindings.every((f) => !f.includes('70'))).toBe(true); // never the South marginal mean
    expect(keyFindings.every((f) => !f.includes('67.8'))).toBe(true); // never the live-repro marginal
  });
});

describe('s158 — x2/y2 band endpoints (positional-range) do NOT shatter the projection key', () => {
  it('a y2 band field is ignored — extrema are the per-x drawn cells', () => {
    const rows = [
      { region: 'North', value: 10, upper: 999 },
      { region: 'North', value: 30, upper: 998 },
      { region: 'South', value: 50, upper: 997 },
      { region: 'South', value: 90, upper: 996 },
    ];
    const encoding = {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'value', trait: 'EncodingY', aggregate: 'average' },
      y2: { field: 'upper', trait: 'EncodingY2', channel: 'y2' },
    };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'band',
      name: 'band',
      data: { name: 'b', values: rows },
      marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'band' },
    } as unknown as NormalizedVizSpec;
    const analysis = analyzeVizSpec(spec);
    // per-region average (y2 must NOT enter the key and split per (region,upper)): North 20, South 70.
    expect(analysis.max?.value).toBeCloseTo(70, 9);
    expect(analysis.min?.value).toBeCloseTo(20, 9);
  });
});

describe('s158 — trend siblings folded via the same role table (shape) + preserved (size)', () => {
  function multiLine(groupChannel: 'shape' | 'size'): NormalizedVizSpec {
    const rows = [
      { month: 'Jan', value: 100, grp: 'A' },
      { month: 'Feb', value: 80, grp: 'A' },
      { month: 'Mar', value: 60, grp: 'A' },
      { month: 'Jan', value: 20, grp: 'B' },
      { month: 'Feb', value: 50, grp: 'B' },
      { month: 'Mar', value: 90, grp: 'B' },
    ];
    const encoding = {
      x: { field: 'month', trait: 'EncodingX', scale: 'point' },
      y: { field: 'value', trait: 'EncodingY' },
      [groupChannel]: { field: 'grp', trait: `Encoding${groupChannel === 'shape' ? 'Shape' : 'Size'}`, channel: groupChannel },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'ml',
      name: 'multi',
      data: { name: 'm', values: rows },
      marks: [{ trait: 'MarkLine', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'multi' },
    } as unknown as NormalizedVizSpec;
  }

  it('SHAPE-grouped multi-line: NO phantom cross-series trend (decision #1255 rationale was false)', () => {
    // A declines 100→60, B rises 20→90 — the sort-by-X concatenation is neither series.
    expect(analyzeVizSpec(multiLine('shape')).trend).toBeUndefined();
  });

  it('SIZE-grouped multi-line: NO phantom cross-series trend (s157 A1 behaviour preserved)', () => {
    expect(analyzeVizSpec(multiLine('size')).trend).toBeUndefined();
  });

  it('a genuine SINGLE line still narrates its trend (the gate does not over-suppress)', () => {
    const rows = [
      { month: 'Jan', value: 20 },
      { month: 'Feb', value: 50 },
      { month: 'Mar', value: 90 },
    ];
    const encoding = { x: { field: 'month', trait: 'EncodingX', scale: 'point' }, y: { field: 'value', trait: 'EncodingY' } };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'single',
      name: 'single',
      data: { name: 's', values: rows },
      marks: [{ trait: 'MarkLine', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'single' },
    } as unknown as NormalizedVizSpec;
    expect(analyzeVizSpec(spec).trend).toBeDefined();
  });
});

describe('s158 m5 — correlation suppressed on a dotted-version axis (Fork 1, ratified)', () => {
  function versionScatter(): NormalizedVizSpec {
    const rows = [
      { release: '1.9', adoption: 10 },
      { release: '1.10', adoption: 20 },
      { release: '1.11', adoption: 30 },
      { release: '1.12', adoption: 40 },
      { release: '1.13', adoption: 55 },
    ];
    const encoding = { x: { field: 'release', trait: 'EncodingX' }, y: { field: 'adoption', trait: 'EncodingY' } };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'vs',
      name: 'version scatter',
      data: { name: 'v', values: rows },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'adoption per release' },
    } as unknown as NormalizedVizSpec;
  }

  it('a rising release series does NOT narrate a negative relationship (the -0.648 phantom)', () => {
    const analysis = analyzeVizSpec(versionScatter());
    expect(analysis.correlation).toBeUndefined();
    const { keyFindings, summary } = generateNarrativeSummary(versionScatter());
    expect(summary + keyFindings.join(' ')).not.toMatch(/negative relationship|Correlation coefficient/i);
  });

  it('a genuine numeric-numeric scatter KEEPS its correlation (no over-suppression)', () => {
    const rows = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: 30 },
      { x: 4, y: 42 },
    ];
    const encoding = { x: { field: 'x', trait: 'EncodingX', scale: 'linear' }, y: { field: 'y', trait: 'EncodingY', scale: 'linear' } };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'nn',
      name: 'numeric',
      data: { name: 'n', values: rows },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'numeric scatter' },
    } as unknown as NormalizedVizSpec;
    expect(analyzeVizSpec(spec).correlation).toBeDefined();
  });
});
