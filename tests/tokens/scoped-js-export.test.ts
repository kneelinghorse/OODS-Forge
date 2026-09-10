import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const bundle = require('../../packages/tokens/dist/index.cjs') as {
  cssVariables: Record<string, string>;
  cssVariablesByScope: Record<string, Record<string, Record<string, string>>>;
};
const css = readFileSync(new URL('../../packages/tokens/dist/css/tokens.css', import.meta.url), 'utf8');
const flat = JSON.parse(readFileSync(new URL('../../packages/tokens/dist/tailwind/tokens.json', import.meta.url), 'utf8'));

describe('scoped JavaScript token export matches shipped CSS', () => {
  it('preserves the legacy flat export and exposes exactly six brand/theme cells', () => {
    expect(bundle.cssVariables).toEqual(flat.cssVariables);
    expect(Object.keys(bundle.cssVariablesByScope)).toEqual(['A', 'B']);
    for (const themes of Object.values(bundle.cssVariablesByScope)) expect(Object.keys(themes)).toEqual(['light', 'dark', 'hc']);
  });

  for (const brand of ['A', 'B']) for (const theme of ['light', 'dark', 'hc']) {
    it(`${brand}/${theme} resolves canvas, text and border through its own CSS semantic bridge`, () => {
      const selector = `[data-brand='${brand}'][data-theme='${theme}']`;
      const blocks = css.split('}').filter(block => block.includes(selector));
      const declarations = blocks.map(block => block.slice(block.lastIndexOf('{') + 1)).join('\n');
      const scope = bundle.cssVariablesByScope[brand]![theme]!;
      for (const suffix of ['surface-canvas', 'text-primary', 'border-subtle']) {
        const value = declarations.match(new RegExp(`--theme-${suffix}:\\s*([^;]+);`))?.[1];
        expect(value, `${selector}: missing semantic bridge token ${suffix}`).toBeDefined();
        expect(scope[`--oods-sys-${suffix}`]).toBe(value);
        expect(scope[`--oods-theme-${suffix}`]).toBe(value);
      }
      // All references are resolved for a non-CSS consumer; system color names
      // (Canvas, CanvasText, etc.) stay intact, since only the user agent knows them.
      expect(Object.values(scope).some(value => value.includes('var('))).toBe(false);
      expect(scope['--oods-ref-typography-families-sans']).toBeDefined();
    });
  }

  it('retains high-contrast system colors instead of inventing a server palette', () => {
    for (const brand of ['A', 'B']) {
      expect(bundle.cssVariablesByScope[brand]!.hc!['--oods-sys-surface-canvas']).toBe('Canvas');
      expect(bundle.cssVariablesByScope[brand]!.hc!['--oods-sys-text-primary']).toBe('CanvasText');
    }
  });
});
