import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../packages/mcp-server/src/tools/code.generate.js';
const base = JSON.parse(execFileSync('git', ['show', 'b7a96ab0f:packages/mcp-server/registry/runtime-cells.v1.json'], { maxBuffer: 32 * 1024 * 1024 }).toString());
const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const m01 = read('artifacts/product-reality/sprint-199/m01/runtime/runtime-cells.v1.json');
const m06 = read('artifacts/product-reality/sprint-199/m06/runtime-final/runtime-cells.v1.json');
const identity = (row: any) => `${row.object}/${row.context}/${row.framework}`;
const measured = new Map([...m01.rows, ...m06.rows].map(row => [identity(row), row]));
const rows = [];
for (const old of base.rows) {
  const composed = await compose({ object: old.object, context: old.context });
  assert.equal(composed.status, 'ok');
  const result = await generate({ schema: composed.schema, framework: old.framework, profile: 'build', ...(old.context === 'workflow' ? {} : { options: { styling: 'tokens', typescript: true } }) });
  assert.equal(result.status, 'ok', JSON.stringify(result.errors));
  const prior = measured.get(identity(old));
  rows.push({ id: identity(old), beforeLedgerHash: old.artifactHash, currentHash: result.artifact!.contentHash, equalToBaseLedger: old.artifactHash === result.artifact!.contentHash,
    ...(prior ? { scopedReceipt: prior.report, equalToScopedMeasurement: prior.artifactHash === result.artifact!.contentHash } : {}) });
}
const report = { base: 'b7a96ab0f', baseLedgerHead: base.head, implementationHead: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(),
  kind: 'generation-hash-comparison; not a new runtime sweep', canonicalObjects: [...new Set(base.rows.map((r: any) => r.object))].sort(), retainedComposition: { objects: 11, schemas: 77, cells: 154 },
  compared: rows.length, equalToBaseLedger: rows.filter(r => r.equalToBaseLedger).length, scopedCompared: rows.filter(r => 'equalToScopedMeasurement' in r).length,
  scopedChanged: rows.filter(r => r.equalToScopedMeasurement === false), otherChanged: rows.filter(r => !('equalToScopedMeasurement' in r) && !r.equalToBaseLedger), rows, builderSelfCertified: false };
fs.writeFileSync('artifacts/product-reality/sprint-199/m07/runtime-hashes.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ compared: report.compared, equal: report.equalToBaseLedger, scopedChanged: report.scopedChanged.map(r=>r.id), otherChanged: report.otherChanged.map(r=>r.id) }));
