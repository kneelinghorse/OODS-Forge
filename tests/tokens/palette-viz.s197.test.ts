import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generatePaletteFiles, loadPaletteSeeds, writePaletteFiles } from '../../scripts/tokens/generate-palette.js';
import { runVizScaleValidation } from '../../scripts/tokens/validate-viz-scales.js';
import { evaluateCategoricalRoleA, evaluateCategoricalRoleC } from '../../packages/mcp-server/src/tools/certify-contrast.js';
import { normaliseColor } from '@oods/a11y-tools';
import Color from 'colorjs.io';

const dirs: string[] = [];
afterEach(async () => { await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))); });
describe('s197 chart palette is scoped, coherent and distinguishable', () => {
  it('all six hues clear the actual certification target and both canvas thresholds', async () => {
    const seeds = await loadPaletteSeeds(), files = generatePaletteFiles(seeds);
    for (const theme of ['light', 'dark']) {
      const tree = JSON.parse(files.get(theme === 'light' ? 'packages/tokens/src/viz-scales.json' : 'packages/tokens/src/tokens/brands/A/dark.json')!).viz.scale.categorical;
      const values = Object.values(tree).map((leaf: any) => leaf.$value as string);
      const paints = values.map(value => normaliseColor(value));
      expect(evaluateCategoricalRoleA(paints).minimumDeltaE).toBeGreaterThanOrEqual(12);
      for (let i = 0; i < values.length; i++) {
        const [, c, h] = new Color(values[i]).to('oklch').coords.map(Number);
        expect(c).toBeGreaterThanOrEqual(.045);
        expect(h).toBe((seeds.viz.categorical.hueOffset + i * 60) % 360);
        for (const brand of ['A', 'B']) {
          const canvas = JSON.parse(files.get(`packages/tokens/src/tokens/brands/${brand}/${theme === 'light' ? 'base' : 'dark'}.json`)!).color.brand[brand].surface.canvas.$value;
          expect(evaluateCategoricalRoleC([paints[i]], {}, normaliseColor(canvas)).verdict).toBe('pass');
        }
      }
    }
  });
  it('validates dark shape as well as coverage and catches a dark-only asymmetry', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'oods-s197-viz-')); dirs.push(root);
    await writePaletteFiles(generatePaletteFiles(await loadPaletteSeeds()), root);
    const source = path.join(root, 'packages/tokens/src/viz-scales.json');
    expect((await runVizScaleValidation(source)).filter(row => !row.ok)).toEqual([]);
    const dark = path.join(root, 'packages/tokens/src/tokens/brands/B/dark.json');
    const doc = JSON.parse(await readFile(dark, 'utf8'));
    doc.viz.scale.diverging['pos-03'].$value = 'oklch(.5 .01 17.5)';
    await writeFile(dark, JSON.stringify(doc));
    expect((await runVizScaleValidation(source)).some(row => !row.ok && row.scope.startsWith('B/dark/diverging/chroma-'))).toBe(true);
    delete doc.viz.scale.sequential['03']; await writeFile(dark, JSON.stringify(doc));
    expect((await runVizScaleValidation(source)).some(row => !row.ok && row.type === 'dark-coverage' && row.scope.includes('B/dark'))).toBe(true);
  });
  it('requires exactly six authored light and dark categorical slots', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'oods-s197-seeds-')); dirs.push(root);
    const seeds = await loadPaletteSeeds(); seeds.viz.categorical.dark.pop();
    const source = path.join(root, 'seeds.json'); await writeFile(source, JSON.stringify(seeds));
    await expect(loadPaletteSeeds(source)).rejects.toThrow('Invalid palette seeds');
  });
});
