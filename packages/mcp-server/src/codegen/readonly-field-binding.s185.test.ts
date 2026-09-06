import { describe, expect, it } from 'vitest';

import type { UiElement, UiSchema } from '../schemas/generated.js';
import { handle as generateCode } from '../tools/code.generate.js';
import { analyzeBindings } from './binding-utils.js';
import { preflightTargetContracts } from './target-contracts.js';

function fixture() {
  const reader: UiElement = {
    id: 'plan-title',
    component: 'DetailHeader',
    props: { field: 'plan_name', as: 'h1' },
    bindings: { onChange: 'changePlanName' },
  };
  const writer: UiElement = {
    id: 'plan-name',
    component: 'Textarea',
    props: { field: 'plan_name' },
    bindings: { onChange: 'changePlanName' },
  };
  const schema: UiSchema = {
    version: '1.0',
    objectSchema: {
      plan_name: { type: 'string', required: true },
      another_name: { type: 'string', required: true },
    },
    screens: [{ id: 'plan-form', component: 'Stack', children: [reader, writer] }],
  };
  return { schema, reader, writer };
}

type Fixture = ReturnType<typeof fixture>;
const INVALID_READS: Array<{ name: string; arrange: (value: Fixture) => void }> = [
  { name: 'missing reader field', arrange: ({ reader }) => { reader.props = {}; } },
  { name: 'empty reader field', arrange: ({ reader }) => { reader.props = { field: '' }; } },
  { name: 'blank reader field', arrange: ({ reader }) => { reader.props = { field: ' ' }; } },
  { name: 'missing writer', arrange: ({ schema }) => { schema.screens[0]!.children!.pop(); } },
  { name: 'different handler', arrange: ({ writer }) => { writer.bindings = { onChange: 'changeOther' }; } },
  { name: 'different field', arrange: ({ writer }) => { writer.props = { field: 'another_name' }; } },
  { name: 'missing writer field', arrange: ({ writer }) => { writer.props = {}; } },
  {
    name: 'two state owners',
    arrange: ({ schema, writer }) => {
      schema.screens[0]!.children!.push({ ...structuredClone(writer), id: 'other-writer' });
    },
  },
  {
    name: 'domain writer with a string signature',
    arrange: ({ writer }) => {
      writer.component = 'Table';
      writer.bindings = { onRowActivate: 'changePlanName' };
    },
  },
  { name: 'boolean writer', arrange: ({ writer }) => { writer.component = 'Checkbox'; } },
  {
    name: 'writer with unknown event semantics',
    arrange: ({ writer }) => { writer.bindings = { onClick: 'changePlanName' }; },
  },
  {
    name: 'ambiguous aliases on the writer',
    arrange: ({ writer }) => {
      writer.bindings = { onChange: 'changePlanName', onInput: 'inputPlanName' };
    },
  },
  {
    name: 'authored child tree',
    arrange: ({ reader }) => {
      reader.children = [{ id: 'authored-title', component: 'Text', props: { content: 'Keep me' } }];
    },
  },
  {
    name: 'authored children prop',
    arrange: ({ reader }) => { reader.props = { ...reader.props, children: 'Keep me' }; },
  },
];

