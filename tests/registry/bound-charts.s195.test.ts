import { readFileSync } from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { applyTraitParameters } from '../../src/registry/parameter-applier.js';
import { TraitLoader } from '../../src/registry/trait-loader.js';
import { TraitResolver } from '../../src/registry/resolver.js';
import type { ObjectDefinition } from '../../src/registry/object-definition.js';
import type { TraitDefinition } from '../../src/core/trait-definition.js';

const marks = [
  ['MarkArea', 'area', 'VizAreaPreview'],
  ['MarkBar', 'bar', 'VizMarkPreview'],
  ['MarkLine', 'line', 'VizLinePreview'],
  ['MarkPoint', 'scatter', 'VizPointPreview'],
  ['MarkRect', 'heatmap', 'VizHeatmapPreview'],
] as const;
const loader = () => new TraitLoader({ roots: [path.resolve('traits')] });
const chartFor = (chartType: string) => ({ chartType, source: 'record-array', dataField: 'readings', encodings: { x: { field: 'period' }, y: { field: 'value' } }, sampleRows: [{ period: 'Jan', value: 12 }] });

describe('bound chart projection preserves authored context and data intent', () => {
  it.each(marks)('%s projects a real %s preview without importing standalone controls or synthetic fields', async (name, type, component) => {
    const resolver = new TraitResolver({ loader: loader() });
    const [bound] = await resolver.resolveReferences([{ name: `viz/${name}`, parameters: { chart: chartFor(type), title: 'Authored title', description: 'Authored units' } }]);
    expect(bound.definition.schema).toEqual({});
    expect(bound.definition.semantics).toEqual({});
    expect(bound.definition.dependencies).toEqual([]);
    expect(bound.definition.view_extensions!.detail).toEqual([{ component, position: 'top', priority: 55, props: { chart: chartFor(type), title: 'Authored title', description: 'Authored units' } }]);
    expect(Object.keys(bound.definition.view_extensions!)).toEqual(['MarkBar', 'MarkLine'].includes(name) ? ['detail', 'dashboard'] : ['detail']);
    expect(bound.definition.view_extensions!.form).toBeUndefined();
    expect(bound.definition.view_extensions!.list).toBeUndefined();
    const [standalone] = await resolver.resolveReferences([{ name: `viz/${name}` }]);
    expect(standalone.definition.view_extensions!.form).toBeDefined();
    expect(standalone.definition.view_extensions!.detail![0].props).not.toHaveProperty('chart');
    expect(standalone.definition.schema).not.toHaveProperty('readings');
  });

  it('projects dashboard only when that context is authored, without mutating the source trait', () => {
    const definition: TraitDefinition = { trait: { name: 'MarkLine', version: '1.0.0' }, schema: { control: { type: 'string' } }, view_extensions: { detail: [], dashboard: [{ component: 'VizLinePreview' }], form: [] } };
    const before = structuredClone(definition);
    const result = applyTraitParameters(definition, { chart: chartFor('line'), title: 'Trend' }, { validate: false });
    expect(Object.keys(result.definition.view_extensions!)).toEqual(['detail', 'dashboard']);
    expect(result.definition.view_extensions!.dashboard).toEqual(result.definition.view_extensions!.detail);
    expect(definition).toEqual(before);
    delete definition.view_extensions!.dashboard;
    expect(applyTraitParameters(definition, { chart: chartFor('line') }, { validate: false }).definition.view_extensions).not.toHaveProperty('dashboard');
  });

  it('fails loudly for an unknown bound Mark and mismatched pixels even if schema validation is disabled', () => {
    const definition: TraitDefinition = { trait: { name: 'MarkFuture', version: '1.0.0' }, schema: {} };
    expect(() => applyTraitParameters(definition, { chart: chartFor('bar') }, { validate: false })).toThrow('no supported preview projection');
    definition.trait.name = 'MarkLine';
    expect(() => applyTraitParameters(definition, { chart: chartFor('bar') }, { validate: false })).toThrow('requires chartType "line"');
    expect(() => applyTraitParameters(definition, { chart: 'bar' }, { validate: false })).toThrow('requires chartType "line"');
  });

  it.each(marks)('%s rejects a declaration whose chart type disagrees with the mark', async (name, type) => {
    const resolver = new TraitResolver({ loader: loader() });
    await expect(resolver.resolveReferences([{ name: `viz/${name}`, parameters: { chart: chartFor(type === 'bar' ? 'line' : 'bar') } }])).rejects.toThrow();
  });

  it.each(['area', 'bar', 'line', 'point', 'rect'])('keeps %s TypeScript and YAML bound parameter declarations synchronized', async (name) => {
    const yaml = load(readFileSync(`traits/viz/mark-${name}.trait.yaml`, 'utf8')) as TraitDefinition;
    const ts = (await import(`../../traits/viz/mark-${name}.trait.ts`)).default as TraitDefinition;
    const boundParameters = (definition: TraitDefinition) => definition.parameters?.filter((parameter) => ['chart', 'title', 'description'].includes(parameter.name));
    expect(boundParameters(ts)).toEqual(boundParameters(yaml));
  });

  it.each([
    ['Invoice', 'MarkBar', 'line_items', 'InvoiceLineItem[]', 'invoice', 'line_items'],
    ['Usage', 'MarkLine', 'samples', 'UsageSample[]', 'usage', 'samples'],
  ])('%s charts its actual declared %s data and preserves authored sample provenance exactly', async (name, mark, field, type, fixtureObject, fixtureField) => {
    const object = load(readFileSync(`domains/saas-billing/objects/${name}.object.yaml`, 'utf8')) as ObjectDefinition;
    const metered = load(readFileSync('domains/saas-billing/traits/metered.trait.yaml', 'utf8')) as TraitDefinition;
    expect((object.schema?.[field] ?? metered.schema[field]).type).toBe(type);
    const reference = object.traits!.find((item) => item.name === `viz/${mark}`)!;
    const [trait] = await new TraitResolver({ loader: loader() }).resolveReferences([reference]);
    expect(trait).toBeDefined();
    const chart = trait.parameters.chart as ReturnType<typeof chartFor>;
    const source = JSON.parse(readFileSync(`domains/saas-billing/examples/${name === 'Usage' ? 'usage-api-calls' : 'stripe'}.json`, 'utf8'));
    expect(chart.dataField).toBe(field);
    expect(chart.sampleRows).toEqual(source[fixtureObject][fixtureField]);
    expect(trait.parameters.title).toBe(name === 'Invoice' ? 'Invoice line item amounts' : 'Example API-call usage');
    if (name === 'Invoice') {
      expect(chart.encodings.y).toEqual({ field: 'amount_minor', aggregate: 'sum', title: 'Amount (minor units)' });
      expect(trait.parameters.description).toContain('minor currency units');
    } else {
      expect(chart.encodings.x).toEqual({ field: 'timestamp', scale: 'temporal', title: 'Recorded at' });
      expect(chart.encodings.y).toEqual({ field: 'value', title: 'API calls' });
      expect(source.usage.unit_label).toBe('api_calls');
      expect(trait.parameters.description).toContain('Synthetic API-call');
      expect(object.traits!.find((item) => item.name === 'SaaSBillingMetered')?.parameters?.unit).toBe('api_calls');
    }
  });
});
