/**
 * Object-aware compose → validate → render → target-readiness preflight.
 *
 * HTML remains usable for the complete object schemas. React and Vue now build
 * the fully ported Subscription list, while compositions that still contain an
 * unavailable component fail loudly instead of returning a partial payload.
 */
import { describe, expect, it } from 'vitest';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as composeHandle } from '../../src/tools/design.compose.js';
import { handle as codegenHandle } from '../../src/tools/code.generate.js';
import { handle as validateHandle } from '../../src/tools/repl.validate.js';
import { handle as renderHandle } from '../../src/tools/repl.render.js';
import { createValidationReceipt, recordValidationChecks } from '../../src/codegen/validation-profile.js';
import { validateGeneratedArtifact } from '../../src/codegen/artifact-envelope.js';
import { preflightTargetCapabilities } from '../../src/codegen/target-readiness.js';

type Framework = 'react' | 'vue';
type AffectedNode = readonly [nodeId: string, component: string];

const SUBSCRIPTION_DETAIL_UNREADY: readonly AffectedNode[] = [
  ['ve-header-26', 'ArchiveSummary'],
];

const USER_DETAIL_NEWLY_READY: readonly AffectedNode[] = [
  ['ve-header-29', 'TagManager'],
  ['slot-tab-1-6', 'MembershipPanel'],
  ['slot-tab-2-8', 'AddressCollectionPanel'],
  ['slot-tab-3-15', 'PreferencePanel'],
];

const DASHBOARD_NEWLY_READY: readonly AffectedNode[] = [
  ['slot-header-2', 'DetailHeader'],
  ['slot-main-content-6', 'VizAreaPreview'],
];

function countNodes(schema: UiSchema): number {
  let count = 0;
  const visit = (nodes: ReadonlyArray<UiSchema['screens'][number]>): void => {
    for (const node of nodes) {
      count += 1;
      if (node.children) visit(node.children);
    }
  };
  visit(schema.screens);
  return count;
}

function countComponents(schema: UiSchema): number {
  const ids = new Set<string>();
  const visit = (nodes: ReadonlyArray<UiSchema['screens'][number]>): void => {
    for (const node of nodes) {
      ids.add(node.component);
      if (node.children) visit(node.children);
    }
  };
  visit(schema.screens);
  return ids.size;
}

function expectedTargetReadinessReceipt(framework: Framework) {
  return recordValidationChecks(
    createValidationReceipt(undefined, framework),
    'schema-structure',
    'component-registry',
    'state-contract',
    'target-readiness',
  );
}

async function expectTargetUnavailable(
  schemaRef: string,
  schema: UiSchema,
  framework: Framework,
  affectedNodes: readonly AffectedNode[],
): Promise<void> {
  const result = await codegenHandle({
    schemaRef,
    framework,
    options: { typescript: true, styling: 'tokens' },
  });

  expect(result).toEqual({
    status: 'error',
    framework,
    code: '',
    fileExtension: '',
    imports: [],
    warnings: [],
    validationReceipt: expectedTargetReadinessReceipt(framework),
    errors: affectedNodes.map(([nodeId, component]) => ({
      code: 'OODS-N015',
      message: `Component ${component} is not emission-eligible for ${framework}; evidence state: unavailable.`,
      nodeId,
      component,
    })),
    meta: {
      nodeCount: countNodes(schema),
      componentCount: countComponents(schema),
    },
  });
}

