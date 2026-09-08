#!/usr/bin/env node
// Bounded, isolated Sprint 187 delivery probe. Never restarts PM2 or writes a served store.
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.resolve(root, process.argv[2] ?? 'artifacts/product-reality/sprint-187/m05/delivery-attempt-1');
assert(output.startsWith(path.join(root, 'artifacts/product-reality/sprint-187/')));
assert(!fs.existsSync(output), 'Retain each attempt; choose a new output directory.');
fs.mkdirSync(output, { recursive: true });
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fileHash = (p) => hash(fs.readFileSync(p));
const write = (name, data) => fs.writeFileSync(path.join(output, name), JSON.stringify(data, null, 2) + '\n');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const original = path.join(root, 'artifacts/product-reality/sprint-183/m04/saved-schema-store');
const snapshot = (dir) => Object.fromEntries(fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => [name, fileHash(path.join(dir, name))]));
const originalHashes = snapshot(original);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-s187-delivery-'));
const disposable = path.join(tmp, 'schemas');
const backup = path.join(tmp, 'backup');
fs.cpSync(original, disposable, { recursive: true });
fs.cpSync(disposable, backup, { recursive: true });
const token = randomBytes(32).toString('hex'); // isolated token is never retained in output
const listener = net.createServer();
await new Promise((resolve, reject) => listener.once('error', reject).listen(0, '127.0.0.1', resolve));
const port = listener.address().port;
await new Promise((resolve) => listener.close(resolve));
const log = fs.openSync(path.join(output, 'candidate-bridge.log'), 'wx');
const sourceHead = git(root, 'rev-parse', 'HEAD');
const sourceDiff = execFileSync('git', ['diff', 'HEAD', '--', 'packages', 'cmos/scripts', 'cmos/planning/component-schema.json', 'scripts/product-reality'], { cwd: root });
const files = ['scripts/product-reality/s187-m05-delivery-rehearsal.mjs', 'packages/mcp-bridge/dist/server.js', 'packages/mcp-server/dist/index.js', 'packages/mcp-server/dist/tools/catalog.list.js', 'packages/mcp-server/dist/codegen/binding-utils.js', 'packages/mcp-server/dist/compose/object-slot-filler.js', 'packages/mcp-server/src/schemas/catalog.list.output.json', 'artifacts/structured-data/manifest.json'];
const candidate = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), detached: true,
  env: { ...process.env, MCP_BRIDGE_PORT: String(port), BRIDGE_TOKEN: token, MCP_SCHEMA_STORE_ROOT: tmp, MCP_SCHEMA_STORE_DIR: disposable }, stdio: ['ignore', log, log] });
