/**
 * Object-aware compose → validate → render → target-readiness preflight.
 *
 * HTML remains usable for the complete object schemas. React and Vue must fail
 * loudly until every requested target component is emission-eligible; a partial
 * generated payload would overstate the package surface.
 */
import { describe, expect, it } from 'vitest';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as composeHandle } from '../../src/tools/design.compose.js';
import { handle as codegenHandle } from '../../src/tools/code.generate.js';
import { handle as validateHandle } from '../../src/tools/repl.validate.js';
import { handle as renderHandle } from '../../src/tools/repl.render.js';
import { createValidationReceipt, recordValidationChecks } from '../../src/codegen/validation-profile.js';

type Framework = 'react' | 'vue';
type AffectedNode = readonly [nodeId: string, component: string];

const SUBSCRIPTION_DETAIL_UNREADY: readonly AffectedNode[] = [
  ['ve-header-24', 'StatusTimeline'],
  ['ve-header-25', 'CancellationSummary'],
  ['ve-header-26', 'ArchiveSummary'],
  ['slot-tab-3-15', 'StatusBadge'],
  ['slot-metadata-12', 'AuditTimeline'],
];

const SUBSCRIPTION_LIST_UNREADY: readonly AffectedNode[] = [
  ['slot-search-1', 'SearchInput'],
  ['ve-toolbar-actions-12', 'PriceBadge'],
  ['ve-items-10', 'StatusBadge'],
  ['ve-items-11', 'RelativeTimestamp'],
  ['slot-pagination-8', 'PaginationBar'],
];

const USER_DETAIL_UNREADY: readonly AffectedNode[] = [
  ['ve-header-28', 'StatusTimeline'],
  ['ve-header-29', 'TagManager'],
  ['slot-tab-1-6', 'MembershipPanel'],
  ['slot-tab-2-8', 'AddressCollectionPanel'],
  ['slot-tab-3-15', 'PreferencePanel'],
  ['slot-metadata-12', 'AuditTimeline'],
];

const DASHBOARD_UNREADY: readonly AffectedNode[] = [
  ['slot-header-2', 'DetailHeader'],
  ['slot-main-content-6', 'VizAreaPreview'],
];

function countNodes(schema: UiSchema): number {
  let count = 0;
  const visit = (nodes: UiSchema['screens']): void => {
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
  const visit = (nodes: UiSchema['screens']): void => {
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

async function composeAndCheck(
  object: 'Subscription' | 'User',
  context: 'detail' | 'list',
  affectedNodes: readonly AffectedNode[],
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
  expect(render.html.match(/data-oods-component=/g)?.length ?? 0).toBeGreaterThan(1);

  await expectTargetUnavailable(schemaRef, compose.schema, 'react', affectedNodes);
  await expectTargetUnavailable(schemaRef, compose.schema, 'vue', affectedNodes);
}

describe('E2E object codegen target readiness', () => {
  it('keeps Subscription detail composition/rendering and returns exact target unavailability', async () => {
    await composeAndCheck('Subscription', 'detail', SUBSCRIPTION_DETAIL_UNREADY);
  });

  it('keeps Subscription list composition/rendering and returns exact target unavailability', async () => {
    await composeAndCheck('Subscription', 'list', SUBSCRIPTION_LIST_UNREADY);
  });

  it('keeps User detail composition/rendering and returns exact target unavailability', async () => {
    await composeAndCheck('User', 'detail', USER_DETAIL_UNREADY);
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

  it('classifies intent-only dashboard framework output instead of treating it as a success', async () => {
    const compose = await composeHandle({ intent: 'dashboard with metrics' });
    expect(compose.status).toBe('ok');
    expect(compose.schema.objectSchema).toBeUndefined();

    await expectTargetUnavailable(
      compose.schemaRef!,
      compose.schema,
      'react',
      DASHBOARD_UNREADY,
    );
  });
});
