import fs from 'node:fs';
import { SALES, CASES } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/src/tools/__fixtures__/cartesian-render.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/test/tools/s172-echarts-operands.js';
const schema = JSON.parse(fs.readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/src/schemas/dashboard.render.input.json','utf8'));
const allowed = new Set(Object.keys(schema.$defs.ChartPanel.properties));
const matrix = JSON.parse(fs.readFileSync('/Users/systemsystems/.codex/worktrees/s190/OODS-Forge/artifacts/product-reality/sprint-190/m06/final/matrix/matrix.json','utf8'));
const inputs: any[] = [ ...CASES.map(({ chartType, encodings }: any) => ({ chartType, rows: [...SALES], encodings })), ...ECHARTS_OPERAND_CASES.map(renderInputFor) ];
const panels = inputs.filter(i => !['chord','flow_map'].includes(i.chartType)).map(({ rows, output, ...i }: any) => {
  const p: any = { ...i, id: i.chartType, kind: 'chart', ...(rows ? { datasetId: 'sales' } : {}) };
  const dropped = Object.keys(p).filter(k => !allowed.has(k)); for (const k of dropped) delete p[k];
  return p; });
const request: any = { schemaVersion: 'v0.1', datasets: [{ id: 'sales', rows: [...SALES] }], panels, a11y: { description: 'All eleven admitted dashboard chart types.' }, output: { html: true } };
for (const theme of ['light','dark'] as const) {
  const r = await fetch('http://127.0.0.1:4466/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: 'dashboard_render', input: { ...request, brand: 'A', theme }, role: 'designer' }) });
  const body: any = await r.json(); const res = body.result ?? body.output ?? body;
  const html: string = res.html ?? res.outputHtml ?? '';
  const rec = matrix.dashboards.find((d: any) => d.brand === 'A' && d.theme === theme);
  console.log(`dashboard_render A/${theme}: http=${r.status} panels=${panels.length} svgs=${(html.match(/<svg\b/g) ?? []).length} placeholderSections=${(html.match(/placeholder/g) ?? []).length} data-theme=${/data-theme="([^"]+)"/.exec(html)?.[1]} outputHtmlHash=${res.outputHtmlHash?.slice(0,12)} frozen=${rec?.outputHtmlHash?.slice(0,12)} match=${res.outputHtmlHash === rec?.outputHtmlHash}${r.status !== 200 ? ' ERR ' + JSON.stringify(body).slice(0,300) : ''}`);
}
