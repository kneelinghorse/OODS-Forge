import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

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
  console.log('rpc:', JSON.stringify(rp), '| corr=', corr);
  console.log('summary:', generateNarrativeSummary(spec).summary.slice(0,150));
  for (const [name, xs, ys] of subseries) {
    console.log(`  ${name}: pearson=`, pearson(xs, ys)?.toFixed(3));
  }
}

// Simpson: cat (dim on y) 1..6, val (measure on x). Each color falls, pooled rises.
const rows = [
  {cat:1, val:10, seg:'A'}, {cat:2, val:8, seg:'A'}, {cat:3, val:6, seg:'A'},
  {cat:4, val:20, seg:'B'}, {cat:5, val:18, seg:'B'}, {cat:6, val:16, seg:'B'},
];
const subA = ['A', [1,2,3], [10,8,6]];
const subB = ['B', [4,5,6], [20,18,16]];
// For default-orientation interpretation (dim=x=val, measure=y=cat) the sub-series are:
const subA_v = ['A(dim=val)', [10,8,6], [1,2,3]];
const subB_v = ['B(dim=val)', [20,18,16], [4,5,6]];
const pool_h = ['POOLED(dim=cat)', rows.map(r=>r.cat), rows.map(r=>r.val)];
const pool_v = ['POOLED(dim=val)', rows.map(r=>r.val), rows.map(r=>r.cat)];

// (d) horizontal LINE: mark=line, quant x=val, nominal y=cat, color=seg
// resolvePrimaryChannels has NO line-horizontal arm -> falls to default measure=y, dim=x
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    color:{field:'seg',trait:'EncodingColor'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'d', name:'d', data:{name:'d',values:rows}, marks:[{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(d) horiz LINE quant-x nominal-y color=seg (no horiz-line arm)', spec, [pool_h, pool_v, subA, subB, subA_v, subB_v]);
}

// (e) horizontal AREA line-like: mark=area, quant x, nominal y, no agg -> rawHorizontalBar fires
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    color:{field:'seg',trait:'EncodingColor'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'e', name:'e', data:{name:'d',values:rows}, marks:[{trait:'MarkArea',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(e) horiz AREA quant-x nominal-y color=seg', spec, [pool_h, subA, subB]);
}

// (f) horizontal strip point, y nominal-numeric, NO color/size grouping at all -> partition=[] grouping=[]
// pooled positive but the SINGLE drawn series IS just the pooled (no sub-series). Not a phantom, sanity.
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'f', name:'f', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(f) horiz strip NO grouping (sanity narrate)', spec, [pool_h]);
}

// (g) horizontal strip, DETAIL grouping (categorical, always partition) Simpson
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    detail:{field:'seg',trait:'EncodingDetail'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'g', name:'g', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(g) horiz strip DETAIL=seg Simpson', spec, [pool_h, subA, subB]);
}

// (h) horizontal strip, SHAPE grouping on POINT (mark splits) Simpson
{
  const enc = {
    x:{field:'val',trait:'EncodingX',type:'quantitative'},
    y:{field:'cat',trait:'EncodingY'},
    shape:{field:'seg',trait:'EncodingShape'},
  };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'h', name:'h', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'val over cat'} };
  report('(h) horiz strip SHAPE=seg on point Simpson', spec, [pool_h, subA, subB]);
}
