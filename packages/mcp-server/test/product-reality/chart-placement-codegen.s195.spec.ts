import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sha256 } from '@oods/artifacts';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import * as viz from '../../src/tools/viz.render.js';
import { chartNodes } from '../../src/codegen/chart-declaration.js';
import { workflowSampleRecords } from '../../src/codegen/workflow-data-emitter.js';
import { typecheckWorkflow } from './workflow-typecheck.js';
import { wire, repositoryRoot } from '../helpers/wire-boundary.js';
import { getAjv } from '../../src/lib/ajv.js';
import { CASES, SALES } from '../../src/tools/__fixtures__/cartesian-render.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import type { CodeGenerateInput } from '../../src/tools/types.js';
import { PLACED_CHART_NARROW_OUTPUT, PLACED_CHART_OUTPUT, narrowChartPath } from '../../src/codegen/chart-assets.js';

vi.setConfig({ testTimeout: 60_000 });
afterEach(() => vi.restoreAllMocks());
const provider = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'domains/saas-billing/examples/stripe.json'), 'utf8'));
const usageExample = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'domains/saas-billing/examples/usage-api-calls.json'), 'utf8'));
const placements = [
  { object: 'Invoice', chartType: 'bar', component: 'VizMarkPreview', dataField: 'line_items', rows: provider.invoice.line_items, source: 'domains/saas-billing/examples/stripe.json' },
  { object: 'Usage', chartType: 'line', component: 'VizLinePreview', dataField: 'samples', rows: usageExample.usage.samples, source: 'domains/saas-billing/examples/usage-api-calls.json' },
] as const;
type ArrayChart = Extract<NonNullable<UiElement['chart']>, { source: 'record-array' }>;
const previews: Record<string, string> = { bar: 'VizMarkPreview', line: 'VizLinePreview', area: 'VizAreaPreview', scatter: 'VizPointPreview', heatmap: 'VizHeatmapPreview' };
const config = JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', skipLibCheck: true, esModuleInterop: true, lib: ['ES2022', 'DOM'], types: ['node'] }, include: ['src/**/*'] });
function retain(name: string, value: unknown) {
  if (!process.env.S195_CHART_RECEIPTS) return;
  fs.mkdirSync(process.env.S195_CHART_RECEIPTS, { recursive: true });
  fs.writeFileSync(path.join(process.env.S195_CHART_RECEIPTS, `${name}.json`), JSON.stringify(value, null, 2) + '\n');
}
function tabular(index = 0): UiSchema {
  const { chartType, encodings } = CASES[index]!;
  return { version: '2026.02', objectSchema: { measurements: { type: 'array', required: true } }, screens: [{ id: 'chart', component: previews[chartType]!, props: { title: `${chartType} measurements`, description: 'Recorded sales measurements.' }, chart: { chartType: chartType as ArrayChart['chartType'], source: 'record-array', dataField: 'measurements', encodings: structuredClone(encodings) as ArrayChart['encodings'], sampleRows: [{ ...SALES[0] }, ...SALES.slice(1).map(row => ({ ...row }))] } }] } as UiSchema;
}

