// Read-only delivery assertions through the served bridge, retaining operands and responses.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const out = new URL('./', import.meta.url);
const root = new URL('../../../../', out);
const deliveredCommit = '91c1f5f2bbf2027cbc6768ef04c880f191671c73';
const runtimeHead = '39deb793a3161621b5a0893618f9d40201c22256';
const read = (name: string) => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
const write = (name: string, value: unknown) => fs.writeFileSync(new URL(name, out), JSON.stringify(value, null, 2) + '\n');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const operands = read('scripts/product-reality/s190-viz-operands.json');
const recipes = read('packages/viz-core/src/registry/viz-recipes.v1.json');
const patterns = read('packages/viz-core/src/registry/viz-patterns.v1.json');
const placementPath = 'artifacts/product-reality/sprint-195/m06/codegen/boundary/Invoice-react.json';
const placement = read(placementPath);
const expectedSvg = placement.result.artifact.files.find((file: any) => file.path === 'src/charts/bar-001.svg');
assert(expectedSvg, 'Sprint 195 placement golden must contain the actual bar SVG');
assert.equal(expectedSvg.contentHash, `sha256:${hash(expectedSvg.contents)}`);

async function get(name: string, endpoint: string) {
  const response = await fetch(`http://127.0.0.1:4466${endpoint}`, { signal: AbortSignal.timeout(30_000) });
  const body = await response.json();
  write(name, { observedAt: new Date().toISOString(), request: { method: 'GET', endpoint }, httpStatus: response.status, response: body });
  assert.equal(response.status, 200);
  return body;
}
async function call(name: string, tool: string, input: unknown) {
  const request = { tool, input, role: 'designer' };
  const response = await fetch('http://127.0.0.1:4466/run', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
    signal: AbortSignal.timeout(120_000),
  });
  const body = await response.json();
  write(name, { observedAt: new Date().toISOString(), request, httpStatus: response.status, response: body });
  assert.equal(response.status, 200); assert.equal(body.ok, true);
  return body.result;
}
function assertSvg(result: any, expectedHash: string, theme: string, brand: string) {
  assert.equal(result.status, 'ok', JSON.stringify(result.errors));
  assert.match(result.svg, /^<svg\b/);
  assert.equal(result.svgHash, expectedHash);
  assert.equal(result.svgHash, hash(result.svg));
  assert.equal(result.svgBytes, Buffer.byteLength(result.svg, 'utf8'));
  assert.equal(result.render.theme, theme); assert.equal(result.render.brand, brand);
}

const bridgeHealth = await get('bridge-health.json', '/health');
assert.equal(bridgeHealth.status, 'ok');
assert.equal(bridgeHealth.revision.commit, deliveredCommit);
assert.match(bridgeHealth.revision.structuredDataManifestHash, /^sha256:[a-f0-9]{64}$/);
assert.equal(bridgeHealth.toolset.enabledCount, 19);
const tools = await get('bridge-tools.json', '/tools');
assert.equal(tools.tools.length, 19);
assert.equal(new Set(tools.tools).size, 19);
assert.equal(tools.toolset.enabledInternal.length, 19);

const health = await call('health-tool.json', 'health', {});
assert.equal(health.status, 'ok', JSON.stringify(health.warnings));
assert.deepEqual(health.productReality.runtime, { cells: 154, pass: 154, typedGap: 0, fail: 0, head: runtimeHead });
assert.equal(health.productReality.tools.entries, 24);
assert.deepEqual(health.productReality.tools.byTier, { 'product-reality': 19, contract: 5, unit: 0, none: 0 });
assert.deepEqual(health.productReality.viz, { types: 13, patterns: 21, families: 8, classified: 34, coreCells: 20, coreSurfaceComplete: 13, typedGaps: 7 });

const catalog = await call('catalog.json', 'catalog_list', { detail: 'full', pageSize: 200 });
assert.equal(catalog.totalCount, 109); assert.equal(catalog.components.length, 109); assert.equal(catalog.hasMore, false);
assert.equal(catalog.obligationScope.approvedRuntimeCensus, null);
assert(!JSON.stringify(catalog.components.map((row: any) => row.productReality)).includes('"unverified"'));
const catalogRows = catalog.components.map((row: any) => {
  assert(row?.productReality, row.name);
  for (const framework of ['react', 'vue']) assert.equal(row.productReality.surfaces[framework].state, 'implemented-evidence-complete', `${row.name}/${framework}`);
  return { name: row.name, react: row.productReality.surfaces.react.state, vue: row.productReality.surfaces.vue.state };
});

const lineExpected = recipes.find((row: any) => row.chartType === 'line').renderScopes.find((row: any) => row.brand === 'A' && row.theme === 'dark');
const line = await call('viz-line.json', 'viz_render', {
  ...operands.find((row: any) => row.chartType === 'line'), brand: 'A', theme: 'dark', output: { svg: true, includeNormalizedSpec: true },
});
assertSvg(line, lineExpected.svgHash, 'dark', 'A');
const patternExpected = patterns.find((row: any) => row.id === 'pattern:viz:simple-bar').scopes.find((row: any) => row.brand === 'A' && row.theme === 'light');
const pattern = await call('viz-pattern.json', 'viz_render', {
  pattern: 'pattern:viz:simple-bar', brand: 'A', theme: 'light', output: { svg: true, includeNormalizedSpec: true, includeA11y: true },
});
assertSvg(pattern, patternExpected.svgHash, 'light', 'A');

