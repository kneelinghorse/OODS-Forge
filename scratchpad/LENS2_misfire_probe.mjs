import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const sign=r=>r>0?1:r<0?-1:0;
// project rows to cells keyed by (x, ...gf), value=avg y
function project(rows, gf){const m=new Map();for(const r of rows){const k=[r.x,...gf.map(f=>r[f])].join('|');if(!m.has(k))m.set(k,{x:r.x,ys:[]});m.get(k).ys.push(r.y);}return[...m.values()].map(c=>[c.x,c.ys.reduce((a,b)=>a+b,0)/c.ys.length]);}
function classifyDir(cells){const xs=cells.map(c=>c[0]),ys=cells.map(c=>c[1]);const n=xs.length;if(n<2)return'unk';const mx=xs.reduce((a,b)=>a+b,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return'unk';if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return sign(cov);}const r=pearson(cells);return r===null?0:sign(Math.round(r*1000)/1000);}
function narratable(pooled, classes){const ev=classes.filter(c=>c!=='unk');if(ev.length===0)return true;if(new Set(ev).size>1)return false;const s=ev[0];const ps=sign(pooled);if(s===0)return ps===0;return ps===0||ps===s;}

function mkspec(rows, withSize){
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'}};
  if(withSize)enc.size={field:'sz',trait:'EncodingSize',type:'quantitative'};
  return{$schema:'https://oods.dev/viz-spec/v1',id:'t',name:'t',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
}
function simDesignB(rows){
  // partition by seg (effectivePartition), project each group by [sz], classify
  const bySeg=new Map();for(const r of rows){if(!bySeg.has(r.seg))bySeg.set(r.seg,[]);bySeg.get(r.seg).push(r);}
  const classes=[...bySeg.values()].map(g=>classifyDir(project(g,['sz'])));
  const pooledCells=project(rows,['seg','sz']); const pooled=Math.round(pearson(pooledCells)*1000)/1000;
  return{classes,pooled,narrate:narratable(pooled,classes)};
}
function simS162(rows){
  const bySeg=new Map();for(const r of rows){if(!bySeg.has(r.seg))bySeg.set(r.seg,[]);bySeg.get(r.seg).push(r);}
  const classes=[...bySeg.values()].map(g=>classifyDir(project(g,[])));
  const pooledCells=project(rows,['seg','sz']); const pooled=Math.round(pearson(pooledCells)*1000)/1000;
  return{classes,pooled,narrate:narratable(pooled,classes)};
}

// CASE 1: legit — each seg cloud rises over its fine (x,sz) cells; pooled rises. Expect narrate under BOTH.
let rows=[];
const push=(x,y,g,sz)=>rows.push({x,y,seg:g,sz});
// seg A: at x=1 two bubbles (sz0:y=10, sz1:y=12); x=2 (y=20,22); x=3 (y=30,32) rising
push(1,10,'A',0);push(1,12,'A',1);push(2,20,'A',0);push(2,22,'A',1);push(3,30,'A',0);push(3,32,'A',1);
push(1,50,'B',0);push(1,52,'B',1);push(2,60,'B',0);push(2,62,'B',1);push(3,70,'B',0);push(3,72,'B',1);
console.log('CASE1 legit rising:');
console.log('  SUT(current s162, size present):', analyzeVizSpec(mkspec(rows,true)).correlation);
console.log('  simS162:', JSON.stringify(simS162(rows)));
console.log('  simDesignB:', JSON.stringify(simDesignB(rows)));

// CASE 2: does size-keying create a same-x reversal the viewer genuinely sees? 
// seg A: per-x MEANS rise, but fine (x,sz) cells within-x spread doesn't add x-trend reversal -> should stay +1
// Construct: seg A x=1 {sz0:y=0}, x=2 {sz0:y=100, sz1:y=-100 avg? no}. Keep honest.
console.log('\nCASE2 - size noise, per-x means rise, fine cells still rise:');
let r2=[];const p2=(x,y,g,sz)=>r2.push({x,y,seg:g,sz});
p2(1,1,'A',0);p2(2,2,'A',1);p2(3,3,'A',2);p2(1,5,'B',0);p2(2,6,'B',1);p2(3,7,'B',2);
console.log('  SUT:', analyzeVizSpec(mkspec(r2,true)).correlation);
console.log('  simS162:', JSON.stringify(simS162(r2)),' simDesignB:', JSON.stringify(simDesignB(r2)));

console.log('\n=== CASE3: per-x MEANS rise, but fine (x,sz) cells have big within-x spread -> design B flat/reversal ===');
let r3=[];const p3=(x,y,g,sz)=>r3.push({x,y,seg:g,sz});
// seg A per-x means: x1 mean=10, x2 mean=20, x3 mean=30 (RISE). But fine cells zigzag hugely.
p3(1,-40,'A',0);p3(1,60,'A',1); // x1 cells: -40, 60 (mean 10)
p3(2,90,'A',2);p3(2,-50,'A',3); // x2 cells: 90,-50 (mean 20)
p3(3,-20,'A',4);p3(3,80,'A',5); // x3 cells: -20,80 (mean 30)
// seg B cleanly rises fine + mean
p3(1,100,'B',0);p3(1,101,'B',1);
p3(2,110,'B',2);p3(2,111,'B',3);
p3(3,120,'B',4);p3(3,121,'B',5);
console.log('  SUT(current s162):', analyzeVizSpec(mkspec(r3,true)).correlation);
console.log('  simS162 (per-x means):', JSON.stringify(simS162(r3)));
console.log('  simDesignB (fine x,sz cells):', JSON.stringify(simDesignB(r3)));
// what does the viewer see for seg A over the DRAWN fine cells?
const segAcells=[[1,-40],[1,60],[2,90],[2,-50],[3,-20],[3,80]];
console.log('  seg A fine-cell pearson (what viewer sees drawn):', pearson(segAcells)?.toFixed(4));
console.log('  seg A per-x-mean pearson (s162 sees):', pearson([[1,10],[2,20],[3,30]])?.toFixed(4));

console.log('\n=== CASE4: force seg A fine cells to ~0 (flat) while per-x means rise cleanly ===');
let r4=[];const p4=(x,y,g,sz)=>r4.push({x,y,seg:g,sz});
// seg A per-x means rise 10/20/30 but fine cells arranged so overall pearson ~ 0
p4(1,-100,'A',0);p4(1,120,'A',1);   // mean 10
p4(2,150,'A',2);p4(2,-110,'A',3);   // mean 20
p4(3,-90,'A',4);p4(3,150,'A',5);    // mean 30
p4(1,200,'B',0);p4(2,210,'B',1);p4(3,220,'B',2); // B rises clean
console.log('  simS162:', JSON.stringify(simS162(r4)));
console.log('  simDesignB:', JSON.stringify(simDesignB(r4)));
const segA=[[1,-100],[1,120],[2,150],[2,-110],[3,-90],[3,150]];
console.log('  seg A fine-cell pearson (viewer sees):', pearson(segA)?.toFixed(4), '-> rounded sign:', sign(Math.round(pearson(segA)*1000)/1000));
