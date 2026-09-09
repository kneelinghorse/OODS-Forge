import assert from 'node:assert/strict';
import fs from 'node:fs';
const [beforePath, afterPath, output] = process.argv.slice(2);
const before = JSON.parse(fs.readFileSync(beforePath)), after = JSON.parse(fs.readFileSync(afterPath));
const nodes = (roots, context) => roots.flatMap(node => [{ ...node, context }, ...nodes(node.children ?? [], context)]);
const flat = row => row.input.context === 'workflow'
  ? row.schema.screens.flatMap((screen, index) => nodes([screen], ['list', 'detail', 'form', 'timeline'][index]))
  : nodes(row.schema.screens, row.input.context);
function diff(a, b, pointer = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object') return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => diff(a[key], b[key], `${pointer}/${key}`));
  return [{ path: pointer, before: a ?? null, after: b ?? null }];
}
const rows = after.rows.map(row => {
  const original = before.rows.find(candidate => JSON.stringify(candidate.input) === JSON.stringify(row.input));
  assert.ok(original);
  const top = value => ({ ...value, screens: undefined, workflow: value.workflow ? { ...value.workflow, transitions: undefined } : undefined });
  assert.deepEqual(top(row.schema), top(original.schema), 'object schema and workflow data/routes/states cannot move');
  const changes = [];
  if (row.schema.workflow) {
    const expected = original.schema.workflow.transitions.filter(transition => !(transition.action === 'handleCancel' && transition.from === 'form'));
    assert.deepEqual(row.schema.workflow.transitions, expected);
    if (JSON.stringify(expected) !== JSON.stringify(original.schema.workflow.transitions)) changes.push({ path: '/workflow/transitions', category: 'e: detail-only on-demand cancellation', before: original.schema.workflow.transitions, after: expected });
  }
  const oldNodes = new Map(flat(original).map(node => [node.id, node]));
  const newNodes = new Map(flat(row).map(node => [node.id, node]));
  for (const id of new Set([...oldNodes.keys(), ...newNodes.keys()])) {
    const left = oldNodes.get(id), right = newNodes.get(id), context = right?.context ?? left.context;
    // Compare child identities here; compare each child's actual properties at its own ID.
    const local = node => node ? { ...node, children: node.children?.map(child => child.id) } : undefined;
    for (const change of diff(local(left), local(right))) {
      let category;
      if (/^\/props\/(label|help|reasonHelp|codeHelp)$/.test(change.path)) category = 'a: short labels and separate help';
      else if (context === 'form' && (left?.component === 'DatePicker' || right?.props?.type === 'datetime-local') && ['/component', '/props/type'].includes(change.path)) category = 'c: datetime control lowering';
      else if ((left?.component === 'AuditTimeline' || right?.component === 'AuditTimeline') && change.path === '/props/auditLogField') category = 'e: declared history in read-only detail';
      else if (context === 'detail') category = 'd: populated panels, category grouping and unique tab names';
      else if (context === 'form' && change.path === '/bindings/onCancel') category = 'e: detail-only on-demand cancellation';
      else if (context === 'form') category = 'b: recipe ownership and native Save';
      assert.ok(category, `unclassified ${JSON.stringify(row.input)} ${id} ${change.path}`);
      changes.push({ nodeId: id, context, ...change, category });
    }
  }
  const cells = row.cells.map(cell => {
    const old = original.cells.find(candidate => candidate.framework === cell.framework);
    assert.equal(cell.status, old.status, 'readiness must not regress');
    return { framework: cell.framework, status: cell.status, before: old.artifactHash ?? null, after: cell.artifactHash ?? null, changed: cell.artifactHash !== old.artifactHash };
  });
  return { input: row.input, changed: changes.length > 0, changes, cells };
});
const single = after.rows.filter(row => row.input.context !== 'workflow');
assert.equal(single.length, 66); assert.ok(single.every(row => row.green));
assert.equal(single.flatMap(row => row.cells).filter(cell => cell.status === 'ok').length, 132);
assert.ok(after.rows.find(row => row.input.object === 'Subscription' && row.input.context === 'workflow').green);
const result = { status: 'passed', beforeHead: before.head, head: after.head, schemas: 66, cells: 132, subscriptionWorkflowCells: 2, fullSchemas: `${after.rows.filter(row => row.green).length}/77`, fullCells: `${after.rows.flatMap(row => row.cells).filter(cell => cell.status === 'ok').length}/154`, changedSchemas: rows.filter(row => row.changed).length, changedArtifactCells: rows.flatMap(row => row.cells).filter(cell => cell.changed).length, runtimeClasses: ['e: read-only detail dates and on-demand cancellation', 'f: boolean summary terms render Yes/No'], rows };
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, rows: undefined }));
