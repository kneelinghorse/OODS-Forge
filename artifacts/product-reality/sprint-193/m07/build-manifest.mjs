// Bounded operands for the existing closeout producer and independent output auditor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const base = 'artifacts/product-reality/sprint-193/m07';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const executionHead = process.argv[2]; assert.match(executionHead ?? '', /^[a-f0-9]{40}$/);
const historical = [
  [['verification.json','backup.json','rollback-check.log'], ['verification.json','final.json','build-results.json'], ['behavior-summary.json','generate-react.json','catalog.json'], ['send-readback.json','send-01.json','send-02.json','send-03.json'], ['verification.json','backup.json'], ['fast-forward.log','verification.json']],
  [['runtime-cells.v1.json','validation.json'], ['runtime-cells.v1.json','browser.json'], ['generated-consumer-projection.json'], ['emitter-bite.json','runtime-contract-tests.log'], ['runtime-contract-tests.log','corrections-tests.log']],
  [['runtime-cells.v1.json','validation.json'], ['built-api-proof.json','runtime-cells.v1.json'], ['runtime-cells.v1.json'], ['design-loops/Invoice.json','design-loops/Plan.json','design-loops/Transaction.json','design-loops/Usage.json'], ['built-api-proof.json','emitter-bite.json']],
  [['react-measured.json','vue-measured.json'], ['react-measured.json','vue-measured.json','react-theme/report.json','vue-theme/report.json'], ['packed/scoped-runtime-cells.v1.json'], ['component-census/report.json','movement.json'], ['n015-census.json']],
  [['authored-roots.json','n015-census.json'], ['packed/scoped-runtime-cells.v1.json','pixel-comparison.json'], ['react-measured.json','vue-measured.json','react-theme/report.json','vue-theme/report.json'], ['packed/scoped-runtime-cells.v1.json','movement.json'], ['component-census/report.json','n015-census.json']],
  [['census.json'], ['health-dist.json','isolated-ledger.json'], ['scope-diff.json'], ['scope-diff.json'], ['s194-candidates.json']],
];
const executions = [], bindings = [];
for (const [i, criteria] of historical.entries()) {
  const id = `s193-m0${i + 1}`, directory = `artifacts/product-reality/sprint-193/m0${i + 1}`;
  const head = execFileSync('git', ['log', '-1', '--format=%H', '--', directory], { encoding: 'utf8' }).trim();
  const evidencePaths = [...new Set(['README.md', ...criteria.flat()].map(file => `${directory}/${file}`))];
  for (const file of evidencePaths) assert(fs.readFileSync(file).equals(execFileSync('git', ['show', `${head}:${file}`], { maxBuffer: 128 * 1024 * 1024 })), file);
  executions.push({ id, head, historical: true, evidencePaths, role: 'Immutable mission-close receipts; original implementation and browser heads remain inside each record.' });
  criteria.forEach((files, index) => bindings.push({ missionId: id, criterionIndex: index + 1, executionIds: [id], evidencePaths: [...new Set(['README.md', ...files].map(file => `${directory}/${file}`))] }));
}
if (process.argv.includes('--check-inputs')) { console.log(`Verified ${bindings.length} historical literal criteria.`); process.exit(0); }
const implementationHead = read(`${base}/component-proof.json`).head;
const finalCriteria = [
  ['five-suite-closeout/four-suite-baseline.json','golden-attribution.json'],
  ['component-proof.json','component-ledger.json','runtime/runtime-cells.v1.json','runtime/validation.json','runtime/emitter-bite.json','projection-verification.json','tool-proof.json','health-dist.json','react-measured.json','vue-measured.json','react-theme/report.json','vue-theme/report.json','component-census/report.json','schema-movement.json','saved-original/report.json','saved-successor/report.json','saved-compatibility.json','viz-census.json'],
  ['movers/sprint-wide-movers.json','movers/declared-movers.json','movers/attribution.json','reconnect-plan.json'],
  ['prose.json','ci/observed.json'],
  ['missions.json','component-proof.json','movers/sprint-wide-movers.json'],
];
finalCriteria.forEach((files, index) => {
  const id = `s193-m07-${index + 1}`, evidencePaths = files.map(file => `${base}/${file}`);
  executions.push({ id, head: index === 0 ? executionHead : index === 3 ? read(`${base}/ci/observed.json`).headRefOid : implementationHead, historical: false, evidencePaths, role: index === 0 ? 'One actual five-suite campaign; raw outcomes retained.' : index === 3 ? 'Observed PR/CI identities and roadmap prose check.' : 'Final frozen implementation measurement; no preparation-run union.' });
  bindings.push({ missionId: 's193-m07', criterionIndex: index + 1, executionIds: [id], evidencePaths });
});
const sources = { missions: `${base}/missions.json`, componentProof: `${base}/component-proof.json`, componentLedger: `${base}/component-ledger.json`, componentExport: 'artifacts/structured-data/oods-components-2026-09-11-s193-m07.json', runtime: `${base}/runtime/runtime-cells.v1.json`, runtimeValidation: `${base}/runtime/validation.json`, toolLedger: 'packages/mcp-server/registry/tool-capability-ledger.v1.json', toolProof: `${base}/tool-proof.json`, health: `${base}/health-dist.json`, reactTheme: `${base}/react-theme/report.json`, vueTheme: `${base}/vue-theme/report.json`, reactMeasured: `${base}/react-measured.json`, vueMeasured: `${base}/vue-measured.json`, componentCensus: `${base}/component-census/report.json`, schemaMovement: `${base}/schema-movement.json`, originalStore: `${base}/saved-original/report.json`, successorStore: `${base}/saved-successor/report.json`, compatibility: `${base}/saved-compatibility.json`, registry: 'packages/viz-core/src/registry/viz-recipes.v1.json', vizCensus: `${base}/viz-census.json`, noticePlan: `${base}/reconnect-plan.json`, movers: `${base}/movers/sprint-wide-movers.json`, ci: `${base}/ci/observed.json`, prose: `${base}/prose.json`, near: 'cmos/foundational-docs/roadmap/near.md' };
const accounting = { capturePath: `${base}/five-suite-closeout/four-suite-baseline.json`, ...read(`${base}/closeout/accounting-inputs.json`) };
const manifest = { missionId: 's193-m07', implementationHead, executionHead, sources, executions, bindings, accounting };
assert.equal(bindings.length, 36);
for (const file of [...Object.values(sources), ...executions.flatMap(row => row.evidencePaths)]) assert(fs.existsSync(file), file);
fs.mkdirSync(`${base}/closeout`, { recursive: true }); fs.writeFileSync(`${base}/closeout/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log('Bound 36 literal criteria to immutable mission and final execution receipts.');
