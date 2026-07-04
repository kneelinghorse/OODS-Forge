// Shared OODS Vega-Lite chrome-config resolver (sprint-144 m02 — cartesian chrome theme).
//
// A PURE resolver of the OODS-tokened Vega-Lite `config` "chrome" theme —
// background, axes, gridlines, typography, legend, and the view box — baked into
// the compiled cartesian spec by toVegaLiteSpec. It is the chrome counterpart to
// resolveCategoricalPalette: same @oods/tokens cssVariables source, same
// spec.config.tokens override precedence, same HEX normalization — but it themes
// CHROME, never series color (see the guardrail below).
//
// CHROME-ONLY GUARDRAIL (memo §3): this resolver MUST NOT emit config.mark.fill/color
// or config.range.category. Those are series-color surfaces; certify reads
// encoding/mark-level color, not config, so a config-level series color would be
// graded-invisible yet render-visible — a render/certify drift hole. The series
// palette stays solely in the s138 scale.range / mark.color bake.
//
// Light-only (resolveTokenToColor is theme-blind; memo §8 defers the theme-aware
// lift). Emits a stable, literal-ordered, ARRAY-FREE scalar object so canonicalize's
// key-sort keeps the render↔certify contentHash deterministic (memo §6).

import { resolveTokenToColor, resolveTokenValue } from '../adapters/echarts/token-resolver.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';
import { overrideMap, toHex } from './categorical-palette.js';

// The OODS chrome token map, verified live vs @oods/tokens (memo §3, Derek-locked §9).
const CHROME_TOKENS = {
  // colors
  background: '--oods-sys-surface-canvas', //     #FCFCFD — Derek-lock: fill
  textPrimary: '--oods-sys-text-primary', //      #2D313A — 12.71:1 ✓ (title, axis/legend title)
  textNeutral: '--oods-sys-text-neutral', //      #494E5A — 8.13:1  ✓ (axis/legend labels)
  gridSubtle: '--oods-sys-border-subtle', //      #E9ECEF — H-only gridlines (non-text)
  borderNeutral: '--oods-sys-border-neutral', //  #D5DAE4 — axis domain + ticks (non-text)
  // type
  fontFamily: '--oods-ref-typography-families-sans', //          DM Sans UI stack
  titleSize: '--oods-sys-text-scale-heading-lg-font-size', //    "24px"
  titleWeight: '--oods-sys-text-scale-heading-lg-font-weight', // "600"
} as const;

/**
 * The OODS Vega-Lite chrome config. Every leaf is a scalar (string | number | null)
 * — no arrays — so `canonicalize`'s deep key-sort makes the render↔certify
 * contentHash order-independent (memo §6). No `mark`/`range` keys: series color is
 * off-limits here (chrome-only guardrail).
 */
export interface OodsVegaConfig {
  readonly background: string;
  readonly font: string;
  readonly title: {
    readonly color: string;
    readonly font: string;
    readonly fontSize: number;
    readonly fontWeight: number;
    readonly anchor: 'start';
  };
  readonly axis: {
    readonly titleColor: string;
    readonly titleFont: string;
    readonly labelColor: string;
    readonly labelFont: string;
    readonly gridColor: string;
    readonly domainColor: string;
    readonly tickColor: string;
  };
  // Gridlines are horizontal-only (Derek-lock §9): Y grid draws the horizontal
  // lines, X grid off kills the vertical ones — regardless of chart orientation.
  readonly axisX: { readonly grid: false };
  readonly axisY: { readonly grid: true };
  readonly legend: {
    readonly titleColor: string;
    readonly titleFont: string;
    readonly labelColor: string;
    readonly labelFont: string;
  };
  // Kills the default grey plot-frame box.
  readonly view: { readonly stroke: null };
}

/**
 * Resolve an OODS chrome color: an agent config.tokens override (hex) wins; a
 * malformed override falls back to the OODS default (same posture as the palette
 * resolver). The five chrome tokens are static and always resolve, so a total
 * miss is a token-bundle breakage — surfaced loud rather than baked as junk.
 */
