import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
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
    expect(application).toContain('Version of this record’s preferences.');
    expect(application).not.toContain('SemVer mirror');
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
    expect(workflowEditProbe(schema).timelineEmpty).toBe(false);
  });
  it('timestamp-backed Plan history remains a required populated timeline', async () => {
    const { schema } = await compose({ object: 'Plan', context: 'workflow' });
    expect(workflowEditProbe(schema).timelineEmpty).toBe(false);
  });
  it('Subscription retains cancellation, billing edit persistence and actual archive membership', async () => {
    const { schema } = await compose({ object: 'Subscription', context: 'workflow' });
    expect(expectedWorkflowFlow(schema)).toEqual(['ten-sample-records','detail-navigation','edit-seeded-values','billing-edit-values','save-plan-name','billing-save-persists','cancel-detail','cancel-list-badge','timeline-navigation-and-history']);
    expect(expectedCollectionOrder(schema)).toHaveLength(9);
    expect(expectedCollectionOrder(schema)).not.toContain('subscription-010');
  });
});
