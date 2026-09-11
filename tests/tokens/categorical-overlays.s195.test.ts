import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
// @ts-ignore — build tooling has no generated declarations.
import { findCollisions } from '../../packages/tokens/scripts/collision-guard.mjs';

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
const shared = 'src/viz-scales.json';
const base = 'src/tokens/brands/A/base.json';
const dark = 'src/tokens/brands/A/dark.json';
const hc = 'src/tokens/brands/A/hc.json';
function conflicts(files: string[], path = ['viz', 'scale', 'categorical', '05'], sameBases = false) {
  const root = mkdtempSync(join(tmpdir(), 'oods-categorical-overlay-')); temporary.push(root);
  files.forEach((file, index) => {
    const doc = path.reduceRight((value, key) => ({ [key]: value }), { $value: `oklch(0.${sameBases && file.endsWith('/base.json') ? 5 : index + 3} 0.1 23)`, $type: 'color' } as Record<string, unknown>);
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), JSON.stringify(doc));
  });
  return findCollisions(files, root);
}

describe('s195 exact canonical categorical overlay chains', () => {
  it.each([[shared, base], [shared, dark], [shared, base, dark]])('allows shared -> one brand base/dark: %j', (...files) => {
    expect(conflicts(files)).toEqual([]);
  });
  it('accepts globally loaded identical A/B base categorical overrides but rejects conflicting values', () => {
    const both = [shared, base, 'src/tokens/brands/B/base.json'];
    expect(conflicts(both, undefined, true)).toEqual([]);
    expect(conflicts([...both, dark], undefined, true)).toEqual([]);
    expect(conflicts(both)).toHaveLength(1);
    expect(conflicts([...both, dark])).toHaveLength(1);
  });
  it('retains HC slot04 only, including a base override before the retained HC value', () => {
    expect(conflicts([shared, hc], ['viz', 'scale', 'categorical', '04'])).toEqual([]);
    expect(conflicts([shared, base, hc], ['viz', 'scale', 'categorical', '04'])).toEqual([]);
    expect(conflicts([shared, hc])).toHaveLength(1);
  });
  it.each([
    [shared, base, 'src/tokens/brands/B/dark.json'],
    [shared, dark, base],
    [shared, dark, hc],
    [shared, 'src/tokens/brands/A/extra.json'],
    [shared, 'src/tokens/brands/C/base.json'],
  ])('rejects cross-brand, reversed, mixed-theme and undeclared chains: %j', (...files) => {
    expect(conflicts(files)).toHaveLength(1);
  });
  it('rejects shared shadows outside the six fixed categorical slots', () => {
    for (const path of [['viz', 'scale', 'categorical', '07'], ['viz', 'scale', 'sequential', '01'], ['sys', 'text', 'primary']]) {
      expect(conflicts([shared, base], path)).toHaveLength(1);
    }
  });
});
