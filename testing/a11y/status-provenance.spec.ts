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
 * THE B/DARK RATCHET IS GONE (s172 m05). It pinned exactly five deferred byte-copies —
 * `status.critical.icon` plus all four `status.neutral` slots — as a hold-the-line measure
 * while re-authoring was deferred. s172 re-authored them: the four neutrals moved from hue
 * 260 to 252 (brand B's OWN info hue, an 8° nudge toward its brand hue 232) and
 * critical.icon from 24 to 23 (family-coherent ±1 — the critical family sits at ~24, and the
 * formula's 8° nudge would have landed on 16 and broken that coherence; the deviation is
 * Derek-ratified and recorded in the s172 memo §1e). L and C are BYTE-IDENTICAL in all five;
 * only hue moved, so the perceptual identity is preserved by construction and then proven:
 * measured through the enforcing oracle's own sRGB-clipped path, critical.icon vs
 * critical.surface is 6.7110 (floor 3), neutral.text vs the new surface is 8.2425 (floor
 * 4.5) and neutral.icon vs it is 5.4759 (floor 3). border carries no role, so no floor
 * applies to it.
 *
 * So B/dark is now in the SAME zero-copies loop as the other three cells, and this file has
 * no special case left. The test count is UNCHANGED: the ratchet test was replaced 1-for-1
 * by B/dark's zero-copies case, so what moved is the assertion, not the arithmetic.
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

describe('brand status literal provenance (#1158)', () => {
  it('every brand file declares exactly 20 status literals', () => {
    for (const { brand, theme } of CASES) {
      expect(brandStatusLeaves(brand, theme).size, `${brand}/${theme}`).toBe(20);
    }
  });

  // All FOUR cells now, B/dark included — the s171 filter and its ratchet companion are gone.
  for (const { brand, theme, own } of CASES) {
    it(`${brand}/${theme} has ZERO byte-copies of the ${own} status layer`, () => {
      expect(byteCopies(brandStatusLeaves(brand, theme), themeStatus[own])).toEqual([]);
    });
  }

  for (const { brand, theme, cross } of CASES) {
    it(`${brand}/${theme} has zero CROSS-SET copies (vs the ${cross} status layer)`, () => {
      expect(byteCopies(brandStatusLeaves(brand, theme), themeStatus[cross])).toEqual([]);
    });
  }
});
