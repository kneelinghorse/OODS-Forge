// MAIN-LOOP independent re-verification of the FOUR survivors s165 claims to have CLOSED.
// Rebuilt from the survivor descriptions in the sprint charter, not copied from the build's fixtures.
// Every arm ships with a keep-control that MUST narrate, in the same run.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Y = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const spec = (marks, enc, values, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values }, marks, encoding: enc, a11y: { description: 'y over x' }, ...extra,
});
function run(label, s, expect) {
  const a = analyzeVizSpec(s);
  const kf = (generateNarrativeSummary(s).keyFindings ?? []).filter((k) => /correlat/i.test(JSON.stringify(k)));
  const got = a.correlation === undefined ? 'SUPPRESSED' : `NARRATED ${a.correlation}`;
  const ok = expect === 'suppress' ? a.correlation === undefined : a.correlation !== undefined;
  console.log(`  ${ok ? 'PASS' : '**FAIL**'}  ${label.padEnd(56)} ${got} ${kf.length ? JSON.stringify(kf) : ''}`);
  return a.correlation;
}

// two bands, both FALLING, offset so pooled RISES — the canonical Simpson payload
const simpson = (field, a, b) => [
  { x: 1, y: 30, [field]: a }, { x: 2, y: 20, [field]: a }, { x: 3, y: 10, [field]: a },
  { x: 4, y: 130, [field]: b }, { x: 5, y: 120, [field]: b }, { x: 6, y: 110, [field]: b },
];
const honest = (field, a, b) => [
  { x: 1, y: 10, [field]: a }, { x: 2, y: 20, [field]: a }, { x: 3, y: 30, [field]: a },
  { x: 4, y: 110, [field]: b }, { x: 5, y: 120, [field]: b }, { x: 6, y: 130, [field]: b },
];
console.log('payload bands (my pearson): both', pearson(simpson('g', 'A', 'B').slice(0, 3).map((r) => [r.x, r.y])).toFixed(2),
  'and', pearson(simpson('g', 'A', 'B').slice(3).map((r) => [r.x, r.y])).toFixed(2),
  '| pooled', pearson(simpson('g', 'A', 'B').map((r) => [r.x, r.y])).toFixed(3), '\n');

console.log('SURVIVOR A — categorical shape on a layered/"mixed" mark');
const encA = { x: X, y: Y, shape: { field: 'g', trait: 'EncodingShape' } };
run('A  marks=[MarkLine,MarkPoint] + shape, both bands fall', spec([{ trait: 'MarkLine', encodings: encA }, { trait: 'MarkPoint', encodings: encA }], encA, simpson('g', 'circle', 'square')), 'suppress');
run('A  keep-control: same shape spec, both bands RISE', spec([{ trait: 'MarkLine', encodings: encA }, { trait: 'MarkPoint', encodings: encA }], encA, honest('g', 'circle', 'square')), 'narrate');

console.log('\nSURVIVOR B — quantitative colour ramp on a sum-stacked bar');
const encB = { x: X, y: { ...Y, aggregate: 'sum' }, color: { field: 'g', trait: 'EncodingColor', type: 'quantitative' } };
run('B  MarkBar sum(y) + quantitative colour, band falls', spec([{ trait: 'MarkBar', encodings: encB }], encB, simpson('g', 1, 2)), 'suppress');
run('B  keep-control: same shape, band RISES', spec([{ trait: 'MarkBar', encodings: encB }], encB, honest('g', 1, 2)), 'narrate');

console.log('\nSURVIVOR C — collinear categorical partition shatters a size Simpson');
// size carries the Simpson; a categorical colour collinear with x shatters each partition group to n=1
const cRows = simpson('sz', 10, 20).map((r, i) => ({ ...r, seg: `s${i}` }));
const encC = { x: X, y: { ...Y, aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
run('C  size Simpson + collinear categorical partition', spec([{ trait: 'MarkPoint', encodings: encC }], encC, cRows), 'suppress');
const cHonest = honest('sz', 10, 20).map((r, i) => ({ ...r, seg: `s${i}` }));
run('C  keep-control: same structure, bands RISE', spec([{ trait: 'MarkPoint', encodings: encC }], encC, cHonest), 'narrate');

console.log('\nSURVIVOR D — per-layer bindings (resolveBinding saw only layer 0)');
const dRows = simpson('grp', 'p', 'q').map((r) => ({ ...r, seg: r.x <= 3 ? 'L' : 'R' }));
const encD0 = { x: X, y: Y, color: { field: 'seg', trait: 'EncodingColor' } };
const encD1 = { x: X, y: Y, color: { field: 'grp', trait: 'EncodingColor' } };
const dSpec = spec([{ trait: 'MarkLine', encodings: encD0 }, { trait: 'MarkPoint', encodings: encD1 }], encD0, dRows);
console.log('  compiled layer colours:', JSON.stringify((toVegaLiteSpec(dSpec).layer ?? []).map((l) => l.encoding?.color?.field)));
run('D  marks=[MarkLine{color:seg},MarkPoint{color:grp}]', dSpec, 'suppress');
const dHonestRows = honest('grp', 'p', 'q').map((r) => ({ ...r, seg: r.x <= 3 ? 'L' : 'R' }));
run('D  keep-control: same layers, bands RISE', spec([{ trait: 'MarkLine', encodings: encD0 }, { trait: 'MarkPoint', encodings: encD1 }], encD0, dHonestRows), 'narrate');

console.log('\nGLOBAL keep-control (nothing must be silenced wholesale)');
run('plain single-series rise, no splitter at all', spec([{ trait: 'MarkPoint', encodings: { x: X, y: Y } }], { x: X, y: Y }, [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }, { x: 4, y: 40 }]), 'narrate');
