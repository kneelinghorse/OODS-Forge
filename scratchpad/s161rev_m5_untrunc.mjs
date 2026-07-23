import { toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function hm(values, layout){const enc={x:{field:'col',trait:'EncodingX',type:'nominal'},y:{field:'row',trait:'EncodingY',type:'nominal'},color:{field:'v',trait:'EncodingColor',type:'quantitative'}};return{$schema:'https://oods.dev/viz-spec/v1',id:'hm',name:'hm',data:{name:'d',values},marks:[{trait:'MarkRect',encodings:{...enc}}],encoding:enc,...(layout?{layout}:{}),a11y:{description:'h'}};}
const vals=[{region:'A',col:'c1',row:'r1',v:10},{region:'B',col:'c1',row:'r1',v:30},{region:'C',col:'c1',row:'r1',v:94}];
const vm=(s)=>{const o=toEChartsOption(s);const v=o.visualMap&&(Array.isArray(o.visualMap)?o.visualMap[0]:o.visualMap);return v?`${v.min}/${v.max}`:'NONE';};
console.log('untruncated facet (no limit), all 3 panels:', vm(hm(vals,{trait:'LayoutFacet',columns:{field:'region'}})));
console.log('non-faceted baseline:', vm(hm(vals)));
console.log('limit >= panelCount (limit:5):', vm(hm(vals,{trait:'LayoutFacet',columns:{field:'region'},maxPanels:5})));
