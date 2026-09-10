import fs from 'node:fs';
import assert from 'node:assert/strict';
import { sharedScenarios, NUCLEUS_COMPONENT_IDS, componentContracts } from '../../../../packages/component-contracts/dist/index.js';
const root = 'artifacts/product-reality/sprint-192/m03';
const run = JSON.parse(fs.readFileSync(`${root}/component-packages-final.json`, 'utf8'));
assert(run.success && run.numFailedTests === 0 && run.numPendingTests === 0);
const rows = [];
for (const framework of ['react', 'vue']) {
  const extension = framework === 'react' ? 'tsx' : 'ts';
  const base = `packages/components-${framework}/test`;
  const axeFile = `${base}/accessibility.spec.${extension}`;
  const interactionFile = `${base}/scenario-interactions.spec.${extension}`;
  const assertions = file => run.testResults.find(result => result.name.endsWith(file))?.assertionResults ?? [];
  const axe = assertions(axeFile); const interactions = assertions(interactionFile);
  const readinessPath = `packages/components-${framework}/evidence/${framework}-readiness.v1.json`;
  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
  assert.deepEqual(readiness.rows.map(row => row.componentId), NUCLEUS_COMPONENT_IDS);
  for (const scenario of sharedScenarios) {
    const id = scenario.oodsComponentId;
    const axeTest = axe.find(test => test.title.startsWith(`passes axe for the ${id} shared scenario`));
    assert.equal(axeTest?.status, 'passed', `${framework}/${id}: actual axe result`);
    const executed = interactions.filter(test => test.title.startsWith(`${id}:`));
    assert.equal(executed.length, 1 + (scenario.interaction === 'none' ? 1 : scenario.event.length));
    assert(executed.every(test => test.status === 'passed'), `${framework}/${id}: actual interaction results`);
    const row = readiness.rows.find(row => row.componentId === id);
    row.evidence.accessibility = { status: 'passed', classification: 'verified', refs: [`${axeFile}#${id}`] };
    row.evidence.interaction = { status: 'passed', classification: scenario.interaction === 'none' ? 'not-applicable' : 'verified',
      ...(scenario.interactionReason ? { reason: scenario.interactionReason } : {}), refs: [`${interactionFile}#${id}`] };
    rows.push({ framework, componentId: id, accessibility: 'verified', interaction: row.evidence.interaction.classification,
      keyboard: Object.keys(componentContracts[id].keyboard), declaredTriggers: scenario.event.length, passedAssertions: executed.length,
      evidence: { accessibility: row.evidence.accessibility, interaction: row.evidence.interaction } });
  }
  readiness.mission = 's192-m03'; readiness.contractVersion = '1.1.0';
  if (!readiness.derivation.includes('Sprint 192 m03 projects')) readiness.derivation += ' Sprint 192 m03 projects passing per-root axe and executable scenario results into accessibility and interaction evidence; native unwired controls are measured without claiming a domain action.';
  fs.writeFileSync(readinessPath, JSON.stringify(readiness, null, 2) + '\n');
}
fs.writeFileSync(`${root}/measured-evidence.json`, JSON.stringify({ status: 'passed', sourceReport: `${root}/component-packages-final.json`,
  rootsPerFramework: NUCLEUS_COMPONENT_IDS.length, rows }, null, 2) + '\n');
console.log(JSON.stringify(['react', 'vue'].map(framework => ({ framework, axe: rows.filter(row => row.framework === framework).length,
  verifiedInteraction: rows.filter(row => row.framework === framework && row.interaction === 'verified').length,
  notApplicableInteraction: rows.filter(row => row.framework === framework && row.interaction === 'not-applicable').length }))));
