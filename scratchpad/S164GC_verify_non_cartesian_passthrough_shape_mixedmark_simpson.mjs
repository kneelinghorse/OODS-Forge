import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// independent pearson
function P(xs, ys) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  return num / Math.sqrt(dx * dy);
}

const rows = [
  { x: 1, y: 10, g: 'A' }, { x: 2, y: 8, g: 'A' }, { x: 3, y: 6, g: 'A' },
  { x: 4, y: 30, g: 'B' }, { x: 5, y: 28, g: 'B' }, { x: 6, y: 26, g: 'B' },
];

console.log('=== HAND ORACLE (my own) ===');
const A = rows.filter(r => r.g === 'A'), B = rows.filter(r => r.g === 'B');
console.log('  shape A pearson =', P(A.map(r => r.x), A.map(r => r.y)).toFixed(4), '(n=' + A.length + ')');
console.log('  shape B pearson =', P(B.map(r => r.x), B.map(r => r.y)).toFixed(4), '(n=' + B.length + ')');
console.log('  POOLED pearson  =', P(rows.map(r => r.x), rows.map(r => r.y)).toFixed(4));

function mk(marks, chan, extra = {}) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    [chan]: { field: 'g', trait: 'Encoding' + chan[0].toUpperCase() + chan.slice(1), ...extra },
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks: marks.map(t => ({ trait: t, encodings: enc })), encoding: enc, a11y: { description: 'y over x' } };
  return spec;
}

function report(lbl, spec) {
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  const kf = (n.keyFindings || []).filter(k => /Correlation/i.test(k));
  console.log(`\n[${lbl}]`);
  console.log('  mark =', a.analysis?.mark, '| corr =', a.correlation, '| narrates:', kf.length ? JSON.stringify(kf) : '(none)');
}

console.log('\n=== SUT ===');
report('single MarkPoint + shape (control, expect undefined)', mk(['MarkPoint'], 'shape'));
report('single MarkLine + shape (control, expect undefined)', mk(['MarkLine'], 'shape'));
report('MIXED point+line + shape (SUSPECT)', mk(['MarkPoint', 'MarkLine'], 'shape'));
report('MIXED point+line + color (control, expect undefined)', mk(['MarkPoint', 'MarkLine'], 'color'));
// realistic line-with-markers ordering
report('MIXED line+point + shape (order flip)', mk(['MarkLine', 'MarkPoint'], 'shape'));
