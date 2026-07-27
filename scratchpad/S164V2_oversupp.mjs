// S164 RE-CRITIC — faithful hand-simulation of the v2 §10 algorithm (G0 ∪ G1 with the τ magnitude floor).
// Read-only: uses the DIST SUT for pooled r + current-code G0 classes, then hand-applies G1.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;
const signOf=r=>r>0?1:r<0?-1:0;
function slopeSign(pairs){ // sign of fitted slope; well-defined n>=2 (matches classifyGroupDirection intent)
  const n=pairs.length; if(n<2) return 'unknown';
  const xs=pairs.map(p=>p[0]); const mx=xs.reduce((s,x)=>s+x,0)/n; let dx=0; for(const x of xs)dx+=(x-mx)**2; if(dx===0)return 'unknown';
  if(n===2){const my=(pairs[0][1]+pairs[1][1])/2;let cov=0;for(const[x,y]of pairs)cov+=(x-mx)*(y-my);return signOf(cov);}
  const r=pearson(pairs); return r===null?0:signOf(round3(r));
}
// fitted change |Δ| across the sub-series' x = |slope|*(xmax-xmin); at n=2 = |y2-y1|.
function fittedDelta(pairs){
  const n=pairs.length; if(n<2)return 0;
  const xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]);
  if(n===2) return Math.abs(ys[1]-ys[0]);
  const mx=xs.reduce((s,x)=>s+x,0)/n,my=ys.reduce((s,y)=>s+y,0)/n;
  let cov=0,dx=0; for(let i=0;i<n;i++){cov+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;}
  if(dx===0)return 0; const slope=cov/dx; return Math.abs(slope*(Math.max(...xs)-Math.min(...xs)));
}

// Build drawn cells (avg per (x, ...keyFields)) from raw rows.
function drawnCells(rows, keyFields){
  const m=new Map();
  for(const r of rows){const k=keyFields.map(f=>String(r[f])).join('|'); if(!m.has(k))m.set(k,{key:{},vs:[]}); const c=m.get(k); for(const f of keyFields)c.key[f]=r[f]; c.vs.push(r.y);}
  return [...m.values()].map(c=>({...c.key,y:c.vs.reduce((s,v)=>s+v,0)/c.vs.length}));
}

// v2 §10 hand-simulation. partitionFields, groupingFields given. tau relative to pooled cell-value range.
function v2decision(rows, partitionFields, groupingFields, tau, sutCorr){
  const cells = drawnCells(rows, ['x',...partitionFields,...groupingFields]);
  const pooled = round3(pearson(cells.map(c=>[c.x,c.y])));
  const pooledSign = signOf(pooled);
  const yr = cells.map(c=>c.y); const range = Math.max(...yr)-Math.min(...yr);
  const floor = tau*range;

  // --- G0: current-code re-projected partition classes fed to narratableCorrelation ---
  const partGroups = new Map();
  for(const r of rows){const k=partitionFields.map(f=>String(r[f])).join('|'); if(!partGroups.has(k))partGroups.set(k,[]); partGroups.get(k).push(r);}
  const g0classes=[];
  for(const [,grp] of partGroups){ const gc=drawnCells(grp, ['x',...groupingFields]); g0classes.push(slopeSign(gc.map(c=>[c.x,c.y]))); }
  const ev=g0classes.filter(c=>c!=='unknown');
  let g0suppress=false;
  if(ev.length>0){ if(new Set(ev).size>1) g0suppress=true; else { const s=ev[0]; if(s===0) g0suppress=(pooledSign!==0); else g0suppress=(pooledSign!==0 && pooledSign!==s); } }

  // --- G1: decompose to (partition ∪ grouping) sub-series; cascade if a partition shreds ---
  const g1details=[]; let g1suppress=false;
  for(const [pk,grp] of partGroups){
    const subCells=drawnCells(grp, ['x',...groupingFields]);
    // sub-series = group by grouping key; votable iff >=2 distinct x
    const subMap=new Map();
    for(const c of subCells){const sk=groupingFields.map(f=>String(c[f])).join('|'); if(!subMap.has(sk))subMap.set(sk,[]); subMap.get(sk).push(c);}
    let votable=[...subMap.values()].filter(cc=>new Set(cc.map(c=>c.x)).size>=2);
    let cascaded=false;
    if(votable.length===0){ // shreds -> cascade to partition-level series
      if(new Set(subCells.map(c=>c.x)).size>=2){ votable=[subCells]; cascaded=true; }
    }
    for(const ss of votable){
      const pairs=ss.map(c=>[c.x,c.y]); const sg=slopeSign(pairs); const d=fittedDelta(pairs);
      const opposes = sg===-pooledSign && d>=floor;
      if(opposes) g1suppress=true;
      g1details.push(`   P=${pk}${cascaded?'(cascade)':''} sub n=${pairs.length} slopeSign=${sg} |Δ|=${d.toFixed(1)} vs floor=${floor.toFixed(1)} -> ${opposes?'OPPOSES':'ok'}`);
    }
  }
  const decision = (g0suppress||g1suppress)?'SUPPRESS':('NARRATE '+pooled);
  return {pooled,pooledSign,range,floor,g0classes,g0suppress,g1suppress,g1details,decision,sutCorr};
}

