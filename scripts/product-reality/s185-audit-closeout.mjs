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
const testPath = file => /(^|\/)(?:__tests__|test|tests)\//.test(file) || /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file);

export function auditPublicRuntimeBytes({ root, implementationHead, executionHead }) {
  assert(fullHead(implementationHead) && fullHead(executionHead));
  execFileSync('git', ['merge-base', '--is-ancestor', implementationHead, executionHead], { cwd: root });
  const scopedChangedPaths = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${implementationHead}..${executionHead}`, '--', ...publicScope], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).sort();
  return { implementationHead, executionHead, ancestor: true, scope: publicScope, excludeTests: true,
    scopedChangedPaths, changedPaths: scopedChangedPaths.filter(file => !testPath(file)), excludedTestPaths: scopedChangedPaths.filter(testPath) };
}
const sourceKeys = [
  ['baselineFold'], ['movers'], ['movers', 'noticePlan', 'deliveries'],
  ['reviewCarries', 'behaviorBites', 'near'], ['reviewCarries'], ['bridge'], [],
  ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near', 'm04BuildRecord'],
];

export function auditFinalCloseout({ executionHead, reviewHead, readOutput, readFrozen, gitEvidence, publicGitEvidence, manifestPath = defaultManifest }) {
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Audit requires actual full execution and review SHAs.');
  assert.equal(gitEvidence?.ancestor, true, 'Review head must descend from the actual execution head.');
  // Decision 1741 allows new capture records, not rewritten fixtures or code.
  for (const change of gitEvidence.changes) {
    const allowed = /^artifacts\/product-reality\/sprint-185\/m05\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
      || /^artifacts\/product-reality\/sprint-185\/m05\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path);
    assert(change.status === 'A' && allowed, `Review descendant changes executable inputs or pre-existing evidence: ${change.status} ${change.path}`);
  }
  const outputBytes = new Map();
  const output = name => {
    const bytes = Buffer.from(readOutput(`${prefix}/${name}.json`)); outputBytes.set(name, bytes);
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
    assert(!file.startsWith(`${prefix}/`), 'Generated output cannot justify itself as a frozen source.');
    if (!checked.has(file)) {
      const bytes = Buffer.from(readFrozen(file));
      checked.set(file, { path: file, sha256: digest(bytes), bytes });
    }
    return checked.get(file);
  };
  const reference = ref => {
    assert(ref && typeof ref.sha256 === 'string' && /^[a-f0-9]{64}$/.test(bare(ref.sha256)), 'Cited reference lacks captured SHA256.');
    const observed = frozen(ref.path);
    assert.equal(observed.sha256, bare(ref.sha256), `Frozen source hash differs: ${ref.path}`);
    if (ref.commit !== undefined) assert.equal(ref.commit, reviewHead, 'Frozen reference has a relabeled review commit.');
    return observed;
  };
  const parseFrozen = file => JSON.parse(frozen(file).bytes.toString('utf8'));
  const manifest = parseFrozen(manifestPath);
  assert.equal(manifest.missionId, 's185-m05');
  assert(Array.isArray(manifest.sources.derivationInputs) && manifest.sources.derivationInputs.length > 0, 'Derivation rules must be frozen inputs.');
  for (const file of manifest.sources.derivationInputs) frozen(file);
  const implementationHead = parseFrozen(manifest.sources.noticePlan).implementationHead;
  if (implementationHead !== executionHead) {
    assert.equal(publicGitEvidence?.implementationHead, implementationHead);
    assert.equal(publicGitEvidence.executionHead, executionHead); assert.equal(publicGitEvidence.ancestor, true);
    assert.equal(publicGitEvidence.excludeTests, true); assert.deepEqual(publicGitEvidence.scope, publicScope);
    assert.deepEqual(publicGitEvidence.excludedTestPaths, publicGitEvidence.scopedChangedPaths.filter(testPath));
    assert.deepEqual(publicGitEvidence.changedPaths, publicGitEvidence.scopedChangedPaths.filter(file => !testPath(file)));
    assert.deepEqual(publicGitEvidence.changedPaths, [], 'Advertised public runtime bytes changed after the notice implementation head.');
    assert.deepEqual(ledger.publicHeadEquivalence, publicGitEvidence, 'Producer public equivalence differs from independent Git evidence.');
  }
  const mission = parseFrozen(manifest.sources.cmosMission).rawResponse.structuredContent.data;
  const original = parseFrozen(manifest.sources.cmosOriginalMission).rawResponse.structuredContent.data;
  const sprint = parseFrozen(manifest.sources.cmosSprint).rawResponse.structuredContent.data;
  assert.equal(mission.id, 's185-m05'); assert.equal(original.id, 's185-m05'); assert.equal(sprint.id, 'sprint-185');
  assert.equal(mission.successCriteria.length, 8); assert.equal(ledger.claims.length, 8);
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
  assert(!index.generatedOutputs.some(row => row.path === `${prefix}/evidence-index.json`), 'Index has a self-hash cycle.');
  for (const ref of index.frozenInputs) reference(ref);
  // The handoff may later bind this audit. Inspect its flags but do not bind its
  // mutable bytes in the audit: ledger/accounting + frozen inputs are stable.
  for (const name of ['claim-ledger', 'suite-accounting']) {
    const refs = index.generatedOutputs.filter(row => row.path === `${prefix}/${name}.json`);
    assert.equal(refs.length, 1, `Missing/duplicate generated ${name} index reference.`);
    assert.equal(refs[0].sha256, digest(outputBytes.get(name)), `Indexed ${name} hash differs from actual output.`);
  }

  assert.equal(accounting.status, 'passed');
  assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.headRelation.ancestor, true); assert.equal(accounting.headRelation.executableInputsUnchanged, true);
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
      for (const ref of refs) reference(ref);
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

  assert.equal(manifest.claimBindings.length, 8); assert.equal(new Set(manifest.claimBindings.map(row => row.criterionIndex)).size, 8);
  for (const [criterionIndex, claim] of ledger.claims.entries()) {
    assert.equal(claim.criterionIndex, criterionIndex); assert.equal(claim.claimId, `s185-m05-sc${String(criterionIndex + 1).padStart(2, '0')}`);
    const binding = manifest.claimBindings.find(row => row.criterionIndex === criterionIndex); assert(binding);
    const resolvedIds = [...(binding.executionIds ?? [])];
    if (binding.suiteBindings !== undefined) {
      assert.equal(criterionIndex, 6, 'Only the four-suite criterion may use future suite selectors.');
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
    const required = sourceKeys[criterionIndex].map(key => manifest.sources[key]);
    assert(required.every(file => binding.evidencePaths.includes(file)), 'Claim omits required frozen source.');
    const bound = claim.executionIds.map(id => { const row = executions.get(id); assert(row, 'Claim cites an unexecuted ID.'); return row; });
    if (criterionIndex !== 6) {
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
  assert.deepEqual(ledger.headline, { total: 8, proven: 8, unproven: 0 }); assert.deepEqual(ledger.unproven, []);
  assert.equal(ledger.status, 'ready-for-independent-review');
  return { schemaVersion: '1.0.0', status: 'passed', executionHead, reviewHead,
    ledgerSha256: digest(outputBytes.get('claim-ledger')), accountingSha256: digest(outputBytes.get('suite-accounting')),
    checkedCriteria: 8, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, gitEvidence,
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
    const manifestPath = argument('--manifest') ?? defaultManifest;
    const manifest = JSON.parse(readFrozen(manifestPath));
    const implementationHead = JSON.parse(readFrozen(manifest.sources.noticePlan)).implementationHead;
    const publicGitEvidence = auditPublicRuntimeBytes({ root, implementationHead, executionHead });
    const report = auditFinalCloseout({ executionHead, reviewHead,
      gitEvidence: { ancestor: true, changes }, publicGitEvidence, manifestPath,
      readOutput: file => readFileSync(path.join(artifactsRoot, file)),
      readFrozen,
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
