import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { SALES, CASES } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/test/tools/s172-echarts-operands.js';
const matrix = JSON.parse(fs.readFileSync('/Users/systemsystems/.codex/worktrees/s190/OODS-Forge/artifacts/product-reality/sprint-190/m06/final/matrix/matrix.json','utf8'));
const inputs: any[] = [ ...CASES.map(({ chartType, encodings }: any) => ({ chartType, rows: [...SALES], encodings })), ...ECHARTS_OPERAND_CASES.map(renderInputFor) ];
async function run(tool: string, input: any) {
  const r = await fetch('http://127.0.0.1:4466/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, input, role: 'designer' }) });
  return { status: r.status, body: await r.json() };
}
let ok = 0, bad: string[] = [];
for (const input of inputs) for (const theme of ['light','dark'] as const) {
  const { status, body } = await run('viz_render', { ...input, brand: 'A', theme, output: { svg: true } });
  const res = body.result ?? body.output ?? body;
  const svg: string | undefined = res.svg; const h = svg ? createHash('sha256').update(svg).digest('hex') : undefined;
  const rec = matrix.table.find((r: any) => r.chartType === input.chartType && r.brand === 'A' && r.theme === theme);
  const match = res.svgHash === rec?.svgHash && res.render?.theme === theme;
  if (match) ok++; else bad.push(`${input.chartType}/${theme} http=${status} svgHash=${res.svgHash?.slice(0,12)} rec=${rec?.svgHash?.slice(0,12)} echoTheme=${res.render?.theme} err=${JSON.stringify(body).slice(0,160)}`);
}
console.log(`viz_render brand A light+dark: ${ok}/${inputs.length*2} svgHash identical to the frozen matrix`); for (const b of bad) console.log('  MISMATCH', b);
const request: any = { schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [...SALES] }],
  panels: inputs.filter(i => !['chord','flow_map'].includes(i.chartType)).map(({ rows, output, ...i }: any) => ({ ...i, id: i.chartType, kind: 'chart', ...(rows ? { datasetId: 'sales' } : {}) })),
  a11y: { description: 'All eleven admitted dashboard chart types.' }, output: { html: true } };
for (const theme of ['light','dark'] as const) {
  const { status, body } = await run('dashboard_render', { ...request, brand: 'A', theme });
  const res = body.result ?? body.output ?? body;
  const html: string = res.html ?? res.outputHtml ?? '';
  const svgCount = (html.match(/<svg\b/g) ?? []).length; const placeholders = (html.match(/placeholder/g) ?? []).length;
  const rec = matrix.dashboards.find((d: any) => d.brand === 'A' && d.theme === theme);
  console.log(`dashboard_render A/${theme}: http=${status} svgs=${svgCount} placeholders=${placeholders} data-theme=${/data-theme="([^"]+)"/.exec(html)?.[1]} outputHtmlHash match=${res.outputHtmlHash === rec?.outputHtmlHash}`);
}
