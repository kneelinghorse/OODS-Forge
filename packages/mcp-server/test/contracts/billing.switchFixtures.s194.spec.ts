import { describe, expect, it } from 'vitest';
import { handle } from '../../src/tools/billing.switchFixtures.js';
import { wire } from '../helpers/wire-boundary.js';
import { dryRunBoundary } from '../helpers/dry-run-boundary.js';

const retain = dryRunBoundary();
describe('billing.switchFixtures actual dry-run wire (s194-m04)', () => {
  it('performs its documented read/preview and confines receipts to the temporary artifact root', async () => {
    const input = wire('billing.switchFixtures', 'input', { apply: false, provider: 'chargebee' });
    const output = wire('billing.switchFixtures', 'output', await handle(input));
    expect(output.artifacts).toEqual([]);
    expect(output.preview?.summary).toBe('Switch billing fixtures from Stripe to Chargebee.');
    expect(output.preview?.diffs).toHaveLength(2);
    expect(output.preview?.specimens).toHaveLength(2);
    retain('billing.switchFixtures', output);
  }, 120_000);
});
