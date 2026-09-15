import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { loadKnownTraits } from '../../src/tools/map.shared.js';
import { loadComponentRegistry } from '../../src/tools/repl.utils.js';
import { handle as fetchStructuredData } from '../../src/tools/structuredData.fetch.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIR, '../../../..');
const MCP_SERVER_DIR = path.join(REPO_ROOT, 'packages', 'mcp-server');
const SERVER_DIST = path.join(MCP_SERVER_DIR, 'dist');
const SOURCE_COMPONENT_SCHEMA = path.join(MCP_SERVER_DIR, 'src', 'schemas', 'component-schema.json');
const PLANNING_COMPONENT_SCHEMA = path.join(REPO_ROOT, 'cmos', 'planning', 'component-schema.json');

const tempRoots: string[] = [];

function shippedReleaseSummary() {
  const ledger = JSON.parse(fs.readFileSync(path.join(SERVER_DIST, 'registry/release-cells.v1.json'), 'utf8'));
  return { bundleHead: ledger.bundleHead, archiveSha256: ledger.archiveSha256,
    apps: ['Organization', 'Subscription', 'User'], frameworks: ['react', 'vue'], ...ledger.summary };
}

type StdioResponse = {
  id?: number;
  result?: {
    status?: string;
    registry?: { components?: number; traits?: number; objects?: number };
    warnings?: string[];
  };
  error?: unknown;
};

type InitializeResponse = {
  id?: number;
  result?: { serverInfo?: { name?: string; version?: string }; isError?: boolean; content?: Array<{ type: string; text: string }> };
  error?: unknown;
};

function sha256Json(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function walkFiles(root: string, predicate: (filePath: string) => boolean): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute, predicate));
    else if (entry.isFile() && predicate(absolute)) files.push(absolute);
  }
  return files.sort();
}

function stageDistOnlyServer(): string {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-portable-boundary-'));
  tempRoots.push(tempRoot);
  const stagedServer = path.join(tempRoot, 'packages', 'mcp-server');
  fs.mkdirSync(stagedServer, { recursive: true });
  fs.cpSync(SERVER_DIST, path.join(stagedServer, 'dist'), { recursive: true });
  fs.copyFileSync(path.join(MCP_SERVER_DIR, 'package.json'), path.join(stagedServer, 'package.json'));
  fs.symlinkSync(path.join(MCP_SERVER_DIR, 'node_modules'), path.join(stagedServer, 'node_modules'), 'dir');
  return stagedServer;
}

function spawnStagedServer(stagedServer: string): ChildProcessWithoutNullStreams {
  const child = spawn(process.execPath, ['dist/index.js'], {
    cwd: stagedServer,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      MCP_HEALTH_PORT: '0',
      MCP_ROLE: 'designer',
      MCP_STRUCTURED_DATA_DIR: path.join(path.dirname(path.dirname(stagedServer)), 'absent-structured-data'),
      MCP_RUNTIME_CELLS_PATH: undefined,
      MCP_RELEASE_CELLS_PATH: undefined,
      OODS_OTLP_ENDPOINT: '',
    },
  });
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  return child;
}

