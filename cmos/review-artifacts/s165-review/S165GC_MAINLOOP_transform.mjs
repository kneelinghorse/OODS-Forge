// MAIN-LOOP probe 4 — spec.transforms.
// vega-lite-adapter.ts:127 merges convertTransforms(spec.transforms) into the COMPILED spec, so a
// `filter` transform genuinely removes rows from what is DRAWN. data-analysis.ts never applies
// spec.transforms (its only mention, :309, says marks/transforms are explicitly NOT modeled). So the
// narrated pooled r is computed over rows the chart does not draw.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// keep === true rows RISE; keep === false rows are steeply falling decoys that dominate the pool.
const rows = [
  { x: 1, y: 10, keep: true }, { x: 2, y: 20, keep: true }, { x: 3, y: 30, keep: true },
  { x: 4, y: 40, keep: true }, { x: 5, y: 50, keep: true },
  { x: 1, y: 900, keep: false }, { x: 2, y: 700, keep: false }, { x: 3, y: 500, keep: false },
  { x: 4, y: 300, keep: false }, { x: 5, y: 100, keep: false },
];
const drawn = rows.filter((r) => r.keep);
console.log('  r over ALL rows (what the analysis pools) =', pearson(rows.map((r) => [r.x, r.y])).toFixed(4));
console.log('  r over the DRAWN rows (filter applied)    =', pearson(drawn.map((r) => [r.x, r.y])).toFixed(4));

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const withFilter = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: rows },
  transforms: [{ type: 'filter', params: { filter: 'datum.keep === true' } }],
  marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' },
};
const noFilter = { ...withFilter, transforms: undefined, data: { name: 'd', values: rows } };
const preFiltered = { ...noFilter, data: { name: 'd', values: drawn } };

function run(label, s) {
  const a = analyzeVizSpec(s);
  const n = generateNarrativeSummary(s);
  const kf = (n.keyFindings ?? []).filter((k) => /correlat/i.test(JSON.stringify(k)));
  console.log(`\n${label}`);
  console.log('  compiled transform:', JSON.stringify(toVegaLiteSpec(s).transform ?? null));
  console.log('  correlation       :', a.correlation, a.correlation === undefined ? 'SUPPRESSED' : `NARRATED ${JSON.stringify(kf)}`);
  console.log('  summary           :', n.summary);
  return a.correlation;
}

const rF = run('A. WITH filter transform (renderer draws only keep===true, which RISES)', withFilter);
const rN = run('B. CONTROL no transform (renderer draws all 10 rows)', noFilter);
const rP = run('C. CONTROL data pre-filtered in the rows themselves (ground truth for A)', preFiltered);

console.log('\n#### VERDICT ####');
console.log('  A (filter transform) narrated:', rF);
console.log('  C (what A actually draws)    :', rP);
if (rF !== undefined && rP !== undefined && Math.sign(rF) !== Math.sign(rP)) {
  console.log('  >>> SIGN INVERSION: the narrated coefficient has the OPPOSITE sign to the drawn marks.');
} else if (rF !== undefined && rF !== rP) {
  console.log('  >>> MISMATCH: narrated', rF, 'vs the drawn rows actual', rP);
}
