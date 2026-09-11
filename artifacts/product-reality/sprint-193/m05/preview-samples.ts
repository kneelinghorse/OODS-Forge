import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { handle as render } from '../../../../packages/mcp-server/src/tools/viz.render.js';
import type { VizRenderInput } from '../../../../packages/mcp-server/src/schemas/generated.js';
const rows = [
  { period: 'Jan', category: 'A', value: 12, other: 7, size: 10 },
  { period: 'Jan', category: 'B', value: 18, other: 13, size: 20 },
  { period: 'Feb', category: 'A', value: 22, other: 12, size: 15 },
  { period: 'Feb', category: 'B', value: 15, other: 20, size: 25 },
].map(row => ({ ...row, periodx: `Quarter ${row.period}`, categoryx: `Group ${row.category}`, valuex: row.value * 2, otherx: row.other * 3, sizex: row.size * 2 }));
const chartTypes = { VizAreaPreview: 'area', VizHeatmapPreview: 'heatmap', VizLinePreview: 'line', VizMarkPreview: 'bar', VizPointPreview: 'scatter', VizScatterPreview: 'scatter' } as const;
const samples: Record<string, unknown> = {};
for (const [id, chartType] of Object.entries(chartTypes)) {
  const input: VizRenderInput = { chartType, rows, name: `${id.replace(/^Viz/, '').replace(/Preview$/, '')} chart sample`, description: 'Four authored sample observations.', brand: 'A', theme: 'light', encodings: { x: { field: chartType === 'scatter' ? 'value' : 'period', type: chartType === 'scatter' ? 'quantitative' : 'nominal' }, y: { field: chartType === 'scatter' ? 'other' : chartType === 'heatmap' ? 'category' : 'value', type: chartType === 'heatmap' ? 'nominal' : 'quantitative' }, ...(chartType === 'heatmap' ? { color: { field: 'value', type: 'quantitative' as const } } : {}) }, output: { svg: true, width: 360, height: 200 } };
  const result = await render(input); const repeated = await render(input);
  assert.equal(result.status, 'ok', JSON.stringify(result.errors)); assert(result.svg); assert.equal(result.svgHash, repeated.svgHash);
  samples[id] = { input, svg: result.svg, svgHash: result.svgHash };
}
const file = path.resolve('packages/component-contracts/fixtures/viz-preview-samples.v1.json');
fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify({ rows, samples }, null, 2) + '\n');
console.log('Six shared-renderer samples (five new previews plus existing area) match repeated SVG hashes.');
