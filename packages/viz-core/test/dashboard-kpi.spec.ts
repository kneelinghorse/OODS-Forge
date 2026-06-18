import { describe, expect, it } from 'vitest';
import { computeKpi, type KpiPanel } from '@oods/viz-core';

function kpiPanel(overrides: Partial<KpiPanel> = {}): KpiPanel {
  return { id: 'kpi', kind: 'kpi', datasetId: 'd', field: 'revenue', ...overrides } as KpiPanel;
}
const rows = (vals: Array<number | string | null>) => vals.map((v) => ({ revenue: v }));
const SERIES = rows([100, 80, 120, 90, 200]); // sum 590, mean 118, latest 200, median 100

describe('@oods/viz-core — computeKpi', () => {
  it('computes the standard aggregates over the metric series', () => {
    expect(computeKpi(kpiPanel({ aggregate: 'sum' }), SERIES).value).toBe(590);
    expect(computeKpi(kpiPanel({ aggregate: 'average' }), SERIES).value).toBe(118);
    expect(computeKpi(kpiPanel({ aggregate: 'latest' }), SERIES).value).toBe(200);
    expect(computeKpi(kpiPanel({ aggregate: 'count' }), SERIES).value).toBe(5);
    expect(computeKpi(kpiPanel({ aggregate: 'distinct' }), SERIES).value).toBe(5);
    expect(computeKpi(kpiPanel({ aggregate: 'min' }), SERIES).value).toBe(80);
    expect(computeKpi(kpiPanel({ aggregate: 'max' }), SERIES).value).toBe(200);
    expect(computeKpi(kpiPanel({ aggregate: 'median' }), SERIES).value).toBe(100);
  });

  it('defaults to sum and filters out non-numeric cells', () => {
    const r = computeKpi(kpiPanel(), rows([100, 'n/a', 80, null]));
    expect(r.value).toBe(180);
    expect(r.formatted).toBe('180');
  });

  it('computes delta/deltaPct/trend against an explicit target', () => {
    const r = computeKpi(kpiPanel({ aggregate: 'latest', comparison: { basis: 'target', value: 150 } }), SERIES);
    expect(r.delta).toBe(50);
    expect(r.deltaPct).toBe(round6(50 / 150));
    expect(r.trendDirection).toBe('increasing');
  });

  it('computes a prior_period delta (same aggregate over the series minus the last point)', () => {
    // latest of full = 200; latest of [100,80,120,90] = 90 -> delta 110
    const r = computeKpi(kpiPanel({ aggregate: 'latest', comparison: { basis: 'prior_period' } }), SERIES);
    expect(r.delta).toBe(110);
    expect(r.trendDirection).toBe('increasing');
  });

  it('computes a window delta (excludes the last N points)', () => {
    // latest of series.slice(0,3)=[100,80,120] is 120 -> delta 80
    const r = computeKpi(kpiPanel({ aggregate: 'latest', comparison: { basis: 'window', window: 2 } }), SERIES);
    expect(r.delta).toBe(80);
  });

  it('returns null delta when the comparison basis cannot resolve', () => {
    const noTarget = computeKpi(kpiPanel({ comparison: { basis: 'target' } }), SERIES);
    expect(noTarget.delta).toBeNull();
    const tooShort = computeKpi(kpiPanel({ aggregate: 'latest', comparison: { basis: 'window', window: 9 } }), SERIES);
    expect(tooShort.delta).toBeNull();
  });

  it('includes the sparkline only when there is more than one point', () => {
    expect(computeKpi(kpiPanel(), SERIES).sparkline).toEqual([100, 80, 120, 90, 200]);
    expect(computeKpi(kpiPanel(), rows([42])).sparkline).toBeUndefined();
  });

  it('flags a threshold breach by direction', () => {
    expect(computeKpi(kpiPanel({ aggregate: 'sum', threshold: { direction: 'above', value: 500 } }), SERIES).thresholdBreached).toBe(true);
    expect(computeKpi(kpiPanel({ aggregate: 'sum', threshold: { direction: 'below', value: 500 } }), SERIES).thresholdBreached).toBe(false);
    expect(computeKpi(kpiPanel(), SERIES).thresholdBreached).toBeUndefined();
  });

  it('flags a stddev outlier on the latest point only when requested', () => {
    const outlier = computeKpi(
      kpiPanel({ aggregate: 'latest', threshold: { anomaly: 'stddev_outlier' } }),
      rows([10, 10, 10, 10, 10, 1000]),
    );
    expect(outlier.anomaly).toBe(true);
    const calm = computeKpi(
      kpiPanel({ aggregate: 'latest', threshold: { anomaly: 'stddev_outlier' } }),
      rows([10, 12, 11, 13, 10]),
    );
    expect(calm.anomaly).toBe(false);
    expect(computeKpi(kpiPanel(), SERIES).anomaly).toBeUndefined();
  });

  it('handles an empty row set deterministically', () => {
    const r = computeKpi(kpiPanel({ comparison: { basis: 'prior_period' } }), []);
    expect(r).toMatchObject({ value: 0, delta: null, deltaPct: null, trendDirection: 'flat' });
    expect(r.sparkline).toBeUndefined();
  });

  it('is deterministic — running twice is byte-identical', () => {
    const panel = kpiPanel({ aggregate: 'average', comparison: { basis: 'window', window: 2 }, threshold: { direction: 'above', value: 100, anomaly: 'stddev_outlier' } });
    expect(JSON.stringify(computeKpi(panel, SERIES))).toBe(JSON.stringify(computeKpi(panel, SERIES)));
  });
});

function round6(n: number): number {
  const r = Number(n.toFixed(6));
  return r === 0 ? 0 : r;
}
