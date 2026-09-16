import fs from 'node:fs';
import path from 'node:path';

/** cmp- plus twelve hex characters; packages/mcp-server/src/lib/composition-store.ts applies the same rule. */
export const COMPOSITION_ID_PATTERN = /^cmp-[a-f0-9]{12}$/;
const DEFAULT_SCHEMA_STORE_DIR = '.oods/schemas';

export type PreviewFramework = 'react' | 'vue';
export type PreviewBrand = 'A' | 'B';
export type PreviewTheme = 'light' | 'dark' | 'hc';
export interface PreviewArtifactFile { path: string; contents: string; contentHash: string }
export interface PreviewArtifact { framework: PreviewFramework; files: PreviewArtifactFile[]; actions: Array<{ name: string }>; contentHash: string }
export interface CompositionVersion {
  recordVersion: string;
  compositionId: string;
  version: number;
  parentVersion: number | null;
  operation: string;
  createdAt: string;
  head: string | null;
  compose: { object?: string; context?: string; intent?: string; preferences?: Record<string, unknown> } & Record<string, unknown>;
  schema: unknown;
  schemaHash: string;
  brand: PreviewBrand;
  theme: PreviewTheme;
  slots: Array<{ slotName: string; selectedComponent?: string; placedComponents?: string[]; candidates?: string[] }>;
  model?: Record<string, unknown>;
  artifacts: Partial<Record<PreviewFramework, { artifact: PreviewArtifact; generatedAt: string }>>;
  measurements: Record<string, unknown>;
  /** Per-scope re-generation (brand/theme → artifacts and chart certifications) when the placed charts were rendered for another scope. */
  scopes?: Record<string, { artifacts: Partial<Record<PreviewFramework, { artifact: PreviewArtifact; generatedAt: string }>>; charts?: unknown[] }>;
  /**
   * The decisions and evidence the caller supplied about this object (s203 m05), keyed to it and stored
   * on the version so they travel with the lineage. Forge fetched none of it and reads no other
   * product's store; the panel shows each item's provenance because that is the only reason to trust it.
   */
  context?: {
    object: string;
    urn: string;
    attachedAt: string;
    attachedToVersion: number;
    items: Array<{ source: string; id: string; title: string; body?: string; excerpt?: string; url?: string; timestamp?: string; query: string; fetchedAt: string; staleForVersion: boolean }>;
    searched: Array<{ source: string; query: string; fetchedAt: string; found: number }>;
  };
}
export interface VersionSummary { version: number; parentVersion: number | null; operation: string; createdAt: string; schemaHash: string; head: string | null; artifacts: PreviewFramework[] }

/**
 * The same resolution the native server's SchemaStore applies: MCP_SCHEMA_STORE_ROOT (default: the
 * server's cwd, packages/mcp-server), MCP_SCHEMA_STORE_DIR (default .oods/schemas), compositions beside it.
 */
export function resolveCompositionsDir(serverCwd: string, env: NodeJS.ProcessEnv = process.env): string {
  const projectRoot = path.resolve(env.MCP_SCHEMA_STORE_ROOT || serverCwd);
  const storeDir = env.MCP_SCHEMA_STORE_DIR
    ? (path.isAbsolute(env.MCP_SCHEMA_STORE_DIR) ? path.resolve(env.MCP_SCHEMA_STORE_DIR) : path.resolve(projectRoot, env.MCP_SCHEMA_STORE_DIR))
    : path.resolve(projectRoot, DEFAULT_SCHEMA_STORE_DIR);
  return path.resolve(storeDir, '..', 'compositions');
}

export const isSafeCompositionId = (value: unknown): value is string => typeof value === 'string' && COMPOSITION_ID_PATTERN.test(value);
// The scope helpers are browser-safe (the preview app inside the conversation mounts with them too).
export { hasPlacedChart, scopeKey, servedArtifact } from './scope.js';
export const parseVersion = (value: unknown): number | undefined => (typeof value === 'string' && /^[1-9]\d{0,6}$/.test(value) ? Number(value) : undefined);

export function readVersion(directory: string, compositionId: string, version: number): CompositionVersion | undefined {
  if (!isSafeCompositionId(compositionId) || !Number.isInteger(version) || version < 1) throw new Error(`Unsafe composition reference: ${String(compositionId)}@${String(version)}`);
  const file = path.join(directory, compositionId, 'versions', `${version}.json`);
  if (!fs.existsSync(file)) return undefined;
  const record = JSON.parse(fs.readFileSync(file, 'utf8')) as CompositionVersion;
  if (record.recordVersion !== '1' || record.compositionId !== compositionId || record.version !== version || !record.artifacts || typeof record.artifacts !== 'object') throw new Error(`Malformed composition record: ${file}`);
  return record;
}

export function listVersions(directory: string, compositionId: string): VersionSummary[] | undefined {
  if (!isSafeCompositionId(compositionId)) throw new Error(`Unsafe composition id: ${String(compositionId)}`);
  const folder = path.join(directory, compositionId, 'versions');
  if (!fs.existsSync(folder)) return undefined;
  const versions = fs.readdirSync(folder).map(name => /^(\d+)\.json$/.exec(name)?.[1]).filter((value): value is string => Boolean(value)).map(Number).sort((a, b) => a - b);
  return versions.map(version => {
    const record = readVersion(directory, compositionId, version)!;
    return { version: record.version, parentVersion: record.parentVersion, operation: record.operation, createdAt: record.createdAt, schemaHash: record.schemaHash, head: record.head, artifacts: Object.keys(record.artifacts) as PreviewFramework[] };
  });
}

/** The standing acceptance of a composition (the last in accepted.json, written by design.preview action accept) and how many it holds. */
export interface AcceptedSummary { version: number; acceptedAt: string; acceptances: number; supersedes: { version: number; acceptedAt: string } | null }
export function readAccepted(directory: string, compositionId: string): AcceptedSummary | undefined {
  if (!isSafeCompositionId(compositionId)) throw new Error(`Unsafe composition id: ${String(compositionId)}`);
  const file = path.join(directory, compositionId, 'accepted.json');
  if (!fs.existsSync(file)) return undefined;
  const record = JSON.parse(fs.readFileSync(file, 'utf8')) as { recordVersion?: string; compositionId?: string; acceptances?: Array<{ version: number; acceptedAt: string; supersedes?: { version: number; acceptedAt: string } | null }> };
  if (record.recordVersion !== '1' || record.compositionId !== compositionId || !Array.isArray(record.acceptances) || !record.acceptances.length) throw new Error(`Malformed acceptance record: ${file}`);
  const standing = record.acceptances.at(-1)!;
  return { version: standing.version, acceptedAt: standing.acceptedAt, acceptances: record.acceptances.length, supersedes: standing.supersedes ?? null };
}

/** Replace a version file atomically; only measurements may change this way, the schema never does. */
export function writeVersionMeasurements(directory: string, record: CompositionVersion): void {
  const current = readVersion(directory, record.compositionId, record.version);
  if (!current) throw new Error(`Composition ${record.compositionId} version ${record.version} vanished`);
  if (current.schemaHash !== record.schemaHash) throw new Error('A measurement write must not change the schema');
  const file = path.join(directory, record.compositionId, 'versions', `${record.version}.json`);
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify({ ...current, measurements: record.measurements }, null, 2) + '\n');
  fs.renameSync(temporary, file);
}
