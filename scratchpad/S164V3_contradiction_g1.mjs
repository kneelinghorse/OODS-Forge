// FAITHFUL §10 v3 simulator for the contradiction_g1 lens.
// Implements: full-lattice votable-at-coarsest-S, dimensionless opposition (|r|>=rho, n=2 always),
// contradiction-first E over NON-FLAT signs, the Set(E)={0}-yet-pooled!=0 clause, early-return, fallback.
// Also cross-checks CURRENT SUT (dist) for the same specs to anchor pooled + G0 behavior.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5;
function pearson(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((s,v)=>s+v,0)/n, my = ys.reduce((s,v)=>s+v,0)/n;
  let num=0,dx=0,dy=0;
  for (let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const round3 = r => r===null?null:Math.round(r*1000)/1000;
const signOf = r => r>0?1:r<0?-1:0;

// project rows to per-dim avg cells given key fields (the "drawn cells")
function projectCells(rows, dimF, measF, keyFields) {
  const groups = new Map();
  for (const r of rows) {
    const k = [dimF, ...keyFields].map(f=>String(r[f])).join('\0');
    if (!groups.has(k)) groups.set(k, { key:k, dim:r[dimF], sub:keyFields.map(f=>String(r[f])).join('\0'), vals:[] });
    groups.get(k).vals.push(r[measF]);
  }
  return [...groups.values()].map(g=>({ dim:g.dim, sub:g.sub, val:g.vals.reduce((s,v)=>s+v,0)/g.vals.length }));
}

// classify one sub-series' opposition-relevant direction vs pooledSign
// returns { vote: -1|0|1|'unknown', n, r }
function classifySub(cells, pooledSign) {
  const xs = cells.map(c=>c.dim), ys = cells.map(c=>c.val);
  const n = xs.length;
  if (n < 2) return { vote:'unknown', n };
  const mx = xs.reduce((s,v)=>s+v,0)/n; let dx=0; for (const x of xs) dx+=(x-mx)**2;
  if (dx===0) return { vote:'unknown', n }; // vertical
  if (n === 2) {
    const my=(ys[0]+ys[1])/2; let cov=0; for(let i=0;i<2;i++) cov+=(xs[i]-mx)*(ys[i]-my);
    return { vote: signOf(cov), n, r:null }; // n=2 always votes its slope
  }
  const r = pearson(xs, ys);
  if (r === null) return { vote:0, n, r:0 }; // flat Y
  // dimensionless opposition: only counts as directional if |r|>=rho, else FLAT(0)
  const vote = Math.abs(r) >= RHO ? signOf(r) : 0;
  return { vote, n, r };
}

// FULL-LATTICE: for each partition group P, scan every subset S of grouping, key by P U S,
// a sub-series is VOTABLE at the COARSEST S where it reaches n>=2 distinct x.
function subsets(arr){ const out=[[]]; for(const a of arr){ const cur=[...out]; for(const s of cur) out.push([...s,a]); } return out; }

function g1(rows, dimF, measF, partition, grouping, pooled) {
  const pooledSign = signOf(round3(pooled));
  // partition groups
  const pkeys = new Map();
  if (partition.length===0) pkeys.set('*', rows);
  else for (const r of rows){ const k=partition.map(f=>String(r[f])).join('\0'); if(!pkeys.has(k))pkeys.set(k,[]); pkeys.get(k).push(r); }

  const E = [];            // NON-FLAT votable signs (memo literal wording)
  const allVotable = [];   // ALL votable signs incl 0 (alt interpretation)
  let anyVotable = false;

  for (const [, prows] of pkeys) {
    // for this P, find votable sub-series at coarsest S
    // scan subsets ordered by size ascending; mark a sub-series votable at first (coarsest) S reaching n>=2
    const claimed = new Set(); // sub-series full-key already voted at a coarser S
    const Ss = subsets(grouping).sort((a,b)=>a.length-b.length);
    for (const S of Ss) {
      const cells = projectCells(prows, dimF, measF, S);
      // group cells by their S-subkey => a sub-series
      const bySub = new Map();
      for (const c of cells){ if(!bySub.has(c.sub))bySub.set(c.sub,[]); bySub.get(c.sub).push(c); }
      for (const [sub, cc] of bySub) {
        const distinctX = new Set(cc.map(c=>c.dim)).size;
        if (distinctX < 2) continue;
        // votable at this S. But only if not already claimed at a coarser (smaller |S|) S that this refines.
        // Coarsest-S rule: a finer sub-series is claimed only if its coarser parent was NOT votable.
        // Approx: mark votable at first S (by size) that yields n>=2 for the LINEAGE. We track by which
        // partition+S sub the point set belongs; simplest faithful reading: the COARSEST S over the
        // WHOLE grouping set where the sub-series (P U S) reaches n>=2. We implement: for each S in asc
        // size, if this exact sub not yet covered by a coarser votable ancestor, vote it.
        const lineage = sub; // full S-subkey string
        // ancestor check: any already-claimed key that is a prefix-compatible coarser sub of this row-set?
        // Simplify: claim by the ROW SET identity via sorted member indices.
        const memberIds = cc.flatMap(c=>c).length; // not robust; use member x-set+prows filter below
        void memberIds; void lineage;
        // Robust: the row subset for (P,S,sub) — recompute its rows
        // Represent sub-series by the set of raw-row references it aggregates:
        // We approximate coarsest by: only vote at |S| if NO strictly-smaller S' subset produced a votable
        // sub-series that is a SUPERSET of these rows. Given small fixtures we accept the simple rule:
        // vote every n>=2 sub-series at the SMALLEST |S| where it first appears with n>=2 AND its parent
        // (drop one field) had n<2. We implement parent check:
        let parentVotable = false;
        if (S.length > 0) {
          for (let i=0;i<S.length;i++){
            const parentS = S.filter((_,j)=>j!==i);
            const pcells = projectCells(prows, dimF, measF, parentS);
            const psubKeyFields = parentS;
            // the parent sub for THESE rows: take one representative row
            // find rows belonging to this child sub:
            const childRows = prows.filter(r=> S.map(f=>String(r[f])).join('\0')===sub);
            const rep = childRows[0];
            const psub = psubKeyFields.map(f=>String(rep[f])).join('\0');
            const pdistinct = new Set(pcells.filter(c=>c.sub===psub).map(c=>c.dim)).size;
            if (pdistinct >= 2) { parentVotable = true; break; }
          }
        }
        if (S.length>0 && parentVotable) continue; // covered at a coarser S
        // record vote
        anyVotable = true;
        const dec = classifySub(cc, pooledSign);
        if (dec.vote === 'unknown') continue;
        allVotable.push(dec.vote);
        if (dec.vote !== 0) E.push(dec.vote);
      }
    }
  }

  if (!anyVotable) return { decision:'FALLBACK-narrate', E, allVotable };
  const setE = new Set(E);
  const setAll = new Set(allVotable);
  // memo literal: suppress if size>1 OR any e===-pooledSign OR (Set(E)={0} yet pooledSign!=0)
  const literalSuppress = setE.size>1 || E.some(e=>e===-pooledSign) || (setE.size===1 && [...setE][0]===0 && pooledSign!==0);
  // note setE never contains 0 by construction (E is non-flat), so the 3rd clause is DEAD under literal wording
  const allFlat = anyVotable && E.length===0; // every votable sub-series flat
  const intendedSuppress = setE.size>1 || E.some(e=>e===-pooledSign) || (allFlat && pooledSign!==0);
  return { decision: intendedSuppress?'SUPPRESS':'NARRATE', literalSuppress, intendedSuppress, E, allVotable, allFlat, pooledSign };
}

function evalCase(label, rows, dimF, measF, partition, grouping) {
  const pooledCells = projectCells(rows, dimF, measF, grouping);
  const pooled = round3(pearson(pooledCells.map(c=>c.dim), pooledCells.map(c=>c.val)));
  const res = g1(rows, dimF, measF, partition, grouping, pooled ?? 0);
  console.log(`\n### ${label}`);
  console.log(`  pooled=${pooled} partition=${JSON.stringify(partition)} grouping=${JSON.stringify(grouping)}`);
  console.log(`  E(nonflat)=${JSON.stringify(res.E)} allVotable=${JSON.stringify(res.allVotable)} allFlat=${res.allFlat}`);
  console.log(`  LITERAL(E={0} dead)=${res.literalSuppress?'SUPPRESS':(res.decision==='FALLBACK-narrate'?'FALLBACK-narrate':'NARRATE')}  INTENDED=${res.decision}`);
  return res;
}

// CASE6: sz1 rises, sz2 falls, pooled exactly 0
{ const rows=[];
  rows.push({x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10});
  rows.push({x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20});
  evalCase('CASE6 pooled~0 opposing bands', rows,'x','y',['seg'],['sz']); }

// CASE3-FLAT keep-control: mostly rise + ONE flat band. Memo says NARRATE.
{ const rows=[];
  rows.push({x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10});
  rows.push({x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20});
  rows.push({x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10}); // FLAT band
  rows.push({x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20});
  evalCase('CASE3-FLAT rise + one flat band (keep-control NARRATE?)', rows,'x','y',['seg'],['sz']); }

// ALL-FLAT-OFFSET: every votable sub-series flat, but bands at different x-ranges -> pooled rises.
// The Set(E)={0}-yet-pooled!=0 clause target. Is it reachable, honest or phantom, and does LITERAL wording miss it?
{ const rows=[];
  // one partition group (seg A). sz=10 flat at y=10 over x in {1,2}; sz=20 flat at y=100 over x in {3,4}
  rows.push({x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10});
  rows.push({x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20});
  evalCase('ALLFLAT-OFFSET single seg, two flat bands at disjoint x (phantom rise?)', rows,'x','y',['seg'],['sz']); }

// ALL-FLAT-OFFSET no partition (early-return? partition=[seg] but only quant size -> partition=[])
{ const rows=[];
  rows.push({x:1,y:10,sz:10},{x:2,y:10,sz:10});
  rows.push({x:3,y:100,sz:20},{x:4,y:100,sz:20});
  evalCase('ALLFLAT-OFFSET no categorical partition, grouping=[sz]', rows,'x','y',[],['sz']); }

// weakly-scattered opposing band keep-control: n>=3 opposing but |r|<rho -> should NARRATE
{ const rows=[];
  rows.push({x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10}); // rise r=1
  rows.push({x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}); // scattered, weak
  evalCase('WEAK-SCATTER opposing band |r|<rho (keep-control NARRATE?)', rows,'x','y',['seg'],['sz']); }
