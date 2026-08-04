/**
 * s171 m05a (#1158) — brand status literals must be brand-AUTHORED, not byte-copies of
 * the shared theme layer.
 *
 * WHAT THIS GUARDS. Each brand file declares 20 `color.brand.<X>.status.*` literals.
 * Copying a value verbatim from the theme status layer silently substitutes the shared
 * neutral identity for a brand identity — the drift the s169/s170 reviews flagged on
 * brand B dark. The control is SOURCE-JSON byte equality: brand literal value vs the
 * corresponding theme layer's status values (theme0 for base files, dark for dark files).
 *
 * WHAT THIS DOES NOT CLAIM. `base/reference/color.status.json` is LEGITIMATELY consumed —
 * the theme0 status layer aliases into it and it is emitted on every platform. Consuming
 * the reference ramp is not the defect; a brand literal that byte-copies a THEME value is.
 *
 * THE B/DARK RATCHET (Derek-ratified 2026-08-04, memo §1f #1158): brand B dark ships
 * with EXACTLY five byte-copies today — `status.critical.icon` plus all four
 * `status.neutral` slots. Re-authoring them is deliberately deferred, so this spec pins
 * the EXACT set: it fails if the set grows, shrinks, or changes membership, either
 * direction. A shrink is progress — celebrate it by tightening the ratchet here.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

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

/** The ratchet: brand B dark's exact five deferred byte-copies — no more, no fewer. */
const B_DARK_RATCHET = [
  'color.brand.B.status.critical.icon',
  'color.brand.B.status.neutral.border',
  'color.brand.B.status.neutral.icon',
  'color.brand.B.status.neutral.surface',
  'color.brand.B.status.neutral.text',
];

describe('brand status literal provenance (#1158)', () => {
  it('every brand file declares exactly 20 status literals', () => {
    for (const { brand, theme } of CASES) {
      expect(brandStatusLeaves(brand, theme).size, `${brand}/${theme}`).toBe(20);
    }
  });

  for (const { brand, theme, own } of CASES.filter(
    (candidate) => !(candidate.brand === 'B' && candidate.theme === 'dark'),
  )) {
    it(`${brand}/${theme} has ZERO byte-copies of the ${own} status layer`, () => {
      expect(byteCopies(brandStatusLeaves(brand, theme), themeStatus[own])).toEqual([]);
    });
  }

  it('B/dark ratchet-pins EXACTLY its five deferred byte-copies of the dark status layer', () => {
    expect(byteCopies(brandStatusLeaves('B', 'dark'), themeStatus.dark)).toEqual(B_DARK_RATCHET);
  });

  for (const { brand, theme, cross } of CASES) {
    it(`${brand}/${theme} has zero CROSS-SET copies (vs the ${cross} status layer)`, () => {
      expect(byteCopies(brandStatusLeaves(brand, theme), themeStatus[cross])).toEqual([]);
    });
  }
});
