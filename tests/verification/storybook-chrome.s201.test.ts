import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Sprint 201 m06 — Sprint 200 residue (#2087): the root Storybook loaded the token CSS but not the
// component chrome the generated apps ship with, so every OODS component rendered unstyled there.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('root Storybook loads the component chrome', () => {
  it('imports @oods/component-styles/css in the preview after the token CSS', () => {
    const preview = fs.readFileSync(path.join(root, '.storybook/preview.ts'), 'utf8');
    const tokens = preview.indexOf("import '../apps/explorer/src/styles/tokens.css';");
    const chrome = preview.indexOf("import '@oods/component-styles/css';");
    expect(tokens).toBeGreaterThanOrEqual(0);
    expect(chrome).toBeGreaterThan(tokens);
  });

  it('resolves the package from the repository root as a workspace dependency', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as { devDependencies: Record<string, string> };
    expect(manifest.devDependencies['@oods/component-styles']).toBe('workspace:*');
    const require = createRequire(path.join(root, 'package.json'));
    const resolved = require.resolve('@oods/component-styles/package.json');
    expect(fs.realpathSync(resolved)).toBe(fs.realpathSync(path.join(root, 'packages/component-styles/package.json')));
    const exportsField = (JSON.parse(fs.readFileSync(resolved, 'utf8')) as { exports: Record<string, unknown> }).exports;
    expect(exportsField['./css']).toBeTruthy();
  });
});