async function requestHealth(stagedServer: string): Promise<{ response: StdioResponse; aliveAtResponse: boolean; stderr: string }> {
  const child = spawnStagedServer(stagedServer);
  let stderr = '';
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  const response = await new Promise<StdioResponse>((resolve, reject) => {
    let stdout = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for staged health response. stderr=${stderr}`)), 15_000);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code, signal) => {
      clearTimeout(timeout);
      reject(new Error(`Staged server exited before health (code=${String(code)}, signal=${String(signal)}). stderr=${stderr}`));
    });
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
      let newline = stdout.indexOf('\n');
      while (newline >= 0) {
        const line = stdout.slice(0, newline).trim();
        stdout = stdout.slice(newline + 1);
        newline = stdout.indexOf('\n');
        if (!line) continue;
        const payload = JSON.parse(line) as StdioResponse;
        if (payload.id === 1) {
          clearTimeout(timeout);
          resolve(payload);
          return;
        }
      }
    });
    child.stdin.write(`${JSON.stringify({ id: 1, tool: 'health', input: {} })}\n`, 'utf8');
  });

  const aliveAtResponse = child.exitCode === null && !child.killed;
  const closed = once(child, 'close');
  child.kill('SIGTERM');
  await closed;
  return { response, aliveAtResponse, stderr };
}

async function waitForStartupExit(stagedServer: string): Promise<{ code: number | null; stderr: string }> {
  const child = spawnStagedServer(stagedServer);
  let stderr = '';
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });
  const timer = setTimeout(() => child.kill('SIGKILL'), 15_000);
  const [code] = await once(child, 'close') as [number | null, NodeJS.Signals | null];
  clearTimeout(timer);
  return { code, stderr };
}

async function requestAdapterInitialize(adapterDir = path.join(REPO_ROOT, 'packages', 'mcp-adapter'), callHealth = false): Promise<{ response: InitializeResponse; stderr: string }> {
  const child = spawn(process.execPath, ['index.js'], {
    cwd: adapterDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, MCP_HEALTH_PORT: '0', OODS_OTLP_ENDPOINT: '', MCP_RUNTIME_CELLS_PATH: undefined, MCP_RELEASE_CELLS_PATH: undefined },
  });
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  let stderr = '';
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  const response = await new Promise<InitializeResponse>((resolve, reject) => {
    let stdout = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for adapter initialize. stderr=${stderr}`)), 15_000);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code, signal) => {
      clearTimeout(timeout);
      reject(new Error(`Adapter exited before initialize (code=${String(code)}, signal=${String(signal)}). stderr=${stderr}`));
    });
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
      let newline = stdout.indexOf('\n');
      while (newline >= 0) {
        const line = stdout.slice(0, newline).trim();
        stdout = stdout.slice(newline + 1);
        newline = stdout.indexOf('\n');
        if (!line) continue;
        const payload = JSON.parse(line) as InitializeResponse;
        if (payload.id === 1 && callHealth) {
          child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`, 'utf8');
          child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'health', arguments: {} } })}\n`, 'utf8');
        } else if (payload.id === (callHealth ? 2 : 1)) {
          clearTimeout(timeout);
          resolve(payload);
          return;
        }
      }
    });
    child.stdin.write(`${JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'portable-boundary-test', version: '1.0.0' },
      },
    })}\n`, 'utf8');
  });

  const closed = once(child, 'close');
  child.kill('SIGTERM');
  await closed;
  return { response, stderr };
}

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

