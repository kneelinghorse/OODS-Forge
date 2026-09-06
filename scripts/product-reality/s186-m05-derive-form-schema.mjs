#!/usr/bin/env node
// Sprint 186 m05: derive the user-form-showcase live-cell subject from the frozen
// saved schema by pruning the composer-authored controls bound to array or object
// fields. The saved record is never modified; the derived record carries its
// provenance so no proof over it can be read as the saved schema's.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [root = process.cwd(), outputDir = 'artifacts/product-reality/sprint-186/m05/derived-store'] = process.argv.slice(2);
const SAVED_STORE = 'artifacts/product-reality/sprint-183/m04/saved-schema-store';
const NAME = 'user-form-showcase';
/** Composer field-kind defects carried by name (see the m05 decision memo entry). */
export const CARRIED_NODES = Object.freeze([
  { nodeId: 'slot-field-3-13', component: 'Input', field: 'address_roles', kind: 'array' },
  { nodeId: 'slot-field-5-17', component: 'Input', field: 'preference_document', kind: 'unknown' },
  { nodeId: 'slot-field-6-19', component: 'DatePicker', field: 'state_history', kind: 'array' },
  { nodeId: 'slot-field-8-23', component: 'Input', field: 'tags', kind: 'array' },
  { nodeId: 'slot-field-9-25', component: 'Input', field: 'tag_metadata', kind: 'array' },
]);

const savedPath = path.join(root, SAVED_STORE, `${NAME}.json`);
const savedBytes = fs.readFileSync(savedPath);
const saved = JSON.parse(savedBytes.toString('utf8'));
const ids = new Set(CARRIED_NODES.map(({ nodeId }) => nodeId));
const seen = [];
const prune = (nodes) => nodes.filter((node) => {
  if (ids.has(node.id)) { seen.push(node.id); return false; }
  return true;
}).map((node) => (node.children ? { ...node, children: prune(node.children) } : node));
const schema = { ...saved.schema, screens: prune(saved.schema.screens) };
if (seen.length !== ids.size) throw new Error(`Pruned ${seen.length} of ${ids.size} carried nodes: ${seen.join(', ')}`);

const derived = {
  ...saved,
  schemaRef: `${saved.schemaRef}#pruned-composer-field-kind-defects`,
  schema,
  derivation: {
    kind: 'saved-schema-pruned-of-carried-composer-defects',
    mission: 's186-m05',
    derivedFrom: { store: SAVED_STORE, name: NAME, schemaRef: saved.schemaRef, sha256: createHash('sha256').update(savedBytes).digest('hex') },
    prunedNodeIds: [...ids],
    prunedNodes: CARRIED_NODES,
    reason: 'The composer bound plain Input and DatePicker controls to array and object fields; code.generate refuses those five nodes with OODS-V007 field-kind errors that no component port can repair. The derivation proves the six ported components live in the same form; it is not evidence that the saved schema generates.',
    derivedBy: path.relative(root, new URL(import.meta.url).pathname),
  },
};
const outPath = path.join(root, outputDir, `${NAME}.json`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(derived, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, outPath), pruned: [...ids], derivedFromSha256: derived.derivation.derivedFrom.sha256 }, null, 2));
