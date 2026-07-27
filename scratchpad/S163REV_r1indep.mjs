// INDEPENDENT reviewer variant (R1) — DIFFERENT constants from the template.
// Goal: (A) re-reproduce the s162 size-axis Simpson and confirm s163 SUPPRESSES it,
//       (B) confirm the size-REMOVED control still narrates (not over-suppressed),
//       (C) confirm an HONEST size chart (within-partition cells genuinely rise) STILL narrates.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
function perXmeans(rs){ const m=new Map(); for(const r of rs){ if(!m.has(r.x)) m.set(r.x,[]); m.get(r.x).push(r.y);}
  return [...m.entries()].map(([x,ys])=>[x, ys.reduce((s,v)=>s+v,0)/ys.length]); }

function mkSpec(rows, withSize, id){
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              color:{field:'seg',trait:'EncodingColor'} };
  if(withSize) enc.size={field:'sz',trait:'EncodingSize',type:'quantitative'};
  return { $schema:'https://oods.dev/viz-spec/v1', id, name:id,
    data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}

// ============ (A) SIZE-SIMPSON with DIFFERENT constants ============
// Within each seg the SIZE-KEYED drawn cells FALL; the x-COLLAPSED (size-merged) per-x means RISE;
// pooled over all drawn cells RISES. Distinct sz => each row is its own drawn cell under avg.
// seg P: (10,5)x1, (20,90)x1, (30,8)x50   seg Q: (40,250)x1, (50,330)x1, (60,255)x50
const rowsA=[];
const push=(x,y,g,k,base)=>{for(let i=0;i<k;i++) rowsA.push({x,y,seg:g,sz:base+x*1000+i});};
push(10,5,'P',1,0); push(20,90,'P',1,0); push(30,8,'P',50,0);
push(40,250,'Q',1,500000); push(50,330,'Q',1,500000); push(60,255,'Q',50,500000);
const specA=mkSpec(rowsA,true,'szSimpson');

console.log('=== (A) SIZE-SIMPSON (different constants) ===');
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(specA)));
const a=analyzeVizSpec(specA);
console.log('SUT analysis.correlation:', a.correlation, '   <- EXPECT undefined (suppressed)');
console.log('SUT summary:', generateNarrativeSummary(specA).summary);

const cellsP=rowsA.filter(r=>r.seg==='P').map(r=>[r.x,r.y]);
const cellsQ=rowsA.filter(r=>r.seg==='Q').map(r=>[r.x,r.y]);
const cellsAllA=rowsA.map(r=>[r.x,r.y]);
console.log('-- hand oracle over the DRAWN (size-keyed) cells the narrated VALUE pools over --');
console.log('  seg P pearson (size-keyed):', pearson(cellsP)?.toFixed(4), '(within-partition drawn cells)');
console.log('  seg Q pearson (size-keyed):', pearson(cellsQ)?.toFixed(4), '(within-partition drawn cells)');
console.log('  POOLED over all size-keyed drawn cells:', pearson(cellsAllA)?.toFixed(4), '(the number the OLD code narrated)');
console.log('-- hand oracle over x-COLLAPSED (size merged) per-x means [what s162 gate saw] --');
console.log('  seg P per-x-mean pearson:', pearson(perXmeans(rowsA.filter(r=>r.seg==='P')))?.toFixed(4));
console.log('  seg Q per-x-mean pearson:', pearson(perXmeans(rowsA.filter(r=>r.seg==='Q')))?.toFixed(4));
console.log('  => size-keyed cells FALL but x-collapse RISES + pooled RISES => a Simpson lie; correct verdict = SUPPRESS');

// ============ (B) size-REMOVED control — must still narrate (not over-suppressed) ============
const specB=mkSpec(rowsA,false,'szRemoved');
const b=analyzeVizSpec(specB);
console.log('\n=== (B) SIZE-REMOVED control (same data, no size channel) ===');
console.log('SUT correlation:', b.correlation, '   <- EXPECT a DEFINED honest number (chart now draws per-x means)');

// ============ (C) HONEST size chart — within-partition cells genuinely RISE — must NARRATE ============
// seg P: (10,5)x1,(20,90)x1,(30,300)x50   seg Q: (40,250)x1,(50,330)x1,(60,600)x50  (rise everywhere)
const rowsC=[];
const push2=(x,y,g,k,base)=>{for(let i=0;i<k;i++) rowsC.push({x,y,seg:g,sz:base+x*1000+i});};
push2(10,5,'P',1,0); push2(20,90,'P',1,0); push2(30,300,'P',50,0);
push2(40,250,'Q',1,500000); push2(50,330,'Q',1,500000); push2(60,600,'Q',50,500000);
const specC=mkSpec(rowsC,true,'szHonest');
const c=analyzeVizSpec(specC);
const cP=rowsC.filter(r=>r.seg==='P').map(r=>[r.x,r.y]), cQ=rowsC.filter(r=>r.seg==='Q').map(r=>[r.x,r.y]);
console.log('\n=== (C) HONEST size chart (within-partition size-keyed cells RISE) ===');
console.log('  seg P size-keyed pearson:', pearson(cP)?.toFixed(4), ' seg Q size-keyed pearson:', pearson(cQ)?.toFixed(4), '(both RISE)');
console.log('  POOLED size-keyed:', pearson(rowsC.map(r=>[r.x,r.y]))?.toFixed(4));
console.log('SUT correlation:', c.correlation, '   <- EXPECT a DEFINED number (honest, must NOT be over-suppressed)');
