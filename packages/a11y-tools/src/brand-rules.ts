import type { ContrastRule } from './types.js';

/**
 * s168 m04 — contrast rules for the brand × theme cells.
 *
 * ── WHY THIS IS A SEPARATE EXPORT AND NOT AN EXTENSION OF `DEFAULT_CONTRAST_RULES` ──
 * `DEFAULT_CONTRAST_RULES` is shared by three consumers across TWO different token
 * sources. `testing/a11y/contrast.spec.ts` evaluates it against `flatTokens` from
 * `@oods/tokens` (which carries brand keys), while `packages/mcp-server/src/tools/
 * a11y.scan.ts` and `src/a11y/validate-contrast.ts` evaluate it against
 * `artifacts/structured-data/oods-tokens-2026-03-06.json`, which carries NONE. Adding a
 * brand rule to the shared constant makes `resolveFlatToken` throw for those two;
 * `evaluate.ts` catches the throw and returns `passed: false`, so they would go
 * PERMANENTLY red — and a committed mcp-server contract test asserting zero issues
 * against a brand-free fixture would break with them. Hence: a separate rule set,
 * evaluated only against a brand-bearing map.
 *
 * ── WHAT `a11y.scan` DOES AND DOES NOT GRADE, STATED PLAINLY ──
 * Unchanged by this mission. `a11y.scan` grades the reference/theme/system/component/view
 * layers of the structured-data artifact and grades NO brand cell, because that artifact
 * contains no brand token. Brand grading runs in the `guardrails` vitest project against
 * the brand token sources. An MCP consumer calling `a11y.scan` is therefore NOT receiving
 * a brand verdict, and should not read one into it.
 *
 * ── DIVISION OF RESPONSIBILITY WITH THE OTHER TWO GRADERS ──
 *   • `DEFAULT_CONTRAST_RULES`  — non-brand layers, two token sources. Untouched.
 *   • `scanBrandContrast` (mcp-server `dashboard.render.html.ts`) — grades the FOUR pairs
 *     the HTML export actually paints, over already-RESOLVED hexes, for brand A base only,
 *     as an output-time check on one artifact. It is a RENDER-TIME check on what one
 *     exporter emits.
 *   • `BRAND_CONTRAST_RULES` (here) — grades the token SOURCE, every brand × theme cell,
 *     at build time. It is a SOURCE check on what the palette declares.
 * They overlap on brand A base but answer different questions, so neither replaces the
 * other. A third grader was not added; this is the second, and `scanBrandContrast` keeps
 * its narrower render-time job.
 *
 * ── KEY-STRING TRAP (hit live during planning) ──
 * `normalizeTokenExpression` lowercases and maps `.` and `/` to `-`, so the natural
 * dotted form `brand.A.text.onInteractive` normalises to `brand-a-text-oninteractive` —
 * A KEY THAT DOES NOT EXIST. The real flat key is `color-brand-a-text-on-interactive`.
 * A rule set written in the natural form is red for the WRONG reason, so the pair
 * templates below are expanded into the flat form, and the consuming test asserts every
 * rule's tokens RESOLVE before it asserts any ratio.
 *
 * ── hc IS EXEMPT, EXPLICITLY ──
 * Both hc cells resolve entirely to CSS system colours (`Canvas`, `CanvasText`,
 * `Highlight`, …). Those are context-dependent by design — the user agent supplies the
 * actual colour — so no static ratio exists to grade. Measured: an hc cell yields ZERO
 * resolvable pairs. Generating rules for it would produce evaluations that fail on a
 * conversion error and read as contrast failures, which is worse than not grading. The
 * exemption is encoded in `BRAND_GRADED_THEMES` and asserted by the test, never silent.
 */

/** The themes a numeric ratio can be computed for. `hc` is exempt — see above. */
export const BRAND_GRADED_THEMES = ['base', 'dark'] as const;
export type BrandGradedTheme = (typeof BRAND_GRADED_THEMES)[number];

/** The reason `hc` is absent, carried next to the data so it cannot drift from it. */
export const BRAND_HC_EXEMPTION_REASON =
  'Both hc cells resolve entirely to CSS system colours (Canvas, CanvasText, Highlight, …), ' +
  'whose actual colour is supplied by the user agent. No static contrast ratio exists to grade.';

export interface BrandContrastPair {
  /** Stable id fragment; the generated ruleId is `brand-<brand>-<theme>-<id>`. */
  readonly id: string;
  /** Token path under `color.brand.<X>.`, e.g. `text.primary`. */
  readonly foreground: string;
  readonly background: string;
  readonly threshold: number;
  readonly summary: string;
}

