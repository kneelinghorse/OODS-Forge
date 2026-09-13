/**
 * s197 supersedes #1158's byte-inequality proxy: status identity now comes from
 * shared authored seeds, and Brand B varies only its primary hue. Equal generated
 * values are intended. Verify provenance directly so hand-copied or independently
 * nudged status values still fail, without manufacturing hue drift for identity.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generatePaletteFiles, loadPaletteSeeds } from '../../scripts/tokens/generate-palette.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_SRC = path.resolve(moduleDir, '../../packages/tokens/src/tokens');

type Leaves = Map<string, string>;

function leaves(node: unknown, prefix: string[] = [], out: Leaves = new Map()): Leaves {
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if ('$value' in record) {
      out.set(prefix.join('.'), String(record.$value));
      return out;
    }
    for (const [key, value] of Object.entries(record)) {
      if (key.startsWith('$')) continue;
      leaves(value, [...prefix, key], out);
    }
  }
  return out;
}

function loadLeaves(relativePath: string): Leaves {
  return leaves(JSON.parse(readFileSync(path.join(TOKENS_SRC, relativePath), 'utf8')));
}

const themeStatus = {
  theme0: loadLeaves('themes/theme0/status.json'),
  dark: loadLeaves('themes/dark/status.json'),
};

function brandStatusLeaves(brand: 'A' | 'B', theme: 'base' | 'dark'): Leaves {
  const all = loadLeaves(`brands/${brand}/${theme}.json`);
  return new Map([...all].filter(([key]) => key.includes('status')));
}

function byteCopies(brandLeaves: Leaves, themeLayer: Leaves): string[] {
  const themeValues = new Set(themeLayer.values());
  return [...brandLeaves]
    .filter(([, value]) => themeValues.has(value))
    .map(([key]) => key)
    .sort();
}

const CASES = [
  { brand: 'A', theme: 'base', own: 'theme0', cross: 'dark' },
  { brand: 'A', theme: 'dark', own: 'dark', cross: 'theme0' },
  { brand: 'B', theme: 'base', own: 'theme0', cross: 'dark' },
  { brand: 'B', theme: 'dark', own: 'dark', cross: 'theme0' },
] as const;

describe('brand status literal provenance (#1158)', () => {
  it('every brand file declares exactly 20 status literals', () => {
    for (const { brand, theme } of CASES) {
      expect(brandStatusLeaves(brand, theme).size, `${brand}/${theme}`).toBe(20);
    }
  });

  for (const { brand, theme } of CASES) {
    it(`${brand}/${theme} is derived from the authored seeds`, async () => {
      const file = `packages/tokens/src/tokens/brands/${brand}/${theme}.json`;
      const expected = leaves(JSON.parse(generatePaletteFiles(await loadPaletteSeeds()).get(file)!));
      expect(brandStatusLeaves(brand, theme)).toEqual(new Map([...expected].filter(([key]) => key.includes('status'))));
    });
  }

  it('a status hue change reaches both brands and the shared dark theme, without changing unrelated families', async () => {
    const seeds = await loadPaletteSeeds();
    const before = generatePaletteFiles(seeds);
    seeds.brands.A.status.success.hue += 12;
    const after = generatePaletteFiles(seeds);
    for (const file of [...CASES.map(({ brand, theme }) => `packages/tokens/src/tokens/brands/${brand}/${theme}.json`),
      'packages/tokens/src/tokens/themes/dark/status.json']) {
      const previous = leaves(JSON.parse(before.get(file)!));
      const current = leaves(JSON.parse(after.get(file)!));
      const changed = [...current].filter(([key, value]) => value !== previous.get(key)).map(([key]) => key);
      expect(changed).toHaveLength(4);
      expect(changed.every(key => key.includes('.status.success.'))).toBe(true);
    }
  });

  for (const { brand, theme, cross } of CASES) {
    it(`${brand}/${theme} has zero CROSS-SET copies (vs the ${cross} status layer)`, () => {
      expect(byteCopies(brandStatusLeaves(brand, theme), themeStatus[cross])).toEqual([]);
    });
  }
});
