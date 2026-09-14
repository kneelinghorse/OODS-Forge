import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const registry = 'packages/viz-core/src/registry/viz-recipes.v1.json';
const scratch: string[] = [];
afterEach(() => scratch.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })));
const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), 's199-viz-table-'));
  scratch.push(directory);
  for (const file of [registry, 'packages/mcp-server/src/schemas', 'packages/mcp-server/src/tools/registry.json', 'packages/mcp-adapter/tool-descriptions.json']) {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    cpSync(join(root, file), join(directory, file), { recursive: true });
  }
  return directory;
};
const run = (directory: string, check = false) => spawnSync(process.execPath, ['--import', 'tsx', 'scripts/docs/generate-api-reference.ts', ...(check ? ['--check'] : [])], {
  cwd: root, encoding: 'utf8', env: { ...process.env, OODS_API_DOCS_ROOT: directory },
});

describe('the chart table distinguishes declared scopes, coverage and conformance', () => {
  it('generates all thirteen identities with six scope states, a conformant denominator and reasons', () => {
    const directory = fixture(), result = run(directory);
    expect(result.status, result.stderr).toBe(0);
    const doc = readFileSync(join(directory, 'docs/api/viz-render.md'), 'utf8');
    expect(doc).toContain('| Light A | Light B | Dark A | Dark B | HC A | HC B | Conformant / declared |');
    expect(doc).toContain('ECharts Cartesian line/bar/area calls are spec-only and uncertified');
    const recipes = JSON.parse(readFileSync(join(directory, registry), 'utf8'));
    expect(recipes).toHaveLength(13);
    for (const row of recipes) expect(doc.split('\n').filter(line => line.startsWith(`| ${row.chartType} |`))).toHaveLength(1);
    const bubble = doc.split('\n').find(line => line.startsWith('| bubble_map |'))!;
    expect(bubble).toContain('typed-deferred (OODS-V165)');
    expect(bubble).toContain('| 0/6 |');
    expect(bubble).toContain('SVG rendering failed');
    expect(run(directory, true).status).toBe(0);
  });

  it('fails before writing docs when a deferred scope lacks its typed reason code, then passes on restoration', () => {
    const directory = fixture();
    const file = join(directory, registry), original = readFileSync(file, 'utf8');
    const recipes = JSON.parse(original);
    delete recipes.find((row: any) => row.renderScopes.some((scope: any) => scope.status === 'typed-deferred')).renderScopes.find((scope: any) => scope.status === 'typed-deferred').errors[0].code;
    writeFileSync(file, JSON.stringify(recipes, null, 2) + '\n');
    const red = run(directory);
    expect(red.status).not.toBe(0);
    expect(red.stderr).toContain('deferred scope requires an error code');
    writeFileSync(file, original);
    expect(run(directory).status).toBe(0);
  });
});
