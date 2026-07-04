import { describe, expect, it } from 'vitest';
import { resolveOodsVegaConfig } from './oods-vega-config.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';

// The a11y-of-chrome tripwire (sprint-144 m03, memo §4). Chrome TEXT contrast is graded by
// NEITHER certify pillar (contrast = series marks only; the equivalence engine reads no
// color), so accessible chrome is a BY-CONSTRUCTION guarantee this arc must self-enforce.
// This asserts every baked chrome text color clears WCAG 1.4.3 (≥ 4.5:1) on the baked
// background. It imports the SOURCE resolver directly (relative, not the @oods/viz-core
// barrel) so a token-choice regression — e.g. repointing axis labels at text-muted (4.56,
// razor-thin) or text-disabled (1.85, fail) — fails HERE at the viz-core unit level, before
// any dist rebuild.
//
// Self-contained WCAG contrast: the check is deliberately INDEPENDENT of certify's grader
// (@oods/a11y-tools) because it enforces a surface certify does not grade. The standard
// sRGB relative-luminance formula below reproduces the memo's verified ratios exactly
// (text-primary 12.71, text-neutral 8.13, text-muted 4.56, text-disabled 1.85).

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number): number => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [r, g, b] = channels.map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const WCAG_AA_TEXT = 4.5;
// Colors that must NEVER back chrome text: text-muted is on the razor's edge (4.56 — one
// token tweak from failing) and text-disabled outright fails (1.85). The default axis labels
// ship on text-neutral (8.13) precisely so the chrome is not parked on that edge (§4).
const TEXT_MUTED = '#6F7482';
const TEXT_DISABLED = '#B8BCC6';

// A minimal cartesian IR — chrome is spec-independent (no config.tokens override), so any
// valid spec resolves the same default chrome. `as never` matches the sibling adapter specs.
const CHROME_SPEC = { config: {} } as unknown as NormalizedVizSpec;

describe('resolveOodsVegaConfig — a11y-of-chrome tripwire (s144 m03, memo §4)', () => {
  const config = resolveOodsVegaConfig(CHROME_SPEC);
  const bg = config.background;

  // Every baked chrome TEXT surface, paired with its baked color.
  const textSurfaces: ReadonlyArray<readonly [string, string]> = [
    ['title.color', config.title.color],
    ['axis.titleColor', config.axis.titleColor],
    ['axis.labelColor', config.axis.labelColor],
    ['legend.titleColor', config.legend.titleColor],
    ['legend.labelColor', config.legend.labelColor],
  ];

  it('the baked background is the OODS surface-canvas (#FCFCFD) contrast is graded against', () => {
    expect(bg).toBe('#FCFCFD');
  });

  it.each(textSurfaces)('%s clears WCAG AA (≥ 4.5:1) on the baked background', (_name, color) => {
    expect(contrastRatio(color, bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });

  it('no chrome text token is parked on text-muted (razor-thin) or text-disabled (fail)', () => {
    for (const [, color] of textSurfaces) {
      expect(color).not.toBe(TEXT_MUTED);
      expect(color).not.toBe(TEXT_DISABLED);
    }
  });

  it('reproduces the memo-verified ratios (text-primary 12.71, text-neutral 8.13)', () => {
    // Pins the specific Derek-locked token choices: titles on text-primary, labels on
    // text-neutral. A regression to a lower-contrast token trips both this and the ≥4.5 gate.
    expect(config.title.color).toBe('#2D313A');
    expect(config.axis.labelColor).toBe('#494E5A');
    expect(contrastRatio('#2D313A', bg)).toBeCloseTo(12.71, 1);
    expect(contrastRatio('#494E5A', bg)).toBeCloseTo(8.13, 1);
  });
});
