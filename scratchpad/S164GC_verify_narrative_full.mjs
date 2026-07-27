import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const rows = [
  { x:1, seg:100, y:50 }, { x:2, seg:100, y:40 }, { x:3, seg:100, y:30 },
  { x:1, seg:200, y:10 }, { x:2, seg:200, y:60 }, { x:3, seg:200, y:110 },
];
function build(encExtra, mark='MarkBar', yAgg='sum') {
  const enc = {
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg},
    ...encExtra,
  };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}

for (const [label, extra, mark] of [
  ['QUANT detail bar', { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkBar'],
  ['QUANT color bar', { color:{field:'seg',trait:'EncodingColor',type:'quantitative'} }, 'MarkBar'],
  ['QUANT color POINT (avg)', { color:{field:'seg',trait:'EncodingColor',type:'quantitative'} }, 'MarkPoint'],
]) {
  const spec = build(extra, mark, mark==='MarkPoint'?'average':'sum');
  const nar = generateNarrativeSummary(spec);
  console.log(`\n=== ${label} ===`);
  console.log('correlation=', analyzeVizSpec(spec).correlation);
  console.log('FULL narrative object keys:', Object.keys(nar));
  console.log(JSON.stringify(nar, null, 1));
}
