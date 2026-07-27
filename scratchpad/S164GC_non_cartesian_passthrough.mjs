import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(markTrait, enc, rows, extra = {}) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: rows },
    marks: [{ trait: markTrait, encodings: enc }],
    encoding: enc,
    a11y: { description: 'y over x' },
    ...extra,
  };
}

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i]-mx)*(ys[i]-my); sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; }
  return sxy / Math.sqrt(sxx*syy);
}

// ---- Case A: various non-cartesian mark traits with quant x/y bound (monotone rising pooled) ----
const encXY = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const rowsRising = [
  { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 10 },
];
console.log('pooled pearson rising =', pearson(rowsRising.map(r=>r.x), rowsRising.map(r=>r.y)).toFixed(3));

for (const mt of ['MarkArc', 'MarkRect', 'MarkRule', 'MarkTick', 'MarkTrail', 'MarkGeoshape', 'MarkTreemap', 'MarkSankey', 'MarkPie', 'MarkText', 'MarkImage', 'FooBar', undefined]) {
  const spec = mk(mt, encXY, rowsRising);
  try {
    const a = analyzeVizSpec(spec);
    const pc = resolvePrimaryChannels(spec);
    console.log(`mark=${String(mt).padEnd(12)} measureCh=${pc.measureChannel} dimCh=${pc.dimensionChannel} corr=${a.correlation}`);
  } catch (e) {
    console.log(`mark=${String(mt).padEnd(12)} ERROR ${e.message}`);
  }
}

// ---- Case B: MarkArc (pie) — angle/theta encoding with a color category, no real x/y trend ----
// A pie draws slices; there is NO cartesian sub-series. But if x/y accidentally bound to category+value:
console.log('\n--- Case B: pie-like arc, category + value bound as x/y ---');
const pieEnc = {
  x: { field: 'cat', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'val', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'cat', trait: 'EncodingColor' },
};
const pieRows = [
  { cat: 1, val: 30 }, { cat: 2, val: 25 }, { cat: 3, val: 20 }, { cat: 4, val: 15 }, { cat: 5, val: 10 },
];
const pieSpec = mk('MarkArc', pieEnc, pieRows);
const pieA = analyzeVizSpec(pieSpec);
console.log('pie corr=', pieA.correlation, '|', generateNarrativeSummary(pieSpec).summary);
console.log('pie pooled pearson =', pearson(pieRows.map(r=>r.cat), pieRows.map(r=>r.val)).toFixed(3));
