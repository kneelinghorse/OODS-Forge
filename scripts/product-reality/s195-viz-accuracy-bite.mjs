#!/usr/bin/env node
/** One bounded physical predicate mutation; always restore and rebuild before returning. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(process.env.OODS_VIZ_CENSUS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const output = resolve(process.env.OODS_VIZ_ACCURACY_BITE_OUTPUT ?? resolve(root, 'artifacts/product-reality/sprint-195/m04/bite'));
const relative = 'packages/viz-core/src/accuracy/echarts-index.ts';
const file = resolve(root, relative);
const before = readFileSync(file, 'utf8');
const block = /const V171: EChartsAccuracyRule = \{[\s\S]*?\n\};/.exec(before)?.[0];
assert(block, 'The real V171 registration must exist before running its predicate bite');
const evaluatorMatch = /evaluate: ([A-Za-z0-9_]+),/.exec(block);
assert(evaluatorMatch, 'V171 must use a real named predicate');
const evaluator = evaluatorMatch[0];
// Retain the import reference so noUnusedLocals cannot substitute a build error for the intended red.
const disabledEvaluator = `evaluate: () => { void ${evaluatorMatch[1]}; return { evaluated: true }; },`;
const disabled = block.replace(evaluator, disabledEvaluator);
const mutant = before.replace(block, disabled);
assert.notEqual(mutant, before);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
mkdirSync(output, { recursive: true });
const record = {
  schemaVersion: 1, missionId: 's195-m04', builderSelfCertified: false,
  mutation: { path: relative, code: 'OODS-V171', before: evaluator, after: disabledEvaluator,
    sourceSha256Before: sha256(before), sourceSha256Disabled: sha256(mutant),
    invariant: 'The offered rule list and evaluated count remain intact; only the negative-strength predicate is disabled.' },
  commands: [], restoredByteIdentically: false,
};
function run(name, args) {
  const result = spawnSync('pnpm', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`;
  const log = `${name}.log`;
  writeFileSync(resolve(output, log), text);
  record.commands.push({ name, command: ['pnpm', ...args], exitCode: result.status, log });
  return { exitCode: result.status, text };
}
let failure;
try {
  writeFileSync(file, mutant);
  assert.equal(run('disabled-build', ['--filter', '@oods/viz-core', 'run', 'build']).exitCode, 0, 'The disabled predicate must build before its red is meaningful');
  const red = run('disabled-census', ['exec', 'tsx', 'scripts/product-reality/s190-viz-census.ts', '--check']);
  assert.notEqual(red.exitCode, 0, 'A disabled accuracy predicate must make the live census red');
  assert.match(red.text, /flow_map: census missed required OODS-V171 accuracy finding/, 'The red must expose the missing production predicate, not another failure');
} catch (error) { failure = error; }
finally {
  // Never overwrite an unrelated edit made during the coordinated mutation window.
  assert.equal(readFileSync(file, 'utf8'), mutant, 'Source changed during the bite; manual reconciliation is required');
  writeFileSync(file, before);
  record.restoredByteIdentically = readFileSync(file, 'utf8') === before;
  const restoredBuild = run('restored-build', ['--filter', '@oods/viz-core', 'run', 'build']);
  const green = restoredBuild.exitCode === 0 ? run('restored-census', ['exec', 'tsx', 'scripts/product-reality/s190-viz-census.ts', '--check']) : undefined;
  record.status = !failure && record.restoredByteIdentically && restoredBuild.exitCode === 0 && green?.exitCode === 0 ? 'passed' : 'failed';
  writeFileSync(resolve(output, 'accuracy-bite.json'), JSON.stringify(record, null, 2) + '\n');
}
if (failure) throw failure;
assert.equal(record.status, 'passed', 'Restored source and full live census must be green');
console.log(JSON.stringify({ status: record.status, rule: 'OODS-V171', restoredByteIdentically: record.restoredByteIdentically }));
