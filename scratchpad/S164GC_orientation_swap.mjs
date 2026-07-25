import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// pearson helper for hand-check
function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sxx=0,syy=0;
  for (let i=0;i<n;i++){ sxy+=(xs[i]-mx)*(ys[i]-my); sxx+=(xs[i]-mx)**2; syy+=(ys[i]-my)**2; }
  if (sxx===0||syy===0) return null;
  return sxy/Math.sqrt(sxx*syy);
}

function report(label, spec, subseries) {
  const rp = resolvePrimaryChannels(spec);
  const corr = analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===`);
  console.log('resolvePrimaryChannels:', JSON.stringify(rp));
  console.log('corr=', corr);
  console.log('summary:', generateNarrativeSummary(spec).summary.slice(0,160));
  for (const [name, xs, ys] of subseries) {
    console.log(`  drawn sub-series ${name}: pearson(dim,measure)=`, pearson(xs, ys)?.toFixed(3));
  }
}

// Simpson data: dimension='cat' (on Y, numeric-coded band), measure='val' (on X, bar length)
// Two color groups, each FALLING in (cat->val), pooled RISING.
const rows = [
  {cat:1, val:10, seg:'A'}, {cat:2, val:8, seg:'A'}, {cat:3, val:6, seg:'A'},
  {cat:4, val:20, seg:'B'}, {cat:5, val:18, seg:'B'}, {cat:6, val:16, seg:'B'},
];
const A = [[1,10],[2,8],[3,6]];
const B = [[4,20],[5,18],[6,16]];
const subA = ['A', A.map(p=>p[0]), A.map(p=>p[1])];
const subB = ['B', B.map(p=>p[0]), B.map(p=>p[1])];
const pool = ['POOLED', rows.map(r=>r.cat), rows.map(r=>r.val)];

// (a) MarkPoint horizontal strip: quantitative x=val, nominal y=cat, color=seg (categorical partition)
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'}, // nominal (no type) -> dimension
    color:{field:'seg',trait:'EncodingColor'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'a', name:'a', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(a) horiz strip point, color=seg CATEGORICAL partition', spec, [pool, subA, subB]);
}

// (a2) color QUANTITATIVE ramp -> lands in groupingFields, G1 must decompose
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    color:{field:'seg2',trait:'EncodingColor',type:'quantitative'},
  };
  const rows2 = rows.map((r,i)=>({...r, seg2: r.seg==='A'?1:2}));
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'a2', name:'a2', data:{name:'d',values:rows2}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(a2) horiz strip point, color=seg2 QUANTITATIVE grouping', spec, [pool, subA, subB]);
}

// (b) raw horizontal bar: quant x=val, nominal y=cat, color=seg, NO aggregate
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    color:{field:'seg',trait:'EncodingColor'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'b', name:'b', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(b) raw horiz bar, color=seg CATEGORICAL partition', spec, [pool, subA, subB]);
}

// (b2) raw horizontal bar, size QUANTITATIVE grouping Simpson
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
  };
  const rows2 = rows.map(r=>({...r, sz: r.seg==='A'?5:9}));
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'b2', name:'b2', data:{name:'d',values:rows2}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(b2) raw horiz bar, size=sz QUANTITATIVE grouping', spec, [pool, subA, subB]);
}

// (c) horizontal AGGREGATED bar: aggregate:'average' on x=val, nominal y=cat, color=seg
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative',aggregate:'average'},
    y:{field:'cat',trait:'EncodingY'},
    color:{field:'seg',trait:'EncodingColor'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'c', name:'c', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(c) horiz AGG bar avg(x), color=seg CATEGORICAL partition', spec, [pool, subA, subB]);
}

// (c2) horizontal AGGREGATED bar, size QUANTITATIVE grouping Simpson
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative',aggregate:'average'},
    y:{field:'cat',trait:'EncodingY'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
  };
  const rows2 = rows.map(r=>({...r, sz: r.seg==='A'?5:9}));
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'c2', name:'c2', data:{name:'d',values:rows2}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(c2) horiz AGG bar avg(x), size=sz QUANTITATIVE grouping', spec, [pool, subA, subB]);
}
