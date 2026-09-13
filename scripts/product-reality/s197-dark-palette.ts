// Bounded m03 receipt: generated source ladder and a mounted compose-dark app.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import Color from 'colorjs.io';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { withStaticServer } from './s184-m06-live-consumers.js';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-197/m03');
const require = createRequire(import.meta.url);
const { build } = require('esbuild') as typeof import('esbuild');
const { chromium } = require('playwright') as typeof import('playwright');
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const save = async (name: string, value: unknown) => fs.writeFile(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const sourcePaths = ['scripts/tokens/generate-palette.ts', 'packages/tokens/src/palette/seeds.json',
  ...['A', 'B'].map(brand => `packages/tokens/src/tokens/brands/${brand}/dark.json`),
  ...['surface', 'text', 'status', 'focus'].map(name => `packages/tokens/src/tokens/themes/dark/${name}.json`)];
const sources = await Promise.all(sourcePaths.map(async file => ({ file, sha256: sha(await fs.readFile(path.join(root, file))) })));
const elevations = [];
for (const brand of ['A', 'B']) {
  const roles = JSON.parse(await fs.readFile(path.join(root, `packages/tokens/src/tokens/brands/${brand}/dark.json`), 'utf8')).color.brand[brand];
  let previous: number | undefined;
  const ladder = ['backdrop', 'canvas', 'raised', 'subtle', 'disabled'].map(role => {
    const value = roles.surface[role].$value;
    const [l, c, h] = new Color(value).to('oklch').coords.map(Number);
    const delta = previous === undefined ? null : Number((l - previous).toFixed(6));
    assert(c < .012); if (delta !== null) assert.equal(delta, .035);
    previous = l;
    return { role, value, l, c, h, delta };
  });
  elevations.push({ brand, ladder });
}
await save('elevations.json', { missionId: 's197-m03', sources, elevations, builderSelfCertified: false });
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s197-shell-'));
try {
  const request = { object: 'Subscription', context: 'workflow' as const, preferences: { theme: 'dark' } };
  const composition = await compose(request);
  assert.equal(composition.status, 'ok', JSON.stringify(composition.errors));
  const generated = await generate({ schema: composition.schema, framework: 'react', profile: 'build' });
  assert.equal(generated.status, 'ok', JSON.stringify(generated.errors));
  for (const file of generated.artifact!.files) {
    const dest = path.join(temp, file.path);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, file.contents);
  }
  await build({ entryPoints: [path.join(temp, 'src/main.tsx')], outfile: path.join(temp, 'bundle.js'),
    bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', logLevel: 'silent',
    nodePaths: [path.join(root, 'node_modules'), path.join(root, 'packages/mcp-server/node_modules'), path.join(root, 'packages/components-react/node_modules')],
    loader: { '.svg': 'dataurl' }, define: { 'process.env.NODE_ENV': '"production"' } });
  const html = await fs.readFile(path.join(temp, 'index.html'), 'utf8');
  await fs.writeFile(path.join(temp, 'index.html'), html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, '<link rel="stylesheet" href="/bundle.css"><script defer src="/bundle.js"></script>'));
  const browser = await chromium.launch({ headless: true });
  try {
    const observed = await withStaticServer(temp, async url => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.clock.install({ time: new Date('2026-03-08T12:00:00Z') });
      await page.goto(url);
      await page.waitForSelector('[data-ui-state="success"] [data-oods-component="Text"]');
      await page.evaluate(() => document.fonts.ready);
      const pixels = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        const swatch = document.createElement('div');
        swatch.style.background = 'var(--sys-surface-canvas)'; document.body.append(swatch);
        const canvas = getComputedStyle(swatch).backgroundColor; swatch.remove();
        return { htmlTheme: document.documentElement.dataset.theme, bodyTheme: document.body.dataset.theme,
          brand: document.documentElement.dataset.brand, colorScheme: styles.colorScheme,
          bodyBackground: getComputedStyle(document.body).backgroundColor, expectedCanvas: canvas,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(pixels.htmlTheme, 'dark'); assert.equal(pixels.bodyTheme, 'dark');
      assert.equal(pixels.brand, 'A'); assert.equal(pixels.colorScheme, 'dark');
      assert.equal(pixels.bodyBackground, pixels.expectedCanvas); assert.notEqual(pixels.bodyBackground, 'rgba(0, 0, 0, 0)');
      assert.equal(pixels.horizontalOverflow, false); assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(out, 'composed-dark-shell.png'), fullPage: true });
      await page.close();
      return { ...pixels, errors };
    });
    await save('shell-proof.json', { request, schemaTheme: composition.schema.theme,
      codeGenerationOptions: 'omitted: theme must be inherited from compose', framework: 'react',
      contentHash: generated.artifact!.contentHash, observed,
      screenshot: { file: 'composed-dark-shell.png', sha256: sha(await fs.readFile(path.join(out, 'composed-dark-shell.png'))) },
      generatedFiles: generated.artifact!.files.map(file => ({ path: file.path, sha256: sha(file.contents) })), builderSelfCertified: false });
    console.log(JSON.stringify({ elevations: elevations.length, stepsPerBrand: 5, shell: observed }));
  } finally { await browser.close(); }
} finally { await fs.rm(temp, { recursive: true, force: true }); }
