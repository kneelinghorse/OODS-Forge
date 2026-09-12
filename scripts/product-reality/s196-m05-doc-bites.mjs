#!/usr/bin/env node
/** Physical doc mutations in an archived checkout, with measured red and exact restoration. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_HEAD = '944f4dda5f784e266310978b31f65b3d452e6387';
const TRACKED_PATHS = ['package.json', 'pnpm-workspace.yaml', 'tsconfig.json', 'src', 'packages', 'scripts/docs', 'traits', 'objects', 'domains', 'schemas', 'configs', 'artifacts/structured-data', 'docs', 'README.md', '.storybook', 'tools/agents-smoke'];
const options = { head: DEFAULT_HEAD, frozen: undefined, output: path.join(ROOT, 'artifacts/product-reality/sprint-196/m05/doc-bites'), execute: false };
for (let index = 2; index < process.argv.length; index++) {
  const arg = process.argv[index];
  if (arg === '--') continue;
  if (arg === '--execute') { options.execute = true; continue; }
  const key = { '--source-head': 'head', '--frozen': 'frozen', '--output': 'output' }[arg];
  assert(key && process.argv[index + 1] && !process.argv[index + 1].startsWith('--'), `Unknown or incomplete option: ${arg}`);
  options[key] = process.argv[++index];
}
assert(options.execute, 'Use --execute to run the isolated physical mutations.');
assert.match(options.head, /^[a-f0-9]{40}$/);
const output = path.resolve(options.output);
fs.mkdirSync(output, { recursive: true });
const sha256 = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

function freezeInputs() {
  const changed = execFileSync('git', ['diff', '--name-only', options.head, '--', 'packages', 'src', 'traits', 'objects', 'domains', 'configs', 'schemas', 'scripts', '.storybook', 'tools/agents-smoke', 'artifacts/structured-data'], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(changed, '', 'Capture built inputs before changing baseline source, or pass the previously captured --frozen directory.');
  const frozen = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-s196-m05-doc-frozen-'));
  const target = path.join(frozen, 'repository');
  fs.mkdirSync(target);
  execFileSync('git', ['archive', '--format=tar', '--output', path.join(frozen, 'tracked.tar'), options.head, ...TRACKED_PATHS], { cwd: ROOT });
  execFileSync('tar', ['-xf', path.join(frozen, 'tracked.tar'), '-C', target]);
  const builtDirectories = [];
  for (const name of fs.readdirSync(path.join(ROOT, 'packages'))) {
    const relative = `packages/${name}/dist`;
    if (!fs.existsSync(path.join(ROOT, relative))) continue;
    fs.cpSync(path.join(ROOT, relative), path.join(target, relative), { recursive: true, dereference: true });
    builtDirectories.push(relative);
  }
  writeJson(path.join(frozen, 'freeze.json'), { head: options.head, trackedPaths: TRACKED_PATHS, builtDirectories, target });
  return frozen;
}

const frozen = path.resolve(options.frozen ?? freezeInputs());
const freeze = json(path.join(frozen, 'freeze.json'));
assert.equal(freeze.head, options.head, 'The frozen source must be the recorded mission baseline.');
const target = fs.realpathSync(path.join(frozen, 'repository'));
assert.notEqual(target, fs.realpathSync(ROOT), 'Mutations must never use the working checkout.');

// Component references also require their historical evidence links to exist.
// Materialize those exact blobs from the same commit, never from the live tree.
const missingReferences = [...new Set(files(path.join(target, 'docs/components')).filter(file => file.endsWith('.md')).flatMap(file =>
  [...fs.readFileSync(file, 'utf8').matchAll(/\]\(\.\.\/\.\.\/([^\n)]+)\)/g)].map(match => decodeURI(match[1]))
))].filter(relative => !fs.existsSync(path.join(target, relative))).sort();
if (missingReferences.length) {
  for (const relative of missingReferences) assert(!path.isAbsolute(relative) && !relative.split('/').includes('..'), `Unsafe reference: ${relative}`);
  const archive = 'references.tar';
  execFileSync('git', ['archive', '--format=tar', '--output', path.join(frozen, archive), options.head, ...missingReferences], { cwd: ROOT });
  execFileSync('tar', ['-xf', path.join(frozen, archive), '-C', target]);
  freeze.trackedPaths.push(...missingReferences);
  freeze.referenceArchive = archive;
  writeJson(path.join(frozen, 'freeze.json'), freeze);
}

// Verify copied tracked inputs against Git blob identities, not the changing live tree.
const tree = execFileSync('git', ['ls-tree', '-rz', options.head, '--', ...freeze.trackedPaths], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const tracked = tree.split('\0').filter(Boolean).map(line => {
  const [header, relative] = line.split('\t');
  const [mode, type, blob] = header.split(' ');
  assert.equal(type, 'blob', `Unexpected tracked input ${relative}`);
  const bytes = mode === '120000' ? Buffer.from(fs.readlinkSync(path.join(target, relative))) : fs.readFileSync(path.join(target, relative));
  const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.equal(actual, blob, `Frozen tracked input differs from ${options.head}: ${relative}`);
  return { path: relative, gitBlob: blob, sha256: sha256(bytes), size: bytes.length, ...(mode === '120000' ? { symlink: true } : {}) };
});
const built = freeze.builtDirectories.flatMap(directory => files(path.join(target, directory)).map(file => ({ path: path.relative(target, file), sha256: sha256(fs.readFileSync(file)) })));

// External dependencies can share the immutable installed pnpm store. First-party
// links always point inside the frozen checkout; never symlink its whole node_modules.
const packages = new Map();
for (const directory of fs.readdirSync(path.join(target, 'packages'))) {
  const file = path.join(target, 'packages', directory, 'package.json');
  if (fs.existsSync(file)) packages.set(json(file).name, path.dirname(file));
}
const firstPartyLinks = [];
function linkDependencies(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === '.bin') continue;
    const names = entry.name.startsWith('@') ? fs.readdirSync(path.join(source, entry.name)).map(name => `${entry.name}/${name}`) : [entry.name];
    for (const name of names) {
      const link = path.join(destination, name);
      const resolved = packages.get(name) ?? fs.realpathSync(path.join(source, name));
      if (!fs.existsSync(link)) {
        fs.mkdirSync(path.dirname(link), { recursive: true });
        fs.symlinkSync(resolved, link, fs.statSync(resolved).isDirectory() ? 'dir' : 'file');
      }
      if (packages.has(name)) assert.equal(fs.realpathSync(link), fs.realpathSync(resolved), `${name} first-party link escaped the frozen checkout`);
      if (packages.has(name)) firstPartyLinks.push({ name, link: path.relative(target, link), resolvesTo: path.relative(target, fs.realpathSync(link)) });
    }
  }
}
linkDependencies(path.join(ROOT, 'node_modules'), path.join(target, 'node_modules'));
for (const [name, directory] of packages) {
  const link = path.join(target, 'node_modules', name);
  if (!fs.existsSync(link)) {
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(directory, link, 'dir');
    firstPartyLinks.push({ name, link: path.relative(target, link), resolvesTo: path.relative(target, directory) });
  }
  linkDependencies(path.join(ROOT, path.relative(target, directory), 'node_modules'), path.join(directory, 'node_modules'));
}
const requireFromTarget = createRequire(path.join(target, 'package.json'));
const resolutions = ['@oods/component-contracts', '@oods/viz-core', '@oods/tokens', '@oods/a11y-tools'].map(name => {
  const resolved = fs.realpathSync(requireFromTarget.resolve(name));
  assert(resolved.startsWith(`${target}${path.sep}`), `${name} escaped to current first-party bytes`);
  return { name, entry: path.relative(target, resolved), sha256: sha256(fs.readFileSync(resolved)) };
});
const lock = execFileSync('git', ['show', `${options.head}:pnpm-lock.yaml`], { cwd: ROOT, maxBuffer: 8 * 1024 * 1024 });
assert.equal(sha256(fs.readFileSync(path.join(ROOT, 'pnpm-lock.yaml'))), sha256(lock), 'Installed dependency lock changed since the baseline.');
writeJson(path.join(output, 'snapshot.json'), { sourceHead: options.head, archiveSha256: sha256(fs.readFileSync(path.join(frozen, 'tracked.tar'))), ...(freeze.referenceArchive ? { referenceArchiveSha256: sha256(fs.readFileSync(path.join(frozen, freeze.referenceArchive))) } : {}), dependencyLockSha256: sha256(lock), tracked, built, firstPartyLinks, resolutions, method: 'Git archive for tracked inputs; built inputs copied once before mutation; target-local first-party links; only external dependencies share the installed store.' });

const environment = { ...process.env, TZ: 'America/Chicago', TSX_TSCONFIG_PATH: path.join(target, 'tsconfig.json') };
for (const key of Object.keys(environment)) if (/^(OODS_|MCP_|BRIDGE_)/.test(key) || key === 'NODE_PATH') delete environment[key];
const generators = {
  components: 'scripts/docs/generate-component-docs.ts', tools: 'scripts/docs/generate-tool-specs.ts',
  claims: 'scripts/docs/generate-forge-claims.ts', api: 'scripts/docs/generate-api-reference.ts',
};
const report = { schemaVersion: 1, missionId: 's196-m05', sourceHead: options.head, runner: { path: 'scripts/product-reality/s196-m05-doc-bites.mjs', sha256: sha256(fs.readFileSync(fileURLToPath(import.meta.url))), node: process.version }, builderSelfCertified: false, sourceIsolation: 'archived-source-and-copied-build-inputs', baselineChecks: [], records: [], allRestoredByteIdentically: false };
function save() { writeJson(path.join(output, 'bites.json'), report); }
function run(record, name, generator, check = true) {
  const command = ['--import', 'tsx', path.join(target, generators[generator]), ...(check ? ['--check'] : [])];
  const result = spawnSync(process.execPath, command, { cwd: target, env: environment, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
  const log = `${record.id}/${name}.log`;
  fs.mkdirSync(path.dirname(path.join(output, log)), { recursive: true });
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`;
  fs.writeFileSync(path.join(output, log), text.replaceAll(target, '<frozen-repository>'));
  const receipt = { name, command: ['node', '--import', 'tsx', generators[generator], ...(check ? ['--check'] : [])], cwd: '<frozen-repository>', exitCode: result.status, signal: result.signal, log };
  record.commands.push(receipt);
  return { ...receipt, text };
}
function green(record, name, generator) { const result = run(record, name, generator); assert.equal(result.exitCode, 0, `${record.id}/${name}: ${result.text}`); }
const baselineRecord = { id: 'baseline', commands: report.baselineChecks };
for (const generator of Object.keys(generators)) green(baselineRecord, generator, generator);
save();

function replaceOnce(before, from, to) {
  assert.equal(before.split(from).length, 2, `Mutation operand must occur exactly once: ${from}`);
  return before.replace(from, to);
}
async function docBite(id, relative, generator, mutate) {
  const file = path.join(target, relative), before = fs.readFileSync(file);
  const mutant = Buffer.from(mutate(before.toString('utf8')));
  assert.notEqual(sha256(before), sha256(mutant));
  const record = { id, kind: 'hand-edited-generated-document', path: relative, beforeSha256: sha256(before), mutatedSha256: sha256(mutant), commands: [], restoredByteIdentically: false };
  let failure;
  try {
    fs.writeFileSync(file, mutant);
    const red = run(record, 'mutated-check', generator);
    assert.equal(red.exitCode, 1, `${id}: hand edit must fail --check`);
    assert.match(red.text, /stale/i, `${id}: failure must identify stale docs, not an import or environment failure`);
    assert(red.text.includes(relative) || (generator === 'api' && red.text.includes('docs/api')), `${id}: red must identify the edited document`);
  } catch (error) { failure = error; record.failure = String(error); }
  finally {
    assert.equal(sha256(fs.readFileSync(file)), sha256(mutant), `${id}: unexpected competing edit in isolated copy`);
    fs.writeFileSync(file, before);
    record.restoredSha256 = sha256(fs.readFileSync(file));
    record.restoredByteIdentically = record.restoredSha256 === record.beforeSha256;
    try { green(record, 'restored-check', generator); } catch (error) { failure ??= error; record.restoreFailure = String(error); }
    record.status = failure ? 'failed' : 'passed';
    report.records.push(record); save();
  }
  if (failure) throw failure;
}

await docBite('component-page', 'docs/components/Button.md', 'components', before => replaceOnce(before, 'Proposed classification: `native`', 'Proposed classification: `alias`'));
await docBite('component-index', 'docs/components/README.md', 'components', before => replaceOnce(before, '109 component pages', '108 component pages'));
await docBite('tool-specs', 'docs/mcp/Tool-Specs.md', 'tools', before => replaceOnce(before, 'The 24 live tools', 'The 25 live tools'));
await docBite('html-claim', 'docs/how-forge-works.html', 'claims', before => replaceOnce(before, 'The trait inventory (45)</h2>', 'The trait inventory (46)</h2>'));
await docBite('connections', 'docs/mcp/Connections.md', 'claims', before => replaceOnce(before, '`default` = 19 auto tools', '`default` = 20 auto tools'));
await docBite('api-page', 'docs/api/design-compose.md', 'api', before => replaceOnce(before, 'default TTL: 30 minutes', 'default TTL: 31 minutes'));
await docBite('server-readme', 'packages/mcp-server/README.md', 'claims', before => replaceOnce(before, '19 tools by default', '20 tools by default'));
await docBite('bridge-readme', 'packages/mcp-bridge/README.md', 'claims', before => replaceOnce(before, '19 tools by default', '20 tools by default'));
await docBite('docs-readme', 'docs/README.md', 'claims', before => replaceOnce(before, 'composes 6 traits', 'composes 7 traits'));
await docBite('root-readme', 'README.md', 'claims', before => replaceOnce(before, '## MCP tool surface (24 tools)', '## MCP tool surface (25 tools)'));

// Preserve valid membership and the unapproved census. One proposal classification
// moves recipe -> native, changing the derived category counts without fake IDs.
const ledgerPath = 'packages/component-contracts/registry/component-capability-ledger.v1.json';
const ledgerFile = path.join(target, ledgerPath), ledgerBefore = fs.readFileSync(ledgerFile);
const ledger = JSON.parse(ledgerBefore);
assert.equal(ledger.approvedRuntimeCensus, null);
const row = ledger.rows.find(value => value.proposedClassification === 'recipe');
assert(row && row.reconciliationState === 'proposed-awaiting-derek-approval');
const countClasses = rows => Object.fromEntries(['native', 'recipe', 'alias'].map(kind => [kind, rows.filter(value => value.proposedClassification === kind).length]));
const beforeCounts = countClasses(ledger.rows);
row.proposedClassification = 'native';
const ledgerMutant = Buffer.from(`${JSON.stringify(ledger, null, 2)}\n`);
const generatedFiles = [...files(path.join(target, 'docs')), path.join(target, 'README.md'), path.join(target, 'packages/mcp-server/README.md'), path.join(target, 'packages/mcp-bridge/README.md')];
const documentBytes = new Map(generatedFiles.map(file => [file, fs.readFileSync(file)]));
const ledgerRecord = { id: 'ledger-classification-counts', kind: 'valid-source-change-requires-regeneration', path: ledgerPath, componentId: row.id, sourceChange: { from: 'recipe', to: 'native', beforeCounts, afterCounts: countClasses(ledger.rows), membership: ledger.rows.length, approvedRuntimeCensus: ledger.approvedRuntimeCensus }, beforeSha256: sha256(ledgerBefore), mutatedSha256: sha256(ledgerMutant), commands: [], restoredByteIdentically: false };
let ledgerFailure;
try {
  fs.writeFileSync(ledgerFile, ledgerMutant);
  for (const generator of ['components', 'claims']) {
    const red = run(ledgerRecord, `${generator}-mutated-check`, generator);
    assert.equal(red.exitCode, 1); assert.match(red.text, /stale/i);
    const regenerated = run(ledgerRecord, `${generator}-regenerate`, generator, false);
    assert.equal(regenerated.exitCode, 0, regenerated.text);
    green(ledgerRecord, `${generator}-regenerated-check`, generator);
  }
  ledgerRecord.changedOutputs = [...documentBytes].filter(([file, before]) => !fs.readFileSync(file).equals(before)).map(([file, before]) => ({ path: path.relative(target, file), beforeSha256: sha256(before), regeneratedSha256: sha256(fs.readFileSync(file)) }));
  assert(ledgerRecord.changedOutputs.some(file => file.path === `docs/components/${row.id}.md`));
  assert(ledgerRecord.changedOutputs.some(file => file.path === 'docs/components/README.md'));
  assert(ledgerRecord.changedOutputs.some(file => file.path === 'docs/how-forge-works.html'));
  assert(fs.readFileSync(path.join(target, 'docs/how-forge-works.html'), 'utf8').includes('25 native, 83 recipe and 1 alias'));
} catch (error) { ledgerFailure = error; ledgerRecord.failure = String(error); }
finally {
  assert.equal(sha256(fs.readFileSync(ledgerFile)), sha256(ledgerMutant));
  fs.writeFileSync(ledgerFile, ledgerBefore);
  for (const [file, before] of documentBytes) fs.writeFileSync(file, before);
  ledgerRecord.restoredByteIdentically = fs.readFileSync(ledgerFile).equals(ledgerBefore) && [...documentBytes].every(([file, before]) => fs.readFileSync(file).equals(before));
  ledgerRecord.restoredSha256 = sha256(fs.readFileSync(ledgerFile));
  for (const generator of ['components', 'claims']) try { green(ledgerRecord, `${generator}-restored-check`, generator); } catch (error) { ledgerFailure ??= error; ledgerRecord.restoreFailure = String(error); }
  ledgerRecord.status = ledgerFailure ? 'failed' : 'passed'; report.records.push(ledgerRecord); save();
}
if (ledgerFailure) throw ledgerFailure;

for (const file of [...tracked, ...built]) assert.equal(sha256(file.symlink ? fs.readlinkSync(path.join(target, file.path)) : fs.readFileSync(path.join(target, file.path))), file.sha256, `Final snapshot differs: ${file.path}`);
report.allRestoredByteIdentically = report.records.every(record => record.restoredByteIdentically);
report.summary = { bites: report.records.length, passed: report.records.filter(record => record.status === 'passed').length, failed: report.records.filter(record => record.status === 'failed').length, checkedTrackedFiles: tracked.length, checkedBuiltFiles: built.length };
save();
console.log(JSON.stringify({ ...report.summary, allRestoredByteIdentically: report.allRestoredByteIdentically }));
