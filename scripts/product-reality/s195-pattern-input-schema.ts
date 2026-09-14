import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Generated enum and recorded input migration: pattern conflicts deliberately
// reach the handler's typed V166 boundary instead of being swallowed by oneOf.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'examples/viz/patterns-v2');
const ids = fs.readdirSync(directory).filter(file => file.endsWith('.spec.json')).map(file => {
  const spec = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
  if (spec.id !== `pattern:viz:${file.slice(0, -'.spec.json'.length)}`) throw new Error(`Pattern spec identity mismatch: ${file}`);
  return spec.id as string;
}).sort();
if (ids.length !== 23 || new Set(ids).size !== ids.length) throw new Error('Exactly 23 distinct pattern source identities required');
const target = path.join(root, 'packages/mcp-server/src/schemas/viz.render.input.json');
const before = fs.readFileSync(target, 'utf8');
const schema = JSON.parse(before);
schema.description = 'Render a real, data-bound visualization. Supply a registered pattern identity to preserve its source data and presentation, chartType + encodings for explicit mode, or rows/datasetRef for suggest or structured-intent mode. Retired patterns return OODS-V174 with reasons; structurally unsupported patterns return OODS-V167; pattern conflicts with explicit data, intent, or source identity/presentation overrides return OODS-V166. Brand, theme and output controls remain available.';
schema.properties.pattern = {
  type: 'string',
  enum: ids,
  description: 'Exact versioned pattern source identity. Renderable patterns preserve source rows, identity, presentation and accessibility metadata. Retired identities return OODS-V174 with reasons. Structurally unsupported scenes return OODS-V167. Static SVG shows the default selection state (OODS-V175). Cannot be combined with chartType, encodings, rows, datasetRef, intent, hierarchy, sankey, chord, network, geo, id, name, description or opacity (OODS-V166).',
};
if (!schema.$defs.nonPatternInput) {
  schema.$defs.nonPatternInput = { oneOf: schema.oneOf, allOf: schema.allOf };
  delete schema.oneOf;
}
schema.allOf = [{ if: { not: { required: ['pattern'] } }, then: { $ref: '#/$defs/nonPatternInput' } }];
const after = JSON.stringify(schema, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (before !== after) throw new Error('viz.render.input.json differs from the generated pattern boundary');
} else fs.writeFileSync(target, after);
