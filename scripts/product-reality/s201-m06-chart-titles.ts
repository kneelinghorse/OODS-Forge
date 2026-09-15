/**
 * Sprint 201 m06 — the two chart titles (#2060): the sankey title band and the placed Relationship graph.
 *
 * 1. Re-renders every viz-preview sample through the public viz.render and rewrites the fixture rows whose
 *    bytes moved (only the force-graph sample is expected to), recording before/after hashes.
 * 2. Renders the census sankey operand and the placed Relationship graph in every theme and brand, measures
 *    the title band against the chart geometry, and keeps the SVGs as receipts.
 * 3. With OODS_PLAYWRIGHT_WS_ENDPOINT set, screenshots the VizGraphPreview recipe in React and Vue in every scope.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium } from 'playwright';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { placedChartRequests } from '../../packages/mcp-server/src/codegen/chart-assets.js';
import { runVizThemeProof } from './component-theme-proof.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const output = path.resolve(root, process.argv[2] ?? 'artifacts/product-reality/sprint-201/m06/chart-titles');
assert(output.startsWith(path.join(root, 'artifacts/product-reality/sprint-201/')), 'receipts stay under sprint-201');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const json = async (file: string, value: unknown) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n'); };
const SCOPES = (['A', 'B'] as const).flatMap(brand => (['light', 'dark', 'hc'] as const).map(theme => ({ brand, theme })));

/** Rendered text elements with their absolute translate position. */
function texts(svg: string) {
  return [...svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map(match => {
    const attrs = match[1]!;
    const translate = /transform="translate\(([\d.-]+) ([\d.-]+)\)"/.exec(attrs);
    return { style: /style="([^"]*)"/.exec(attrs)?.[1] ?? '', x: Number(translate?.[1] ?? NaN), y: Number(translate?.[2] ?? NaN), text: match[2]! };
  });
}
/** Chart paths (nodes and links) with their absolute start y. */
const chartStarts = (svg: string) => [...svg.matchAll(/<path[^>]*\bd="M\s*([\d.-]+)[ ,]([\d.-]+)[^"]*"[^>]*transform="translate\(([\d.-]+) ([\d.-]+)\)"[^>]*ecmeta_ssr_type="chart"/g)].map(match => Number(match[2]) + Number(match[4]));

// 1. The preview samples fixture.
const samplePath = path.join(root, 'packages/component-contracts/fixtures/viz-preview-samples.v1.json');
const fixture = JSON.parse(await fs.readFile(samplePath, 'utf8'));
const sampleRows = [];
for (const [id, sample] of Object.entries(fixture.samples) as Array<[string, any]>) {
  const result = await render(sample.input);
  assert.equal(result.status, 'ok', `${id}: ${JSON.stringify(result.errors)}`);
  assert(result.svg && result.svgHash === sha256(result.svg));
  const moved = result.svg !== sample.svg;
  assert(!moved || id === 'VizGraphPreview', `${id}: only the force-graph sample moves with the title band`);
  sampleRows.push({ id, chartType: sample.input.chartType, beforeHash: sample.svgHash, afterHash: result.svgHash, moved });
  if (moved) { sample.svg = result.svg; sample.svgHash = result.svgHash; }
}
await fs.writeFile(samplePath, JSON.stringify(fixture, null, 2) + '\n');
await json(path.join(output, 'preview-samples.json'), { fixture: 'packages/component-contracts/fixtures/viz-preview-samples.v1.json', rows: sampleRows, builderSelfCertified: false });

// 2. The sankey title band and the placed graph, every scope.
const operands = JSON.parse(await fs.readFile(path.join(root, 'scripts/product-reality/s190-viz-operands.json'), 'utf8'));
const sankeyOperand = operands.find((operand: any) => operand.chartType === 'sankey');
const composed = await compose({ object: 'Relationship', context: 'detail', options: { transient: true } });
assert.equal(composed.status, 'ok');
const measurements = [];
for (const { brand, theme } of SCOPES) {
  const sankey = await render({ ...sankeyOperand, brand, theme, output: { svg: true } });
  assert.equal(sankey.status, 'ok', JSON.stringify(sankey.errors));
  const sankeyTitle = texts(sankey.svg!).find(entry => entry.text === sankeyOperand.name)!;
  const starts = chartStarts(sankey.svg!);
  const sankeyRow = { chart: 'sankey', brand, theme, file: `sankey-${brand}-${theme}.svg`, svgHash: sankey.svgHash, titleFontSize: /font-size:(\d+)px/.exec(sankeyTitle.style)?.[1], titleCenterY: sankeyTitle.y + 7, chartTopY: Math.min(...starts), titleClearsChart: Math.min(...starts) >= 40 && Math.min(...starts) > sankeyTitle.y + 14 };
  assert(sankeyRow.titleClearsChart, `sankey ${brand}/${theme}: title overlaps the node column`);
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, sankeyRow.file), sankey.svg!);
  measurements.push(sankeyRow);

  const [request] = placedChartRequests(composed.schema, { brand, theme });
  assert(request, 'Relationship detail places one graph');
  const graph = await render(request.request);
  assert.equal(graph.status, 'ok', JSON.stringify(graph.errors));
  const rendered = texts(graph.svg!);
  const title = rendered.find(entry => entry.text === request.request.name)!;
  const nodes = (request.request.network as { nodes: Array<{ id: string }> }).nodes.map(node => node.id);
  const labels = rendered.filter(entry => nodes.includes(entry.text));
  const box = (label: { x: number; y: number; text: string }) => ({ left: label.x, right: label.x + label.text.length * 7, top: label.y - 7, bottom: label.y + 7 });
  const overlaps = labels.flatMap((a, index) => labels.slice(index + 1).filter(b => { const A = box(a), B = box(b); return A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom; }).map(b => `${a.text}/${b.text}`));
  const graphRow = { chart: 'force_graph', brand, theme, file: `graph-${brand}-${theme}.svg`, svgHash: graph.svgHash, size: { width: request.request.output?.width, height: request.request.output?.height }, titleFontSize: /font-size:(\d+)px/.exec(title.style)?.[1], titleWeight: /font-weight:(\d+)/.exec(title.style)?.[1], labels: labels.map(label => ({ text: label.text, x: label.x, y: label.y })), overlappingLabels: overlaps };
  assert.equal(labels.length, nodes.length, `graph ${brand}/${theme}: every node labelled`);
  assert.deepEqual(overlaps, [], `graph ${brand}/${theme}: labels overlap`);
  assert.equal(graphRow.titleFontSize, '14');
  await fs.writeFile(path.join(output, graphRow.file), graph.svg!);
  measurements.push(graphRow);
}
await json(path.join(output, 'measurements.json'), { head: process.env.OODS_HEAD ?? null, rows: measurements, builderSelfCertified: false });

