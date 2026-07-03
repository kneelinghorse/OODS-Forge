// certify contrast pillar — the RENDERED-REALITY contrast engine (s137 m02; s138 m03;
// s139 m02).
//
// certify grades the OODS viz-scale palette Forge BAKES into the compiled cartesian
// Vega-Lite spec, against the canvas, per the memo §2/§3/§3a rule set. As of s139 it
// reads the color hexes off the COMPILED spec's emitted bytes (scale.range for a
// multi-series color channel, mark.color for a single-series chart) rather than
// re-classifying the raw IR and re-resolving the palette. There is no second classifier
// left to disagree with the adapter's bake gate, so `certified == rendered` BY
// CONSTRUCTION: if the compiled spec baked NO OODS palette for a color-bearing chart,
// certify cannot return contrast:'pass' (the s138-review classifier-mismatch false-pass
// is structurally dissolved). It evaluates three roles:
//
//   role-C (WCAG 1.4.11 NORMATIVE) — every consumed mark >= 3:1 vs the canvas.
//   role-A (best-practice)         — min-pairwise CIEDE2000 (min over normal +
//                                     deuteran/protan/tritan Machado CVD) across the
//                                     consumed categorical slots. <2 fail; 2-10 pass
//                                     with a distinguishability warn; >=10 clean pass.
//   role-B (WCAG-EXEMPT)           — a color channel that baked NO categorical palette
//                                     (a sequential/diverging gradient, or a divergence/
//                                     mistype that renders on a continuous/default scale)
//                                     is the essential-exception gradient -> 'exempt'.
//
// WHY read the compiled bytes (s139): the bake gate (vega-lite-adapter.ts convertBinding)
// and the old grade-side classifier (colorRole) were two INDEPENDENT, disagreeing
// classifiers — a schema-valid color binding the bake left quantitative (trait
// 'EncodingDetail', a typo 'EncodingColour', a bare 'Color', +timeUnit/+aggregate,
// EncodingSize-on-color) compiled to a palette-LESS spec, yet the grader re-resolved the
// 6-slot palette and returned contrast:'pass'. Grading the emitted ground truth removes
// the second classifier entirely. The one remaining caveat is theme: resolveTokenToColor
// is theme-blind (light-only), so dark-theme contrast is unverified/OOS.

import Color from 'colorjs.io';
import { contrastRatio, normaliseColor } from '@oods/a11y-tools';
import { resolveTokenToColor, type NormalizedVizSpec, type VegaLiteAdapterSpec } from '@oods/viz-core';
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

// OODS viz-scale categorical palette: 6 slots. certify grades the slots the chart
// actually consumes (= categorical cardinality) — read off the baked scale.range.
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

// A color channel exists but the adapter baked NO OODS categorical palette (no
// scale.range, no OODS mark.color): the chart renders as a continuous/default color
// scale — a legit sequential/diverging gradient, OR a divergence/mistype (a color
// binding the bake gate left quantitative). Either way there is no discrete palette to
// contrast-check, so WCAG 1.4.11's essential exception applies (memo §3 case 3 / fork A).
const EXEMPT_NOTE =
  'No OODS categorical palette was baked into the compiled color scale — the chart renders ' +
  'as a continuous/default color scale (WCAG 1.4.11 gradient essential exception); ' +
  "Forge's generated accessible data table is the guarantee. " + RENDERED_CONTRAST_CAVEAT;

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

interface CompiledUnit {
  readonly mark?: unknown;
  readonly encoding?: Record<string, unknown>;
}

/**
 * The compiled Vega-Lite spec carries its mark + encoding at the top level
 * ({mark,encoding}), inside a layer array ({layer:[{mark,encoding},…]}), or — for a
 * faceted/concat layout — nested under `spec` / a concat container
 * (vega-lite-layout-mapper.ts). Walk to the first unit node so the grader reads the
 * color bytes Forge actually baked regardless of layout, never re-deriving from the IR.
 */
function compiledColorUnit(node: unknown): CompiledUnit | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const rec = node as Record<string, unknown>;
  if ('mark' in rec || 'encoding' in rec) {
    return { mark: rec.mark, encoding: rec.encoding as Record<string, unknown> | undefined };
  }
  if (Array.isArray(rec.layer) && rec.layer.length > 0) return compiledColorUnit(rec.layer[0]);
  if (rec.spec) return compiledColorUnit(rec.spec);
  for (const key of ['hconcat', 'vconcat', 'concat'] as const) {
    const sections = rec[key];
    if (Array.isArray(sections) && sections.length > 0) return compiledColorUnit(sections[0]);
  }
  return undefined;
}

