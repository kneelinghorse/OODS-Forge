import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GeneratedArtifact } from '../codegen/types.js';
import { SchemaStore } from '../schema-store/index.js';
import type { UiSchema } from '../schemas/generated.js';

export const PREVIEW_RECORD_VERSION = '1';
/** Sixteen hex characters of the schema hash; the bridge preview host applies the same rule to URLs. */
export const PREVIEW_KEY_PATTERN = /^[a-f0-9]{16}$/;
export type PreviewFramework = 'react' | 'vue';
export type PreviewTheme = 'light' | 'dark' | 'hc';
export type PreviewBrand = 'A' | 'B';

export interface PreviewRecord {
  version: typeof PREVIEW_RECORD_VERSION;
  key: string;
  schemaHash: string;
  createdAt: string;
  /** The Forge head that generated the record (dist/build-revision.json), null from a source run. */
  head: string | null;
  compose: { object: string; context: string; preferences?: Record<string, unknown> };
  brand: PreviewBrand;
  theme: PreviewTheme;
  schema: UiSchema;
  /** The deterministic field model the page mounts with; the design loop uses the same one. */
  model: Record<string, unknown>;
  frameworks: Partial<Record<PreviewFramework, { artifact: GeneratedArtifact }>>;
}

/** Previews live beside the saved-schema store: <store>/../previews, so the same env moves both. */
export function resolvePreviewStoreDir(env: NodeJS.ProcessEnv = process.env): string {
  const store = new SchemaStore({
    ...(env.MCP_SCHEMA_STORE_ROOT ? { projectRoot: env.MCP_SCHEMA_STORE_ROOT } : {}),
    ...(env.MCP_SCHEMA_STORE_DIR ? { storeDir: env.MCP_SCHEMA_STORE_DIR } : {}),
  });
  return path.resolve(store.storeDir, '..', 'previews');
}

export function previewKey(schemaHash: string): string {
  const hex = schemaHash.replace(/^sha256:/, '');
  if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error(`Preview keys derive from a sha256 schema hash, received ${schemaHash}`);
  return hex.slice(0, 16);
}

export function isSafePreviewKey(key: string): boolean {
  return PREVIEW_KEY_PATTERN.test(key);
}

export function previewRecordPath(directory: string, key: string): string {
  if (!isSafePreviewKey(key)) throw new Error(`Unsafe preview key: ${key}`);
  return path.join(directory, `${key}.json`);
}

export async function writePreviewRecord(directory: string, record: PreviewRecord): Promise<string> {
  const file = previewRecordPath(directory, record.key);
  await fsp.mkdir(directory, { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(temporary, JSON.stringify(record, null, 2) + '\n');
  await fsp.rename(temporary, file);
  return file;
}

export async function readPreviewRecord(directory: string, key: string): Promise<PreviewRecord | undefined> {
  const file = previewRecordPath(directory, key);
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8')) as PreviewRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

/** The packaged build head, when this module runs from dist; a source checkout reports null. */
export function readForgeHead(): string | null {
  const stamp = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../build-revision.json');
  if (!fs.existsSync(stamp)) return null;
  const revision = JSON.parse(fs.readFileSync(stamp, 'utf8')) as { commit?: string };
  return typeof revision.commit === 'string' && /^[0-9a-f]{40}$/.test(revision.commit) ? revision.commit : null;
}
