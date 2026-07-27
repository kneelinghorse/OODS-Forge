// F1 OVER-SUPPRESSION probes for the s164 DRAFT m1 (decompose direction by (partition∪grouping)
// sub-series, contradiction-first: SUPPRESS if ANY voting sub-series contradicts pooled sign;
// a sub-series votes iff n>=2 distinct x). All cases have an ACTIVE categorical partition (color=seg)
// so the partition.length===0 early-return does NOT fire (decomposition applies).
//
// I establish CURRENT SUT behavior (fix not implemented) and HAND-SIMULATE the proposed algorithm
// per sub-series so the delta is explicit.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
function round3(r){return r===null?null:Math.round(r*1000)/1000;}
function signOf(r){return r>0?1:r<0?-1:0;}
// 2-point slope sign == covariance sign (what classifyGroupDirection uses at n===2)
function n2sign(pairs){const mx=(pairs[0][0]+pairs[1][0])/2,my=(pairs[0][1]+pairs[1][1])/2;let cov=0;for(const[x,y]of pairs)cov+=(x-mx)*(y-my);return signOf(cov);}
function dirOf(pairs){const n=pairs.length;if(n<2)return 'unknown';const xs=pairs.map(p=>p[0]);const mx=xs.reduce((s,x)=>s+x,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return 'unknown';if(n===2)return n2sign(pairs);const r=pearson(pairs);return r===null?0:signOf(round3(r));}

function build(id, rows, agg){
  const yEnc={field:'y',trait:'EncodingY',type:'quantitative'}; if(agg)yEnc.aggregate=agg;
  const enc={
    x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:yEnc,
    color:{field:'seg',trait:'EncodingColor'},              // categorical -> ACTIVE partition
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'}, // quant grouping band
  };
  return {$schema:'https://oods.dev/viz-spec/v1',id,name:id,data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
}

// drawn cell = avg per (x,seg,sz). Report SUT + hand sub-series decomposition.
function report(label, rows, agg){
  const spec=build(label,rows,agg);
  const a=analyzeVizSpec(spec); const {summary}=generateNarrativeSummary(spec);
  console.log(`\n===== ${label} (agg=${agg||'none'}) =====`);
  console.log('  SUT correlation:', a.correlation, '|', summary.replace(label+' shows ',''));
  // drawn cells: avg per (x,seg,sz)
  const cellMap=new Map();
  for(const r of rows){const k=`${r.x}|${r.seg}|${r.sz}`; if(!cellMap.has(k))cellMap.set(k,{x:r.x,seg:r.seg,sz:r.sz,vs:[]}); cellMap.get(k).vs.push(r.y);}
  const cells=[...cellMap.values()].map(c=>({x:c.x,seg:c.seg,sz:c.sz,y:agg==='average'?c.vs.reduce((s,v)=>s+v,0)/c.vs.length:c.vs[0]}));
  const pooled=round3(pearson(cells.map(c=>[c.x,c.y])));
  console.log('  POOLED over drawn cells r=',pooled,'sign=',signOf(pooled));
  // per-partition (seg) pooled direction  == what CURRENT s163 votes
  const segDirs=[];
  for(const seg of [...new Set(cells.map(c=>c.seg))]){
    const sub=cells.filter(c=>c.seg===seg).map(c=>[c.x,c.y]);
    segDirs.push(dirOf(sub));
  }
  console.log('  CURRENT per-partition(seg) direction classes =',JSON.stringify(segDirs));
  // PROPOSED: per (seg,sz) sub-series direction; vote iff n>=2 distinct x
  const subDirs=[]; const detail=[];
  for(const seg of [...new Set(cells.map(c=>c.seg))]) for(const sz of [...new Set(cells.filter(c=>c.seg===seg).map(c=>c.sz))]){
    const pairs=cells.filter(c=>c.seg===seg&&c.sz===sz).map(c=>[c.x,c.y]);
    const distinctX=new Set(pairs.map(p=>p[0])).size;
    const d= distinctX>=2 ? dirOf(pairs) : 'unknown(n<2)';
    detail.push(`(seg=${seg},sz=${sz}) nX=${distinctX} r=${round3(pearson(pairs))} -> ${d}`);
    if(distinctX>=2) subDirs.push(dirOf(pairs));
  }
  detail.forEach(d=>console.log('    ',d));
  const evidence=subDirs.filter(d=>d!=='unknown');
  const everyNlt2 = evidence.length===0;
  let proposed;
  if(everyNlt2){ proposed='FALLBACK->pooled (narrate '+pooled+')'; }
  else if(new Set(evidence).size>1){ proposed='SUPPRESS (sub-series disagree)'; }
  else { const s=evidence[0]; const ps=signOf(pooled);
    proposed = (s===0)?(ps===0?'narrate':'SUPPRESS(all-flat)'):((ps===0||ps===s)?'narrate '+pooled:'SUPPRESS(reversal)'); }
  console.log('  PROPOSED voting sub-series classes =',JSON.stringify(subDirs),'-> DECISION:',proposed);
}

// (a) HONEST bubble: every (seg,sz) sub-series genuinely RISES. Must still narrate.
const honest=[];
for(const seg of ['A','B']){ const base=seg==='A'?0:500;
  for(const sz of [10,20,30]){ // 3 size bands, each with 3 rising x
    honest.push({x:1,y:base+sz*1+10,seg,sz},{x:2,y:base+sz*1+20,seg,sz},{x:3,y:base+sz*1+30,seg,sz});
  }
}
report('F1a_honest_rise', honest, 'average');

// (b) MIXED noisy: overall clearly RISES, most (seg,sz) bands rise, ONE small n=2 band wobbles DOWN.
const mixed=[];
for(const seg of ['A','B']){ const base=seg==='A'?0:1000;
  // band 10: rises (n=3)
  mixed.push({x:1,y:base+10,seg,sz:10},{x:2,y:base+30,seg,sz:10},{x:3,y:base+55,seg,sz:10});
  // band 20: rises (n=3)
  mixed.push({x:4,y:base+120,seg,sz:20},{x:5,y:base+140,seg,sz:20},{x:6,y:base+170,seg,sz:20});
  // band 30: ONE noisy n=2 pair that slopes slightly DOWN (5 unit dip) though overall cloud rises
  mixed.push({x:7,y:base+205,seg,sz:30},{x:8,y:base+200,seg,sz:30});
}
report('F1b_mixed_one_noisy_n2', mixed, 'average');

// (c) single-partition-ish honest line: 2 segs, ONE size band each, genuinely rising (n=4). Baseline sanity.
const single=[];
for(const seg of ['A','B']){ const base=seg==='A'?0:200;
  for(const x of [1,2,3,4]) single.push({x,y:base+x*10,seg,sz:15});
}
report('F1c_single_band_honest', single, 'average');
