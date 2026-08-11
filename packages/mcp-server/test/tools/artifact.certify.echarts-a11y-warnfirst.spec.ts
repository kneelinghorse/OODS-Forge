// s174 m01 — THE SHIPPED PROMISE, end to end.
//
// Forge's own schema prose has promised, by name, a warn-first a11y-equivalence rollout for
// the 8 ECharts-primary types. This file is the proof that it landed on the path an agent
// actually calls, rather than only in the engine (viz-core's own suite pins the 16×8
// applicability matrix; that is the ENGINE's proof and it aliases to src, so it discriminates
// without the dist trap).
//
// The four properties that make this WARN-FIRST rather than a verdict migration, each
// asserted below rather than described:
//   1. Findings appear ONLY with the `data` operand (the positive precondition). A {spec}-only
//      call is unchanged and its note says why.
//   2. Findings carry their NATIVE severity — an error-severity rule reports 'error'. The
//      output schema promises exactly that ("not remapped"); s134's forced-'warning' remap is
//      deliberately not repeated.
//   3. pillars.a11yEquivalence stays 'unchecked' on every path. No enum moved, no verdict
//      flipped, conformant stays null; nothing blocks.
//   4. The table + narrative the engine judges are the SAME ones viz.render derives for the
//      same (spec, data) pair — the shared-builder property, proven by cross-tool comparison.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVizSpecFromRows, type NormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../../src/lib/ajv.js';
import { handle as certify } from '../../src/tools/artifact.certify.js';
import { handle as vizRender } from '../../src/tools/viz.render.js';
import { buildEChartsA11yContext } from '../../src/tools/echarts-a11y-analysis.js';
import type { EChartsPrimaryType } from '../../src/tools/echarts-primary.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from './s172-echarts-operands.js';
import { echartsPrimaryIr } from './s172-spec-only-cases.js';
import {
  a11yFindingsOf,
  RENDERED_IR_A11Y_FINDINGS,
  TERSE_IR_A11Y_FINDINGS,
} from './s174-a11y-warnfirst-expectations.js';

