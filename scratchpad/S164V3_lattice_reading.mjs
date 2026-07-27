// Which §10 full-lattice reading actually fixes the defects?
// READING A ("COARSEST S where n>=2", memo literal): each leaf votes at the FEWEST grouping fields
//   where it reaches n>=2 => essentially S=[] (the pooled partition series) whenever the group has >=2 x.
// READING B ("collect EVERY n>=2 sub-series at EVERY S", the parenthetical): union over all S.
// READING C ("FINEST S where n>=2 with backoff"): vote each finest leaf; if a finest leaf is n<2,
//   back off to the coarsest ancestor S that restores n>=2.
const RHO = 0.5;
function pearson(xs, ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;
const signOf=r=>r>0?1:r<0?-1:0;
function projectCells(rows,dimF,measF,keyFields){const g=new Map();for(const r of rows){const k=[dimF,...keyFields].map(f=>String(r[f])).join('\0');if(!g.has(k))g.set(k,{dim:r[dimF],sub:keyFields.map(f=>String(r[f])).join('\0'),vals:[]});g.get(k).vals.push(r[measF]);}return [...g.values()].map(x=>({dim:x.dim,sub:x.sub,val:x.vals.reduce((s,v)=>s+v,0)/x.vals.length}));}
function classifySub(cells){const xs=cells.map(c=>c.dim),ys=cells.map(c=>c.val);const n=xs.length;if(n<2)return{vote:'unknown',n};const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return{vote:'unknown',n};if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return{vote:signOf(cov),n};}const r=pearson(xs,ys);if(r===null)return{vote:0,n};return{vote:Math.abs(r)>=RHO?signOf(r):0,n};}
function subsets(a){let out=[[]];for(const x of a){out=out.concat(out.map(s=>[...s,x]));}return out;}

