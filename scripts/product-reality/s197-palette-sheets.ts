/** Fixed-input, React-only palette comparison. Run prepare, then isolated before/after workers. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-197/m06/side-by-side');
const beforeRoot = path.join(root, 'artifacts/product-reality/sprint-197/m01/before/packages/tokens/dist');
const require = createRequire(import.meta.url);
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const save = async (file: string, value: unknown) => {
  const target = path.join(out, file); await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
const read = async (file: string) => JSON.parse(await fs.readFile(path.join(out, file), 'utf8'));
const palette = process.argv[2];
assert(['prepare', 'before', 'after'].includes(palette), 'Use prepare, before or after');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (palette === 'prepare') {
  const { handle: compose } = await import('../../packages/mcp-server/src/tools/design.compose.js');
  const { deriveConsumerModel } = await import('./s185-m04-consumer-contract.js');
  const { workflowSampleRecords } = await import('../../packages/mcp-server/src/codegen/workflow-data-emitter.js');
  const inputs = [];
  for (const [object, context] of [['Subscription', 'list'], ['Subscription', 'detail'], ['Subscription', 'form'], ['Subscription', 'timeline'], ['Subscription', 'workflow'], ['Organization', 'detail']] as const) {
    for (const theme of ['light', 'dark'] as const) {
      const request = { object, context, preferences: { theme } };
      const result = await compose(request); assert.equal(result.status, 'ok', JSON.stringify(result.errors));
      const model = context === 'workflow' ? workflowSampleRecords(result.schema) : deriveConsumerModel(result.schema);
      const input = { id: `${object}-${context}-${theme}`, object, context, theme, request, schema: result.schema, seed: model };
      const file = `inputs/${input.id}.json`; await save(file, input);
      inputs.push({ file, sha256: sha(await fs.readFile(path.join(out, file))), schemaSha256: sha(JSON.stringify(input.schema)), seedSha256: sha(JSON.stringify(input.seed)) });
    }
  }
  await save('inputs.json', { head, clock: '2026-09-08T12:00:00Z', inputs, builderSelfCertified: false });
  console.log(JSON.stringify({ compositions: inputs.length }));
} else {
  // Select the palette before importing any rendering/consumer module. This is
  // an isolated proof worker; no package file or live server is modified.
  const tokens = require('@oods/tokens');
  if (palette === 'before') {
    const old = require(path.join(beforeRoot, 'index.cjs'));
    assert.deepEqual(Object.keys(tokens).sort(), Object.keys(old).sort());
    Object.assign(tokens, old);
  }
  const { handle: generate } = await import('../../packages/mcp-server/src/tools/code.generate.js');
  const { createConsumerFiles, withStaticServer } = await import('./s184-m06-live-consumers.js');
  const { build } = require('esbuild') as typeof import('esbuild');
  const { chromium } = require('playwright') as typeof import('playwright');
  const manifest = await read('inputs.json');
  const cssPath = palette === 'before' ? path.join(beforeRoot, 'css/tokens.css') : require.resolve('@oods/tokens/css');
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s197-sheets-'));
  const browser = await chromium.launch({ headless: true });
  const rows: Array<Record<string, unknown>> = [];
  try {
    for (const ref of manifest.inputs) {
      const bytes = await fs.readFile(path.join(out, ref.file)); assert.equal(sha(bytes), ref.sha256);
      const input = JSON.parse(bytes.toString());
      for (const brand of ['A', 'B'] as const) {
        const id = `${input.id}-${brand}`, directory = path.join(temp, id);
        const result = await generate({ schema: input.schema, framework: 'react', profile: 'build', options: { theme: input.theme, brand } });
        assert.equal(result.status, 'ok', JSON.stringify(result.errors)); assert(result.artifact);
        const files: Record<string, string> = Object.fromEntries(result.artifact.files.map(file => [file.path, file.contents]));
        if (input.context !== 'workflow') {
          const consumer = createConsumerFiles({ framework: 'react', source: result.code, actions: result.artifact.actions ?? [], schemaName: `fresh-${id}` as any, model: input.seed, mission: 's197-m06' });
          Object.assign(files, consumer);
          files['src/main.tsx'] = files['src/main.tsx'].replace("import { hydrateRoot }", "import { createRoot }").replace('hydrateRoot(root, React.createElement', 'createRoot(root).render(React.createElement');
          files['index.html'] = files['index.html'].replace('data-brand="A" data-theme="dark"', `data-brand="${brand}" data-theme="${input.theme}"`);
        } else {
          const data = result.artifact.files.find(file => file.path === 'src/sample-data.ts')!;
          assert(data.contents.includes(JSON.stringify(input.seed, null, 2)), 'Workflow seed drift');
        }
        for (const [file, contents] of Object.entries(files)) {
          await fs.mkdir(path.dirname(path.join(directory, file)), { recursive: true }); await fs.writeFile(path.join(directory, file), contents);
        }
        await build({ entryPoints: [path.join(directory, 'src/main.tsx')], outfile: path.join(directory, 'bundle.js'), bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', logLevel: 'silent',
          nodePaths: [path.join(root, 'node_modules'), path.join(root, 'packages/mcp-server/node_modules'), path.join(root, 'packages/components-react/node_modules')],
          loader: { '.svg': 'dataurl' }, define: { 'process.env.NODE_ENV': '"production"' },
          plugins: [{ name: 'qualified-palette-css', setup(build) { build.onResolve({ filter: /^@oods\/tokens\/css$/ }, () => ({ path: cssPath })); } }] });
        await fs.writeFile(path.join(directory, 'index.html'), files['index.html'].replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, '<link rel="stylesheet" href="/bundle.css"><script defer src="/bundle.js"></script>'));
        await withStaticServer(directory, async url => {
          for (const width of [390, 820, 1440]) {
            const page = await browser.newPage({ viewport: { width, height: 1080 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: input.theme, reducedMotion: 'reduce' });
            const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
            await page.clock.install({ time: new Date(manifest.clock) }); await page.goto(url);
            await page.waitForSelector('[data-oods-component]').catch(async error => {
              console.error(JSON.stringify({ id, errors, body: await page.locator('body').innerText() })); throw error;
            });
            if (input.context === 'workflow') await page.waitForSelector('[data-ui-state="success"]');
            await page.evaluate(() => document.fonts.ready);
            const observed = await page.evaluate(() => ({ brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme,
              background: getComputedStyle(document.body).backgroundColor, foreground: getComputedStyle(document.body).color,
              text: document.body.innerText, overflow: document.documentElement.scrollWidth > innerWidth,
              components: document.querySelectorAll('[data-oods-component]').length }));
            assert.equal(observed.brand, brand); assert.equal(observed.theme, input.theme); assert.deepEqual(errors, []); assert(observed.components > 0);
            const file = `forge/${id}-${width}-${palette}.png`; await fs.mkdir(path.dirname(path.join(out, file)), { recursive: true });
            await page.screenshot({ path: path.join(out, file), fullPage: true, animations: 'disabled' });
            rows.push({ id: `${id}-${width}`, object: input.object, context: input.context, theme: input.theme, brand, width, palette, input: ref, file,
              sha256: sha(await fs.readFile(path.join(out, file))), observed: { ...observed, text: undefined, textSha256: sha(observed.text) }, errors,
              generatedFiles: result.artifact.files.map(file => ({ path: file.path, sha256: sha(file.contents) })) });
            await page.close();
          }
        });
        await fs.rm(directory, { recursive: true, force: true });
        console.log(JSON.stringify({ palette, composition: id, screenshots: 3 }));
      }
    }
    await save(`forge-${palette}.json`, { head, palette, css: { path: path.relative(root, cssPath), sha256: sha(await fs.readFile(cssPath)) },
      tokenBundleSha256: sha(JSON.stringify(tokens)), clock: manifest.clock, rows, builderSelfCertified: false });
  } finally { await browser.close(); await fs.rm(temp, { recursive: true, force: true }); }
}
