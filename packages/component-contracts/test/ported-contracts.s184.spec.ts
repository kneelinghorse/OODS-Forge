import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import portedCapabilityOverlay from '../registry/component-capability-ported-surfaces.v1.json';
import {
  NUCLEUS_COMPONENT_IDS,
  PORTED_COMPONENT_IDS,
  componentCapabilityBaseline,
  componentContracts,
  portedComponentContracts,
  portedScenarios,
  sharedScenarios,
} from '../src/index.js';

const EXPECTED_PORTED_IDS = [
  'AuditTimeline',
  'CancellationSummary',
  'PaginationBar',
  'PriceBadge',
  'RelativeTimestamp',
  'SearchInput',
  'StatusBadge',
  'StatusTimeline',
] as const;

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

function sha256(repositoryPath: string): string {
  const contents = readFileSync(path.resolve(TEST_DIRECTORY, '../../..', repositoryPath));
  return createHash('sha256').update(contents).digest('hex');
}

describe('Sprint 184 separate ported component truth plane', () => {
  it('keys the nucleus contracts and scenarios exactly by NUCLEUS_COMPONENT_IDS', () => {
    expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());
    expect(sharedScenarios.map(({ oodsComponentId }) => oodsComponentId).sort()).toEqual(
      [...NUCLEUS_COMPONENT_IDS].sort(),
    );
    expect(componentContracts).toHaveProperty('Select.version', '1.1.0');
    expect(componentContracts).not.toHaveProperty('StatusBadge');
  });

  it('defines exactly the disjoint, code-point-sorted eight-component port tranche', () => {
    expect(PORTED_COMPONENT_IDS).toEqual(EXPECTED_PORTED_IDS);
    expect(PORTED_COMPONENT_IDS).toEqual([...PORTED_COMPONENT_IDS].sort());
    expect(new Set([...NUCLEUS_COMPONENT_IDS, ...PORTED_COMPONENT_IDS]).size).toBe(
      NUCLEUS_COMPONENT_IDS.length + PORTED_COMPONENT_IDS.length,
    );
    expect(Object.keys(portedComponentContracts)).toEqual(EXPECTED_PORTED_IDS);
    expect(portedScenarios.map(({ oodsComponentId }) => oodsComponentId)).toEqual(
      EXPECTED_PORTED_IDS,
    );

    for (const componentId of PORTED_COMPONENT_IDS) {
      const contract = portedComponentContracts[componentId];
      const scenario = portedScenarios.find((entry) => entry.oodsComponentId === componentId);
      expect(contract.id).toBe(componentId);
      expect(new Set(contract.props).size).toBe(contract.props.length);
      expect(contract.accessibility.length).toBeGreaterThan(0);
      expect(scenario, componentId).toBeDefined();
      expect(Object.keys(scenario!.props).length + Object.keys(scenario!.slots).length).toBeGreaterThan(0);
      expect(scenario!.assertions.length).toBeGreaterThan(0);
    }
  });

  it('carries exactly 24 separate surface cells without moving the 109-row denominator', () => {
    expect(componentCapabilityBaseline.rows).toHaveLength(109);
    expect(componentCapabilityBaseline.controllingObligationDenominator).toBe(109);
    expect(portedCapabilityOverlay.controllingObligationDenominator).toBe(109);
    expect(portedCapabilityOverlay.nucleusDisposition).toBe(
      'separate-overlay-no-foundation-v1-promotion',
    );
    expect(portedCapabilityOverlay.rows.map(({ id }) => id)).toEqual(EXPECTED_PORTED_IDS);
    expect(portedCapabilityOverlay.rows.flatMap(({ surfaces }) => Object.keys(surfaces))).toHaveLength(24);
    for (const row of portedCapabilityOverlay.rows) {
      expect(Object.keys(row.surfaces)).toEqual(['react', 'vue', 'generatedConsumer']);
      expect(Object.values(row.surfaces).every(({ state }) => (
        state === 'implemented-evidence-complete'
      ))).toBe(true);
    }
  });

  it('leaves the frozen capability and foundation-v1 projections byte-identical', () => {
    expect(sha256('packages/component-contracts/registry/component-capability-baseline.v1.json'))
      .toBe('c4d237cff92448f224d5ec7717816fb85418781e397955ed66536ffaf9ac142f');
    expect(sha256('packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json'))
      .toBe('7f473d04ca66be9b3119e41e3b4784876115cde5ca742b4f5dd13759e8f7be71');
  });
});
