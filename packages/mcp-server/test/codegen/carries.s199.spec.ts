import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { workflowSampleRecords } from '../../src/codegen/workflow-data-emitter.js';
import { populateCollections } from '../../src/compose/collections.js';
import { OBJECTS, supportsWorkflow } from '../../src/lib/runtime-ledger.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';

const walk = (nodes: UiElement[]): UiElement[] => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);

describe('s199 carry producers prevent misleading generated app state', () => {
  it.each(OBJECTS.filter(supportsWorkflow))('%s seeds one coherent address role and no label/description placeholders', async object => {
    const { schema } = await compose({ object, context: 'workflow' });
    for (const record of workflowSampleRecords(schema)) {
      for (const field of ['label', 'description']) {
        if (schema.objectSchema?.[field]) expect(record[field], `${object}.${field}`).not.toBe(field[0]!.toUpperCase() + field.slice(1));
      }
      if (!schema.workflow?.data.traits.some(trait => trait.split('/').pop() === 'Addressable')) continue;
      const entries = record.addresses as Array<{ role: string }>;
      expect(entries).toHaveLength(1);
      expect(record.address_roles).toEqual([entries[0]!.role]);
      expect(record.default_address_role).toBe(entries[0]!.role);
    }
  });

  it('binds the Mission timeline identity to title instead of its generic label projection', async () => {
    for (const context of ['timeline', 'workflow']) {
      const { schema } = await compose({ object: 'Mission', context });
      const header = walk(schema.screens).find(node => node.id.includes('timeline-header-'))!;
      expect(header.children?.[0]?.props?.field).toBe('title');
    }
    const { schema } = await compose({ object: 'Mission', context: 'workflow' });
    for (const record of workflowSampleRecords(schema)) {
      expect(record.label).toBe(record.title);
      expect(record.description).toBe(record.title);
    }
  });

  it('prefers a domain classification over status and ignores an enum whose authored preview is constant', () => {
    const schema = {
      objectSchema: {
        id: { type: 'string', required: true },
        owner: { type: 'string', required: true, enum: ['user', 'team'], examples: ['user'] },
        status: { type: 'string', required: true, enum: ['active', 'ended'] },
        disposition: { type: 'string', required: true, enum: ['for', 'against'] },
        primary_category_id: { type: 'string', required: true, enum: ['for', 'against'] },
      },
      screens: [{ id: 'list', component: 'Stack', children: [
        { id: 'list-items-record', component: 'Stack', children: [] },
        { id: 'list-toolbar-record', component: 'Stack', children: [{ id: 'filter', component: 'Stack', meta: { intent: 'slot:filters' } }] },
      ] }],
    } as UiSchema;
    const fallback = structuredClone(schema);
    populateCollections(schema, 'list', 'Record');
    expect(walk(schema.screens).find(node => node.collectionControl === 'filter')?.props?.field).toBe('disposition');
    fallback.objectSchema!.status!.enum = ['active'];
    delete fallback.objectSchema!.primary_category_id;
    populateCollections(fallback, 'list', 'Record');
    expect(walk(fallback.screens).find(node => node.collectionControl === 'filter')?.props?.field).toBe('disposition');
  });
});
