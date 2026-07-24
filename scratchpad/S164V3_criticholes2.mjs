// Proper Simpson: each size-band FALLS, disjoint x-ranges make POOLED RISE.
// Shows Reading-A (coarsest-S, the memo's literal phrasing + the planning agent's own simulator)
// re-opens skeptic_detail(defect 1) AND claimscope(defect 5), while Reading-B suppresses.
import { analyzeVizSpec, generateNarrativeSummary }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5;
function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let a=0,b=0,c=0;for(let i=0;i<n;i++){a+=(xs[i]-mx)*(ys[i]-my);b+=(xs[i]-mx)**2;c+=(ys[i]-my)**2;}const d=Math.sqrt(b*c);return d===0?null:a/d;}
const r3=r=>r===null?null:Math.round(r*1000)/1000, sgn=r=>r>0?1:r<0?-1:0;
function proj(rows,dimF,measF,kf){const g=new Map();for(const r of rows){const k=[dimF,...kf].map(f=>String(r[f])).join('|');if(!g.has(k))g.set(k,{dim:r[dimF],sub:kf.map(f=>String(r[f])).join('|'),vals:[]});g.get(k).vals.push(r[measF]);}return[...g.values()].map(o=>({dim:o.dim,sub:o.sub,val:o.vals.reduce((s,v)=>s+v,0)/o.vals.length}));}
function cls(cells){const xs=cells.map(c=>c.dim),ys=cells.map(c=>c.val),n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return sgn(cov);}const r=pearson(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?sgn(r):0;}
const subsets=arr=>{let o=[[]];for(const a of arr){const c=[...o];for(const s of c)o.push([...s,a]);}return o;};
function g1(rows,dimF,measF,partition,grouping){
  const pc=proj(rows,dimF,measF,grouping);const pooledSign=sgn(r3(pearson(pc.map(c=>c.dim),pc.map(c=>c.val))));
  const pk=new Map();if(partition.length===0)pk.set('*',rows);else for(const r of rows){const k=partition.map(f=>String(r[f])).join('|');if(!pk.has(k))pk.set(k,[]);pk.get(k).push(r);}
  const Ea=[],Eb=[];let anyA=false,anyB=false;
  for(const[,prows]of pk){const Ss=subsets(grouping).sort((a,b)=>a.length-b.length);
    for(const S of Ss){const cells=proj(prows,dimF,measF,S);const bs=new Map();for(const c of cells){if(!bs.has(c.sub))bs.set(c.sub,[]);bs.get(c.sub).push(c);}
      for(const[sub,cc]of bs){if(new Set(cc.map(c=>c.dim)).size<2)continue;const v=cls(cc);
        anyB=true;Eb.push(v==='unknown'?'unk':v===0?'flat':v);
        let pv=false;if(S.length>0){for(let i=0;i<S.length;i++){const pS=S.filter((_,j)=>j!==i);const cr=prows.filter(r=>S.map(f=>String(r[f])).join('|')===sub);const rep=cr[0];const ps=pS.map(f=>String(rep[f])).join('|');const p=proj(prows,dimF,measF,pS);if(new Set(p.filter(c=>c.sub===ps).map(c=>c.dim)).size>=2){pv=true;break;}}}
        if(S.length>0&&pv)continue;anyA=true;Ea.push(v==='unknown'?'unk':v===0?'flat':v);}}}
  const dec=(E,any)=>{if(!any)return'FALLBACK-narrate';const nf=E.filter(e=>e!=='flat'&&e!=='unk');const s=new Set(nf);const af=nf.length===0;if(s.size>1)return'SUPPRESS(size>1)';if(nf.some(e=>e===-pooledSign))return'SUPPRESS(opp)';if(af&&pooledSign!==0)return'SUPPRESS(allflat)';return'NARRATE';};
  return{pooledSign,Ea,Eb,A:dec(Ea,anyA),B:dec(Eb,anyB)};
}
function run(label,rows,enc,partition,grouping){
  const spec={$schema:'x',id:'s',name:label,data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'x'}};
  const a=analyzeVizSpec(spec);const{summary}=generateNarrativeSummary(spec);const res=g1(rows,'x','y',partition,grouping);
  console.log(`\n### ${label}`);console.log(`  CURRENT SUT corr=${a.correlation} | ${summary}`);
  console.log(`  pooledSign=${res.pooledSign} partition=${JSON.stringify(partition)} grouping=${JSON.stringify(grouping)}`);
  console.log(`  Ea(coarsest)=${JSON.stringify(res.Ea)} -> READING A: ${res.A}`);
  console.log(`  Eb(collect) =${JSON.stringify(res.Eb)} -> READING B: ${res.B}`);
}
// skeptic_detail proper: partition=seg(one group A), size bands each FALL, disjoint x -> pooled RISES
{const rows=[
  {x:1,y:100,seg:'A',sz:10},{x:2,y:90,seg:'A',sz:10},{x:3,y:80,seg:'A',sz:10},
  {x:4,y:300,seg:'A',sz:20},{x:5,y:290,seg:'A',sz:20},{x:6,y:280,seg:'A',sz:20},
  {x:7,y:500,seg:'A',sz:30},{x:8,y:490,seg:'A',sz:30},{x:9,y:480,seg:'A',sz:30}];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  run('SKEPTIC_DETAIL proper (1 seg group, 3 size bands FALL, pooled RISES)',rows,enc,['seg'],['sz']);}
// claimscope: size only, no categorical partition, bands FALL, pooled RISES
{const rows=[
  {x:1,y:50,sz:10},{x:2,y:40,sz:10},{x:3,y:30,sz:10},
  {x:4,y:250,sz:20},{x:5,y:240,sz:20},{x:6,y:230,sz:20},
  {x:7,y:450,sz:30},{x:8,y:440,sz:30},{x:9,y:430,sz:30}];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  run('CLAIMSCOPE (size-only, no partition, bands FALL, pooled RISES)',rows,enc,[],['sz']);}
