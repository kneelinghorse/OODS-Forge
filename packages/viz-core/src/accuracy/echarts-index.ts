// Sprint-172 m03 — the ECharts-side accuracy engine (#818's fourth #977 pillar, widened
// from the 5 cartesian types to all 13).
//
// PUBLIC SURFACE: `ECHARTS_ACCURACY_RULES`, `echartsAccuracyRulesFor`,
// `evaluateEChartsAccuracyRules`, and the types. Everything else in this directory stays
// module-internal and reachable only by relative path, so a discriminating check can
// compose a mutant from the REAL predicates instead of transcribing them (the s170 pattern).
//
// THE SCOPE CHAIN, restated because the cartesian engine's own ratification comment says
// the four rules are "each decidable from the IR + the compiled spec alone. Adding a fifth
// is a scope decision, not a code change." That is still true OF THAT SET. s172 did not add
// a fifth cartesian rule: Derek's ratified s172 pillar fork IS the scope decision, and it
// widened the PREMISE — from "the IR + the compiled spec" to "the IR + the per-type
// operand". These six rules are decidable from the data BRANCH, which no cartesian rule can
// see and which is the only place an ECharts-primary chart's data exists.
//
// PER-TYPE OFFERED SETS, and the empty ones. Three of the eight types offer NO rule, and
// that is a finding rather than a gap:
//   - force_graph: its distortion candidates (node sizing, edge curvature, layout
//     repulsion) are ADAPTER CONSTANTS, not authoring choices. There is nothing in the
//     branch a caller could get wrong that the option would then misdraw.
//   - bubble_map / flow_map: the branch expresses field NAMES, not scales — the distortion
//     a size or width encoding could carry is not authorable through it.
// For those three, `rulesEvaluated` is 0 and a note names the empty set, so an agent can
// tell "we looked and offered nothing" apart from "we did not look".

import type { EChartsAccuracyFinding, EChartsAccuracyResult } from './echarts-types.js';
import {
  evaluateHierarchyNegativeValue,
  evaluateHierarchyNonAdditiveParent,
} from './echarts-hierarchy-rules.js';
import {
  evaluateFlowNegativeLinkValue,
  evaluateSankeyDuplicateLink,
  evaluateSankeyNodeValueOverride,
} from './echarts-flow-rules.js';
import { evaluateChoroplethJoinConflict } from './echarts-geo-rules.js';
import type {
  EChartsAccuracyChartType,
  EChartsAccuracyOperand,
  EChartsAccuracyRule,
} from './echarts-types.js';

export type {
  EChartsAccuracyChartType,
  EChartsAccuracyFinding,
  EChartsAccuracyOperand,
  EChartsAccuracyResult,
  EChartsAccuracyRule,
  EChartsAccuracyRuleId,
} from './echarts-types.js';
export { ACCURACY_RELATIVE_EPSILON, differsBeyondTolerance } from './echarts-types.js';

const V154: EChartsAccuracyRule = {
  id: 'hierarchy-negative-value',
  code: 'OODS-V154',
  summary:
    'Every treemap/sunburst node value is a finite non-negative number, so area and angle can encode it. Unauthored values never fire — a renderer-computed parent has nothing to contradict.',
  evaluate: evaluateHierarchyNegativeValue,
};

const V155: EChartsAccuracyRule = {
  id: 'hierarchy-non-additive-parent',
  code: 'OODS-V155',
  summary:
    'An EXPLICIT treemap/sunburst parent value equals the sum of its children, under a relative 1e-9 tolerance. Fires only where the parent has an authored value AND every child has one — a partly-valueless set has no computable sum and is reported unevaluated, never guessed.',
  evaluate: evaluateHierarchyNonAdditiveParent,
};

const V156: EChartsAccuracyRule = {
  id: 'flow-negative-link-value',
  code: 'OODS-V156',
  summary:
    'Every sankey/chord link value is a finite non-negative number, so ribbon width can encode it. sankey rejects non-finite upstream (V126) but not negatives; chord validates neither.',
  evaluate: evaluateFlowNegativeLinkValue,
};

const V157: EChartsAccuracyRule = {
  id: 'sankey-node-value-override',
  code: 'OODS-V157',
  summary:
    "A sankey node's drawn height is the flow its ribbons carry. Two causes: an explicit node.value that disagrees with max(incoming, outgoing), and an INTERMEDIATE node (incoming>0 AND outgoing>0) whose sides disagree. Sources and sinks are endpoints and never fire; both comparisons use the relative 1e-9 tolerance.",
  evaluate: evaluateSankeyNodeValueOverride,
};

