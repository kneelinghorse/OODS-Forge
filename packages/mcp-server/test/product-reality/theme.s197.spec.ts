import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { wire } from '../helpers/wire-boundary.js';
import { resolveTokenToColor } from '@oods/viz-core';
import { toHex } from '../../../viz-core/src/tokens/categorical-palette.js';

describe('compose theme survives app generation (s197)', () => {
  it.each(['react', 'vue'] as const)('%s shell and embedded chart inherit dark; explicit options override it', async framework => {
    const composition = wire('design.compose', 'output', await compose(wire('design.compose', 'input', {
      object: 'Subscription', context: 'workflow', preferences: { theme: 'dark' },
    })));
    expect(composition.status).toBe('ok');
    expect(composition.schema.theme).toBe('dark');
    const original = structuredClone(composition.schema);
    for (const explicit of [false, true]) {
      const theme = explicit ? 'light' : 'dark';
      const result = wire('code.generate', 'output', await generate(wire('code.generate', 'input', {
        schema: composition.schema, framework, profile: 'build', ...(explicit ? { options: { theme } } : {}),
      })));
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      const files = Object.fromEntries(result.artifact!.files.map(file => [file.path, file.contents]));
      expect(files['index.html']).toMatch(new RegExp(`<html[^>]*data-theme="${theme}" data-brand="A"`));
      expect(files['index.html']).toMatch(new RegExp(`<body[^>]*data-theme="${theme}" data-brand="A"`));
      expect(files[framework === 'react' ? 'src/main.tsx' : 'src/main.ts']).toContain(`element.dataset.theme = "${theme}"`);
      const canvas = toHex(resolveTokenToColor('--sys-surface-canvas', { theme, brand: 'A' })!);
      expect(files['src/charts/payment-001.svg']).toMatch(new RegExp(`^<svg[^>]*>\\s*<rect[^>]*fill="${canvas}"`));
    }
    expect(composition.schema).toEqual(original);
  }, 60_000);
});
