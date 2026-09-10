import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const base = path.resolve('artifacts/product-reality/sprint-191/m04');
const { source, root, head } = JSON.parse(fs.readFileSync(path.join(base, 'runtime-location.json'), 'utf8'));
const { treeDigest, canonicalJson, verifyEmbeddedManifest } = await import(pathToFileURL(path.join(source, 'scripts/runtime/manifest.mjs')).href);
const hash = value => createHash('sha256').update(value).digest('hex');
const json = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
const run = (command, args, log, expected = 0) => {
  const result = spawnSync(command, args, { cwd: source, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: { ...process.env, GNU_TAR: '/opt/homebrew/bin/gtar' } });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  fs.writeFileSync(path.join(base, log), output);
  assert.equal(result.status, expected, `${log}: expected exit ${expected}, received ${result.status}; ${output.slice(-2500)}`);
  return { command: [command, ...args], exitCode: result.status, log, logSha256: hash(output), stdout: result.stdout ?? '', output };
};
const clean = () => {
  assert.equal(spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).stdout.trim(), head);
  assert.equal(spawnSync('git', ['status', '--porcelain=v1'], { cwd: source, encoding: 'utf8' }).stdout, '');
};
clean();
json(path.join(base, 'runtime-versions.json'), { head, node: process.version, pnpm: spawnSync('pnpm', ['--version'], { encoding: 'utf8' }).stdout.trim(), gnuTar: spawnSync('/opt/homebrew/bin/gtar', ['--version'], { encoding: 'utf8' }).stdout.split('\n')[0] });
// Inject only staged fixtures before the actual scan; keep its production predicate unchanged.
const assemblerPath = path.join(source, 'scripts/runtime/assemble.mjs');
const assembler = fs.readFileSync(assemblerPath, 'utf8');
const bitePath = path.join(source, 'scripts/runtime/s191-boundary-bite.mjs');
const scan = '  await scanPayload(payloadRoot, { workRoot: args.workDir });';
assert.equal(assembler.split(scan).length, 2);
const injection = `  for (const file of ['index.js', 'sanitize-schema.js']) await fsp.appendFile(path.join(payloadRoot, 'packages/mcp-adapter', file), "\\n// S191 staged boundary sentinel: 'cmos'\\n");\n`;
let negative;
try {
  fs.writeFileSync(bitePath, assembler.replace(scan, injection + scan));
  fs.mkdirSync(path.join(base, 'adapter-boundary'), { recursive: true });
  fs.writeFileSync(path.join(base, 'adapter-boundary/injection.txt'), injection);
  negative = run(process.execPath, [bitePath, '--out-dir', path.join(root, 'negative-out'), '--work-dir', path.join(root, 'negative-work')], 'adapter-boundary/selected-red.log', 1);
  assert(negative.output.includes('quoted cmos path segment in bundled executable JS'));
  for (const file of ['index.js', 'sanitize-schema.js']) assert(negative.output.includes(`packages/mcp-adapter/${file}`));
} finally { fs.rmSync(bitePath, { force: true }); }
assert.equal(hash(fs.readFileSync(assemblerPath)), hash(assembler));
clean();
console.log('Adapter boundary: both staged sentinel files rejected, original source intact.');
const assemblies = [];
for (const index of [1, 2]) {
  const result = run(process.execPath, [assemblerPath, '--out-dir', path.join(root, `out-${index}`), '--work-dir', path.join(root, `work-${index}`), '--final'], `assemble-${index}.log`);
  assemblies.push({ ...result, stdout: undefined, output: undefined });
  clean(); console.log(`Clean final assembly ${index} passed.`);
}
const first = path.join(root, 'out-1');
const manifest = JSON.parse(fs.readFileSync(path.join(first, 'forge-runtime.manifest.json'), 'utf8'));
assert.equal(manifest.commit, head); assert.equal(manifest.dirty, false);
assert.equal(manifest.thirdPartyCount, 245); assert.equal(manifest.archivePacking.determinismCertified, true);
const sidecar = fs.readFileSync(path.join(first, 'forge-runtime.tar.gz.sha256'), 'utf8');
assert.equal(sidecar, fs.readFileSync(path.join(root, 'out-2/forge-runtime.tar.gz.sha256'), 'utf8'));
const archiveSha256 = hash(fs.readFileSync(path.join(first, 'forge-runtime.tar.gz')));
assert(sidecar.startsWith(archiveSha256));
json(path.join(base, 'adapter-boundary/receipt.json'), { head, predicateSourceSha256: hash(assembler), injected: ['packages/mcp-adapter/index.js', 'packages/mcp-adapter/sanitize-schema.js'], negative: { ...negative, stdout: undefined, output: undefined }, restoredSourceSha256: hash(fs.readFileSync(assemblerPath)), positive: assemblies[0] });
const extracted = path.join(root, 'extracted'); fs.mkdirSync(extracted);
run('/opt/homebrew/bin/gtar', ['-xzf', path.join(first, 'forge-runtime.tar.gz'), '-C', extracted], 'extract.log');
await verifyEmbeddedManifest(extracted);
const schemaPath = path.join(extracted, 'packages/mcp-server/dist/schemas/component-schema.json');
const manifestPath = path.join(extracted, 'forge-runtime.manifest.json');
const schemaBytes = fs.readFileSync(schemaPath), manifestBytes = fs.readFileSync(manifestPath);
const e2ePath = path.join(source, 'scripts/runtime/e2e.mjs');
const e2e = fs.readFileSync(e2ePath, 'utf8');
const observerPath = path.join(source, 'scripts/runtime/s191-missing-schema-observer.mjs');
const listSite = '    await initializeAndList(primary, adapterPackage.version, expectedToolNames);';
const errorSite = '    if (result?.isError) {';
assert.equal(e2e.split(listSite).length, 2); assert.equal(e2e.split(errorSite).length, 2);
const observedE2e = e2e.replace(listSite, '    const listedProof = await initializeAndList(primary, adapterPackage.version, expectedToolNames);\n    process.stdout.write(JSON.stringify({ s191: "tools-list", names: listedProof.names }) + "\\n");')
  .replace(errorSite, errorSite + '\n      process.stdout.write(JSON.stringify({ s191: "tool-error", name, result }) + "\\n");');
