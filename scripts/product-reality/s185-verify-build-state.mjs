#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const prefix = 'artifacts/product-reality/sprint-185/m05';
export const inputs = [
  prefix + '/closeout-inputs/cmos-mission-contract-source.json',
  prefix + '/closeout-inputs/cmos-mission-contract-original-source.json',
  prefix + '/closeout-inputs/cmos-sprint-status-source.json',
  prefix + '/bridge/disposition.json',
  'cmos/foundational-docs/roadmap/near.md',
  'artifacts/product-reality/sprint-185/m04/build-record.json',
];
const bytes = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(bytes(file));
const mission = json(inputs[0]).rawResponse.structuredContent.data;
const original = json(inputs[1]).rawResponse.structuredContent.data;
const sprint = json(inputs[2]).rawResponse.structuredContent.data;
assert.equal(mission.id, 's185-m05');
assert.equal(original.id, mission.id);
assert.equal(mission.successCriteria.length, 8);
assert.equal(original.successCriteria.length, 8);
for (let i = 0; i < 8; i++) {
  if (i === 6) {
    assert.notEqual(mission.successCriteria[i], original.successCriteria[i]);
    assert(mission.successCriteria[i].includes('evidence-only descendant'));
    assert(mission.successCriteria[i].includes('Every receipt retains its actual execution head'));
  } else assert.equal(mission.successCriteria[i], original.successCriteria[i]);
}
assert.equal(sprint.id, 'sprint-185');
assert.equal(sprint.status, 'Active');
const bridge = json(inputs[3]);
assert.equal(bridge.status, 'disclosed-skip');
assert.equal(bridge.exitCode, 0);
assert.equal(bridge.rebuildExecuted, false);
assert.equal(bridge.restartExecuted, false);
assert.equal(bridge.healthAfterRestart, null);
assert(bridge.reason.includes('not the checkout PM2 serves'));
assert(bridge.processes.some(row => row.name === 'oods-forge-bridge'
  && row.cwd !== bridge.buildWorktree && !row.cwd.startsWith(bridge.buildWorktree + '/')));
assert(bytes(inputs[4]).includes('BUILT, REVIEW PENDING'));
assert(bytes(inputs[4]).includes('Increment 3') && bytes(inputs[4]).includes('PARTIAL'));
const build = json(inputs[5]);
assert.equal(build.status, 'passed');
assert.equal(build.builderSelfCertified, false);
assert.equal(build.separateReviewRequired, true);
console.log(JSON.stringify({status: 'passed', criteria: 8, unchangedCriteria: 7,
  amendedCriterion: 6, amendmentDecision: 1741, sprintStatus: sprint.status,
  bridgeDisposition: bridge.status, limitation: 'Verifies retained CMOS/PM2 observations and m04 build state; does not restart the served bridge or certify the sprint.'}));
