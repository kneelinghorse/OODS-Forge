import { describe, expect, it } from 'vitest';
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Relative-path imports throughout (same module instances as the emitters; the capture hooks and
// the registry are deliberately OFF every barrel — not public API).
import {
  captureNarratedNumbers,
  NARRATED_VALUE_CLASSIFICATION,
  type NarratedNumberEmission,
  type NarratedValueKind,
} from '../src/a11y/format.js';
import { generateNarrativeSummary } from '../src/a11y/narrative-generator.js';
import { analyzeVizSpec, findNonDrawnNarrativeValues } from '../src/a11y/data-analysis.js';
import { deriveDashboardNarrative, type DashboardKpiSummary } from '../src/a11y/dashboard-narrative.js';
import type { NormalizedVizSpec } from '../src/spec/normalized-viz-spec.js';

// ============================================================================
// Sprint-160 m4 — THE STANDING NARRATED-VALUE PROVENANCE SWEEP (SSOT memo §2-m4; §5.7).
// The s159 review's free-hunt as a permanent test: every numeric TOKEN the single-chart narrative
// or the dashboard narrative emits must be accounted for by a TAGGED emission (narrateNumber /
// narrateFormatted, each carrying a NarratedValueKind classified 'guard-checked' or 'disclosed' in
// the compile-exhaustive registry) or be a label/author-text numeral. A raw `${value}` template
// interpolation — the exact bypass class the pre-s160 correlation coefficient shipped through —
// produces an unaccounted token and FAILS here.
// SWEPT SURFACES: generateNarrativeSummary + deriveDashboardNarrative. Non-cartesian/spatial
// analyzers and the pre-built-analysis path are OUT (disclosed — the §4 claim ceiling scopes to
// the swept surfaces). KNOWN false-negative class (disclosed): an untagged value that string-
// collides with a label numeral escapes the token check.
// ============================================================================

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
const CANONICAL_GLOBS = ['examples/viz/patterns-v2/**/*.spec.json', 'examples/viz/patterns/**/*.spec.json'];

const FIXTURES = [...new Set(CANONICAL_GLOBS.flatMap((g) => globSync(path.join(REPO_ROOT, g))))].sort();

// Numeric tokens incl. Intl group separators and percent suffixes ("1,234" / "12.3%" / "0.98").
const NUM_TOKEN = /\d[\d,]*(?:\.\d+)?%?/g;
function numericTokens(text: string): string[] {
  return text.match(NUM_TOKEN) ?? [];
}

// The provenance check: every numeric token in `text` must appear among the tokens of the tagged
// emissions' formatted strings or of the allowed label/author strings. Returns the violations so
// the sweep's own teeth are testable (see the enforcement-property test below).
function unaccountedTokens(
  text: string,
  emissions: readonly NarratedNumberEmission[],
  allowedStrings: readonly (string | undefined)[]
): string[] {
  const allowed = new Set<string>();
  for (const emission of emissions) {
    for (const token of numericTokens(emission.formatted)) {
      allowed.add(token);
    }
  }
  for (const source of allowedStrings) {
    if (source) {
      for (const token of numericTokens(source)) {
        allowed.add(token);
      }
    }
  }
  return numericTokens(text).filter((token) => !allowed.has(token));
}

// Label/author strings whose numerals are NOT narrated values: dimension/category labels, point
// labels, the chart's own name/description, and any author-supplied narrative override.
function allowedLabelStrings(spec: NormalizedVizSpec): (string | undefined)[] {
  const analysis = analyzeVizSpec(spec);
  const a11y = spec.a11y as { description?: string; ariaLabel?: string; narrative?: { summary?: string; keyFindings?: readonly string[] } };
  return [
    ...analysis.dimensionValues,
    ...analysis.colorCategories,
    analysis.max?.label,
    analysis.min?.label,
    analysis.first?.label,
    analysis.last?.label,
    spec.name,
    spec.id,
    a11y?.description,
    a11y?.ariaLabel,
    a11y?.narrative?.summary,
    ...(a11y?.narrative?.keyFindings ?? []),
  ];
}

function sweep(spec: NormalizedVizSpec): { violations: string[]; emissions: NarratedNumberEmission[] } {
  const { result, emissions } = captureNarratedNumbers(() => generateNarrativeSummary(spec));
  const text = `${result.summary} ${result.keyFindings.join(' ')}`;
  return { violations: unaccountedTokens(text, emissions, allowedLabelStrings(spec)), emissions };
}

describe('s160 m4 — registry ↔ guard machine-link (the claim value-scope generator)', () => {
  it('the guard-checked kinds are EXACTLY the guard’s phantom-checked set (4 ↔ 4, named mapping)', () => {
    const guardChecked = (Object.keys(NARRATED_VALUE_CLASSIFICATION) as NarratedValueKind[])
      .filter((kind) => NARRATED_VALUE_CLASSIFICATION[kind] === 'guard-checked')
      .sort();
    expect(guardChecked).toEqual(['correlation-r', 'extremum-max', 'extremum-min', 'total']);
    // ...and the guard reports exactly the four matching phantom flags — if a kind is promoted to
    // guard-checked without a guard arm (or an arm ships unregistered), THIS pins the drift.
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'link',
      name: 'link',
      data: { name: 'l', values: [{ x: 'a', y: 1 }] },
      marks: [{ trait: 'MarkBar', encodings: { x: { field: 'x', trait: 'EncodingX', scale: 'band' }, y: { field: 'y', trait: 'EncodingY' } } }],
      encoding: { x: { field: 'x', trait: 'EncodingX', scale: 'band' }, y: { field: 'y', trait: 'EncodingY' } },
      a11y: { description: 'link' },
    } as unknown as NormalizedVizSpec;
    const flags = findNonDrawnNarrativeValues(analyzeVizSpec(spec), spec, undefined);
    expect(Object.keys(flags).sort()).toEqual(['correlationPhantom', 'maxPhantom', 'minPhantom', 'totalPhantom']);
  });

  it('every registry kind is classified (compile-exhaustive Record; runtime mirror)', () => {
    for (const [kind, classification] of Object.entries(NARRATED_VALUE_CLASSIFICATION)) {
      expect(['guard-checked', 'disclosed'], `kind ${kind}`).toContain(classification);
    }
  });
});

