#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// Deliberately independent of the closeout producer and suite-accounting
// checker. Read their actual outputs, then check the frozen operands directly.
const prefix = 'artifacts/product-reality/sprint-185/m05/closeout';
const defaultManifest = 'artifacts/product-reality/sprint-185/m05/closeout-inputs/manifest.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const bare = value => String(value).replace(/^sha256:/, '');
const fullHead = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
// Independent copy of the reviewed public byte scope; do not import the
// producer's predicate or accept its equivalence boolean as audit evidence.
const publicScope = [
  'configs/agent/policy.json', 'docs/api', 'packages/mcp-adapter/tool-descriptions.json',
  'packages/mcp-server/src/schemas', 'packages/mcp-server/src/schemas/generated.ts',
  'packages/mcp-server/src/security/policy.json', 'packages/mcp-server/src/tools/registry.json',
  'packages/component-contracts/package.json', 'packages/component-contracts/src', 'packages/component-contracts/registry',
  'packages/component-styles/package.json', 'packages/component-styles/src', 'packages/component-styles/scripts', 'packages/component-styles/tsup.config.ts',
  'packages/components-react/package.json', 'packages/components-react/src', 'packages/components-react/evidence', 'packages/components-react/tsup.config.ts',
  'packages/components-vue/package.json', 'packages/components-vue/src', 'packages/components-vue/evidence', 'packages/components-vue/tsup.config.ts', 'packages/components-vue/tsup.ported.config.ts',
  'packages/mcp-server/src/codegen', 'packages/mcp-server/src/render', 'packages/mcp-server/src/errors/registry.ts', 'packages/mcp-server/src/tools/code.generate.ts',
];
const publicScope186 = [...publicScope,
  'packages/mcp-server/src/compose', 'packages/mcp-server/src/tools/design.compose.ts'];
const publicScope187 = [...publicScope186,
  'packages/mcp-server/src/tools/catalog.list.ts', 'packages/mcp-server/src/tools/catalog.shared.ts', 'packages/mcp-server/src/tools/types.ts',
  'cmos/scripts/refresh_structured_data.py', 'cmos/planning/component-schema.json',
  'cmos/planning/oods-components.json', 'cmos/planning/oods-tokens.json',
  'artifacts/structured-data', 'docs/mcp/Tool-Specs.md', 'docs/mcp/Structured-Data-Refresh.md', 'docs/api/catalog-list.md', 'docs/how-forge-works.html'];
const publicScope188 = [...publicScope187, 'packages/mcp-bridge/src', 'packages/mcp-bridge/package.json',
  'packages/mcp-server/package.json', 'scripts/build-revision.mjs', 'cmos/foundational-docs/roadmap/near.md',
  'scripts/runtime/assemble.mjs', '.github/workflows/ci.yml'];
const testPath = file => /(^|\/)(?:__tests__|test|tests)\//.test(file) || /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file);

