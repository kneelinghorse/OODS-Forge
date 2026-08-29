// artifact.certify — the "certify" half of generate-AND-certify (sprint-136 m02).
//
// An agent hands in a Forge NormalizedVizSpec IR and gets back a conformance
// verdict + a re-emit determinism proof + a contentHash. certify is a READER of
// the IR: it never rebuilds, re-recommends, or re-encodes (#110). It reuses the
// exact same equivalence engine (validateVizEquivalenceRules) and determinism
// transform (toVegaLiteSpec -> canonicalize -> sha256) that viz.render runs, so
// for a Forge-generated IR certify's contentHash equals the hash viz.render emits.
// As of s176 m02 the cartesian determinism pillar carries a RENDER half too:
// double-render byte-equality through @oods/viz-render (renderHash), reusing the
// contrast grade's render as the first hash — so `stable` is falsifiable, not a
// compile tautology.
//
// Coverage-honest: the 8 ECharts-primary types (treemap/sunburst/sankey/... — classified
// from the IR's first mark trait) return coverage:'uncertified' / conformant:null, a
// DISTINCT verdict, not a failure. That is a statement about the FOLDED GATE, not about
// what was checked. Three of the four pillars carry real verdicts on that path:
// contrast since s141, and — as of s172, whenever the caller supplies the optional `data`
// operand — determinism and accuracy too (certify re-emits the ECharts option through the
// same adapters viz.render uses, and evaluates a per-type accuracy set over the operand).
// a11y-equivalence runs WARN-FIRST on that path as of s174: with the operand the 16 rules
// evaluate over the operand-built table + narrative and every failure reaches findings[] at
// its native severity, while the PILLAR stays 'unchecked' — findings first, verdict later.
// Contrast is a graded pillar (s137/s138/s139; render-backed since s176):
// on the cartesian path certify RENDERS the compiled spec through @oods/viz-render and
// grades the series-to-paint assignment the data marks actually carry (duplicates
// retained, so a recycled palette is a ΔE00=0 role-A fail), against the canvas — while
// unit classification (series vs exempt vs chrome) still reads the compiled bytes, so a
// chart that baked no OODS palette can never certify contrast:'pass'. On the ECharts
// path, an operand makes contrast render-measured from the retained projected option;
// the no-operand path preserves its legacy reconstruction grade because no chart data
// exists to render. Both render paths are deterministic under their recorded contracts.
//
// Accuracy is a graded pillar too as of s170 (#818 — the fourth #977 pillar), widened to all
// 13 types in s172. On the CERTIFIED path certify evaluates FOUR declared structural rules
// (non-zero bar baseline, dual axis, area-encodes-linear, aggregation-hiding) over the IR
// and the compiled spec it already produced. On the ECHARTS path it evaluates a per-type set
// (OODS-V154..V159) over the `data` operand — the only place those charts' data exists. No
// scorer, no corpus, no render step — #110 holds on both: the rules read, they never rebuild.
// `accuracy:'pass'` means none of the rules OFFERED FOR THAT CHART TYPE was positively
// detected, with accuracySummary.rulesEvaluated reporting how many actually resolved their
// operand; it is not a claim that the chart is accurate. On the ECharts path 'pass'
// additionally requires rulesEvaluated > 0.

import { canonicalize, sha256 } from '@oods/artifacts';
import {
  renderEChartsToSvg,
  renderVegaLiteToSvg,
  type VegaLiteSpec,
} from '@oods/viz-render';
import {
  ACCURACY_RULES,
  assertNormalizedVizSpec,
  echartsAccuracyRulesFor,
  evaluateAccuracyRules,
  evaluateEChartsAccuracyRules,
  toVegaLiteSpec,
  validateVizEquivalenceRules,
  validateVizEquivalenceRulesForContext,
  type NormalizedVizSpec,
} from '@oods/viz-core';
import { isEChartsPrimaryMarkTrait } from './echarts-primary.js';
import { buildEChartsA11yContext } from './echarts-a11y-analysis.js';
import {
  ECHARTS_GEO_EXEMPT_NOTE,
  evaluateContrastPillar,
  evaluateEChartsCategoricalContrast,
  type ContrastVerdict,
} from './certify-contrast.js';
import {
  resolveCertifyOperand,
  type CertifyDataBranch,
  type CertifyOperandResolved,
} from './certify-operand.js';
import {
  evaluateEChartsDeterminism,
  operandAbsentDeterminismNote,
  type EChartsDeterminismResult,
} from './certify-echarts-emit.js';
import { evaluateEChartsRenderContrast } from './certify-echarts-render-contrast.js';

export interface ArtifactCertifyInput {
  /** A Forge NormalizedVizSpec IR (validated authoritatively by assertNormalizedVizSpec). */
  readonly spec: unknown;
  /**
   * OPTIONAL operand for the 8 ECharts-primary types (s172 m01) — the same data branch
   * viz.render takes. Exactly one branch, matching the branch the IR's mark trait requires.
   * NOT an affordance: an ECharts-primary IR is metadata-only, so this IS the operand the
   * determinism + accuracy pillars read. Omitting it is always valid.
   */
  readonly data?: CertifyDataBranch;
}

export interface CertifyFinding {
  /** OODS-A11Y-<rule.id> — the per-rule equivalence code (e.g. OODS-A11Y-A11Y-R-12). */
  readonly code: string;
  readonly severity: 'error' | 'warn';
  readonly message: string;
}

export interface CertifyDeterminism {
  readonly stable: boolean;
  readonly contentHash: string;
  /**
   * OPTIONAL — sha256 of the first normalized SVG rendered for grading. Present exactly
   * when that render completed: on the cartesian rendered-grading path and on renderable,
   * operand-backed ECharts-primary calls; absent from ECharts spec-only calls, option-only
   * bubble maps, and failed first renders. `stable` additionally requires a second,
   * independent render to hash identically whenever renderHash is present.
   */
  readonly renderHash?: string;
}

/**
 * The accuracy pillar's verdict (s170 #818; 'ungradeable' added s175 m04, #781).
 * 'ungradeable' = grading was ATTEMPTED on the rule set it was given and failed for a
 * reason outside the spec (an evaluator fault); 'unchecked' = nothing was attempted or
 * nothing was gradeable (no operand, or every offered rule's precondition absent).
 */
