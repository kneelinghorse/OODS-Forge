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

import { canonicalize, sha256 } from '@oods/artifacts';
import {
  assertNormalizedVizSpec,
  toVegaLiteSpec,
  validateVizEquivalenceRules,
  type NormalizedVizSpec,
} from '@oods/viz-core';
import { isEChartsPrimaryMarkTrait } from './echarts-primary.js';
import { evaluateContrastPillar, type ContrastVerdict } from './certify-contrast.js';

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
 * Per-pillar tri-state summary (s137). A reader can never misread conformant:true as
 * "contrast passed" — each governed pillar reports its own verdict alongside it.
 * a11yEquivalence mirrors `conformant`; determinism mirrors `determinism.stable`;
 * contrast is the rendered-reality palette verdict — the OODS palette Forge bakes into
 * the compiled spec (s138) — with 'exempt' for gradient scales.
 */
export interface CertifyPillars {
  readonly a11yEquivalence: 'pass' | 'fail' | 'unchecked';
  readonly determinism: 'pass' | 'fail' | 'unchecked';
  readonly contrast: ContrastVerdict;
}

export interface ArtifactCertifyOutput {
  readonly status: 'ok' | 'error';
  readonly coverage?: 'certified' | 'uncertified';
  /** boolean on the certified path; null on the uncertified path; absent on error. */
  readonly conformant?: boolean | null;
  readonly findings?: CertifyFinding[];
  readonly determinism?: CertifyDeterminism;
  /** Per-pillar tri-state summary (s137). Present on both ok paths; absent on error. */
  readonly pillars?: CertifyPillars;
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

/** The honest uncertified verdict (ECharts-primary OR an unmodeled cartesian trait). */
function uncertifiedVerdict(notes: string[]): ArtifactCertifyOutput {
  return {
    status: 'ok',
    coverage: 'uncertified',
    conformant: null,
    findings: [],
    // Every pillar is genuinely unchecked: there is no Vega-Lite compile (so no
    // a11y-equivalence + no determinism proof), and contrast is not evaluated for a
    // non-cartesian / unmodeled mark.
    pillars: { a11yEquivalence: 'unchecked', determinism: 'unchecked', contrast: 'unchecked' },
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
  // equivalence check + no determinism proof; contrast (role-C') ships with the
  // ECharts-primary breadth arc. A DISTINCT verdict, not a failure.
  if (trait && isEChartsPrimaryMarkTrait(trait)) {
    return uncertifiedVerdict([
      `${trait} is an ECharts-primary mark; a11y-equivalence certification is cartesian-only (the Vega-Lite path). The accessible table + narrative are still generated but not equivalence-verified.`,
      `Contrast is not checked for ECharts-primary types — touching-mark (role-C') contrast ships with the ECharts-primary breadth arc.`,
    ]);
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
    const conformant = failures.every((rule) => rule.severity !== 'error');
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

    return {
      status: 'ok',
      coverage: 'certified',
      conformant,
      findings,
      determinism: { stable, contentHash },
      pillars: {
        a11yEquivalence: conformant ? 'pass' : 'fail',
        determinism: stable ? 'pass' : 'fail',
        contrast,
      },
      ...(contrastNote ? { contrastNote } : {}),
    };
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    const code = name === 'VegaLiteAdapterError' ? 'OODS-V127' : 'OODS-V129';
    return errorVerdict(code, err);
  }
}
