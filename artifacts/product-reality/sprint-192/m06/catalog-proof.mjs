import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handle } from '../../../../packages/mcp-server/dist/tools/catalog.list.js';
import { componentCapabilityBaseline } from '../../../../packages/component-contracts/dist/index.js';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const output = fileURLToPath(new URL('./', import.meta.url));
const read = file => JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (file, value) => fs.writeFileSync(`${output}/${file}`, `${JSON.stringify(value, null, 2)}\n`);
const catalog = await handle({ detail: 'summary', pageSize: 200 });
const manifest = read('artifacts/structured-data/manifest.json');
const artifact = manifest.artifacts.find(row => row.name === 'components');
const dataset = read(artifact.path);
const ledger = read('packages/component-contracts/registry/component-capability-ledger.v1.json');
assert.deepEqual(componentCapabilityBaseline, ledger);
assert.equal(catalog.totalCount, 109);
assert.equal(catalog.components.length, 109);
assert.equal(catalog.obligationScope.approvedRuntimeCensus, null);
assert.equal(manifest.version, '2026-09-10');
assert.match(artifact.file, /^oods-components-\d{4}-\d{2}-\d{2}\.json$/);
for (const row of ledger.rows) {
  assert.deepEqual(catalog.components.find(entry => entry.name === row.id).productReality.surfaces, row.surfaces);
  assert.deepEqual(dataset.components.find(entry => entry.id === row.id).productReality.surfaces, row.surfaces);
}
const surfaces = Object.fromEntries(Object.keys(ledger.rows[0].surfaces).map(surface => [surface,
  ledger.rows.reduce((counts, row) => { const state = row.surfaces[surface].state; counts[state] = (counts[state] ?? 0) + 1; return counts; }, {})]));
assert.deepEqual(surfaces.accessibility, { verified: 75, unavailable: 34 });
assert.deepEqual(surfaces.theme, { verified: 75, unavailable: 34 });
assert.deepEqual(surfaces.interaction, { 'not-applicable': 51, verified: 24, unavailable: 34 });
for (const row of ledger.rows) for (const surface of ['accessibility', 'theme', 'interaction']) {
  const cell = row.surfaces[surface];
  if (cell.state === 'unavailable' || cell.state === 'not-applicable') assert(cell.reason?.length);
  assert(!['unverified', 'fail'].includes(cell.state));
}
const historical = fs.readFileSync(`${root}/packages/component-contracts/registry/historical/component-capability-baseline.v1.json`);
assert.deepEqual(historical, execFileSync('git', ['show', '5fdf8a18:packages/component-contracts/registry/component-capability-baseline.v1.json'], { cwd: root }));
write('catalog-list-dist.json', catalog);
write('catalog-verification.json', { status: 'passed', buildHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), implementationUncommittedAtMeasurement: true, version: manifest.version, total: catalog.totalCount, surfaces, sourceArtifact: artifact.path, sourceSha256: hash(fs.readFileSync(`${root}/${artifact.path}`)), ledgerSha256: hash(fs.readFileSync(`${root}/packages/component-contracts/registry/component-capability-ledger.v1.json`)), historicalBaselineSha256: hash(historical), approvedRuntimeCensus: null, assertions: ['built handler = export = built package = generated ledger for every surface on 109 rows', '75 measured / 34 explicitly unavailable; 24 interactive / 51 static', 'historical baseline byte-equal to 5fdf8a18', 'date filename admitted by unchanged export regex'] });
console.log(JSON.stringify({ status: 'passed', total: catalog.totalCount, surfaces }, null, 2));
