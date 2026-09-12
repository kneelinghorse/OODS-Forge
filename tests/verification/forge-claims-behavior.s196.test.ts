import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TraitCompositor } from '../../src/core/compositor.js';
import type { TraitDefinition } from '../../src/core/trait-definition.js';

describe('the published state-machine cardinality matches the default compositor', () => {
  it('distinguishes the default single-owner rule from the explicit override', () => {
    const document = readFileSync('docs/how-forge-works.html', 'utf8');
    const claim = document.match(/<!-- forge-claim:state-machine-cardinality -->([\s\S]*?)<!-- \/forge-claim:state-machine-cardinality -->/)?.[1];
    expect(claim).toContain('multiple owners are refused by default');
    const traits: TraitDefinition[] = ['DraftState', 'ApprovalState'].map(name => ({
      trait: { name, version: '1.0.0' },
      schema: {},
      state_machine: { states: ['initial'], initial: 'initial', transitions: [] },
    }));
    expect(new TraitCompositor().compose([traits[0]]).success).toBe(true);
    const conflicting = new TraitCompositor().compose(traits);
    expect(conflicting.success).toBe(false);
    expect(conflicting.errors?.map(error => error.type)).toContain('multiple_state_machines');
    // The wording must stay qualified: an explicit opt-in changes the policy.
    expect(new TraitCompositor({ allowMultipleStateMachines: true }).compose(traits).success).toBe(true);
  });
});
