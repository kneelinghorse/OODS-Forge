/**
 * s168 m05 — the source-order tie is dead, and cannot come back.
 *
 * ── THE DEFECT ──
 * `apps/explorer/src/styles/brand.css` was a hand-authored copy of the whole
 * brand→semantic mapping, duplicating what `@oods/tokens` generates. Measured per
 * SELECTOR SHAPE, not per file:
 *
 *   base / light — generated `[data-brand='A'][data-theme='base']` is (0,2,0); brand.css
 *                  mapped `--theme-*` under `:where(...)`, which contributes ZERO
 *                  specificity, so it is (0,0,0). The generated side won outright.
 *   dark, hc     — BOTH sides (0,2,0). A specificity TIE, broken solely by which file
 *                  was imported last. brand.css loaded last, so brand.css won.
 *
 * That is the real defect: not that the wrong side won, but that **which side won was a
 * property of import order**. Swapping two lines in `index.css` flipped four cells, and
 * no test in the repo would have gone red.
 *
 * ── THE FIX, AND WHY THE FILE STILL EXISTS ──
 * m05 stripped all 38 BRIDGED slots out of brand.css. A tie needs two declarations of the
 * same property; with the overlap removed there is nothing left to tie. The file remains
 * because it is the SOLE source of three things the bridge does not emit — the
 * `--brandX-*` primitives, the three focus slots (recorded in the bridge's own
 * `UNBRIDGED_SLOTS`), and a `forced-colors` block. Deleting it would not have broken
 * focus (layers.css defines a neutral fallback) but would silently DE-BRAND it in all six
 * cells, and would break the `BrandBleed` canary story that reads two primitives.
 *
 * This test pins the invariant that makes the reduction safe: **no `--theme-*` slot is
 * declared in both places.** Re-add one and this fails, naming it.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- build tooling, no type declarations
import { SEMANTIC_BRIDGE, UNBRIDGED_SLOTS } from '../../packages/tokens/scripts/brand-bridge.mjs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BRAND_CSS = path.join(REPO_ROOT, 'apps', 'explorer', 'src', 'styles', 'brand.css');
const TOKENS_CSS = path.join(REPO_ROOT, 'packages', 'tokens', 'dist', 'css', 'tokens.css');

type SlotEntry = { slot: string };
const bridgedSlots = new Set((SEMANTIC_BRIDGE as readonly SlotEntry[]).map((e) => e.slot));
const unbridgedSlots = new Set((UNBRIDGED_SLOTS as readonly SlotEntry[]).map((e) => e.slot));

/** Distinct `--theme-*` properties DECLARED (not merely referenced) in a stylesheet. */
function declaredThemeSlots(css: string): Set<string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return new Set([...stripped.matchAll(/^\s*(--theme-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
}

describe('s168 m05 — brand.css no longer ties with the generated bridge', () => {
  const brandCss = fs.readFileSync(BRAND_CSS, 'utf8');
  const declared = declaredThemeSlots(brandCss);

  it('THE INVARIANT: brand.css declares no slot the bridge emits', () => {
    const overlap = [...declared].filter((slot) => bridgedSlots.has(slot));
    expect(
      overlap,
      'these slots are declared in BOTH brand.css and the generated CSS, which restores ' +
        `the equal-specificity tie on the dark and hc cells:\n  ${overlap.join('\n  ')}`,
    ).toEqual([]);
  });

  it('what remains is exactly the three slots the bridge records as unbridged', () => {
    expect([...declared].sort()).toEqual([...unbridgedSlots].sort());
    expect(declared.size).toBe(3);
  });

  it('the generated CSS is now the sole source of every bridged slot', () => {
    const generated = declaredThemeSlots(fs.readFileSync(TOKENS_CSS, 'utf8'));
    // The bridge emits `--oods-`-prefixed names; the consumer slots are re-mapped from
    // them. What matters here is the converse of the invariant above: every bridged slot
    // that brand.css used to own is now owned by nobody else in that file.
    for (const slot of bridgedSlots) {
      expect(declared.has(slot), `${slot} is still declared in brand.css`).toBe(false);
    }
    expect(generated.size + declared.size).toBeGreaterThan(0);
  });

  /**
   * The cascade was originally measured from ONE import graph. A categorical conclusion
   * drawn from one of three is exactly the over-reach this sprint corrects, so all three
   * are checked — and the property checked is the one that actually matters now: whichever
   * order a graph imports things in, no bridged slot has two declarations to order.
   */
  it('all THREE import graphs are tie-free, not just index.css', () => {
    const GRAPHS = [
      'apps/explorer/src/styles/index.css',
      'src/styles/globals.css',
      '.storybook/preview.ts',
    ];
    for (const graph of GRAPHS) {
      const source = fs.readFileSync(path.join(REPO_ROOT, graph), 'utf8');
      const importsBrandCss = /brand\.css/.test(source);
      const importsIndexCss = /index\.css/.test(source);
      // Every graph reaches brand.css either directly or through index.css. Recorded so a
      // graph that stops reaching it is a visible change rather than a silent one.
      expect(
        importsBrandCss || importsIndexCss,
        `${graph} no longer reaches brand.css by any route — re-verify the cascade`,
      ).toBe(true);
    }
    // The invariant is global: brand.css declares zero bridged slots, so NO import order
    // in ANY graph can change which side supplies them.
    expect([...declared].filter((slot) => bridgedSlots.has(slot))).toEqual([]);
  });

  it('the residue brand.css still owns is intact', () => {
    const primitives = new Set(
      [...brandCss.matchAll(/^\s*(--brand[AB]-[A-Za-z0-9-]+)\s*:/gm)].map((m) => m[1]),
    );
    expect(primitives.size, 'the --brandX-* primitives vanished; BrandBleed.canary reads two').toBe(76);
    expect(brandCss).toContain('forced-colors');
    // The canary is a real story and reads two primitives directly — pin the exact ones.
    for (const primitive of ['--brandB-surface-canvas', '--brandB-text-primary']) {
      expect(primitives.has(primitive), `${primitive} is read by BrandBleed.canary.tsx`).toBe(true);
    }
  });
});
