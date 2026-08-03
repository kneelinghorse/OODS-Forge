/**
 * s169 m02 — what actually decides the light focus slots?
 * Probes the three attribute configurations a light cell can be in, at HEAD and with
 * brand.css's :where() wrapper removed, so the REASON can be stated accurately.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const REPO_ROOT = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge';
const read = (rel) => readFileSync(path.join(REPO_ROOT, rel), 'utf8');
const variant = process.argv[2] ?? 'head';

let brandCss = read('apps/explorer/src/styles/brand.css');
if (variant === 'nowhere') {
  brandCss = brandCss.replace(
    /:where\((\[data-brand='[AB]'\]:not\(\[data-theme\]\), \[data-brand='[AB]'\]\[data-theme='light'\])\)/g,
    '$1',
  );
}

const INDEX_CSS = read('apps/explorer/src/styles/index.css');
const importOrder = [...INDEX_CSS.matchAll(/@import\s+'\.\/([a-z-]+\.css)'/g)].map((m) => m[1]);
const SHEETS = [
  read('packages/tokens/dist/css/tokens.css'),
  ...importOrder.map((f) => (f === 'brand.css' ? brandCss : read(`apps/explorer/src/styles/${f}`))),
  read('apps/explorer/src/styles/tokens.css'),
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><head></head><body></body></html>');
for (const css of SHEETS) await page.addStyleTag({ content: css.replace(/@import[^;]+;/g, '') });

const SLOTS = ['--theme-focus-ring-outer', '--theme-focus-ring-inner', '--theme-focus-text'];
const CONFIGS = [
  ['A', null], ['A', 'light'], ['A', 'base'],
  ['B', null], ['B', 'light'], ['B', 'base'],
];

console.log(`variant=${variant}`);
for (const [brand, theme] of CONFIGS) {
  const out = await page.evaluate(
    ({ brand, theme, SLOTS }) => {
      document.documentElement.setAttribute('data-brand', brand);
      if (theme === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', theme);
      const res = {};
      for (const slot of SLOTS) {
        const d = document.createElement('div');
        d.style.backgroundColor = `var(${slot})`;
        document.body.append(d);
        res[slot] = getComputedStyle(d).backgroundColor;
        d.remove();
      }
      return res;
    },
    { brand, theme, SLOTS },
  );
  console.log(
    `  ${brand}/${theme ?? '<no data-theme>'}: ` +
      SLOTS.map((s) => `${s.replace('--theme-focus-', '')}=${out[s]}`).join('  '),
  );
}
await browser.close();
