// S165 pre-lock critic — (a) the per-LAYER axis is outside separableFields entirely (incl. a layer
// with its OWN dataset), (b) quantify the over-suppression budget the proposal actually spends.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { refCorrelation, separableFields } from './S165CRIT_ref.mjs';

const mk = (marks, encoding, rows, extra = {}) => ({ $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks, encoding, a11y: { description: 'y over x' }, ...extra });
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Yq = { field: 'y', trait: 'EncodingY', type: 'quantitative' };

console.log('=== A. a LAYER with its OWN named dataset ===');
const layered = mk(
  [
    { trait: 'MarkLine', encodings: { x: X, y: Yq } },
    { trait: 'MarkLine', from: 'other', encodings: { x: X, y: Yq } },
  ],
  { x: X, y: Yq },
  [{ x: 1, y: 1 }, { x: 2, y: 5 }, { x: 3, y: 9 }],
  { datasets: { other: [{ x: 1, y: 90 }, { x: 2, y: 60 }, { x: 3, y: 30 }] } }
);
console.log('  dist =', analyzeVizSpec(layered).correlation, ' PROPOSED s165 =', refCorrelation(layered, 's165').correlation,
  ' separableFields =', JSON.stringify(separableFields(layered, 'x', 'y')));
console.log('  layer-1 dataset "other" pearson = -1.000 (FALLS) — never in collectRows()');
console.log('  compiled layers data =', JSON.stringify(toVegaLiteSpec(layered).layer?.map((L) => L.data)));
console.log('  keyFindings =', JSON.stringify(generateNarrativeSummary(layered).keyFindings));

console.log('\n=== B. OVER-SUPPRESSION BUDGET: how much silence does the proposal buy? ===');
let seed = 987654321;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const Yavg = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' };
const Ysum = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' };
const channelSets = [
  {},
  { color: { field: 'seg', trait: 'EncodingColor' } },
  { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
  { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
  { color: { field: 'seg', trait: 'EncodingColor', type: 'quantitative' } },
  { detail: { field: 'det', trait: 'EncodingDetail' } },
];
const yVariants = [Yq, Yavg, Ysum];
const markVariants = [['MarkPoint'], ['MarkLine'], ['MarkBar'], ['MarkLine', 'MarkPoint']];
let n = 0, narr164 = 0, narr165 = 0, newlySilent = 0, newlyLoud = 0;
for (let t = 0; t < 8000; t++) {
  const rows = [];
  const cnt = 6 + Math.floor(rng() * 8);
  for (let i = 0; i < cnt; i++) rows.push({ x: 1 + (i % (2 + Math.floor(rng() * 4))), y: Math.round(rng() * 100), seg: 'S' + (i % 3), sz: 1 + (i % 2), det: 'D' + (i % 2) });
  const enc = { x: X, y: yVariants[Math.floor(rng() * 3)], ...channelSets[Math.floor(rng() * channelSets.length)] };
  const spec = mk(markVariants[Math.floor(rng() * 4)].map((tr) => ({ trait: tr, encodings: enc })), enc, rows);
  let a, b;
  try { a = refCorrelation(spec, 's164'); b = refCorrelation(spec, 's165'); } catch { continue; }
  n++;
  const A = a.correlation !== undefined, B = b.correlation !== undefined;
  if (A) narr164++;
  if (B) narr165++;
  if (A && !B) newlySilent++;
  if (!A && B) newlyLoud++;
}
console.log(`  specs=${n}  narrates today(s164)=${narr164} (${(100 * narr164 / n).toFixed(1)}%)  narrates proposed(s165)=${narr165} (${(100 * narr165 / n).toFixed(1)}%)`);
console.log(`  newly SILENT (over-suppression cost) = ${newlySilent}  (${(100 * newlySilent / Math.max(1, narr164)).toFixed(1)}% of today's narrations)`);
console.log(`  newly LOUD  (MONOTONICITY VIOLATIONS) = ${newlyLoud}`);
