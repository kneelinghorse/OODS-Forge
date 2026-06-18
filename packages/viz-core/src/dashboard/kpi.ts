// Headless KPI primitive (sprint-113 m03). Pure compute reducing a
// (cross-filtered) row set to a renderer-AGNOSTIC structured payload — NOT a
// forced ECharts big-number option. Reuses the deterministic stats.ts helpers.
// Emits SEMANTIC flags only (thresholdBreached / anomaly) — NO inline colors
// (SEAM e: KPI threshold colors stay deferred to the consumer CSS bundle), and
// presentation/locale formatting is the renderer's job. Pure + deterministic
// (no Date.now / Math.random): values feeding goldens are rounded via stats.round.

import { deriveTrend, mean, populationStdDev, quantileSorted, round, toNumber } from '../analysis/stats.js';
import type { KpiPanel } from '../spec/dashboard.types.js';

type DataRecord = Record<string, unknown>;

/** Renderer-agnostic KPI payload. */
export interface KpiResult {
  /** The point-in-time aggregated value (rounded for golden stability). */
  readonly value: number;
  /** Deterministic, locale-free string form of `value` (renderer does pretty/locale formatting). */
  readonly formatted: string;
  /** value − comparison baseline; null when no comparison basis resolves. */
  readonly delta: number | null;
  /** delta / |baseline|; null when the baseline is 0 or unresolved. */
  readonly deltaPct: number | null;
  /** Direction of the comparison (or the series when no comparison). */
  readonly trendDirection: 'increasing' | 'decreasing' | 'flat';
  /** Per-row metric series in row order; present only when there is more than one point. */
  readonly sparkline?: readonly number[];
  /** Threshold breach by the panel's direction; present only when a threshold is set. */
  readonly thresholdBreached?: boolean;
  /** Stddev-outlier flag on the latest point; present only when threshold.anomaly is requested. */
  readonly anomaly?: boolean;
}

/** Latest point is flagged anomalous when it is more than this many σ from the series mean. */
const STDDEV_OUTLIER_SIGMA = 2;

type AggregateKind = NonNullable<KpiPanel['aggregate']>;

function numericSeries(field: string, rows: readonly DataRecord[]): number[] {
  const series: number[] = [];
  for (const row of rows) {
    const n = toNumber(row[field]);
    if (n !== null) {
      series.push(n);
    }
  }
  return series;
}

function aggregate(series: readonly number[], kind: AggregateKind): number {
  if (series.length === 0) {
    return 0;
  }
  switch (kind) {
    case 'sum':
      return series.reduce((acc, v) => acc + v, 0);
    case 'count':
      return series.length;
    case 'average':
      return mean(series);
    case 'median':
      return quantileSorted([...series].sort((a, b) => a - b), 0.5);
    case 'min':
      return series.reduce((m, v) => (v < m ? v : m), series[0]);
    case 'max':
      return series.reduce((m, v) => (v > m ? v : m), series[0]);
    case 'distinct':
      return new Set(series).size;
    case 'latest':
      return series[series.length - 1];
    default:
      return series.reduce((acc, v) => acc + v, 0);
  }
}

/**
 * Resolve the comparison baseline for the KPI delta. deriveTrend is first-vs-last
 * only, so this adds the three frozen bases:
 *  - 'target'        → the explicit target value;
 *  - 'prior_period'  → the same aggregate over the series EXCLUDING the last point;
 *  - 'window'        → the same aggregate over the series EXCLUDING the last `window` points.
 * prior_period is window-of-1. Returns null when the basis cannot be resolved
 * (no target value, or the prior slice is empty).
 */
function resolveBaseline(panel: KpiPanel, series: readonly number[], kind: AggregateKind): number | null {
  const comparison = panel.comparison;
  if (!comparison) {
    return null;
  }
  if (comparison.basis === 'target') {
    return typeof comparison.value === 'number' ? comparison.value : null;
  }
  const window = comparison.basis === 'prior_period' ? 1 : Math.max(1, Math.trunc(comparison.window ?? 1));
  // Clamp the slice end at 0: a window >= series length leaves no prior slice.
  // (A negative slice end would wrongly count from the array's tail.)
  const priorSlice = series.slice(0, Math.max(0, series.length - window));
  return priorSlice.length > 0 ? round(aggregate(priorSlice, kind)) : null;
}

/** Compute a KPI payload from the (already cross-filtered) rows for the panel. */
export function computeKpi(panel: KpiPanel, rows: readonly DataRecord[]): KpiResult {
  const kind: AggregateKind = panel.aggregate ?? 'sum';
  const series = numericSeries(panel.field, rows);
  const value = round(aggregate(series, kind));

  const baseline = resolveBaseline(panel, series, kind);
  const delta = baseline !== null ? round(value - baseline) : null;
  const deltaPct = baseline !== null && baseline !== 0 ? round((value - baseline) / Math.abs(baseline)) : null;

  let trendDirection: KpiResult['trendDirection'];
  if (baseline !== null) {
    trendDirection = deriveTrend(baseline, value).trend;
  } else if (series.length >= 2) {
    trendDirection = deriveTrend(series[0], series[series.length - 1]).trend;
  } else {
    trendDirection = 'flat';
  }

  const result: {
    value: number;
    formatted: string;
    delta: number | null;
    deltaPct: number | null;
    trendDirection: KpiResult['trendDirection'];
    sparkline?: readonly number[];
    thresholdBreached?: boolean;
    anomaly?: boolean;
  } = {
    value,
    formatted: String(value),
    delta,
    deltaPct,
    trendDirection,
  };

  if (series.length > 1) {
    result.sparkline = series.map((v) => round(v));
  }

  const threshold = panel.threshold;
  if (threshold && typeof threshold.value === 'number' && threshold.direction) {
    result.thresholdBreached = threshold.direction === 'above' ? value > threshold.value : value < threshold.value;
  }

  if (threshold?.anomaly === 'stddev_outlier' && series.length >= 2) {
    const seriesMean = mean(series);
    const sd = populationStdDev(series, seriesMean);
    const latest = series[series.length - 1];
    result.anomaly = sd > 0 ? Math.abs(latest - seriesMean) > STDDEV_OUTLIER_SIGMA * sd : false;
  }

  return result;
}