// 3. The recipe in the browser, both frameworks.
if (process.env.OODS_PLAYWRIGHT_WS_ENDPOINT) {
  const cases: any[] = [];
  for (const framework of ['react', 'vue']) {
    const require = createRequire(path.join(root, `packages/components-${framework}/package.json`));
    for (const { brand, theme } of SCOPES) {
      const request = { ...fixture.samples.VizGraphPreview.input, brand, theme };
      const result = await render(request);
      assert.equal(result.status, 'ok'); assert(result.svg);
      const props = { svg: result.svg, title: request.name, description: request.description };
      const Preview = require('./dist/index.cjs').VizGraphPreview;
      const markup = framework === 'react'
        ? require('react-dom/server').renderToStaticMarkup(require('react').createElement(Preview, props))
        : await require('@vue/server-renderer').renderToString(require('vue').createSSRApp({ render: () => require('vue').h(Preview, props) }));
      assert(markup.includes(result.svg));
      const id = `${framework}-${brand}-${theme}`;
      // The same bare page as the Sprint 199 receipt, so the two are comparable: the SVG at its intrinsic size, no component chrome.
      const html = `<!doctype html><html data-brand="${brand}" data-theme="${theme}"><body style="background:${theme === 'hc' ? 'Canvas' : theme === 'dark' ? '#101217' : '#fff'};color:${theme === 'hc' ? 'CanvasText' : theme === 'dark' ? '#e6e8ec' : '#111'}">${markup}</body></html>`;
      await fs.mkdir(path.join(output, 'graph-browser'), { recursive: true });
      await fs.writeFile(path.join(output, `graph-browser/${id}.html`), html);
      cases.push({ id, brand, theme, svgCount: 1, expectedSvg: result.svg, accessibleName: request.name, mount: (page: any) => page.setContent(html) });
    }
  }
  const report = await runVizThemeProof({ cases, output: path.join(output, 'graph-browser'), chromium, mission: 's201-m06' });
  assert.equal(report.failed, 0, 'graph browser proof');
  console.log(JSON.stringify({ samplesMoved: sampleRows.filter(row => row.moved).map(row => row.id), measurements: measurements.length, browserCells: report.selected, failed: report.failed }));
} else {
  console.log(JSON.stringify({ samplesMoved: sampleRows.filter(row => row.moved).map(row => row.id), measurements: measurements.length, browserCells: 0 }));
}
