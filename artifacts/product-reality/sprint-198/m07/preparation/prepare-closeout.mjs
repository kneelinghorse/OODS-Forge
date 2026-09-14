import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { derivePublicHeadEquivalence } from '../../../../../scripts/product-reality/s185-closeout.mjs';

const root = process.cwd(), base = 'artifacts/product-reality/sprint-198', out = `${base}/m07`;
const [implementationHead, executionHead] = process.argv.slice(2);
assert([implementationHead, executionHead].every(value => /^[a-f0-9]{40}$/.test(value)));
const read = file => fs.readFileSync(file);
const json = file => JSON.parse(read(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const write = (file, value) => { fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 * 1024 });
const old = json('artifacts/product-reality/sprint-197/m07/closeout/manifest.json');
const sources = Object.fromEntries(Object.entries(old.sources).map(([key, value]) => [key, value.replaceAll('sprint-197/', 'sprint-198/')]));
sources.preFreeze = `${out}/pre-freeze-final/report.json`;
assert.equal(json(sources.sourceProof).head, implementationHead);

const criterionEvidence = {
  m01: [
    ['README.md', 'source-identity.json'],
    ['ci/acceptance.json', 'ci/accepted-run-34782207325.json', 'ci/pr-108-merged.json'],
    ['token-measurements.json', 'canonical-guardrails.after.json', 'logs/a11y-diff-final.log'],
    ['README.md', 'source-identity.json'],
    ['golden-migration/baseline.json', 'golden-migration/baseline-addendum.json', 'golden-migration/attribution.json', 'golden-migration/runs.json'],
    ['README.md'],
  ],
  m02: [
    ['README.md', 'list-verification.json'], ['list-verification.json'],
    ['runtime/runtime-cells.v1.json', 'runtime/validation.json', 'runtime-attribution.json'],
    ['README.md', 'list-verification.json'],
  ],
  m03: [
    ['item-mapping.json', 'verification.json'], ['verification.json'], ['verification.json', 'source-identity.json'],
    ['html/proof.json', 'verification-commands.json', 'README.md'], ['subscription-pixels.json', 'verification.json'],
  ],
  m04: [
    ['item-mapping.json', 'verification.json'], ['verification.json', 'seeds/Organization/seed-table.json', 'seeds/User/seed-table.json'],
    ['verification.json', ...['Article','Chunk','Collection','Document','Evidence','Invoice','Media','Mission','Organization','Plan','Product','Project','Relationship','Report','Subscription','Transaction','Usage','User'].map(object => `seeds/${object}/seed-table.json`)],
    ['subscription-pixels.json', 'verification.json'],
  ],
  m05: [
    ['verification.json', 'source-identity.json', 'accepted/equivalence.json'],
    ['subscription-pixels.json', 'artifact-attribution.json', 'verification.json'],
    ['release-profile-record.json', 'verification-commands.json', 'README.md'],
    ['index.html', 'gallery-check.json'],
  ],
  m06: [
    ['verification.json', 'source-identity.json'], ['README.md', 'before-after.json'],
    ['index.html', 'gallery-check.json', 'README.md'],
  ],
};
const receiptHeads = {
  m01: '46463a8ba1ab078eea7cbdd37759f0f83870b494',
  m02: '8762d3768c97294e763270a271df647a85ab98af',
  m03: '9739f122d1daa017ba1802f949a2b3d04cf4c167',
  m04: 'bf11ae99d47794ce6946429ba7795ffc2e6ec287',
  m05: '7647d80f0744ac00d75313e63e6eae34dc2e6769',
  m06: 'bc8d5037958862e376e477d2883a4b1cafb50d0b',
};
const qualifications = {
  m01: 'Historical scoped acceptance: planning-copy attestation and original measurements are retained, including the initially pending README. The later CI acceptance and merged PR108 supersede that pending CI state. No live golden was updated; all 14 snapshot files and chart registries remained unchanged.',
  m02: 'Historical standalone list receipts and runtime sweep retain their actual m02 source head. Public callbacks and list pixels are evidenced; whole-application usability remains the independent reviewer’s decision.',
  m03: 'Historical captures retain actual source heads and their light/dark input qualifications. Full Invoice/Usage static HTML remains the owned OODS-V007 domain-action limit; actual nested Tabs are supported. Independent visual certification is pending.',
  m04: 'Historical seed/form receipts retain their m04 execution head. The closeout runtime sweep additionally checks all canonical workflows; any subsequent producer correction is separately attributed in m07. No whole-application certification is inferred from static form screenshots.',
  m05: 'Organization/User executed at 6112c3797 with exact generated-file/package equivalence to accepted 25830723e; Subscription executed at that accepted head. Release references are format-checked and hash-bound, not re-executed. The gallery is review material; usable certification is pending.',
  m06: 'Forge-owned synthetic research fixtures, no TraceLab/API parity claim. Optional visual chrome is carried to Sprint200; state-aware research timestamps and the presentational classification recipe are disclosed carries. Independent certification remains pending.',
};
const executions = [], bindings = [];
for (const [mission, criteria] of Object.entries(criterionEvidence)) {
  const evidencePaths = [...new Set(criteria.flat())].map(file => `${base}/${mission}/${file}`);
  for (const file of evidencePaths) assert(read(file).equals(git(['show', `${receiptHeads[mission]}:${file}`])), `Historical receipt changed: ${file}`);
  executions.push({ id: `${mission}-receipts`, head: receiptHeads[mission], historical: true,
    headRole: 'Receipt commit only; original execution heads and working-tree measurements remain inside each retained artifact.', evidencePaths });
  criteria.forEach((files, index) => bindings.push({ missionId: `s198-${mission}`, criterionIndex: index + 1,
    executionIds: [`${mission}-receipts`], evidencePaths: files.map(file => `${base}/${mission}/${file}`), qualification: qualifications[mission] }));
}
const currentCriteria = [
  [`${out}/five-suite-closeout/four-suite-baseline.json`, sources.preFreeze],
  [sources.preFreeze, sources.near],
  [sources.runtime, sources.runtimeValidation, sources.toolLedger, sources.compatibility, sources.schemaMovement, sources.sourceProof, sources.registry, sources.patternRegistry, sources.taxonomy],
  [sources.ci],
  [sources.boundary, sources.headRelations],
];
executions.push({ id: 'm07-closeout', head: executionHead, historical: false,
  headRole: 'Actual five-suite execution head. Census receipts retain implementationHead; metadata and CI are frozen separately at reviewHead.', evidencePaths: [...new Set(currentCriteria.flat())] });
currentCriteria.forEach((evidencePaths, index) => bindings.push({ missionId: 's198-m07', criterionIndex: index + 1,
  executionIds: ['m07-closeout'], evidencePaths,
  qualification: 'Evidence completeness is machine-checked; independent usability certification is pending. Raw failures, skips and their dispositions retain original execution identities. No message, reconnect or delivery is included.' }));
write(sources.boundary, { missionId: 's198-m07', messagesSent: 0, reconnectPrepared: false, deliveryExecuted: false,
  implementationWorkspace: root, primaryCheckoutWrites: 0, otherRepositoryWrites: 0, builderSelfCertified: false });
write(sources.headRelations, { implementationHead, executionHead,
  publicComparison: derivePublicHeadEquivalence({ root, implementationHead, executionHead, sprintId: 'sprint-198' }),
  limitation: 'Runtime/package observations were executed at implementationHead. Only enumerated canonical ledgers and roadmap/generated documentation changed before the five-suite execution freeze. Review inputs are added evidence only.' });
assert.equal(bindings.length, 31);
write(`${out}/closeout/manifest.json`, { missionId: 's198-m07', implementationHead, sources,
  accounting: { capturePath: `${out}/five-suite-closeout/four-suite-baseline.json`, baselinePath: 'artifacts/product-reality/sprint-197/m07/five-suite-closeout/four-suite-baseline.json', attempts: [] }, executions, bindings });

const movers = json(sources.movers), range = `${movers.s198.base}..${executionHead}`;
assert.equal(movers.s198.head, executionHead);
const phaseEnds = Object.entries(receiptHeads).map(([mission, head]) => ({ mission: `s198-${mission}`, commits: new Set(git(['rev-list', `${movers.s198.base}..${head}`]).toString().trim().split('\n')) }));
const missionFor = commit => phaseEnds.find(phase => phase.commits.has(commit))?.mission ?? 's198-m07';
const reasonFor = {
  's198-m01': 'Canonical guardrail provenance, generated interaction tokens, CI setup, golden audit and locked planning inputs',
  's198-m02': 'Shared standalone list controls, loaded-row choices, responsive styling and preview rows',
  's198-m03': 'Read-only detail and timeline composition, shared formatting, themed recipes and the owned static HTML limit',
  's198-m04': 'Form labels/help/control types, catalog metadata and deterministic authored sample projections',
  's198-m05': 'Packed application flows, declared action availability, populated detail panels and explicit release-profile disclosure',
  's198-m06': 'Research schema/producer parity and authoritative preview seed omission',
  's198-m07': 'Final census findings, generated canonical ledgers, roadmap and bounded closeout/pre-freeze validation',
};
const existsAt = (head, file) => git(['ls-tree', '--name-only', head, '--', file]).length > 0;
const rows = movers.s198.publicPaths.map(file => {
  const commits = git(['log', '--no-merges', '--format=%H', range, '--', file]).toString().trim().split('\n').filter(Boolean);
  assert(commits.length, file);
  const missions = [...new Set(commits.map(missionFor))].sort();
  return { path: file, missions, reason: missions.map(mission => `${mission}: ${reasonFor[mission]}`).join('; '), commits,
    beforeSha256: existsAt(movers.s198.base, file) ? hash(git(['show', `${movers.s198.base}:${file}`])) : null,
    afterSha256: existsAt(executionHead, file) ? hash(git(['show', `${executionHead}:${file}`])) : null };
});
const patchPath = `${out}/movers/advertised-sprint.patch`;
fs.writeFileSync(patchPath, git(['diff', '--no-renames', '--binary', range, '--', ...movers.publicScope]));
write(sources.moverAttribution, { base: movers.s198.base, head: executionHead, rows, unattributedPaths: [],
  patch: { path: patchPath, sha256: hash(read(patchPath)) }, builderSelfCertified: false });
console.log(JSON.stringify({ criteria: bindings.length, historicalExecutions: executions.length - 1, attributedPaths: rows.length }));
