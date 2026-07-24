// Hand-simulation of the DRAFT s164 m1 algorithm, focused on the CONTRADICTION-ORDERING lens (F3).
// Re-implements classifyGroupDirection + narratableCorrelation verbatim from data-analysis.ts, then
// applies the PROPOSED sub-grouping (partition ∪ grouping) and compares to the CURRENT per-partition
// pooling. Goal: find whether the finer granularity (a) closes the survivor, (b) re-opens an s160/s161
// closed defect, or (c) OVER-suppresses an honest chart via FLAT / n=2-slope votes.

function pearson(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((s,v)=>s+v,0)/n, my = ys.reduce((s,v)=>s+v,0)/n;
  let num=0,dx=0,dy=0;
  for (let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const round3 = r => r===null?null:Math.round(r*1000)/1000;
const signOf = r => r>0?1:r<0?-1:0;

// VERBATIM classifyGroupDirection contract (data-analysis.ts:1326)
function classifyGroupDirection(cells, xF, yF){
  const xs=[],ys=[];
  for(const row of cells){const x=row[xF],y=row[yF]; if(x==null||y==null||!Number.isFinite(x)||!Number.isFinite(y))continue; xs.push(x);ys.push(y);}
  const n=xs.length;
  if(n<2)return 'unknown';
  const meanX=xs.reduce((s,x)=>s+x,0)/n; let denomX=0; for(const x of xs)denomX+=(x-meanX)**2;
  if(denomX===0)return 'unknown';
  if(n===2){const meanY=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-meanX)*(ys[i]-meanY);return signOf(cov);}
  const r=pearson(xs,ys); return r===null?0:signOf(round3(r)); // note: SUT signs the ROUNDED pearson
}
// VERBATIM narratableCorrelation (data-analysis.ts:1383)
function narratable(pooled, classes){
  const ev=classes.filter(c=>c!=='unknown');
  if(ev.length===0)return true;
  if(new Set(ev).size>1)return false;
  const s=ev[0], ps=signOf(round3(pooled));
  if(s===0)return ps===0;
  return ps===0||ps===s;
}
// project (dim x grouping) -> avg cell, per keyfields
function project(rows,dimF,measF,extra){const keyFields=[dimF,...extra];
  const groups=new Map();
  for(const r of rows){const key=keyFields.map(f=>String(r[f])).join('\0'); if(!groups.has(key))groups.set(key,{dim:r[dimF],vals:[]}); groups.get(key).vals.push(r[measF]);}
  return [...groups.values()].map(g=>({[dimF]:g.dim,[measF]:g.vals.reduce((s,v)=>s+v,0)/g.vals.length}));
}

// OLD (s163): group by partition, reproject each partition group over grouping, ONE direction each
function oldClasses(rows,dimF,measF,partition,grouping){
  const groups=new Map();
  for(const r of rows){const k=partition.map(f=>String(r[f])).join('\0'); if(!groups.has(k))groups.set(k,[]); groups.get(k).push(r);}
  const classes=[];
  for(const g of groups.values()){const cells=project(g,dimF,measF,grouping); classes.push(classifyGroupDirection(cells,dimF,measF));}
  return classes;
}
// NEW (s164 proposal): group by partition ∪ grouping; each sub-series projected to per-dim cells; vote if n>=2.
// FALLBACK to OLD only if EVERY sub-series has n<2 distinct x.
function newClasses(rows,dimF,measF,partition,grouping){
  const key=[...partition,...grouping];
  const groups=new Map();
  for(const r of rows){const k=key.map(f=>String(r[f])).join('\0'); if(!groups.has(k))groups.set(k,[]); groups.get(k).push(r);}
  const subClasses=[]; let anyVoter=false;
  for(const g of groups.values()){
    const cells=project(g,dimF,measF,[]); // per-dim cells within the sub-series
    const distinctX=new Set(cells.map(c=>c[dimF])).size;
    if(distinctX>=2)anyVoter=true;
    subClasses.push(classifyGroupDirection(cells,dimF,measF));
  }
  if(!anyVoter)return {classes:oldClasses(rows,dimF,measF,partition,grouping),fellBack:true};
  return {classes:subClasses,fellBack:false};
}

function evalCase(label,rows,dimF,measF,partition,grouping){
  const pooledCells=project(rows,dimF,measF,[...partition,...grouping]);
  const pooled=round3(pearson(pooledCells.map(c=>c[dimF]),pooledCells.map(c=>c[measF])));
  const oc=oldClasses(rows,dimF,measF,partition,grouping);
  const nc=newClasses(rows,dimF,measF,partition,grouping);
  const oldNarr=pooled===null?undefined:(narratable(pooled,oc)?pooled:undefined);
  const newNarr=pooled===null?undefined:(narratable(pooled,nc.classes)?pooled:undefined);
  console.log(`\n### ${label}`);
  console.log(`  pooled=${pooled}  partition=${JSON.stringify(partition)} grouping=${JSON.stringify(grouping)}`);
  console.log(`  OLD classes=${JSON.stringify(oc)} -> narrate ${oldNarr}`);
  console.log(`  NEW classes=${JSON.stringify(nc.classes)} fellBack=${nc.fellBack} -> narrate ${newNarr}`);
  return {oldNarr,newNarr};
}

// ---- CASE 1: the reproduced SURVIVOR (detail/size Simpson, avg). Expect NEW -> undefined ----
{ const rows=[]; for(const seg of ['A','B']){rows.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2});}
  evalCase('CASE1 survivor (color partition + quant detail Simpson)',rows,'x','y',['seg'],['d']); }

