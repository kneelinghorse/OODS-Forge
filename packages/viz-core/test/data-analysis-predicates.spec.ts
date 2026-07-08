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
