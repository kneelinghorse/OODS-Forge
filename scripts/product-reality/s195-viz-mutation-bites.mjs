#!/usr/bin/env node
/** Three bounded physical mutations, adapted from the m04 accuracy bite. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

assert(process.argv.includes('--execute'), 'Use --execute only during the agreed exclusive source/build window');
const root = resolve(process.env.OODS_VIZ_CENSUS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const output = resolve(process.env.OODS_VIZ_BITES_OUTPUT ?? resolve(root, 'artifacts/product-reality/sprint-195/m06/bites'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const records = [];
function run(record, name, args, extraEnv = {}) {
  const result = spawnSync('pnpm', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, ...extraEnv } });
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`;
  const log = `${record.id}/${name}.log`;
  writeFileSync(resolve(output, log), text);
  record.commands.push({ command: ['pnpm', ...args], exitCode: result.status, log });
  return { exitCode: result.status, text };
}
async function bite(id, relative, mutate, exercise, restoreChecks) {
  const file = resolve(root, relative), before = readFileSync(file, 'utf8'), disabled = mutate(before);
  assert.notEqual(disabled, before, `${id}: mutation did not change source`);
  mkdirSync(resolve(output, id), { recursive: true });
  const record = { id, path: relative, beforeSha256: hash(before), disabledSha256: hash(disabled), commands: [], restoredByteIdentically: false };
  let failure;
  try { writeFileSync(file, disabled); await exercise(record); }
  catch (error) { failure = error; record.failure = String(error); }
  finally {
    assert.equal(readFileSync(file, 'utf8'), disabled, `${id}: unrelated source edit during the exclusive window; manual reconciliation required`);
    writeFileSync(file, before);
    record.restoredByteIdentically = readFileSync(file, 'utf8') === before;
    try { await restoreChecks(record); } catch (error) { failure ??= error; record.restoreFailure = String(error); }
    record.status = !failure && record.restoredByteIdentically ? 'passed' : 'failed';
    records.push(record);
    writeFileSync(resolve(output, 'bites.json'), JSON.stringify({ schemaVersion: 1, missionId: 's195-m06', builderSelfCertified: false, records }, null, 2) + '\n');
  }
  if (failure) throw failure;
}
const census = ['exec', 'tsx', 'scripts/product-reality/s190-viz-census.ts', '--check'];
const build = ['--filter', '@oods/viz-core', 'run', 'build'];
const registryContract = ['--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', 'test/contracts/viz-recipes.s190.spec.ts'];
const patternContract = ['--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', 'test/contracts/viz-pattern-registry.s195.spec.ts'];
await bite('palette', 'packages/viz-core/src/adapters/vega-lite-adapter.ts', before => {
  const original = 'const categoricalPalette = resolveCategoricalPalette(spec, scope);';
  assert.equal(before.split(original).length, 2, 'Expected one real categorical bake');
  return before.replace(original, 'const categoricalPalette: readonly string[] = []; void resolveCategoricalPalette;');
}, async record => {
  assert.equal(run(record, 'disabled-build', build).exitCode, 0);
  assert.equal(run(record, 'disabled-contrast', ['exec', 'tsx', 'scripts/product-reality/s195-viz-bite-probe.ts', '--expect-fail'], { OODS_VIZ_BITE_PROBE_OUTPUT: resolve(output, 'palette/disabled-proof.json') }).exitCode, 0, 'The real certify contrast pillar must fail');
  const red = run(record, 'disabled-census', census);
  assert.notEqual(red.exitCode, 0, 'Missing palette bake must make the full live census red');
  assert.match(red.text, /Measured viz registry differs from canonical source/);
}, async record => {
  assert.equal(run(record, 'restored-build', build).exitCode, 0);
  assert.equal(run(record, 'restored-contrast', ['exec', 'tsx', 'scripts/product-reality/s195-viz-bite-probe.ts', '--expect-pass'], { OODS_VIZ_BITE_PROBE_OUTPUT: resolve(output, 'palette/restored-proof.json') }).exitCode, 0);
  assert.equal(run(record, 'restored-census', census).exitCode, 0);
});
if (!process.argv.includes('--palette-only')) {
await bite('registry', 'packages/viz-core/src/registry/viz-recipes.v1.json', before => {
  const rows = JSON.parse(before); assert.equal(rows.length, 13); assert.equal(rows[0].publicSvg, true);
  rows[0].publicSvg = false;
  return JSON.stringify(rows, null, 2) + '\n';
}, async record => {
  const red = run(record, 'disabled-contract', registryContract);
  assert.notEqual(red.exitCode, 0); assert.match(red.text, /the exported registry equals every live census cell/);
}, async record => { assert.equal(run(record, 'restored-contract', registryContract).exitCode, 0); });
const sources = JSON.parse(readFileSync(resolve(root, 'packages/viz-core/src/registry/viz-patterns.v1.json'), 'utf8'));
const source = sources.find(row => row.id === 'pattern:viz:simple-bar');
assert(source?.specPath, 'Exact authored pattern must exist');
await bite('pattern-sha', source.specPath, before => before + '\n', async record => {
  const red = run(record, 'disabled-contract', patternContract);
  assert.notEqual(red.exitCode, 0); assert.match(red.text, /bundled source SHA is stale|specSha256|source hashes/);
}, async record => { assert.equal(run(record, 'restored-contract', patternContract).exitCode, 0); });
}
console.log(JSON.stringify({ bites: records.length, passed: records.filter(record => record.status === 'passed').length, restored: records.every(record => record.restoredByteIdentically) }));