const outputSchema = JSON.parse(
  readFileSync(new URL('../../src/schemas/artifact.certify.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);

const CASES = ECHARTS_OPERAND_CASES.map((c) => [c.chartType, c] as const);

describe('artifact.certify — a11y-equivalence WARN-FIRST on the ECharts-primary path (s174 m01)', () => {
  it.each(CASES)(
    '%s: WITH the operand, findings[] carries exactly the matrix-derived a11y set at native severity',
    async (chartType, operand) => {
      const rendered = await vizRender(renderInputFor(operand) as never);
      const out = await certify({
        spec: rendered.normalizedSpec as unknown as NormalizedVizSpec,
        data: { [operand.branch]: operand.branchData } as never,
      });
      expect(out.status).toBe('ok');
      expect(a11yFindingsOf(out.findings)).toEqual(RENDERED_IR_A11Y_FINDINGS[chartType as EChartsPrimaryType]);
      expect(validateOutput(out)).toBe(true);
    },
  );

  it.each(CASES)(
    '%s: the PILLAR does not move — a11yEquivalence stays unchecked, conformant stays null, coverage stays uncertified',
    async (_chartType, operand) => {
      const rendered = await vizRender(renderInputFor(operand) as never);
      const out = await certify({
        spec: rendered.normalizedSpec as unknown as NormalizedVizSpec,
        data: { [operand.branch]: operand.branchData } as never,
      });
      // The findings really are there — otherwise "the pillar did not move" would be a claim
      // about a path that never ran.
      expect(a11yFindingsOf(out.findings).length).toBeGreaterThan(0);
      expect(out.pillars?.a11yEquivalence).toBe('unchecked');
      expect(out.conformant).toBeNull();
      expect(out.coverage).toBe('uncertified');
    },
  );

  it.each(CASES)(
    '%s: WITHOUT the operand there are NO a11y findings at all — the gate is the operand, not the chart type',
    async (_chartType, operand) => {
      const rendered = await vizRender(renderInputFor(operand) as never);
      const out = await certify({ spec: rendered.normalizedSpec as unknown as NormalizedVizSpec });
      expect(a11yFindingsOf(out.findings)).toEqual([]);
      expect(out.pillars?.a11yEquivalence).toBe('unchecked');
    },
  );

  it.each(CASES)('%s: the note NAMES the operand gate and no longer promises a future rollout', async (_c, operand) => {
    const out = await certify({ spec: echartsPrimaryIr(operand.trait, operand.chartType) });
    const note = (out.notes ?? []).find((n) => n.includes('A11y-equivalence runs WARN-FIRST here'));
    expect(note).toBeDefined();
    expect(note).toContain('when the `data` operand is supplied');
    expect(note).toContain('Without the operand there is nothing to evaluate');
    expect(note).toContain("pillars.a11yEquivalence stays 'unchecked' in both cases");
    // The deferral wording is GONE, not merely joined by the new sentence.
    expect(note).not.toContain('deferred to a warn-first rollout');
    expect(note).not.toContain('no per-rule not-applicable state');
    // And nothing in it carries a sprint number (rule candidate C).
    expect(note).not.toMatch(/s1\d\d/);
  });
});

describe('artifact.certify — NATIVE severity, no remap (s174 m01)', () => {
  it.each(CASES)(
    '%s: a terse unnamed IR surfaces ERROR-severity a11y findings and STILL does not block',
    async (chartType, operand) => {
      const out = await certify({
        spec: echartsPrimaryIr(operand.trait, operand.chartType),
        data: { [operand.branch]: operand.branchData } as never,
      });
      expect(a11yFindingsOf(out.findings)).toEqual(TERSE_IR_A11Y_FINDINGS[chartType as EChartsPrimaryType]);
      // R-09 (unnamed IR) is an error-severity rule and reports as one — the s134 forced
      // 'warning' remap is NOT repeated here, and the output schema's "not remapped" sentence
      // stays true.
      expect(out.findings?.find((f) => f.code === 'OODS-A11Y-A11Y-R-09')?.severity).toBe('error');
      // Warn-first: an error-severity finding blocks nothing.
      expect(out.status).toBe('ok');
      expect(out.pillars?.a11yEquivalence).toBe('unchecked');
      expect(out.conformant).toBeNull();
      expect(validateOutput(out)).toBe(true);
    },
  );

  it('both severities really do occur — the set is not silently uniform', async () => {
    const operand = ECHARTS_OPERAND_CASES.find((c) => c.chartType === 'treemap')!;
    const out = await certify({
      spec: echartsPrimaryIr(operand.trait, operand.chartType),
      data: { [operand.branch]: operand.branchData } as never,
    });
    const severities = new Set(a11yFindingsOf(out.findings).map((f) => f.severity));
    expect(severities).toEqual(new Set(['error', 'warn']));
  });
});

describe('artifact.certify — the operand-built context is viz.render’s, not a transcription (s174 m01)', () => {
  // STANDING RULE B: the lift's risk is the two CALLERS disagreeing about the argument, not
  // the function body. viz.render projects the shared builder's table + narrative onto its
  // wire a11y; certify hands the same context to the engine. If they ever diverge, the engine
  // would be judging a table no agent was ever shown.
  it.each(CASES)('%s: certify’s table + narrative equal the ones viz.render emits for the same (spec, data)', async (_c, operand) => {
    const rendered = await vizRender({
      ...renderInputFor(operand),
      output: { echarts: true, includeNormalizedSpec: true, includeA11y: true },
    } as never);
    const ir = rendered.normalizedSpec as unknown as NormalizedVizSpec;
    const context = buildEChartsA11yContext(ir, operand.chartType as EChartsPrimaryType, operand.branchData);

    expect(rendered.a11y).toBeDefined();
    expect(rendered.a11y?.narrative.summary).toBe(context.narrative.summary);
    expect([...(rendered.a11y?.narrative.keyFindings ?? [])]).toEqual([...context.narrative.keyFindings]);
    if (context.table.status === 'ready') {
      expect(rendered.a11y?.table?.caption).toBe(context.table.caption);
      expect(rendered.a11y?.table?.columns.map((c) => c.field)).toEqual(
        context.table.columns.map((c) => c.field),
      );
      expect(rendered.a11y?.table?.rows.length).toBe(context.table.rows.length);
    } else {
      expect(rendered.a11y?.table).toBeUndefined();
    }
  });
});

describe('artifact.certify — warn-first is a READER (s174 m01)', () => {
  it('the a11y findings do not disturb the determinism proof or the accuracy count', async () => {
    const operand = ECHARTS_OPERAND_CASES.find((c) => c.chartType === 'sankey')!;
    const rendered = await vizRender(renderInputFor(operand) as never);
    const out = await certify({
      spec: rendered.normalizedSpec as unknown as NormalizedVizSpec,
      data: { sankey: operand.branchData } as never,
    });
    expect(a11yFindingsOf(out.findings).length).toBeGreaterThan(0);
    expect(out.determinism?.contentHash).toBe(rendered.contentHash);
    expect(out.pillars?.determinism).toBe('pass');
    // accuracySummary.failing counts ACCURACY failures only — the a11y family must not leak
    // into it.
    expect(out.accuracySummary?.failing).toBe(0);
  });

  it('the CARTESIAN path is untouched: a11yEquivalence still carries a real pass/fail verdict there', async () => {
    const spec = buildVizSpecFromRows({
      rows: [
        { region: 'North', revenue: 100 },
        { region: 'South', revenue: 120 },
      ],
      chartType: 'bar',
      encodings: { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' } } as never,
    }).spec;
    const out = await certify({ spec });
    expect(out.coverage).toBe('certified');
    expect(out.pillars?.a11yEquivalence).toBe('pass');
    expect(a11yFindingsOf(out.findings)).toEqual([]);
  });
});
