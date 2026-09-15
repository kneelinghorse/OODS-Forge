import { createHash } from 'node:crypto';
import path from 'node:path';
import { validateGeneratedArtifact } from '../codegen/artifact-envelope.js';
import { seedPreviewModel } from '../codegen/preview-model.js';
import { ToolError } from '../errors/tool-error.js';
import { attachToVersion, latestVersion, readVersion, resolveCompositionsDir, versionPath, type CompositionVersion, type PreviewBrand, type PreviewFramework, type PreviewTheme } from '../lib/composition-store.js';
import type { ToolContext } from '../lib/tool-context.js';
import type { DesignPreviewInputSchema, DesignPreviewOutputSchema } from '../schemas/generated.js';
import { handle as generate } from './code.generate.js';
import { handle as compose } from './design.compose.js';

type PreviewEntry = DesignPreviewOutputSchema.DesignPreviewOutput['previews'][number];
const PROBE_TIMEOUT_MS = 3_000;
const COMPILE_TIMEOUT_MS = 60_000;
const digest = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`;

type HostStatus = {
  running: boolean;
  compositionsDir: string;
  platform: { supported: boolean; os: string; arch: string; reason?: string };
};

/** The bridge hosts the preview in-process and the stdio adapter starts one; both pass its URL per request. */
export function resolvePreviewHostUrl(context?: ToolContext, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const fromEnv = env.OODS_PREVIEW_HOST_URL?.trim();
  return context?.previewHostUrl ?? (fromEnv && fromEnv.length > 0 ? fromEnv : undefined);
}

const unreachable = (reason: string, details: Record<string, unknown>) =>
  new ToolError('OODS-N021', `design.preview: ${reason}`, { dependency: 'preview-host', ...details });

async function probeHost(hostUrl: string): Promise<HostStatus> {
  let status: HostStatus;
  try {
    const response = await fetch(`${hostUrl}/preview/status`, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    status = await response.json() as HostStatus;
  } catch (error) {
    throw unreachable(`the preview host at ${hostUrl} did not answer /preview/status (${error instanceof Error ? error.message : String(error)}); call through the HTTP bridge or the stdio adapter, which host it`, { hostUrl });
  }
  if (!status.running) throw unreachable(`the preview host at ${hostUrl} reports it is not running`, { hostUrl, status });
  return status;
}

/** Open a composition version (or compose a new one) as the generated app running in the preview host. */
export async function handle(input: DesignPreviewInputSchema.DesignPreviewInput, context?: ToolContext): Promise<DesignPreviewOutputSchema.DesignPreviewOutput> {
  const started = performance.now();
  const hostUrl = resolvePreviewHostUrl(context);
  if (!hostUrl) throw unreachable('no preview host is configured; call through the HTTP bridge or the stdio adapter, which host it, or set OODS_PREVIEW_HOST_URL to a running host', { hostUrl: null });
  const status = await probeHost(hostUrl);
  const compositionsDir = resolveCompositionsDir();
  if (path.resolve(status.compositionsDir) !== compositionsDir) {
    throw unreachable(`the preview host reads ${status.compositionsDir} but this server writes ${compositionsDir}; both must resolve the same MCP_SCHEMA_STORE_ROOT`, { hostUrl, hostCompositionsDir: status.compositionsDir, compositionsDir });
  }
  if (status.platform && !status.platform.supported) {
    throw unreachable(`the preview host cannot compile on ${status.platform.os}-${status.platform.arch}: ${status.platform.reason ?? 'no esbuild binary shipped for this platform'}`, { hostUrl, platform: status.platform });
  }
  if (!input.compositionId && !(input.object && input.context)) {
    throw new ToolError('OODS-V203', 'design.preview needs either compositionId (with an optional version) or object and context', { input: Object.keys(input) });
  }

  // The version to open: an existing one, or the first version of a fresh composition.
  let record: CompositionVersion;
  if (input.compositionId) {
    const version = input.version ?? await latestVersion(compositionsDir, input.compositionId);
    record = await readVersion(compositionsDir, input.compositionId, version);
  } else {
    const theme = (input.preferences?.theme ?? 'light') as PreviewTheme;
    const brand = (input.preferences?.brand ?? 'A') as PreviewBrand;
    const composition = await compose({ object: input.object!, context: input.context!, preferences: { ...(input.preferences ?? {}), theme, brand } });
    if (composition.status !== 'ok' || !composition.schema || !composition.compositionId || !composition.version) throw new Error(`Composition failed: ${JSON.stringify(composition.errors ?? composition)}`);
    record = await readVersion(compositionsDir, composition.compositionId, composition.version);
  }
  const object = String(record.compose.object ?? '');
  const viewContext = String(record.compose.context ?? '');
  const brand = (input.preferences?.brand ?? record.brand) as PreviewBrand;
  const theme = (input.preferences?.theme ?? record.theme) as PreviewTheme;

  // The deterministic field model, seeded once per version with the same policy as the design loop.
  let model = record.model;
  if (!model) {
    let workflowSchema: CompositionVersion['schema'] | undefined;
    if (viewContext !== 'workflow' && object && object !== 'Chunk') {
      const workflow = await compose({ object, context: 'workflow', options: { transient: true } });
      if (workflow.status !== 'ok' || !workflow.schema) throw new Error(`Seed composition failed: ${JSON.stringify(workflow.errors ?? workflow)}`);
      workflowSchema = workflow.schema;
    }
    model = seedPreviewModel({ schema: record.schema, context: viewContext, object: object || undefined, workflowSchema });
  }

  // Generate what the version does not carry yet; a version's artifacts are keyed by its schema hash.
  const frameworks: PreviewFramework[] = input.framework && input.framework !== 'both' ? [input.framework] : ['react', 'vue'];
  const artifacts: CompositionVersion['artifacts'] = {};
  for (const framework of frameworks) {
    if (record.artifacts[framework]) continue;
    const generated = await generate({ schema: record.schema, framework, profile: 'build', options: { theme: record.theme, brand: record.brand } });
    if (generated.status !== 'ok' || !generated.artifact) throw new Error(`Generation failed (${framework}): ${JSON.stringify(generated.errors)}`);
    const issues = validateGeneratedArtifact(generated.artifact);
    if (issues.length) throw new Error(issues.join('\n'));
    artifacts[framework] = { artifact: generated.artifact, generatedAt: new Date().toISOString() };
  }
  if (Object.keys(artifacts).length || !record.model) record = await attachToVersion(compositionsDir, record.compositionId, record.version, { artifacts, model });

  const base = `${hostUrl}/preview/${record.compositionId}/${record.version}`;
  const previews: PreviewEntry[] = [];
  for (const framework of frameworks) {
    const query = `framework=${framework}&brand=${brand}&theme=${theme}`;
    const moduleUrl = `${base}/module.js?framework=${framework}`;
    // Compile now, so a broken artifact is this call's failure rather than a blank page later.
    const response = await fetch(moduleUrl, { signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS) });
    const body = await response.text();
    if (!response.ok) throw new Error(`The preview host could not compile the ${framework} artifact (HTTP ${response.status}): ${body.slice(0, 2000)}`);
    previews.push({
      framework, url: `${base}?${query}`, appUrl: `${base}/app?${query}`, moduleUrl,
      artifactContentHash: record.artifacts[framework]!.artifact.contentHash,
      compiled: { bytes: Buffer.byteLength(body), sha256: digest(body) },
    });
  }

  return {
    status: 'ok',
    compositionId: record.compositionId, version: record.version, parentVersion: record.parentVersion, operation: record.operation, head: record.head,
    schemaHash: record.schemaHash, object, context: viewContext,
    previewUrl: previews[0]!.url, previews: previews as DesignPreviewOutputSchema.DesignPreviewOutput['previews'],
    host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir },
    brand, theme, recordPath: versionPath(compositionsDir, record.compositionId, record.version), durationMs: performance.now() - started,
  };
}