export type AccuracyVerdict = 'pass' | 'fail' | 'ungradeable' | 'unchecked';

/**
 * Per-pillar summary (s137, extended s170, s172 and s175). The pillars DISAGGREGATE which
 * pillar drove the folded `conformant` gate (s140 [B]) — and on the uncertified path, where
 * there is no folded gate at all, they are the ONLY place the real verdicts live.
 * a11yEquivalence mirrors the a11y-equivalence sub-result (NOT the folded conformant);
 * determinism mirrors `determinism.stable`; contrast is the rendered-reality verdict — the
 * series-to-paint assignment of a rendered cartesian or operand-backed ECharts chart — with
 * 'exempt' for gradient scales. A no-operand ECharts call retains the legacy reconstruction
 * grade because its metadata-only IR has no chart data; accuracy is the structural-rules
 * verdict. So a reader can always see WHY
 * conformant is false, and can always see what actually ran when it is null.
 *
 * contrast and accuracy tell "tried and failed" apart from "nothing to grade" IN THE VALUE
 * (s175 m04, #781): 'ungradeable' means grading was attempted on a unit or rule set the
 * pillar was given and failed for a reason outside the spec — an unresolvable canvas
 * token, or an evaluator fault — and it pulls the folded conformant false exactly as
 * 'fail' does; 'unchecked' means nothing was attempted or nothing was gradeable — no
 * colour-bearing unit, no operand, or every offered rule's precondition absent — and it
 * leaves conformant a11y-driven (the s139 lock, decisions #1040/#1042 [B]).
 */
export interface CertifyPillars {
  readonly a11yEquivalence: 'pass' | 'fail' | 'unchecked';
  readonly determinism: 'pass' | 'fail' | 'unchecked';
  readonly contrast: ContrastVerdict;
  /**
   * The structural accuracy verdict (s170 #818, widened to all 13 types in s172): the four
   * cartesian rules over the compiled spec, or the per-type ECharts set over the `data`
   * operand. Its own enum (no 'exempt'); contrast's five-state one is separate.
   */
  readonly accuracy: AccuracyVerdict;
}

/**
 * How the accuracy pillar was reached (s170; also emitted on the ECharts path from s172
 * whenever the operand is present). `rulesEvaluated` is the examined-count the contrast
 * pillar never shipped (#1412): a rule whose operand certify could not resolve is NOT
 * counted and explains itself in notes[], so `accuracy:'pass'` can never be read as "every
 * offered rule ran" when it did not. Its ABSENCE is meaningful too — on an ECharts verdict
 * it is the device that separates "no operand was supplied" from "the operand was supplied
 * and nothing was offered or resolved" (which reports 0/0 plus a note saying which).
 */
export interface CertifyAccuracySummary {
  readonly rulesEvaluated: number;
  readonly failing: number;
}

/** One not-applicable a11y-equivalence result (s175 m03): the rule, and the precondition it lacked. */
export interface CertifyA11yNotApplicable {
  readonly rule: string;
  readonly preconditionAbsent: string;
}

export interface ArtifactCertifyOutput {
  readonly status: 'ok' | 'error';
  readonly coverage?: 'certified' | 'uncertified';
  /**
   * The folded conformance gate (s140 [B], extended s170), CARTESIAN PATH ONLY: true iff
   * a11y-equivalence has zero error-severity failures AND contrast is not 'fail' AND accuracy
   * is not 'fail' AND determinism is stable — measured on the light theme (dark-theme contrast
   * unverified). null on the uncertified path, and it STAYS null there even when an ECharts
   * accuracy rule fires (s172): that path makes no folded claim, so the failure is read from
   * pillars.accuracy and findings[]. Absent on error.
   */
  readonly conformant?: boolean | null;
  /**
   * One entry per failing rule. As of s172 this carries THREE families, told apart by code —
   * a11y-equivalence (OODS-A11Y-<rule.id>), cartesian accuracy (OODS-V150..V153) and
   * ECharts-primary accuracy (OODS-V154..V159). It is no longer a11y-equivalence-only, and
   * no longer empty on the uncertified path.
   */
  readonly findings?: CertifyFinding[];
  /**
   * s175 m03 — the not-applicable a11y-equivalence results, in rule order, each naming the
   * absent precondition. Present (as [] if none) EXACTLY when the warn-first engine ran to
   * completion — the ECharts-primary path with the `data` operand. Absent on the {spec}-only
   * path, on the cartesian path (decision 8: cartesian NA exposure is out of scope), on
   * error, and when the engine faulted (the partial list is discarded; notes[] says so).
   */
  readonly a11yNotApplicable?: CertifyA11yNotApplicable[];
  /**
   * The re-emit proof. Certified path: the Vega-Lite compile. Uncertified path (s172):
   * the ECharts option, present whenever the `data` operand was supplied.
   */
  readonly determinism?: CertifyDeterminism;
  /** Per-pillar tri-state summary (s137, extended s170/s172). Present on both ok paths; absent on error. */
  readonly pillars?: CertifyPillars;
  /** How the accuracy pillar was reached. Present wherever the rules RAN — see the type's doc. */
  readonly accuracySummary?: CertifyAccuracySummary;
  /** Declared-intent caveat / role rationale for the contrast pillar (s137). */
  readonly contrastNote?: string;
  readonly notes?: string[];
  readonly errors?: { readonly code: string; readonly message: string }[];
}

function errorVerdict(code: string, err: unknown): ArtifactCertifyOutput {
  const message = err instanceof Error ? err.message : String(err);
  return { status: 'error', errors: [{ code, message }] };
}

// The cartesian Vega-Lite mark traits certify can compile + equivalence-check — a
// POSITIVE allowlist (review #1004 item 2). Mirrors the vega-lite-adapter MARK_MAP
// (the builder emits exactly these five for bar/line/scatter/area/heatmap). A
// schema-valid IR whose first mark is in NEITHER this set nor the ECharts-primary set
// is coverage:'uncertified' (honest) — never an opaque status:error V127 from a
// failed compile of an unmodeled trait.
const CARTESIAN_VEGA_TRAITS: ReadonlySet<string> = new Set([
  'MarkBar',
  'MarkLine',
  'MarkPoint',
  'MarkArea',
  'MarkRect',
]);

