// Probe the G1 all-flat clause "(Set(E)={0} yet pooledSign!=0)" for TWO problems:
//  (P1) wording: E is defined as NON-FLAT signs, so Set(E) can NEVER be {0} -> DEAD as written.
//  (P2) intent (E empty & pooled!=0): does it OVER-suppress an HONEST no-grouping chart whose partition
//       groups all WEAKLY-but-consistently trend WITH the pooled sign (|r|<rho -> ρ-flattened -> E empty)?
//       s163/G0 NARRATES it (rounded-pearson sign, no rho). => byte-identical (§8 F3) BROKEN + over-suppress.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5;
function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;const signOf=r=>r>0?1:r<0?-1:0;

// A no-grouping spec (categorical color partition, NO quantitative retinal channel -> groupingFields=[]).
// 3 color groups, each WEAKLY rises (|r|~0.3<RHO), consistent direction; pooled rises.
function makeWeakConsistent(){
  const rows=[];
  // group G1: x1..x4 noisy rise, |r| moderate-low
  const g=(seg,base)=>{rows.push({x:1,y:base+0,seg},{x:2,y:base+3,seg},{x:3,y:base-1,seg},{x:4,y:base+4,seg});};
  g('R',0); g('S',100); g('T',200); // between-group offset lifts pooled
  return rows;
}
const rows=makeWeakConsistent();
// per-partition pearson
console.log('=== no-grouping weak-consistent (color=seg categorical, NO quant channel) ===');
for(const seg of['R','S','T']){const sub=rows.filter(r=>r.seg===seg);const r=pearson(sub.map(s=>s.x),sub.map(s=>s.y));console.log(`  partition ${seg}: r=${r.toFixed(3)} -> G0 sign(round3)=${signOf(round3(r))}  G1 rho-vote(|r|>=${RHO}?)=${Math.abs(r)>=RHO?signOf(r):0}`);}
const pooled=round3(pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
console.log('  pooled=',pooled,'pooledSign=',signOf(pooled));

// G0 (s163 narratableCorrelation over partition classes, rounded sign, NO rho):
function classifyG0(sub){const xs=sub.map(s=>s.x),ys=sub.map(s=>s.y),n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return signOf(c);}const r=pearson(xs,ys);return r===null?0:signOf(round3(r));}
const g0classes=['R','S','T'].map(seg=>classifyG0(rows.filter(r=>r.seg===seg)));
function narratableG0(pooled,classes){const ev=classes.filter(c=>c!=='unknown');if(!ev.length)return true;if(new Set(ev).size>1)return false;const s=ev[0],ps=signOf(pooled);if(s===0)return ps===0;return ps===0||ps===s;}
const g0decision=narratableG0(pooled,g0classes)?'NARRATE':'SUPPRESS';
console.log('  G0 classes=',JSON.stringify(g0classes),'-> G0',g0decision,'(= s163 behavior)');

// G1 (rho-flattened): E = non-flat signs
const g1votes=['R','S','T'].map(seg=>{const sub=rows.filter(r=>r.seg===seg);const r=pearson(sub.map(s=>s.x),sub.map(s=>s.y));return Math.abs(r)>=RHO?signOf(r):0;});
const E=g1votes.filter(v=>v!==0);
const allFlat=E.length===0;
const g1suppress=(new Set(E).size>1)||E.some(e=>e===-signOf(pooled))||(allFlat&&signOf(pooled)!==0);
console.log('  G1 votes=',JSON.stringify(g1votes),'E(nonflat)=',JSON.stringify(E),'allFlat=',allFlat);
console.log('  G1 all-flat clause fires?',(allFlat&&signOf(pooled)!==0),'-> G1',g1suppress?'SUPPRESS':'NARRATE');
console.log('\n  RESULT (G0 OR G1 suppress):',(g0decision==='SUPPRESS'||g1suppress)?'SUPPRESS':'NARRATE');
console.log('  s163 (G0 only):',g0decision);
console.log('  >> byte-identical to s163?',((g0decision==='SUPPRESS'||g1suppress)?'SUPPRESS':'NARRATE')===g0decision);

// Cross-check CURRENT SUT (s163) on the real spec to confirm s163 NARRATES it:
const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};
const spec={$schema:'x',id:'s',name:'s',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'x'}};
console.log('\n  CURRENT SUT (s163 dist) correlation:',analyzeVizSpec(spec).correlation,'(if defined -> s163 NARRATES; v3 G1 would suppress => regression)');
