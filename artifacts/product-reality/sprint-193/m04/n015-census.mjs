import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { componentIntake, sharedScenarios, NUCLEUS_COMPONENT_IDS } from '../../../../packages/component-contracts/dist/index.js';
import { handle as generate } from '../../../../packages/mcp-server/dist/tools/code.generate.js';
const rows = [];
for (const { id } of componentIntake.rows) {
  const scenario = sharedScenarios.find(row => row.oodsComponentId === id);
  for (const framework of ['react', 'vue']) {
    const result = await generate({ schema: { version: '1.0.0', screens: [{ id: `probe-${id}`, component: id, props: scenario?.props ?? {} }] }, framework, profile: 'build' });
    rows.push({ component: id, framework, status: result.status, errors: result.errors ?? [], artifactPresent: Boolean(result.artifact) });
  }
}
const gaps = [...new Set(rows.filter(row => row.errors.some(error => error.code === 'OODS-N015')).map(row => row.component))].sort();
const expected = componentIntake.rows.map(row => row.id).filter(id => !NUCLEUS_COMPONENT_IDS.includes(id)).sort();
assert.equal(expected.length, 25); assert(expected.every(id => id.startsWith('Viz'))); assert.deepEqual(gaps, expected);
assert(rows.filter(row => NUCLEUS_COMPONENT_IDS.includes(row.component)).every(row => row.status === 'ok' && row.artifactPresent && !row.errors.length));
for (const component of expected) for (const framework of ['react', 'vue']) assert(rows.some(row => row.component === component && row.framework === framework && row.errors.some(error => error.code === 'OODS-N015')));
fs.writeFileSync('artifacts/product-reality/sprint-193/m04/n015-census.json', JSON.stringify({ head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), scope: 'One canonical shared scenario per governed root; empty-prop capability probes for the 25 unavailable roots. This measures N015 target reachability, not packed runtime or full component API coverage.', builderSelfCertified: false, totalComponents: 109, governed: NUCLEUS_COMPONENT_IDS.length, gaps, rows }, null, 2) + '\n');
console.log(`${gaps.length} N015 components: all Viz; 109 identities checked in both frameworks`);
