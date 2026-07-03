// certify contrast pillar — the RENDERED-REALITY contrast engine (s137 m02; s138 m03).
//
// certify grows a contrast pillar that grades the OODS viz-scale palette Forge BAKES
// into the compiled cartesian spec (s138 m02), against the canvas, per the memo
// §2/§3/§3a rule set. It is a pure, deterministic reader of the IR: it resolves the
// palette the chart actually renders via the SHARED resolveCategoricalPalette
// (@oods/viz-core) — the SAME resolver the vega-lite adapter bakes from, so the graded
// hexes are byte-identical to the rendered scale.range (certified == baked) and honor
// any agent config.tokens override — then evaluates three roles:
//
//   role-C (WCAG 1.4.11 NORMATIVE) — every consumed mark >= 3:1 vs the canvas.
//   role-A (best-practice)         — min-pairwise CIEDE2000 (min over normal +
//                                     deuteran/protan/tritan Machado CVD) across the
//                                     consumed categorical slots. <2 fail; 2-10 pass
//                                     with a distinguishability warn; >=10 clean pass.
//   role-B (WCAG-EXEMPT)           — a sequential/diverging color scale is the
//                                     essential-exception gradient -> 'exempt' + a
//                                     note pointing at Forge's generated data table.
//
// WHY rendered-reality (s138): the compiled cartesian spec now carries the resolved
// OODS palette by construction — scale.range for a multi-series color channel,
// mark.color for a single-series chart — so certify grades what Forge RENDERS, not a
// declared intent (this dissolves the s137-review C1/C2 relocated-hollow). The one
// remaining caveat is theme: resolveTokenToColor is theme-blind (light-only), so
// dark-theme contrast is unverified/OOS.

import Color from 'colorjs.io';
import { contrastRatio, normaliseColor } from '@oods/a11y-tools';
import { resolveCategoricalPalette, resolveTokenToColor, type NormalizedVizSpec } from '@oods/viz-core';
import { CVD_TYPES, simulateCvd } from './cvd-machado.js';

export type ContrastVerdict = 'pass' | 'fail' | 'unchecked' | 'exempt';

export interface ContrastPillarResult {
  readonly contrast: ContrastVerdict;
  /** The rendered-contrast caveat (pass/fail) or the role-specific rationale. */
  readonly contrastNote?: string;
}

// The concrete light-theme canvas the role-C mark-vs-background check measures
// against (resolveTokenToColor is theme-blind/light-only). This token resolves to
// #FCFCFD and reproduces the memo §1 role-C numbers exactly.
const CANVAS_TOKEN = '--oods-sys-surface-canvas';

// OODS viz-scale categorical palette: 6 slots. certify resolves the slots the chart
// actually consumes (= categorical cardinality) — the SAME palette the adapter bakes.
const CATEGORICAL_SLOTS = 6;
const categoricalToken = (slot1: number): string =>
  `--oods-viz-scale-categorical-${String(slot1).padStart(2, '0')}`;

// Role thresholds (memo §2/§3a).
const ROLE_C_MIN_RATIO = 3; // WCAG 1.4.11 non-text contrast (mark vs background)
const ROLE_A_FAIL_DELTA_E = 2; // < 2 -> indistinguishable -> fail
const ROLE_A_CLEAN_DELTA_E = 10; // >= 10 -> clean pass; 2-10 -> pass + warn note

const RENDERED_CONTRAST_CAVEAT =
  'certify measures the OODS viz-scale palette Forge bakes into the compiled spec, ' +
  'on the light theme; dark-theme contrast is not verified.';

type ColorRole = 'categorical' | 'continuous' | 'none';

/** A viz spec's color encoding lives on the top-level encoding or the first mark. */
function colorBinding(spec: NormalizedVizSpec) {
  return spec.encoding?.color ?? spec.marks[0]?.encodings?.color;
}

/**
 * Classify the palette role deterministically from the IR's color channel — from
 * the encoding's declared type/scale, NEVER from the colors (memo §3).
 */
function colorRole(spec: NormalizedVizSpec): ColorRole {
  const color = colorBinding(spec);
  if (!color) return 'none';
  if (color.type === 'quantitative' || color.type === 'temporal') return 'continuous';
  if (color.type === 'nominal' || color.type === 'ordinal') return 'categorical';
  const scale = color.scale;
  if (scale === 'linear' || scale === 'log' || scale === 'sqrt' || scale === 'temporal') return 'continuous';
  // band/point or an unqualified color channel over a field -> categorical (nominal).
  return 'categorical';
}

function distinctCount(values: Array<Record<string, unknown>> | undefined, field: string): number {
  if (!values || values.length === 0) return 0;
  const seen = new Set<string>();
  for (const row of values) {
    const v = row[field];
    if (v !== undefined && v !== null) seen.add(String(v));
  }
  return seen.size;
}

/** config.tokens overrides, keyed by the `--`-prefixed token name. */
function overrideMap(spec: NormalizedVizSpec): Map<string, string> {
  const out = new Map<string, string>();
  const tokens = spec.config?.tokens;
  if (!tokens) return out;
  for (const [k, v] of Object.entries(tokens)) {
    if (typeof v !== 'string') continue; // numeric overrides are not colors
    out.set(k.startsWith('--') ? k : `--${k}`, v);
  }
  return out;
}

