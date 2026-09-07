import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { emit as htmlEmit } from '../../src/codegen/html-emitter.js';
import { executeCompositionDirectives } from '../../src/codegen/composition-directives.js';
import { emit as reactEmit } from '../../src/codegen/react-emitter.js';
import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import type { CodegenFramework, CodegenOptions } from '../../src/codegen/types.js';
import { emit as vueEmit } from '../../src/codegen/vue-emitter.js';
import { renderTree } from '../../src/render/tree-renderer.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';
import { handle as renderWithRepl } from '../../src/tools/repl.render.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const mcpServerRoot = path.join(repositoryRoot, 'packages/mcp-server');
const reactPackageRoot = path.join(repositoryRoot, 'packages/components-react');
const reactRequire = createRequire(path.join(reactPackageRoot, 'package.json'));
const vuePackageRoot = path.join(repositoryRoot, 'packages/components-vue');
const vueRequire = createRequire(path.join(vuePackageRoot, 'package.json'));
const options: CodegenOptions = { typescript: true, styling: 'tokens' };

function savedSchema(name: string): UiSchema {
  const record = JSON.parse(readFileSync(path.join(
    repositoryRoot,
    `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`,
  ), 'utf8')) as { schema: UiSchema };
  return record.schema;
}

const bindingKindSchema: UiSchema = {
  version: '2026.09',
  objectSchema: {
    cancel_at_period_end: { type: 'boolean', required: true },
    allowed_transitions: { type: 'string[]', required: false },
  },
  screens: [{
    id: 'binding-kind-root',
    component: 'Stack',
    children: [
      {
        id: 'boolean-select',
        component: 'Select',
        props: {
          field: 'cancel_at_period_end',
          placeholder: 'Choose cancellation timing',
        },
      },
      {
        id: 'array-text',
        component: 'Text',
        props: { field: 'allowed_transitions', label: 'Allowed transitions' },
      },
    ],
  }],
};

const directiveWithoutChildrenSchema: UiSchema = {
  version: '2026.09',
  objectSchema: {
    status: { type: 'string', required: true },
    allowed_transitions: { type: 'string[]', required: false },
  },
  screens: [{
    id: 'slot-tab-0-4',
    component: 'Stack',
    props: {
      patternComponent: 'StatusTimeline',
      fields: ['status', 'allowed_transitions'],
    },
  }],
};

const INVALID_PROP_CASES = (['react', 'vue'] as const).flatMap((framework) => ([
  [framework, 'Select', { bogusProp: true }],
  [framework, 'Stack', { bogusProp: true }],
  [framework, 'Text', { bogusProp: true }],
  [framework, 'Select', { placeholder: 3 }],
] as const));

