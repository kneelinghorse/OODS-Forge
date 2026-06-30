import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildFromIntent,
  buildVizSpecFromRows,
  validateVizEquivalenceRules,
  type NormalizedVizSpec,
  type StructuredIntent,
} from '@oods/viz-core';
import { getAjv } from '../../src/lib/ajv.js';
import type { VizRenderInput } from '../../src/schemas/generated.js';
import { handle } from '../../src/tools/viz.render.js';

// FIRST builder-path coverage for the a11y equivalence engine (sprint-134 m04).
//
// The engine (validateVizEquivalenceRules) is wired-to-nothing in production and, until s134, its
// ONLY existing test (tests/viz/a11y-equivalence.test.ts) exercised it over a HAND-AUTHORED fixture
// that deliberately satisfies every rule (x/y titles + tableColumnOrder set). That fixture proves a
// rich spec passes — it proves NOTHING about what viz.render actually emits. This file closes that
// gap: it runs the engine over specs built EXACTLY as viz.render builds them (buildVizSpecFromRows /
// buildFromIntent) and encodes the headline finding — "accessible by construction is currently
// FALSE" — as a regression: R-05 (error) + R-14 (warn) FIRE on default builder output because the
// builder synthesizes neither axis titles nor a deterministic column order. It also locks the m03
// soft-warn wire-in and the m02 contentHash.

