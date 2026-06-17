import { describe, expect, it } from 'vitest';
import {
  analyzeVizSpec,
  buildVizSpecFromRows,
  fieldCorrelation,
  inferFieldProfile,
  suggestPatterns,
  toSchemaIntent,
  toVegaLiteSpec,
  validateNormalizedVizSpec,
  VizSpecBuilderError,
  type ChartType,
  type SchemaIntent,
} from '@oods/viz-core';

const SALES = [
  { region: 'North', quarter: '2024-01', revenue: 120000 },
  { region: 'South', quarter: '2024-01', revenue: 135000 },
  { region: 'North', quarter: '2024-02', revenue: 128000 },
  { region: 'South', quarter: '2024-02', revenue: 142000 },
];

describe('buildVizSpecFromRows — explicit mode', () => {
  // Contract test: every beachhead chart type assembles into an AJV-valid spec
  // with a non-empty a11y.description and the input rows bound to data.values.
  const beachhead: ReadonlyArray<readonly [ChartType, string]> = [
    ['bar', 'MarkBar'],
    ['line', 'MarkLine'],
    ['area', 'MarkArea'],
    ['scatter', 'MarkPoint'],
    ['heatmap', 'MarkRect'],
  ];

  it.each(beachhead)('builds a valid %s spec (mark %s) with non-empty a11y + bound data', (chartType, markTrait) => {
    const result = buildVizSpecFromRows({
      rows: SALES,
      chartType,
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' }, color: 'quarter' },
    });

    expect(result.mode).toBe('explicit');
    expect(result.spec.marks[0].trait).toBe(markTrait);
    expect(validateNormalizedVizSpec(result.spec).valid).toBe(true);
    expect(result.spec.a11y.description.length).toBeGreaterThan(0);
    expect(result.spec.data.values).toHaveLength(4);
  });

  it('produces a valid spec with ZERO recommender involvement in explicit mode', () => {
    const result = buildVizSpecFromRows({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });
    // suggestion + inferredFields are populated ONLY when the recommender runs
    // (suggest mode). Their absence is the observable proof the recommender was
    // never consulted in explicit mode.
    expect(result.suggestion).toBeUndefined();
    expect(result.inferredFields).toBeUndefined();
    expect(result.spec.encoding.y).toMatchObject({ field: 'revenue', trait: 'EncodingPositionY', aggregate: 'sum' });
  });

  it('compiles to a renderable Vega-Lite spec whose data.values are byte-equal to the input rows', () => {
    const { spec } = buildVizSpecFromRows({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });
    const vl = toVegaLiteSpec(spec);
    expect(vl.mark).toMatchObject({ type: 'bar' });
    expect(vl.data?.values).toEqual(SALES);
    expect(JSON.stringify(vl.data?.values)).toEqual(JSON.stringify(SALES));
  });

  it('accepts the bare-string field shorthand for an encoding channel', () => {
    const { spec } = buildVizSpecFromRows({
      rows: SALES,
      chartType: 'line',
      encodings: { x: 'quarter', y: 'revenue' },
    });
    expect(spec.encoding.x).toMatchObject({ field: 'quarter', trait: 'EncodingPositionX' });
  });

  it('synthesizes a descriptive a11y.description referencing the encoded fields', () => {
    const { spec } = buildVizSpecFromRows({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });
    expect(spec.a11y.description).toContain('revenue');
    expect(spec.a11y.description).toContain('region');
  });

  it('honours a caller-provided description override', () => {
    const { spec } = buildVizSpecFromRows({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: 'revenue' },
      description: 'Quarterly revenue per region.',
    });
    expect(spec.a11y.description).toBe('Quarterly revenue per region.');
  });

  it('throws when x or y is missing in explicit mode', () => {
    expect(() => buildVizSpecFromRows({ rows: SALES, chartType: 'bar', encodings: { x: 'region' } })).toThrow(
      VizSpecBuilderError,
    );
  });

  it('throws on empty rows', () => {
    expect(() => buildVizSpecFromRows({ rows: [], chartType: 'bar', encodings: { x: 'a', y: 'b' } })).toThrow(
      VizSpecBuilderError,
    );
  });
});

