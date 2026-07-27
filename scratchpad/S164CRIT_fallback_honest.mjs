// Control: a GENUINELY continuous single rising cloud, all-distinct size, NO falling partition.
// Under my proposed amendment (fallback to PARTITION-level, not bare pooled) this must STILL narrate.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(ps){const n=ps.length;const mx=ps.reduce((s,p)=>s+p[0],0)/n,my=ps.reduce((s,p)=>s+p[1],0)/n;let a=0,dx=0,dy=0;for(const[x,y]of ps){a+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}return a/Math.sqrt(dx*dy);}
// one colour, monotone rising, each point distinct size. partition (colour) group RISES.
const rows=[{x:1,y:10,seg:'A',sz:11},{x:2,y:20,seg:'A',sz:12},{x:3,y:30,seg:'A',sz:13},{x:4,y:40,seg:'A',sz:14}];
const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
const spec={$schema:'https://oods.dev/viz-spec/v1',id:'h',name:'h',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
console.log('CURRENT SUT corr:', analyzeVizSpec(spec).correlation, '(expect ~0.99 narrate)');
console.log('colour partition seg=A direction:', pearson(rows.filter(r=>r.seg==='A').map(r=>[r.x,r.y])).toFixed(4), '(RISES -> honest partition-level narrate under my amendment)');
