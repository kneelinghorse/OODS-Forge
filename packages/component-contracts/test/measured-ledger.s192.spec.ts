import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { componentCapabilityBaseline, componentReconciliationProposal, getBaselineCapability, NUCLEUS_COMPONENT_IDS } from '../src/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (file: string) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const require = createRequire(path.join(root, 'packages/component-contracts/package.json'));
const manifest = read('artifacts/structured-data/manifest.json');
const exported = read(manifest.artifacts.find((row: { name: string }) => row.name === 'components').path);

describe('Sprint 192 evidence-derived ledger and pending classification', () => {
  it('serves one current ledger through the existing package API and all 110 exported surface rows', () => {
    const ledgerPath = require.resolve('@oods/component-contracts/registry/capabilities');
    expect(ledgerPath).toContain('/component-capability-ledger.v1.json');
    expect(JSON.parse(readFileSync(ledgerPath, 'utf8'))).toEqual(componentCapabilityBaseline);
    expect(componentCapabilityBaseline.rows).toHaveLength(110);
    expect(manifest.artifacts.find((row: { name: string }) => row.name === 'components').path).toBe(`artifacts/structured-data/oods-components-${manifest.version}.json`);
    expect(exported.obligationScope.approvedRuntimeCensus).toBeNull();
    for (const row of componentCapabilityBaseline.rows) {
      const published = exported.components.find((entry: { id: string }) => entry.id === row.id);
      expect(published.productReality.surfaces, row.id).toEqual(row.surfaces);
      expect(getBaselineCapability(row.id)).toEqual(row);
      for (const surface of ['accessibility', 'theme', 'interaction'] as const) {
        const cell = row.surfaces[surface];
        expect(cell.state).not.toBe('unverified');
        const governed = NUCLEUS_COMPONENT_IDS.includes(row.id as typeof NUCLEUS_COMPONENT_IDS[number]);
        expect(['verified', 'not-applicable'].includes(cell.state)).toBe(governed);
        if (!governed) expect(cell).toMatchObject({ state: 'unavailable', reason: expect.any(String) });
      }
    }
  });

  it('retains historical bytes while exposing the new, still-unapproved proposal', () => {
    const historical = readFileSync(path.join(root, 'packages/component-contracts/registry/historical/component-capability-baseline.v1.json'));
    expect(historical).toEqual(readFileSync(path.join(root, 'packages/component-contracts/registry/component-capability-baseline.v1.json')));
    const proposal = componentReconciliationProposal;
    expect(proposal.approvedRuntimeCensus).toBeNull();
    expect(proposal.rows.map(row => row.id)).toEqual(componentCapabilityBaseline.rows.map(row => row.id));
    const previous = read('packages/component-contracts/registry/component-reconciliation.proposed.v1.json');
    const changes = proposal.rows.filter(row => previous.rows.some((before: { id: string; proposedClassification: string }) => before.id === row.id && before.proposedClassification !== row.proposedClassification));
    expect(changes.map(row => row.id)).toEqual(read('artifacts/product-reality/sprint-192/m06/classification-changes.json').changes.map((row: { id: string }) => row.id));
    expect(changes).toHaveLength(11);
    expect(proposal.rows.filter(row => !previous.rows.some((before: { id: string }) => before.id === row.id)).map(row => row.id)).toEqual(['VizGraphPreview']);
    for (const row of proposal.rows) {
      expect(row.approvalState).toBe('pending-derek-approval');
      expect(row.compatibilityNote.length).toBeGreaterThan(0);
      expect(Object.keys(row.proposedResolution).length).toBeGreaterThan(0);
      if (row.proposedClassification === 'recipe') expect(row.proposedResolution).toHaveProperty('primitive');
      if (row.proposedClassification === 'alias') expect(row.proposedResolution).toHaveProperty('target', 'PaymentTimeline');
      for (const ref of row.evidence) expect(existsSync(path.join(root, ref.split('#')[0])), ref).toBe(true);
    }
    expect(historical).toEqual(execFileSync('git', ['show', '5fdf8a18:packages/component-contracts/registry/component-capability-baseline.v1.json'], { cwd: root }));
  });
});
