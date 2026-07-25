// MAIN-LOOP independent reproduction of the s164 genuine-close survivor candidate.
// Claim: a layered ("mixed") mark + a categorical SHAPE series splitter carries a Simpson that
// BOTH gates pool over, because markSplitsByRetina('mixed')=false drops shape from partition AND grouping.
// Built from scratch (not reusing any agent probe). Hand-computes every drawn sub-series direction.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// Two shape groups, EACH falling; pooled (between-band offset) rises. seg=shape splitter.
function rows() {
  return [
    { x: 1, y: 30, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 10, shp: 'circle' }, // falls
    { x: 4, y: 130, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 110, shp: 'square' }, // falls
  ];
}
// honest control: both groups RISE, pooled rises
function rowsHonest() {
  return [
    { x: 1, y: 10, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 30, shp: 'circle' },
    { x: 4, y: 110, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 130, shp: 'square' },
  ];
}

function build(markTraits, splitChannel, data) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    [splitChannel]: { field: 'shp', trait: splitChannel === 'shape' ? 'EncodingShape' : 'EncodingColor' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: data },
    marks: markTraits.map((t) => ({ trait: t, encodings: enc })),
    encoding: enc, a11y: { description: 'y over x' },
  };
}

function report(label, spec) {
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  const corrFinding = (keyFindings || []).find((k) => /[Cc]orrelation/.test(JSON.stringify(k)));
  console.log(`\n=== ${label} ===`);
  console.log('  resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('  analyzeVizSpec.correlation =', a.correlation, a.correlation === undefined ? '(SUPPRESSED)' : '(NARRATED)');
  console.log('  correlation keyFinding    :', corrFinding ? JSON.stringify(corrFinding) : '(none)');
  return a.correlation;
}

console.log('#### hand-computed drawn sub-series (Simpson data) ####');
const r = rows();
for (const g of ['circle', 'square']) {
  console.log(`  shape=${g}:`, pearson(r.filter((x) => x.shp === g).map((x) => [x.x, x.y]))?.toFixed(3), '(FALLS if <0)');
}
console.log('  POOLED over all 6 :', pearson(r.map((x) => [x.x, x.y]))?.toFixed(3), '(between-band offset)');

const survivor = report('PHANTOM CANDIDATE: mixed [Line,Point] + shape (each group FALLS)', build(['MarkLine', 'MarkPoint'], 'shape', rows()));
const ctlPoint = report('CONTROL A: single MarkPoint + shape (shape splits point -> should partition -> undefined)', build(['MarkPoint'], 'shape', rows()));
const ctlLine  = report('CONTROL B: single MarkLine + shape (should partition -> undefined)', build(['MarkLine'], 'shape', rows()));
const ctlColor = report('CONTROL C: mixed [Line,Point] + COLOR categorical (color NOT mark-gated -> should suppress -> undefined)', build(['MarkLine', 'MarkPoint'], 'color', rows()));
const honest   = report('SANITY: mixed [Line,Point] + shape but both groups RISE (honest -> may narrate positive)', build(['MarkLine', 'MarkPoint'], 'shape', rowsHonest()));

console.log('\n#### VERDICT ####');
console.log('survivor (mixed+shape, groups fall):', survivor, survivor !== undefined && survivor > 0 ? '=> PHANTOM CONFIRMED (defined positive over falling sub-series)' : '=> not reproduced');
console.log('control A single-point+shape       :', ctlPoint, ctlPoint === undefined ? '(correctly suppressed)' : '(!!)');
console.log('control B single-line+shape        :', ctlLine, ctlLine === undefined ? '(correctly suppressed)' : '(!!)');
console.log('control C mixed+color              :', ctlColor, ctlColor === undefined ? '(correctly suppressed)' : '(!!)');
console.log('sanity   mixed+shape honest-rise   :', honest);
