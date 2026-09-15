import fs from 'node:fs';
import path from 'node:path';

/** Sixteen hex characters of the schema hash; packages/mcp-server/src/lib/preview-store.ts applies the same rule. */
export const PREVIEW_KEY_PATTERN = /^[a-f0-9]{16}$/;
const DEFAULT_SCHEMA_STORE_DIR = '.oods/schemas';

export type PreviewFramework = 'react' | 'vue';
export interface PreviewArtifactFile { path: string; contents: string; contentHash: string }
export interface PreviewArtifact { framework: PreviewFramework; files: PreviewArtifactFile[]; actions: Array<{ name: string }>; contentHash: string }
export interface PreviewRecord {
  version: string;
  key: string;
  schemaHash: string;
  createdAt: string;
  head: string | null;
  compose: { object: string; context: string; preferences?: Record<string, unknown> };
  brand: 'A' | 'B';
  theme: 'light' | 'dark' | 'hc';
  schema: unknown;
  model: Record<string, unknown>;
  frameworks: Partial<Record<PreviewFramework, { artifact: PreviewArtifact }>>;
}

/**
 * The same resolution the native server's SchemaStore applies: MCP_SCHEMA_STORE_ROOT (default: the
 * server's cwd, packages/mcp-server), MCP_SCHEMA_STORE_DIR (default .oods/schemas), previews beside it.
 */
export function resolvePreviewStoreDir(serverCwd: string, env: NodeJS.ProcessEnv = process.env): string {
  const projectRoot = path.resolve(env.MCP_SCHEMA_STORE_ROOT || serverCwd);
  const storeDir = env.MCP_SCHEMA_STORE_DIR
    ? (path.isAbsolute(env.MCP_SCHEMA_STORE_DIR) ? path.resolve(env.MCP_SCHEMA_STORE_DIR) : path.resolve(projectRoot, env.MCP_SCHEMA_STORE_DIR))
    : path.resolve(projectRoot, DEFAULT_SCHEMA_STORE_DIR);
  return path.resolve(storeDir, '..', 'previews');
}

export function isSafePreviewKey(key: unknown): key is string {
  return typeof key === 'string' && PREVIEW_KEY_PATTERN.test(key);
}

export function readPreviewRecord(directory: string, key: string): PreviewRecord | undefined {
  if (!isSafePreviewKey(key)) throw new Error(`Unsafe preview key: ${String(key)}`);
  const file = path.join(directory, `${key}.json`);
  if (!fs.existsSync(file)) return undefined;
  const record = JSON.parse(fs.readFileSync(file, 'utf8')) as PreviewRecord;
  if (record.key !== key || record.version !== '1' || !record.frameworks || typeof record.frameworks !== 'object') throw new Error(`Malformed preview record: ${file}`);
  return record;
}
