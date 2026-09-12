import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { handle as render } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/dist/tools/viz.render.js';
import { handle as dashboard } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/dist/tools/dashboard.render.js';
import { SALES, CASES } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/src/tools/__fixtures__/cartesian-render.ts';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/test/tools/s172-echarts-operands.ts';
async function main() {
const inputs=[...CASES.map(({chartType,encodings})=>({chartType,encodings,rows:[...SALES]})),...ECHARTS_OPERAND_CASES.map(renderInputFor)];
const table=[];
for(const input of inputs){const out=await render({...input,output:{svg:true,includeNormalizedSpec:true}});if(out.status!=='ok')throw new Error(JSON.stringify(out.errors));table.push({chartType:input.chartType,svgHash:out.svgHash});}
const out=await dashboard({schemaVersion:'v0.1',datasets:[{id:'sales',rows:[...SALES]}],panels:inputs.filter(input=>!['chord','flow_map'].includes(input.chartType)).map(({rows,output,...input}:any)=>({...input,id:input.chartType,kind:'chart',...(rows?{datasetId:'sales'}:{})})),a11y:{description:'All eleven admitted dashboard chart types.'},output:{html:true}} as any);
if(out.status!=='ok')throw new Error(JSON.stringify(out.errors));
const target='/Users/systemsystems/.codex/worktrees/s194/OODS-Forge/artifacts/product-reality/sprint-194/m05/';
fs.writeFileSync(target+'delivered-baseline-dashboard.html',out.html!);
fs.writeFileSync(target+'delivered-baseline-render.json',JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),build:JSON.parse(fs.readFileSync('packages/mcp-server/dist/build-revision.json','utf8')),table,dashboard:{outputHtmlHash:out.outputHtmlHash}},null,2)+'\n');
console.log(JSON.stringify({charts:table.length,dashboard:out.outputHtmlHash}));
}main();
