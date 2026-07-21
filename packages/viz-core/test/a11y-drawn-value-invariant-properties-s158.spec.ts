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

// ============================================================================
// Sprint-159 m1 — FACET axis added to the layout×aggregate harness (SSOT memo §2-m1/§3.1).
// spec.layout (LayoutFacet rows/columns) is the 9th grouping surface the s158 role table —
// keyed off keyof EncodingMap — structurally could NOT see. A faceted bar draws one bar per
// (facet-panel × dimension) cell, but at HEAD both the projection AND the independent guard
// ignore the facet field, collapsing to a per-DIMENSION cross-panel marginal drawn on no bar
// (the CRIT: High 62 / Low 32 vs drawn 10/30/54/94). The oracle stays hand-derived (imports
// ZERO product code), so a pass is independent evidence. facet=none is the byte-identity
// control (the fix adds nothing when spec.layout is absent).
// ============================================================================
type FacetPlacement = 'none' | 'row' | 'column';

// region (facet panel) × month (x dimension). Per-cell avgs 10/30/54/94; the per-MONTH marginal
// means (Jan 32, Feb 62) are the s159 hand-confirmed cross-panel phantom — drawn on NO bar once
// region is a facet panel rather than a collapsed-over dimension.
const FACET_GRID: Grid = {
  North: { Jan: [10], Feb: [30] },
  South: { Jan: [54], Feb: [94] },
};

function facetedBarSpec(grid: Grid, facet: FacetPlacement, agg: Agg): NormalizedVizSpec {
  const values: Record<string, unknown>[] = [];
  for (const region of Object.keys(grid)) {
    for (const month of Object.keys(grid[region])) {
      for (const value of grid[region][month]) {
        values.push({ region, month, value });
      }
    }
  }
  const encoding = {
    x: { field: 'month', trait: 'EncodingX', scale: 'band' },
    y: { field: 'value', trait: 'EncodingY', aggregate: agg },
  };
  const layout =
    facet === 'row'
      ? { trait: 'LayoutFacet', rows: { field: 'region' } }
      : facet === 'column'
        ? { trait: 'LayoutFacet', columns: { field: 'region' } }
        : undefined;
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'facet-bar',
    name: 'Faceted bar',
    data: { name: 'fb', values },
    marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
    encoding,
    ...(layout ? { layout } : {}),
    a11y: { description: 'Value by month, faceted by region.' },
  } as unknown as NormalizedVizSpec;
}

// facet=none → region is not encoded anywhere, so the chart honestly collapses to a per-MONTH
// marginal (the drawn set for a non-faceted bar); facet=row/column → one drawn bar per (region,month).
function expectedFacetedCells(grid: Grid, facet: FacetPlacement, agg: Agg): number[] {
  if (facet === 'none') {
    const byMonth: Record<string, number[]> = {};
    for (const region of Object.keys(grid)) {
      for (const month of Object.keys(grid[region])) {
        (byMonth[month] ??= []).push(...grid[region][month]);
      }
    }
    return Object.keys(byMonth).map((month) => oracleReduce(byMonth[month], agg));
  }
  const cells: number[] = [];
  for (const region of Object.keys(grid)) {
    for (const month of Object.keys(grid[region])) {
      cells.push(oracleReduce(grid[region][month], agg));
    }
  }
  return cells;
}

