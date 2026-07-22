import { describe, expect, it } from 'vitest';
// s159 m4 — THE CHARTERED PROOF LAYER (SSOT memo §2-m4). The drawn-value guard is pure defense-in-
// depth: m1/m2/m3 made the projection and the guard share ONE spine, so on every valid spec they
// agree and the guard is inert — its bite is therefore UNOBSERVABLE through analyzeVizSpec. To prove
// it actually bites (the s158 charter items that never shipped), this COLOCATED spec imports the guard
// by RELATIVE PATH — enforceDrawnValueInvariant + findNonDrawnNarrativeValues are module exports but
// are deliberately NOT on the @oods/viz-core barrel (src/a11y/index.ts is an explicit allow-list), so
// this is the "no public export; harness imports the module by relative path" resolution of the s158
// findNonDrawnNarrativeValues deviation.
import {
  drawnCellKeyFields,
  enforceDrawnValueInvariant,
  findNonDrawnNarrativeValues,
  type DataPoint,
  type VizDataAnalysis,
} from './data-analysis.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';
import * as VizCorePublic from '@oods/viz-core';

// A synthetic analysis with only the narrated fields set — lets a test inject a PHANTOM extremum/Total
// (as a defeated projection would produce) and prove the guard alone catches it. The `rows`/category
// arrays are inert here (the guard reads the SPEC's raw rows, never analysis.rows).
function synthAnalysis(fields: {
  max?: DataPoint;
  min?: DataPoint;
  total?: number;
  correlation?: number;
}): VizDataAnalysis {
  return {
    mark: 'bar',
    dimensionField: 'region',
    measureField: 'value',
    rows: [],
    rowCount: 0,
    dimensionValues: [],
    numericValues: [],
    sizeValues: [],
    colorCategories: [],
    max: fields.max,
    min: fields.min,
    total: fields.total,
    correlation: fields.correlation,
  };
}

function barAvgSpec(rows: Record<string, unknown>[], opts?: { color?: boolean }): NormalizedVizSpec {
  const encoding: Record<string, unknown> = {
    x: { field: 'region', trait: 'EncodingX', scale: 'band' },
    y: { field: 'value', trait: 'EncodingY', aggregate: 'average' },
  };
  if (opts?.color) {
    encoding.color = { field: 'series', trait: 'EncodingColor', channel: 'color' };
  }
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'bar',
    name: 'bar',
    data: { name: 'b', values: rows },
    marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
    encoding,
    a11y: { description: 'value by region' },
  } as unknown as NormalizedVizSpec;
}

