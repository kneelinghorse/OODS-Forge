import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COMPONENT_STYLE_IDS, SUPPORTED_COMPONENT_THEME_CELLS } from '../src/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '../..');
const css = fs.readFileSync(path.join(packageRoot, 'src/components.css'), 'utf8');

describe('Sprint 182 shared component style contract', () => {
  it('covers the exact 14-component nucleus with token-driven CSS', () => {
    expect(COMPONENT_STYLE_IDS).toHaveLength(14);
    for (const id of COMPONENT_STYLE_IDS) {
      expect(css, id).toContain(`[data-oods-component='${id}']`);
    }
    expect(css).toContain('@import "@oods/tokens/css"');
    expect(css).toMatch(/var\(--cmp-/);
  });

  it('binds the six declared brand/theme cells to real token sources', () => {
    expect(SUPPORTED_COMPONENT_THEME_CELLS).toHaveLength(6);
    for (const cell of SUPPORTED_COMPONENT_THEME_CELLS) {
      const tokenMode = cell.theme === 'light' ? 'base' : cell.theme;
      const source = path.join(repoRoot, 'packages/tokens/src/tokens/brands', cell.brand, `${tokenMode}.json`);
      expect(fs.existsSync(source), `${cell.brand}/${cell.theme}`).toBe(true);
    }
  });

  it('s182-m01a keeps shared high-contrast controls on matching system colors', () => {
    expect(css).toMatch(
      /\[data-oods-component='Button'\]\):disabled \{[\s\S]*?background: var\(--cmp-button-background-disabled, var\(--sys-surface-disabled, Canvas\)\);[\s\S]*?color: var\(--cmp-button-text-disabled, var\(--sys-text-disabled, GrayText\)\);/,
    );
    expect(css).toMatch(/\[data-theme='hc'\][\s\S]*?background: Canvas;[\s\S]*?color: CanvasText;/);
    expect(css).toMatch(/\[data-theme='hc'\] \.oods-field-error \{\s*color: CanvasText;/);
    expect(css).toMatch(
      /\[data-theme='hc'\][\s\S]*?\[data-oods-component='Button'\][\s\S]*?:not\(:disabled\) \{[\s\S]*?background: Highlight;[\s\S]*?color: HighlightText;/,
    );
    expect(css).toMatch(
      /\[data-theme='hc'\][\s\S]*?\[data-oods-component='Button'\][\s\S]*?:disabled \{[\s\S]*?background: Canvas;[\s\S]*?color: GrayText;/,
    );
    expect(css).toMatch(/@media \(forced-colors: active\)[\s\S]*?forced-color-adjust: none;/);
    expect(css).toMatch(/\.oods-banner-dismiss \{[\s\S]*?inline-size: 2\.5rem;[\s\S]*?color: inherit;/);
  });
});
