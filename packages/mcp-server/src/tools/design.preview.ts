import { createHash } from 'node:crypto';
import path from 'node:path';
import { validateGeneratedArtifact } from '../codegen/artifact-envelope.js';
import { seedPreviewModel } from '../codegen/preview-model.js';
import { certifyPlacedCharts } from '../lib/measurements.js';
import { ToolError } from '../errors/tool-error.js';
import { attachToVersion, latestVersion, listVersions, readVersion, resolveCompositionsDir, versionPath, type CompositionVersion, type PreviewBrand, type PreviewFramework, type PreviewTheme } from '../lib/composition-store.js';
import { fieldKeyOf } from './design.compose.js';
import type { UiElement } from '../schemas/generated.js';
import type { ToolContext } from '../lib/tool-context.js';
import type { DesignPreviewInputSchema, DesignPreviewOutputSchema } from '../schemas/generated.js';
import { handle as generate } from './code.generate.js';
import { handle as compose } from './design.compose.js';

type DesignPreviewOutput = DesignPreviewOutputSchema.DesignPreviewOutput;
type RenderOutput = Exclude<DesignPreviewOutput, { action: 'compare' } | { action: 'versions' }>;
type CompareOutput = Extract<DesignPreviewOutput, { action: 'compare' }>;
type VersionsOutput = Extract<DesignPreviewOutput, { action: 'versions' }>;
type EditInput = NonNullable<DesignPreviewInputSchema.DesignPreviewInput['edit']>;
type PreviewEntry = RenderOutput['previews'][number];
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

/** Open a composition version (or compose a new one) as the generated app running in the preview host; or compare two versions. */
export async function handle(input: DesignPreviewInputSchema.DesignPreviewInput, context?: ToolContext): Promise<DesignPreviewOutput> {
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
  if (input.action === 'compare') return compare(input, hostUrl, compositionsDir, started);
  if (input.action === 'versions') return versions(input, hostUrl, compositionsDir, started);

  // The version to open: an existing one, the first version of a fresh composition, or the version an edit records.
  let record: CompositionVersion;
  let edit: RenderOutput['edit'] = undefined;
  if (input.action === 'edit') {
    if (!input.compositionId || !input.edit) throw new ToolError('OODS-V204', 'design.preview action edit needs compositionId (with version) and edit.operation', { input: Object.keys(input) });
    const parentVersion = input.version ?? await latestVersion(compositionsDir, input.compositionId);
    const parent = await readVersion(compositionsDir, input.compositionId, parentVersion);
    record = await applyEdit(compositionsDir, parent, input.edit);
    edit = { operation: input.edit.operation, parentVersion };
  } else if (input.compositionId) {
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
      // The seed records are the version's own: the same seed drives the workflow composition the model is drawn from.
      const workflow = await compose({ object, context: 'workflow', ...(record.schema.seed ? { preferences: { seed: record.schema.seed } } : {}), options: { transient: true } });
      if (workflow.status !== 'ok' || !workflow.schema) throw new Error(`Seed composition failed: ${JSON.stringify(workflow.errors ?? workflow)}`);
      workflowSchema = workflow.schema;
    }
    model = seedPreviewModel({ schema: record.schema, context: viewContext, object: object || undefined, workflowSchema });
  }

  // Generate what the version does not carry yet; a version's artifacts are keyed by its schema hash.
  const frameworks: PreviewFramework[] = input.framework && input.framework !== 'both' ? [input.framework] : ['react', 'vue'];
  const artifacts: CompositionVersion['artifacts'] = {};
  const measurements: Record<string, unknown> = {};
  const validation = { ...((record.measurements.validation as Record<string, unknown> | undefined) ?? {}) };
  for (const framework of frameworks) {
    if (record.artifacts[framework]) continue;
    const generated = await generate({ schema: record.schema, framework, profile: 'build', options: { theme: record.theme, brand: record.brand } });
    if (generated.status !== 'ok' || !generated.artifact) throw new Error(`Generation failed (${framework}): ${JSON.stringify(generated.errors)}`);
    const issues = validateGeneratedArtifact(generated.artifact);
    if (issues.length) throw new Error(issues.join('\n'));
    artifacts[framework] = { artifact: generated.artifact, generatedAt: new Date().toISOString() };
    // The generation receipt is stored as code.generate returned it: the checks that ran and notChecked.
    validation[framework] = generated.validationReceipt;
    measurements.validation = validation;
  }
  // Every placed chart is certified once per version, in the scope the artifacts were generated for.
  if (!record.measurements.charts) measurements.charts = await certifyPlacedCharts(record.schema, { theme: record.theme, brand: record.brand });
  if (Object.keys(artifacts).length || !record.model || Object.keys(measurements).length) record = await attachToVersion(compositionsDir, record.compositionId, record.version, { artifacts, model, measurements });

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
    status: 'ok', action: edit ? 'edit' : 'render', ...(edit ? { edit } : {}),
    compositionId: record.compositionId, version: record.version, parentVersion: record.parentVersion, operation: record.operation, head: record.head,
    schemaHash: record.schemaHash, object, context: viewContext,
    previewUrl: previews[0]!.url, previews: previews as RenderOutput['previews'],
    host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir },
    brand, theme, recordPath: versionPath(compositionsDir, record.compositionId, record.version),
    measured: summarizeMeasurements(record), editable: editableOf(record), durationMs: performance.now() - started,
  };
}

