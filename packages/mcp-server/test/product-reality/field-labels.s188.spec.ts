import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { fieldLabel, populateFieldLabels } from '../../src/compose/label-generator.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle as compose } from '../../src/tools/design.compose.js';

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
  it('uses short names while descriptions remain separate help', () => {
    expect(fieldLabel('cancellation_reason', '  Why this subscription is being cancelled.  '))
      .toBe('Cancellation reason');
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
    expect(schema.screens[0].props?.label).toBe('Reason');
    schema.screens[0].props!.label = 'Tell us why';
    populateFieldLabels(schema);
    expect(schema.screens[0].props?.label).toBe('Tell us why');
  });

  it('keeps all 66 public compositions free of anonymous Field N labels', async () => {
    expect(baseline.rows).toHaveLength(66);
    for (const row of baseline.rows) {
      const result = await compose({ object: row.object, context: row.context });
      expect(result.status).toBe('ok');
      for (const node of nodes(result.schema)) {
        if (typeof node.props?.label === 'string') expect(node.props.label, `${row.object}/${row.context}/${node.id}`).not.toMatch(/^Field \d+$/);
      }
    }
  });
});
