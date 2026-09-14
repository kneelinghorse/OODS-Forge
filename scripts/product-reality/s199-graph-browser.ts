/** The new graph wrapper and the exact public SVG, in every supported scope. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
const { createServer } = createRequire(new URL('../../packages/components-react/package.json', import.meta.url))('vite');
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { runVizThemeProof, runComponentThemeProof } from './component-theme-proof.mjs';
import { componentContracts, NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';
import { SUPPORTED_COMPONENT_THEME_CELLS } from '@oods/component-styles';

const root = path.resolve(import.meta.dirname, '../..');
const relativeOutput = process.argv[2] ?? 'artifacts/product-reality/sprint-199/m06';
const output = path.resolve(root, relativeOutput);
assert(output.startsWith(path.join(root, 'artifacts/product-reality/sprint-199/')));
const samples = JSON.parse(await fs.readFile(path.join(root, 'packages/component-contracts/fixtures/viz-preview-samples.v1.json'), 'utf8'));
const cases: any[] = [];
for (const framework of ['react', 'vue']) {
  const require = createRequire(path.join(root, `packages/components-${framework}/package.json`));
  for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark', 'hc'] as const) {
    const request = { ...samples.samples.VizGraphPreview.input, brand, theme };
    const result = await render(request);
    assert.equal(result.status, 'ok', JSON.stringify(result.errors)); assert(result.svg);
    const props = { svg: result.svg, title: request.name, description: request.description };
    const Preview = require('./dist/index.cjs').VizGraphPreview;
    const markup = framework === 'react'
      ? require('react-dom/server').renderToStaticMarkup(require('react').createElement(Preview, props))
      : await require('@vue/server-renderer').renderToString(require('vue').createSSRApp({ render: () => require('vue').h(Preview, props) }));
    assert(markup.includes(result.svg));
    const id = `${framework}-${brand}-${theme}`;
    const html = `<!doctype html><html data-brand="${brand}" data-theme="${theme}"><body style="background:${theme === 'hc' ? 'Canvas' : theme === 'dark' ? '#101217' : '#fff'};color:${theme === 'hc' ? 'CanvasText' : theme === 'dark' ? '#fff' : '#111'}">${markup}</body></html>`;
    await fs.mkdir(path.join(output, 'graph-browser'), { recursive: true });
    await fs.writeFile(path.join(output, `graph-browser/${id}.html`), html);
    await fs.writeFile(path.join(output, `graph-browser/${id}.json`), JSON.stringify({ request, result }, null, 2) + '\n');
    cases.push({ id, brand, theme, svgCount: 1, expectedSvg: result.svg, accessibleName: request.name, mount: (page: any) => page.setContent(html) });
  }
}
const report = await runVizThemeProof({ cases, output: path.join(output, 'graph-browser'), chromium, mission: 's199-m06' });
assert.equal(report.browser.version, '141.0.7390.37');
// Run the same governed component theme measurements used by readiness. The
// page mounts all scenarios, while this new evidence owns only the new row.
for (const framework of ['react', 'vue']) {
  process.argv = [process.argv[0]!, process.argv[1]!, `--output=${relativeOutput}/${framework}-theme`, '--mission=s199-m06'];
  await runComponentThemeProof({ framework, packageRoot: path.join(root, `packages/components-${framework}`),
    canonicalIds: NUCLEUS_COMPONENT_IDS, supportedCells: SUPPORTED_COMPONENT_THEME_CELLS,
    contracts: componentContracts, createServer, chromium });
}
console.log(JSON.stringify({ chartCells: report.selected, componentCells: NUCLEUS_COMPONENT_IDS.length * 12, failed: report.failed, skipped: report.skipped }));