/** What an edit may name on a version: its regions, its slots with the composer's candidates, its field order, its seed. */
export function editableOf(record: CompositionVersion): RenderOutput['editable'] {
  const screen = record.schema.screens[0];
  const regions = (screen?.children ?? []).map(node => ({ id: node.id, component: node.component }));
  const fields: Record<string, string[]> = {};
  for (const region of screen?.children ?? []) {
    const names: string[] = [];
    const walk = (node: UiElement) => { for (const child of node.children ?? []) { const key = fieldKeyOf(child); if (key && !names.includes(key)) names.push(key); if (!/^slot-/.test(child.id)) walk(child); } };
    walk(region);
    fields[region.id] = names;
  }
  return {
    regions,
    slots: record.slots.map(slot => ({ slotName: slot.slotName, selectedComponent: slot.selectedComponent ?? null, candidates: slot.candidates ?? (slot.selectedComponent ? [slot.selectedComponent] : []) })),
    fields,
    seed: record.schema.seed ?? null,
  };
}

const refuse = (reason: string, details: Record<string, unknown>) => new ToolError('OODS-V204', `design.preview action edit: ${reason}`, details);

/**
 * One edit = one new version: the parent's compose inputs re-composed through the override surface
 * with exactly the operation's change, recorded with the parent and the operation. The parent's
 * file is never written. The schema is produced by the composer, never edited by hand.
 */
async function applyEdit(compositionsDir: string, parent: CompositionVersion, edit: EditInput): Promise<CompositionVersion> {
  const editable = editableOf(parent);
  const { compositionId: _id, parentVersion: _parent, options: parentOptions, ...compose_ } = parent.compose as Record<string, unknown> & { options?: Record<string, unknown> };
  const preferences = { ...((compose_.preferences as Record<string, unknown> | undefined) ?? {}) };
  switch (edit.operation) {
    case 'reorder-region': {
      if (!edit.regionOrder?.length) throw refuse('reorder-region needs regionOrder', { editable: editable.regions });
      const ids = editable.regions.map(region => region.id);
      const unknown = edit.regionOrder.filter(id => !ids.includes(id));
      if (unknown.length) throw refuse(`regionOrder names regions this version does not have: ${unknown.join(', ')}`, { regionOrder: edit.regionOrder, regions: ids });
      if (JSON.stringify([...edit.regionOrder, ...ids.filter(id => !edit.regionOrder!.includes(id))]) === JSON.stringify(ids)) throw refuse('regionOrder leaves the regions where they are', { regionOrder: edit.regionOrder, regions: ids });
      preferences.regionOrder = edit.regionOrder;
      break;
    }
    case 'swap-slot': {
      if (!edit.slot || !edit.component) throw refuse('swap-slot needs slot and component', { editable: editable.slots });
      const slot = editable.slots.find(entry => entry.slotName === edit.slot);
      if (!slot) throw refuse(`this version has no slot ${edit.slot}`, { slot: edit.slot, slots: editable.slots.map(entry => entry.slotName) });
      if (!slot.candidates.includes(edit.component)) throw refuse(`${edit.component} is not one of the composer's candidates for slot ${edit.slot}`, { slot: edit.slot, component: edit.component, candidates: slot.candidates });
      if (slot.selectedComponent === edit.component) throw refuse(`slot ${edit.slot} already leads with ${edit.component}`, { slot: edit.slot, component: edit.component });
      preferences.componentOverrides = { ...((preferences.componentOverrides as Record<string, string> | undefined) ?? {}), [edit.slot]: edit.component };
      break;
    }
    case 'reorder-fields': {
      if (!edit.region || !edit.fieldOrder?.length) throw refuse('reorder-fields needs region and fieldOrder', { editable: editable.fields });
      const current = editable.fields[edit.region];
      if (!current) throw refuse(`this version has no region ${edit.region}`, { region: edit.region, regions: Object.keys(editable.fields) });
      const unknown = edit.fieldOrder.filter(field => !current.includes(field));
      if (unknown.length) throw refuse(`fieldOrder names fields region ${edit.region} does not carry: ${unknown.join(', ')}`, { region: edit.region, fieldOrder: edit.fieldOrder, fields: current });
      if (JSON.stringify([...edit.fieldOrder, ...current.filter(field => !edit.fieldOrder!.includes(field))]) === JSON.stringify(current)) throw refuse('fieldOrder leaves the fields where they are', { region: edit.region, fieldOrder: edit.fieldOrder, fields: current });
      preferences.fieldOrder = { ...((preferences.fieldOrder as Record<string, string[]> | undefined) ?? {}), [edit.region]: edit.fieldOrder };
      break;
    }
    case 'seed': {
      if (!edit.seed) throw refuse('seed needs a seed string', { seed: editable.seed });
      if (edit.seed === editable.seed) throw refuse('the seed is unchanged', { seed: edit.seed });
      preferences.seed = edit.seed;
      break;
    }
    default: throw refuse(`unknown operation ${String((edit as { operation: string }).operation)}`, { operations: ['reorder-region', 'swap-slot', 'reorder-fields', 'seed'] });
  }
  const composed = await compose({ ...(compose_ as object), preferences, compositionId: parent.compositionId, parentVersion: parent.version, options: { ...(parentOptions ?? {}), transient: false, operation: edit.operation } } as Parameters<typeof compose>[0]);
  if (composed.status !== 'ok' || !composed.compositionId || !composed.version) throw new Error(`Re-composition failed: ${JSON.stringify(composed.errors ?? composed)}`);
  return readVersion(compositionsDir, composed.compositionId, composed.version);
}

