#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateEmissionEligibility } from '../../packages/component-contracts/dist/index.js';
import { resolveReadinessRowReferences } from '../../packages/mcp-server/dist/codegen/target-readiness.js';

export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BASELINE_PATH = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
export const OVERLAY_PATH = 'packages/component-contracts/registry/component-capability-ported-surfaces.v1.json';
export const FOLD_BASE = '9fb7882e01cc0067ae6e69ad27330864ad228dd4';
const SPRINT_BASE = '1118f436345e160437abfedbe73a19f190a92562';
/**
 * Sprint 185 wrote its fold record under m05. Sprint 186 folds each mission's
 * newly reachable components as they land, so the record is sprint-wide and
 * rewritten per mission; the frozen Sprint 185 record stays where it was.
 */
const RECORD_ROOT = 'artifacts/product-reality/sprint-186/baseline-fold';
const FOLD_MISSION = 's186-m05';
const FOUNDATION_PATH = 'packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json';
const FOUNDATION_SHA256 = '7f473d04ca66be9b3119e41e3b4784876115cde5ca742b4f5dd13759e8f7be71';
const TARGETS = ['react', 'vue'];
export const SURFACES = Object.freeze(['react', 'vue', 'generatedConsumer']);
const READINESS = {
  nucleus: { react: 'packages/components-react/evidence/react-readiness.v1.json', vue: 'packages/components-vue/evidence/vue-readiness.v1.json' },
  ported: { react: 'packages/components-react/evidence/react-ported-readiness.v1.json', vue: 'packages/components-vue/evidence/vue-readiness-ported.v1.json' },
};
const PORTED_PACKED_REPORT = 'artifacts/product-reality/sprint-184/m04/packed-consumers/report.json';
/** Every live packed-consumer proof that can carry a new nucleus component's generatedConsumer evidence. */
const LIVE_ROOTS = Object.freeze([
  'artifacts/product-reality/sprint-185/m04/live-consumers',
  'artifacts/product-reality/sprint-186/m01/live-consumers',
  'artifacts/product-reality/sprint-186/m02/live-consumers',
  'artifacts/product-reality/sprint-186/m03/live-consumers',
  'artifacts/product-reality/sprint-186/m04/live-consumers',
  'artifacts/product-reality/sprint-186/m05/recomposed-live-consumers',
]);
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const readJson = (root, file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const historicalJson = (root, commit, file) => JSON.parse(execFileSync('git', ['show', `${commit}:${file}`], { cwd: root, encoding: 'utf8' }));

function declarationArchive(file) {
  assert(file.startsWith('packages/') && file.includes('/dist/') && file.endsWith('.d.ts'), `Expected public declaration path: ${file}`);
  return `${RECORD_ROOT}/build-outputs/${file}`;
}

export function captureReadinessDeclarations(root = DEFAULT_ROOT) {
  const declarations = new Set(Object.values(READINESS).flatMap(targets => Object.values(targets)).flatMap(file =>
    readJson(root, file).rows.flatMap(row => row.evidence.publicDeclaration.refs.map(ref => ref.split('#')[0]))));
  for (const file of declarations) {
    const target = path.join(root, declarationArchive(file));
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(path.join(root, file)));
  }
}

export function identityProjection(document) {
  return document.rows.map(({ id, proposedClassification, reconciliationState }) => ({ id, proposedClassification, reconciliationState }));
}

/** Only the named component/surface cells may differ; all other baseline data stays intact. */
export function assertSurfaceOnlyDiff(before, after, componentIds) {
  assert.equal(after.rows.length, 109, 'The controlling baseline still has 109 rows.');
  assert.equal(new Set(after.rows.map(row => row.id)).size, after.rows.length, 'Baseline ids must remain unique.');
  assert.equal(after.controllingObligationDenominator, before.controllingObligationDenominator);
  assert.deepEqual(identityProjection(after), identityProjection(before), 'Identity, proposed classification, and reconciliation state are immutable.');
  const preserved = structuredClone(after);
  for (const row of preserved.rows) if (componentIds.includes(row.id)) {
    const original = before.rows.find(candidate => candidate.id === row.id);
    for (const surface of SURFACES) row.surfaces[surface] = original.surfaces[surface];
  }
  assert.deepEqual(preserved, before, 'Only authorized React/Vue/generatedConsumer surface cells may change.');
}

