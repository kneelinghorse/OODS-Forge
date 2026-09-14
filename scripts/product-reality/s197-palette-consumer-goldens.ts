/** Re-render exact historical consumer operands; only explicit sample SVG fields are writable. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const YAML = createRequire(new URL('../../packages/mcp-server/package.json', import.meta.url))('yaml');
import { edgeArrayToNetwork } from '../../packages/mcp-server/src/codegen/chart-assets.js';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as dashboard } from '../../packages/mcp-server/src/tools/dashboard.render.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';

const root = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const graphAddition = args.includes('--s199-m06');
const chartsMigration = args.includes('--s199') || graphAddition;
const samplesOnly = args.includes('--samples-only');
const out = path.join(root, `artifacts/product-reality/sprint-${chartsMigration ? 199 : 197}/${graphAddition ? 'm06' : 'm05'}/consumers`);
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file: string) => JSON.parse(read(file));
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const save = (file: string, value: unknown) => {
  const target = path.join(out, file); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
const beforeHead = chartsMigration ? 'b7a96ab0f' : json('artifacts/product-reality/sprint-197/m01/baseline.json').beforeHead;
const write = process.argv.includes('--write-samples');
assert(process.argv.slice(2).every(arg => ['--write-samples', '--s199', '--s199-m06', '--samples-only'].includes(arg)), 'Unknown option');
const samplePath = 'packages/component-contracts/fixtures/viz-preview-samples.v1.json';
const beforeSamples = execFileSync('git', ['show', `${beforeHead}:${samplePath}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const currentSamples = read(samplePath);
const samples = JSON.parse(graphAddition ? currentSamples : beforeSamples);
if (graphAddition) {
  assert(samplesOnly, 'Graph addition only owns the preview fixture');
  const object = YAML.parse(read('objects/core/Relationship.object.yaml'));
  const parameters = object.traits.find((trait: any) => trait.name === 'viz/MarkGraph').parameters;
  const { chart, title, description } = parameters;
  samples.samples.VizGraphPreview = { input: { chartType: 'force_graph', name: title, description,
    network: edgeArrayToNetwork(chart.sampleRows, chart.edges), output: { svg: true, width: 360, height: 200 } } };
}
const sampleRows = [];
for (const [id, sample] of Object.entries(samples.samples) as Array<[string, any]>) {
  const result = await render(structuredClone(sample.input));
  assert.equal(result.status, 'ok', JSON.stringify(result.errors));
  assert(result.svg && result.svgHash);
  const repeat = await render(structuredClone(sample.input));
  assert.equal(repeat.svg, result.svg);
  sampleRows.push({ id, inputSha256: sha(JSON.stringify(sample.input)), beforeHash: sample.svgHash, afterHash: result.svgHash });
  if (graphAddition && id !== 'VizGraphPreview') assert.equal(result.svg, sample.svg, `${id}: existing sample must not move twice`);
  sample.svg = result.svg; sample.svgHash = result.svgHash;
}
const generatedSamples = JSON.stringify(samples, null, 2) + '\n';
if (write) fs.writeFileSync(path.join(root, samplePath), generatedSamples);
else assert.equal(read(samplePath), generatedSamples, 'Preview sample SVGs need the attributed --write-samples migration');
if (samplesOnly) {
  save('samples.json', { missionId: graphAddition ? 's199-m06' : chartsMigration ? 's199-m05' : 's197-m05', beforeHead, builderSelfCertified: false,
    scope: 'preview-samples-only', source: samplePath, beforeSha256: sha(beforeSamples), afterSha256: sha(generatedSamples), rows: sampleRows });
  console.log(JSON.stringify({ previewSamples: sampleRows.length, scope: 'preview-samples-only' }));
  process.exit(0);
}
const portableSource = 'artifacts/product-reality/sprint-193/m07/logs/portable-e2e.log';
const oldPortable = json(portableSource).calls.dashboards;
const dashboards = [];
for (const [file, beforeHash] of [['d3-preflight-dashboard.json', oldPortable.twoPanelHtmlSha256], ['d3-four-panel-dashboard.json', oldPortable.fourPanelHtmlSha256]]) {
  const input = json(`packages/mcp-server/test/fixtures/portable-runtime/${file}`);
  const result = await dashboard(input); const repeated = await dashboard(structuredClone(input));
  assert.equal(result.status, 'ok'); assert(result.html); assert.equal(repeated.html, result.html);
  const raw = `dashboards/${file}.html`; save(raw, result.html);
  dashboards.push({ file, source: portableSource, sourceSha256: sha(read(portableSource)), inputSha256: sha(JSON.stringify(input)), beforeHash, afterHash: sha(result.html), raw });
}
const temporalRoot = 'artifacts/product-reality/sprint-196/m05/placement';
const prior = json(`${temporalRoot}/chicago/measurements.json`);
const placements = [];
for (const cell of prior.rows) {
  const original = json(cell.source);
  assert.deepEqual(cell.request, original.request);
  const result = await generate(structuredClone(cell.request));
  const repeated = await generate(structuredClone(cell.request));
  assert.equal(result.status, 'ok', JSON.stringify(result.errors));
  assert.deepEqual(repeated.artifact, result.artifact);
  const assets = result.artifact!.files.filter(file => file.path.endsWith('.svg'));
  const oldAssets = cell.result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
  assert.deepEqual(assets.map(file => file.path), oldAssets.map((file: any) => file.path));
  for (const asset of assets) {
    const old = oldAssets.find((file: any) => file.path === asset.path);
    const raw = `placements/${cell.id}/${asset.path}`; save(raw, asset.contents);
    placements.push({ case: cell.id, source: cell.source, sourceSha256: sha(read(cell.source)), requestSha256: sha(JSON.stringify(cell.request)),
      path: asset.path, brand: cell.brand, theme: cell.theme, beforeHash: old.contentHash, afterHash: asset.contentHash, raw, sameOperand: true });
  }
}
save('migration.json', { schemaVersion: 1, missionId: graphAddition ? 's199-m06' : chartsMigration ? 's199-m05' : 's197-m05', builderSelfCertified: false, beforeHead,
  reason: chartsMigration ? 'S199 chart producer fixes supersede consumer pixels; exact operands are unchanged and each moved pin is attributed in the sprint ledger.' : 'Generated scoped palette supersedes consumer pixels; exact requests and historical palette/UTC receipts remain unchanged.',
  samples: { source: samplePath, beforeSha256: sha(beforeSamples), afterSha256: sha(generatedSamples), rows: sampleRows }, dashboards, placements });
console.log(JSON.stringify({ previewSamples: sampleRows.length, portableDashboards: dashboards.length, placementAssets: placements.length }));
