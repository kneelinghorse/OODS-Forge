// certify contrast pillar — the DECLARED-INTENT contrast engine (s137 m02).
//
// certify grows a contrast pillar that certifies the DECLARED OODS viz-scale palette
// (the colors Forge INTENDS) against the canvas, per the memo §2/§3/§3a rule set.
// It is a pure, deterministic reader of the IR: it resolves the palette slots the
// chart consumes via resolveTokenToColor (applying any agent-supplied config.tokens
// override), converts rgb->hex via @oods/a11y-tools normaliseColor, and evaluates
// three roles:
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
// WHY declared-intent: the compiled cartesian Vega-Lite spec is colorless by design
// (prepareSpecForBrand is an identity no-op — memo §0/§11), so certify verifies the
// INTENDED palette with an explicit caveat that final rendered contrast depends on
// the client applying the token range/theme. resolveTokenToColor is theme-blind
// (light-only); dark-theme contrast is OOS.

import Color from 'colorjs.io';
import { contrastRatio, normaliseColor } from '@oods/a11y-tools';
import { resolveTokenToColor, type NormalizedVizSpec } from '@oods/viz-core';
import { CVD_TYPES, simulateCvd } from './cvd-machado.js';

export type ContrastVerdict = 'pass' | 'fail' | 'unchecked' | 'exempt';

export interface ContrastPillarResult {
  readonly contrast: ContrastVerdict;
  /** The declared-intent caveat (pass/fail) or the role-specific rationale. */
  readonly contrastNote?: string;
}

// The concrete light-theme canvas the role-C mark-vs-background check measures
// against (resolveTokenToColor is theme-blind/light-only). This token resolves to
// #FCFCFD and reproduces the memo §1 role-C numbers exactly.
const CANVAS_TOKEN = '--oods-sys-surface-canvas';

// OODS viz-scale categorical palette: 6 slots. certify resolves the slots the chart
// actually consumes (= categorical cardinality), the DECLARED palette.
const CATEGORICAL_SLOTS = 6;
const categoricalToken = (slot1: number): string =>
  `--oods-viz-scale-categorical-${String(slot1).padStart(2, '0')}`;

// Role thresholds (memo §2/§3a).
const ROLE_C_MIN_RATIO = 3; // WCAG 1.4.11 non-text contrast (mark vs background)
const ROLE_A_FAIL_DELTA_E = 2; // < 2 -> indistinguishable -> fail
const ROLE_A_CLEAN_DELTA_E = 10; // >= 10 -> clean pass; 2-10 -> pass + warn note

const DECLARED_INTENT_CAVEAT =
  'certify verifies the DECLARED OODS viz-scale palette on the light theme; final ' +
  'rendered contrast depends on the client applying the token range/theme.';

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
 * deterministic. Never throws — an unresolvable palette yields an honest
 * 'unchecked', not a silent pass.
 */
export function evaluateContrastPillar(spec: NormalizedVizSpec): ContrastPillarResult {
  // Role B (sequential/diverging continuous color): WCAG essential-exception exempt.
  if (colorRole(spec) === 'continuous') {
    return {
      contrast: 'exempt',
      contrastNote:
        'Sequential/diverging color scale — WCAG 1.4.11 essential exception (gradient); ' +
        "Forge's generated accessible data table is the guarantee. " + DECLARED_INTENT_CAVEAT,
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

  const slots: Array<{ token: string; hex: string }> = [];
  for (let i = 1; i <= slotCount; i++) {
    const token = categoricalToken(i);
    const hex = resolveSlotHex(token, overrides);
    if (hex) slots.push({ token, hex });
  }

  // Could not resolve the palette or the canvas -> honest 'unchecked' (no silent pass).
  if (slots.length === 0 || !canvasHex) {
    return {
      contrast: 'unchecked',
      contrastNote:
        'Could not resolve the declared viz-scale palette or canvas token for this IR. ' + DECLARED_INTENT_CAVEAT,
    };
  }

  // Role C (WCAG-normative): every consumed mark >= 3:1 vs the canvas.
  const roleCFailures = slots.filter((s) => contrastRatio(s.hex, canvasHex) < ROLE_C_MIN_RATIO);
  if (roleCFailures.length > 0) {
    const which = roleCFailures.map((s) => s.token).join(', ');
    return {
      contrast: 'fail',
      contrastNote:
        `Role-C (WCAG 1.4.11) fail: ${which} below ${ROLE_C_MIN_RATIO}:1 vs the canvas. ` + DECLARED_INTENT_CAVEAT,
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
        DECLARED_INTENT_CAVEAT,
    };
  }
  if (roleAMin < ROLE_A_CLEAN_DELTA_E) {
    return {
      contrast: 'pass',
      contrastNote:
        `Distinguishability caution: min-pairwise CIEDE2000 (min-over-CVD) = ${roleAMin.toFixed(2)} ` +
        `(below the ${ROLE_A_CLEAN_DELTA_E} best-practice target but >= ${ROLE_A_FAIL_DELTA_E}, so not a failure). ` +
        DECLARED_INTENT_CAVEAT,
    };
  }
  return { contrast: 'pass', contrastNote: DECLARED_INTENT_CAVEAT };
}
