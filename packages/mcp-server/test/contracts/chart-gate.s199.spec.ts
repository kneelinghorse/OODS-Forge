import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { commands } from '../../../../scripts/product-reality/s199-chart-gate.mjs';
import { ROOT, PATTERN_REGISTRY_PATH, writePatternOutputs } from '../../../../scripts/product-reality/s195-pattern-census.js';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const observationsPath = 'artifacts/product-reality/sprint-197/m05/patterns/pattern-observations.json';
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');
const directories: string[] = [];
afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })));

describe('s199 local chart gate and receipt boundaries', () => {
  it('loads the named golden command from the workflow and keeps the gate narrow', () => {
    const plan = commands(ROOT);
    const golden = read('.github/workflows/ci.yml').match(/name: Run colocated viz\.render \+ dashboard\.render goldens\s+run: ([^\n]+)/)![1]!.trim().split(/\s+/);
    expect(plan.find(([name]) => name === 'named-goldens')![1].slice(0, golden.length)).toEqual(golden);
    expect(plan.slice(0, 3).map(([name]) => name)).toEqual(['build-viz-core', 'build-viz-render', 'typecheck-viz-core']);
    expect(plan.flatMap(([, command]) => command)).toContain('--coverage.enabled=false');
    expect(plan.find(([name]) => name === 'viz-contracts')![1]).toContain('test/contracts/viz-pattern-registry.s195.spec.ts');
    expect(plan.flatMap(([, command]) => command).join(' ')).not.toMatch(/s193-runtime-cells|--project=core/);
  });

  it('refuses an omitted observation path before it can overwrite a historical receipt', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/product-reality/s195-pattern-census.ts', '--measure'], { cwd: ROOT, encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--observations <path> is required');
  });

  it('qualifies the matrix into Sprint 199 without writing into a sealed sprint', () => {
    const directory = mkdtempSync(join(tmpdir(), 's199-matrix-path-'));
    directories.push(directory);
    for (const file of ['packages/viz-render/certified-matrix.json', 'packages/tokens/package.json']) {
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      cpSync(join(ROOT, file), join(directory, file));
    }
    const args = ['--import', 'tsx', 'scripts/product-reality/s195-qualify-viz-matrix.ts', '--mode', 's199'];
    const options = { cwd: ROOT, encoding: 'utf8' as const, env: { ...process.env, OODS_VIZ_CENSUS_ROOT: directory } };
    expect(JSON.parse(execFileSync(process.execPath, args, options)).families).toBe(8);
    expect(JSON.parse(readFileSync(join(directory, 'artifacts/product-reality/sprint-199/m05/certified-matrix-attribution.json'), 'utf8')).changes).toEqual([]);
    expect(JSON.parse(execFileSync(process.execPath, [...args, '--check'], options)).check).toBe(true);
  });

  it('turns the gate generator check red for a hand-edited SVG hash in a scratch copy, then green on restoration', () => {
    const directory = mkdtempSync(join(tmpdir(), 's199-chart-bite-'));
    directories.push(directory);
    for (const file of ['packages/viz-core/src/registry/viz-classification.v1.json', 'packages/viz-core/src/registry/viz-recipes.v1.json', 'examples/viz/patterns-v2', 'packages/mcp-server/src/schemas/viz.render.input.json', observationsPath]) {
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      cpSync(join(ROOT, file), join(directory, file), { recursive: true });
    }
    const observations = JSON.parse(read(observationsPath));
    writePatternOutputs(observations, { root: directory });
    const registryFile = join(directory, PATTERN_REGISTRY_PATH);
    const original = readFileSync(registryFile, 'utf8');
    const registry = JSON.parse(original);
    registry.find((row: { publicSvg: boolean }) => row.publicSvg).scopes[0].svgHash = '0'.repeat(64);
    writeFileSync(registryFile, JSON.stringify(registry, null, 2) + '\n');
    const args = ['--import', 'tsx', 'scripts/product-reality/s195-pattern-census.ts', '--check', '--root', directory, '--observations', observationsPath];
    const rejected = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' });
    expect(rejected.status).not.toBe(0);
    expect(rejected.stderr).toContain('Generated pattern output is stale');
    writeFileSync(registryFile, original);
    expect(JSON.parse(execFileSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' })).cells).toBeGreaterThan(0);
  });
});
