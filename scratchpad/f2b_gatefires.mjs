import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs,ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let c=0,vx=0,vy=0;for(let i=0;i<n;i++){c+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}if(vx===0||vy===0)return null;return c/Math.sqrt(vx*vy);}
// Classic drawn-cell Simpson: each seg falls, pooled rises. ONE cell per (x,seg) so no size collapse needed.
const rows=[
  {x:1,y:30,seg:'A'},{x:2,y:20,seg:'A'},{x:3,y:10,seg:'A'},
  {x:4,y:60,seg:'B'},{x:5,y:50,seg:'B'},{x:6,y:40,seg:'B'},
];
const enc={x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average',scale:{type:'linear'}},
  color:{field:'seg',trait:'EncodingColor',type:'nominal'}};
const spec={$schema:'https://oods.dev/viz-spec/v1',id:'g',name:'G',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'s'}};
const a=analyzeVizSpec(spec);
const segA=rows.filter(r=>r.seg==='A'),segB=rows.filter(r=>r.seg==='B');
console.log('drawn segA r=',pearson(segA.map(r=>r.x),segA.map(r=>r.y)),' segB r=',pearson(segB.map(r=>r.x),segB.map(r=>r.y)),' pooled=',pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
console.log('narrated correlation=',a.correlation,' => ',a.correlation===undefined?'SUPPRESSED (gate fires, honest)':'NARRATED');
