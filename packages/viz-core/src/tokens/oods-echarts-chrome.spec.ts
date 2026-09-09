import { describe, expect, it } from 'vitest';
import { resolveOodsEchartsChrome } from './oods-echarts-chrome.js';

// The a11y-of-chrome tripwire (sprint-145 m03, memo §6) — the ECharts mirror of the s144
// oods-vega-config.spec.ts tripwire. certify grades ECharts SERIES colours only (s141
// role-C′): it reconstructs the categorical/sequential palette and NEVER reads
// label/border/background/textStyle, so accessible ECharts chrome is a BY-CONSTRUCTION
// guarantee this arc must self-enforce. This asserts every baked chrome TEXT surface
// clears WCAG 1.4.3 (≥ 4.5:1) on the baked background, and that the treemap/sunburst
// on-tile labels carry the legibility MECHANISM (§5) rather than a fixed colour.
//
// SCOPE (honest): this file covers (a) chrome-text-VS-CANVAS surfaces (on-canvas labels,
// breadcrumb, title, geo visualMap ticks, graph legend) graded against #FDF3DE; and
// (b) the on-TILE labels, which do NOT sit on the canvas — they are covered by the halo
// MECHANISM (a surface-canvas text-border around a text-primary label), asserted present
// and graded text-vs-halo. It imports the SOURCE resolver directly (relative, not the
// @oods/viz-core barrel) so a token-choice regression — e.g. repointing a label at
// text-muted (4.56, razor-thin) or text-disabled (1.85, fail) — fails HERE at the
// viz-core unit level, before any dist rebuild.
//
// Self-contained WCAG contrast: deliberately INDEPENDENT of certify's grader
// (@oods/a11y-tools) because it enforces a surface certify does not grade. The standard
// sRGB relative-luminance formula below reproduces the memo's verified ratios exactly
// (text-primary 14.17, text-neutral 7.60, text-muted 4.56, text-disabled 1.85). Copied
// verbatim from oods-vega-config.spec.ts:19-33.

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
// Colours that must NEVER back chrome text: text-muted is on the razor's edge (4.56 — one
// token tweak from failing) and text-disabled outright fails (1.85). The baked chrome text
// sits on text-primary / text-neutral precisely so the chrome is not parked on that edge.
const TEXT_MUTED = '#6F7482';
const TEXT_DISABLED = '#B8BCC6';

// Chrome is spec-independent (no config.tokens override) → any valid spec resolves the same
// default chrome. `as never` matches the sibling adapter/resolver specs.
const CHROME_SPEC = { config: {} } as never;

describe('resolveOodsEchartsChrome — a11y-of-chrome tripwire (s145 m03, memo §6)', () => {
  const chrome = resolveOodsEchartsChrome(CHROME_SPEC);
  const bg = chrome.background;

  // Every baked chrome TEXT surface that sits ON THE CANVAS, paired with its baked colour.
  // labelOnCanvas backs the sankey/chord/graph node labels + treemap breadcrumb; title backs
  // the group-A chart title; visualMapLabel backs the geo visualMap ticks + graph legend.
  const canvasTextSurfaces: ReadonlyArray<readonly [string, string]> = [
    ['labelOnCanvas', chrome.labelOnCanvas],
    ['title', chrome.title],
    ['visualMapLabel', chrome.visualMapLabel],
  ];

  it('the baked background is the OODS surface-canvas (#FDF3DE) contrast is graded against', () => {
    expect(bg).toBe('#FDF3DE');
  });

  it.each(canvasTextSurfaces)('%s clears WCAG AA (≥ 4.5:1) on the baked background', (_name, color) => {
    expect(contrastRatio(color, bg)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });

  it('no chrome text token is parked on text-muted (razor-thin) or text-disabled (fail)', () => {
    for (const [, color] of canvasTextSurfaces) {
      expect(color).not.toBe(TEXT_MUTED);
      expect(color).not.toBe(TEXT_DISABLED);
    }
  });

  it('reproduces the scoped light/A ratios (#1850) (text-primary 14.17, text-neutral 7.60)', () => {
    // Pins the Derek-locked token choices: on-canvas labels + title on text-primary, geo
    // visualMap + graph legend on text-neutral. A regression to a lower-contrast token trips
    // both this and the ≥4.5 gate.
    expect(chrome.labelOnCanvas).toBe('#18233C');
    expect(chrome.title).toBe('#18233C');
    expect(chrome.visualMapLabel).toBe('#4B4D5A');
    expect(contrastRatio('#18233C', bg)).toBeCloseTo(14.17, 1);
    expect(contrastRatio('#4B4D5A', bg)).toBeCloseTo(7.60, 1);
  });

  // On-TILE labels (treemap node/upperLabel, sunburst arc) do NOT sit on the canvas — the §4
  // sweep proved NO fixed colour clears WCAG on all 6 OODS categorical hues, so legibility
  // rides the MECHANISM (§5): a surface-canvas text-border around a text-primary label. Assert
  // the mechanism is present AND that the label reads against its own halo (text-vs-halo 14.17),
  // so the on-tile label stays legible on ANY tile colour.
  describe('on-tile label mechanism (§5 Derek-lock)', () => {
    const m = chrome.onTileLabelMechanism;

    it('the mechanism is present: a text-border colour + a positive width', () => {
      expect(typeof m.textBorderColor).toBe('string');
      expect(m.textBorderColor).toMatch(/^#[0-9A-F]{6}$/);
      expect(m.textBorderWidth).toBeGreaterThan(0);
    });

    it('the halo is the surface-canvas and the label reads against it (≥ 4.5:1, text-vs-halo)', () => {
      // The halo IS the baked canvas colour, so the on-tile label carries a high-contrast edge
      // independent of the tile hue underneath it.
      expect(m.textBorderColor).toBe('#FDF3DE');
      expect(m.color).toBe('#18233C');
      expect(contrastRatio(m.color, m.textBorderColor)).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    });
  });
});
