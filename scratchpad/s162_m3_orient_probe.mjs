import { resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const B=(f,t,x={})=>({field:f,trait:t,...x});
function spec(mark,x,y,values,color){const enc={x,y,...(color?{color}:{})};return {$schema:'https://oods.dev/viz-spec/v1',id:'p',name:'p',data:{name:'d',values},marks:[{trait:mark,encodings:{...enc}}],encoding:enc,a11y:{description:'p'}};}
const show=(n,s)=>console.log(n.padEnd(34), '->', resolvePrimaryChannels(s).measureChannel);
show('vertical-line (quant/quant)', spec('MarkLine',B('t','EncodingX',{type:'quantitative'}),B('v','EncodingY',{type:'quantitative'}),[{t:1,v:10},{t:2,v:20}]));
show('vertical-area (nominal/quant)', spec('MarkArea',B('m','EncodingX',{type:'nominal'}),B('v','EncodingY',{type:'quantitative'}),[{m:'a',v:10},{m:'b',v:20}]));
show('heatmap color-is-measure', spec('MarkRect',B('col','EncodingX',{type:'nominal'}),B('row','EncodingY',{type:'nominal'}),[{col:'a',row:'x',val:10},{col:'b',row:'y',val:20}],B('val','EncodingColor',{type:'quantitative'})));
