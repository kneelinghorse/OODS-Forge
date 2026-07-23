// REPRO (F2 tokenizer contract / F3 governed-unit overfire / P3 facet-clean / P4 m1-tagged / P1 algorithm-level):
// cp this file to packages/viz-core/src/a11y/__s160rev_sweepescape_probes.spec.ts then run:
//   cd packages/viz-core && pnpm exec vitest run src/a11y/__s160rev_sweepescape_probes.spec.ts
// All 7 tests PASS = defect hypotheses confirmed (see per-test comments). Delete the file after.
// s160 adversarial review — provenance-sweep escape probes (TEMPORARY, delete after run).
// Replicates the EXACT extractor/allowlist pipeline of test/narrated-value-provenance-sweep-s160.spec.ts
// (NUM_TOKEN, unaccountedTokens, allowedLabelStrings copied verbatim) and drives live narratives
// through it to test the enforcement boundary, NOT the SUT's own assertions.
import { describe, expect, it } from 'vitest';
import {
  captureNarratedNumbers,
  formatNumeric,
  type NarratedNumberEmission,
} from './format.js';
import { generateNarrativeSummary } from './narrative-generator.js';
import { analyzeVizSpec } from './data-analysis.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';

// ---- verbatim copies from the sweep spec ----
const NUM_TOKEN = /\d[\d,]*(?:\.\d+)?%?/g;
function numericTokens(text: string): string[] {
  return text.match(NUM_TOKEN) ?? [];
}
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
function sweep(spec: NormalizedVizSpec): { violations: string[]; emissions: NarratedNumberEmission[]; text: string } {
  const { result, emissions } = captureNarratedNumbers(() => generateNarrativeSummary(spec));
  const text = `${result.summary} ${result.keyFindings.join(' ')}`;
  return { violations: unaccountedTokens(text, emissions, allowedLabelStrings(spec)), emissions, text };
}
// ---- end verbatim copies ----

function spec(opts: {
  mark: string;
  rows: Record<string, unknown>[];
  encoding: Record<string, unknown>;
  layout?: Record<string, unknown>;
}): NormalizedVizSpec {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'probe',
    name: 'probe arm',
    data: { name: 'd', values: opts.rows },
    marks: [{ trait: opts.mark, encodings: { ...opts.encoding } }],
    encoding: opts.encoding,
    ...(opts.layout ? { layout: opts.layout } : {}),
    a11y: { description: 'probe arm' },
  } as unknown as NormalizedVizSpec;
}

describe('P1 — emission-token collision: an UNTAGGED restatement of an already-tagged value escapes', () => {
  it('untagged duplicate of a tagged emission token is NOT a violation (escape, undisclosed class)', () => {
    // Aggregated bar: a=10+20=30, b=5. Tagged emissions include "30" (extremum-max).
    const s = spec({
      mark: 'MarkBar',
      rows: [{ cat: 'a', v: 10 }, { cat: 'a', v: 20 }, { cat: 'b', v: 5 }],
      encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
    });
    const { result, emissions } = captureNarratedNumbers(() => generateNarrativeSummary(s));
    // Simulate the natural bug the sweep claims to catch: a dev appends an UNTAGGED restatement
    // of the max ("Peak reached 30") — value already narrated tagged elsewhere.
    const text = `${result.summary} ${result.keyFindings.join(' ')} Peak reached ${formatNumeric(30)}`;
    const violations = unaccountedTokens(text, emissions, allowedLabelStrings(s));
    // ESCAPE: zero violations even though "Peak reached 30" is a raw, untagged numeric emission.
    expect(violations).toEqual([]);
    // Control: a NON-colliding untagged value IS caught (this is why the shipped ${mean} bite-proof fired).
    const text2 = `${result.summary} ${result.keyFindings.join(' ')} Peak reached ${formatNumeric(42.5)}`;
    expect(unaccountedTokens(text2, emissions, allowedLabelStrings(s))).toEqual(['42.5']);
  });
});

describe('P2 — chartered extractor contract: joined numeric color-category names', () => {
  it('a legitimately fully-tagged narrative with >=2 numeric color categories FALSE-POSITIVES (trailing comma token)', () => {
    // Bar with a categorical numeric color (years). narrative-generator.ts:325 joins them ", ".
    const s = spec({
      mark: 'MarkBar',
      rows: [
        { cat: 'a', v: 10, yr: 2021 },
        { cat: 'b', v: 20, yr: 2022 },
        { cat: 'c', v: 30, yr: 2023 },
      ],
      encoding: {
        x: { field: 'cat', trait: 'EncodingX', scale: 'band' },
        y: { field: 'v', trait: 'EncodingY' },
        color: { field: 'yr', trait: 'EncodingColor', type: 'nominal' },
      },
    });
    const { violations, text } = sweep(s);
    // Log what actually happened for the record.
    console.log('P2 text:', JSON.stringify(text));
    console.log('P2 violations:', JSON.stringify(violations));
    // Expectation under the DEFECT hypothesis: tokens like "2021," (comma swallowed by [\d,]*)
    // are not in the allowed set ("2021"). If this passes with [], the contract holds and P2 dies.
    expect(violations.length).toBeGreaterThan(0);
  });
  it('tokenizer minimal case: "2021, 2022" yields a trailing-comma token', () => {
    expect(numericTokens('Year: 2021, 2022')).toEqual(['2021,', '2022']);
  });
});

