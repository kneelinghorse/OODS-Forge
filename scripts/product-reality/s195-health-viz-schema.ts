import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Record the s195-m02 additive output migration; schemas are never edited by hand.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const target = path.join(root, 'packages/mcp-server/src/schemas/health.output.json');
const before = fs.readFileSync(target, 'utf8');
const schema = JSON.parse(before);
const fields = ['types', 'patterns', 'families', 'classified', 'coreCells', 'coreSurfaceComplete', 'typedGaps'];
const productReality = schema.properties.productReality;
productReality.required = [...new Set([...productReality.required, 'viz'])];
productReality.properties.viz = {
  description: 'Generated visualization taxonomy and Core Analytics Profile census. Surface-complete cells have public SVG backing; typed gaps retain reasons in the taxonomy. Counts do not imply certification. Null when the taxonomy is missing or invalid.',
  type: ['object', 'null'],
  additionalProperties: false,
  required: fields,
  properties: Object.fromEntries(fields.map(field => [field, { type: 'integer', minimum: 0 }])),
};
const after = JSON.stringify(schema, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (before !== after) throw new Error('health.output.json differs from the s195 viz schema migration');
} else fs.writeFileSync(target, after);