async function expectTargetGenerated(
  schemaRef: string,
  schema: UiSchema,
  framework: Framework,
): Promise<void> {
  const result = await codegenHandle({
    schemaRef,
    framework,
    options: { typescript: true, styling: 'tokens' },
  });

  expect(result).toMatchObject({
    status: 'ok',
    framework,
    warnings: [],
    meta: {
      nodeCount: countNodes(schema),
      componentCount: countComponents(schema),
    },
  });
  expect(result.errors).toBeUndefined();
  expect(result.code.length).toBeGreaterThan(0);
  expect(result.code).toContain(`from '@oods/components-${framework}'`);
  expect(result.code).toContain("import '@oods/component-styles/css';");
  expect(result.imports).toEqual(expect.arrayContaining([
    `@oods/components-${framework}`,
    '@oods/component-styles/css',
  ]));
  expect(result.imports).not.toContain(`@oods/components-${framework}/ported`);
  expect(result.imports).not.toContain('@oods/component-styles/css-ported');
  expect(result.artifact?.files).toHaveLength(1);
  expect(result.artifact?.files[0]?.contents.length).toBeGreaterThan(0);
  expect(result.validationReceipt.checks).toEqual(expect.arrayContaining([
    'target-readiness',
    'dependency-closure',
  ]));
}

async function composeAndCheck(
  object: 'Subscription' | 'User',
  context: 'detail' | 'list',
  affectedNodes: readonly AffectedNode[] = [],
): Promise<void> {
  const compose = await composeHandle({ object, context });
  expect(compose.status).toBe('ok');
  expect(compose.schemaRef).toBeTruthy();
  expect(compose.objectUsed?.name).toBe(object);
  expect(compose.objectUsed?.traits.length).toBeGreaterThan(0);
  expect(compose.objectUsed?.fieldsComposed).toBeGreaterThan(0);
  expect(compose.schema.objectSchema).toBeDefined();

  const rootBindings = compose.schema.screens[0].bindings;
  if (context === 'detail') {
    expect(rootBindings?.onEdit).toBe('handleEdit');
    expect(rootBindings?.onDelete).toBe('handleDelete');
  } else {
    expect(rootBindings?.onRowClick).toBe('handleRowClick');
    expect(rootBindings?.onSort).toBe('handleSort');
    expect(rootBindings?.onFilter).toBe('handleFilter');
  }

  const schemaRef = compose.schemaRef!;
  const validation = await validateHandle({ mode: 'full', schemaRef });
  expect(validation.status).toBe('ok');

  const render = await renderHandle({ mode: 'full', schemaRef, apply: true });
  expect(render.status).toBe('ok');
  expect(render.html).toContain('<!DOCTYPE html>');
  expect(render.html).toContain('data-oods-component=');
  expect(render.html!.match(/data-oods-component=/g)?.length ?? 0).toBeGreaterThan(1);

  for (const framework of ['react', 'vue'] as const) {
    if (affectedNodes.length > 0) {
      await expectTargetUnavailable(schemaRef, compose.schema, framework, affectedNodes);
    } else {
      await expectTargetGenerated(schemaRef, compose.schema, framework);
    }
  }
}

