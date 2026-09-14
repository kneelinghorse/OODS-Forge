import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { fillSlotsWithObject } from '../../src/compose/object-slot-filler.js';
import { timelineTemplate } from '../../src/compose/templates/timeline.js';
import { loadCatalog } from '../../src/compose/component-selector.js';
import { collectViewExtensions } from '../../src/compose/view-extension-collector.js';
import { composeObject } from '../../src/objects/trait-composer.js';
import { loadObject } from '../../src/objects/object-loader.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';

const families = ['CycleProgressCard', 'PaymentTimeline', 'PaymentEventTimeline', 'BillingCardMeta', 'ArchivedRowOverlay'];
const nodes = (schema: UiSchema) => {
  const result: UiElement[] = [];
  const walk = (node: UiElement) => { result.push(node); node.children?.forEach(walk); };
  schema.screens.forEach(walk); return result;
};
const baseline = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m05/baseline-schemas.json', import.meta.url), 'utf8')) as { head: string; workflow: UiSchema; rows: Array<{ object: string; context: 'list' | 'detail' | 'form' | 'timeline' | 'card' | 'inline'; schema: UiSchema }> };

const historical = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m05/resolved-schemas.json', import.meta.url), 'utf8')) as typeof baseline;

// These are the complete authorized changes from the M04 schema, including allocator shifts.
function expectedSchema(row: typeof baseline.rows[number], prefix = ''): UiSchema {
  const schema = structuredClone(row.schema);
  const all = nodes(schema);
  const byId = (id: string) => all.find((node) => node.id === `${prefix}${id}`)!;
  const plan = collectViewExtensions(composeObject(loadObject(row.object)), row.context).plan;
  const props = (component: string) => plan.find((entry) => entry.component === component)!.props;
  if (row.object === 'Subscription' && row.context === 'detail') {
    [24, 25, 26].map((n) => byId(`ve-header-${n}`)).forEach((node, index) => { node.id = `${prefix}ve-header-${index + 26}`; });
    const cycle = byId('slot-tab-0-4');
    expect(cycle.props?.patternComponent).toBe('StatusTimeline');
    cycle.component = 'CycleProgressCard'; cycle.props = props(cycle.component);
    delete cycle.layout; delete cycle.children; delete cycle.meta!.notes;
    const payment = byId('slot-tab-1-6');
    payment.component = 'PaymentTimeline'; payment.props = props(payment.component);
    delete payment.meta!.confidence; delete payment.meta!.confidenceLevel;
  }
  if (row.object === 'Subscription' && row.context === 'timeline') {
    const event = byId('slot-entry-0-4');
    event.component = 'PaymentEventTimeline'; event.props = props(event.component);
  }
  if (row.object === 'Subscription' && row.context === 'card') {
    const card = byId('slot-footer-6');
    expect(card.component).toBe('PriceCardMeta'); card.component = 'BillingCardMeta'; card.props!.minorUnits = 100;
  }
  if (['Subscription', 'Transaction'].includes(row.object) && row.context === 'list') {
    const items = all.find((node) => node.meta?.label === 'items')!;
    items.children!.push({ id: `${prefix}ve-items-13`, component: 'ArchivedRowOverlay', props: props('ArchivedRowOverlay') });
  }
  return schema;
}