describe('inferFieldProfile + toSchemaIntent (suggest-mode primitives)', () => {
  it('classifies field types, roles and cardinality deterministically', () => {
    const [region, quarter, revenue] = inferFieldProfile(SALES);
    // Type/role/cardinality is the load-bearing contract; the data-aware stat
    // fields are additive (asserted separately below), so we match the triple
    // rather than the whole object.
    expect(region).toMatchObject({ name: 'region', type: 'nominal', role: 'dimension', cardinality: 2 });
    expect(quarter).toMatchObject({
      name: 'quarter',
      type: 'temporal',
      role: 'dimension',
      cardinality: 2,
      temporalGranularity: 'month',
      temporalRegular: true,
    });
    expect(revenue).toMatchObject({ name: 'revenue', type: 'quantitative', role: 'measure', cardinality: 4 });
  });

  it('attaches real numeric statistics to a measure field', () => {
    const revenue = inferFieldProfile(SALES).find((f) => f.name === 'revenue');
    // WHY: the profiler is now data-aware — a measure carries range/centre/shape
    // stats that the downstream recommender (m02/m03) scores against.
    expect(revenue).toMatchObject({
      min: 120000,
      max: 142000,
      mean: 131250,
      isInteger: true,
      hasNegative: false,
      hasZero: false,
      outlierCount: 0,
      distinctRatio: 1,
    });
    expect(typeof revenue?.stddev).toBe('number');
    expect(revenue?.stddev).toBeGreaterThan(0);
  });

  it('classifies a name-hinted year-only column as temporal (year granularity), not a measure', () => {
    // #686 fix: '2024'/'2025' under a year-hinting name is a time axis, NOT a
    // quantitative measure (the superseded s109 behaviour). role must be dimension.
    const [field] = inferFieldProfile([{ year: '2024' }, { year: '2025' }]);
    expect(field).toMatchObject({
      name: 'year',
      type: 'temporal',
      role: 'dimension',
      temporalGranularity: 'year',
    });
  });

  it('derives a count-based SchemaIntent with a temporal-driven trend goal', () => {
    const intent = toSchemaIntent(inferFieldProfile(SALES));
    expect(intent).toMatchObject({ measures: 1, dimensions: 1, temporals: 1, goal: 'trend' });
  });

  it('infers a relationship goal for two-measure data', () => {
    const intent = toSchemaIntent(
      inferFieldProfile([
        { responseMs: 120, conversion: 0.4 },
        { responseMs: 90, conversion: 0.6 },
      ]),
    );
    expect(intent).toMatchObject({ measures: 2, dimensions: 0, goal: 'relationship' });
  });
});

describe('buildVizSpecFromRows — suggest mode (recommender-driven)', () => {
  it('infers a chartType + encodings from rows alone and returns a valid spec', () => {
    const result = buildVizSpecFromRows({ rows: SALES });

    expect(result.mode).toBe('suggest');
    expect(['bar', 'line', 'area', 'scatter', 'heatmap']).toContain(result.chartType);
    expect(result.suggestion?.patternId).toBeTruthy();
    expect(result.inferredFields).toHaveLength(3);

    expect(validateNormalizedVizSpec(result.spec).valid).toBe(true);
    expect(result.spec.encoding.x?.field).toBeTruthy();
    expect(result.spec.encoding.y?.field).toBe('revenue');
    expect(result.spec.a11y.description.length).toBeGreaterThan(0);
    expect(() => toVegaLiteSpec(result.spec)).not.toThrow();
  });

  it('is deterministic — identical rows yield an identical spec', () => {
    const a = buildVizSpecFromRows({ rows: SALES });
    const b = buildVizSpecFromRows({ rows: SALES });
    expect(JSON.stringify(b.spec)).toEqual(JSON.stringify(a.spec));
    expect(b.chartType).toBe(a.chartType);
  });

  it('assigns x=measure, y=measure for a two-measure scatter relationship', () => {
    const result = buildVizSpecFromRows({
      rows: [
        { responseMs: 120, conversion: 0.4 },
        { responseMs: 90, conversion: 0.62 },
        { responseMs: 75, conversion: 0.71 },
      ],
    });
    if (result.chartType === 'scatter') {
      expect(result.spec.marks[0].trait).toBe('MarkPoint');
      expect(result.spec.encoding.x?.field).toBe('responseMs');
      expect(result.spec.encoding.y?.field).toBe('conversion');
    }
    expect(validateNormalizedVizSpec(result.spec).valid).toBe(true);
  });
});