describe('Sprint 185 read-only field subscription analysis', () => {
  it('preserves the heading and writer provenance without inventing a heading event or state owner', () => {
    const { schema } = fixture();
    const original = structuredClone(schema);
    const analysis = analyzeBindings(schema.screens);

    expect(analysis.ok).toBe(true);
    expect(analysis.issues).toEqual([]);
    expect(analysis.occurrences).toHaveLength(1);
    expect(analysis.handlers).toHaveLength(1);
    expect(analysis.occurrences[0]).toMatchObject({
      nodeId: 'plan-name', component: 'Textarea', kind: 'local',
    });
    expect(analysis.readonlyFieldSubscriptions).toEqual([{
      nodeId: 'plan-title',
      component: 'DetailHeader',
      event: 'onChange',
      handlerName: 'changePlanName',
      path: '/screens/0/children/0',
      field: 'plan_name',
      writer: {
        nodeId: 'plan-name',
        component: 'Textarea',
        event: 'onChange',
        handlerName: 'changePlanName',
        path: '/screens/0/children/1',
        kind: 'local',
        signature: { parameters: [{ name: 'value', type: 'string' }] },
        definitionId: 'component:Textarea.onChange',
        scope: 'component',
        localSymbols: { state: 'changePlanNameState', setter: 'setChangePlanNameState' },
      },
    }]);
    expect(analysis.readonlyFieldSubscriptions[0]!.writer).toBe(analysis.handlers[0]!.occurrences[0]);
    expect(schema).toEqual(original);
    for (const framework of ['react', 'vue'] as const) {
      const result = preflightTargetContracts(schema, framework);
      expect(result.issues).toEqual([]);
      expect(result.bindingSafetyIssues).toEqual([]);
    }
  });

  it('resolves the sole writer in either document order and never creates additional handlers for readers', () => {
    for (const reverse of [false, true]) {
      const { schema, reader } = fixture();
      schema.screens[0]!.children!.push({ ...structuredClone(reader), id: 'second-title' });
      if (reverse) schema.screens[0]!.children!.reverse();
      const analysis = analyzeBindings(schema.screens);

      expect(analysis.ok).toBe(true);
      expect(analysis.readonlyFieldSubscriptions).toHaveLength(2);
      expect(analysis.handlers).toHaveLength(1);
      expect(analysis.occurrences).toHaveLength(1);
      for (const subscription of analysis.readonlyFieldSubscriptions) {
        expect(subscription.writer.nodeId).toBe('plan-name');
        expect(subscription.writer.localSymbols.state).toBe('changePlanNameState');
      }
    }
  });

  it.each(INVALID_READS)('rejects $name rather than silently discarding the saved binding', ({ arrange }) => {
    const value = fixture();
    arrange(value);
    const analysis = analyzeBindings(value.schema.screens);

    expect(analysis.ok).toBe(false);
    expect(analysis.readonlyFieldSubscriptions).toEqual([]);
    expect(analysis.issues).toContainEqual(expect.objectContaining({
      code: 'INVALID_READONLY_FIELD_SUBSCRIPTION',
      nodeId: 'plan-title',
      component: 'DetailHeader',
      event: 'onChange',
      handlerName: 'changePlanName',
      path: '/screens/0/children/0',
    }));
  });

  it.each(INVALID_READS.flatMap((entry) => (
    (['react', 'vue'] as const).map((framework) => ({ ...entry, framework }))
  )))(
    'blocks $name at $framework build before any artifact (m02 readiness fixture)',
    async ({ arrange, framework }) => {
      const value = fixture();
      arrange(value);
      const result = await generateCode(
        { framework, profile: 'build', schema: value.schema },
        { targetCapabilityPreflight: () => [] },
      );

      expect(result.status).toBe('error');
      expect(result.code).toBe('');
      expect(result.artifact).toBeUndefined();
      expect(result.errors).toContainEqual(expect.objectContaining({
        code: 'OODS-V007', component: 'DetailHeader', nodeId: 'plan-title',
      }));
    },
  );

  it('retains the existing multiple-local-owner refusal when a read-only heading also subscribes', () => {
    const { schema, writer } = fixture();
    schema.screens[0]!.children!.push({ ...structuredClone(writer), id: 'other-writer' });
    const analysis = analyzeBindings(schema.screens);

    expect(analysis.handlers).toEqual([]);
    expect(analysis.readonlyFieldSubscriptions).toEqual([]);
    expect(analysis.issues).toContainEqual(expect.objectContaining({
      code: 'AMBIGUOUS_HANDLER',
      handlerName: 'changePlanName',
      message: 'Local handler "changePlanName" is reused by multiple state owners.',
    }));
  });

  it('keeps unsupported component/event pairs outside the measured subscription rule', () => {
    for (const [component, event] of [['CardHeader', 'onChange'], ['DetailHeader', 'onInput']]) {
      const { schema, reader } = fixture();
      reader.component = component!;
      reader.bindings = { [event!]: 'changePlanName' };
      const analysis = analyzeBindings(schema.screens);

      expect(analysis.ok).toBe(false);
      expect(analysis.readonlyFieldSubscriptions).toEqual([]);
      expect(analysis.issues).toContainEqual(expect.objectContaining({
        code: 'UNKNOWN_BINDING', nodeId: 'plan-title', component, event,
      }));
    }
  });
});