describe('Sprint 188 remaining trait placement obligations', () => {
  it('never chooses any of the five recipes for generic slots on Product', async () => {
    for (const context of ['list', 'detail', 'form', 'timeline', 'card', 'inline'] as const) {
      const result = await compose({ object: 'Product', context });
      expect(result.status).toBe('ok'); expect(nodes(result.schema).filter((node) => families.includes(node.component))).toEqual([]);
    }
  });
  it('retains historical grouped-slot bytes and current status fields after detail reconciliation', async () => {
    const original = baseline.rows.find((row) => row.object === 'Article' && row.context === 'detail')!;
    const expected = nodes(original.schema).find((node) => node.meta?.notes === 'pattern-group:status-timeline')!;
    expect(expected.component).toBe('Stack');
    expect(expected.props).toEqual({ patternComponent: 'StatusTimeline', fields: ['status', 'allowed_transitions'] });
    expect(expected.children?.map((node) => node.props?.field)).toEqual(['status', 'allowed_transitions']);
    const current = await compose({ object: 'Article', context: 'detail' });
    expect(nodes(historical.rows.find(row => row.object === 'Article' && row.context === 'detail')!.schema).find(node => node.id === expected.id)).toEqual(expected);
    const group = nodes(current.schema).find(node => node.meta?.notes === 'pattern-group:status-timeline')!;
    // The declared StatusTimeline owns status; navigation stays a read-only row
    // instead of presenting the scalar group as a second history log.
    expect(group.component).toBe('Stack');
    expect(group.props).toBeUndefined();
    expect(group.children?.map(node => node.children?.find(child => child.meta?.intent === 'read-only-field')?.props?.field)).toEqual(['allowed_transitions']);
    const timelines = nodes(current.schema).filter(node => node.component === 'StatusTimeline');
    expect(timelines).toHaveLength(1);
    expect(timelines[0].props).toMatchObject({ field: 'status', historyField: 'state_history' });
    expect(nodes({ ...current.schema, screens: [group] }).filter(node => node.component === 'StatusTimeline')).toEqual([]);
  });
  it('leaves an unroutable generic main extension unplaced, with the existing warning and no timeline fallback', async () => {
    const catalog = await loadCatalog();
    const without = fillSlotsWithObject(timelineTemplate({}), [], catalog);
    const withGeneric = fillSlotsWithObject(timelineTemplate({}), [{ component: 'Text', sourceTrait: 'test/Generic', position: 'main', priority: 10, props: { text: 'Unroutable generic content' } }], catalog);
    expect(withGeneric.schema).toEqual(without.schema);
    expect(withGeneric.placements).toEqual(without.placements);
    expect(withGeneric.warnings).toEqual(['No matching slot for position "main" from test/Generic/Text.', ...without.warnings]);
  });
  it('preserves the historical placement diff and current declared recipes across 66 schemas, 132 artifacts and workflow', async () => {
    const placements: Array<{ object: string; context: string; trait: string; component: string; nodeId: string; parameters: Record<string, unknown>; props: UiElement['props'] }> = [];
    let unchanged = 0;
    expect(baseline.head).toBe('8561d83c');
    for (const row of baseline.rows) {
      const current = await compose({ object: row.object, context: row.context });
      const retained = historical.rows.find(candidate => candidate.object === row.object && candidate.context === row.context)!;
      expect(retained.schema, `${row.object}/${row.context} historical placement diff changed`).toEqual(expectedSchema(row));
      // s198 adds seed/form metadata without changing the retained field contract.
      const addedFields = row.object === 'Relationship' ? ['neighborhood'] : [];
      expect(Object.keys(current.schema.objectSchema!).filter(name => !addedFields.includes(name))).toEqual(Object.keys(row.schema.objectSchema!));
      expect(Object.keys(current.schema.objectSchema!).filter(name => !Object.hasOwn(row.schema.objectSchema!, name))).toEqual(addedFields);
      if (row.object === 'Relationship') expect(current.schema.objectSchema!.neighborhood).toMatchObject({ type: 'array', required: false });
      for (const [name, original] of Object.entries(row.schema.objectSchema!)) {
        const field = current.schema.objectSchema![name];
        expect(Object.fromEntries(Object.keys(original).map(key => [key, field[key]]))).toEqual(original);
        expect(Object.keys(field).filter(key => !Object.hasOwn(original, key)).every(key => ['enum', 'default', 'examples'].includes(key))).toBe(true);
      }
      if (JSON.stringify(retained.schema) === JSON.stringify(row.schema)) unchanged++;
      const plan = collectViewExtensions(composeObject(loadObject(row.object)), row.context).plan;
      for (const node of nodes(current.schema).filter((node) => families.includes(node.component))) {
        const declaration = plan.find((entry) => entry.component === node.component)!;
        expect(declaration).toBeDefined(); expect(node.props).toMatchObject(declaration.props);
        expect(Object.keys(node.props ?? {}).filter(key => !Object.hasOwn(declaration.props ?? {}, key))).toEqual(node.component === 'ArchivedRowOverlay' ? ['labelField'] : []);
        placements.push({ object: row.object, context: row.context, trait: declaration.sourceTrait, component: node.component, nodeId: node.id, parameters: Object.fromEntries(Object.entries(node.props ?? {}).filter(([key]) => key.endsWith('Parameter') || key === 'minorUnits')), props: node.props });
      }
      for (const framework of ['react', 'vue'] as const) {
        const generated = await generate({ schema: current.schema, framework, profile: 'build' });
        expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      }
    }
    expect(unchanged).toBe(61); expect(placements).toHaveLength(6);
    let expected = baseline.workflow;
    for (const context of ['list', 'detail', 'timeline'] as const) expected = expectedSchema({ object: 'Subscription', context, schema: expected }, `${context}-`);
    const workflow = await compose({ object: 'Subscription', context: 'workflow' });
    expect(historical.workflow).toEqual(expected);
    expect(nodes(workflow.schema).filter(node => families.includes(node.component)).map(node => node.component).sort()).toEqual(['ArchivedRowOverlay', 'CycleProgressCard', 'PaymentEventTimeline', 'PaymentTimeline']);
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema: workflow.schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    }
    if (process.env.S188_M05_CENSUS_OUTPUT) writeFileSync(process.env.S188_M05_CENSUS_OUTPUT, JSON.stringify({ baselineHead: baseline.head, decision: 1825, schemas: 66, generatedCells: 132, unchanged, placements, workflow: { generatedCells: 2, exactExpectedDiff: true, placements: placements.filter((entry) => entry.object === 'Subscription' && entry.context !== 'card').map((entry) => ({ ...entry, sourceContext: entry.context, context: 'workflow', nodeId: `${entry.context}-${entry.nodeId}` })) } }, null, 2) + '\n');
  }, 120_000);
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
