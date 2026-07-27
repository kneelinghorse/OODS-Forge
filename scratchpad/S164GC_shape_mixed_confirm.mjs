import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n;const my=ys.reduce((a,b)=>a+b,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return num/Math.sqrt(dx*dy);}
const rows = [
  {x:1,y:10,shp:'circle',seg:'circle'},{x:2,y:8,shp:'circle',seg:'circle'},{x:3,y:6,shp:'circle',seg:'circle'},
  {x:4,y:30,shp:'square',seg:'square'},{x:5,y:28,shp:'square',seg:'square'},{x:6,y:26,shp:'square',seg:'square'},
];
function full(marks, chan){ const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},...chan}; return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:marks.map(t=>({trait:t,encodings:enc})), encoding:enc, a11y:{description:'y over x'} }; }

console.log('per-shape drawn: both FALL, pearson -1.0; POOLED', pearson(rows.map(r=>r.x),rows.map(r=>r.y)).toFixed(3),'(rises)');

const mixed = full(['MarkPoint','MarkLine'], {shape:{field:'shp',trait:'EncodingShape'}});
const nar = generateNarrativeSummary(mixed);
console.log('\nMIXED+shape corr=', analyzeVizSpec(mixed).correlation);
console.log('  full narrative object keys:', Object.keys(nar));
console.log('  summary:', nar.summary);
console.log('  keyFindings:', JSON.stringify(nar.keyFindings));
console.log('  correlation-in-narrative text:', JSON.stringify(nar).match(/[Cc]orrelation[^"]*/g));

// Mechanism isolation: same Simpson via COLOR (not mark-gated) on MIXED -> should suppress
const mixedColor = full(['MarkPoint','MarkLine'], {color:{field:'seg',trait:'EncodingColor'}});
console.log('\nMIXED+color (categorical, NOT mark-gated) corr=', analyzeVizSpec(mixedColor).correlation, '(expect undefined — color always partitions)');

// remove shape -> single pooled honest? there IS a real between-band rise but no separable series
const mixedNone = full(['MarkPoint','MarkLine'], {});
console.log('MIXED no-shape corr=', analyzeVizSpec(mixedNone).correlation, '(no separable channel; pooled rises)');

// line+area mixed + shape
const la = full(['MarkLine','MarkArea'], {shape:{field:'shp',trait:'EncodingShape'}});
console.log('\nMIXED(line+area)+shape corr=', analyzeVizSpec(la).correlation, '<<< phantom if positive');
