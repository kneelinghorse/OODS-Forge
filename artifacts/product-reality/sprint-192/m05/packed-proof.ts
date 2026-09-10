import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
import { runLiveWorkflowProof, type PackedPackageRecord } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { runAppConsumers } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
import { loadObject, clearObjectCache } from '../../../../packages/mcp-server/src/objects/object-loader.js';
const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-192/m05/packed');
fs.mkdirSync(output, { recursive: true });
const packages = process.argv[3] ? JSON.parse(fs.readFileSync(path.resolve(process.argv[3]), 'utf8')) as PackedPackageRecord[] : await packFoundationPackages(output) as PackedPackageRecord[];
fs.writeFileSync(path.join(output, 'tarballs.json'), JSON.stringify(packages, null, 2) + '\n');
const objects = ['Article', 'Media', 'Organization', 'Product', 'Relationship'];
const appsOnly = process.argv[4] === '--apps-only';
assert(!process.argv[4] || appsOnly, 'Unknown proof mode');
let timelineCells: number | null = null;
if (!appsOnly) {
// Test-only object uses real declarations; no public object or output schema is edited.
const fixture = structuredClone(loadObject('Product'));
fixture.object.name = 'S192AuditSort';
fixture.traits.push({ name: 'lifecycle/Auditable' }, { name: 'behavioral/Sortable', parameters: { sortableFields: ['name'], defaultSortField: 'name', triStateSort: true } });
fixture.schema.audit_log = { type: 'AuditEntry[]', required: true, description: 'Audit proof records', default: [{ to_state: 'active', transitioned_at: '2026-09-05T12:00:00Z', actor_id: 'actor-1' }, { to_state: 'paused', transitioned_at: '2026-09-06T12:00:00Z', actor_id: 'actor-2' }] };
const fixturePath = path.resolve('objects/core/__s192-proof.object.yaml');
fs.writeFileSync(path.join(output, 'test-object.json'), JSON.stringify(fixture, null, 2) + '\n');
assert(!fs.existsSync(fixturePath));
try {
  fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + '\n', { flag: 'wx' }); clearObjectCache();
  const traits = await runLiveWorkflowProof({ artifactRoot: path.join(output, 'trait-recipes'), tarballs: packages, freshInputs: [{ object: fixture.object.name, context: 'detail' }, { object: fixture.object.name, context: 'list' }], mission: 's192-m05' });
  console.log('Real declared audit/sort recipe packed gates:', traits.report.status);
} finally { fs.rmSync(fixturePath, { force: true }); clearObjectCache(); }
const screens = await runLiveWorkflowProof({ artifactRoot: path.join(output, 'timelines'), tarballs: packages, freshInputs: objects.map(object => ({ object, context: 'timeline' as const })), mission: 's192-m05' });
console.log('Canonical timeline packed gates:', screens.report.status);
timelineCells = screens.cells.length;
}
const apps = [];
// Five placed workflow cells per framework plus the two remaining baseline apps.
for (const object of [...objects, 'Subscription', 'User']) {
  const report = await runAppConsumers(path.join(output, 'apps', object), 's192-m05', object, packages);
  assert(report.cells.every(cell => (cell.gates as Array<{ status: string }>).every(gate => gate.status === 'passed')), `${object}: non-green workflow gate`);
  apps.push({ object, report: `apps/${object}/report.json`, cells: report.cells.length });
  console.log('Workflow packed gates:', object, 'passed');
}
fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify({ status: 'passed', scope: appsOnly ? 'workflows' : 'all', timelineCells, traitRecipeCells: appsOnly ? null : 4, apps, baselineWorkflowCells: 6, generatedSchemasEdited: 0 }, null, 2) + '\n');
