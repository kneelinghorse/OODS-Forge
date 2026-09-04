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
  result?: { serverInfo?: { name?: string; version?: string } };
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

async function requestAdapterInitialize(): Promise<{ response: InitializeResponse; stderr: string }> {
  const adapterDir = path.join(REPO_ROOT, 'packages', 'mcp-adapter');
  const child = spawn(process.execPath, ['index.js'], {
    cwd: adapterDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, MCP_HEALTH_PORT: '0', OODS_OTLP_ENDPOINT: '' },
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
        if (payload.id === 1) {
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
    expect(createHash('sha256').update(runtimeBytes).digest('hex')).toBe(
      '7f5136224e4a8b4af00d39c22aeefca7f2c150c22e843d98343ebf4ffde360da',
    );
  });

  it('B-12 starts from dist plus package metadata only and answers degraded health without planning data', async () => {
    expect(fs.existsSync(path.join(SERVER_DIST, 'schemas', 'component-schema.json'))).toBe(true);
    const stagedServer = stageDistOnlyServer();
    expect(fs.readdirSync(stagedServer).sort()).toEqual(['dist', 'node_modules', 'package.json']);
    const { response, aliveAtResponse, stderr } = await requestHealth(stagedServer);

    expect(stderr).toBe('');
    expect(aliveAtResponse).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      status: 'degraded',
      registry: { components: 0, traits: 0, objects: 0 },
      warnings: expect.arrayContaining([
        expect.stringContaining('registry subsystem unavailable'),
        expect.stringContaining('tokens subsystem unavailable'),
      ]),
    });
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

  it('pins the Sprint-182 manifest-present structuredData, map, and registry products deterministically', async () => {
    const fetchResult = await fetchStructuredData({ dataset: 'components', includePayload: false });
    const traits = [...loadKnownTraits()].sort();
    const registry = loadComponentRegistry();
    const registryResult = {
      names: [...registry.names].sort(),
      version: registry.version,
      warnings: registry.warnings,
    };

    expect(sha256Json(fetchResult)).toBe('075a6136bea04f488e9038c60fd23fa81ee6852858942f62496339805ff8788f');
    expect(sha256Json(traits)).toBe('ec10b9807834bc684542510524127ee4d2394e8e05a08341ab1b156e300a90c2');
    expect(sha256Json(registryResult)).toBe('22b9984ac2adef68c95b8edbb6c586acc636492d50e2232ddac17fe6351bd31a');
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
