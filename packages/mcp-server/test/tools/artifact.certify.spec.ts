import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalize, sha256 } from '@oods/artifacts';
import { buildVizSpecFromRows, toVegaLiteSpec, type NormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../../src/lib/ajv.js';
import { handle } from '../../src/tools/artifact.certify.js';
import { handle as vizRender } from '../../src/tools/viz.render.js';

// The wired output schema (m03) — every verdict below must AJV-validate against it,
// so the handler's real output stays contract-clean (mirrors the viz.render specs).
const outputSchema = JSON.parse(
  readFileSync(new URL('../../src/schemas/artifact.certify.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);

// artifact.certify (sprint-136 m02) — the "certify" half of generate-AND-certify.
// An agent hands in a Forge NormalizedVizSpec IR and gets back a conformance verdict
// + a re-emit determinism proof + a contentHash. certify REUSES the same equivalence
// engine (validateVizEquivalenceRules) and determinism transform (toVegaLiteSpec ->
// canonicalize -> sha256) viz.render runs, so a Forge-generated spec certifies to the
// same hash it renders to. It is a READER of the IR (no scorer/recommender change, #110).
//
// Coverage-honest: certification is CARTESIAN-ONLY. The 8 ECharts-primary types are
// classified from the IR's first mark trait and returned coverage:'uncertified' /
// conformant:null — a distinct verdict, NOT a failure.

const certify = (spec: unknown) => handle({ spec });

// A 3-field cartesian dataset → the accessible table has 3 columns.
const ROWS3 = [
  { region: 'North', quarter: 'Q1', revenue: 100 },
  { region: 'South', quarter: 'Q1', revenue: 120 },
  { region: 'East', quarter: 'Q1', revenue: 90 },
];
const CARTESIAN_ENCODINGS = { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' as const } };
// A y encoding whose field is ABSENT from every row → A11Y-R-12 (error). The builder
// still produces a valid spec (it cannot invent data), so this is the reachable way to
// make certify report conformant:false on a cartesian IR.
const MISSING_FIELD_ENCODINGS = { x: { field: 'region' }, y: { field: 'nonexistent' } };

const buildSpec = (
  rows: Array<Record<string, unknown>>,
  encodings: Record<string, unknown> = CARTESIAN_ENCODINGS,
): NormalizedVizSpec => buildVizSpecFromRows({ rows, chartType: 'bar', encodings: encodings as never }).spec;

describe('artifact.certify — conformance verdict (cartesian)', () => {
  it('a conformant cartesian IR → certified, conformant:true, no findings, stable contentHash', async () => {
    const spec = buildSpec(ROWS3);
    const out = await certify(spec);
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('certified');
    expect(out.conformant).toBe(true);
    expect(out.findings).toEqual([]);
    expect(out.determinism?.stable).toBe(true);
    expect(out.determinism?.contentHash).toBeTypeOf('string');
    expect(validateOutput(out)).toBe(true);
  });

  it('a non-conformant IR (encoding field absent from rows → R-12) → conformant:false + OODS-A11Y-A11Y-R-12', async () => {
    const spec = buildSpec(ROWS3, MISSING_FIELD_ENCODINGS);
    const out = await certify(spec);
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('certified');
    expect(out.conformant).toBe(false);
    // Per-rule code preserved verbatim (the intentional doubled A11Y literal) — NEVER
    // collapsed to OODS-V129 (which a thrown assertVizEquivalence would produce).
    const findings = out.findings ?? [];
    expect(findings.map((f) => f.code)).toContain('OODS-A11Y-A11Y-R-12');
    expect(findings.find((f) => f.code === 'OODS-A11Y-A11Y-R-12')?.severity).toBe('error');
    expect(validateOutput(out)).toBe(true);
  });
});

describe('artifact.certify — coverage-honest routing', () => {
  it('an ECharts-primary IR (MarkSankey) → uncertified, conformant:null, no determinism', async () => {
    const good = buildSpec(ROWS3);
    // Same valid IR with only the first mark trait flipped to an ECharts-primary type.
    const sankey = { ...good, marks: [{ ...good.marks[0], trait: 'MarkSankey' }] } as unknown;
    const out = await certify(sankey);
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('uncertified');
    expect(out.conformant).toBeNull();
    expect(out.findings).toEqual([]);
    expect(out.determinism).toBeUndefined();
    expect(out.notes?.[0]).toContain('MarkSankey');
    expect(validateOutput(out)).toBe(true);
  });
});

describe('artifact.certify — determinism (contentHash)', () => {
  it('same input → identical contentHash across two calls (pure verdict)', async () => {
    const spec = buildSpec(ROWS3);
    const a = await certify(spec);
    const b = await certify(spec);
    expect(a.determinism?.contentHash).toBeTypeOf('string');
    expect(a.determinism?.contentHash).toBe(b.determinism?.contentHash);
  });

  it('a one-field mutation → different contentHash', async () => {
    const a = await certify(buildSpec(ROWS3));
    const mutatedRows = [{ ...ROWS3[0], revenue: 999 }, ...ROWS3.slice(1)];
    const b = await certify(buildSpec(mutatedRows));
    expect(a.determinism?.contentHash).not.toBe(b.determinism?.contentHash);
  });
});

describe('artifact.certify — invalid input', () => {
  it('an invalid IR → structured error (status:error, OODS-V126), never a throw', async () => {
    const out = await certify({ not: 'a normalized viz spec' });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V126');
    expect(out.coverage).toBeUndefined();
    expect(out.determinism).toBeUndefined();
    expect(validateOutput(out)).toBe(true);
  });
});

// s137/s138 — the per-pillar tri-state summary (pillars) + the RENDERED-REALITY contrast
// verdict. The contrast pillar never changes conformant + a11yEquivalence (they read the
// color ENCODING field, never scale.range). Under s138 the compiled cartesian spec DOES
// carry the resolved OODS palette (scale.range for multi-series / mark.color for
// single-series), so a color-token override changes BOTH the contrast verdict AND the
// contentHash — certify grades the palette Forge actually renders.
describe('artifact.certify — contrast pillar (s137/s138)', () => {
  // A multi-series IR: color=region gives 3 distinct categorical slots (cat-01..03).
  const buildMultiSeries = (tokens?: Record<string, string | number>): NormalizedVizSpec => {
    const built = buildVizSpecFromRows({
      rows: ROWS3,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } } as never,
    }).spec;
    return tokens ? ({ ...built, config: { ...built.config, tokens } } as NormalizedVizSpec) : built;
  };

  it('a default cartesian IR → pillars all pass + a rendered-contrast contrastNote', async () => {
    const out = await certify(buildSpec(ROWS3));
    expect(out.pillars).toEqual({ a11yEquivalence: 'pass', determinism: 'pass', contrast: 'pass' });
    // Rendered-reality caveat (s138), no longer the declared-intent one.
    expect(out.contrastNote).toContain('bakes into the compiled spec');
    expect(validateOutput(out)).toBe(true);
  });

  it('a low-contrast config.tokens override → contrast:fail on the RENDERED spec, but conformant + a11yEquivalence UNCHANGED', async () => {
    const greyTokens = {
      '--oods-viz-scale-categorical-01': '#777777',
      '--oods-viz-scale-categorical-02': '#7A7A7A',
      '--oods-viz-scale-categorical-03': '#808080',
    };
    const out = await certify(buildMultiSeries(greyTokens));
    expect(out.conformant).toBe(true); // a11y-equivalence is unaffected by the palette
    expect(out.pillars?.a11yEquivalence).toBe('pass');
    expect(out.pillars?.contrast).toBe('fail');
    expect(validateOutput(out)).toBe(true);

    // Rendered-reality (s138): the grey override is BAKED into the compiled scale.range,
    // so contrast:fail is a verdict about what Forge RENDERS — not a declared intent.
    const compiled = JSON.stringify(toVegaLiteSpec(buildMultiSeries(greyTokens)));
    expect(compiled).toContain('#777777');
  });

  it('bakes the resolved OODS palette into the compiled cartesian spec (s138 rendered-reality — the inversion of the s137 colorless tripwire, and the planned #564 cartesian-color change)', () => {
    // s138 rendered-reality: the compiled Vega-Lite spec now CARRIES the resolved OODS
    // palette — scale.range including categorical-01 (#3668D8) for a multi-series color
    // channel. The contrast pillar therefore grades what Forge RENDERS, not a declared
    // intent. This is exactly the deliberate non-additive #564 cartesian-color change
    // (its golden regen is owned by m04). Hand-inverted from the s137 `not.toContain`.
    const compiled = JSON.stringify(toVegaLiteSpec(buildMultiSeries()));
    expect(compiled).toContain('"range"');
    expect(compiled).toContain('3668D8'); // resolved categorical-01, baked into scale.range
    // Forge bakes an explicit hex range, NOT a Vega named 'scheme' — still absent.
    expect(compiled.toLowerCase()).not.toContain('scheme');
  });

  it('an ECharts-primary IR (MarkSankey) → pillars all unchecked (no Vega compile, role-C′ deferred)', async () => {
    const good = buildSpec(ROWS3);
    const sankey = { ...good, marks: [{ ...good.marks[0], trait: 'MarkSankey' }] } as unknown;
    const out = await certify(sankey);
    expect(out.coverage).toBe('uncertified');
    expect(out.pillars).toEqual({ a11yEquivalence: 'unchecked', determinism: 'unchecked', contrast: 'unchecked' });
    expect(validateOutput(out)).toBe(true);
  });
});

// s137 m03 — the fall-through routing bug-fix (review #1004 item 2). A schema-valid IR
// whose first-mark trait is neither cartesian-Vega nor ECharts-primary USED to fall
// through to a Vega compile and return an opaque status:error OODS-V127, even though
// the tool advertises heatmap as certified. Fix = a positive cartesian allowlist +
// a MarkHeatmap->MarkRect alias. Three-way lock: certified / uncertified / honest.
describe('artifact.certify — fall-through routing (review #1004 item 2)', () => {
  const withTrait = (trait: string): unknown => {
    const good = buildSpec(ROWS3);
    return { ...good, marks: [{ ...good.marks[0], trait }] };
  };

  it('MarkBar → certified (a modeled cartesian-Vega trait)', async () => {
    const out = await certify(withTrait('MarkBar'));
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('certified');
    expect(validateOutput(out)).toBe(true);
  });

  it('MarkTreemap → uncertified (ECharts-primary), never status:error', async () => {
    const out = await certify(withTrait('MarkTreemap'));
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('uncertified');
    expect(out.notes?.some((n) => n.includes('MarkTreemap'))).toBe(true);
    expect(validateOutput(out)).toBe(true);
  });

  it('MarkHeatmap → an HONEST certified verdict via the MarkRect alias — NOT the opaque V127 it used to be', async () => {
    const heatmap = await certify(withTrait('MarkHeatmap'));
    expect(heatmap.status).toBe('ok'); // regression: this was status:error OODS-V127
    expect(heatmap.coverage).toBe('certified');
    expect(heatmap.errors).toBeUndefined();
    // The alias truly normalizes to the canonical MarkRect: identical contentHash.
    const rect = await certify(withTrait('MarkRect'));
    expect(heatmap.determinism?.contentHash).toBe(rect.determinism?.contentHash);
    expect(validateOutput(heatmap)).toBe(true);
  });

  it('an unmodeled non-primary trait (MarkPie) → uncertified, never status:error V127', async () => {
    const out = await certify(withTrait('MarkPie'));
    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('uncertified');
    expect(out.conformant).toBeNull();
    expect(out.errors).toBeUndefined();
    expect(validateOutput(out)).toBe(true);
  });
});

// s138 m03 — the render↔certify contentHash IDENTITY, now at the NEW baked value. Both
// viz.render and certify compile through the SAME toVegaLiteSpec (which now bakes the OODS
// palette), so feeding certify viz.render's OWN returned normalizedSpec must reproduce
// viz.render's contentHash byte-for-byte. This is the "generate AND certify" round-trip
// made concrete at the rendered-reality value — no test pinned it across the two tools before.
describe('artifact.certify — cross-tool contentHash identity with viz.render (s138 m03)', () => {
  const MULTI_ENCODINGS = {
    x: { field: 'quarter' },
    y: { field: 'revenue', aggregate: 'sum' as const },
    color: { field: 'region' },
  };

  it("viz.render.contentHash === certify.contentHash on viz.render's RETURNED normalizedSpec (multi-series, baked scale.range)", async () => {
    const rendered = await vizRender({
      rows: ROWS3,
      chartType: 'bar',
      encodings: MULTI_ENCODINGS,
      output: { includeNormalizedSpec: true },
    } as never);
    expect(rendered.status).toBe('ok');
    expect(rendered.contentHash).toBeTypeOf('string');
    expect(rendered.normalizedSpec).toBeDefined();

    // Feed certify viz.render's OWN returned IR — NOT a re-built one — so both hashes are
    // over the byte-identical baked toVegaLiteSpec output.
    const certified = await certify(rendered.normalizedSpec);
    expect(certified.status).toBe('ok');
    expect(certified.determinism?.contentHash).toBe(rendered.contentHash);
  });

  it("single-series: viz.render.contentHash === certify.contentHash on the returned normalizedSpec (baked mark.color)", async () => {
    const rendered = await vizRender({
      rows: ROWS3,
      chartType: 'bar',
      encodings: { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' } },
      output: { includeNormalizedSpec: true },
    } as never);
    expect(rendered.status).toBe('ok');
    const certified = await certify(rendered.normalizedSpec);
    expect(certified.determinism?.contentHash).toBe(rendered.contentHash);
  });
});

// s139 m02/m03 — GRADE THE RENDERED BYTES (dissolve the classifier-mismatch false-pass).
// The reborn hollow (s138 review): a schema-valid but color-DIVERGENT binding — one the
// bake gate (vega-lite-adapter inferFieldType) leaves quantitative, so the compiled spec
// bakes NO scale.range/mark.color — used to return coverage:'certified' + conformant:true
// + contrast:'pass', because the OLD grade-side classifier re-classified the raw binding
// as categorical and re-resolved the 6-slot palette. s139 reads the emitted bytes instead:
// no baked OODS palette -> NEVER contrast:'pass'. These IRs are all schema-valid (they pass
// assertNormalizedVizSpec — a status:error here would mean the fixture, not the verdict, broke).
describe('artifact.certify — contrast grades the rendered bytes (s139)', () => {
  // A multi-series base (color=region → the bake fires for EncodingColor); swapping the
  // color binding is the ONLY change between the divergence cases and their twin.
  const multiBase = buildVizSpecFromRows({
    rows: ROWS3,
    chartType: 'bar',
    encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } } as never,
  }).spec;
  const withColor = (color: Record<string, unknown>): unknown => ({
    ...multiBase,
    encoding: { ...multiBase.encoding, color },
  });

  // Every binding the bake gate leaves quantitative → compiled bakes no palette → exempt.
  const DIVERGENCE_CASES: Array<[string, Record<string, unknown>]> = [
    ['EncodingDetail', { field: 'region', trait: 'EncodingDetail' }],
    ['EncodingColour (typo)', { field: 'region', trait: 'EncodingColour' }],
    ['bare Color', { field: 'region', trait: 'Color' }],
    ['EncodingDetail + timeUnit', { field: 'region', trait: 'EncodingDetail', timeUnit: 'year' }],
    ['EncodingDetail + aggregate', { field: 'region', trait: 'EncodingDetail', aggregate: 'count' }],
    ['EncodingSize on color', { field: 'region', trait: 'EncodingSize' }],
  ];

  it.each(DIVERGENCE_CASES)(
    'divergence lock — a %s color binding (compiled quantitative, no baked palette) → contrast:exempt, NEVER pass',
    async (_label, color) => {
      const out = await certify(withColor(color));
      expect(out.status).toBe('ok'); // schema-valid: the fixture certifies, it does not error
      expect(out.coverage).toBe('certified');
      // The governing rule: no baked OODS palette → contrast is never 'pass'.
      expect(out.pillars?.contrast).not.toBe('pass');
      expect(out.pillars?.contrast).toBe('exempt');
      expect(validateOutput(out)).toBe(true);
    },
  );

  it('legit categorical twin (EncodingColor, palette baked) → contrast:pass — unchanged', async () => {
    const out = await certify(withColor({ field: 'region', trait: 'EncodingColor' }));
    expect(out.pillars?.contrast).toBe('pass');
  });

  // INVARIANCE lock — s139 is contrast-OUTPUT-ONLY. Swapping EncodingColor→EncodingDetail
  // moves ONLY the contrast verdict (pass→exempt, because the rendered bytes differ). The
  // a11y-equivalence, determinism, and conformant verdicts read the color ENCODING/data —
  // never the palette — so they are IDENTICAL between the twin and its divergence sibling.
  // (contentHash necessarily DIFFERS: the compiled color bytes differ — that difference is
  // exactly WHY contrast differs; certified == rendered.)
  it('invariance — a divergence IR shares conformant/a11yEquivalence/determinism with its EncodingColor twin; only contrast moves', async () => {
    const twin = await certify(withColor({ field: 'region', trait: 'EncodingColor' }));
    const divergent = await certify(withColor({ field: 'region', trait: 'EncodingDetail' }));

    expect(divergent.conformant).toBe(twin.conformant);
    expect(divergent.pillars?.a11yEquivalence).toBe(twin.pillars?.a11yEquivalence);
    expect(divergent.pillars?.determinism).toBe(twin.pillars?.determinism);

    // The one intended difference — the contrast verdict.
    expect(twin.pillars?.contrast).toBe('pass');
    expect(divergent.pillars?.contrast).toBe('exempt');
    expect(divergent.pillars?.contrast).not.toBe(twin.pillars?.contrast);
  });

  // Contrast-output-only at the HASH level: certify's contentHash is EXACTLY the untouched
  // toVegaLiteSpec compile hash (the contrast pillar never feeds it). Pins #564-additive —
  // s139 moved no rendered byte, so the hash a divergence IR certifies to is the pure
  // compile hash, independent of the contrast verdict.
  it('contentHash is the untouched compile hash — the contrast pillar does not feed it', async () => {
    const divergentSpec = withColor({ field: 'region', trait: 'EncodingDetail' }) as NormalizedVizSpec;
    const out = await certify(divergentSpec);
    const compileHash = sha256(canonicalize(toVegaLiteSpec(divergentSpec)));
    expect(out.determinism?.contentHash).toBe(compileHash);
  });
});
