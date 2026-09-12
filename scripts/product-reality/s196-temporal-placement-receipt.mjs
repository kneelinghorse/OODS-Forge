#!/usr/bin/env node
/** Replay retained placement operands through the built handlers; never rewrite history. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let output = path.join(root, 'artifacts/product-reality/sprint-196/m05/placement');
let measure = false;
let auditOnly = false;
for (let index = 2; index < process.argv.length; index++) {
  const arg = process.argv[index];
  if (arg === '--measure') measure = true;
  else if (arg === '--audit-only') auditOnly = true;
  else if (arg === '--output' && process.argv[index + 1]) output = path.resolve(process.argv[++index]);
  else throw new Error(`Unknown or incomplete argument: ${arg}`);
}
const hash = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const read = relative => fs.readFileSync(path.join(root, relative));
const json = relative => JSON.parse(read(relative));
const save = (relative, value) => {
  const file = path.join(output, relative); fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
const cases = [
  ...['html', 'react', 'vue'].map(framework => ({ id: `Usage-detail-${framework}`, object: 'Usage', framework, context: 'detail', brand: 'B', theme: 'dark', source: `artifacts/product-reality/sprint-195/m06/codegen/boundary/Usage-${framework}.json` })),
  ...['react', 'vue'].map(framework => ({ id: `Usage-workflow-${framework}`, object: 'Usage', framework, context: 'workflow', brand: 'A', theme: 'light', source: `artifacts/product-reality/sprint-195/m06/codegen/boundary/Usage-workflow-${framework}.json` })),
  ...['react', 'vue'].map(framework => ({ id: `Subscription-detail-${framework}`, object: 'Subscription', framework, context: 'detail', brand: 'A', theme: 'hc', source: `artifacts/product-reality/sprint-195/m05/hc/boundary/codegen-${framework}.json` })),
];

// This audit does not import handlers, so it can run while another bounded bite
// temporarily mutates a shared build. Qualify the old bytes against Git itself.
if (!measure) {
  const beforeHead = '944f4dda5f784e266310978b31f65b3d452e6387';
  const sourceJson = execFileSync('rg', ['--files', 'packages', '--glob', '*.json', '--glob', '!**/dist/**', '--glob', '!**/node_modules/**', '--glob', '!**/artifacts/**'], { cwd: root, encoding: 'utf8' }).trim().split('\n').sort();
  const literalSvgFiles = sourceJson.filter(file => read(file).includes('<svg'));
  assert.deepEqual(literalSvgFiles, ['packages/component-contracts/fixtures/viz-preview-samples.v1.json']);
  const sourceGoldenCandidates = sourceJson.filter(file => /"(?:svg|svgHash|renderHash)"/.test(read(file).toString()));
  const unchangedPaths = [...cases.map(item => item.source), literalSvgFiles[0], 'packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json', 'packages/mcp-server/test/tools/s172-spec-only-cases.ts'];
  const unchangedSources = unchangedPaths.map(file => {
    const original = execFileSync('git', ['show', `${beforeHead}:${file}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
    const current = read(file);
    assert.deepEqual(current, original, `${file}: historical source differs from pre-UTC Git bytes`);
    return { path: file, beforeSha256: hash(original), currentSha256: hash(current), unchanged: true };
  });
  save('source-fixture-audit.json', { schemaVersion: 1, missionId: 's196-m05', beforeHead, sourceJsonFilesScanned: sourceJson.length, literalSvgFiles, sourceGoldenCandidates, unchangedSources, dispositions: [
    { paths: literalSvgFiles, disposition: 'All six inputs are explicitly non-temporal; line and area use nominal period. Rerendered unchanged in both timezones; see migration.controls.' },
    { paths: ['packages/mcp-server/test/tools/__fixtures__/s172-certify-spec-only-baseline.json'], disposition: 'Hash-only historical fixture. Shared s172-spec-only-cases.ts operands use region North/South/East and numeric revenue; line and area are non-temporal. No UTC rewrite.' },
    { paths: ['packages/viz-core/src/registry/viz-patterns.v1.json', 'packages/viz-core/src/registry/viz-recipes.v1.json', 'packages/viz-render/certified-matrix.json'], disposition: 'Registry/matrix coverage is owned by the parent golden-migration receipt.' },
    { paths: sourceGoldenCandidates.filter(file => /schemas\/|trait-recipes\.json$|package\.json$/.test(file)), disposition: 'Schema, component recipe, or package metadata; no stored SVG golden.' },
  ] });
  if (auditOnly) {
    console.log(JSON.stringify({ sourceJsonFilesScanned: sourceJson.length, literalSvgFiles: literalSvgFiles.length, unchangedSources: unchangedSources.length }));
    process.exit(0);
  }
}
assert(!(measure && auditOnly), '--measure and --audit-only are mutually exclusive');

if (measure) {
  assert(['America/Chicago', 'UTC'].includes(process.env.TZ), 'Use an explicit measured timezone.');
  const { getAjv } = await import('../../packages/mcp-server/dist/lib/ajv.js');
  const { handle: generate } = await import('../../packages/mcp-server/dist/tools/code.generate.js');
  const { handle: render } = await import('../../packages/mcp-server/dist/tools/viz.render.js');
  const validators = new Map();
  function wire(tool, side, value) {
    const key = `${tool}.${side}`;
    if (!validators.has(key)) {
      const schema = json(`packages/mcp-server/dist/schemas/${key}.json`);
      validators.set(key, (schema.$id ? getAjv().getSchema(schema.$id) : undefined) ?? getAjv().compile(schema));
    }
    const copy = structuredClone(value), validate = validators.get(key);
    assert.equal(validate(copy), true, `${key}: ${JSON.stringify(validate.errors)}`);
    return JSON.parse(JSON.stringify(copy));
  }
  const rows = [];
  for (const item of cases) {
    const sourceBytes = read(item.source), previous = JSON.parse(sourceBytes);
    const request = wire('code.generate', 'input', previous.request);
    assert.deepEqual(request, previous.request, `${item.id}: do not alter the historical operand`);
    const result = wire('code.generate', 'output', await generate(structuredClone(request)));
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    const previousAssets = previous.result.artifact.files.filter(file => file.path.endsWith('.svg'));
    const assets = result.artifact.files.filter(file => file.path.endsWith('.svg'));
    assert.deepEqual(assets.map(file => file.path), previousAssets.map(file => file.path));
    const svgs = assets.map((asset, index) => {
      const before = previousAssets[index];
      assert.equal(asset.contentHash, hash(asset.contents)); assert.equal(before.contentHash, hash(before.contents));
      const raw = `${item.id}/${asset.path}`;
      save(raw, asset.contents);
      return { path: asset.path, raw, beforeHash: before.contentHash, afterHash: asset.contentHash, changed: asset.contents !== before.contents };
    });
    const row = { ...item, sourceSha256: hash(sourceBytes), requestSha256: hash(JSON.stringify(request)), request, result, beforeArtifactHash: previous.result.artifact.contentHash, afterArtifactHash: result.artifact.contentHash, svgs };
    save(`${item.id}.json`, row); rows.push(row);
    assert.equal(hash(read(item.source)), row.sourceSha256, 'Historical evidence changed during the producer.');
  }
  const samplePath = 'packages/component-contracts/fixtures/viz-preview-samples.v1.json';
  const samples = json(samplePath).samples;
  const controls = [];
  for (const [id, sample] of Object.entries(samples)) {
    const input = sample.input;
    const bindings = Object.values(input.encodings);
    assert(bindings.every(binding => typeof binding !== 'object' || (binding.type !== 'temporal' && binding.scale !== 'temporal')), `${id} is temporal and must be explicitly migrated`);
    const result = wire('viz.render', 'output', await render(wire('viz.render', 'input', input)));
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    assert.equal(result.svg, sample.svg, `${id}: non-temporal source golden must not move`);
    assert.equal(result.svgHash, sample.svgHash);
    controls.push({ id, source: samplePath, inputSha256: hash(JSON.stringify(input)), encodings: input.encodings, beforeHash: hash(sample.svg), afterHash: hash(result.svg), unchanged: true });
  }
  save('measurements.json', { timezone: process.env.TZ, builtRevision: json('packages/mcp-server/dist/build-revision.json'), rows, controls, controlsSourceSha256: hash(read(samplePath)) });
  console.log(JSON.stringify({ timezone: process.env.TZ, requests: rows.length, svgs: rows.flatMap(row => row.svgs).length, nonTemporalControls: controls.length }));
} else {
  fs.mkdirSync(output, { recursive: true });
  for (const [directory, timezone] of [['chicago', 'America/Chicago'], ['utc', 'UTC']]) {
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--measure', '--output', path.join(output, directory)], { cwd: root, env: { ...process.env, TZ: timezone }, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
    save(`${directory}.log`, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`);
    assert.equal(result.status, 0, `${timezone}: ${result.stderr}`);
  }
  const chicago = JSON.parse(fs.readFileSync(path.join(output, 'chicago/measurements.json'), 'utf8'));
  const utc = JSON.parse(fs.readFileSync(path.join(output, 'utc/measurements.json'), 'utf8'));
  assert.deepEqual(chicago.controls, utc.controls);
  const rows = chicago.rows.flatMap((row, index) => {
    const other = utc.rows[index];
    assert.equal(row.id, other.id); assert.deepEqual(row.request, other.request);
    assert.deepEqual(row.result.artifact, other.result.artifact, `${row.id}: UTC output must be byte-identical across host zones`);
    return row.svgs.map((asset, assetIndex) => {
      assert.deepEqual(asset, other.svgs[assetIndex]);
      return { case: row.id, object: row.object, framework: row.framework, context: row.context, brand: row.brand, theme: row.theme, source: row.source, sourceSha256: row.sourceSha256, requestSha256: row.requestSha256, sameOperand: true, crossTimezoneEqual: true, ...asset, chicagoRaw: `chicago/${asset.raw}`, utcRaw: `utc/${asset.raw}` };
    });
  });
  assert.equal(rows.length, 25);
  assert(rows.every(row => row.changed), 'Every declared temporal placement SVG must be independently attributed.');
  save('migration.json', { schemaVersion: 1, missionId: 's196-m05', builderSelfCertified: false, reason: 'Temporal axes render in UTC; retained s195 requests and historical bytes are unchanged.', timezones: ['America/Chicago', 'UTC'], counts: { requests: cases.length, temporalAssets: rows.length, changed: rows.filter(row => row.changed).length, crossTimezoneEqual: rows.length, unchangedNominalControls: chicago.controls.length }, rows, controls: chicago.controls, controlsSourceSha256: chicago.controlsSourceSha256 });
  console.log(JSON.stringify({ requests: cases.length, changedTemporalAssets: rows.length, crossTimezoneEqual: true, unchangedNominalControls: chicago.controls.length }));
}
