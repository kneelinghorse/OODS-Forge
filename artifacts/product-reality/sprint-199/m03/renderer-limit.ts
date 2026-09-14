import { writeFileSync } from 'node:fs';
import { VIZ_PATTERN_SOURCES, toEChartsOption } from '@oods/viz-core';
const rows=VIZ_PATTERN_SOURCES.filter(row=>['LayoutConcat','LayoutFacet'].includes(row.spec.layout?.trait??'')).map(row=>{
 const option=toEChartsOption(row.spec) as any;
 const filters=(option.dataset??[]).flatMap((data:any)=>data.transform??[]).filter((transform:any)=>transform.type==='filter');
 return {id:row.id,preferredRenderer:row.spec.portability?.preferredRenderer,layout:row.spec.layout,filters,missingDimensions:filters.filter((filter:any)=>filter.config?.dimension===undefined).length,decision:'Use Vega-Lite for the public authored layout; the current ECharts panel filter has no dimension and its facet mapper does not preserve wrapping.'};
});
writeFileSync('artifacts/product-reality/sprint-199/m03/renderer-preference-evidence.json',JSON.stringify(rows,null,2)+'\n');
