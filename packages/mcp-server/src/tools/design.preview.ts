import { createHash } from 'node:crypto';
import path from 'node:path';
import { validateGeneratedArtifact } from '../codegen/artifact-envelope.js';
import { seedPreviewModel } from '../codegen/preview-model.js';
import { ToolError } from '../errors/tool-error.js';
import { previewKey, readForgeHead, resolvePreviewStoreDir, writePreviewRecord, type PreviewBrand, type PreviewFramework, type PreviewRecord, type PreviewTheme } from '../lib/preview-store.js';
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
  previewsDir: string;
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

/** Compose, generate and store the preview record; the host compiles and serves it as a running app. */
export async function handle(input: DesignPreviewInputSchema.DesignPreviewInput, context?: ToolContext): Promise<DesignPreviewOutputSchema.DesignPreviewOutput> {
  const started = performance.now();
  const hostUrl = resolvePreviewHostUrl(context);
  if (!hostUrl) throw unreachable('no preview host is configured; call through the HTTP bridge or the stdio adapter, which host it, or set OODS_PREVIEW_HOST_URL to a running host', { hostUrl: null });
  const status = await probeHost(hostUrl);
  const previewsDir = resolvePreviewStoreDir();
  if (path.resolve(status.previewsDir) !== previewsDir) {
    throw unreachable(`the preview host reads ${status.previewsDir} but this server writes ${previewsDir}; both must resolve the same MCP_SCHEMA_STORE_ROOT`, { hostUrl, hostPreviewsDir: status.previewsDir, previewsDir });
  }
  if (status.platform && !status.platform.supported) {
    throw unreachable(`the preview host cannot compile on ${status.platform.os}-${status.platform.arch}: ${status.platform.reason ?? 'no esbuild binary shipped for this platform'}`, { hostUrl, platform: status.platform });
  }

  const theme = (input.preferences?.theme ?? 'light') as PreviewTheme;
  const brand = (input.preferences?.brand ?? 'A') as PreviewBrand;
  const preferences = { ...(input.preferences ?? {}), theme, brand };
  const composition = await compose({ object: input.object, context: input.context, preferences });
  if (composition.status !== 'ok' || !composition.schema) throw new Error(`Composition failed: ${JSON.stringify(composition.errors ?? composition)}`);
  const schemaHash = digest(JSON.stringify(composition.schema));
  const key = previewKey(schemaHash);

  let workflowSchema: PreviewRecord['schema'] | undefined;
  if (input.context !== 'workflow' && input.object !== 'Chunk') {
    // The preview uses the same object/trait seed records as its workflow app.
    const workflow = await compose({ object: input.object, context: 'workflow' });
    if (workflow.status !== 'ok' || !workflow.schema) throw new Error(`Seed composition failed: ${JSON.stringify(workflow.errors ?? workflow)}`);
    workflowSchema = workflow.schema;
  }
  const model = seedPreviewModel({ schema: composition.schema, context: input.context, object: input.object, workflowSchema });

  const frameworks: PreviewFramework[] = input.framework && input.framework !== 'both' ? [input.framework] : ['react', 'vue'];
  const record: PreviewRecord = {
    version: '1', key, schemaHash, createdAt: new Date().toISOString(), head: readForgeHead(),
    compose: { object: input.object, context: input.context, ...(input.preferences ? { preferences: input.preferences } : {}) },
    brand, theme, schema: composition.schema, model, frameworks: {},
  };
  for (const framework of frameworks) {
    const generated = await generate({ schema: composition.schema, framework, profile: 'build', options: { theme, brand } });
    if (generated.status !== 'ok' || !generated.artifact) throw new Error(`Generation failed (${framework}): ${JSON.stringify(generated.errors)}`);
    const issues = validateGeneratedArtifact(generated.artifact);
    if (issues.length) throw new Error(issues.join('\n'));
    record.frameworks[framework] = { artifact: generated.artifact };
  }
  const recordPath = await writePreviewRecord(previewsDir, record);

  const previews: PreviewEntry[] = [];
  for (const framework of frameworks) {
    const url = `${hostUrl}/preview/${key}?framework=${framework}`;
    const moduleUrl = `${hostUrl}/preview/${key}/module.js?framework=${framework}`;
    // Compile now, so a broken artifact is this call's failure rather than a blank page later.
    const response = await fetch(moduleUrl, { signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS) });
    const body = await response.text();
    if (!response.ok) throw new Error(`The preview host could not compile the ${framework} artifact (HTTP ${response.status}): ${body.slice(0, 2000)}`);
    previews.push({
      framework, url, moduleUrl,
      artifactContentHash: record.frameworks[framework]!.artifact.contentHash,
      compiled: { bytes: Buffer.byteLength(body), sha256: digest(body) },
    });
  }

  return {
    status: 'ok', schemaHash, key,
    previewUrl: previews[0]!.url, previews: previews as DesignPreviewOutputSchema.DesignPreviewOutput['previews'],
    host: { url: hostUrl, port: Number(new URL(hostUrl).port), previewsDir },
    brand, theme, recordPath, durationMs: performance.now() - started,
  };
}
