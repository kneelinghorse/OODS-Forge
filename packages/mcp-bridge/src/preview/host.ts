import fs from 'node:fs';
import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { compileArtifact, PreviewCompileError } from './compile.js';
import { renderPreviewPage } from './page.js';
import { defaultRuntimeDirectory, loadPreviewRuntime, resolveEsbuildPlatform, type PreviewRuntime } from './runtime.js';
import { isSafePreviewKey, readPreviewRecord, type PreviewFramework, type PreviewRecord } from './store.js';

export interface PreviewHostOptions {
  /** Where design.preview writes records; resolved beside the saved-schema store. */
  previewsDir: string;
  /** dist/preview-runtime; the prebuilt React, Vue, foundation and CSS bundles. */
  runtimeDir?: string;
  /** Route prefix; the bridge and the standalone host both use /preview. */
  base?: string;
}

export interface PreviewHostStatus {
  running: true;
  base: string;
  previewsDir: string;
  runtime: { directory: string; manifestSha256: string; files: number; esbuild: string; react: string; vue: string };
  platform: ReturnType<typeof resolveEsbuildPlatform>;
}

const FRAMEWORKS = new Set<PreviewFramework>(['react', 'vue']);
const BRANDS = new Set(['A', 'B']);
const THEMES = new Set(['light', 'dark', 'hc']);
const CONTENT_TYPES: Record<string, string> = { '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.html': 'text/html; charset=utf-8', '.ts': 'text/plain; charset=utf-8', '.tsx': 'text/plain; charset=utf-8', '.vue': 'text/plain; charset=utf-8' };

function fail(reply: FastifyReply, status: number, message: string) {
  return reply.code(status).type('text/plain; charset=utf-8').send(message);
}

/** Register the preview host on a Fastify instance; the runtime must exist or registration fails. */
export async function registerPreviewHost(fastify: FastifyInstance, options: PreviewHostOptions): Promise<PreviewHostStatus> {
  const base = options.base ?? '/preview';
  const runtime: PreviewRuntime = loadPreviewRuntime(options.runtimeDir ?? defaultRuntimeDirectory());
  const previewsDir = path.resolve(options.previewsDir);
  const status: PreviewHostStatus = {
    running: true, base, previewsDir,
    runtime: { directory: runtime.directory, manifestSha256: runtime.manifestSha256, files: Object.keys(runtime.manifest.files).length, esbuild: runtime.manifest.esbuild, react: runtime.manifest.react, vue: runtime.manifest.vue },
    platform: resolveEsbuildPlatform(),
  };

  await fastify.register(fastifyStatic, { root: runtime.directory, prefix: `${base}/runtime/`, index: false, list: false, decorateReply: false, cacheControl: true, maxAge: '1h', immutable: false });

  fastify.get(`${base}/status`, async () => status);

  const load = (key: unknown, reply: FastifyReply): PreviewRecord | undefined => {
    if (!isSafePreviewKey(key)) { void fail(reply, 400, 'Preview keys are sixteen hex characters.'); return undefined; }
    const record = readPreviewRecord(previewsDir, key);
    if (!record) { void fail(reply, 404, `No preview record ${key} under ${previewsDir}.`); return undefined; }
    return record;
  };
  const pickFramework = (record: PreviewRecord, requested: unknown, reply: FastifyReply): PreviewFramework | undefined => {
    const available = (Object.keys(record.frameworks) as PreviewFramework[]).filter(name => record.frameworks[name]);
    const framework = (typeof requested === 'string' && requested.length ? requested : available[0]) as PreviewFramework;
    if (!FRAMEWORKS.has(framework)) { void fail(reply, 400, 'framework must be react or vue.'); return undefined; }
    if (!record.frameworks[framework]) { void fail(reply, 404, `Preview ${record.key} was generated for ${available.join(', ') || 'no framework'}, not ${framework}.`); return undefined; }
    return framework;
  };

  fastify.get<{ Params: { key: string }; Querystring: { framework?: string; brand?: string; theme?: string } }>(`${base}/:key`, async (request, reply) => {
    const record = load(request.params.key, reply); if (!record) return;
    const framework = pickFramework(record, request.query.framework, reply); if (!framework) return;
    const brand = request.query.brand ?? record.brand;
    const theme = request.query.theme ?? record.theme;
    if (!BRANDS.has(brand)) return fail(reply, 400, 'brand must be A or B.');
    if (!THEMES.has(theme)) return fail(reply, 400, 'theme must be light, dark or hc.');
    return reply.type('text/html; charset=utf-8').send(renderPreviewPage({ record, framework, brand: brand as PreviewRecord['brand'], theme: theme as PreviewRecord['theme'], runtime: runtime.manifest, base }));
  });

  fastify.get<{ Params: { key: string }; Querystring: { framework?: string } }>(`${base}/:key/module.js`, async (request, reply) => {
    const record = load(request.params.key, reply); if (!record) return;
    const framework = pickFramework(record, request.query.framework, reply); if (!framework) return;
    try {
      const compiled = await compileArtifact(record.frameworks[framework]!.artifact);
      return reply.type('text/javascript; charset=utf-8').header('x-oods-artifact-hash', compiled.artifactContentHash).header('x-oods-compiled-sha256', compiled.sha256).header('x-oods-externals', compiled.externals.join(',')).send(compiled.code);
    } catch (error) {
      if (error instanceof PreviewCompileError) return fail(reply, 422, error.message);
      return fail(reply, 500, `Preview host cannot compile: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  fastify.get<{ Params: { key: string } }>(`${base}/:key/record.json`, async (request, reply) => {
    const record = load(request.params.key, reply); if (!record) return;
    return reply.type('application/json; charset=utf-8').send(JSON.stringify(record));
  });

  fastify.get<{ Params: { key: string; '*': string }; Querystring: { framework?: string } }>(`${base}/:key/files/*`, async (request, reply) => {
    const record = load(request.params.key, reply); if (!record) return;
    const framework = pickFramework(record, request.query.framework, reply); if (!framework) return;
    const file = record.frameworks[framework]!.artifact.files.find(entry => entry.path === request.params['*']);
    if (!file) return fail(reply, 404, `No artifact file ${request.params['*']} in preview ${record.key} (${framework}).`);
    return reply.type(CONTENT_TYPES[path.posix.extname(file.path)] ?? 'text/plain; charset=utf-8').send(file.contents);
  });

  return status;
}

export function previewsDirExists(previewsDir: string): boolean {
  return fs.existsSync(previewsDir);
}
