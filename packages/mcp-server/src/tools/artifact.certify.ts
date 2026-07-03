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
// a DISTINCT verdict, not a failure. Contrast is a documented OPEN pillar (a
// NormalizedVizSpec carries no resolved mark colors); certify claims only what an
// IR can prove. The verdict is a pure function of the input IR — no Date/random/UUID.

import { canonicalize, sha256 } from '@oods/artifacts';
import {
  assertNormalizedVizSpec,
  toVegaLiteSpec,
  validateVizEquivalenceRules,
  type NormalizedVizSpec,
} from '@oods/viz-core';
import { isEChartsPrimaryMarkTrait } from './echarts-primary.js';

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

export interface ArtifactCertifyOutput {
  readonly status: 'ok' | 'error';
  readonly coverage?: 'certified' | 'uncertified';
  /** boolean on the certified path; null on the uncertified path; absent on error. */
  readonly conformant?: boolean | null;
  readonly findings?: CertifyFinding[];
  readonly determinism?: CertifyDeterminism;
  readonly notes?: string[];
  readonly errors?: { readonly code: string; readonly message: string }[];
}

function errorVerdict(code: string, err: unknown): ArtifactCertifyOutput {
  const message = err instanceof Error ? err.message : String(err);
  return { status: 'error', errors: [{ code, message }] };
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
  // ECharts-primary from the first mark's trait (shared source of truth with
  // viz.render's dispatch via ./echarts-primary.ts). These types have no Vega-Lite
  // compile, so there is no equivalence check and no determinism proof to give.
  const trait = spec.marks[0]?.trait;
  if (trait && isEChartsPrimaryMarkTrait(trait)) {
    return {
      status: 'ok',
      coverage: 'uncertified',
      conformant: null,
      findings: [],
      notes: [
        `${trait} is an ECharts-primary mark; a11y-equivalence certification is cartesian-only (the Vega-Lite path). The accessible table + narrative are still generated but not equivalence-verified.`,
      ],
    };
  }

  try {
    // CONFORMANCE — mirror viz.render.ts's partition exactly: every failing rule
    // becomes a finding keyed OODS-A11Y-<rule.id>; conformant iff zero error-severity
    // failures. NEVER assertVizEquivalence (it throws on error-severity → would lose
    // per-rule codes).
    const failures = validateVizEquivalenceRules(spec).filter((rule) => !rule.passed);
    const conformant = failures.every((rule) => rule.severity !== 'error');
    const findings: CertifyFinding[] = failures.map((rule) => ({
      code: `OODS-A11Y-${rule.id}`,
      severity: rule.severity,
      message: rule.message ?? rule.summary,
    }));

    // DETERMINISM — compile to Vega-Lite twice, byte-compare the canonical form,
    // hash it. Pure function of the IR (mirrors viz.render.ts's contentHash), so the
    // same IR always yields the same verdict + hash.
    const first = canonicalize(toVegaLiteSpec(spec));
    const second = canonicalize(toVegaLiteSpec(spec));
    const stable = first === second;
    const contentHash = sha256(first);

    return {
      status: 'ok',
      coverage: 'certified',
      conformant,
      findings,
      determinism: { stable, contentHash },
    };
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    const code = name === 'VegaLiteAdapterError' ? 'OODS-V127' : 'OODS-V129';
    return errorVerdict(code, err);
  }
}
