#!/usr/bin/env node
/**
 * s168 m06 — THE RENDERED-SURFACE PROOF.
 *
 * Every other control in this sprint reads a FILE: the emitted CSS artifact, the token
 * sources, the bridge map. None of them proves a browser resolves any of it. This does.
 *
 * ── WHAT IT ASSERTS, AND WHY IT DISCRIMINATES ──
 * For each brand × theme cell, two probe elements are painted:
 *
 *   probe A   background-color: var(--theme-<slot>)     ← goes through the whole cascade
 *   probe B   background-color: <the literal value the brand token source declares>
 *
 * Both are read back with `getComputedStyle`, so both are RESOLVED COMPUTED values in the
 * same colour space, converted by the same engine. If the cascade delivers the right token
 * they are byte-identical strings; if any layer masks, mis-scopes, or drops a slot, they
 * differ. Comparing two browser-computed values sidesteps every oklch→rgb rounding
 * question — the browser is the authority on both sides.
 *
 * A probe that fails to resolve computes to `rgba(0, 0, 0, 0)`, which is treated as a
 * FAILURE rather than a match, so an undefined variable cannot pass by looking transparent.
 *
 * ── CSS IS INJECTED IN THE REAL IMPORT ORDER ──
 * `apps/explorer/src/styles/index.css` is `layers.css` → `brand.css` → …, and
 * `layers.css:1` imports the generated `@oods/tokens/css`. Stylesheet insertion order is
 * the cascade's source order, so injecting in that sequence reproduces the real cascade —
 * including the tie that sprint-168 m05 removed. Order is asserted, not assumed.
 *
 * ── SCOPE, STATED ──
 * This proves the CSS cascade resolves brand tokens in a real engine. It does NOT prove
 * any particular component renders correctly; that is a different (and larger) claim.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(path.join(REPO_ROOT, rel), 'utf8');

const BRANDS = ['A', 'B'];
const THEMES = ['base', 'dark', 'hc'];

const { SEMANTIC_BRIDGE } = await import(
  path.join(REPO_ROOT, 'packages/tokens/scripts/brand-bridge.mjs')
);

/** The brand token source is the expectation — never the build's own output. */
function expectedFor(brand, theme) {
  const doc = JSON.parse(read(`packages/tokens/src/tokens/brands/${brand}/${theme}.json`));
  const out = {};
  for (const { slot, tokenPath } of SEMANTIC_BRIDGE) {
    let node = doc;
    for (const segment = `color.brand.${brand}.${tokenPath}`.split('.'), i = { v: 0 }; ; ) {
      node = node?.[segment[i.v++]];
      if (i.v >= segment.length || node === undefined) break;
    }
    if (node && typeof node === 'object' && '$value' in node) out[slot] = String(node.$value);
  }
  return out;
}

// The real import order from apps/explorer/src/styles/index.css. layers.css:1 imports the
// generated CSS, so it goes in first, exactly as the bundler would place it.
const LAYERS_CSS = read('apps/explorer/src/styles/layers.css');
if (!/@import[^;]*@oods\/tokens\/css/.test(LAYERS_CSS)) {
  throw new Error(
    'layers.css no longer imports @oods/tokens/css — the injection order below no longer ' +
      'reproduces the real cascade. Re-derive it from index.css before trusting this proof.',
  );
}
const INDEX_CSS = read('apps/explorer/src/styles/index.css');
const importOrder = [...INDEX_CSS.matchAll(/@import\s+'\.\/([a-z-]+\.css)'/g)].map((m) => m[1]);
if (importOrder[0] !== 'layers.css' || importOrder[1] !== 'brand.css') {
  throw new Error(
    `index.css import order changed to [${importOrder.join(', ')}] — this proof pins ` +
      'layers.css then brand.css. Re-verify the cascade before updating this check.',
  );
}

const SHEETS = [
  ['generated @oods/tokens/css', read('packages/tokens/dist/css/tokens.css')],
  ['layers.css', LAYERS_CSS],
  ['brand.css', read('apps/explorer/src/styles/brand.css')],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><head></head><body></body></html>');
for (const [, css] of SHEETS) {
  // @import inside an injected sheet cannot resolve; the generated CSS is injected
  // directly above, which is what that import would have produced.
  await page.addStyleTag({ content: css.replace(/@import[^;]+;/g, '') });
}

// SELF-TEST (rule 13a: a control that cannot go red is not a control). With
// BRAND_CASCADE_PROOF_SELFTEST=1 a masking rule is injected LAST, exactly as a regressed
// stylesheet loading after the bridge would. The proof must then FAIL; if it still passes,
// it is not measuring the cascade and the green above means nothing.
if (process.env.BRAND_CASCADE_PROOF_SELFTEST === '1') {
  await page.addStyleTag({
    content: "[data-brand='A'][data-theme='dark']{--theme-surface-canvas:rgb(1,2,3)}",
  });
  console.log('SELFTEST: injected a masking declaration for A/dark --theme-surface-canvas');
}

const failures = [];
let asserted = 0;

for (const brand of BRANDS) {
  for (const theme of THEMES) {
    const expected = expectedFor(brand, theme);
    const slots = Object.keys(expected);
    const results = await page.evaluate(
      ({ brand, theme, expected }) => {
        document.documentElement.setAttribute('data-brand', brand);
        document.documentElement.setAttribute('data-theme', theme);
        const out = {};
        for (const [slot, literal] of Object.entries(expected)) {
          const viaCascade = document.createElement('div');
          viaCascade.style.backgroundColor = `var(${slot})`;
          const viaLiteral = document.createElement('div');
          viaLiteral.style.backgroundColor = literal;
          document.body.append(viaCascade, viaLiteral);
          out[slot] = {
            cascade: getComputedStyle(viaCascade).backgroundColor,
            literal: getComputedStyle(viaLiteral).backgroundColor,
          };
          viaCascade.remove();
          viaLiteral.remove();
        }
        return out;
      },
      { brand, theme, expected },
    );

    for (const slot of slots) {
      const { cascade, literal } = results[slot];
      asserted += 1;
      // An unresolved var() paints transparent — never let that count as agreement.
      if (cascade === 'rgba(0, 0, 0, 0)') {
        failures.push(`${brand}/${theme} ${slot}: did not resolve (painted transparent)`);
      } else if (cascade !== literal) {
        failures.push(
          `${brand}/${theme} ${slot}: cascade painted ${cascade}, token source declares ` +
            `${expected[slot]} which paints ${literal}`,
        );
      }
    }
    console.log(
      `${brand}/${theme}: ${slots.length} slots painted, ` +
        `${failures.length === 0 ? 'all match' : `${failures.length} mismatch so far`}`,
    );
  }
}

await browser.close();

console.log(`\nrendered-surface proof: ${asserted} computed-style assertions across 6 cells`);
if (failures.length > 0) {
  console.error(`\n${failures.length} MISMATCH(ES):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
if (asserted === 0) {
  console.error('\nZERO assertions ran — the proof is vacuous. Failing rather than reporting green.');
  process.exit(1);
}
console.log('✔ every bridged slot resolves in a real browser to the value its token source declares');
