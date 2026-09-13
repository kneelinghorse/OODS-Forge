import { describe, expect, it } from 'vitest';
import Color from 'colorjs.io';
import { generatePaletteFiles, loadPaletteSeeds } from '../../scripts/tokens/generate-palette.js';
import { isInSrgb } from '../../scripts/tokens/palette-checks.js';
import { tokenKeys } from '../../scripts/tokens/semantic-key-contract.js';
import frozen from './fixtures/semantic-keys.s197.json';

function leaves(node: any): string[] {
  if (node?.$type === 'color') return [node.$value];
  return node && typeof node === 'object' ? Object.values(node).flatMap(leaves) : [];
}
describe('dark palette preserves the hierarchy and semantic contract', () => {
  it('has five evenly separated near-neutral elevations for both brands', async () => {
    const seeds = await loadPaletteSeeds();
    const files = generatePaletteFiles(seeds, ['dark']);
    for (const brand of ['A', 'B']) {
      const roles = JSON.parse(files.get(`packages/tokens/src/tokens/brands/${brand}/dark.json`)!).color.brand[brand];
      const ladder = ['backdrop', 'canvas', 'raised', 'subtle', 'disabled'].map(role =>
        new Color(roles.surface[role].$value).to('oklch').coords.map(Number));
      ladder.forEach(([l, c, h], index) => {
        expect(c).toBeLessThan(.012);
        expect(h).toBe(seeds.brands.A.neutral.hue);
        if (index) expect(l - ladder[index - 1][0]).toBeCloseTo(seeds.brands.A.dark.elevationDelta, 6);
      });
    }
  });
  it('keeps global and brand roles in gamut, with one hue per status and less accent chroma', async () => {
    const seeds = await loadPaletteSeeds();
    const files = generatePaletteFiles(seeds);
    for (const [name, bytes] of files) {
      if (!name.includes('/dark')) continue;
      const tree = JSON.parse(bytes);
      if (tree.viz) delete tree.viz; // m04 owns chart palette generation and coverage.
      for (const color of leaves(tree)) expect(isInSrgb(color), `${name}: ${color}`).toBe(true);
    }
    for (const brand of ['A', 'B']) {
      const dark = JSON.parse(files.get(`packages/tokens/src/tokens/brands/${brand}/dark.json`)!).color.brand[brand];
      const light = JSON.parse(files.get(`packages/tokens/src/tokens/brands/${brand}/base.json`)!).color.brand[brand];
      for (const [family, roles] of Object.entries(dark.status)) {
        const expected = family === 'neutral' ? seeds.brands.A.neutral.hue : seeds.brands.A.status[family as keyof typeof seeds.brands.A.status].hue;
        for (const value of leaves(roles)) expect(Number(new Color(value).to('oklch').coords[2])).toBe(expected);
      }
      const d = new Color(dark.text.accent.$value).to('oklch').coords.map(Number);
      const l = new Color(light.text.accent.$value).to('oklch').coords.map(Number);
      expect(d[0]).toBeGreaterThan(l[0]); expect(d[1]).toBeLessThan(l[1]);
    }
  });
  it('generates all four shared dark color trees without dropping or inventing semantic names', async () => {
    const files = generatePaletteFiles(await loadPaletteSeeds(), ['dark']);
    for (const [name, bytes] of files) {
      if (!name.includes('/themes/')) continue;
      expect(tokenKeys(JSON.parse(bytes))).toEqual((frozen as Record<string, string[]>)[name]);
    }
    const focus = JSON.parse(files.get('packages/tokens/src/tokens/themes/dark/focus.json')!)['theme-dark'].focus;
    expect(focus.width).toEqual({ $type: 'dimension', $value: '2px', $description: 'Focus ring width shared with light theme.' });
  });
});
