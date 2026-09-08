import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Fastify from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { readBuildRevision, registerBridgeHealth, type BridgeHealthResponse } from './health.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const directories: string[] = [];
const temp = () => { const dir = mkdtempSync(path.join(tmpdir(), 'oods-build-stamp-')); directories.push(dir); return dir; };
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
const toolset = { mode: 'auto', enabledCount: 20, registrySource: 'src/tools/registry.json' };
describe('packaged bridge health revision', () => {
  it('reports the packaged build and never follows later stamp changes', async () => {
    const stamp = pathToFileURL(path.join(temp(), 'revision.json'));
    const revision = { commit: 'a'.repeat(40), structuredDataManifestHash: `sha256:${'b'.repeat(64)}` };
    writeFileSync(stamp, JSON.stringify(revision));
    const server = Fastify(); registerBridgeHealth(server, toolset, stamp);
    writeFileSync(stamp, JSON.stringify({ ...revision, commit: 'c'.repeat(40) }));
    try { expect((await server.inject('/health')).json<BridgeHealthResponse>()).toEqual({ status: 'ok', bridge: 'ready', toolset, revision }); }
    finally { await server.close(); }
  });
  it('keeps an unstamped development build healthy with the typed optional revision absent', async () => {
    const stamp = pathToFileURL(path.join(temp(), 'missing.json'));
    expect(readBuildRevision(stamp)).toBeUndefined();
    const server = Fastify(); registerBridgeHealth(server, toolset, stamp);
    try { const response = await server.inject('/health'); expect(response.statusCode).toBe(200); expect(response.json<BridgeHealthResponse>()).toEqual({ status: 'ok', bridge: 'ready', toolset }); }
    finally { await server.close(); }
  });
  it('fails loudly on a malformed stamp instead of claiming an unstamped build', () => {
    const stamp = pathToFileURL(path.join(temp(), 'bad.json')); writeFileSync(stamp, JSON.stringify({ commit: 'unknown' }));
    expect(() => readBuildRevision(stamp)).toThrow('Invalid packaged build revision');
  });
  it('stamps the exact git commit and manifest bytes using the shared server/bridge build step', () => {
    const output = path.join(temp(), 'build-revision.json');
    execFileSync(process.execPath, [path.join(root, 'scripts/build-revision.mjs'), output], { cwd: root });
    expect(readBuildRevision(pathToFileURL(output))).toEqual({
      commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      structuredDataManifestHash: `sha256:${createHash('sha256').update(readFileSync(path.join(root, 'artifacts/structured-data/manifest.json'))).digest('hex')}`,
    });
  });
});
