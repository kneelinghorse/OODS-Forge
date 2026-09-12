// Bounded mission receipt; public handlers supply every rendered artifact.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { sha256 } = await import(new URL('../../packages/artifacts/dist/index.js', import.meta.url).href) as typeof import('../../packages/artifacts/src/index.js');
import { resolveTokenToColor } from '@oods/viz-core';
import { toHex } from '../../packages/viz-core/src/tokens/categorical-palette.js';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as dashboard } from '../../packages/mcp-server/src/tools/dashboard.render.js';
import { SALES, CASES } from '../../packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '../../packages/mcp-server/test/tools/s172-echarts-operands.js';
import type { VizRenderInput, DashboardRenderInput } from '../../packages/mcp-server/src/schemas/generated.js';

const root = resolve(process.env.OODS_VIZ_CENSUS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const out = pathToFileURL(resolve(root, 'artifacts/product-reality/sprint-195/m05/golden-migration/matrix') + '/');
const inputs = [
  ...CASES.map(({ chartType, encodings }) => ({ chartType, rows: [...SALES], encodings })),
  ...ECHARTS_OPERAND_CASES.map(renderInputFor),
] as VizRenderInput[];
const canvasFill = (svg: string) => /^<svg\b[^>]*>\s*<rect\b[^>]*\bfill="([^"]+)"/.exec(svg)?.[1];
const table = [];
await fs.mkdir(new URL('svg/', out), { recursive: true });
for (const input of inputs) {
  const implicit = await render({ ...input, output: { svg: true } });
  for (const brand of ['A', 'B'] as const) {
    let light: string | undefined;
    for (const theme of ['light', 'dark'] as const) {
      const request = { ...input, brand, theme, output: { svg: true, includeNormalizedSpec: true } };
      const first = await render(request); const second = await render(request);
      assert.equal(first.status, 'ok', JSON.stringify(first.errors)); assert.equal(first.svg, second.svg);
      assert.equal(first.svgHash, sha256(first.svg!)); assert.equal(first.svgBytes, Buffer.byteLength(first.svg!));
      const expectedCanvas = toHex(resolveTokenToColor('--sys-surface-canvas', { brand, theme })!);
      assert.equal(canvasFill(first.svg!), expectedCanvas);
      if (theme === 'light') light = first.svg; else assert.notEqual(first.svg, light);
      if (brand === 'A' && theme === 'light') assert.equal(first.svg, implicit.svg);
      const file = `svg/${input.chartType}-${brand}-${theme}.svg`;
      await fs.writeFile(new URL(file, out), first.svg!);
      table.push({ chartType: input.chartType, brand, theme, file, svgHash: first.svgHash, secondHash: second.svgHash, svgBytes: first.svgBytes, render: first.render, canvas: canvasFill(first.svg!), expectedCanvas, ...(brand === 'A' && theme === 'light' ? { omittedScopeHash: implicit.svgHash } : {}) });
    }
  }
}
const request = {
  schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [...SALES] }],
  panels: inputs.filter(input => !['chord', 'flow_map'].includes(input.chartType!)).map(({ rows, output, ...input }) => ({ ...input, id: input.chartType, kind: 'chart', ...(rows ? { datasetId: 'sales' } : {}) })),
  a11y: { description: 'All eleven admitted dashboard chart types.' }, output: { html: true },
} as unknown as DashboardRenderInput;
const dashboards = [];
for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark'] as const) {
  const first = await dashboard({ ...request, brand, theme }); const second = await dashboard({ ...request, brand, theme });
  assert.equal(first.status, 'ok'); assert.equal(first.html, second.html);
  const svgs = first.html!.match(/<svg\b[\s\S]*?<\/svg>/g)!;
  assert.equal(svgs.length, 11);
  const expectedCanvas = toHex(resolveTokenToColor('--sys-surface-canvas', { brand, theme })!);
  for (const svg of svgs) assert.equal(canvasFill(svg), expectedCanvas);
  assert(first.html!.includes(`data-theme="${theme}" data-brand="${brand}"`));
  assert(!first.html!.includes('class="oods-panel oods-placeholder'));
  assert.equal(first.outputHtmlHash, sha256(first.html!));
  const file = `dashboard-${brand}-${theme}.html`; await fs.writeFile(new URL(file, out), first.html!);
  dashboards.push({ brand, theme, file, svgCount: 11, canvasChecks: 11, expectedCanvas, outputHtmlHash: first.outputHtmlHash, secondHash: second.outputHtmlHash });
}
const head = '9c75a1dbb495ca26c16f2f75ce52095e72adb16e';
await fs.writeFile(new URL('matrix.json', out), JSON.stringify({ head, sourceState: 's195-m05 palette migration over recorded base; current bytes are pinned by the migration receipt', builderSelfCertified: false, highContrast: 'This legacy operand matrix retains light/dark identity; the separate public census measures all 78 light/dark/hc cells.', table, dashboards }, null, 2) + '\n');
console.log(JSON.stringify({ publicSvg: table.length, canvasChecks: table.length, omittedScopeIdentities: 13, dashboardScopes: dashboards.length, dashboardDrawnPerScope: 11 }));
