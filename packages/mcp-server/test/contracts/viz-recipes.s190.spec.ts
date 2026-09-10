import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VIZ_RECIPES } from '@oods/viz-core';
import { canonical, measureVizCensus } from '../../../../scripts/product-reality/s190-viz-census.js';

const root = new URL('../../../../', import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), 'utf8');

describe('one executable visualization registry (s190 m05)', () => {
  it('measures through public contracts only; no private implementation/registry imports', () => {
    const imports = [...read('scripts/product-reality/s190-viz-census.ts').matchAll(/from ['"]([^'"]+)['"]/g)].map(match => match[1]);
    expect(imports).toEqual([
      'node:assert/strict', 'node:fs', 'node:path', 'node:url', 'ajv/dist/2020.js',
      '../../packages/mcp-server/src/tools/viz.render.js',
      '../../packages/mcp-server/src/tools/dashboard.render.js',
      '../../packages/mcp-server/src/tools/artifact.certify.js',
      '../../packages/mcp-server/src/tools/design.compose.js',
    ]);
    expect(read('scripts/product-reality/s190-viz-census.ts')).not.toMatch(/import\s*\(|require\s*\(/);
  });

  it('the exported registry equals every live census cell after canonicalization', async () => {
    const source = JSON.parse(read('packages/viz-core/src/registry/viz-recipes.v1.json'));
    const result = await measureVizCensus();
    expect(canonical(source)).toBe(canonical(result.registry));
    expect(canonical(VIZ_RECIPES)).toBe(canonical(source));
    expect(result.placements).toEqual([{ object: 'Subscription', context: 'detail', chartType: 'area' }]);
    expect(source).toHaveLength(13);
    expect(source.filter((row: any) => row.certifyCoverage === 'certified')).toHaveLength(5);
    expect(source.filter((row: any) => row.dashboardDrawn === true)).toHaveLength(11);
    for (const row of result.observations) for (const scope of row.scopes) {
      if (scope.coverage === 'uncertified') expect(scope.conformant).toBeNull();
      expect(scope.contrast).toMatchObject({ theme: scope.theme, brand: scope.brand });
    }
    for (const row of result.registry) {
      const exempt = ['heatmap', 'choropleth', 'bubble_map', 'flow_map'].includes(row.chartType);
      expect(row.contrastPassed).toEqual(exempt ? [] : ['light', 'dark']);
      if (exempt) expect(row.notes.join(' ')).toContain('exempt');
    }
    const contrastMutant = structuredClone(source); contrastMutant[0].contrastPassed = [];
    expect(canonical(contrastMutant)).not.toBe(canonical(result.registry));
    // A stale advertised cell must be rejected even when all other cells are right.
    const mutant = structuredClone(source); mutant[0].publicSvg = false;
    expect(canonical(mutant)).not.toBe(canonical(result.registry));
  }, 60_000);
});