/** Resolve a token to hex, honoring an agent config.tokens override; undefined if unresolvable. */
function resolveSlotHex(token: string, overrides: Map<string, string>): string | undefined {
  const raw = overrides.get(token) ?? resolveTokenToColor(token);
  if (!raw) return undefined;
  try {
    return normaliseColor(raw, token); // rgb()/oklch->hex bridge (throws on non-color)
  } catch {
    return undefined;
  }
}

function deltaE2000(aHex: string, bHex: string): number {
  return new Color(aHex).deltaE(new Color(bHex), '2000');
}

/** min over all pairs of min-over-CVD CIEDE2000 — the cols4all categorical metric. */
function minPairwiseDeltaEOverCvd(hexes: readonly string[]): number {
  let min = Infinity;
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      let d = deltaE2000(hexes[i], hexes[j]);
      for (const type of CVD_TYPES) {
        d = Math.min(d, deltaE2000(simulateCvd(hexes[i], type), simulateCvd(hexes[j], type)));
      }
      min = Math.min(min, d);
    }
  }
  return min;
}

/**
 * Evaluate the contrast pillar for a (cartesian) NormalizedVizSpec IR. Pure +
 * deterministic. Never throws — an unresolvable canvas/palette yields an honest
 * 'unchecked', not a silent pass.
 */
export function evaluateContrastPillar(spec: NormalizedVizSpec): ContrastPillarResult {
  // Role B (sequential/diverging continuous color): WCAG essential-exception exempt.
  if (colorRole(spec) === 'continuous') {
    return {
      contrast: 'exempt',
      contrastNote:
        'Sequential/diverging color scale — WCAG 1.4.11 essential exception (gradient); ' +
        "Forge's generated accessible data table is the guarantee. " + RENDERED_CONTRAST_CAVEAT,
    };
  }

  const overrides = overrideMap(spec);
  const canvasHex = resolveSlotHex(CANVAS_TOKEN, overrides);

  // How many categorical slots the chart consumes (= cardinality of the color field);
  // a single-series chart with no color encoding consumes just slot 01.
  let slotCount = 1;
  if (colorRole(spec) === 'categorical') {
    const field = colorBinding(spec)?.field;
    const n = field ? distinctCount(spec.data?.values, field) : 0;
    slotCount = Math.min(Math.max(n, 1), CATEGORICAL_SLOTS);
  }

  // Grade the SAME palette the vega-lite adapter BAKES (s138 m03): the shared
  // resolveCategoricalPalette returns the full resolved OODS range honoring config.tokens,
  // and the chart consumes its first `slotCount` slots (Vega maps domain[i]->range[i], so
  // series beyond the sample cardinality are not rendered). Zipping restores the per-slot
  // token label for the role-C failure note. certified == baked BY CONSTRUCTION — one resolver.
  const slots = resolveCategoricalPalette(spec)
    .slice(0, slotCount)
    .map((hex, i) => ({ token: categoricalToken(i + 1), hex }));

  // Could not resolve the palette or the canvas -> honest 'unchecked' (no silent pass).
  if (slots.length === 0 || !canvasHex) {
    return {
      contrast: 'unchecked',
      contrastNote:
        'Could not resolve the viz-scale palette or canvas token for this IR. ' + RENDERED_CONTRAST_CAVEAT,
    };
  }

  // Role C (WCAG-normative): every consumed mark >= 3:1 vs the canvas.
  const roleCFailures = slots.filter((s) => contrastRatio(s.hex, canvasHex) < ROLE_C_MIN_RATIO);
  if (roleCFailures.length > 0) {
    const which = roleCFailures.map((s) => s.token).join(', ');
    return {
      contrast: 'fail',
      contrastNote:
        `Role-C (WCAG 1.4.11) fail: ${which} below ${ROLE_C_MIN_RATIO}:1 vs the canvas. ` + RENDERED_CONTRAST_CAVEAT,
    };
  }

  // Role A (best-practice): categorical distinguishability, min-over-CVD.
  const roleAMin = slots.length >= 2 ? minPairwiseDeltaEOverCvd(slots.map((s) => s.hex)) : Infinity;
  if (roleAMin < ROLE_A_FAIL_DELTA_E) {
    return {
      contrast: 'fail',
      contrastNote:
        `Role-A fail: min-pairwise CIEDE2000 (min over normal + deuteran/protan/tritan CVD) = ` +
        `${roleAMin.toFixed(2)} < ${ROLE_A_FAIL_DELTA_E} — categorical series are not distinguishable. ` +
        RENDERED_CONTRAST_CAVEAT,
    };
  }
  if (roleAMin < ROLE_A_CLEAN_DELTA_E) {
    return {
      contrast: 'pass',
      contrastNote:
        `Distinguishability caution: min-pairwise CIEDE2000 (min-over-CVD) = ${roleAMin.toFixed(2)} ` +
        `(below the ${ROLE_A_CLEAN_DELTA_E} best-practice target but >= ${ROLE_A_FAIL_DELTA_E}, so not a failure). ` +
        RENDERED_CONTRAST_CAVEAT,
    };
  }
  return { contrast: 'pass', contrastNote: RENDERED_CONTRAST_CAVEAT };
}
