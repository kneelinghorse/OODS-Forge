import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { handle } from '../../../../packages/mcp-server/src/tools/viz.render.js';
import { normalizeEChartsSvg, renderEChartsToSvg, renderVegaLiteToSvg } from '@oods/viz-render';
const inputs=JSON.parse(readFileSync('scripts/product-reality/s190-viz-operands.json','utf8'));
const dir='artifacts/product-reality/sprint-199/m05/raw';mkdirSync(dir,{recursive:true});
for(const input of inputs.filter((x:any)=>['heatmap','treemap','chord','choropleth','bubble_map'].includes(x.chartType))){
 const out=await handle({...input,brand:'A',theme:'hc',output:{svg:false,echarts:true}});
 const svg=input.chartType!=='heatmap'?normalizeEChartsSvg(await renderEChartsToSvg(out.echartsSpec)):await renderVegaLiteToSvg(out.spec as any);
 writeFileSync(`${dir}/${input.chartType}.svg`,svg);writeFileSync(`${dir}/${input.chartType}.json`,JSON.stringify(out,null,2));
}
