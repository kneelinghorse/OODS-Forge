import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sha256 } from '@oods/artifacts';
import { edgeArrayToNetwork } from '../../src/codegen/chart-assets.js';
import { chartNodes } from '../../src/codegen/chart-declaration.js';
import { workflowSampleRecords } from '../../src/codegen/workflow-data-emitter.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import * as viz from '../../src/tools/viz.render.js';
import { typecheckWorkflow } from './workflow-typecheck.js';
import { wire } from '../helpers/wire-boundary.js';
import { getAjv } from '../../src/lib/ajv.js';
import type { CodeGenerateInput } from '../../src/tools/types.js';
import { renderToString as renderReact } from 'react-dom/server';
import { createElement } from 'react';
const vueRequire = createRequire(new URL('../../../components-vue/package.json', import.meta.url));
const { renderToString: renderVue } = vueRequire('@vue/server-renderer');
const { createSSRApp, h } = vueRequire('vue');
import { VizGraphPreview as ReactGraph } from '@oods/components-react';
import { VizGraphPreview as VueGraph } from '@oods/components-vue';

vi.setConfig({ testTimeout: 60_000 });
afterEach(() => vi.restoreAllMocks());
const edges = { source: 'from', target: 'to', bidirectionalField: 'both' };
const config = JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', skipLibCheck: true, esModuleInterop: true, lib: ['ES2022', 'DOM'], types: ['node'] }, include: ['src/**/*'] });
function retain(name: string, value: unknown) {
  const directory = process.env.S199_GRAPH_RECEIPTS;
  if (!directory) return;
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${name}.json`), JSON.stringify(value, null, 2) + '\n');
}

describe('edge arrays preserve graph meaning', () => {
  it.each([false, true])('bidirectional=%s controls exactly the reverse link', both => {
    const result = edgeArrayToNetwork([{ from: 'z', to: 'a', both }], edges);
    expect(result.nodes).toEqual([{ id: 'a' }, { id: 'z' }]);
    expect(result.links).toEqual([{ source: 'z', target: 'a' }, ...(both ? [{ source: 'a', target: 'z' }] : [])]);
  });
  it('keeps authored link order, deduplicates symmetric pairs and avoids delimiter collisions', () => {
    const rows = [{ from: 'z', to: 'a', both: true }, { from: 'a', to: 'z', both: false }, { from: 'a|b', to: 'c', both: false }, { from: 'a', to: 'b|c', both: false }];
    const result = edgeArrayToNetwork(rows, edges);
    expect(result.links).toEqual([{ source: 'z', target: 'a' }, { source: 'a', target: 'z' }, { source: 'a|b', target: 'c' }, { source: 'a', target: 'b|c' }]);
    expect(result.nodes.map(node => node.id)).toEqual(['a', 'a|b', 'b|c', 'c', 'z']);
    expect(JSON.stringify(edgeArrayToNetwork(structuredClone(rows), edges))).toBe(JSON.stringify(result));
    expect(result.links.every(link => !Object.hasOwn(link, 'value'))).toBe(true);
  });
  it.each([[], [null], [{ from: 'a', both: false }], [{ from: '', to: 'b', both: false }], [{ from: 'a', to: 2, both: false }], [{ from: 'a', to: 'b' }], [{ from: 'a', to: 'b', both: 'true' }]])('fails closed for missing or malformed fields (%j)', rows => {
    expect(() => edgeArrayToNetwork(rows, edges)).toThrow(/Graph/);
  });
  it('an omitted bidirectional field is directed and a symmetric self-link is emitted only once', () => {
    expect(edgeArrayToNetwork([{ from: 'a', to: 'b' }], { source: 'from', target: 'to' }).links).toEqual([{ source: 'a', target: 'b' }]);
    expect(edgeArrayToNetwork([{ from: 'a', to: 'a', both: true }], edges).links).toEqual([{ source: 'a', target: 'a' }]);
  });
});

describe('Relationship graph at the public generated-app boundary', () => {
  it('declares an optional neighborhood and labels its examples synthetic, only on Relationship', async () => {
    const result = await compose({ object: 'Relationship', context: 'detail' });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(result.schema.objectSchema?.neighborhood).toMatchObject({ type: 'array', required: false, description: expect.stringContaining('synthetic') });
    const nodes = chartNodes(result.schema.screens);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ component: 'VizGraphPreview', props: { title: 'Example connected relationships', description: expect.stringContaining('Synthetic') }, chart: { chartType: 'force_graph', source: 'edge-array', dataField: 'neighborhood' } });
    const validate = getAjv().getSchema('https://designlab.local/schemas/repl.ui.schema.json')!;
    expect(validate(result.schema), JSON.stringify(validate.errors)).toBe(true);
    for (const change of [(chart: any) => { delete chart.edges.target; }, (chart: any) => { chart.source = 'record-array'; }, (chart: any) => { chart.edges.value = 'strength'; }, (chart: any) => { chart.sampleRows = []; }]) {
      const invalid = structuredClone(result.schema); change(chartNodes(invalid.screens)[0]!.chart);
      expect(validate(invalid)).toBe(false);
    }
    for (const object of ['Evidence', 'Mission', 'Organization']) expect(chartNodes((await compose({ object, context: 'detail' })).schema.screens).some(node => node.component === 'VizGraphPreview')).toBe(false);
    retain('object-boundary', result);
  });
  for (const context of ['detail', 'workflow'] as const) for (const framework of ['react', 'vue'] as const) {
    it(`${context}/${framework} renders exact record operands into named, stable public SVG assets`, async () => {
      const composition = wire('design.compose', 'output', await compose({ object: 'Relationship', context }));
      expect(composition.status, JSON.stringify(composition.errors)).toBe('ok');
      const nodes = chartNodes(composition.schema.screens);
      expect(nodes).toHaveLength(1);
      const node = nodes[0]!, chart = node.chart!;
      expect(chart.source).toBe('edge-array');
      if (chart.source !== 'edge-array') throw new Error('Expected edge-array');
      const records = workflowSampleRecords(composition.schema);
      const rendered = vi.spyOn(viz, 'handle');
      const request = wire<CodeGenerateInput>('code.generate', 'input', { schema: composition.schema, framework, profile: 'build', options: { theme: 'hc', brand: 'B' } });
      const result = wire('code.generate', 'output', await generate(request));
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      expect(rendered).toHaveBeenCalledTimes(records.length);
      const assets = result.artifact!.files.filter(file => file.path.endsWith('.svg'));
      expect(assets).toHaveLength(records.length);
      for (const [index, record] of records.entries()) {
        const input = rendered.mock.calls[index]![0];
        const output = await rendered.mock.results[index]!.value;
        expect(input.network).toEqual(edgeArrayToNetwork(record.neighborhood, chart.edges));
        expect(input).toMatchObject({ chartType: 'force_graph', theme: 'hc', brand: 'B', name: node.props!.title });
        expect(input).not.toHaveProperty('rows');
        expect(assets[index]).toMatchObject({ path: `src/charts/force_graph-${String(index + 1).padStart(3, '0')}.svg`, contents: output.svg, contentHash: `sha256:${sha256(output.svg!)}` });
        const props = { svg: output.svg, title: String(node.props!.title), description: String(node.props!.description) };
        const markup = framework === 'react' ? renderReact(createElement(ReactGraph, props)) : await renderVue(createSSRApp({ render: () => h(VueGraph, props) }));
        expect(markup).toContain('data-oods-component="VizGraphPreview"');
        expect(markup).toContain('role="img"');
        expect(markup).toContain('aria-label="Example connected relationships"');
        expect(markup).not.toContain('No rendered chart supplied');
      }
      expect(result.code).not.toContain('No rendered chart supplied');
      const checked = typecheckWorkflow(context === 'workflow' ? result.artifact! : { ...result.artifact!, files: [...result.artifact!.files, { path: 'tsconfig.json', contents: config, contentHash: `sha256:${sha256(config)}` }] });
      expect(checked.status, checked.stdout + checked.stderr).toBe(0);
      expect((await generate(request)).artifact).toEqual(result.artifact);
      retain(`${context}-${framework}`, { composition, request, result, records, renderRequests: rendered.mock.calls.slice(0, records.length).map(call => call[0]), checked });
    });
  }
});