describe('E2E object codegen target readiness', () => {
  it('keeps Subscription detail blocked only by the remaining unavailable component', async () => {
    await composeAndCheck('Subscription', 'detail', SUBSCRIPTION_DETAIL_UNREADY);
  });

  it('builds the fully ported Subscription list for both framework targets', async () => {
    await composeAndCheck('Subscription', 'list');
  });

  it('keeps User detail composition/rendering, resolves its former readiness gaps, and reports the remaining composer contract defect', async () => {
    const compose = await composeHandle({ object: 'User', context: 'detail' });
    expect(compose.status).toBe('ok');
    expect(compose.schemaRef).toBeTruthy();
    expect(compose.objectUsed?.name).toBe('User');
    expect(compose.schema.objectSchema).toBeDefined();
    expect(compose.schema.screens[0].bindings).toMatchObject({ onEdit: 'handleEdit', onDelete: 'handleDelete' });
    const schemaRef = compose.schemaRef!;
    expect((await validateHandle({ mode: 'full', schemaRef })).status).toBe('ok');
    const render = await renderHandle({ mode: 'full', schemaRef, apply: true });
    expect(render.status).toBe('ok');
    expect(render.html).toContain('<!DOCTYPE html>');
    for (const [nodeId, component] of USER_DETAIL_NEWLY_READY) {
      expect(render.html).toContain(`id="${nodeId}"`);
      expect(render.html).toContain(`data-oods-component="${component}"`);
    }

    for (const framework of ['react', 'vue'] as const) {
      expect(preflightTargetCapabilities(compose.schema.screens, framework)).toEqual([]);
      const result = await codegenHandle({ schemaRef, framework, options: { typescript: true, styling: 'tokens' } });
      expect(result).toMatchObject({
        status: 'error', framework, code: '', imports: [], warnings: [],
        meta: { nodeCount: countNodes(compose.schema), componentCount: countComponents(compose.schema) },
      });
      expect(result.artifact).toBeUndefined();
      expect(result.errors).toEqual([{
        code: 'OODS-V007', component: 'StatusTimeline', nodeId: 've-header-28',
        message: 'Prop "label" is not in the canonical StatusTimeline contract.',
      }]);
      expect(result.validationReceipt.checks).toEqual(expect.arrayContaining(['target-readiness', 'props-contract', 'slots-contract', 'events-contract']));
      expect(result.validationReceipt.notChecked).toContain('dependency-closure');
    }
  });

  it('keeps objectSchema field metadata even when framework emission is blocked', async () => {
    const compose = await composeHandle({ object: 'Subscription', context: 'detail' });
    expect(compose.status).toBe('ok');
    expect(Object.keys(compose.schema.objectSchema ?? {}).length).toBeGreaterThan(5);
    for (const entry of Object.values(compose.schema.objectSchema ?? {})) {
      expect(entry.type).toBeTruthy();
      expect(typeof entry.required).toBe('boolean');
    }

    await expectTargetUnavailable(
      compose.schemaRef!,
      compose.schema,
      'react',
      SUBSCRIPTION_DETAIL_UNREADY,
    );
  });

  it('builds the unchanged intent-only dashboard through both root component packages', async () => {
    const compose = await composeHandle({ intent: 'dashboard with metrics' });
    expect(compose.status).toBe('ok');
    expect(compose.schemaRef).toBeTruthy();
    expect(compose.schema.objectSchema).toBeUndefined();

    // DetailHeader and VizAreaPreview now have real root exports. Keep the
    // original intent and prove the full composed tree survives generation.
    for (const framework of ['react', 'vue'] as const) {
      const result = await codegenHandle({
        schemaRef: compose.schemaRef!,
        framework,
        options: { typescript: true, styling: 'tokens' },
      });
      expect(result, JSON.stringify(result.errors ?? [])).toMatchObject({
        status: 'ok', framework, warnings: [],
        meta: { nodeCount: countNodes(compose.schema), componentCount: countComponents(compose.schema) },
      });
      expect(result.errors).toBeUndefined();
      expect(result.imports).toEqual(expect.arrayContaining([
        `@oods/components-${framework}`, '@oods/component-styles/css',
      ]));
      expect(result.imports).not.toContain(`@oods/components-${framework}/ported`);
      expect(result.code).toContain(`from '@oods/components-${framework}'`);
      expect(result.code).toContain("import '@oods/component-styles/css';");
      expect(result.code.match(/data-oods-component=/g)).toHaveLength(countNodes(compose.schema));
      for (const [nodeId, component] of DASHBOARD_NEWLY_READY) {
        expect(result.code).toContain(`<${component} `);
        expect(result.code).toContain(`id="${nodeId}"`);
        expect(result.code).toContain(`data-oods-component="${component}"`);
      }
      expect(result.artifact).toBeDefined();
      expect(result.artifact!.files).toHaveLength(1);
      expect(result.artifact!.files[0]!.contents).toBe(result.code);
      expect(result.artifact!.actions).toEqual([]);
      expect(validateGeneratedArtifact(result.artifact!)).toEqual([]);
      expect(result.validationReceipt.checks).toEqual(expect.arrayContaining([
        'target-readiness', 'normalization-fidelity', 'props-contract', 'dependency-closure',
      ]));
    }
  });
});