// The builder maps chartType 'heatmap' -> MarkRect, so a Forge heatmap IR already
// carries trait 'MarkRect'. Accept the intuitive 'MarkHeatmap' alias a caller might
// hand-author and normalize it to the canonical MarkRect, so the advertised "heatmap
// certified" claim holds regardless of which name the caller uses (and so it gets the
// same contentHash a Forge-built heatmap round-trips to).
const TRAIT_ALIASES: Readonly<Record<string, string>> = { MarkHeatmap: 'MarkRect' };

// The 5 ECharts-primary categorical types. Operand-backed calls render the retained
// projection and split actual carrier paints (Role C) from the semantic N-long assignment
// (Role A). Metadata-only calls keep the legacy reconstruction grade below.
const ECHARTS_CATEGORICAL_TRAITS: ReadonlySet<string> = new Set([
  'MarkTreemap',
  'MarkSunburst',
  'MarkSankey',
  'MarkGraph',
  'MarkChord',
]);

// The 3 geo ECharts-primary types. Their color renders as a sequential/continuous scale
// (visualMap ramp / single-hue line / bubble visualMap), so WCAG 1.4.11's gradient
// essential exception applies → contrast:'exempt' (s141 m03, role-B).
//
// bubble_map's ordinal-categorical color branch is still NOT graded, and s172 CHANGED THE
// REASON. The s141 rationale had two halves: Derek's exempt-all-geo ruling, and the fact
// that the encoding was invisible to certify (it lives in the geo DATA branch, outside this
// metadata IR). s172 m01 removed the second half — certify takes the geo branch now, so
// `colorField` and `colorScale` are readable. The ruling stands on its own: grading them is
// a fresh scope decision, not a defect to fix. The exempt note says exactly that.
//
// s173 m01 corrects s172's word for it: the RANGE is not reachable on any path. The branch
// carries no range field, so an ordinal bubble_map paints from the adapter's own
// DEFAULT_COLOR_RANGE, cycled by index. What became visible is which field colours the
// bubbles and which scale it renders on.
const ECHARTS_GEO_EXEMPT_TRAITS: ReadonlySet<string> = new Set([
  'MarkChoropleth',
  'MarkFlow',
  'MarkBubble',
]);

// The a11y-equivalence note shared by every ECharts-primary verdict.
//
// s174 m01 — the DEFERRAL IS OVER, so the note stops describing one. The two prior wordings
// (s172 m04's "no per-rule not-applicable state", s173 m01's correction of its false
// "determinism and accuracy ARE checked" clause) both explained why the engine could not run
// here. It runs now: the engine reports pass / fail / not-applicable-with-its-absent-
// precondition-named, so an absent precondition is no longer indistinguishable from a
// meaningful pass, and the rollout is warn-first — findings at native severity, pillar
// unmoved.
//
// Two things the wording is careful about, both corrections of the older text:
//   - It names the OPERAND GATE. Warn-first runs only when `data` is supplied; without the
//     operand there is nothing to evaluate, and saying "a11y-equivalence runs here" flat
//     would be false on the {spec}-only path that most callers take.
//   - It drops "The accessible table + narrative are STILL generated". On the {spec}-only
//     path nothing is generated — there is no data to generate from. They are generated on
//     the data-backed path, which is where the operand-built table and narrative come from.
// The verdict flip (pillar → pass/fail) is referenced UNDATED: shipped prose does not carry
// sprint numbers (the s173→s174 date correction in this very sentence is why).
const echartsA11yNote = (trait: string): string =>
  `${trait} is an ECharts-primary mark. A11y-equivalence runs WARN-FIRST here: when the \`data\` operand is supplied, the 16-rule equivalence engine evaluates over the operand-built table and narrative, each rule reporting pass, fail, or not-applicable; failures surface in findings[] at their native severity, not-applicable rules in a11yNotApplicable[] with the absent precondition named, the remainder passed — and none of it moves the pillar. Without the operand there is nothing to evaluate and no a11y findings appear. pillars.a11yEquivalence stays 'unchecked' in both cases; the verdict flip to pass/fail is a future enforce step, not scheduled here. The accessible table and narrative are generated on the data-backed path.`;

/**
 * What the s172 operand contributed to an ECharts-primary verdict: the determinism pillar
 * (real when `data` was supplied, 'unchecked' when it was not) and the notes that explain
 * which of those two it is. The two 'unchecked' flavours are told apart by the NOTE, never
 * by silence.
 */
interface EChartsOperandVerdict {
  readonly determinismPillar: 'pass' | 'fail' | 'unchecked';
  readonly determinism?: CertifyDeterminism;
  /** s172 m03 — the ECharts-side accuracy pillar, real whenever the operand is present. */
  readonly accuracyPillar: AccuracyVerdict;
  readonly accuracySummary?: CertifyAccuracySummary;
  /** Operand-backed render grade. Absent only when no operand was supplied. */
  readonly renderedContrast?: {
    readonly contrast: ContrastVerdict;
    readonly contrastNote: string;
  };
  /**
   * Accuracy findings (OODS-V154..V159) followed by the s174 warn-first a11y-equivalence
   * findings (OODS-A11Y-<rule.id>, native severity). There is deliberately no a11y PILLAR
   * field here: warn-first surfaces findings without moving any verdict.
   */
  readonly findings: CertifyFinding[];
  /**
   * s175 m03 — the third state the note promises. Present (as [] when no rule was
   * not-applicable) EXACTLY when the warn-first engine ran to completion; undefined when it
   * did not (no operand, or the engine threw — the catch below discards the partial list and
   * says so in notes[]). Never folded into findings[]: a not-applicable rule is not a failure.
   */
  readonly a11yNotApplicable?: CertifyA11yNotApplicable[];
  readonly notes: string[];
}

/**
 * Shared shape for an ECharts-primary verdict. s141 gave it a REAL contrast pillar; s172
 * gives it a REAL determinism pillar whenever the `data` operand is supplied. coverage
 * stays 'uncertified' and conformant stays null (Design A — there is still no Vega-Lite
 * compile, so no a11y-equivalence claim), and the a11y note is retained.
 */
