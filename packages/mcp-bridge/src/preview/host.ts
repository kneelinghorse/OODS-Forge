import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { compileArtifact, PreviewCompileError } from './compile.js';
import { renderComparePage } from './compare.js';
import { diffVersions, sharedFrameworks } from './diff.js';
import { renderPreviewAppPage } from './page.js';
import { defaultRuntimeDirectory, loadPreviewRuntime, resolveEsbuildPlatform, type PreviewRuntime } from './runtime.js';
import { FIXED_WIDTHS, renderPreviewShell } from './shell.js';
import { parseAxeResult, renderMeasurementPanel, withAxeResult } from './measurements.js';
import type { RunTool } from './native.js';
import { hasPlacedChart, isSafeCompositionId, listVersions, parseVersion, readVersion, scopeKey, servedArtifact, writeVersionMeasurements, type CompositionVersion, type PreviewBrand, type PreviewFramework, type PreviewTheme } from './store.js';

export interface PreviewHostOptions {
  /** Where design.compose writes versions; resolved beside the saved-schema store. */
  compositionsDir: string;
  /** dist/preview-runtime; the prebuilt React, Vue, foundation and CSS bundles. */
  runtimeDir?: string;
  /** Route prefix; the bridge and the standalone host both use /preview. */
  base?: string;
  /** Runs a native tool for page edits (design.preview action edit); without it the edit route answers 501. */
  runTool?: RunTool;
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
    const served = servedArtifact(record, resolved.framework, resolved.brand, resolved.theme)!;
    return reply.type('text/html; charset=utf-8').send(renderPreviewAppPage({ record, framework: resolved.framework, brand: resolved.brand, theme: resolved.theme, runtime: runtime.manifest, base, generatedFor: { ...served.generatedFor, chartScoped: hasPlacedChart(record.schema) }, artifactContentHash: served.entry.artifact.contentHash }));
  });

  // The module for a scope: the scoped generation when the placed chart needed one, else the version's own artifact.
  fastify.get<{ Params: Params; Querystring: ScopeQuery }>(`${base}/:id/:version/module.js`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    const served = servedArtifact(record, resolved.framework, resolved.brand, resolved.theme)!;
    try {
      const compiled = await compileArtifact(served.entry.artifact);
      return reply.type('text/javascript; charset=utf-8').header('x-oods-artifact-hash', compiled.artifactContentHash).header('x-oods-compiled-sha256', compiled.sha256).header('x-oods-externals', compiled.externals.join(',')).header('x-oods-generated-for', scopeKey(served.generatedFor.brand, served.generatedFor.theme)).send(compiled.code);
    } catch (error) {
      if (error instanceof PreviewCompileError) return fail(reply, 422, error.message);
      return fail(reply, 500, `Preview host cannot compile: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // What a brand or theme switch mounts (Sprint 202 m01): a version with a placed chart is generated and certified for the
  // requested scope on first use, through the native server this host owns; the answer names the scope the module was generated for.
  let scopeQueue: Promise<unknown> = Promise.resolve();
  fastify.get<{ Params: Params; Querystring: ScopeQuery }>(`${base}/:id/:version/scope.json`, async (request, reply) => {
    let record = load(request.params, reply); if (!record) return;
    const resolved = scope(record, request.query, reply); if (!resolved) return;
    const chartScoped = hasPlacedChart(record.schema);
    const key = scopeKey(resolved.brand, resolved.theme);
    const identity = { compositionId: record.compositionId, version: record.version, framework: resolved.framework, brand: resolved.brand, theme: resolved.theme, chartScoped };
    const send = (body: Record<string, unknown>, status = 200) => reply.code(status).type('application/json; charset=utf-8').send(JSON.stringify(body));
    if (chartScoped && key !== scopeKey(record.brand, record.theme) && !record.scopes?.[key]?.artifacts[resolved.framework]) {
      if (!options.runTool) return send({ ...identity, available: false, generatedFor: { brand: record.brand, theme: record.theme, chartScoped }, reason: 'This preview host has no native server to re-generate with; ask design.preview for this brand and theme.' });
      // Generations run one at a time: design.preview holds one native call per tool.
      const run = scopeQueue.then(() => options.runTool!('design.preview', { compositionId: record!.compositionId, version: record!.version, framework: resolved.framework, preferences: { brand: resolved.brand, theme: resolved.theme } }));
      scopeQueue = run.catch(() => undefined);
      try { await run; } catch (error) {
        const native = (error as { nativeError?: { code?: string; message?: string } }).nativeError;
        return send({ ...identity, available: false, generatedFor: { brand: record.brand, theme: record.theme, chartScoped }, error: native ?? { message: error instanceof Error ? error.message : String(error) } }, native?.code?.startsWith('OODS-V') ? 422 : 500);
      }
      record = readVersion(compositionsDir, record.compositionId, record.version)!;
    }
    const served = servedArtifact(record, resolved.framework, resolved.brand, resolved.theme)!;
    const charts = chartScoped ? (key === scopeKey(record.brand, record.theme) ? record.measurements.charts : record.scopes?.[key]?.charts) ?? null : [];
    return send({ ...identity, available: true, generatedFor: { ...served.generatedFor, chartScoped }, artifactContentHash: served.entry.artifact.contentHash, moduleUrl: `${base}/${record.compositionId}/${record.version}/module.js?framework=${resolved.framework}&brand=${resolved.brand}&theme=${resolved.theme}`, charts });
  });

  // Edits from the page: one operation → design.preview action edit on the native server → a new version to open.
  fastify.post<{ Params: Params; Body: { operation?: string; framework?: string; brand?: string; theme?: string } & Record<string, unknown> }>(`${base}/:id/:version/edit`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    if (!options.runTool) return fail(reply, 501, 'This preview host has no native server to re-compose with; edit through design.preview instead.');
    const body = request.body ?? {};
    const { framework, brand, theme, ...edit } = body;
    if (typeof edit.operation !== 'string') return fail(reply, 400, 'An edit needs an operation: reorder-region, swap-slot, reorder-fields or seed.');
    try {
      // Both frameworks are generated for the new version; the framework only chooses which one the page opens.
      const result = await options.runTool('design.preview', { action: 'edit', compositionId: record.compositionId, version: record.version, edit }) as { compositionId: string; version: number; parentVersion: number | null; operation: string; previewUrl: string };
      const query = new URLSearchParams({ ...(typeof framework === 'string' ? { framework } : {}), ...(typeof brand === 'string' ? { brand } : {}), ...(typeof theme === 'string' ? { theme } : {}) }).toString();
      return reply.type('application/json; charset=utf-8').send(JSON.stringify({ compositionId: result.compositionId, version: result.version, parentVersion: result.parentVersion, operation: result.operation, url: `${base}/${result.compositionId}/${result.version}${query ? `?${query}` : ''}` }));
    } catch (error) {
      const native = (error as { nativeError?: { code?: string; message?: string; details?: unknown } }).nativeError;
      return reply.code(native?.code?.startsWith('OODS-V') ? 422 : 500).type('application/json; charset=utf-8').send(JSON.stringify({ error: native ?? { message: error instanceof Error ? error.message : String(error) } }));
    }
  });

  // Measurements: the panel, the raw record, and the one thing the page may write back (axe results).
  fastify.get<{ Params: Params }>(`${base}/:id/:version/measurements`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    return reply.type('text/html; charset=utf-8').send(renderMeasurementPanel(record));
  });
  fastify.get<{ Params: Params }>(`${base}/:id/:version/measurements.json`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    return reply.type('application/json; charset=utf-8').send(JSON.stringify(record.measurements ?? {}));
  });
  fastify.post<{ Params: Params; Body: unknown }>(`${base}/:id/:version/measurements/axe`, { bodyLimit: 2_000_000 }, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    const result = parseAxeResult(request.body);
    if (!result) return fail(reply, 400, 'An axe result needs engine {name, version}, framework, brand, theme, violations[], passes, incomplete and inapplicable.');
    if (!record.artifacts[result.framework]) return fail(reply, 409, `Composition ${record.compositionId} version ${record.version} has no ${result.framework} artifact to have measured.`);
    writeVersionMeasurements(compositionsDir, withAxeResult(record, result));
    return reply.type('application/json; charset=utf-8').send(JSON.stringify({ stored: true, compositionId: record.compositionId, version: record.version, framework: result.framework, scope: `${result.brand}/${result.theme}`, violations: result.violations.length, passes: result.passes }));
  });

  fastify.get<{ Params: Params }>(`${base}/:id/:version/record.json`, async (request, reply) => {
    const record = load(request.params, reply); if (!record) return;
    return reply.type('application/json; charset=utf-8').send(JSON.stringify(record));
  });

  // Side by side: /compare/<id>@<v>/<id>@<v> with the structural what-changed and both measurement panels.
  const compareBase = base.replace(/\/preview$/, '') + '/compare';
  const parseRef = (value: string): { id: string; version: number } | undefined => {
    const match = /^(cmp-[a-f0-9]{12})@([1-9]\d{0,6})$/.exec(value);
    return match ? { id: match[1]!, version: Number(match[2]) } : undefined;
  };
  const loadPair = (params: { left: string; right: string }, reply: FastifyReply): { left: CompositionVersion; right: CompositionVersion } | undefined => {
    const refs = [parseRef(params.left), parseRef(params.right)];
    if (!refs[0] || !refs[1]) { void fail(reply, 400, 'Compare references are <compositionId>@<version>, for example cmp-0123456789ab@2.'); return undefined; }
    const [left, right] = refs.map(ref => readVersion(compositionsDir, ref!.id, ref!.version));
    if (!left) { void fail(reply, 404, `No composition ${refs[0].id} version ${refs[0].version} under ${compositionsDir}.`); return undefined; }
    if (!right) { void fail(reply, 404, `No composition ${refs[1].id} version ${refs[1].version} under ${compositionsDir}.`); return undefined; }
    return { left, right };
  };
  fastify.get<{ Params: { left: string; right: string } }>(`${compareBase}/:left/:right/diff.json`, async (request, reply) => {
    const pair = loadPair(request.params, reply); if (!pair) return;
    return reply.type('application/json; charset=utf-8').send(JSON.stringify(diffVersions(pair.left, pair.right)));
  });
  fastify.get<{ Params: { left: string; right: string }; Querystring: ScopeQuery }>(`${compareBase}/:left/:right`, async (request, reply) => {
    const pair = loadPair(request.params, reply); if (!pair) return;
    const frameworks = sharedFrameworks(pair.left, pair.right);
    if (!frameworks.length) return fail(reply, 409, 'The two versions share no generated framework yet; ask design.preview for both.');
    const framework = (request.query.framework && request.query.framework.length ? request.query.framework : frameworks[0]) as PreviewFramework;
    if (!frameworks.includes(framework)) return fail(reply, 404, `Both versions carry ${frameworks.join(', ')}, not ${framework}.`);
    const resolved = scope(pair.left, { ...request.query, framework }, reply); if (!resolved) return;
    return reply.type('text/html; charset=utf-8').send(renderComparePage({ ...pair, diff: diffVersions(pair.left, pair.right), frameworks, framework, brand: resolved.brand, theme: resolved.theme, width: resolved.width, base }));
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