function reactSemanticErrors(code: string): string[] {
  const root = mkdtempSync(path.join(tmpdir(), 'oods-s184-react-widening-'));
  try {
    mkdirSync(path.join(root, 'node_modules/@oods'), { recursive: true });
    mkdirSync(path.join(root, 'node_modules/@types'), { recursive: true });
    for (const dependency of ['react', 'react-dom'] as const) {
      symlinkSync(
        path.dirname(reactRequire.resolve(`${dependency}/package.json`)),
        path.join(root, `node_modules/${dependency}`),
        'junction',
      );
    }
    for (const dependency of ['react', 'react-dom'] as const) {
      symlinkSync(
        path.dirname(reactRequire.resolve(`@types/${dependency}/package.json`)),
        path.join(root, `node_modules/@types/${dependency}`),
        'junction',
      );
    }
    symlinkSync(
      reactPackageRoot,
      path.join(root, 'node_modules/@oods/components-react'),
      'junction',
    );
    const generatedPath = path.join(root, 'GeneratedUI.tsx');
    writeFileSync(generatedPath, code);
    const program = ts.createProgram([generatedPath], {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      target: ts.ScriptTarget.ES2022,
    });
    return ts.getPreEmitDiagnostics(program)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function vueStrictResult(code: string): { status: number | null; output: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'oods-s184-vue-widening-'));
  try {
    mkdirSync(path.join(root, 'node_modules/@oods'), { recursive: true });
    symlinkSync(
      path.dirname(vueRequire.resolve('vue/package.json')),
      path.join(root, 'node_modules/vue'),
      'junction',
    );
    symlinkSync(
      vuePackageRoot,
      path.join(root, 'node_modules/@oods/components-vue'),
      'junction',
    );
    writeFileSync(path.join(root, 'GeneratedUI.vue'), code);
    writeFileSync(path.join(root, 'tsconfig.json'), `${JSON.stringify({
      compilerOptions: {
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: 'ES2022',
      },
      include: ['./GeneratedUI.vue'],
    }, null, 2)}\n`);
    const result = spawnSync(process.execPath, [
      vueRequire.resolve('vue-tsc/bin/vue-tsc.js'),
      '--noEmit',
      '--pretty',
      'false',
      '-p',
      path.join(root, 'tsconfig.json'),
    ], { cwd: mcpServerRoot, encoding: 'utf8', timeout: 120_000 });
    return {
      status: result.status,
      output: `${result.stdout}\n${result.stderr}`.trim(),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('Sprint 184 m03 target contract and emitter movement', () => {
  it.each(['react', 'vue'] as const)(
    'clears every nucleus contract issue in both immutable Subscription schemas and the tier-1 control on %s',
    (framework) => {
      for (const name of [
        'subscription-list-dark',
        'subscription-detail-dark',
        'tier1-acceptance-sub-detail',
      ]) {
        expect(
          preflightTargetContracts(savedSchema(name), framework).issues,
          name,
        ).toEqual([]);
      }
    },
  );

  it.each(['react', 'vue'] as const)(
    'accepts only the declared boolean Select and array Text bindings on %s',
    (framework) => {
      expect(preflightTargetContracts(bindingKindSchema, framework).issues).toEqual([]);
    },
  );

  it('emits explicit React coercion and joining expressions that strict-check against the built package', () => {
    const result = reactEmit(bindingKindSchema, options);

    expect(result.code).toMatch(/<Select[^>]*value=\{String\(cancelAtPeriodEnd\)\}/);
    expect(result.code).toContain(
      "{Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : ''}",
    );
    expect(result.code).toContain('allowedTransitions?: string[];');
    expect(result.code).not.toContain('allowedTransitions?: unknown;');
    expect(result.code).not.toContain('[object Object]');
    expect(result.code).not.toMatch(/<Select[^>]*value=\{cancelAtPeriodEnd\}/);
    expect(reactSemanticErrors(result.code)).toEqual([]);
  });

  it('emits readonly-safe Vue coercion and joining expressions that strict-check against the built package', () => {
    const result = vueEmit(bindingKindSchema, options);

    expect(result.code).toMatch(/<Select[^>]*:modelValue="String\(cancelAtPeriodEnd\)"/);
    expect(result.code).not.toContain('v-model="cancelAtPeriodEnd"');
    expect(result.code).toContain(
      "{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}",
    );
    expect(result.code).toContain('const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);');
    expect(result.code).not.toContain('ref<unknown>');
    expect(result.code).not.toContain('[object Object]');
    expect(vueStrictResult(result.code)).toEqual({ status: 0, output: '' });
  });

  it('keeps both HTML field bindings visible without stringifying an array object', () => {
    const result = htmlEmit(bindingKindSchema, options);

    expect(result.code).toContain('data-bind="value:cancelAtPeriodEnd"');
    expect(result.code).toContain('data-prop-value="[cancelAtPeriodEnd]"');
    expect(result.code).toContain(
      '<option value="" disabled selected>Choose cancellation timing</option>',
    );
    expect(result.code).toContain('data-bind="allowedTransitions"');
    expect(result.code).toContain('>[allowedTransitions]</p>');
    expect(result.code).not.toContain('[object Object]');
  });

  it.each([
    ['react', reactEmit],
    ['vue', vueEmit],
    ['html', htmlEmit],
  ] as const)(
    'executes the fields directive as an actual StatusTimeline on %s even without authored children',
    (_framework, emitter) => {
      const result = emitter(directiveWithoutChildrenSchema, options);

      expect(result.code).toContain('StatusTimeline');
      expect(result.code).toContain('slot-tab-0-4');
      expect(result.code).toContain('status');
      expect(result.code).toContain('allowedTransitions');
      expect(result.code).not.toMatch(/\spatternComponent=/);
      expect(result.code).not.toMatch(/\sfields=/);
      expect(result.code).not.toMatch(/\s:patternComponent=/);
      expect(result.code).not.toMatch(/\s:fields=/);
      expect(result.code).not.toContain('data-prop-pattern-component');
      expect(result.code).not.toContain('data-prop-fields');
    },
  );

  it('lowers the saved directive to the exact named pattern and authored field order', () => {
    const transformed = executeCompositionDirectives(savedSchema('subscription-detail-dark'));
    const stack = [...transformed.screens];
    let timeline = stack.pop();
    while (timeline && timeline.id !== 'slot-tab-0-4') {
      stack.push(...(timeline.children ?? []));
      timeline = stack.pop();
    }

    expect(timeline).toEqual(expect.objectContaining({
      id: 'slot-tab-0-4',
      component: 'StatusTimeline',
    }));
    expect(timeline?.props ?? {}).not.toHaveProperty('patternComponent');
    expect(timeline?.props ?? {}).not.toHaveProperty('fields');
    expect(timeline?.children?.map((child) => ({
      id: child.id,
      field: child.props?.field,
    }))).toEqual([
      { id: 'pg-status-timeline-25', field: 'status' },
      { id: 'pg-status-timeline-26', field: 'allowed_transitions' },
    ]);
  });

  it('executes the directive through the direct tree renderer and repl.render document path', async () => {
    const treeHtml = renderTree(directiveWithoutChildrenSchema);
    const repl = await renderWithRepl({
      mode: 'full',
      schema: directiveWithoutChildrenSchema,
      apply: true,
      output: { format: 'document', compact: true },
    } as never);

    for (const html of [treeHtml, repl.html as string]) {
      expect(html).toMatch(/id="slot-tab-0-4"[^>]*data-oods-component="StatusTimeline"/);
      expect(html).toContain('[status]');
      expect(html).toContain('[allowedTransitions]');
      expect(html).not.toContain('data-prop-pattern-component');
      expect(html).not.toContain('data-prop-fields');
    }
  });

  it.each([
    ['react', reactEmit],
    ['vue', vueEmit],
    ['html', htmlEmit],
  ] as const)(
    'preserves the saved directive node and its two visible field bindings on %s',
    (_framework, emitter) => {
      const result = emitter(savedSchema('subscription-detail-dark'), options);

      expect(result.code).toMatch(/StatusTimeline[^>]*slot-tab-0-4|slot-tab-0-4[^>]*StatusTimeline/);
      expect(result.code).toContain('pg-status-timeline-25');
      expect(result.code).toContain('pg-status-timeline-26');
      expect(result.code).toContain('status');
      expect(result.code).toContain('allowedTransitions');
      expect(result.code).not.toMatch(/\spatternComponent=/);
      expect(result.code).not.toMatch(/\sfields=/);
      expect(result.code).not.toMatch(/\s:patternComponent=/);
      expect(result.code).not.toMatch(/\s:fields=/);
      expect(result.code).not.toContain('data-prop-pattern-component');
      expect(result.code).not.toContain('data-prop-fields');
    },
  );

  it('pins the invalid-prop companion matrix at four cases for each target', () => {
    expect(INVALID_PROP_CASES).toHaveLength(8);
    expect(INVALID_PROP_CASES.filter(([framework]) => framework === 'react')).toHaveLength(4);
    expect(INVALID_PROP_CASES.filter(([framework]) => framework === 'vue')).toHaveLength(4);
  });

  it.each(INVALID_PROP_CASES)(
    'keeps %s %s invalid input blocked after the bounded widening',
    async (framework, component, props) => {
      const schema: UiSchema = {
        version: '2026.09',
        screens: [{ id: 'invalid-node', component, props }],
      };
      const issues = preflightTargetContracts(schema, framework as CodegenFramework).issues;
      const result = await generateCode({ framework, profile: 'build', schema });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toEqual(expect.objectContaining({
        code: 'OODS-V007',
        nodeId: 'invalid-node',
        component,
      }));
      expect(result.status).toBe('error');
      expect(result.code).toBe('');
      expect(result.imports).toEqual([]);
      expect(result.artifact).toBeUndefined();
      expect(result.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'OODS-V007',
          nodeId: 'invalid-node',
          component,
        }),
      ]));
    },
  );

  it.each(['react', 'vue'] as const)(
    'fails a %s directive closed when a named composition field is absent',
    (framework) => {
      const schema = structuredClone(directiveWithoutChildrenSchema);
      delete schema.objectSchema?.allowed_transitions;
      const issues = preflightTargetContracts(schema, framework).issues;

      expect(issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'OODS-V007',
          nodeId: 'slot-tab-0-4',
          message: expect.stringMatching(/allowed_transitions.*does not exist/i),
        }),
      ]));
    },
  );
});