function echartsContrastVerdict(
  trait: string,
  contrast: ContrastVerdict,
  contrastNote: string | undefined,
  operand: EChartsOperandVerdict,
): ArtifactCertifyOutput {
  return {
    status: 'ok',
    coverage: 'uncertified',
    conformant: null,
    // s172 m03: findings[] now carries a THIRD family on this path — the ECharts accuracy
    // codes OODS-V154..V159. conformant STAYS null: the uncertified path makes no folded
    // claim (s141 Design A), so an accuracy fail here is read from pillars.accuracy and
    // findings[], never from conformant. That is stated in the output schema prose.
    findings: operand.findings,
    // s175 m03: the not-applicable channel rides beside findings[] — present exactly when the
    // warn-first engine ran (data-backed path), absent on the {spec}-only path.
    ...(operand.a11yNotApplicable ? { a11yNotApplicable: operand.a11yNotApplicable } : {}),
    pillars: {
      a11yEquivalence: 'unchecked',
      determinism: operand.determinismPillar,
      contrast,
      accuracy: operand.accuracyPillar,
    },
    ...(operand.determinism ? { determinism: operand.determinism } : {}),
    ...(operand.accuracySummary ? { accuracySummary: operand.accuracySummary } : {}),
    notes: [echartsA11yNote(trait), ...operand.notes],
    ...(contrastNote ? { contrastNote } : {}),
  };
}

/**
 * The note a contrast-engine fault writes beside 'ungradeable' (s175 m04, #781; closes
 * decision #1446 (4) — the catches used to degrade silently). Names the fault so a reader
 * can tell an evaluator fault from an unresolvable canvas (the grader's own note).
 */
function contrastFaultNote(err: unknown): string {
  const name = err instanceof Error ? err.name : 'Error';
  const message = err instanceof Error ? err.message : String(err);
  return `The contrast engine faulted while grading this spec (${name}: ${message}); the pillar is reported ungradeable rather than passed.`;
}

const ECHARTS_RENDER_MATRIX_NOTE =
  'Cross-process ECharts renderHash equality is certified only within the runtime axes ' +
  'recorded in packages/viz-render/certified-matrix.json; changing a recorded dependency, ' +
  'runtime, renderer/normalizer contract, token version, viewport, or snapshot policy ' +
  'requires requalification.';

const ECHARTS_RENDER_SCOPE_NOTE =
  'This determinism verdict covers the emitted ECharts option and the normalized SVG ' +
  'rendered from two independently emitted projected options. contentHash identifies the ' +
  'first projected option; renderHash identifies the first normalized SVG. ' +
  ECHARTS_RENDER_MATRIX_NOTE;

const ECHARTS_BUBBLE_NO_MAP_NOTE =
  'This bubble_map operand has no inline geometry; the server never fetches or resolves a ' +
  'map, so certification keeps the projected-option proof only and emits no renderHash.';

const ECHARTS_BUBBLE_NO_MAP_CONTRAST_NOTE =
  'Geo color remains exempt under the standing WCAG 1.4.11 gradient-essential ruling. ' +
  'This bubble_map operand was not render-graded because it has no inline geometry and the ' +
  'server never fetches or resolves a map.';

const ECHARTS_RENDERED_GRADED_CAVEAT =
  'certify grades actual carrier paints extracted from the normalized SVG rendered from ' +
  'the retained projected ECharts option against the light-theme canvas; dark-theme ' +
  'contrast is not verified.';

const ECHARTS_RENDERED_EXEMPT_CAVEAT =
  'certify reads actual carrier paints from the normalized SVG rendered from the retained ' +
  'projected ECharts option. Geo categorical contrast remains exempt, so no light-theme ' +
  'canvas ratio is graded; dark-theme contrast is not verified.';

const ECHARTS_RENDERED_UNGRADEABLE_CAVEAT =
  'certify attempted to read carrier paints from the normalized SVG rendered from the ' +
  'retained projected ECharts option, but no complete grade was available. No light-theme ' +
  'canvas grade was completed; dark-theme contrast is not verified.';

const ECHARTS_NO_RENDER_CONTRAST_CAVEAT =
  'No normalized SVG carrier evidence was available for this call, so no canvas ' +
  'measurement was made. Render-backed ECharts contrast uses the light-theme canvas; ' +
  'dark-theme contrast is not verified.';

interface EChartsRenderedOperandVerdict {
  readonly stable: boolean;
  readonly renderHash?: string;
  readonly contrast: ContrastVerdict;
  readonly contrastNote: string;
  readonly notes: string[];
}

function renderFaultDetail(err: unknown): string {
  const record =
    err !== null && typeof err === 'object'
      ? (err as { readonly code?: unknown; readonly message?: unknown })
      : undefined;
  const code = typeof record?.code === 'string' ? record.code : undefined;
  const message =
    typeof record?.message === 'string'
      ? record.message
      : err instanceof Error
        ? err.message
        : String(err);
  return code ? `${code}: ${message}` : message;
}

type EChartsContrastEvidence = 'graded' | 'exempt' | 'ungradeable' | 'not-rendered';

function withEChartsContrastCaveat(
  note: string,
  evidence: EChartsContrastEvidence,
): string {
  const caveat =
    evidence === 'graded'
      ? ECHARTS_RENDERED_GRADED_CAVEAT
      : evidence === 'exempt'
        ? ECHARTS_RENDERED_EXEMPT_CAVEAT
        : evidence === 'ungradeable'
          ? ECHARTS_RENDERED_UNGRADEABLE_CAVEAT
          : ECHARTS_NO_RENDER_CONTRAST_CAVEAT;
  return `${note} ${caveat}`;
}

/**
 * Render and grade the exact two JSON-safe option projections retained by the emit proof.
 * There is deliberately no raw option parameter and no reconstruction fallback after the
 * first render is attempted.
 */
