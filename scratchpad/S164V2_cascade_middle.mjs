// S164 v2 RE-CRITIC — lens cascade_fallback. HARDENED so the middle opposites are ABOVE τ.
// The §10 cascade is BINARY: finest = (P ∪ ALL groupingFields) OR (fallback) P partition-level.
// It NEVER evaluates an intermediate granularity (a strict SUBSET of grouping fields).
// Construct: P=seg (categorical color); groupingFields={size,detail} both quantitative retinal.
//  - detail all-distinct within each (seg,size) -> finest (seg,size,det) all n=1 -> SHREDS.
//  - middle (seg,size) bands FALL with Δ=80 (>= τ·range) -> REAL, ABOVE-τ opposites the viewer sees.
//  - partition-level (seg) RISES (Simpson lift across size) -> AGREES with pooled.
// v2: finest shreds -> cascade jumps straight to partition-level (rising) -> narratableCorrelation([+,+],+)
//     = NARRATE. The above-τ falling size-bands are ERASED. Not gray-zone (residual 1): Δ >> τ.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const slopeSign = (pairs) => { const r = pearson(pairs); return r === null ? 'unk' : (r > 0 ? '+' : r < 0 ? '-' : '0'); };

const rows = [];
let id = 0;
const add = (x, y, seg, size) => { id += 1; rows.push({ x, y, seg, size, det: id }); };
// seg A: two size bands, each FALLS by 80; between-size lift makes A pooled RISE.
add(1, 160, 'A', 10); add(2, 80, 'A', 10);    // size10 FALLS Δ=80
add(3, 260, 'A', 20); add(4, 180, 'A', 20);   // size20 FALLS Δ=80
// seg B: same shape, modest y offset (+200) so overall range stays small (τ stays low).
add(1, 360, 'B', 10); add(2, 280, 'B', 10);
add(3, 460, 'B', 20); add(4, 380, 'B', 20);

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'size', trait: 'EncodingSize', type: 'quantitative' },
  detail: { field: 'det', trait: 'EncodingDetail', type: 'quantitative' },
};
const spec = {
  $schema: 'x', id: 's', name: 's', data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' },
};

const a = analyzeVizSpec(spec);
const { summary } = generateNarrativeSummary(spec);
const allY = rows.map(r => r.y);
const range = Math.max(...allY) - Math.min(...allY);
const tau = 0.10;
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('CURRENT SUT correlation:', a.correlation, '|', summary);
console.log('pooled(all cells):', pearson(rows.map(r => [r.x, r.y]))?.toFixed(4), '(RISES = pooled sign +)');
console.log(`pooled cell-value range = ${range} ; τ·range (τ=${tau}) = ${(tau * range).toFixed(1)}  -> middle Δ=80 is ${80 >= tau * range ? 'ABOVE τ (a REAL opposite, NOT gray-zone)' : 'below τ'}`);
console.log('\n-- GRANULARITY LADDER --');
for (const seg of ['A', 'B']) {
  const pl = rows.filter(r => r.seg === seg).map(r => [r.x, r.y]);
  console.log(`PARTITION-level seg=${seg}: n=${pl.length} r=${pearson(pl)?.toFixed(4)} slope=${slopeSign(pl)}  <- cascade LANDS here (rises, agrees pooled)`);
  for (const sz of [10, 20]) {
    const mid = rows.filter(r => r.seg === seg && r.size === sz).map(r => [r.x, r.y]);
    const d = Math.abs(mid[0][1] - mid[mid.length - 1][1]);
    console.log(`   MIDDLE (seg=${seg},size=${sz}): n=${mid.length} r=${pearson(mid)?.toFixed(4)} slope=${slopeSign(mid)} |Δ|=${d} (>=τ? ${d >= tau * range})  <- ABOVE-τ opposite, SKIPPED by binary cascade`);
  }
}
const fk = new Map();
for (const r of rows) { const k = `${r.seg}|${r.size}|${r.det}`; if (!fk.has(k)) fk.set(k, new Set()); fk.get(k).add(r.x); }
console.log('\nFINEST (seg,size,det) groups:', fk.size, '| any n>=2 distinct-x?', [...fk.values()].some(s => s.size >= 2), '=> SHREDS -> cascade to PARTITION-level');
console.log('\nv2 hand-sim: finest shreds -> P-level [segA +, segB +] AGREE pooled(+) -> narratableCorrelation([+,+],+) = NARRATE');
console.log('=> v2 NARRATES a phantom; 4 above-τ falling size-bands ERASED. Middle granularity is never evaluated.');
