import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const target = path.join(root, 'packages/mcp-server/src/schemas/repl.ui.schema.json');
const schema = JSON.parse(fs.readFileSync(target, 'utf8'));
const viz = JSON.parse(fs.readFileSync(path.join(path.dirname(target), 'viz.render.input.json'), 'utf8'));
const legacy = schema.$defs.chartDeclaration.oneOf?.[0] ?? schema.$defs.chartDeclaration;
const remap = (value: unknown) => JSON.parse(JSON.stringify(value).replaceAll('#/$defs/encodingBinding', '#/$defs/chartEncodingBinding').replaceAll('#/$defs/colorEncodingBinding', '#/$defs/chartColorEncodingBinding'));
schema.$defs.chartEncodingBinding = { title: 'ChartEncodingBinding', ...remap(viz.$defs.encodingBinding) };
schema.$defs.chartColorEncodingBinding = { title: 'ChartColorEncodingBinding', ...remap(viz.$defs.colorEncodingBinding) };
schema.$defs.chartDeclaration = {
  title: 'ChartDeclaration',
  description: 'Read-only chart rendered by public viz.render during code generation. Payment events retain the Subscription projection. Record-array charts bind a declared object array and use authored sampleRows to seed generated sample records, with no separate generated chart series. Edge-array charts bind a declared neighborhood array: sorted distinct node ids, row-ordered directed links, optional bidirectional reverse links deduplicated by ordered pair, without numeric values or groups. Static SVG assets are keyed by seed record identity; consumers can replace the typed svg prop. One distinct chart declaration is supported per generated object; repeated identical projections share the same asset.',
  oneOf: [legacy, {
    type: 'object',
    additionalProperties: false,
    required: ['chartType', 'source', 'dataField', 'encodings', 'sampleRows'],
    properties: {
      chartType: { enum: ['bar', 'line', 'area', 'scatter', 'heatmap'] },
      source: { const: 'record-array' },
      dataField: { type: 'string', minLength: 1, description: 'Declared objectSchema array field containing the chart rows.' },
      encodings: { ...remap(viz.properties.encodings), required: ['x', 'y'] },
      sampleRows: { type: 'array', minItems: 1, items: { type: 'object', minProperties: 1, additionalProperties: true }, description: 'Authored sample rows, including explicitly labelled synthetic examples, copied into the declared array field of generated sample records. These exact records supply public viz.render; no separate synthetic chart series is invented.' },
      brand: { enum: ['A', 'B'] },
    },
  }, {
    type: 'object', additionalProperties: false,
    required: ['chartType', 'source', 'dataField', 'edges', 'sampleRows'],
    properties: {
      chartType: { const: 'force_graph' }, source: { const: 'edge-array' },
      dataField: { type: 'string', minLength: 1, description: 'Declared objectSchema neighborhood array containing edge records.' },
      edges: { type: 'object', additionalProperties: false, required: ['source', 'target'], properties: {
        source: { type: 'string', minLength: 1 }, target: { type: 'string', minLength: 1 },
        bidirectionalField: { type: 'string', minLength: 1, description: 'When declared, every row must contain this boolean; true also emits the reverse directed link.' },
      } },
      sampleRows: { type: 'array', minItems: 1, items: { type: 'object', minProperties: 1, additionalProperties: true }, description: 'Authored, explicitly labelled synthetic neighborhood examples copied to the declared object field.' },
      brand: { enum: ['A', 'B'] },
    },
  }],
};
function writeOrCheck(filename: string, value: unknown) {
  const bytes = JSON.stringify(value, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (bytes !== fs.readFileSync(filename, 'utf8')) throw new Error(`Chart declaration schema drift: ${filename}`);
  } else fs.writeFileSync(filename, bytes);
}
writeOrCheck(target, schema);
for (const [mark, chartType] of Object.entries({ area: 'area', bar: 'bar', line: 'line', point: 'scatter', rect: 'heatmap', graph: 'force_graph' })) {
  const filename = path.join(root, `schemas/traits/mark-${mark}.parameters.schema.json`);
  const parameters = mark === 'graph' ? { $schema: 'https://json-schema.org/draft/2020-12/schema', $id: 'https://oods.systems/schemas/traits/mark-graph', title: 'MarkGraph Trait Parameters', type: 'object', additionalProperties: false, properties: { previewSvg: { type: 'string', description: 'Static SVG returned by public viz.render.' } } } as any : JSON.parse(fs.readFileSync(filename, 'utf8'));
  const declaration = structuredClone(schema.$defs.chartDeclaration);
  const traitName = `Mark${mark[0].toUpperCase()}${mark.slice(1)}`;
  declaration.title = `${traitName}ChartDeclaration`;
  declaration.oneOf = declaration.oneOf.filter((branch: any) => mark === 'graph' ? branch.properties.source.const === 'edge-array' : branch.properties.source.const !== 'edge-array' && (chartType === 'area' || branch.properties.source.const !== 'payment-events'));
  for (const branch of declaration.oneOf) branch.properties.chartType = { const: chartType };
  parameters.properties.chart = declaration;
  parameters.properties.title = { type: 'string', description: 'Title of the read-only chart projection.' };
  parameters.properties.description = { type: 'string', description: 'Accessible description of the read-only chart projection.' };
  parameters.$defs = {
    ...parameters.$defs,
    chartEncodingBinding: { ...schema.$defs.chartEncodingBinding, title: `${traitName}ChartEncodingBinding` },
    chartColorEncodingBinding: { ...schema.$defs.chartColorEncodingBinding, title: `${traitName}ChartColorEncodingBinding` },
  };
  writeOrCheck(filename, parameters);
}