describe('s160 m4 — enforcement property (the sweep’s own teeth)', () => {
  it('an unaccounted numeric token IS a violation (a raw interpolation cannot pass)', () => {
    expect(unaccountedTokens('phantom mean 42.5 appeared', [], ['label 7'])).toEqual(['42.5']);
    expect(unaccountedTokens('label 7 only', [], ['label 7'])).toEqual([]);
  });
});

describe('s160 m4 — canonical-corpus provenance sweep (single-chart narrative)', () => {
  it('the canonical corpus is non-empty (a corpus move cannot hollow this gate)', () => {
    expect(FIXTURES.length).toBeGreaterThanOrEqual(30);
  });

  for (const file of FIXTURES) {
    const name = path.relative(REPO_ROOT, file);
    it(`${name}: every narrated numeric token is tagged-or-label`, () => {
      const spec = JSON.parse(readFileSync(file, 'utf8')) as NormalizedVizSpec;
      const { violations } = sweep(spec);
      expect(violations, `unaccounted numeric tokens: ${violations.join(', ')}`).toEqual([]);
    });
  }
});

describe('s160 m4 — synthetic narrated-value-axis arms (each emission kind exercised + accounted)', () => {
  function cartesianSpec(opts: {
    mark: string;
    rows: Record<string, unknown>[];
    encoding: Record<string, unknown>;
    layout?: Record<string, unknown>;
  }): NormalizedVizSpec {
    return {
      $schema: 'https://oods.dev/viz-spec/v1',
      id: 'axis',
      name: 'axis arm',
      data: { name: 'd', values: opts.rows },
      marks: [{ trait: opts.mark, encodings: { ...opts.encoding } }],
      encoding: opts.encoding,
      ...(opts.layout ? { layout: opts.layout } : {}),
      a11y: { description: 'axis arm' },
    } as unknown as NormalizedVizSpec;
  }

  const ARMS: { name: string; spec: NormalizedVizSpec; expectKinds: NarratedValueKind[] }[] = [
    {
      name: 'line trend (first/last/trend-percent)',
      spec: cartesianSpec({
        mark: 'MarkLine',
        rows: [{ t: 1, v: 10 }, { t: 2, v: 15 }, { t: 3, v: 30 }],
        encoding: { x: { field: 't', trait: 'EncodingX', scale: 'linear' }, y: { field: 'v', trait: 'EncodingY' } },
      }),
      expectKinds: ['first', 'last', 'trend-percent'],
    },
    {
      name: 'aggregated bar (extrema + total findings)',
      spec: cartesianSpec({
        mark: 'MarkBar',
        rows: [{ cat: 'a', v: 10 }, { cat: 'a', v: 20 }, { cat: 'b', v: 5 }],
        encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
      }),
      expectKinds: ['extremum-max', 'extremum-min', 'total'],
    },
    {
      name: 'strip plot (mean)',
      spec: cartesianSpec({
        mark: 'MarkPoint',
        rows: [{ cat: 'a', v: 10 }, { cat: 'b', v: 20 }, { cat: 'c', v: 60 }],
        encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', type: 'quantitative' } },
      }),
      expectKinds: ['mean'],
    },
    {
      name: 'scatter (correlation-r)',
      spec: cartesianSpec({
        mark: 'MarkPoint',
        rows: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 4 }],
        encoding: { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' } },
      }),
      expectKinds: ['correlation-r'],
    },
    {
      name: '∅-cell no-dimension sum (row-count + total, m1 arm)',
      spec: cartesianSpec({
        mark: 'MarkBar',
        rows: [{ v: 1 }, { v: 2 }, { v: 3 }],
        encoding: { y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
      }),
      expectKinds: ['total'],
    },
  ];

  for (const arm of ARMS) {
    it(`${arm.name}: zero unaccounted tokens; expected kinds logged`, () => {
      const { violations, emissions } = sweep(arm.spec);
      expect(violations, violations.join(', ')).toEqual([]);
      const logged = new Set(emissions.map((e) => e.kind));
      for (const kind of arm.expectKinds) {
        expect(logged, `expected kind ${kind} logged`).toContain(kind);
      }
    });
  }

  it('governed measure context (governed-threshold + governed-target) accounted', () => {
    const { result, emissions } = captureNarratedNumbers(() =>
      generateNarrativeSummary({
        analysis: analyzeVizSpec(ARMS[1].spec),
        measureLabel: 'Revenue',
        measureContext: { thresholdValue: 250.5, comparisonBasis: 'target', comparisonValue: 300 },
      })
    );
    const text = `${result.summary} ${result.keyFindings.join(' ')}`;
    expect(unaccountedTokens(text, emissions, allowedLabelStrings(ARMS[1].spec))).toEqual([]);
    const logged = new Set(emissions.map((e) => e.kind));
    expect(logged).toContain('governed-threshold');
    expect(logged).toContain('governed-target');
  });
});