async function evaluateEChartsRenderedOperand(
  outcome: EChartsDeterminismResult,
  chartType: CertifyOperandResolved['chartType'],
): Promise<EChartsRenderedOperandVerdict> {
  // A geometry-free bubble is valid for clients that already own a registered base map,
  // but this server never fetches one. Keep its option proof and do not start the worker.
  if (
    chartType === 'bubble_map' &&
    outcome.firstProjected.__registration === undefined
  ) {
    return {
      stable: outcome.stable,
      contrast: 'exempt',
      contrastNote: withEChartsContrastCaveat(
        ECHARTS_BUBBLE_NO_MAP_CONTRAST_NOTE,
        'not-rendered',
      ),
      notes: [ECHARTS_BUBBLE_NO_MAP_NOTE],
    };
  }

  let firstSvg: string;
  try {
    firstSvg = await renderEChartsToSvg(outcome.firstProjected);
  } catch (err) {
    const detail = renderFaultDetail(err);
    const note =
      `The first ECharts render failed (${detail}); renderHash is absent, ` +
      'render-backed contrast is ungradeable, and stable is false.';
    return {
      stable: false,
      contrast: 'ungradeable',
      contrastNote: withEChartsContrastCaveat(note, 'not-rendered'),
      notes: [note],
    };
  }

  const renderHash = sha256(firstSvg);
  let contrast: ContrastVerdict;
  let contrastNote: string;
  try {
    const grade = evaluateEChartsRenderContrast({
      chartType,
      normalizedSvg: firstSvg,
      projectedOption: outcome.firstProjected,
    });
    contrast = grade.contrast;
    contrastNote = withEChartsContrastCaveat(
      grade.contrastNote,
      grade.contrast === 'exempt'
        ? 'exempt'
        : grade.contrast === 'ungradeable'
          ? 'ungradeable'
          : 'graded',
    );
  } catch (err) {
    contrast = 'ungradeable';
    contrastNote = withEChartsContrastCaveat(
      contrastFaultNote(err),
      'ungradeable',
    );
  }

  let renderStable = false;
  const proofNotes: string[] = [];
  try {
    const secondSvg = await renderEChartsToSvg(outcome.secondProjected);
    renderStable = renderHash === sha256(secondSvg);
    if (!renderStable) {
      proofNotes.push(
        'The second independent ECharts render differed from the first normalized SVG; ' +
          'the first renderHash is retained and stable is false.',
      );
    }
  } catch (err) {
    proofNotes.push(
      `The second independent ECharts render failed (${renderFaultDetail(err)}); ` +
        'the first renderHash is retained and stable is false.',
    );
  }
  if (!outcome.stable) {
    proofNotes.push(
      'The two independently emitted projected ECharts options differed; contentHash ' +
        'identifies the first projection and stable is false.',
    );
  }

  return {
    stable: outcome.stable && renderStable,
    renderHash,
    contrast,
    contrastNote,
    notes: [ECHARTS_RENDER_SCOPE_NOTE, ...proofNotes],
  };
}

/** Legacy no-operand grade: reconstruct the baked palette when no chart data can render. */
function echartsCategoricalVerdict(trait: string, operand: EChartsOperandVerdict): ArtifactCertifyOutput {
  // Defensive: a contrast-engine fault degrades to 'ungradeable' WITH a note naming the
  // fault (s175 m04, closes decision #1446 (4)) — never status:error. Mirrors the cartesian
  // path's catch; conformant is null on this path regardless, so no gate moves.
  let contrast: ContrastVerdict = 'unchecked';
  let contrastNote: string | undefined;
  try {
    const pillar = evaluateEChartsCategoricalContrast();
    contrast = pillar.contrast;
    contrastNote = pillar.contrastNote;
  } catch (err) {
    contrast = 'ungradeable';
    contrastNote = contrastFaultNote(err);
  }
  return echartsContrastVerdict(trait, contrast, contrastNote, operand);
}

/** s141 m03 — geo color is a sequential/continuous scale → WCAG-exempt (role-B). */
function echartsGeoExemptVerdict(trait: string, operand: EChartsOperandVerdict): ArtifactCertifyOutput {
  return echartsContrastVerdict(trait, 'exempt', ECHARTS_GEO_EXEMPT_NOTE, operand);
}

/**
 * s172 m02/m03 — turn the resolved operand (or its absence) into the determinism AND
 * accuracy pillars.
 *
 * Absent: both 'unchecked', each with its OWN operand-absent note — the two 'unchecked'
 * flavours (no operand vs nothing offered) are told apart by the note, never by silence.
 * Present: the re-emit determinism proof + the per-type accuracy rules.
 *
 * A re-emit THROW is not a degraded pillar — it means the operand is one the render path
 * also refuses, so it surfaces as the same structured error viz.render returns (rejection
 * parity). An accuracy ENGINE fault IS a degraded pillar, mirroring the cartesian path's
 * try/catch exactly: a fault must never turn a valid verdict into status:error.
 */
