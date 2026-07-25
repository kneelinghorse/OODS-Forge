import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ---- my own pearson ----
function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sxx=0,syy=0;
  for (let i=0;i<n;i++){ sxy+=(xs[i]-mx)*(ys[i]-my); sxx+=(xs[i]-mx)**2; syy+=(ys[i]-my)**2; }
  if (sxx===0||syy===0) return null;
  return sxy/Math.sqrt(sxx*syy);
}

const rows = [
  { x:1, seg:100, y:50 }, { x:2, seg:100, y:40 }, { x:3, seg:100, y:30 },
  { x:1, seg:200, y:10 }, { x:2, seg:200, y:60 }, { x:3, seg:200, y:110 },
];

// hand-computed drawn sub-series
console.log('--- HAND-COMPUTED DRAWN SUB-SERIES ---');
const s100 = rows.filter(r=>r.seg===100);
const s200 = rows.filter(r=>r.seg===200);
console.log('seg=100 (1,50)(2,40)(3,30) pearson=', pearson(s100.map(r=>r.x), s100.map(r=>r.y)));
console.log('seg=200 (1,10)(2,60)(3,110) pearson=', pearson(s200.map(r=>r.x), s200.map(r=>r.y)));
const tot = {}; for (const r of rows) tot[r.x]=(tot[r.x]??0)+r.y;
const tx=Object.keys(tot).map(Number), ty=tx.map(x=>tot[x]);
console.log('stack totals', tx.map((x,i)=>`(${x},${ty[i]})`).join(' '), 'pearson=', pearson(tx,ty));

function build(encExtra, mark='MarkBar', yAgg='sum') {
  const enc = {
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg},
    ...encExtra,
  };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}

function report(label, spec) {
  const a = analyzeVizSpec(spec);
  const sum = generateNarrativeSummary(spec).summary;
  console.log(`\n=== ${label} ===`);
  console.log('  measureChannel=', resolvePrimaryChannels(spec).measureChannel);
  console.log('  correlation=', a.correlation);
  console.log('  summary asserts corr?', /[Cc]orrelation/.test(sum), '|', sum.slice(0,300));
}

// The candidate exactly
report('QUANT detail, sum stack, MarkBar', build({ detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }));

// Compare: quant color (known survivor family shape)
report('QUANT color, sum stack, MarkBar', build({ color:{field:'seg',trait:'EncodingColor',type:'quantitative'} }));

// Compare: quant size
report('QUANT size, sum stack, MarkBar', build({ size:{field:'seg',trait:'EncodingSize',type:'quantitative'} }));

// Control: categorical detail (no type)
report('CATEGORICAL detail (no type), sum stack, MarkBar', build({ detail:{field:'seg',trait:'EncodingDetail'} }));

// Inspect what resolvePrimaryChannels sees for detail
console.log('\n--- resolvePrimaryChannels full (quant detail) ---');
console.log(JSON.stringify(resolvePrimaryChannels(build({ detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} })), null, 1));
