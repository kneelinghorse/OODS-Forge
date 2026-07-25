import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs, ys) {
  const n = xs.length; const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sxx=0,syy=0;
  for (let i=0;i<n;i++){ sxy+=(xs[i]-mx)*(ys[i]-my); sxx+=(xs[i]-mx)**2; syy+=(ys[i]-my)**2; }
  if (sxx===0||syy===0) return null; return sxy/Math.sqrt(sxx*syy);
}
function report(label, spec, subseries) {
  const corr = analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===`);
  console.log('rpc:', JSON.stringify(resolvePrimaryChannels(spec)), '| corr=', corr);
  console.log('summary:', generateNarrativeSummary(spec).summary.slice(0,150));
  for (const [name, xs, ys] of subseries) console.log(`  ${name}: pearson=`, pearson(xs, ys)?.toFixed(3), `n=${xs.length}`);
}

// SANITY: horizontal bar, NO grouping, coherent positive -> should NARRATE
{
  const rows = [{cat:1,val:5},{cat:2,val:8},{cat:3,val:11},{cat:4,val:14}];
  const enc = { x:{field:'val',trait:'EncodingX',type:'quantitative'}, y:{field:'cat',trait:'EncodingY'} };
  const spec = { $schema:'x', id:'s1', name:'s1', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'v'} };
  report('SANITY horiz bar NO grouping coherent+', spec, [['POOLED', rows.map(r=>r.cat), rows.map(r=>r.val)]]);
}

// SANITY2: horizontal bar, color grouping, BOTH groups rising, pooled rising -> should NARRATE
{
  const rows = [
    {cat:1,val:5,seg:'A'},{cat:2,val:8,seg:'A'},{cat:3,val:11,seg:'A'},
    {cat:4,val:14,seg:'B'},{cat:5,val:17,seg:'B'},{cat:6,val:20,seg:'B'},
  ];
  const enc = { x:{field:'val',trait:'EncodingX',type:'quantitative'}, y:{field:'cat',trait:'EncodingY'}, color:{field:'seg',trait:'EncodingColor'} };
  const spec = { $schema:'x', id:'s2', name:'s2', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'v'} };
  report('SANITY2 horiz bar color coherent+ (both rise)', spec, [['POOL',rows.map(r=>r.cat),rows.map(r=>r.val)],['A',[1,2,3],[5,8,11]],['B',[4,5,6],[14,17,20]]]);
}

// WEAK-opposition: horizontal bar, size grouping. One band rises strongly, the other opposes WEAKLY (|r|<0.5, scattered).
// This is DISCLOSED gray-zone residual-1. Expect narrate.
{
  const rows = [
    {cat:1,val:2,sz:1},{cat:2,val:5,sz:1},{cat:3,val:9,sz:1},{cat:4,val:12,sz:1}, // band1 rising strong
    {cat:1,val:20,sz:9},{cat:2,val:19,sz:9},{cat:3,val:21,sz:9},{cat:4,val:19,sz:9}, // band2 ~flat/scattered |r|<0.5
  ];
  const enc = { x:{field:'val',trait:'EncodingX',type:'quantitative'}, y:{field:'cat',trait:'EncodingY'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec = { $schema:'x', id:'w', name:'w', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'v'} };
  report('WEAK horiz bar size band2 scattered |r|<0.5', spec, [
    ['POOL',rows.map(r=>r.cat),rows.map(r=>r.val)],
    ['band1',[1,2,3,4],[2,5,9,12]],
    ['band2',[1,2,3,4],[20,19,21,19]],
  ]);
}

// NESTED: horizontal AGG bar, two grouping fields size + shape... use size + detail.
// coarse size band FALLS but its finer (size,detail) slices RISE (nested Simpson). pooled rises.
// Want: does G1 catch the coarse falling band? COLLECT-EVERY should.
{
  const rows = [
    // size=1: overall falling as cat rises, but split by detail each rises
    {cat:1,val:30,sz:1,d:'p'},{cat:2,val:32,sz:1,d:'p'}, // d=p rises
    {cat:3,val:10,sz:1,d:'q'},{cat:4,val:12,sz:1,d:'q'}, // d=q rises, but offset lower -> coarse size=1 falls
    // size=9: rising coherent
    {cat:1,val:40,sz:9,d:'p'},{cat:2,val:44,sz:9,d:'p'},
    {cat:3,val:48,sz:9,d:'p'},{cat:4,val:52,sz:9,d:'p'},
  ];
  const enc = { x:{field:'val',trait:'EncodingX',type:'quantitative',aggregate:'average'}, y:{field:'cat',trait:'EncodingY'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'}, detail:{field:'d',trait:'EncodingDetail'} };
  const spec = { $schema:'x', id:'n', name:'n', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'v'} };
  report('NESTED horiz agg bar size+detail', spec, [
    ['POOL',rows.map(r=>r.cat),rows.map(r=>r.val)],
    ['size1 coarse',[1,2,3,4],[30,32,10,12]],
    ['size1/dp',[1,2],[30,32]],
    ['size1/dq',[3,4],[10,12]],
    ['size9',[1,2,3,4],[40,44,48,52]],
  ]);
}