// The s159 m1 62/32 faceted bar — drawn cells 10/30/54/94, per-month marginals 32/62 drawn on no bar.
function facetedSpec(): NormalizedVizSpec {
  const rows = [
    { region: 'North', month: 'Jan', value: 10 },
    { region: 'North', month: 'Feb', value: 30 },
    { region: 'South', month: 'Jan', value: 54 },
    { region: 'South', month: 'Feb', value: 94 },
  ];
  const encoding = {
    x: { field: 'month', trait: 'EncodingX', scale: 'band' },
    y: { field: 'value', trait: 'EncodingY', aggregate: 'average' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'facet',
    name: 'facet',
    data: { name: 'f', values: rows },
    marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
    encoding,
    layout: { trait: 'LayoutFacet', rows: { field: 'region' } },
    a11y: { description: 'value by month faceted by region' },
  } as unknown as NormalizedVizSpec;
}

describe('s159 m4 (a) — A3 sabotage-revert proof: the guard ALONE silences an under-keyed projection', () => {
  it('an under-keyed projection narrating the 62/32 marginal is fully nulled by the guard', () => {
    const spec = facetedSpec(); // real drawn cells 10/30/54/94 (Σ 188)
    // Simulate a projection that IGNORED the facet (the pre-m1 bug) → per-month marginals 32/62/94-sum.
    const underKeyed = synthAnalysis({
      max: { label: 'Feb', value: 62 },
      min: { label: 'Jan', value: 32 },
      total: 94,
    });
    const enforced = enforceDrawnValueInvariant(underKeyed, spec, 'average');
    expect(enforced.max).toBeUndefined(); // 62 is on no drawn bar
    expect(enforced.min).toBeUndefined(); // 32 is on no drawn bar
    expect(enforced.total).toBeUndefined(); // 94 ≠ Σ drawn (188)
  });
});

describe('s159 m4 (b) — guard-isolation unit: detection against a synthetic phantom analysis', () => {
  it('findNonDrawnNarrativeValues flags exactly the phantom extremum, not the real ones', () => {
    const spec = barAvgSpec([{ region: 'North', value: 10 }, { region: 'South', value: 90 }]); // drawn 10/90
    const phantom = synthAnalysis({
      max: { label: 'North', value: 55 }, // 55 on no cell
      min: { label: 'North', value: 10 }, // 10 is North's real cell
      total: 100, // 100 == Σ drawn
    });
    const flagged = findNonDrawnNarrativeValues(phantom, spec, 'average');
    expect(flagged.maxPhantom).toBe(true);
    expect(flagged.minPhantom).toBe(false);
    expect(flagged.totalPhantom).toBe(false);
  });
});

describe('s159 m4 (c) — STANDING guard-disabled MUTATION GATE (§5.2 bite-proof)', () => {
  it('enforceDrawnValueInvariant NULLS a phantom — neuter it to `return analysis` and THIS goes RED', () => {
    const spec = barAvgSpec([{ region: 'North', value: 10 }, { region: 'South', value: 90 }]);
    const phantom = synthAnalysis({
      max: { label: 'North', value: 55 }, // phantom
      min: { label: 'South', value: 90 }, // real cell
      total: 100,
    });
    const enforced = enforceDrawnValueInvariant(phantom, spec, 'average');
    expect(enforced.max).toBeUndefined(); // guard dead ⇒ 55 survives ⇒ RED (the suite must never be green with the guard a no-op)
    expect(enforced.min).toEqual({ label: 'South', value: 90 }); // a real drawn cell is untouched
  });
});

describe('s159 m4 (d) — (dim,value) PAIR membership: a value-only coincidence is not blessed', () => {
  // drawn cells: {North,50}, {South,99}. The value 50 is drawn — but only AT North.
  const spec = barAvgSpec(
    [{ region: 'North', series: 'A', value: 50 }, { region: 'South', series: 'B', value: 99 }],
    { color: true }
  );

  it('a phantom (South,50) is nulled — 50 coincides with the North cell but is drawn nowhere at South', () => {
    const phantom = synthAnalysis({ max: { label: 'South', value: 50 }, min: { label: 'South', value: 50 }, total: 50 });
    const enforced = enforceDrawnValueInvariant(phantom, spec, 'average');
    expect(enforced.max).toBeUndefined(); // value-only membership WRONGLY blesses this (RED at HEAD)
  });

  it('a legit (North,50) IS a drawn cell → not over-nulled', () => {
    const legit = synthAnalysis({ max: { label: 'North', value: 50 }, min: { label: 'North', value: 50 }, total: 50 });
    const enforced = enforceDrawnValueInvariant(legit, spec, 'average');
    expect(enforced.max).toEqual({ label: 'North', value: 50 });
  });
});

describe('s159 m4 (e) — INV2: Total must equal Σ drawn', () => {
  const spec = barAvgSpec([{ region: 'North', value: 10 }, { region: 'South', value: 90 }]); // Σ drawn = 100

  it('a Total ≠ Σ drawn is nulled', () => {
    expect(enforceDrawnValueInvariant(synthAnalysis({ total: 999 }), spec, 'average').total).toBeUndefined();
  });

  it('a Total == Σ drawn survives', () => {
    expect(enforceDrawnValueInvariant(synthAnalysis({ total: 100 }), spec, 'average').total).toBe(100);
  });
});

describe('s159 m4 (f) — the guard is NOT a public export (no owned API move)', () => {
  it('enforceDrawnValueInvariant / findNonDrawnNarrativeValues are absent from the @oods/viz-core barrel', () => {
    const pub = VizCorePublic as Record<string, unknown>;
    expect(pub.enforceDrawnValueInvariant).toBeUndefined();
    expect(pub.findNonDrawnNarrativeValues).toBeUndefined();
    // ...while the intended public surface stays present (the allow-list did not drop it).
    expect(typeof VizCorePublic.analyzeVizSpec).toBe('function');
    expect(typeof VizCorePublic.resolvePrimaryChannels).toBe('function');
  });
});

// ============================================================================
// Sprint-160 m3 — the CORRELATION guard arm (correlationPhantom). Its positive precondition is its
// OWN (analysis.correlation defined) — it must fire on a SCATTER, which carries no declared
// aggregate and therefore skips the extremum/Total arms entirely (the CRIT phantom's exact class).
// The recompute (expectedNarratableCorrelation) is DISCLOSED derivation-shared — this arm bites
// call-site drift; the SUT-independent value evidence is the hand-oracle harness axis.
// ============================================================================
describe('s160 m3 — correlationPhantom guard arm', () => {
  // A perfect descending single-series scatter: true (and only honest) r = −1 exactly.
  function descendingScatter(): NormalizedVizSpec {
    const encoding = {
      x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
      y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'desc',
      name: 'desc',
      data: { name: 'd', values: [{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }] },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'y over x' },
    } as unknown as NormalizedVizSpec;
  }

  // The F-SIMPSON facet twin: expectedNarratableCorrelation(spec) is undefined (sign gate suppresses).
  function simpsonFacetScatter(): NormalizedVizSpec {
    const encoding = {
      x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
      y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    };
    const rows = [
      { x: 1, y: 10, panel: 'A' }, { x: 2, y: 9, panel: 'A' }, { x: 3, y: 8, panel: 'A' },
      { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
      { x: 21, y: 30, panel: 'C' }, { x: 22, y: 29, panel: 'C' }, { x: 23, y: 28, panel: 'C' },
    ];
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'simpson',
      name: 'simpson',
      data: { name: 's', values: rows },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      layout: { trait: 'LayoutFacet', rows: { field: 'panel' } },
      a11y: { description: 'y over x by panel' },
    } as unknown as NormalizedVizSpec;
  }

  it('fires WITHOUT a declared aggregate (precondition is its own — scatters are in scope)', () => {
    const phantom = synthAnalysis({ correlation: 0.9 }); // true r = −1
    const flagged = findNonDrawnNarrativeValues(phantom, descendingScatter(), undefined);
    expect(flagged.correlationPhantom).toBe(true);
  });

  it('a legit narrated r (within the 0.001 rounding grain) passes', () => {
    const legit = synthAnalysis({ correlation: -1 });
    expect(findNonDrawnNarrativeValues(legit, descendingScatter(), undefined).correlationPhantom).toBe(false);
  });

  it('recompute-null-while-narrated FIRES (a narrated r the sign gate says must not exist)', () => {
    const phantom = synthAnalysis({ correlation: 0.98 });
    expect(findNonDrawnNarrativeValues(phantom, simpsonFacetScatter(), undefined).correlationPhantom).toBe(true);
  });

  it('STANDING MUTATION GATE extension: enforceDrawnValueInvariant NULLS a phantom r — neuter it and THIS goes RED', () => {
    const enforced = enforceDrawnValueInvariant(synthAnalysis({ correlation: 0.9 }), descendingScatter(), undefined);
    expect(enforced.correlation).toBeUndefined();
    // ...and a legit r is untouched (no over-nulling).
    const kept = enforceDrawnValueInvariant(synthAnalysis({ correlation: -1 }), descendingScatter(), undefined);
    expect(kept.correlation).toBe(-1);
  });
});

