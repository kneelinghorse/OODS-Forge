#!/usr/bin/env node
// s169-m02 grounding: scratch copy of scripts/quality/brand-cascade-browser-proof.mjs
// with ALL FOUR index.css imports injected + apps/explorer/src/styles/tokens.css.
// Order variant chosen by argv[2]: "last" (explorer tokens.css injected LAST — worst
// case for :root masking) or "first" (mirrors .storybook/preview.ts which imports it
// before index.css). Also probes the 3 UNBRIDGED focus slots and reports what they
// resolve to per cell (no assertion — measurement only).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const REPO_ROOT = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge';
const read = (rel) => readFileSync(path.join(REPO_ROOT, rel), 'utf8');

const BRANDS = ['A', 'B'];
const THEMES = ['base', 'dark', 'hc'];
const VARIANT = process.argv[2] === 'first' ? 'first' : 'last';

const { SEMANTIC_BRIDGE, UNBRIDGED_SLOTS } = await import(
  path.join(REPO_ROOT, 'packages/tokens/scripts/brand-bridge.mjs')
);

function expectedFor(brand, theme) {
  const doc = JSON.parse(read(`packages/tokens/src/tokens/brands/${brand}/${theme}.json`));
  const out = {};
  for (const { slot, tokenPath } of SEMANTIC_BRIDGE) {
    let node = doc;
    for (const seg of `color.brand.${brand}.${tokenPath}`.split('.')) {
      node = node?.[seg];
      if (node === undefined) break;
    }
    if (node && typeof node === 'object' && '$value' in node) out[slot] = String(node.$value);
  }
  return out;
}

// Proposed order-guard shape: assert the FULL import list, not indices 0 and 1.
const INDEX_CSS = read('apps/explorer/src/styles/index.css');
const importOrder = [...INDEX_CSS.matchAll(/@import\s+'\.\/([a-z-]+\.css)'/g)].map((m) => m[1]);
const EXPECTED_ORDER = ['layers.css', 'brand.css', 'motion.css', 'hc.css'];
if (JSON.stringify(importOrder) !== JSON.stringify(EXPECTED_ORDER)) {
  throw new Error(`index.css import list changed to [${importOrder.join(', ')}]`);
}

const indexSheets = [
  ['generated @oods/tokens/css', read('packages/tokens/dist/css/tokens.css')],
  ...importOrder.map((f) => [f, read(`apps/explorer/src/styles/${f}`)]),
];
const explorerTokens = ['explorer tokens.css', read('apps/explorer/src/styles/tokens.css')];
const SHEETS = VARIANT === 'last' ? [...indexSheets, explorerTokens] : [explorerTokens, ...indexSheets];
console.log(`sheet order (${VARIANT}): ${SHEETS.map(([n]) => n).join(' -> ')}`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><head></head><body></body></html>');
for (const [, css] of SHEETS) {
  await page.addStyleTag({ content: css.replace(/@import[^;]+;/g, '') });
}

if (process.env.BRAND_CASCADE_PROOF_SELFTEST === '1') {
  await page.addStyleTag({
    content: "[data-brand='A'][data-theme='dark']{--theme-surface-canvas:rgb(1,2,3)}",
  });
  console.log('SELFTEST: masking declaration injected');
}

const failures = [];
let asserted = 0;
const focusReport = [];

for (const brand of BRANDS) {
  for (const theme of THEMES) {
    const expected = expectedFor(brand, theme);
    const focusSlots = UNBRIDGED_SLOTS.map((e) => e.slot);
    const results = await page.evaluate(
      ({ brand, theme, expected, focusSlots }) => {
        document.documentElement.setAttribute('data-brand', brand);
        document.documentElement.setAttribute('data-theme', theme);
        const out = {};
        for (const [slot, literal] of Object.entries(expected)) {
          const a = document.createElement('div');
          a.style.backgroundColor = `var(${slot})`;
          const b = document.createElement('div');
          b.style.backgroundColor = literal;
          document.body.append(a, b);
          out[slot] = { cascade: getComputedStyle(a).backgroundColor, literal: getComputedStyle(b).backgroundColor };
          a.remove(); b.remove();
        }
        const focus = {};
        for (const slot of focusSlots) {
          const a = document.createElement('div');
          a.style.backgroundColor = `var(${slot})`;
          document.body.append(a);
          focus[slot] = getComputedStyle(a).backgroundColor;
          a.remove();
        }
        return { out, focus };
      },
      { brand, theme, expected, focusSlots },
    );
    for (const slot of Object.keys(expected)) {
      const { cascade, literal } = results.out[slot];
      asserted += 1;
      if (cascade === 'rgba(0, 0, 0, 0)') failures.push(`${brand}/${theme} ${slot}: unresolved`);
      else if (cascade !== literal) failures.push(`${brand}/${theme} ${slot}: cascade ${cascade} != literal ${literal} (${expected[slot]})`);
    }
    focusReport.push(`${brand}/${theme} focus: ${Object.entries(results.focus).map(([k, v]) => `${k.replace('--theme-focus-', '')}=${v}`).join('  ')}`);
  }
}
await browser.close();
console.log(`\n${asserted} assertions, ${failures.length} failures`);
for (const f of failures.slice(0, 10)) console.log('  FAIL ' + f);
console.log('\nFOCUS SLOT RESOLUTION (measurement only):');
for (const line of focusReport) console.log('  ' + line);
process.exit(failures.length > 0 ? 1 : 0);
