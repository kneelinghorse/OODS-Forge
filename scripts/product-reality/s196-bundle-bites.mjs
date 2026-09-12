#!/usr/bin/env node
/** Four physical mutations of independent m02 extractions; no source/build mutations. */
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARCHIVE_HEAD = '2d80ae017184b6a28d4b2d7a2bb02649a5c33718';
const ARCHIVE_SHA256 = '4ff4aeb05e5ba937b61d2062fcce2eb4d0d41fc1b3001ae07b472cb2c2663bba';
const ARCHIVE_BYTES = 32448215;
const FIXTURES = 'packages/mcp-server/test/fixtures/portable-runtime';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanEnv = () => ({ PATH: process.env.PATH ?? '', LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: 'UTC', NODE_ENV: 'production', NO_COLOR: '1' });

function options(args) {
  const result = { archive: '/tmp/forge-s196-m02-final-out-1/forge-runtime.tar.gz', out: path.join(ROOT, 'artifacts/product-reality/sprint-196/m05/bundle-bites') };
  let execute = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--execute') execute = true;
    else if (args[index] === '--archive' || args[index] === '--out') {
      const key = args[index].slice(2), value = args[++index];
      assert(value && !value.startsWith('--'), `Missing value for --${key}`);
      result[key] = path.resolve(value);
    } else throw new Error(`Unknown argument: ${args[index]}`);
  }
  assert(execute, 'Use --execute to run the four owned-extraction mutations');
  return result;
}

