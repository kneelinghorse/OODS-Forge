// MAIN-LOOP probes 2 and 3.
// (2) layeredCorrelationUnsupported :1412 does `bindingsUnion(spec, measureChannel).length > 1`, and
//     bindingsUnion DEDUPES BY binding.field (:1317). Two marks binding the SAME measure field with
//     DIFFERENT `aggregate` therefore dedupe to length 1 and are NOT suppressed — yet they draw two
//     different series.
// (3) correlationSeparabilityEvidenceOf clause (b) is `vote === -pooledSign`. When pooled rounds to 0,
//     signOf → 0 and `-pooledSign` is -0; in JS neither 1 nor -1 equals -0. Clause (a) also cannot fire
//     when every band agrees. So a pooled-zero chart over unanimously falling bands is un-suppressible.
import { analyzeVizSpec, generateNarrativeSummary }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
function show(label, s) {
  const a = analyzeVizSpec(s);
  const n = generateNarrativeSummary(s);
  const kf = (n.keyFindings ?? []).filter((k) => /correlat|relationship/i.test(JSON.stringify(k)));
  console.log(`  ${label.padEnd(58)} corr=${String(a.correlation).padEnd(9)} ${a.correlation === undefined ? 'SUPPRESSED' : 'NARRATED'}`);
  if (a.correlation !== undefined) {
    console.log(`      findings: ${JSON.stringify(kf)}`);
    console.log(`      summary : ${n.summary}`);
  }
  return a.correlation;
}

// ---------------------------------------------------------------- (2) per-mark aggregate divergence
console.log('#### (2) two marks, SAME measure field, DIFFERENT aggregate ####');
// More rows at high x, each smaller: sum(y) RISES while average(y) FALLS.
const agRows = [];
for (let x = 1; x <= 5; x++) {
  const count = x * 3;             // 3,6,9,12,15 rows
  const val = 100 - x * 15;        // 85,70,55,40,25  → average falls hard
  for (let i = 0; i < count; i++) agRows.push({ x, y: val });
}
const sumBy = new Map(), avgBy = new Map();
for (const r of agRows) {
  sumBy.set(r.x, (sumBy.get(r.x) ?? 0) + r.y);
  const a = avgBy.get(r.x) ?? { s: 0, n: 0 }; a.s += r.y; a.n++; avgBy.set(r.x, a);
}
const sumPairs = [...sumBy].map(([x, s]) => [x, s]);
const avgPairs = [...avgBy].map(([x, a]) => [x, a.s / a.n]);
console.log('  drawn layer SUM(y)     r =', pearson(sumPairs).toFixed(3));
console.log('  drawn layer AVERAGE(y) r =', pearson(avgPairs).toFixed(3), ' <-- opposite sign');

const encSum = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' } };
const encAvg = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } };
const twoAgg = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: agRows },
  marks: [{ trait: 'MarkBar', encodings: encSum }, { trait: 'MarkLine', encodings: encAvg }],
  encoding: encSum, a11y: { description: 'y over x' },
};
const oneAgg = { ...twoAgg, marks: [{ trait: 'MarkBar', encodings: encSum }] };
const r2 = show('two marks: MarkBar sum(y) + MarkLine average(y)', twoAgg);
const r2c = show('CONTROL single mark: MarkBar sum(y) only', oneAgg);

// ---------------------------------------------------------------- (3) pooled rounds to exactly zero
console.log('\n#### (3) pooled r == 0 exactly, every drawn band FALLS ####');
// Two colour bands, both falling; offsets chosen so the pooled covariance is exactly 0.
const zRows = [
  { x: 1, y: 30, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 10, seg: 'A' },
  { x: 4, y: 50, seg: 'B' }, { x: 5, y: 40, seg: 'B' }, { x: 6, y: 30, seg: 'B' },
];
console.log('  band A r =', pearson(zRows.slice(0, 3).map((r) => [r.x, r.y])).toFixed(3),
  ' band B r =', pearson(zRows.slice(3).map((r) => [r.x, r.y])).toFixed(3),
  ' pooled r =', pearson(zRows.map((r) => [r.x, r.y])).toFixed(6));
const zEnc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'seg', trait: 'EncodingColor' },
};
const zSpec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: zRows },
  marks: [{ trait: 'MarkPoint', encodings: zEnc }], encoding: zEnc, a11y: { description: 'y over x' },
};
const r3 = show('pooled ~0, both colour bands fall', zSpec);
// discriminating control: same shape but pooled clearly positive → must suppress via clause (b)
const zRows2 = zRows.map((r) => (r.seg === 'B' ? { ...r, y: r.y + 200 } : r));
console.log('  control pooled r =', pearson(zRows2.map((r) => [r.x, r.y])).toFixed(3));
const r3c = show('CONTROL same bands, pooled clearly POSITIVE', { ...zSpec, data: { name: 'd', values: zRows2 } });

console.log('\n#### SUMMARY ####');
console.log('  (2) two-aggregate layered:', r2 === undefined ? 'suppressed' : `NARRATED ${r2}`, '| single-mark control:', r2c === undefined ? 'suppressed' : `narrated ${r2c}`);
console.log('  (3) pooled-zero          :', r3 === undefined ? 'suppressed' : `NARRATED ${r3}`, '| positive-pooled control:', r3c === undefined ? 'suppressed' : `narrated ${r3c}`);
