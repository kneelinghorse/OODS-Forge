import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// Shape Simpson: two shape groups, each FALLING, pooled RISING.
const rows = [
  // shape A (low x, low y band), falling within
  { x: 1, y: 10, sh: 'A' },
  { x: 2, y: 9,  sh: 'A' },
  { x: 3, y: 8,  sh: 'A' },
  // shape B (high x, high y band), falling within
  { x: 4, y: 20, sh: 'B' },
  { x: 5, y: 19, sh: 'B' },
  { x: 6, y: 18, sh: 'B' },
];

function pearson(pts){
  const n=pts.length; const mx=pts.reduce((a,p)=>a+p.x,0)/n; const my=pts.reduce((a,p)=>a+p.y,0)/n;
  let sxy=0,sxx=0,syy=0; for(const p of pts){sxy+=(p.x-mx)*(p.y-my);sxx+=(p.x-mx)**2;syy+=(p.y-my)**2;}
  return sxy/Math.sqrt(sxx*syy);
}
console.log('drawn shape A pearson=', pearson(rows.filter(r=>r.sh==='A')).toFixed(3));
console.log('drawn shape B pearson=', pearson(rows.filter(r=>r.sh==='B')).toFixed(3));
console.log('pooled pearson=', pearson(rows).toFixed(3));

const enc = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative'},
  shape:{field:'sh',trait:'EncodingShape'},  // categorical (no type)
};

// A) pure point mark — control (shape SHOULD partition -> suppress)
const specPoint = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
console.log('\n[A pure point]');
console.log(' mark=', resolvePrimaryChannels(specPoint));
console.log(' corr=', analyzeVizSpec(specPoint).correlation, '|', generateNarrativeSummary(specPoint).summary);

// B) mixed mark: point + line -> resolveMark='mixed' -> markSplitsByRetina('mixed')=false -> shape DROPPED
const specMixed = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
console.log('\n[B mixed point+line]');
console.log(' corr=', analyzeVizSpec(specMixed).correlation, '|', generateNarrativeSummary(specMixed).summary);
