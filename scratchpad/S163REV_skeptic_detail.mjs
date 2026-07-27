// INDEPENDENT skeptic reproduction (detail lens). n=3 per drawn sub-series to eliminate any
// n=2 covariance-branch degeneracy. Tests BOTH the quantitative SIZE case (direct s162 analog)
// and the quantitative DETAIL case, under avg-aggregate AND no-aggregate, plus categorical control.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// n=3 per (seg, band). Each band FALLS; pooling bands within a seg RISES; pooled overall RISES.
// seg = categorical color (ACTIVE partition). band field = the quant retinal channel (size or detail).
function makeRows(bandField) {
  const rows = [];
  const add = (x, y, seg, band) => rows.push({ x, y, seg, [bandField]: band });
  // seg A
  add(1, 50, 'A', 100); add(2, 40, 'A', 100); add(3, 30, 'A', 100);   // band 100 falls
  add(4, 250, 'A', 200); add(5, 240, 'A', 200); add(6, 230, 'A', 200); // band 200 falls
  // seg B
  add(1, 1050, 'B', 100); add(2, 1040, 'B', 100); add(3, 1030, 'B', 100);
  add(4, 1250, 'B', 200); add(5, 1240, 'B', 200); add(6, 1230, 'B', 200);
  return rows;
}

function run(label, bandChannel, aggregate, mark, bandType) {
  const bandField = bandChannel === 'size' ? 'sz' : 'd';
  const rows = makeRows(bandField);
  const yEnc = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
  if (aggregate) yEnc.aggregate = aggregate;
  const bandEnc = { field: bandField, trait: bandChannel === 'size' ? 'EncodingSize' : 'EncodingDetail' };
  if (bandType) bandEnc.type = bandType; // 'quantitative' -> grouping-only ; omit -> categorical partition
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: yEnc,
    color: { field: 'seg', trait: 'EncodingColor' }, // categorical -> ACTIVE partition
    [bandChannel]: bandEnc,
  };
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: label, name: label,
    data: { name: 'd', values: rows },
    marks: [{ trait: mark, encodings: enc }], encoding: enc, a11y: { description: 'y over x' },
  };
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log(`\n=== ${label} (${bandChannel} ${bandType || 'CATEGORICAL'}, agg=${aggregate || 'none'}, ${mark}) ===`);
  console.log('  resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  SUT analysis.correlation:', a.correlation);
  console.log('  SUT summary:', summary);
  console.log('  keyFindings:', JSON.stringify(keyFindings));
  // hand oracles
  console.log('  POOLED over all drawn cells:', pearson(rows.map(r => [r.x, r.y]))?.toFixed(4));
  for (const seg of ['A', 'B']) for (const band of [100, 200]) {
    const sub = rows.filter(r => r.seg === seg && r[bandField] === band).map(r => [r.x, r.y]);
    console.log(`    drawn sub-series seg=${seg} ${bandField}=${band}: pearson=${pearson(sub)?.toFixed(4)} (FALLS if <0)`);
  }
  for (const seg of ['A', 'B']) {
    const sub = rows.filter(r => r.seg === seg).map(r => [r.x, r.y]);
    console.log(`    per-color direction (band POOLED) seg=${seg}: ${pearson(sub)?.toFixed(4)} (what the gate votes)`);
  }
  return a.correlation;
}

console.log('################ SIZE (quant retinal, direct s162-channel analog) ################');
const sizeQuantAvg = run('sizeQuantAvg', 'size', 'average', 'MarkPoint', 'quantitative');
const sizeCatAvg = run('sizeCatControl', 'size', 'average', 'MarkPoint', undefined); // categorical control

console.log('\n################ DETAIL (quant retinal) ################');
const detQuantLine = run('detQuantLine', 'detail', undefined, 'MarkLine', 'quantitative'); // no-agg line
const detQuantAvg = run('detQuantAvg', 'detail', 'average', 'MarkPoint', 'quantitative'); // avg
const detCatLine = run('detCatControl', 'detail', undefined, 'MarkLine', undefined); // categorical control

console.log('\n################ VERDICT ################');
console.log('SIZE quant avg  -> SUT corr =', sizeQuantAvg, '(SURVIVOR if defined & positive)');
console.log('SIZE categorical control ->', sizeCatAvg, '(honest suppression expected: undefined)');
console.log('DETAIL quant line ->', detQuantLine, '(SURVIVOR if defined & positive)');
console.log('DETAIL quant avg  ->', detQuantAvg, '(SURVIVOR if defined & positive)');
console.log('DETAIL categorical control ->', detCatLine, '(honest suppression expected: undefined)');
