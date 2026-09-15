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
  slots: Array<{ slotName: string; selectedComponent?: string; placedComponents?: string[] }>;
  model?: Record<string, unknown>;
  artifacts: Partial<Record<PreviewFramework, { artifact: PreviewArtifact; generatedAt: string }>>;
  measurements: Record<string, unknown>;
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
