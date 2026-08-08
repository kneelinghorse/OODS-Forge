// artifact.certify — the "certify" half of generate-AND-certify (sprint-136 m02).
//
// An agent hands in a Forge NormalizedVizSpec IR and gets back a conformance
// verdict + a re-emit determinism proof + a contentHash. certify is a READER of
// the IR: it never rebuilds, re-recommends, or re-encodes (#110). It reuses the
// exact same equivalence engine (validateVizEquivalenceRules) and determinism
// transform (toVegaLiteSpec -> canonicalize -> sha256) that viz.render runs, so
// for a Forge-generated IR certify's contentHash equals the hash viz.render emits.
//
// Coverage-honest: the 8 ECharts-primary types (treemap/sunburst/sankey/... — classified
// from the IR's first mark trait) return coverage:'uncertified' / conformant:null, a
// DISTINCT verdict, not a failure. That is a statement about the FOLDED GATE, not about
// what was checked. Three of the four pillars carry real verdicts on that path:
// contrast since s141, and — as of s172, whenever the caller supplies the optional `data`
// operand — determinism and accuracy too (certify re-emits the ECharts option through the
// same adapters viz.render uses, and evaluates a per-type accuracy set over the operand).
// a11y-equivalence is the one that stays 'unchecked', and its note says why: the engine has
// no per-rule not-applicable state, so the migration is deferred, not impossible.
// Contrast is a graded pillar (s137/s138/s139):
// certify reads the color hexes the vega-lite adapter BAKED into the compiled cartesian
// spec (scale.range / mark.color) and grades them against the canvas — so contrast
// reflects the bytes Forge actually renders, and a chart that baked no OODS palette can
// never certify contrast:'pass'. The verdict is a pure function of the input IR — no
// Date/random/UUID.
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
  ACCURACY_RULES,
  assertNormalizedVizSpec,
  echartsAccuracyRulesFor,
  evaluateAccuracyRules,
  evaluateEChartsAccuracyRules,
  toVegaLiteSpec,
  validateVizEquivalenceRules,
  type NormalizedVizSpec,
} from '@oods/viz-core';
import { isEChartsPrimaryMarkTrait } from './echarts-primary.js';
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
  determinismScopeNote,
  evaluateEChartsDeterminism,
  operandAbsentDeterminismNote,
} from './certify-echarts-emit.js';

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
}

/**
 * Per-pillar tri-state summary (s137, extended s170 and s172). The pillars DISAGGREGATE which
 * pillar drove the folded `conformant` gate (s140 [B]) — and on the uncertified path, where
 * there is no folded gate at all, they are the ONLY place the real verdicts live.
 * a11yEquivalence mirrors the a11y-equivalence sub-result (NOT the folded conformant);
 * determinism mirrors `determinism.stable`; contrast is the rendered-reality verdict — the
 * categorical color bytes Forge baked into the compiled spec (s138) — with 'exempt' for
 * gradient scales; accuracy is the structural-rules verdict. So a reader can always see WHY
 * conformant is false, and can always see what actually ran when it is null.
 */
