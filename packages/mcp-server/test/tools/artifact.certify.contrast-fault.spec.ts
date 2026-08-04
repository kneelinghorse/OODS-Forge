// s171 m05a — contrast engine-fault degradation on BOTH serving branches, by
// partial-mocking the LOCAL certify-contrast module (sibling to the accuracy-fault
// spec; vi.mock is file-wide, so each fault family gets its own file).
//
// Two catches are exercised through the REAL handler:
//   • the cartesian certified-path catch around evaluateContrastPillar — which
//     deliberately writes NO note (observed here as a fact, not fixed: the catch
//     degrades to 'unchecked' silently, unlike the accuracy catch);
//   • the ECharts categorical-verdict catch around evaluateEChartsCategoricalContrast.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const contrastFault = vi.hoisted(() => ({ armed: true }));

vi.mock('../../src/tools/certify-contrast.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const realPillar = actual.evaluateContrastPillar as (...args: unknown[]) => unknown;
  const realECharts = actual.evaluateEChartsCategoricalContrast as (...args: unknown[]) => unknown;
  return {
    ...actual,
    evaluateContrastPillar: (...args: unknown[]) => {
      if (contrastFault.armed) throw new Error('synthetic contrast-engine fault (s171 m05a)');
      return realPillar(...args);
    },
    evaluateEChartsCategoricalContrast: (...args: unknown[]) => {
      if (contrastFault.armed) throw new Error('synthetic contrast-engine fault (s171 m05a)');
      return realECharts(...args);
    },
  };
});

import { buildVizSpecFromRows, type NormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../../src/lib/ajv.js';
import { handle } from '../../src/tools/artifact.certify.js';

const outputSchema = JSON.parse(
  readFileSync(new URL('../../src/schemas/artifact.certify.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);

const ROWS3 = [
  { region: 'North', quarter: 'Q1', revenue: 100 },
  { region: 'South', quarter: 'Q1', revenue: 120 },
  { region: 'East', quarter: 'Q1', revenue: 90 },
];
const buildSpec = () =>
  buildVizSpecFromRows({
    rows: ROWS3,
    chartType: 'bar',
    encodings: { x: { field: 'region' }, y: { field: 'revenue', aggregate: 'sum' } } as never,
  }).spec;

// The ECharts categorical route, exactly as the main certify spec builds it: a good
// cartesian spec with its mark trait swapped to MarkSankey.
const buildSankeySpec = () => {
  const good = buildSpec();
  return { ...good, marks: [{ ...good.marks[0], trait: 'MarkSankey' }] } as NormalizedVizSpec;
};

describe('artifact.certify — contrast engine fault degrades, never errors', () => {
  it("cartesian certified path: the catch degrades contrast to 'unchecked' and — observed fact, not fixed — writes NO note; verdict stays ok/certified/conformant and AJV-valid", async () => {
    contrastFault.armed = true;
    const out = await handle({ spec: buildSpec() });

    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('certified');
    expect(out.pillars?.contrast).toBe('unchecked');
    // The silent-degradation fact: unlike the accuracy catch, no note is written.
    expect(out.contrastNote).toBeUndefined();
    expect(out.notes ?? []).toEqual([]);
    // The other pillars are untouched, and 'unchecked' passes the rollup (#781 parity).
    expect(out.pillars?.a11yEquivalence).toBe('pass');
    expect(out.pillars?.accuracy).toBe('pass');
    expect(out.conformant).toBe(true);
    expect(validateOutput(out)).toBe(true);
  });

  it("ECharts categorical path: the catch degrades contrast to 'unchecked' on the uncertified route, AJV-valid", async () => {
    contrastFault.armed = true;
    const out = await handle({ spec: buildSankeySpec() });

    expect(out.status).toBe('ok');
    expect(out.coverage).toBe('uncertified');
    expect(out.pillars?.contrast).toBe('unchecked');
    expect(out.contrastNote).toBeUndefined();
    expect(validateOutput(out)).toBe(true);
  });

  it("disarmed control — both routes grade contrast:'pass' through the same import graph (the forced throw is the only difference)", async () => {
    contrastFault.armed = false;
    try {
      const cartesian = await handle({ spec: buildSpec() });
      expect(cartesian.pillars?.contrast).toBe('pass');
      expect(cartesian.conformant).toBe(true);
      expect(validateOutput(cartesian)).toBe(true);

      const echarts = await handle({ spec: buildSankeySpec() });
      expect(echarts.pillars?.contrast).toBe('pass');
      expect(validateOutput(echarts)).toBe(true);
    } finally {
      contrastFault.armed = true;
    }
  });
});
