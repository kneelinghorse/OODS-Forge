import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows, type NormalizedVizSpec } from '@oods/viz-core';
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
