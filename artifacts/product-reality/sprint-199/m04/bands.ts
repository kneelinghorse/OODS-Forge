import { mkdirSync, writeFileSync } from 'node:fs';
import { toEChartsOption } from '../../../../packages/viz-core/src/adapters/echarts-adapter.js';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../../packages/viz-render/package.json', import.meta.url));
const echarts = require('echarts');
assert.equal(require('echarts/package.json').version, '6.0.0');
function renderBand(option: unknown): string {
  const chart = echarts.init(null, undefined, { renderer: 'svg', ssr: true, width: 900, height: 500 });
  try { chart.setOption({ ...(option as object), animation: false }); return chart.renderToSVGString(); } finally { chart.dispose(); }
}
import type { NormalizedVizSpec } from '../../../../packages/viz-core/src/spec/normalized-viz-spec.js';
import assert from 'node:assert/strict';
const directory = new URL('./bands/', import.meta.url);
mkdirSync(directory, { recursive: true });
for (const trait of ['MarkArea', 'MarkBar']) for (const axis of ['x', 'y'] as const) {
  const other = axis === 'x' ? 'y' : 'x';
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: `s199-${trait}-${axis}`, name: `${trait} ${axis}2 · negative bounds`,
    data: { values: [
      { category: 'A', panel: 'Crossing zero', lower: -5, upper: 3 },
      { category: 'B', panel: 'Crossing zero', lower: -3, upper: 5 },
      { category: 'A', panel: 'Below zero', lower: -8, upper: -2 },
      { category: 'B', panel: 'Below zero', lower: -6, upper: -1 },
    ] }, encoding: {
      [other]: { field: 'category', trait: 'EncodingX', type: 'nominal' },
      [axis]: { field: 'lower', trait: 'EncodingY', type: 'quantitative' },
      [`${axis}2`]: { field: 'upper', trait: 'EncodingY', type: 'quantitative' },
    }, marks: [{ trait }], layout: { trait: 'LayoutFacet', columns: { field: 'panel' } },
    a11y: { description: 'Two intervals crossing zero; two intervals wholly below zero.' },
  } as NormalizedVizSpec;
  const option = toEChartsOption(spec);
  const svg = renderBand(option);
  assert(!svg.includes('[object Object]'));
  writeFileSync(new URL(`${trait}-${axis}.svg`, directory), svg);
  writeFileSync(new URL(`${trait}-${axis}.json`, directory), JSON.stringify({ spec, option, note: 'Direct ECharts adapter SVG proof; the public Cartesian ECharts path remains spec-only and uncertified.' }, null, 2) + '\n');
}
console.log('Four direct ECharts 6.0.0 band renders completed; allocator IDs are not normalized.');
