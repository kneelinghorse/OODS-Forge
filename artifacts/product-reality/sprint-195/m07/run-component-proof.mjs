import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

// One Sprint195 capture: four existing package commands, with their native reports.
// Run only after the fresh runtime sweep has written its submitted-packages inventory.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const base = 'artifacts/product-reality/sprint-195/m07';
const endpoint = 'ws://127.0.0.1:19530/';
const receiptPath = `${base}/component-execution.json`;
const scope = ['packages/component-contracts', 'packages/component-styles', 'packages/components-react', 'packages/components-vue', 'packages/tokens/src',
  'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs'];
const scopes = ['A-light', 'A-dark', 'A-hc', 'B-light', 'B-dark', 'B-hc'];
const absolute = file => path.resolve(root, file);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
const currentHead = () => git(['rev-parse', 'HEAD']);
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const head = currentHead();
assert.match(head, /^[a-f0-9]{40}$/);
const files = git(['ls-tree', '-r', '--name-only', head, '--', ...scope]).split('\n').filter(Boolean).sort();
assert(files.length > 0);
const snapshot = () => files.map(file => ({ path: file, sha256: hash(fs.readFileSync(absolute(file))) }));
const sourceInputs = snapshot();
for (const input of sourceInputs) {
  const frozen = execFileSync('git', ['show', `${head}:${input.path}`], { cwd: root, maxBuffer: 32 * 1024 * 1024 });
  assert.equal(input.sha256, hash(frozen), `Uncommitted component input: ${input.path}`);
}
const sourceInputsSha256 = hash(serialize(sourceInputs));
const inventoryPath = `${base}/runtime/submitted-packages/inventory.json`;
const inventoryBytes = fs.readFileSync(absolute(inventoryPath));
const inventory = JSON.parse(inventoryBytes);
assert.deepEqual(inventory.map(row => row.name).sort(), ['@oods/component-contracts', '@oods/component-styles', '@oods/components-react', '@oods/components-vue', '@oods/tokens']);
const verifyInventory = () => {
  assert.equal(hash(fs.readFileSync(absolute(inventoryPath))), hash(inventoryBytes));
  for (const row of inventory) {
    assert(row.artifactPath.startsWith('submitted-packages/') && !row.artifactPath.split('/').includes('..'));
    const bytes = fs.readFileSync(absolute(`${base}/runtime/${row.artifactPath}`));
    assert.equal(bytes.length, row.bytes); assert.equal(hash(bytes), row.sha256.replace(/^sha256:/, ''));
  }
};
verifyInventory();

const commands = ['react', 'vue'].flatMap(framework => {
  const extension = framework === 'react' ? 'tsx' : 'ts';
  const measured = `${base}/${framework}-measured.json`, theme = `${base}/${framework}-theme`;
  return [
    { framework, kind: 'measured', reportPath: measured, log: `${base}/${framework}-measured.log`,
      args: ['--filter', `@oods/components-${framework}`, 'exec', 'vitest', 'run',
        `test/accessibility.spec.${extension}`, `test/scenario-interactions.spec.${extension}`, `test/scenarios.spec.${extension}`,
        '--reporter=default', '--reporter=json', `--outputFile=${absolute(measured)}`] },
    { framework, kind: 'theme', reportPath: `${theme}/report.json`, outputDirectory: theme, log: `${base}/${framework}-theme.log`,
      args: ['--filter', `@oods/components-${framework}`, 'run', 'test:visual', `--cells=${scopes.join(',')}`, `--output=${theme}`] },
  ];
});
for (const file of [receiptPath, ...commands.flatMap(row => [row.log, row.reportPath, ...(row.outputDirectory ? [row.outputDirectory] : [])])]) {
  assert(!fs.existsSync(absolute(file)), `Preserve the previous capture before retrying: ${file}`);
}

const receipt = { status: 'running', head, afterHead: head, sourceInputs, sourceInputsSha256, sourceInputsUnchanged: false,
  runtimeInventory: { path: inventoryPath, sha256: hash(inventoryBytes) },
  browserEndpoint: endpoint, builderSelfCertified: false, executions: [] };
