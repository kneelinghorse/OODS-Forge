import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sxx=0,syy=0;
  for (let i=0;i<n;i++){ sxy+=(xs[i]-mx)*(ys[i]-my); sxx+=(xs[i]-mx)**2; syy+=(ys[i]-my)**2; }
  if (sxx===0||syy===0) return null;
  return sxy/Math.sqrt(sxx*syy);
}
function bands(rows, seg) {
  const g={};
  for (const r of rows) (g[r[seg]] ??= []).push(r);
  for (const [k,arr] of Object.entries(g)) {
    const xs=arr.map(r=>r.x), ys=arr.map(r=>r.y);
    console.log(`   band ${seg}=${k}:`, arr.map(r=>`(${r.x},${r.y})`).join(' '), '=> pearson', pearson(xs,ys));
  }
}
function stackTotals(rows){
  const t={}; for(const r of rows) t[r.x]=(t[r.x]??0)+r.y;
  const xs=Object.keys(t).map(Number), ys=xs.map(x=>t[x]);
  console.log('   STACK TOTALS:', xs.map((x,i)=>`(${x},${ys[i]})`).join(' '), '=> pearson', pearson(xs,ys));
}
function run(label, rows, encExtra, mark, yAgg){
  const enc = {
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg},
    ...encExtra,
  };
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  const a=analyzeVizSpec(spec);
  const s=generateNarrativeSummary(spec).summary;
  console.log(`\n=== ${label} (mark=${mark}, yAgg=${yAgg}) ===`);
  console.log('   measureChannel=', resolvePrimaryChannels(spec).measureChannel);
  console.log('   >>> correlation=', a.correlation);
  console.log('   >>> summary mentions correlation:', /correlation/i.test(s) ? s.match(/[^.]*orrelation[^.]*\./)?.[0]?.trim() : '(no correlation sentence)');
}

// Simpson: seg=100 FALLS (50,40,30 r=-1), seg=200 RISES (10,60,110 r=+1); stack total RISES (60,100,140 r=+1)
const rows = [
  {x:1,seg:100,y:50},{x:2,seg:100,y:40},{x:3,seg:100,y:30},
  {x:1,seg:200,y:10},{x:2,seg:200,y:60},{x:3,seg:200,y:110},
];
console.log('#### Ground truth bands & totals ####');
bands(rows,'seg');
stackTotals(rows);

// The candidate: quantitative DETAIL, stacked AREA, sum
run('QUANT DETAIL, area, sum', rows, { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkArea', 'sum');
// quantitative DETAIL, stacked BAR, sum
run('QUANT DETAIL, bar, sum', rows, { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkBar', 'sum');
// quantitative COLOR (color ramp -> visually separable bands), area, sum
run('QUANT COLOR, area, sum', rows.map(r=>({x:r.x,c:r.seg,y:r.y})), { color:{field:'c',trait:'EncodingColor',type:'quantitative'} }, 'MarkArea', 'sum');
// quantitative SIZE, area, sum
run('QUANT SIZE, area, sum', rows.map(r=>({x:r.x,sz:r.seg,y:r.y})), { size:{field:'sz',trait:'EncodingSize',type:'quantitative'} }, 'MarkArea', 'sum');

// CONTROLS
// categorical DETAIL under stacking -> should suppress
run('CATEGORICAL DETAIL, area, sum (control)', rows, { detail:{field:'seg',trait:'EncodingDetail'} }, 'MarkArea', 'sum');
// categorical COLOR under stacking -> should suppress
run('CATEGORICAL COLOR, area, sum (control)', rows.map(r=>({x:r.x,c:r.seg,y:r.y})), { color:{field:'c',trait:'EncodingColor'} }, 'MarkArea', 'sum');
// quantitative DETAIL, area, AVERAGE (non-stacking) -> s163 fix territory
run('QUANT DETAIL, area, AVERAGE (non-stack)', rows, { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkArea', 'average');