describe('inferFieldProfile — #686 misclassification regression', () => {
  it('classifies a zip-code column as a nominal region code, not a measure', () => {
    const [zip] = inferFieldProfile([{ zip: '02134' }, { zip: '10001' }, { zip: '94103' }]);
    expect(zip).toMatchObject({ name: 'zip', type: 'nominal', role: 'dimension' });
    expect(zip.geoKind).toBe('region');
  });

  it('classifies a numeric ISO-4217 currency-code column as nominal, not a measure', () => {
    // Numeric currency codes (840=USD, 978=EUR, 826=GBP) would otherwise read as
    // a quantitative measure — the name-based semantic check demotes them.
    const [currency] = inferFieldProfile([{ currency: 840 }, { currency: 978 }, { currency: 826 }]);
    expect(currency).toMatchObject({ name: 'currency', type: 'nominal', role: 'dimension' });
  });

  it('recognises non-ISO date text as temporal', () => {
    const [slash] = inferFieldProfile([
      { d: '03/14/2024' },
      { d: '04/15/2024' },
      { d: '05/16/2024' },
    ]);
    expect(slash).toMatchObject({ name: 'd', type: 'temporal', temporalGranularity: 'day' });

    const [monYear] = inferFieldProfile([{ m: 'Mar 2024' }, { m: 'Apr 2024' }, { m: 'May 2024' }]);
    expect(monYear).toMatchObject({ name: 'm', type: 'temporal', temporalGranularity: 'month' });
  });

  it('classifies a small repeated integer column as ordinal (the previously-unreachable member)', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ rating: (i % 5) + 1 }));
    const [rating] = inferFieldProfile(rows);
    expect(rating).toMatchObject({ name: 'rating', type: 'ordinal', role: 'dimension' });
  });

  it('classifies a mixed numeric/text column as nominal, not quantitative', () => {
    const [code] = inferFieldProfile([{ code: 1 }, { code: 'N/A' }, { code: 3 }]);
    expect(code).toMatchObject({ name: 'code', type: 'nominal', role: 'dimension' });
  });
});

describe('inferFieldProfile — determinism (the moat)', () => {
  const MIXED = [
    { region: 'North', month: '2024-01', revenue: 120000, rating: 3, lat: 40.7, lon: -74.0 },
    { region: 'South', month: '2024-02', revenue: -135000, rating: 5, lat: 34.0, lon: -118.2 },
    { region: 'East', month: '2024-03', revenue: 0, rating: 1, lat: 41.8, lon: -87.6 },
    { region: 'North', month: '2024-04', revenue: 999999, rating: 2, lat: 29.7, lon: -95.3 },
    { region: 'West', month: '2024-05', revenue: 50000, rating: 4, lat: 47.6, lon: -122.3 },
  ];

  it('produces a byte-identical FieldProfile[] across repeated runs', () => {
    const runs = Array.from({ length: 5 }, () => JSON.stringify(inferFieldProfile(MIXED)));
    expect(new Set(runs).size).toBe(1);
  });

  it('detects geo roles, negativity and zero from real data', () => {
    const byName = Object.fromEntries(inferFieldProfile(MIXED).map((f) => [f.name, f]));
    expect(byName.lat.geoKind).toBe('lat');
    expect(byName.lon.geoKind).toBe('lon');
    expect(byName.region.geoKind).toBe('region');
    expect(byName.revenue).toMatchObject({ type: 'quantitative', hasNegative: true, hasZero: true });
    expect(byName.month).toMatchObject({ type: 'temporal', temporalGranularity: 'month', temporalRegular: true });
  });
});

