import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { getAjv } from '../../src/lib/ajv.js';
import { listVersions, readVersion, resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { getDefinition } from '../../src/errors/registry.js';
import outputSchema from '../../src/schemas/design.preview.output.json' with { type: 'json' };
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as preview, resolvePreviewHostUrl } from '../../src/tools/design.preview.js';
import { loadToolRegistry } from '../../src/tools/registry.js';

const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const runtimeDir = path.join(root, 'packages/mcp-bridge/dist/preview-runtime');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
let storeRoot: string;
const servers: FastifyInstance[] = [];

async function host(compositionsDir: string): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { compositionsDir, runtimeDir });
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

describe('design.preview serves a composition version through the preview host (s201-m01/m02)', () => {
  it('composes a new composition, generates both frameworks onto version 1, and returns one running URL per framework with its lineage', async () => {
    const compositionsDir = resolveCompositionsDir();
    expect(compositionsDir).toBe(path.join(storeRoot, 'compositions'));
    const hostUrl = await host(compositionsDir);
    const result = await preview({ object: 'Subscription', context: 'card', preferences: { theme: 'dark', brand: 'B' } }, { previewHostUrl: hostUrl });
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    expect(result).toMatchObject({ status: 'ok', version: 1, parentVersion: null, operation: 'compose', head: null, object: 'Subscription', context: 'card', brand: 'B', theme: 'dark', host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir } });
    expect(result.compositionId).toMatch(/^cmp-[a-f0-9]{12}$/);
    expect(result.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    const base = `${hostUrl}/preview/${result.compositionId}/1`;
    expect(result.previewUrl).toBe(`${base}?framework=react&brand=B&theme=dark`);
    expect(result.recordPath).toBe(path.join(compositionsDir, result.compositionId, 'versions', '1.json'));
    // The version file is what the host reads: the schema, the deterministic model and both artifacts; no schema was saved.
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    expect(record).toMatchObject({ recordVersion: '1', version: 1, parentVersion: null, operation: 'compose', schemaHash: result.schemaHash, brand: 'B', theme: 'dark', compose: { object: 'Subscription', context: 'card' } });
    expect(Object.keys(record.artifacts).sort()).toEqual(['react', 'vue']);
    expect(record.model).toHaveProperty('planName');
    expect(fs.existsSync(path.join(storeRoot, 'schemas'))).toBe(false);
    for (const entry of result.previews) {
      expect(entry.artifactContentHash).toBe(record.artifacts[entry.framework]!.artifact.contentHash);
      expect(entry.appUrl).toBe(`${base}/app?framework=${entry.framework}&brand=B&theme=dark`);
      const shell = await fetch(entry.url);
      expect(shell.status).toBe(200);
      const shellHtml = await shell.text();
      expect(shellHtml).toContain('data-oods-lineage="true"');
      expect(shellHtml).toContain(`<code>${result.compositionId}</code>`);
      expect(shellHtml).toContain('<strong>1</strong> of 1');
      const app = await fetch(entry.appUrl);
      expect(app.status).toBe(200);
      const html = await app.text();
      expect(html).toContain('<html lang="en" data-theme="dark" data-brand="B">');
      expect(html).toContain(`data-oods-preview="${result.compositionId}" data-oods-preview-version="1"`);
      const module = await fetch(entry.moduleUrl);
      expect(module.status).toBe(200);
      const code = await module.text();
      expect(`sha256:${sha256(code)}`).toBe(entry.compiled.sha256);
      expect(Buffer.byteLength(code)).toBe(entry.compiled.bytes);
    }
  });

  it('opens an existing composition version by id, reuses its artifacts, and follows lineage to a recomposed second version', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const composed = await compose({ object: 'Subscription', context: 'card' });
    expect(composed).toMatchObject({ status: 'ok', version: 1, parentVersion: null, operation: 'compose' });
    const id = composed.compositionId!;
    expect(fs.existsSync(path.join(storeRoot, 'compositions', id, 'versions', '1.json'))).toBe(true);
    const vue = await preview({ compositionId: id, framework: 'vue' }, { previewHostUrl: hostUrl });
    expect(vue).toMatchObject({ compositionId: id, version: 1, brand: 'A', theme: 'light' });
    expect(vue.previews.map(entry => entry.framework)).toEqual(['vue']);
    expect((await fetch(`${hostUrl}/preview/${id}/1/app?framework=react`)).status).toBe(404);
    const generatedAt = (await readVersion(compositionsDir, id, 1)).artifacts.vue!.generatedAt;
    const both = await preview({ compositionId: id, version: 1 }, { previewHostUrl: hostUrl });
    expect(both.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    expect((await readVersion(compositionsDir, id, 1)).artifacts.vue!.generatedAt).toBe(generatedAt);
    expect((await fetch(`${hostUrl}/preview/${id}/1/app?framework=react`)).status).toBe(200);
    // A second version of the same composition names its parent and operation on the page.
    const second = await compose({ object: 'Subscription', context: 'card', compositionId: id, preferences: { tabCount: 2 } });
    expect(second).toMatchObject({ status: 'ok', compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    const latest = await preview({ compositionId: id }, { previewHostUrl: hostUrl });
    expect(latest).toMatchObject({ compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    const page = await (await fetch(latest.previewUrl)).text();
    expect(page).toContain('<strong>2</strong> of 2');
    expect(page).toContain(`<a href="/preview/${id}/1?framework=react&brand=A&theme=light">version 1</a>`);
    expect(page).toContain('<code>recompose</code>');
    expect((await listVersions(compositionsDir, id)).map(entry => [entry.version, entry.parentVersion, entry.operation])).toEqual([[1, null, 'compose'], [2, 1, 'recompose']]);
    // Version 1's file did not change when version 2 was recorded.
    expect((await readVersion(compositionsDir, id, 1)).schemaHash).toBe(composed.schema && `sha256:${sha256(JSON.stringify(composed.schema))}`);
  });

  it('is typed OODS-N021 and retryable without a reachable host, OODS-N022 for an unknown version, OODS-V203 for an unsafe id, and writes nothing', async () => {
    expect(resolvePreviewHostUrl(undefined, {})).toBeUndefined();
    expect(resolvePreviewHostUrl({ previewHostUrl: 'http://127.0.0.1:4466' }, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:4466');
    expect(resolvePreviewHostUrl(undefined, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:1');
    await expect(preview({ object: 'Subscription', context: 'card' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { dependency: 'preview-host', hostUrl: null } });
    await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: 'http://127.0.0.1:1' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostUrl: 'http://127.0.0.1:1' } });
    expect(getDefinition('OODS-N021')).toMatchObject({ category: 'not_found', retryable: true });
    expect(getDefinition('OODS-N019')).toBeUndefined();
    expect(fs.existsSync(path.join(storeRoot, 'compositions'))).toBe(false);
    const hostUrl = await host(resolveCompositionsDir());
    await expect(preview({ compositionId: 'cmp-ffffffffffff' }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022', details: { compositionId: 'cmp-ffffffffffff' } });
    await expect(preview({ compositionId: 'cmp-ffffffffffff', version: 3 }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022' });
    await expect(preview({ compositionId: '../etc/passwd' } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    await expect(preview({ framework: 'react' } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    expect(getDefinition('OODS-N022')).toMatchObject({ category: 'not_found', retryable: false });
  });

  it('refuses a host that reads a different store root instead of returning a URL that would 404', async () => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-other-store-'));
    try {
      const hostUrl = await host(path.join(elsewhere, 'compositions'));
      await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostCompositionsDir: path.join(elsewhere, 'compositions'), compositionsDir: path.join(storeRoot, 'compositions') } });
      expect(fs.existsSync(path.join(storeRoot, 'compositions'))).toBe(false);
    } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
  });

  it('advertises the same tool in the registry, both policies, the description and the generated API page', () => {
    const json = (relative: string) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
    expect(loadToolRegistry().auto).toContain('design.preview');
    expect(json('packages/mcp-server/src/security/policy.json').rules.find((row: { tool: string }) => row.tool === 'design.preview')).toMatchObject({ readOnly: true, concurrency: 1 });
    const agent = json('configs/agent/policy.json').tools.find((row: { name: string }) => row.name === 'design.preview');
    expect(agent.description).toContain('OODS-N021');
    const description = json('packages/mcp-adapter/tool-descriptions.json')['design.preview'];
    for (const phrase of ['compositionId', 'OODS-N021', 'OODS-N022', 'lineage', 'brand, theme and width controls']) expect(description).toContain(phrase);
    expect(description).not.toContain('OODS-N019');
    expect(fs.readFileSync(path.join(root, 'docs/api/design-preview.md'), 'utf8')).toContain(description);
  });

  it('action compare reports exactly the swapped slot and the artifact files it moved, and zero differences for a version against itself (s201-m03)', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const base = await preview({ object: 'Subscription', context: 'detail' }, { previewHostUrl: hostUrl });
    expect(base.action).toBe('render');
    const id = base.compositionId;
    // Pin the metadata slot to one of the composer's own candidates on version 2 (the README's documented override).
    const swapped = await compose({ object: 'Subscription', context: 'detail', compositionId: id, preferences: { componentOverrides: { metadata: 'TagSummary' } } });
    expect(swapped).toMatchObject({ compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    await preview({ compositionId: id, version: 2 }, { previewHostUrl: hostUrl });
    const result = await preview({ action: 'compare', compositionId: id, version: 1, against: { version: 2 } }, { previewHostUrl: hostUrl });
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    expect(result.action).toBe('compare');
    if (result.action !== 'compare') throw new Error('compare output expected');
    expect(result).toMatchObject({ left: { compositionId: id, version: 1, operation: 'compose' }, right: { compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' }, frameworks: ['react', 'vue'], identical: false, host: { url: hostUrl, compositionsDir } });
    expect(result.compareUrl).toBe(`${hostUrl}/compare/${id}@1/${id}@2?framework=react&brand=A&theme=light`);
    expect(Object.entries(result.diff.summary).filter(([, count]) => count > 0).map(([category]) => category)).toEqual(['slots', 'artifacts']);
    expect(result.diff.differences.filter(entry => entry.category === 'slots')).toEqual([{ category: 'slots', field: 'metadata', before: ['AuditTimeline'], after: ['TagSummary'], note: 'slot components changed' }]);
    const moved = result.diff.differences.filter(entry => entry.category === 'artifacts').map(entry => entry.field);
    expect(moved).toEqual(expect.arrayContaining(['react.contentHash', 'react.files.src/GeneratedUI.tsx', 'vue.contentHash', 'vue.files.src/GeneratedUI.vue']));
    expect(result.differenceCount).toBe(result.diff.differences.length);
    const page = await fetch(result.compareUrl);
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain(`src="/preview/${id}/1/app?framework=react&brand=A&theme=light"`);
    expect(html).toContain(`src="/preview/${id}/2/app?framework=react&brand=A&theme=light"`);
    expect(html).toContain('<ul data-oods-diff="slots">');
    expect(await (await fetch(result.diffUrl)).json()).toEqual(result.diff);
    const same = await preview({ action: 'compare', compositionId: id, version: 2, against: { version: 2 } }, { previewHostUrl: hostUrl });
    if (same.action !== 'compare') throw new Error('compare output expected');
    expect(same).toMatchObject({ identical: true, differenceCount: 0 });
    expect(same.diff.differences).toEqual([]);
    await expect(preview({ action: 'compare', compositionId: id, version: 1 } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    await expect(preview({ action: 'compare', compositionId: id, version: 1, against: { version: 9 } }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022' });
  });
});
