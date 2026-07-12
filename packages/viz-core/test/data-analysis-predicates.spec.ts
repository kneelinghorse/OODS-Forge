import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows, heatmapColorIsMeasure, isMarkRectGrid } from '@oods/viz-core';

// s150 m02 — the two pure predicates that structurally fix the s149 F6d mislabel.
//
// P1 heatmapColorIsMeasure(spec) = all-MarkRect AND color binding exists AND color is
//    quantitative (raw toNumber .some() probe, NOT the `type` marker). Gates the measure
//    rebind + colorField drop + the measureLabel channel — ONE predicate on ONE spec, so the
//    binding and label decisions can never diverge again.
// P2 isMarkRectGrid(spec) = all-MarkRect only. Gates the phantom trend/correlation, whose
//    order-freeness is independent of which channel is the measure.
//
// A 3×4 grid: two dimensions (region, quarter) crossed by a quantitative measure (revenue),
// plus a categorical `tier` used only for the categorical-color case.
const ROWS = ['North', 'South', 'East'].flatMap((region, r) =>
  ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, q) => ({
    region,
    quarter,
    revenue: 40 + r * 30 + q * 11,
    tier: q < 2 ? 'low' : 'high',
  })),
);

function heatmap(encodings: Record<string, unknown>) {
  const { spec } = buildVizSpecFromRows({ rows: ROWS, chartType: 'heatmap', encodings } as never);
  return spec;
}

// Quantitative color — the shipped F6d fixture. The color binding pins scale:'linear', so
// applyDataAwareTypes leaves its `type` UNDEFINED; only the raw-value probe classifies it.
const quantColorHeatmap = () =>
  heatmap({
    x: { field: 'region', scale: 'band' },
    y: { field: 'quarter', scale: 'band' },
    color: { field: 'revenue', scale: 'linear' },
  });

// Categorical color — a string series on the color channel.
const categoricalColorHeatmap = () =>
  heatmap({
    x: { field: 'region', scale: 'band' },
    y: { field: 'quarter', scale: 'band' },
    color: { field: 'tier', scale: 'band' },
  });

// Absent color — two dimensions, no color channel at all.
const absentColorHeatmap = () =>
  heatmap({
    x: { field: 'region', scale: 'band' },
    y: { field: 'quarter', scale: 'band' },
  });

const barChart = () => {
  const { spec } = buildVizSpecFromRows({
    rows: ROWS,
    chartType: 'bar',
    encodings: {
      x: { field: 'region', scale: 'band' },
      y: { field: 'revenue', scale: 'linear' },
    },
  } as never);
  return spec;
};

describe('s150 m02 — isMarkRectGrid (P2)', () => {
  it('is true for every MarkRect grid regardless of the color channel', () => {
    expect(isMarkRectGrid(quantColorHeatmap())).toBe(true);
    expect(isMarkRectGrid(categoricalColorHeatmap())).toBe(true);
    expect(isMarkRectGrid(absentColorHeatmap())).toBe(true);
  });

  it('is false for a non-rect mark (bar)', () => {
    expect(isMarkRectGrid(barChart())).toBe(false);
  });
});

describe('s150 m02 — heatmapColorIsMeasure (P1)', () => {
  it('is true only when a MarkRect grid binds a real quantitative color measure', () => {
    expect(heatmapColorIsMeasure(quantColorHeatmap())).toBe(true);
  });

  it('is false when color is categorical (falls back to Y → restores A11Y-R-11)', () => {
    expect(heatmapColorIsMeasure(categoricalColorHeatmap())).toBe(false);
  });

  it('is false when color is absent (falls back to Y → restores A11Y-R-11)', () => {
    expect(heatmapColorIsMeasure(absentColorHeatmap())).toBe(false);
  });

  it('is false for a non-rect mark (bar) even with a numeric measure', () => {
    expect(heatmapColorIsMeasure(barChart())).toBe(false);
  });
});

// s151 m05 (closes s150 review carries #895 MED + #896 LOW). The s150 predicate re-derived
// quantitativeness with a COERCIVE raw-cell probe (rows.some(toNumber(cell) !== null)); m05
// honors the field profiler's stamped type/scale instead. Two boundary fixtures the s150
// predicate had NO coverage for, in either direction.

// #895 BUG REPRO: a color field whose VALUES are numeric STRINGS but which is CATEGORICAL
// (ordinal `band` scale) — store codes "01".."04". The coercive probe read toNumber("01")=1
// and classified the codes as a measure → the narrative SUMMED them ("Total Store Id: 18").
// Honoring the ordinal scale falls back to Y (revenue) as the shipped #115 prose promises.
const NUMERIC_STRING_ROWS = ['North', 'South', 'East'].flatMap((region, r) =>
  ['01', '02', '03', '04'].map((storeCode, q) => ({
    region,
    storeCode,
    revenue: 40 + r * 30 + q * 11,
  })),
);
const numericStringColorHeatmap = () => {
  const { spec } = buildVizSpecFromRows({
    rows: NUMERIC_STRING_ROWS,
    chartType: 'heatmap',
    encodings: {
      x: { field: 'region', scale: 'band' },
      y: { field: 'revenue', scale: 'linear' },
      color: { field: 'storeCode', scale: 'band' },
    },
  } as never);
  return spec;
};

// #896 NULL-TOLERANCE GUARD: a quantitative-scale (`linear`) color heatmap with a NULL cell.
// Because the decision is now made on the scale, null cells never flip it — this stays a
// measure. Reds if the predicate ever regresses to a cell probe that uses `.every()`
// (the null cell would flip it false and re-break a genuine sparse heatmap).
const SPARSE_NULL_ROWS = ['North', 'South', 'East'].flatMap((region, r) =>
  ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, q) => ({
    region,
    quarter,
    revenue: r === 0 && q === 0 ? null : 40 + r * 30 + q * 11,
  })),
);
const sparseNullLinearHeatmap = () => {
  const { spec } = buildVizSpecFromRows({
    rows: SPARSE_NULL_ROWS,
    chartType: 'heatmap',
    encodings: {
      x: { field: 'region', scale: 'band' },
      y: { field: 'quarter', scale: 'band' },
      color: { field: 'revenue', scale: 'linear' },
    },
  } as never);
  return spec;
};

describe('s151 m05 — heatmapColorIsMeasure honors the profiler type/scale (closes #895/#896)', () => {
  it('#895: a numeric-STRING categorical color falls back to Y (fails at HEAD: coercive probe sums the codes)', () => {
    // The color field profiles ordinal (scale:'band'); its numeric-string values must NOT be
    // read as a measure. At HEAD the coercive toNumber probe returned true here.
    expect(heatmapColorIsMeasure(numericStringColorHeatmap())).toBe(false);
  });

  it('#896: a sparse linear-scale color with a NULL cell STAYS a measure (null-tolerance, no .every())', () => {
    expect(heatmapColorIsMeasure(sparseNullLinearHeatmap())).toBe(true);
  });
});
