import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deriveToolTruth, handlerImports, serialize } from '../../../../scripts/product-reality/s193-tool-truth.mjs';
import { projectToolSummary } from '../../src/lib/tool-ledger.js';
import { handle as health } from '../../src/tools/health.js';
import { getAjv } from '../../src/lib/ajv.js';
import outputSchema from '../../src/schemas/health.output.json' with { type: 'json' };
const root = path.resolve(import.meta.dirname, '../../../..');
const file = path.join(root, 'packages/mcp-server/registry/tool-capability-ledger.v1.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
afterEach(() => vi.restoreAllMocks());

describe('tool truth derives claims without upgrading source references to runtime proof', () => {
  it('reproduces every byte from current source using the recorded census head', () => {
    const ledger = read();
    expect(serialize(deriveToolTruth({ root, head: ledger.head }))).toBe(fs.readFileSync(file, 'utf8'));
    // s194-m02 adds real wire + source/build/browser coverage for all four brand tools.
    expect(ledger.summary).toEqual({ entries: 27, auto: 21, onDemand: 6, byTier: { 'product-reality': 11, contract: 8, unit: 4, none: 4 }, autoByTier: { 'product-reality': 11, contract: 7, unit: 3, none: 0 }, onDemandByTier: { 'product-reality': 0, contract: 1, unit: 1, none: 4 }, portableE2E: 4 });
    expect(ledger.rows.filter((row: any) => row.portableE2E).map((row: any) => row.name).sort()).toEqual(['artifact.certify', 'dashboard.render', 'health', 'viz.render']);
    for (const row of ledger.rows) {
      expect(row.claimHash).toMatch(/^sha256:[0-9a-f]{64}$/); expect(row.inputSchemaHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      for (const ref of [...row.receiptRefs, ...row.caveats]) expect(fs.existsSync(path.join(root, ref.path ?? ref.file))).toBe(true);
      expect(row.receiptRefs.every((ref: any) => ref.verifiedReceipt === false)).toBe(true);
    }
  });
  it('ignores comments, type-only and schema-only imports but resolves nested and sibling handlers', () => {
    const imports = handlerImports('packages/mcp-server/test/contracts/probe.spec.ts', `
      // import { handle } from '../../src/tools/review.js';
      import type { Handle } from '../../src/tools/review.js';
      import { type Foo } from '../../src/tools/review.js';
      import schema from '../../src/schemas/review.input.json';
      import { handle } from '../../src/tools/schema/save.js';
      const render = await import('../../src/tools/viz.render.js');
    `, root, ['review', 'schema', 'viz.render']);
    expect(imports.map((ref: any) => ref.tool)).toEqual(['schema', 'viz.render']);
    expect(handlerImports('packages/mcp-server/src/tools/__tests__/probe.test.ts', "import { handle } from '../health.js';", root, ['health'])).toMatchObject([{ tool: 'health' }]);
  });
  it.each(['missing-row', 'edited-tier', 'edited-total', 'edited-claim'])('%s cannot be served as a valid census', mutation => {
    const ledger = read();
    if (mutation === 'missing-row') ledger.rows.pop();
    if (mutation === 'edited-tier') ledger.rows.find((row: any) => row.name === 'review').proofTier = 'product-reality';
    if (mutation === 'edited-total') ledger.summary.byTier.none = 0;
    if (mutation === 'edited-claim') ledger.rows[0].advertisedClaim.description += ' New unsupported promise.';
    expect(() => projectToolSummary(ledger)).toThrow(/Tool ledger rejected/);
  });
  it('serves the validated summary through health and its advertised output schema', async () => {
    const result = await health();
    expect(result.productReality.tools).toEqual(projectToolSummary(read()));
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
  });
  it('a missing ledger degrades health with null tool counts instead of inventing zero proof', async () => {
    const original = fs.readFileSync;
    vi.spyOn(fs, 'readFileSync').mockImplementation(((file: any, ...args: any[]) => {
      if (String(file).endsWith('tool-capability-ledger.v1.json')) throw new Error('missing tool ledger');
      return (original as any)(file, ...args);
    }) as any);
    const result = await health();
    expect(result.status).toBe('degraded'); expect(result.productReality.tools).toBeNull();
    expect(result.warnings).toContain('tool proof unavailable: missing tool ledger');
  });
});
