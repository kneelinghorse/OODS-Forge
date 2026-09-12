import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as dashboard } from '../../packages/mcp-server/src/tools/dashboard.render.js';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { SALES, CASES } from '../../packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { createConsumerFiles } from './s184-m06-live-consumers.js';
import { deriveConsumerModel } from './s185-m04-consumer-contract.js';
import { runVizForcedColourProof } from './component-theme-proof.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'artifacts/product-reality/sprint-195/m05/browser');
const requireVue = createRequire(path.join(root, 'packages/components-vue/package.json'));
const { createServer } = await import(requireVue.resolve('vite'));
const { default: vue } = await import(requireVue.resolve('@vitejs/plugin-vue'));
const tokenCss = await fs.readFile(path.join(root, 'packages/tokens/dist/css/tokens.css'), 'utf8');
const cases: { id: string; brand: 'A' | 'B'; svgCount: number; selector?: string; mount(page: Page): Promise<void> }[] = [];
const servers: { close(): Promise<void> }[] = [];
const write = async (name: string, value: unknown) => {
  const file = path.join(output, name); await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
try {
  for (const brand of ['A', 'B'] as const) {
    for (const chart of CASES.slice(0, 2)) {
      const id = `${chart.chartType}-${brand}-hc`;
      const request = { chartType: chart.chartType, encodings: chart.encodings, rows: [...SALES], theme: 'hc' as const, brand, output: { svg: true, includeNormalizedSpec: true } };
      const result = await render(request); assert.equal(result.status, 'ok', JSON.stringify(result.errors));
      const html = `<!doctype html><html data-brand="${brand}" data-theme="hc"><head><style>${tokenCss}</style></head><body style="background:var(--sys-surface-canvas);color:var(--sys-text-primary)">${result.svg}</body></html>`;
      await write(`${id}.json`, { request, result }); await write(`${id}.html`, html);
      cases.push({ id, brand, svgCount: 1, mount: async page => { await page.setContent(html); } });
    }
    const id = `dashboard-${brand}-hc`;
    const request = { schemaVersion: 'v0.1' as const, theme: 'hc' as const, brand,
      datasets: [{ id: 'sales', rows: [...SALES] }],
      panels: CASES.slice(0, 2).map(({ chartType, encodings }) => ({ id: chartType, kind: 'chart' as const, chartType, encodings, datasetId: 'sales' })),
      a11y: { description: 'Sales by region and month, rendered with the high-contrast scope.' }, output: { html: true, contrastScan: true } };
    const result = await dashboard(request); assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    assert(result.html); await write(`${id}.json`, { request, result }); await write(`${id}.html`, result.html);
    cases.push({ id, brand, svgCount: 2, mount: async page => { await page.setContent(result.html!); } });

    for (const framework of ['react', 'vue'] as const) {
      const id = `Subscription-detail-${framework}-${brand}-hc`;
      const composition = await compose({ object: 'Subscription', context: 'detail', preferences: { theme: 'hc', brand } });
      assert.equal(composition.status, 'ok', JSON.stringify(composition.errors));
      const generated = await generate({ schema: composition.schema, framework, profile: 'build', options: { theme: 'hc', brand } });
      assert.equal(generated.status, 'ok', JSON.stringify(generated.errors)); assert(generated.artifact);
      await write(`${id}/composition.json`, composition); await write(`${id}/generation.json`, generated);
      const files = createConsumerFiles({ framework, source: generated.code, actions: generated.artifact.actions,
        schemaName: 'fresh-Subscription-detail', model: deriveConsumerModel(composition.schema), mission: 's195-m05' });
      const entry = framework === 'react' ? 'src/main.tsx' : 'src/main.ts';
      // Reuse the runtime consumer's client mount; public generated source stays byte-identical.
      files[entry] = framework === 'react'
        ? files[entry]!.replace('import { hydrateRoot }', 'import { createRoot }')
          .replace('hydrateRoot(root, React.createElement(GeneratedUI,', 'createRoot(root).render(React.createElement(GeneratedUI,').replace(/\}\)\);\s*$/, '}));\n')
        : files[entry]!.replaceAll('createSSRApp', 'createApp');
      files['index.html'] = files['index.html']!.replace('data-brand="A" data-theme="dark"', `data-brand="${brand}" data-theme="hc"`);
      const consumer = path.join(output, id, 'consumer');
      await fs.mkdir(consumer, { recursive: true });
      // Preserve every handler asset alongside the existing live-consumer entry/model.
      for (const file of generated.artifact.files) await write(`${id}/consumer/${file.path}`, file.contents);
      for (const [name, source] of Object.entries(files)) await write(`${id}/consumer/${name}`, source);
      const server = await createServer({ root: consumer, configFile: false, logLevel: 'error', cacheDir: path.join(consumer, 'node_modules/.vite'),
        plugins: framework === 'vue' ? [vue()] : [],
        resolve: { alias: {
          '@oods/component-styles/css': path.join(root, 'packages/component-styles/dist/components.css'),
          '@oods/components-react': path.join(root, 'packages/components-react/dist/index.js'),
          '@oods/components-vue': path.join(root, 'packages/components-vue/dist/index.js'),
          vue: requireVue.resolve('vue/dist/vue.runtime.esm-bundler.js'),
        } }, server: { host: '127.0.0.1', port: 0, fs: { allow: [root] } } });
      servers.push(server); await server.listen();
      const origin = `http://127.0.0.1:${(server.httpServer!.address() as { port: number }).port}`;
      cases.push({ id, brand, svgCount: 1, selector: '[data-oods-component="VizAreaPreview"] svg', mount: async page => {
        await page.goto(origin, { waitUntil: 'networkidle' });
        const chart = page.locator('[data-oods-component="VizAreaPreview"] svg');
        if (!await chart.isVisible()) for (const tab of await page.getByRole('tab').all()) { await tab.click(); if (await chart.isVisible()) break; }
        await chart.waitFor({ state: 'visible' });
      } });
    }
  }
  const report = await runVizForcedColourProof({ cases, output, chromium });
  console.log(`${report.selected} public forced-colour cells, ${report.failed} failures, ${report.skipped} skipped`);
} finally { await Promise.all(servers.map(server => server.close())); }
