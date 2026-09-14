import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { handle as render } from '../../../../packages/mcp-server/src/tools/viz.render.js';
import { handle as certify } from '../../../../packages/mcp-server/src/tools/artifact.certify.js';
import type { VizRenderInput } from '../../../../packages/mcp-server/src/schemas/generated.js';
const inputs = JSON.parse(readFileSync(new URL('../../../../scripts/product-reality/s190-viz-operands.json', import.meta.url),'utf8')) as VizRenderInput[];
const output = new URL('./'+(process.argv[2]??'probe-initial')+'/',import.meta.url);mkdirSync(output,{recursive:true});
const rows=[];
for(const input of inputs){
 const request={...input,theme:'hc' as const,brand:'A' as const,output:{svg:true,includeNormalizedSpec:true}};
 console.log(`BEGIN ${input.chartType}`);
 const result=await render(request);
 const data=Object.fromEntries(['hierarchy','sankey','chord','network','geo'].filter(k=>k in input).map(k=>[k,(input as any)[k]]));
 const grade=result.status==='ok'?await certify({spec:result.normalizedSpec!,theme:'hc',brand:'A',...(Object.keys(data).length?{data}: {})} as any):undefined;
 writeFileSync(new URL(`${input.chartType}.json`,output),JSON.stringify({request,result,grade},null,2)+'\n');
 if(result.svg)writeFileSync(new URL(`${input.chartType}.svg`,output),result.svg);
 const row={chartType:input.chartType,status:result.status,errors:result.errors,conformant:grade?.conformant,pillars:grade?.pillars};rows.push(row);console.log(JSON.stringify(row));
}
writeFileSync(new URL('summary.json',output),JSON.stringify(rows,null,2)+'\n');
