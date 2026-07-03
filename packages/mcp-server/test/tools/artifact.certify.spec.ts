import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows, toVegaLiteSpec, type NormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../../src/lib/ajv.js';
import { handle } from '../../src/tools/artifact.certify.js';

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

// s137 — the per-pillar tri-state summary (pillars) + the declared-intent contrast
// verdict. The contrast pillar is PURELY additive to certify's OWN output: it never
// changes conformant and never touches the cartesian compile bytes (the compiled
// spec is colorless, so a color-token override changes the verdict but NOT the hash).
describe('artifact.certify — contrast pillar (s137)', () => {
  // A multi-series IR: color=region gives 3 distinct categorical slots (cat-01..03).
  const buildMultiSeries = (tokens?: Record<string, string | number>): NormalizedVizSpec => {
    const built = buildVizSpecFromRows({
      rows: ROWS3,
      chartType: 'bar',
      encodings: { x: { field: 'quarter' }, y: { field: 'revenue', aggregate: 'sum' }, color: { field: 'region' } } as never,
    }).spec;
    return tokens ? ({ ...built, config: { ...built.config, tokens } } as NormalizedVizSpec) : built;
  };

  it('a default cartesian IR → pillars all pass + a declared-intent contrastNote', async () => {
    const out = await certify(buildSpec(ROWS3));
    expect(out.pillars).toEqual({ a11yEquivalence: 'pass', determinism: 'pass', contrast: 'pass' });
    expect(out.contrastNote).toContain('DECLARED');
    expect(validateOutput(out)).toBe(true);
  });

  it('a low-contrast config.tokens override → contrast:fail, but conformant + a11yEquivalence UNCHANGED', async () => {
    const out = await certify(
      buildMultiSeries({
        '--oods-viz-scale-categorical-01': '#777777',
        '--oods-viz-scale-categorical-02': '#7A7A7A',
        '--oods-viz-scale-categorical-03': '#808080',
      }),
    );
    expect(out.conformant).toBe(true); // a11y-equivalence is unaffected by the palette
    expect(out.pillars?.a11yEquivalence).toBe('pass');
    expect(out.pillars?.contrast).toBe('fail');
    expect(validateOutput(out)).toBe(true);
  });

  it('certifies DECLARED-intent colors: the compiled cartesian spec bakes NO resolved palette (why contrast is declared, and why #564 holds)', () => {
    // The whole declared-intent thesis rests on this: the compiled Vega-Lite spec is
    // colorless — no scale.range, no resolved categorical hex (e.g. #3668D8). The
    // contrast pillar therefore certifies the palette Forge INTENDS, and the pillar
    // is safe to add without touching a single compiled byte. (A future change that
    // baked color into scale.range would fail here — a #564 tripwire.)
    const compiled = JSON.stringify(toVegaLiteSpec(buildMultiSeries()));
    expect(compiled).not.toContain('"range"');
    expect(compiled).not.toContain('3668D8'); // resolved categorical-01
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
