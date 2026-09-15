// Bounded mission receipt; public handlers supply every rendered artifact.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { evaluateContrastPillar } from '../../packages/mcp-server/src/tools/certify-contrast.js';
import { evaluateEChartsRenderContrast } from '../../packages/mcp-server/src/tools/certify-echarts-render-contrast.js';
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
const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 2 && args[0] === '--mode' && ['s196', 's197-m03', 's197-m05', 's199', 's201'].includes(args[1])), 'Supported option: --mode s196|s197-m03|s197-m05|s199|s201');
const chartsMigration = args[1] === 's199';
const titleMigration = args[1] === 's201';
const darkMission = args[1] === 's197-m03';
const paletteMigration = args[1] === 's197-m05';
const sprint = titleMigration ? 201 : chartsMigration ? 199 : darkMission || paletteMigration ? 197 : args[1] === 's196' ? 196 : 195;
const out = pathToFileURL(resolve(root, `artifacts/product-reality/sprint-${sprint}/${titleMigration ? 'm06/golden-migration' : darkMission ? 'm03' : paletteMigration || chartsMigration ? 'm05' : 'm05/golden-migration'}/matrix`) + '/');
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
      let contrast;
      if (darkMission) {
        if (first.spec) {
          const result = await evaluateContrastPillar(
            first.normalizedSpec as Parameters<typeof evaluateContrastPillar>[0],
            first.spec as Parameters<typeof evaluateContrastPillar>[1], { brand, theme });
          const { renderedSvg, ...grade } = result;
          // Role C precedes Role A in the existing Cartesian grader. A pass or
          // Role-A-only failure therefore establishes no Role-C failure.
          const verdict = grade.contrast === 'exempt' ? 'exempt'
            : grade.contrast === 'pass' || (grade.contrast === 'fail' && /Role-A/.test(grade.contrastNote ?? '')) ? 'pass'
            : grade.contrast === 'fail' && /Role-C/.test(grade.contrastNote ?? '') ? 'fail' : 'ungradeable';
          contrast = { ...grade, evidence: renderedSvg ? 'render' : 'none', roleC: { verdict } };
        } else {
          contrast = evaluateEChartsRenderContrast({ chartType: input.chartType as Parameters<typeof evaluateEChartsRenderContrast>[0]['chartType'],
            normalizedSvg: first.svg!, projectedOption: first.echartsSpec!, scope: { brand, theme } });
        }
      }
      table.push({ ...(contrast ? { contrast } : {}), chartType: input.chartType, brand, theme, file, svgHash: first.svgHash, secondHash: second.svgHash, svgBytes: first.svgBytes, render: first.render, canvas: canvasFill(first.svg!), expectedCanvas, ...(brand === 'A' && theme === 'light' ? { omittedScopeHash: implicit.svgHash } : {}) });
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
const head = darkMission || paletteMigration || chartsMigration || titleMigration ? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() : sprint === 196 ? '944f4dda5f784e266310978b31f65b3d452e6387' : '9c75a1dbb495ca26c16f2f75ce52095e72adb16e';
const sourceState = titleMigration ? 's201-m06 chart title band over recorded HEAD: the sankey flow is inset below its centred 14px/600 title and sparse force graphs spread to the canvas (the two chart titles from #2060); only sankey and force_graph move, attributed in sprint-201/golden-ledger.json and m06/certified-matrix.' : chartsMigration ? 's199-m05 combined m04 bubble-area and m05 paint migration over recorded HEAD; per-pin attribution lives in sprint-199/golden-ledger.json (decision #2052).' : paletteMigration ? 's197-m05 complete palette migration over recorded HEAD; prior identities and token bindings are pinned in golden-attribution.before.json.' : darkMission ? 's197-m03 generated dark palette over recorded HEAD; palette source bytes are pinned in the elevation receipt. Golden registry pins remain untouched until m05.' : sprint === 196 ? 's196-m05 UTC migration over recorded base; current bytes are pinned by the migration receipt' : 's195-m05 palette migration over recorded base; current bytes are pinned by the migration receipt';
await fs.writeFile(new URL('matrix.json', out), JSON.stringify({ head, sourceState, builderSelfCertified: false, highContrast: 'This legacy operand matrix retains light/dark identity; the separate public census measures all 78 light/dark/hc cells.', table, dashboards }, null, 2) + '\n');
console.log(JSON.stringify({ publicSvg: table.length, canvasChecks: table.length, omittedScopeIdentities: 13, dashboardScopes: dashboards.length, dashboardDrawnPerScope: 11 }));

if (darkMission) {
  const failures = table.filter(row => !['pass', 'exempt'].includes(row.contrast!.roleC.verdict));
  assert.equal(failures.length, 0, JSON.stringify(failures.map(row => ({ chartType: row.chartType, brand: row.brand, theme: row.theme, contrast: row.contrast }))));
  console.log(JSON.stringify({ roleCPass: table.filter(row => row.contrast!.roleC.verdict === 'pass').length, roleCExempt: table.filter(row => row.contrast!.roleC.verdict === 'exempt').length, roleCFailures: failures.length }));
}
