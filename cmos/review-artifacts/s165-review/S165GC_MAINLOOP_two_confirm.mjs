// MAIN-LOOP confirmation of survivor #2 — isolate the DEDUPE-BY-FIELD mechanism.
// layeredCorrelationUnsupported :1412 = bindingsUnion(spec, measureChannel).length > 1, and bindingsUnion
// :1317 dedupes by binding.field. Prediction: two marks drawing sum(y) and average(y) are NOT suppressed
// (one field), but two marks drawing sum(y) and average(y2) — identical numbers, different field NAME —
// ARE suppressed. If both hold, the suppressor keys on the field NAME, not on what is DRAWN.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

const rows = [];
for (let x = 1; x <= 5; x++) {
  for (let i = 0; i < x * 3; i++) rows.push({ x, y: 100 - x * 15, y2: 100 - x * 15 }); // y2 === y, always
}
const sums = new Map(), avgs = new Map();
for (const r of rows) {
  sums.set(r.x, (sums.get(r.x) ?? 0) + r.y);
  const a = avgs.get(r.x) ?? { s: 0, n: 0 }; a.s += r.y; a.n++; avgs.set(r.x, a);
}
console.log('drawn layer SUM(y)      r =', pearson([...sums].map(([x, s]) => [x, s])).toFixed(3), '(RISES)');
console.log('drawn layer AVERAGE(y)  r =', pearson([...avgs].map(([x, a]) => [x, a.s / a.n])).toFixed(3), '(FALLS)');

const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const mk = (field, aggregate) => ({ x: X, y: { field, trait: 'EncodingY', type: 'quantitative', aggregate } });
const base = (marks, enc) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: rows }, marks, encoding: enc, a11y: { description: 'y over x' },
});

const SAME_FIELD = base(
  [{ trait: 'MarkBar', encodings: mk('y', 'sum') }, { trait: 'MarkLine', encodings: mk('y', 'average') }],
  mk('y', 'sum')
);
const DIFF_FIELD = base(
  [{ trait: 'MarkBar', encodings: mk('y', 'sum') }, { trait: 'MarkLine', encodings: mk('y2', 'average') }],
  mk('y', 'sum')
);

function run(label, s) {
  const a = analyzeVizSpec(s);
  const kf = (generateNarrativeSummary(s).keyFindings ?? []).filter((k) => /correlat/i.test(JSON.stringify(k)));
  const layers = toVegaLiteSpec(s).layer ?? [toVegaLiteSpec(s)];
  console.log(`\n${label}`);
  console.log('  compiled layers y:', JSON.stringify(layers.map((l) => l.encoding?.y)));
  console.log('  correlation      :', a.correlation, a.correlation === undefined ? 'SUPPRESSED' : `NARRATED ${JSON.stringify(kf)}`);
  return a.correlation;
}

const rSame = run('A. two marks, SAME field y: sum(y) + average(y)   [dedupes to 1 → not suppressed?]', SAME_FIELD);
const rDiff = run('B. two marks, DIFFERENT names y/y2, IDENTICAL data: sum(y) + average(y2)', DIFF_FIELD);

console.log('\n#### MECHANISM ####');
console.log('  A (same field name)     :', rSame === undefined ? 'suppressed' : `NARRATED ${rSame}`);
console.log('  B (different field name):', rDiff === undefined ? 'SUPPRESSED' : `narrated ${rDiff}`);
if (rSame !== undefined && rDiff === undefined) {
  console.log('  >>> CONFIRMED: identical DRAWN content, decision flips on the field NAME alone.');
  console.log('  >>> The narrated r describes the sum layer; the average layer the chart also draws falls at -1.000.');
}
