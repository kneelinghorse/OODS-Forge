import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle as tokens } from '../../src/tools/tokens.build.js';
import { handle as apply } from '../../src/tools/brand.apply.js';
import { handle as intake } from '../../src/tools/brand.intake.js';
import { handle as preview } from '../../src/tools/design.preview.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as pipeline } from '../../src/tools/pipeline.js';
import { createTargetCapabilityPreflight } from '../../src/codegen/target-readiness.js';
import { getDefinition } from '../../src/errors/registry.js';
import { wire, repositoryRoot } from '../helpers/wire-boundary.js';

const read = (relative: string) => fs.readFileSync(path.join(repositoryRoot, relative), 'utf8');
const descriptions = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json')) as Record<string, string>;
const specifications = read('docs/mcp/Tool-Specs.md');
const temporary: string[] = [];
function emptyRuntime(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s196-claim-'));
  temporary.push(root);
  vi.stubEnv('MCP_BRAND_SOURCE_ROOT', root);
  return root;
}
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
  for (const root of temporary.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('s196 portable claims at the public tool boundary', () => {
  it.each(['tokens.build', 'brand.apply', 'code.generate', 'pipeline', 'design.preview'])('generates the exact %s description and removes its superseded portable claim', (tool) => {
    const generated = read(`docs/api/${tool.replaceAll('.', '-')}.md`);
    expect(generated).toContain(descriptions[tool]);
    expect(read('docs/api/README.md')).toContain(descriptions[tool]);
    const section = specifications.split(`### \`${tool}\``)[1]?.split('\n### ')[0];
    expect(section).toBeDefined();
    const expected = {
      'tokens.build': ['five artifacts', 'OODS-N011', 'buildAttempted:false'],
      'brand.apply': ['canonical brand source', 'OODS-N020', 'adapter wire'],
      'code.generate': ['readiness attestation', 'shipped package bytes', 'OODS-N015'],
      pipeline: ['readiness attestation', 'shipped package bytes', 'OODS-N015'],
      'design.preview': ['OODS-N019', 'retryable', 'data'],
    }[tool]!;
    for (const phrase of expected) {
      expect(descriptions[tool]).toContain(phrase);
      expect(section).toContain(phrase);
    }
    expect(descriptions[tool]).not.toMatch(/omitted legacy|drops native error codes|until that packaging contract is reconciled/);
  });

  it('reports missing portable token outputs without claiming a host build failure', async () => {
    const root = emptyRuntime();
    await expect(tokens(wire('tokens.build', 'input', { apply: true }))).rejects.toMatchObject({
      opiCode: 'OODS-N011', details: { dependency: 'token-dist-outputs', buildAttempted: false },
    });
    expect(fs.readdirSync(root)).toEqual([]);
    expect(descriptions['tokens.build']).toContain('without rebuilding');
  });

  it('distinguishes missing canonical brand source from inline intake that needs no source', async () => {
    const root = emptyRuntime();
    await expect(apply(wire('brand.apply', 'input', { brand: 'B', apply: false, delta: {} }))).rejects.toMatchObject({
      opiCode: 'OODS-N020', details: { dependency: 'canonical-brand-source' },
    });
    expect(getDefinition('OODS-N020')?.retryable).toBe(false);
    const recipe = JSON.parse(read('packages/mcp-server/test/fixtures/portable-runtime/s194-brand-intake.json'));
    const accepted = wire('brand.intake', 'output', await intake(wire('brand.intake', 'input', recipe.arguments)));
    expect(accepted).toMatchObject({ validated: true, preview_only: true, applied: false, brand_created: false });
    expect(accepted.delta).toHaveProperty('dark');
    expect(fs.readdirSync(root)).toEqual([]);
    expect(descriptions['brand.intake']).toContain('in memory');
  });

  it('keeps the unavailable preview code retryable before any receipt work', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('dependency absent')));
    await expect(preview(wire('design.preview', 'input', { object: 'Subscription', context: 'card' }))).rejects.toMatchObject({ opiCode: 'OODS-N019' });
    expect(getDefinition('OODS-N019')?.retryable).toBe(true);
    expect(descriptions['design.preview']).toContain('retryable flag and data');
  });

  it.each(['react', 'vue'] as const)('retains real host %s generation while refusing a source-pruned root without attestation', async (framework) => {
    const schema = { version: '2026.09', screens: [{ id: 'portable-text', component: 'Text', props: { content: 'Portable claim proof' } }] };
    const input = wire('code.generate', 'input', { framework, profile: 'build' as const, schema });
    const host = wire('code.generate', 'output', await generate(input));
    expect(host.status).toBe('ok');
    expect(host.artifact?.files.length).toBeGreaterThan(0);
    const preflight = createTargetCapabilityPreflight({ repositoryRoot: emptyRuntime() });
    const refused = wire('code.generate', 'output', await generate(input, { targetCapabilityPreflight: preflight }));
    expect(refused.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'OODS-N015' })]));
    expect(refused.artifact).toBeUndefined();
    expect(descriptions['code.generate']).toContain('Missing or tampered readiness evidence');
  });

  it('keeps a real pipeline artifact behind the same code-generation gate', async () => {
    const result = wire('pipeline', 'output', await pipeline(wire('pipeline', 'input', { object: 'Subscription', context: 'card', framework: 'react' })));
    expect(result.code?.artifact?.files.length).toBeGreaterThan(0);
    expect(descriptions.pipeline).toContain('readiness attestation bound to shipped package bytes');
  });
});