/** JSON pointers address actual observations; component anchors address actual named rows. */
export function resolveSurfaceEvidence(ref, root = DEFAULT_ROOT) {
  const separator = ref.indexOf('#');
  assert(separator > 0 && separator < ref.length - 1, `Evidence needs an anchor: ${ref}`);
  const file = ref.slice(0, separator);
  const anchor = ref.slice(separator + 1);
  assert(!path.isAbsolute(file) && !file.split('/').some(part => ['..', '.', ''].includes(part)), `Unsafe evidence path: ${ref}`);
  const document = readJson(root, file);
  if (anchor.startsWith('/')) {
    let value = document;
    for (const token of anchor.slice(1).split('/').map(token => token.replaceAll('~1', '/').replaceAll('~0', '~'))) {
      assert(value !== null && typeof value === 'object' && Object.hasOwn(value, token), `Unresolved JSON pointer: ${ref}`);
      value = value[token];
    }
    return value;
  }
  const candidates = [...(document.rows ?? []), ...(document.components ?? [])]
    .filter(row => (row.componentId ?? row.id) === anchor);
  assert.equal(candidates.length, 1, `Evidence anchor must resolve exactly once: ${ref}`);
  return candidates[0];
}

export function deriveReadinessSurface(row, documentPath, root = DEFAULT_ROOT) {
  assert.equal(row.state, 'implemented-evidence-complete', `${row.componentId}: readiness state is incomplete.`);
  assert.equal(row.emissionEligible, true, `${row.componentId}: emission eligibility is not established.`);
  assert.equal(evaluateEmissionEligibility(row.evidence).emissionEligible, true, `${row.componentId}: readiness evidence is incomplete.`);
  assert.deepEqual(resolveReadinessRowReferences(row, { repositoryRoot: root }), [], `${row.componentId}: readiness references do not resolve.`);
  const ref = `${documentPath}#${row.componentId}`;
  assert.deepEqual(resolveSurfaceEvidence(ref, root), row, `${row.componentId}: readiness anchor resolves to another row.`);
  return { state: row.state, evidence: [ref] };
}

