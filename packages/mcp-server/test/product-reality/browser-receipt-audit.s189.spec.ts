import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { auditBrowserReceipt } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { S189_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
const root = path.resolve(import.meta.dirname, '../../../..');
const file = 'artifacts/product-reality/sprint-189/m05/after/archived/vue/receipt.json';
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const bytes = readFileSync(path.join(root, file));
const receipt = JSON.parse(bytes.toString());
const read = (name: string) => readFileSync(path.join(root, name));
describe('independent browser evidence audit rejects forged or incomplete receipts', () => {
  it('accepts the retained exact screenshot, dump and generated-file bytes', () => {
    expect(auditBrowserReceipt({ path: file, sha256: hash(bytes) }, read, receipt.sourceHead)).toBe(true);
  });
  it.each(['errors', 'overflow', 'head'])('rejects a resealed receipt with concealed %s', field => {
    const mutant = structuredClone(receipt);
    if (field === 'errors') mutant.errors = [{ type: 'page', text: 'mount failed' }];
    if (field === 'overflow') mutant.views[0].measurements.documentWidth += 80;
    if (field === 'head') mutant.sourceHead = '0'.repeat(40);
    const edited = JSON.stringify(mutant);
    expect(() => auditBrowserReceipt({ path: file, sha256: hash(edited) }, (name: string) => name === file ? Buffer.from(edited) : read(name), receipt.sourceHead)).toThrow();
  });
  it('rejects changed screenshot bytes even when the receipt itself is untouched', () => {
    expect(() => auditBrowserReceipt({ path: file, sha256: hash(bytes) }, (name: string) => name.endsWith('/390.png') ? Buffer.from('different image') : read(name), receipt.sourceHead)).toThrow();
  });
  it('includes the runnable, public wrapper and registration in public-byte equivalence', () => {
    expect(S189_PUBLIC_RUNTIME_SCOPE).toEqual(expect.arrayContaining(['scripts/design-loop', 'packages/mcp-server/src/tools/design.preview.ts', 'packages/mcp-server/src/index.ts', 'packages/mcp-server/src/tools/registry.ts']));
  });
});