async function main() {
  const args = options(process.argv.slice(2));
  assert(!fs.existsSync(args.out), 'Receipt output already exists; use a new --out to retain earlier failures');
  const archive = await fsp.readFile(args.archive);
  assert.equal(archive.length, ARCHIVE_BYTES, 'The exact m02 archive is required');
  assert.equal(hash(archive), ARCHIVE_SHA256, 'The exact m02 archive is required');
  await fsp.mkdir(args.out, { recursive: true });
  const arena = await fsp.mkdtemp(path.join(os.tmpdir(), 'forge-s196-m05-bundle-bites-'));
  const helperHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const report = {
    schemaVersion: 1, missionId: 's196-m05', runId: randomUUID(), status: 'running', builderSelfCertified: false,
    startedAt: new Date().toISOString(), command: [process.execPath, ...process.argv.slice(1)], cwd: ROOT,
    archive: { path: args.archive, sha256: ARCHIVE_SHA256, bytes: ARCHIVE_BYTES, head: ARCHIVE_HEAD },
    helperHead, nodeVersion: process.version, arena, childEnvironment: cleanEnv(),
    methodology: 'Each bite owns a separate extraction of the same exact m02 archive. Historical m02 E2E and fixtures are pinned to the archive head; targeted probes use the current committed McpClient helper. Taxonomy corruption is observed natively, while actual E2E rejects it earlier at manifest verification. No manifest is resealed, no production checks are weakened, and no later release ledger is injected.',
    helpers: [], commands: [], records: [],
  };
  const write = async (relative, value) => {
    const file = path.join(args.out, relative);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + '\n');
    return relative;
  };
  const save = () => write('bites.json', report);
  const evidence = async relative => {
    const bytes = await fsp.readFile(path.join(args.out, relative));
    return { path: relative, sha256: hash(bytes), bytes: bytes.length };
  };
  const pin = async (head, source, destination) => {
    const bytes = execFileSync('git', ['show', `${head}:${source}`], { cwd: ROOT, maxBuffer: 8 * 1024 * 1024 });
    await write(destination, bytes);
    report.helpers.push({ head, source, gitCommand: ['git', 'show', `${head}:${source}`], ...await evidence(destination) });
  };
  for (const [head, directory] of [[ARCHIVE_HEAD, 'm02'], [helperHead, 'current']]) {
    for (const file of ['e2e.mjs', 'manifest.mjs']) await pin(head, `scripts/runtime/${file}`, `helpers/${directory}/${file}`);
  }
  const fixtureRoot = path.join(args.out, 'helpers/fixtures');
  const fixtureFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', ARCHIVE_HEAD, '--', FIXTURES], { cwd: ROOT }).toString().split('\0').filter(Boolean);
  assert(fixtureFiles.length > 19);
  for (const file of fixtureFiles) await pin(ARCHIVE_HEAD, file, `helpers/fixtures/${file}`);
  const { verifyEmbeddedManifest, treeDigest } = await import(pathToFileURL(path.join(args.out, 'helpers/current/manifest.mjs')).href);
  const { McpClient } = await import(pathToFileURL(path.join(args.out, 'helpers/current/e2e.mjs')).href);
  const historicalE2E = path.join(args.out, 'helpers/m02/e2e.mjs');
  await save();

  async function run(id, name, command, commandArgs, cwd, timeoutMs = 300000) {
    const prefix = `${id}/${name}`;
    await fsp.mkdir(path.join(args.out, id), { recursive: true });
    const stdout = fs.createWriteStream(path.join(args.out, `${prefix}.stdout.log`));
    const stderr = fs.createWriteStream(path.join(args.out, `${prefix}.stderr.log`));
    const entry = { name, command: [command, ...commandArgs], cwd, environment: cleanEnv(), startedAt: new Date().toISOString(), stdout: `${prefix}.stdout.log`, stderr: `${prefix}.stderr.log`, timedOut: false, forcedKill: false };
    const child = spawn(command, commandArgs, { cwd, env: cleanEnv(), detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    entry.pid = child.pid;
    child.stdout.pipe(stdout); child.stderr.pipe(stderr);
    let force;
    const timer = setTimeout(() => {
      entry.timedOut = true;
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already closed. */ }
      force = setTimeout(() => { entry.forcedKill = true; try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Already closed. */ } }, 3000);
    }, timeoutMs);
    const ended = await new Promise(resolve => {
      child.once('error', error => { entry.spawnError = String(error); });
      child.once('close', (code, signal) => resolve({ code, signal }));
    });
    clearTimeout(timer); clearTimeout(force);
    await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
    Object.assign(entry, ended, { completedAt: new Date().toISOString() });
    entry.stdoutEvidence = await evidence(entry.stdout); entry.stderrEvidence = await evidence(entry.stderr);
    report.commands.push(entry); await save();
    return { ...entry, text: await fsp.readFile(path.join(args.out, entry.stdout), 'utf8'), errorText: await fsp.readFile(path.join(args.out, entry.stderr), 'utf8') };
  }

  async function verify(record, phase) {
    try {
      const result = await verifyEmbeddedManifest(record.extraction);
      const proof = { status: 'pass', manifest: result.manifest, payload: result.payload };
      await write(`${record.id}/${phase}-manifest.json`, proof);
      return proof;
    } catch (error) {
      const proof = { status: 'rejected', name: error.name, code: error.code, message: error.message, stack: error.stack };
      await write(`${record.id}/${phase}-manifest.json`, proof);
      return proof;
    }
  }

  async function e2e(record, phase, expected) {
    const result = await run(record.id, `${phase}-e2e`, process.execPath, [historicalE2E, '--extract-dir', record.extraction, '--repo-root', fixtureRoot], arena);
    if (expected === 'pass') {
      assert.equal(result.code, 0, result.errorText);
      const proof = JSON.parse(result.text);
      assert.equal(proof.status, 'pass');
      assert.equal(proof.manifest.commit, ARCHIVE_HEAD);
      assert.equal(proof.calls.totalAcrossProcesses, 30);
      assert.equal(proof.extractionTree.unchanged, true);
      assert.equal(proof.lifecycle.stdinClose.exited, true);
      assert.equal(proof.lifecycle.stdinClose.code, 0);
      assert.equal(proof.lifecycle.restart.sigterm.forcedKill, false);
      const outcomes = Object.values(proof.calls.outcomes);
      assert.equal(outcomes.filter(row => row.outcome === 'pass').length, 17);
      assert.equal(outcomes.filter(row => row.outcome === 'typed').length, 2);
      await write(`${record.id}/${phase}-e2e.json`, proof);
    } else {
      assert.equal(result.code, 1);
      assert.match(result.errorText, /embedded payload tree digest mismatch/);
      record.e2eRejectionBoundary = 'Manifest verification before adapter/health startup; the separate native health probe records taxonomy degradation.';
    }
  }

  async function native(record, phase, operation) {
    const prefix = `${record.id}/${phase}-native`;
    const adapterPath = path.join(record.extraction, 'packages/mcp-adapter/index.js');
    const cwd = path.dirname(adapterPath);
    const client = new McpClient({ adapterPath, cwd, env: cleanEnv() });
    const stdout = fs.createWriteStream(path.join(args.out, `${prefix}.stdout.log`));
    const stderr = fs.createWriteStream(path.join(args.out, `${prefix}.stderr.log`));
    client.child.stdout.on('data', data => stdout.write(data));
    client.child.stderr.on('data', data => stderr.write(data));
    const requests = [];
    const request = async (method, params) => {
      requests.push({ method, params });
      return client.request(method, params);
    };
    const entry = { command: [process.execPath, adapterPath], cwd, environment: cleanEnv(), pid: client.child.pid, startedAt: new Date().toISOString() };
    let failed;
    try {
      const initialized = await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 's196-bundle-bite', version: '1.0.0' } });
      assert.equal(initialized.serverInfo.version, '0.3.0');
      client.notify('notifications/initialized'); requests.push({ method: 'notifications/initialized' });
      const call = async (name, arguments_) => {
        const response = await request('tools/call', { name, arguments: arguments_ });
        assert.equal(response.isError, undefined, JSON.stringify(response));
        assert.equal(response.content[0].type, 'text');
        return JSON.parse(response.content[0].text);
      };
      const result = await operation(call);
      await write(`${prefix}.json`, result);
      return result;
    } catch (error) { failed = error; entry.failure = String(error); throw error; }
    finally {
      entry.stdinClose = await client.closeStdinAndObserve();
      if (!entry.stdinClose.exited) entry.termination = await client.terminate('SIGTERM');
      entry.completedAt = new Date().toISOString();
      await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
      await write(`${prefix}.requests.json`, requests); await write(`${prefix}.lifecycle.json`, entry);
      record.children.push({ ...entry, stdout: `${prefix}.stdout.log`, stderr: `${prefix}.stderr.log`, requests: `${prefix}.requests.json` });
      if (!failed) {
        assert.equal(entry.stdinClose.exited, true, 'Adapter must close without a forced kill');
        assert.equal(entry.stdinClose.code, 0);
        assert.equal(entry.stdinClose.signal, null);
      }
    }
  }

  async function portOpen(port) {
    return new Promise(resolve => {
      const socket = net.connect({ port, host: '127.0.0.1' });
      const finish = result => { socket.destroy(); resolve(result); };
      socket.once('connect', () => finish(true)); socket.once('error', () => finish(false));
      socket.setTimeout(1000, () => finish(false));
    });
  }
  async function bridge(record, phase, missing) {
    const reservation = net.createServer();
    await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
    const port = reservation.address().port;
    await new Promise(resolve => reservation.close(resolve));
    const prefix = `${record.id}/${phase}-bridge`;
    const cwd = path.join(record.extraction, 'packages/mcp-bridge');
    const environment = { ...cleanEnv(), MCP_BRIDGE_PORT: String(port), BRIDGE_TOKEN: 's196-bite-owned-token' };
    const child = spawn(process.execPath, ['dist/server.js'], { cwd, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = fs.createWriteStream(path.join(args.out, `${prefix}.stdout.log`));
    const stderr = fs.createWriteStream(path.join(args.out, `${prefix}.stderr.log`));
    child.stdout.pipe(stdout); child.stderr.pipe(stderr);
    const exited = new Promise((resolve, reject) => { child.once('error', reject); child.once('close', (code, signal) => resolve({ code, signal })); });
    const proof = { command: [process.execPath, 'dist/server.js'], cwd, environment, pid: child.pid, port, startedAt: new Date().toISOString(), forcedKill: false };
    try {
      if (missing) {
        proof.exit = await Promise.race([exited, delay(15000).then(() => null)]);
        assert(proof.exit, 'Missing policy must refuse promptly');
        assert.equal(proof.exit.code, 1);
      } else {
        for (const deadline = Date.now() + 15000; Date.now() < deadline;) {
          try {
            const response = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1000) });
            if (response.ok) { proof.health = await response.json(); break; }
          } catch { /* Poll only this owned bridge. */ }
          assert.equal(child.exitCode, null, 'Bridge exited before becoming healthy');
          await delay(100);
        }
        assert(proof.health, 'Restored bridge must listen');
        assert.equal(proof.health.revision.commit, ARCHIVE_HEAD);
        child.kill('SIGTERM');
        proof.exit = await Promise.race([exited, delay(3000).then(() => null)]);
        assert(proof.exit, 'Bridge must terminate cleanly');
        assert(proof.exit.code === 0 || proof.exit.signal === 'SIGTERM');
      }
    } finally {
      if (child.exitCode === null && child.signalCode === null) { proof.forcedKill = true; child.kill('SIGKILL'); }
      proof.exit ??= await exited;
      await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
      proof.listenerAbsent = !await portOpen(port); proof.completedAt = new Date().toISOString();
      proof.stdout = `${prefix}.stdout.log`; proof.stderr = `${prefix}.stderr.log`;
      await write(`${prefix}.json`, proof); record.children.push(proof);
    }
    assert.equal(proof.listenerAbsent, true);
    assert.equal(proof.forcedKill, false);
    if (missing) assert.match(await fsp.readFile(path.join(args.out, `${prefix}.stderr.log`), 'utf8'), /BRIDGE_POLICY_MISSING.*startup refused/);
  }

  async function bite(id, relative, mutate, baseline, disabled, restored) {
    const extraction = path.join(arena, id);
    await fsp.mkdir(extraction);
    const record = { id, extraction, path: relative, status: 'running', children: [], restoredByteIdentically: false };
    report.records.push(record); await save();
    const extracted = await run(id, 'extract', 'tar', ['-xzf', args.archive, '-C', extraction], arena, 60000);
    assert.equal(extracted.code, 0, extracted.errorText);
    const originalManifest = await verify(record, 'before'); assert.equal(originalManifest.status, 'pass');
    assert.equal(originalManifest.manifest.commit, ARCHIVE_HEAD);
    record.treeBefore = await treeDigest(extraction);
    const file = path.join(extraction, relative), before = await fsp.readFile(file), mode = (await fsp.stat(file)).mode & 0o777;
    const afterMutation = mutate(before);
    assert(afterMutation === null || !before.equals(afterMutation));
    record.fileBefore = { sha256: hash(before), bytes: before.length, mode };
    record.mutatedFile = afterMutation === null ? { absent: true } : { sha256: hash(afterMutation), bytes: afterMutation.length, mode };
    await write(`${id}/file-before`, before);
    if (afterMutation !== null) await write(`${id}/file-mutated`, afterMutation);
    const ownedPaths = ['.oods/s194-e2e', 'artifacts/current-state'];
    const oodsExisted = fs.existsSync(path.join(extraction, '.oods'));
    assert(ownedPaths.every(relative => !fs.existsSync(path.join(extraction, relative))));
    let failure;
    try {
      await baseline(record);
      assert.deepEqual(await treeDigest(extraction), record.treeBefore, 'Baseline probe changed the shipped tree');
      if (afterMutation === null) await fsp.unlink(file); else await fsp.writeFile(file, afterMutation);
      record.treeMutated = await treeDigest(extraction);
      assert.notEqual(record.treeMutated.sha256, record.treeBefore.sha256);
      await disabled(record);
    } catch (error) { failure = error; record.failure = error.stack ?? String(error); }
    finally {
      if (!fs.existsSync(file)) assert.equal(afterMutation, null, 'Unexpected deletion during owned bite');
      else {
        const current = await fsp.readFile(file);
        assert(current.equals(before) || (afterMutation !== null && current.equals(afterMutation)), 'Unexpected concurrent edit inside owned extraction');
      }
      await fsp.writeFile(file, before, { mode }); await fsp.chmod(file, mode);
      // The historical E2E cleans on success, but may leave only these owned paths on failure.
      for (const relative of ownedPaths) await fsp.rm(path.join(extraction, relative), { recursive: true, force: true });
      if (!oodsExisted && fs.existsSync(path.join(extraction, '.oods'))) await fsp.rmdir(path.join(extraction, '.oods'));
      try {
        record.treeRestoredBeforeProbe = await treeDigest(extraction);
        assert.deepEqual(record.treeRestoredBeforeProbe, record.treeBefore);
        await restored(record);
        record.treeAfter = await treeDigest(extraction);
        assert.deepEqual(record.treeAfter, record.treeBefore);
        const validation = await verify(record, 'restored'); assert.equal(validation.status, 'pass');
        record.restoredByteIdentically = before.equals(await fsp.readFile(file));
        assert(record.restoredByteIdentically);
      } catch (error) { failure ??= error; record.restoreFailure = error.stack ?? String(error); }
      record.status = failure ? 'failed' : 'passed';
      await write(`${id}/record.json`, record); await save();
    }
    if (failure) throw failure;
    console.log(`${id}: red observed; restored byte-identically and green`);
  }

  const textSchema = { version: '2026.09', screens: [{ id: 'text', component: 'Text', props: { content: 'Pinned portable readiness bite' } }] };
  async function generated(record, phase, refused) {
    const outputs = await native(record, phase, async call => {
      const responses = {};
      for (const framework of ['react', 'vue']) responses[framework] = await call('code_generate', { framework, profile: 'build', schema: textSchema });
      return responses;
    });
    const { validateGeneratedArtifact } = await import(pathToFileURL(path.join(record.extraction, 'packages/mcp-server/dist/codegen/artifact-envelope.js')).href);
    for (const [framework, response] of Object.entries(outputs)) {
      if (refused) {
        assert.equal(response.status, 'error'); assert.equal(response.artifact, undefined);
        assert(response.errors.some(error => error.code === 'OODS-N015' && error.message.includes('attestation-invalid')));
      } else {
        assert.equal(response.status, 'ok'); assert.equal(response.artifact.framework, framework);
        assert.deepEqual(validateGeneratedArtifact(response.artifact), []);
        assert(response.artifact.files.some(file => framework === 'react' ? file.path.endsWith('.tsx') : file.path.endsWith('.vue')));
        if (phase === 'baseline') (record.baselineArtifacts ??= {})[framework] = response.artifact.contentHash;
        else assert.equal(response.artifact.contentHash, record.baselineArtifacts[framework]);
      }
    }
  }
  try {
    await bite('dist-integrity', 'packages/mcp-server/dist/tools/health.js', bytes => Buffer.concat([bytes, Buffer.from('\n// s196 owned integrity mutation\n')]),
      async () => {}, async record => {
        const red = await verify(record, 'mutated'); assert.equal(red.status, 'rejected'); assert.match(red.message, /embedded payload tree digest mismatch/);
      }, async () => {});
    await bite('taxonomy-health', 'packages/mcp-server/dist/registry/viz-taxonomy.v1.json', bytes => {
      const value = JSON.parse(bytes); assert.equal(value.summary.classified, 34); value.summary.classified++;
      return Buffer.from(JSON.stringify(value, null, 2) + '\n');
    }, record => e2e(record, 'baseline', 'pass'), async record => {
      const health = await native(record, 'mutated', call => call('health', {}));
      assert.equal(health.status, 'degraded'); assert.equal(health.productReality.viz, null);
      assert(health.warnings.some(warning => warning.includes('Viz taxonomy rejected: summary differs')));
      await e2e(record, 'mutated', 'rejected');
    }, async record => {
      const health = await native(record, 'restored', call => call('health', {}));
      assert.equal(health.status, 'ok'); assert.equal(health.productReality.viz.classified, 34);
      await e2e(record, 'restored', 'pass');
    });
    await bite('bridge-policy', 'configs/agent/policy.json', () => null,
      record => bridge(record, 'baseline', false), record => bridge(record, 'mutated', true), record => bridge(record, 'restored', false));
    await bite('readiness-attestation', 'packages/mcp-server/dist/registry/readiness-attestation.v1.json', bytes => {
      const value = JSON.parse(bytes); value.sha256 = (value.sha256[0] === '0' ? '1' : '0') + value.sha256.slice(1);
      return Buffer.from(JSON.stringify(value, null, 2) + '\n');
    }, record => generated(record, 'baseline', false), record => generated(record, 'mutated', true), record => generated(record, 'restored', false));
    assert.equal(hash(await fsp.readFile(args.archive)), ARCHIVE_SHA256, 'Original archive changed');
    report.status = 'passed';
  } catch (error) { report.status = 'failed'; report.failure = error.stack ?? String(error); process.exitCode = 1; }
  finally {
    report.completedAt = new Date().toISOString();
    report.summary = { bites: report.records.length, passed: report.records.filter(row => row.status === 'passed').length, failed: report.records.filter(row => row.status !== 'passed').length, restored: report.records.filter(row => row.restoredByteIdentically).length };
    report.driver = { path: path.relative(ROOT, fileURLToPath(import.meta.url)), sha256: hash(await fsp.readFile(fileURLToPath(import.meta.url))), committed: false };
    await save();
  }
  console.log(JSON.stringify({ status: report.status, ...report.summary, report: path.join(args.out, 'bites.json') }));
}

main().catch(error => { console.error(error.stack ?? error); process.exitCode = 1; });