describe('P3 — faceted narratives through the sweep (s159-m5 mode check)', () => {
  it('faceted line (trend-suppressed range branch) sweeps clean with tagged extrema', () => {
    const s = spec({
      mark: 'MarkLine',
      rows: [
        { t: 1, v: 10, region: 'A' }, { t: 2, v: 9, region: 'A' }, { t: 3, v: 8, region: 'A' },
        { t: 1, v: 20, region: 'B' }, { t: 2, v: 19, region: 'B' }, { t: 3, v: 18, region: 'B' },
      ],
      encoding: { x: { field: 't', trait: 'EncodingX', scale: 'linear' }, y: { field: 'v', trait: 'EncodingY' } },
      layout: { trait: 'LayoutFacet', rows: { field: 'region' } },
    });
    const { violations, emissions, text } = sweep(s);
    console.log('P3 line text:', JSON.stringify(text));
    expect(violations).toEqual([]);
    const kinds = new Set(emissions.map((e) => e.kind));
    // The faceted branch narrates the order-invariant range (extremum kinds), tagged.
    expect(kinds.has('extremum-min') || kinds.has('extremum-max')).toBe(true);
  });
  it('faceted aggregated bar sweeps clean', () => {
    const s = spec({
      mark: 'MarkBar',
      rows: [
        { cat: 'a', v: 10, region: 'A' }, { cat: 'b', v: 30, region: 'A' },
        { cat: 'a', v: 54, region: 'B' }, { cat: 'b', v: 94, region: 'B' },
      ],
      encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
      layout: { trait: 'LayoutFacet', rows: { field: 'region' } },
    });
    const { violations, text } = sweep(s);
    console.log('P3 bar text:', JSON.stringify(text));
    expect(violations).toEqual([]);
  });
});

describe('P4 — m1 no-dimension Total: NEW traffic flows tagged; extractor parses it', () => {
  it('∅-cell large-magnitude total narrates via a tagged total emission, formatted 0.3', () => {
    const s = spec({
      mark: 'MarkBar',
      rows: [{ v: 1e9 }, { v: -1e9 }, { v: 0.1 }, { v: 0.2 }],
      encoding: { y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
    });
    const { violations, emissions, text } = sweep(s);
    console.log('P4 text:', JSON.stringify(text));
    console.log('P4 emissions:', JSON.stringify(emissions));
    expect(violations).toEqual([]);
    const total = emissions.find((e) => e.kind === 'total');
    expect(total).toBeDefined();
    // Hand oracle: stableSum([1e9,-1e9,0.1,0.2]) ≈ 0.3; formatNumeric(≈0.3) = "0.3".
    expect(total!.value).toBeCloseTo(0.3, 5);
    expect(total!.formatted).toBe('0.3');
    // The full-precision float never appears raw in the text.
    expect(text).not.toContain('0.30000');
  });
});

describe('P5 — governed unit with digits: raw untagged interpolation on the single-chart surface', () => {
  it('unit "1000 USD" digits are neither tagged nor label-allowed → sweep would flag a fully-legitimate narrative', () => {
    const s = spec({
      mark: 'MarkBar',
      rows: [{ cat: 'a', v: 10 }, { cat: 'a', v: 20 }, { cat: 'b', v: 5 }],
      encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
    });
    const { result, emissions } = captureNarratedNumbers(() =>
      generateNarrativeSummary({
        analysis: analyzeVizSpec(s),
        measureLabel: 'Revenue',
        measureContext: { unit: '1000 USD', thresholdValue: 250.5 },
      })
    );
    const text = `${result.summary} ${result.keyFindings.join(' ')}`;
    console.log('P5 text:', JSON.stringify(text));
    const violations = unaccountedTokens(text, emissions, allowedLabelStrings(s));
    console.log('P5 violations:', JSON.stringify(violations));
    // Defect hypothesis: "1000" (from the raw `unit ${ctx.unit}` interpolation) is unaccounted.
    expect(violations).toContain('1000');
  });
});
