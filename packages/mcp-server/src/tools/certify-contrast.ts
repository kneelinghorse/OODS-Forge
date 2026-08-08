// certify contrast pillar — the RENDERED-REALITY contrast engine (s137 m02; s138 m03;
// s139 m02).
//
// certify grades the categorical color bytes Forge baked into the compiled cartesian
// Vega-Lite spec, against the canvas, per the memo §2/§3/§3a rule set. As of s139 it
// reads the color hexes off the COMPILED spec's emitted bytes (scale.range for a
// multi-series color channel, mark.color for a single-series chart) rather than
// re-classifying the raw IR and re-resolving the palette. As of s140 it grades EVERY
// rendered unit — walking all layers / the facet spec / every concat section — and
// combines them worst-verdict, so a color-bearing mark that is not the first layer can
// no longer be masked by a passing sibling (the s139-review C1 false-'pass'). There is no second classifier
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
import {
  getVizScaleTokens,
  resolveCategoricalPalette,
  resolveTokenToColor,
  type NormalizedVizSpec,
  type VegaLiteAdapterSpec,
} from '@oods/viz-core';
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
// Role-A "reads-as-gray" chroma floor (s146 F2). A slot whose OKLCH chroma is below this
// is not a real categorical hue — it reads as gray, so the ΔE distance check below would be
// a misleading pass. The s146 F1 re-space put EVERY default slot at chroma >= 0.045 (the
// co-designed margin above this floor — memo §2.2), so this fires on NOTHING for the default
// palette = a permanent zero-flip guardrail; it DOES fire on a low-chroma config.tokens
// override an agent supplies (a gray "palette" -> honest fail, the real value on agent input).
const ROLE_A_CHROMA_FLOOR = 0.03;

const RENDERED_CONTRAST_CAVEAT =
  'certify measures the categorical color bytes Forge baked into the compiled spec, ' +
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