const V158: EChartsAccuracyRule = {
  id: 'sankey-duplicate-link',
  code: 'OODS-V158',
  summary:
    'A directed (source, target) pair appears at most once in a sankey. Duplicates stack into one merged ribbon whose width is their sum. A deliberate certify-side reopen of the s148 F4 sankey exclusion — render is untouched — and error-severity, unlike F4\'s warning.',
  evaluate: evaluateSankeyDuplicateLink,
};

const V159: EChartsAccuracyRule = {
  id: 'choropleth-join-conflict',
  code: 'OODS-V159',
  summary:
    'Where a choropleth join matches several rows to one region, those rows agree on the joined value. Benign multiplicity (agreeing or duplicate rows) NEVER fires — one-to-many is supported; only CONFLICTING values fire, because then the shade is last-record-wins arbitrary.',
  evaluate: evaluateChoroplethJoinConflict,
};

/** All six, in code order. The registry is the commitment not to rename or reassign them. */
export const ECHARTS_ACCURACY_RULES: readonly EChartsAccuracyRule[] = [V154, V155, V156, V157, V158, V159];

/**
 * The rules OFFERED for a chart type. Explicit and exhaustive: an empty set is a stated
 * position (see the header), not a fall-through.
 */
const OFFERED: Readonly<Record<EChartsAccuracyChartType, readonly EChartsAccuracyRule[]>> = {
  treemap: [V154, V155],
  sunburst: [V154, V155],
  sankey: [V156, V157, V158],
  chord: [V156],
  force_graph: [],
  choropleth: [V159],
  bubble_map: [],
  flow_map: [],
};

export function echartsAccuracyRulesFor(chartType: EChartsAccuracyChartType): readonly EChartsAccuracyRule[] {
  return OFFERED[chartType] ?? [];
}

/**
 * The note that ships when a type offers no rule at all. Names the empty set explicitly so
 * `rulesEvaluated: 0` reads as "nothing was offered" rather than "nothing resolved".
 */
export function emptyOfferedSetNote(chartType: EChartsAccuracyChartType): string {
  const reason =
    chartType === 'force_graph'
      ? 'its distortion candidates (node sizing, edge curvature, layout repulsion) are adapter constants rather than authoring choices, so there is nothing in the data branch a caller could get wrong'
      : 'the geo data branch expresses field names rather than scales, so the distortions a size or width encoding could carry are not authorable through it';
  return `No accuracy rule is offered for ${chartType}: ${reason}. rulesEvaluated is 0 because the offered set is empty, not because a rule failed to resolve its operand.`;
}

/**
 * Evaluate the ECharts-side accuracy rules for one (spec, data) operand.
 *
 * `rulesEvaluated` counts the rules from THIS TYPE'S offered set that resolved their operand
 * and ran — the same meaning it carries on the cartesian side. A rule that could not resolve
 * reports itself unevaluated and contributes a note, so silence can never be read as
 * coverage (standing rule 1).
 *
 * `rules` is injectable so a mutation gate can swap ONE rule out and prove exactly its own
 * RED stops firing — the guard ships its own bite proof. Production callers pass nothing.
 */
export function evaluateEChartsAccuracyRules(
  operand: EChartsAccuracyOperand,
  rules: readonly EChartsAccuracyRule[] = echartsAccuracyRulesFor(operand.chartType),
): EChartsAccuracyResult {
  const findings: EChartsAccuracyFinding[] = [];
  const notes: string[] = [];
  let rulesEvaluated = 0;

  if (rules.length === 0) {
    return { findings, rulesEvaluated: 0, notes: [emptyOfferedSetNote(operand.chartType)] };
  }

  for (const rule of rules) {
    const outcome = rule.evaluate(operand);
    if (outcome.evaluated) {
      rulesEvaluated += 1;
    }
    if (outcome.message) {
      findings.push({ ruleId: rule.id, code: rule.code, message: outcome.message });
    }
    if (outcome.note && !notes.includes(outcome.note)) {
      notes.push(outcome.note);
    }
  }

  return { findings, rulesEvaluated, notes };
}