const hcExpected = recipes.find((row: any) => row.chartType === 'bar').renderScopes.find((row: any) => row.brand === 'A' && row.theme === 'hc');
const hc = await call('viz-hc-bar.json', 'viz_render', {
  ...operands.find((row: any) => row.chartType === 'bar'), brand: 'A', theme: 'hc', output: { svg: true, includeNormalizedSpec: true },
});
assertSvg(hc, hcExpected.svgHash, 'hc', 'A');
const declared = new Set(Object.values(read('packages/tokens/dist/css-variables-by-scope.json').A.hc).map((value: any) => value.trim()));
const paints = [...hc.svg.matchAll(/\b(?:fill|stroke|stop-color)="([^"]+)"/g)].map((match: any) => match[1]);
for (const style of [...hc.svg.matchAll(/\bstyle="([^"]*)"/g), ...hc.svg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]) {
  paints.push(...[...style[1].matchAll(/(?:^|[;{\s])(?:fill|stroke|stop-color)\s*:\s*([^;}]+)/g)].map((match: any) => match[1].trim()));
}
const uniquePaints = [...new Set(paints)].sort();
assert(uniquePaints.includes('Canvas')); assert(uniquePaints.includes('CanvasText'));
assert.deepEqual(uniquePaints.filter(paint => !declared.has(paint) && !/^(?:none|transparent|url\(#[^)]+\))$/.test(paint)), []);

const treemapInput = operands.find((row: any) => row.chartType === 'treemap');
const treemap = await call('viz-treemap.json', 'viz_render', { ...treemapInput, brand: 'A', theme: 'light', output: { svg: true, includeNormalizedSpec: true } });
assert.equal(treemap.status, 'ok', JSON.stringify(treemap.errors));
const certified = await call('certify-treemap.json', 'artifact_certify', { spec: treemap.normalizedSpec, brand: 'A', theme: 'light', data: { hierarchy: treemapInput.hierarchy } });
assert.equal(certified.status, 'ok', JSON.stringify(certified.errors));
assert.equal(certified.coverage, 'certified'); assert.equal(certified.conformant, true);
assert.equal(certified.determinism.renderHash, treemap.svgHash);

const invoice = await call('compose-invoice.json', 'design_compose', { object: 'Invoice', context: 'detail' });
assert.equal(invoice.status, 'ok', JSON.stringify(invoice.errors));
const generated = await call('generate-react.json', 'code_generate', { schema: invoice.schema, framework: 'react', profile: 'build', options: { theme: 'dark', brand: 'B' } });
assert.equal(generated.status, 'ok', JSON.stringify(generated.errors));
const asset = generated.artifact.files.find((file: any) => file.path === 'src/charts/bar-001.svg');
assert(asset, 'Invoice/detail React must contain the declared chart SVG artifact');
assert.equal(asset.contents, expectedSvg.contents);
assert.equal(asset.contentHash, expectedSvg.contentHash);
assert.equal(asset.contentHash, `sha256:${hash(asset.contents)}`);
assert(!generated.code.includes('No rendered chart supplied'));
write('behavior-summary.json', {
  observedAt: new Date().toISOString(), status: 'passed', deliveredCommit, runtimeHead,
  bridge: { revision: bridgeHealth.revision, tools: tools.tools.length }, productReality: health.productReality,
  catalog: { rows: 109, unverified: 0, reactComplete: 109, vueComplete: 109, rowsChecked: catalogRows },
  line: { brand: 'A', theme: 'dark', expected: lineExpected.svgHash, actual: line.svgHash, matches: true },
  pattern: { id: 'pattern:viz:simple-bar', brand: 'A', theme: 'light', expected: patternExpected.svgHash, actual: pattern.svgHash, matches: true },
  highContrast: { chartType: 'bar', brand: 'A', theme: 'hc', expected: hcExpected.svgHash, actual: hc.svgHash, paints: uniquePaints, allPaintsDeclared: true },
  treemap: { coverage: certified.coverage, conformant: certified.conformant, renderHash: certified.determinism.renderHash, svgHash: treemap.svgHash },
  generation: { object: 'Invoice', context: 'detail', framework: 'react', theme: 'dark', brand: 'B', golden: placementPath, asset: asset.path, contentHash: asset.contentHash, svgBytes: Buffer.byteLength(asset.contents), bytesEqual: true },
});
console.log('Passed: delivered revision; 19 tools; tools/runtime/viz ledgers; 109 complete React and Vue catalog rows; A/dark line, simple-bar pattern and HC bar hashes; declared HC paints; treemap operand certification; exact Invoice/detail React placement SVG bytes.');
