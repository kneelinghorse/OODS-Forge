import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { artifactEntry, compileArtifact } from './compile.js';
import { registerPreviewHost } from './host.js';
import { defaultRuntimeDirectory, loadPreviewRuntime, resolveEsbuildPlatform } from './runtime.js';
import { resolvePreviewStoreDir, type PreviewArtifact, type PreviewRecord } from './store.js';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const runtimeDir = path.join(packageRoot, 'dist/preview-runtime');
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const directories: string[] = [];
const servers: FastifyInstance[] = [];
const temp = () => { const dir = mkdtempSync(path.join(tmpdir(), 'oods-preview-host-')); directories.push(dir); return dir; };
afterEach(async () => {
  for (const server of servers.splice(0)) await server.close();
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true });
});

type Fixture = Pick<PreviewRecord, 'compose' | 'brand' | 'theme' | 'schema' | 'model' | 'frameworks'>;
function fixture(name: 'subscription-card' | 'subscription-list'): PreviewRecord {
  const raw = JSON.parse(readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf8')) as Fixture;
  const schemaHash = `sha256:${sha256(JSON.stringify(raw.schema))}`;
  return { version: '1', key: schemaHash.slice(7, 23), schemaHash, createdAt: '2026-09-15T00:00:00.000Z', head: null, ...raw };
}
function store(...records: PreviewRecord[]): string {
  const dir = path.join(temp(), 'previews');
  mkdirSync(dir, { recursive: true });
  for (const record of records) writeFileSync(path.join(dir, `${record.key}.json`), JSON.stringify(record));
  return dir;
}
async function host(previewsDir: string) {
  const server = Fastify();
  servers.push(server);
  const status = await registerPreviewHost(server, { previewsDir, runtimeDir });
  return { server, status };
}
const bareImports = (code: string) => [...code.matchAll(/from\s*"([^"]+)"/g)].map(match => match[1]!).filter(specifier => !specifier.startsWith('.'));

describe('preview host runtime', () => {
  it('refuses to register without the prebuilt runtime, and never serves a partial one', async () => {
    const empty = temp();
    expect(() => loadPreviewRuntime(empty)).toThrow(/Preview host runtime is missing/);
    await expect(registerPreviewHost(Fastify(), { previewsDir: temp(), runtimeDir: empty })).rejects.toThrow(/runtime is missing/);
    const partial = temp();
    const manifest = JSON.parse(readFileSync(path.join(runtimeDir, 'manifest.json'), 'utf8'));
    writeFileSync(path.join(partial, 'manifest.json'), JSON.stringify(manifest));
    expect(() => loadPreviewRuntime(partial)).toThrow(/runtime file is missing/);
  });

  it('ships one React, one Vue and the foundation packages as shared ES modules with the styles', () => {
    const runtime = loadPreviewRuntime(runtimeDir);
    expect(defaultRuntimeDirectory()).toBe(runtimeDir);
    expect(runtime.manifest).toMatchObject({ version: 1, esbuild: '0.25.10', styles: 'styles.css' });
    expect(Object.keys(runtime.manifest.importMap).sort()).toEqual(['@oods/component-contracts', '@oods/component-styles', '@oods/components-react', '@oods/components-react/status', '@oods/components-react/table', '@oods/components-vue', 'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'vue']);
    for (const [file, meta] of Object.entries(runtime.manifest.files)) {
      const bytes = readFileSync(path.join(runtimeDir, file));
      expect(bytes.length, file).toBe(meta.bytes);
      expect(sha256(bytes), file).toBe(meta.sha256);
    }
    // Named exports survive the CommonJS boundary: the generated code imports Fragment and createRoot by name.
    expect(readFileSync(path.join(runtimeDir, runtime.manifest.importMap['react/jsx-runtime']!), 'utf8')).toMatch(/Fragment/);
    expect(readFileSync(path.join(runtimeDir, runtime.manifest.importMap['react-dom/client']!), 'utf8')).toMatch(/createRoot/);
    const styles = readFileSync(path.join(runtimeDir, runtime.manifest.styles), 'utf8');
    expect(styles).toMatch(/\[data-brand=["']?B["']?\]\[data-theme=["']?dark["']?\]/);
    expect(styles).toContain('--sys-surface-canvas');
    expect(styles).not.toContain('@import');
  });

  it('resolves the shipped esbuild binary for this platform and names the unsupported ones', () => {
    expect(resolveEsbuildPlatform()).toMatchObject({ supported: true, os: process.platform, arch: process.arch });
    expect(resolveEsbuildPlatform({}, 'win32-x64')).toMatchObject({ supported: false, os: 'win32', arch: 'x64' });
    expect(resolveEsbuildPlatform({}, 'win32-x64').reason).toMatch(/darwin-arm64, darwin-x64, linux-x64, linux-arm64/);
  });
});

describe('preview host routes', () => {
  it('reports its store, runtime and platform on /preview/status', async () => {
    const previewsDir = store();
    const { server, status } = await host(previewsDir);
    const response = await server.inject('/preview/status');
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(status);
    expect(status).toMatchObject({ running: true, base: '/preview', previewsDir, runtime: { files: 19, esbuild: '0.25.10' }, platform: { supported: true } });
  });

  it.each(['subscription-card', 'subscription-list'] as const)('compiles and serves the generated React and Vue %s artifacts as one ESM module each', async (name) => {
    const record = fixture(name);
    const { server } = await host(store(record));
    const runtime = loadPreviewRuntime(runtimeDir).manifest;
    for (const framework of ['react', 'vue'] as const) {
      const artifact = record.frameworks[framework]!.artifact;
      expect(artifactEntry(artifact)).toBe(framework === 'react' ? 'src/GeneratedUI.tsx' : 'src/GeneratedUI.vue');
      const page = await server.inject(`/preview/${record.key}?framework=${framework}`);
      expect(page.statusCode).toBe(200);
      expect(page.headers['content-type']).toMatch(/text\/html/);
      const html = page.body;
      expect(html).toContain('<script type="importmap">');
      expect(html).toContain('"react":"/preview/runtime/react.js"');
      expect(html).toContain('<link rel="stylesheet" href="/preview/runtime/styles.css">');
      expect(html).toContain('<html lang="en" data-theme="dark" data-brand="B">');
      expect(html).toContain(`data-oods-preview="${record.key}"`);
      expect(html).toContain(`/preview/${record.key}/module.js?framework=${framework}`);
      expect(html).toContain(framework === 'react' ? 'createRoot(document.getElementById' : "createApp(Page, { ...model, actions }).mount('#app')");
      for (const action of artifact.actions) expect(html).toContain(`${JSON.stringify(action.name)}: (...args) => window.dispatchEvent(new CustomEvent('oods-design-loop-action'`);
      expect(html).toContain(JSON.stringify(record.model).slice(0, 40));

      const module = await server.inject(`/preview/${record.key}/module.js?framework=${framework}`);
      expect(module.statusCode, module.body.slice(0, 500)).toBe(200);
      expect(module.headers['content-type']).toMatch(/text\/javascript/);
      expect(module.headers['x-oods-artifact-hash']).toBe(artifact.contentHash);
      expect(module.headers['x-oods-compiled-sha256']).toBe(sha256(module.body));
      expect(module.body).toMatch(framework === 'react' ? /export\s*\{[^}]*GeneratedUI/ : /export\s*\{[^}]*as default/);
      expect(module.body).not.toContain('@oods/component-styles/css');
      expect(module.body).not.toMatch(/<template>|lang="ts"/);
      const imports = bareImports(module.body);
      expect(imports.length).toBeGreaterThan(0);
      for (const specifier of imports) expect(runtime.importMap, `${specifier} must be in the import map`).toHaveProperty([specifier]);
      expect(imports).toContain(framework === 'react' ? '@oods/components-react' : '@oods/components-vue');
      // Every generated component is mounted by name in the compiled module.
      for (const component of new Set([...artifact.files[0]!.contents.matchAll(/data-oods-component="([A-Za-z]+)"/g)].map(match => match[1]!))) expect(module.body).toContain(component);
      const again = await server.inject(`/preview/${record.key}/module.js?framework=${framework}`);
      expect(again.body).toBe(module.body);
    }
    const raw = await server.inject(`/preview/${record.key}/files/src/charts/payment-001.svg?framework=react`);
    if (record.frameworks.react!.artifact.files.some(file => file.path === 'src/charts/payment-001.svg')) {
      expect(raw.statusCode).toBe(200);
      expect(raw.headers['content-type']).toBe('image/svg+xml');
    } else expect(raw.statusCode).toBe(404);
    const stored = await server.inject(`/preview/${record.key}/record.json`);
    expect(stored.json()).toEqual(record);
  });

  it('re-mounts with the requested brand and theme without touching the artifact', async () => {
    const record = fixture('subscription-card');
    const { server } = await host(store(record));
    const html = (await server.inject(`/preview/${record.key}?framework=vue&brand=A&theme=hc`)).body;
    expect(html).toContain('<html lang="en" data-theme="hc" data-brand="A">');
    expect(html).toContain('<body data-theme="hc" data-brand="A" style="color-scheme:light">');
    expect((await server.inject(`/preview/${record.key}?brand=C`)).statusCode).toBe(400);
    expect((await server.inject(`/preview/${record.key}?theme=sepia`)).statusCode).toBe(400);
  });

  it('serves the runtime files the page links with their manifest digests', async () => {
    const { server } = await host(store());
    const runtime = loadPreviewRuntime(runtimeDir).manifest;
    for (const file of [runtime.importMap['react']!, runtime.importMap['vue']!, runtime.styles]) {
      const response = await server.inject(`/preview/runtime/${file}`);
      expect(response.statusCode, file).toBe(200);
      expect(sha256(response.rawPayload), file).toBe(runtime.files[file]!.sha256);
    }
    expect((await server.inject('/preview/runtime/missing.js')).statusCode).toBe(404);
  });

  it('fails the module request, not the page, when a generated artifact does not compile', async () => {
    const record = fixture('subscription-card');
    const broken: PreviewArtifact = { ...record.frameworks.react!.artifact, contentHash: `sha256:${'f'.repeat(64)}`, files: [{ path: 'src/GeneratedUI.tsx', contents: 'export const GeneratedUI = () => <div>;\n', contentHash: `sha256:${'e'.repeat(64)}` }] };
    const { server } = await host(store({ ...record, key: 'abcdefabcdef0123', frameworks: { react: { artifact: broken } } }));
    const module = await server.inject('/preview/abcdefabcdef0123/module.js?framework=react');
    expect(module.statusCode).toBe(422);
    expect(module.body).toMatch(/react artifact failed to compile/);
    expect(module.body).toMatch(/src\/GeneratedUI\.tsx:\d+: /);
    await expect(compileArtifact(broken)).rejects.toThrow(/failed to compile/);
    const vue = await server.inject('/preview/abcdefabcdef0123/module.js?framework=vue');
    expect(vue.statusCode).toBe(404);
    expect(vue.body).toMatch(/generated for react, not vue/);
  });

  it('refuses unsafe keys and names a missing record', async () => {
    const { server } = await host(store());
    expect((await server.inject('/preview/not-a-key')).statusCode).toBe(400);
    expect((await server.inject('/preview/ABCDEFABCDEF0123')).statusCode).toBe(400);
    expect((await server.inject('/preview/0123456789abcdef')).statusCode).toBe(404);
    expect((await server.inject('/preview/0123456789abcdef/module.js')).statusCode).toBe(404);
  });

  it('reads previews from beside the saved-schema store under the same environment the server uses', () => {
    const serverCwd = path.join(temp(), 'packages/mcp-server');
    expect(resolvePreviewStoreDir(serverCwd, {})).toBe(path.join(serverCwd, '.oods/previews'));
    expect(resolvePreviewStoreDir(serverCwd, { MCP_SCHEMA_STORE_ROOT: '/tmp/root', MCP_SCHEMA_STORE_DIR: 'schemas' })).toBe(path.resolve('/tmp/root/previews'));
    expect(resolvePreviewStoreDir(serverCwd, { MCP_SCHEMA_STORE_DIR: '/var/store/saved' })).toBe(path.resolve('/var/store/previews'));
  });
});
