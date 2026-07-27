import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i]-mx)*(ys[i]-my); sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx*syy);
}

function subseries(rows, segField) {
  const groups = {};
  for (const r of rows) { (groups[r[segField]] ??= []).push(r); }
  for (const [k, g] of Object.entries(groups)) {
    const xs = g.map(r => r.x), ys = g.map(r => r.y);
    console.log(`  seg ${segField}=${k}: pts`, g.map(r=>`(${r.x},${r.y})`).join(' '), '=> pearson', pearson(xs, ys));
  }
}

function stackTotals(rows) {
  const t = {};
  for (const r of rows) t[r.x] = (t[r.x] ?? 0) + r.y;
  const xs = Object.keys(t).map(Number), ys = xs.map(x => t[x]);
  console.log('  STACK TOTALS (x,total):', xs.map((x,i)=>`(${x},${ys[i]})`).join(' '), '=> pearson', pearson(xs, ys));
}

function run(label, rows, encExtra, mark='MarkBar', yAgg='sum') {
  const enc = {
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg},
    ...encExtra,
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  console.log(`\n=== ${label} ===`);
  console.log('  measureChannel=', resolvePrimaryChannels(spec).measureChannel);
  stackTotals(rows);
  const a = analyzeVizSpec(spec);
  console.log('  >>> analyzeVizSpec.correlation=', a.correlation);
  console.log('  >>> summary:', generateNarrativeSummary(spec).summary.slice(0,240));
}

// ---- Simpson on QUANTITATIVE detail under a SUM stack ----
// seg=100 FALLS, seg=200 RISES faster, stack total RISES.
const rowsDetailQ = [
  { x:1, seg:100, y:50 }, { x:2, seg:100, y:40 }, { x:3, seg:100, y:30 },
  { x:1, seg:200, y:10 }, { x:2, seg:200, y:60 }, { x:3, seg:200, y:110 },
];
console.log('\n### QUANT DETAIL Simpson, sum stack, MarkBar');
subseries(rowsDetailQ, 'seg');
run('detail quantitative (sum stack, bar)', rowsDetailQ,
  { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} });

// same via SIZE quantitative
console.log('\n### QUANT SIZE Simpson, sum stack, MarkBar');
run('size quantitative (sum stack, bar)', rowsDetailQ.map(r=>({x:r.x,sz:r.seg,y:r.y})),
  { size:{field:'sz',trait:'EncodingSize',type:'quantitative'} });

// same via quantitative COLOR (color ramp) under sum stack
console.log('\n### QUANT COLOR Simpson, sum stack, MarkBar');
run('color quantitative (sum stack, bar)', rowsDetailQ.map(r=>({x:r.x,c:r.seg,y:r.y})),
  { color:{field:'c',trait:'EncodingColor',type:'quantitative'} });

// CONTROL: CATEGORICAL detail (no type) — should SUPPRESS (partition catches it)
console.log('\n### CONTROL categorical detail (no type), sum stack');
run('detail CATEGORICAL (sum stack, bar)', rowsDetailQ,
  { detail:{field:'seg',trait:'EncodingDetail'} });

// CONTROL: area mark + sum
console.log('\n### QUANT DETAIL Simpson, sum stack, MarkArea');
run('detail quantitative (sum stack, area)', rowsDetailQ,
  { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkArea');

// Does stacking fire for count? and non-stacking aggregate avg?
console.log('\n### aggregate=count and aggregate=average variants (quant detail)');
run('detail quant, count stack, bar', rowsDetailQ, { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkBar', 'count');
run('detail quant, AVERAGE (non-stack), bar', rowsDetailQ, { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkBar', 'average');
