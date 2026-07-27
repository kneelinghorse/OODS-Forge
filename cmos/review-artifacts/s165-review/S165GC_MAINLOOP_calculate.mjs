// MAIN-LOOP independent reproduction of the surviving TA-2 `calculate` case.
// A `calculate` transform derives a NEW field and binds it to colour. separableFields enumerates the
// field BY NAME (it is a real colour binding), but finestSeparableBuckets keys buckets by the RAW ROW
// value of that field — and no row has it, because data-analysis.ts never applies spec.transforms.
// So one bucket, zero votes, and the Simpson narrates. My own rows, my own predicate, my own pearson.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec, validateNormalizedVizSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// headcount < 500 => 'SMB', else 'Enterprise'. Each derived tier FALLS; the offset makes the pool rise.
const rows = [
  { spend: 10, roi: 40, headcount: 120 }, { spend: 20, roi: 35, headcount: 200 },
  { spend: 30, roi: 30, headcount: 310 }, { spend: 40, roi: 25, headcount: 420 },
  { spend: 60, roi: 90, headcount: 800 }, { spend: 70, roi: 85, headcount: 900 },
  { spend: 80, roi: 80, headcount: 950 }, { spend: 90, roi: 75, headcount: 990 },
];
const tierOf = (r) => (r.headcount < 500 ? 'SMB' : 'Enterprise');
for (const t of ['SMB', 'Enterprise']) {
  console.log(`  drawn tier ${t.padEnd(11)} r =`, pearson(rows.filter((r) => tierOf(r) === t).map((r) => [r.spend, r.roi])).toFixed(4));
}
console.log('  pooled                r =', pearson(rows.map((r) => [r.spend, r.roi])).toFixed(4));

const enc = {
  x: { field: 'spend', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'roi', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'tier', trait: 'EncodingColor', type: 'nominal' },
};
const CALC = { type: 'calculate', params: { calculate: "datum.headcount < 500 ? 'SMB' : 'Enterprise'", as: 'tier' } };
const base = (values, transforms) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values },
  ...(transforms ? { transforms } : {}),
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'roi over spend' },
});

// A: tier DERIVED by the transform (absent from every row)
const derived = base(rows, [CALC]);
// CONTROL: tier MATERIALISED onto the rows AND the transform kept — byte-identical compiled output,
// byte-identical drawn marks; the only difference is whether the analysed rows carry the field.
const materialised = base(rows.map((r) => ({ ...r, tier: tierOf(r) })), [CALC]);

function run(label, s) {
  const a = analyzeVizSpec(s);
  const n = generateNarrativeSummary(s);
  const v = validateNormalizedVizSpec(s);
  const c = toVegaLiteSpec(s);
  console.log(`\n${label}`);
  console.log('  spec valid        :', v.valid, JSON.stringify(v.errors ?? []).slice(0, 80));
  console.log('  compiled transform:', JSON.stringify(c.transform ?? null));
  console.log('  compiled colour   :', JSON.stringify((c.layer ?? [c])[0].encoding?.color));
  console.log('  correlation       :', a.correlation, a.correlation === undefined ? 'SUPPRESSED' : 'NARRATED');
  if (a.correlation !== undefined) console.log(`  narrative         : "${n.summary}" ${JSON.stringify((n.keyFindings ?? []).filter((k) => /correlat/i.test(k)))}`);
  return { corr: a.correlation, compiled: JSON.stringify(c) };
}

const A = run('A. tier DERIVED by the calculate transform (no row carries `tier`)', derived);
const B = run('B. CONTROL tier MATERIALISED on the rows, transform KEPT', materialised);

console.log('\n#### VERDICT ####');
console.log('  derived     :', A.corr === undefined ? 'suppressed' : `NARRATED ${A.corr}`);
console.log('  materialised:', B.corr === undefined ? 'SUPPRESSED' : `narrated ${B.corr}`);
console.log('  compiled Vega-Lite encoding+transform identical?',
  JSON.parse(A.compiled).transform?.[0]?.calculate === JSON.parse(B.compiled).transform?.[0]?.calculate &&
  JSON.stringify(JSON.parse(A.compiled).encoding) === JSON.stringify(JSON.parse(B.compiled).encoding));
if (A.corr !== undefined && B.corr === undefined) {
  console.log('  >>> CONFIRMED: same compiled chart, same drawn marks — the decision flips on whether');
  console.log('  >>> the ANALYSED rows happen to carry a field the RENDERER derives for itself.');
}