describe('toSchemaIntent — data-aware derivation (m02)', () => {
  // Irregular monthly axis: Jan, Feb, Sep, Dec — gaps of 1, 7, 3 months.
  const IRREGULAR = [
    { month: '2024-01', revenue: 100 },
    { month: '2024-02', revenue: 120 },
    { month: '2024-09', revenue: 90 },
    { month: '2024-12', revenue: 140 },
  ];

  it('gates trend on temporal REGULARITY — an irregular temporal axis is not a trend', () => {
    const profiles = inferFieldProfile(IRREGULAR);
    expect(profiles.find((f) => f.name === 'month')).toMatchObject({
      type: 'temporal',
      temporalRegular: false,
    });
    // count-only baseline rule (temporals>=1 -> trend) WOULD have fired here…
    expect(profiles.filter((f) => f.type === 'temporal').length).toBeGreaterThanOrEqual(1);
    // …but the data-aware derivation downgrades it to comparison.
    expect(toSchemaIntent(profiles, IRREGULAR).goal).toBe('comparison');
  });

  it('yields a different top recommendation than the count-only baseline (committed flip)', () => {
    const profiles = inferFieldProfile(IRREGULAR);
    // The pre-m02 count-only intent: any temporal field => trend goal, no
    // populated attribute fields.
    const countOnly: SchemaIntent = {
      measures: 1,
      dimensions: 0,
      temporals: 1,
      goal: 'trend',
      multiMetrics: false,
      requiresGrouping: false,
    };
    const baselineTop = suggestPatterns(countOnly, { limit: 1 })[0].pattern;
    const dataAwareTop = suggestPatterns(toSchemaIntent(profiles, IRREGULAR), { limit: 1 })[0].pattern;

    expect(baselineTop).toMatchObject({ id: 'running-total-area', chartType: 'area' });
    // FLIP: the data-aware pick is no longer the cumulative-trend area chart.
    expect(dataAwareTop.id).not.toBe(baselineTop.id);
    expect(dataAwareTop.chartType).toBe('line');
  });

  it('keeps trend for a REGULAR temporal axis (the gate does not over-fire)', () => {
    const regular = [
      { month: '2024-01', revenue: 100 },
      { month: '2024-02', revenue: 120 },
      { month: '2024-03', revenue: 90 },
      { month: '2024-04', revenue: 140 },
    ];
    expect(toSchemaIntent(inferFieldProfile(regular), regular).goal).toBe('trend');
  });

  it('populates allowNegative + density from the data and revives the diverging-bar score', () => {
    const negative = [
      { region: 'N', delta: -10 },
      { region: 'S', delta: 15 },
      { region: 'E', delta: -5 },
      { region: 'W', delta: 8 },
    ];
    const intent = toSchemaIntent(inferFieldProfile(negative), negative);
    expect(intent.allowNegative).toBe(true);
    expect(intent.density).toBe('sparse'); // 4 rows

    // The allowNegative field was DEAD on the rows path; populating it lifts the
    // pattern that actually supports negatives.
    const withNeg = suggestPatterns(intent, { limit: 20 }).find((s) => s.pattern.id === 'diverging-bar');
    const withoutNeg = suggestPatterns({ ...intent, allowNegative: false }, { limit: 20 }).find(
      (s) => s.pattern.id === 'diverging-bar',
    );
    expect(withNeg!.score).toBeGreaterThan(withoutNeg!.score);
  });

  it('carries correlationStrength and keeps relationship for a correlated two-measure pair', () => {
    const rows = [
      { x: 1, y: 2 },
      { x: 2, y: 4.1 },
      { x: 3, y: 5.9 },
      { x: 4, y: 8.2 },
      { x: 5, y: 9.8 },
    ];
    const intent = toSchemaIntent(inferFieldProfile(rows), rows);
    expect(intent.correlationStrength).toBeGreaterThan(0.9);
    expect(intent.goal).toBe('relationship');
  });

  it('preserves the count-only relationship call when rows are absent (additive, non-breaking)', () => {
    // No rows -> correlation unmeasurable -> the count-based relationship result
    // is preserved, so existing profile-only callers keep working.
    const intent = toSchemaIntent(
      inferFieldProfile([
        { responseMs: 120, conversion: 0.4 },
        { responseMs: 90, conversion: 0.6 },
      ]),
    );
    expect(intent).toMatchObject({ measures: 2, dimensions: 0, goal: 'relationship' });
  });
});

