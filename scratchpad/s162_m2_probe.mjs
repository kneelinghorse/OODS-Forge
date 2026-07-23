import { readFileSync } from 'node:fs';
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const B=(f,t,x={})=>({field:f,trait:t,...x});
function spec(mark,x,y,values,extra={}){const encoding={x,y};return {$schema:'https://oods.dev/viz-spec/v1',id:'p',name:'p',data:{name:'d',values},marks:[{trait:mark,encodings:{...encoding}}],encoding,...extra,a11y:{description:'p'}};}
function show(name,s){const a=analyzeVizSpec(s);const ch=resolvePrimaryChannels(s);console.log(`\n=== ${name} ===`);console.log(' measureChannel:',ch.measureChannel,' dimensionChannel:',ch.dimensionChannel);console.log(' max:',JSON.stringify(a.max),'min:',JSON.stringify(a.min),'total:',a.total);}

// G2 raw horizontal bar: x=score linear no-agg, y=year band
show('G2 raw horizontal bar (score/year)', spec('MarkBar',B('score','EncodingX',{scale:'linear',type:'quantitative'}),B('year','EncodingY',{scale:'band'}),[{year:2020,score:120},{year:2021,score:340},{year:2022,score:90}]));
// string-category variant: y nominal string
show('string-category raw horizontal bar', spec('MarkBar',B('score','EncodingX',{scale:'linear',type:'quantitative'}),B('team','EncodingY',{type:'nominal'}),[{team:'Alpha',score:120},{team:'Beta',score:340},{team:'Gamma',score:90}]));
// (a) MISFIRE case: x=stamped-quant DIMENSION (year), y=unstamped aggregated (sum) -> stays measure=y
show('(a) misfire: quant-x dim + unstamped-agg-y (vertical)', spec('MarkBar',B('year','EncodingX',{type:'quantitative'}),B('val','EncodingY',{aggregate:'sum'}),[{year:2020,val:1},{year:2020,val:2},{year:2021,val:5}]));
// (b) raw vertical bar: x=nominal, y=quant, no agg -> measure=y
show('(b) raw vertical bar (nominal-x/quant-y)', spec('MarkBar',B('cat','EncodingX',{type:'nominal'}),B('val','EncodingY',{type:'quantitative'}),[{cat:'a',val:10},{cat:'b',val:20}]));
// (f) both-quant no-agg bar -> measure=y (default)
show('(f) both-quant no-agg bar', spec('MarkBar',B('xx','EncodingX',{type:'quantitative'}),B('yy','EncodingY',{type:'quantitative'}),[{xx:1,yy:10},{xx:2,yy:20}]));
// (h) raw binned-x histogram: x bin+quant, y unstamped freq -> measure=y
show('(h) raw binned-x histogram', spec('MarkBar',B('amt','EncodingX',{type:'quantitative',bin:true}),B('freq','EncodingY',{}),[{amt:1,freq:3},{amt:2,freq:5}]));
// (d) horizontal AGGREGATED bar (x.aggregate) -> measure=x via own arm
show('(d) horizontal aggregated bar', spec('MarkBar',B('hours','EncodingX',{scale:'linear',aggregate:'sum',type:'quantitative'}),B('year','EncodingY',{scale:'band'}),[{year:2021,hours:60},{year:2021,hours:50},{year:2022,hours:40}]));
// (e) horizontal strip MarkPoint quant-x nominal-y -> measure=x
show('(e) horizontal strip (MarkPoint)', spec('MarkPoint',B('val','EncodingX',{type:'quantitative'}),B('cat','EncodingY',{type:'nominal'}),[{cat:'a',val:10},{cat:'b',val:20}]));
// (g) diverging-bar corpus
for (const p of ['examples/viz/patterns/diverging-bar.spec.json','examples/viz/patterns-v2/diverging-bar.spec.json']) {
  const s=JSON.parse(readFileSync(p,'utf8')); const ch=resolvePrimaryChannels(s); const a=analyzeVizSpec(s);
  console.log(`\n=== (g) ${p} ===`);console.log(' measureChannel:',ch.measureChannel,'max:',JSON.stringify(a.max),'min:',JSON.stringify(a.min),'total:',a.total);
}
