// s160 adversarial review — negative-zero correlation display probe (correlation-gate edge hunter).
// Hand oracle: raw pooled r = -0.0001185... (computed inline, independent formula);
// stats.pearson does Number(r.toFixed(3)) -> Number("-0.000") = -0 (negative zero).
// signOf(-0)=0 -> sign-neutral narrates (pinned). Display: pre-s160 the raw template
// `${analysis.correlation}` stringified -0 as "0"; s160 m4's narrateNumber routes through
// Intl.NumberFormat which formats -0 as "-0" -> keyFinding "Correlation coefficient: -0"
// beside a summary that says "weak positive relationship".
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const rows = [
  { x: 1, y: 1 },
  { x: 2, y: 5 },
  { x: 3, y: 3 },
  { x: 4, y: 5.0005 },
  { x: 5, y: 0.999 },
];
// independent hand oracle
const n = rows.length;
const mx = rows.reduce((s, r) => s + r.x, 0) / n;
const my = rows.reduce((s, r) => s + r.y, 0) / n;
let num = 0, dx2 = 0, dy2 = 0;
for (const r of rows) { num += (r.x - mx) * (r.y - my); dx2 += (r.x - mx) ** 2; dy2 += (r.y - my) ** 2; }
const handRaw = num / Math.sqrt(dx2 * dy2);
console.log('hand raw r =', handRaw); // ≈ -0.00011856
console.log('rounded-as-pearson-does =', Number(handRaw.toFixed(3)), 'Object.is -0:', Object.is(Number(handRaw.toFixed(3)), -0));

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'nz', name: 'nz',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: { ...enc } }],
  encoding: enc,
  a11y: { description: 'd' },
};
const a = analyzeVizSpec(spec);
console.log('analysis.correlation =', a.correlation, 'Object.is -0:', Object.is(a.correlation, -0));
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('summary =', summary);              // "... weak positive relationship ..."
console.log('keyFindings =', keyFindings);      // includes "Correlation coefficient: -0"
