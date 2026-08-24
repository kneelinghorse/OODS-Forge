// s176 m01 — THE ECHARTS CAVEAT BYTE-IDENTITY PIN (memo §1a D11; landed WITH the D9
// baseline rebase, BEFORE any s176 source edit).
//
// m01 forks the contrast caveat: the cartesian path's caveat sentence becomes
// render-backed, while the ECharts paths keep their own constant, byte-identical to the
// pre-fork text, until the parked ECharts render-grading rung (memo §3). The fork is the
// risky part — the pre-fork RENDERED_CONTRAST_CAVEAT is appended at six-plus sites inside
// gradeCategorical, which the ECharts path SHARES with the cartesian path (risk register
// §5a.2: a partial fork moves ECharts bytes mid-build). This pin freezes the two
// reachable ECharts contrastNote surfaces as LITERALS — deliberately not imports of the
// source constants, which would make the pin tautological — so any leak of the cartesian
// reword onto the ECharts path reds here at the unit level, before the handler-level
// spec-only-bytes control even runs.
//
// The frozen text intentionally retains pre-s176 wording ("categorical color bytes Forge
// baked into the compiled spec"; the categorical caveat's "cardinality-sliced" phrase):
// under the D11 fork that wording stays true FOR THE ECHARTS PATH (reconstruction-graded
// from baked constants) and is only retired when the ECharts rung itself lands.

import { describe, expect, it } from 'vitest';
import {
  ECHARTS_GEO_EXEMPT_NOTE,
  evaluateEChartsCategoricalContrast,
} from '../../src/tools/certify-contrast.js';

// The pre-fork shared caveat, byte-for-byte as of pristine 4f64bcf. After the fork this
// exact text must keep ending every ECharts contrastNote, whatever the cartesian caveat
// becomes.
const FROZEN_ECHARTS_CAVEAT =
  'certify measures the categorical color bytes Forge baked into the compiled spec, ' +
  'on the light theme; dark-theme contrast is not verified.';

// evaluateEChartsCategoricalContrast's clean-pass contrastNote at 4f64bcf: the shared
// grader's clean-pass note (the caveat alone) + ' ' + ECHARTS_CATEGORICAL_CAVEAT.
const FROZEN_ECHARTS_CATEGORICAL_NOTE =
  FROZEN_ECHARTS_CAVEAT +
  ' ' +
  'This grades the fixed OODS categorical palette the ECharts adapter bakes into itemStyle ' +
  '(reconstructed from the shared viz-scale tokens; data-independent, so the verdict is a ' +
  'per-palette constant — a weaker claim than a cartesian, cardinality-sliced verdict). ' +
  'touching-mark/adjacency contrast not graded; relies on the separating stroke. ' +
  'Per-node data-color overrides are ungraded — the grade reflects the default baked palette.';

// ECHARTS_GEO_EXEMPT_NOTE at 4f64bcf, in full — it ends with the frozen caveat.
const FROZEN_ECHARTS_GEO_EXEMPT_NOTE =
  'Geo color renders as a sequential/continuous scale (choropleth visualMap ramp, ' +
  'flow_map single-hue line, bubble_map visualMap) — WCAG 1.4.11 gradient essential ' +
  'exception, so there is no discrete categorical palette to contrast-check; ' +
  "Forge's generated accessible data table is the guarantee. An author-supplied " +
  'ordinal-categorical bubble_map color is still NOT graded, and as of s172 the reason ' +
  'is the s141 exempt-all-geo RULING rather than invisibility: certify can now see the ' +
  'geo data branch (the optional `data` operand), so that colorField and the colorScale ' +
  'it renders on are reachable — grading them would be a new scope decision, not a bug ' +
  'fix. The palette itself stays out of reach either way: the branch has no range field, ' +
  "so an ordinal bubble_map paints from Forge's own categorical list, cycling it when the " +
  'categories outnumber it. ' +
  FROZEN_ECHARTS_CAVEAT;

describe('certify-contrast — the ECharts caveat constants are byte-frozen (s176 D11 fork pin)', () => {
  it('the ECharts categorical contrastNote is byte-identical to the pre-fork text', () => {
    const out = evaluateEChartsCategoricalContrast();
    expect(out.contrast).toBe('pass');
    expect(out.contrastNote).toBe(FROZEN_ECHARTS_CATEGORICAL_NOTE);
  });

  it('ECHARTS_GEO_EXEMPT_NOTE is byte-identical to the pre-fork text', () => {
    expect(ECHARTS_GEO_EXEMPT_NOTE).toBe(FROZEN_ECHARTS_GEO_EXEMPT_NOTE);
  });
});