// ---- CASE 2: HONEST rise, all bands rise cleanly. Expect BOTH narrate (F1 keep-control) ----
{ const rows=[]; for(const seg of ['A','B'])for(const sz of [10,20]){rows.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz});}
  evalCase('CASE2 honest rise, every (seg,sz) band rises',rows,'x','y',['seg'],['sz']); }

// ---- CASE 3: honest predominantly-rising, ONE band FLAT (zero y-variance). Over-suppression? ----
{ const rows=[];
  // seg A: sz=10 rises, sz=20 rises ; seg B: sz=10 FLAT (control), sz=20 rises
  rows.push({x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10});
  rows.push({x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20});
  rows.push({x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10}); // FLAT band
  rows.push({x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20});
  evalCase('CASE3 mostly-rise + one FLAT band (over-suppression test)',rows,'x','y',['seg'],['sz']); }

// ---- CASE 4: n=2 noise band among rising. One 2-pt band ticks DOWN by noise ----
{ const rows=[];
  rows.push({x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10}); // n=2 rise
  rows.push({x:1,y:21,seg:'A',sz:20},{x:2,y:20.9,seg:'A',sz:20}); // n=2 tiny noise DOWN
  rows.push({x:1,y:31,seg:'B',sz:10},{x:2,y:32,seg:'B',sz:10});
  rows.push({x:1,y:41,seg:'B',sz:20},{x:2,y:42,seg:'B',sz:20});
  evalCase('CASE4 honest rise + one n=2 noise-down band',rows,'x','y',['seg'],['sz']); }

// ---- CASE 5: P4 analog at partition-only (NO grouping). Must STAY suppressed (no regression) ----
{ const rows=[{x:1,y:1,seg:'Z'},{x:2,y:2,seg:'Z'},{x:3,y:1,seg:'Z'},{x:4,y:4,seg:'A'},{x:5,y:5,seg:'A'},{x:6,y:6,seg:'A'}];
  evalCase('CASE5 P4 {flat,rising} partition-only (must stay undefined)',rows,'x','y',['seg'],[]); }

// ---- CASE 6: sign-cancellation pooled~0 with quant grouping. Contradiction-first must suppress ----
{ const rows=[];
  rows.push({x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10}); // rise
  rows.push({x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}); // fall, symmetric -> pooled~0
  evalCase('CASE6 pooled~0 opposing bands (sign-cancellation)',rows,'x','y',['seg'],['sz']); }
