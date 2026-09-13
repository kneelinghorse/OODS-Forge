import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { grades } from '../../scripts/product-reality/s195-palette.js';

const runtime = 'artifacts/product-reality/sprint-195/m05/palette/runtime-tsconfig.json';
const script = 'scripts/product-reality/s195-palette.ts';
function run(mode: string) {
  // An explicit runtime config avoids root authoring aliases: this proof must read
  // the built token/viz package exports, which are the bytes public renderers consume.
  const result = spawnSync('pnpm', ['exec', 'tsx', '--tsconfig', runtime, script, mode], { encoding: 'utf8' });
  expect(result.stderr).toBe('');
  expect(result.status, result.stdout + result.stderr).toBe(0);
  return result.stdout;
}

describe('s195 categorical hue revision is measured and reproducible', () => {
  it('replays the exhaustive smaller-radius hue search from retained source palettes', () => {
    expect(run('--replay')).toContain('matches byte-for-byte');
  });
  it('recomputes the frozen s195 grades without overwriting history with the s197 palette', () => {
    const after = JSON.parse(readFileSync('artifacts/product-reality/sprint-195/m05/palette/after.json', 'utf8'));
    expect(after.checks).toEqual({ roleC: 24, pairwise: 240, chroma: 24, unrelatedLeavesChanged: 0 });
    expect(after.scopes).toHaveLength(4);
    for (const { scope: name, ...scope } of after.scopes) {
      expect(grades(scope.rawPalette, scope.canvas)).toEqual(scope);
      const mutation = [...scope.rawPalette]; mutation[1] = mutation[0];
      expect(grades(mutation, scope.canvas).roleA.verdict).toBe('fail');
      expect(scope.roleA.minimumDeltaE).toBeGreaterThanOrEqual(10);
      expect(scope.roleA.lowChromaPaints).toEqual([]);
      expect(scope.slots.every((slot: { contrast: number; chroma: number }) => slot.contrast >= 3 && slot.chroma >= 0.03)).toBe(true);
    }
  });
});
