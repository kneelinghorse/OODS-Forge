import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const base = 'artifacts/product-reality/sprint-187/m06/';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const unwrap = file => read(base + file).rawResponse.structuredContent.data;
const mission = unwrap('cmos-mission.json');
const original = unwrap('cmos-original-mission.json');
const sprint = unwrap('cmos-sprint.json');
assert.equal(mission.id, 's187-m06'); assert.equal(original.id, mission.id);
assert.equal(mission.successCriteria.length, 7); assert.deepEqual(mission.successCriteria, original.successCriteria);
assert.equal(sprint.id, 'sprint-187'); assert.equal(sprint.status, 'Active');
const near = fs.readFileSync('cmos/foundational-docs/roadmap/near.md', 'utf8');
for (const term of ['BUILT, REVIEW PENDING', '66/66', '132/132', '28', 'builderSelfCertified:false']) assert(near.includes(term));
const carries = read(base + 'carries.json');
assert.equal(carries.greenfieldWorkflow, 'partial'); assert.equal(carries.builderSelfCertified, false);
for (const id of [1315, 1318, 1319, 1320, 1321, 1322, 1372, 1374, 1375, 1379, 1384]) {
  assert(carries.rows.some(row => row.id === id && row.status === 'pending' && row.remainingWork.trim()));
}
for (const row of carries.rows) for (const file of row.evidence ?? []) assert(fs.existsSync(file), file);
const census = read(base + 'fresh-census.json'); const runtime = read(base + 'live-consumers/report.json');
assert.equal(census.greenSchemas, 66); assert.equal(census.greenCells, 132);
assert.equal(runtime.cellCount, 28); assert.equal(runtime.status, 'passed');
assert.equal(runtime.failed, 0); assert.equal(runtime.skipped, 0);
assert.equal(runtime.passed + runtime.notApplicable, 224);
const notice = read(base + 'reconnect/notice-plan.json'); const deliveries = read(base + 'reconnect/deliveries.json');
assert.equal(notice.implementationHead, census.head); assert.equal(notice.sendsExecuted, 0);
assert.equal(notice.deployment, 'pending'); assert.equal(deliveries.length, 2);
for (const { request, requestSha256 } of notice.notices) {
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex'), requestSha256);
  assert(deliveries.some(row => row.targetAddress === request.targetAddress && row.requestSha256 === requestSha256
    && row.messageId === null && row.status === 'prepared'));
}
console.log(JSON.stringify({ status: 'passed', missionId: mission.id, literalCriteria: 7, sprintStatus: sprint.status,
  builderSelfCertified: false, greenfieldWorkflow: carries.greenfieldWorkflow, runtimeCells: runtime.cellCount,
  passedGates: runtime.passed, notApplicableGates: runtime.notApplicable, sendsExecuted: 0,
  implementationHead: census.head, limitation: 'This source check precedes the separately captured four-suite results and final claim/audit derivation.' }));
