import { describe, expect, it } from 'vitest';
import { handle } from '../../src/tools/billing.reviewKit.js';
import { wire } from '../helpers/wire-boundary.js';
import { dryRunBoundary } from '../helpers/dry-run-boundary.js';

const retain = dryRunBoundary();
describe('billing.reviewKit actual dry-run wire (s194-m04)', () => {
  it('performs its documented read/preview and confines receipts to the temporary artifact root', async () => {
    const input = wire('billing.reviewKit', 'input', { apply: false, object: 'Subscription', fixtures: ['stripe', 'chargebee'] });
    const output = wire('billing.reviewKit', 'output', await handle(input));
    expect(output.artifacts).toEqual([]);
    expect(output.preview?.specimens).toHaveLength(2);
    expect(output.preview?.diffs?.length).toBeGreaterThan(0);
    expect(JSON.stringify(output.preview)).toContain('Stripe');
    expect(JSON.stringify(output.preview)).toContain('Chargebee');
    retain('billing.reviewKit', output);
  }, 120_000);
});
