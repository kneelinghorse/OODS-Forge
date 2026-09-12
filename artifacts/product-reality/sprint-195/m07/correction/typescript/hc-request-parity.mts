import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { CASES, SALES } from '/Users/systemsystems/.codex/worktrees/s195/OODS-Forge/packages/mcp-server/src/tools/__fixtures__/cartesian-render.ts';
const root='/Users/systemsystems/.codex/worktrees/s195/OODS-Forge';
const require=createRequire(path.join(root,'package.json'));
const ts=require('typescript');
const sourcePath='scripts/product-reality/s195-hc-browser.ts';
const source=fs.readFileSync(path.join(root,sourcePath),'utf8');
const chartStatement=source.match(/const request: VizRenderInput = [^\n]+;/)?.[0];
assert(chartStatement);
const panelStart=source.indexOf('const [firstPanel, ...remainingPanels]');
const panelEnd=source.indexOf('const result = await dashboard(request)',panelStart);
assert(panelStart>=0 && panelEnd>panelStart);
const transpile=(snippet:string)=>ts.transpileModule(snippet,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const chartRequest=new Function('chart','brand','SALES',transpile(chartStatement)+'\nreturn request;');
const dashboardRequest=new Function('brand','SALES','CASES','assert',transpile(source.slice(panelStart,panelEnd))+'\nreturn request;');
const sha=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex');
const rows=[];
for(const brand of ['A','B']) {
 for(const chart of CASES.slice(0,2)) {
  const id=`${chart.chartType}-${brand}-hc`;
  const file=`artifacts/product-reality/sprint-195/m05/browser/${id}.json`;
  const bytes=fs.readFileSync(path.join(root,file));
  const previous=JSON.parse(bytes.toString()).request;
  const actual=chartRequest(chart,brand,SALES);
  assert.deepEqual(actual,previous,id);
  rows.push({id,retainedOperand:{path:file,sha256:sha(bytes)},equal:true});
 }
 const id=`dashboard-${brand}-hc`;
 const file=`artifacts/product-reality/sprint-195/m05/browser/${id}.json`;
 const bytes=fs.readFileSync(path.join(root,file));
 const previous=JSON.parse(bytes.toString()).request;
 const actual=dashboardRequest(brand,SALES,CASES,assert);
 assert.deepEqual(actual,previous,id);
 rows.push({id,retainedOperand:{path:file,sha256:sha(bytes)},equal:true});
}
const receipt={status:'passed',source:{path:sourcePath,sha256:sha(source)},method:'Transpile and evaluate only actual modified request-construction statements; compare with retained m05 public request JSON. No generator or handler execution.',rows};
fs.writeFileSync('/tmp/oods-s195-ci/typescript-fix/hc-request-parity.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,identicalOperands:rows.length}));
