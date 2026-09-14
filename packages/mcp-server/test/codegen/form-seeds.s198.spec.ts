import { JSDOM } from 'jsdom';
import { renderMappedComponent } from '../../src/render/component-map.js';
import { recordCollectionEvents } from '@oods/component-contracts';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { workflowSampleData, workflowSampleRecords, workflowDataFiles } from '../../src/codegen/workflow-data-emitter.js';
import { OBJECTS, supportsWorkflow } from '../../src/lib/runtime-ledger.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { typecheckWorkflow } from '../product-reality/workflow-typecheck.js';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CHANNEL_SEEDS, TEMPLATE_SEEDS } from '../../../../src/data/communication/sample-data.js';
import { loadTrait } from '../../src/objects/trait-loader.js';
const walk = (nodes: UiElement[]): UiElement[] => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);

describe('s198 form craft and one attributable seed policy', () => {
  it('HTML uses catalog names for labels while retaining stored role/template IDs', () => {
    for (const [component, props, names] of [
      ['RoleAssignmentForm', { availableRoles: [{ id: 'role-001', name: 'Owner' }, { id: 'role-002', name: 'Editor', label: 'Content editor' }] }, ['Owner', 'Content editor']],
      ['TemplatePicker', { templates: [{ id: 'template-001', name: 'Welcome Email' }], channels: [{ id: 'channel-001', name: 'Primary Email' }] }, ['Welcome Email', 'Primary Email']],
    ] as const) {
      const html = renderMappedComponent({ id: 'catalog', component, props }, '')!;
      const options = [...JSDOM.fragment(html).querySelectorAll('option')];
      expect(options.map(option => option.textContent)).toEqual(names);
      expect(options.every(option => option.value.includes('-00'))).toBe(true);
    }
  });
  it('keeps authored trait examples tied to canonical role and communication catalogs', () => {
    // The canonical fixture imports root aliases; evaluate it with the root tsx config.
    const roles = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "import { AUTHZ_SAMPLE_DATASET } from './src/data/authz/sample-entitlements.ts'; console.log(JSON.stringify(AUTHZ_SAMPLE_DATASET.roles));"], { cwd: fileURLToPath(new URL('../../../../', import.meta.url)), encoding: 'utf8' }));
    expect(loadTrait('Authable').schema.role_catalog!.examples![0]).toEqual(roles);
    expect(loadTrait('Communicable').schema.channel_catalog!.examples![0]).toEqual(CHANNEL_SEEDS.map(({ id, name, channelType }) => ({ id, name, type: channelType })));
    expect(loadTrait('Communicable').schema.template_catalog!.examples![0]).toEqual(TEMPLATE_SEEDS.map(({ id, name, channelType, subject, body, variables, locale }) => ({ id, name, channelType, subject, body, variables, locale })));
    expect(loadTrait('Authable').schema.role_catalog!.default).toEqual([]);
  });
  it.each(OBJECTS)('%s has deterministic, declared enum values and no placeholder strings', async object => {
    const context = supportsWorkflow(object) ? 'workflow' : 'inline';
    const result = await compose({ object, context });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    const { records, seedTable } = workflowSampleData(result.schema);
    expect(records).toEqual(workflowSampleRecords(result.schema));
    expect(JSON.stringify(records)).not.toMatch(/ sample \d+/);
    expect(seedTable.length).toBeGreaterThan(0);
    expect(seedTable.every(row => row.rule.length > 0)).toBe(true);
    for (const record of records) for (const [field, entry] of Object.entries(result.schema.objectSchema ?? {})) {
      if (entry.enum?.length && record[field] !== undefined) expect(entry.enum, field).toContain(record[field]);
    }
  });
  it.each(['Organization', 'User'])('%s retains trait catalog examples and preference parameters in both frameworks', async object => {
    const { schema } = await compose({ object, context: 'workflow' });
    const record = workflowSampleRecords(schema)[2]!;
    expect(record.role_catalog).toEqual(loadTrait('Authable').schema.role_catalog!.examples![0]);
    expect(record.template_catalog).toEqual(loadTrait('Communicable').schema.template_catalog!.examples![0]);
    expect((record.channel_catalog as unknown[]).length).toBeGreaterThan(1);
    const document = record.preference_document as { version: string; preferences: Record<string, unknown> };
    expect(Object.keys(document.preferences)).toEqual(record.preference_namespaces);
    expect(document.version).toBe(record.preference_version);
    expect((record.addresses as unknown[]).length).toBeGreaterThan(0);
    expect(record.preference_version).toBe('2.0.0');
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      const form = generated.artifact!.files.find(file => file.path.startsWith('src/screens/Form.'))!.contents;
      for (const field of ['preferenceNamespaces', 'roleCatalog', 'templateCatalog', 'channelCatalog']) expect(form).toContain(field);
      const checked = typecheckWorkflow(generated.artifact!);
      expect(checked.status, checked.stdout + checked.stderr).toBe(0);
    }
  }, 60000);
  it.each(['Subscription', 'Invoice', 'Plan'])('%s uses controls for field titles, compact strings and valid date input types', async object => {
    const { schema } = await compose({ object, context: 'form' });
    const nodes = walk(schema.screens);
    expect(nodes.filter(node => node.component === 'DetailHeader' && node.props?.field)).toEqual([]);
    for (const node of nodes) {
      const field = String(node.props?.field ?? '');
      const entry = schema.objectSchema?.[field];
      if (node.component === 'DatePicker' && entry) expect(entry.type).toMatch(/^date/);
      if (node.component === 'Textarea') expect(field).toMatch(/description|reason|notes|body|content|instructions/);
    }
    expect(nodes.filter(node => node.component === 'Button' && node.props?.type === 'submit')).toHaveLength(1);
    if (object === 'Invoice') expect(nodes.find(node => node.props?.field === 'billing_contact_name')?.component).toBe('Input');
    for (const framework of ['react', 'vue'] as const) expect((await generate({ schema, framework, profile: 'build' })).status).toBe('ok');
  });
  it('keeps example precedence and data isolated, without turning preview examples into production defaults', () => {
    const schema = { version: '2026.02', screens: [{ id: 'screen', component: 'Stack' }], objectSchema: { value: { type: 'object', required: true, default: {}, examples: [{ nested: ['example'] }] } } } as UiSchema;
    const first = workflowSampleRecords(schema);
    (first[0]!.value as { nested: string[] }).nested.push('mutated');
    expect(workflowSampleRecords(schema)[0]!.value).toEqual({ nested: ['example'] });
    expect(schema.objectSchema!.value!.default).toEqual({});
  });
  it('keeps price-derived payments and active periods coherent at the fixed preview date', async () => {
    const { schema } = await compose({ object: 'Subscription', context: 'workflow' });
    for (const record of workflowSampleRecords(schema).filter(record => !['terminated', 'ended'].includes(String(record.status)))) {
      expect(Date.parse(String(record.current_period_start))).toBeLessThan(Date.parse('2026-09-08T12:00:00Z'));
      expect(Date.parse(String(record.current_period_end))).toBeGreaterThan(Date.parse('2026-09-08T12:00:00Z'));
      expect((record.payment_history as Array<{ amount: number }>).at(-1)!.amount).toBe(record.amount);
      expect(record.amount).toBeGreaterThan(0);
    }
  });
  it.each(['Invoice', 'Plan'])('%s exposes its timestamped creation in the timeline even without Stateful', async object => {
    const { schema } = await compose({ object, context: 'workflow' });
    const store = workflowDataFiles(schema).find(file => file.path === 'src/store.ts')!.contents;
    expect(workflowSampleRecords(schema)[2]![object === 'Invoice' ? 'created_at' : 'period_start']).toBe(object === 'Invoice' ? '2026-09-01T12:00:00.000Z' : '2026-09-01');
    expect(store).toContain('return recordCollectionEvents(record,');
    expect(recordCollectionEvents(workflowSampleRecords(schema)[2]!)[0]!.title).toBe(object === 'Invoice' ? 'Created' : 'Period started');
  });
});
