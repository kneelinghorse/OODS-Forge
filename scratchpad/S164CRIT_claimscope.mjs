// S164 claim-scope critic probe.
// ATTACK: §4 closes "{non-aggregate cartesian; declared-aggregate; categorical-partition +
// quantitative-grouping-axis Simpson}" and discloses ONE residual (truly-continuous all-distinct
// ramp, EVERY sub-series n<2). But the proposed fix PRESERVES the partitionFields.length===0
// early-return. A quantitative-grouping Simpson with NO categorical partition (size only, no color)
// => partitionFields=[] => early-return pooled => NO sub-series decomposition. n>=2 per size band,
// so it is NOT the disclosed all-distinct ramp. Reachable phantom outside §4's disclosed residual.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// size QUANTITATIVE only, NO categorical color/detail/facet. n=3 per size band. Each band falls;
// pooled rises. This is a Simpson on the size axis with an EMPTY categorical partition.
const rows = [];
const add = (x, y, sz) => rows.push({ x, y, sz });
add(1, 50, 10); add(2, 40, 10); add(3, 30, 10);       // size 10 band falls
add(4, 250, 20); add(5, 240, 20); add(6, 230, 20);    // size 20 band falls
add(7, 450, 30); add(8, 440, 30); add(9, 430, 30);    // size 30 band falls

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' }, // quant retinal -> NOT a partition
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'sizeOnly', name: 'sizeOnly',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'avg y over x' },
};

const a = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('=== SIZE-ONLY Simpson, NO categorical partition (partitionFields expected []) ===');
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('SUT analysis.correlation:', a.correlation);
console.log('SUT summary:', summary);
console.log('keyFindings:', JSON.stringify(keyFindings));
console.log('POOLED over all drawn cells:', pearson(rows.map(r => [r.x, r.y]))?.toFixed(4));
for (const sz of [10, 20, 30]) {
  const sub = rows.filter(r => r.sz === sz).map(r => [r.x, r.y]);
  console.log(`  drawn sub-series sz=${sz}: pearson=${pearson(sub)?.toFixed(4)} (n=${sub.length}, FALLS if <0)`);
}
console.log('\nVERDICT: if SUT corr is defined+positive, this is a Simpson phantom the proposed');
console.log('fix does NOT close (early-return preserved) and §4 does NOT disclose (n>=2 per band).');
