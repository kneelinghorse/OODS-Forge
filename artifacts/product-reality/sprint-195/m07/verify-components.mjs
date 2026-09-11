import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { handle } from '../../../../packages/mcp-server/dist/tools/catalog.list.js';
import { handle as health } from '../../../../packages/mcp-server/dist/tools/health.js';
import { deriveToolTruth, serialize } from '../../../../scripts/product-reality/s193-tool-truth.mjs';
import { derivePublicHeadEquivalence } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { NUCLEUS_COMPONENT_IDS, componentCapabilityBaseline } from '../../../../packages/component-contracts/dist/index.js';
const base = 'artifacts/product-reality/sprint-195/m07';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (name, value) => fs.writeFileSync(`${base}/${name}`, JSON.stringify(value, null, 2) + '\n');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const references = [];
const bind = file => references.push({ path: file, sha256: hash(fs.readFileSync(file)) });
const runtime = read(`${base}/runtime/runtime-cells.v1.json`);
const head = runtime.head;
const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.deepEqual(derivePublicHeadEquivalence({ root: process.cwd(), implementationHead: head, executionHead: currentHead, sprintId: 'sprint-195' }).changedPaths, []);
const ledger = read('packages/component-contracts/registry/component-capability-ledger.v1.json');
const manifest = read('artifacts/structured-data/manifest.json');
const exported = read(manifest.artifacts.find(row => row.name === 'components').path);
const served = await handle({ detail: 'summary', pageSize: 200 });
assert.deepEqual(componentCapabilityBaseline, ledger); assert.equal(served.components.length, 109);
for (const row of ledger.rows) {
  assert.deepEqual(row.surfaces, served.components.find(entry => entry.name === row.id).productReality.surfaces);
  assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
}
write('catalog-list-dist.json', served); write('component-ledger.json', ledger);
const servedHealth = await health();
assert.equal(servedHealth.status, 'ok');
assert.deepEqual(servedHealth.productReality.runtime, { ...runtime.summary, head });
const toolLedgerFile = 'packages/mcp-server/registry/tool-capability-ledger.v1.json';
const toolLedger = read(toolLedgerFile);
assert.equal(serialize(deriveToolTruth({ root: process.cwd(), head: toolLedger.head })), fs.readFileSync(toolLedgerFile, 'utf8'));
assert.deepEqual(servedHealth.productReality.tools, { entries: 24, byTier: toolLedger.summary.byTier, head: toolLedger.head });
assert.deepEqual(servedHealth.productReality.viz, read('packages/viz-core/src/registry/viz-taxonomy.v1.json').summary);
assert.equal(toolLedger.summary.autoByTier['product-reality'], 19);
write('health-dist.json', servedHealth);
write('tool-proof.json', { implementationHead: head, censusHead: toolLedger.head, byteIdentical: true, sha256: hash(fs.readFileSync(toolLedgerFile)), summary: toolLedger.summary });
bind(toolLedgerFile); bind(`${base}/runtime/runtime-cells.v1.json`); bind(`${base}/tool-proof.json`);
const measurements = [];
for (const framework of ['react', 'vue']) {
  const file = `${base}/${framework}-measured.json`, report = read(file); bind(file);
  assert.equal(report.success, true); assert.equal(report.numFailedTests, 0); assert.equal(report.numPendingTests, 0);
  const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName));
  assert.equal(axe.length, 109);
  for (const id of NUCLEUS_COMPONENT_IDS) assert.equal(axe.filter(row => row.fullName.includes(`for the ${id} shared scenario`) && row.status === 'passed').length, 1, id);
  const themeFile = `${base}/${framework}-theme/report.json`, theme = read(themeFile); bind(themeFile);
  assert.equal(theme.status, 'passed'); assert.equal(theme.failed, 0); assert.equal(theme.skipped, 0); assert.deepEqual(theme.canonicalIds, NUCLEUS_COMPONENT_IDS);
  assert.equal(theme.cells.length, 6);
  for (const cell of theme.cells) {
    assert.deepEqual(cell.rows.map(row => row.componentId).sort(), [...NUCLEUS_COMPONENT_IDS].sort()); assert.equal(cell.status, 'passed');
    const image = `${base}/${framework}-theme/${cell.screenshot}`; assert.equal(hash(fs.readFileSync(image)), cell.screenshotSha256); bind(image);
  }
  measurements.push({ framework, axe: axe.length, themeRootCells: theme.cells.reduce((n, cell) => n + cell.rows.length, 0), skipped: 0 });
}
const tokens = read(`${base}/token-resolution.json`); assert.equal(tokens.head, head);
for (const scope of tokens.rows) { assert.equal(scope.counts.unresolvedColourRoles, 0); assert.equal(scope.counts.reachableSystemColourFallbacks, 0); assert.equal(scope.counts.nonColourUnresolved, 14); }
for (const file of ['component-ledger.json', 'catalog-list-dist.json', 'token-resolution.json']) bind(`${base}/${file}`);
for (const file of ['packages/component-contracts/registry/component-capability-ledger.v1.json', manifest.artifacts.find(row => row.name === 'components').path]) bind(file);
const execution = read(`${base}/component-execution.json`);
assert.equal(execution.head, head); assert.equal(execution.afterHead, head); assert.equal(execution.status, 'passed');
assert.equal(execution.executions.length, 4);
for (const row of execution.executions) { assert.equal(row.headBefore, head); assert.equal(row.headAfter, head); assert.equal(row.exitCode, 0); }
for (const input of execution.sourceInputs) assert.equal(hash(fs.readFileSync(input.path)), input.sha256);
bind(`${base}/component-execution.json`);
write('component-proof.json', { status: 'passed', head, exportVersion: manifest.version, measurements, references, sourceInputs: execution.sourceInputs, executions: execution.executions, execution, builderSelfCertified: false });
console.log('Built catalog/export/ledger equality109/109;109 axe and654 theme root-cells per framework;zero unresolved colours/fallbacks.');
