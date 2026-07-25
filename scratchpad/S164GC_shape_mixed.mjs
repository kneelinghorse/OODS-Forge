import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n;const my=ys.reduce((a,b)=>a+b,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return num/Math.sqrt(dx*dy);}

// Simpson on SHAPE: each shape band falls hard, pooled rises (between-band offset)
const rows = [
  {x:1,y:10,shp:'circle'},{x:2,y:8,shp:'circle'},{x:3,y:6,shp:'circle'},
  {x:4,y:30,shp:'square'},{x:5,y:28,shp:'square'},{x:6,y:26,shp:'square'},
];
const enc = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative'},
  shape:{field:'shp',trait:'EncodingShape'}, // CATEGORICAL (no type)
};

function mk(marks){ return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks, encoding:enc, a11y:{description:'y over x'} }; }

console.log('=== hand oracle: per-shape drawn sub-series ===');
for (const s of ['circle','square']) {
  const sub = rows.filter(r=>r.shp===s);
  console.log(`  shape=${s}: pearson=${pearson(sub.map(r=>r.x),sub.map(r=>r.y)).toFixed(3)} (n=${sub.length})`);
}
console.log('  POOLED:', pearson(rows.map(r=>r.x),rows.map(r=>r.y)).toFixed(3));

console.log('\n=== CONTROL: single MarkPoint + categorical shape (shape splits point) ===');
{
  const spec = mk([{trait:'MarkPoint',encodings:enc}]);
  console.log('  resolveMark-ish channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  corr=', analyzeVizSpec(spec).correlation, '(expect undefined/suppressed)');
}

console.log('\n=== SUSPECT: MIXED MarkPoint+MarkLine + categorical shape ===');
{
  const spec = mk([{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}]);
  const r = analyzeVizSpec(spec).correlation;
  console.log('  corr=', r, '|', generateNarrativeSummary(spec).summary);
  console.log('  >>> PHANTOM?', (typeof r==='number' && r>0) ? 'YES — narrates POSITIVE over 2 falling shape series' : 'no');
}

console.log('\n=== SUSPECT2: MIXED MarkPoint+MarkBar + categorical shape ===');
{
  const spec = mk([{trait:'MarkPoint',encodings:enc},{trait:'MarkBar',encodings:enc}]);
  const r = analyzeVizSpec(spec).correlation;
  console.log('  corr=', r, (typeof r==='number' && r>0) ? '<<< PHANTOM' : '');
}
