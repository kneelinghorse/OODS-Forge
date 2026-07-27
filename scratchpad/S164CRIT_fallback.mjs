// S164 hardened-critic — FALLBACK lens.
// Attack: a Simpson where EVERY (partition ∪ grouping) sub-series has exactly ONE x
// (distinct size per point => shred), BUT each COLOR partition group visibly FALLS.
// The draft's fallback ("EVERY sub-series n<2 -> narrate pooled") would then NARRATE a
// positive correlation over two visibly-falling colour groups — a phantom AND a regression,
// because the CURRENT s163 code (which classifies at the colour-partition level) SUPPRESSES it.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// colour A falls internally (x up, y down); colour B falls internally, shifted UP+RIGHT so
// the POOLED trend rises. Every point has a DISTINCT size => every (seg,sz) sub-series = 1 point.
function makeRows() {
  return [
    { x: 1, y: 30,  seg: 'A', sz: 11 },
    { x: 2, y: 20,  seg: 'A', sz: 12 },
    { x: 3, y: 10,  seg: 'A', sz: 13 },
    { x: 4, y: 130, seg: 'B', sz: 14 },
    { x: 5, y: 120, seg: 'B', sz: 15 },
    { x: 6, y: 110, seg: 'B', sz: 16 },
  ];
}

function run(label, aggregate) {
  const rows = makeRows();
  const yEnc = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
  if (aggregate) yEnc.aggregate = aggregate;
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: yEnc,
    color: { field: 'seg', trait: 'EncodingColor' },            // categorical -> ACTIVE partition
    size:  { field: 'sz', trait: 'EncodingSize', type: 'quantitative' }, // quant -> grouping only
  };
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: label, name: label,
    data: { name: 'd', values: rows },
    marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' },
  };
  const a = analyzeVizSpec(spec);
  const { summary } = generateNarrativeSummary(spec);
  console.log(`\n=== ${label} (agg=${aggregate || 'none'}) ===`);
  console.log('  CURRENT SUT analysis.correlation:', a.correlation, '  (undefined = suppressed)');
  console.log('  summary:', summary);
  console.log('  POOLED (all drawn cells):', pearson(rows.map(r => [r.x, r.y]))?.toFixed(4), '(narrated value)');
  // partition-level (colour) direction = what CURRENT code votes and what a viewer sees
  for (const seg of ['A', 'B']) {
    const sub = rows.filter(r => r.seg === seg).map(r => [r.x, r.y]);
    console.log(`  colour PARTITION seg=${seg} direction: pearson=${pearson(sub)?.toFixed(4)}  <- viewer sees this FALL`);
  }
  // proposed-fix sub-series = (partition ∪ grouping) = (seg, sz)
  const subKeys = {};
  for (const r of rows) { const k = `${r.seg}|${r.sz}`; (subKeys[k] ||= []).push([r.x, r.y]); }
  const nDistinctX = Object.entries(subKeys).map(([k, ps]) => [k, new Set(ps.map(p => p[0])).size]);
  console.log('  PROPOSED sub-series (seg,sz) distinct-x counts:', JSON.stringify(nDistinctX));
  const everyShred = nDistinctX.every(([, n]) => n < 2);
  console.log('  PROPOSED: EVERY sub-series n<2 (total shred) =>', everyShred, everyShred ? '=> FALLBACK => NARRATE POOLED' : '');
  return a.correlation;
}

const cNoAgg = run('fallbackNoAgg', undefined);
const cAvg   = run('fallbackAvg', 'average');

console.log('\n################ VERDICT ################');
console.log('CURRENT SUT (no-agg):', cNoAgg, ' CURRENT SUT (avg):', cAvg, ' (both undefined = CURRENT code suppresses)');
console.log('If PROPOSED fix falls back to pooled narrate here, it NARRATES a positive corr over two');
console.log('visibly-FALLING colour groups => PHANTOM + REGRESSION (current suppresses, fix would not).');
