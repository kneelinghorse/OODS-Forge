import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
import { cellProcess } from '../../../../scripts/product-reality/s193-runtime-cells.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { BROWSER_IMAGE, summarize, validateRuntimeLedger, type RuntimeLedger, type Context } from '../../../../packages/mcp-server/src/lib/runtime-ledger.js';
import { loadObject, clearObjectCache } from '../../../../packages/mcp-server/src/objects/object-loader.js';
import { defaultVizIntent, type VizControlId } from '../../../../packages/component-contracts/src/viz-controls.js';
const fixtures: Array<[string, VizControlId, string?]> = [
  ['MarkArea', 'VizAreaControls', 'VizAreaPreview'], ['MarkBar', 'VizMarkControls', 'VizMarkPreview'],
  ['MarkLine', 'VizLineControls', 'VizLinePreview'], ['MarkPoint', 'VizPointControls', 'VizPointPreview'],
  ['MarkRect', 'VizHeatmapControls', 'VizHeatmapPreview'], ['ScatterPlot', 'VizScatterControls', 'VizScatterPreview'],
  ['EncodingPositionX', 'VizAxisControls'], ['EncodingColor', 'VizColorControls'], ['EncodingSize', 'VizSizeControls'],
  ['EncodingShape', 'VizShapeControls'], ['EncodingOpacity', 'VizOpacityControls'], ['ScaleLinear', 'VizScaleControls'],
];
const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-193/m05/packed');
const samples = JSON.parse(fs.readFileSync('packages/component-contracts/fixtures/viz-preview-samples.v1.json', 'utf8'));
fs.mkdirSync(output, { recursive: true }); await packFoundationPackages(output);
const browser = await launchProofBrowser();
try {
  const page = await browser.newPage(); const userAgent = await page.evaluate(() => navigator.userAgent);
  assert.match(userAgent, /Linux/); assert.equal(browser.version(), '141.0.7390.37');
  fs.writeFileSync(path.join(output, 'browser.json'), JSON.stringify({ image: BROWSER_IMAGE, version: browser.version(), userAgent }, null, 2) + '\n'); await page.close();
} finally { await browser.close(); }
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const ledger: RuntimeLedger = { schemaVersion: '1.0.0', head, runId: randomUUID(), historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows: [], summary: summarize([]) };
const temporary: string[] = [];
try {
  const inputs: Array<{ object: string; context: Context; framework: 'react' | 'vue' }> = [];
  for (const [trait, control, preview] of fixtures) {
    const object = `S193Viz${trait}`; const fixture = structuredClone(loadObject('Product')); fixture.object.name = object;
    fixture.traits.push({ name: `viz/${trait}`, parameters: { renderIntent: JSON.stringify(defaultVizIntent(control)), ...(preview ? { previewSvg: samples.samples[preview].svg } : {}) } });
    const file = path.resolve(`objects/core/__s193-${object}.object.yaml`); assert(!fs.existsSync(file));
    fs.writeFileSync(path.join(output, `${object}.json`), JSON.stringify(fixture, null, 2) + '\n');
    fs.writeFileSync(file, JSON.stringify(fixture, null, 2) + '\n', { flag: 'wx' }); temporary.push(file);
    for (const context of ['form', 'detail', 'list'] as const) for (const framework of ['react', 'vue'] as const) inputs.push({ object, context, framework });
  }
  clearObjectCache(); const expected = inputs.map(input => `${input.object}/${input.context}/${input.framework}`);
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < inputs.length) {
      const input = inputs[cursor++]!;
      const row = await cellProcess(output, output, input.object, input.context, input.framework, head, ledger.runId);
      ledger.rows.push(row); console.log(`${input.object}/${input.context}/${input.framework}: ${row.status}`);
    }
  }));
  ledger.rows.sort((a, b) => `${a.object}/${a.context}/${a.framework}`.localeCompare(`${b.object}/${b.context}/${b.framework}`));
  ledger.summary = summarize(ledger.rows); const issues = validateRuntimeLedger(ledger, false, expected);
  fs.writeFileSync(path.join(output, 'scoped-runtime-cells.v1.json'), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'validation.json'), JSON.stringify({ scope: 'Twelve bounded real-trait authoring objects, three contexts, both frameworks', expected, issues, builderSelfCertified: false, replaces154CellLedger: false }, null, 2) + '\n');
  assert.deepEqual(issues, []);
} finally { temporary.forEach(file => fs.rmSync(file, { force: true })); clearObjectCache(); }