function resolveChromeColor(token: string, overrides: Map<string, string>): string {
  const override = overrides.get(token);
  const resolved =
    (override !== undefined ? toHex(override) : undefined) ?? toHex(resolveTokenToColor(token) ?? '');
  if (resolved === undefined) {
    throw new Error(`OODS chrome color token did not resolve: ${token}`);
  }
  return resolved;
}

/**
 * Type-token normalizer: font-size `"24px"` → number `24`. Vega wants a numeric
 * fontSize; the token carries the `px` unit. Deterministic (same string → same
 * number); a non-numeric value is a token-bundle breakage, surfaced loud.
 */
function resolveFontSize(token: string, overrides: Map<string, string>): number {
  const raw = overrides.get(token) ?? resolveTokenValue(token);
  const n = Number(String(raw ?? '').replace(/px$/i, '').trim());
  if (!Number.isFinite(n)) {
    throw new Error(`OODS chrome font-size token did not resolve to a number: ${token}`);
  }
  return n;
}

/**
 * Type-token normalizer: font-weight `"600"` → number `600`.
 */
function resolveFontWeight(token: string, overrides: Map<string, string>): number {
  const raw = overrides.get(token) ?? resolveTokenValue(token);
  const n = Number(String(raw ?? '').trim());
  if (!Number.isFinite(n)) {
    throw new Error(`OODS chrome font-weight token did not resolve to a number: ${token}`);
  }
  return n;
}

/**
 * Type-token normalizer: the OODS sans stack carries a nested-quote artifact from
 * the token pipeline — `'"Helvetica Neue"'` (a double-quoted name wrapped in single
 * quotes). Collapse each `'"…"'` to a single-quoted `'…'` so the baked font string
 * is clean, valid CSS, and stable. Deterministic string→string transform.
 */
function resolveFontFamily(token: string, overrides: Map<string, string>): string {
  const raw = overrides.get(token) ?? resolveTokenValue(token) ?? '';
  return raw.replace(/'"([^"]*)"'/g, "'$1'").trim();
}

/**
 * Resolve the OODS Vega-Lite chrome config for a spec. Pure function of the IR:
 * reads spec.config.tokens for overrides (same precedence as the palette bake) and
 * otherwise the OODS defaults from @oods/tokens. Merged (not overwritten) into the
 * compiled spec's top-level `config` at the toVegaLiteSpec seam — see the adapter.
 */
export function resolveOodsVegaConfig(spec: NormalizedVizSpec): OodsVegaConfig {
  const overrides = overrideMap(spec.config?.tokens);

  const background = resolveChromeColor(CHROME_TOKENS.background, overrides);
  const textPrimary = resolveChromeColor(CHROME_TOKENS.textPrimary, overrides);
  const textNeutral = resolveChromeColor(CHROME_TOKENS.textNeutral, overrides);
  const gridSubtle = resolveChromeColor(CHROME_TOKENS.gridSubtle, overrides);
  const borderNeutral = resolveChromeColor(CHROME_TOKENS.borderNeutral, overrides);
  const font = resolveFontFamily(CHROME_TOKENS.fontFamily, overrides);
  const titleSize = resolveFontSize(CHROME_TOKENS.titleSize, overrides);
  const titleWeight = resolveFontWeight(CHROME_TOKENS.titleWeight, overrides);

  return {
    background,
    font,
    title: {
      color: textPrimary,
      font,
      fontSize: titleSize,
      fontWeight: titleWeight,
      anchor: 'start',
    },
    axis: {
      titleColor: textPrimary,
      titleFont: font,
      labelColor: textNeutral,
      labelFont: font,
      gridColor: gridSubtle,
      domainColor: borderNeutral,
      tickColor: borderNeutral,
    },
    axisX: { grid: false },
    axisY: { grid: true },
    legend: {
      titleColor: textPrimary,
      titleFont: font,
      labelColor: textNeutral,
      labelFont: font,
    },
    view: { stroke: null },
  };
}
