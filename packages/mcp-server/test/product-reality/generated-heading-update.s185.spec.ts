import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { snakeToCamel } from '../../src/codegen/binding-utils.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const requireVue = createRequire(new URL('../../../components-vue/package.json', import.meta.url));
const vueCompiler = requireVue('@vue/compiler-sfc');
const esbuild = createRequire(requireVue.resolve('vite/package.json'))('esbuild');

function objectProps(schema: UiSchema): Record<string, unknown> {
  return Object.fromEntries(Object.entries(schema.objectSchema ?? {}).map(([field, entry]) => [
    snakeToCamel(field),
    field === 'plan_name' ? 'Starter plan'
      : entry.enum?.[0] ?? (entry.type === 'boolean' ? false
        : ['number', 'integer'].includes(entry.type) ? 0
          : entry.type === 'array' || entry.type.endsWith('[]') ? []
            : entry.type === 'object' ? {} : ''),
  ]));
}

describe('Sprint 185 live generated plan heading updates', () => {
  it.each(['react', 'vue'] as const)(
    'mounts real generated %s and updates the read-only heading through its existing Textarea writer',
    async (framework) => {
      const operand = readFileSync(path.join(
        repositoryRoot,
        'artifacts/product-reality/sprint-183/m04/saved-schema-store/plan-form-dark.json',
      ));
      const schema = (JSON.parse(operand.toString('utf8')) as { schema: UiSchema }).schema;
      const generated = await generateCode({
        framework, profile: 'build', schema, options: { typescript: true, styling: 'tokens' },
      });
      expect(generated.status, JSON.stringify(generated.errors ?? [])).toBe('ok');
      expect(generated.artifact).toBeDefined();
      expect(generated.validationReceipt.notChecked).toEqual([
        'rendered-evidence', 'interaction-evidence', 'accessibility-evidence',
        'theme-evidence', 'determinism-evidence', 'performance-evidence', 'certification-evidence',
      ]);

      const cacheRoot = path.join(repositoryRoot, `packages/components-${framework}/.cache`);
      mkdirSync(cacheRoot, { recursive: true });
      const directory = mkdtempSync(path.join(cacheRoot, 's185-generated-heading-'));
      const bundlePath = path.join(directory, 'GeneratedUI.cjs');
      const requireBundle = createRequire(bundlePath);
      try {
        let source = generated.code;
        if (framework === 'vue') {
          const parsed = vueCompiler.parse(source, { filename: 'GeneratedUI.vue' });
          expect(parsed.errors).toEqual([]);
          source = vueCompiler.compileScript(parsed.descriptor, {
            id: 's185-generated-plan', inlineTemplate: true,
          }).content;
        }
        const sourcePath = path.join(directory, framework === 'react' ? 'GeneratedUI.tsx' : 'GeneratedUI.ts');
        writeFileSync(sourcePath, source);
        // Standard compilation emits the real CSS import as a companion asset.
        // Framework runtimes and both package root/subpath imports remain external
        // and resolve to the built packages; no helper component or alias is used.
        const build = esbuild.buildSync({
          entryPoints: [sourcePath],
          outfile: bundlePath,
          bundle: true,
          platform: 'node',
          format: 'cjs',
          target: 'es2022',
          jsx: 'automatic',
          external: ['react', 'react-dom', 'vue', '@oods/components-react', '@oods/components-react/*',
            '@oods/components-vue', '@oods/components-vue/*'],
          metafile: true,
          logLevel: 'silent',
        });
        expect(Object.keys(build.metafile.outputs).some((file) => file.endsWith('.css'))).toBe(true);
        expect(requireBundle.resolve(`@oods/components-${framework}`).replaceAll('\\', '/'))
          .toContain(`/packages/components-${framework}/dist/index.cjs`);

        const runtimePath = path.join(directory, 'mount.cjs');
        // Install DOM globals before loading either real framework runtime in a
        // fresh process. Server code.generate retains its normal Node environment.
        writeFileSync(runtimePath, `
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLTextAreaElement', 'Element', 'SVGElement', 'Node', 'Event']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? dom.window : dom.window[key] });
}
const framework = ${JSON.stringify(framework)};
const generated = require('./GeneratedUI.cjs');
const actionCalls = [];
const actions = Object.fromEntries(${JSON.stringify(generated.artifact!.actions.map(({ name }) => name))}.map(name => [name, () => actionCalls.push(name)]));
const props = { ...${JSON.stringify(framework === 'react' ? objectProps(schema) : {})}, actions };
let unmount = () => {};
(async () => {
  try {
    let container;
    let edit;
    if (framework === 'react') {
      const React = require('react');
      const { render, fireEvent } = require('@testing-library/react');
      const mounted = render(React.createElement(generated.GeneratedUI, props));
      container = mounted.container;
      unmount = () => mounted.unmount();
      edit = async (textarea, value) => fireEvent.change(textarea, { target: { value } });
    } else {
      const { createApp, nextTick } = require('vue');
      container = document.createElement('div');
      document.body.append(container);
      const app = createApp(generated.default, props);
      app.mount(container);
      unmount = () => { app.unmount(); container.remove(); };
      edit = async (textarea, value) => {
        textarea.value = value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await nextTick();
      };
    }
    const header = container.querySelector('#form-title-1[data-oods-component="DetailHeader"]');
    const textarea = container.querySelector('textarea#slot-field-0-3');
    assert.ok(header, 'generated DetailHeader is mounted');
    assert.ok(textarea, 'existing Textarea writer is mounted');
    assert.equal(header.tagName, 'HEADER');
    assert.equal(header.querySelectorAll('h1').length, 1);
    if (textarea.value) assert.equal(header.querySelector('h1').textContent, textarea.value);
    assert.equal(header.querySelector('input,textarea,select,button,[contenteditable]'), null);
    assert.equal(header.hasAttribute('onchange'), false);
    const headingValues = [];
    for (const value of ['Enterprise plan', 'Annual enterprise plan']) {
      await edit(textarea, value);
      assert.equal(textarea.value, value);
      assert.equal(header.querySelector('h1').textContent, value);
      headingValues.push(header.querySelector('h1').textContent);
    }
    assert.deepEqual(actionCalls, []);
    process.stdout.write(JSON.stringify({ framework, headingValues, actionCalls }));
  } finally {
    unmount();
    dom.window.close();
  }
})().catch(error => { process.stderr.write(String(error.stack || error)); process.exitCode = 1; });
`);
        const mounted = spawnSync(process.execPath, [runtimePath], {
          cwd: directory, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
        });
        expect(mounted.status, `${mounted.stdout}\n${mounted.stderr}`).toBe(0);
        expect(JSON.parse(mounted.stdout)).toEqual({
          framework, headingValues: ['Enterprise plan', 'Annual enterprise plan'], actionCalls: [],
        });
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  );
});
