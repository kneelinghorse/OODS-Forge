/**
 * Single-source-of-truth guard for the subscription state set (s126-m01).
 *
 * `SUBSCRIPTION_STATES` in src/domain/billing/states.ts is the ONE authority for the
 * canonical Stripe-literal extend-8 subscription states. The two Subscription object
 * YAMLs (core + saas-billing) declare the same set in their `lifecycle/Stateful`
 * parameters, and the core object additionally pins it as a status enum. This guard
 * asserts every one of those YAML-declared sets is byte-identical (same members, same
 * order) to `SUBSCRIPTION_STATES`, so the sources cannot silently re-diverge — which is
 * exactly the divergence (states.ts/core 7-state `delinquent` vs saas-billing 10-state)
 * this sprint converged.
 */

import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { SUBSCRIPTION_STATES } from '../../../src/domain/billing/states.js';

const CANONICAL = [...SUBSCRIPTION_STATES];

interface SubscriptionObjectYaml {
  traits?: Array<{
    name?: string;
    parameters?: { states?: string[] };
  }>;
  schema?: {
    status?: { validation?: { enum?: string[] } };
  };
}

function loadObject(relPath: string): SubscriptionObjectYaml {
  const abs = path.resolve(relPath);
  return yaml.load(readFileSync(abs, 'utf8')) as SubscriptionObjectYaml;
}

function statefulStates(obj: SubscriptionObjectYaml): string[] | undefined {
  const stateful = (obj.traits ?? []).find(
    (t) => t.name === 'lifecycle/Stateful'
  );
  return stateful?.parameters?.states;
}

const SOURCES: Array<[string, string]> = [
  ['core', 'objects/core/Subscription.object.yaml'],
  ['saas-billing', 'domains/saas-billing/objects/Subscription.object.yaml'],
];

describe('subscription state-set convergence guard', () => {
  it('canonical authority is the Stripe-literal extend-8 set', () => {
    expect(CANONICAL).toEqual([
      'future',
      'trialing',
      'active',
      'paused',
      'pending_cancellation',
      'past_due',
      'unpaid',
      'terminated',
    ]);
  });

  it.each(SOURCES)(
    '%s Subscription object Stateful.states is byte-identical to SUBSCRIPTION_STATES',
    (_label, relPath) => {
      const states = statefulStates(loadObject(relPath));
      expect(states).toBeDefined();
      expect(states).toEqual(CANONICAL);
    }
  );

  it('core Subscription object status enum is byte-identical to SUBSCRIPTION_STATES', () => {
    const core = loadObject('objects/core/Subscription.object.yaml');
    expect(core.schema?.status?.validation?.enum).toEqual(CANONICAL);
  });

  it('saas-billing Subscription object now declares a status field with the canonical enum', () => {
    const saas = loadObject('domains/saas-billing/objects/Subscription.object.yaml');
    // s126-m01 added the previously-missing status field.
    expect(saas.schema?.status?.validation?.enum).toEqual(CANONICAL);
  });
});