/**
 * The semantic pairs, declared ONCE and expanded across every brand × graded theme.
 *
 * `text.disabled` on `surface.disabled` is deliberately ABSENT: WCAG 1.4.3 exempts
 * inactive components from any contrast requirement, and the low contrast IS the disabled
 * affordance. Its measured ratio is asserted by `brand-description-truth.spec.ts` instead,
 * so the number is still pinned — it is simply not graded against a threshold it was
 * never required to meet.
 */
export const BRAND_CONTRAST_PAIRS: readonly BrandContrastPair[] = Object.freeze([
  { id: 'text-primary-on-canvas', foreground: 'text.primary', background: 'surface.canvas', threshold: 4.5, summary: 'Primary text on the brand canvas.' },
  { id: 'text-primary-on-raised', foreground: 'text.primary', background: 'surface.raised', threshold: 4.5, summary: 'Primary text on a raised brand surface.' },
  { id: 'text-primary-on-subtle', foreground: 'text.primary', background: 'surface.subtle', threshold: 4.5, summary: 'Primary text on a subtle brand surface.' },
  { id: 'text-secondary-on-canvas', foreground: 'text.secondary', background: 'surface.canvas', threshold: 4.5, summary: 'Secondary text on the brand canvas.' },
  { id: 'text-muted-on-canvas', foreground: 'text.muted', background: 'surface.canvas', threshold: 4.5, summary: 'Muted text on the brand canvas.' },
  { id: 'text-muted-on-subtle', foreground: 'text.muted', background: 'surface.subtle', threshold: 4.5, summary: 'Muted text on a subtle brand surface.' },
  { id: 'text-accent-on-canvas', foreground: 'text.accent', background: 'surface.canvas', threshold: 4.5, summary: 'Accent text on the brand canvas.' },
  { id: 'text-inverse-on-inverse', foreground: 'text.inverse', background: 'surface.inverse', threshold: 4.5, summary: 'Inverse text on the inverse brand surface.' },
  { id: 'on-interactive-default', foreground: 'text.onInteractive', background: 'surface.interactive.primary.default', threshold: 4.5, summary: 'Foreground on the primary interactive surface.' },
  { id: 'on-interactive-hover', foreground: 'text.onInteractive', background: 'surface.interactive.primary.hover', threshold: 4.5, summary: 'Foreground on the hovered interactive surface.' },
  { id: 'on-interactive-pressed', foreground: 'text.onInteractive', background: 'surface.interactive.primary.pressed', threshold: 4.5, summary: 'Foreground on the pressed interactive surface.' },
  { id: 'accent-text-on-accent-bg', foreground: 'accent.text', background: 'accent.background', threshold: 4.5, summary: 'Accent text on the accent background panel.' },
  ...(['info', 'success', 'warning', 'critical', 'neutral'] as const).flatMap((status) => [
    { id: `status-${status}-text`, foreground: `status.${status}.text`, background: `status.${status}.surface`, threshold: 4.5, summary: `${status} status text on its own surface.` },
    { id: `status-${status}-icon`, foreground: `status.${status}.icon`, background: `status.${status}.surface`, threshold: 3, summary: `${status} status icon on its own surface (non-text 3:1).` },
  ]),
]);

/** `text.primary` → `color-brand-a-text-primary`: the flat key the evaluator resolves. */
export function brandFlatKey(brand: string, tokenPath: string): string {
  const kebab = tokenPath
    .split('.')
    .map((segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase())
    .join('-');
  return `color-brand-${brand.toLowerCase()}-${kebab}`;
}

/**
 * Expand the pair templates into concrete rules for one brand × theme cell.
 *
 * GENERATED, not hand-listed, on purpose: hand-listing is exactly how s167 ended up with
 * slots present in the artifact that no rule named. The consuming test additionally
 * asserts that every bridged text/icon and surface slot is reachable from these pairs, so
 * a newly bridged slot arrives with grading attached or the build fails.
 */
export function buildBrandContrastRules(brand: string, theme: BrandGradedTheme): ContrastRule[] {
  return BRAND_CONTRAST_PAIRS.map((pair) => ({
    ruleId: `brand-${brand.toLowerCase()}-${theme}-${pair.id}`,
    target: `brand ${brand}/${theme}: ${pair.foreground} on ${pair.background}`,
    foreground: brandFlatKey(brand, pair.foreground),
    background: brandFlatKey(brand, pair.background),
    threshold: pair.threshold,
    summary: `${pair.summary} (brand ${brand}, ${theme})`,
  }));
}

/** Every rule for every graded cell — the full brand grading surface. */
export const BRAND_CONTRAST_RULES: ReadonlyArray<ContrastRule> = Object.freeze(
  ['A', 'B'].flatMap((brand) => BRAND_GRADED_THEMES.flatMap((theme) => buildBrandContrastRules(brand, theme))),
);