/** OKLCH chroma of a resolved hex — the s146 F2 "reads-as-gray" measure. Pure fn of the hex. */
function chromaOf(hex: string): number {
  return new Color(hex).oklch[1];
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
 * (vega-lite-layout-mapper.ts). Walk to EVERY unit node (all layers, the facet spec,
 * every concat section) so the grader reads the color bytes Forge baked into all of
 * them, never re-deriving from the IR. Grading only the first unit (pre-s140) let a
 * color-bearing mark in a non-first layer be masked by a passing sibling — the
 * s139-review C1 false-'pass'.
 *
 * A unit node (mark/encoding present) is terminal: Vega-Lite unit/layer/facet/concat
 * are mutually exclusive, so this returns without descending further. Nesting is
 * depth-2 bounded (the primitive threaded into a facet/concat is never itself a
 * facet/concat — layout is single-trait dispatch), so the recursion terminates.
 */
function compiledColorUnits(node: unknown): CompiledUnit[] {
  if (!node || typeof node !== 'object') return [];
  const rec = node as Record<string, unknown>;
  if ('mark' in rec || 'encoding' in rec) {
    return [{ mark: rec.mark, encoding: rec.encoding as Record<string, unknown> | undefined }];
  }
  const units: CompiledUnit[] = [];
  if (Array.isArray(rec.layer)) {
    for (const child of rec.layer) units.push(...compiledColorUnits(child));
  }
  if (rec.spec) units.push(...compiledColorUnits(rec.spec));
  for (const key of ['hconcat', 'vconcat', 'concat'] as const) {
    const sections = rec[key];
    if (Array.isArray(sections)) {
      for (const child of sections) units.push(...compiledColorUnits(child));
    }
  }
  return units;
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

  // Role A chroma floor (s146 F2): a slot whose OKLCH chroma is below the floor reads as
  // gray — not a real categorical hue — so the ΔE distinguishability check below would be a
  // misleading pass. Placed AFTER the WCAG-normative role-C check and BEFORE the role-A ΔE
  // distance check (memo §3). Fires on NOTHING for the default palette (F1 re-chromatized
  // every slot >= 0.045) but catches a gray config.tokens override (reads-as-gray -> fail).
  const grayFailures = slots.filter((s) => chromaOf(s.hex) < ROLE_A_CHROMA_FLOOR);
  if (grayFailures.length > 0) {
    const which = grayFailures.map((s) => s.token).join(', ');
    return {
      contrast: 'fail',
      contrastNote:
        `Role-A chroma-floor fail: ${which} below ${ROLE_A_CHROMA_FLOOR} OKLCH chroma — ` +
        `reads as gray, not a distinguishable categorical hue. ` + RENDERED_CONTRAST_CAVEAT,
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

// The worst-verdict lattice (memo §3a): higher rank wins when combining the graded
// units. fail > unchecked > pass > exempt; ties resolve to the first unit in walker
// document order. A graded unit returns 'unchecked' iff the canvas is unresolvable —
// which is global (resolved once) — so graded-'unchecked' is all-or-nothing and never
// mixes with a real pass/fail; this defensive ordering is provably identical to the
// simpler fail>pass>exempt on every reachable input, and a withheld canvas claim should
// not read as an affirmative pass.
const VERDICT_RANK: Record<ContrastVerdict, number> = { fail: 3, unchecked: 2, pass: 1, exempt: 0 };

// The single-series slot the adapter bakes as mark.color (memo §3 CASE 2 fork).
const SLOT1_TOKEN = categoricalToken(1);

/**
 * Grade ONE compiled unit's baked color bytes. Returns a verdict for a color-bearing
 * unit, or `undefined` for a NEUTRAL no-op (no color, or an author decorative mark.color)
 * so a colorless/decorative sibling never poisons the union verdict.
 *
 * `slot1Hex` is the resolved categorical-01 the adapter bakes for a single-series chart
 * (the SHARED resolveCategoricalPalette output, override-aware) — the CASE-2 gate.
 */
function gradeUnit(
  unit: CompiledUnit,
  spec: NormalizedVizSpec,
  canvasHex: string | undefined,
  slot1Hex: string | undefined,
): ContrastPillarResult | undefined {
  const colorEnc = unit.encoding?.color as Record<string, unknown> | undefined;
  const markColor =
    typeof (unit.mark as Record<string, unknown> | undefined)?.color === 'string'
      ? ((unit.mark as Record<string, unknown>).color as string)
      : undefined;

  const scale = colorEnc?.scale as Record<string, unknown> | undefined;
  const rangeRaw = scale?.range;
  const range =
    Array.isArray(rangeRaw) && rangeRaw.length > 0 && rangeRaw.every((h) => typeof h === 'string')
      ? (rangeRaw as string[])
      : undefined;

  // CASE 1 — categorical: the adapter baked a hex range into this unit's color scale.
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
  // mark.color. Grade that hex vs the canvas ONLY when it IS the OODS series color (it
  // equals the resolved categorical-01 slot, override-aware, so a config.tokens-poisoned
  // categorical-01 still matches -> graded -> fails correctly). Compared against the same
  // SHARED resolver the adapter bakes from, so it matches the emitted bytes exactly —
  // including the non-color-override fallback to the OODS default. An author's decorative
  // mark.color (a faint reference/annotation line) is chrome (OOS per s138) -> NEUTRAL
  // skip, never a contrast fail (Derek CASE-2 fork "grade OODS series colors only").
  if (markColor) {
    if (slot1Hex && markColor.toLowerCase() === slot1Hex.toLowerCase()) {
      return gradeCategorical([{ token: SLOT1_TOKEN, hex: markColor }], canvasHex);
    }
    return undefined;
  }

  // CASE 3 — a color channel exists but NO OODS categorical palette was baked (gradient,
  // or a divergence/mistype rendering on a continuous/default scale): WCAG-exempt.
  if (colorEnc) {
    return { contrast: 'exempt', contrastNote: EXEMPT_NOTE };
  }

  // CASE 4 — no color in THIS unit: a NEUTRAL no-op (undefined), NOT 'unchecked'. A
  // colorless unit (e.g. a plain line layer beneath a color-encoded layer) must be
  // skipped, not poison the union verdict — only its color-bearing siblings are graded.
  return undefined;
}

/**
 * Evaluate the contrast pillar for a (cartesian) NormalizedVizSpec IR by grading the
 * color hexes the adapter BAKED into `compiled` (s139 — reads emitted bytes, not a
 * re-classification of the raw IR). As of s140 it grades EVERY rendered unit and
 * combines them worst-verdict (memo §3a), so a color-bearing mark that is not the first
 * layer can no longer be masked by a passing sibling. Pure + deterministic. Never
 * returns 'pass' for a chart whose compiled spec baked no OODS palette (memo §3
 * governing rule).
 *
 * `spec` is retained ONLY for the canvas token (config.tokens override -> role-C
 * reference; the canvas is not in the compiled spec), the cardinality slice
 * (distinctCount over spec.data.values), and the CASE-2 categorical-01 gate. All color
 * hexes come from `compiled`.
 */
export function evaluateContrastPillar(
  spec: NormalizedVizSpec,
  compiled: VegaLiteAdapterSpec,
): ContrastPillarResult {
  // Resolve the canvas + the single-series categorical-01 slot ONCE (both are global —
  // config.tokens is chart-wide), then grade every color-bearing unit.
  const canvasHex = resolveSlotHex(CANVAS_TOKEN, overrideMap(spec));
  const slot1Hex = resolveCategoricalPalette(spec)[0];

  const graded = compiledColorUnits(compiled)
    .map((unit) => gradeUnit(unit, spec, canvasHex, slot1Hex))
    .filter((r): r is ContrastPillarResult => r !== undefined);

  // No color-bearing unit anywhere (or every unit was a neutral decoration/colorless
  // layer): honest whole-chart 'unchecked', never a silent pass. Preserves the
  // single-unit CASE 4 verdict byte-for-byte.
  if (graded.length === 0) {
    return {
      contrast: 'unchecked',
      contrastNote:
        'No color encoding or mark color in the compiled spec to grade. ' + RENDERED_CONTRAST_CAVEAT,
    };
  }

  // COMBINE — worst-verdict across every graded unit; ties -> first in document order.
  let worst = graded[0];
  for (let i = 1; i < graded.length; i++) {
    if (VERDICT_RANK[graded[i].contrast] > VERDICT_RANK[worst.contrast]) worst = graded[i];
  }
  return worst;
}

// ─── ECharts-primary categorical contrast (s141 m02) ────────────────────────────────
//
// The 5 ECharts-primary categorical types (treemap/sunburst/sankey/force_graph/chord)
// have NO Vega-Lite compile, so certify cannot read a compiled scale.range. Instead it
// RECONSTRUCTS the fixed default OODS categorical palette those adapters bake into
// itemStyle — from the SAME getVizScaleTokens('categorical') call the adapters make
// (buildPalette, treemap-adapter.ts:106 et al.) — and grades it with the SAME role-C /
// role-A math the cartesian path uses. This is palette RECONSTRUCTION, not emit-then-read:
// certify never runs an adapter or reads emitted bytes (memo §3 / decision #1024 pt3).

/**
 * Reconstruct the FIXED DEFAULT 6-slot OODS categorical palette the ECharts categorical
 * adapters bake into itemStyle, resolved to hex. Uses the SAME shared token source the
 * adapters use (`getVizScaleTokens('categorical')` → `--viz-scale-categorical-NN`,
 * resolved via the same resolveTokenToColor with the `--oods-` prefix fallback), so
 * `certified == rendered` holds by SHARED SOURCE — not by fragile prefix convergence.
 *
 * NON-override by construction (empty overrides): the 5 categorical adapters' buildPalette()
 * takes no args (config.tokens feeds only usermeta), so the grade MUST use the fixed
 * default — it deliberately does NOT call resolveCategoricalPalette(spec) (override-aware +
 * cardinality-sliced), which would grade a color the ECharts render ignores (memo §3b).
 * The adapters pass count:8|9 but VIZ_CATEGORICAL_SCALE has 6 slots and the getter clamps,
 * so the count is inert — the no-arg call resolves the identical fixed 6.
 */
export function reconstructEChartsCategoricalPalette(): Array<{ token: string; hex: string }> {
  const noOverrides = new Map<string, string>();
  const slots: Array<{ token: string; hex: string }> = [];
  for (const token of getVizScaleTokens('categorical')) {
    const hex = resolveSlotHex(token, noOverrides);
    if (hex) slots.push({ token, hex });
  }
  return slots;
}

// The MANDATORY ECharts-categorical caveats (memo §4). The verdict is INVARIANT to the
// input IR (the palette is a compile-time constant, data-independent), so an ECharts
// categorical 'pass' is a real WCAG-1.4.11 + CVD claim about the baked palette, but a
// WEAKER claim than a cartesian 'pass' (which is override-aware + cardinality-sliced).
// Adjacency (the literal role-C′) is a frozen OOS sub-arc; per-node data-color overrides
// are ungraded. Both caveats are required on every categorical contrastNote.
const ECHARTS_CATEGORICAL_CAVEAT =
  'This grades the fixed OODS categorical palette the ECharts adapter bakes into itemStyle ' +
  '(reconstructed from the shared viz-scale tokens; data-independent, so the verdict is a ' +
  'per-palette constant — a weaker claim than a cartesian, cardinality-sliced verdict). ' +
  'touching-mark/adjacency contrast not graded; relies on the separating stroke. ' +
  'Per-node data-color overrides are ungraded — the grade reflects the default baked palette.';

/**
 * Grade the fixed default OODS categorical palette the 5 ECharts categorical adapters bake
 * into itemStyle (s141 m02) — role-C (each of the 6 slots vs the light-theme canvas ≥ 3:1)
 * + role-A (min-pairwise CIEDE2000 over Machado CVD). Reuses gradeCategorical + the #FCFCFD
 * canvas the cartesian path uses. NON-override for BOTH palette AND canvas (the categorical
 * adapters honor neither a config.tokens palette NOR canvas overrides), so `certified ==
 * rendered`. Pure function of constants → byte-stable across re-runs.
 */
export function evaluateEChartsCategoricalContrast(): ContrastPillarResult {
  const canvasHex = resolveSlotHex(CANVAS_TOKEN, new Map());
  const slots = reconstructEChartsCategoricalPalette();
  const graded = gradeCategorical(slots, canvasHex);
  return {
    contrast: graded.contrast,
    contrastNote: `${graded.contrastNote ?? ''} ${ECHARTS_CATEGORICAL_CAVEAT}`.trim(),
  };
}

// ─── ECharts-primary GEO contrast (s141 m03) ────────────────────────────────────────
//
// The 3 geo ECharts types (choropleth/flow_map/bubble_map) render color as a
// SEQUENTIAL/CONTINUOUS scale — choropleth's visualMap ramp (or piecewise binned
// sequential), flow_map's single-hue line, bubble_map's default visualMap gradient — so
// WCAG 1.4.11's essential exception for gradients applies (memo §4 role-B): there is no
// discrete categorical palette to contrast-check. certify returns 'exempt', and Forge's
// generated accessible data table is the guarantee. bubble_map's ORDINAL-categorical color
// branch (an author-supplied scale:'ordinal' + range) is NOT graded: that range lives in
// the geo DATA branch / SpatialSpec, outside this metadata-only NormalizedVizSpec IR (the
// IR's color TraitBinding cannot even express scale:'ordinal' or a range — schema
// additionalProperties:false), so it is invisible to certify. Grading it needs a
// data-branch INPUT-schema change (a frozen OOS sub-arc), NOT this additive read path.
// (s141 m03 — Derek: exempt-all-geo, after the m01 IR-visibility premise was verified false.)
export const ECHARTS_GEO_EXEMPT_NOTE =
  'Geo color renders as a sequential/continuous scale (choropleth visualMap ramp, ' +
  'flow_map single-hue line, bubble_map visualMap) — WCAG 1.4.11 gradient essential ' +
  'exception, so there is no discrete categorical palette to contrast-check; ' +
  "Forge's generated accessible data table is the guarantee. An author-supplied " +
  'ordinal-categorical bubble_map color is still NOT graded, and as of s172 the reason ' +
  'is the s141 exempt-all-geo RULING rather than invisibility: certify can now see the ' +
  'geo data branch (the optional `data` operand), so the range is reachable — grading it ' +
  'would be a new scope decision, not a bug fix. ' + RENDERED_CONTRAST_CAVEAT;