let broken, brokenManifest, events;
fs.mkdirSync(path.join(base, 'B-15'), { recursive: true });
try {
  fs.unlinkSync(schemaPath);
  brokenManifest = { ...manifest };
  const payload = await treeDigest(extracted, { exclude: ['forge-runtime.manifest.json'] });
  brokenManifest.payloadTreeSha256 = payload.sha256; brokenManifest.payloadTreeEntryCount = payload.entryCount;
  fs.writeFileSync(manifestPath, canonicalJson(brokenManifest));
  await verifyEmbeddedManifest(extracted); // The corrected recipe must reach the client.
  fs.writeFileSync(observerPath, observedE2e);
  fs.writeFileSync(path.join(base, 'B-15/observer.patch'), spawnSync('diff', ['-u', e2ePath, observerPath], { encoding: 'utf8' }).stdout);
  broken = run(process.execPath, [observerPath, '--extract-dir', extracted, '--repo-root', source], 'B-15/selected-red.log', 1);
  events = broken.stdout.split('\n').filter(line => line.startsWith('{"s191":')).map(line => JSON.parse(line));
  assert.equal(events[0].s191, 'tools-list'); assert.equal(events[0].names.length, manifest.registry.autoCount);
  assert.equal(events[1].s191, 'tool-error'); assert.equal(events[1].name, 'health');
  assert.equal(events[1].result.isError, true); assert(JSON.stringify(events[1].result).includes('Native MCP server exited'));
} finally {
  fs.writeFileSync(schemaPath, schemaBytes); fs.writeFileSync(manifestPath, manifestBytes); fs.rmSync(observerPath, { force: true });
}
const restored = await verifyEmbeddedManifest(extracted);
assert.equal(restored.payload.sha256, manifest.payloadTreeSha256); clean();
const green = run(process.execPath, [e2ePath, '--extract-dir', extracted, '--repo-root', source], 'B-15/restored-green.log');
json(path.join(base, 'B-15/receipt.json'), { head, removed: 'packages/mcp-server/dist/schemas/component-schema.json', schemaSha256: hash(schemaBytes), before: { payloadTreeSha256: manifest.payloadTreeSha256, entries: manifest.payloadTreeEntryCount }, repinned: { payloadTreeSha256: brokenManifest.payloadTreeSha256, entries: brokenManifest.payloadTreeEntryCount }, toolsList: events[0], firstCall: events[1], negative: { ...broken, stdout: undefined, output: undefined }, restored: { ...green, stdout: undefined, output: undefined, schemaSha256: hash(fs.readFileSync(schemaPath)), manifestSha256: hash(fs.readFileSync(manifestPath)), payloadTreeSha256: restored.payload.sha256 }, observation: 'Existing e2e flow and manifest guard unchanged; two stdout-only hooks retain tools/list names and the isError response before the existing throw. observer.patch records both hooks.' });
const durable = path.resolve('artifacts/current-state/2026-09-10/portable-runtime/m04'); fs.mkdirSync(durable, { recursive: true });
for (const file of ['forge-runtime.tar.gz', 'forge-runtime.tar.gz.sha256', 'forge-runtime.manifest.json', 'runtime-sbom-lite.json']) fs.copyFileSync(path.join(first, file), path.join(durable, file));
json(path.join(base, 'runtime-proof.json'), { status: 'passed', head, sourceClean: true, GNU_TAR: '/opt/homebrew/bin/gtar', assemblies, archiveSha256, payloadTreeSha256: manifest.payloadTreeSha256, dirty: manifest.dirty, thirdPartyCount: manifest.thirdPartyCount, manifest: path.relative(process.cwd(), path.join(durable, 'forge-runtime.manifest.json')), restoredE2e: green.log, toolsListCount: events[0].names.length, builderSelfCertified: false });
console.log(`Runtime proof passed: equal certified archives, ${manifest.thirdPartyCount} dependencies; tools/list ${events[0].names.length}, removed-schema first call red, restored E2E green.`);
