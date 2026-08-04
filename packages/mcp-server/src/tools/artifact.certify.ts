// artifact.certify — the "certify" half of generate-AND-certify (sprint-136 m02).
//
// An agent hands in a Forge NormalizedVizSpec IR and gets back a conformance
// verdict + a re-emit determinism proof + a contentHash. certify is a READER of
// the IR: it never rebuilds, re-recommends, or re-encodes (#110). It reuses the
// exact same equivalence engine (validateVizEquivalenceRules) and determinism
// transform (toVegaLiteSpec -> canonicalize -> sha256) that viz.render runs, so
// for a Forge-generated IR certify's contentHash equals the hash viz.render emits.
//
// Coverage-honest: a11y-equivalence certification is CARTESIAN-ONLY (the Vega-Lite
// path). The 8 ECharts-primary types (treemap/sunburst/sankey/... — classified
// from the IR's first mark trait) return coverage:'uncertified' / conformant:null,
// a DISTINCT verdict, not a failure. Contrast is a graded pillar (s137/s138/s139):
// certify reads the color hexes the vega-lite adapter BAKED into the compiled cartesian
// spec (scale.range / mark.color) and grades them against the canvas — so contrast
// reflects the bytes Forge actually renders, and a chart that baked no OODS palette can
// never certify contrast:'pass'. The verdict is a pure function of the input IR — no
// Date/random/UUID.
//
// Accuracy is a graded pillar too as of s170 (#818 — the fourth #977 pillar): on the
// certified path certify evaluates FOUR declared structural rules (non-zero bar baseline,
// dual axis, area-encodes-linear, aggregation-hiding) over the IR and the compiled spec it
// already produced, and nothing else. No scorer, no corpus, no render step — #110 holds:
// the rules read, they never rebuild. `accuracy:'pass'` means none of those four
// distortions was POSITIVELY detected, with accuracySummary.rulesEvaluated reporting how
// many of the four actually resolved their operand; it is not a claim that the chart is
// accurate.

