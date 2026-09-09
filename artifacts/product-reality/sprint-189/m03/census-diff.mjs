import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const [beforePath, afterPath, output] = process.argv.slice(2);
const before = JSON.parse(fs.readFileSync(beforePath));
const after = JSON.parse(fs.readFileSync(afterPath));
const hash = value => `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
function differences(a, b, pointer = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => differences(a[key], b[key], `${pointer}/${key}`));
  }
  return [{ path: pointer, before: a ?? null, after: b ?? null }];
}
const rows = after.rows.map(row => {
  const original = before.rows.find(candidate => JSON.stringify(candidate.input) === JSON.stringify(row.input));
  assert.ok(original, 'every schema must have a baseline');
  const changes = differences(original.schema, row.schema);
  const context = row.input.context;
  const classified = changes.map(change => {
    let category;
    if (context === 'list' && change.path.startsWith('/screens/')) category = 'a: list collection, toolbar and pagination bindings';
    if (context === 'timeline' && change.path.startsWith('/screens/')) category = 'b: chronological events collection and header';
    if (context === 'workflow' && change.path.startsWith('/screens/0/')) category = 'a: list collection, toolbar and pagination bindings';
    if (context === 'workflow' && change.path.startsWith('/screens/3/')) category = 'b: chronological events collection and header';
    assert.ok(category, `unclassified schema movement: ${JSON.stringify(row.input)} ${change.path}`);
    return { ...change, category };
  });
  const cells = row.cells.map(cell => {
    const baseline = original.cells.find(candidate => candidate.framework === cell.framework);
    assert.equal(cell.status, baseline.status, `${JSON.stringify(row.input)} ${cell.framework} changed readiness`);
    const changed = cell.artifactHash !== baseline.artifactHash;
    if (changed) assert.ok(['list', 'timeline', 'workflow'].includes(context), `unclassified artifact movement: ${JSON.stringify(row.input)}`);
    return { framework: cell.framework, before: baseline.artifactHash ?? null, after: cell.artifactHash ?? null, changed, status: cell.status };
  });
  return { input: row.input, beforeHash: hash(original.schema), afterHash: hash(row.schema), changed: changes.length > 0, changes: classified, cells };
});
const single = after.rows.filter(row => row.input.context !== 'workflow');
assert.equal(single.length, 66); assert.ok(single.every(row => row.green));
assert.equal(single.flatMap(row => row.cells).filter(cell => cell.status === 'ok').length, 132);
assert.ok(after.rows.find(row => row.input.object === 'Subscription' && row.input.context === 'workflow').green);
assert.equal(after.governedComponentCount, 72);
const report = { status: 'passed', baselineHead: before.head, head: after.head, schemas: 66, cells: 132, subscriptionWorkflowCells: 2,
  schemaChanges: rows.filter(row => row.changed).length, artifactChanges: rows.flatMap(row => row.cells).filter(cell => cell.changed).length,
  timestampLowering: { category: 'c: shared deterministic timestamp lowering', changesSchema: false, source: 'packages/component-contracts/src/date-time.ts; RelativeTimestamp fallback; generated event entries', evidence: 'before/after browser receipts' },
  gaps: after.rows.filter(row => !row.green).map(row => ({ input: row.input, cells: row.cells })), rows };
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, rows: undefined, gaps: report.gaps.map(row => row.input) }));