function run(label, rows, partitionFields, groupingFields, spec, tau){
  const sut = spec?analyzeVizSpec(spec).correlation:undefined;
  const d=v2decision(rows,partitionFields,groupingFields,tau,sut);
  console.log(`\n===== ${label} (τ=${tau}) =====`);
  console.log(`  pooled r=${d.pooled} (sign ${d.pooledSign}) | pooled y-range=${d.range} | τ·range floor=${d.floor.toFixed(2)}`);
  if(sut!==undefined) console.log(`  CURRENT SUT correlation (HEAD): ${sut}`);
  console.log(`  G0 partition classes=${JSON.stringify(d.g0classes)} -> G0 suppress? ${d.g0suppress}`);
  d.g1details.forEach(s=>console.log(s));
  console.log(`  G1 suppress? ${d.g1suppress}`);
  console.log(`  ==> v2 DECISION: ${d.decision}`);
}

function specFor(rows, withSize, agg='average', extraCat){
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',...(agg?{aggregate:agg}:{})},
    color:{field:'seg',trait:'EncodingColor'}};
  if(withSize) enc.size={field:'sz',trait:'EncodingSize',type:'quantitative'};
  return {$schema:'x',id:'s',name:'s',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'x'}};
}

const TAU=0.10;

// ---- DEFECT 1 (skeptic_detail size-quant-avg): the §1 defect the memo claims v2 CLOSES ----
const d1=[];
const add1=(x,y,seg,sz)=>d1.push({x,y,seg,sz});
add1(1,50,'A',100);add1(2,40,'A',100);add1(3,30,'A',100);       // A band100 FALLS Δ20
add1(4,250,'A',200);add1(5,240,'A',200);add1(6,230,'A',200);    // A band200 FALLS Δ20
add1(1,1050,'B',100);add1(2,1040,'B',100);add1(3,1030,'B',100); // B band100 FALLS Δ20
add1(4,1250,'B',200);add1(5,1240,'B',200);add1(6,1230,'B',200); // B band200 FALLS Δ20
run('DEFECT1 size-Simpson (memo claims CLOSED; each sub-series pearson -1.0)', d1, ['seg'], ['sz'], specFor(d1,true), TAU);

// ---- F1b keep-control (must NARRATE): majority rise + one noisy n=2 band dipping 5 on ~1200 ----
const f1b=[];
for(const seg of ['A','B']){const base=seg==='A'?0:1000;
  f1b.push({x:1,y:base+10,seg,sz:10},{x:2,y:base+30,seg,sz:10},{x:3,y:base+55,seg,sz:10});
  f1b.push({x:4,y:base+120,seg,sz:20},{x:5,y:base+140,seg,sz:20},{x:6,y:base+170,seg,sz:20});
  f1b.push({x:7,y:base+205,seg,sz:30},{x:8,y:base+200,seg,sz:30}); // n=2 dip 5
}
run('F1b keep-control (should NARRATE)', f1b, ['seg'], ['sz'], specFor(f1b,true), TAU);

// ---- CASE3-FLAT keep-control (must NARRATE): strong rise + one flat control band ----
const c3=[];
c3.push({x:1,y:10,seg:'A',sz:10},{x:2,y:40,seg:'A',sz:10},{x:3,y:70,seg:'A',sz:10});
c3.push({x:1,y:20,seg:'A',sz:20},{x:2,y:50,seg:'A',sz:20},{x:3,y:80,seg:'A',sz:20});
c3.push({x:1,y:45,seg:'B',sz:10},{x:2,y:45,seg:'B',sz:10},{x:3,y:45,seg:'B',sz:10}); // FLAT
c3.push({x:1,y:30,seg:'B',sz:20},{x:2,y:60,seg:'B',sz:20},{x:3,y:90,seg:'B',sz:20});
run('CASE3-FLAT keep-control (should NARRATE)', c3, ['seg'], ['sz'], specFor(c3,true), TAU);

// ---- NEW over-suppression: COMPRESSED pooled range + one ordinary n=2 noise dip ----
// All series overlap in ~[0,100] (small pooled range). Most bands rise. One n=2 band noise-dips 12.
const comp=[];
for(const seg of ['A','B']){
  comp.push({x:1,y:10,seg,sz:10},{x:2,y:20,seg,sz:10},{x:3,y:30,seg,sz:10}); // rise
  comp.push({x:1,y:15,seg,sz:20},{x:2,y:25,seg,sz:20},{x:3,y:35,seg,sz:20}); // rise
  comp.push({x:4,y:60,seg,sz:30},{x:5,y:48,seg,sz:30}); // n=2 ordinary noise dip 12 on ~100 range
}
run('COMPRESSED-range + n=2 noise dip (honest-positive; OVER-suppress?)', comp, ['seg'], ['sz'], specFor(comp,true), TAU);
