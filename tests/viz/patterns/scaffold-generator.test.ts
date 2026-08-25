import { describe, expect, it } from 'vitest';
import { generateScaffold } from '@/viz/patterns/scaffold-generator.js';
import { recommendInteractions } from '@oods/viz-core';
import { scoreLayoutForPattern } from '@oods/viz-core';
import { suggestPatterns, type SchemaIntent } from '@oods/viz-core';

describe('scaffold generator', () => {
  it('produces JSON spec + component shell for chart suggestion', () => {
    const schema: SchemaIntent = {
      measures: 1,
      dimensions: 2,
      goal: 'comparison',
      requiresGrouping: true,
    };
    const [suggestion] = suggestPatterns(schema, { limit: 1 });
    expect(suggestion).toBeDefined();
    const layout = scoreLayoutForPattern(suggestion.pattern.id, schema);
    const interactions = recommendInteractions(suggestion.pattern.id, schema);
    const artifacts = generateScaffold({ suggestion, schema, layout, interactions });
    expect(artifacts.spec).toContain('"$schema"');
    expect(artifacts.component).toContain('export function');
  });
});
