import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cellProcess, CONTEXTS, FRAMEWORKS, BROWSER_IMAGE, summarize, validateRuntimeLedger, type RuntimeCell } from '../../../../scripts/product-reality/s193-runtime-cells.js';
const root = process.cwd();
const output = path.join(root, 'artifacts/product-reality/sprint-199/m06/runtime-final');
const packages = path.join(root, 'artifacts/product-reality/sprint-199/m06/apps');
const objects = ['Relationship'];
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const runId = randomUUID();
const rows: RuntimeCell[] = [];
const inputs = objects.flatMap(object => [
  { object, context: 'workflow' as const, framework: 'react' as const },
  ...CONTEXTS.flatMap(context => FRAMEWORKS.map(framework => ({ object, context, framework }))),
]);
await fs.mkdir(output, { recursive: true });
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < inputs.length) {
    const input = inputs[cursor++]!;
    const row = await cellProcess(output, packages, input.object, input.context, input.framework, head, runId);
    rows.push(row);
    if (input.context === 'workflow') rows.push(JSON.parse(await fs.readFile(path.join(output, `cells/${input.object}/workflow/vue/receipt.json`), 'utf8')));
    console.log(`${input.object}/${input.context}/${input.framework}: ${row.status}`);
  }
}));
rows.sort((a, b) => `${a.object}/${a.context}/${a.framework}`.localeCompare(`${b.object}/${b.context}/${b.framework}`));
const ledger = { schemaVersion: '1.0.0' as const, head, runId, historicalReceiptsUnioned: false as const, packCount: 1, browserImage: BROWSER_IMAGE, receiptRoot: path.relative(root, output), rows, summary: summarize(rows) };
const expected = objects.flatMap(object => [...CONTEXTS, 'workflow'].flatMap(context => FRAMEWORKS.map(framework => `${object}/${context}/${framework}`)));
const issues = validateRuntimeLedger(ledger, true, expected);
await fs.writeFile(path.join(output, 'runtime-cells.v1.json'), JSON.stringify(ledger, null, 2) + '\n');
await fs.writeFile(path.join(output, 'validation.json'), JSON.stringify({ scope: objects, expected: expected.length, issues }, null, 2) + '\n');
const base = JSON.parse(execFileSync('git', ['show', 'b7a96ab0f:packages/mcp-server/registry/runtime-cells.v1.json'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
const attribution = rows.map(row => ({ object: row.object, context: row.context, framework: row.framework, before: base.rows.find((old: RuntimeCell) => old.object === row.object && old.context === row.context && old.framework === row.framework)?.artifactHash, after: row.artifactHash, mission: 's199-m06', reason: 'Relationship neighborhood schema and graph placement; exact re-generated artifact hash retained.' }));
await fs.writeFile(path.join(output, 'artifact-attribution.json'), JSON.stringify({ beforeHead: 'b7a96ab0f', executionBase: head, scope: objects, attribution, builderSelfCertified: false }, null, 2) + '\n');
assert.deepEqual(issues, []);
