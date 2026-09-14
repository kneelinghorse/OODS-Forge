import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { composeObject } from '../../src/objects/trait-composer.js';
import { loadObject } from '../../src/objects/object-loader.js';
import { collectViewExtensions } from '../../src/compose/view-extension-collector.js';
import { isTraitRecipe, resolveTraitRecipeProps } from '../../src/compose/trait-recipes.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';

const families = ['BillingSummaryBadge', 'BillingAmountInput', 'BillingIntervalSelector'];
// Historical whole-schema promises bind historical receipts; current recipes are checked below.
type Context = 'list' | 'detail' | 'form' | 'timeline' | 'card' | 'inline';
const baseline = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m04/baseline-schemas.json', import.meta.url), 'utf8')) as { head: string; rows: Array<{ object: string; context: Context; schema: UiSchema }> };
const historical = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m04/resolved-schemas.json', import.meta.url), 'utf8')) as typeof baseline;
function nodes(schema: UiSchema): UiElement[] {
  const result: UiElement[] = [];
  const visit = (node: UiElement) => { result.push(node); node.children?.forEach(visit); };
  schema.screens.forEach(visit); return result;
}

/** Exact expected edits, including allocator shifts caused by the two new form nodes. */
function expectedSchema(row: typeof baseline.rows[number], prefix = ''): UiSchema {
  const expected = structuredClone(row.schema);
  if (row.object !== 'Subscription') return expected;
  const list = nodes(expected);
  if (row.context === 'list') {
    const badge = list.find((node) => node.id === `${prefix}slot-toolbar-actions-3`)!;
    expect(badge.component).toBe('PriceBadge');
    badge.component = 'BillingSummaryBadge';
    badge.props!.minorUnits = 100;
  }
  if (row.context === 'form') {
    list.find((node) => node.id === `${prefix}ve-title-26`)!.id = `${prefix}ve-title-28`;
    list.find((node) => node.id === `${prefix}ve-title-27`)!.id = `${prefix}ve-title-29`;
    const slot = list.find((node) => node.id === `${prefix}slot-field-0-3`)!;
    expect(slot.component).toBe('Textarea');
    expect(slot.props?.field).toBe('cancellation_reason_code');
    delete slot.props; delete slot.bindings;
    slot.component = 'Stack';
    slot.layout = { type: 'stack', gapToken: 'cluster-default' };
    slot.children = [
      { id: `${prefix}ve-field-0-26`, component: 'BillingIntervalSelector', props: { intervalField: 'billing_interval', intervalsParameter: 'billingIntervals', intervals: ['monthly', 'yearly'] } },
      { id: `${prefix}ve-field-0-27`, component: 'BillingAmountInput', props: { amountField: 'amount', currencyField: 'currency', minorUnitsParameter: 'minorUnits', minorUnits: 100 } },
    ];
  }
  return expected;
}

