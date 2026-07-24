// Adversarial DETAIL-lens reproduction against fresh dist @ ae6c0dc.
// Hypothesis: a QUANTITATIVE `detail` binding is EXCLUDED from correlationPartitionFields
// (bindingIsQuantitative -> skip) but INCLUDED in seriesGroupingFields/drawnCellKeyFields
// (unconditional). So the narrated VALUE keys detail as a drawn sub-series, but the DIRECTION
// gate partitions only by the categorical color -> it pools the detail sub-series into one
// per-color direction and MISSES a Simpson carried by the (visible) detail grouping.
import {
  analyzeVizSpec,
  generateNarrativeSummary,
  resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n,
    my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}

// ---- Data: color=seg {A,B}; detail=d {1,2} QUANTITATIVE. Within EACH (seg,detail) the drawn
// sub-series FALLS; pooling d=1 & d=2 within a color RISES; overall RISES. All 4 drawn sub-series fall.
const rows = [];
const push = (x, y, seg, d) => rows.push({ x, y, seg, d });
for (const seg of ['A', 'B']) {
  // detail line d=1 (low band, falling)
  push(1, 10, seg, 1); push(2, 9, seg, 1);
  // detail line d=2 (high band, falling)
  push(3, 100, seg, 2); push(4, 99, seg, 2);
}

// MarkLine (detail draws a separate visible line per distinct d value in Vega-Lite, regardless of type),
// NO declared aggregate. color categorical, detail QUANTITATIVE.
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'seg', trait: 'EncodingColor' }, // categorical -> PARTITION
  detail: { field: 'd', trait: 'EncodingDetail', type: 'quantitative' }, // quant -> grouping-only
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'det', name: 'det',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkLine', encodings: enc }],
  encoding: enc,
  a11y: { description: 'y over x by seg/detail' },
};

const a = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('=== QUANT-DETAIL (grouping-only) case ===');
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('SUT analysis.correlation:', a.correlation);
console.log('SUT summary:', summary);
console.log('SUT keyFindings:', JSON.stringify(keyFindings));

console.log('\n-- hand oracles --');
console.log('POOLED over all drawn rows (what the value narrates):', pearson(rows.map((r) => [r.x, r.y]))?.toFixed(4));
console.log('-- per VISIBLE drawn sub-series (seg x detail) — the cells the chart draws as lines --');
for (const seg of ['A', 'B']) for (const d of [1, 2]) {
  const sub = rows.filter((r) => r.seg === seg && r.d === d).map((r) => [r.x, r.y]);
  console.log(`  seg=${seg} d=${d}:`, pearson(sub)?.toFixed(4), '(FALLS if negative)');
}
console.log('-- per-COLOR direction (what the SUT gate classifies — detail POOLED) --');
for (const seg of ['A', 'B']) {
  const sub = rows.filter((r) => r.seg === seg).map((r) => [r.x, r.y]);
  console.log(`  seg=${seg} (detail collapsed):`, pearson(sub)?.toFixed(4), '(RISES if positive)');
}

// ---- CONTROL: identical data, detail made CATEGORICAL (no type stamp) -> becomes a PARTITION field
// -> the gate splits by detail -> should SUPPRESS (undefined). The quant/categorical flip is the tell.
const enc2 = { ...enc, detail: { field: 'd', trait: 'EncodingDetail' } };
const spec2 = { ...spec, id: 'det2', encoding: enc2, marks: [{ trait: 'MarkLine', encodings: enc2 }] };
console.log('\n=== CONTROL: detail CATEGORICAL (partition) ===');
console.log('SUT analysis.correlation:', analyzeVizSpec(spec2).correlation, '(expect undefined — detail now partitions & sub-series contradict)');
