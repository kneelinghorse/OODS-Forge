import { randomBytes } from 'node:crypto';
import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import type { GeneratedArtifact } from '../codegen/types.js';
import { ToolError } from '../errors/tool-error.js';
import { SchemaStore } from '../schema-store/index.js';
import type { UiSchema } from '../schemas/generated.js';

/** cmp- plus twelve hex characters; the preview host applies the same rule to URLs. */
export const COMPOSITION_ID_PATTERN = /^cmp-[a-f0-9]{12}$/;
export const COMPOSITION_RECORD_VERSION = '1';
export type CompositionOperation = 'compose' | 'recompose' | 'reorder-region' | 'swap-slot' | 'reorder-fields' | 'seed';
export type PreviewFramework = 'react' | 'vue';
export type PreviewTheme = 'light' | 'dark' | 'hc';
export type PreviewBrand = 'A' | 'B';

export interface CompositionVersion {
  recordVersion: typeof COMPOSITION_RECORD_VERSION;
  compositionId: string;
  version: number;
  /** The version this one was produced from; null for the first. */
  parentVersion: number | null;
  operation: CompositionOperation;
  createdAt: string;
  /** The Forge head that produced it (dist/build-revision.json), null from a source run. */
  head: string | null;
  /** The compose inputs, replayable. */
  compose: Record<string, unknown>;
  schema: UiSchema;
  schemaHash: string;
  /** What the artifacts were generated for; the page can re-mount in any scope. */
  brand: PreviewBrand;
  theme: PreviewTheme;
  /** Slot name → leading component, for lineage and compare. */
  slots: Array<{ slotName: string; selectedComponent?: string; placedComponents?: string[]; candidates?: string[] }>;
  /** Attached by design.preview: the deterministic field model the page mounts with. */
  model?: Record<string, unknown>;
  /** Attached by design.preview: the generated artifact per framework, keyed by the same schemaHash. */
  artifacts: Partial<Record<PreviewFramework, { artifact: GeneratedArtifact; generatedAt: string }>>;
  /** Attached by measurement (m04). */
  measurements: Record<string, unknown>;
}

export interface CompositionVersionSummary { version: number; parentVersion: number | null; operation: CompositionOperation; createdAt: string; schemaHash: string; head: string | null; artifacts: PreviewFramework[] }

/** Compositions live beside the saved-schema store: <store>/../compositions, so the same env moves both. */
export function resolveCompositionsDir(env: NodeJS.ProcessEnv = process.env): string {
  const store = new SchemaStore({
    ...(env.MCP_SCHEMA_STORE_ROOT ? { projectRoot: env.MCP_SCHEMA_STORE_ROOT } : {}),
    ...(env.MCP_SCHEMA_STORE_DIR ? { storeDir: env.MCP_SCHEMA_STORE_DIR } : {}),
  });
  return path.resolve(store.storeDir, '..', 'compositions');
}

export const newCompositionId = (): string => `cmp-${randomBytes(6).toString('hex')}`;
export const isSafeCompositionId = (value: unknown): value is string => typeof value === 'string' && COMPOSITION_ID_PATTERN.test(value);
export const isSafeVersion = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 1_000_000;

const notFound = (compositionId: string, version?: number) =>
  new ToolError('OODS-N022', version === undefined ? `Composition ${compositionId} is not in the store` : `Composition ${compositionId} has no version ${version}`, { compositionId, ...(version === undefined ? {} : { version }) });

export function versionPath(directory: string, compositionId: string, version: number): string {
  if (!isSafeCompositionId(compositionId)) throw new ToolError('OODS-V203', `Composition ids are cmp- plus twelve hex characters, not ${JSON.stringify(compositionId)}`, { compositionId });
  if (!isSafeVersion(version)) throw new ToolError('OODS-V203', `Composition versions are positive integers, not ${JSON.stringify(version)}`, { compositionId, version });
  return path.join(directory, compositionId, 'versions', `${version}.json`);
}

export async function listVersions(directory: string, compositionId: string): Promise<CompositionVersionSummary[]> {
  const folder = path.dirname(versionPath(directory, compositionId, 1));
  let names: string[];
  try { names = await fsp.readdir(folder); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw notFound(compositionId); throw error; }
  const versions = names.map(name => /^(\d+)\.json$/.exec(name)?.[1]).filter((value): value is string => Boolean(value)).map(Number).sort((a, b) => a - b);
  const summaries: CompositionVersionSummary[] = [];
  for (const version of versions) {
    const record = await readVersion(directory, compositionId, version);
    summaries.push({ version: record.version, parentVersion: record.parentVersion, operation: record.operation, createdAt: record.createdAt, schemaHash: record.schemaHash, head: record.head, artifacts: Object.keys(record.artifacts ?? {}) as PreviewFramework[] });
  }
  return summaries;
}

export async function latestVersion(directory: string, compositionId: string): Promise<number> {
  const versions = await listVersions(directory, compositionId);
  const last = versions.at(-1);
  if (!last) throw notFound(compositionId);
  return last.version;
}

export async function readVersion(directory: string, compositionId: string, version: number): Promise<CompositionVersion> {
  const file = versionPath(directory, compositionId, version);
  let raw: string;
  try { raw = await fsp.readFile(file, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw notFound(compositionId, version); throw error; }
  const record = JSON.parse(raw) as CompositionVersion;
  if (record.recordVersion !== COMPOSITION_RECORD_VERSION || record.compositionId !== compositionId || record.version !== version) throw new Error(`Malformed composition record: ${file}`);
  return record;
}

/** A version is written once (flag wx): no operation ever overwrites an existing version's schema. */
export async function writeVersion(directory: string, record: CompositionVersion): Promise<string> {
  const file = versionPath(directory, record.compositionId, record.version);
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  return file;
}

/** The next free version number and the parent it derives from. */
export async function nextVersion(directory: string, compositionId: string, parentVersion?: number): Promise<{ version: number; parentVersion: number }> {
  const versions = await listVersions(directory, compositionId);
  const latest = versions.at(-1)!.version;
  const parent = parentVersion ?? latest;
  if (!versions.some(entry => entry.version === parent)) throw notFound(compositionId, parent);
  return { version: latest + 1, parentVersion: parent };
}

/**
 * Attach derived, deterministic data (artifacts, model, measurements) to an existing version. The
 * schema is asserted unchanged; the file is replaced atomically.
 */
export async function attachToVersion(directory: string, compositionId: string, version: number, patch: Partial<Pick<CompositionVersion, 'artifacts' | 'model' | 'measurements'>>): Promise<CompositionVersion> {
  const record = await readVersion(directory, compositionId, version);
  const updated: CompositionVersion = { ...record, ...(patch.model ? { model: patch.model } : {}), artifacts: { ...record.artifacts, ...(patch.artifacts ?? {}) }, measurements: { ...record.measurements, ...(patch.measurements ?? {}) } };
  const file = versionPath(directory, compositionId, version);
  const temporary = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(temporary, JSON.stringify(updated, null, 2) + '\n');
  await fsp.rename(temporary, file);
  return updated;
}

/** The packaged build head, when this module runs from dist; a source checkout reports null. */
export function readForgeHead(): string | null {
  const stamp = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../build-revision.json');
  if (!fs.existsSync(stamp)) return null;
  const revision = JSON.parse(fs.readFileSync(stamp, 'utf8')) as { commit?: string };
  return typeof revision.commit === 'string' && /^[0-9a-f]{40}$/.test(revision.commit) ? revision.commit : null;
}
