import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { getAjv } from '../../src/lib/ajv.js';
import { resolvePreviewStoreDir } from '../../src/lib/preview-store.js';
import { getDefinition } from '../../src/errors/registry.js';
import outputSchema from '../../src/schemas/design.preview.output.json' with { type: 'json' };
import { handle as preview, resolvePreviewHostUrl } from '../../src/tools/design.preview.js';

const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const runtimeDir = path.join(root, 'packages/mcp-bridge/dist/preview-runtime');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
let storeRoot: string;
const servers: FastifyInstance[] = [];

async function host(previewsDir: string): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { previewsDir, runtimeDir });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  return `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
}

beforeEach(() => {
  storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-design-preview-'));
  vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot);
  vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas');
  vi.stubEnv('OODS_PREVIEW_HOST_URL', '');
});
afterEach(async () => {
  vi.unstubAllEnvs();
  for (const server of servers.splice(0)) await server.close();
  fs.rmSync(storeRoot, { recursive: true, force: true });
});

describe('design.preview serves the generated app through the preview host (s201-m01)', () => {
  it('composes, generates both frameworks, stores the record beside the schema store and returns one running URL per framework', async () => {
    const previewsDir = resolvePreviewStoreDir();
    expect(previewsDir).toBe(path.join(storeRoot, 'previews'));
    const hostUrl = await host(previewsDir);
    const result = await preview({ object: 'Subscription', context: 'card', preferences: { theme: 'dark', brand: 'B' } }, { previewHostUrl: hostUrl });
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    expect(result).toMatchObject({ status: 'ok', brand: 'B', theme: 'dark', host: { url: hostUrl, port: Number(new URL(hostUrl).port), previewsDir } });
    expect(result.key).toBe(result.schemaHash.slice(7, 23));
    expect(result.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    expect(result.previewUrl).toBe(`${hostUrl}/preview/${result.key}?framework=react`);
    // The record is what the host reads: same key, same artifacts, the deterministic model, no schema saved.
    expect(result.recordPath).toBe(path.join(previewsDir, `${result.key}.json`));
    const record = JSON.parse(fs.readFileSync(result.recordPath, 'utf8'));
    expect(record).toMatchObject({ version: '1', key: result.key, schemaHash: result.schemaHash, brand: 'B', theme: 'dark', compose: { object: 'Subscription', context: 'card' } });
    expect(Object.keys(record.frameworks).sort()).toEqual(['react', 'vue']);
    expect(record.model).toHaveProperty('planName');
    expect(fs.existsSync(path.join(storeRoot, 'schemas'))).toBe(false);
    for (const entry of result.previews) {
      expect(entry.artifactContentHash).toBe(record.frameworks[entry.framework].artifact.contentHash);
      const page = await fetch(entry.url);
      expect(page.status).toBe(200);
      const html = await page.text();
      expect(html).toContain('<html lang="en" data-theme="dark" data-brand="B">');
      expect(html).toContain(`data-oods-preview="${result.key}"`);
      const module = await fetch(entry.moduleUrl);
      expect(module.status).toBe(200);
      const code = await module.text();
      expect(`sha256:${sha256(code)}`).toBe(entry.compiled.sha256);
      expect(Buffer.byteLength(code)).toBe(entry.compiled.bytes);
    }
  });

  it('serves one framework when asked and keeps the record keyed by the schema hash', async () => {
    const hostUrl = await host(resolvePreviewStoreDir());
    const vue = await preview({ object: 'Subscription', context: 'card', framework: 'vue' }, { previewHostUrl: hostUrl });
    expect(vue.previews.map(entry => entry.framework)).toEqual(['vue']);
    expect(vue.previewUrl).toContain('framework=vue');
    expect((await fetch(`${hostUrl}/preview/${vue.key}?framework=react`)).status).toBe(404);
    const both = await preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: hostUrl });
    expect(both.key).toBe(vue.key);
    expect((await fetch(`${hostUrl}/preview/${vue.key}?framework=react`)).status).toBe(200);
  });

  it('is typed OODS-N021 and retryable without a reachable host, and writes nothing', async () => {
    expect(resolvePreviewHostUrl(undefined, {})).toBeUndefined();
    expect(resolvePreviewHostUrl({ previewHostUrl: 'http://127.0.0.1:4466' }, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:4466');
    expect(resolvePreviewHostUrl(undefined, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:1');
    await expect(preview({ object: 'Subscription', context: 'card' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { dependency: 'preview-host', hostUrl: null } });
    await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: 'http://127.0.0.1:1' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostUrl: 'http://127.0.0.1:1' } });
    expect(getDefinition('OODS-N021')).toMatchObject({ category: 'not_found', retryable: true });
    expect(getDefinition('OODS-N019')).toBeUndefined();
    expect(fs.existsSync(path.join(storeRoot, 'previews'))).toBe(false);
  });

  it('refuses a host that reads a different store root instead of returning a URL that would 404', async () => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-other-store-'));
    try {
      const hostUrl = await host(path.join(elsewhere, 'previews'));
      await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostPreviewsDir: path.join(elsewhere, 'previews'), previewsDir: path.join(storeRoot, 'previews') } });
      expect(fs.existsSync(path.join(storeRoot, 'previews'))).toBe(false);
    } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
  });
});
