// Bounded s195 verifier: retain unchanged component pixels; verify current served ledgers.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { handle as catalog } from '../../../../packages/mcp-server/dist/tools/catalog.list.js';
import { handle as health } from '../../../../packages/mcp-server/dist/tools/health.js';
import { deriveToolTruth, serialize } from '../../../../scripts/product-reality/s193-tool-truth.mjs';
import { componentCapabilityBaseline, NUCLEUS_COMPONENT_IDS } from '../../../../packages/component-contracts/dist/index.js';
const base = 'artifacts/product-reality/sprint-196/m07';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const write = (name, value) => fs.writeFileSync(`${base}/${name}`, JSON.stringify(value, null, 2) + '\n');
const git = args => execFileSync('git', args, { maxBuffer: 32 * 1024 * 1024 });
const baseline = git(['rev-parse', '1d100e20']).toString().trim();
const runtime = read(`${base}/runtime/runtime-cells.v1.json`), head = runtime.head;
const previousPath = 'artifacts/product-reality/sprint-195/m07/component-proof.json', previous = read(previousPath);
const scope = ['packages/component-contracts', 'packages/component-styles', 'packages/components-react', 'packages/components-vue', 'packages/tokens', 'tokens'];
const changedPaths = git(['diff', '--name-only', '-z', baseline, head, '--', ...scope]).toString().split('\0').filter(Boolean);
assert.deepEqual(changedPaths, [], 'Retained component proof requires unchanged component and token source');
const sourceInputs = previous.sourceInputs;
for (const input of sourceInputs) {
  assert.equal(hash(fs.readFileSync(input.path)), input.sha256, input.path);
  assert.equal(hash(git(['show', `${baseline}:${input.path}`])), input.sha256, input.path);
  assert.equal(hash(git(['show', `${head}:${input.path}`])), input.sha256, input.path);
}
const references = [{ path: previousPath, sha256: hash(fs.readFileSync(previousPath)) }];
for (const ref of previous.references.filter(ref => /sprint-195\/m07\/(?:react-|vue-|token-resolution)/.test(ref.path))) {
  assert.equal(hash(fs.readFileSync(ref.path)), ref.sha256, ref.path); references.push(ref);
}
for (const framework of ['react', 'vue']) {
  const report = read(`artifacts/product-reality/sprint-195/m07/${framework}-measured.json`);
  assert.equal(report.success, true); assert.equal(report.numFailedTests, 0); assert.equal(report.numPendingTests, 0);
  const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName));
  assert.equal(axe.length, 109);
  for (const id of NUCLEUS_COMPONENT_IDS) assert.equal(axe.filter(row => row.fullName.includes(`for the ${id} shared scenario`) && row.status === 'passed').length, 1);
  const theme = read(`artifacts/product-reality/sprint-195/m07/${framework}-theme/report.json`);
  assert.equal(theme.status, 'passed'); assert.equal(theme.failed, 0); assert.equal(theme.skipped, 0); assert.equal(theme.cells.length, 6);
  for (const cell of theme.cells) assert.deepEqual(cell.rows.map(row => row.componentId).sort(), [...NUCLEUS_COMPONENT_IDS].sort());
}
write('component-retention.json', { base: baseline, head, scope, changedPaths, sourceInputs, builderSelfCertified: false });
write('component-proof.json', { status: 'passed', head: previous.head, retained: true, retentionBase: baseline, implementationHead: head, references, sourceInputs, measurements: previous.measurements, builderSelfCertified: false });
const ledger = read('packages/component-contracts/registry/component-capability-ledger.v1.json');
const manifest = read('artifacts/structured-data/manifest.json');
const exported = read(manifest.artifacts.find(row => row.name === 'components').path);
const served = await catalog({ detail: 'summary', pageSize: 200 });
assert.deepEqual(componentCapabilityBaseline, ledger); assert.equal(served.components.length, 109);
for (const row of ledger.rows) {
  assert.deepEqual(row.surfaces, served.components.find(entry => entry.name === row.id).productReality.surfaces);
  assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
}
const toolPath = 'packages/mcp-server/registry/tool-capability-ledger.v1.json', tools = read(toolPath);
assert.equal(serialize(deriveToolTruth({ root: process.cwd(), head: tools.head, mode: tools.mode })), fs.readFileSync(toolPath, 'utf8'));
assert.equal(tools.summary.autoByTier['product-reality'], 19);
assert.deepEqual(tools.rows.flatMap(row => row.portableLimits ?? []).map(row => row.code).sort(), ['OODS-N019', 'OODS-N020']);
const servedHealth = await health(); assert.equal(servedHealth.status, 'ok');
assert.deepEqual(servedHealth.productReality.runtime, { ...runtime.summary, head });
assert.equal(servedHealth.productReality.release.cells, 42); assert.equal(servedHealth.productReality.release.fail, 0);
assert.deepEqual(servedHealth.productReality.tools, { entries: 24, byTier: tools.summary.byTier, head: tools.head });
const taxonomyPath = 'packages/viz-core/src/registry/viz-taxonomy.v1.json', taxonomy = read(taxonomyPath);
assert.deepEqual(servedHealth.productReality.viz, taxonomy.summary); assert.equal(taxonomy.summary.classified, 34);
write('component-ledger.json', ledger); write('catalog-list-dist.json', served); write('health-dist.json', servedHealth);
write('tool-proof.json', { implementationHead: head, censusHead: tools.head, byteIdentical: true, sha256: hash(fs.readFileSync(toolPath)), summary: tools.summary, portableExecution: tools.portableExecution });
write('taxonomy-census.json', { status: 'passed', head, summary: taxonomy.summary, sha256: hash(fs.readFileSync(taxonomyPath)) });
console.log('Current catalog/export/ledger109; tool19/19 and two typed limits; taxonomy34; original s195 component pixels retained with211 unchanged source inputs.');