describe('suggestPatterns — deterministic total-order tie-break (m02)', () => {
  it('produces a byte-identical full ranking across N runs', () => {
    const intent: SchemaIntent = {
      measures: 1,
      dimensions: 2,
      temporals: 1,
      goal: 'trend',
      requiresGrouping: true,
    };
    const runs = Array.from({ length: 5 }, () =>
      suggestPatterns(intent, { limit: 20 })
        .map((s) => `${s.pattern.id}:${s.score}`)
        .join('|'),
    );
    expect(new Set(runs).size).toBe(1);
  });

  it('resolves equal-score patterns to the lexicographically-lower pattern.id', () => {
    // measures1/dims2/temporals1/trend/requiresGrouping ties multi-series-line,
    // focus-context-line and sparkline-grid at the same score — the tie-break
    // must order them by ascending id (focus-context-line first).
    const intent: SchemaIntent = {
      measures: 1,
      dimensions: 2,
      temporals: 1,
      goal: 'trend',
      requiresGrouping: true,
    };
    const ranked = suggestPatterns(intent, { limit: 20 });
    let sawTie = false;
    for (let i = 1; i < ranked.length; i += 1) {
      if (ranked[i].score === ranked[i - 1].score) {
        sawTie = true;
        expect(ranked[i - 1].pattern.id.localeCompare(ranked[i].pattern.id)).toBeLessThanOrEqual(0);
      }
    }
    expect(sawTie).toBe(true); // non-vacuous: a real tie was exercised
  });
});

