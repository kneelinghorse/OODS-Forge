import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as dashboard } from '../../packages/mcp-server/src/tools/dashboard.render.js';
import { runVizThemeProof } from './component-theme-proof.mjs';
import type { VizRenderInput, DashboardRenderInput } from '../../packages/mcp-server/src/schemas/generated.js';
const output=path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-199/m05/browser');
assert(output.includes('/sprint-199/'), 'Receipts must remain in the current sprint');
await mkdir(output,{recursive:true});
const inputs=JSON.parse(await readFile('scripts/product-reality/s190-viz-operands.json','utf8')) as VizRenderInput[];
const cases:any[]=[];
const write=async(name:string,value:unknown)=>writeFile(path.join(output,name),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
for(const brand of ['A','B'] as const){
 for(const input of inputs){
  const id=`${input.chartType}-${brand}-hc`;
  const request={...input,brand,theme:'hc' as const,output:{svg:true,includeNormalizedSpec:true}};
  const result=await render(request);assert.equal(result.status,'ok',JSON.stringify(result.errors));assert(result.svg);
  const html=`<!doctype html><html data-brand="${brand}" data-theme="hc"><body style="background:Canvas;color:CanvasText"><figure role="img" aria-label="${input.name}">${result.svg}</figure></body></html>`;
  await write(`${id}.json`,{request,result});await write(`${id}.html`,html);await write(`${id}.svg`,result.svg);
  cases.push({id,brand,svgCount:1,expectedSvg:result.svg,accessibleName:input.name,mount:async(page:any)=>page.setContent(html)});
 }
 const supported=inputs.filter(input=>!['chord','flow_map'].includes(input.chartType!));
 const datasets=supported.filter(input=>input.rows).map(input=>({id:input.chartType!,rows:input.rows!}));
 const panels=supported.map(({chartType,rows,output,name,id,...input})=>({ ...input,id:chartType!,chartType,kind:'chart',title:name,...(rows?{datasetId:chartType}:{})}));
 const request={schemaVersion:'v0.1',theme:'hc',brand,datasets,panels,a11y:{description:'Eleven chart families with high-contrast paints.'},output:{html:true}} as DashboardRenderInput;
 const result=await dashboard(request);assert.equal(result.status,'ok',JSON.stringify(result.errors));assert(result.html);
 const id=`dashboard-${brand}-hc`;await write(`${id}.json`,{request,result});await write(`${id}.html`,result.html);
 cases.push({id,brand,svgCount:11,mount:async(page:any)=>page.setContent(result.html)});
}
const report=await runVizThemeProof({cases,output,chromium,mission:'s199-m05'});
assert.equal(report.browser.version,'141.0.7390.37','Use the pinned Playwright 1.56.1 Chromium');
await write('index.html',`<!doctype html><title>S199 HC proofs</title><style>body{font:16px sans-serif}img{max-width:100%;border:1px solid #888}figure{margin:2em}</style><h1>26 charts and two 11-panel dashboards</h1>${cases.map(item=>`<figure><figcaption>${item.id}</figcaption><img src="${item.id}.png"></figure>`).join('')}`);
console.log(JSON.stringify({selected:report.selected,failed:report.failed,skipped:report.skipped,browser:report.browser}));
