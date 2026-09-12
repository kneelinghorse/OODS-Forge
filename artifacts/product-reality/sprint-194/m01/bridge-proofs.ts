// Read-only delivery assertions through the served bridge, retaining operands and responses.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { SALES, CASES } from '../../../../packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';

const out = new URL('./', import.meta.url);
const write = (name: string, value: unknown) => fs.writeFileSync(new URL(name, out), JSON.stringify(value, null, 2) + '\n');
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

const health = await call('health-tool.json', 'health', {});
assert.deepEqual(health.productReality.runtime, {
  cells: 154, pass: 154, typedGap: 0, fail: 0,
  head: '871e5acf7389b605850afbc3e00cccdc3aef1d3b',
});
assert.equal(health.productReality.tools.entries, 27);

const catalog = await call('catalog.json', 'catalog_list', { detail: 'full', pageSize: 200 });
assert.equal(catalog.totalCount, 109);
assert.equal(catalog.components.length, 109);
assert.equal(catalog.hasMore, false);
assert.equal(catalog.obligationScope.approvedRuntimeCensus, null);
assert(!JSON.stringify(catalog.components.map((row: any) => row.productReality)).includes('"unverified"'));
const newRows = catalog.components.map((row: any) => {
  const name = row.name;
  assert(row?.productReality, name);
  for (const framework of ['react', 'vue']) {
    assert.equal(row.productReality.surfaces[framework].state, 'implemented-evidence-complete', `${name}/${framework}`);
  }
  return { name, surfaces: row.productReality.surfaces };
});

const line = CASES.find(input => input.chartType === 'line')!;
const chart = await call('viz-line.json', 'viz_render', {
  chartType: line.chartType, encodings: line.encodings, rows: [...SALES], brand: 'A', theme: 'dark',
  output: { svg: true, includeNormalizedSpec: true },
});
assert.equal(chart.status, 'ok');
const matrix = JSON.parse(fs.readFileSync(new URL('../../sprint-191/m05/matrix/matrix.json', out), 'utf8'));
const expected = matrix.table.find((row: any) => row.chartType === 'line' && row.brand === 'A' && row.theme === 'dark');
assert.equal(chart.svgHash, expected.svgHash);
assert.equal(chart.svgHash, createHash('sha256').update(chart.svg).digest('hex'));
assert.equal(chart.render.theme, 'dark');

const workflow = await call('compose-workflow.json', 'design_compose', { object: 'Subscription', context: 'workflow' });
assert.equal(workflow.status, 'ok');
const generated = await call('generate-react.json', 'code_generate', {
  schema: workflow.schema, framework: 'react', profile: 'build', options: { theme: 'dark', brand: 'B' },
});
assert.equal(generated.status, 'ok');
const shell = generated.artifact.files.find((file: any) => file.path === 'index.html');
assert(shell?.contents.includes('data-theme="dark" data-brand="B"'));
write('behavior-summary.json', {
  observedAt: new Date().toISOString(), status: 'passed', catalog: { rows: 109, unverified: 0, newRows },
  chart: { chartType: 'line', brand: 'A', theme: 'dark', expected: expected.svgHash, actual: chart.svgHash, matches: true },
  generation: { object: 'Subscription', context: 'workflow', framework: 'react', shellContentHash: shell.contentHash, theme: 'dark', brand: 'B' },
});
console.log('Passed: 109 catalog rows, zero unverified cells, 109 implemented rows per framework, A/dark line hash, dark React workflow shell.');
