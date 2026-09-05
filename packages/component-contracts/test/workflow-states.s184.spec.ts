import { describe, expect, it } from 'vitest';

import {
  UI_WORKFLOW_STATES,
  componentContracts,
  portedComponentContracts,
} from '../src/index.js';

describe('Sprint 184 workflow-state vocabulary', () => {
  it('exports the exact ordered cross-component vocabulary', () => {
    expect(UI_WORKFLOW_STATES).toEqual(['loading', 'empty', 'error', 'success']);
  });

  it('keeps workflow states separate from component-local state contracts', () => {
    expect(Object.keys(componentContracts)).toHaveLength(14);
    expect(Object.keys(portedComponentContracts)).toHaveLength(8);
    for (const contract of [
      ...Object.values(componentContracts),
      ...Object.values(portedComponentContracts),
    ]) {
      expect(contract).not.toHaveProperty('workflowStates');
    }
  });
});
