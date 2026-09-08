import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';

const families = ['CycleProgressCard', 'PaymentTimeline', 'PaymentEventTimeline', 'BillingCardMeta', 'ArchivedRowOverlay'];
const nodes = (schema: UiSchema) => {
  const result: UiElement[] = [];
  const walk = (node: UiElement) => { result.push(node); node.children?.forEach(walk); };
  schema.screens.forEach(walk); return result;
};
const baseline = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m05/baseline-schemas.json', import.meta.url), 'utf8')) as { rows: Array<{ object: string; context: 'list' | 'detail' | 'form' | 'timeline' | 'card' | 'inline'; schema: UiSchema }> };

describe('Sprint 188 remaining trait placement obligations', () => {
  it('never chooses any of the five recipes for generic slots on Product', async () => {
    for (const context of ['list', 'detail', 'form', 'timeline', 'card', 'inline'] as const) {
      const result = await compose({ object: 'Product', context });
      expect(result.status).toBe('ok'); expect(nodes(result.schema).filter((node) => families.includes(node.component))).toEqual([]);
    }
  });
  it('keeps every schema outside the five declared object/context changes byte-identical to the m04 head', async () => {
    const changes = new Set(['Subscription/detail', 'Subscription/timeline', 'Subscription/card', 'Subscription/list', 'Transaction/list']);
    let checked = 0;
    for (const row of baseline.rows) {
      if (changes.has(`${row.object}/${row.context}`)) continue;
      expect((await compose({ object: row.object, context: row.context })).schema).toEqual(row.schema); checked++;
    }
    expect(checked).toBe(61);
  });
  it.each([
    ['detail', ['CycleProgressCard', 'PaymentTimeline']],
    ['timeline', ['PaymentEventTimeline']],
    ['card', ['BillingCardMeta']],
    ['list', ['ArchivedRowOverlay']],
  ] as const)('keeps every declared %s recipe as a real node through all composer post-processing', async (context, required) => {
    const result = await compose({ object: 'Subscription', context });
    const placed = nodes(result.schema);
    for (const component of required) expect(placed.some((node) => node.component === component), `Subscription/${context}: ${component} was erased or never placed`).toBe(true);
    if (context === 'card') expect(placed.find((node) => node.component === 'BillingCardMeta')?.props).toMatchObject({ minorUnitsParameter: 'minorUnits', minorUnits: 100 });
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema: result.schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    }
  });
});
