import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { readSemanticKeySets, semanticKeyChanges } from '../../scripts/tokens/semantic-key-contract.js';

const baseline = async () => JSON.parse(await readFile('tests/tokens/fixtures/semantic-keys.s197.json', 'utf8')) as Record<string, string[]>;

describe('semantic token names frozen for consumer re-pins', () => {
  it('pins every theme, both brands in base/dark/hc, aliases, and viz at the base', async () => {
    const before = await baseline();
    expect(semanticKeyChanges(before, await readSemanticKeySets(process.cwd()))).toEqual([]);
    for (const brand of ['A', 'B']) for (const mode of ['base', 'dark', 'hc']) {
      expect(before[`packages/tokens/src/tokens/brands/${brand}/${mode}.json`].length).toBeGreaterThan(0);
    }
  });
  it.each(['add', 'remove', 'rename'])('rejects a synthetic semantic key %s', async (action) => {
    const before = await baseline(); const after = structuredClone(before);
    const file = 'packages/tokens/src/tokens/brands/A/dark.json';
    if (action !== 'add') after[file].shift();
    if (action !== 'remove') after[file].push('color.brand.A.surface.newCanvas');
    expect(semanticKeyChanges(before, after).length).toBeGreaterThan(0);
  });
  it('permits declared dark/HC overrides of existing viz names but rejects new names or deleted overrides', async () => {
    const before = await baseline(); const after = structuredClone(before);
    const file = 'packages/tokens/src/tokens/brands/A/dark.json';
    after[file].push('viz.scale.sequential.01');
    expect(semanticKeyChanges(before, after)).toEqual([]);
    after[file].push('viz.scale.sequential.10');
    expect(semanticKeyChanges(before, after)).toHaveLength(1);
    after[file] = after[file].filter((key) => key !== 'viz.scale.categorical.06');
    expect(semanticKeyChanges(before, after)).toHaveLength(2);
  });
});
