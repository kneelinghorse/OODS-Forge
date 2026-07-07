import { describe, expect, it } from 'vitest';
import {
  buildVizSpecFromRows,
  generateNarrativeSummary,
  validateVizEquivalenceRules,
} from '@oods/viz-core';

// s149 F6d (fork-C) — a MarkRect heatmap reads its COLOR channel as the measure.
//
// The Meridian finding: a default heatmap narrative "warns on itself". resolvePrimaryBindings
// read the measure from the Y channel, but a heatmap encodes X and Y as BOTH dimensions and
// the MEASURE on COLOR. So the Y-dimension (a category) was analyzed as the measure → every
// row's measure cell was non-numeric → zero data points → zero key findings → the chart
// tripped its OWN A11Y-R-11 warn ("≥3 rows must surface ≥2 key findings"). Reading the
// measure from COLOR for a heatmap makes the analysis run on the real quantitative values.
//
// A 3×4 heatmap: two dimensions (region, quarter) crossed by a quantitative measure (revenue).
const HEATMAP_ROWS = ['North', 'South', 'East'].flatMap((region, r) =>
  ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, q) => ({ region, quarter, revenue: 40 + r * 30 + q * 11 })),
);

function heatmapSpec() {
  const { spec } = buildVizSpecFromRows({
    rows: HEATMAP_ROWS,
    chartType: 'heatmap',
    encodings: {
      x: { field: 'region', scale: 'band' },
      y: { field: 'quarter', scale: 'band' },
      color: { field: 'revenue', scale: 'linear' },
    },
  } as never);
  return spec;
}

describe('data-analysis F6d — heatmap COLOR-as-measure (s149)', () => {
  it('a ≥3-row heatmap surfaces ≥2 key findings (no longer self-trips A11Y-R-11)', () => {
    const narrative = generateNarrativeSummary(heatmapSpec());
    // Pre-fix this was 0 (the Y-dimension measure yielded no numeric data points).
    expect(narrative.keyFindings.length).toBeGreaterThanOrEqual(2);
    // The findings describe the MEASURE (revenue extrema), proving color — not the Y
    // dimension — is being analyzed.
    expect(narrative.keyFindings.some((f) => f.startsWith('High'))).toBe(true);
    expect(narrative.keyFindings.some((f) => f.startsWith('Low'))).toBe(true);
  });

  it('the heatmap PASSES A11Y-R-11 (the rule it used to fail against itself)', () => {
    const r11 = validateVizEquivalenceRules(heatmapSpec()).find((r) => r.id === 'A11Y-R-11');
    expect(r11).toBeDefined();
    expect(r11?.passed).toBe(true);
  });
});