describe('scorePattern — data-aware ranking terms (m03)', () => {
  // Deterministic dense generator: `catCount` distinct primary categories.
  const denseRows = (catCount: number) =>
    Array.from({ length: 240 }, (_, i) => ({
      category: `cat-${i % catCount}`,
      segment: `seg-${i % 3}`,
      revenue: (i * 7) % 1000,
    }));

  const STRONG = [
    { x: 1, y: 2 },
    { x: 2, y: 4.1 },
    { x: 3, y: 5.9 },
    { x: 4, y: 8.2 },
    { x: 5, y: 9.8 },
  ];
  const WEAK = [
    { x: 1, y: 5 },
    { x: 2, y: 1 },
    { x: 3, y: 9 },
    { x: 4, y: 2 },
    { x: 5, y: 7 },
  ];

  it('lifts correlation-scatter to the top for a strongly-correlated pair, with rationale on the top pick', () => {
    const intent = toSchemaIntent(inferFieldProfile(STRONG), STRONG);
    const ranked = suggestPatterns(intent, { limit: 20 });
    expect(ranked[0].pattern.id).toBe('correlation-scatter');
    // it now outranks the count-shape winner (linked-brush-scatter)…
    const linked = ranked.find((s) => s.pattern.id === 'linked-brush-scatter');
    expect(ranked[0].score).toBeGreaterThan(linked!.score);
    // …and its rationale explains why (the data-aware justification string).
    expect(ranked[0].signals.some((s) => /correlation/i.test(s))).toBe(true);
  });

  it('does NOT pick correlation-scatter for an uncorrelated pair (the gate + bonus are data-driven)', () => {
    const intent = toSchemaIntent(inferFieldProfile(WEAK), WEAK);
    const top = suggestPatterns(intent, { limit: 1 })[0];
    expect(top.pattern.id).not.toBe('correlation-scatter');
    expect(top.pattern.id).toBe('linked-brush-scatter');
  });

  it('demotes bars below a line/aggregate when a categorical dimension is high-cardinality', () => {
    const lowRanked = suggestPatterns(toSchemaIntent(inferFieldProfile(denseRows(4)), denseRows(4)), {
      limit: 20,
    });
    const highRows = denseRows(200);
    const highRanked = suggestPatterns(toSchemaIntent(inferFieldProfile(highRows), highRows), { limit: 20 });

    // Low cardinality → grouped-bar is the canonical top pick.
    expect(lowRanked[0].pattern.id).toBe('grouped-bar');
    // High cardinality (200 categories) → bars are penalised below a line; the
    // top pick is no longer a bar, and grouped-bar has fallen in the ranking.
    expect(highRanked[0].pattern.chartType).toBe('line');
    const groupedHigh = highRanked.findIndex((s) => s.pattern.id === 'grouped-bar');
    expect(groupedHigh).toBeGreaterThan(0);
    // Rationale is present in the ranking: grouped-bar carries the overflow signal.
    expect(highRanked[groupedHigh].signals.some((s) => /cardinality/i.test(s))).toBe(true);
  });

  it('is deterministic on the data-aware fixtures (N-run identical full ranking)', () => {
    const highRows = denseRows(200);
    const intent = toSchemaIntent(inferFieldProfile(highRows), highRows);
    const runs = Array.from({ length: 5 }, () =>
      suggestPatterns(intent, { limit: 20 })
        .map((s) => `${s.pattern.id}:${s.score}`)
        .join('|'),
    );
    expect(new Set(runs).size).toBe(1);
  });

  it('leaves patterns without a cardinality cap unpenalised (additive — unset heuristics are no-ops)', () => {
    const intent: SchemaIntent = {
      measures: 1,
      dimensions: 2,
      temporals: 1,
      goal: 'trend',
      requiresGrouping: true,
      maxNominalCardinality: 9999,
    };
    const ml = suggestPatterns(intent, { limit: 20 }).find((s) => s.pattern.id === 'multi-series-line');
    expect(ml!.signals.every((s) => !/cardinality/i.test(s))).toBe(true);
  });

  it('flags a low-confidence suggestion instead of silently returning bar', () => {
    // The uncorrelated 2-measure pair's best match barely clears the floor.
    const result = buildVizSpecFromRows({ rows: WEAK });
    expect(result.lowConfidence).toBe(true);
    // The rationale is carried on the result for the agent surface (m04).
    expect(result.suggestion?.signals.length).toBeGreaterThan(0);
  });

  it('does not flag low-confidence for a clean count-shape match', () => {
    expect(buildVizSpecFromRows({ rows: SALES }).lowConfidence).toBe(false);
  });
});

describe('correlation — single Pearson implementation', () => {
  it('profiler fieldCorrelation and the a11y narrator agree (no second Pearson impl)', () => {
    const rows = [
      { x: 1, y: 2 },
      { x: 2, y: 4.1 },
      { x: 3, y: 5.9 },
      { x: 4, y: 8.2 },
      { x: 5, y: 9.8 },
    ];
    const { spec } = buildVizSpecFromRows({ rows, chartType: 'scatter', encodings: { x: 'x', y: 'y' } });
    const narratorCorrelation = analyzeVizSpec(spec).correlation;
    // Both surfaces route through analysis/stats.pearson, so the values are equal
    // to the bit — the proof that there is exactly one correlation implementation.
    expect(narratorCorrelation).toBe(fieldCorrelation(rows, 'x', 'y'));
    expect(narratorCorrelation).toBeGreaterThan(0.9);
  });
});