export function auditPublicRuntimeBytes({ root, implementationHead, executionHead, sprintId = 'sprint-185' }) {
  assert(fullHead(implementationHead) && fullHead(executionHead));
  const scope = sprintId === 'sprint-188' ? publicScope188 : sprintId === 'sprint-187' ? publicScope187 : sprintId === 'sprint-186' ? publicScope186 : publicScope;
  execFileSync('git', ['merge-base', '--is-ancestor', implementationHead, executionHead], { cwd: root });
  const scopedChangedPaths = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${implementationHead}..${executionHead}`, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).sort();
  return { implementationHead, executionHead, ancestor: true, scope, excludeTests: true,
    scopedChangedPaths, changedPaths: scopedChangedPaths.filter(file => !testPath(file)), excludedTestPaths: scopedChangedPaths.filter(testPath) };
}

export function auditSprintRange({ root, base, head, sprintId = 'sprint-186' }) {
  assert(fullHead(base) && fullHead(head));
  const paths = scope => execFileSync('git', ['diff', '--name-only', `${base}..${head}`, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(file => file && !testPath(file)).sort();
  const canonical = ['configs/agent/policy.json', 'docs/api', 'packages/mcp-adapter/tool-descriptions.json',
    'packages/mcp-server/src/schemas', 'packages/mcp-server/src/schemas/generated.ts',
    'packages/mcp-server/src/security/policy.json', 'packages/mcp-server/src/tools/registry.json'];
  return { base, head, canonicalPaths: paths(canonical), publicPaths: paths(sprintId === 'sprint-188' ? publicScope188 : sprintId === 'sprint-187' ? publicScope187 : publicScope186) };
}
const sourceKeys = [
  ['baselineFold'], ['movers'], ['movers', 'noticePlan', 'deliveries'],
  ['reviewCarries', 'behaviorBites', 'near'], ['reviewCarries'], ['bridge'], [],
  ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near', 'm04BuildRecord'],
];

// Independent verification of the one named user exception; no producer helper imports.
export function auditSprint188Timeout({ approval, accounting, readBytes, readHistorical }) {
  assert.equal(approval.approved, true); assert.equal(approval.decisionId, 1830);
  assert.equal(approval.cmosDecision.decisionId, 1830); assert.equal(approval.cmosDecision.missionId, 's188-m06');
  assert.equal(approval.missionId, 's188-m06');
  assert.equal(approval.executionHead, '3f0e9d136e12b81a8ee459b43d1c1fc4aa3c617e');
  assert.equal(approval.proposalHead, '0f6891e3b4a8decb0626d49dbf6fa870bb712276');
  const file = 'packages/mcp-server/test/product-reality/sprint-wide-movers.s185.spec.ts';
  const name = 'Sprint-wide accounting includes runtime behavior omitted by per-mission scopes turns a reproduced Table omission into a failing completed mover record';
  assert.equal(approval.file, file); assert.equal(approval.testKey, name + '#0');
  assert.equal(approval.timeoutMs, 20000); assert.equal(approval.observedDurationMs, 21855);
  assert.equal(approval.sprintReview.status, 'pending-sprint-review'); assert(approval.sprintReview.nextSprintAdjustmentRequired && approval.sprintReview.text.trim());
  const read = target => JSON.parse(readBytes(target));
  const captures = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(captures.length, 4);
  const observed = []; const inspected = {};
  for (const capture of captures) {
    assert.equal(capture.measuredHead, approval.executionHead); assert(capture.cleanBefore && capture.cleanAfter);
    assert.equal(capture.counts.failed, capture.suite === 'root-core' ? 1 : 0); assert.equal(capture.exitCode, capture.suite === 'root-core' ? 1 : 0);
    const raw = read(capture.rawReport.path);
    for (const result of raw.testResults) {
      if (result.name.endsWith('/' + file)) inspected[capture.suite] = result;
      for (const test of result.assertionResults ?? []) if (test.status === 'failed') observed.push({ suite: capture.suite, file: result.name, test });
    }
  }
  assert.equal(observed.length, 1); assert.equal(observed[0].suite, 'root-core'); assert(observed[0].file.endsWith('/' + file)); assert.equal(observed[0].test.fullName, name);
  assert.equal(accounting.closeoutFailures.length, 1);
  const failure = accounting.closeoutFailures[0]; assert.equal(failure.status, 'approved-timeout-disclosed'); assert.equal(failure.file, file); assert.equal(failure.testKey, name + '#0');
  const proof = failure.failureEvidence; assert.equal(proof.source, 'raw-log'); assert.equal(proof.status, 'resolved');
  const log = readBytes(proof.log.path); assert.equal(digest(log), proof.log.sha256);
  assert.equal(log.toString().split('\n').slice(proof.startLine - 1, proof.endLine).join('\n'), proof.text);
  assert(proof.text.includes(` FAIL  |core| ${file} > `)); assert(proof.cause.startsWith('Error: Test timed out in 20000ms.\n'));
  const diagnostic = read(approval.diagnostic); assert.equal(diagnostic.capturedExecutionHead, approval.executionHead); assert.equal(diagnostic.spec, file);
  for (const ref of diagnostic.files) assert.equal(digest(readBytes(ref.path)), ref.sha256, 'Retained diagnostic bytes changed.');
  const directory = path.posix.dirname(approval.diagnostic);
  const retry = read(directory + '/isolation.vitest.json'); const ci = read(directory + '/ci-complete.json');
  assert.equal(retry.success, true); assert.equal(retry.numPassedTests, 7); assert.equal(retry.numFailedTests, 0); assert.equal(retry.numPendingTests, 0); assert.equal(retry.testResults.length, 1);
  const isolated = retry.testResults[0]; assert(isolated.name.endsWith('/' + file));
  for (const result of [inspected['root-core'], inspected['mcp-server']]) {
    assert(result); assert.deepEqual(result.assertionResults.map(row => row.fullName).sort(), isolated.assertionResults.map(row => row.fullName).sort());
  }
  assert([...isolated.assertionResults, ...inspected['mcp-server'].assertionResults].every(row => row.status === 'passed'));
  assert.equal(diagnostic.isolation.exitCode, 0); assert.equal(diagnostic.isolation.targetDurationMs, isolated.assertionResults.find(row => row.fullName === name).duration);
  assert.equal(ci.databaseId, 34256102496); assert.equal(ci.status, 'completed'); assert.equal(ci.conclusion, 'success');
  assert(['coverage', 'viz-determinism'].every(job => ci.jobs.some(row => row.name === job && row.conclusion === 'success')));
  const source = digest(readHistorical(approval.executionHead, file));
  assert.equal(digest(readHistorical(ci.headSha, file)), source); assert.equal(digest(readHistorical(approval.proposalHead, file)), source);
  for (const [head, expected] of Object.entries(diagnostic.specHashes)) assert.equal(digest(readHistorical(head, file)), expected);
  assert.deepEqual(accounting.timeoutAcceptance, { decisionId: 1830, status: 'accepted-observed-timeout', file, testKey: name + '#0',
    observedFailureCount: 1, retryPassed: 7, sprintReview: approval.sprintReview, approval: accounting.timeoutAcceptance.approval });
  assert.deepEqual(failure.approval, accounting.timeoutAcceptance.approval);
  return true;
}
const auditDerivationFiles188 = ['scripts/product-reality/s185-suite-accounting.mjs',
  'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-audit-closeout.mjs'];
export function auditSprint188ApprovalChanges(changes, readHistorical, readCurrent) {
  for (const { path: file, status } of changes) {
    if (auditDerivationFiles188.includes(file)) { assert.equal(status, 'M'); continue; }
    if (file === 'packages/mcp-server/test/product-reality/approved-timeout.s188.spec.ts') { assert.equal(status, 'A'); continue; }
    assert.equal(status, 'A', `Approval changes a captured input: ${file}`);
    if (file.startsWith('artifacts/product-reality/sprint-188/m06/accepted-timeout/')) continue;
    assert.equal(digest(readCurrent(file)), digest(readHistorical('0f6891e3b4a8decb0626d49dbf6fa870bb712276', file)), `Submitted evidence changed: ${file}`);
  }
}

// This historical schema remains invalid for the five original scalar bindings.
export function auditSprint188OriginalFormFailure(results) {
  assert.equal(results.length, 2);
  for (const [index, result] of results.entries()) {
    const framework = ['react', 'vue'][index];
    const expected = [['address_roles', 'array', 'Input', 'slot-field-3-13'],
      ['preference_document', 'unknown', 'Input', 'slot-field-5-17'],
      ['state_history', 'array', 'DatePicker', 'slot-field-6-19'],
      ['tags', 'array', 'Input', 'slot-field-8-23'], ['tag_metadata', 'array', 'Input', 'slot-field-9-25']];
    assert.equal(result.status, 'error'); assert(!result.artifact);
    assert.deepEqual(result.errors, expected.map(([field, kind, component, nodeId]) => ({code: 'OODS-V007', nodeId, component,
      message: `Field "${field}" has ${kind} data, which cannot bind to ${component}.value on the ${framework} target; accepted field kinds: string, number, boolean.`})));
  }
}

export function auditFinalCloseout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath = defaultManifest }) {
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Audit requires actual full execution and review SHAs.');
  const workflow = manifestPath.startsWith('artifacts/product-reality/sprint-188/m06/');
  const approvedTimeout = workflow && JSON.parse(readFrozen(manifestPath)).accounting?.approvedTimeout;
  const fresh = manifestPath.startsWith('artifacts/product-reality/sprint-187/m06/');
  const wave2 = manifestPath.startsWith('artifacts/product-reality/sprint-186/m06/');
  const missionId = workflow ? 's188-m06' : fresh ? 's187-m06' : wave2 ? 's186-m06' : 's185-m05';
  const sprintId = workflow ? 'sprint-188' : fresh ? 'sprint-187' : wave2 ? 'sprint-186' : 'sprint-185';
  const criterionCount = workflow ? 6 : fresh ? 7 : wave2 ? 6 : 8;
  const suiteCriterion = workflow ? 2 : fresh ? 5 : wave2 ? 4 : 6;
  const outputPrefix = workflow ? `artifacts/product-reality/sprint-188/m06/${approvedTimeout ? 'closeout-accepted' : 'closeout'}` : fresh ? 'artifacts/product-reality/sprint-187/m06/closeout' : wave2 ? 'artifacts/product-reality/sprint-186/m06/closeout' : prefix;
  const requiredSourceKeys = workflow ? [['freshCensus', 'savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['liveConsumers'], [], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries'], ['missionHistory', 'historicalEvidence', 'prose', 'near'], ['cmosMission', 'cmosSprint', 'carries', 'noticePlan']] : fresh ? [['freshCensus'], ['cohort', 'liveConsumers'], ['savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['rootEvidence', 'baselineFold'], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries', 'carries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : wave2 ? [['unionFold'], ['baselineFold'], ['movers', 'moversDeclaration'],
    ['movers', 'noticePlan', 'deliveries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : sourceKeys;
  assert.equal(gitEvidence?.ancestor, true, 'Review head must descend from the actual execution head.');
  // Decision 1741 allows new capture records, not rewritten fixtures or code.
  if (approvedTimeout) auditSprint188ApprovalChanges(gitEvidence.changes, readHistorical, readFrozen);
  else for (const change of gitEvidence.changes) {
    const allowed = workflow
      ? /^artifacts\/product-reality\/sprint-188\/m06\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-188\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : fresh
      ? /^artifacts\/product-reality\/sprint-187\/m06\/four-suite-closeout(?:-attempt-[\w-]+)?\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-187\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : wave2
      ? /^artifacts\/product-reality\/sprint-186\/m06\/four-suite-closeout(?:-attempt-[\w-]+)?\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-186\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : /^artifacts\/product-reality\/sprint-185\/m05\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-185\/m05\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path);
    assert(change.status === 'A' && allowed, `Review descendant changes executable inputs or pre-existing evidence: ${change.status} ${change.path}`);
  }
  const outputBytes = new Map();
  const output = name => {
    const bytes = Buffer.from(readOutput(`${outputPrefix}/${name}.json`)); outputBytes.set(name, bytes);
    return JSON.parse(bytes.toString('utf8'));
  };
  const ledger = output('claim-ledger');
  const accounting = output('suite-accounting');
  const handoff = output('review-handoff');
  const index = output('evidence-index');
  for (const document of [ledger, accounting, handoff, index]) {
    assert.equal(document.executionHead, executionHead, 'Output relabels actual execution head.');
    assert.equal(document.reviewHead, reviewHead, 'Output names another frozen review head.');
  }
  const checked = new Map();
  const frozen = file => {
    assert(typeof file === 'string' && file.length && !path.posix.isAbsolute(file) && !file.includes('\\')
      && !file.split('/').some(part => ['', '.', '..'].includes(part)), `Unsafe frozen reference: ${file}`);
    assert(!file.startsWith(`${outputPrefix}/`), 'Generated output cannot justify itself as a frozen source.');
    if (!checked.has(file)) {
      const bytes = Buffer.from(readFrozen(file));
      checked.set(file, { path: file, sha256: digest(bytes), bytes });
    }
    return checked.get(file);
  };
  const reference = ref => {
    assert(ref && typeof ref.sha256 === 'string' && /^[a-f0-9]{64}$/.test(bare(ref.sha256)), 'Cited reference lacks captured SHA256.');
    if (ref.executionSourceHead !== undefined) {
      assert(approvedTimeout && auditDerivationFiles188.includes(ref.path)); assert(fullHead(ref.executionSourceHead));
      const bytes = Buffer.from(readHistorical(ref.executionSourceHead, ref.path));
      assert.equal(digest(bytes), bare(ref.sha256), 'Captured derivation source hash differs.'); assert.equal(ref.commit, reviewHead);
      return {path: ref.path, sha256: digest(bytes), bytes};
    }
    const observed = frozen(ref.path);
    assert.equal(observed.sha256, bare(ref.sha256), `Frozen source hash differs: ${ref.path}`);
    if (ref.commit !== undefined) assert.equal(ref.commit, reviewHead, 'Frozen reference has a relabeled review commit.');
    return observed;
  };
  const parseFrozen = file => JSON.parse(frozen(file).bytes.toString('utf8'));
  const manifest = parseFrozen(manifestPath);
  assert.equal(manifest.missionId, missionId);
  assert(Array.isArray(manifest.sources.derivationInputs) && manifest.sources.derivationInputs.length > 0, 'Derivation rules must be frozen inputs.');
  for (const file of manifest.sources.derivationInputs) frozen(file);
  const implementationHead = parseFrozen(manifest.sources.noticePlan).implementationHead;
  if (implementationHead !== executionHead) {
    assert.equal(publicGitEvidence?.implementationHead, implementationHead);
    assert.equal(publicGitEvidence.executionHead, executionHead); assert.equal(publicGitEvidence.ancestor, true);
    assert.equal(publicGitEvidence.excludeTests, true); assert.deepEqual(publicGitEvidence.scope, workflow ? publicScope188 : fresh ? publicScope187 : wave2 ? publicScope186 : publicScope);
    assert.deepEqual(publicGitEvidence.excludedTestPaths, publicGitEvidence.scopedChangedPaths.filter(testPath));
    assert.deepEqual(publicGitEvidence.changedPaths, publicGitEvidence.scopedChangedPaths.filter(file => !testPath(file)));
    assert.deepEqual(publicGitEvidence.changedPaths, [], 'Advertised public runtime bytes changed after the notice implementation head.');
    assert.deepEqual(ledger.publicHeadEquivalence, publicGitEvidence, 'Producer public equivalence differs from independent Git evidence.');
  }
  const unwrap = document => document.rawResponse?.structuredContent?.data ?? document;
  const mission = unwrap(parseFrozen(manifest.sources.cmosMission));
  const original = unwrap(parseFrozen(manifest.sources.cmosOriginalMission));
  const sprint = unwrap(parseFrozen(manifest.sources.cmosSprint));
  assert.equal(mission.id, missionId); assert.equal(original.id, missionId); assert.equal(sprint.id, sprintId);
  assert.equal(mission.successCriteria.length, criterionCount); assert.equal(ledger.claims.length, criterionCount);
  assert.deepEqual(ledger.claims.map(row => row.criterion), mission.successCriteria, 'Claim text differs from literal frozen CMOS criteria.');
  assert.equal(ledger.criterionSource.path, manifest.sources.cmosMission); reference(ledger.criterionSource);
  assert.equal(ledger.originalCriterionSource.path, manifest.sources.cmosOriginalMission); reference(ledger.originalCriterionSource);
  assert.equal(sprint.status, 'Active', 'The builder must leave the sprint Active.');
  for (const document of [ledger, handoff]) {
    assert.equal(document.builderSelfCertified, false); assert.equal(document.separateReviewRequired, true);
  }
  assert.equal(handoff.sprintStatus, 'Active'); assert.equal(handoff.approvalStatus, 'pending-independent-review');
  assert.equal(handoff.buildStatus, 'BUILT, REVIEW PENDING');
  reference(handoff.sprintStatusSource);
  assert(frozen(manifest.sources.near).bytes.toString('utf8').includes('BUILT, REVIEW PENDING'));

  assert.equal(index.selfExcluded, true);
  assert(!index.generatedOutputs.some(row => row.path === `${outputPrefix}/evidence-index.json`), 'Index has a self-hash cycle.');
  for (const ref of index.frozenInputs) reference(ref);
  // The handoff may later bind this audit. Inspect its flags but do not bind its
  // mutable bytes in the audit: ledger/accounting + frozen inputs are stable.
  for (const name of ['claim-ledger', 'suite-accounting']) {
    const refs = index.generatedOutputs.filter(row => row.path === `${outputPrefix}/${name}.json`);
    assert.equal(refs.length, 1, `Missing/duplicate generated ${name} index reference.`);
    assert.equal(refs[0].sha256, digest(outputBytes.get(name)), `Indexed ${name} hash differs from actual output.`);
  }

  assert.equal(accounting.status, 'passed');
  assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.headRelation.ancestor, true);
  if (approvedTimeout) {
    assert.equal(accounting.headRelation.executableInputsUnchanged, false);
    assert.equal(accounting.headRelation.capturedRuntimeAndTestSourcesUnchanged, true); assert.equal(accounting.headRelation.postCaptureDerivationOnly, true);
    assert.equal(accounting.headRelation.proposalHead, '0f6891e3b4a8decb0626d49dbf6fa870bb712276');
    assert.deepEqual(accounting.headRelation.derivationFiles, auditDerivationFiles188);
    assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  } else assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const ref of accounting.references) reference(ref);
  const executions = new Map();
  for (const row of ledger.executions) {
    assert(typeof row.id === 'string' && row.id.length && !executions.has(row.id), 'Missing/duplicate ledger execution.');
    executions.set(row.id, row);
  }
  const actualIds = new Set(); const rawHashes = new Set();
  for (const actual of accounting.executions) {
    assert(!actualIds.has(actual.id)); actualIds.add(actual.id);
    const row = executions.get(actual.id); assert(row, 'Suite execution missing from ledger.');
    for (const [key, value] of Object.entries(actual)) assert.deepEqual(row[key], value, `Suite execution ${actual.id} changed ${key}.`);
    assert.equal(row.evidenceKind, 'suite-receipt');
    const receipt = JSON.parse(reference(actual.receipt).bytes.toString('utf8'));
    reference(actual.log); reference(actual.rawReport);
    assert(!rawHashes.has(bare(actual.rawReport.sha256)), 'One raw suite execution is counted twice.'); rawHashes.add(bare(actual.rawReport.sha256));
    assert.equal(actual.measuredHead, receipt.measuredHead, 'Suite receipt execution head was relabeled.');
    assert.equal(actual.exitCode, receipt.exitCode); assert.equal(actual.suite, receipt.suite);
    assert.equal(actual.cleanBefore, receipt.cleanBefore.clean); assert.equal(actual.cleanAfter, receipt.cleanAfter.clean);
    assert.deepEqual(actual.counts, receipt.vitest.tests, 'Suite counts differ from the retained actual receipt.');
  }
  const supplementalLogs = new Set();
  for (const actual of manifest.executions) {
    assert(!actualIds.has(actual.id)); actualIds.add(actual.id);
    const row = executions.get(actual.id); assert(row, 'Actual supplemental execution missing.');
    for (const key of ['command', 'cwd', 'host', 'exitCode', 'executionHead', 'sourceState']) assert.deepEqual(row[key], actual[key], `Supplemental ${actual.id} changed ${key}.`);
    assert(fullHead(actual.executionHead)); assert.equal(row.evidenceKind, 'retained-command');
    for (const key of ['inputs', 'outputs', 'logs']) {
      const refs = actual[key] ?? [];
      assert.deepEqual((row[key] ?? []).map(ref => ({ path: ref.path, sha256: bare(ref.sha256) })), refs.map(ref => ({ path: ref.path, sha256: bare(ref.sha256) })), `Execution ${actual.id} has different ${key}.`);
      for (const ref of row[key] ?? []) {
        if (ref.executionSourceHead !== undefined) { assert.equal(key, 'inputs'); assert.equal(ref.executionSourceHead, actual.inputSourceHead ?? actual.executionHead); if (actual.inputSourceHead) assert.equal(actual.sourceState, 'worktree'); }
        reference(ref);
      }
    }
    const logIdentity = actual.logs.map(ref => bare(ref.sha256)).sort().join(':');
    assert(!supplementalLogs.has(logIdentity) && !rawHashes.has(logIdentity), 'A supplemental execution was rolled up twice.'); supplementalLogs.add(logIdentity);
  }
  assert.equal(actualIds.size, executions.size, 'Ledger invents an execution absent from frozen inputs.');
  assert.equal(accounting.closeout.runs.length, 1);
  const capture = accounting.closeout.runs[0].suiteExecutionIds;
  assert.equal(capture.length, 4); assert.equal(new Set(capture).size, 4);
  const captureRows = capture.map(id => executions.get(id));
  assert(captureRows.every(row => row?.evidenceKind === 'suite-receipt' && row.cohort === 'closeout'
    && row.measuredHead === executionHead && row.cleanBefore === true && row.cleanAfter === true), 'Capture contains an unrelated, unclean or relabeled execution.');
  assert.deepEqual(captureRows.map(row => row.suite).sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']);

  if (approvedTimeout) {
    const approval = parseFrozen(approvedTimeout);
    assert.equal(accounting.timeoutAcceptance.approval.path, approvedTimeout); reference(accounting.timeoutAcceptance.approval);
    assert(manifest.claimBindings[2].evidencePaths.includes(approvedTimeout));
    auditSprint188Timeout({approval, accounting, readBytes: file => frozen(file).bytes, readHistorical});
    assert.deepEqual(ledger.timeoutAcceptance, accounting.timeoutAcceptance); assert.deepEqual(handoff.timeoutAcceptance, accounting.timeoutAcceptance);
  }
  if (workflow) {
    const census = parseFrozen(manifest.sources.freshCensus);
    const expectedObjects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const expectedContexts = ['card', 'detail', 'form', 'inline', 'list', 'timeline'];
    assert.equal(census.head, implementationHead); assert.equal(census.profile, 'build');
    assert.deepEqual(census.objects, expectedObjects); assert.deepEqual([...census.contexts].sort(), expectedContexts);
    assert.equal(census.rows.length, 66); assert.equal(census.schemaCount, 66); assert.equal(census.greenSchemas, 66);
    assert.equal(census.generationCells, 132); assert.equal(census.greenCells, 132);
    assert.deepEqual(census.rows.map(row => `${row.input.object}/${row.input.context}`).sort(), expectedObjects.flatMap(object => expectedContexts.map(context => `${object}/${context}`)).sort());
    const required = { list: ['BillingSummaryBadge', 'ArchivedRowOverlay'], form: ['BillingAmountInput', 'BillingIntervalSelector'],
      detail: ['CycleProgressCard', 'PaymentTimeline'], timeline: ['PaymentEventTimeline'], card: ['BillingCardMeta'] };
    assert.deepEqual(census.workflow.input, { object: 'Subscription', context: 'workflow' });
    for (const row of [...census.rows, census.workflow]) {
      const composed = JSON.parse(reference(row.composition).bytes.toString('utf8'));
      assert.equal(composed.status, 'ok'); assert.equal(row.green, true);
      const ids = new Set(); const walk = node => { ids.add(node.component); node.children?.forEach(walk); };
      composed.schema.screens.forEach(walk);
      assert.deepEqual([...ids].sort(), row.components);
      if (row.input.object === 'Subscription') for (const id of required[row.input.context] ?? []) assert(ids.has(id));
      assert.deepEqual(row.cells.map(cell => cell.framework).sort(), ['react', 'vue']);
      for (const cell of row.cells) {
        const generated = JSON.parse(reference(cell.response).bytes.toString('utf8'));
        assert.equal(generated.status, 'ok'); assert(generated.artifact); assert(!generated.errors?.length);
        for (const file of generated.artifact.files) assert.equal(bare(file.contentHash), digest(file.contents));
      }
    }
    const adoption = parseFrozen('artifacts/product-reality/sprint-188/m01/adoption.json');
    const historical = parseFrozen('artifacts/product-reality/sprint-186/m05/reachability/report.json');
    const originalStore = parseFrozen(manifest.sources.savedOriginal); const successor = parseFrozen(manifest.sources.savedSuccessor);
    const hashes = report => Object.fromEntries(report.rows.map(row => [row.schema + '.json', row.input.sha256]));
    assert.deepEqual(hashes(originalStore), hashes(historical));
    assert.deepEqual(hashes(successor), Object.fromEntries(Object.entries(adoption.after).filter(([file]) => file !== '_index.json')));
    for (const [report, source, reachable, cells] of [[originalStore, manifest.sources.savedOriginal, 15, 30], [successor, manifest.sources.savedSuccessor, 16, 32]]) {
      assert.equal(report.head, implementationHead); assert.equal(report.total, 16); assert.equal(report.reachable, reachable); assert.equal(report.generatedCells, cells);
      let passing = 0;
      for (const row of report.rows) {
        reference(row.input);
        const results = row.cells.map(cell => JSON.parse(reference({ path: `${path.posix.dirname(source)}/${cell.response.path}`, sha256: cell.response.sha256 }).bytes.toString('utf8')));
        const green = results.every(result => result.status === 'ok' && result.artifact);
        assert.equal(row.reachable, green); if (green) passing++;
        else { assert.equal(row.schema, 'user-form-showcase'); auditSprint188OriginalFormFailure(results); }
      }
      assert.equal(passing, reachable);
    }
    const compatibility = parseFrozen(manifest.sources.savedCompatibility);
    assert(compatibility.originalInputsUnchanged && compatibility.successorInputsUnchanged && compatibility.liveStoreUnchanged);
    assert.deepEqual(compatibility.liveStore.hashes, adoption.after);
    const app = parseFrozen(manifest.sources.liveConsumers); const appRoot = path.posix.dirname(manifest.sources.liveConsumers);
    assert.equal(app.sourceHead, implementationHead); assert.deepEqual(app.cells.map(cell => cell.framework).sort(), ['react', 'vue']);
    for (const cell of app.cells) {
      assert.equal(cell.gates.length, 8); assert(cell.gates.every(gate => gate.status === 'passed'));
      assert.equal(cell.flow.length, 9); assert(cell.flow.every(row => row.status === 'passed'));
      assert.equal(cell.consumerAuthoredComponents, 0); assert.equal(cell.consumerAuthoredActions, 0);
      const cellRef = app.cellReports.find(ref => ref.framework === cell.framework);
      assert.deepEqual(JSON.parse(reference({path: `${appRoot}/${cellRef.report}`, sha256: cellRef.sha256}).bytes.toString('utf8')), cell);
      const archive = cell.flow.find(row => row.name === 'ten-sample-records').detail;
      assert.equal(archive.active.length, 9); assert.equal(archive.archived.length, 1); assert.equal(archive.archivePresentation.opacity, '0.6');
      const detail = cell.flow.find(row => row.name === 'detail-navigation').detail;
      for (const id of ['CycleProgressCard', 'PaymentTimeline']) assert(detail.mounts.some(row => row.component === id && row.present && row.passed));
      assert(cell.flow.find(row => row.name === 'timeline-navigation-and-history').detail.mounts.some(row => row.component === 'PaymentEventTimeline' && row.present));
      const owned = parseFrozen(`${appRoot}/${cell.framework}/source-ownership.json`);
      assert.equal(owned.generatedFilesUnchanged, true); assert(owned.files.every(row => row.actual === row.expected));
    }
    const states = ['loading', 'empty', 'error', 'success']; const contexts = ['list', 'detail', 'form', 'timeline'];
    assert.deepEqual(app.stateObservations.map(row => `${row.framework}/${row.screen}/${row.state}`).sort(), ['react', 'vue'].flatMap(target => contexts.flatMap(context => states.map(state => `${target}/${context}/${state}`))).sort());
    assert.equal(app.screenshots.length, 36);
    assert.deepEqual(app.screenshots.map(row => `${row.framework}/${row.screen}/${row.width}`).sort(), ['react', 'vue'].flatMap(target => [...contexts, 'archived', 'payments'].flatMap(context => [390, 820, 1440].map(width => `${target}/${context}/${width}`))).sort());
    for (const image of app.screenshots) reference({path: `${appRoot}/${image.file}`, sha256: image.sha256});
    const bite = parseFrozen(`${appRoot}/navigation-bite.json`);
    assert.equal(bite.beforeHash, bite.restoredHash); assert.notEqual(bite.beforeHash, bite.afterHash);
    assert.deepEqual(bite.red.filter(row => row.status === 'failed').map(row => row.name), ['detail-navigation']);
    assert(bite.restored.length === 9 && bite.unaffected.length === 9 && [...bite.restored, ...bite.unaffected].every(row => row.status === 'passed'));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(rangeGitEvidence.base, 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076'); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) { assert.deepEqual(movers.s188[key], rangeGitEvidence[key]); assert.deepEqual(declared.s188[key], rangeGitEvidence[key]); }
    const plan = parseFrozen(manifest.sources.noticePlan);
    assert.equal(plan.status, 'prepared-unsent'); assert.equal(plan.deliverySprint, 'sprint-189'); assert.equal(plan.implementationHead, implementationHead);
    assert.deepEqual(parseFrozen(manifest.sources.deliveries), []); assert(rangeGitEvidence.publicPaths.every(file => plan.draft.includes(file)));
    const prose = parseFrozen(manifest.sources.prose); assert(prose.success); assert.equal(prose.numFailedTests, 0); assert.equal(prose.numPendingTests, 0);
    assert(prose.testResults.length > 0 && prose.testResults.every(row => /tests\/verification\/.*\.contract\.test\.ts$/.test(row.name)));
    assert(frozen(manifest.sources.near).bytes.toString('utf8').includes('BUILT, REVIEW PENDING'));
    assert.equal(handoff.implementationHead, implementationHead); reference(handoff.craft); reference(handoff.carries);
  } else if (fresh) {
    const lockedBase = '21c7c31906fbb81d049b943155c64ed78409fb9f';
    const expected = ['User/detail', 'Product/detail', 'Usage/list', 'Subscription/inline', 'Transaction/timeline', 'Product/list', 'Product/form', 'Product/inline',
      'Organization/list', 'Organization/detail', 'Organization/card', 'Subscription/detail', 'Subscription/form', 'Subscription/card'];
    const targets = ['react', 'vue'];
    const names = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const contexts = ['detail', 'list', 'form', 'timeline', 'card', 'inline'];
    const census = parseFrozen(manifest.sources.freshCensus);
    assert.equal(census.head, implementationHead); assert.equal(census.profile, 'build');
    assert.equal(census.schemaCount, 66); assert.equal(census.greenSchemas, 66); assert.equal(census.generationCells, 132); assert.equal(census.greenCells, 132);
    assert.deepEqual(census.objects, names); assert.deepEqual(census.contexts, contexts);
    assert.deepEqual(census.rows.map(row => `${row.input.object}/${row.input.context}`).sort(), names.flatMap(name => contexts.map(context => `${name}/${context}`)).sort());
    for (const row of census.rows) {
      assert.deepEqual(Object.keys(row.input).sort(), ['context', 'object']); assert.equal(row.composed, true); assert.equal(row.green, true); assert.deepEqual(row.ungoverned, []);
      assert.deepEqual(row.cells.map(cell => cell.framework), targets);
      assert(row.cells.every(cell => cell.status === 'ok' && cell.artifactPresent && cell.errors.length === 0));
    }
    const cohort = parseFrozen(manifest.sources.cohort); const runtime = parseFrozen(manifest.sources.liveConsumers);
    assert.deepEqual(cohort.groups.flatMap(group => group.paths), expected); assert.deepEqual(cohort.frameworks, targets);
    assert.deepEqual(runtime.freshInputs.map(row => `${row.object}/${row.context}`), expected);
    assert.deepEqual(runtime.cells.map(cell => `${cell.composition.input.object}/${cell.composition.input.context}/${cell.framework}`).sort(), expected.flatMap(item => targets.map(target => `${item}/${target}`)).sort());
    assert.equal(runtime.status, 'passed'); assert.equal(runtime.cellCount, 28); assert.equal(runtime.failed, 0); assert.equal(runtime.skipped, 0);
    const gates = ['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render', 'mount', 'hydration', 'shared-css-resolution', 'interaction-evidence'];
    const runtimeDir = path.posix.dirname(manifest.sources.liveConsumers);
    const observedPackages = new Map(); const observedFamilies = new Set();
    let passed = 0; let notApplicable = 0;
    for (const cell of runtime.cells) {
      const doc = JSON.parse(reference({ path: path.posix.join(runtimeDir, cell.report), sha256: cell.reportSha256 }).bytes.toString('utf8'));
      assert.equal(doc.framework, cell.framework); assert.equal(doc.status, 'passed'); assert.deepEqual(doc.gates.map(gate => gate.name), gates);
      assert.equal(cell.composition.sourceHead, implementationHead); assert.equal(cell.composition.sourceDiffSha256, `sha256:${digest('')}`);
      reference({ path: path.posix.join(runtimeDir, cell.composition.sourceDiffPath), sha256: cell.composition.sourceDiffSha256 });
      const composed = parseFrozen(path.posix.join(runtimeDir, 'live-generation', cell.schema, 'composition.json'));
      assert.deepEqual(composed.composition, cell.composition);
      assert.equal(digest(`${JSON.stringify(composed.schema, null, 2)}\n`), bare(cell.composition.schemaSha256));
      const artifact = parseFrozen(path.posix.join(runtimeDir, 'live-generation', cell.schema, cell.framework, 'artifact.json'));
      assert.equal(artifact.contentHash, cell.generation.artifactContentHash);
      for (const file of artifact.files) assert.equal(digest(file.contents), bare(file.contentHash));
      reference({ path: path.posix.join(runtimeDir, cell.generation.sourcePath), sha256: cell.generation.sourceSha256 });
      assert.equal(cell.generation.fingerprint.profile, 'build'); assert.equal(cell.generation.fingerprint.sourceOfArtifact, 'current-in-run-output');
      for (const file of doc.localTarballs) {
        const ref = { path: path.posix.join(runtimeDir, 'submitted-packages/tarballs', path.posix.basename(file.installSpec)), sha256: file.sha256 };
        assert.equal(reference(ref).bytes.length, file.bytes);
        if (observedPackages.has(file.name)) assert.equal(file.sha256, observedPackages.get(file.name));
        else observedPackages.set(file.name, file.sha256);
      }
      for (const gate of doc.gates) {
        if (gate.status === 'passed') assert(gate.logs?.length > 0, 'A passed runtime gate needs its retained command or browser log.');
        for (const log of gate.logs ?? []) frozen(path.posix.join(runtimeDir, log));
        if (gate.status === 'passed') passed++;
        else { assert.equal(gate.name, 'interaction-evidence'); assert.equal(gate.status, 'not-applicable'); notApplicable++; }
      }
      assert.equal(doc.accounting.balanced, true); assert.equal(doc.accounting.namedUnprovenCount, 0);
      assert.deepEqual(doc.browser.runtimeErrors, []); assert.equal(doc.browser.hydrationInvariant.equal, true);
      assert(doc.browser.boundValues.every(value => value.passed === true && value.visible === true));
      for (const [name, count] of Object.entries(doc.browser.componentCounts)) if (count > 0) observedFamilies.add(name);
    }
    assert.equal(runtime.selected, 224); assert.equal(runtime.passed, passed); assert.equal(runtime.notApplicable, notApplicable);
    assert.equal(passed + notApplicable, 224); assert.equal(runtime.applicable, passed);
    const originalStore = parseFrozen(manifest.sources.savedOriginal); const successor = parseFrozen(manifest.sources.savedSuccessor);
    const compatible = parseFrozen(manifest.sources.savedCompatibility);
    assert.equal(compatible.originalInputsUnchanged, true); assert.equal(compatible.successorInputsUnchanged, true); assert.equal(compatible.historicalNegativeRetained, true);
    assert.equal(compatible.originalBaseline, 15); assert.equal(compatible.successorBaseline, 16); assert(compatible.originalDeltaExplanation?.trim());
    for (const ref of compatible.references) reference(ref);
    for (const [store, key] of [[originalStore, 'savedOriginal'], [successor, 'savedSuccessor']]) {
      assert.equal(store.head, implementationHead); assert.equal(store.total, 16); assert.equal(store.rows.length, 16);
      let greenSchemas = 0; let greenCells = 0;
      for (const row of store.rows) {
        reference(row.input); assert.deepEqual(row.cells.map(cell => cell.framework), targets);
        const rawCells = row.cells.map(cell => {
          const result = JSON.parse(reference({ path: path.posix.join(path.posix.dirname(manifest.sources[key]), cell.response.path), sha256: cell.response.sha256 }).bytes.toString('utf8'));
          assert.equal(result.status, cell.status); assert.equal(Boolean(result.artifact), cell.artifactPresent);
          if (result.status === 'ok' && result.artifact) { greenCells++; return true; } return false;
        });
        assert.equal(row.reachable, rawCells.every(Boolean)); if (row.reachable) greenSchemas++;
      }
      assert.equal(store.generatedCells, greenCells); assert.equal(store.reachable, greenSchemas);
    }
    assert(originalStore.reachable >= 15); assert.equal(successor.reachable, 16); assert.equal(successor.generatedCells, 32);
    const types = 'packages/component-contracts/src/types.ts';
    const ids = text => [...text.match(/export const NUCLEUS_COMPONENT_IDS = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
    const current = ids(frozen(types).bytes.toString('utf8')); const prior = ids(Buffer.from(readHistorical(lockedBase, types)).toString('utf8'));
    const added = current.filter(name => !prior.includes(name)); const proof = parseFrozen(manifest.sources.rootEvidence);
    assert.equal(current.length, 64); assert.equal(new Set(current).size, 64); assert.equal(added.length, 14); assert(prior.every(name => current.includes(name)));
    assert.deepEqual(proof.governedIds, current); assert.deepEqual([...proof.addedIds].sort(), [...added].sort());
    assert(added.every(name => observedFamilies.has(name)), 'A new family has no actual mounted runtime observation.');
    const readiness = JSON.parse(reference(proof.readiness).bytes.toString('utf8'));
    assert.equal(readiness.status, 'passed'); assert.deepEqual(readiness.failures, []); assert.equal(readiness.totals.references, 778); assert.equal(readiness.totals.resolved, 778);
    const positive = JSON.parse(reference(proof.positiveExports).bytes.toString('utf8'));
    const exportTests = positive.testResults.flatMap(file => file.assertionResults);
    assert.equal(positive.success, true); assert.equal(positive.numPassedTests, 28); assert.equal(exportTests.length, 28);
    assert(exportTests.every(test => test.status === 'passed'));
    // Vitest quotes the interpolated $cell title. Match the complete terminal
    // cell token, preserving compatibility with the plain synthetic fixtures.
    const exportCell = test => {
      const token = test.fullName.split(' ').at(-1);
      return token.startsWith("'") && token.endsWith("'") ? token.slice(1, -1) : token;
    };
    for (const target of targets) for (const name of added) assert.equal(exportTests.filter(test => exportCell(test) === `${target}/${name}`).length, 1);
    const mutations = proof.mutations.flatMap(ref => JSON.parse(reference(ref).bytes.toString('utf8')).mutants);
    assert.deepEqual(mutations.map(row => row.selectedCell).sort(), added.flatMap(name => targets.map(target => `${target}/${name}`)).sort());
    for (const row of mutations) {
      assert.equal(row.status, 'passed'); assert.equal(row.restoredByteIdentically, true); assert.notEqual(row.sourceSha256Before, row.sourceSha256Deleted);
      const red = parseFrozen(row.selectedRed.packageReport).testResults.flatMap(file => file.assertionResults);
      assert.deepEqual(red.filter(test => test.status === 'failed').map(exportCell), [row.selectedCell]);
      const redReadiness = parseFrozen(row.selectedRed.readinessReport);
      assert(redReadiness.failures.length > 0 && redReadiness.failures.every(item => `${item.target}/${item.componentId}` === row.selectedCell));
      const restored = parseFrozen(row.restoredGreen.packageReport).testResults.flatMap(file => file.assertionResults);
      assert(restored.length > 0 && restored.every(test => test.status === 'passed'));
      assert.equal(parseFrozen(row.restoredGreen.readinessReport).status, 'passed');
      assert.notEqual(row.selectedRed.packageRun.exitCode, 0); assert.notEqual(row.selectedRed.readinessRun.exitCode, 0);
      assert.equal(row.restoredGreen.packageRun.exitCode, 0); assert.equal(row.restoredGreen.readinessRun.exitCode, 0);
      for (const phase of ['selectedRed', 'restoredGreen']) { frozen(row[phase].packageRun.log); frozen(row[phase].readinessRun.log); }
    }
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const baseline = parseFrozen(baselinePath); const before = JSON.parse(Buffer.from(readHistorical(lockedBase, baselinePath)).toString('utf8'));
    const identity = document => document.rows.map(row => [row.id, row.proposedClassification, row.reconciliationState]);
    assert.equal(baseline.rows.length, 109); assert.deepEqual(identity(baseline), identity(before));
    const scope = parseFrozen('packages/component-contracts/registry/component-obligation-scope.v1.json');
    assert.equal(scope.decisionId, 1788); assert.equal(scope.controllingObligationDenominator, 109); assert.equal(scope.approvedRuntimeCensus, null);
    assert.equal(parseFrozen('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus, null);
    for (const name of added) {
      const row = baseline.rows.find(row => row.id === name);
      for (const surface of ['react', 'vue', 'generatedConsumer']) {
        assert.equal(row.surfaces[surface].state, 'implemented-evidence-complete'); assert(row.surfaces[surface].evidence.length > 0);
        for (const ref of row.surfaces[surface].evidence) {
          const at = ref.indexOf('#'); assert(at > 0); const doc = parseFrozen(ref.slice(0, at)); const anchor = ref.slice(at + 1);
          if (anchor.startsWith('/')) {
            let value = doc;
            for (const token of anchor.slice(1).split('/')) { const key = token.replaceAll('~1', '/').replaceAll('~0', '~'); assert(value != null && Object.hasOwn(value, key)); value = value[key]; }
            assert(value != null);
          } else assert.equal([...(doc.rows ?? []), ...(doc.components ?? [])].filter(item => (item.componentId ?? item.id) === anchor).length, 1);
        }
      }
      for (const surface of ['accessibility', 'theme', 'interaction']) assert.equal(row.surfaces[surface].state, 'unverified');
    }
    const fold = parseFrozen(manifest.sources.baselineFold); for (const ref of fold.sourceHashes) reference(ref);
    assert.equal(fold.denominator, 109); assert(fold.readinessReferences.length && fold.readinessReferences.every(row => row.resolved));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(movers.s187.base, lockedBase); assert.equal(movers.s187.head, implementationHead);
    assert.equal(rangeGitEvidence.base, lockedBase); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) { assert.deepEqual(movers.s187[key], rangeGitEvidence[key]); assert.deepEqual(declared.s187[key], rangeGitEvidence[key]); }
    const notice = parseFrozen(manifest.sources.noticePlan); const deliveries = parseFrozen(manifest.sources.deliveries);
    assert.deepEqual(notice.addedNucleus, added); assert.equal(notice.status, 'prepared'); assert.equal(notice.sendsExecuted, 0); assert.equal(notice.deployment, 'pending');
    assert.equal(notice.notices.length, 2); assert.equal(deliveries.length, 2);
    for (const destination of ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']) {
      const entries = notice.notices.filter(row => row.request.targetAddress === destination); const records = deliveries.filter(row => row.targetAddress === destination);
      assert.equal(entries.length, 1); assert.equal(records.length, 1); assert.equal(digest(JSON.stringify(entries[0].request)), entries[0].requestSha256);
      assert.equal(records[0].requestSha256, entries[0].requestSha256); assert.equal(records[0].status, 'prepared'); assert.equal(records[0].messageId, null);
      assert([...added, 'Deployment: pending', 'retain-109', '/ported', '/readiness-ported', '/css-ported'].every(term => entries[0].request.body.includes(term)));
    }
    const carries = parseFrozen(manifest.sources.carries);
    assert.equal(carries.greenfieldWorkflow, 'partial'); assert.equal(carries.builderSelfCertified, false);
    for (const id of [1315, 1318, 1319, 1320, 1321, 1322, 1372, 1374, 1375, 1379, 1384]) assert(carries.rows.some(row => row.id === id && row.status === 'pending' && row.remainingWork?.trim()));
    assert.deepEqual(mission.successCriteria, original.successCriteria);
    assert.equal(accounting.baselines.sprint186Closeout.measuredHead, '740e8405fa8e094ab903a19e6e551fbe8bff2de2');
    assert(captureRows.every(row => row.exitCode === 0 && row.counts.failed === 0));
  } else if (wave2) {
    assert.equal(typeof readHistorical, 'function', 'Audit requires historical Git bytes for the locked base.');
    const base = '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2';
    const typesPath = 'packages/component-contracts/src/types.ts';
    const currentTypes = frozen(typesPath).bytes.toString('utf8');
    const oldTypes = Buffer.from(readHistorical(base, typesPath)).toString('utf8');
    const array = (source, name) => {
      const declaration = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
      assert(declaration, `Missing source union ${name}.`);
      return [...declaration[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
    };
    const nucleus = array(currentTypes, 'NUCLEUS_COMPONENT_IDS');
    const oldNucleus = array(oldTypes, 'NUCLEUS_COMPONENT_IDS');
    const formerPorted = array(oldTypes, 'PORTED_COMPONENT_IDS');
    const added = nucleus.filter(id => !oldNucleus.includes(id) && !formerPorted.includes(id));
    assert.equal(nucleus.length, 50); assert.equal(new Set(nucleus).size, nucleus.length);
    assert.equal(formerPorted.length, 8); assert.equal(added.length, 23);
    assert([...oldNucleus, ...formerPorted].every(id => nucleus.includes(id)));
    assert(/export type GovernedComponentId = NucleusComponentId;/.test(currentTypes), 'Separate governance union remains.');
    const union = parseFrozen(manifest.sources.unionFold);
    assert.deepEqual(union.nucleusComponents, nucleus); assert.deepEqual(union.formerPortedComponents, formerPorted);
    assert.equal(union.aliasHorizon, 'sprint-187');
    assert(union.readers.length > 0 && union.readers.every(row => row.path?.trim() && row.disposition?.trim()));
    for (const framework of ['react', 'vue']) {
      const packed = parseFrozen(union.packedConsumers[framework]);
      const proof = packed.proof ?? packed.packedProof;
      assert.equal(packed.status, 'passed'); assert.equal(packed.strictCompatibilityCompile?.status, 'passed');
      assert.equal(packed.strictCompatibilityCompile.skipLibCheck, false);
      assert(formerPorted.every(id => proof.rootRuntimeIds.includes(id) && proof.aliasRuntimeIds.includes(id)));
      assert.deepEqual(proof.compatibilityProof.map(row => row.componentId).sort(), [...formerPorted].sort());
      assert(proof.compatibilityProof.every(row => row.esmSame === true && row.cjsSame === true && row.ssrSame === true), 'Packed aliases differ from actual root values or rendered markup.');
      for (const row of proof.compatibilityProof) {
        assert.equal(row.aliasMarkup, row.rootMarkup, 'Actual packed alias markup differs from root markup.');
        assert(row.rootMarkup.includes(`data-oods-component="${row.componentId}"`), 'Packed markup does not contain the claimed family.');
      }
      assert.deepEqual(proof.compatibilityResolution, { runtimeSame: true, readinessSame: true, cssSame: true });
      const rootSpecifier = `@oods/components-${framework}`;
      const resolved = proof.resolvedSpecifiers;
      assert.equal(proof.compatibilitySpecifiers.root, proof.compatibilitySpecifiers.alias, 'Runtime alias resolves to another file.');
      assert.equal(resolved[rootSpecifier], resolved[`${rootSpecifier}/ported`]);
      assert.equal(resolved[rootSpecifier], proof.compatibilitySpecifiers.root);
      assert.equal(resolved['@oods/component-styles/css'], resolved['@oods/component-styles/css-ported']);
      for (const specifier of [rootSpecifier, `${rootSpecifier}/ported`, `${rootSpecifier}/readiness-ported`, '@oods/component-styles/css', '@oods/component-styles/css-ported'])
        assert(typeof resolved[specifier] === 'string' && resolved[specifier].includes('/node_modules/@oods/'), 'Packed alias is not resolved from installed package bytes.');
    }
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const baseline = parseFrozen(baselinePath);
    const historical = JSON.parse(Buffer.from(readHistorical(base, baselinePath)).toString('utf8'));
    const identities = document => document.rows.map(row => [row.id, row.proposedClassification, row.reconciliationState]);
    assert.equal(baseline.rows.length, 109); assert.deepEqual(identities(baseline), identities(historical));
    assert.equal(parseFrozen('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus, null);
    for (const component of added) for (const surface of ['react', 'vue', 'generatedConsumer']) {
      const cell = baseline.rows.find(row => row.id === component)?.surfaces?.[surface];
      assert.equal(cell?.state, 'implemented-evidence-complete'); assert(cell.evidence.length > 0);
      for (const ref of cell.evidence) {
        const separator = ref.indexOf('#'); assert(separator > 0);
        const document = parseFrozen(ref.slice(0, separator)); const anchor = ref.slice(separator + 1);
        if (anchor.startsWith('/')) {
          let observed = document;
          for (const token of anchor.slice(1).split('/')) {
            const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
            assert(observed != null && Object.hasOwn(observed, key), `Baseline evidence anchor does not resolve: ${ref}`); observed = observed[key];
          }
          assert(observed != null);
        } else assert.equal([...(document.rows ?? []), ...(document.components ?? [])].filter(row => (row.componentId ?? row.id) === anchor).length, 1);
      }
    }
    const fold = parseFrozen(manifest.sources.baselineFold);
    for (const ref of fold.sourceHashes) reference(ref);
    assert(fold.readinessReferences.length > 0 && fold.readinessReferences.every(row => row.resolved === true));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(movers.s186.base, base); assert.equal(movers.s186.head, implementationHead);
    assert.equal(rangeGitEvidence?.base, base); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) {
      assert.deepEqual(movers.s186[key], rangeGitEvidence[key], 'Mover output differs from independent Git diff.');
      assert.deepEqual(declared.s186[key], rangeGitEvidence[key], 'Declared movers omit or add actual changed paths.');
    }
    const plan = parseFrozen(manifest.sources.noticePlan); const deliveries = parseFrozen(manifest.sources.deliveries);
    assert.deepEqual(plan.addedNucleus, added); assert.deepEqual(plan.formerPorted, formerPorted); assert.equal(plan.aliasHorizon, 'sprint-187');
    assert.equal(plan.notices.length, 2); assert.equal(deliveries.length, 2); assert.equal(new Set(deliveries.map(row => row.messageId)).size, 2);
    for (const targetAddress of ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']) {
      const notices = plan.notices.filter(row => row.request.targetAddress === targetAddress); assert.equal(notices.length, 1);
      const notice = notices[0]; assert.equal(digest(JSON.stringify(notice.request)), notice.requestSha256);
      assert([...added, ...formerPorted, 'Union fold', '/ported', '/readiness-ported', '/css-ported', 'Sprint 187', 'Emitter movers:', 'Deployment:'].every(term => notice.request.body.includes(term)));
      const sent = deliveries.filter(row => row.targetAddress === targetAddress); assert.equal(sent.length, 1);
      assert.equal(sent[0].status, 'sent'); assert(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(sent[0].messageId));
      assert.equal(sent[0].requestSha256, notice.requestSha256);
    }
  }
  if (wave2 || fresh || workflow) {
    const baselineKey = workflow ? 'sprint187Closeout' : fresh ? 'sprint186Closeout' : 'sprint185Closeout';
    assert.deepEqual(Object.keys(accounting.baselines), [baselineKey]);
    const captures = { ...accounting.baselines, closeout: accounting.closeout };
    const populations = new Map();
    const normalize = value => ['pending', 'disabled', 'skipped'].includes(value) ? 'skipped' : value;
    for (const execution of accounting.executions.filter(row => Object.hasOwn(captures, row.cohort))) {
      const aggregate = JSON.parse(reference(captures[execution.cohort].aggregate).bytes.toString('utf8'));
      const raw = JSON.parse(reference(execution.rawReport).bytes.toString('utf8'));
      const files = new Map(); const counts = { total: 0, passed: 0, failed: 0, skipped: 0, todo: 0 };
      for (const result of raw.testResults) {
        const file = path.relative(aggregate.workspace, result.name).replaceAll('\\', '/');
        assert(file && !file.startsWith('../') && !files.has(file));
        const seen = new Map(); const assertions = new Map();
        for (const row of result.assertionResults ?? []) {
          const name = row.fullName ?? [...(row.ancestorTitles ?? []), row.title].join(' ');
          const occurrence = seen.get(name) ?? 0; seen.set(name, occurrence + 1);
          const state = normalize(row.status); assert(['passed', 'failed', 'skipped', 'todo'].includes(state));
          counts.total++; counts[state]++; assertions.set(`${name}#${occurrence}`, state);
        }
        files.set(file, { status: normalize(result.status), assertions });
      }
      assert.deepEqual(execution.counts, counts, 'Accounting counts differ from actual raw assertion rows.');
      populations.set(execution.id, files);
    }
    if (workflow) {
      for (const current of captureRows) {
        assert.equal(current.counts.failed, approvedTimeout && current.suite === 'root-core' ? 1 : 0); assert.equal(current.exitCode, approvedTimeout && current.suite === 'root-core' ? 1 : 0);
        const baseline = accounting.executions.find(row => row.cohort === 'sprint187Closeout' && row.suite === current.suite);
        const skipped = execution => [...populations.get(execution.id)].flatMap(([file, row]) => [...row.assertions].filter(([, state]) => state === 'skipped').map(([name]) => `${file}:${name}`)).sort();
        assert.deepEqual(skipped(current), skipped(baseline), 'A skipped test identity changed.');
        assert.equal(skipped(current).length, ['mcp-server', 'root-core'].includes(current.suite) ? 16 : 0);
      }
    }
    for (const comparison of accounting.comparisons) {
      const before = populations.get(comparison.beforeExecutionId); const after = populations.get(comparison.afterExecutionId);
      assert(before && after); const changed = [];
      for (const file of [...new Set([...before.keys(), ...after.keys()])].sort()) {
        const old = before.get(file); const next = after.get(file);
        if (!old || !next || old.status !== next.status || old.assertions.size !== next.assertions.size
          || [...old.assertions].some(([key, value]) => next.assertions.get(key) !== value)) changed.push(file);
      }
      assert.deepEqual(comparison.fileDeltas.map(row => row.file), changed, 'A file population delta was omitted or invented.');
      assert(comparison.fileDeltas.every(row => row.attribution?.kind && row.attribution.reason?.trim() && row.attribution.references?.length), 'A changed file lacks attribution evidence.');
    }
    assert.equal(accounting.comparisons.length, accounting.baselines[baselineKey].runs.length * 4, 'A baseline suite comparison is absent.');
    assert(accounting.closeoutFailures.every(row => row.status === (approvedTimeout ? 'approved-timeout-disclosed' : 'inherited-failure-disclosed')), 'An unexplained closeout failure was marked accounted.');
  }

  assert.equal(manifest.claimBindings.length, criterionCount); assert.equal(new Set(manifest.claimBindings.map(row => row.criterionIndex)).size, criterionCount);
  for (const [criterionIndex, claim] of ledger.claims.entries()) {
    assert.equal(claim.criterionIndex, criterionIndex); assert.equal(claim.claimId, `${missionId}-sc${String(criterionIndex + 1).padStart(2, '0')}`);
    const binding = manifest.claimBindings.find(row => row.criterionIndex === criterionIndex); assert(binding);
    const resolvedIds = [...(binding.executionIds ?? [])];
    if (binding.suiteBindings !== undefined) {
      assert.equal(criterionIndex, suiteCriterion, 'Only the four-suite criterion may use future suite selectors.');
      assert.deepEqual([...binding.suiteBindings].sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']);
      for (const suite of binding.suiteBindings) {
        const candidates = captureRows.filter(row => row.suite === suite);
        assert.equal(candidates.length, 1, `Suite selector is absent or ambiguous: ${suite}`);
        resolvedIds.push(candidates[0].id);
      }
    }
    assert.deepEqual(claim.executionIds, resolvedIds); assert(claim.executionIds.length > 0);
    assert.equal(new Set(claim.executionIds).size, claim.executionIds.length);
    assert.deepEqual(claim.evidence.map(ref => ref.path), binding.evidencePaths);
    for (const ref of claim.evidence) reference(ref);
    const required = requiredSourceKeys[criterionIndex].map(key => manifest.sources[key]);
    assert(required.every(file => binding.evidencePaths.includes(file)), 'Claim omits required frozen source.');
    const bound = claim.executionIds.map(id => { const row = executions.get(id); assert(row, 'Claim cites an unexecuted ID.'); return row; });
    if (criterionIndex !== suiteCriterion) {
      assert(bound.some(row => row.exitCode === 0 && row.evidenceKind === 'retained-command'
        && row.logs.some(ref => binding.evidencePaths.includes(ref.path))
        && [...row.inputs, ...(row.outputs ?? [])].some(ref => required.includes(ref.path))), 'Unrelated or failed execution cannot prove this claim.');
    } else {
      assert(capture.every(id => claim.executionIds.includes(id)), 'Four-suite claim must bind all four actual capture executions.');
      assert(bound.some(row => row.evidenceKind === 'suite-receipt' && binding.evidencePaths.includes(row.log.path)), 'Four-suite claim lacks executed evidence.');
    }
    assert.equal(claim.status, 'passed', 'Claim remains unproven.'); assert.deepEqual(claim.unproven, []);
    assert(claim.observations.length > 0 && claim.observations.every(row => row.passed === true), 'Claim ignores an unmet measured predicate.');
  }
  let checkedSprintCriteria = criterionCount;
  if (workflow) {
    const history = parseFrozen(manifest.sources.missionHistory);
    const past = history.missions.filter(row => row.id !== missionId);
    const expected = past.flatMap(row => row.successCriteria.map((criterion, criterionIndex) => ({ missionId: row.id, criterion, criterionIndex })));
    assert.equal(expected.length, 33); assert.equal(ledger.priorClaims.length, expected.length);
    assert.equal(ledger.boundSprintCriteria, 39); assert.equal(handoff.boundSprintCriteria, 39);
    const retained = parseFrozen(manifest.sources.historicalEvidence);
    assert.equal(retained.status, 'passed'); assert.equal(retained.boundCriteria, 33); assert.equal(retained.replayedExternalActions, 0);
    for (const ref of retained.references) {
      reference(ref);
      if (ref.missionHead) assert.equal(digest(Buffer.from(readHistorical(ref.missionHead, ref.path))), bare(ref.sha256), 'Prior execution evidence changed since its mission close.');
    }
    const evidencePlan = parseFrozen('artifacts/product-reality/sprint-188/m06/retained-evidence-plan.json');
    assert.equal(evidencePlan.bindings.length, 33);
    const sends = parseFrozen('artifacts/product-reality/sprint-188/m01/reconnect-sent.json');
    assert.deepEqual(sends.map(row => row.targetAddress).sort(), ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']);
    assert.equal(new Set(sends.map(row => row.result.structuredContent.data.messageId)).size, 2);
    assert(sends.every(row => row.result.structuredContent.success));
    for (const [mission, count] of [['m04', 9], ['m05', 13]]) {
      const parity = parseFrozen(`artifacts/product-reality/sprint-188/${mission}/parity.json`);
      assert.deepEqual(parity.allowlist, []); assert.equal(parity.receipts.length, count);
      assert(parity.receipts.every(row => row.differences.length === 0));
      const mutations = parseFrozen(`artifacts/product-reality/sprint-188/${mission}/export-bites/mutation-manifest.json`);
      assert.equal(mutations.mutants.length, mission === 'm04' ? 6 : 10);
      assert(mutations.mutants.every(row => row.status === 'passed' && row.restoredByteIdentically && row.sourceSha256Before !== row.sourceSha256Deleted));
    }
    for (const row of expected) {
      const claim = ledger.priorClaims.find(claim => claim.missionId === row.missionId && claim.criterionIndex === row.criterionIndex);
      assert(claim); assert.equal(claim.criterion, row.criterion); assert.equal(claim.status, 'evidence-bound');
      const binding = manifest.priorClaimBindings.find(binding => binding.missionId === row.missionId && binding.criterionIndex === row.criterionIndex);
      assert.deepEqual(claim.executionIds, binding.executionIds); assert.deepEqual(claim.evidence.map(ref => ref.path), binding.evidencePaths);
      for (const ref of claim.evidence) reference(ref);
      assert(binding.evidencePaths.includes(manifest.sources.historicalEvidence));
      const planned = evidencePlan.bindings.find(binding => binding.missionId === row.missionId && binding.criterionIndex === row.criterionIndex);
      assert(planned && planned.evidencePaths.every(file => binding.evidencePaths.includes(file)), 'Historical criterion dropped its retained execution evidence.');
      assert(claim.executionIds.some(id => { const execution = executions.get(id); return execution && execution.exitCode === 0
        && execution.inputs.some(ref => binding.evidencePaths.includes(ref.path)) && execution.logs.some(ref => binding.evidencePaths.includes(ref.path)); }));
    }
    checkedSprintCriteria += expected.length;
  }
  assert.deepEqual(ledger.headline, { total: criterionCount, proven: criterionCount, unproven: 0 }); assert.deepEqual(ledger.unproven, []);
  assert.equal(ledger.status, 'ready-for-independent-review');
  return { schemaVersion: '1.0.0', status: 'passed', executionHead, reviewHead,
    ledgerSha256: digest(outputBytes.get('claim-ledger')), accountingSha256: digest(outputBytes.get('suite-accounting')),
    checkedCriteria: checkedSprintCriteria, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, gitEvidence,
    publicHeadEquivalence: implementationHead === executionHead ? { implementationHead, executionHead, identicalHead: true } : publicGitEvidence,
    auditedInputs: [...checked.values()].map(({ path: file, sha256 }) => ({ path: file, sha256 })).sort((a, b) => a.path.localeCompare(b.path)),
    builderSelfCertified: false, separateReviewRequired: true,
    limitation: 'This audit verifies the actual build evidence graph and does not certify the sprint. Handoff flags are checked; handoff bytes are excluded because the handoff subsequently binds this audit.' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const root = path.resolve(argument('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  const executionHead = argument('--execution-head'); const reviewHead = argument('--review-head');
  const artifactsRoot = path.resolve(argument('--artifacts-root') ?? root);
  const outputRoot = path.resolve(argument('--output') ?? path.join(root, 'artifacts/product-reality/sprint-185/m05/closeout-independent-audit'));
  const command = process.argv.map(value => `'${value.replace(/'/g, `'\\''`)}'`).join(' ');
  mkdirSync(outputRoot, { recursive: true });
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', executionHead, reviewHead], { cwd: root });
    const changes = execFileSync('git', ['diff', '--name-status', '--no-renames', `${executionHead}..${reviewHead}`], { cwd: root, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean).map(line => { const [status, file] = line.split('\t'); return { status, path: file }; });
    const readFrozen = file => execFileSync('git', ['show', `${reviewHead}:${file}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
    const readHistorical = (commit, file) => execFileSync('git', ['show', `${commit}:${file}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
    const manifestPath = argument('--manifest') ?? defaultManifest;
    const manifest = JSON.parse(readFrozen(manifestPath));
    const implementationHead = JSON.parse(readFrozen(manifest.sources.noticePlan)).implementationHead;
    const publicGitEvidence = auditPublicRuntimeBytes({ root, implementationHead, executionHead,
      sprintId: manifest.missionId === 's188-m06' ? 'sprint-188' : manifest.missionId === 's187-m06' ? 'sprint-187' : manifest.missionId === 's186-m06' ? 'sprint-186' : 'sprint-185' });
    const rangeGitEvidence = manifest.missionId === 's188-m06'
      ? auditSprintRange({ root, base: 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076', head: implementationHead, sprintId: 'sprint-188' }) : manifest.missionId === 's187-m06'
      ? auditSprintRange({ root, base: '21c7c31906fbb81d049b943155c64ed78409fb9f', head: implementationHead, sprintId: 'sprint-187' }) : manifest.missionId === 's186-m06'
      ? auditSprintRange({ root, base: '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2', head: implementationHead }) : undefined;
    const report = auditFinalCloseout({ executionHead, reviewHead,
      gitEvidence: { ancestor: true, changes }, publicGitEvidence, rangeGitEvidence, manifestPath,
      readOutput: file => readFileSync(path.join(artifactsRoot, file)),
      readFrozen, readHistorical,
    });
    const stdout = `Independent actual-output audit passed: ${report.checkedCriteria} literal criteria, ${report.checkedExecutions} executions, ${report.checkedFrozenPaths} frozen paths.\n`;
    writeFileSync(path.join(outputRoot, 'audit.json'), `${JSON.stringify({ ...report, exitCode: 0, command, host: os.hostname(), stdout }, null, 2)}\n`);
    writeFileSync(path.join(outputRoot, 'audit.log'), stdout); process.stdout.write(stdout);
  } catch (error) {
    const stdout = `${error.stack ?? error}\n`;
    writeFileSync(path.join(outputRoot, 'audit.json'), `${JSON.stringify({ status: 'failed', executionHead, reviewHead, exitCode: 1, command, host: os.hostname(), stdout }, null, 2)}\n`);
    writeFileSync(path.join(outputRoot, 'audit.log'), stdout); process.stderr.write(stdout); process.exitCode = 1;
  }
}