const outputSchema = JSON.parse(
  readFileSync(new URL('../../src/schemas/viz.render.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);

const render = (input: Record<string, unknown>) => handle(input as unknown as VizRenderInput);

// A 3-FIELD dataset → the accessible table has 3 columns, so R-14 (>2-col column-order) applies.
const ROWS3 = [
  { region: 'North', quarter: 'Q1', revenue: 100 },
  { region: 'South', quarter: 'Q1', revenue: 120 },
  { region: 'East', quarter: 'Q1', revenue: 90 },
];
const CARTESIAN_ENCODINGS = { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' as const } };

// The error-severity rule ids — the set the FUTURE Slice-2 gate will enforce. A green target must
// pass ALL of them at once, or the gate assertion is misleading (a spec can trip a DIFFERENT error).
const ERROR_RULE_IDS = [
  'A11Y-R-01', 'A11Y-R-02', 'A11Y-R-03', 'A11Y-R-04', 'A11Y-R-05',
  'A11Y-R-06', 'A11Y-R-08', 'A11Y-R-09', 'A11Y-R-10', 'A11Y-R-12', 'A11Y-R-15',
];

describe('a11y equivalence engine over BUILDER-produced specs (first builder-path coverage)', () => {
  it('A11Y-R-05 FIRES (error) on a default cartesian bar — the builder synthesizes no axis titles', () => {
    const built = buildVizSpecFromRows({ rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS });
    const r05 = validateVizEquivalenceRules(built.spec).find((r) => r.id === 'A11Y-R-05');
    expect(r05?.passed).toBe(false); // the claim is currently FALSE — this is the regression
    expect(r05?.severity).toBe('error');
  });

  it('A11Y-R-05 FIRES on a buildFromIntent emission too (same builder, intent path)', () => {
    const intent: StructuredIntent = {
      goal: 'comparison',
      measures: [{ name: 'revenue' }],
      dimensions: [{ name: 'region' }],
    };
    const built = buildFromIntent({ intent, rows: ROWS3 });
    const r05 = validateVizEquivalenceRules(built.spec).find((r) => r.id === 'A11Y-R-05');
    expect(r05?.passed).toBe(false);
    expect(r05?.severity).toBe('error');
  });

  it('A11Y-R-14 FIRES (warn) on a >2-column table with no portability.tableColumnOrder', () => {
    const built = buildVizSpecFromRows({ rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS });
    const r14 = validateVizEquivalenceRules(built.spec).find((r) => r.id === 'A11Y-R-14');
    expect(r14?.passed).toBe(false);
    expect(r14?.severity).toBe('warn');
  });

  it('a fully-conformant spec PASSES every error-severity rule (the Slice-2 gate green target)', () => {
    // Build the production spec, then add EXACTLY the fields the builder omits — x/y titles (R-05),
    // a meaningful a11y.description ≥25 chars (R-08), an aria-label (R-09), and a deterministic
    // column order (R-14). The base already satisfies R-01/02/03/04/06/10/12/15 for a bar with data.
    const base = buildVizSpecFromRows({ rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS, name: 'Revenue by region' });
    const green = structuredClone(base.spec) as NormalizedVizSpec & Record<string, any>;
    green.encoding.x = { ...green.encoding.x, title: 'Region' };
    green.encoding.y = { ...green.encoding.y, title: 'Revenue (USD)' };
    green.a11y = {
      ...green.a11y,
      description: 'Bar chart comparing total revenue across the three sales regions for Q1.',
      ariaLabel: 'Revenue by region bar chart',
    };
    green.portability = { ...(green.portability ?? {}), tableColumnOrder: ['region', 'quarter', 'revenue'] };

    const results = validateVizEquivalenceRules(green);
    const failedError = results.filter((r) => !r.passed && r.severity === 'error');
    expect(failedError, `green target tripped: ${failedError.map((r) => r.id).join(', ')}`).toEqual([]);
    // Every error rule must actually have been evaluated (no silent gaps in the green target).
    for (const id of ERROR_RULE_IDS) {
      expect(results.find((r) => r.id === id)?.passed, `${id} not passing on green target`).toBe(true);
    }
    // R-14 (warn) now passes too, since tableColumnOrder is declared.
    expect(results.find((r) => r.id === 'A11Y-R-14')?.passed).toBe(true);
  });
});

describe('viz.render a11yEquivalence soft-warn wire-in (m03)', () => {
  it('flag ON surfaces OODS-A11Y-* warnings (severity warning, never in errors[], never throws)', async () => {
    const out = await render({ rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS, a11yEquivalence: true });
    expect(out.status).toBe('ok');
    expect(validateOutput(out)).toBe(true);
    const a11yWarnings = out.warnings.filter((w) => w.code.startsWith('OODS-A11Y-'));
    expect(a11yWarnings.length).toBeGreaterThan(0);
    expect(a11yWarnings.some((w) => w.code === 'OODS-A11Y-A11Y-R-05')).toBe(true); // R-05 = the headline finding
    expect(out.warnings.every((w) => w.severity === 'warning')).toBe(true);
    expect(out.errors).toBeUndefined(); // soft-warn: never an error, never a throw
  });

  it('flag OFF keeps warnings[] empty and is the ONLY delta (spec + contentHash byte-identical to ON)', async () => {
    const base = { rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS };
    const off = await render(base);
    const on = await render({ ...base, a11yEquivalence: true });
    expect(off.warnings).toEqual([]); // byte-identical to today
    expect(on.warnings.length).toBeGreaterThan(0);
    // the flag changes ONLY warnings[] — the rendered spec and its content identity are untouched
    expect(JSON.stringify(on.spec)).toBe(JSON.stringify(off.spec));
    expect((on as Record<string, unknown>).contentHash).toBe((off as Record<string, unknown>).contentHash);
  });

  it('ECharts-primary path emits NO equivalence warnings even with the flag ON (cartesian-only scope)', async () => {
    const out = await render({
      chartType: 'treemap',
      hierarchy: {
        type: 'adjacency_list',
        data: [
          { id: 'root', parentId: null, value: 0 },
          { id: 'a', parentId: 'root', value: 30 },
          { id: 'b', parentId: 'root', value: 70 },
        ],
      },
      a11yEquivalence: true,
    });
    expect(out.status).toBe('ok');
    expect(out.warnings.filter((w) => w.code.startsWith('OODS-A11Y-'))).toEqual([]);
  });
});

describe('viz.render contentHash (determinism identity, m02)', () => {
  it('same input → identical contentHash', async () => {
    const input = { rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS };
    const a = await render(input);
    const b = await render(input);
    expect((a as Record<string, unknown>).contentHash).toBeTypeOf('string');
    expect((a as Record<string, unknown>).contentHash).toBe((b as Record<string, unknown>).contentHash);
  });

  it('a one-field payload mutation → different contentHash', async () => {
    const a = await render({ rows: ROWS3, chartType: 'bar', encodings: CARTESIAN_ENCODINGS });
    const mutated = [{ ...ROWS3[0], revenue: 999 }, ...ROWS3.slice(1)];
    const b = await render({ rows: mutated, chartType: 'bar', encodings: CARTESIAN_ENCODINGS });
    expect((a as Record<string, unknown>).contentHash).not.toBe((b as Record<string, unknown>).contentHash);
  });

  it('the error path OMITS contentHash, keeps warnings:[], and still passes the output AJV schema', async () => {
    // An empty encoding field throws VizSpecBuilderError → errorOut (cartesian catch) → OODS-V126.
    const out = await render({ rows: ROWS3, chartType: 'bar', encodings: { x: { field: '' }, y: { field: 'revenue' } } });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V126');
    expect((out as Record<string, unknown>).contentHash).toBeUndefined(); // optional, omitted on error
    expect(out.warnings).toEqual([]);
    expect(validateOutput(out)).toBe(true); // top-level additionalProperties:false → optional-not-required holds
  });
});
