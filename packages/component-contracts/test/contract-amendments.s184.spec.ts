import { describe, expect, it } from 'vitest';

import {
  COMPONENT_CONTRACT_VERSION,
  COMPONENT_CONTRACT_VERSION_1_1,
  componentContracts,
  type ComponentContract,
} from '../src/index.js';

describe('Sprint 184 nucleus contract amendments', () => {
  it('versions only the three contracts whose saved-schema semantics changed', () => {
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
    expect(Object.values(componentContracts)).toHaveLength(14);
    expect(version11Ids).toHaveLength(3);
    expect(version10Ids).toHaveLength(11);
    expect(version11Ids).toEqual(['Select', 'Stack', 'Text']);
    expect(version10Ids).toEqual([
      'Badge',
      'Banner',
      'Button',
      'Card',
      'Checkbox',
      'DatePicker',
      'Grid',
      'Input',
      'Table',
      'Tabs',
      'Textarea',
    ]);
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