describe('declared charts use actual records and public SVG (s195-m06)', () => {
  for (const placement of placements) {
    it.each(['html', 'react', 'vue'] as const)(`${placement.object} detail %s carries authored rows and unchanged public pixels`, async framework => {
      const composition = wire('design.compose', 'output', await compose(wire('design.compose', 'input', { object: placement.object, context: 'detail' })));
      expect(composition.status, JSON.stringify(composition.errors)).toBe('ok');
      const original = structuredClone(composition.schema);
      const nodes = chartNodes(composition.schema.screens);
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({ component: placement.component, chart: { source: 'record-array', chartType: placement.chartType, dataField: placement.dataField, sampleRows: placement.rows } });
      const rows = workflowSampleRecords(composition.schema)[0]![placement.dataField];
      expect(rows).toEqual(placement.rows);
      expect(workflowSampleRecords(composition.schema)[0]).not.toHaveProperty('payment_history');
      // The full detail HTML Tabs normalization limitation predates these chart projections.
      // Test the complete authored chart node at the HTML boundary, preserving its object schema.
      if (framework === 'html') composition.schema.screens = [nodes[0]!, ...nodes.slice(1)];
      const rendered = vi.spyOn(viz, 'handle');
      const request = wire<CodeGenerateInput>('code.generate', 'input', { schema: composition.schema, framework, profile: 'build', options: { theme: 'dark', brand: 'B' } });
      const result = wire('code.generate', 'output', await generate(request));
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      // Sprint 202 m01: the design-size render and the narrow render, both without a painted title.
      expect(rendered).toHaveBeenCalledTimes(2);
      const renderRequest = wire('viz.render', 'input', rendered.mock.calls[0]![0]);
      const publicOutput = wire('viz.render', 'output', await rendered.mock.results[0]!.value);
      const narrowOutput = wire('viz.render', 'output', await rendered.mock.results[1]!.value);
      // The wired request carries the boundary defaults; the producer's own output block is the placed-chart one.
      expect(renderRequest.output).toMatchObject(PLACED_CHART_OUTPUT);
      expect(rendered.mock.calls[1]![0].output).toMatchObject(PLACED_CHART_NARROW_OUTPUT);
      expect(rendered.mock.calls[1]![0].rows).toEqual(rows);
      expect(renderRequest).toMatchObject({ rows, chartType: placement.chartType, theme: 'dark', brand: 'B', name: nodes[0]!.props!.title, description: nodes[0]!.props!.description, encodings: nodes[0]!.chart!.source === 'record-array' ? nodes[0]!.chart!.encodings : undefined });
      const asset = result.artifact!.files.find(file => file.path === `src/charts/${placement.chartType}-001.svg`)!;
      expect(asset.contents).toBe(publicOutput.svg);
      expect(asset.contentHash).toBe(`sha256:${sha256(publicOutput.svg!)}`);
      expect(asset.contents).toContain('role="graphics-object"');
      expect(asset.contents).not.toContain('role-title-text');
      const narrowAsset = result.artifact!.files.find(file => file.path === narrowChartPath(asset.path))!;
      expect(narrowAsset.contents).toBe(narrowOutput.svg);
      expect(narrowAsset.contents).toMatch(/viewBox="0 0 370 230"/);
      expect(result.code).not.toContain('No rendered chart supplied');
      if (framework === 'html') {
        expect(result.code).toContain(asset.contents);
        expect(result.code).toContain('data-viz-rendered="true"');
        expect(result.code).toContain(`aria-label="${nodes[0]!.props!.title}"`);
      } else {
        expect(result.code).toContain('svg?: string;');
        expect(result.code).toContain('svg ??');
        const checked = typecheckWorkflow({ ...result.artifact!, files: [...result.artifact!.files, { path: 'tsconfig.json', contents: config, contentHash: `sha256:${sha256(config)}` }] });
        expect(checked.status, checked.stdout + checked.stderr).toBe(0);
      }
      expect((await generate(request)).artifact).toEqual(result.artifact);
      expect(original).toEqual(framework === 'html' ? { ...composition.schema, screens: original.screens } : composition.schema);
      retain(`${placement.object}-${framework}`, { request, renderRequest, publicOutput, result, source: placement.source, authoredRows: placement.rows });
    });

    it.each(['react', 'vue'] as const)(`${placement.object} workflow %s keys static SVG to real seeded records`, async framework => {
      const composition = await compose({ object: placement.object, context: 'workflow' });
      expect(composition.status, JSON.stringify(composition.errors)).toBe('ok');
      const rendered = vi.spyOn(viz, 'handle');
      const request = wire<CodeGenerateInput>('code.generate', 'input', { schema: composition.schema, framework, profile: 'build' });
      const result = wire('code.generate', 'output', await generate(request));
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      const records = workflowSampleRecords(composition.schema);
      expect(rendered).toHaveBeenCalledTimes(records.length * 2);
      for (const [index, record] of records.entries()) {
        expect(rendered.mock.calls[index * 2]![0].rows).toEqual(record[placement.dataField]);
        expect(rendered.mock.calls[index * 2 + 1]![0].output).toMatchObject(PLACED_CHART_NARROW_OUTPUT);
        expect(rendered.mock.calls[index * 2 + 1]![0].rows).toEqual(record[placement.dataField]);
        expect(record[placement.dataField]).toEqual(placement.rows);
        expect(record).not.toHaveProperty('payment_history');
      }
      const files = result.artifact!.files;
      expect(files.filter(file => file.path.endsWith('.svg'))).toHaveLength(records.length * 2);
      expect(files.find(file => file.path === 'src/store.ts')!.contents).toContain('svg: chartSvgByRecord[String(record[idField])]');
      expect(files.find(file => file.path === 'src/store.ts')!.contents).toContain('svgNarrow: chartSvgNarrowByRecord[String(record[idField])]');
      expect(files.find(file => file.path === 'src/store.ts')!.contents).not.toContain('payment_history:');
      expect(files.find(file => file.path === 'src/sample-data.ts')!.contents).toContain(JSON.stringify(placement.rows[0].timestamp ?? placement.rows[0].description));
      const checked = typecheckWorkflow(result.artifact!);
      expect(checked.status, checked.stdout + checked.stderr).toBe(0);
      retain(`${placement.object}-workflow-${framework}`, { request, result, records });
    });
  }

  it.each(CASES.map((item, index) => ({ ...item, index })))('all admitted $chartType record arrays draw the canonical mark', async ({ index, svgMark }) => {
    const request = wire<CodeGenerateInput>('code.generate', 'input', { schema: tabular(index), framework: 'html', profile: 'build' });
    const result = wire('code.generate', 'output', await generate(request));
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(result.code).toContain(`mark-${svgMark}`);
    expect(result.code).toContain('data-viz-rendered="true"');
  });

  it('repeated identical detail/dashboard projections share one render and presentation', async () => {
    const schema = tabular();
    const duplicate = structuredClone(schema.screens[0]!);
    duplicate.chart = Object.fromEntries(Object.entries(duplicate.chart!).reverse()) as typeof duplicate.chart;
    schema.screens.push({ ...duplicate, id: 'dashboard-chart' });
    const rendered = vi.spyOn(viz, 'handle');
    const result = await generate({ schema, framework: 'html', profile: 'build' });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(rendered).toHaveBeenCalledTimes(2);
    expect(result.code.match(/data-viz-rendered="true"/g)).toHaveLength(2);
    expect(result.artifact!.files.filter(file => file.path.endsWith('.svg'))).toHaveLength(2);
  });

  it.each([
    { name: 'missing object field', change: (schema: UiSchema) => { delete schema.objectSchema!.measurements; }, error: 'absent from objectSchema' },
    { name: 'scalar data field', change: (schema: UiSchema) => { schema.objectSchema!.measurements!.type = 'string'; }, error: 'declared array' },
    { name: 'missing encoded field', change: (schema: UiSchema) => { const chart = schema.screens[0]!.chart!; if (chart.source === 'record-array') chart.encodings.x = 'absent'; }, error: "encoding field 'absent'" },
    { name: 'mismatched preview', change: (schema: UiSchema) => { schema.screens[0]!.component = 'VizLinePreview'; }, error: 'does not match preview' },
    { name: 'different declarations', change: (schema: UiSchema) => { schema.screens.push({ ...tabular(1).screens[0]!, id: 'other' }); }, error: 'one distinct chart' },
    { name: 'different presentation', change: (schema: UiSchema) => { const copy = structuredClone(schema.screens[0]!); copy.id = 'other'; copy.props!.title = 'Different meaning'; schema.screens.push(copy); }, error: 'one distinct chart' },
  ])('rejects $name without publishing placeholder pixels', async ({ change, error }) => {
    const schema = tabular(); change(schema);
    const request = wire<CodeGenerateInput>('code.generate', 'input', { schema, framework: 'react', profile: 'build' });
    const result = wire('code.generate', 'output', await generate(request));
    expect(result.status).toBe('error');
    expect(result.artifact).toBeUndefined();
    expect(result.errors?.[0]).toMatchObject({ code: 'OODS-N016', message: expect.stringContaining(error) });
    retain(`invalid-${error.replace(/[^a-z]+/gi, '-')}`, { request, result });
  });

  it('rejects invented operands at AJV and renderer failures at the handler', async () => {
    const validator = getAjv().getSchema('https://designlab.local/schemas/repl.ui.schema.json');
    expect(validator).toBeTypeOf('function');
    for (const change of [
      (chart: any) => { chart.chartType = 'force_graph'; },
      (chart: any) => { delete chart.sampleRows; },
      (chart: any) => { chart.sampleRows = []; },
      (chart: any) => { chart.source = 'invented'; },
      (chart: any) => { delete chart.encodings.y; },
      (chart: any) => { chart.encodings.x = { field: 'region', madeUp: true }; },
    ]) {
      const schema = tabular(); change(schema.screens[0]!.chart);
      expect(validator(schema), JSON.stringify(validator.errors)).toBe(false);
    }
    vi.spyOn(viz, 'handle').mockResolvedValue({ status: 'error', errors: [{ code: 'OODS-V165', message: 'Injected actual renderer failure' }] } as Awaited<ReturnType<typeof viz.handle>>);
    const result = await generate({ schema: tabular(), framework: 'vue', profile: 'build' });
    expect(result.status).toBe('error');
    expect(result.artifact).toBeUndefined();
    expect(result.errors?.[0]?.message).toContain('OODS-V165');
  });

  it.each(['react', 'vue'] as const)('legacy Subscription %s HC asset bytes follow the recorded UTC, palette and frame migrations', async framework => {
    const source = `artifacts/product-reality/sprint-195/m05/hc/boundary/codegen-${framework}.json`;
    const previousBytes = fs.readFileSync(path.join(repositoryRoot, source), 'utf8');
    const previous = JSON.parse(previousBytes);
    const migrationRoot = 'artifacts/product-reality/sprint-196/m05/placement';
    const migration = JSON.parse(fs.readFileSync(path.join(repositoryRoot, migrationRoot, 'migration.json'), 'utf8'));
    const { schema } = await compose({ object: 'Subscription', context: 'detail' });
    const result = await generate({ schema, framework, profile: 'build', options: { theme: 'hc', brand: 'A' } });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    const before = previous.result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
    const after = result.artifact!.files.filter(file => file.path.endsWith('.svg'));
    expect(after.map(file => file.path).sort()).toEqual(before.flatMap((file: any) => [file.path, narrowChartPath(file.path)]).sort());
    for (const asset of after.filter(file => !file.path.endsWith('.narrow.svg'))) {
      const prior = before.find((file: any) => file.path === asset.path);
      const receipt = migration.rows.find((row: any) => row.source === source && row.path === asset.path);
      expect(receipt).toMatchObject({ case: `Subscription-detail-${framework}`, beforeHash: prior.contentHash, sourceSha256: `sha256:${sha256(previousBytes)}`, sameOperand: true, crossTimezoneEqual: true, changed: true });
      const current = fs.readFileSync(path.join(repositoryRoot, migrationRoot, receipt.utcRaw), 'utf8');
      expect(`sha256:${sha256(current)}`).toBe(receipt.afterHash);
      const paletteRoot = 'artifacts/product-reality/sprint-197/m05/consumers';
      const palette = JSON.parse(fs.readFileSync(path.join(repositoryRoot, paletteRoot, 'migration.json'), 'utf8'));
      const moved = palette.placements.find((row: any) => row.case === `Subscription-detail-${framework}` && row.path === asset.path);
      expect(moved).toMatchObject({ beforeHash: receipt.afterHash, sameOperand: true, source });
      const pixels = fs.readFileSync(path.join(repositoryRoot, paletteRoot, moved.raw), 'utf8');
      expect(moved.afterHash).toBe(`sha256:${sha256(pixels)}`);
      // Sprint 200 m02: the placed frame grew to 720x400 once; the migration chains from the palette layer.
      const resizedRoot = 'artifacts/product-reality/sprint-200/m02/placement';
      const resized = JSON.parse(fs.readFileSync(path.join(repositoryRoot, resizedRoot, 'migration.json'), 'utf8'));
      const grown = resized.placements.find((row: any) => row.case === `Subscription-detail-${framework}-hc` && row.path === asset.path);
      expect(grown).toMatchObject({ beforeHash: moved.afterHash, sameOperand: true, chainedFrom: `${paletteRoot}/migration.json`, beforeWidth: 370, afterWidth: 730, changed: true });
      const frame = fs.readFileSync(path.join(repositoryRoot, resizedRoot, grown.raw), 'utf8');
      expect(grown.afterHash).toBe(`sha256:${sha256(frame)}`);
      // Sprint 202 m01: the title band left the SVG for the figure heading and a narrow render joined it; the migration chains from the frame layer.
      const figureRoot = 'artifacts/product-reality/sprint-202/m01/placement';
      const figure = JSON.parse(fs.readFileSync(path.join(repositoryRoot, figureRoot, 'migration.json'), 'utf8'));
      const untitled = figure.placements.find((row: any) => row.case === `Subscription-detail-${framework}-hc` && row.path === asset.path);
      expect(untitled).toMatchObject({ beforeHash: grown.afterHash, sameOperand: true, chainedFrom: `${resizedRoot}/migration.json`, beforeWidth: 730, afterWidth: 730, titleInSvgBefore: true, titleInSvgAfter: false, changed: true, narrow: { path: narrowChartPath(asset.path), width: 370 } });
      const untitledBytes = fs.readFileSync(path.join(repositoryRoot, figureRoot, untitled.raw), 'utf8');
      expect(untitled.afterHash).toBe(`sha256:${sha256(untitledBytes)}`);
      expect(asset).toEqual({ ...prior, contents: untitledBytes, contentHash: untitled.afterHash });
      const narrowAsset = after.find(file => file.path === untitled.narrow.path)!;
      expect(narrowAsset.contentHash).toBe(untitled.narrow.afterHash);
      expect(narrowAsset.contents).toBe(fs.readFileSync(path.join(repositoryRoot, figureRoot, untitled.narrow.raw), 'utf8'));
    }
    retain(`legacy-${framework}`, { before, after, unchanged: false, migration: `${migrationRoot}/migration.json` });
  });
});
