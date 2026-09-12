import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../../../..');
const dist = path.join(root, 'packages/mcp-server/dist');
const { getAjv } = await import(path.join(dist, 'lib/ajv.js'));
const { handle: compose } = await import(path.join(dist, 'tools/design.compose.js'));
const { handle: generate } = await import(path.join(dist, 'tools/code.generate.js'));
const { chartNodes } = await import(path.join(dist, 'codegen/chart-declaration.js'));
function wire(name, side, value) {
  const schema = JSON.parse(fs.readFileSync(path.join(dist, 'schemas', `${name}.${side}.json`), 'utf8'));
  const validate = getAjv().getSchema(schema.$id) ?? getAjv().compile(schema);
  const json = JSON.parse(JSON.stringify(value));
  assert.equal(validate(json), true, JSON.stringify(validate.errors));
  return json;
}
const result = { producer: 'compiled mcp-server dist handlers and registered AJV schemas', cells: [], fullHtml: [], legacy: [] };
for (const object of ['Invoice', 'Usage']) {
  const composed = wire('design.compose', 'output', await compose(wire('design.compose', 'input', { object, context: 'detail' })));
  assert.equal(composed.status, 'ok');
  assert.equal(chartNodes(composed.schema.screens).length, 1);
  const fullHtml = wire('code.generate', 'output', await generate(wire('code.generate', 'input', { schema: composed.schema, framework: 'html', profile: 'build', options: { theme: 'dark', brand: 'B' } })));
  result.fullHtml.push({ object, status: fullHtml.status, errors: fullHtml.errors, hasSvg: fullHtml.code.includes('<svg') });
  for (const framework of ['html', 'react', 'vue']) {
    const schema = structuredClone(composed.schema);
    if (framework === 'html') schema.screens = chartNodes(schema.screens);
    const request = wire('code.generate', 'input', { schema, framework, profile: 'build', options: { theme: 'dark', brand: 'B' } });
    const output = wire('code.generate', 'output', await generate(request));
    assert.equal(output.status, 'ok', JSON.stringify(output.errors));
    const assets = output.artifact.files.filter(file => file.path.endsWith('.svg'));
    const source = JSON.parse(fs.readFileSync(path.join(directory, 'boundary', `${object}-${framework}.json`), 'utf8'));
    assert.deepEqual(assets, source.result.artifact.files.filter(file => file.path.endsWith('.svg')));
    assert.deepEqual(assets, (await generate(request)).artifact.files.filter(file => file.path.endsWith('.svg')));
    if (framework === 'html') assert.ok(output.code.includes(assets[0].contents));
    result.cells.push({ object, framework, request, chart: chartNodes(schema.screens)[0].chart, assets, sourceParity: true, repeatParity: true, artifactHash: output.artifact.contentHash });
  }
}
for (const framework of ['react', 'vue']) {
  const composed = wire('design.compose', 'output', await compose(wire('design.compose', 'input', { object: 'Subscription', context: 'detail' })));
  const output = wire('code.generate', 'output', await generate(wire('code.generate', 'input', { schema: composed.schema, framework, profile: 'build', options: { theme: 'hc', brand: 'A' } })));
  assert.equal(output.status, 'ok', JSON.stringify(output.errors));
  const before = JSON.parse(fs.readFileSync(path.join(directory, '../../m05/hc/boundary', `codegen-${framework}.json`), 'utf8'));
  const assets = output.artifact.files.filter(file => file.path.endsWith('.svg'));
  assert.deepEqual(assets, before.result.artifact.files.filter(file => file.path.endsWith('.svg')));
  result.legacy.push({ object: 'Subscription', framework, assets, m05AssetBytesUnchanged: true });
}
fs.writeFileSync(path.join(directory, 'built.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ cells: result.cells.length, sourceAndRepeatParity: true, legacyUnchanged: result.legacy.length, fullHtml: result.fullHtml }));