function partitionGroups(rows,partition){const m=new Map();if(partition.length===0){m.set('*',rows);return m;}for(const r of rows){const k=partition.map(f=>String(r[f])).join('\0');if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return m;}

// READING A: coarsest S per leaf => vote the S with FEWEST fields giving n>=2 for each distinct leaf lineage.
// Practically: for each partition group, the coarsest n>=2 is S=[] if the group has >=2 distinct x, else climb.
function readingA(rows,dimF,measF,partition,grouping){
  const E=[],all=[];let any=false;
  for(const [,pr] of partitionGroups(rows,partition)){
    // coarsest = smallest |S|. iterate S by size asc; first S giving any n>=2 sub-series => vote those, stop.
    const Ss=subsets(grouping).sort((a,b)=>a.length-b.length);
    for(const S of Ss){
      const cells=projectCells(pr,dimF,measF,S);const bySub=new Map();
      for(const c of cells){if(!bySub.has(c.sub))bySub.set(c.sub,[]);bySub.get(c.sub).push(c);}
      let voted=false;
      for(const [,cc] of bySub){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;voted=true;const d=classifySub(cc);if(d.vote==='unknown')continue;all.push(d.vote);if(d.vote!==0)E.push(d.vote);}
      if(voted)break; // coarsest level satisfied
    }
  }
  return {E,all,any};
}
// READING B: union over ALL S, every n>=2 sub-series votes.
function readingB(rows,dimF,measF,partition,grouping){
  const E=[],all=[];let any=false;
  for(const [,pr] of partitionGroups(rows,partition)){
    for(const S of subsets(grouping)){
      const cells=projectCells(pr,dimF,measF,S);const bySub=new Map();
      for(const c of cells){if(!bySub.has(c.sub))bySub.set(c.sub,[]);bySub.get(c.sub).push(c);}
      for(const [,cc] of bySub){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;const d=classifySub(cc);if(d.vote==='unknown')continue;all.push(d.vote);if(d.vote!==0)E.push(d.vote);}
    }
  }
  return {E,all,any};
}
// READING C: finest leaf; back off only when finest leaf n<2.
function readingC(rows,dimF,measF,partition,grouping){
  const E=[],all=[];let any=false;
  for(const [,pr] of partitionGroups(rows,partition)){
    // finest leaves = groups by full grouping
    const fullCells=projectCells(pr,dimF,measF,grouping);const leaves=new Map();
    for(const c of fullCells){if(!leaves.has(c.sub))leaves.set(c.sub,[]);leaves.get(c.sub).push(c);}
    for(const [subKey,cc] of leaves){
      if(new Set(cc.map(c=>c.dim)).size>=2){any=true;const d=classifySub(cc);if(d.vote!=='unknown'){all.push(d.vote);if(d.vote!==0)E.push(d.vote);}continue;}
      // finest leaf shredded: back off. find coarsest ancestor S (drop fields) restoring n>=2.
      const rep=pr.find(r=>grouping.map(f=>String(r[f])).join('\0')===subKey);
      const Ss=subsets(grouping).sort((a,b)=>a.length-b.length); // coarsest first
      for(const S of Ss){const psub=S.map(f=>String(rep[f])).join('\0');const pcells=projectCells(pr,dimF,measF,S).filter(c=>c.sub===psub);if(new Set(pcells.map(c=>c.dim)).size>=2){any=true;const d=classifySub(pcells);if(d.vote!=='unknown'){all.push(d.vote);if(d.vote!==0)E.push(d.vote);}break;}}
    }
  }
  return {E,all,any};
}
function decide(res,pooled){const pooledSign=signOf(round3(pooled));if(!res.any)return'FALLBACK-narrate';const setE=new Set(res.E);const allFlat=res.E.length===0;const sup=setE.size>1||res.E.some(e=>e===-pooledSign)||(allFlat&&pooledSign!==0);return sup?'SUPPRESS':'NARRATE';}

function ev(label,rows,dimF,measF,partition,grouping){
  const pc=projectCells(rows,dimF,measF,grouping);const pooled=round3(pearson(pc.map(c=>c.dim),pc.map(c=>c.val)));
  const A=readingA(rows,dimF,measF,partition,grouping),B=readingB(rows,dimF,measF,partition,grouping),C=readingC(rows,dimF,measF,partition,grouping);
  console.log(`\n### ${label}  pooled=${pooled} P=${JSON.stringify(partition)} G=${JSON.stringify(grouping)}`);
  console.log(`  A(coarsest): E=${JSON.stringify(A.E)} -> ${decide(A,pooled)}`);
  console.log(`  B(all-S):    E=${JSON.stringify(B.E)} -> ${decide(B,pooled)}`);
  console.log(`  C(finest+backoff): E=${JSON.stringify(C.E)} -> ${decide(C,pooled)}`);
}

// DEFECT 1/CASE1: color partition + quant detail Simpson, avg. EXPECT undefined.
{const rows=[];for(const seg of['A','B']){rows.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2});}ev('DEFECT1 detail Simpson (want SUPPRESS)',rows,'x','y',['seg'],['d']);}
// CASE6: pooled 0 opposing.
{const rows=[];rows.push({x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},{x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20});ev('CASE6 pooled~0 opposing (want SUPPRESS)',rows,'x','y',['seg'],['sz']);}
// DEFECT7: two grouping axes; finest shreds to n=1; middle (seg,size) has 4 bands r=-1; color pooled rises.
{const rows=[];let did=0;for(const seg of['A','B'])for(const sz of[10,20]){const base=seg==='A'?0:1000;const b2=sz===10?0:100;
  // 3 distinct x per (seg,sz) band, each FALLS; detail all-distinct so finest (seg,sz,det) is n=1
  rows.push({x:1,y:base+b2+30,seg,sz,det:did++},{x:2,y:base+b2+20,seg,sz,det:did++},{x:3,y:base+b2+10,seg,sz,det:did++});}
  ev('DEFECT7 two-axis, finest shreds, middle (seg,sz) falls (want SUPPRESS)',rows,'x','y',['seg'],['sz','det']);}
// KEEP CASE2 all-rise
{const rows=[];for(const seg of['A','B'])for(const sz of[10,20]){rows.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz});}ev('CASE2 all-rise (want NARRATE)',rows,'x','y',['seg'],['sz']);}
// KEEP CASE3-FLAT
{const rows=[];rows.push({x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},{x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},{x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},{x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20});ev('CASE3-FLAT rise+flat (want NARRATE)',rows,'x','y',['seg'],['sz']);}
