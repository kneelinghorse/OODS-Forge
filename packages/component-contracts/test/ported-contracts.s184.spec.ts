import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

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

describe('Sprint 184 historical port compatibility within the canonical nucleus', () => {
  it('keys the nucleus contracts and scenarios exactly by NUCLEUS_COMPONENT_IDS', () => {
    expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());
    expect(sharedScenarios.map(({ oodsComponentId }) => oodsComponentId).sort()).toEqual(
      [...NUCLEUS_COMPONENT_IDS].sort(),
    );
    expect(componentContracts).toHaveProperty('Select.version', '1.1.0');
    expect(componentContracts.StatusBadge).toBe(portedComponentContracts.StatusBadge);
  });

  it('derives the historical eight-component compatibility views from the canonical nucleus', () => {
    expect(PORTED_COMPONENT_IDS).toEqual(EXPECTED_PORTED_IDS);
    expect(PORTED_COMPONENT_IDS).toEqual([...PORTED_COMPONENT_IDS].sort());
    expect(new Set([...NUCLEUS_COMPONENT_IDS, ...PORTED_COMPONENT_IDS]).size).toBe(
      NUCLEUS_COMPONENT_IDS.length,
    );
    expect(Object.keys(portedComponentContracts)).toEqual(EXPECTED_PORTED_IDS);
    expect(portedScenarios.map(({ oodsComponentId }) => oodsComponentId)).toEqual(
      EXPECTED_PORTED_IDS,
    );

    for (const componentId of PORTED_COMPONENT_IDS) {
      const contract = portedComponentContracts[componentId];
      const scenario = portedScenarios.find((entry) => entry.oodsComponentId === componentId);
      expect(NUCLEUS_COMPONENT_IDS).toContain(componentId);
      expect(contract).toBe(componentContracts[componentId]);
      expect(scenario).toBe(sharedScenarios.find((entry) => entry.oodsComponentId === componentId));
      expect(contract.id).toBe(componentId);
      expect(new Set(contract.props).size).toBe(contract.props.length);
      expect(contract.accessibility.length).toBeGreaterThan(0);
      expect(scenario, componentId).toBeDefined();
      expect(Object.keys(scenario!.props).length + Object.keys(scenario!.slots).length).toBeGreaterThan(0);
      expect(scenario!.assertions.length).toBeGreaterThan(0);
    }
  });

  it('preserves the historical cohort surface evidence on its existing baseline identities', () => {
    // Decision 1726: surface evidence belongs to existing identities, not a second overlay.
    expect(componentCapabilityBaseline.rows).toHaveLength(109);
    expect(componentCapabilityBaseline.controllingObligationDenominator).toBe(109);
    const portedRows = componentCapabilityBaseline.rows.filter(({ id }) => EXPECTED_PORTED_IDS.includes(id as typeof EXPECTED_PORTED_IDS[number]));
    expect(portedRows.map(({ id }) => id)).toEqual(EXPECTED_PORTED_IDS);
    const surfaces = ['react', 'vue', 'generatedConsumer'] as const;
    expect(portedRows.flatMap(row => surfaces.map(surface => row.surfaces[surface])))
      .toHaveLength(EXPECTED_PORTED_IDS.length * surfaces.length);
    for (const row of portedRows) {
      expect(surfaces.map(surface => row.surfaces[surface]).every(({ state }) => (
        state === 'implemented-evidence-complete'
      ))).toBe(true);
    }
  });

  it('leaves the historical foundation-v1 projection byte-identical', () => {
    // baseline-fold.s185.spec.ts asserts the mutable baseline's structural boundary.
    expect(sha256('packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json'))
      .toBe('7f473d04ca66be9b3119e41e3b4784876115cde5ca742b4f5dd13759e8f7be71');
  });
});
