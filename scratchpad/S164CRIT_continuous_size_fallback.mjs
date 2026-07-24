// S164 pre-lock critic — the FALLBACK hole under a CONTINUOUS quant grouping axis.
// The reproduced survivors use size in {10,20} / detail in {1,2} -> (seg,band) has n>=2, so the
// draft's FULL-KEY decomposition catches them. But §4 claims the CLASS "categorical-partition +
// quantitative-grouping-axis Simpson" is CLOSED. This probe makes the SAME seg-Simpson but with a
// CONTINUOUS (all-distinct) size -> every (seg,sz) full-key sub-series is n=1 -> the draft's
// "fallback when EVERY sub-series n<2" fires -> narrate the pooled Simpson. The viewer still sees
// TWO color=seg series that FALL. Hand-sim the draft below.
import {
  analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// seg A and seg B each FALL across x; size confounds with x (bigger size at bigger x) and carries the
// between-band lift -> pooled RISES. size is ALL-DISTINCT (continuous magnitude, e.g. revenue).
const rows = [];
let szctr = 0;
for (const seg of ['A', 'B']) {
  // within seg: as x goes 1->2->3, y FALLS; but size grows with x and pushes the between offset up
  const offs = seg === 'A' ? 0 : 2;
  rows.push({ x: 1, y: 100 + offs, seg, sz: ++szctr * 1.0 });   // small size, high y
  rows.push({ x: 2, y: 60 + offs,  seg, sz: ++szctr * 10.0 });  // medium
  rows.push({ x: 3, y: 30 + offs,  seg, sz: ++szctr * 100.0 }); // large size, low y... wait need pooled to rise
}
// The above falls in y as x rises within each seg. To get a POOLED rise we need y to correlate + with x
// ACROSS the pooled cloud. Let me instead confound: high size -> high y, and size grows across BANDS not x.
// Rebuild cleanly:
rows.length = 0; szctr = 0;
// 3 size-bands, each an ALL-DISTINCT size value; within each band across x, y FALLS; higher band -> higher y (Simpson lift)
const bands = [[1.0, 0], [2.0, 500], [3.0, 1000]]; // distinct size, band lift
for (const seg of ['A', 'B']) {
  for (const [szbase, lift] of bands) {
    // each (seg, band) is a falling mini-series across x=1,2,3, but ALL-DISTINCT size per point
    rows.push({ x: 1, y: lift + 30 + (seg === 'A' ? 0 : 3), seg, sz: szbase + (++szctr) * 0.001 });
    rows.push({ x: 2, y: lift + 20 + (seg === 'A' ? 0 : 3), seg, sz: szbase + (++szctr) * 0.001 });
    rows.push({ x: 3, y: lift + 10 + (seg === 'A' ? 0 : 3), seg, sz: szbase + (++szctr) * 0.001 });
  }
}
// Now: within each (seg,band) y falls with x. Across bands, lift grows. But is pooled rising? bands are
// NOT confounded with x (each band spans all x). Pooled over (x,y): at x=1 y in {30,530,1030}, x=2
// {20,520,1020}, x=3 {10,510,1010}. mean-y falls with x -> pooled FALLS. Not a Simpson. Need band lift
// to confound with x. Make higher-x points ALSO higher-band on average is impossible with full cross.
// SIMPLEST true continuous-size Simpson: size grows with x (confound), y grows with size, but within a
// fixed size-neighbourhood y falls with x. Use the canonical S163REV shape but with distinct sizes:
rows.length = 0;
function mk(seg, x, y, sz) { rows.push({ x, y, seg, sz }); }
for (const seg of ['A', 'B']) {
  const o = seg === 'A' ? 0 : 1;
  // low-x -> small size, low y ; high-x -> big size, high y  => POOLED rises with x
  // but hold size ~fixed and y FALLS with x within a size neighbourhood (Simpson on size)
  mk(seg, 1, 10 + o, 1.01 + o * 0.001);
  mk(seg, 2, 8 + o,  1.02 + o * 0.001);   // same small-size neighbourhood: x up, y DOWN
  mk(seg, 1, 110 + o, 9.01 + o * 0.001);
  mk(seg, 2, 108 + o, 9.02 + o * 0.001);  // large-size neighbourhood: x up, y DOWN
}
// pooled: small-size pts ~ (1,10),(2,8),(1,110? no). Hmm the large-size pts are at x=1,2 too. Let me
// make size confound with x: small size only at x=1, large size only at x=2.
rows.length = 0;
for (const seg of ['A', 'B']) {
  const o = seg === 'A' ? 0 : 1;
  // color series A/B: the viewer sees each color. Within a color, list points across x.
  // x=1 has small sizes & low-ish y; x=2 has large sizes & higher y  => color series RISES pooled...
  // but we want the color SERIES (avg per x) to FALL while pooled rises via size. That needs size to
  // confound OPPOSITE. This is the genuine hard case; construct: at x=1 sizes are large->high y; at
  // x=2 sizes small->low y, so avg-per-x (the drawn color line) FALLS; but big-size high-y & big-size
  // happen to sit at x=1... pooled over raw pts: size drives y, x uncorrelated-ish. Keep it simple and
  // just make the DRAWN color series (avg y per x) fall, and let pooled be whatever the SUT says.
  mk(seg, 1, 100 + o, 9.001 + o * 0.0001);  // x=1: big size, high y
  mk(seg, 1, 90 + o,  8.001 + o * 0.0001);
  mk(seg, 2, 40 + o,  2.001 + o * 0.0001);  // x=2: small size, low y
  mk(seg, 2, 30 + o,  1.001 + o * 0.0001);
}
// Drawn color series (avg y per (seg,x)): A: x1 avg95, x2 avg35 -> FALLS. B similar -> FALLS.
// Pooled over drawn cells keyed (x,seg,sz): each sz distinct -> each cell = its row. pooled pearson over
// (x,y): x in {1,2}; but also size confound. Let's just observe the SUT + hand the numbers.

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const spec = { $schema: 'x', id: 'cs', name: 'cs', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };

const a = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('rows:', JSON.stringify(rows.map((r) => [r.seg, r.x, r.y, r.sz])));
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('CURRENT SUT correlation:', a.correlation);
console.log('summary:', summary);
console.log('keyFindings:', JSON.stringify(keyFindings));

// DRAWN color series = avg y per (seg, x) -- what the viewer sees per color
console.log('\n-- DRAWN color=seg series (avg y per x), what a viewer reads:');
for (const seg of ['A', 'B']) {
  const byx = new Map();
  for (const r of rows.filter((r) => r.seg === seg)) { if (!byx.has(r.x)) byx.set(r.x, []); byx.get(r.x).push(r.y); }
  const cells = [...byx.entries()].map(([x, ys]) => [x, ys.reduce((a, b) => a + b, 0) / ys.length]).sort((a, b) => a[0] - b[0]);
  console.log('  seg', seg, JSON.stringify(cells), 'pearson', pearson(cells)?.toFixed(4));
}

// DRAFT full-key sub-series = (seg, sz). sz all-distinct -> each is n=1.
console.log('\n-- DRAFT full-key (seg,sz) sub-series counts (size ALL-DISTINCT -> n=1 each):');
const fk = new Map();
for (const r of rows) { const k = r.seg + '|' + r.sz; if (!fk.has(k)) fk.set(k, new Set()); fk.get(k).add(r.x); }
let anyVotable = false;
for (const [k, xs] of fk) { if (xs.size >= 2) anyVotable = true; }
console.log('  distinct (seg,sz) groups:', fk.size, '| ANY with n>=2 distinct x?', anyVotable);
console.log('  => DRAFT: every sub-series n<2 =>', anyVotable ? 'decompose' : 'FALLBACK -> NARRATE pooled');
