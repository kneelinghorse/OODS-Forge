// MAIN-LOOP independent probe — sprint-165 genuine-close review.
//
// HYPOTHESIS: separableFields() returns FIELD NAMES and finestSeparableBuckets keys the drawn-mark
// buckets by keyFor(row, separable) — the RAW row value. But a TraitBinding carries `bin?: boolean`,
// and the cartesian adapter compiles it straight through (vega-lite-adapter.ts:293 `definition.bin`).
// So the marks are DRAWN separated by BIN, while every s165 band is keyed by the raw continuous value.
// A continuous field => every finest bucket holds one row => every band has n=1 distinct x => NO band
// can ever vote => G1' cannot suppress. The claimed "fail-safe SUPERSET of every field that could split
// the drawn marks" is a superset of FIELD NAMES but not of DRAWN BANDS.
//
// Written from scratch. Own pearson. Controls in the SAME run.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}

// Two clusters of `grp`. Cluster LO occupies grp 1..5, cluster HI occupies grp 91..95 — every grp value
// DISTINCT, so keying by the raw value shatters each band to one row. Vega-Lite's default binning over
// extent [1,95] puts them in two separate bins => two visibly distinct colour bands.
// Each band FALLS steeply. The between-band offset makes the pooled r RISE.
const FALLING = [
  { x: 1, y: 50, grp: 1 }, { x: 2, y: 44, grp: 2 }, { x: 3, y: 38, grp: 3 }, { x: 4, y: 32, grp: 4 }, { x: 5, y: 26, grp: 5 },
  { x: 6, y: 250, grp: 91 }, { x: 7, y: 244, grp: 92 }, { x: 8, y: 238, grp: 93 }, { x: 9, y: 232, grp: 94 }, { x: 10, y: 226, grp: 95 },
];
// HONEST twin: identical structure, identical bins, but both bands RISE. Must still narrate.
const RISING = [
  { x: 1, y: 26, grp: 1 }, { x: 2, y: 32, grp: 2 }, { x: 3, y: 38, grp: 3 }, { x: 4, y: 44, grp: 4 }, { x: 5, y: 50, grp: 5 },
  { x: 6, y: 226, grp: 91 }, { x: 7, y: 232, grp: 92 }, { x: 8, y: 238, grp: 93 }, { x: 9, y: 244, grp: 94 }, { x: 10, y: 250, grp: 95 },
];
// DISCRIMINATING CONTROL: the SAME falling rows, but `grp` replaced by the BIN LABEL a viewer actually
// sees (a categorical band id). If s165 suppresses here and narrates above, the ONLY difference is
// whether the gate keys by the drawn band or by the raw pre-bin value.
const FALLING_BINLABEL = FALLING.map((r) => ({ x: r.x, y: r.y, grp: r.grp < 50 ? 'bin_0_50' : 'bin_50_100' }));

const band = (rows, pick) => pearson(rows.filter(pick).map((r) => [r.x, r.y]));

function spec(rows, { bin, type }) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'grp', trait: 'EncodingColor', ...(type ? { type } : {}), ...(bin ? { bin: true } : {}) },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'binprobe', name: 'binprobe',
    data: { name: 'd', values: rows },
    marks: [{ trait: 'MarkPoint', encodings: enc }],
    encoding: enc,
    a11y: { description: 'y over x by grp' },
  };
}

function report(label, s) {
  const a = analyzeVizSpec(s);
  const { keyFindings, summary } = generateNarrativeSummary(s);
  const blob = JSON.stringify(keyFindings ?? []);
  const corr = (keyFindings ?? []).filter((k) => /correlat|relationship/i.test(JSON.stringify(k)));
  console.log(`\n=== ${label} ===`);
  console.log('  analyzeVizSpec.correlation =', a.correlation,
    a.correlation === undefined ? '  << SUPPRESSED' : '  << NARRATED');
  console.log('  correlation keyFindings   :', corr.length ? JSON.stringify(corr) : '(none)');
  if (/relationship|correlat/i.test(summary ?? '')) console.log('  summary mentions          :', summary);
  return a.correlation;
}

console.log('#### hand-computed DRAWN sub-series (my own pearson, not the SUT) ####');
console.log('  FALLING  band grp<50 (bin 0) r =', band(FALLING, (r) => r.grp < 50)?.toFixed(4));
console.log('  FALLING  band grp>50 (bin 1) r =', band(FALLING, (r) => r.grp > 50)?.toFixed(4));
console.log('  FALLING  pooled over all rows r =', pearson(FALLING.map((r) => [r.x, r.y]))?.toFixed(4));
console.log('  RISING   band grp<50 r =', band(RISING, (r) => r.grp < 50)?.toFixed(4),
  ' band grp>50 r =', band(RISING, (r) => r.grp > 50)?.toFixed(4));

console.log('\n#### render truth: does the adapter actually COMPILE the bin? ####');
const compiled = toVegaLiteSpec(spec(FALLING, { bin: true, type: 'quantitative' }));
const layers = compiled.layer ?? [compiled];
console.log('  compiled colour encodings:', JSON.stringify(layers.map((l) => l.encoding?.color)));

const rBinned = report('MAIN — colour bin:true, continuous grp, BOTH drawn bins FALL', spec(FALLING, { bin: true, type: 'quantitative' }));
const rHonest = report('CONTROL A (honest twin) — same bins, both bands RISE', spec(RISING, { bin: true, type: 'quantitative' }));
const rLabel = report('CONTROL B (discriminating) — same falling rows, grp = the BIN LABEL a viewer sees', spec(FALLING_BINLABEL, {}));
const rNoBin = report('CONTROL C — same falling rows + continuous grp but NO bin (unbinned quant colour ramp)', spec(FALLING, { type: 'quantitative' }));

console.log('\n#### VERDICT ####');
console.log('  MAIN narrated?           ', rBinned !== undefined, rBinned);
console.log('  honest twin narrated?    ', rHonest !== undefined, rHonest);
console.log('  bin-label control suppressed?', rLabel === undefined, rLabel);
console.log('  unbinned control         ', rNoBin === undefined ? 'suppressed' : `narrated ${rNoBin}`);
if (rBinned !== undefined && rLabel === undefined) {
  console.log('  >>> PHANTOM: the pooled r is narrated over two drawn colour bins that BOTH fall,');
  console.log('  >>> and the ONLY difference from the suppressed control is raw-value keying vs bin keying.');
}
