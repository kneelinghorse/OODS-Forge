// S164 v3 FINAL-CRITIC lens dimensionless_rho.
// (1) Gray-zone: can a CLEARLY-FALLING-to-the-eye band have |pearson| < rho (~0.5)? If yes,
//     residual-1's claim "|r|<rho genuinely lacks a clear trend" is shaky.
// (2) n=2 manufacturing: full-lattice fine-slicing of an HONEST rising chart can create n=2
//     opposing pairs (noise / local dips). n=2 has NO rho gate (§10: "n=2 -> always"), so rho
//     feasibility does NOT protect keep-controls at n=2.
function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const P = (ys) => pearson(ys.map((y, i) => [i + 1, y]));

console.log('=== (1) gray-zone: monotone/near-monotone shapes a viewer reads as FALLING ===');
const shapes = {
  'cliff-at-end   [100x5,0]      ': [100,100,100,100,100,0],
  'cliff-at-start [100,0x5]      ': [100,0,0,0,0,0],
  'two-plateaus   [100x3,10x3]   ': [100,100,100,10,10,10],
  'monotone step  [100,99,50,49,2,1]': [100,99,50,49,2,1],
  'late-dropoff   [100,98,96,94,10]': [100,98,96,94,10],
  'perfect line   [100,80,60,40,20]': [100,80,60,40,20],
};
for (const [name, ys] of Object.entries(shapes)) {
  const r = P(ys);
  console.log(`  ${name} pearson=${r.toFixed(3)}  ${Math.abs(r) < 0.5 ? '<-- |r|<0.5: BELOW rho, would NOT vote (narrates phantom)' : ''}`);
}

console.log('\n=== (2) n=2 manufacturing in an HONEST rising multi-axis chart ===');
// Honest chart: pooled STRONGLY rising. color=seg (partition, categorical), size + shape (2 grouping axes).
// Most fine (seg,size,shape) sub-series rise. ONE fine sub-series is a 2-point NOISE dip in otherwise-rising data.
const rows = [];
const add = (x, y, seg, sz, sh) => rows.push({ x, y, seg, sz, sh });
// seg A, honest rise, many n>=3 bands
add(1,10,'A',1,'o'); add(2,20,'A',1,'o'); add(3,30,'A',1,'o');
add(1,12,'A',2,'o'); add(2,22,'A',2,'o'); add(3,32,'A',2,'o');
// seg A, one FINE band that is only n=2 and noise-tilts DOWN (a tiny local dip amid the rise)
add(4,41,'A',3,'sq'); add(5,40,'A',3,'sq');   // <-- n=2, slope DOWN by 1 (noise)
// seg B, honest rise
add(1,50,'B',1,'o'); add(2,60,'B',1,'o'); add(3,70,'B',1,'o');
add(4,80,'B',2,'sq'); add(5,90,'B',2,'sq'); add(6,100,'B',2,'sq');
const pooled = pearson(rows.map(r => [r.x, r.y]));
console.log('pooled pearson =', pooled.toFixed(4), '(pooledSign=', Math.sign(pooled), ') -- STRONGLY rising, honest');
// hand-sim full-lattice: enumerate every (P ∪ S) sub-series with n>=2 distinct x, per §10 "collect every n>=2 sub-series"
const groupingFields = ['sz', 'sh'];
const partitionField = 'seg';
const subsets = [[], ['sz'], ['sh'], ['sz', 'sh']];
const E = [];
for (const S of subsets) {
  const keyFields = [partitionField, ...S];
  const groups = new Map();
  for (const r of rows) {
    const k = keyFields.map(f => r[f]).join('|');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push([r.x, r.y]);
  }
  for (const [k, pairs] of groups) {
    const xs = new Set(pairs.map(p => p[0]));
    if (xs.size < 2) continue; // n<2 distinct x
    const n = pairs.length;
    const r = pearson(pairs);
    let vote;
    if (n === 2) vote = Math.sign(pairs.sort((a,b)=>a[0]-b[0])[1][1] - pairs[0][1]); // n=2 slope sign, NO rho gate
    else vote = Math.abs(r) >= 0.5 ? Math.sign(r) : 0; // n>=3: rho gate at 0.5
    const opposes = vote === -Math.sign(pooled);
    if (vote !== 0) E.push(vote);
    console.log(`  S={${S.join(',')||'∅'}} group ${k}: n=${n} r=${r===null?'null':r.toFixed(3)} vote=${vote}${opposes?'  <== OPPOSES pooled (n=2 no rho gate)':''}`);
  }
}
const suppress = new Set(E).size > 1 || E.some(e => e === -Math.sign(pooled));
console.log('\nE (non-flat votes) =', JSON.stringify(E));
console.log('>>> HAND-SIM v3 G1:', suppress ? 'SUPPRESS (undefined) -- OVER-SUPPRESSES an honest rising chart' : 'NARRATE');
