import { describe, expect, it } from 'vitest';
import { handle } from '../../src/tools/a11y.scan.js';
import { wire } from '../helpers/wire-boundary.js';
import { dryRunBoundary } from '../helpers/dry-run-boundary.js';

const retain = dryRunBoundary();
describe('a11y.scan actual dry-run wire (s194-m04)', () => {
  it('performs its documented read/preview and confines receipts to the temporary artifact root', async () => {
    const input = wire('a11y.scan', 'input', { apply: false });
    const output = wire('a11y.scan', 'output', await handle(input));
    expect(output.artifacts).toEqual([]);
    expect(output.preview?.summary).toMatch(/A11y scan: [1-9]\d* checks/);
    expect(output.preview?.notes?.length).toBeGreaterThan(0);
    retain('a11y.scan', output);
  }, 120_000);
});
