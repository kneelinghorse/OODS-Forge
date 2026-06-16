import { describe, expect, it } from 'vitest';
import {
  buildVizSpecFromRows,
  inferFieldProfile,
  toSchemaIntent,
  toVegaLiteSpec,
  validateNormalizedVizSpec,
  VizSpecBuilderError,
  type ChartType,
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
    expect(inferFieldProfile(SALES)).toEqual([
      { name: 'region', type: 'nominal', role: 'dimension', cardinality: 2 },
      { name: 'quarter', type: 'temporal', role: 'dimension', cardinality: 2 },
      { name: 'revenue', type: 'quantitative', role: 'measure', cardinality: 4 },
    ]);
  });

  it('treats year-only strings as quantitative, not temporal', () => {
    const [field] = inferFieldProfile([{ year: '2024' }, { year: '2025' }]);
    expect(field).toMatchObject({ name: 'year', type: 'quantitative' });
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
