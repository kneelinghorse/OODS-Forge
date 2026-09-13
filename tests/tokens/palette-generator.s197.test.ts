import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { generatePaletteFiles, loadPaletteSeeds, writePaletteFiles, paletteColor } from '../../scripts/tokens/generate-palette.js';
import { checkPalette, isInSrgb, selectRamp } from '../../scripts/tokens/palette-checks.js';
import { loadDtcgTokens } from '../../src/tooling/tokens/dtcg.js';
import { tokenKeys } from '../../scripts/tokens/semantic-key-contract.js';

const temps: string[] = [];
async function scratch() { const dir = await mkdtemp(path.join(tmpdir(), 's197-palette-')); temps.push(dir); return dir; }
afterEach(async () => { await Promise.all(temps.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });

describe('seed-generated palette boundary', () => {
  it('reproduces every byte, detects seed drift, and never repairs files in check mode', async () => {
    const seeds = await loadPaletteSeeds();
    const root = await scratch();
    const original = generatePaletteFiles(seeds);
    expect(original.size).toBe(11);
    expect(generatePaletteFiles(seeds)).toEqual(original);
    await writePaletteFiles(original, root);
    expect(await writePaletteFiles(original, root, true)).toEqual([]);
    seeds.brands.A.primary.hue += 10;
    const drift = await writePaletteFiles(generatePaletteFiles(seeds), root, true);
    expect(drift).toContain('packages/tokens/src/tokens/base/reference/color.brand.json');
    expect(drift).toContain('packages/tokens/src/tokens/brands/A/base.json');
    for (const [name, bytes] of original) expect(await readFile(path.join(root, name), 'utf8')).toBe(bytes);
  });

  it('fails --check at the process boundary for changed seeds and missing outputs', async () => {
    const root = await scratch();
    const script = path.resolve('scripts/tokens/generate-palette.ts');
    const seedPath = path.join(root, 'seeds.json');
    const seeds = await loadPaletteSeeds();
    await writeFile(seedPath, JSON.stringify(seeds));
    const args = ['--import', 'tsx', script, '--out', root, '--seeds', seedPath];
    expect(spawnSync(process.execPath, [...args, '--check']).status).toBe(1);
    execFileSync(process.execPath, args);
    expect(spawnSync(process.execPath, [...args, '--check']).status).toBe(0);
    seeds.brands.B.primaryHue += 15;
    await writeFile(seedPath, JSON.stringify(seeds));
    const result = spawnSync(process.execPath, [...args, '--check'], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('brands/B/base.json');
  }, 20_000);

  it.each([
    ['unknown version', (s: any) => { s.version = 2; }],
    ['out of range hue', (s: any) => { s.brands.A.primary.hue = -1; }],
    ['missing status', (s: any) => { delete s.brands.A.status.critical; }],
    ['unknown seed', (s: any) => { s.brands.A.primary.hex = '#ffffff'; }],
    ['invalid dark canvas', (s: any) => { s.brands.A.dark.canvasChroma = .1; }],
    ['independent B design', (s: any) => { s.brands.B.neutral = { hue: 20, chromaPeak: .02 }; }],
  ])('rejects %s rather than silently accepting an unused input', async (_name, mutate) => {
    const seeds = await loadPaletteSeeds();
    mutate(seeds);
    const file = path.join(await scratch(), 'invalid.json');
    await writeFile(file, JSON.stringify(seeds));
    await expect(loadPaletteSeeds(file)).rejects.toThrow('Invalid palette seeds');
  });

  it('keeps every existing reference step and brand semantic name; B shares the method', async () => {
    const files = generatePaletteFiles(await loadPaletteSeeds());
    for (const [file, bytes] of files) {
      const oldKeys = tokenKeys(JSON.parse(await readFile(file, 'utf8')));
      const newKeys = tokenKeys(JSON.parse(bytes));
      for (const key of oldKeys) expect(newKeys, file).toContain(key);
      if (file.includes('/brands/')) expect(newKeys, file).toEqual(oldKeys);
    }
    const a = JSON.parse(files.get('packages/tokens/src/tokens/brands/A/base.json')!).color.brand.A;
    const b = JSON.parse(files.get('packages/tokens/src/tokens/brands/B/base.json')!).color.brand.B;
    expect(a.surface.canvas.$value).toBe(b.surface.canvas.$value);
    expect(a.surface.interactive.primary.default.$value).not.toBe(b.surface.interactive.primary.default.$value);
  });

  it('generates coherent reference ramps from seeds, including gamut and mid-peak chroma', async () => {
    const root = await scratch();
    await writePaletteFiles(generatePaletteFiles(await loadPaletteSeeds(), ['reference']), root);
    const tokens = await loadDtcgTokens(path.join(root, 'packages/tokens/src/tokens/base/reference'));
    for (const family of ['primary', 'accent', 'neutral', 'info', 'success', 'warning', 'critical', 'archive']) {
      const entries = selectRamp(tokens, `ref.color.${family}`);
      for (const type of ['ramp-monotonicity', 'family-hue', 'chroma-curve', 'gamut'] as const) {
        const failures = checkPalette(type, family, entries, tokens).filter((row) => !row.ok);
        expect(failures, `${family}/${type}`).toEqual([]);
      }
    }
  });

  it('only emits the requested mission group so light work cannot mutate dark early', async () => {
    const files = generatePaletteFiles(await loadPaletteSeeds(), ['reference', 'light']);
    expect(files.size).toBe(5);
    expect([...files.keys()].some((name) => name.endsWith('/dark.json'))).toBe(false);
  });

  it.each([0, 25, 85, 155, 210, 265, 305])('maps hue %s into sRGB without altering lightness or hue', (hue) => {
    for (const l of [.02, .14, .5, .95, .99]) {
      const value = paletteColor(l, .3, hue);
      expect(isInSrgb(value), value).toBe(true);
      expect(value.startsWith(`oklch(${l} `)).toBe(true);
      expect(value.endsWith(` ${hue})`)).toBe(true);
    }
  });
});
