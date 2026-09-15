import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { workflowSampleRecords } from '../../src/codegen/workflow-data-emitter.js';
import { fieldHelp } from '../../src/compose/label-generator.js';
import { expectedCollectionOrder, expectedWorkflowFlow, workflowEditProbe } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';

describe('s198 application proof follows object declarations and real record titles', () => {
  it('keeps implementation descriptions available in schema metadata but gives shared form fields useful help', async () => {
    const { schema } = await compose({ object: 'Organization', context: 'form' });
    const walk = (nodes: typeof schema.screens): typeof schema.screens => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);
    expect(schema.objectSchema!.status!.description).toContain('Consumed by');
    const nodes = walk(schema.screens);
    expect(nodes.find(node => node.component === 'StatusSelector')?.props?.help).toBe('Choose the current status.');
    const workflow = await compose({ object: 'Organization', context: 'workflow' });
    const generated = await generate({ schema: workflow.schema, framework: 'react' });
    expect(generated.status).toBe('ok');
    const application = generated.artifact!.files.find(file => file.path === 'src/application.ts')!.contents;
    // Sprint 201 m06 (#2046 internal fields): the preference version counter is no longer a form field, so its help leaves the application with it.
    expect(application).not.toContain('"name":"preference_version"');
    expect(application).not.toContain('SemVer mirror');
    expect(fieldHelp('preference_version', 'SemVer mirror of the preference document.')).toBe('Version of this record’s preferences.');
    expect(nodes.find(node => node.props?.field === 'owner_type')?.props?.help).toBe('Choose the kind of owner.');
    expect(fieldHelp('domain', 'Verified email domain.')).toBe('Verified email domain.');
  });
  it('filters preserve title ordering rather than accidentally assuming ID order', async () => {
    const { schema } = await compose({ object: 'Organization', context: 'workflow' });
    expect(expectedCollectionOrder(schema, 'active')).toEqual(['organization-007', 'organization-003']);
    expect(expectedCollectionOrder(schema)).toEqual(['007','010','003','002','009','008','001','005','004','006'].map(id => `organization-${id}`));
  });
  it.each(['Organization', 'User'])('%s requires save, address persistence and populated timeline without inventing cancellation', async object => {
    const { schema } = await compose({ object, context: 'workflow' });
    const flow = expectedWorkflowFlow(schema);
    expect(flow).toContain('address-save-persists');
    expect(flow).toContain('save-record-title');
    expect(flow).not.toContain('cancel-detail');
    expect(schema.workflow!.transitions.some(row => row.effect === 'archive')).toBe(false);
    expect(schema.screens.some(screen => screen.bindings?.onDelete)).toBe(false);
    expect(workflowEditProbe(schema).archivable).toBe(false);
    for (const framework of ['react', 'vue'] as const) {
      const result = await generate({ schema, framework });
      expect(result.status).toBe('ok');
      expect(result.artifact!.actions.some(action => action.name === 'handleDelete')).toBe(false);
    }
    expect(workflowEditProbe(schema).timelineEmpty).toBe(false);
  });
  it.each(['Organization', 'User'])('%s detail panels bind actual membership counts and preference namespaces without changing panel contracts', async object => {
    const { schema } = await compose({ object, context: 'detail' });
    const walk = (nodes: typeof schema.screens): typeof schema.screens => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);
    const nodes = walk(schema.screens);
    for (const [component, fields] of [['MembershipPanel', ['membership_records']], ['PreferencePanel', ['preference_namespaces', 'preference_version']]] as const) {
      const panel = nodes.find(node => node.component === component)!;
      const values = walk(panel.children ?? []).filter(node => node.meta?.intent === 'read-only-field');
      expect(values.map(node => node.props?.field)).toEqual(fields);
    }
  });
  it.each(['Evidence', 'Mission'])('%s detail omits collection controls and binds classification content when declared', async object => {
    const { schema } = await compose({ object, context: 'detail' });
    const walk = (nodes: typeof schema.screens): typeof schema.screens => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);
    const nodes = walk(schema.screens);
    expect(nodes.filter(node => ['SearchInput', 'FilterPanel'].includes(node.component))).toEqual([]);
    expect(nodes.filter(node => node.component === 'StatusBadge' && !node.props && !node.children?.length)).toEqual([]);
    if (object === 'Evidence') {
      const panel = nodes.find(node => node.component === 'ClassificationPanel')!;
      expect(walk(panel.children ?? []).filter(node => node.meta?.intent === 'read-only-field').map(node => node.props?.field)).toEqual(['primary_category_id', 'tags']);
    }
  });
  it('Mission seeds an objective long enough to save its declared research form', async () => {
    const { schema } = await compose({ object: 'Mission', context: 'workflow' });
    expect(schema.objectSchema!.objective!.examples).toHaveLength(3);
    expect(workflowSampleRecords(schema).every(record => String(record.objective).length >= 10)).toBe(true);
  });
  it('timestamp-backed Plan history remains a required populated timeline', async () => {
    const { schema } = await compose({ object: 'Plan', context: 'workflow' });
    expect(workflowEditProbe(schema).timelineEmpty).toBe(false);
  });
  it('Subscription retains cancellation, billing edit persistence and actual archive membership', async () => {
    const { schema } = await compose({ object: 'Subscription', context: 'workflow' });
    expect(expectedWorkflowFlow(schema)).toEqual(['ten-sample-records','detail-navigation','edit-seeded-values','billing-edit-values','save-plan-name','billing-save-persists','cancel-detail','cancel-list-badge','timeline-navigation-and-history']);
    expect(schema.workflow!.transitions.some(row => row.effect === 'archive')).toBe(true);
    expect(expectedCollectionOrder(schema)).toHaveLength(9);
    expect(expectedCollectionOrder(schema)).not.toContain('subscription-010');
  });
});
