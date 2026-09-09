import { describe, expect, it } from 'vitest';

import {
  COMPONENT_CONTRACT_VERSION,
  COMPONENT_CONTRACT_VERSION_1_1,
  NUCLEUS_COMPONENT_IDS,
  componentContracts,
  type ComponentContract,
} from '../src/index.js';

describe('Sprint 184 nucleus contract amendments', () => {
  it('versions the three original amendments and the static SVG extension', () => {
    const supportedVersions: readonly ComponentContract['version'][] = ['1.0.0', '1.1.0'];
    const version11Ids = Object.values(componentContracts)
      .filter((contract) => contract.version === COMPONENT_CONTRACT_VERSION_1_1)
      .map((contract) => contract.id)
      .sort();
    const version10Ids = Object.values(componentContracts)
      .filter((contract) => contract.version === COMPONENT_CONTRACT_VERSION)
      .map((contract) => contract.id)
      .sort();

    expect(supportedVersions).toEqual(['1.0.0', '1.1.0']);
    expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());
    expect(version11Ids).toEqual(['Select', 'Stack', 'Text', 'VizAreaPreview']);
    expect(version10Ids).toEqual(
      [...NUCLEUS_COMPONENT_IDS].filter((id) => !version11Ids.includes(id)).sort(),
    );
  });

  it('recognizes every new render prop and composition directive explicitly', () => {
    expect(componentContracts.Select.props).toContain('placeholder');
    expect(componentContracts.Text.props).toContain('label');
    expect(componentContracts.Stack.props).toEqual(
      expect.arrayContaining(['patternComponent', 'fields']),
    );
    expect(componentContracts.Stack.compatibility).toContain('executed composition directives');
  });
});
