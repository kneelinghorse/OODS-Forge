// RE-CRITIC lens = contradiction_reg. Attack the CASE6 pin + G1 pooledSign===0 blind spot.
// CASE6 (memo §8 F3): "quant-grouping opposing-bands, pooled≈0 → undefined" — a REGRESSION PIN.
// v2 §10: sub-series OPPOSES iff sign(slope) === -pooledSign AND |Δ| >= τ·range.
// If pooled rounds to 0, pooledSign = signOf(0) = 0, and -pooledSign = 0. A REAL band slope is ±1,
// never 0, so NO band can "oppose". G1 cannot fire. Does the algorithm still reach `undefined`?
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

function specOf(rows, enc, mark, id) {
  return { $schema: 'https://oods.dev/viz-spec/v1', id, name: id,
    data: { name: 'd', values: rows }, marks: [{ trait: mark, encodings: enc }], encoding: enc,
    a11y: { description: 'y over x' } };
}
function run(label, rows, enc, mark) {
  const spec = specOf(rows, enc, mark, label);
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log(`\n=== ${label} (${mark}) ===`);
  console.log('  channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  SUT correlation:', a.correlation);
  console.log('  summary:', summary);
  console.log('  keyFindings:', JSON.stringify(keyFindings));
  return a.correlation;
}

// ---------- CASE6: size-only (partition=[]) opposing bands, pooled == 0 ----------
// band sz=1 RISES, band sz=2 FALLS; pooled pearson over the 6 drawn cells == 0 exactly.
const case6 = [];
const add6 = (x, y, sz) => case6.push({ x, y, sz });
add6(1, 1, 1); add6(2, 2, 1); add6(3, 3, 1);   // sz=1 rises
add6(1, 3, 2); add6(2, 2, 2); add6(3, 1, 2);   // sz=2 falls
const enc6 = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' }, // quant -> grouping, NOT partition
};
console.log('POOLED over 6 cells:', pearson(case6.map(r => [r.x, r.y]))); // expect 0
console.log('band sz=1 pearson:', pearson(case6.filter(r=>r.sz===1).map(r=>[r.x,r.y])));
console.log('band sz=2 pearson:', pearson(case6.filter(r=>r.sz===2).map(r=>[r.x,r.y])));
const c6 = run('CASE6_sizeonly_opposing_pooled0', case6, enc6, 'MarkPoint');

// ---------- CASE6b: pooled SLIGHTLY positive but a STRONG band falls, size-only ----------
// This is the more dangerous variant: pooledSign = +1, one band falls hard (opposes), one rises hard.
// G1 CAN fire here (sign(slope)=-1 === -pooledSign). Included as contrast to prove the 0 case is the hole.
const c6b = [];
const addb = (x, y, sz) => c6b.push({ x, y, sz });
addb(1, 1, 1); addb(2, 2, 1); addb(3, 3, 1);       // rises
addb(1, 2.9, 2); addb(2, 2, 2); addb(3, 1.2, 2);   // falls (slightly less steep so pooled tips +)
console.log('\nCASE6b POOLED:', pearson(c6b.map(r => [r.x, r.y])));
run('CASE6b_sizeonly_pooled_slightpos', c6b, enc6, 'MarkPoint');

// ---------- Control: same opposing bands as a CATEGORICAL color partition (G0 should catch) ----------
const catRows = case6.map(r => ({ x: r.x, y: r.y, seg: r.sz === 1 ? 'A' : 'B' }));
const encCat = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' }, // categorical -> ACTIVE partition
};
run('CTRL_categorical_opposing_pooled0', catRows, encCat, 'MarkPoint');

console.log('\n################ VERDICT ################');
console.log('CASE6 size-only pooled0 -> SUT corr =', c6, '(memo pins UNDEFINED; if a number, phantom "weak" narrated)');
