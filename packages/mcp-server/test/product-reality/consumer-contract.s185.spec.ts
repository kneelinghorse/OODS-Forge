import fs from 'node:fs';
import path from 'node:path';

import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UiSchema } from '../../src/schemas/generated.js';
import type { GeneratedArtifactAction } from '../../src/codegen/types.js';
import {
  S185_SCHEMA_NAMES, deriveActionArguments, deriveBoundFieldProbe, deriveConsumerModel,
  deriveInteraction, inspectFrameworkAttachment, summarizeGateAccounting,
  deriveMountObligations, observeMountObligations,
} from '../../../../scripts/product-reality/s185-m04-consumer-contract.js';
import {
  REPOSITORY_ROOT, SCHEMA_NAMES, createConsumerFiles,
} from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { S185_ALL_SCHEMA_NAMES } from '../../../../scripts/product-reality/s185-m04-live-consumers.js';

const saved = (name: string): UiSchema => JSON.parse(fs.readFileSync(path.join(REPOSITORY_ROOT,
  `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`), 'utf8')).schema;
const action = (name: string, nodeId: string, parameters: GeneratedArtifactAction['parameters'] = []): GeneratedArtifactAction => ({
  name, parameters, sources: [{ nodeId, component: 'Stack', event: 'onActivate' }],
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('Sprint 185 saved-schema consumer contract', () => {
  it('keeps the original two-schema default and includes six new plus four regression cells in the wrapper', () => {
    expect(SCHEMA_NAMES).toEqual(['subscription-list-dark', 'subscription-detail-dark']);
    expect(S185_SCHEMA_NAMES).toHaveLength(6);
    expect(S185_ALL_SCHEMA_NAMES).toEqual([...S185_SCHEMA_NAMES, ...SCHEMA_NAMES]);
    expect(new Set(S185_ALL_SCHEMA_NAMES).size).toBe(8);
  });

  it.each(['cmos-messages-redesign', 'user-card-showcase', 'subscription-detail-dark'])(
    'selects declared Tabs before domain actions for %s', (name) => {
      const schema = saved(name);
      const selection = deriveInteraction(schema, [action('handleEdit', schema.screens[0]!.id)]);
      expect(selection.kind).toBe('tabs');
      expect(selection).toMatchObject({ component: 'Tabs', nodeId: name === 'cmos-messages-redesign' ? 'detail-tabs-7' : 'detail-tabs-9' });
    },
  );

  it('selects Plan declared actions before its fields and independently identifies the real heading subscription', () => {
    const schema = saved('plan-form-dark');
    expect(deriveInteraction(schema, [action('handleChange', schema.screens[0]!.id)])).toMatchObject({ kind: 'action', action: 'handleChange' });
    expect(deriveBoundFieldProbe(schema)).toEqual({ field: 'plan_name', writerId: 'slot-field-0-3', readerId: 'form-title-1' });
    expect(deriveBoundFieldProbe(saved('pt-shop-parts-entry-router-v1'))).toBeNull();
  });

  it('selects an existing PT SearchInput without inventing a schema binding', () => {
    const schema = saved('pt-shop-parts-entry-router-v1');
    const before = JSON.stringify(schema);
    expect(deriveInteraction(schema, [])).toEqual({ kind: 'field', nodeId: 'slot-section-0-5', component: 'SearchInput', selector: '[id="slot-section-0-5"]', inputType: 'text' });
    expect(JSON.stringify(schema)).toBe(before);
  });

  it('names distinct non-applicable reasons and identifies the disabled dashboard controls', () => {
    expect(deriveInteraction(saved('the-academy-landing-v1'), [])).toEqual({ kind: 'none', reason: 'no interactive element declared', disabledPaginationNodeIds: [] });
    expect(deriveInteraction(saved('cmos-dashboard-redesign'), [])).toEqual({
      kind: 'none', reason: 'no enabled interaction declared; unbound PaginationBar defaults to zero items',
      disabledPaginationNodeIds: ['slot-main-section-1-13'],
    });
  });

  it('does not waive a declared enabled control whose behavior is unsupported, or select a disabled action', () => {
    const schema: UiSchema = { version: '1.0', screens: [{ id: 'button', component: 'Button' }] };
    expect(() => deriveInteraction(schema, [])).toThrow('not a not-applicable gate');
    schema.screens[0]!.props = { disabled: true };
    expect(() => deriveInteraction(schema, [action('handleClick', 'button')])).toThrow('enabled schema source');
  });

  it('fills every real Plan/User field with a type-compatible shape and retains established Subscription values', () => {
    const plan = deriveConsumerModel(saved('plan-form-dark'), { planName: 'Enterprise', status: 'not-a-plan-status' });
    expect(plan).toMatchObject({ planName: 'Enterprise', status: 'active', amountMinor: 0, samples: [], featureMatrix: [] });
    const user = deriveConsumerModel(saved('user-card-showcase'));
    expect(user).toMatchObject({ rolePermissions: {}, membershipRecords: [], channelCatalog: [], role: 'end_user' });
    expect(Object.keys(user)).toHaveLength(Object.keys(saved('user-card-showcase').objectSchema!).length);
    expect(deriveConsumerModel(saved('subscription-list-dark'), { subscriptionId: 'sub-s184-001' }).subscriptionId).toBe('sub-s184-001');
    expect(deriveConsumerModel(saved('the-academy-landing-v1'))).toEqual({});
  });

  it('derives the old list action operands without branching on schema name', () => {
    const schema = saved('subscription-list-dark');
    const root = schema.screens[0]!.id;
    expect(deriveActionArguments(schema, [
      action('handleFilter', root, [{ name: 'criteria', type: 'Record<string, unknown>' }]),
      action('handleRowClick', root, [{ name: 'rowId', type: 'string' }]),
      action('handleSort', root, [{ name: 'column', type: 'string' }]),
    ], { subscriptionId: 'sub-s184-001' })).toEqual({ handleFilter: [[{}]], handleRowClick: [['sub-s184-001']], handleSort: [['status']] });
  });

  it.each(['react', 'vue'] as const)('%s consumer passes only the generated public model/actions API and preserves source bytes', (framework) => {
    const source = framework === 'react' ? 'export const GeneratedUI = () => null;\n' : '<template><main>Academy</main></template>\n';
    const files = createConsumerFiles({ framework, source, actions: [], schemaName: 'the-academy-landing-v1', mission: 's185-m04' });
    expect(files[framework === 'react' ? 'src/GeneratedUI.tsx' : 'src/GeneratedUI.vue']).toBe(source);
    const main = files[framework === 'react' ? 'src/main.tsx' : 'src/main.ts']!;
    expect(main).not.toContain('GeneratedUIActions');
    expect(main).toContain('GeneratedUI, { ...model }');
    expect(files['src/consumer-data.ts']).not.toContain('PageProps');
    expect(files['src/consumer-data.ts']).toContain('export const model = {}');
    expect(main).not.toMatch(/data-oods-action|function [A-Z]|defineComponent/);
  });

  it('does not pass model values as invented attributes to a Vue form with internal field refs', () => {
    const files = createConsumerFiles({ framework: 'vue', source: '<script setup lang="ts">const planName = ref("");</script>',
      schemaName: 'plan-form-dark', actions: [action('handleChange', 'screen-form-9')], model: { planName: 'Enterprise' } });
    expect(files['src/consumer-data.ts']).toBe('export const model = {};\n');
    expect(files['src/main.ts']).toContain('GeneratedUI, { ...model, actions }');
  });

  it('keeps non-applicable gates named and outside the passed/applicable denominator', () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({ name: `gate-${index}`, status: index === 7 ? 'not-applicable' : 'passed', reason: index === 7 ? 'no interactive element declared' : undefined }));
    expect(summarizeGateAccounting(rows)).toEqual({ totalGateCount: 8, applicableGateCount: 7, provenCount: 7,
      notApplicableCount: 1, notApplicable: [{ name: 'gate-7', reason: 'no interactive element declared' }], namedUnprovenCount: 0, namedUnproven: [], balanced: true });
    rows[0]!.status = 'failed';
    expect(summarizeGateAccounting(rows)).toMatchObject({ provenCount: 6, notApplicableCount: 1, namedUnprovenCount: 1, balanced: true });
  });

  it('rejects a component omitted from both SSR and mounted HTML using obligations retained from generated source', () => {
    const schema: UiSchema = { version: '1.0', screens: [{ id: 'root', component: 'Stack', children: [{ id: 'preview', component: 'VizAreaPreview' }] }] };
    const source = '<Stack id="root" data-oods-component="Stack"><VizAreaPreview id="preview" data-oods-component="VizAreaPreview" /></Stack>';
    const obligations = deriveMountObligations(schema, source);
    const complete = '<div id="root" data-oods-component="Stack"><div id="preview" data-oods-component="VizAreaPreview"></div></div>';
    expect(observeMountObligations(obligations, complete).every(({ passed }) => passed)).toBe(true);
    const omitted = '<div id="root" data-oods-component="Stack"></div>';
    expect(observeMountObligations(obligations, omitted).filter(({ passed }) => !passed)).toEqual([
      { nodeId: 'preview', component: 'VizAreaPreview', requiredInitially: true, present: false, passed: false },
    ]);
    expect(observeMountObligations(obligations, complete.replace('data-oods-component="VizAreaPreview"', 'data-oods-component="Card"'))
      .find(({ nodeId }) => nodeId === 'preview')?.passed).toBe(false);
  });

  it('names inactive initial Tabs panel obligations without relaxing the active panel or its content', () => {
    const schema: UiSchema = { version: '1.0', screens: [{ id: 'tabs', component: 'Tabs', children: [
      { id: 'first', component: 'Stack', children: [{ id: 'title', component: 'CardHeader' }] },
      { id: 'second', component: 'Stack', children: [{ id: 'later', component: 'VizAreaPreview' }] },
    ] }] };
    const source = ['Tabs/tabs', 'Stack/first', 'CardHeader/title', 'Stack/second', 'VizAreaPreview/later']
      .map((entry) => { const [component, id] = entry.split('/'); return `<${component} id="${id}" data-oods-component="${component}" />`; }).join('\n');
    const obligations = deriveMountObligations(schema, source);
    const html = '<div id="tabs" data-oods-component="Tabs"><div id="first" data-oods-component="Stack"><header id="title" data-oods-component="CardHeader"></header></div></div>';
    expect(observeMountObligations(obligations, html).every(({ passed }) => passed)).toBe(true);
    expect(obligations.filter(({ requiredInitially }) => !requiredInitially)).toEqual([
      { nodeId: 'second', component: 'Stack', requiredInitially: false, reason: 'inactive initial Tabs panel second under tabs' },
      { nodeId: 'later', component: 'VizAreaPreview', requiredInitially: false, reason: 'inactive initial Tabs panel second under tabs' },
    ]);
    expect(observeMountObligations(obligations, html.replace('<header id="title" data-oods-component="CardHeader"></header>', ''))
      .find(({ nodeId }) => nodeId === 'title')?.passed).toBe(false);
  });

  it.each(['react', 'vue'] as const)('%s attachment does not accept inert SSR or a consumer-authored hydrated flag', (framework) => {
    const dom = new JSDOM('<div id="app"><main data-oods-component="Stack">SSR retained</main></div>');
    vi.stubGlobal('document', dom.window.document);
    vi.stubGlobal('window', dom.window);
    (window as unknown as Record<string, unknown>).__OODS_HYDRATED__ = true;
    expect(inspectFrameworkAttachment(framework).attached).toBe(false);
    const container = document.getElementById('app')! as HTMLElement & Record<string, unknown>;
    const root = container.firstElementChild! as HTMLElement & Record<string, unknown>;
    if (framework === 'react') {
      container.__reactContainer$proof = {};
      expect(inspectFrameworkAttachment(framework).attached).toBe(false);
      root.__reactFiber$proof = {};
      expect(inspectFrameworkAttachment(framework).attached).toBe(true);
      delete root.__reactFiber$proof;
    } else {
      container.__vue_app__ = { _container: document.createElement('div') };
      expect(inspectFrameworkAttachment(framework).attached).toBe(false);
      container.__vue_app__ = { _container: container };
      expect(inspectFrameworkAttachment(framework).attached).toBe(true);
      delete container.__vue_app__;
    }
    expect(inspectFrameworkAttachment(framework).attached).toBe(false);
  });
});
