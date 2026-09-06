import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { analyzeBindings } from '../../src/codegen/binding-utils.js';
import { preflightTargetCapabilities } from '../../src/codegen/target-readiness.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const operandPath = path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-183/m04/saved-schema-store/plan-form-dark.json',
);
const operandSha256 = '5ff3c1cc605ce91790ab5befe779f5ed9c20807c0e496de95011163dc59158b5';
const vueCompiler = createRequire(
  new URL('../../../components-vue/package.json', import.meta.url),
)('@vue/compiler-sfc');
const handlerName = 'handleChange_plan_name';
const stateName = `${handlerName}State`;
const setterName = 'setHandleChange_plan_nameState';
const matrix = (['react', 'vue'] as const).flatMap((framework) => (
  (['inline', 'tailwind', 'tokens'] as const).flatMap((styling) => (
    [false, true].map((typescript) => ({ framework, styling, typescript }))
  ))
));

function sha256(contents: string | Buffer): string {
  return createHash('sha256').update(contents).digest('hex');
}

function savedSchema(): UiSchema {
  const contents = readFileSync(operandPath);
  expect(sha256(contents)).toBe(operandSha256);
  return (JSON.parse(contents.toString('utf8')) as { schema: UiSchema }).schema;
}

function nodesInOrder(nodes: readonly UiElement[]): UiElement[] {
  return nodes.flatMap((node) => [node, ...nodesInOrder(node.children ?? [])]);
}

describe('Sprint 185 measured read-only DetailHeader field subscription', () => {
  it('retains the immutable reader and real Textarea writer declarations', () => {
    const schema = savedSchema();
    const nodes = nodesInOrder(schema.screens);
    expect(nodes.find(({ id }) => id === 'form-title-1')).toMatchObject({
      component: 'DetailHeader',
      props: { as: 'h1', field: 'plan_name' },
      bindings: { onChange: handlerName },
    });
    expect(nodes.find(({ id }) => id === 'slot-field-0-3')).toMatchObject({
      component: 'Textarea',
      props: { field: 'plan_name' },
      bindings: { onChange: handlerName },
    });
    const analysis = analyzeBindings(schema.screens);
    expect(analysis.issues).toEqual([]);
    expect(analysis.readonlyFieldSubscriptions).toEqual([
      expect.objectContaining({
        nodeId: 'form-title-1',
        component: 'DetailHeader',
        event: 'onChange',
        handlerName,
        field: 'plan_name',
        writer: expect.objectContaining({
          nodeId: 'slot-field-0-3',
          component: 'Textarea',
          localSymbols: { state: stateName, setter: setterName },
        }),
      }),
    ]);
    expect(analysis.occurrences.some(({ nodeId }) => nodeId === 'form-title-1')).toBe(false);
    expect(analysis.handlers.filter((handler) => handler.handlerName === handlerName))
      .toEqual([expect.objectContaining({
        kind: 'local',
        occurrences: [expect.objectContaining({ nodeId: 'slot-field-0-3' })],
      })]);
  });

  it.each(matrix)(
    '$framework/$styling/typescript=$typescript reads the writer state without creating a heading event (m02 readiness fixture)',
    async ({ framework, styling, typescript }) => {
      const schema = savedSchema();
      const before = sha256(JSON.stringify(schema));
      const result = await generateCode(
        { schema, framework, options: { styling, typescript }, profile: 'build' },
        {
          // Only the future m03 DetailHeader readiness row is injected. The
          // real schema, syntax, prop, binding and existing target gates run.
          // This is generated-source evidence, not packed-runtime evidence.
          targetCapabilityPreflight: (screens, target) => preflightTargetCapabilities(screens, target)
            .filter((issue) => issue.component !== 'DetailHeader'),
        },
      );
      expect(result.errors ?? [], JSON.stringify(result)).toEqual([]);
      expect(result.status).toBe('ok');
      expect(result.artifact).toBeDefined();
      expect(result.validationReceipt).toMatchObject({ profile: 'build' });
      expect(result.validationReceipt.checks).toContain('events-contract');
      expect(sha256(JSON.stringify(schema))).toBe(before);
      expect(sha256(readFileSync(operandPath))).toBe(operandSha256);

      const source = result.code;
      const heading = source.match(/<DetailHeader\b([^>]*\bid="form-title-1"[^>]*)>([\s\S]*?)<\/DetailHeader>/);
      const textarea = source.match(/<Textarea\b[^>]*\bid="slot-field-0-3"[^>]*>/)?.[0];
      expect(heading, source).not.toBeNull();
      expect(textarea, source).toBeDefined();
      const headingAttributes = heading![1]!;
      const headingContent = heading![2]!.trim();
      expect(headingAttributes).toContain('as="h1"');
      expect(headingAttributes).not.toMatch(/\bon[A-Z][A-Za-z]*\s*=|@[\w:-]+\s*=|v-on:/);
      expect(headingAttributes).not.toMatch(/\bcontent[Ee]ditable\s*=/);
      expect(source.match(new RegExp(`@oods-local-binding ${handlerName} \\*/`, 'g'))).toHaveLength(1);
      expect(source.match(/@oods-local-binding /g)).toHaveLength(
        analyzeBindings(schema.screens).handlers.filter(({ kind }) => kind === 'local').length,
      );
      expect((result.artifact!.actions ?? []).some(({ sources }) => (
        sources.some(({ nodeId }) => nodeId === 'form-title-1')
      ))).toBe(false);

      if (framework === 'react') {
        expect(headingContent).toBe(`{${stateName}}`);
        expect(textarea).toContain(`value={${stateName}}`);
        expect(textarea).toContain(`onChange={${handlerName}}`);
        expect(source.match(new RegExp(`const \\[${stateName}, ${setterName}\\]`, 'g'))).toHaveLength(1);
        expect(source).toContain(`${setterName}(event.currentTarget.value)`);
        const parsed = ts.transpileModule(source, {
          fileName: typescript ? 'PlanForm.tsx' : 'PlanForm.jsx',
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
          },
          reportDiagnostics: true,
        });
        expect(parsed.diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error))
          .toEqual([]);
      } else {
        expect(headingContent.replace(/\s/g, '')).toBe(`{{${stateName}}}`);
        expect(textarea).toContain(`:modelValue="${stateName}"`);
        expect(textarea).toContain(`@change="${handlerName}"`);
        expect(source.match(new RegExp(`const ${stateName} = ref`, 'g'))).toHaveLength(1);
        const parsed = vueCompiler.parse(source, { filename: 'PlanForm.vue' });
        expect(parsed.errors).toEqual([]);
        expect(() => vueCompiler.compileScript(parsed.descriptor, { id: 'plan-form' })).not.toThrow();
        const template = vueCompiler.compileTemplate({
          id: 'plan-form',
          filename: 'PlanForm.vue',
          source: parsed.descriptor.template?.content ?? '',
        });
        expect(template.errors).toEqual([]);
      }
    },
  );
});
