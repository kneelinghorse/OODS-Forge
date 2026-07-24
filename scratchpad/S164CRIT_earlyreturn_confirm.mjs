// Confirm the partition-empty early-return is the mechanism, and it also fires with NO aggregate.
import { analyzeVizSpec, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
function mk(agg){
  const rows=[];const add=(x,y,sz)=>rows.push({x,y,sz});
  add(1,50,10);add(2,40,10);add(3,30,10);add(4,250,20);add(5,240,20);add(6,230,20);add(7,450,30);add(8,440,30);add(9,430,30);
  const yEnc={field:'y',trait:'EncodingY',type:'quantitative'}; if(agg)yEnc.aggregate=agg;
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:yEnc,size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  return {$schema:'https://oods.dev/viz-spec/v1',id:'x',name:'x',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
}
for(const agg of ['average',null]){
  const a=analyzeVizSpec(mk(agg));
  console.log(`size-only agg=${agg||'none'} -> SUT correlation=`, a.correlation, '(all 3 size bands pearson -1.0)');
}
