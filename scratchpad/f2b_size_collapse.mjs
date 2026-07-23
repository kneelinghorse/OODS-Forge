import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys){
  const n=xs.length; if(n<2) return null;
  const mx=xs.reduce((a,b)=>a+b,0)/n, my=ys.reduce((a,b)=>a+b,0)/n;
  let cov=0,vx=0,vy=0;
  for(let i=0;i<n;i++){cov+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}
  if(vx===0||vy===0) return null;
  return cov/Math.sqrt(vx*vy);
}

const rows=[];
let sz=1;
// seg A
rows.push({x:1,y:0,seg:'A',sz:sz++});
rows.push({x:2,y:100,seg:'A',sz:sz++});
for(let i=0;i<100;i++) rows.push({x:3,y:10,seg:'A',sz:sz++});
// seg B
rows.push({x:4,y:200,seg:'B',sz:sz++});
rows.push({x:5,y:300,seg:'B',sz:sz++});
for(let i=0;i<100;i++) rows.push({x:6,y:210,seg:'B',sz:sz++});

const enc={
  x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average',scale:{type:'linear'}},
  color:{field:'seg',trait:'EncodingColor',type:'nominal'},
  size:{field:'sz',trait:'EncodingSize',type:'quantitative',scale:{type:'linear'}},
};
const spec={
  $schema:'https://oods.dev/viz-spec/v1', id:'f2b', name:'Size collapse phantom',
  data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:enc}],
  encoding:enc,
  a11y:{description:'scatter'}
};

console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
const a=analyzeVizSpec(spec);
console.log('analysis.correlation (NARRATED VALUE):', a.correlation);

// honest DRAWN per-seg direction (over sz-keyed drawn cells = individual rows, y already the cell val)
for(const s of ['A','B']){
  const r=rows.filter(v=>v.seg===s);
  console.log(`seg ${s} honest DRAWN-cell pearson (sz kept):`, pearson(r.map(v=>v.x),r.map(v=>v.y)));
}
// pooled over all drawn cells
console.log('pooled over all drawn cells:', pearson(rows.map(v=>v.x),rows.map(v=>v.y)));

const nar=generateNarrativeSummary(spec);
console.log('SUMMARY:', nar.summary);
console.log('KEYFINDINGS:', JSON.stringify(nar.keyFindings));
