// s174 m01 — the EXACT a11y-equivalence finding set certify emits per ECharts-primary type
// when the `data` operand is supplied.
//
// These are the replacement assertions for the two DECLARED movers of the sprint:
// echarts-determinism.spec.ts's and echarts-accuracy.spec.ts's `findings).toEqual([])`. Both
// were true only because the engine never ran on this path; warn-first makes findings
// non-empty, so the locks are TIGHTENED (exact sets, in rule order) rather than loosened to
// a shape check.
//
// Every entry is derived from the 16×8 applicability matrix (pinned in viz-core's own suite,
// a11y-equivalence-applicability-s174.spec.ts) plus the fixture's own content, and the reason
// each rule fires is named below — this is the "enumerate the warn families so the build reads
// them as designed, not as regression" clause of the charter.
//
//   A11Y-R-14 (warn)  fires on ALL EIGHT: the operand-built table has more than 2 columns and
//                     an ECharts-primary IR carries no `portability.tableColumnOrder`, so
//                     deterministic column ordering is undeclared. This is the warn-first
//                     rollout's headline finding and it is CORRECT — enforcement will require
//                     that ordering to be declared.
//   A11Y-R-09 (error) fires on an UNNAMED IR (no a11y.ariaLabel and no name). viz.render's own
//                     normalizedSpec carries the caller's name, so it does not fire there; the
//                     hand-authored terse fixture has no name, so it does.
//   A11Y-R-08 (error) fires when a11y.description is under 25 characters. The terse fixture's
//                     `${chartType} of test data.` clears 25 only for force_graph (25 exactly),
//                     which is why force_graph is the one type missing R-08 below.
//
// Nothing else fires on either shape: the remaining 13 rules are either satisfied by the
// operand-built table/narrative or NOT-APPLICABLE with their absent precondition named (the
// cartesian-only encoding rules, the mark-shaped narrative rules, the row-count rules).

import type { EChartsPrimaryType } from '../../src/tools/echarts-primary.js';

export interface ExpectedA11yFinding {
  readonly code: string;
  readonly severity: 'error' | 'warn';
}

const R08: ExpectedA11yFinding = { code: 'OODS-A11Y-A11Y-R-08', severity: 'error' };
const R09: ExpectedA11yFinding = { code: 'OODS-A11Y-A11Y-R-09', severity: 'error' };
const R14: ExpectedA11yFinding = { code: 'OODS-A11Y-A11Y-R-14', severity: 'warn' };

/**
 * The IR viz.render emits as `normalizedSpec` for these fixtures: it carries the caller's
 * `name` and a generated description well over 25 characters, so only the column-ordering
 * warn fires. This is the shape the determinism + accuracy specs certify.
 */
export const RENDERED_IR_A11Y_FINDINGS: Readonly<Record<EChartsPrimaryType, readonly ExpectedA11yFinding[]>> = {
  treemap: [R14],
  sunburst: [R14],
  sankey: [R14],
  chord: [R14],
  force_graph: [R14],
  choropleth: [R14],
  bubble_map: [R14],
  flow_map: [R14],
};

/**
 * The hand-authored terse IR (`echartsPrimaryIr`): no name, a sub-25-character description
 * for seven of the eight types. Both error-severity rules fire here, which is what proves the
 * findings really do carry their NATIVE severity rather than a forced warn.
 */
export const TERSE_IR_A11Y_FINDINGS: Readonly<Record<EChartsPrimaryType, readonly ExpectedA11yFinding[]>> = {
  treemap: [R08, R09, R14],
  sunburst: [R08, R09, R14],
  sankey: [R08, R09, R14],
  chord: [R08, R09, R14],
  // 'force_graph of test data.' is exactly 25 characters — R-08's threshold is >= 25.
  force_graph: [R09, R14],
  choropleth: [R08, R09, R14],
  bubble_map: [R08, R09, R14],
  flow_map: [R08, R09, R14],
};

/** Findings[] entries the a11y engine produced, in emission order. */
export function a11yFindingsOf(
  findings: ReadonlyArray<{ code: string; severity: string }> | undefined,
): ExpectedA11yFinding[] {
  return (findings ?? [])
    .filter((finding) => finding.code.startsWith('OODS-A11Y-'))
    .map((finding) => ({ code: finding.code, severity: finding.severity as 'error' | 'warn' }));
}
