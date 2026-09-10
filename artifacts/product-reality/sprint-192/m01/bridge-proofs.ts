// Mission-local delivery assertions. All composition/render/generation uses the live bridge.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { SALES, CASES } from '../../../../packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '../../../../packages/mcp-server/test/tools/s172-echarts-operands.js';

const out = new URL('./', import.meta.url);
const write = (name: string, value: unknown) => fs.writeFileSync(new URL(name, out), JSON.stringify(value, null, 2) + '\n');
const matrix = JSON.parse(fs.readFileSync(new URL('../../sprint-191/m05/matrix/matrix.json', out), 'utf8'));
async function call(name: string, tool: string, input: unknown) {
  const request = { tool, input, role: 'designer' };
  const response = await fetch('http://127.0.0.1:4466/run', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request),
    signal: AbortSignal.timeout(120_000),
  });
  const body = await response.json();
  write(name, { observedAt: new Date().toISOString(), request, httpStatus: response.status, response: body });
  assert.equal(response.status, 200); assert.equal(body.ok, true);
  assert.equal(body.result.status, 'ok');
  return body.result;
}
const inputs = [
  ...CASES.map(({ chartType, encodings }) => ({ chartType, rows: [...SALES], encodings })),
  ...ECHARTS_OPERAND_CASES.map(renderInputFor),
].filter(input => ['line', 'scatter', 'treemap'].includes(input.chartType!));
assert.equal(inputs.length, 3);
const charts = [];
for (const input of inputs) {
  const result = await call(`viz-${input.chartType}.json`, 'viz_render', {
    ...input, brand: 'A', theme: 'dark', output: { svg: true, includeNormalizedSpec: true },
  });
  const expected = matrix.table.find((row: any) => row.chartType === input.chartType && row.brand === 'A' && row.theme === 'dark');
  assert.equal(result.svgHash, expected.svgHash);
  assert.equal(result.svgHash, createHash('sha256').update(result.svg).digest('hex'));
  assert.equal(result.render.theme, 'dark');
  charts.push({ chartType: input.chartType, expected: expected.svgHash, actual: result.svgHash, matches: true });
}
const workflow = await call('compose-workflow.json', 'design_compose', { object: 'Subscription', context: 'workflow' });
const frameworks = [];
for (const framework of ['react', 'vue']) {
  const generated = await call(`generate-${framework}.json`, 'code_generate', {
    schema: workflow.schema, framework, profile: 'build', options: { theme: 'dark', brand: 'B' },
  });
  const shell = generated.artifact.files.find((file: any) => file.path === 'index.html');
  assert(shell?.contents.includes('data-theme="dark" data-brand="B"'));
  frameworks.push({ framework, shellContentHash: shell.contentHash, theme: 'dark', brand: 'B', passed: true });
}
write('behavior-summary.json', { observedAt: new Date().toISOString(), status: 'passed', charts, frameworks });
console.log(JSON.stringify({ charts: charts.length, frameworks: frameworks.length, status: 'passed' }));
