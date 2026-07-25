import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(rows, enc, mark='MarkPoint') {
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}
function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n;const my=ys.reduce((a,b)=>a+b,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return num/Math.sqrt(dx*dy);}

// POSITIVE CONTROL 1: honest rising multi-series, pooled rises
{
  const rows=[];
  for(const s of ['A','B']) for(const x of [1,2,3,4]) rows.push({x,y:x*10+(s==='A'?0:5),seg:s});
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('POS1 rising multi-series: corr=',r.correlation,'(expect DEFINED positive)');
}
// POSITIVE CONTROL 2: honest single-series falling
{
  const rows=[1,2,3,4,5].map(x=>({x,y:100-x*10}));
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('POS2 single falling: corr=',r.correlation,'(expect DEFINED negative)');
}
// DISCLOSED: continuous ramp, each band 1 point -> NARRATES
{
  const rows=[1,2,3,4,5,6].map((x,i)=>({x,y:x*7,seg:'g'+i})); // each seg 1 point
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('DISC continuous-ramp (each band 1pt): corr=',r.correlation,'(expect DEFINED)');
}
// DISCLOSED: all-flat-offset -> SUPPRESSES
{
  const rows=[];
  for(const s of ['A','B','C']) for(const x of [1,2,3,4]) rows.push({x,y:(s==='A'?10:s==='B'?20:30),seg:s});
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('DISC all-flat-offset: corr=',r.correlation,'(expect undefined)');
}
// HONEST CHART 3: two rising series, one steeper - both rise
{
  const rows=[];
  for(const s of ['A','B']) for(const x of [1,2,3,4,5]) rows.push({x,y:(s==='A'?x*5:x*12),seg:s});
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('HON3 both rising diff slope: corr=',r.correlation,'(expect DEFINED positive)');
}
// HONEST CHART 4: three falling series all fall
{
  const rows=[];
  for(const s of ['A','B','C']) for(const x of [1,2,3,4]) rows.push({x,y:100-x*(s==='A'?8:s==='B'?12:15),seg:s});
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('HON4 three falling: corr=',r.correlation,'(expect DEFINED negative)');
}
// HONEST CHART 5: single rising raw scatter noisy but clearly up
{
  const xs=[1,2,3,4,5,6,7,8]; const ys=[2,5,4,8,9,11,10,14];
  const rows=xs.map((x,i)=>({x,y:ys[i]}));
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'}};
  const r=analyzeVizSpec(mk(rows,enc));
  console.log('HON5 noisy rising r=',pearson(xs,ys).toFixed(3),': corr=',r.correlation,'(expect DEFINED positive)');
}