const base = `http://127.0.0.1:${port}`;
const calls = [];
async function run(tool, input) {
  const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Bridge-Token': token }, body: JSON.stringify({ tool, input, role: 'designer' }), signal: AbortSignal.timeout(30000) });
  const body = await response.json();
  const index = calls.length + 1;
  write(`call-${index}.json`, { request: { tool, input, role: 'designer' }, httpStatus: response.status, body });
  calls.push({ index, tool, httpStatus: response.status, receipt: rel(path.join(output, `call-${index}.json`)) });
  assert.equal(response.status, 200, JSON.stringify(body));
  assert.equal(body.ok, true, JSON.stringify(body));
  return body.result;
}
let outcome;
try {
  let health;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(500) }); health = await response.json(); if (response.ok) break; } catch {}
    assert(candidate.exitCode === null, 'Candidate bridge exited during startup.');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(health?.status, 'ok');
  write('candidate-identity.json', { observedAt: new Date().toISOString(), sourceHead, sourceState: 'worktree', sourceDiffSha256: hash(sourceDiff), cwd: root, bridgeCwd: path.join(root, 'packages/mcp-bridge'), pid: candidate.pid, port, bind: '127.0.0.1', command: 'node dist/server.js', overrides: { MCP_BRIDGE_PORT: port, MCP_SCHEMA_STORE_ROOT: tmp, MCP_SCHEMA_STORE_DIR: disposable, BRIDGE_TOKEN: 'isolated ephemeral token; value omitted' }, hashes: Object.fromEntries(files.map((name) => [name, fileHash(path.join(root, name))])), health, healthProvesSourceIdentity: false });
  const catalog = await run('catalog_list', { detail: 'summary', pageSize: 200 });
  assert.equal(catalog.totalCount, 109);
  assert.equal(catalog.obligationScope.decisionId, 1788);
  assert.equal(catalog.obligationScope.approvedRuntimeCensus, null);
  const members = JSON.parse(fs.readFileSync(path.join(root, 'packages/component-contracts/registry/component-intake.v1.json'))).rows.map((row) => row.id).sort();
  assert.deepEqual(catalog.components.map((row) => row.name).sort(), members);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/structured-data/manifest.json')));
  assert.equal(catalog.generatedAt, manifest.generatedAt);
  const rows = ['ArchivePill', 'ArchiveEvent', 'BillingAmountInput'].map((name) => catalog.components.find((row) => row.name === name));
  assert.deepEqual(rows.map((row) => row.status), ['stable', 'stable', 'planned']);
  for (const row of rows) for (const surface of ['accessibility', 'theme', 'interaction']) assert.equal(row.productReality.surfaces[surface].state, 'unverified');
  const generation = [];
  for (const framework of ['react', 'vue']) for (const component of rows.map((row) => row.name)) {
    const result = await run('code_generate', { framework, profile: 'build', schema: { version: '1.0.0', screens: [{ id: 'discovery-probe', component }] } });
    assert.equal(result.status, component === 'ArchivePill' ? 'ok' : 'error', JSON.stringify(result.errors));
    if (component !== 'ArchivePill') assert(result.errors.some((error) => error.code === 'OODS-N015' && error.component === component));
    generation.push({ component, framework, status: result.status, errors: result.errors ?? [] });
  }
  write('discovery.json', { status: 'passed', totalCount: catalog.totalCount, generatedAt: catalog.generatedAt, obligationScope: catalog.obligationScope, rows, generation });
  const input = { object: 'User', context: 'form' };
  const composed = await run('design_compose', input);
  assert.equal(composed.status, 'ok');
  const schemaHash = hash(JSON.stringify(composed.schema));
  const saved = await run('schema', { action: 'save', name: 'user-form-showcase', schemaRef: composed.schemaRef, author: 'Codex', tags: [] });
  assert.equal(saved.version, 2);
  const loaded = await run('schema', { action: 'load', name: 'user-form-showcase' });
  assert.equal(loaded.version, 2);
  assert.equal(loaded.object, 'User');
  const successorRecord = JSON.parse(fs.readFileSync(path.join(disposable, 'user-form-showcase.json')));
  assert.deepEqual(successorRecord.schema, composed.schema, 'Schema save must persist the unmodified composer output.');
  const cells = [];
  for (const framework of ['react', 'vue']) {
    const result = await run('code_generate', { schema: composed.schema, framework, profile: 'build' });
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    assert.match(result.artifact.contentHash, /^sha256:[a-f0-9]{64}$/);
    cells.push({ framework, status: result.status, artifactHash: result.artifact?.contentHash });
  }
  const successorHashes = snapshot(disposable);
  const unaffected = Object.keys(originalHashes).filter((name) => !['user-form-showcase.json', '_index.json'].includes(name));
  for (const name of unaffected) assert.equal(successorHashes[name], originalHashes[name], `Unrelated record changed: ${name}`);
  const priorIndex = JSON.parse(fs.readFileSync(path.join(original, '_index.json')));
  const nextIndex = JSON.parse(fs.readFileSync(path.join(disposable, '_index.json')));
  const unrelatedIndex = (index) => index.schemas.filter((row) => row.name !== 'user-form-showcase').sort((a, b) => a.name.localeCompare(b.name));
  assert.deepEqual(unrelatedIndex(nextIndex), unrelatedIndex(priorIndex), 'Unrelated index entries must stay unchanged.');
  assert.equal(successorRecord.object, 'User');
  const retained = path.join(output, 'recomposed-store');
  fs.cpSync(disposable, retained, { recursive: true });
  fs.rmSync(disposable, { recursive: true });
  fs.cpSync(backup, disposable, { recursive: true });
  const rollbackHashes = snapshot(disposable);
  assert.deepEqual(rollbackHashes, originalHashes, 'Disposable rollback must restore every original byte.');
  assert.deepEqual(snapshot(original), originalHashes, 'Frozen source store must remain unchanged.');
  outcome = { status: 'passed', mission: 's187-m05', sourceHead, input, schemaRef: composed.schemaRef, schemaSha256: schemaHash, savedObject: successorRecord.object, unrelatedIndexEntriesUnchanged: true, originalStore: rel(original), successorStore: rel(retained), disposableStore: disposable, originalVersion: 1, successorVersion: 2, originalHashes, successorHashes, rollbackHashes, unaffectedRecords: unaffected, cells, originalUnchanged: true, rollbackByteIdentical: true, servedAdoption: 'pending; no shared-store writes', calls };
  write('recomposition.json', outcome);
} catch (error) {
  write('failure.json', { status: 'failed', message: error.message, stack: error.stack, calls });
  throw error;
} finally {
  // Only the process group created above is stopped; shared PM2 is untouched.
  try { process.kill(-candidate.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  fs.closeSync(log);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(JSON.stringify({ status: outcome.status, output: rel(output), sourceHead, originalUnchanged: outcome.originalUnchanged, rollbackByteIdentical: outcome.rollbackByteIdentical, cells: outcome.cells, calls: calls.length }));
