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

export function auditSprintRange({ root, base, head }) {
  assert(fullHead(base) && fullHead(head));
  const paths = scope => execFileSync('git', ['diff', '--name-only', `${base}..${head}`, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(file => file && !testPath(file)).sort();
  const canonical = ['configs/agent/policy.json', 'docs/api', 'packages/mcp-adapter/tool-descriptions.json',
    'packages/mcp-server/src/schemas', 'packages/mcp-server/src/schemas/generated.ts',
    'packages/mcp-server/src/security/policy.json', 'packages/mcp-server/src/tools/registry.json'];
  return { base, head, canonicalPaths: paths(canonical), publicPaths: paths(publicScope) };
}
const sourceKeys = [
  ['baselineFold'], ['movers'], ['movers', 'noticePlan', 'deliveries'],
  ['reviewCarries', 'behaviorBites', 'near'], ['reviewCarries'], ['bridge'], [],
  ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near', 'm04BuildRecord'],
];

export function auditFinalCloseout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath = defaultManifest }) {
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Audit requires actual full execution and review SHAs.');
  const wave2 = manifestPath.startsWith('artifacts/product-reality/sprint-186/m06/');
  const missionId = wave2 ? 's186-m06' : 's185-m05';
  const sprintId = wave2 ? 'sprint-186' : 'sprint-185';
  const criterionCount = wave2 ? 6 : 8;
  const suiteCriterion = wave2 ? 4 : 6;
  const outputPrefix = wave2 ? 'artifacts/product-reality/sprint-186/m06/closeout' : prefix;
  const requiredSourceKeys = wave2 ? [['unionFold'], ['baselineFold'], ['movers', 'moversDeclaration'],
    ['movers', 'noticePlan', 'deliveries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : sourceKeys;
  assert.equal(gitEvidence?.ancestor, true, 'Review head must descend from the actual execution head.');
  // Decision 1741 allows new capture records, not rewritten fixtures or code.
  for (const change of gitEvidence.changes) {
    const allowed = wave2
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
    assert.equal(publicGitEvidence.excludeTests, true); assert.deepEqual(publicGitEvidence.scope, publicScope);
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

  if (wave2) {
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
    assert.deepEqual(Object.keys(accounting.baselines), ['sprint185Closeout']);
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
    assert.equal(accounting.comparisons.length, accounting.baselines.sprint185Closeout.runs.length * 4, 'A baseline suite comparison is absent.');
    assert(accounting.closeoutFailures.every(row => row.status === 'inherited-failure-disclosed'), 'An unexplained closeout failure was marked accounted.');
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
  assert.deepEqual(ledger.headline, { total: criterionCount, proven: criterionCount, unproven: 0 }); assert.deepEqual(ledger.unproven, []);
  assert.equal(ledger.status, 'ready-for-independent-review');
  return { schemaVersion: '1.0.0', status: 'passed', executionHead, reviewHead,
    ledgerSha256: digest(outputBytes.get('claim-ledger')), accountingSha256: digest(outputBytes.get('suite-accounting')),
    checkedCriteria: criterionCount, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, gitEvidence,
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
    const publicGitEvidence = auditPublicRuntimeBytes({ root, implementationHead, executionHead });
    const rangeGitEvidence = manifest.missionId === 's186-m06'
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