// ============================================================================
// Sprint-160 m2 — STANDING SPINE-BLIND PROBES (§5.8: a shared multi-consumer derivation ships its
// own blind-mutation probe). drawnCellKeyFields is THE key-field derivation for the projection, the
// guard's drawn set, AND the ECharts cell builder — these probes go RED if any axis (facet, detail,
// measure-exclusion, stacking-collapse) is stripped from it, across all three consumers at once
// (the s159 facetFields-blind → 16-RED precedent, now one derivation up).
// ============================================================================
describe('s160 m2 — spine-blind probes on drawnCellKeyFields', () => {
  function facetedDetailHeatmap(): NormalizedVizSpec {
    const color = { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' };
    const encoding = {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
      color,
      detail: { field: 'line', trait: 'EncodingDetail' },
    };
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'probe',
      name: 'probe',
      data: { name: 'p', values: [{ site: 'A', region: 'N', hour: '9', line: 'd1', temp: 1 }] },
      marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
      encoding,
      layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
      a11y: { description: 'probe' },
    } as unknown as NormalizedVizSpec;
  }

  it('FACET fields enter the key (strip facetFields from the spine → RED here + adapter + harness)', () => {
    expect(drawnCellKeyFields(facetedDetailHeatmap(), 'temp', false)).toContain('site');
  });

  it('DETAIL enters the key on a non-stacking mark', () => {
    expect(drawnCellKeyFields(facetedDetailHeatmap(), 'temp', false)).toContain('line');
  });

  it('the MEASURE field NEVER enters the key (color IS the measure on an aggregated heatmap)', () => {
    expect(drawnCellKeyFields(facetedDetailHeatmap(), 'temp', false)).not.toContain('temp');
  });

  it('positional → facet → series order, exact field list (a full-shape pin)', () => {
    expect(drawnCellKeyFields(facetedDetailHeatmap(), 'temp', false)).toEqual(['region', 'hour', 'site', 'line']);
  });

  it('STACKING collapses the series channels but keeps positional + facet fields', () => {
    const encoding = {
      x: { field: 'month', trait: 'EncodingX', scale: 'band' },
      y: { field: 'value', trait: 'EncodingY', aggregate: 'sum' },
      color: { field: 'series', trait: 'EncodingColor' },
    };
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'stack',
      name: 'stack',
      data: { name: 's', values: [{ month: 'Jan', series: 'A', value: 1, panel: 'P' }] },
      marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
      encoding,
      layout: { trait: 'LayoutFacet', rows: { field: 'panel' } },
      a11y: { description: 'stack' },
    } as unknown as NormalizedVizSpec;
    expect(drawnCellKeyFields(spec, 'value', true)).toEqual(['month', 'panel']); // series collapsed, facet kept
    expect(drawnCellKeyFields(spec, 'value', false)).toEqual(['month', 'panel', 'series']);
  });

  it('the spine is NOT a public export (same posture as the guard fns)', () => {
    expect((VizCorePublic as Record<string, unknown>).drawnCellKeyFields).toBeUndefined();
  });
});