export function deriveBaselineSurfaceFold(root = DEFAULT_ROOT) {
  const before = historicalJson(root, FOLD_BASE, BASELINE_PATH);
  const originalOverlay = historicalJson(root, FOLD_BASE, OVERLAY_PATH);
  const documents = Object.fromEntries(Object.entries(READINESS).map(([cohort, targets]) => [cohort,
    Object.fromEntries(TARGETS.map(target => [target, readJson(root, targets[target])]))]));
  const oldNucleus = historicalJson(root, SPRINT_BASE, READINESS.nucleus.react).rows.map(row => row.componentId);
  const currentIds = target => documents.nucleus[target].rows.map(row => row.componentId);
  assert.deepEqual(currentIds('react'), currentIds('vue'), 'Nucleus readiness target membership differs.');
  // Every component added to the nucleus since the Sprint 185 base; waves append, never a literal count.
  const newIds = currentIds('react').filter(id => !oldNucleus.includes(id));
  assert(newIds.length > 0, 'The fold has no new nucleus components.');
  assert(oldNucleus.every(id => currentIds('react').includes(id)), 'Existing nucleus membership was removed.');
  const portedIds = documents.ported.react.rows.map(row => row.componentId);
  assert.deepEqual(portedIds, documents.ported.vue.rows.map(row => row.componentId));
  assert.deepEqual(portedIds, originalOverlay.rows.map(row => row.id), 'Ported membership differs from the historical overlay.');
  assert.equal(portedIds.length, 8);
  const componentIds = [...newIds, ...portedIds].sort();
  assert.equal(new Set(componentIds).size, componentIds.length, 'The two component unions overlap.');
  const baseline = structuredClone(before);
  const changes = [];
  const references = new Set([BASELINE_PATH, FOUNDATION_PATH, 'packages/component-contracts/registry/component-reconciliation.proposed.v1.json']);
  const readinessReferences = [];
  const portedPacked = readJson(root, PORTED_PACKED_REPORT);
  assert.equal(portedPacked.status, 'passed'); assert.equal(portedPacked.failed, 0); assert.equal(portedPacked.skipped, 0);
  references.add(PORTED_PACKED_REPORT);
  const liveCells = LIVE_ROOTS.flatMap(liveRoot => {
    const live = readJson(root, `${liveRoot}/report.json`);
    assert.equal(live.status, 'passed'); assert.equal(live.failed, 0); assert.equal(live.skipped, 0);
    references.add(`${liveRoot}/report.json`);
    return live.cells.map(cell => {
      const file = `${liveRoot}/${cell.report}`;
      const content = readFileSync(path.join(root, file));
      assert.equal(sha256(content), cell.reportSha256.replace(/^sha256:/, ''), 'Live consumer report hash differs.');
      const report = JSON.parse(content.toString('utf8'));
      assert.equal(report.status, 'passed');
      assert.equal(report.gates.length, 8);
      assert(report.gates.every(gate => gate.status === 'passed' || (gate.name === 'interaction-evidence' && gate.status === 'not-applicable')));
      references.add(file);
      return { file, report };
    });
  });
  for (const componentId of componentIds) {
    const row = baseline.rows.find(candidate => candidate.id === componentId);
    assert(row, `Existing baseline row is missing: ${componentId}`);
    const cohort = newIds.includes(componentId) ? 'nucleus' : 'ported';
    for (const target of TARGETS) {
      const documentPath = READINESS[cohort][target];
      const readiness = documents[cohort][target].rows.find(candidate => candidate.componentId === componentId);
      assert(readiness, `Readiness row missing: ${componentId}/${target}`);
      row.surfaces[target] = deriveReadinessSurface(readiness, documentPath, root);
      references.add(documentPath);
      for (const [evidenceClass, evidence] of Object.entries(readiness.evidence)) for (const ref of evidence.refs) {
        const file = ref.split('#')[0];
        references.add(file);
        readinessReferences.push({ componentId, target, evidenceClass, ref, resolved: true });
      }
    }
    if (cohort === 'ported') {
      const ref = `${PORTED_PACKED_REPORT}#${componentId}`;
      const proof = resolveSurfaceEvidence(ref, root);
      for (const target of TARGETS) assert.equal(proof.generatedConsumer[target], 'passed', `${componentId}/${target}: packed proof is absent.`);
      assert.equal(proof.state, row.surfaces.react.state);
      row.surfaces.generatedConsumer = { state: proof.state, evidence: [ref] };
      assert.deepEqual(row.surfaces.generatedConsumer, originalOverlay.rows.find(candidate => candidate.id === componentId).surfaces.generatedConsumer,
        'Folding the ported report must retain its actual historical evidence.');
    } else {
      const refs = [];
      const targets = new Set();
      for (const { file, report } of liveCells) {
        report.browser.requiredMounts.forEach((observation, index) => {
          if (observation.component !== componentId) return;
          assert.equal(observation.passed, true);
          if (observation.requiredInitially) {
            assert.equal(observation.present, true);
            for (const label of report.browser.labelVisibility.filter(label => label.component === componentId && label.rootId === observation.nodeId))
              assert(label.passed && label.visible, `${componentId}/${report.framework}: recorded generated label is not visible.`);
            refs.push(`${file}#/browser/requiredMounts/${index}`);
          } else {
            // The saved schema places this node under an inactive Tabs panel, so the
            // generated consumer compiles, builds and hydrates it without mounting it
            // initially. The evidence is the waived obligation plus the generated
            // source that carries the node, never an invented mount.
            assert(String(observation.reason ?? '').startsWith('inactive initial Tabs panel'), `${componentId}/${report.framework}: unexplained absent mount.`);
            const liveRoot = file.slice(0, file.indexOf('/cells/'));
            const generated = readFileSync(path.join(root, liveRoot, report.generation.sourcePath), 'utf8');
            assert(generated.includes(`id="${observation.nodeId}" data-oods-component="${componentId}"`), `${componentId}/${report.framework}: generated source lacks the node.`);
            refs.push(`${file}#/browser/requiredMounts/${index}`, `${file}#/generation/sourceSha256`);
          }
          targets.add(report.framework);
        });
      }
      assert.deepEqual([...targets].sort(), TARGETS, `${componentId}: generated evidence must cover both frameworks.`);
      row.surfaces.generatedConsumer = { state: row.surfaces.react.state, evidence: refs.sort() };
    }
    for (const surface of SURFACES) {
      row.surfaces[surface].evidence.forEach(ref => resolveSurfaceEvidence(ref, root));
      changes.push({ componentId, surface,
        before: before.rows.find(candidate => candidate.id === componentId).surfaces[surface], after: row.surfaces[surface] });
    }
  }
  assertSurfaceOnlyDiff(before, baseline, componentIds);
  assert.equal(sha256(readFileSync(path.join(root, FOUNDATION_PATH))), FOUNDATION_SHA256, 'Frozen foundation projection changed.');
  assert.equal(readJson(root, 'packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus, null,
    'Surface evidence does not approve the runtime census.');
  for (const file of ['scripts/product-reality/s185-baseline-surfaces.mjs',
    'packages/component-contracts/package.json', 'packages/component-contracts/test/baseline-fold.s185.spec.ts',
    'packages/component-contracts/test/ported-contracts.s184.spec.ts', 'packages/mcp-server/test/product-reality/ported-workflow.s184.spec.ts',
    'packages/component-contracts/src/foundation-v1.ts', 'packages/mcp-server/src/codegen/target-readiness.ts']) references.add(file);
  const retainedBuildOutputs = [...references].filter(file => file.includes('/dist/')).sort().map(originalSourcePath => {
    const retainedPath = declarationArchive(originalSourcePath);
    const original = readFileSync(path.join(root, originalSourcePath));
    assert.equal(sha256(readFileSync(path.join(root, retainedPath))), sha256(original), `Retained public declaration differs: ${originalSourcePath}`);
    return { originalSourcePath, retainedPath, sha256: sha256(original) };
  });
  for (const reference of readinessReferences) {
    const retained = retainedBuildOutputs.find(row => row.originalSourcePath === reference.ref.split('#')[0]);
    if (retained) reference.retainedDeclaration = retained;
  }
  const sourceHashes = [...references].sort().map(file => {
    const retained = retainedBuildOutputs.find(row => row.originalSourcePath === file);
    return retained ? { path: retained.retainedPath, originalSourcePath: file, sha256: retained.sha256 }
      : { path: file, sha256: sha256(readFileSync(path.join(root, file))) };
  });
  return { baseline, record: {
    schemaVersion: '1.0.0', mission: FOLD_MISSION, kind: 'readiness-derived-baseline-surface-fold', foldBase: FOLD_BASE, sprintBase: SPRINT_BASE,
    liveConsumerRoots: LIVE_ROOTS,
    denominator: baseline.rows.length, identityProjectionSha256: sha256(canonical(identityProjection(baseline))),
    identityClassificationAndReconciliationUnchanged: true, approvedRuntimeCensus: null,
    newNucleusComponents: newIds, portedComponents: portedIds, changedComponentCount: componentIds.length, changedSurfaceCellCount: changes.length,
    changes, readinessReferences, retainedBuildOutputs, sourceHashes,
    frozenFoundation: { path: FOUNDATION_PATH, sha256: FOUNDATION_SHA256 },
    overlayRetirement: { file: OVERLAY_PATH, packageExport: './registry/capabilities/ported',
      reason: 'Decision 1726: surface cells are evidence on existing baseline identities. Folding the overlay does not promote a classification or change either component union.',
      readers: [
        { path: 'packages/component-contracts/test/ported-contracts.s184.spec.ts', disposition: 'Repoint the 24 surface checks to the eight existing baseline rows; retain the frozen foundation SHA and replace the mutable-baseline byte pin with structural invariants.' },
        { path: 'packages/mcp-server/test/product-reality/ported-workflow.s184.spec.ts', disposition: 'Read the same eight React/Vue/generatedConsumer cells in the canonical baseline; preserve live Subscription workflow and contract-defect assertions.' },
      ] },
    limitations: [`The ${baseline.rows.length - componentIds.length} other component rows and all non-target surfaces are unchanged, including their historical evidence states.`,
      'This fold records implemented-evidence-complete surface evidence; it does not assert foundation-v1 review promotion or approve the runtime census.'],
    builderSelfCertified: false, separateReviewRequired: true,
  } };
}

export function verifyBaselineSurfaceFold(root = DEFAULT_ROOT) {
  const derived = deriveBaselineSurfaceFold(root);
  assert.deepEqual(readJson(root, BASELINE_PATH), derived.baseline, 'Baseline differs from readiness-derived surface cells.');
  assert.equal(existsSync(path.join(root, OVERLAY_PATH)), false, 'Retired capability overlay still exists.');
  assert.equal(Object.hasOwn(readJson(root, 'packages/component-contracts/package.json').exports, './registry/capabilities/ported'), false,
    'Retired package export still exists.');
  return derived;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  assert(['--write', '--check'].includes(mode), 'Usage: node scripts/product-reality/s185-baseline-surfaces.mjs --write|--check');
  if (mode === '--write') {
    captureReadinessDeclarations();
    const { baseline } = deriveBaselineSurfaceFold();
    writeFileSync(path.join(DEFAULT_ROOT, BASELINE_PATH), canonical(baseline));
  }
  const { record } = verifyBaselineSurfaceFold();
  const recordPath = path.join(DEFAULT_ROOT, RECORD_ROOT, 'report.json');
  if (mode === '--write') { mkdirSync(path.dirname(recordPath), { recursive: true }); writeFileSync(recordPath, canonical(record)); }
  else assert.equal(readFileSync(recordPath, 'utf8'), canonical(record), 'Baseline fold provenance is stale.');
  process.stdout.write(`${mode}: ${record.changedSurfaceCellCount} surface cells from ${record.changedComponentCount} existing components; ${record.denominator} identities unchanged; ${record.readinessReferences.length} readiness refs resolved.\n`);
}
