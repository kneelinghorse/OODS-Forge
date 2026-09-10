#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { deriveSuiteAccounting, S188_DERIVATION_FILES } from './s185-suite-accounting.mjs';
import { PUBLIC_RUNTIME_SCOPE, S186_PUBLIC_RUNTIME_SCOPE, S187_PUBLIC_RUNTIME_SCOPE, S188_PUBLIC_RUNTIME_SCOPE, S189_PUBLIC_RUNTIME_SCOPE, S190_PUBLIC_RUNTIME_SCOPE, S191_PUBLIC_RUNTIME_SCOPE } from './s185-sprint-wide-movers.mjs';
import { isTestPath } from './s184-m07-reconnect.mjs';

export const OUTPUT_ROOT = 'artifacts/product-reality/sprint-185/m05/closeout';
export const MANIFEST_PATH = 'artifacts/product-reality/sprint-185/m05/closeout-inputs/manifest.json';
export const OUTPUT_PATHS = Object.freeze({
  ledger: `${OUTPUT_ROOT}/claim-ledger.json`, handoff: `${OUTPUT_ROOT}/review-handoff.json`,
  accounting: `${OUTPUT_ROOT}/suite-accounting.json`, index: `${OUTPUT_ROOT}/evidence-index.json`,
  audit: `${OUTPUT_ROOT}/final-output-audit.json`, auditLog: `${OUTPUT_ROOT}/final-output-audit.log`,
});
export const canonicalJson = value => `${JSON.stringify(value, null, 2)}\n`;
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fullHead = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const digest = value => String(value).replace(/^sha256:/, '');
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const mandatorySources = ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'baselineFold', 'movers',
  'noticePlan', 'deliveries', 'reviewCarries', 'behaviorBites', 'bridge', 'm04BuildRecord', 'near'];
const criterionSources = [
  ['baselineFold'], ['movers'], ['movers', 'noticePlan', 'deliveries'],
  ['reviewCarries', 'behaviorBites', 'near'], ['reviewCarries'], ['bridge'], [],
  ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near', 'm04BuildRecord'],
];

function safePath(file) {
  assert(nonempty(file) && !path.posix.isAbsolute(file) && !file.includes('\\')
    && !file.split('/').some(part => ['', '.', '..'].includes(part)), `Unsafe frozen path: ${file}`);
  assert(!file.startsWith(`${OUTPUT_ROOT}/`), `Generated output cannot be a frozen input: ${file}`);
  return file;
}

/** Compare actual public bytes using the mover derivation's test exclusions. */
export function derivePublicHeadEquivalence({ root, implementationHead, executionHead, sprintId = 'sprint-185' }) {
  assert(fullHead(implementationHead) && fullHead(executionHead), 'Public comparison requires full actual commit SHAs.');
  const scope = sprintId === 'sprint-191' ? S191_PUBLIC_RUNTIME_SCOPE : sprintId === 'sprint-190' ? S190_PUBLIC_RUNTIME_SCOPE : sprintId === 'sprint-189' ? S189_PUBLIC_RUNTIME_SCOPE : sprintId === 'sprint-188' ? S188_PUBLIC_RUNTIME_SCOPE : sprintId === 'sprint-187' ? S187_PUBLIC_RUNTIME_SCOPE : sprintId === 'sprint-186' ? S186_PUBLIC_RUNTIME_SCOPE : PUBLIC_RUNTIME_SCOPE;
  execFileSync('git', ['merge-base', '--is-ancestor', implementationHead, executionHead], { cwd: root });
  // Disable rename folding so moving runtime source into a test path still
  // exposes the removed runtime path before test-only changes are excluded.
  const scopedChangedPaths = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z',
    implementationHead, executionHead, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).sort();
  return { implementationHead, executionHead, ancestor: true, scope, excludeTests: true,
    scopedChangedPaths, changedPaths: scopedChangedPaths.filter(file => !isTestPath(file)),
    excludedTestPaths: scopedChangedPaths.filter(isTestPath) };
}

