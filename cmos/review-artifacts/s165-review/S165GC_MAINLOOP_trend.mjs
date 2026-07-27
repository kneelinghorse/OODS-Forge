// MAIN-LOOP probe 6 — with the CORRELATION correctly suppressed by s165, what ELSE does the narrative
// still assert about the same drawn marks? s165 gates only the coefficient.
import { analyzeVizSpec, generateNarrativeSummary }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// Survivor-A shape: shape on a layered/'mixed' mark, both drawn bands FALL, pooled RISES.
const rows = [
  { x: 1, y: 30, g: 'circle' }, { x: 2, y: 20, g: 'circle' }, { x: 3, y: 10, g: 'circle' },
  { x: 4, y: 130, g: 'square' }, { x: 5, y: 120, g: 'square' }, { x: 6, y: 110, g: 'square' },
];
console.log('drawn band circle r =', pearson(rows.slice(0, 3).map((r) => [r.x, r.y])).toFixed(2),
  '| square r =', pearson(rows.slice(3).map((r) => [r.x, r.y])).toFixed(2),
  '| pooled r =', pearson(rows.map((r) => [r.x, r.y])).toFixed(3));

const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Y = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const enc = { x: X, y: Y, shape: { field: 'g', trait: 'EncodingShape' } };
const s = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkLine', encodings: enc }, { trait: 'MarkPoint', encodings: enc }],
  encoding: enc, a11y: { description: 'y over x' },
};

const a = analyzeVizSpec(s);
const n = generateNarrativeSummary(s);
console.log('\n  correlation (s165 gate):', a.correlation, a.correlation === undefined ? '<< correctly SUPPRESSED' : '<< NARRATED');
console.log('  analysis.trend         :', JSON.stringify(a.trend ?? a.trends ?? null));
console.log('\n  EVERYTHING the narrative still emits to the user:');
console.log('    summary     :', JSON.stringify(n.summary));
console.log('    keyFindings :', JSON.stringify(n.keyFindings));
for (const k of Object.keys(n)) {
  if (k !== 'summary' && k !== 'keyFindings') console.log(`    ${k.padEnd(12)}:`, JSON.stringify(n[k]).slice(0, 300));
}
console.log('\n  full analysis keys:', Object.keys(a).join(', '));
const blob = JSON.stringify(n) + JSON.stringify(a);
const dirWords = blob.match(/"[^"]*\b(increas|decreas|rising|falling|upward|downward|trend|grow|declin)[a-z]*\b[^"]*"/gi);
console.log('\n  >>> direction-asserting strings anywhere in the output:');
console.log('     ', dirWords ? JSON.stringify([...new Set(dirWords)], null, 2) : 'NONE');
