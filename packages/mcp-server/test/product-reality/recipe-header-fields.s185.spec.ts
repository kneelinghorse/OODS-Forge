import { createRequire } from 'node:module';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { resolveFrameworkRecipeProps } from '../../src/codegen/binding-utils.js';
import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as pipeline } from '../../src/tools/pipeline.js';

const frameworkRequire = {
  react: createRequire(new URL('../../../components-react/package.json', import.meta.url)),
  vue: createRequire(new URL('../../../components-vue/package.json', import.meta.url)),
};

function schema(props: Record<string, unknown> = {}): UiSchema {
  return {
    version: '2026.02',
    screens: [{
      id: 'recipe-header', component: 'CardHeader',
      props: { titleField: 'heading_label', supportingField: 'support_copy', ...props },
    }],
    objectSchema: {
      heading_label: { type: 'string', required: true },
      support_copy: { type: 'string', required: false },
      alternate_title: { type: 'string', required: false },
    },
  };
}

async function renderGenerated(source: string, framework: 'react' | 'vue', data: Record<string, string>): Promise<string> {
  const require = frameworkRequire[framework];
  let compilable = source;
  if (framework === 'vue') {
    const compiler = require('@vue/compiler-sfc');
    const parsed = compiler.parse(source, { filename: 'RecipeHeader.vue' });
    expect(parsed.errors).toEqual([]);
    compilable = compiler.compileScript(parsed.descriptor, { id: 'recipe-header', inlineTemplate: true }).content;
  }
  const compiled = ts.transpileModule(compilable, {
    fileName: framework === 'react' ? 'RecipeHeader.tsx' : 'RecipeHeader.ts',
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  expect(compiled.diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error)).toEqual([]);
  const module = { exports: {} as { default?: unknown; GeneratedUI?: unknown } };
  new Function('require', 'module', 'exports', compiled.outputText)(
    (specifier: string) => require.resolve(specifier).endsWith('.css') ? {} : require(specifier), module, module.exports,
  );
  if (framework === 'react') {
    return require('react-dom/server').renderToStaticMarkup(require('react').createElement(module.exports.GeneratedUI, data));
  }
  return require('@vue/server-renderer').renderToString(require('vue').createSSRApp(module.exports.default, data));
}

describe('Sprint 185 legacy CardHeader recipe fields retain their data meaning', () => {
  it('retains the original Labelled trait directives in the Product/card producer', async () => {
    const result = await compose({ object: 'Product', context: 'card' });
    const nodes = (entries: UiSchema['screens']): UiSchema['screens'] => entries.flatMap((node) => [node, ...nodes(node.children ?? [])]);
    expect(nodes(result.schema.screens).find(({ component }) => component === 'CardHeader')?.props)
      .toEqual({ titleField: 'label', supportingField: 'description' });
  });

  it('restores the unchanged Product/card/HTML release carrier to its missing-evidence boundary', async () => {
    const result = await pipeline({ object: 'Product', context: 'card', framework: 'html', profile: 'release' });
    expect(result.error).toEqual({
      step: 'codegen', code: 'OODS-V162',
      message: 'Release profile is missing required evidence: rendered, interaction, accessibility, theme, determinism, performance.',
    });
    expect(result.code).toBeUndefined();
    expect(result.saved).toBeUndefined();
  });

  it.each(['react', 'vue'] as const)('builds the unchanged Product/card %s operand with governed PriceCardMeta', async (framework) => {
    const result = await pipeline({ object: 'Product', context: 'card', framework });
    expect(result.error).toBeUndefined();
    expect(result.code?.framework).toBe(framework);
    expect(result.code?.output).toContain('PriceCardMeta');
    expect(result.code?.output).toContain('CardHeader');
  });

  it.each(['react', 'vue'] as const)('%s compiles and server-renders actual object data through existing header props', async (framework) => {
    const input = schema();
    const original = JSON.stringify(input);
    const result = await generate({ schema: input, framework, profile: 'build' });
    expect(result.errors ?? []).toEqual([]);
    expect(result.status).toBe('ok');
    expect(result.code).not.toContain('titleField=');
    expect(result.code).not.toContain('supportingField=');
    expect(result.code).toContain(framework === 'react' ? 'title={headingLabel}' : ':title="headingLabel"');
    expect(result.code).toContain(framework === 'react' ? 'supporting={supportCopy}' : ':supporting="supportCopy"');
    for (const heading of ['Account summary', 'Updated account']) {
      const html = await renderGenerated(result.code, framework, { headingLabel: heading, supportCopy: 'Current plan' });
      expect(html).toMatch(new RegExp(`<h3[^>]*>${heading}</h3>`));
      expect(html).toMatch(/data-oods-supporting[^>]*>Current plan<\/span>/);
      expect(html).not.toContain('titleField');
      expect(html).not.toContain('supportingField');
    }
    expect(JSON.stringify(input)).toBe(original);
  });

  it('HTML visibly identifies both fields using its existing placeholder convention', async () => {
    const input = schema();
    const original = JSON.stringify(input);
    const result = await generate({ schema: input, framework: 'html', profile: 'build' });
    expect(result.errors ?? []).toEqual([]);
    expect(result.status).toBe('ok');
    expect(result.code).toMatch(/<h3[^>]*>\[headingLabel\]<\/h3>/);
    expect(result.code).toMatch(/data-oods-supporting[^>]*>\[supportCopy\]<\/span>/);
    expect(result.code).not.toContain('titleField');
    expect(result.code).not.toContain('supportingField');
    expect(JSON.stringify(input)).toBe(original);
  });

  it.each(['react', 'vue', 'html'] as const)('%s preserves explicit runtime title/supporting before recipe directives', async (framework) => {
    const input = schema({ title: 'Authored title', supporting: 'Authored support' });
    expect(resolveFrameworkRecipeProps(input.screens[0]!, input.objectSchema)).toEqual({
      bindings: [], consumedProps: ['supportingField', 'titleField'],
    });
    const result = await generate({ schema: input, framework, profile: 'build' });
    expect(result.errors ?? []).toEqual([]);
    const html = framework === 'html' ? result.code : await renderGenerated(result.code, framework, { headingLabel: 'Data title', supportCopy: 'Data support' });
    expect(html).toMatch(/<h3[^>]*>Authored title<\/h3>/);
    expect(html).toMatch(/data-oods-supporting[^>]*>Authored support<\/span>/);
  });

  it.each(['react', 'vue', 'html'] as const)('%s keeps generic scalar field content ahead of title aliases and retains supporting data', async (framework) => {
    const result = await generate({ schema: schema({ field: 'alternate_title' }), framework, profile: 'build' });
    expect(result.errors ?? []).toEqual([]);
    const html = framework === 'html' ? result.code : await renderGenerated(result.code, framework, {
      headingLabel: 'Recipe title', supportCopy: 'Current plan', alternateTitle: 'Bound title',
    });
    expect(html).toMatch(framework === 'html' ? /<h3[^>]*>\[alternateTitle\]<\/h3>/ : /<h3[^>]*>Bound title<\/h3>/);
    expect(html).toMatch(framework === 'html' ? /data-oods-supporting[^>]*>\[supportCopy\]<\/span>/ : /data-oods-supporting[^>]*>Current plan<\/span>/);
  });

  for (const framework of ['react', 'vue', 'html'] as const) {
    it.each(['titleField', 'supportingField'] as const)(`${framework} rejects unknown, inherited, non-string and malformed %s fields`, (prop) => {
      for (const [directive, type] of [['missing', undefined], ['toString', undefined], ['heading_label', 'object'], [42, undefined]] as const) {
        const input = schema({ [prop]: directive });
        if (type) input.objectSchema!.heading_label = { type };
        const result = preflightTargetContracts(input, framework);
        expect(result.issues.some(({ code, message }) => code === 'OODS-V007' && message.includes(prop)), `${framework}/${prop}/${directive}/${type}`).toBe(true);
      }
      expect(preflightTargetContracts(schema({ bogusField: 'heading_label' }), framework).issues)
        .toContainEqual(expect.objectContaining({ code: 'OODS-V007', message: 'Prop "bogusField" is not in the canonical CardHeader contract.' }));
    });
  }
});
