// S163 CROSSVALUE lens — regression sweep of s161/s162 closed defects + hunt for
// s163-introduced perturbations on OTHER narrated paths.
// Read-only against fresh dist (HEAD ae6c0dc). Hand-oracles computed here.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
function mkspec({id='s',mark='MarkPoint',enc,values,extra={}}){
  return {$schema:'https://oods.dev/viz-spec/v1',id,name:id,
    data:{name:'d',values},
    marks:[{trait:mark,encodings:JSON.parse(JSON.stringify(enc))}],
    encoding:JSON.parse(JSON.stringify(enc)),a11y:{description:'d'},...extra};
}
function show(label,spec){
  console.log('\n===== '+label+' =====');
  const a=analyzeVizSpec(spec);
  const {summary,keyFindings}=generateNarrativeSummary(spec);
  console.log('  rpc:',JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  correlation:',a.correlation,'| total:',a.total,'| max:',a.max?JSON.stringify(a.max):undefined,'| min:',a.min?JSON.stringify(a.min):undefined);
  console.log('  summary:',summary);
  console.log('  keyFindings:',JSON.stringify(keyFindings));
  return a;
}

// ============ REGRESSION 1: raw horizontal bar measure=x (s161/s162 S2) ============
// mark=bar, x quant (no aggregate), y nominal. measure SHOULD be x. total = Σ x.
// Reuse the s162 diverging-bar shape values summing to 550.
const rhbValues=[
  {x:100,y:'Alpha'},{x:150,y:'Beta'},{x:50,y:'Gamma'},{x:200,y:'Delta'},{x:50,y:'Eps'},
];
const rhbSumX=rhbValues.reduce((s,r)=>s+r.x,0);
const arhb=show('R1 raw horizontal bar (mark=bar, x quant, y nominal) expect measure=x total='+rhbSumX,mkspec({
  id:'rhb',mark:'MarkBar',values:rhbValues,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'nominal'}},
}));
console.log('  ORACLE measure should be x, total should be',rhbSumX,'=> total match:',arhb.total===rhbSumX);

// ============ REGRESSION 2: n=2 slope-sign correlation (non-aggregate scatter) ============
// 2-point scatter with a partition (color) so it isn't the early-return. slope up.
const n2rows=[
  {x:1,y:10,g:'A'},{x:2,y:20,g:'A'},{x:1,y:5,g:'B'},{x:2,y:15,g:'B'},
];
const an2=show('R2 n=2 per-group scatter, both slopes UP, color=g (expect narrate positive)',mkspec({
  id:'n2',mark:'MarkPoint',values:n2rows,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'g',trait:'EncodingColor',type:'nominal'}},
}));
console.log('  ORACLE pooled pearson over all pts:',pearson(n2rows.map(r=>[r.x,r.y]))?.toFixed(4),'(both groups rise -> should narrate)');

// n=2 CONTRADICTION: group A up, group B down -> suppress
const n2c=[{x:1,y:10,g:'A'},{x:2,y:20,g:'A'},{x:1,y:20,g:'B'},{x:2,y:10,g:'B'}];
const an2c=show('R2b n=2 per-group CONTRADICTION (A up, B down) expect SUPPRESS undefined',mkspec({
  id:'n2c',mark:'MarkPoint',values:n2c,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'g',trait:'EncodingColor',type:'nominal'}},
}));

// ============ REGRESSION 3: rounded pearson n>=3 (non-aggregate, no partition -> early return) ============
const n3=[{x:1,y:2},{x:2,y:4.1},{x:3,y:5.9},{x:4,y:8.2},{x:5,y:9.8}];
const an3=show('R3 n=5 plain scatter no partition (early-return pooled) expect narrate ~0.999',mkspec({
  id:'n3',mark:'MarkPoint',values:n3,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'}},
}));
console.log('  ORACLE pooled pearson:',pearson(n3.map(r=>[r.x,r.y]))?.toFixed(4));

// ============ REGRESSION 4: max/min/total extrema on a bar chart ============
const barrows=[{cat:'A',v:30},{cat:'B',v:90},{cat:'C',v:10},{cat:'D',v:70}];
const abar=show('R4 vertical bar max/min/total (aggregate sum)',mkspec({
  id:'bar',mark:'MarkBar',values:barrows,
  enc:{x:{field:'cat',trait:'EncodingX',type:'nominal'},y:{field:'v',trait:'EncodingY',type:'quantitative',aggregate:'sum'}},
}));
console.log('  ORACLE total=',barrows.reduce((s,r)=>s+r.v,0),'max should be B/90, min C/10');

// ============ HUNT A: s163 OVER-SUPPRESSION — honest aggregate correlation silenced? ============
// y averaged, color=seg categorical partition, NO size. Both segments' DRAWN cells (per-x means)
// genuinely RISE, pooled rises. s163 groupingFields = [] here (no extra retinal), so classifier
// = per-x means = same as value. Should NARRATE (not over-suppress).
const honestAgg=[];
const pushH=(x,y,g,k)=>{for(let i=0;i<k;i++) honestAgg.push({x,y:y+i,seg:g});};
// seg A rises: x1->mean10, x2->mean20, x3->mean30 ; multiple raws per x (avg), no size
pushH(1,10,'A',3); pushH(2,20,'A',3); pushH(3,30,'A',3);
pushH(1,40,'B',3); pushH(2,50,'B',3); pushH(3,60,'B',3);
const aHonest=show('HUNT-A honest aggregate corr, color partition, per-x means rise both segs (expect NARRATE positive)',mkspec({
  id:'honest',mark:'MarkPoint',values:honestAgg,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor',type:'nominal'}},
}));
// oracle: per-x mean cells per seg
function perXmean(rs){const m=new Map();for(const r of rs){if(!m.has(r.x))m.set(r.x,[]);m.get(r.x).push(r.y);}return [...m.entries()].map(([x,ys])=>[x,ys.reduce((s,v)=>s+v,0)/ys.length]);}
const cellsAllH=[...perXmean(honestAgg.filter(r=>r.seg==='A')),...perXmean(honestAgg.filter(r=>r.seg==='B'))];
console.log('  ORACLE pooled over per-x-mean drawn cells:',pearson(cellsAllH)?.toFixed(4),'(both rise -> honest narrate)');

// ============ HUNT B: s163 OVER-SUPPRESSION with size present but honest ============
// size=sz quantitative present, but the size-keyed DRAWN cells honestly RISE within each seg AND pooled.
// s163 re-projects by size -> classifier should still agree -> NARRATE.
const honestSz=[];
const pushHS=(x,y,g,sz)=>honestSz.push({x,y,seg:g,sz});
// seg A: drawn cells rise with x regardless of size
pushHS(1,10,'A',5);pushHS(1,12,'A',6);pushHS(2,20,'A',5);pushHS(2,22,'A',6);pushHS(3,30,'A',5);pushHS(3,32,'A',6);
pushHS(1,40,'B',5);pushHS(1,42,'B',6);pushHS(2,50,'B',5);pushHS(2,52,'B',6);pushHS(3,60,'B',5);pushHS(3,62,'B',6);
const aHonestSz=show('HUNT-B honest corr WITH quant size, size-keyed cells rise (expect NARRATE positive, no over-suppress)',mkspec({
  id:'honestSz',mark:'MarkPoint',values:honestSz,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor',type:'nominal'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}},
}));
const drawnH=honestSz.map(r=>[r.x,r.y]); // each (x,sz) distinct within seg -> row-level
console.log('  ORACLE pooled over size-keyed drawn cells:',pearson(drawnH)?.toFixed(4),'(rise -> honest narrate)');

console.log('\n==== DONE ====');
