import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { compileArtifact, PreviewCompileError } from './compile.js';
import { renderPreviewAppPage } from './page.js';
import { defaultRuntimeDirectory, loadPreviewRuntime, resolveEsbuildPlatform, type PreviewRuntime } from './runtime.js';
import { FIXED_WIDTHS, renderPreviewShell } from './shell.js';
import { isSafeCompositionId, listVersions, parseVersion, readVersion, type CompositionVersion, type PreviewBrand, type PreviewFramework, type PreviewTheme } from './store.js';

export interface PreviewHostOptions {
  /** Where design.compose writes versions; resolved beside the saved-schema store. */
  compositionsDir: string;
  /** dist/preview-runtime; the prebuilt React, Vue, foundation and CSS bundles. */
  runtimeDir?: string;
  /** Route prefix; the bridge and the standalone host both use /preview. */
  base?: string;
}

export interface PreviewHostStatus {
  running: true;
  base: string;
  compositionsDir: string;
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

type Params = { id: string; version: string };
type ScopeQuery = { framework?: string; brand?: string; theme?: string; width?: string };

/** Register the preview host on a Fastify instance; the runtime must exist or registration fails. */
export async function registerPreviewHost(fastify: FastifyInstance, options: PreviewHostOptions): Promise<PreviewHostStatus> {
  const base = options.base ?? '/preview';
  const runtime: PreviewRuntime = loadPreviewRuntime(options.runtimeDir ?? defaultRuntimeDirectory());
  const compositionsDir = path.resolve(options.compositionsDir);
  const status: PreviewHostStatus = {
    running: true, base, compositionsDir,
    runtime: { directory: runtime.directory, manifestSha256: runtime.manifestSha256, files: Object.keys(runtime.manifest.files).length, esbuild: runtime.manifest.esbuild, react: runtime.manifest.react, vue: runtime.manifest.vue },
    platform: resolveEsbuildPlatform(),
  };

  await fastify.register(fastifyStatic, { root: runtime.directory, prefix: `${base}/runtime/`, index: false, list: false, decorateReply: false, cacheControl: true, maxAge: '1h', immutable: false });

  fastify.get(`${base}/status`, async () => status);

  const load = (params: Params, reply: FastifyReply): CompositionVersion | undefined => {
    if (!isSafeCompositionId(params.id)) { void fail(reply, 400, 'Composition ids are cmp- plus twelve hex characters.'); return undefined; }
    const version = parseVersion(params.version);
    if (version === undefined) { void fail(reply, 400, 'Composition versions are positive integers.'); return undefined; }
    const record = readVersion(compositionsDir, params.id, version);
    if (!record) { void fail(reply, 404, `No composition ${params.id} version ${version} under ${compositionsDir}.`); return undefined; }
    return record;
  };
  const scope = (record: CompositionVersion, query: ScopeQuery, reply: FastifyReply): { framework: PreviewFramework; brand: PreviewBrand; theme: PreviewTheme; width: number | 'free' } | undefined => {
    const available = (Object.keys(record.artifacts) as PreviewFramework[]).filter(name => record.artifacts[name]);
    const framework = (query.framework && query.framework.length ? query.framework : available[0]) as PreviewFramework;
    if (!FRAMEWORKS.has(framework)) { void fail(reply, 400, 'framework must be react or vue.'); return undefined; }
    if (!record.artifacts[framework]) { void fail(reply, 404, `Composition ${record.compositionId} version ${record.version} was generated for ${available.join(', ') || 'no framework'}, not ${framework}; ask design.preview for it.`); return undefined; }
    const brand = query.brand ?? record.brand;
    const theme = query.theme ?? record.theme;
    if (!BRANDS.has(brand)) { void fail(reply, 400, 'brand must be A or B.'); return undefined; }
    if (!THEMES.has(theme)) { void fail(reply, 400, 'theme must be light, dark or hc.'); return undefined; }
    let width: number | 'free' = FIXED_WIDTHS[2];
    if (query.width === 'free') width = 'free';
    else if (query.width !== undefined) { const parsed = Number(query.width); if (!Number.isInteger(parsed) || parsed < 200 || parsed > 3840) { void fail(reply, 400, 'width must be 390, 820, 1440, free, or an integer between 200 and 3840.'); return undefined; } width = parsed; }
    return { framework, brand: brand as PreviewBrand, theme: theme as PreviewTheme, width };
  };

  fastify.get<{ Params: { id: string } }>(`${base}/:id`, async (request, reply) => {
    if (!isSafeCompositionId(request.params.id)) return fail(reply, 400, 'Composition ids are cmp- plus twelve hex characters.');
    const versions = listVersions(compositionsDir, request.params.id);
    if (!versions?.length) return fail(reply, 404, `No composition ${request.params.id} under ${compositionsDir}.`);
    const query = new URL(request.url, 'http://127.0.0.1').search;
    return reply.redirect(`${base}/${request.params.id}/${versions.at(-1)!.version}${query}`);
  });

  fastify.get<{ Params: { id: string } }>(`${base}/:id/versions.json`, async (request, reply) => {
    if (!isSafeCompositionId(request.params.id)) return fail(reply, 400, 'Composition ids are cmp- plus twelve hex characters.');
    const versions = listVersions(compositionsDir, request.params.id);
    if (!versions) return fail(reply, 404, `No composition ${request.params.id} under ${compositionsDir}.`);
    return reply.type('application/json; charset=utf-8').send(JSON.stringify({ compositionId: request.params.id, versions }));
  });

  fastify.get<{ Params: Params; Querystring: ScopeQuery }>(`${base}/:id/:version`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    const versions = listVersions(compositionsDir, record.compositionId) ?? [];
    return reply.type('text/html; charset=utf-8').send(renderPreviewShell({ record, versions, ...resolved, base }));
  });

  fastify.get<{ Params: Params; Querystring: ScopeQuery }>(`${base}/:id/:version/app`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    return reply.type('text/html; charset=utf-8').send(renderPreviewAppPage({ record, framework: resolved.framework, brand: resolved.brand, theme: resolved.theme, runtime: runtime.manifest, base }));
  });

  fastify.get<{ Params: Params; Querystring: ScopeQuery }>(`${base}/:id/:version/module.js`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    try {
      const compiled = await compileArtifact(record.artifacts[resolved.framework]!.artifact);
      return reply.type('text/javascript; charset=utf-8').header('x-oods-artifact-hash', compiled.artifactContentHash).header('x-oods-compiled-sha256', compiled.sha256).header('x-oods-externals', compiled.externals.join(',')).send(compiled.code);
    } catch (error) {
      if (error instanceof PreviewCompileError) return fail(reply, 422, error.message);
      return fail(reply, 500, `Preview host cannot compile: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  fastify.get<{ Params: Params }>(`${base}/:id/:version/record.json`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    return reply.type('application/json; charset=utf-8').send(JSON.stringify(record));
  });

  fastify.get<{ Params: Params & { '*': string }; Querystring: ScopeQuery }>(`${base}/:id/:version/files/*`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    const file = record.artifacts[resolved.framework]!.artifact.files.find(entry => entry.path === request.params['*']);
    if (!file) return fail(reply, 404, `No artifact file ${request.params['*']} in composition ${record.compositionId} version ${record.version} (${resolved.framework}).`);
    return reply.type(CONTENT_TYPES[path.posix.extname(file.path)] ?? 'text/plain; charset=utf-8').send(file.contents);
  });

  return status;
}
