#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { deriveSuiteAccounting } from './s185-suite-accounting.mjs';
import { PUBLIC_RUNTIME_SCOPE } from './s185-sprint-wide-movers.mjs';

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

/** Pure derivation over explicitly supplied frozen bytes; no working-tree fallback. */
export function deriveCloseout({ executionHead, reviewHead, manifest, readFrozen, suiteAccounting, publicHeadEquivalence, finalAudit }) {
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Both full execution and review commit SHAs are required.');
  assert.equal(manifest.missionId, 's185-m05');
  assert(!Object.hasOwn(manifest, 'criteria') && !Object.hasOwn(manifest, 'claims'), 'Criterion text and outcomes cannot be supplied by the manifest.');
  const frozen = new Map();
  const frozenBytes = new Map();
  function reference(file, expectedHash) {
    safePath(file);
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
  for (const key of mandatorySources) assert(nonempty(manifest.sources?.[key]), `Missing source: ${key}`);
  assert(Array.isArray(manifest.sources.derivationInputs) && manifest.sources.derivationInputs.length > 0,
    'Derivation source and independent verification inputs must be frozen.');
  for (const file of manifest.sources.derivationInputs) reference(file);
  if (manifest.manifestPath) reference(manifest.manifestPath);
  const documents = Object.fromEntries(mandatorySources.filter(key => key !== 'near')
    .map(key => [key, json(manifest.sources[key])]));
  const near = text(manifest.sources.near);
  const mission = documents.cmosMission.rawResponse?.structuredContent?.data;
  const originalMission = documents.cmosOriginalMission.rawResponse?.structuredContent?.data;
  const sprint = documents.cmosSprint.rawResponse?.structuredContent?.data;
  assert.equal(mission?.id, 's185-m05');
  assert.equal(originalMission?.id, 's185-m05');
  assert.equal(sprint?.id, 'sprint-185');
  assert(Array.isArray(mission.successCriteria) && mission.successCriteria.length === 8
    && mission.successCriteria.every(nonempty), 'All eight literal CMOS criteria are required.');
  assert(Array.isArray(manifest.claimBindings) && manifest.claimBindings.length === 8, 'Exactly eight claim bindings required.');
  assert.equal(new Set(manifest.claimBindings.map(row => row.criterionIndex)).size, 8, 'Duplicate criterion binding.');

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

  const checks = Array.from({ length: 8 }, () => []);
  const check = (index, condition, detail) => checks[index].push({ detail, passed: !!condition });
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
    && equal(publicHeadEquivalence.scope, PUBLIC_RUNTIME_SCOPE) && publicHeadEquivalence.changedPaths?.length === 0);
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

  const claims = mission.successCriteria.map((criterion, criterionIndex) => {
    const binding = manifest.claimBindings.find(row => row.criterionIndex === criterionIndex);
    assert(binding && !Object.hasOwn(binding, 'criterion') && !Object.hasOwn(binding, 'status'), 'Bindings cannot override literal criterion text or derived outcome.');
    const executionIds = [...(binding.executionIds ?? [])];
    if (binding.suiteBindings !== undefined) {
      assert.equal(criterionIndex, 6, 'Suite selectors are reserved for the four-suite claim.');
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
    const required = criterionSources[criterionIndex].map(key => manifest.sources[key]);
    assert(required.every(file => binding.evidencePaths.includes(file)), `Criterion ${criterionIndex} omits required source evidence.`);
    const evidence = binding.evidencePaths.map(file => reference(file));
    const boundExecutions = executionIds.map(id => executions.get(id));
    if (criterionIndex === 6) check(criterionIndex, captureIds.every(id => executionIds.includes(id)),
      'The four-suite claim binds each actual closeout suite execution.');
    check(criterionIndex, boundExecutions.some(row => {
      const logs = row.evidenceKind === 'suite-receipt' ? [row.log, row.receipt] : row.logs;
      return logs.some(ref => binding.evidencePaths.includes(ref.path));
    }), 'At least one cited execution output is included in this claim evidence.');
    if (criterionIndex !== 6) check(criterionIndex, boundExecutions.some(row => row.exitCode === 0
      && row.evidenceKind === 'retained-command' && row.logs.some(ref => binding.evidencePaths.includes(ref.path))
      && [...row.inputs, ...row.outputs].some(ref => required.includes(ref.path))),
      'A successful cited command consumes or produces required claim evidence; unrelated successes and failed executions cannot prove it.');
    const unproven = checks[criterionIndex].filter(row => !row.passed).map(row => row.detail);
    return { claimId: `s185-m05-sc${String(criterionIndex + 1).padStart(2, '0')}`, criterionIndex, criterion,
      status: unproven.length ? 'unproven' : 'passed', executionIds, evidence,
      ...(binding.suiteBindings ? { suiteBindings: binding.suiteBindings } : {}),
      observations: checks[criterionIndex], unproven };
  });
  const unproven = claims.filter(row => row.status !== 'passed').map(row => ({ claimId: row.claimId, reasons: row.unproven }));
  const ledger = { schemaVersion: '1.0.0', missionId: 's185-m05', implementationHead, executionHead, reviewHead,
    publicHeadEquivalence: implementationHead === executionHead ? { implementationHead, executionHead, identicalHead: true } : publicHeadEquivalence,
    criterionSource: reference(manifest.sources.cmosMission), originalCriterionSource: reference(manifest.sources.cmosOriginalMission),
    executions: [...executions.values()], claims, headline: { total: claims.length, proven: claims.length - unproven.length, unproven: unproven.length },
    unproven, status: unproven.length ? 'incomplete' : 'ready-for-independent-review', builderSelfCertified: false, separateReviewRequired: true,
    validationBoundary: 'Producer consistency checks are not independent review. A separate output-layer audit must rederive the final ledger bytes, literal claims, execution references and frozen hashes.' };
  const handoff = { schemaVersion: '1.0.0', missionId: 's185-m05', sprintId: 'sprint-185', executionHead, reviewHead,
    sprintStatus: sprint.status, sprintStatusSource: reference(manifest.sources.cmosSprint),
    builderSelfCertified: false, separateReviewRequired: true, approvalStatus: 'pending-independent-review',
    buildStatus: 'BUILT, REVIEW PENDING', unproven,
    executionDisclosure: 'Tests ran at executionHead. reviewHead retains their evidence and may be a verified evidence-only descendant. No execution is relabeled.',
    reviewerObligation: 'Independently rederive each claim from frozen inputs, inspect failed/skipped suite observations and unresolved carries, and decide whether to close the Active sprint.' };
  const outputs = { [OUTPUT_PATHS.accounting]: suiteAccounting, [OUTPUT_PATHS.ledger]: ledger, [OUTPUT_PATHS.handoff]: handoff };
  handoff.outputAudit = { status: 'pending-output-layer-audit', path: OUTPUT_PATHS.audit };
  if (finalAudit) {
    assert.equal(finalAudit.executionHead, executionHead); assert.equal(finalAudit.reviewHead, reviewHead);
    assert.equal(finalAudit.status, 'passed'); assert.equal(finalAudit.exitCode, 0);
    assert(nonempty(finalAudit.command) && nonempty(finalAudit.host) && typeof finalAudit.stdout === 'string', 'Final audit lacks actual command/host/stdout.');
    assert.equal(digest(finalAudit.ledgerSha256), sha256(canonicalJson(ledger)), 'Final audit targets different ledger bytes.');
    assert.equal(digest(finalAudit.accountingSha256), sha256(canonicalJson(suiteAccounting)), 'Final audit targets different accounting bytes.');
    const { stdout, ...audit } = finalAudit;
    outputs[OUTPUT_PATHS.auditLog] = stdout;
    outputs[OUTPUT_PATHS.audit] = { ...audit, stdout: { path: OUTPUT_PATHS.auditLog, sha256: sha256(stdout), bytes: Buffer.byteLength(stdout) },
      scope: 'Audits ledger/accounting and their frozen inputs; excludes this report and the handoff/index that depend on it.' };
    handoff.outputAudit = { status: 'passed', path: OUTPUT_PATHS.audit, sha256: sha256(canonicalJson(outputs[OUTPUT_PATHS.audit])) };
  }
  outputs[OUTPUT_PATHS.index] = { schemaVersion: '1.0.0', missionId: 's185-m05', executionHead, reviewHead,
    frozenInputs: [...frozen.values()].sort((a, b) => a.path.localeCompare(b.path)),
    generatedOutputs: Object.entries(outputs).map(([file, value]) => {
      const bytes = typeof value === 'string' ? value : canonicalJson(value);
      return { path: file, bytes: Buffer.byteLength(bytes), sha256: sha256(bytes), commit: null };
    }),
    selfExcluded: true, selfExclusionReason: 'The index excludes itself to keep the hash graph acyclic.' };
  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const root = path.resolve(argument('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  const executionHead = argument('--execution-head'); const reviewHead = argument('--review-head');
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Supply full --execution-head and --review-head SHAs.');
  const outputRoot = path.resolve(argument('--output') ?? root);
  const manifestPath = argument('--manifest') ?? MANIFEST_PATH;
  const readFrozen = file => execFileSync('git', ['show', `${reviewHead}:${safePath(file)}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
  const manifest = JSON.parse(readFrozen(manifestPath).toString('utf8'));
  manifest.manifestPath = manifestPath;
  const attributionPath = argument('--attributions');
  const failurePath = argument('--failures');
  const suiteAccounting = deriveSuiteAccounting({ root, executionHead, reviewHead,
    ...(attributionPath ? { attributions: JSON.parse(readFrozen(attributionPath).toString('utf8')) } : {}),
    ...(failurePath ? { failureDispositions: JSON.parse(readFrozen(failurePath).toString('utf8')) } : {}) });
  const implementationHead = JSON.parse(readFrozen(manifest.sources.noticePlan).toString('utf8')).implementationHead;
  assert(fullHead(implementationHead), 'Notice must retain its full actual implementation head.');
  execFileSync('git', ['merge-base', '--is-ancestor', implementationHead, executionHead], { cwd: root });
  const changedPaths = execFileSync('git', ['diff', '--name-only', implementationHead, executionHead, '--', ...PUBLIC_RUNTIME_SCOPE], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const publicHeadEquivalence = { implementationHead, executionHead, ancestor: true, changedPaths, scope: PUBLIC_RUNTIME_SCOPE };
  const auditPath = argument('--final-audit');
  const outputs = deriveCloseout({ executionHead, reviewHead, manifest, readFrozen, suiteAccounting, publicHeadEquivalence,
    ...(auditPath ? { finalAudit: JSON.parse(fs.readFileSync(path.resolve(auditPath), 'utf8')) } : {}) });
  for (const [file, value] of Object.entries(outputs)) {
    const target = path.join(outputRoot, file); const serialized = typeof value === 'string' ? value : canonicalJson(value);
    if (process.argv.includes('--check')) assert.equal(fs.readFileSync(target, 'utf8'), serialized, `Derived output differs: ${file}`);
    else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, serialized); }
  }
  process.stdout.write(canonicalJson(outputs[OUTPUT_PATHS.ledger].headline));
}
