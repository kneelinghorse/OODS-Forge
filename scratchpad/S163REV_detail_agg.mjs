// AGGREGATE variant of the detail survivor. Here the s163 "classifier at least as fine as the
// value" invariant HOLDS (groupingFields=[d] so the classifier DOES re-project each color group
// by detail), yet the Simpson STILL leaks — because classifyGroupDirection computes ONE direction
// over the POOLED grouping cells per partition. Fineness of the CELL KEY does not decompose the
// DIRECTION by the grouping field. So narratedValueCellKey ⊆ classifierKey (the machine-asserted
// invariant) is satisfied while the narrated value is a Simpson lie.
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

// One row per (seg, d, x) so avg = that y (drawn cells are (x,seg,d)-keyed). detail QUANTITATIVE.
const rows = [];
const push = (x, y, seg, d) => rows.push({ x, y, seg, d });
for (const seg of ['A', 'B']) {
  push(1, 10, seg, 1); push(2, 9, seg, 1);   // detail line d=1 falls
  push(3, 100, seg, 2); push(4, 99, seg, 2); // detail line d=2 falls
}
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  detail: { field: 'd', trait: 'EncodingDetail', type: 'quantitative' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'detA', name: 'detA',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'avg y over x' },
};

const a = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('=== AGGREGATE (avg) quant-detail case ===');
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('SUT analysis.correlation:', a.correlation);
console.log('SUT summary:', summary);
console.log('SUT keyFindings:', JSON.stringify(keyFindings));

console.log('\n-- hand oracle over the DRAWN cells (avg per (x,seg,d)) grouped by VISIBLE detail lines --');
for (const seg of ['A', 'B']) for (const d of [1, 2]) {
  const sub = rows.filter((r) => r.seg === seg && r.d === d).map((r) => [r.x, r.y]);
  console.log(`  seg=${seg} d=${d}:`, pearson(sub)?.toFixed(4), '(FALLS)');
}
console.log('\n-- s163 invariant (analytic): value key = {seg,d}; partition={seg}, grouping={d};');
console.log('   partition∪grouping = {seg,d} ⊇ value key {seg,d} -> invariant HOLDS.');
console.log('   Yet the narrated', a.correlation, 'contradicts all 4 falling drawn detail lines:');
console.log('   the classifier re-projects each color by {d} but classifyGroupDirection POOLS');
console.log('   those detail cells into ONE per-color direction (+0.89), never per-detail -> MISS.');
