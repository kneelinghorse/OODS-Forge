import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pts){
  const n=pts.length; const mx=pts.reduce((a,p)=>a+p[0],0)/n; const my=pts.reduce((a,p)=>a+p[1],0)/n;
  let cov=0,sxx=0,syy=0;
  for(const [x,y] of pts){ cov+=(x-mx)*(y-my); sxx+=(x-mx)**2; syy+=(y-my)**2; }
  return { r: cov/Math.sqrt(sxx*syy), cov, sxx, syy };
}

// Candidate rows: color=seg collinear with x, size=sz quantitative 2-valued
const rowsAgg = [
  {x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},
  {x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2},
];

// hand computed sub-series
console.log('=== hand-computed drawn sub-series by size ===');
console.log('sz=1', pearson([[1,10],[2,8],[3,6]]));
console.log('sz=2', pearson([[1,20],[2,30],[3,40]]));
console.log('pooled all6', pearson(rowsAgg.map(r=>[r.x,r.y])));

function mk(enc, rows, mark='MarkPoint'){
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}

// E' : y aggregate average, color=seg categorical, size=sz quantitative
const encAgg = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
let spec = mk(encAgg, rowsAgg);
console.log('\n=== E prime (agg y, color=seg, size=sz quant) ===');
console.log('corr=', analyzeVizSpec(spec).correlation, '|', generateNarrativeSummary(spec).summary);

// RAW variant (no aggregate)
const encRaw = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
spec = mk(encRaw, rowsAgg);
console.log('\n=== RAW (no agg) ===');
console.log('corr=', analyzeVizSpec(spec).correlation, '|', generateNarrativeSummary(spec).summary);

// DETAIL instead of color
const encDetail = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, detail:{field:'seg',trait:'EncodingDetail'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
spec = mk(encDetail, rowsAgg);
console.log('\n=== DETAIL=seg, size=sz quant ===');
console.log('corr=', analyzeVizSpec(spec).correlation, '|', generateNarrativeSummary(spec).summary);

// CONTROL: remove the collinear categorical (only size grouping) -> should suppress
const encNoSeg = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
spec = mk(encNoSeg, rowsAgg);
console.log('\n=== CONTROL no seg, size only ===');
console.log('corr=', analyzeVizSpec(spec).correlation, '|', generateNarrativeSummary(spec).summary);

console.log('\n=== resolvePrimaryChannels (E prime) ===');
console.log(JSON.stringify(resolvePrimaryChannels(mk(encAgg,rowsAgg)), null, 2));
