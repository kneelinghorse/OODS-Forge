import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  assertSurfaceOnlyDiff, BASELINE_PATH, deriveBaselineSurfaceFold, deriveReadinessSurface,
  FOLD_BASE, identityProjection, OVERLAY_PATH, resolveSurfaceEvidence, SURFACES, verifyBaselineSurfaceFold,
} from '../../../scripts/product-reality/s185-baseline-surfaces.mjs';
import { componentCapabilityBaseline, componentReconciliationProposal, NUCLEUS_COMPONENT_IDS, PORTED_COMPONENT_IDS } from '../src/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const readJson = (file: string) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const before = JSON.parse(execFileSync('git', ['show', `${FOLD_BASE}:${BASELINE_PATH}`], { cwd: root, encoding: 'utf8' }));
const derived = deriveBaselineSurfaceFold(root);
const changedIds = [...derived.record.newNucleusComponents, ...derived.record.portedComponents].sort();

describe('Sprint 185 baseline surface evidence preserves the identity denominator', () => {
  it('changes only the 39 authorized surface cells and none of the 109 identity/classification/reconciliation rows', () => {
    expect(componentCapabilityBaseline.rows).toHaveLength(109);
    expect(identityProjection(componentCapabilityBaseline)).toEqual(identityProjection(before));
    expect(() => assertSurfaceOnlyDiff(before, componentCapabilityBaseline, changedIds)).not.toThrow();
    const actual = componentCapabilityBaseline.rows.flatMap((row, index) => Object.keys(row.surfaces)
      .filter(surface => JSON.stringify(row.surfaces[surface as keyof typeof row.surfaces]) !== JSON.stringify(before.rows[index].surfaces[surface]))
      .map(surface => `${row.id}/${surface}`));
    expect(actual.sort()).toEqual(changedIds.flatMap(id => SURFACES.map(surface => `${id}/${surface}`)).sort());
    expect(actual).toHaveLength(39);
    expect(componentReconciliationProposal.approvedRuntimeCensus).toBeNull();
  });

  it('rejects a renamed id, a promoted classification, or changed reconciliation state', () => {
    for (const key of ['id', 'proposedClassification', 'reconciliationState']) {
      const changed = structuredClone(componentCapabilityBaseline);
      Object.assign(changed.rows[0], { [key]: 'unauthorized-change' });
      expect(() => assertSurfaceOnlyDiff(before, changed, changedIds)).toThrow(/immutable/);
    }
  });

  it('rejects an unrelated component surface or a non-target surface change', () => {
    const unrelated = structuredClone(componentCapabilityBaseline);
    unrelated.rows.find(row => row.id === 'Button')!.surfaces.react.state = 'unavailable';
    expect(() => assertSurfaceOnlyDiff(before, unrelated, changedIds)).toThrow(/Only authorized/);
    const classificationEvidence = structuredClone(componentCapabilityBaseline);
    classificationEvidence.rows.find(row => row.id === 'DetailHeader')!.surfaces.contract.state = 'versioned-v1';
    expect(() => assertSurfaceOnlyDiff(before, classificationEvidence, changedIds)).toThrow(/Only authorized/);
  });

  it('derives the fold from the actual target readiness and resolves all 156 underlying reference occurrences', () => {
    expect(derived.baseline).toEqual(componentCapabilityBaseline);
    expect(derived.record.readinessReferences).toHaveLength(156);
    expect(derived.record.readinessReferences.every(row => row.resolved)).toBe(true);
    expect(derived.record.retainedBuildOutputs).toHaveLength(4);
    for (const output of derived.record.retainedBuildOutputs) {
      expect(readFileSync(path.join(root, output.retainedPath))).toEqual(readFileSync(path.join(root, output.originalSourcePath)));
      expect(derived.record.sourceHashes.some(row => row.path === output.originalSourcePath)).toBe(false);
    }
    for (const row of derived.record.changes) for (const ref of row.after.evidence)
      expect(resolveSurfaceEvidence(ref, root)).toBeDefined();
  });

  it('cannot advertise evidence-complete merely because a readiness flag is true', () => {
    const file = 'packages/components-react/evidence/react-ported-readiness.v1.json';
    const row = structuredClone(readJson(file).rows[0]);
    row.evidence.publicDeclaration.refs = ['packages/components-react/dist/ported.d.ts#InventedComponent'];
    expect(() => deriveReadinessSurface(row, file, root)).toThrow(/references do not resolve/);
    const incomplete = structuredClone(readJson(file).rows[0]);
    incomplete.evidence.frameworkScenario.status = 'missing';
    expect(() => deriveReadinessSurface(incomplete, file, root)).toThrow(/evidence is incomplete/);
  });

  it('requires an actual JSON anchor instead of accepting a file with an invented fragment', () => {
    expect(() => resolveSurfaceEvidence('packages/components-react/evidence/react-readiness.v1.json#InventedComponent', root)).toThrow(/exactly once/);
    expect(() => resolveSurfaceEvidence('packages/components-react/evidence/react-readiness.v1.json#/rows/900', root)).toThrow(/Unresolved JSON pointer/);
    expect(() => resolveSurfaceEvidence('../outside.json#anything', root)).toThrow(/Unsafe evidence path/);
  });

  it('binds every new generated-consumer cell to mounted observations in both framework targets', () => {
    for (const componentId of derived.record.newNucleusComponents) {
      const surface = derived.baseline.rows.find(row => row.id === componentId)!.surfaces.generatedConsumer;
      const targets = new Set<string>();
      for (const ref of surface.evidence) {
        const observation = resolveSurfaceEvidence(ref, root);
        expect(observation).toMatchObject({ component: componentId, requiredInitially: true, present: true, passed: true });
        targets.add(readJson(ref.split('#')[0]).framework);
      }
      expect([...targets].sort()).toEqual(['react', 'vue']);
    }
  });

  it('removes the temporary overlay file and package subpath while preserving both component unions', () => {
    expect(existsSync(path.join(root, OVERLAY_PATH))).toBe(false);
    const require = createRequire(path.join(root, 'packages/component-contracts/package.json'));
    expect(() => require.resolve('@oods/component-contracts/registry/capabilities/ported')).toThrow(/not defined by "exports"/);
    expect(derived.record.portedComponents).toEqual(PORTED_COMPONENT_IDS);
    expect(derived.record.newNucleusComponents.every(id => NUCLEUS_COMPONENT_IDS.includes(id))).toBe(true);
    expect(new Set([...NUCLEUS_COMPONENT_IDS, ...PORTED_COMPONENT_IDS]).size).toBe(NUCLEUS_COMPONENT_IDS.length + PORTED_COMPONENT_IDS.length);
    expect(() => verifyBaselineSurfaceFold(root)).not.toThrow();
  });
});
