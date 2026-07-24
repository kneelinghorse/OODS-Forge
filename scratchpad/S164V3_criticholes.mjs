// FINAL-CRITIC probe: two holes in §10 v3.
// HOLE-1: "votable at the COARSEST S where it reaches n>=2" (§10) vs "collect EVERY n>=2 sub-series"
//         are NON-equivalent. The coarsest reading makes S=∅ (the whole partition group aggregated
//         over x) CLAIM the group, so finer opposing bands are NEVER evaluated. Re-opens CASE6 +
//         skeptic_detail (defect 1). The planning agent's OWN simulator implemented coarsest -> phantom.
// HOLE-2: the S=∅ whole-group aggregate MANUFACTURES a +1 from pure between-band OFFSET when the group
//         spans disjoint x-ranges per band (all bands FLAT). That +1 enters E, so clause-3
//         (Set(E)={0} yet pooled!=0) NEVER fires. All-flat-offset-on-size narrates under BOTH readings.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5;
function pearson(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((s,v)=>s+v,0)/n, my = ys.reduce((s,v)=>s+v,0)/n;
  let num=0,dx=0,dy=0;
  for (let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const r3 = r => r===null?null:Math.round(r*1000)/1000;
const sgn = r => r>0?1:r<0?-1:0;

function projectCells(rows, dimF, measF, keyFields) {
  const g = new Map();
  for (const r of rows) {
    const k = [dimF, ...keyFields].map(f=>String(r[f])).join('|');
    if (!g.has(k)) g.set(k, { dim:r[dimF], sub:keyFields.map(f=>String(r[f])).join('|'), vals:[] });
    g.get(k).vals.push(r[measF]);
  }
  return [...g.values()].map(o=>({ dim:o.dim, sub:o.sub, val:o.vals.reduce((s,v)=>s+v,0)/o.vals.length }));
}
function classifySub(cells) {
  const xs=cells.map(c=>c.dim), ys=cells.map(c=>c.val), n=xs.length;
  if (n<2) return 'unknown';
  const mx=xs.reduce((s,v)=>s+v,0)/n; let dx=0; for(const x of xs)dx+=(x-mx)**2;
  if (dx===0) return 'unknown';
  if (n===2){ const my=(ys[0]+ys[1])/2; let cov=0; for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my); return sgn(cov); }
  const r=pearson(xs,ys); if(r===null)return 0; return Math.abs(r)>=RHO?sgn(r):0;
}
const subsets = arr => { let out=[[]]; for(const a of arr){ const c=[...out]; for(const s of c) out.push([...s,a]); } return out; };

// READING A (coarsest): a sub-series votes only at coarsest S; if a coarser parent-S sub is votable, skip.
// READING B (collect-every): every distinct (P U S)-keyed n>=2 sub-series at every S votes.
function g1(rows, dimF, measF, partition, grouping) {
  const pooledCells = projectCells(rows, dimF, measF, grouping);
  const pooledSign = sgn(r3(pearson(pooledCells.map(c=>c.dim), pooledCells.map(c=>c.val))));
  const pkeys = new Map();
  if (partition.length===0) pkeys.set('*', rows);
  else for(const r of rows){ const k=partition.map(f=>String(r[f])).join('|'); if(!pkeys.has(k))pkeys.set(k,[]); pkeys.get(k).push(r); }
  const Ea=[], Eb=[]; let anyA=false, anyB=false;
  for (const [,prows] of pkeys) {
    const Ss = subsets(grouping).sort((a,b)=>a.length-b.length);
    for (const S of Ss) {
      const cells = projectCells(prows, dimF, measF, S);
      const bySub = new Map();
      for (const c of cells){ if(!bySub.has(c.sub))bySub.set(c.sub,[]); bySub.get(c.sub).push(c); }
      for (const [sub, cc] of bySub) {
        if (new Set(cc.map(c=>c.dim)).size < 2) continue;
        const vote = classifySub(cc);
        // READING B: always collect
        anyB=true; if(vote!=='unknown' && vote!==0) Eb.push(vote); else if(vote===0) Eb.push('flat');
        // READING A: skip if a coarser parent-S sub (one field dropped) is votable
        let parentVotable=false;
        if (S.length>0){
          for(let i=0;i<S.length;i++){
            const pS=S.filter((_,j)=>j!==i);
            const childRows=prows.filter(r=>S.map(f=>String(r[f])).join('|')===sub);
            const rep=childRows[0];
            const psub=pS.map(f=>String(rep[f])).join('|');
            const pc=projectCells(prows,dimF,measF,pS);
            if(new Set(pc.filter(c=>c.sub===psub).map(c=>c.dim)).size>=2){parentVotable=true;break;}
          }
        }
        if (S.length>0 && parentVotable) continue;
        anyA=true; if(vote!=='unknown' && vote!==0) Ea.push(vote); else if(vote===0) Ea.push('flat');
      }
    }
  }
  const decide = (E, any) => {
    if(!any) return 'FALLBACK-narrate';
    const nf = E.filter(e=>e!=='flat');
    const setNF = new Set(nf);
    const allFlat = nf.length===0;
    if (setNF.size>1) return 'SUPPRESS(size>1)';
    if (nf.some(e=>e===-pooledSign)) return 'SUPPRESS(opposite)';
    if (allFlat && pooledSign!==0) return 'SUPPRESS(allflat)';
    return 'NARRATE';
  };
  return { pooledSign, Ea, Eb, A:decide(Ea,anyA), B:decide(Eb,anyB) };
}

function run(label, rows, enc, partition, grouping, expect) {
  const spec = { $schema:'x', id:'s', name:label, data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint', encodings:enc}], encoding:enc, a11y:{description:'x'} };
  const a = analyzeVizSpec(spec);
  const { summary } = generateNarrativeSummary(spec);
  const res = g1(rows, 'x', 'y', partition, grouping);
  console.log(`\n### ${label}  (want ${expect})`);
  console.log(`  CURRENT SUT corr=${a.correlation}  | ${summary}`);
  console.log(`  pooledSign=${res.pooledSign} partition=${JSON.stringify(partition)} grouping=${JSON.stringify(grouping)}`);
  console.log(`  Ea(coarsest)=${JSON.stringify(res.Ea)} -> v3 READING A: ${res.A}`);
  console.log(`  Eb(collect) =${JSON.stringify(res.Eb)} -> v3 READING B: ${res.B}`);
}

// ---- CASE6: sz10 rises, sz20 falls, pooled=0. Memo: RED-first (suppress). ----
{ const rows=[
  {x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},
  {x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}];
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  run('CASE6 pooled=0 opposing bands', rows, enc, ['seg'], ['sz'], 'SUPPRESS'); }

// ---- skeptic_detail analog (defect 1): partition=seg, size bands all FALL r=-1, pooled RISES. ----
{ const rows=[
  {x:1,y:100,seg:'A',sz:10},{x:2,y:90,seg:'A',sz:10},{x:3,y:80,seg:'A',sz:10},     // segA sz10 FALLS
  {x:1,y:400,seg:'A',sz:20},{x:2,y:390,seg:'A',sz:20},{x:3,y:380,seg:'A',sz:20},   // segA sz20 FALLS (offset up)
  {x:1,y:700,seg:'B',sz:10},{x:2,y:690,seg:'B',sz:10},{x:3,y:680,seg:'B',sz:10},   // segB sz10 FALLS
  {x:1,y:1000,seg:'B',sz:20},{x:2,y:990,seg:'B',sz:20},{x:3,y:980,seg:'B',sz:20}]; // segB sz20 FALLS
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  run('SKEPTIC_DETAIL analog: all size-bands FALL r=-1, partition-level seg RISES', rows, enc, ['seg'], ['sz'], 'SUPPRESS'); }

// ---- HOLE-2 all-flat-offset on size, single categorical group, disjoint x per band ----
{ const rows=[
  {x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},           // sz10 FLAT at x in {1,2}
  {x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}];        // sz20 FLAT at x in {3,4}
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  run('ALLFLAT-OFFSET(size) both bands FLAT, aggregate rises', rows, enc, ['seg'], ['sz'], 'SUPPRESS(clause3)'); }
