// Bounded mission receipt: all pixels come from the public tool handlers.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { sha256 } from '@oods/artifacts';
import { handle as render } from '../../../../packages/mcp-server/src/tools/viz.render.js';
import { handle as certify } from '../../../../packages/mcp-server/src/tools/artifact.certify.js';
import { handle as dashboard } from '../../../../packages/mcp-server/src/tools/dashboard.render.js';
import { SALES, CASES } from '../../../../packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '../../../../packages/mcp-server/test/tools/s172-echarts-operands.js';
import type { VizRenderInput, DashboardRenderInput } from '../../../../packages/mcp-server/src/schemas/generated.js';

const out = new URL('./', import.meta.url);
const inputs = [
  ...CASES.map(({ chartType, encodings }) => ({ chartType, rows: [...SALES], encodings })),
  ...ECHARTS_OPERAND_CASES.map(renderInputFor),
] as VizRenderInput[];
const table = [];
await fs.mkdir(new URL('svg/', out), { recursive: true });
for (const input of inputs) {
  const request = { ...input, output: { ...input.output, svg: true, includeNormalizedSpec: true } };
  const first = await render(request); const second = await render(request);
  assert.equal(first.status, 'ok', JSON.stringify(first.errors)); assert.equal(first.svg, second.svg);
  assert.equal(first.svgHash, sha256(first.svg!)); assert.equal(first.svgBytes, Buffer.byteLength(first.svg!));
  let renderHash;
  if (first.render!.engine === 'vega-lite') {
    const grade = await certify({ spec: first.normalizedSpec! }); renderHash = grade.determinism?.renderHash;
    assert.equal(renderHash, first.svgHash);
  }
  const file = `svg/${input.chartType}.svg`; await fs.writeFile(new URL(file, out), first.svg!);
  table.push({ chartType: input.chartType, file, svgHash: first.svgHash, secondHash: second.svgHash, svgBytes: first.svgBytes, render: first.render, ...(renderHash ? { certifyRenderHash: renderHash } : {}) });
}
const request = {
  schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [...SALES] }],
  panels: inputs.filter(input => !['chord', 'flow_map'].includes(input.chartType!)).map(({ rows, output, ...input }) => ({ ...input, id: input.chartType, kind: 'chart', ...(rows ? { datasetId: 'sales' } : {}) })),
  a11y: { description: 'All eleven admitted dashboard chart types.' }, output: { html: true },
} as DashboardRenderInput;
const first = await dashboard(request); const second = await dashboard(request);
assert.equal(first.status, 'ok'); assert.equal(first.html, second.html);
assert.equal(first.html!.match(/<svg\b/g)?.length, 11);
assert(!first.html!.includes('class="oods-panel oods-placeholder'));
assert.equal(first.outputHtmlHash, sha256(first.html!));
await fs.writeFile(new URL('dashboard.html', out), first.html!);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await fs.writeFile(new URL('matrix.json', out), JSON.stringify({ head, sourceState: 'worktree implementation', table, dashboard: { svgCount: 11, outputHtmlHash: first.outputHtmlHash, secondHash: second.outputHtmlHash, file: 'dashboard.html' } }, null, 2) + '\n');
console.log(JSON.stringify({ output: fileURLToPath(out), publicSvg: table.length, cartesianIdentity: table.filter(row => row.certifyRenderHash).length, dashboardDrawn: 11 }));
