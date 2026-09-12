import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAjv } from '../../packages/mcp-server/dist/lib/ajv.js';
import { handle as render } from '../../packages/mcp-server/dist/tools/viz.render.js';
import { handle as certify } from '../../packages/mcp-server/dist/tools/artifact.certify.js';
import { handle as dashboard } from '../../packages/mcp-server/dist/tools/dashboard.render.js';
import { handle as generate } from '../../packages/mcp-server/dist/tools/code.generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'artifacts/product-reality/sprint-195/m05/hc');
const source = path.join(directory, 'boundary');
const validators = new Map<string, ReturnType<ReturnType<typeof getAjv>['compile']>>();
function wire(name: string, side: string, value: unknown): any {
  const key = `${name}.${side}`;
  if (!validators.has(key)) validators.set(key, getAjv().compile(JSON.parse(fs.readFileSync(path.join(root, `packages/mcp-server/dist/schemas/${key}.json`), 'utf8'))));
  const validate = validators.get(key)!;
  const json = JSON.parse(JSON.stringify(value));
  assert.equal(validate(json), true, `${key}: ${JSON.stringify(validate.errors)}`);
  return json;
}
const rows = [];
for (const file of fs.readdirSync(source).filter(name => /-(?:A|B)\.json$/.test(name)).sort()) {
  const previous = JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'));
  const name = file.startsWith('dashboard-') ? 'dashboard.render' : 'viz.render';
  const request = wire(name, 'input', previous.request);
  const result = wire(name, 'output', await (name === 'viz.render' ? render : dashboard)(request));
  assert.equal(result.status, previous.result.status);
  if (name === 'dashboard.render') assert.equal(result.outputHtmlHash, previous.result.outputHtmlHash);
  else {
    assert.equal(result.svgHash, previous.result.svgHash);
    assert.deepEqual(result.errors, previous.result.errors);
  }
  const row: any = { case: file, tool: name, request, result };
  if (name === 'viz.render') {
    const declaration = wire(name, 'output', await render({ ...request, output: { includeNormalizedSpec: true } }));
    const branch = ['hierarchy', 'sankey', 'chord', 'network', 'geo'].find(key => request[key]);
    const input = wire('artifact.certify', 'input', { spec: declaration.normalizedSpec, theme: 'hc', brand: request.brand, ...(branch ? { data: { [branch]: request[branch] } } : {}) });
    row.certification = wire('artifact.certify', 'output', await certify(input));
    assert.deepEqual(row.certification, previous.certification);
    assert.equal(row.certification.contrastResults[0].reason, 'forced-colors');
  }
  rows.push(row);
}
for (const framework of ['react', 'vue']) {
  const previous = JSON.parse(fs.readFileSync(path.join(source, `codegen-${framework}.json`), 'utf8'));
  const request = wire('code.generate', 'input', previous.request);
  const result = wire('code.generate', 'output', await generate(request));
  assert.equal(result.status, 'ok');
  assert.deepEqual(result.artifact, previous.result.artifact);
  rows.push({ case: `codegen-${framework}`, tool: 'code.generate', request, result });
}
const counts = { renderScopes: rows.filter(row => row.tool === 'viz.render').length, rendered: rows.filter(row => row.tool === 'viz.render' && row.result.status === 'ok').length, typedDeferred: rows.filter(row => row.tool === 'viz.render' && row.result.status === 'error').length, certifiedScopes: rows.filter(row => row.certification).length, dashboards: rows.filter(row => row.tool === 'dashboard.render').length, generatedFrameworks: rows.filter(row => row.tool === 'code.generate').length };
assert.deepEqual(counts, { renderScopes: 26, rendered: 8, typedDeferred: 18, certifiedScopes: 26, dashboards: 2, generatedFrameworks: 2 });
fs.writeFileSync(path.join(directory, 'built.json'), JSON.stringify({ buildRevision: JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/dist/build-revision.json'), 'utf8')), counts, rows }, null, 2) + '\n');
console.log(JSON.stringify(counts, null, 2));
