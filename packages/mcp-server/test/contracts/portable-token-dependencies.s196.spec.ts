import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handle as tokens } from '../../src/tools/tokens.build.js';
import { handle as apply } from '../../src/tools/brand.apply.js';
import { handle as intake } from '../../src/tools/brand.intake.js';
import * as tokenBuild from '../../src/lib/token-build.js';
import * as security from '../../src/lib/security.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const required = ['css/tokens.css', 'ts/tokens.ts', 'tailwind/tokens.json', 'css-variables-by-scope.json'];
let temporary: string;
let tokenRoot: string;

beforeEach(() => {
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s196-token-dependencies-'));
  tokenRoot = path.join(temporary, 'packages/tokens');
  for (const relative of required) {
    const destination = path.join(tokenRoot, 'dist', relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, 'packages/tokens/dist', relative), destination);
  }
  vi.stubEnv('MCP_BRAND_SOURCE_ROOT', tokenRoot);
  vi.spyOn(security, 'loadPolicy').mockReturnValue({ ...security.loadPolicy(), artifactsBase: path.join(temporary, 'artifacts') });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  fs.rmSync(temporary, { recursive: true, force: true });
});

describe('s196 portable token dependencies', () => {
  it('applies shipped token outputs without source or build scripts and preserves the requested scope', async () => {
    const build = vi.spyOn(tokenBuild, 'runTokenBuild');
    const result = await tokens({ brand: 'B', theme: 'dark', apply: true });
    expect(build).not.toHaveBeenCalled();
    expect(result.artifacts).toHaveLength(5);
    const files = new Map(result.artifacts.map(file => [path.basename(file), file]));
    for (const [name, relative] of [['tokens.css', required[0]], ['tokens.ts', required[1]], ['tokens.tailwind.json', required[2]]]) {
      expect(fs.readFileSync(files.get(name)!)).toEqual(fs.readFileSync(path.join(tokenRoot, 'dist', relative)));
    }
    const payload = JSON.parse(fs.readFileSync(files.get('tokens.dark.json')!, 'utf8'));
    const scopes = JSON.parse(fs.readFileSync(path.join(tokenRoot, 'dist/css-variables-by-scope.json'), 'utf8'));
    expect(payload).toEqual({ cssVariables: scopes.B.dark, meta: { brand: 'B', theme: 'dark', scope: 'requested' } });
    expect(fs.readFileSync(files.get('tokens.scope.css')!, 'utf8')).toContain("[data-brand='B'][data-theme='dark']");
    expect(fs.existsSync(path.join(tokenRoot, 'src'))).toBe(false);
  });

  it.each(required)('missing shipped %s refuses before attempting a nonexistent host pipeline', async relative => {
    const missing = path.join(tokenRoot, 'dist', relative);
    fs.rmSync(missing);
    const build = vi.spyOn(tokenBuild, 'runTokenBuild');
    await expect(tokens({ apply: true })).rejects.toMatchObject({
      opiCode: 'OODS-N011',
      details: { tool: 'tokens.build', dependency: 'token-dist-outputs', missing: [missing], buildAttempted: false },
    });
    expect(build).not.toHaveBeenCalled();
  });

  it('treats an empty shipped output as unavailable, including scope data', async () => {
    const missing = path.join(tokenRoot, 'dist/css-variables-by-scope.json');
    fs.writeFileSync(missing, '');
    await expect(tokens({ apply: true })).rejects.toMatchObject({ opiCode: 'OODS-N011', details: { missing: [missing], buildAttempted: false } });
  });

  it('a portable manifest forbids rebuilding even when scripts happen to exist', async () => {
    fs.mkdirSync(path.join(tokenRoot, 'scripts'));
    for (const name of ['build.mjs', 'build-entry.mjs']) fs.writeFileSync(path.join(tokenRoot, 'scripts', name), 'throw new Error("must not run");');
    fs.rmSync(path.join(tokenRoot, 'dist/ts/tokens.ts'));
    const exists = fs.existsSync;
    vi.spyOn(fs, 'existsSync').mockImplementation(file => String(file) === path.join(root, 'forge-runtime.manifest.json') || exists(file));
    const build = vi.spyOn(tokenBuild, 'runTokenBuild');
    await expect(tokens({ apply: true })).rejects.toMatchObject({ opiCode: 'OODS-N011', details: { buildAttempted: false } });
    expect(build).not.toHaveBeenCalled();
  });

  it('retains a real failed host build receipt when the canonical build pipeline exists', async () => {
    fs.mkdirSync(path.join(tokenRoot, 'scripts'));
    fs.writeFileSync(path.join(tokenRoot, 'scripts/build.mjs'), 'console.error("s196 intentional build failure"); process.exit(1);');
    fs.writeFileSync(path.join(tokenRoot, 'scripts/build-entry.mjs'), 'throw new Error("second stage must not run");');
    fs.rmSync(path.join(tokenRoot, 'dist/ts/tokens.ts'));
    await expect(tokens({ apply: true })).rejects.toMatchObject({
      opiCode: 'OODS-S019',
      message: expect.stringContaining('s196 intentional build failure'),
      details: { build: { exitCode: 1, commands: [{ exitCode: 1, stderr: expect.stringContaining('s196 intentional build failure') }] } },
    });
  });

  it.each([false, true])('brand.apply apply:%s reports the actual missing source dependency without raw ENOENT', async shouldApply => {
    const build = vi.spyOn(tokenBuild, 'runTokenBuild');
    await expect(apply({ brand: 'B', delta: {}, apply: shouldApply })).rejects.toMatchObject({
      opiCode: 'OODS-N020',
      message: 'brand.apply: canonical brand source is not shipped in this runtime.',
      details: { tool: 'brand.apply', dependency: 'canonical-brand-source', path: path.join(tokenRoot, 'src/tokens/brands') },
    });
    expect(build).not.toHaveBeenCalled();
  });

  it('inline intake still validates and emits its B/dark delta without canonical filesystem source', async () => {
    const input = JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/test/fixtures/portable-runtime/s194-brand-intake.json'), 'utf8'));
    const result = await intake(input.arguments);
    expect(result).toMatchObject({ validated: true, preview_only: true, applied: false, brand_created: false });
    expect(result.delta).toHaveProperty('dark');
    expect(fs.existsSync(path.join(tokenRoot, 'src'))).toBe(false);
  });
});
