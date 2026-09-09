import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { handle } from '../../src/tools/design.preview.js';
import { loadToolRegistry } from '../../src/tools/registry.js';
import { getDefinition } from '../../src/errors/registry.js';
const json = (relative: string) => JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('design.preview uses the existing loop and fails before allocating output', () => {
  it('validates object/context, supported targets and bounded widths without accepting paths', () => {
    const validate = new Ajv2020({ strict: false }).compile(json('../../src/schemas/design.preview.input.json'));
    expect(validate({ object: 'Subscription', context: 'list', framework: 'react', widths: [390] })).toBe(true);
    for (const invalid of [{}, { object: 'Subscription' }, { object: 'Subscription', context: 'bogus' }, { object: 'Subscription', context: 'list', framework: 'html' }, { object: 'Subscription', context: 'list', widths: [1] }, { object: 'Subscription', context: 'list', output: '/tmp/unsafe' }]) expect(validate(invalid)).toBe(false);
  });
  it.each(['stopped', 'starting', 'bad-response'])('returns a retryable typed gap for %s without partial files', async state => {
    vi.stubGlobal('fetch', state === 'stopped' ? vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) : vi.fn().mockResolvedValue({ ok: state !== 'bad-response', json: async () => ({ running: false }) }));
    const allocate = vi.spyOn(fs, 'mkdtemp');
    await expect(handle({ object: 'Subscription', context: 'list' })).rejects.toMatchObject({ opiCode: 'OODS-N019', message: expect.stringContaining('pnpm design:loop serve') });
    expect(allocate).not.toHaveBeenCalled(); expect(getDefinition('OODS-N019')?.retryable).toBe(true);
  });
  it('advertises the same tool in the registry, both policies, description and generated API page', () => {
    expect(loadToolRegistry().auto).toContain('design.preview');
    expect(json('../../src/security/policy.json').rules.find((row: any) => row.tool === 'design.preview')).toMatchObject({ readOnly: true, concurrency: 1 });
    expect(json('../../../../configs/agent/policy.json').tools.some((row: any) => row.name === 'design.preview')).toBe(true);
    expect(json('../../../mcp-adapter/tool-descriptions.json')['design.preview']).toContain('OODS-N019');
    expect(readFileSync(new URL('../../../../docs/api/design-preview.md', import.meta.url), 'utf8')).toContain('design.preview');
  });
});