describe('s181 portable-runtime publish boundary', () => {
  it('keeps the runtime component schema byte-identical to the planning producer output', () => {
    const runtimeBytes = fs.readFileSync(SOURCE_COMPONENT_SCHEMA);
    const planningBytes = fs.readFileSync(PLANNING_COMPONENT_SCHEMA);

    expect(runtimeBytes.equals(planningBytes)).toBe(true);
    const schema = JSON.parse(runtimeBytes.toString('utf8'));
    expect(schema.required).not.toContain('obligationScope');
    expect(schema.properties.obligationScope.properties.approvedRuntimeCensus).toMatchObject({ type: 'null' });
    expect(createHash('sha256').update(runtimeBytes).digest('hex')).toBe(
      '6651359102fd2fc1a89b41f5e1076c5cc074ff3e6f26f59f3240f66740fb363f',
    );
  });

  it('B-12 starts from dist plus package metadata only and answers degraded health without planning data', async () => {
    expect(fs.existsSync(path.join(SERVER_DIST, 'schemas', 'component-schema.json'))).toBe(true);
    const stagedServer = stageDistOnlyServer();
    expect(fs.readdirSync(stagedServer).sort()).toEqual(['dist', 'node_modules', 'package.json']);
    // s195-m02 adds a generated taxonomy plus its classification authority to
    // dist: the Core Profile stays available even without host planning data.
    // s195-m03 adds exact-source pattern proof; core coverage follows those measured scopes.
    for (const name of ['viz-taxonomy.v1.json', 'viz-classification.v1.json', 'viz-patterns.v1.json']) {
      expect(fs.readFileSync(path.join(stagedServer, 'dist/registry', name)).equals(
        fs.readFileSync(path.join(REPO_ROOT, 'packages/viz-core/src/registry', name)),
      )).toBe(true);
    }
    const { response, aliveAtResponse, stderr } = await requestHealth(stagedServer);
    const runtimeLedger = JSON.parse(fs.readFileSync(path.join(SERVER_DIST, 'registry/runtime-cells.v1.json'), 'utf8'));

    expect(stderr).toBe('');
    expect(aliveAtResponse).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      status: 'degraded',
      registry: { components: 0, traits: 0, objects: 0 },
      tokens: { built: false, brands: [], themes: [], scopes: {}, defaultScope: null },
      productReality: { runtime: { ...runtimeLedger.summary, head: runtimeLedger.head },
        viz: JSON.parse(fs.readFileSync(path.join(SERVER_DIST, 'registry/viz-taxonomy.v1.json'), 'utf8')).summary, release: shippedReleaseSummary() },
      warnings: expect.arrayContaining([
        expect.stringContaining('registry subsystem unavailable'),
        expect.stringContaining('tokens subsystem unavailable'),
      ]),
    });
  }, 30_000);

  it.each(['runtime', 'release'])('s196 serves null %s proof when its shipped canonical ledger is absent', async kind => {
    const stagedServer = stageDistOnlyServer();
    fs.rmSync(path.join(stagedServer, `dist/registry/${kind}-cells.v1.json`));
    const { response, aliveAtResponse, stderr } = await requestHealth(stagedServer);
    expect(stderr).toBe('');
    expect(aliveAtResponse).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({ status: 'degraded', productReality: { [kind]: null },
      warnings: expect.arrayContaining([expect.stringContaining(`${kind} proof unavailable`)]) });
  }, 30_000);

  it.each(['viz-taxonomy.v1.json', 'viz-classification.v1.json', 'viz-patterns.v1.json'])('s195 serves null viz with a warning when shipped %s is absent', async name => {
    const stagedServer = stageDistOnlyServer();
    fs.rmSync(path.join(stagedServer, 'dist/registry', name));
    const { response, aliveAtResponse, stderr } = await requestHealth(stagedServer);
    expect(stderr).toBe('');
    expect(aliveAtResponse).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      status: 'degraded',
      productReality: { viz: null },
      warnings: expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]),
    });
  }, 30_000);

  it('s195 serves the same generated viz summary through the staged MCP adapter', async () => {
    const stagedServer = stageDistOnlyServer();
    const adapterDir = path.join(path.dirname(stagedServer), 'mcp-adapter');
    const sourceAdapter = path.join(REPO_ROOT, 'packages/mcp-adapter');
    fs.mkdirSync(adapterDir);
    for (const file of ['index.js', 'sanitize-schema.js', 'mcp-apps.js', 'tool-descriptions.json', 'package.json']) fs.copyFileSync(path.join(sourceAdapter, file), path.join(adapterDir, file));
    fs.symlinkSync(path.join(sourceAdapter, 'node_modules'), path.join(adapterDir, 'node_modules'), 'dir');
    const { response } = await requestAdapterInitialize(adapterDir, true);
    expect(response.error).toBeUndefined();
    expect(response.result?.isError).not.toBe(true);
    const health = JSON.parse(response.result!.content!.find(block => block.type === 'text')!.text);
    expect(health.productReality.viz).toEqual(JSON.parse(fs.readFileSync(path.join(SERVER_DIST, 'registry/viz-taxonomy.v1.json'), 'utf8')).summary);
    // s196 ships the measured release ledger with dist; portable health must
    // expose its executed archive identity even with no host receipt directory.
    expect(health.productReality.release).toEqual(shippedReleaseSummary());
    expect(health.warnings ?? []).not.toEqual(expect.arrayContaining([expect.stringContaining('release proof unavailable')]));
    expect(health.warnings ?? []).not.toEqual(expect.arrayContaining([expect.stringContaining('viz taxonomy unavailable')]));
  }, 30_000);

  it('B-12 proves the relocated schema is load-bearing by deleting it from the staged dist', async () => {
    const stagedServer = stageDistOnlyServer();
    fs.rmSync(path.join(stagedServer, 'dist', 'schemas', 'component-schema.json'));

    const exited = await waitForStartupExit(stagedServer);
    expect(exited.code).toBe(1);
    expect(exited.stderr).toContain('ENOENT');
    expect(exited.stderr).toContain('component-schema.json');
  }, 30_000);

  it('allows declared-data provenance but forbids quoted cmos path segments in executable dist JavaScript', () => {
    const offenders = walkFiles(SERVER_DIST, (filePath) => filePath.endsWith('.js'))
      .filter((filePath) => /["']cmos["']/.test(fs.readFileSync(filePath, 'utf8')))
      .map((filePath) => path.relative(REPO_ROOT, filePath).split(path.sep).join('/'));

    expect(offenders).toEqual([]);
    expect(fs.readFileSync(path.join(REPO_ROOT, 'artifacts', 'structured-data', 'manifest.json'), 'utf8'))
      .toContain('cmos/planning');
  });

  it('keeps manifest-present discovery deterministic across authorized refreshes and preserves trait membership', async () => {
    const fetchResult = await fetchStructuredData({ dataset: 'components', includePayload: false });
    const traits = [...loadKnownTraits()].sort();
    const registry = loadComponentRegistry();
    const registryResult = {
      names: [...registry.names].sort(),
      version: registry.version,
      warnings: registry.warnings,
    };

    const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'artifacts/structured-data/manifest.json'), 'utf8'));
    const artifact = manifest.artifacts.find((entry: { name: string }) => entry.name === 'components');
    const payload = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, artifact.path), 'utf8'));
    expect(fetchResult).toMatchObject({ dataset: 'components', version: manifest.version,
      generatedAt: manifest.generatedAt, etag: artifact.etag, path: artifact.path,
      sizeBytes: artifact.sizeBytes, payloadIncluded: false, schemaValidated: true,
      meta: { componentCount: 110 } });
    expect(await fetchStructuredData({ dataset: 'components', includePayload: false })).toEqual(fetchResult);
    expect(payload.obligationScope).toMatchObject({ decisionId: 2054, controllingObligationDenominator: 110, approvedRuntimeCensus: null });
    expect([...registry.names].sort()).toEqual(payload.components.map((entry: { id: string }) => entry.id).sort());
    expect(registry.version).toBe(manifest.version);
    expect(registry.warnings).toEqual([]);
    const declaredAdditions = ['EncodingOpacity', 'EncodingShape', 'MarkRect', 'ScatterPlot', 'MarkGraph'];
    expect(traits).toHaveLength(46);
    expect(traits).toEqual(expect.arrayContaining(declaredAdditions));
    // Adding the declared authoring traits and graph placement must not silently remove or rename
    // any member of the previously published discovery set.
    expect(sha256Json(traits.filter(trait => !declaredAdditions.includes(trait))))
      .toBe('ec10b9807834bc684542510524127ee4d2394e8e05a08341ab1b156e300a90c2');
    // The active manifest can select an authorized named release, while the
    // historical 109-row identity set plus the explicit graph and warning-free discovery remain the boundary.
    expect(registryResult).toEqual({ names: payload.components.map((entry: { id: string }) => entry.id).sort(), version: manifest.version, warnings: [] });
    expect(sha256Json(registryResult.names.filter(name => name !== 'VizGraphPreview'))).toBe('cddc0aa36f209ef51e2da48c029ecc7dd6d8f20c9da038e745832fafc4a1804b');
  });

  it('B-19 keeps the runtime data schema out of generated.ts', () => {
    const generatorSource = fs.readFileSync(path.join(REPO_ROOT, 'packages', 'schemas-tools', 'src', 'generate-types.ts'), 'utf8');
    const generatedSource = fs.readFileSync(path.join(MCP_SERVER_DIR, 'src', 'schemas', 'generated.ts'), 'utf8');

    expect(generatorSource).toMatch(/NON_SCHEMA_DATA_FILES[\s\S]*['"]component-schema\.json['"]/);
    expect(generatedSource).not.toMatch(/(?:interface|type)\s+ComponentSchema\b/);
  });

  it('derives the adapter wire version from package.json and no longer stages planning files for fresh installs', async () => {
    const adapterSource = fs.readFileSync(path.join(REPO_ROOT, 'packages', 'mcp-adapter', 'index.js'), 'utf8');
    const adapterPackage = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'packages', 'mcp-adapter', 'package.json'), 'utf8'),
    ) as { version: string };
    const freshInstallSource = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'mcp-adapter-fresh-install.mjs'), 'utf8');
    const initialized = await requestAdapterInitialize();

    expect(adapterSource).toContain("new URL('./package.json', import.meta.url)");
    expect(adapterSource).toMatch(/const ADAPTER_VERSION = JSON\.parse\([\s\S]*?package\.json[\s\S]*?\)\.version;/);
    expect(adapterSource).not.toMatch(/const ADAPTER_VERSION\s*=\s*['"][^'"]+['"];/);
    expect(adapterSource).toContain("{ name: 'oods-foundry-adapter', version: ADAPTER_VERSION }");
    expect(initialized.response.error).toBeUndefined();
    expect(initialized.response.result?.serverInfo?.version).toBe(adapterPackage.version);
    expect(initialized.stderr).toContain(`[oods-mcp-adapter] v${adapterPackage.version}`);
    expect(freshInstallSource).not.toContain("'cmos', 'planning'");
    expect(freshInstallSource).not.toContain('stage required planning files');
  }, 30_000);
});