describe('s160 m4 — dashboard narrative provenance sweep', () => {
  it('KPI counts/values/deltas/thresholds/targets all tagged-or-label', () => {
    const kpis: DashboardKpiSummary[] = [
      {
        label: 'Total Revenue',
        formatted: '390',
        trendDirection: 'increasing',
        delta: 90.125,
        thresholdBreached: true,
        measureContext: { thresholdValue: 300.75, comparisonBasis: 'target', comparisonValue: 410 },
      },
      { label: 'Sessions', formatted: '1,204', trendDirection: 'flat', delta: null, anomaly: true },
    ];
    const { result, emissions } = captureNarratedNumbers(() => deriveDashboardNarrative(kpis));
    const text = `${result.summary ?? ''} ${result.keyFindings.join(' ')}`;
    const violations = unaccountedTokens(text, emissions, kpis.map((k) => k.label));
    expect(violations, violations.join(', ')).toEqual([]);
    const logged = new Set(emissions.map((e) => e.kind));
    for (const kind of ['kpi-count', 'kpi-breach-count', 'kpi-anomaly-count', 'kpi-value', 'kpi-delta', 'kpi-threshold', 'kpi-target'] as NarratedValueKind[]) {
      expect(logged, `expected ${kind}`).toContain(kind);
    }
  });
});
