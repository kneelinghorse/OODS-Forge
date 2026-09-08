import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { composeObject } from '../../src/objects/trait-composer.js';
import { loadObject } from '../../src/objects/object-loader.js';
import { fieldLabel, populateFieldLabels } from '../../src/compose/label-generator.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';

type ExistingContext = 'detail' | 'list' | 'form' | 'timeline' | 'card' | 'inline';
const baseline = JSON.parse(readFileSync(new URL(
  '../../../../artifacts/product-reality/sprint-188/m02/baseline-schemas.json', import.meta.url,
), 'utf8')) as { head: string; rows: Array<{ object: string; context: ExistingContext; schema: UiSchema }> };

function nodes(schema: UiSchema): UiElement[] {
  const result: UiElement[] = [];
  const visit = (node: UiElement) => { result.push(node); node.children?.forEach(visit); };
  schema.screens.forEach(visit);
  return result;
}

describe('Sprint 188 meaningful field labels', () => {
  it('uses the field description, with readable names when no useful description exists', () => {
    expect(fieldLabel('cancellation_reason', '  Why this subscription is being cancelled.  '))
      .toBe('Why this subscription is being cancelled.');
    expect(fieldLabel('cancelAtPeriodEnd')).toBe('Cancel At Period End');
    expect(fieldLabel('customer_email', 'Field 3')).toBe('Customer email');
    expect(fieldLabel('billing-interval', '  ')).toBe('Billing interval');
  });

  it('replaces a bound placeholder without overwriting an authored control label', () => {
    const schema: UiSchema = {
      version: '2026.02',
      screens: [{ id: 'editor', component: 'Input', props: { field: 'reason', label: 'Field 0' } }],
      objectSchema: { reason: { type: 'string', required: false, description: 'Reason for cancellation' } },
    };
    populateFieldLabels(schema);
    expect(schema.screens[0].props?.label).toBe('Reason for cancellation');
    schema.screens[0].props!.label = 'Tell us why';
    populateFieldLabels(schema);
    expect(schema.screens[0].props?.label).toBe('Tell us why');
  });

  it('preserves all 66 baseline compositions except the decision 1817 labels and trait bindings, with 132 build artifacts', async () => {
    expect(baseline.head).toBe('cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076');
    expect(baseline.rows).toHaveLength(66);
    const differences: unknown[] = [];
    let changedLabels = 0;
    let generatedCells = 0;
    for (const row of baseline.rows) {
      const result = await compose({ object: row.object, context: row.context });
      expect(result.status, `${row.object}/${row.context}`).toBe('ok');
      const composed = composeObject(loadObject(row.object));
      const current = structuredClone(result.schema);
      const previous = nodes(row.schema);
      for (const node of nodes(current)) {
        if (typeof node.props?.label === 'string') {
          expect(node.props.label, `${row.object}/${row.context}/${node.id}`).not.toMatch(/^Field \d+$/);
        }
        const old = previous.find((candidate) => candidate.id === node.id);
        const hadPlaceholder = typeof old?.props?.label === 'string' && /^Field \d+$/.test(old.props.label);
        const hadAnonymousSlot = old?.props?.label === undefined && /^field-\d+$/.test(old?.meta?.label ?? '');
        if (old?.props && (hadPlaceholder || hadAnonymousSlot)) {
          const field = old.props.field;
          expect(typeof field).toBe('string');
          expect(node.props?.label).toBe(row.schema.objectSchema![field as string].description!.trim());
          differences.push({ object: row.object, context: row.context, nodeId: node.id, field, traits: composed.traits.filter((trait) => Object.hasOwn(trait.definition.schema, field as string)).map((trait) => trait.ref.name), kind: 'label', before: old.props.label ?? null, after: node.props!.label });
          if (old.props.label === undefined) delete node.props!.label;
          else node.props!.label = old.props.label;
          changedLabels += 1;
        }
      }
      const traits = result.objectUsed!.traits.map((name) => name.split('/').pop());
      for (const [trait, event, action, contexts] of [
        ['Cancellable', 'onCancel', 'handleCancel', ['detail', 'form']],
        ['Timestampable', 'onViewTimeline', 'handleViewTimeline', ['detail']],
      ] as const) {
        if (traits.includes(trait) && (contexts as readonly string[]).includes(row.context)) {
          const root = current.screens[0];
          expect(root.bindings?.[event]).toBe(action);
          expect(row.schema.screens[0].bindings?.[event]).toBeUndefined();
          differences.push({ object: row.object, context: row.context, trait, kind: 'binding', event, action });
          delete root.bindings![event];
        }
      }
      expect(JSON.stringify(current), `${row.object}/${row.context} changed beyond decision 1817`)
        .toBe(JSON.stringify(row.schema));
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: result.schema, framework, profile: 'build' });
        expect(generated.status, `${row.object}/${row.context}/${framework}: ${JSON.stringify(generated.errors)}`).toBe('ok');
        expect(generated.artifact?.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(generated.code).not.toMatch(/label="Field \d+"/);
        generatedCells += 1;
      }
    }
    writeFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m02/schema-differences.json', import.meta.url), JSON.stringify(differences, null, 2) + '\n');
    expect(changedLabels).toBe(24);
    expect(generatedCells).toBe(132);
  }, 120_000);
});