export interface CertifyPillars {
  readonly a11yEquivalence: 'pass' | 'fail' | 'unchecked';
  readonly determinism: 'pass' | 'fail' | 'unchecked';
  readonly contrast: ContrastVerdict;
  /**
   * The structural accuracy verdict (s170 #818, widened to all 13 types in s172): the four
   * cartesian rules over the compiled spec, or the per-type ECharts set over the `data`
   * operand. Its own THREE-state enum; contrast's four-state one ('exempt') is untouched.
   */
  readonly accuracy: 'pass' | 'fail' | 'unchecked';
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

// The 5 ECharts-primary types whose adapters BAKE the OODS categorical palette into
// itemStyle (treemap-adapter.ts:106 et al.). certify grades that reconstructed palette
// (role-C vs canvas + role-A) — a real WCAG-1.4.11 + CVD verdict on the color the live
// viz.render path renders (s141 m02).
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
// that the range was invisible to certify (it lives in the geo DATA branch, outside this
// metadata IR). s172 m01 removed the second half — certify takes the geo branch now, so the
// range is reachable. The ruling stands on its own: grading it is a fresh scope decision,
// not a defect to fix. The exempt note says exactly that.
const ECHARTS_GEO_EXEMPT_TRAITS: ReadonlySet<string> = new Set([
  'MarkChoropleth',
  'MarkFlow',
  'MarkBubble',
]);

// The a11y-equivalence note shared by every ECharts-primary verdict.
//
// REWORDED in s172 m04, because the old wording ("certification is cartesian-only") read as
// a STRUCTURAL limit — as if an ECharts chart were inherently unverifiable. s172 disproved
// that framing for two of the four pillars, so the remaining gap has to state its actual,
// temporary reason: the 16-rule equivalence engine has NO per-rule not-applicable state.
// A rule whose precondition is absent returns pass(), indistinguishable from a meaningful
// pass; run against a metadata-only ECharts IR, R-03 hard-errors on the missing table, ~12
// rules pass trivially, and R-09 fails any unnamed IR. Running it over the data operand
// would therefore FLIP existing 'unchecked' verdicts to 'fail' — a verdict migration that
// needs its own warn-first rollout (the s134→s135 precedent), deferred to s173.
const echartsA11yNote = (trait: string): string =>
  `${trait} is an ECharts-primary mark; a11y-equivalence stays unchecked here. Not because the chart cannot be checked — determinism and accuracy ARE checked for these types when the \`data\` operand is supplied — but because the equivalence engine has no per-rule not-applicable state, so running it over this input would turn absent preconditions into failures. That verdict migration is deferred to a warn-first rollout (s173). The accessible table + narrative are still generated; they are not equivalence-verified.`;

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
  readonly accuracyPillar: 'pass' | 'fail' | 'unchecked';
  readonly accuracySummary?: CertifyAccuracySummary;
  readonly findings: CertifyFinding[];
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

/** s141 m02 — grade the baked OODS categorical palette (role-C + role-A → 'pass'). */
function echartsCategoricalVerdict(trait: string, operand: EChartsOperandVerdict): ArtifactCertifyOutput {
  // Defensive: a contrast-engine fault degrades to 'unchecked', never turns the verdict
  // into status:error (mirrors the cartesian path's try/catch).
  let contrast: ContrastVerdict = 'unchecked';
  let contrastNote: string | undefined;
  try {
    const pillar = evaluateEChartsCategoricalContrast();
    contrast = pillar.contrast;
    contrastNote = pillar.contrastNote;
  } catch {
    contrast = 'unchecked';
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
function evaluateEChartsOperand(
  spec: NormalizedVizSpec,
  trait: string,
  operand: CertifyOperandResolved | undefined,
): EChartsOperandVerdict | { failure: { code: string; message: string } } {
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

  let accuracyPillar: 'pass' | 'fail' | 'unchecked' = 'unchecked';
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
    // reader is told to read 'pass' together with rulesEvaluated, and #781 records the
    // hole. On the new path there was no reason to inherit it.
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
    accuracyPillar = 'unchecked';
    accuracyNotes.push(
      `The accuracy rules could not be evaluated for this ${operand.chartType}; the pillar is reported unchecked rather than passed. ${echartsAccuracyRulesFor(operand.chartType).length} rules were offered.`,
    );
  }

  return {
    determinismPillar: outcome.stable ? 'pass' : 'fail',
    determinism: { stable: outcome.stable, contentHash: outcome.contentHash },
    accuracyPillar,
    ...(accuracySummary ? { accuracySummary } : {}),
    findings,
    notes: [determinismScopeNote(operand.chartType), ...accuracyNotes],
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
    const operandVerdict = evaluateEChartsOperand(spec, trait, operand);
    if ('failure' in operandVerdict) {
      return { status: 'error', errors: [operandVerdict.failure] };
    }
    // The 5 categorical types: grade the reconstructed baked OODS palette (s141 m02).
    if (ECHARTS_CATEGORICAL_TRAITS.has(trait)) {
      return echartsCategoricalVerdict(trait, operandVerdict);
    }
    // The 3 geo types: sequential/continuous color scale → WCAG-'exempt' (s141 m03).
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

    // DETERMINISM — compile to Vega-Lite twice, byte-compare the canonical form,
    // hash it. Pure function of the IR (mirrors viz.render.ts's contentHash), so the
    // same IR always yields the same verdict + hash. Capture the first compiled object
    // (reused below for both the canonical hash AND the contrast grade); KEEP the second
    // toVegaLiteSpec call — it IS the determinism proof (first === second), not a
    // redundant compile to optimize away.
    const compiled = toVegaLiteSpec(certifySpec);
    const first = canonicalize(compiled);
    const second = canonicalize(toVegaLiteSpec(certifySpec));
    const stable = first === second;
    const contentHash = sha256(first);

    // CONTRAST PILLAR (s137/s138/s139) — grades the color hexes the adapter BAKED into
    // the compiled spec (scale.range / mark.color), so certified == rendered by
    // construction. It is a read-only addition to certify's OWN output; contentHash
    // derives from an untouched toVegaLiteSpec, so render↔certify hash identity holds.
    // Defensive: a contrast-engine fault never turns a valid conformance verdict into
    // status:error — it degrades to 'unchecked'.
    let contrast: ContrastVerdict = 'unchecked';
    let contrastNote: string | undefined;
    try {
      const pillar = evaluateContrastPillar(certifySpec, compiled);
      contrast = pillar.contrast;
      contrastNote = pillar.contrastNote;
    } catch {
      contrast = 'unchecked';
    }

    // ACCURACY PILLAR (s170 m02, #818) — the four declared structural rules over the IR +
    // the compiled spec. certify stays a PURE READER: the evaluator mutates neither operand,
    // so `contentHash` above (taken over this same untouched `compiled`) is unmoved by it.
    // Defensive, mirroring contrast's :288-296 exactly: a rules-engine fault degrades the
    // pillar to 'unchecked' with a note — it NEVER turns a valid conformance verdict into a
    // status:error. Every finding maps into the EXISTING closed $defs/finding shape; the
    // ruleId is carried by the registered code, so the shape needs no new field.
    let accuracy: 'pass' | 'fail' | 'unchecked' = 'unchecked';
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
      accuracy = 'unchecked';
      accuracyNotes.push(
        `The accuracy rules could not be evaluated for this spec; the pillar is reported unchecked rather than passed. ${ACCURACY_RULES.length} rules were offered.`,
      );
    }

    // CONFORMANT ROLLUP (s140 [B]) — the headline gate an agent's `if(conformant)` reads
    // now folds the graded pillars, so it can no longer silently ship a contrast:'fail'
    // chart. ONLY contrast==='fail' pulls it false; 'exempt'/'unchecked'/'pass' leave it
    // a11y-driven (a gradient's 'exempt' and a no-color chart's 'unchecked' must not flip
    // conformant, so the s139 invariance lock holds). `stable` is inert (a pure compile is
    // always byte-stable) but folded in for semantic completeness. A scoped, monotonic
    // TIGHTENING (some inputs move true->false; none move false->true) — the cause of a
    // contrast-driven false is carried by pillars.contrast + contrastNote. Measured on the
    // light theme (dark-theme contrast OOS).
    //
    // s170 m02: accuracy folds in on DELIBERATE PARITY with contrast — only 'fail' pulls
    // conformant false, so 'unchecked' passes. That inherits the #781 hole Derek declined to
    // fix, which now spans TWO pillars rather than one; it is backlog, recorded here so the
    // parity is a stated choice and not an oversight.
    const conformant = a11yConformant && contrast !== 'fail' && accuracy !== 'fail' && stable;

    return {
      status: 'ok',
      coverage: 'certified',
      conformant,
      findings,
      determinism: { stable, contentHash },
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