const save = () => fs.writeFileSync(absolute(receiptPath), serialize(receipt));
save();
try {
  for (const selected of commands) {
    const command = `OODS_PLAYWRIGHT_WS_ENDPOINT=${quote(endpoint)} ${['pnpm', ...selected.args].map(quote).join(' ')}`;
    const execution = { framework: selected.framework, kind: selected.kind, reportPath: selected.reportPath,
      log: selected.log, command, argv: ['pnpm', ...selected.args], headBefore: currentHead(), startedAt: new Date().toISOString() };
    receipt.executions.push(execution);
    assert.equal(execution.headBefore, head, 'The frozen head changed before a component command');
    execution.sourceInputsBeforeSha256 = hash(serialize(snapshot()));
    assert.equal(execution.sourceInputsBeforeSha256, sourceInputsSha256, 'Component source bytes changed before a command');
    save();
    const fd = fs.openSync(absolute(selected.log), 'wx');
    fs.writeSync(fd, `$ ${command}\n`);
    let result;
    try {
      result = spawnSync('pnpm', selected.args, { cwd: root, env: { ...process.env, OODS_PLAYWRIGHT_WS_ENDPOINT: endpoint }, stdio: ['ignore', fd, fd] });
    } finally { fs.closeSync(fd); }
    execution.exitCode = result.status; execution.signal = result.signal;
    if (result.error) execution.spawnError = String(result.error);
    execution.finishedAt = new Date().toISOString(); execution.headAfter = currentHead(); receipt.afterHead = execution.headAfter;
    execution.sourceInputsAfterSha256 = hash(serialize(snapshot()));
    execution.sourceInputsUnchanged = execution.sourceInputsAfterSha256 === execution.sourceInputsBeforeSha256;
    save();
    assert.equal(execution.headAfter, head, 'The frozen head changed during a component command');
    assert.equal(execution.sourceInputsAfterSha256, sourceInputsSha256, 'Component source bytes changed during a command');
    assert.equal(result.error, undefined); assert.equal(result.status, 0, `${selected.framework}/${selected.kind} failed; raw log: ${selected.log}`);
    const reportBytes = fs.readFileSync(absolute(selected.reportPath));
    execution.reportSha256 = hash(reportBytes);
    const report = JSON.parse(reportBytes);
    if (selected.kind === 'measured') {
      assert.equal(report.success, true); assert.equal(report.numFailedTests, 0); assert.equal(report.numPendingTests, 0); assert.equal(report.numTodoTests, 0);
      assert.equal(report.testResults.length, 3); assert(report.testResults.every(file => file.assertionResults.length && file.assertionResults.every(test => test.status === 'passed')));
    } else {
      assert.equal(report.target, selected.framework); assert.equal(report.status, 'passed'); assert.equal(report.failed, 0); assert.equal(report.skipped, 0);
      assert.deepEqual(report.cells.map(cell => cell.cell).sort(), [...scopes].sort()); assert(report.cells.every(cell => cell.status === 'passed'));
    }
    execution.status = 'passed'; save();
    console.log(`${selected.framework}/${selected.kind}: passed at ${execution.headAfter}; ${selected.reportPath}`);
  }
  receipt.afterHead = currentHead(); assert.equal(receipt.afterHead, head);
  receipt.sourceInputsAfter = snapshot(); assert.deepEqual(receipt.sourceInputsAfter, sourceInputs);
  verifyInventory(); receipt.sourceInputsUnchanged = true; receipt.status = 'passed'; save();
} catch (error) {
  receipt.status = 'failed'; receipt.error = String(error.stack ?? error); receipt.afterHead = currentHead();
  try { receipt.sourceInputsAfter = snapshot(); receipt.sourceInputsUnchanged = hash(serialize(receipt.sourceInputsAfter)) === sourceInputsSha256; }
  catch (sourceError) { receipt.sourceInputsAfterError = String(sourceError); }
  save(); throw error;
}