/** Pure derivation over explicitly supplied frozen bytes; no working-tree fallback. */
export function deriveCloseout({ executionHead, reviewHead, manifest, readFrozen, readHistorical, suiteAccounting, publicHeadEquivalence, finalAudit }) {
  if (['s190-m06', 's191-m05'].includes(manifest.missionId)) return deriveSprint190Closeout({ executionHead, reviewHead, manifest, readFrozen, readHistorical, suiteAccounting, publicHeadEquivalence });
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Both full execution and review commit SHAs are required.');
  const browser = manifest.missionId === 's189-m06';
  const workflow = browser || manifest.missionId === 's188-m06';
  const approvedTimeout = workflow && manifest.accounting?.approvedTimeout;
  const fresh = manifest.missionId === 's187-m06';
  const wave2 = manifest.missionId === 's186-m06';
  const missionId = browser ? 's189-m06' : workflow ? 's188-m06' : fresh ? 's187-m06' : wave2 ? 's186-m06' : 's185-m05';
  const sprintId = browser ? 'sprint-189' : workflow ? 'sprint-188' : fresh ? 'sprint-187' : wave2 ? 'sprint-186' : 'sprint-185';
  const criterionCount = workflow ? 6 : fresh ? 7 : wave2 ? 6 : 8;
  const suiteCriterion = workflow ? 2 : fresh ? 5 : wave2 ? 4 : 6;
  const outputPaths = Object.fromEntries(Object.entries(OUTPUT_PATHS).map(([key, file]) => [key,
    browser ? file.replace('sprint-185/m05', 'sprint-189/m06') : workflow ? file.replace('sprint-185/m05', 'sprint-188/m06') : fresh ? file.replace('sprint-185/m05', 'sprint-187/m06') : wave2 ? file.replace('sprint-185/m05', 'sprint-186/m06') : file]));
  if (approvedTimeout) for (const key of Object.keys(outputPaths)) outputPaths[key] = outputPaths[key].replace('/m06/closeout/', '/m06/closeout-accepted/');
  const requiredSources = workflow ? ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'freshCensus', 'liveConsumers', 'savedOriginal', 'savedSuccessor', 'savedCompatibility', 'movers', 'moversDeclaration', 'noticePlan', 'deliveries', 'missionHistory', 'historicalEvidence', 'prose', 'carries', 'near'] : fresh ? ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'freshCensus', 'cohort', 'liveConsumers', 'savedOriginal', 'savedSuccessor', 'savedCompatibility', 'rootEvidence', 'baselineFold', 'movers', 'moversDeclaration', 'noticePlan', 'deliveries', 'carries', 'near'] : wave2 ? ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'unionFold', 'baselineFold', 'movers',
    'moversDeclaration', 'noticePlan', 'deliveries', 'near'] : mandatorySources;
  const requiredByCriterion = workflow ? [['freshCensus', 'savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['liveConsumers'], [], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries'], ['missionHistory', 'historicalEvidence', 'prose', 'near'], ['cmosMission', 'cmosSprint', 'carries', 'noticePlan']] : fresh ? [['freshCensus'], ['cohort', 'liveConsumers'], ['savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['rootEvidence', 'baselineFold'], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries', 'carries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : wave2 ? [['unionFold'], ['baselineFold'], ['movers', 'moversDeclaration'],
    ['movers', 'noticePlan', 'deliveries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : criterionSources;
  assert.equal(manifest.missionId, missionId);
  assert(!Object.hasOwn(manifest, 'criteria') && !Object.hasOwn(manifest, 'claims'), 'Criterion text and outcomes cannot be supplied by the manifest.');
  const frozen = new Map();
  const frozenBytes = new Map();
  function reference(file, expectedHash) {
    safePath(file);
    assert(!file.startsWith(`${path.posix.dirname(outputPaths.ledger)}/`), 'Generated output cannot justify a claim.');
    if (!frozen.has(file)) {
      const bytes = Buffer.from(readFrozen(file));
      frozenBytes.set(file, bytes);
      frozen.set(file, { path: file, bytes: bytes.length, sha256: sha256(bytes), commit: reviewHead });
    }
    const ref = frozen.get(file);
    if (expectedHash !== undefined) assert.equal(ref.sha256, digest(expectedHash), `Frozen input hash mismatch: ${file}`);
    return ref;
  }
  const text = file => { reference(file); return frozenBytes.get(file).toString('utf8'); };
  const json = file => JSON.parse(text(file));
  if (browser) { requiredSources.push('wideCensus', 'censusDiff', 'receiptSet', 'carryMapping', 'pr'); requiredByCriterion[0].push('wideCensus', 'censusDiff'); requiredByCriterion[1].push('receiptSet', 'carryMapping'); requiredByCriterion[5].push('pr'); }
  for (const key of requiredSources) assert(nonempty(manifest.sources?.[key]), `Missing source: ${key}`);
  assert(Array.isArray(manifest.sources.derivationInputs) && manifest.sources.derivationInputs.length > 0,
    'Derivation source and independent verification inputs must be frozen.');
  for (const file of manifest.sources.derivationInputs) reference(file);
  if (manifest.manifestPath) reference(manifest.manifestPath);

  const documents = Object.fromEntries(requiredSources.filter(key => key !== 'near')
    .map(key => [key, json(manifest.sources[key])]));
  const near = text(manifest.sources.near);
  const unwrap = document => document.rawResponse?.structuredContent?.data ?? document;
  const mission = unwrap(documents.cmosMission);
  const originalMission = unwrap(documents.cmosOriginalMission);
  const sprint = unwrap(documents.cmosSprint);
  assert.equal(mission?.id, missionId);
  assert.equal(originalMission?.id, missionId);
  assert.equal(sprint?.id, sprintId);
  assert(Array.isArray(mission.successCriteria) && mission.successCriteria.length === criterionCount
    && mission.successCriteria.every(nonempty), 'All literal CMOS criteria are required.');
  assert(Array.isArray(manifest.claimBindings) && manifest.claimBindings.length === criterionCount, 'Exactly one binding per criterion required.');
  assert.equal(new Set(manifest.claimBindings.map(row => row.criterionIndex)).size, criterionCount, 'Duplicate criterion binding.');

  assert.equal(suiteAccounting.executionHead, executionHead, 'Accounting execution head was relabeled.');
  assert.equal(suiteAccounting.reviewHead, reviewHead, 'Accounting review head differs.');
  assert(suiteAccounting.references?.length > 0, 'Accounting must cite its frozen capture inputs.');
  for (const ref of suiteAccounting.references) reference(ref.path, ref.sha256);
  const executions = new Map();
  const executionHashes = new Set();
  function addExecution(row) {
    assert(nonempty(row.id) && !executions.has(row.id), `Duplicate or absent execution id: ${row.id}`);
    executions.set(row.id, row);
  }
  for (const row of suiteAccounting.executions ?? []) {
    for (const key of ['receipt', 'log', 'rawReport']) {
      assert(row[key]?.path && row[key]?.sha256, `Suite execution ${row.id} lacks ${key}.`);
      reference(row[key].path, row[key].sha256);
    }
    assert(!executionHashes.has(digest(row.rawReport.sha256)), 'A suite execution was rolled up under two rows.');
    executionHashes.add(digest(row.rawReport.sha256));
    addExecution({ ...row, evidenceKind: 'suite-receipt' });
  }
  for (const row of manifest.executions ?? []) {
    assert(nonempty(row.command) && nonempty(row.cwd) && nonempty(row.host), `Execution ${row.id} lacks command/cwd/host.`);
    assert(Number.isInteger(row.exitCode) && fullHead(row.executionHead), `Execution ${row.id} lacks its actual exit/head.`);
    assert(['committed', 'worktree'].includes(row.sourceState), `Execution ${row.id} lacks source-state disclosure.`);
    assert(row.inputs?.length > 0 && row.logs?.length > 0, `Execution ${row.id} lacks source/log bindings.`);
    const resolveExecutionRef = ref => {
      assert(typeof ref.sha256 === 'string' && /^[a-f0-9]{64}$/.test(digest(ref.sha256)), `Execution ${row.id} lacks a captured input/log hash.`);
      if (approvedTimeout && (S188_DERIVATION_FILES.includes(ref.path) || ref.path === 'packages/mcp-server/test/product-reality/approved-timeout.s188.spec.ts') && reference(ref.path).sha256 !== digest(ref.sha256)) {
        const inputHead = row.inputSourceHead ?? row.executionHead;
        if (row.inputSourceHead) assert.equal(row.sourceState, 'worktree');
        assert(fullHead(inputHead));
        const bytes = Buffer.from(readHistorical(inputHead, ref.path));
        assert.equal(sha256(bytes), digest(ref.sha256), 'Captured audit-source hash differs at its actual execution.');
        return { path: ref.path, sha256: sha256(bytes), bytes: bytes.length, commit: reviewHead, executionSourceHead: inputHead };
      }
      return reference(ref.path, ref.sha256);
    };
    const inputs = row.inputs.map(resolveExecutionRef);
    const logs = row.logs.map(resolveExecutionRef);
    const outputs = (row.outputs ?? []).map(resolveExecutionRef);
    const executionKey = logs.map(ref => ref.sha256).sort().join(':');
    assert(!executionHashes.has(executionKey), 'A supplemental execution was rolled up under two rows.');
    executionHashes.add(executionKey);
    addExecution({ ...row, inputs, outputs, logs, evidenceKind: 'retained-command',
      headDisclosure: row.sourceState === 'worktree' ? 'Actual execution was in a worktree with uncommitted inputs; input hashes, not a relabeled review head, identify those bytes.' : 'Actual execution commit retained.' });
  }
  assert(executions.size > 0, 'No actual execution receipts supplied.');

  const checks = Array.from({ length: criterionCount }, () => []);
  const check = (index, condition, detail) => checks[index].push({ detail, passed: !!condition });
  const implementationHead = documents.noticePlan.implementationHead;
  const captureIds = suiteAccounting.closeout?.runs?.[0]?.suiteExecutionIds ?? [];
  const captureRows = captureIds.map(id => executions.get(id));
  if (workflow) {
    const census = documents.freshCensus;
    const expectedRecipes = { list: ['BillingSummaryBadge', 'ArchivedRowOverlay'], detail: ['CycleProgressCard', 'PaymentTimeline'],
      form: ['BillingAmountInput', 'BillingIntervalSelector'], timeline: ['PaymentEventTimeline'], card: ['BillingCardMeta'] };
    check(0, census.head === implementationHead && census.profile === 'build' && census.schemaCount === 66 && census.greenSchemas === 66
      && census.generationCells === 132 && census.greenCells === 132 && census.rows.length === 66
      && census.workflow.input.object === 'Subscription' && census.workflow.input.context === 'workflow' && census.workflow.green,
    'Frozen fresh census contains 66 passing schemas, 132 screen cells and two workflow cells.');
    for (const row of [...census.rows, census.workflow]) {
      const composed = json(row.composition.path); reference(row.composition.path, row.composition.sha256);
      check(0, composed.status === 'ok' && row.cells.length === 2, `${row.input.object}/${row.input.context} composes and has two cells.`);
      for (const cell of row.cells) {
        reference(cell.response.path, cell.response.sha256); const generated = json(cell.response.path);
        check(0, generated.status === 'ok' && generated.artifact && !generated.errors?.length, `${row.input.object}/${row.input.context}/${cell.framework} has an actual build artifact.`);
      }
      if (row.input.object === 'Subscription') check(0, (expectedRecipes[row.input.context] ?? []).every(id => row.components.includes(id)), `Subscription/${row.input.context} retains its declared recipes.`);
    }
    const original = documents.savedOriginal; const successor = documents.savedSuccessor; const compatibility = documents.savedCompatibility;
    check(0, original.head === implementationHead && successor.head === implementationHead && original.total === 16 && original.reachable === 15
      && original.generatedCells === 30 && successor.total === 16 && successor.reachable === 16 && successor.generatedCells === 32
      && compatibility.originalInputsUnchanged && compatibility.successorInputsUnchanged && compatibility.liveStoreUnchanged,
    'Original and successor saved stores retain their separate 15/16 and 16/16 results and exact inputs.');
    for (const report of [original, successor]) for (const row of report.rows) {
      reference(row.input.path, row.input.sha256);
      for (const cell of row.cells) reference(`${path.posix.dirname(report === original ? manifest.sources.savedOriginal : manifest.sources.savedSuccessor)}/${cell.response.path}`, cell.response.sha256);
    }
    const app = documents.liveConsumers;
    check(1, app.sourceHead === implementationHead && app.cells.length === 2 && app.cells.every(cell => cell.gates.length === 8
      && cell.gates.every(gate => gate.status === 'passed') && cell.flow.length === 9 && cell.flow.every(row => row.status === 'passed')
      && cell.consumerAuthoredComponents === 0 && cell.consumerAuthoredActions === 0), 'Both fresh applications pass all eight gates and nine generated flows without consumer wiring.');
    check(1, app.stateObservations.length === 32 && app.screenshots.length === 36,
      'Four states on four screens in both targets and six screenshot views at three widths are retained.');
    const appRoot = path.posix.dirname(manifest.sources.liveConsumers);
    for (const image of app.screenshots) reference(`${appRoot}/${image.file}`, image.sha256);
    for (const cell of app.cellReports) reference(`${appRoot}/${cell.report}`, cell.sha256);
    if (approvedTimeout) { reference(approvedTimeout); assert.equal(suiteAccounting.timeoutAcceptance?.decisionId, 1830); assert(manifest.claimBindings[2].evidencePaths.includes(approvedTimeout)); }
    check(2, suiteAccounting.status === 'passed' && !suiteAccounting.validationIssues.length && !suiteAccounting.unattributedDeltas.length
      && Object.keys(suiteAccounting.baselines).join() === (browser ? 'sprint188Closeout' : 'sprint187Closeout') && suiteAccounting.closeout.runs.length === 1
      && captureRows.length === 4 && captureRows.every(row => row.measuredHead === executionHead && row.cleanBefore && row.cleanAfter && row.counts.failed === (approvedTimeout && row.suite === 'root-core' ? 1 : 0)),
    approvedTimeout ? 'One clean corrective capture retains exactly the user-approved timeout and all file-attributed deltas.' : 'One clean capture has zero failures and file-attributed deltas against Sprint 187.');
    check(2, publicHeadEquivalence?.changedPaths.length === 0 && equal(publicHeadEquivalence.scope, browser ? S189_PUBLIC_RUNTIME_SCOPE : S188_PUBLIC_RUNTIME_SCOPE),
      'Execution retains the frozen implementation public bytes, including workflow and bridge build identity.');
    const movers = documents.movers; const declared = documents.moversDeclaration; const plan = documents.noticePlan;
    const range = movers[browser ? 's189' : 's188'], declaredRange = declared[browser ? 's189' : 's188'];
    check(3, movers.status === 'passed' && range.base === (browser ? 'f4cd1ba3cda3d1d52405582e425ecd6d19890b51' : 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076')
      && range.head === implementationHead && ['canonicalPaths', 'publicPaths'].every(key => equal(range[key], declaredRange[key]))
      && plan.implementationHead === implementationHead && plan.status === 'prepared-unsent' && plan.deliverySprint === (browser ? 'sprint-190' : 'sprint-189')
      && documents.deliveries.length === 0 && range.publicPaths.every(file => plan.draft.includes(file)),
    'The one sprint-wide range is enumerated in an unsent Sprint 189 reconnect draft.');
    check(4, documents.missionHistory.missions.length === 6 && documents.historicalEvidence.status === 'passed'
      && documents.prose.success === true && documents.prose.numFailedTests === 0 && documents.prose.numPendingTests === 0
      && near.includes('BUILT, REVIEW PENDING'), 'All mission criteria retain source/receipt bindings and the updated prose contracts pass.');
    check(5, sprint.status === 'Active' && documents.carries.builderSelfCertified === false
      && documents.carries.separateReviewRequired === true && documents.carries.screenshots === manifest.sources.liveConsumers,
    'Handoff leaves certification to independent review and points to the actual craft screenshots.');
    if (browser) {
      check(0, documents.wideCensus.rows.length === 77 && documents.wideCensus.head === implementationHead && documents.censusDiff.status === 'passed' && documents.censusDiff.head === implementationHead, 'Full 77-schema census is retained at the frozen head.');
      check(1, documents.receiptSet.status === 'passed' && documents.receiptSet.receipts.length >= 10 && documents.carryMapping.items.length === 7, 'Frozen receipt set and all seven carry dispositions are bound.');
      check(5, documents.pr.url && documents.pr.base === 'OODS-pro' && documents.pr.head === 'codex/sprint-189-browser-design-loop' && documents.pr.runs.length > 0, 'Review PR and observed CI runs are retained.');
    }
  } else if (fresh) {
    const base = '21c7c31906fbb81d049b943155c64ed78409fb9f';
    const expectedPaths = ['User/detail', 'Product/detail', 'Usage/list', 'Subscription/inline', 'Transaction/timeline',
      'Product/list', 'Product/form', 'Product/inline', 'Organization/list', 'Organization/detail', 'Organization/card',
      'Subscription/detail', 'Subscription/form', 'Subscription/card'];
    const frameworks = ['react', 'vue'];
    const contexts = ['detail', 'list', 'form', 'timeline', 'card', 'inline'];
    const objects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const array = (source, name) => [...(source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map(match => match[1]);
    const typesPath = 'packages/component-contracts/src/types.ts';
    const ids = array(text(typesPath), 'NUCLEUS_COMPONENT_IDS');
    const priorIds = array(Buffer.from(readHistorical(base, typesPath)).toString('utf8'), 'NUCLEUS_COMPONENT_IDS');
    const added = ids.filter(id => !priorIds.includes(id));
    const census = documents.freshCensus;
    const population = objects.flatMap(object => contexts.map(context => `${object}/${context}`)).sort();
    check(0, census.head === implementationHead && census.profile === 'build' && census.schemaCount === 66 && census.greenSchemas === 66
      && census.generationCells === 132 && census.greenCells === 132 && census.governedComponentCount === 64
      && equal(census.objects, objects) && equal(census.contexts, contexts)
      && equal(census.rows.map(row => `${row.input.object}/${row.input.context}`).sort(), population)
      && census.rows.every(row => equal(Object.keys(row.input).sort(), ['context', 'object']) && row.composed === true && row.green === true
        && row.ungoverned.length === 0 && equal(row.cells.map(cell => cell.framework), frameworks)
        && row.cells.every(cell => cell.status === 'ok' && cell.artifactPresent === true && cell.errors.length === 0)),
    'Every fixed public object/context uses the exact default input and produces both build artifacts at the final implementation.');
    const live = documents.liveConsumers;
    const cohort = documents.cohort;
    check(1, equal(cohort.groups.flatMap(group => group.paths), expectedPaths) && equal(cohort.frameworks, frameworks)
      && equal(live.freshInputs.map(input => `${input.object}/${input.context}`), expectedPaths)
      && live.status === 'passed' && live.cellCount === 28 && live.selected === 224 && live.failed === 0 && live.skipped === 0
      && live.passed + live.notApplicable === 224 && live.applicable === live.passed
      && equal(live.cells.map(cell => `${cell.composition.input.object}/${cell.composition.input.context}/${cell.framework}`).sort(),
        expectedPaths.flatMap(value => frameworks.map(framework => `${value}/${framework}`)).sort()),
    'All fourteen locked runtime operands have both framework cells and balanced passed/N/A accounting.');
    const liveRoot = path.posix.dirname(manifest.sources.liveConsumers);
    const tarballHashes = new Map();
    const gates = ['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render', 'mount', 'hydration', 'shared-css-resolution', 'interaction-evidence'];
    for (const cell of live.cells) {
      const reportPath = path.posix.join(liveRoot, cell.report);
      reference(reportPath, cell.reportSha256); const report = json(reportPath);
      const comp = cell.composition;
      const composition = json(path.posix.join(liveRoot, 'live-generation', cell.schema, 'composition.json'));
      check(1, equal(composition.composition, comp) && digest(comp.schemaSha256) === sha256(canonicalJson(composition.schema)),
        `${cell.schema}/${cell.framework} retains the exact composed schema bytes.`);
      const artifact = json(path.posix.join(liveRoot, 'live-generation', cell.schema, cell.framework, 'artifact.json'));
      check(1, artifact.contentHash === cell.generation.artifactContentHash && artifact.files.every(file => digest(file.contentHash) === sha256(file.contents)),
        `${cell.schema}/${cell.framework} retains its in-run generated artifact and file hashes.`);
      reference(path.posix.join(liveRoot, comp.sourceDiffPath), comp.sourceDiffSha256);
      reference(path.posix.join(liveRoot, cell.generation.sourcePath), cell.generation.sourceSha256);
      for (const tarball of report.localTarballs) {
        reference(path.posix.join(liveRoot, 'submitted-packages/tarballs', path.posix.basename(tarball.installSpec)), tarball.sha256);
        if (!tarballHashes.has(tarball.name)) tarballHashes.set(tarball.name, tarball.sha256);
        check(1, tarballHashes.get(tarball.name) === tarball.sha256, `All ${tarball.name} consumers install identical tarball bytes.`);
      }
      check(1, comp.sourceHead === implementationHead && comp.sourceDiffSha256 === `sha256:${sha256('')}`
        && cell.generation.fingerprint.profile === 'build' && cell.generation.fingerprint.sourceOfArtifact === 'current-in-run-output'
        && report.status === 'passed' && equal(report.gates.map(gate => gate.name), gates)
        && report.gates.every(gate => (gate.status === 'passed' && gate.logs?.length > 0) || (gate.name === 'interaction-evidence' && gate.status === 'not-applicable'))
        && report.accounting.balanced === true && report.accounting.namedUnprovenCount === 0
        && report.browser.runtimeErrors.length === 0 && report.browser.hydrationInvariant.equal === true
        && report.browser.boundValues.every(value => value.passed === true),
      `${cell.schema}/${cell.framework} retains a clean final-source artifact, eight gates, typed value observations and hydration parity.`);
    }
    const original = documents.savedOriginal; const successor = documents.savedSuccessor; const compatibility = documents.savedCompatibility;
    check(2, original.head === implementationHead && successor.head === implementationHead && original.total === 16 && successor.total === 16
      && successor.reachable === 16 && successor.generatedCells === 32
      && original.reachable >= 15 && original.generatedCells >= 30 && compatibility.originalInputsUnchanged === true
      && compatibility.successorInputsUnchanged === true && compatibility.historicalNegativeRetained === true
      && compatibility.originalBaseline === 15 && compatibility.successorBaseline === 16
      && nonempty(compatibility.originalDeltaExplanation), 'Both identified saved stores preserve input hashes; successor is 16/16 and any original improvement is explained alongside retained negative evidence.');
    for (const saved of [original, successor]) for (const row of saved.rows) {
      reference(row.input.path, row.input.sha256);
      for (const cell of row.cells) reference(path.posix.join(path.posix.dirname(saved === original ? manifest.sources.savedOriginal : manifest.sources.savedSuccessor), cell.response.path), cell.response.sha256);
    }
    for (const ref of compatibility.references) reference(ref.path, ref.sha256);
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const baseline = json(baselinePath); const historical = JSON.parse(Buffer.from(readHistorical(base, baselinePath)).toString('utf8'));
    const identity = rows => rows.map(({ id, proposedClassification, reconciliationState }) => ({ id, proposedClassification, reconciliationState }));
    const rootEvidence = documents.rootEvidence;
    check(3, ids.length === 64 && new Set(ids).size === 64 && added.length === 14 && priorIds.every(id => ids.includes(id))
      && equal(rootEvidence.governedIds, ids) && equal([...rootEvidence.addedIds].sort(), [...added].sort())
      && baseline.rows.length === 109 && equal(identity(baseline.rows), identity(historical.rows))
      && json('packages/component-contracts/registry/component-obligation-scope.v1.json').decisionId === 1788
      && json('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus === null,
    '64 unique governed roots retain all 109 identities and the accepted scope separately from the unapproved old split.');
    const readiness = json(rootEvidence.readiness.path); reference(rootEvidence.readiness.path, rootEvidence.readiness.sha256);
    check(3, readiness.status === 'passed' && readiness.failures.length === 0 && readiness.totals.resolved === readiness.totals.references
      && readiness.totals.references === 778, 'All current runtime and declaration readiness references resolve after rebuild.');
    const positive = json(rootEvidence.positiveExports.path); reference(rootEvidence.positiveExports.path, rootEvidence.positiveExports.sha256);
    check(3, positive.success === true && positive.numPassedTests === 28 && positive.numFailedTests === 0 && positive.numPendingTests === 0,
      'All 28 final built package export cells pass without skips.');
    const mutants = rootEvidence.mutations.flatMap(ref => { reference(ref.path, ref.sha256); return json(ref.path).mutants; });
    check(3, equal(mutants.map(row => row.selectedCell).sort(), added.flatMap(id => frameworks.map(framework => `${framework}/${id}`)).sort())
      && mutants.every(row => row.status === 'passed' && row.sourceSha256Before !== row.sourceSha256Deleted && row.restoredByteIdentically === true
        && equal(row.selectedRed.packageRedCells, [row.selectedCell]) && equal(row.selectedRed.readinessRedCells, [row.selectedCell])
        && row.selectedRed.packageRun.exitCode !== 0 && row.selectedRed.readinessRun.exitCode !== 0
        && row.restoredGreen.packageRun.exitCode === 0 && row.restoredGreen.readinessRun.exitCode === 0
        && row.restoredGreen.observations.every(cell => cell.status === 'passed')),
    '28 distinct real export deletions fail only their selected package/readiness cell and restore to green bytes.');
    for (const mutant of mutants) for (const phase of ['selectedRed', 'restoredGreen']) {
      reference(mutant[phase].packageReport); reference(mutant[phase].readinessReport);
      reference(mutant[phase].packageRun.log); reference(mutant[phase].readinessRun.log);
    }
    for (const ref of documents.baselineFold.sourceHashes) reference(ref.path, ref.sha256);
    check(3, documents.baselineFold.denominator === 109 && documents.baselineFold.readinessReferences.every(ref => ref.resolved === true)
      && added.every(id => {
        const row = baseline.rows.find(row => row.id === id);
        return ['react', 'vue', 'generatedConsumer'].every(surface => row.surfaces[surface].state === 'implemented-evidence-complete' && row.surfaces[surface].evidence.length > 0)
          && ['accessibility', 'theme', 'interaction'].every(surface => row.surfaces[surface].state === 'unverified');
      }), 'Capability updates are supported by the retained fold; no new maturity surface is promoted.');
    const movers = documents.movers; const declaration = documents.moversDeclaration; const plan = documents.noticePlan;
    const samePublic = implementationHead === executionHead || (publicHeadEquivalence?.implementationHead === implementationHead
      && publicHeadEquivalence.executionHead === executionHead && publicHeadEquivalence.ancestor === true
      && equal(publicHeadEquivalence.scope, S187_PUBLIC_RUNTIME_SCOPE) && publicHeadEquivalence.excludeTests === true
      && equal(publicHeadEquivalence.changedPaths, publicHeadEquivalence.scopedChangedPaths.filter(file => !isTestPath(file)))
      && equal(publicHeadEquivalence.excludedTestPaths, publicHeadEquivalence.scopedChangedPaths.filter(isTestPath)) && publicHeadEquivalence.changedPaths.length === 0);
    check(4, samePublic && movers.status === 'passed' && movers.s187.base === base && movers.s187.head === implementationHead
      && ['canonicalPaths', 'publicPaths'].every(key => equal(movers.s187[key], declaration.s187[key])
        && movers.comparison.s187[key].missingFromDeclaration.length === 0 && movers.comparison.s187[key].extraInDeclaration.length === 0),
    'One sprint-wide canonical/public diff includes discovery and composer/lowering and matches final execution public bytes.');
    check(4, plan.status === 'prepared' && plan.sendsExecuted === 0 && plan.deployment === 'pending' && equal(plan.addedNucleus, added)
      && plan.notices.length === 2 && documents.deliveries.length === 2
      && ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'].every(destination => {
        const notices = plan.notices.filter(row => row.request.targetAddress === destination); const receipts = documents.deliveries.filter(row => row.targetAddress === destination);
        return notices.length === 1 && receipts.length === 1 && sha256(JSON.stringify(notices[0].request)) === notices[0].requestSha256
          && receipts[0].status === 'prepared' && receipts[0].messageId === null && receipts[0].requestSha256 === notices[0].requestSha256
          && [...added, 'Deployment: pending', 'retain-109', '/ported', '/readiness-ported', '/css-ported'].every(term => notices[0].request.body.includes(term));
      }), 'The combined exact-identity notice remains prepared with no fabricated sent receipt or served adoption.');
    check(4, [1315, 1318, 1319, 1320, 1321, 1322, 1372, 1374, 1375, 1379, 1384].every(id => documents.carries.rows.some(row => row.id === id && row.status === 'pending' && nonempty(row.remainingWork)))
      && documents.carries.greenfieldWorkflow === 'partial' && documents.carries.builderSelfCertified === false,
    'All named maintenance, delivery, visualization and maturity carries remain explicitly owed.');
    check(5, suiteAccounting.status === 'passed' && suiteAccounting.validationIssues.length === 0 && suiteAccounting.unattributedDeltas.length === 0
      && equal(Object.keys(suiteAccounting.baselines), ['sprint186Closeout'])
      && suiteAccounting.baselines.sprint186Closeout.measuredHead === '740e8405fa8e094ab903a19e6e551fbe8bff2de2'
      && suiteAccounting.closeout.runs.length === 1 && captureIds.length === 4 && new Set(captureIds).size === 4
      && captureRows.every(row => row.cohort === 'closeout' && row.measuredHead === executionHead && row.cleanBefore === true && row.cleanAfter === true && row.exitCode === 0 && row.counts.failed === 0)
      && suiteAccounting.headRelation.ancestor === true && suiteAccounting.headRelation.executableInputsUnchanged === true,
    'One clean four-suite capture compares actual Sprint 186 closeout and accounts for every changed file; failed attempts and skips remain separate.');
    check(6, sprint.status === 'Active' && near.includes('BUILT, REVIEW PENDING') && equal(mission.successCriteria, originalMission.successCriteria),
      'Seven literal CMOS criteria and measured near.md are retained, with Sprint 187 Active for separate review.');
  } else if (wave2) {
    assert.equal(typeof readHistorical, 'function', 'Sprint 186 requires actual locked-base Git sources.');
    const base = '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2';
    const typesPath = 'packages/component-contracts/src/types.ts';
    const ids = (source, name) => [...(source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map(match => match[1]);
    const currentTypes = text(typesPath);
    const priorTypes = Buffer.from(readHistorical(base, typesPath)).toString('utf8');
    const nucleus = ids(currentTypes, 'NUCLEUS_COMPONENT_IDS');
    const formerPorted = ids(priorTypes, 'PORTED_COMPONENT_IDS');
    const priorNucleus = ids(priorTypes, 'NUCLEUS_COMPONENT_IDS');
    const added = nucleus.filter(id => !formerPorted.includes(id) && !priorNucleus.includes(id));
    const union = documents.unionFold;
    check(0, nucleus.length === 50 && new Set(nucleus).size === nucleus.length && added.length === 23
      && formerPorted.length === 8 && formerPorted.every(id => nucleus.includes(id))
      && priorNucleus.every(id => nucleus.includes(id)) && /export type GovernedComponentId = NucleusComponentId;/.test(currentTypes)
      && equal(union.nucleusComponents, nucleus) && equal(union.formerPortedComponents, formerPorted), 'One root union is derived from current and locked-base source bytes.');
    check(0, union.aliasHorizon === 'sprint-187' && union.readers?.length > 0
      && union.readers.every(row => nonempty(row.path) && nonempty(row.disposition)), 'Former ported readers have named dispositions and the one-sprint compatibility horizon.');
    for (const framework of ['react', 'vue']) {
      const packed = json(union.packedConsumers?.[framework]);
      const proof = packed.proof ?? packed.packedProof;
      check(0, packed.status === 'passed' && packed.strictCompatibilityCompile?.status === 'passed'
        && packed.strictCompatibilityCompile.skipLibCheck === false
        && formerPorted.every(id => proof?.rootRuntimeIds?.includes(id) && proof?.aliasRuntimeIds?.includes(id))
        && equal(proof.compatibilityProof?.map(row => row.componentId).sort(), [...formerPorted].sort())
        && proof.compatibilityProof.every(row => row.esmSame && row.cjsSame && row.ssrSame && row.rootMarkup === row.aliasMarkup
          && row.rootMarkup?.includes(`data-oods-component="${row.componentId}"`))
        && ['runtimeSame', 'readinessSame', 'cssSame'].every(key => proof.compatibilityResolution?.[key] === true)
        && proof.compatibilitySpecifiers?.root === proof.compatibilitySpecifiers?.alias
        && proof.resolvedSpecifiers?.[`@oods/components-${framework}`] === proof.resolvedSpecifiers?.[`@oods/components-${framework}/ported`]
        && proof.resolvedSpecifiers?.['@oods/component-styles/css'] === proof.resolvedSpecifiers?.['@oods/component-styles/css-ported'], `${framework} actually imports the eight root and compatibility exports from packed packages and strictly compiles their types.`);
    }
    const baseline = documents.baselineFold;
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const currentBaseline = json(baselinePath);
    const priorBaseline = JSON.parse(Buffer.from(readHistorical(base, baselinePath)).toString('utf8'));
    const identity = document => document.rows.map(({ id, proposedClassification, reconciliationState }) => ({ id, proposedClassification, reconciliationState }));
    check(1, currentBaseline.rows.length === 109 && equal(identity(currentBaseline), identity(priorBaseline))
      && json('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus === null,
    'All 109 baseline identities/classifications/reconciliation states match locked-base Git bytes; runtime census remains unapproved.');
    const anchored = ref => {
      const split = ref.indexOf('#'); assert(split > 0, 'Surface evidence lacks an anchor.');
      const file = ref.slice(0, split); const anchor = ref.slice(split + 1); const document = json(file);
      if (anchor.startsWith('/')) return anchor.slice(1).split('/').reduce((value, key) => {
        const decoded = key.replaceAll('~1', '/').replaceAll('~0', '~');
        assert(value != null && Object.hasOwn(value, decoded), `Unresolved surface evidence: ${ref}`); return value[decoded];
      }, document);
      const rows = [...(document.rows ?? []), ...(document.components ?? [])].filter(row => (row.componentId ?? row.id) === anchor);
      assert.equal(rows.length, 1, `Surface anchor is absent or ambiguous: ${ref}`); return rows[0];
    };
    check(1, added.every(component => ['react', 'vue', 'generatedConsumer'].every(surface => {
      const row = currentBaseline.rows.find(candidate => candidate.id === component)?.surfaces?.[surface];
      return row?.state === 'implemented-evidence-complete' && row.evidence?.length > 0 && row.evidence.every(ref => anchored(ref) != null);
    })), 'All 23 families have three evidence-complete surface cells with actual resolvable frozen anchors.');
    for (const ref of baseline.sourceHashes ?? []) reference(ref.path, ref.sha256);
    check(1, baseline.readinessReferences?.length > 0 && baseline.readinessReferences.every(row => row.resolved === true), 'Fold inputs retain their observed hashes and resolved readiness references.');
    const movers = documents.movers; const declaration = documents.moversDeclaration;
    const samePublicHead = implementationHead === executionHead || (publicHeadEquivalence?.implementationHead === implementationHead
      && publicHeadEquivalence.executionHead === executionHead && publicHeadEquivalence.ancestor === true
      && equal(publicHeadEquivalence.scope, S186_PUBLIC_RUNTIME_SCOPE) && publicHeadEquivalence.excludeTests === true
      && Array.isArray(publicHeadEquivalence.scopedChangedPaths)
      && equal(publicHeadEquivalence.changedPaths, publicHeadEquivalence.scopedChangedPaths.filter(file => !isTestPath(file)))
      && equal(publicHeadEquivalence.excludedTestPaths, publicHeadEquivalence.scopedChangedPaths.filter(isTestPath))
      && publicHeadEquivalence.changedPaths.length === 0);
    check(2, movers.status === 'passed' && movers.s186?.base === base && movers.s186.head === implementationHead && samePublicHead
      && ['canonicalPaths', 'publicPaths'].every(key => equal(movers.s186[key], declaration.s186?.[key])
        && new Set(movers.s186[key]).size === movers.s186[key].length
        && movers.comparison?.s186?.[key]?.missingFromDeclaration?.length === 0
        && movers.comparison.s186[key].extraInDeclaration?.length === 0), 'The single locked sprint range matches its declaration in both scopes and its advertised public bytes match the execution head.');
    const plan = documents.noticePlan;
    check(3, samePublicHead && equal(plan.addedNucleus, added) && equal(plan.formerPorted, formerPorted)
      && plan.aliasHorizon === 'sprint-187' && plan.notices?.length === 2
      && ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'].every(destination => {
        const notice = plan.notices.find(row => row.request?.targetAddress === destination);
        const body = notice?.request?.body ?? '';
        const deliveries = documents.deliveries.filter(row => row.targetAddress === destination);
        return notice && sha256(JSON.stringify(notice.request)) === notice.requestSha256
          && added.every(id => body.includes(id)) && formerPorted.every(id => body.includes(id))
          && ['Union fold', '/ported', '/readiness-ported', '/css-ported', 'Sprint 187', 'Emitter movers:', 'Deployment:'].every(term => body.includes(term))
          && deliveries.length === 1 && deliveries[0].status === 'sent'
          && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(deliveries[0].messageId)
          && deliveries[0].requestSha256 === notice.requestSha256;
      }) && documents.deliveries.length === 2 && new Set(documents.deliveries.map(row => row.messageId)).size === 2,
    'Two exact reconnect requests disclose families, union, aliases, emitters and deployment and retain unique real message IDs.');
    check(4, suiteAccounting.status === 'passed' && suiteAccounting.validationIssues?.length === 0
      && suiteAccounting.unattributedDeltas?.length === 0 && Object.keys(suiteAccounting.baselines ?? {}).length === 1
      && suiteAccounting.baselines.sprint185Closeout && suiteAccounting.headRelation?.ancestor === true
      && suiteAccounting.headRelation.executableInputsUnchanged === true, 'Four-suite accounting compares the Sprint 185 closeout and attributes every observed delta and failure.');
    check(4, suiteAccounting.closeout?.runs?.length === 1 && captureIds.length === 4 && new Set(captureIds).size === 4
      && captureRows.every(row => row?.evidenceKind === 'suite-receipt' && row.cohort === 'closeout' && row.measuredHead === executionHead
        && row.cleanBefore === true && row.cleanAfter === true)
      && equal(captureRows.map(row => row.suite).sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']), 'One clean frozen capture retains all four actual suite receipts, including their failures and skips.');
    check(5, sprint.status === 'Active' && near.includes('BUILT, REVIEW PENDING'), 'Frozen CMOS leaves the sprint Active and the handoff remains builder evidence pending independent review.');
  } else {
  const baseline = documents.baselineFold;
  check(0, baseline.denominator === 109 && baseline.identityClassificationAndReconciliationUnchanged === true
    && baseline.approvedRuntimeCensus === null, '109 identities/classifications/reconciliation states preserved; runtime census remains unapproved.');
  check(0, baseline.newNucleusComponents?.length === 5 && baseline.portedComponents?.length === 8
    && baseline.changedComponentCount === 13 && baseline.changedSurfaceCellCount === 39, 'Five nucleus and eight ported families have all three surface cells.');
  check(0, baseline.readinessReferences?.length > 0 && baseline.readinessReferences.every(row => row.resolved === true)
    && baseline.overlayRetirement?.readers?.length === 2 && baseline.overlayRetirement.readers.every(row => nonempty(row.disposition)), 'Readiness references resolved and both retired overlay readers have reasons.');
  const movers = documents.movers;
  const implementationHead = documents.noticePlan.implementationHead;
  const samePublicHead = implementationHead === executionHead || (publicHeadEquivalence?.implementationHead === implementationHead
    && publicHeadEquivalence.executionHead === executionHead && publicHeadEquivalence.ancestor === true
    && equal(publicHeadEquivalence.scope, PUBLIC_RUNTIME_SCOPE) && publicHeadEquivalence.excludeTests === true
    && Array.isArray(publicHeadEquivalence.scopedChangedPaths)
    && equal(publicHeadEquivalence.changedPaths, publicHeadEquivalence.scopedChangedPaths.filter(file => !isTestPath(file)))
    && equal(publicHeadEquivalence.excludedTestPaths, publicHeadEquivalence.scopedChangedPaths.filter(isTestPath))
    && publicHeadEquivalence.changedPaths.length === 0);
  check(1, movers.status === 'passed' && movers.s185?.head === implementationHead && samePublicHead
    && Object.values(movers.comparison ?? {}).length === 2
    && Object.values(movers.comparison).every(scope => Object.values(scope).every(row =>
      row.missingFromDeclaration?.length === 0 && row.extraInDeclaration?.length === 0)), 'Both sprint-wide mover sets match their declarations in both directions.');
  check(1, movers.tableControl?.status === 'passed', 'Historical Table omission control was rederived.');
  const plan = documents.noticePlan;
  const deliveries = documents.deliveries;
  const destinations = ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'];
  check(2, samePublicHead && plan.notices?.length === 2
    && destinations.every(destination => plan.notices.some(row => row.request?.targetAddress === destination
      && nonempty(row.request.body) && sha256(JSON.stringify(row.request)) === row.requestSha256)), 'Both requests bind the actual combined notice bytes and implementation head.');
  check(2, Array.isArray(deliveries) && deliveries.length === 2 && new Set(deliveries.map(row => row.messageId)).size === 2
    && destinations.every(destination => deliveries.some(row => row.targetAddress === destination && row.status === 'sent'
      && nonempty(row.messageId) && row.requestSha256 === plan.notices?.find(notice => notice.request.targetAddress === destination)?.requestSha256)), 'Two active recipients have unique nonempty sent message IDs bound to requests.');
  check(2, plan.retired?.decisionId === 1719 && plan.retired.messageId === null, 'Dashboard Demos is explicitly retired without a fabricated message.');
  const carries = documents.reviewCarries;
  check(3, carries.b2?.nextStepId === 1364 && carries.c13?.nextStepId === 1365
    && String(carries.c13.commit).startsWith('9cd02da9') && carries.c13.subjects?.length === 2, 'Named B2 and C13 additive records retain the historical commit anchor.');
  check(3, carries.c5?.controls?.length === 4 && carries.c5.controls.every(row => row.disposition === 'historical, output never captured'
    && row.countsAsCurrentProof === false), 'Four historical C5 controls are disclosed without acquiring current proof.');
  check(3, carries.increment3?.nextStepId === 1366 && carries.increment3.disposition === 'PARTIAL'
    && carries.increment3.subscriptionWorkflow?.stateAxis === 'state-neutral'
    && near.includes('Increment 3') && near.includes('PARTIAL'), 'Increment 3 partial state proof is named in the additive record and near.md.');
  const bites = documents.behaviorBites.outcomes;
  check(3, bites?.length > 0 && bites.every(row => row.preGreen === true && row.selectedRed === true && row.restoredGreen === true
    && row.originalContentHash === row.restoredContentHash && row.originalContentHash !== row.mutatedContentHash
    && row.originalSource !== row.mutatedSource && row.issues?.length > 0)
    && ['react', 'vue'].every(framework => bites.some(row => row.framework === framework && row.id.includes('void-zero') && row.mutatedSource.includes('void 0;'))), 'Hash-resealed local no-op mutations fail in both frameworks and restore exact original identity.');
  const maintenance = carries.unabsorbedMaintenance ?? [];
  check(4, equal(maintenance.map(row => row.id).sort((a, b) => a - b), [1315, 1318, 1319, 1320, 1321, 1322])
    && maintenance.every(row => nonempty(row.status) && row.completedByThisRecord === false), 'All six maintenance carries preserve named current statuses and remain unabsorbed.');
  const bridge = documents.bridge;
  check(5, (bridge.status === 'disclosed-skip' && nonempty(bridge.reason) && nonempty(bridge.buildWorktree)
    && bridge.processes?.some(row => row.name === 'oods-forge-bridge' && nonempty(row.cwd)
      && row.cwd !== bridge.buildWorktree && !row.cwd.startsWith(`${bridge.buildWorktree}/`))
    && bridge.rebuildExecuted === false && bridge.restartExecuted === false && bridge.healthAfterRestart === null)
    || (bridge.status === 'passed' && bridge.rebuildExecuted === true && bridge.restartExecuted === true
      && Number.isInteger(bridge.healthAfterRestart?.toolCount)), 'Bridge has an executed served-checkout result or the allowed explicit checkout-mismatch skip.');
  check(6, suiteAccounting.status === 'passed' && suiteAccounting.validationIssues?.length === 0
    && suiteAccounting.unattributedDeltas?.length === 0 && suiteAccounting.headRelation?.ancestor === true
    && suiteAccounting.headRelation.executableInputsUnchanged === true, 'Independent suite accounting retains actual heads, verifies ancestry and accounts for every delta.');
  const captureIds = suiteAccounting.closeout?.runs?.[0]?.suiteExecutionIds ?? [];
  const captureRows = captureIds.map(id => executions.get(id));
  check(6, suiteAccounting.closeout?.runs?.length === 1 && captureIds.length === 4 && new Set(captureIds).size === 4
    && captureRows.every(row => row?.evidenceKind === 'suite-receipt' && row.cohort === 'closeout' && row.measuredHead === executionHead
      && row.cleanBefore === true && row.cleanAfter === true)
    && equal(captureRows.map(row => row?.suite).sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']),
    'One closeout capture contains exactly four suite executions; failures/skips remain in their receipts.');
  check(7, sprint.status === 'Active' && near.includes('BUILT, REVIEW PENDING'), 'Frozen CMOS sprint remains Active and near.md says BUILT, REVIEW PENDING.');
  check(7, documents.m04BuildRecord.status === 'passed' && documents.m04BuildRecord.builderSelfCertified === false
    && documents.m04BuildRecord.separateReviewRequired === true, 'Live m04 build evidence is retained as builder evidence.');
  }

  const claims = mission.successCriteria.map((criterion, criterionIndex) => {
    const binding = manifest.claimBindings.find(row => row.criterionIndex === criterionIndex);
    assert(binding && !Object.hasOwn(binding, 'criterion') && !Object.hasOwn(binding, 'status'), 'Bindings cannot override literal criterion text or derived outcome.');
    const executionIds = [...(binding.executionIds ?? [])];
    if (binding.suiteBindings !== undefined) {
      assert.equal(criterionIndex, suiteCriterion, 'Suite selectors are reserved for the four-suite claim.');
      assert(equal([...binding.suiteBindings].sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']),
        'Suite selectors must name the four suites exactly once.');
      for (const suite of binding.suiteBindings) {
        const matches = captureRows.filter(row => row?.suite === suite && row.cohort === 'closeout');
        assert.equal(matches.length, 1, `Suite selector ${suite} must resolve one actual capture execution.`);
        executionIds.push(matches[0].id);
      }
    }
    assert(executionIds.length > 0 && binding.evidencePaths?.length > 0, `Criterion ${criterionIndex} lacks execution/evidence bindings.`);
    assert.equal(new Set(executionIds).size, executionIds.length, 'Duplicate execution within a claim.');
    for (const id of executionIds) assert(executions.has(id), `Claim cites unknown execution: ${id}`);
    const required = requiredByCriterion[criterionIndex].map(key => manifest.sources[key]);
    assert(required.every(file => binding.evidencePaths.includes(file)), `Criterion ${criterionIndex} omits required source evidence.`);
    const evidence = binding.evidencePaths.map(file => reference(file));
    const boundExecutions = executionIds.map(id => executions.get(id));
    if (criterionIndex === suiteCriterion) check(criterionIndex, captureIds.every(id => executionIds.includes(id)),
      'The four-suite claim binds each actual closeout suite execution.');
    check(criterionIndex, boundExecutions.some(row => {
      const logs = row.evidenceKind === 'suite-receipt' ? [row.log, row.receipt] : row.logs;
      return logs.some(ref => binding.evidencePaths.includes(ref.path));
    }), 'At least one cited execution output is included in this claim evidence.');
    if (criterionIndex !== suiteCriterion) check(criterionIndex, boundExecutions.some(row => row.exitCode === 0
      && row.evidenceKind === 'retained-command' && row.logs.some(ref => binding.evidencePaths.includes(ref.path))
      && [...row.inputs, ...row.outputs].some(ref => required.includes(ref.path))),
      'A successful cited command consumes or produces required claim evidence; unrelated successes and failed executions cannot prove it.');
    const unproven = checks[criterionIndex].filter(row => !row.passed).map(row => row.detail);
    return { claimId: `${missionId}-sc${String(criterionIndex + 1).padStart(2, '0')}`, criterionIndex, criterion,
      status: unproven.length ? 'unproven' : 'passed', executionIds, evidence,
      ...(binding.suiteBindings ? { suiteBindings: binding.suiteBindings } : {}),
      observations: checks[criterionIndex], unproven };
  });
  const priorClaims = [];
  if (workflow) {
    const prior = documents.missionHistory.missions.filter(row => row.id !== missionId);
    assert.equal(prior.length, 5);
    assert.equal(manifest.priorClaimBindings?.length, prior.reduce((sum, row) => sum + row.successCriteria.length, 0));
    for (const previous of prior) for (const [criterionIndex, criterion] of previous.successCriteria.entries()) {
      const matches = manifest.priorClaimBindings.filter(row => row.missionId === previous.id && row.criterionIndex === criterionIndex);
      assert.equal(matches.length, 1, 'Every earlier literal criterion needs one binding.');
      const binding = matches[0];
      assert(!Object.hasOwn(binding, 'criterion') && !Object.hasOwn(binding, 'status'));
      const evidence = binding.evidencePaths.map(file => reference(file));
      const bound = binding.executionIds.map(id => { assert(executions.has(id)); return executions.get(id); });
      assert(bound.some(row => row.exitCode === 0 && row.evidenceKind === 'retained-command'
        && row.logs.some(ref => binding.evidencePaths.includes(ref.path))
        && row.inputs.some(ref => binding.evidencePaths.includes(ref.path))), 'Historical criterion lacks a successful evidence-verification execution.');
      assert(binding.evidencePaths.includes(manifest.sources.historicalEvidence));
      priorClaims.push({ claimId: `${previous.id}-sc${String(criterionIndex + 1).padStart(2, '0')}`, missionId: previous.id,
        criterionIndex, criterion, executionIds: binding.executionIds, evidence, status: 'evidence-bound',
        disclosure: 'Retained mission execution evidence verified at the frozen head; past delivery and sends are not replayed or relabeled.' });
    }
  }
  const unproven = claims.filter(row => row.status !== 'passed').map(row => ({ claimId: row.claimId, reasons: row.unproven }));
  const ledger = { schemaVersion: '1.0.0', missionId, implementationHead, executionHead, reviewHead,
    ...(approvedTimeout ? { timeoutAcceptance: suiteAccounting.timeoutAcceptance } : {}),
    publicHeadEquivalence: implementationHead === executionHead ? { implementationHead, executionHead, identicalHead: true } : publicHeadEquivalence,
    criterionSource: reference(manifest.sources.cmosMission), originalCriterionSource: reference(manifest.sources.cmosOriginalMission),
    executions: [...executions.values()], claims, ...(workflow ? { priorClaims, boundSprintCriteria: priorClaims.length + claims.length } : {}), headline: { total: claims.length, proven: claims.length - unproven.length, unproven: unproven.length },
    unproven, status: unproven.length ? 'incomplete' : 'ready-for-independent-review', builderSelfCertified: false, separateReviewRequired: true,
    validationBoundary: 'Producer consistency checks are not independent review. A separate output-layer audit must rederive the final ledger bytes, literal claims, execution references and frozen hashes.' };
  const handoff = { schemaVersion: '1.0.0', missionId, sprintId, executionHead, reviewHead,
    ...(approvedTimeout ? { timeoutAcceptance: suiteAccounting.timeoutAcceptance } : {}),
    ...(browser ? { receipts: reference(manifest.sources.receiptSet), carryMapping: reference(manifest.sources.carryMapping), pullRequest: reference(manifest.sources.pr) } : {}),
    ...(workflow ? { implementationHead, craft: reference(manifest.sources.liveConsumers), carries: reference(manifest.sources.carries), boundSprintCriteria: priorClaims.length + claims.length } : {}),
    sprintStatus: sprint.status, sprintStatusSource: reference(manifest.sources.cmosSprint),
    builderSelfCertified: false, separateReviewRequired: true, approvalStatus: 'pending-independent-review',
    buildStatus: 'BUILT, REVIEW PENDING', unproven,
    executionDisclosure: 'Tests ran at executionHead. reviewHead retains their evidence and may be a verified evidence-only descendant. No execution is relabeled.',
    reviewerObligation: 'Independently rederive each claim from frozen inputs, inspect failed/skipped suite observations and unresolved carries, and decide whether to close the Active sprint.' };
  const outputs = { [outputPaths.accounting]: suiteAccounting, [outputPaths.ledger]: ledger, [outputPaths.handoff]: handoff };
  handoff.outputAudit = { status: 'pending-output-layer-audit', path: outputPaths.audit };
  if (finalAudit) {
    assert.equal(finalAudit.executionHead, executionHead); assert.equal(finalAudit.reviewHead, reviewHead);
    assert.equal(finalAudit.status, 'passed'); assert.equal(finalAudit.exitCode, 0);
    assert(nonempty(finalAudit.command) && nonempty(finalAudit.host) && typeof finalAudit.stdout === 'string', 'Final audit lacks actual command/host/stdout.');
    assert.equal(digest(finalAudit.ledgerSha256), sha256(canonicalJson(ledger)), 'Final audit targets different ledger bytes.');
    assert.equal(digest(finalAudit.accountingSha256), sha256(canonicalJson(suiteAccounting)), 'Final audit targets different accounting bytes.');
    const { stdout, ...audit } = finalAudit;
    outputs[outputPaths.auditLog] = stdout;
    outputs[outputPaths.audit] = { ...audit, stdout: { path: outputPaths.auditLog, sha256: sha256(stdout), bytes: Buffer.byteLength(stdout) },
      scope: 'Audits ledger/accounting and their frozen inputs; excludes this report and the handoff/index that depend on it.' };
    handoff.outputAudit = { status: 'passed', path: outputPaths.audit, sha256: sha256(canonicalJson(outputs[outputPaths.audit])) };
  }
  outputs[outputPaths.index] = { schemaVersion: '1.0.0', missionId, executionHead, reviewHead,
    frozenInputs: [...frozen.values()].sort((a, b) => a.path.localeCompare(b.path)),
    generatedOutputs: Object.entries(outputs).map(([file, value]) => {
      const bytes = typeof value === 'string' ? value : canonicalJson(value);
      return { path: file, bytes: Buffer.byteLength(bytes), sha256: sha256(bytes), commit: null };
    }),
    selfExcluded: true, selfExclusionReason: 'The index excludes itself to keep the hash graph acyclic.' };
  return outputs;
}

/** Bounded Sprint 188 mode: verify retained mission receipts without replaying delivery. */
export function verifySprint188History({ root, output }) {
  const base = 'artifacts/product-reality/sprint-188/';
  const plan = JSON.parse(fs.readFileSync(path.join(root, base + 'm06/retained-evidence-plan.json'), 'utf8'));
  assert.equal(plan.bindings.length, 33);
  assert.equal(new Set(plan.bindings.map(row => `${row.missionId}/${row.criterionIndex}`)).size, 33);
  const references = new Map();
  for (const binding of plan.bindings) for (const file of binding.evidencePaths) {
    const bytes = fs.readFileSync(path.join(root, file));
    const head = execFileSync('git', ['rev-parse', binding.missionCommit], { cwd: root, encoding: 'utf8' }).trim();
    assert(bytes.equals(execFileSync('git', ['show', `${head}:${file}`], { cwd: root, maxBuffer: 32 * 1024 * 1024 })), `Retained mission bytes changed: ${file}`);
    references.set(file, { path: file, sha256: sha256(bytes), missionId: binding.missionId, missionHead: head });
  }
  const read = file => JSON.parse(fs.readFileSync(path.join(root, base + file), 'utf8'));
  const delivered = read('m01/verification-summary.json');
  assert.equal(delivered.publicCalls, 17); assert.equal(delivered.successfulHttpResponses, 17); assert.equal(delivered.expectedNegativeCells, 2);
  assert(read('m01/build-results.json').every(row => row.exitCode === 0));
  const adoption = read('m01/adoption.json'); assert.equal(adoption.unrelatedRecordsByteIdentical, 15); assert(adoption.unrelatedIndexEntriesUnchanged);
  assert.equal(adoption.before['user-form-showcase.json'], 'd25d9ce30988cd5e26b390a5b43ce005f2055b765b8bc3abadc263571a848bb2');
  const sends = read('m01/reconnect-sent.json'); assert.equal(sends.length, 2);
  assert.deepEqual(sends.map(row => row.targetAddress).sort(), ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']);
  assert(sends.every(row => row.result.structuredContent.success && row.result.structuredContent.data.messageId));
  const second = read('m02/verification-summary.json'); assert.equal(second.existingSchemas, 66); assert.equal(second.existingGenerationCells, 132);
  assert.equal(second.labelsChanged, 24); assert.equal(second.traitBindingsAdded, 14); assert(second.applications.every(row => row.status === 'ok' && row.strictTypecheck === 'passed'));
  for (const [mission, count] of [['m04', 9], ['m05', 13]]) {
    const parity = read(`${mission}/parity.json`); assert.deepEqual(parity.allowlist, []); assert.equal(parity.receipts.length, count);
    assert(parity.receipts.every(row => row.differences.length === 0));
    const bites = read(`${mission}/export-bites/mutation-manifest.json`); assert.equal(bites.mutants.length, mission === 'm04' ? 6 : 10);
    assert(bites.mutants.every(row => row.status === 'passed' && row.restoredByteIdentically && row.sourceSha256Before !== row.sourceSha256Deleted));
  }
  for (const [mission, directory, flows, screenshots] of [['m03', 'final-verified', 7, 24], ['m04', 'resolved-app-consumers-final', 9, 24], ['m05', 'app-consumers-final', 9, 36]]) {
    const app = read(`${mission}/${directory}/report.json`);
    assert.equal(app.cells.length, 2); assert.equal(app.stateObservations.length, 32); assert.equal(app.screenshots.length, screenshots);
    assert(app.cells.every(cell => cell.gates.length === 8 && cell.gates.every(gate => gate.status === 'passed') && cell.flow.length === flows && cell.flow.every(row => row.status === 'passed')));
    for (const image of app.screenshots) {
      const file = `${base}${mission}/${directory}/${image.file}`;
      const bytes = fs.readFileSync(path.join(root, file)); assert.equal(sha256(bytes), digest(image.sha256));
      references.set(file, { path: file, sha256: sha256(bytes) });
    }
  }
  assert.equal(read('m04/resolved-census.json').unchanged, 64); assert.equal(read('m05/resolved-census.json').unchanged, 61);
  const health = read('m05/catalog-health-final.json'); assert.deepEqual(health.health.revision, health.serverStamp); assert.equal(health.foundationRows.length, 14);
  assert(health.foundationRows.every(row => ['react', 'vue'].every(target => row.productReality.surfaces[target].state === 'implemented-evidence-complete')));
  assert(health.frozen.every(row => row.current === row.original && row.unchanged));
  const result = { status: 'passed', sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(),
    boundCriteria: plan.bindings.length, references: [...references.values()], replayedExternalActions: 0,
    disclosure: plan.disclosure };
  fs.mkdirSync(path.dirname(output), {recursive: true}); fs.writeFileSync(output, canonicalJson(result)); return result;
}

/** Sprint 189 reuses retained-history verification with its own literal bindings. */
export function verifySprint189History({ root, output }) {
  const base = 'artifacts/product-reality/sprint-189/';
  const plan = JSON.parse(fs.readFileSync(path.join(root, base + 'm06/retained-evidence-plan.json'), 'utf8'));
  const references = new Map();
  assert.equal(plan.bindings.length, 30);
  assert.equal(new Set(plan.bindings.map(row => `${row.missionId}/${row.criterionIndex}`)).size, 30);
  for (const binding of plan.bindings) for (const file of binding.evidencePaths) {
    const bytes = fs.readFileSync(path.join(root, file));
    assert(bytes.equals(execFileSync('git', ['show', `${binding.missionCommit}:${file}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 })), `Retained mission bytes changed: ${file}`);
    references.set(file, { path: file, sha256: sha256(bytes), missionId: binding.missionId, missionHead: binding.missionCommit });
  }
  const read = file => JSON.parse(fs.readFileSync(path.join(root, base + file), 'utf8'));
  const sends = read('m01/reconnect-sent.json'); assert.equal(sends.length, 2); assert(sends.every(row => row.result.structuredContent.success));
  for (const mission of ['m03', 'm04', 'm05']) {
    const folder = ['m03', 'm04'].includes(mission) ? 'app-consumers-final' : 'app-consumers';
    const app = read(`${mission}/${folder}/report.json`);
    assert.equal(app.stateObservations.length, 32); assert(app.cells.every(cell => cell.gates.every(gate => gate.status === 'passed') && cell.flow.every(row => row.status === 'passed')));
  }
  assert.equal(read('m04/parity.json').differenceCount, 0); assert.equal(read('m05/timeline-parity.json').differenceCount, 0);
  assert.equal(read('m05/bridge-health.json').toolset.enabledCount, 21);
  const result = { status: 'passed', sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), boundCriteria: 30, references: [...references.values()], replayedExternalActions: 0, disclosure: plan.disclosure };
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, canonicalJson(result)); return result;
}

/** Sprint 190's bounded visualization packet; historical modes above stay unchanged. */
export function deriveSprint190Closeout({ executionHead, reviewHead, manifest, readFrozen, readHistorical, suiteAccounting, publicHeadEquivalence }) {
  assert(fullHead(executionHead) && fullHead(reviewHead));
  const paydown = manifest.missionId === 's191-m05';
  const base = paydown ? 'artifacts/product-reality/sprint-191/m05' : 'artifacts/product-reality/sprint-190/m06';
  const references = new Map();
  const bytes = file => { safePath(file); const value = readFrozen(file); references.set(file, { path: file, sha256: sha256(value), bytes: value.length }); return value; };
  const json = key => JSON.parse(bytes(manifest.sources[key]));
  const missions = json('missions');
  assert.equal(missions.sprintStatus, 'Active'); assert.equal(missions.builderSelfCertified, false);
  assert.deepEqual(missions.missions.map(row => row.id), paydown ? ['s191-m01','s191-m02','s191-m03','s191-m04','s191-m05'] : ['s190-m01','s190-m02','s190-m03','s190-m04','s190-m05','s190-m06']);
  const registry = json('registry'), census = json('vizCensus'), observations = json('vizObservations');
  assert.deepEqual(registry, census); assert.equal(registry.length, 13);
  assert.equal(registry.filter(row => row.publicSvg).length, 13);
  assert.equal(registry.filter(row => row.dashboardDrawn === true).length, 11);
  assert.deepEqual(registry.filter(row => row.dashboardDrawn !== true).map(row => row.chartType).sort(), ['chord','flow_map']);
  assert.equal(registry.filter(row => row.certifyCoverage === 'certified').length, 5);
  if (paydown) {
    assert.equal(registry.filter(row => row.contrastPassed.length === 2).length, 9);
    for (const row of registry) assert.deepEqual(row.contrastPassed, row.contrastMeasured.length ? ['light','dark'] : []);
    assert(observations.observations.flatMap(row => row.scopes).every(scope => scope.contrast.verdict !== 'fail'));
  }
  assert.deepEqual(observations.placements, [{ object:'Subscription', context:'detail', chartType:'area' }]);
  for (const row of observations.observations) {
    assert.equal(row.scopes.length, 4);
    for (const scope of row.scopes) { assert.equal(scope.svgHash, scope.renderHash); if (scope.coverage === 'uncertified') assert.equal(scope.conformant, null); }
  }
  const matrix = json('matrix'); assert.equal(matrix.table.length, 52);
  assert.equal(matrix.head, manifest.implementationHead);
  for (const row of matrix.table) { assert.equal(row.svgHash, row.secondHash); assert.equal(row.canvas, row.expectedCanvas); assert.equal(sha256(bytes(`${path.posix.dirname(manifest.sources.matrix)}/${row.file}`)), row.svgHash); }
  assert.equal(matrix.dashboards.length, 4);
  for (const row of matrix.dashboards) { assert.equal(row.svgCount, 11); assert.equal(row.outputHtmlHash, row.secondHash); assert.equal(sha256(bytes(`${path.posix.dirname(manifest.sources.matrix)}/${row.file}`)), row.outputHtmlHash); }
  const component = json('componentCensus');
  assert.equal(component.head, manifest.implementationHead);
  assert.equal(component.schemaCount, 66); assert.equal(component.greenSchemas, 66); assert.equal(component.greenCells, 132); assert(component.workflow.green);
  assert.equal(component.totalSchemas, 77); assert.equal(component.greenTotalSchemas, paydown ? 77 : 75); assert.equal(component.greenTotalCells, paydown ? 154 : 150);
  assert.deepEqual(component.allRows.filter(row => !row.green).map(row => `${row.input.object}/${row.input.context}`).sort(), paydown ? [] : ['Organization/workflow','User/workflow']);
  assert.equal(json('originalStore').reachable, 15); assert.equal(json('successorStore').reachable, 16);
  const compatibility = json('compatibility'); assert.equal(compatibility.liveStoreFiles, 17); assert.equal(compatibility.changedLiveFiles, 0);
  const movement = json('schemaMovement'); if (paydown) { assert.deepEqual(movement.statusChanges, ['Organization/workflow','User/workflow']); assert.equal(movement.unattributedChanges.length, 0); assert.equal(movement.workflowCells, 6); } else { assert.deepEqual(movement.changedSchemas, ['Subscription/detail']); assert.equal(movement.class, 'h'); }
  const flows = json('flows'); assert.equal(flows.sourceHead, manifest.implementationHead); assert.equal(flows.stateObservations.length, paydown ? 96 : 32); assert.equal(flows.screenshots.length, paydown ? 84 : 36);
  for (const cell of flows.cells) { assert.equal(cell.gates.length, 8); assert(cell.gates.every(gate => gate.status === 'passed')); assert.equal(cell.flow.length, paydown && cell.object !== 'Subscription' ? 6 : 9); assert(cell.flow.every(flow => flow.status === 'passed')); }
  for (const row of flows.screenshots) assert.equal(sha256(bytes(`${path.posix.dirname(manifest.sources.flows)}/${row.file}`)), digest(row.sha256));
  const browser = json('browserReceipts');
  if (paydown) {
    assert.equal(browser.sourceHead, manifest.implementationHead); assert.equal(browser.status, 'passed');
    assert.equal(browser.receipts.length, 34);
    for (const ref of browser.references) assert.equal(sha256(bytes(ref.path)), digest(ref.sha256));
    for (const row of browser.receipts) { assert.equal(row.sourceHead, manifest.implementationHead); }
    const runtime = json('runtime'); assert.equal(runtime.head, manifest.implementationHead); assert.equal(runtime.status, 'passed');
    assert.equal(runtime.reproducible, true); assert.equal(runtime.manifest.commit, manifest.implementationHead); assert.equal(runtime.manifest.dirty, false);
    assert.equal(runtime.e2e.exitCode, 0); for (const ref of runtime.references) assert.equal(sha256(bytes(ref.path)), digest(ref.sha256));
    const repin = json('repin'); assert.equal(repin.status, 'prepared-unsent'); assert.equal(repin.implementationHead, manifest.implementationHead); assert.equal(repin.archiveSha256, runtime.archiveSha256);
    assert.deepEqual(repin.targets, ['aquex-mcp','forge-demos','shopify-forge']);
  } else {
  assert.equal(browser.receipts.length, 4);
  for (const ref of browser.receipts) {
    const raw = bytes(ref.path); assert.equal(sha256(raw), ref.sha256);
    const receipt = JSON.parse(raw); assert.equal(receipt.sourceHead, manifest.implementationHead); assert.deepEqual(receipt.errors, []);
    assert.deepEqual(receipt.views.map(view => view.width), [390,820,1440]);
    for (const view of receipt.views) { assert(view.accessibility.includes('img "Payment amounts"')); assert(view.accessibility.includes('graphics-object')); assert.deepEqual(view.measurements.overflow, []); assert.equal(sha256(bytes(`${path.posix.dirname(ref.path)}/${view.screenshot}`)), digest(view.screenshotHash)); }
  }
  }
  assert.equal(suiteAccounting.status, 'passed'); assert.deepEqual(suiteAccounting.validationIssues, []); assert.deepEqual(suiteAccounting.unattributedDeltas, []);
  assert.equal(suiteAccounting.closeout.runs.length, 1); assert.equal(suiteAccounting.closeout.runs[0].suiteExecutionIds.length, 4);
  assert(suiteAccounting.goldenAttribution.files.length > 0); if (!paydown) assert.equal(suiteAccounting.goldenAttribution.files.length, 15);
  assert(publicHeadEquivalence.ancestor); assert.deepEqual(publicHeadEquivalence.changedPaths, []);
  const notice = json('noticePlan'), movers = json('movers');
  assert.equal(notice.implementationHead, manifest.implementationHead); assert.equal(notice.sent, false);
  assert.deepEqual(notice.targets, paydown ? ['cmos-dashboard','forge-demos','aquex-mcp'] : ['cmos-dashboard','dashboard-demos','forge-demos','aquex-mcp']);
  assert.equal(movers[paydown ? 's191' : 's190'].head, manifest.implementationHead); assert.equal(movers.status, 'passed');
  const ci = json('ci'); assert.equal(ci.baseRefName, 'OODS-pro'); assert.equal(ci.headRefName, paydown ? 'codex/sprint-191-paydown' : 'codex/sprint-190-viz-public-render'); assert(ci.url.startsWith('https://github.com/'));
  for (const job of (paydown ? ['pkg-compat','viz-determinism','coverage','portable-runtime'] : ['pkg-compat','viz-determinism','coverage'])) assert(ci.jobs.some(row => row.name === job && row.runId && row.status === 'completed' && row.conclusion === 'success'), `Remote CI missing: ${job}`);
  assert.equal(json('prose').exitCode, 0);
  const near = bytes(manifest.sources.near).toString('utf8'), program = bytes(manifest.sources.program).toString('utf8');
  assert(near.includes(paydown ? 'Increment 10' : 'Increment 9') && near.includes('BUILT, REVIEW PENDING') && program.includes('13/13 public SVG'));
  const executions = manifest.executions.map(row => {
    assert(nonempty(row.id) && fullHead(row.head) && row.evidencePaths.length);
    const evidence = row.evidencePaths.map(file => {
      const current = bytes(file);
      if (row.historical) assert(current.equals(readHistorical(row.head, file)), `Historical execution changed: ${file}`);
      return references.get(file);
    });
    return { ...row, evidence };
  });
  assert.equal(new Set(executions.map(row => row.id)).size, executions.length);
  const expected = missions.missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId:mission.id, criterionIndex:index+1, criterion })));
  assert.equal(expected.length, paydown ? 33 : 37); assert.equal(manifest.bindings.length, expected.length);
  const claims = expected.map(criterion => {
    const bindings = manifest.bindings.filter(row => row.missionId === criterion.missionId && row.criterionIndex === criterion.criterionIndex);
    assert.equal(bindings.length, 1); const binding = bindings[0]; assert(binding.executionIds.length && binding.evidencePaths.length);
    for (const id of binding.executionIds) assert(executions.some(row => row.id === id));
    for (const file of binding.evidencePaths) bytes(file);
    return { ...criterion, status:'proven', executionIds:binding.executionIds, evidence:binding.evidencePaths.map(file => references.get(file)) };
  });
  const shared = { missionId:manifest.missionId, sprintStatus:'Active', builderSelfCertified:false, separateReviewRequired:true, implementationHead:manifest.implementationHead, executionHead, reviewHead };
  return {
    [`${base}/closeout/claim-ledger.json`]: { ...shared, claims, executions, headline:{total:expected.length,proven:expected.length,unproven:0}, references:[...references.values()] },
    [`${base}/closeout/review-handoff.json`]: { ...shared, state:'BUILT, REVIEW PENDING', registry:manifest.sources.registry, matrix:manifest.sources.matrix, browserReceipts:manifest.sources.browserReceipts, claims:`${base}/closeout/claim-ledger.json`, suiteAccounting:`${base}/closeout/suite-accounting.json`, reconnect:notice, pullRequest:ci, ...(paydown ? { componentCensus:manifest.sources.componentCensus, bundleManifest:manifest.sources.runtime, repin:manifest.sources.repin } : {}), limitations:['HC pixels deferred (#1851).',...(paydown ? ['Categorical Role-A cautions remain cautions; Role-C passes.', 'Three generated light shell files per framework changed under the explicit m01 user exception.'] : ['Dark categorical contrast failures remain failures.']),'Eight ECharts types remain uncertified with conformant:null.','Sample payment SVGs do not regenerate on form edits.'] },
    [`${base}/closeout/suite-accounting.json`]: suiteAccounting,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  if (argument('--verify-history189')) {
    const result = verifySprint189History({ root: process.cwd(), output: path.resolve(argument('--verify-history189')) });
    process.stdout.write(canonicalJson({ status: result.status, boundCriteria: result.boundCriteria, references: result.references.length }));
  } else if (argument('--verify-history')) {
    const result = verifySprint188History({ root: process.cwd(), output: path.resolve(argument('--verify-history')) });
    process.stdout.write(canonicalJson({status: result.status, boundCriteria: result.boundCriteria, references: result.references.length}));
  } else {
  const root = path.resolve(argument('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  const executionHead = argument('--execution-head'); const reviewHead = argument('--review-head');
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Supply full --execution-head and --review-head SHAs.');
  const outputRoot = path.resolve(argument('--output') ?? root);
  const manifestPath = argument('--manifest') ?? MANIFEST_PATH;
  const readFrozen = file => execFileSync('git', ['show', `${reviewHead}:${safePath(file)}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
  const manifest = JSON.parse(readFrozen(manifestPath).toString('utf8'));
  manifest.manifestPath = manifestPath;
  const readHistorical = (commit, file) => execFileSync('git', ['show', `${commit}:${safePath(file)}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
  const attributionPath = argument('--attributions');
  const failurePath = argument('--failures');
  const suiteAccounting = deriveSuiteAccounting({ root, executionHead, reviewHead,
    ...(manifest.missionId === 's191-m05' ? { sprintId: 'sprint-191', missionId: manifest.missionId, ...manifest.accounting } : manifest.missionId === 's190-m06' ? { sprintId: 'sprint-190', missionId: manifest.missionId, ...manifest.accounting } : manifest.missionId === 's189-m06' ? { sprintId: 'sprint-189', missionId: manifest.missionId, ...manifest.accounting } : manifest.missionId === 's188-m06' ? { sprintId: 'sprint-188', missionId: manifest.missionId, ...manifest.accounting } : manifest.missionId === 's187-m06' ? { sprintId: 'sprint-187', missionId: manifest.missionId, ...manifest.accounting } : manifest.missionId === 's186-m06' ? { sprintId: 'sprint-186', missionId: manifest.missionId, ...manifest.accounting } : {}),
    ...(attributionPath ? { attributions: JSON.parse(readFrozen(attributionPath).toString('utf8')) } : {}),
    ...(failurePath ? { failureDispositions: JSON.parse(readFrozen(failurePath).toString('utf8')) } : {}) });
  const implementationHead = JSON.parse(readFrozen(manifest.sources.noticePlan).toString('utf8')).implementationHead;
  const publicHeadEquivalence = derivePublicHeadEquivalence({ root, implementationHead, executionHead,
    sprintId: manifest.missionId === 's191-m05' ? 'sprint-191' : manifest.missionId === 's190-m06' ? 'sprint-190' : manifest.missionId === 's189-m06' ? 'sprint-189' : manifest.missionId === 's188-m06' ? 'sprint-188' : manifest.missionId === 's187-m06' ? 'sprint-187' : manifest.missionId === 's186-m06' ? 'sprint-186' : 'sprint-185' });
  const auditPath = argument('--final-audit');
  const outputs = deriveCloseout({ executionHead, reviewHead, manifest, readFrozen, readHistorical, suiteAccounting, publicHeadEquivalence,
    ...(auditPath ? { finalAudit: JSON.parse(fs.readFileSync(path.resolve(auditPath), 'utf8')) } : {}) });
  for (const [file, value] of Object.entries(outputs)) {
    const target = path.join(outputRoot, file); const serialized = typeof value === 'string' ? value : canonicalJson(value);
    if (process.argv.includes('--check')) assert.equal(fs.readFileSync(target, 'utf8'), serialized, `Derived output differs: ${file}`);
    else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, serialized); }
  }
  const ledger = Object.values(outputs).find(value => value?.headline && value?.claims);
  process.stdout.write(canonicalJson(ledger.headline));
}
}