async function evaluateEChartsOperand(
  spec: NormalizedVizSpec,
  trait: string,
  operand: CertifyOperandResolved | undefined,
): Promise<EChartsOperandVerdict | { failure: { code: string; message: string } }> {
  if (!operand) {
    return {
      determinismPillar: 'unchecked',
      accuracyPillar: 'unchecked',
      findings: [],
      notes: [operandAbsentDeterminismNote(trait), operandAbsentAccuracyNote(trait)],
    };
  }

  const outcome = evaluateEChartsDeterminism(spec, operand.chartType, operand.branchData);
  if (!outcome.ok) {
    return { failure: { code: outcome.code, message: outcome.message } };
  }

  const rendered = await evaluateEChartsRenderedOperand(outcome, operand.chartType);

  let accuracyPillar: AccuracyVerdict = 'unchecked';
  let accuracySummary: CertifyAccuracySummary | undefined;
  const findings: CertifyFinding[] = [];
  const accuracyNotes: string[] = [];
  try {
    const result = evaluateEChartsAccuracyRules({
      chartType: operand.chartType,
      branchData: operand.branchData,
    });
    // 'pass' REQUIRES that at least one rule actually resolved its operand and ran. Zero
    // resolved rules is 'unchecked', not 'pass' — whether because the type offers none
    // (force_graph, bubble_map, flow_map) or because every offered rule's precondition was
    // absent. This is STRICTER than the cartesian path, which reports 'pass' with
    // rulesEvaluated:0 (the s170 semantics, deliberately untouched here): on that path the
    // reader is told to read 'pass' together with rulesEvaluated; aligning the two is a
    // separate item (decision #1453), not the #781 hole s175 m04 closed. On the new path
    // there was no reason to inherit it.
    //
    // The two 'unchecked' flavours are then told apart by devices, never by silence: NO
    // operand -> no accuracySummary + the operand-absent note; operand present but nothing
    // resolved -> accuracySummary {rulesEvaluated:0, failing:0} + a note saying why.
    accuracyPillar =
      result.findings.length > 0 ? 'fail' : result.rulesEvaluated > 0 ? 'pass' : 'unchecked';
    accuracySummary = { rulesEvaluated: result.rulesEvaluated, failing: result.findings.length };
    accuracyNotes.push(...result.notes);
    for (const finding of result.findings) {
      findings.push({ code: finding.code, severity: 'error', message: finding.message });
    }
  } catch {
    // An evaluator fault is "tried and failed" → 'ungradeable' (s175 m04), never the
    // nothing-to-grade 'unchecked'; the offered-rules tail stays a scope tripwire.
    accuracyPillar = 'ungradeable';
    accuracyNotes.push(
      `The accuracy rules could not be evaluated for this ${operand.chartType}; the pillar is reported ungradeable rather than passed. ${echartsAccuracyRulesFor(operand.chartType).length} rules were offered.`,
    );
  }

  // A11Y-EQUIVALENCE, WARN-FIRST (s174 m01). The engine needs a table + narrative, which an
  // ECharts-primary IR cannot supply — its data lives in the operand. Build the SAME context
  // viz.render derives its structured a11y from (shared builder, not a transcription) and
  // evaluate the 16 rules over it.
  //
  // Three properties make this "warn-first" rather than a verdict migration:
  //   - the PILLAR is untouched ('unchecked' on every path this sprint — see the callers);
  //   - findings keep their NATIVE severity (no s134-style forced remap — the output schema
  //     promises exactly that, and R-09's 'error' really is an error-severity finding);
  //   - nothing blocks: conformant is null on this path, so an a11y finding moves no gate.
  // What the caller gets is the enumeration of what enforcement will one day require.
  //
  // Guarded exactly like the accuracy rules above: an engine fault degrades to zero a11y
  // findings plus a note, never a status:error on an otherwise valid verdict.
  const a11yNotes: string[] = [];
  // s175 m03 — the NOT-APPLICABLE channel. The engine's tri-state (s174) reports an absent
  // precondition as `passed:true` + `notApplicable:true` + `preconditionAbsent`, which the
  // `if (rule.passed) continue` this replaces silently DROPPED — so the note's promise ("with
  // its absent precondition named") never reached the wire. Route those results here, in rule
  // order; failures still go to findings[]; a plain pass goes nowhere. The channel is assigned
  // only AFTER the loop completes, so an engine throw leaves it undefined (absent on the wire)
  // rather than half-filled.
  let a11yNotApplicable: CertifyA11yNotApplicable[] | undefined;
  try {
    const context = buildEChartsA11yContext(spec, operand.chartType, operand.branchData);
    const notApplicable: CertifyA11yNotApplicable[] = [];
    for (const rule of validateVizEquivalenceRulesForContext(context)) {
      if (rule.notApplicable) {
        notApplicable.push({
          rule: rule.id,
          preconditionAbsent: rule.preconditionAbsent ?? '(the rule did not name its precondition)',
        });
        continue;
      }
      if (rule.passed) {
        continue;
      }
      findings.push({
        code: `OODS-A11Y-${rule.id}`,
        severity: rule.severity,
        message: rule.message ?? rule.summary,
      });
    }
    a11yNotApplicable = notApplicable;
  } catch {
    a11yNotes.push(
      `The a11y-equivalence rules could not be evaluated for this ${operand.chartType}; no a11y findings are reported for it. pillars.a11yEquivalence is 'unchecked' on this path either way.`,
    );
  }

  return {
    determinismPillar: rendered.stable ? 'pass' : 'fail',
    determinism: {
      stable: rendered.stable,
      contentHash: outcome.contentHash,
      ...(rendered.renderHash !== undefined ? { renderHash: rendered.renderHash } : {}),
    },
    accuracyPillar,
    ...(accuracySummary ? { accuracySummary } : {}),
    renderedContrast: {
      contrast: rendered.contrast,
      contrastNote: rendered.contrastNote,
    },
    findings,
    ...(a11yNotApplicable ? { a11yNotApplicable } : {}),
    notes: [...rendered.notes, ...accuracyNotes, ...a11yNotes],
  };
}

/**
 * The operand-absent ACCURACY note (a DECLARED notes[] movement on the ECharts {spec}-only
 * path, s172 §1g). Distinct from the determinism one because the remedy is the same but the
 * pillar is not, and a reader must be able to see which pillar each 'unchecked' belongs to.
 */
function operandAbsentAccuracyNote(trait: string): string {
  return `Accuracy is unchecked for ${trait}: the ECharts accuracy rules read the chart's own data, which an ECharts-primary IR does not carry. Supply the matching \`data\` branch and certify evaluates the rules offered for this chart type and reports rulesEvaluated.`;
}

/** The honest uncertified verdict (ECharts-primary OR an unmodeled cartesian trait). */
function uncertifiedVerdict(notes: string[]): ArtifactCertifyOutput {
  return {
    status: 'ok',
    coverage: 'uncertified',
    conformant: null,
    findings: [],
    // Every pillar is genuinely unchecked: there is no Vega-Lite compile (so no
    // a11y-equivalence, no determinism proof and no operand for the accuracy rules), and
    // contrast is not evaluated for a non-cartesian / unmodeled mark.
    pillars: {
      a11yEquivalence: 'unchecked',
      determinism: 'unchecked',
      contrast: 'unchecked',
      accuracy: 'unchecked',
    },
    notes,
  };
}

