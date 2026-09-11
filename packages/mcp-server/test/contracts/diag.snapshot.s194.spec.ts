import { describe, expect, it } from 'vitest';
import { handle } from '../../src/tools/diag.snapshot.js';
import { wire } from '../helpers/wire-boundary.js';
import { dryRunBoundary } from '../helpers/dry-run-boundary.js';
import fs from 'node:fs';
import { handle as catalogList } from '../../src/tools/catalog.list.js';

const retain = dryRunBoundary();
describe('diag.snapshot actual dry-run wire (s194-m04)', () => {
  it('performs its documented read/preview and confines receipts to the temporary artifact root', async () => {
    const input = wire('diag.snapshot', 'input', { apply: false });
    const output = wire('diag.snapshot', 'output', await handle(input));
    expect(output.artifacts).toHaveLength(1);
    const diagnostics = JSON.parse(fs.readFileSync(output.diagnosticsPath!, 'utf8'));
    const catalog = await catalogList({});
    expect(diagnostics.inventory.components).toBe(catalog.stats?.componentCount ?? catalog.totalCount);
    expect(diagnostics.packages.length).toBeGreaterThan(0);
    retain('diag.snapshot', output);
  }, 120_000);
});