/** Grade a resolved slot set (role-C vs canvas, then role-A distinguishability). */
function gradeCategorical(
  slots: ReadonlyArray<{ readonly token: string; readonly hex: string }>,
  canvasHex: string | undefined,
): ContrastPillarResult {
  // Could not resolve the canvas (or nothing to grade) -> honest 'unchecked', never a
  // silent pass.
  if (slots.length === 0 || !canvasHex) {
    return {
      contrast: 'unchecked',
      contrastNote:
        'Could not resolve the canvas token for this IR. ' + RENDERED_CONTRAST_CAVEAT,
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

  // Role A (best-practice): categorical distinguishability, min-over-CVD. A single
  // consumed slot has no pair to compare -> role-A N/A.
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

/**
 * Evaluate the contrast pillar for a (cartesian) NormalizedVizSpec IR by grading the
 * color hexes the adapter BAKED into `compiled` (s139 — reads emitted bytes, not a
 * re-classification of the raw IR). Pure + deterministic. Never returns 'pass' for a
 * chart whose compiled spec baked no OODS palette (memo §3 governing rule).
 *
 * `spec` is retained ONLY for the canvas token (config.tokens override -> role-C
 * reference; the canvas is not in the compiled spec) and the cardinality slice
 * (distinctCount over spec.data.values). All color hexes come from `compiled`.
 */
export function evaluateContrastPillar(
  spec: NormalizedVizSpec,
  compiled: VegaLiteAdapterSpec,
): ContrastPillarResult {
  const unit = compiledColorUnit(compiled);
  const colorEnc = unit?.encoding?.color as Record<string, unknown> | undefined;
  const markColor =
    typeof (unit?.mark as Record<string, unknown> | undefined)?.color === 'string'
      ? ((unit!.mark as Record<string, unknown>).color as string)
      : undefined;

  const scale = colorEnc?.scale as Record<string, unknown> | undefined;
  const rangeRaw = scale?.range;
  const range =
    Array.isArray(rangeRaw) && rangeRaw.length > 0 && rangeRaw.every((h) => typeof h === 'string')
      ? (rangeRaw as string[])
      : undefined;

  const canvasHex = resolveSlotHex(CANVAS_TOKEN, overrideMap(spec));

  // CASE 1 — categorical: the adapter baked a hex range into the compiled color scale.
  // Grade it sliced to the consumed cardinality (Vega maps domain[i]->range[i], so
  // series beyond the sample cardinality are not rendered — grading the full 6 would be
  // LESS rendered-accurate; the slice is load-bearing, memo §5).
  if (range) {
    const field = typeof colorEnc?.field === 'string' ? (colorEnc.field as string) : undefined;
    const n = field ? distinctCount(spec.data?.values, field) : 0;
    const slotCount = Math.min(Math.max(n, 1), Math.min(range.length, CATEGORICAL_SLOTS));
    const slots = range.slice(0, slotCount).map((hex, i) => ({ token: categoricalToken(i + 1), hex }));
    return gradeCategorical(slots, canvasHex);
  }

  // CASE 2 — single-series: no color channel, so the adapter baked categorical-01 as
  // mark.color. Role-C that one hex vs the canvas; role-A is N/A (needs >= 2 slots).
  if (markColor) {
    return gradeCategorical([{ token: categoricalToken(1), hex: markColor }], canvasHex);
  }

  // CASE 3 — a color channel exists but NO OODS categorical palette was baked (gradient,
  // or a divergence/mistype rendering on a continuous/default scale): WCAG-exempt.
  if (colorEnc) {
    return { contrast: 'exempt', contrastNote: EXEMPT_NOTE };
  }

  // CASE 4 — no color to grade at all (or an empty/pathological palette): honest
  // 'unchecked', never a silent pass.
  return {
    contrast: 'unchecked',
    contrastNote:
      'No color encoding or mark color in the compiled spec to grade. ' + RENDERED_CONTRAST_CAVEAT,
  };
}
