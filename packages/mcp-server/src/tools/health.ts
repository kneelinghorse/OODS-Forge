import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaStore } from '../schema-store/index.js';
import { ToolError } from '../errors/tool-error.js';
import { CURRENT_VERSION, getChangelogSince, type ChangelogEntry } from '../versioning/versions.js';
import { listObjects } from '../objects/object-loader.js';
import { listTraits } from '../objects/trait-loader.js';
import { readRuntimeSummary, type RuntimeSummary } from '../lib/runtime-ledger.js';
import { readReleaseSummary, type ReleaseSummary } from '../lib/release-ledger.js';
import { readToolSummary, type ToolSummary } from '../lib/tool-ledger.js';
import { readVizSummary, type VizSummary } from '../lib/viz-taxonomy.js';
import { readTokenScopes } from '../lib/token-build.js';

type ManifestArtifact = {
  name?: string;
  file?: string;
  path?: string;
};

type ManifestDoc = {
  generatedAt?: string;
  artifacts?: ManifestArtifact[];
};

type HealthInput = {
  includeChangelog?: boolean;
  sinceVersion?: string;
};

/** 'live' moves when the registry moves; 'snapshot' is frozen at `registry.lastSync`. */
type CountSource = 'live' | 'snapshot';

type HealthOutput = {
  status: 'ok' | 'degraded';
  server: { version: string; uptime: number };
  registry: {
    components: number;
    traits: number;
    objects: number;
    lastSync: string;
    /**
     * Where each count above was read from on this call. An advertised count that cannot move is
     * worse than no count: through Sprint 203 this tool reported the object count live while traits
     * and components came from a frozen structured-data export, so it advertised 46 traits where the
     * registry held 47 and nothing said which number was which (learning #657).
     */
    countsFrom: { components: CountSource; traits: CountSource; objects: CountSource };
  };
  tokens: TokenInfo;
  schemas: { savedCount: number; storeDir: string };
  latency: number;
  productReality: { runtime: RuntimeSummary | null; release: ReleaseSummary | null; tools: ToolSummary | null; viz: VizSummary | null };
  dslVersion?: string;
  warnings?: string[];
  changelog?: ChangelogEntry[];
};

const CURRENT_DIR = fileURLToPath(new URL('.', import.meta.url));
const PACKAGE_ROOT = path.resolve(CURRENT_DIR, '../../');
const REPO_ROOT = path.resolve(CURRENT_DIR, '../../../../');
const DEFAULT_STRUCTURED_DATA_DIR = path.join(REPO_ROOT, 'artifacts', 'structured-data');
const EPOCH_ISO = new Date(0).toISOString();

function nowMs(): number {
  return Date.now();
}

function resolveStructuredDataDir(): string {
  const configured = process.env.MCP_STRUCTURED_DATA_DIR;
  if (!configured?.trim()) return DEFAULT_STRUCTURED_DATA_DIR;
  return path.resolve(configured);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function readServerVersion(): string {
  try {
    const packageJson = readJson<{ version?: string }>(path.join(PACKAGE_ROOT, 'package.json'));
    return packageJson.version ?? '0.1.0';
  } catch {
    return '0.1.0';
  }
}

function sanitizeFileName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ToolError('OODS-S016', 'artifact filename is empty');
  }
  if (path.isAbsolute(trimmed) || trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new ToolError('OODS-S017', `artifact filename is unsafe: ${trimmed}`, { filename: trimmed });
  }
  return trimmed;
}

function resolveArtifactPath(structuredDataDir: string, manifest: ManifestDoc, artifactName: string): string {
  const artifact = manifest.artifacts?.find((entry) => entry.name === artifactName);
  const filename = artifact?.file ? sanitizeFileName(artifact.file) : undefined;
  if (!filename) {
    throw new ToolError('OODS-N007', `artifact "${artifactName}" missing from manifest`, { artifact: artifactName });
  }
  const fullPath = path.join(structuredDataDir, filename);
  if (!fs.existsSync(fullPath)) {
    throw new ToolError('OODS-N007', `artifact "${artifactName}" file not found: ${filename}`, { artifact: artifactName, filename });
  }
  return fullPath;
}

function readRegistryInfo(structuredDataDir: string): {
  components: number;
  traits: number;
  objects: number;
  lastSync: string;
  manifest: ManifestDoc;
} {
  const manifestPath = path.join(structuredDataDir, 'manifest.json');
  const manifest = readJson<ManifestDoc>(manifestPath);
  const componentsPath = resolveArtifactPath(structuredDataDir, manifest, 'components');
  const payload = readJson<Record<string, unknown>>(componentsPath);

  const stats = (typeof payload.stats === 'object' && payload.stats && !Array.isArray(payload.stats))
    ? payload.stats as Record<string, unknown>
    : {};
  const components = typeof stats.componentCount === 'number'
    ? stats.componentCount
    : Array.isArray(payload.components) ? payload.components.length : 0;
  const traits = typeof stats.traitCount === 'number'
    ? stats.traitCount
    : Array.isArray(payload.traits) ? payload.traits.length : 0;
  const objects = typeof stats.objectCount === 'number'
    ? stats.objectCount
    : Array.isArray(payload.objects) ? payload.objects.length : 0;
  const lastSync = typeof payload.generatedAt === 'string'
    ? payload.generatedAt
    : typeof manifest.generatedAt === 'string'
      ? manifest.generatedAt
      : EPOCH_ISO;

  return {
    components: Number.isFinite(components) ? components : 0,
    traits: Number.isFinite(traits) ? traits : 0,
    objects: Number.isFinite(objects) ? objects : 0,
    lastSync,
    manifest,
  };
}

