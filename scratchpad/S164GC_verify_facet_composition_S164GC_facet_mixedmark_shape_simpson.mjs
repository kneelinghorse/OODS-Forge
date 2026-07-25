import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}if(sxx===0||syy===0)return null;return sxy/Math.sqrt(sxx*syy);}

const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, shape:{field:'shp',trait:'EncodingShape'} };
const rows = [
  {x:1,y:20,shp:'a'},{x:2,y:16,shp:'a'},{x:3,y:12,shp:'a'},
  {x:3,y:40,shp:'b'},{x:4,y:36,shp:'b'},{x:5,y:32,shp:'b'},
];

function show(label, spec){
  const a=analyzeVizSpec(spec);
  const nar = generateNarrativeSummary(spec);
  console.log(`\n=== ${label} ===`);
  console.log('  resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  corr=', a.correlation);
  console.log('  summary:', nar.summary);
  console.log('  keyFindings:', JSON.stringify(nar.keyFindings));
}

// The candidate: MIXED (point+line) no facet
show('MIXED(point+line) shape Simpson NO facet',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{} });

// Single point control
show('single MarkPoint (expect suppress)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{} });

// Single line control
show('single MarkLine (expect suppress)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{} });

// mixed bar+point (shape does NOT split bars) - sanity
show('MIXED(bar+point)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc},{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{} });

console.log('\nHAND: band a (x1,2,3 / y20,16,12) r=',pearson([1,2,3],[20,16,12]));
console.log('HAND: band b (x3,4,5 / y40,36,32) r=',pearson([3,4,5],[40,36,32]));
// pooled per-x cells under aggregate avg: (1,20)(2,16)(3,(12+40)/2=26)(4,36)(5,32)
console.log('HAND pooled per-x cells (1,20)(2,16)(3,26)(4,36)(5,32) r=', pearson([1,2,3,4,5],[20,16,26,36,32]));