describe('Decision 1822 bounded recipe composition', () => {
  it('resolves object overrides before trait defaults, preserves references and authored runtime props, and does not mutate inputs', () => {
    const composed = composeObject(loadObject('Subscription'));
    const trait = composed.traits.find((trait) => trait.ref.name.endsWith('Billable'))!;
    const extension = trait.definition.view_extensions.form.find((entry) => entry.component === 'BillingIntervalSelector')!;
    const before = JSON.stringify({ trait, extension });
    expect(resolveTraitRecipeProps(trait, extension)).toEqual({ intervalField: 'billing_interval', intervalsParameter: 'billingIntervals', intervals: ['monthly', 'yearly'] });
    const defaults = { ...trait, ref: { ...trait.ref, parameters: {} } };
    expect(resolveTraitRecipeProps(defaults, extension).intervals).toEqual(['monthly', 'quarterly', 'annual']);
    const authored = { ...extension, props: { ...extension.props, intervals: ['weekly'] } };
    expect(resolveTraitRecipeProps(trait, authored).intervals).toEqual(['weekly']);
    expect(resolveTraitRecipeProps(trait, { ...extension, props: { intervalsParameter: 'absent' } })).toEqual({ intervalsParameter: 'absent' });
    expect(resolveTraitRecipeProps(trait, { ...extension, component: 'Input' })).toEqual(extension.props);
    expect(isTraitRecipe('toString')).toBe(false);
    expect(JSON.stringify({ trait, extension })).toBe(before);
  });

  it('never selects the recipes for generic detail slots or an amount-bearing object without Billable', async () => {
    const product = composeObject(loadObject('Product'));
    expect(Object.hasOwn(product.schema, 'unit_amount_cents')).toBe(true);
    expect(product.traits.some((trait) => trait.ref.name.endsWith('/Billable'))).toBe(false);
    for (const [object, context] of [['Subscription', 'detail'], ['Product', 'detail'], ['Product', 'form'], ['Product', 'list']] as const) {
      const result = await compose({ object, context });
      expect(result.status).toBe('ok');
      expect(nodes(result.schema).filter((node) => families.includes(node.component))).toEqual([]);
    }
  });

  it('preserves the historical exact diff and current declared recipes across 66 schemas and 132 artifacts', async () => {
    expect(baseline.head).toBe('569f5a5f');
    expect(baseline.rows).toHaveLength(66);
    const placements = [];
    let unchanged = 0;
    for (const row of baseline.rows) {
      const result = await compose({ object: row.object, context: row.context });
      expect(result.status).toBe('ok');
      const retained = historical.rows.find(candidate => candidate.object === row.object && candidate.context === row.context)!;
      expect(retained.schema, `${row.object}/${row.context} historical recipe diff changed`).toEqual(expectedSchema(row));
      // s198 adds seed/form metadata without changing the retained field contract.
      const addedFields = row.object === 'Relationship' ? ['neighborhood'] : [];
      expect(Object.keys(result.schema.objectSchema!).filter(name => !addedFields.includes(name))).toEqual(Object.keys(row.schema.objectSchema!));
      expect(Object.keys(result.schema.objectSchema!).filter(name => !Object.hasOwn(row.schema.objectSchema!, name))).toEqual(addedFields);
      if (row.object === 'Relationship') expect(result.schema.objectSchema!.neighborhood).toMatchObject({ type: 'array', required: false });
      for (const [name, original] of Object.entries(row.schema.objectSchema!)) {
        const current = result.schema.objectSchema![name];
        expect(Object.fromEntries(Object.keys(original).map(key => [key, current[key]]))).toEqual(original);
        expect(Object.keys(current).filter(key => !Object.hasOwn(original, key)).every(key => ['enum', 'default', 'examples'].includes(key))).toBe(true);
      }
      if (JSON.stringify(retained.schema) === JSON.stringify(row.schema)) unchanged++;
      const composed = composeObject(loadObject(row.object));
      const plan = collectViewExtensions(composed, row.context).plan;
      for (const node of nodes(result.schema).filter((node) => families.includes(node.component))) {
        const declaration = plan.find((entry) => entry.component === node.component)!;
        if (!declaration) {
          // s198 detail summaries format declared minor-unit fields as currency.
          // They do not create editable billing controls or recurrence labels.
          if (row.context === 'detail') {
            expect(node.component).toBe('BillingSummaryBadge');
            expect(node.meta?.intent).toBe('read-only-field');
            const amountField = String(node.props?.amountField);
            expect(amountField).toMatch(/_minor$/);
            expect(result.schema.objectSchema![amountField].type).toMatch(/^(integer|number)$/);
            expect(result.schema.objectSchema!.currency).toBeDefined();
            expect(node.props).toEqual({ amountField, currencyField: 'currency', minorUnits: 100, showInterval: false });
            continue;
          }
          // Decision 1832 adds an explicit monetary header to timeline collections.
          expect(row.context).toBe('timeline'); expect(node.component).toBe('BillingSummaryBadge');
          expect(node.props).toEqual({ amountField: 'amount', currencyField: 'currency', intervalField: 'billing_interval', minorUnits: 100 });
          continue;
        }
        expect(node.props).toMatchObject(declaration.props);
        expect(Object.keys(node.props ?? {}).filter(key => !Object.hasOwn(declaration.props ?? {}, key))).toEqual(row.context === 'form' ? ['help'] : []);
        // Amount is stored in minor units but displayed in major currency units (s191-m03).
        if (row.context === 'form') expect(node.props?.help).toBe(node.component === 'BillingAmountInput'
          ? 'Amount in USD' : row.schema.objectSchema?.[String(node.props?.intervalField)]?.description);
        placements.push({ object: row.object, context: row.context, trait: declaration.sourceTrait, component: node.component, nodeId: node.id, parameters: Object.fromEntries(Object.entries(node.props ?? {}).filter(([key]) => key.endsWith('Parameter') || key === 'minorUnits' || key === 'intervals')) });
      }
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: result.schema, framework, profile: 'build' });
        expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      }
    }
    expect(unchanged).toBe(64); expect(placements).toHaveLength(3);
    const workflow = await compose({ object: 'Subscription', context: 'workflow' });
    const originalWorkflow = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m03/final-verified/composition.json', import.meta.url), 'utf8')).schema as UiSchema;
    const withList = expectedSchema({ object: 'Subscription', context: 'list', schema: originalWorkflow }, 'list-');
    const expectedWorkflow = expectedSchema({ object: 'Subscription', context: 'form', schema: withList }, 'form-');
    const retainedWorkflow = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m04/resolved-app-consumers-final/composition.json', import.meta.url), 'utf8')).schema;
    expect(retainedWorkflow, 'historical workflow differs only by its declared source placements').toEqual(expectedWorkflow);
    expect(nodes(workflow.schema).filter(node => families.includes(node.component)).map(node => node.component).sort()).toEqual([...families, 'BillingSummaryBadge'].sort());
    for (const framework of ['react', 'vue'] as const) {
      const result = await generate({ schema: workflow.schema, framework, profile: 'build' });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    }
    if (process.env.S188_BILLING_CENSUS_OUTPUT) writeFileSync(process.env.S188_BILLING_CENSUS_OUTPUT, JSON.stringify({ baselineHead: baseline.head, decision: 1822, schemas: 66, generatedCells: 132, unchanged, placements, workflow: { generatedCells: 2, exactExpectedDiff: true, placements: placements.map((entry) => ({ ...entry, sourceContext: entry.context, context: 'workflow', nodeId: `${entry.context}-${entry.nodeId}` })) } }, null, 2) + '\n');
  }, 120_000);
});