/** The composition's versions with their lineage and the URL each opens at. */
async function versions(input: DesignPreviewInputSchema.DesignPreviewInput, hostUrl: string, compositionsDir: string, started: number): Promise<VersionsOutput> {
  if (!input.compositionId) throw new ToolError('OODS-V203', 'design.preview action versions needs compositionId', { input: Object.keys(input) });
  const entries = await listVersions(compositionsDir, input.compositionId);
  return {
    status: 'ok', action: 'versions', compositionId: input.compositionId, latest: entries.at(-1)!.version,
    versions: entries.map(entry => ({ ...entry, url: `${hostUrl}/preview/${input.compositionId}/${entry.version}` })),
    host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir }, durationMs: performance.now() - started,
  };
}

/** What the version carries as measured, and what it does not; the panel says the same. */
function summarizeMeasurements(record: CompositionVersion): RenderOutput['measured'] {
  const validation = (record.measurements.validation as Record<string, unknown> | undefined) ?? {};
  const charts = (record.measurements.charts as Array<{ path: string; certification: { conformant: boolean | null } }> | undefined) ?? [];
  const axe = (record.measurements.axe as Record<string, Record<string, unknown>> | undefined) ?? {};
  return {
    validation: (['react', 'vue'] as const).filter(framework => validation[framework]),
    charts: { placed: charts.length, conformant: charts.filter(chart => chart.certification.conformant === true).length, notConformant: charts.filter(chart => chart.certification.conformant === false).length, uncertified: charts.filter(chart => chart.certification.conformant === null).length },
    axe: Object.entries(axe).flatMap(([framework, scopes]) => Object.keys(scopes).sort().map(scope => `${framework}:${scope}`)),
    notMeasured: [
      ...(['react', 'vue'] as const).filter(framework => record.artifacts[framework] && !validation[framework]).map(framework => `validation:${framework}`),
      ...(record.measurements.charts ? [] : ['charts']),
      ...(['react', 'vue'] as const).filter(framework => record.artifacts[framework]).flatMap(framework => ['A/light', 'A/dark', 'A/hc', 'B/light', 'B/dark', 'B/hc'].filter(scope => !axe[framework]?.[scope]).map(scope => `axe:${framework}:${scope}`)),
    ],
  };
}

/** The same what-changed the compare page shows, from the host that computes it over the two version records. */
async function compare(input: DesignPreviewInputSchema.DesignPreviewInput, hostUrl: string, compositionsDir: string, started: number): Promise<CompareOutput> {
  if (!input.compositionId || !input.against) throw new ToolError('OODS-V203', 'design.preview action compare needs compositionId (with version) on the left and against.version on the right', { input: Object.keys(input) });
  const leftVersion = input.version ?? await latestVersion(compositionsDir, input.compositionId);
  const rightId = input.against.compositionId ?? input.compositionId;
  const left = await readVersion(compositionsDir, input.compositionId, leftVersion);
  const right = await readVersion(compositionsDir, rightId, input.against.version);
  const frameworks = (['react', 'vue'] as PreviewFramework[]).filter(framework => left.artifacts[framework] && right.artifacts[framework]);
  const pair = `${left.compositionId}@${left.version}/${right.compositionId}@${right.version}`;
  const diffUrl = `${hostUrl}/compare/${pair}/diff.json`;
  const response = await fetch(diffUrl, { signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS) });
  if (!response.ok) throw unreachable(`the preview host could not compare ${pair} (HTTP ${response.status}): ${(await response.text()).slice(0, 500)}`, { hostUrl, pair });
  const diff = await response.json() as CompareOutput['diff'];
  const brand = (input.preferences?.brand ?? left.brand) as PreviewBrand;
  const theme = (input.preferences?.theme ?? left.theme) as PreviewTheme;
  const framework = input.framework && input.framework !== 'both' && frameworks.includes(input.framework) ? input.framework : frameworks[0];
  return {
    status: 'ok', action: 'compare', left: diff.left, right: diff.right,
    compareUrl: `${hostUrl}/compare/${pair}${framework ? `?framework=${framework}&brand=${brand}&theme=${theme}` : ''}`, diffUrl, frameworks,
    identical: diff.identical, differenceCount: diff.differenceCount, diff,
    host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir }, durationMs: performance.now() - started,
  };
}