export async function handle(input: ArtifactCertifyInput): Promise<ArtifactCertifyOutput> {
  // INPUT — permissive boundary (§3b of the m01 memo): the tool schema only asserts
  // {spec:object}; assertNormalizedVizSpec (AJV vs the runtime schema) is the
  // authoritative validator. An invalid IR returns a structured error, never a throw.
  let spec: NormalizedVizSpec;
  try {
    spec = assertNormalizedVizSpec(input?.spec);
  } catch (err) {
    return errorVerdict('OODS-V126', err);
  }

  // COVERAGE-HONEST ROUTING — a NormalizedVizSpec carries no chartType, so classify
  // from the first mark's trait. Normalize the heatmap alias to its canonical
  // MarkRect first, then route by a POSITIVE cartesian allowlist so an unmodeled
  // trait is honestly uncertified rather than falling through to a V127 compile error.
  const rawTrait = spec.marks[0]?.trait;
  const trait = rawTrait && TRAIT_ALIASES[rawTrait] ? TRAIT_ALIASES[rawTrait] : rawTrait;

  // OPERAND (s172 m01) — resolve + validate the optional `data` branch against the trait
  // BEFORE any verdict is produced, so a bad operand is a structured error rather than a
  // silently-ignored input or a verdict computed over data certify already knows is
  // broken. Rejections reuse the render path's own validators (see certify-operand.ts).
  // When `data` is absent this is skipped entirely and the verdict is byte-for-byte the
  // pre-s172 one.
  let operand: CertifyOperandResolved | undefined;
  if (input?.data !== undefined) {
    const resolved = resolveCertifyOperand(trait, input.data);
    if (!resolved.ok) {
      return { status: 'error', errors: [{ code: resolved.code, message: resolved.message }] };
    }
    operand = resolved;
  }

  // ECharts-primary (treemap/sunburst/sankey/...): no Vega-Lite compile, so still no
  // a11y-equivalence claim — coverage stays 'uncertified'. A DISTINCT verdict, not a
  // failure. As of s172 the DETERMINISM pillar is real here whenever the operand is
  // present: certify re-emits the ECharts option twice through the same adapters
  // viz.render uses and hashes the same JSON projection.
  if (trait && isEChartsPrimaryMarkTrait(trait)) {
    const operandVerdict = await evaluateEChartsOperand(spec, trait, operand);
    if ('failure' in operandVerdict) {
      return { status: 'error', errors: [operandVerdict.failure] };
    }
    // Once an operand reached the render path, its retained projected option and normalized
    // SVG are the sole contrast evidence. Never fall back to the reconstruction grader after
    // a render was attempted (including a typed render fault).
    if (operandVerdict.renderedContrast) {
      return echartsContrastVerdict(
        trait,
        operandVerdict.renderedContrast.contrast,
        operandVerdict.renderedContrast.contrastNote,
        operandVerdict,
      );
    }
    // No operand: preserve the legacy reconstructed categorical-palette bytes.
    if (ECHARTS_CATEGORICAL_TRAITS.has(trait)) {
      return echartsCategoricalVerdict(trait, operandVerdict);
    }
    // No operand: preserve the legacy geo-exemption bytes.
    if (ECHARTS_GEO_EXEMPT_TRAITS.has(trait)) {
      return echartsGeoExemptVerdict(trait, operandVerdict);
    }
    // Defensive default for any future ECharts-primary type not yet routed above — all 8
    // current types are categorical or geo-exempt, so this is unreachable today.
    return uncertifiedVerdict([echartsA11yNote(trait), `Contrast is not checked for ${trait}.`]);
  }

  // Neither a certifiable cartesian trait nor ECharts-primary → honest uncertified,
  // NOT an opaque status:error from a failed compile (review #1004 item 2).
  if (!trait || !CARTESIAN_VEGA_TRAITS.has(trait)) {
    return uncertifiedVerdict([
      `${rawTrait ?? '(no mark trait)'} is not a certifiable cartesian-Vega mark (MarkBar/MarkLine/MarkPoint/MarkArea/MarkRect) and is not an ECharts-primary type; a11y-equivalence certification is cartesian-only.`,
      `Contrast is not checked for uncertified marks.`,
    ]);
  }

  // The alias may differ from the authored trait (MarkHeatmap -> MarkRect); certify
  // against the canonical-trait spec so the compile + rules + contentHash are honest.
  const certifySpec: NormalizedVizSpec =
    trait === rawTrait
      ? spec
      : { ...spec, marks: [{ ...spec.marks[0], trait }, ...spec.marks.slice(1)] };

  try {
    // CONFORMANCE — mirror viz.render.ts's partition exactly: every failing rule
    // becomes a finding keyed OODS-A11Y-<rule.id>; conformant iff zero error-severity
    // failures. NEVER assertVizEquivalence (it throws on error-severity → would lose
    // per-rule codes).
    const failures = validateVizEquivalenceRules(certifySpec).filter((rule) => !rule.passed);
    // The a11y-equivalence sub-result — zero error-severity failures. Kept DISTINCT from
    // the folded `conformant` (s140 [B]): pillars.a11yEquivalence mirrors THIS, so an
    // a11y-passing / contrast-failing chart reports a11yEquivalence:'pass' honestly.
    const a11yConformant = failures.every((rule) => rule.severity !== 'error');
    const findings: CertifyFinding[] = failures.map((rule) => ({
      code: `OODS-A11Y-${rule.id}`,
      severity: rule.severity,
      message: rule.message ?? rule.summary,
    }));

    // DETERMINISM, compile half — compile to Vega-Lite twice, byte-compare the canonical
    // form, hash it. Pure function of the IR (mirrors viz.render.ts's contentHash), so the
    // same IR always yields the same verdict + hash. Capture the first compiled object
    // (reused below for the canonical hash, the contrast grade AND the render proof); KEEP
    // the second toVegaLiteSpec call — it IS the compile proof (first === second), not a
    // redundant compile to optimize away. The render half of the pillar (s176 m02) is
    // computed after the contrast grade below, so it can reuse the grade's own render as
    // its first hash.
    const compiled = toVegaLiteSpec(certifySpec);
    const first = canonicalize(compiled);
    const second = canonicalize(toVegaLiteSpec(certifySpec));
    const compileStable = first === second;
    const contentHash = sha256(first);

    // CONTRAST PILLAR (s137/s138/s139; render-backed as of s176 m01) — grades the
    // series-to-paint assignment the chart RENDERS: the pillar renders `compiled`
    // through @oods/viz-render and grades the data-mark paints, duplicates retained, so
    // a palette-recycling collision (consumed cardinality > baked palette) fails as a
    // ΔE00=0 role-A pair instead of certifying conformant. (The pre-s176 claim here —
    // that grading the BAKED hexes made certified == rendered "by construction" — was
    // measured false at 4f64bcf: a 10-series chart certified conformant:true with four
    // colliding series pairs at the pixel level.) It is a read-only addition to
    // certify's OWN output; contentHash derives from an untouched toVegaLiteSpec — the
    // render feeds grading, never the hash — so render↔certify hash identity holds.
    // Defensive: a contrast-engine OR render fault never turns a valid conformance
    // verdict into status:error — the render is awaited INSIDE this try (s176 D6), so
    // any throw degrades to 'ungradeable' WITH a note naming the fault (s175 m04,
    // closes decision #1446 (4)), and 'ungradeable' pulls conformant false below.
    let contrast: ContrastVerdict = 'unchecked';
    let contrastNote: string | undefined;
    let gradedSvg: string | undefined;
    try {
      const pillar = await evaluateContrastPillar(certifySpec, compiled);
      contrast = pillar.contrast;
      contrastNote = pillar.contrastNote;
      gradedSvg = pillar.renderedSvg;
    } catch (err) {
      contrast = 'ungradeable';
      contrastNote = contrastFaultNote(err);
    }

    // DETERMINISM, render half (s176 m02) — double-render byte-equality:
    // sha256(renderVegaLiteToSvg(compiled)) twice, equal. The FIRST hash is the contrast
    // grade's own render (reused, never recomputed); the SECOND render call below IS the
    // proof — the ":623-625 KEEP-the-second discipline", render edition. Runs exactly
    // when the grade rendered (>= 1 series unit), so `renderHash` presence tracks this
    // cartesian rendered-grading path. A second-render
    // throw is a failed proof (the artifact could not be re-rendered), never a
    // status:error — the catch keeps the fault inside the pillar.
    let renderHash: string | undefined;
    let renderStable = true;
    if (gradedSvg !== undefined) {
      renderHash = sha256(gradedSvg);
      try {
        renderStable =
          renderHash === sha256(await renderVegaLiteToSvg(compiled as unknown as VegaLiteSpec));
      } catch {
        renderStable = false;
      }
    }
    // The folded stable: the compile proof AND (when a render happened) the render proof.
    const stable = compileStable && renderStable;

    // ACCURACY PILLAR (s170 m02, #818) — the four declared structural rules over the IR +
    // the compiled spec. certify stays a PURE READER: the evaluator mutates neither operand,
    // so `contentHash` above (taken over this same untouched `compiled`) is unmoved by it.
    // Defensive, mirroring contrast's catch above exactly: a rules-engine fault degrades the
    // pillar to 'ungradeable' with a note (s175 m04) — it NEVER turns a valid conformance
    // verdict into a status:error, and it pulls conformant false below. Every finding maps
    // into the EXISTING closed $defs/finding shape; the ruleId is carried by the registered
    // code, so the shape needs no new field. Both branches overwrite the init, so the
    // cartesian accuracy pillar never reports 'unchecked'.
    let accuracy: AccuracyVerdict = 'unchecked';
    let accuracySummary: CertifyAccuracySummary | undefined;
    const accuracyNotes: string[] = [];
    try {
      const result = evaluateAccuracyRules(certifySpec, compiled);
      accuracy = result.findings.length > 0 ? 'fail' : 'pass';
      accuracySummary = { rulesEvaluated: result.rulesEvaluated, failing: result.findings.length };
      accuracyNotes.push(...result.notes);
      for (const finding of result.findings) {
        findings.push({ code: finding.code, severity: 'error', message: finding.message });
      }
    } catch {
      accuracy = 'ungradeable';
      accuracyNotes.push(
        `The accuracy rules could not be evaluated for this spec; the pillar is reported ungradeable rather than passed. ${ACCURACY_RULES.length} rules were offered.`,
      );
    }

    // CONFORMANT ROLLUP (s140 [B], tightened s175 m04 #781) — the headline gate an agent's
    // `if(conformant)` reads folds the graded pillars, so it can no longer silently ship a
    // contrast:'fail' chart. 'fail' AND 'ungradeable' pull it false on contrast and accuracy
    // alike: a grade that was attempted and failed for a reason outside the spec (a poisoned
    // canvas token, an evaluator fault) is not a pass. 'exempt'/'unchecked'/'pass' leave it
    // a11y-driven (a gradient's 'exempt' and a no-color or decorative-only chart's
    // 'unchecked' must not flip conformant, so the s139 invariance lock holds). `stable` is
    // LOAD-BEARING as of s176 m02: beyond the compile proof (a pure compile is always
    // byte-stable) it now carries the double-render byte-equality, which CAN red — a
    // nondeterministic render fails this clause and pulls conformant false.
    // A scoped, monotonic TIGHTENING (some inputs move true->false; none move false->true) —
    // the cause of a contrast- or accuracy-driven false is carried by pillars + contrastNote
    // + notes[]. Measured on the light theme (dark-theme contrast OOS).
    const conformant =
      a11yConformant &&
      contrast !== 'fail' &&
      contrast !== 'ungradeable' &&
      accuracy !== 'fail' &&
      accuracy !== 'ungradeable' &&
      stable;

    return {
      status: 'ok',
      coverage: 'certified',
      conformant,
      findings,
      // renderHash (s176 m02, OPTIONAL in the schema): present exactly when the contrast
      // grade rendered — the cartesian rendered-grading path — proving the double-render
      // byte-equality `stable` now folds in. The operand-backed ECharts path above applies
      // the same presence rule to its own normalized render.
      determinism: { stable, contentHash, ...(renderHash !== undefined ? { renderHash } : {}) },
      pillars: {
        a11yEquivalence: a11yConformant ? 'pass' : 'fail',
        determinism: stable ? 'pass' : 'fail',
        contrast,
        accuracy,
      },
      ...(accuracySummary ? { accuracySummary } : {}),
      ...(contrastNote ? { contrastNote } : {}),
      ...(accuracyNotes.length > 0 ? { notes: accuracyNotes } : {}),
    };
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    const code = name === 'VegaLiteAdapterError' ? 'OODS-V127' : 'OODS-V129';
    return errorVerdict(code, err);
  }
}
