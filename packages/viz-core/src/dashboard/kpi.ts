// Headless KPI primitive (sprint-113 m03). Pure compute reducing a
// (cross-filtered) row set to a renderer-AGNOSTIC structured payload — NOT a
// forced ECharts big-number option. Reuses the deterministic stats.ts helpers.
// Emits SEMANTIC flags only (thresholdBreached / anomaly) — NO inline colors
// (SEAM e: KPI threshold colors stay deferred to the consumer CSS bundle), and
// presentation/locale formatting is the renderer's job. Pure + deterministic
// (no Date.now / Math.random): values feeding goldens are rounded via stats.round.
//
// TIME AXIS (sprint-114 m03, v0.2): by default the metric series is in DATASET
// ROW ORDER (latest = last row, sparkline + window/prior_period slice by row).
// When KpiPanel.periodField is set, the series is built along an EXPLICIT,
// PARSED + SORTED period axis via the UTC-pinned analysis/temporal.ts instead:
// latest = max period, sparkline is period-ordered, window/prior_period slice by
// DISTINCT period. periodField ABSENT => byte-identical to v0.1 (opt-in additive).

import { deriveTrend, mean, populationStdDev, quantileSorted, round, toNumber } from '../analysis/stats.js';
import { finestGranularity, parseTemporalValue, unitIndexFor, type ParsedTemporal } from '../analysis/temporal.js';
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

/**
 * The metric series feeding the KPI compute. `values` are the numeric metric
 * cells in series order; `periodKeys` is present ONLY when the panel sets an
 * explicit periodField — a parallel array of period unit-indices (ascending)
 * that lets the baseline slice by DISTINCT period instead of by row. When it is
 * absent, every read falls back to ROW ORDER (byte-identical to v0.1).
 */
interface MetricSeries {
  readonly values: number[];
  readonly periodKeys?: number[];
}

/**
 * Build the metric series for a panel. Without periodField: numeric cells in
 * row order (v0.1, unchanged). With periodField (v0.2): keep rows that have BOTH
 * a numeric metric AND a parseable period (periodField is author-declared
 * temporal, so bare years are allowed — mirroring summarizeTemporal); key each
 * by the FINEST granularity present across those cells; stable-sort ASCending by
 * that key. Unparseable-period rows are dropped (mirrors numericSeries dropping
 * non-numerics); duplicate-period rows are kept in input order (no roll-up in
 * v1). temporal.ts is UTC-pinned, so the resulting order is deterministic.
 */
function buildMetricSeries(panel: KpiPanel, rows: readonly DataRecord[]): MetricSeries {
  if (!panel.periodField) {
    return { values: numericSeries(panel.field, rows) };
  }
  const { field, periodField } = panel;
  const kept: { value: number; parsed: ParsedTemporal }[] = [];
  for (const row of rows) {
    const value = toNumber(row[field]);
    if (value === null) {
      continue;
    }
    const parsed = parseTemporalValue(row[periodField], true);
    if (parsed === null) {
      continue;
    }
    kept.push({ value, parsed });
  }
  if (kept.length === 0) {
    return { values: [], periodKeys: [] };
  }
  const granularity = finestGranularity(kept.map((k) => k.parsed));
  // Carry the pre-sort index so ties (duplicate periods) keep input order
  // EXPLICITLY — not relying on the engine's sort stability.
  const keyed = kept.map((k, index) => ({ value: k.value, key: unitIndexFor(k.parsed, granularity), index }));
  keyed.sort((a, b) => a.key - b.key || a.index - b.index);
  return {
    values: keyed.map((k) => k.value),
    periodKeys: keyed.map((k) => k.key),
  };
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
 *  - 'prior_period'  → the same aggregate over the series EXCLUDING the most-recent point/period;
 *  - 'window'        → the same aggregate over the series EXCLUDING the last `window` points/periods.
 * Without periodField the slice is by trailing ROWS (v0.1); with periodField it
 * is by trailing DISTINCT PERIODS (v0.2). prior_period is window-of-1. Returns
 * null when the basis cannot be resolved (no target value, or the prior slice is empty).
 */
function resolveBaseline(panel: KpiPanel, series: MetricSeries, kind: AggregateKind): number | null {
  const comparison = panel.comparison;
  if (!comparison) {
    return null;
  }
  if (comparison.basis === 'target') {
    return typeof comparison.value === 'number' ? comparison.value : null;
  }
  const window = comparison.basis === 'prior_period' ? 1 : Math.max(1, Math.trunc(comparison.window ?? 1));
  const priorSlice = priorValues(series, window);
  return priorSlice.length > 0 ? round(aggregate(priorSlice, kind)) : null;
}

/**
 * The metric values BEFORE the trailing `window` units. v0.1 (no periodKeys):
 * exclude the last `window` ROWS. v0.2 (periodKeys present): exclude the last
 * `window` DISTINCT PERIODS — keep values whose period key is below the cutoff.
 * A window covering every unit leaves an empty slice (baseline unresolved).
 */
function priorValues(series: MetricSeries, window: number): number[] {
  const { values, periodKeys } = series;
  if (!periodKeys) {
    // Clamp the slice end at 0: a window >= series length leaves no prior slice.
    // (A negative slice end would wrongly count from the array's tail.)
    return values.slice(0, Math.max(0, values.length - window));
  }
  // periodKeys is ascending, so first-seen Set insertion order is ascending too.
  const distinct = [...new Set(periodKeys)];
  if (window >= distinct.length) {
    return [];
  }
  const cutoff = distinct[distinct.length - window];
  const prior: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    if (periodKeys[i] < cutoff) {
      prior.push(values[i]);
    }
  }
  return prior;
}

/** Compute a KPI payload from the (already cross-filtered) rows for the panel. */
export function computeKpi(panel: KpiPanel, rows: readonly DataRecord[]): KpiResult {
  const kind: AggregateKind = panel.aggregate ?? 'sum';
  const series = buildMetricSeries(panel, rows);
  const values = series.values;
  const value = round(aggregate(values, kind));

  const baseline = resolveBaseline(panel, series, kind);
  const delta = baseline !== null ? round(value - baseline) : null;
  const deltaPct = baseline !== null && baseline !== 0 ? round((value - baseline) / Math.abs(baseline)) : null;

  let trendDirection: KpiResult['trendDirection'];
  if (baseline !== null) {
    trendDirection = deriveTrend(baseline, value).trend;
  } else if (panel.periodField && values.length >= 2) {
    // s149 F6b: a first-vs-last trend is only meaningful when the series has a real
    // temporal order. With periodField the values are sorted ascending by period
    // (buildMetricSeries), so values[0]→values[last] is earliest→latest. WITHOUT it
    // the values are in arbitrary ROW order, so first-vs-last narrates row order as a
    // trend on non-temporal data — a phantom. Report 'flat' rather than invent one.
    trendDirection = deriveTrend(values[0], values[values.length - 1]).trend;
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

  if (values.length > 1) {
    result.sparkline = values.map((v) => round(v));
  }

  const threshold = panel.threshold;
  if (threshold && typeof threshold.value === 'number' && threshold.direction) {
    result.thresholdBreached = threshold.direction === 'above' ? value > threshold.value : value < threshold.value;
  }

  if (threshold?.anomaly === 'stddev_outlier' && values.length >= 2) {
    const seriesMean = mean(values);
    const sd = populationStdDev(values, seriesMean);
    const latest = values[values.length - 1];
    result.anomaly = sd > 0 ? Math.abs(latest - seriesMean) > STDDEV_OUTLIER_SIGMA * sd : false;
  }

  return result;
}