type TokenInfo = {
  built: boolean;
  brands: string[];
  themes: string[];
  scopes: Record<string, string[]>;
  defaultScope: { brand: string; theme: string; source: 'env' | 'default' } | null;
};

function readTokenInfo(): TokenInfo {
  const built = readTokenScopes();
  const brands = Object.keys(built).sort();
  const scopes = Object.fromEntries(brands.map(brand => [brand, Object.keys(built[brand as keyof typeof built]).sort()]));
  const themes = [...new Set(Object.values(scopes).flat())].sort();
  const brand = process.env.MCP_BRAND ?? 'A';
  const theme = process.env.MCP_THEME ?? 'light';
  // This is configured default metadata, never an observed consumer scope.
  const requestedBuilt = scopes[brand]?.includes(theme);
  const fallbackBrand = scopes.A?.includes('light') ? 'A' : brands[0];
  const fallbackTheme = fallbackBrand === 'A' && scopes.A.includes('light') ? 'light' : scopes[fallbackBrand]?.[0];
  const defaultScope = requestedBuilt
    ? { brand, theme, source: process.env.MCP_BRAND || process.env.MCP_THEME ? 'env' as const : 'default' as const }
    : fallbackBrand && fallbackTheme ? { brand: fallbackBrand, theme: fallbackTheme, source: 'default' as const } : null;
  return { built: brands.length > 0 && themes.length > 0, brands, themes, scopes, defaultScope };
}

async function readSchemaInfo(): Promise<{ savedCount: number; storeDir: string }> {
  const store = new SchemaStore({
    ...(process.env.MCP_SCHEMA_STORE_ROOT ? { projectRoot: process.env.MCP_SCHEMA_STORE_ROOT } : {}),
    ...(process.env.MCP_SCHEMA_STORE_DIR ? { storeDir: process.env.MCP_SCHEMA_STORE_DIR } : {}),
  });
  const saved = await store.list();
  return {
    savedCount: saved.length,
    storeDir: store.storeDir,
  };
}

export async function handle(input?: HealthInput): Promise<HealthOutput> {
  const started = nowMs();
  const warnings: string[] = [];
  const structuredDataDir = resolveStructuredDataDir();

  let registry: HealthOutput['registry'] = {
    components: 0, traits: 0, objects: 0, lastSync: EPOCH_ISO,
    countsFrom: { components: 'snapshot', traits: 'snapshot', objects: 'snapshot' },
  };
  let tokenInfo: TokenInfo = { built: false, brands: [], themes: [], scopes: {}, defaultScope: null };
  try { tokenInfo = readTokenInfo(); }
  catch (error) { warnings.push(`tokens subsystem unavailable: ${(error as Error).message}`); }
  try {
    const registryInfo = readRegistryInfo(structuredDataDir);
    // Each count is computed from the registry itself where a loader exists, and falls back to the
    // frozen structured-data export where one does not — and `countsFrom` says which happened, so a
    // reader can tell a number that tracks the registry from one that is pinned at `lastSync`.
    // Components have no live loader, so that one stays frozen and says so.
    let objectCount = registryInfo.objects;
    let objectsFrom: CountSource = 'snapshot';
    try {
      objectCount = listObjects().length;
      objectsFrom = 'live';
    } catch {
      // Fall back to structured data stats if object loader unavailable
    }
    let traitCount = registryInfo.traits;
    let traitsFrom: CountSource = 'snapshot';
    try {
      traitCount = listTraits().length;
      traitsFrom = 'live';
    } catch {
      // Fall back to structured data stats if trait loader unavailable
    }
    registry = {
      components: registryInfo.components,
      traits: traitCount,
      objects: objectCount,
      lastSync: registryInfo.lastSync,
      countsFrom: { components: 'snapshot', traits: traitsFrom, objects: objectsFrom },
    };
  } catch (error) {
    warnings.push(`registry subsystem unavailable: ${(error as Error).message}`);
  }

  let schemaInfo = { savedCount: 0, storeDir: path.resolve(process.cwd(), '.oods/schemas') };
  try {
    schemaInfo = await readSchemaInfo();
  } catch (error) {
    warnings.push(`schema store unavailable: ${(error as Error).message}`);
  }

  let runtime: RuntimeSummary | null = null;
  try { runtime = readRuntimeSummary(); }
  catch (error) { warnings.push(`runtime proof unavailable: ${(error as Error).message}`); }

  let release: ReleaseSummary | null = null;
  try { release = readReleaseSummary(); }
  catch (error) { warnings.push(`release proof unavailable: ${(error as Error).message}`); }

  let tools: ToolSummary | null = null;
  try { tools = readToolSummary(); }
  catch (error) { warnings.push(`tool proof unavailable: ${(error as Error).message}`); }

  let viz: VizSummary | null = null;
  try { viz = readVizSummary(); }
  catch (error) { warnings.push(`viz taxonomy unavailable: ${(error as Error).message}`); }

  const latency = Math.max(0, nowMs() - started);
  const status: HealthOutput['status'] = warnings.length > 0 ? 'degraded' : 'ok';

  const result: HealthOutput = {
    status,
    server: {
      version: readServerVersion(),
      uptime: Math.max(0, Math.round(process.uptime() * 1000)),
    },
    registry,
    tokens: tokenInfo,
    schemas: schemaInfo,
    latency,
    productReality: { runtime, release, tools, viz },
    dslVersion: CURRENT_VERSION,
    ...(warnings.length > 0 ? { warnings } : {}),
  };

  if (input?.includeChangelog) {
    result.changelog = getChangelogSince(input.sinceVersion);
  }

  return result;
}