describe('s159 m1 — faceted layout enters the grouping spine (facet ∈ {none,row,column})', () => {
  for (const facet of ['none', 'row', 'column'] as const) {
    for (const agg of AGGREGATES) {
      it(`facet=${facet} agg=${agg}: extrema ∈ per-panel drawn cells, never a cross-panel marginal`, () => {
        const cells = expectedFacetedCells(FACET_GRID, facet, agg);
        const analysis = analyzeVizSpec(facetedBarSpec(FACET_GRID, facet, agg));
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

  it('the hand-confirmed 62/32 phantom: faceted-row avg names drawn 94/10, never a cross-panel marginal', () => {
    const { keyFindings } = generateNarrativeSummary(facetedBarSpec(FACET_GRID, 'row', 'average'));
    const high = keyFindings.find((f) => /^High /.test(f));
    const low = keyFindings.find((f) => /^Low /.test(f));
    expect(high).toContain('94'); // drawn South/Feb — never the Feb cross-panel marginal 62
    expect(low).toContain('10'); // drawn North/Jan — never the Jan cross-panel marginal 32
    expect(keyFindings.every((f) => !/\b62\b/.test(f))).toBe(true);
    expect(keyFindings.every((f) => !/\b32\b/.test(f))).toBe(true);
  });
});

// ============================================================================
// Sprint-159 m2 — ONE shared keyFor() (SSOT memo §2-m2, the §5.3 no-transcription rule made CODE).
// projectAggregatedRows (the analysis projection) and drawnMarkValues (the independent guard) must
// build composite group keys the SAME way. At HEAD they diverged: projection joined with NUL, guard
// joined with a LITERAL SPACE (transcribed from NUL-STRIPPED terminal output). Two DISTINCT drawn
// cells whose (dimension,series) tuples collide only under a space join therefore made the guard
// collapse them → it NULLED the legitimate extrema/Total (over-fire). Both callers now route through
// one keyFor(), so the two are structurally un-divergeable.
// ============================================================================
describe('s159 m2 — shared keyFor(): space-containing labels do NOT collide (guard over-fire)', () => {
  // {region:'North', series:'a b'} and {region:'North a', series:'b'} → both join to 'North a b' under
  // a literal space, but 'North\0a b' vs 'North a\0b' under NUL. At HEAD the projection (NUL) kept the
  // cells 10 & 90 while the guard (space) collapsed them to one avg-50 cell → nulled the real 90/10/100.
  function collisionSpec(): NormalizedVizSpec {
    const rows = [
      { region: 'North', series: 'a b', val: 10 },
      { region: 'North a', series: 'b', val: 90 },
    ];
    const encoding = {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'val', trait: 'EncodingY', aggregate: 'average' },
      color: { field: 'series', trait: 'EncodingColor', channel: 'color' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'collide',
      name: 'collision',
      data: { name: 'c', values: rows },
      marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'collision' },
    } as unknown as NormalizedVizSpec;
  }

  it('the guard keeps legit extrema/Total when labels collide only under a space join', () => {
    const analysis = analyzeVizSpec(collisionSpec());
    // Two real drawn cells: North/'a b'=10, 'North a'/'b'=90 — neither nulled by a phantom collision.
    expect(analysis.max?.value).toBeCloseTo(90, 9);
    expect(analysis.min?.value).toBeCloseTo(10, 9);
    expect(analysis.total).toBeCloseTo(100, 9);
  });
});

// ============================================================================
// Sprint-159 m3 — shared measure derivation + unstamped-color bypass (SSOT memo §1.3/§2-m3).
// (A) findAggregatedMeasure (the guard's measure resolver) scanned channels x-FIRST, so a
// dual-aggregate scatter (x-avg, y-avg) made the guard measure the X field while the analysis
// measured Y → the guard NULLED the honest Y extrema/Total. Fix: derive the measure from the SAME
// resolvePrimaryChannels the analysis uses. (B) A MarkRect grid with the aggregate on an UNSTAMPED
// color channel (no type/scale) made heatmapColorIsMeasure=false → the measure fell to the Y
// DIMENSION → the narrative summed the y labels (a "total = Σ hours" phantom) beside an aggregated
// chart. Fix: a DECLARED aggregate on the color channel is explicit agent measure-intent (NOT the
// #895 coercive cell probe), so it reads color as the measure. Both fixtures RED at HEAD.
// ============================================================================
describe('s159 m3 — dual-aggregate scatter: measure the Y channel, not the x-first hijack', () => {
  function dualAggregateScatter(): NormalizedVizSpec {
    // x=price and y=rating BOTH carry aggregate:'average'. The narrated measure is Y (rating).
    const rows = [
      { price: 10, rating: 4 },
      { price: 30, rating: 6 },
      { price: 100, rating: 1 },
      { price: 300, rating: 3 },
    ];
    const encoding = {
      x: { field: 'price', trait: 'EncodingX', scale: 'linear', aggregate: 'average' },
      y: { field: 'rating', trait: 'EncodingY', scale: 'linear', aggregate: 'average' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'dual',
      name: 'dual-aggregate scatter',
      data: { name: 'd', values: rows },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'rating vs price' },
    } as unknown as NormalizedVizSpec;
  }

  it('High/Low/Total describe avg rating (Y), never the x-channel avg price hijack', () => {
    const analysis = analyzeVizSpec(dualAggregateScatter());
    // Y = rating [4,6,1,3]. At HEAD the guard measured X (price [10,30,100,300]) → nulled these.
    expect(analysis.max?.value).toBeCloseTo(6, 9);
    expect(analysis.min?.value).toBeCloseTo(1, 9);
    expect(analysis.total).toBeCloseTo(14, 9);
  });
});

describe('s159 m3 — unstamped aggregated color on a MarkRect grid is the measure, never the summed dimension', () => {
  function unstampedColorHeatmap(): NormalizedVizSpec {
    // color=temp carries aggregate:'sum' but NO type/scale stamp; y=hour is a DIMENSION label.
    const rows = [
      { region: 'North', hour: 9, temp: 10 },
      { region: 'North', hour: 10, temp: 30 },
      { region: 'South', hour: 9, temp: 50 },
      { region: 'South', hour: 10, temp: 90 },
    ];
    const encoding = {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
      color: { field: 'temp', trait: 'EncodingColor', channel: 'color', aggregate: 'sum' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'unstamped',
      name: 'unstamped color heatmap',
      data: { name: 'u', values: rows },
      marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'temp by region and hour' },
    } as unknown as NormalizedVizSpec;
  }

  it('measure is the per-cell temp sum (10/30/50/90 → max 90, Σ 180), never the summed hours (38)', () => {
    const analysis = analyzeVizSpec(unstampedColorHeatmap());
    expect(analysis.max?.value).toBeCloseTo(90, 9); // drawn cell temp, not hour 10
    expect(analysis.min?.value).toBeCloseTo(10, 9);
    expect(analysis.total).toBeCloseTo(180, 9); // Σ temp, never Σ hours (9+10+9+10=38)
    const { keyFindings, summary } = generateNarrativeSummary(unstampedColorHeatmap());
    expect(`${summary} ${keyFindings.join(' ')}`).not.toMatch(/\b38\b/);
  });
});

// ============================================================================
// Sprint-159 m6 — Total epsilon: relative-only + stable summation (SSOT memo §1.7/§2-m6).
// approxEqual's max(1,…) ABSOLUTE floor plus an UNSTABLE summation order silently nulled legit
// Totals under large-magnitude cancellation: the analysis summed its X-sorted data points while the
// guard summed its raw-row-order drawn cells, so 1e9 + (-1e9) + 0.1 + 0.2 landed ~1e-7 apart between
// the two sides — over the 1e-9 floor → the honest 0.3 Total was dropped. Fix: sort before summing on
// BOTH sides (identical order ⇒ bit-identical sum) + relative-only tolerance.
// ============================================================================
describe('s159 m6 — large-magnitude cancellation keeps its honest Total (stable summation)', () => {
  function cancellationLine(rowOrderScrambled: boolean): NormalizedVizSpec {
    // step order ≠ X order (scrambled) so the analysis (X-sorted) and the guard (row-order) sum the
    // 1e9/-1e9 cancellation in DIFFERENT orders at HEAD → their totals diverge past the abs floor.
    const rows = rowOrderScrambled
      ? [
          { step: 3, value: 0.1 },
          { step: 1, value: 1e9 },
          { step: 2, value: -1e9 },
          { step: 4, value: 0.2 },
        ]
      : [
          { step: 1, value: 1 },
          { step: 2, value: 2 },
          { step: 3, value: 3 },
        ];
    const encoding = {
      x: { field: 'step', trait: 'EncodingX', scale: 'linear' },
      y: { field: 'value', trait: 'EncodingY', aggregate: 'sum' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'cancel',
      name: 'cancellation',
      data: { name: 'c', values: rows },
      marks: [{ trait: 'MarkLine', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'value over step' },
    } as unknown as NormalizedVizSpec;
  }

  it('1e9/-1e9/0.1/0.2 → Total 0.3 SURVIVES (not nulled by summation-order rounding)', () => {
    const analysis = analyzeVizSpec(cancellationLine(true));
    expect(analysis.total).toBeDefined();
    expect(analysis.total).toBeCloseTo(0.3, 5);
  });

  it('small-value control keeps its Total (no over-suppression)', () => {
    expect(analyzeVizSpec(cancellationLine(false)).total).toBeCloseTo(6, 9);
  });

  it('zero-adjacent control: a Total that cancels to exactly 0 survives (relative-only epsilon)', () => {
    const rows = [
      { cat: 'a', value: 5 },
      { cat: 'b', value: -5 },
      { cat: 'c', value: 3 },
      { cat: 'd', value: -3 },
    ];
    const encoding = {
      x: { field: 'cat', trait: 'EncodingX', scale: 'band' },
      y: { field: 'value', trait: 'EncodingY', aggregate: 'sum' },
    };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'zero',
      name: 'zero',
      data: { name: 'z', values: rows },
      marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'value by cat' },
    } as unknown as NormalizedVizSpec;
    expect(analyzeVizSpec(spec).total).toBe(0); // 0 is drawn-consistent (Σ drawn = 0), not nulled
  });
});