import { canonicalize, sha256 } from '@oods/artifacts';
import {
  ACCURACY_RULES,
  assertNormalizedVizSpec,
  evaluateAccuracyRules,
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

export interface ArtifactCertifyInput {
  /** A Forge NormalizedVizSpec IR (validated authoritatively by assertNormalizedVizSpec). */
  readonly spec: unknown;
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
 * Per-pillar tri-state summary (s137, extended s170). The pillars DISAGGREGATE which pillar drove the
 * folded `conformant` gate (s140 [B]): a11yEquivalence mirrors the a11y-equivalence
 * sub-result (NOT the folded conformant); determinism mirrors `determinism.stable`;
 * contrast is the rendered-reality verdict — the categorical color bytes Forge baked
 * into the compiled spec (s138) — with 'exempt' for gradient scales. So a reader can
 * always see WHY conformant is false (an a11y error vs a contrast fail).
 */
export interface CertifyPillars {
  readonly a11yEquivalence: 'pass' | 'fail' | 'unchecked';
  readonly determinism: 'pass' | 'fail' | 'unchecked';
  readonly contrast: ContrastVerdict;
  /**
   * The four declared structural accuracy rules (s170, #818 — the fourth #977 pillar).
   * Its own THREE-state enum; contrast's four-state one (which carries 'exempt') is untouched.
   */
  readonly accuracy: 'pass' | 'fail' | 'unchecked';
}

/**
 * How the accuracy pillar was reached (s170). `rulesEvaluated` is the examined-count the
 * contrast pillar never shipped (#1412): a rule whose operand certify could not resolve is
 * NOT counted and explains itself in notes[], so `accuracy:'pass'` can never be read as
 * "all four rules ran" when they did not.
 */
export interface CertifyAccuracySummary {
  readonly rulesEvaluated: number;
  readonly failing: number;
}

export interface ArtifactCertifyOutput {
  readonly status: 'ok' | 'error';
  readonly coverage?: 'certified' | 'uncertified';
  /**
   * The folded conformance gate (s140 [B], extended s170): true iff a11y-equivalence has
   * zero error-severity failures AND contrast is not 'fail' AND accuracy is not 'fail' AND
   * determinism is stable — measured on the light theme (dark-theme contrast unverified).
   * null on the uncertified path (no claim); absent on error. A contrast- or accuracy-driven
   * false is explained by pillars + contrastNote + the OODS-V15x findings.
   */
  readonly conformant?: boolean | null;
  /**
   * One entry per failing rule. s170: this carries TWO rule families, told apart by code —
   * a11y-equivalence (OODS-A11Y-<rule.id>) and accuracy (OODS-V150..V153). It is no longer
   * a11y-equivalence-only, and the descriptions that said so have been updated in step.
   */
  readonly findings?: CertifyFinding[];
  readonly determinism?: CertifyDeterminism;
  /** Per-pillar tri-state summary (s137, extended s170). Present on both ok paths; absent on error. */
  readonly pillars?: CertifyPillars;
  /** How the accuracy pillar was reached (s170). Certified path only, mirroring `determinism`. */
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
// essential exception applies → contrast:'exempt' (s141 m03, role-B). NOTE: bubble_map's
// ordinal-categorical color branch is NOT graded — that range lives in the geo DATA branch,
// outside this metadata IR (the IR cannot express scale:'ordinal'/range), so it is invisible
// to certify; grading it needs a frozen input-schema sub-arc (Derek: exempt-all-geo).
const ECHARTS_GEO_EXEMPT_TRAITS: ReadonlySet<string> = new Set([
  'MarkChoropleth',
  'MarkFlow',
  'MarkBubble',
]);

// The a11y-equivalence note shared by every ECharts-primary verdict — the accessible table
// + narrative are generated but NOT equivalence-verified (cartesian-only).
const echartsA11yNote = (trait: string): string =>
  `${trait} is an ECharts-primary mark; a11y-equivalence certification is cartesian-only (the Vega-Lite path). The accessible table + narrative are still generated but not equivalence-verified.`;

/**
 * Shared shape for an ECharts-primary verdict that now carries a REAL contrast pillar
 * (s141): coverage:'uncertified' + conformant:null (Design A — no Vega compile, so no
 * a11y-equivalence claim + no determinism proof), the a11y note retained, and
 * pillars.contrast + contrastNote carrying the graded verdict. The pre-s141 "contrast not
 * checked" note is DROPPED (contrast IS now graded — the rationale moves to contrastNote).
 */
function echartsContrastVerdict(
  trait: string,
  contrast: ContrastVerdict,
  contrastNote: string | undefined,
): ArtifactCertifyOutput {
  return {
    status: 'ok',
    coverage: 'uncertified',
    conformant: null,
    findings: [],
    // accuracy is genuinely unchecked here: the four rules read the compiled Vega-Lite spec,
    // and an ECharts-primary type has none (s170).
    pillars: { a11yEquivalence: 'unchecked', determinism: 'unchecked', contrast, accuracy: 'unchecked' },
    notes: [echartsA11yNote(trait)],
    ...(contrastNote ? { contrastNote } : {}),
  };
}

/** s141 m02 — grade the baked OODS categorical palette (role-C + role-A → 'pass'). */
function echartsCategoricalVerdict(trait: string): ArtifactCertifyOutput {
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
  return echartsContrastVerdict(trait, contrast, contrastNote);
}

/** s141 m03 — geo color is a sequential/continuous scale → WCAG-exempt (role-B). */
function echartsGeoExemptVerdict(trait: string): ArtifactCertifyOutput {
  return echartsContrastVerdict(trait, 'exempt', ECHARTS_GEO_EXEMPT_NOTE);
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

  // ECharts-primary (treemap/sunburst/sankey/...): no Vega-Lite compile, so no
  // equivalence check + no determinism proof — coverage stays 'uncertified'. A DISTINCT
  // verdict, not a failure.
  if (trait && isEChartsPrimaryMarkTrait(trait)) {
    // The 5 categorical types: grade the reconstructed baked OODS palette (s141 m02).
    // Design A — only pillars.contrast gains a real verdict; coverage/conformant/
    // a11yEquivalence/determinism are unchanged.
    if (ECHARTS_CATEGORICAL_TRAITS.has(trait)) {
      return echartsCategoricalVerdict(trait);
    }
    // The 3 geo types: sequential/continuous color scale → WCAG-'exempt' (s141 m03).
    if (ECHARTS_GEO_EXEMPT_TRAITS.has(trait)) {
      return echartsGeoExemptVerdict(trait);
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
