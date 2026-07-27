// MAIN-LOOP confirmation — isolate the MECHANISM of the bin phantom.
// Claim under test: `grp` IS enumerated by separableFields (the field enumeration is fine); the defect is
// that the BAND GRANULARITY is the raw row value, not the compiled bin. If that is right then the SAME
// spec with the SAME bin:true, differing ONLY in how many DISTINCT RAW values grp takes, must flip the
// decision — 2 distinct raw values (raw key == bin key) suppresses, many distinct raw values narrates.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

const Y_LO = [50, 44, 38, 32, 26];   // falls
const Y_HI = [250, 244, 238, 232, 226]; // falls

// grpLo/grpHi are the RAW values inside each bin. Same two bins either way (extent 1..95, default binning).
function rows(grpLo, grpHi) {
  return [
    ...Y_LO.map((y, i) => ({ x: i + 1, y, grp: grpLo[i] })),
    ...Y_HI.map((y, i) => ({ x: i + 6, y, grp: grpHi[i] })),
  ];
}
const MANY = rows([1, 2, 3, 4, 5], [91, 92, 93, 94, 95]);       // 10 distinct raw grp values
const TWO = rows([3, 3, 3, 3, 3], [93, 93, 93, 93, 93]);        // 2 distinct raw grp values, SAME two bins

function spec(data, channel, extra) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    [channel]: { field: 'grp', trait: channel === 'size' ? 'EncodingSize' : 'EncodingColor', type: 'quantitative', ...extra },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
    data: { name: 'd', values: data },
    marks: [{ trait: 'MarkPoint', encodings: enc }],
    encoding: enc, a11y: { description: 'y over x' },
  };
}

function run(label, s) {
  const a = analyzeVizSpec(s);
  const kf = (generateNarrativeSummary(s).keyFindings ?? []).filter((k) => /correlat/i.test(JSON.stringify(k)));
  console.log(`  ${label.padEnd(62)} corr = ${String(a.correlation).padEnd(9)} ${a.correlation === undefined ? 'SUPPRESSED' : 'NARRATED  ' + JSON.stringify(kf)}`);
  return a.correlation;
}

console.log('drawn bands (my pearson): lo =', pearson(MANY.slice(0, 5).map((r) => [r.x, r.y])).toFixed(3),
  ' hi =', pearson(MANY.slice(5).map((r) => [r.x, r.y])).toFixed(3),
  ' pooled =', pearson(MANY.map((r) => [r.x, r.y])).toFixed(3));
console.log('compiled colour (bin):', JSON.stringify((toVegaLiteSpec(spec(MANY, 'color', { bin: true })).layer ?? [toVegaLiteSpec(spec(MANY, 'color', { bin: true }))])[0].encoding.color));

console.log('\n#### A. colour bin:true — ONLY the raw-value CARDINALITY differs; the two DRAWN bins are identical ####');
const a1 = run('10 distinct raw grp values (drawn: 2 bins, both fall)', spec(MANY, 'color', { bin: true }));
const a2 = run(' 2 distinct raw grp values (drawn: 2 bins, both fall)', spec(TWO, 'color', { bin: true }));

console.log('\n#### B. same on the SIZE channel ####');
const b1 = run('size bin:true, 10 distinct raw values', spec(MANY, 'size', { bin: true }));
const b2 = run('size bin:true,  2 distinct raw values', spec(TWO, 'size', { bin: true }));

console.log('\n#### C. timeUnit — the other declared discretiser ####');
const tRows = MANY.map((r, i) => ({ x: r.x, y: r.y, grp: i < 5 ? `2021-0${i + 1}-01` : `2024-0${i - 4}-01` }));
const tSpecEnc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'grp', trait: 'EncodingColor', type: 'temporal', timeUnit: 'year' },
};
const tSpec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values: tRows },
  marks: [{ trait: 'MarkPoint', encodings: tSpecEnc }], encoding: tSpecEnc, a11y: { description: 'y over x' },
};
console.log('  compiled colour:', JSON.stringify((toVegaLiteSpec(tSpec).layer ?? [toVegaLiteSpec(tSpec)])[0].encoding.color));
const c1 = run('timeUnit:year colour, 10 distinct raw dates → 2 drawn year bands', tSpec);

console.log('\n#### MECHANISM VERDICT ####');
console.log('  colour: many-raw =', a1, '| two-raw =', a2,
  a1 !== undefined && a2 === undefined ? '→ CONFIRMED: granularity, not enumeration' : '→ not confirmed');
console.log('  size  : many-raw =', b1, '| two-raw =', b2,
  b1 !== undefined && b2 === undefined ? '→ CONFIRMED' : '→ not confirmed');
console.log('  timeUnit:', c1, c1 !== undefined ? '→ NARRATED (same defect)' : '→ suppressed');
