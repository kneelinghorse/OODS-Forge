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
 * focus (layers.css defines a neutral fallback), and would break the `BrandBleed` canary
 * story that reads two primitives.
 *
 * ── s169 m02 CORRECTION: FOUR CELLS, NOT SIX ──
 * This comment used to say deleting brand.css would "silently DE-BRAND focus in all six
 * cells". MEASURED IN CHROMIUM, that is false. brand.css's light blocks are
 * `:where(...)`-wrapped — (0,0,0) — so they lose to `:root` (0,1,0) and LIGHT FOCUS IS
 * ALREADY NEUTRAL, byte-identically for brands A and B. Only the two dark cells are
 * branded; the two hc cells resolve to the same system-colour keywords for both brands.
 * Deleting the file would change four cells. The same false claim lived in brand.css's own
 * header and in the bridge's `UNBRIDGED_SLOTS` rationale; all three are corrected together,
 * and `scripts/quality/brand-cascade-browser-proof.mjs` now pins the measured split so the
 * three cannot drift back apart. Branding light focus is a behaviour change and was NOT
 * done here.
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
    // SEVEN as of s169 m05, down from 76. MEASURED before the deletion: exactly 7 of the 76
    // were referenced by anything in the tracked tree; the other 69 were read by NOTHING.
    // The pin is a floor AND a ceiling on purpose — re-adding an unused primitive rebuilds
    // the duplicate palette this reduction removed.
    expect(primitives.size, 'the --brandX-* primitive set changed size').toBe(7);
    expect(brandCss).toContain('forced-colors');
    // The canary is a real story and reads two primitives directly — pin the exact ones.
    for (const primitive of ['--brandB-surface-canvas', '--brandB-text-primary']) {
      expect(primitives.has(primitive), `${primitive} is read by BrandBleed.canary.tsx`).toBe(true);
    }
    // ...and the six the focus blocks alias must all still be declared, or focus breaks.
    for (const primitive of [
      '--brandA-surface-canvas', '--brandA-text-accent', '--brandA-text-on-interactive',
      '--brandB-surface-canvas', '--brandB-text-accent', '--brandB-text-on-interactive',
    ]) {
      expect(primitives.has(primitive), `${primitive} is aliased by a light focus block`).toBe(true);
    }
  });

  /**
   * ── s169 m05: THE SURVIVOR TIE — the test that would have caught the 0.54 drift ──
   *
   * Every surviving primitive duplicates a value that the token sources also declare. That
   * duplication is the whole hazard: nothing connected the two, so they could disagree —
   * and they DID. `--brandB-text-accent` shipped `oklch(0.54 0.14 238)` against a token
   * value of `oklch(0.53 0.14 238)`, a silent 0.01 divergence that survived a full sprint
   * because no test compared them.
   *
   * This ties each survivor to its source. Note the NAME mapping is not a plain kebab
   * split: `--brandA-text-on-interactive` is `text.onInteractive`, and getting that wrong
   * would make the test look up a path that does not exist — so a missing path FAILS here
   * rather than being skipped.
   */
  it('every surviving primitive equals its token source’s $value (the anti-drift tie)', () => {
    const readCell = (brand: string): Record<string, any> =>
      JSON.parse(
        fs.readFileSync(
          path.join(REPO_ROOT, 'packages', 'tokens', 'src', 'tokens', 'brands', brand, 'base.json'),
          'utf8',
        ),
      ).color.brand[brand];

    // `--brandA-text-on-interactive` -> ['text', 'onInteractive']: the LAST hyphenated run
    // of a segment is camel-cased, matching how the token paths are actually spelled.
    const TOKEN_PATH: Readonly<Record<string, readonly string[]>> = {
      'surface-canvas': ['surface', 'canvas'],
      'text-primary': ['text', 'primary'],
      'text-accent': ['text', 'accent'],
      'text-on-interactive': ['text', 'onInteractive'],
    };

    const declarations = [
      ...brandCss.matchAll(/^\s*--brand([AB])-([A-Za-z0-9-]+)\s*:\s*([^;]+);/gm),
    ];
    expect(declarations.length, 'the primitive declarations stopped parsing').toBe(7);

    const mismatches: string[] = [];
    for (const [, brand, slug, rawValue] of declarations) {
      const trail = TOKEN_PATH[slug];
      expect(trail, `--brand${brand}-${slug} has no declared token path — add it here`).toBeDefined();
      let node: any = readCell(brand);
      for (const segment of trail!) node = node?.[segment];
      expect(node?.$value, `brands/${brand}/base.json has no ${trail!.join('.')}`).toBeDefined();
      if (rawValue.trim() !== String(node.$value).trim()) {
        mismatches.push(
          `--brand${brand}-${slug}: brand.css has "${rawValue.trim()}", ` +
            `brands/${brand}/base.json ${trail!.join('.')} has "${node.$value}"`,
        );
      }
    }
    expect(
      mismatches,
      `brand.css primitives have drifted from their token sources:\n  ${mismatches.join('\n  ')}`,
    ).toEqual([]);
  });
});
