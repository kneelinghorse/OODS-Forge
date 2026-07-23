import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec, toEChartsOption, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const B = (field, trait, extra = {}) => ({ field, trait, ...extra });

// size-on-heatmap with SUM: spine splits by size → narrated per-(x,y,size); does Vega draw per-(x,y) or per-(x,y,size)?
const spec = {
  $schema:'x', id:'s1', name:'size heatmap sum',
  data:{ name:'d', values:[
    { day:'Mon', hour:'9', sz:'s', v:10 },
    { day:'Mon', hour:'9', sz:'L', v:40 },   // same (Mon,9) rect
    { day:'Mon', hour:'10', sz:'s', v:5 },
  ]},
  marks:[{ trait:'MarkRect', encodings:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
    size:B('sz','EncodingSize'),
  }}],
  encoding:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
    size:B('sz','EncodingSize'),
  },
  a11y:{ description:'d' },
};
console.log('primaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
const a = analyzeVizSpec(spec);
console.log('narrated max/min/total:', a.max?.value ?? a.max, a.min?.value ?? a.min, a.total);
console.log('keyFindings:', JSON.stringify(generateNarrativeSummary(spec).keyFindings));
try {
  const vl = toVegaLiteSpec(spec);
  console.log('\nVEGA-LITE encoding:', JSON.stringify(vl.encoding ?? vl.spec?.encoding ?? vl.layer, null, 1));
  console.log('VEGA mark:', JSON.stringify(vl.mark));
} catch(e){ console.log('vega ERR', e.message); }
