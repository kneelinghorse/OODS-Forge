// S164 v3 FINAL CRITIC — lens cascade_lattice.
// §10 gives TWO definitions of the granularity scan and calls them "equivalent":
//   (R1) "a sub-series is VOTABLE at the COARSEST S where it reaches n>=2"
//   (R2) "Equivalently: scan all S; collect every n>=2 sub-series"
// I claim they are NOT equivalent, and that the CORRECT algorithm is a THIRD one:
//   (R3) FINEST-votable: each finest (P u ALL grouping) drawn sub-series votes; a shredded one rolls
//        UP minimally until n>=2. (What the viewer actually sees as separable marks.)
// Two discriminator specs prove no single one of R1/R2 is sound on both.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const sgn = (pairs) => { const r = pearson(pairs); return r === null ? 'unk' : (r > 0.001 ? '+' : r < -0.001 ? '-' : '0'); };

function ladder(rows, label, pSign) {
  console.log(`\n==== ${label} (pooledSign=${pSign}) ====`);
  const pooled = pearson(rows.map(r => [r.x, r.y]));
  console.log('pooled(all drawn cells):', pooled?.toFixed(4), '->', sgn(rows.map(r => [r.x, r.y])));
  // enumerate the full subset lattice of grouping fields {g1,g2}
  const gfs = ['g1', 'g2'];
  const subsets = [[], ['g1'], ['g2'], ['g1', 'g2']];
  const votesR2 = [];
  for (const S of subsets) {
    const buckets = new Map();
    for (const r of rows) {
      const k = S.map(f => r[f]).join('|');
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push([r.x, r.y]);
    }
    for (const [k, pairs] of buckets) {
      const xs = new Set(pairs.map(p => p[0]));
      if (xs.size >= 2) {
        const s = sgn(pairs);
        votesR2.push(s);
        console.log(`  S={${S.join(',') || '(whole/P)'}} key=[${k}] n=${xs.size} dir=${s}`);
      }
    }
  }
  // R3 finest-votable: finest = (g1,g2); shredded rolls up minimally (drop g2, then g1, then whole)
  const finest = new Map();
  for (const r of rows) { const k = `${r.g1}|${r.g2}`; if (!finest.has(k)) finest.set(k, []); finest.get(k).push([r.x, r.y]); }
  const votesR3 = [];
  for (const [k, pairs] of finest) {
    const xs = new Set(pairs.map(p => p[0]));
    if (xs.size >= 2) votesR3.push(sgn(pairs));
    else {
      // roll up: drop g2 -> group by g1
      const g1 = k.split('|')[0];
      const roll = rows.filter(r => String(r.g1) === g1).map(r => [r.x, r.y]);
      if (new Set(roll.map(p => p[0])).size >= 2) votesR3.push(sgn(roll));
      else votesR3.push(sgn(rows.map(r => [r.x, r.y]))); // whole
    }
  }
  const opp = (v) => v.filter(s => s !== '0' && s !== 'unk' && s !== pSign);
  const setNonFlat = (v) => new Set(v.filter(s => s !== '0' && s !== 'unk'));
  const decide = (v) => (setNonFlat(v).size > 1 || opp(v).length > 0) ? 'SUPPRESS' : 'NARRATE';
  console.log(`  R2 (collect-all-subsets) votes: [${votesR2}] -> ${decide(votesR2)}`);
  console.log(`  R3 (finest-votable)        votes: [${votesR3}] -> ${decide(votesR3)}`);
  // R1 coarsest-votable: coarsest S that reaches n>=2 = S={} (whole/P group) if it has n>=2
  const wholeXs = new Set(rows.map(r => r.x));
  const votesR1 = wholeXs.size >= 2 ? [sgn(rows.map(r => [r.x, r.y]))] : votesR2;
  console.log(`  R1 (coarsest-votable=whole) votes: [${votesR1}] -> ${decide(votesR1)}`);
}

function specOf(rows) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    size: { field: 'g1', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'g2', trait: 'EncodingDetail', type: 'quantitative' },
  };
  return { $schema: 'x', id: 's', name: 's', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
}

// ---- SPEC 1: cascade_middle-style PHANTOM (P=seg categorical). Should SUPPRESS. ----
// (reuse the memo's fixture shape but here both grouping axes quant so P=empty; use color=seg for P)
const phantom = [];
let id = 0; const addP = (x, y, seg, g1) => { id++; phantom.push({ x, y, seg, g1, g2: id }); };
addP(1,160,'A',10); addP(2,80,'A',10); addP(3,260,'A',20); addP(4,180,'A',20);
addP(1,360,'B',10); addP(2,280,'B',10); addP(3,460,'B',20); addP(4,380,'B',20);
// For phantom, P=seg is a categorical partition; simulate within-P lattice over g1,g2. Show seg=A only.
console.log('######## SPEC 1: PHANTOM (should SUPPRESS) — within partition seg=A ########');
ladder(phantom.filter(r => r.seg === 'A'), 'seg=A: finest(g1,g2) shred, (g1) falls, whole rises', '+');

// ---- SPEC 2: HONEST all-rising multi-axis, NO categorical partition. Should NARRATE. ----
// Every finest (g1,g2) series RISES (+2). Pooled RISES. But coarse S={g1} for g1=A FALLS (local Simpson).
const honest = [
  { g1:'A', g2:'P', x:1, y:100 }, { g1:'A', g2:'P', x:2, y:102 },   // rise
  { g1:'A', g2:'Q', x:8, y:20  }, { g1:'A', g2:'Q', x:9, y:22  },   // rise ; S={g1=A} pools -> FALLS
  { g1:'B', g2:'P', x:1, y:10  }, { g1:'B', g2:'P', x:2, y:12  },   // rise
  { g1:'B', g2:'Q', x:8, y:500 }, { g1:'B', g2:'Q', x:9, y:502 },   // rise ; S={g1=B} RISES strongly
];
console.log('\n\n######## SPEC 2: HONEST multi-axis rise (should NARRATE) — P=empty ########');
const hs = specOf(honest);
const a = analyzeVizSpec(hs);
console.log('CURRENT SUT correlation (P=empty early-return):', a.correlation, '(honest = should stay defined+positive)');
ladder(honest, 'all 4 finest series RISE; pooled RISES; but coarse S={g1=A} FALLS', '+');
