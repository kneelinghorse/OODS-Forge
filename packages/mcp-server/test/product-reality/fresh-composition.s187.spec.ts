import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { resolveFieldProps, mapFieldType } from '../../src/codegen/binding-utils.js';
import { wireFieldProps } from '../../src/compose/object-slot-filler.js';
import { runS185M04LiveConsumers } from '../../../../scripts/product-reality/s185-m04-live-consumers.js';
import { composeFreshInputs, runLiveGenerationOnly } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { deriveConsumerModel, deriveValueProbes, schemaNodes } from '../../../../scripts/product-reality/s185-m04-consumer-contract.js';
import type { UiSchema } from '../../src/schemas/generated.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const requireVue = createRequire(new URL('../../../components-vue/package.json', import.meta.url));
const compiler = requireVue('@vue/compiler-sfc');
const esbuild = createRequire(requireVue.resolve('vite/package.json'))('esbuild');
const operands = [
  ['Article', 'detail'], ['Media', 'detail'], ['Product', 'detail'], ['User', 'detail'],
  ['Plan', 'inline'], ['Subscription', 'inline'], ['Usage', 'list'], ['Usage', 'inline'], ['Transaction', 'timeline'],
] as const;

describe('Sprint 187 fresh composition binding intent', () => {
  it.each(operands)('%s/%s preserves its fields and generates in both frameworks', async (object, context) => {
    const composed = await compose({ object, context });
    expect(composed.status).toBe('ok');
    const schema = composed.schema!;
    const before = JSON.stringify(schema);
    for (const framework of ['react', 'vue'] as const) {
      const result = await generate({ schema, framework, profile: 'build' });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      expect(result.artifact?.framework).toBe(framework);
    }
    expect(JSON.stringify(schema)).toBe(before);
    if (context === 'detail') {
      const timeline = schemaNodes(schema).find((node) => node.component === 'StatusTimeline');
      expect(timeline?.props?.field).toBe('status');
      expect(timeline?.props?.historyField).toBe('state_history');
      expect(timeline?.props).not.toHaveProperty('label');
    }
  });

  it.each(['list', 'form', 'inline'] as const)('Product/%s keeps naming data and honest controls after the ports', async (context) => {
    const schema = (await compose({ object: 'Product', context })).schema!;
    const nodes = schemaNodes(schema);
    if (context === 'list') {
      expect(nodes.find((node) => node.component === 'LabelCell')?.props).toMatchObject({ field: 'label', descriptionField: 'description' });
      expect(nodes.find((node) => node.component === 'FilterPanel')?.props?.maxActiveParameter).toBe('maxActiveFilters');
    } else if (context === 'form') {
      const editor = nodes.find((node) => node.component === 'ClassificationEditor')!;
      expect(editor.props?.field).toBe('description');
      expect(editor.bindings?.onChange).toBeUndefined();
    } else {
      expect(nodes.find((node) => node.component === 'SearchInput')?.props?.field).toBe('searchQuery');
      expect(schema.objectSchema?.searchActive.type).toBe('boolean');
    }
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      if (context === 'form') {
        expect(generated.code).toMatch(/description=\{description\}|:description="description"/);
        if (framework === 'react') expect(generated.code).toContain('React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>');
      }
    }
  });

  it.each(['list', 'detail', 'card'] as const)('Organization/%s preserves its ownership and tag data through both generators', async (context) => {
    const schema = (await compose({ object: 'Organization', context })).schema!;
    const nodes = schemaNodes(schema);
    if (context === 'list') expect(nodes.find((node) => node.component === 'OwnerBadge')?.props).toMatchObject({ ownerIdField: 'owner_id', ownerTypeField: 'owner_type' });
    if (context === 'detail') expect(nodes.find((node) => node.component === 'OwnershipSummary')?.props).toMatchObject({ transferredAtField: 'ownership_transferred_at', allowTransferParameter: 'allowTransfer' });
    if (context === 'card') {
      expect(nodes.some((node) => node.component === 'Button')).toBe(false);
      expect(nodes.find((node) => node.component === 'OwnershipMeta')).toBeDefined();
      expect(nodes.find((node) => node.component === 'TagSummary')?.props).toMatchObject({ field: 'tags', countField: 'tag_count' });
      expect(deriveConsumerModel(schema).tags).toEqual(['Consumer tag']);
    }
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      if (context === 'card') expect(generated.code).toMatch(/tags=\{tags\}|:tags="tags"/);
    }
  });

  it.each(['detail', 'form', 'card'] as const)('Subscription/%s preserves lifecycle data and disclosed directives', async (context) => {
    const schema = (await compose({ object: 'Subscription', context })).schema!;
    const nodes = schemaNodes(schema);
    if (context === 'detail') expect(nodes.find((node) => node.component === 'ArchiveSummary')?.props)
      .toMatchObject({ archivedField: 'is_archived', archivedAtField: 'archived_at', reasonField: 'archive_reason', metadataField: 'archive_metadata' });
    if (context === 'form') {
      const form = nodes.find((node) => node.component === 'CancellationForm')!;
      expect(form.props).toMatchObject({ reasonField: 'cancellation_reason', codeField: 'cancellation_reason_code', allowedReasonsParameter: 'allowedReasons' });
      expect(form.bindings).toBeUndefined();
      expect(deriveConsumerModel(schema).cancellationReasonCode).toBe('budget');
    }
    if (context === 'card') {
      for (const component of ['ArchivePill', 'CancellationBadge']) {
        expect(nodes.find((node) => node.component === component)?.props).not.toHaveProperty('label');
      }
      expect(nodes.find((node) => node.component === 'BillingCardMeta')?.props).toMatchObject({ amountField: 'amount', currencyField: 'currency', intervalField: 'billing_interval', minorUnitsParameter: 'minorUnits', minorUnits: 100 });
    }
    for (const framework of ['react', 'vue'] as const) {
      const result = await generate({ schema, framework, profile: 'build' });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      if (context === 'detail') {
        expect(schema.objectSchema?.archived_at.type).toBe('datetime?');
        expect(result.code).toContain('archivedAt?: string | null;');
      }
    }
  });

  it.each(['ArchivePill', 'CancellationBadge'])('%s preserves an authored label while suppressing synthetic state labels', (component) => {
    const schema: UiSchema = { version: '2026.02', objectSchema: { flag: { type: 'boolean', description: 'Technical description' } }, screens: [
      { id: 'implicit', component, props: { field: 'flag' } },
      { id: 'authored', component, props: { field: 'flag', label: 'Authored label' } },
    ] };
    wireFieldProps(schema);
    expect(schema.screens[0]!.props).not.toHaveProperty('label');
    expect(resolveFieldProps(schema.screens[0]!, schema.objectSchema) ?? {}).not.toHaveProperty('label');
    expect(schema.screens[1]!.props?.label).toBe('Authored label');
  });

  it.each([
    ['datetime?', 'string | null'], ['boolean?', 'boolean | null'], ['integer[]?', 'number[] | null'],
  ])('maps nullable trait %s without changing the required flag or source entry', (type, expected) => {
    const entry = { type, required: true };
    expect(mapFieldType(entry)).toBe(expected);
    expect(entry).toEqual({ type, required: true });
    expect(mapFieldType({ type: 'string?', enum: ['a', 'b'] })).toBe("'a' | 'b' | null");
  });

  it('does not treat search-active booleans as editable search query text', () => {
    const schema: UiSchema = { version: '2026.02', objectSchema: {
      searchActive: { type: 'boolean', required: true, semanticType: 'state.search.active' },
      searchQuery: { type: 'string', required: false, semanticType: 'input.search.query' },
    }, screens: [{ id: 'query', component: 'SearchInput' }] };
    wireFieldProps(schema);
    expect(schema.screens[0]!.props?.field).toBe('searchQuery');
    expect(schema.screens[0]!.bindings).toEqual({ onUpdate: 'handleUpdate_searchQuery' });
    expect(schema.objectSchema?.searchActive.type).toBe('boolean');
  });

  it('keeps authored choices and enum semantics, converting only continuous empty Selects', () => {
    const choices = [{ value: '0', label: 'Zero' }, { value: '7', label: 'Seven' }];
    const schema: UiSchema = { version: '2026.02', objectSchema: {
      quantity: { type: 'number', required: true }, status: { type: 'string', required: true, enum: ['active', 'ended'] },
    }, screens: [
      { id: 'continuous', component: 'Select', props: { field: 'quantity' } },
      { id: 'authored', component: 'Select', props: { field: 'quantity', options: choices } },
      { id: 'enum', component: 'Select', props: { field: 'status' } },
    ] };
    wireFieldProps(schema);
    expect(schema.screens[0]).toMatchObject({ component: 'Input', props: { field: 'quantity', type: 'number' }, bindings: { onChange: 'handleChange_quantity' } });
    expect(schema.screens[1]).toMatchObject({ component: 'Select', props: { options: choices } });
    expect(schema.screens[2]).toMatchObject({ component: 'Select', props: { options: [{ value: 'active', label: 'active' }, { value: 'ended', label: 'ended' }] } });
  });

  it.each(['react', 'vue'] as const)('renders real typed zero/nonzero and false/true in generated %s', async (framework) => {
    for (const [object, context] of [...operands.slice(4), ['Subscription', 'card'] as const, ['Subscription', 'detail'] as const]) {
      const schema = (await compose({ object, context })).schema!;
      const result = await generate({ schema, framework, profile: 'build', options: { typescript: true, styling: 'tokens' } });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      const cacheRoot = path.join(repositoryRoot, `packages/components-${framework}/.cache`);
      mkdirSync(cacheRoot, { recursive: true });
      const directory = mkdtempSync(path.join(cacheRoot, 's187-values-'));
      try {
        let source = result.code!;
        if (framework === 'vue') {
          const parsed = compiler.parse(source, { filename: 'GeneratedUI.vue' });
          expect(parsed.errors).toEqual([]);
          source = compiler.compileScript(parsed.descriptor, { id: 's187-values', inlineTemplate: true }).content;
        }
        const sourcePath = path.join(directory, framework === 'react' ? 'GeneratedUI.tsx' : 'GeneratedUI.ts');
        writeFileSync(sourcePath, source);
        esbuild.buildSync({ entryPoints: [sourcePath], outfile: path.join(directory, 'GeneratedUI.cjs'), bundle: true,
          platform: 'node', format: 'cjs', target: 'es2022', jsx: 'automatic', logLevel: 'silent',
          external: ['react', 'react-dom', 'vue', '@oods/components-react', '@oods/components-react/*', '@oods/components-vue', '@oods/components-vue/*'],
        });
        const models = [deriveConsumerModel(schema), deriveConsumerModel(schema)];
        for (const probe of deriveValueProbes(schema, models[1]!).filter((probe) => probe.kind === 'numeric-input' || probe.kind === 'boolean-text')) {
          const key = probe.field.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
          models[1]![key] = probe.kind === 'boolean-text' ? true : 7;
        }
        if (context === 'card') { models[1]!.isArchived = true; models[1]!.cancelAtPeriodEnd = true; }
        if (context === 'detail') models.push({ ...deriveConsumerModel(schema), archivedAt: null });
        const expectedModels = [...models];
        if (framework === 'vue' && result.code!.includes('const generatedProps = defineProps<Props>();')) {
          models.push({});
          expectedModels.push(deriveConsumerModel(schema));
        }
        writeFileSync(path.join(directory, 'render.cjs'), `
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const generated = require('./GeneratedUI.cjs');
const framework = ${JSON.stringify(framework)};
const models = ${JSON.stringify(models)};
const probes = ${JSON.stringify(expectedModels.map((model) => deriveValueProbes(schema, model)))};
const actionNames = ${JSON.stringify(result.artifact!.actions.map(({ name }) => name))};
(async () => {
  for (let i = 0; i < models.length; i++) {
    const props = { ...models[i], actions: Object.fromEntries(actionNames.map(name => [name, () => {}])) };
    const html = framework === 'react'
      ? require('react-dom/server').renderToString(require('react').createElement(generated.GeneratedUI, props))
      : await require('@vue/server-renderer').renderToString(require('vue').createSSRApp(generated.default, props));
    const document = JSDOM.fragment(html);
    if (models[i].archivedAt === null) assert.ok(![...document.querySelectorAll('[data-oods-component=ArchiveSummary] dt')].some(node => node.textContent === 'Archived At'), 'null archive timestamp must omit its date term');
    assert.ok(probes[i].length, 'a typed value must actually be exercised');
    for (const probe of probes[i]) {
      const node = document.querySelector('[id=' + JSON.stringify(probe.nodeId) + ']');
      assert.ok(node, probe.nodeId);
      const target = probe.selector ? node.querySelector(probe.selector) : node;
      assert.ok(target, probe.selector);
      const actual = probe.kind === 'status' ? node.querySelector('[data-timeline-current]').textContent.trim() : probe.kind === 'native-value' ? target.value : probe.kind === 'numeric-input' || probe.kind === 'query-input' ? target.getAttribute('value') : target.textContent.trim();
      assert.equal(actual, probe.expected, probe.field + ' must preserve its typed value');
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
`);
        const rendered = spawnSync('node', [path.join(directory, 'render.cjs')], { encoding: 'utf8' });
        expect(rendered.status, rendered.stderr).toBe(0);
      } finally { rmSync(directory, { recursive: true, force: true }); }
    }
  }, 60_000);

  it('retains authentic fresh schemas and artifact provenance without touching a saved store', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 's187-fresh-generation-'));
    try {
      const freshInputs = [{ object: 'Transaction', context: 'timeline' as const }];
      const result = await runLiveGenerationOnly({ artifactRoot: root, freshInputs, mission: 's187-m01' });
      expect(result.cells).toHaveLength(2);
      const record = JSON.parse(readFileSync(path.join(root, 'live-generation/fresh-Transaction-timeline/composition.json'), 'utf8'));
      expect(record.composition.input).toEqual(freshInputs[0]);
      expect(record.composition.sourceHead).toMatch(/^[a-f0-9]{40}$/);
      expect(record.schema).toEqual((await compose(freshInputs[0]!)).schema);
      for (const cell of result.cells) {
        expect(cell.sourceSchema).toEqual(record.schema);
        expect(cell.composition?.schemaSha256).toBe(record.schemaRef);
        const artifact = JSON.parse(readFileSync(path.join(root, 'live-generation', cell.schema, cell.framework, 'artifact.json'), 'utf8'));
        expect(artifact).toEqual(cell.artifact);
      }
      expect(result.report.schemaStore).toBeNull();
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it('rejects duplicate, non-public, overridden, and mixed fresh/saved operands', async () => {
    const input = { object: 'User', context: 'detail' as const };
    await expect(composeFreshInputs([input, input])).rejects.toThrow('distinct public');
    await expect(composeFreshInputs([{ ...input, object: '../User' }])).rejects.toThrow('distinct public');
    await expect(composeFreshInputs([{ ...input, intent: 'override' } as typeof input])).rejects.toThrow('without overrides');
    await expect(runLiveGenerationOnly({ artifactRoot: '/unused', freshInputs: [input], schemaNames: ['user-detail-showcase'] })).rejects.toThrow('mutually exclusive');
    await expect(runS185M04LiveConsumers({ artifactRoot: '/unused', freshInputs: [input], schemaNames: ['user-detail-showcase'] })).rejects.toThrow('mutually exclusive');
  });
});
