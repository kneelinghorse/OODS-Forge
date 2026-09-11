import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { schemaNodes } from '../../../../scripts/product-reality/s185-m04-consumer-contract.js';
import { OBJECTS } from '../../../../scripts/product-reality/s193-runtime-cells.js';

describe('public single-screen list state contract', () => {
  it.each(['Organization', 'User'])('%s detail displays tags without an inert editing field', async object => {
    const composed = await compose({ object, context: 'detail' });
    const nodes = schemaNodes(composed.schema);
    expect(nodes.some(node => node.component === 'TagManager')).toBe(false);
    expect(nodes.find(node => node.component === 'TagSummary')?.props).toMatchObject({ field: 'tags', countField: 'tag_count' });
    const form = await compose({ object, context: 'form' });
    expect(schemaNodes(form.schema).some(node => node.component === 'TagInput')).toBe(true);
  });
  it.each(OBJECTS)('%s declares all four states and emits the public state prop in both frameworks', async object => {
    const composed = await compose({ object, context: 'list' });
    expect(composed.status).toBe('ok');
    const nodes = schemaNodes(composed.schema);
    expect(nodes.flatMap(node => node.state ? [node.state] : [])).toEqual(['loading', 'empty', 'error', 'success']);
    expect(nodes.some(node => node.collection?.source === 'rows')).toBe(true);
    const before = JSON.stringify(composed.schema);
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema: composed.schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      expect(generated.code).toContain('uiState');
      expect(generated.code).toContain('data-oods-state="loading"');
      expect(generated.code).toContain('data-oods-state="error"');
    }
    expect(JSON.stringify(composed.schema)).toBe(before);
  });
});
