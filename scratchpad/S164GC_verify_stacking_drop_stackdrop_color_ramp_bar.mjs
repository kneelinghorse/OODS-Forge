import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// Reproduce candidate: stacked-sum bar with QUANTITATIVE color ramp
// c=100 band: (1,50)(2,40)(3,30) FALLS pearson=-1
// c=200 band: (1,10)(2,60)(3,110) RISES pearson=+1
// per-x stack totals: (1,60)(2,100)(3,140) RISE
const rows = [
  {x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},
  {x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200},
];

const enc = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
  color:{field:'c',trait:'EncodingColor',type:'quantitative'},
};
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };

const res = analyzeVizSpec(spec);
console.log('=== QUANTITATIVE color ramp (candidate) ===');
console.log('corr=', res.correlation);
console.log('summary=', generateNarrativeSummary(spec).summary);
console.log('resolvePrimaryChannels=', JSON.stringify(resolvePrimaryChannels(spec), null, 2));

// Hand pearson
function pearson(pts){
  const n=pts.length; const mx=pts.reduce((a,p)=>a+p[0],0)/n; const my=pts.reduce((a,p)=>a+p[1],0)/n;
  let sxy=0,sxx=0,syy=0; for(const p of pts){sxy+=(p[0]-mx)*(p[1]-my);sxx+=(p[0]-mx)**2;syy+=(p[1]-my)**2;}
  return sxy/Math.sqrt(sxx*syy);
}
console.log('c=100 band pearson=', pearson([[1,50],[2,40],[3,30]]));
console.log('c=200 band pearson=', pearson([[1,10],[2,60],[3,110]]));
console.log('stack totals pearson=', pearson([[1,60],[2,100],[3,140]]));

// Control: CATEGORICAL color (no type)
const encCat = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
  color:{field:'c',trait:'EncodingColor'},
};
const specCat = {...spec, marks:[{trait:'MarkBar',encodings:encCat}], encoding:encCat};
console.log('\n=== CATEGORICAL color control ===');
console.log('corr=', analyzeVizSpec(specCat).correlation);
