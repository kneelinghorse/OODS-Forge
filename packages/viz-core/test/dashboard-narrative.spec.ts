import { describe, expect, it } from 'vitest';
import {
  deriveDashboardNarrative,
  resolveDashboardNarrative,
  type DashboardKpiSummary,
} from '@oods/viz-core';

const REVENUE: DashboardKpiSummary = {
  label: 'Total Revenue',
  formatted: '390',
  trendDirection: 'increasing',
  delta: 90,
  thresholdBreached: true,
};

const ORDERS: DashboardKpiSummary = {
  label: 'Orders',
  formatted: '42',
  trendDirection: 'decreasing',
  delta: -8,
  anomaly: true,
};

describe('deriveDashboardNarrative', () => {
  it('returns an empty narrative when there are no KPIs', () => {
    expect(deriveDashboardNarrative([])).toEqual({ summary: undefined, keyFindings: [] });
  });

  it('summarizes the metric count and how many breached threshold / flagged anomalous', () => {
    const { summary, keyFindings } = deriveDashboardNarrative([REVENUE, ORDERS]);
    expect(summary).toBe('2 key metrics tracked. 1 metric breached threshold. 1 flagged anomalous.');
    // each KPI yields a finding restating value/trend/delta + its flags.
    expect(keyFindings).toEqual([
      'Total Revenue: 390 (increasing, delta 90) — threshold breached',
      'Orders: 42 (decreasing, delta -8) — anomaly',
    ]);
  });

  it('omits the delta phrase when delta is null', () => {
    const { keyFindings } = deriveDashboardNarrative([{ label: 'Active Users', formatted: '1200', trendDirection: 'flat', delta: null }]);
    expect(keyFindings).toEqual(['Active Users: 1200 (flat)']);
  });

  it('caps key findings at 5', () => {
    const many: DashboardKpiSummary[] = Array.from({ length: 8 }, (_, i) => ({
      label: `M${i}`,
      formatted: String(i),
      trendDirection: 'flat',
      delta: 0,
    }));
    expect(deriveDashboardNarrative(many).keyFindings).toHaveLength(5);
  });
});

describe('resolveDashboardNarrative (author override)', () => {
  it('computes from KPIs when no author narrative is supplied', () => {
    const result = resolveDashboardNarrative(undefined, [REVENUE], 'Fallback description.');
    expect(result.summary).toBe('1 key metric tracked. 1 metric breached threshold.');
    expect(result.keyFindings).toEqual(['Total Revenue: 390 (increasing, delta 90) — threshold breached']);
  });

  it('lets an author summary AND findings win byte-identically', () => {
    const author = { summary: 'Hand-written.', keyFindings: ['A', 'B'] };
    const result = resolveDashboardNarrative(author, [REVENUE], 'Fallback description.');
    expect(result.summary).toBe('Hand-written.');
    expect(result.keyFindings).toEqual(['A', 'B']);
  });

  it('falls back to the dashboard description when there are no KPIs and no author summary', () => {
    const result = resolveDashboardNarrative(undefined, [], 'Fallback description.');
    expect(result.summary).toBe('Fallback description.');
    expect(result.keyFindings).toEqual([]);
  });

  it('keeps the author summary but uses derived findings when the author omits findings', () => {
    const result = resolveDashboardNarrative({ summary: 'Only a summary.' }, [REVENUE], 'Fallback.');
    expect(result.summary).toBe('Only a summary.');
    expect(result.keyFindings).toEqual(['Total Revenue: 390 (increasing, delta 90) — threshold breached']);
  });
});
