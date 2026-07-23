// s160 adversarial review — parent-defect re-kill S1 (s159 CRIT survivor):
// F-SIMPSON faceted correlation phantom + facet=none color-series twin.
//
// HAND ORACLE (independent of the SUT):
//   Rows (3 panels): A x=1,2,3 y=10,9,8 · B x=11,12,13 y=20,19,18 · C x=21,22,23 y=30,29,28
//   x-mean = 108/9 = 12; y-mean = 171/9 = 19
//   Σ(x-12)(y-19) = (99+100+99) + (-1+0-1) + (99+100+99) = 298 - 2 + 298 = 594
//   Σ(x-12)^2 = (121+100+81)+(1+0+1)+(81+100+121) = 606 ; Σ(y-19)^2 = 606
//   POOLED r = 594/606 = 0.980198…  → rounds to 0.98 (the phantom s159 narrated)
//   PER-PANEL r = -1 exactly (each panel: x +1 step, y -1 step)
//   Shape-B expectation: pooled sign(+) contradicts common group sign(-) → SUPPRESS.
// KEEP-CONTROLS (prove the re-kill is NOT the weaker blanket-suppression form):
//   (K1) faceted sign-CONSISTENT: panels A(1,30)(2,29)(3,28) B(11,20)(12,19)(13,18):
//        x-mean 42/6=7, y-mean 144/6=24, Σxy-dev = -(36+25+16+16+25+36) = -154,
//        Σx² = 154, Σy² = 154 → pooled r = -1; groups r = -1,-1 → NARRATES -1.
//   (K2) single-series descending scatter (1,3)(2,2)(3,1): r = -1 → NARRATES.
const path = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.cjs';
const { generateNarrativeSummary } = require(path);

const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name}: ${detail}`);
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${cond ? '' : ' :: ' + detail}`);
}

const simpsonRows = [
  { x: 1, y: 10, panel: 'A' }, { x: 2, y: 9, panel: 'A' }, { x: 3, y: 8, panel: 'A' },
  { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
  { x: 21, y: 30, panel: 'C' }, { x: 22, y: 29, panel: 'C' }, { x: 23, y: 28, panel: 'C' },
];
const scatterEncoding = () => ({
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
});

function pointSpec(id, rows, { encoding, layout }) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id, name: id,
    data: { name: id, values: rows },
    marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
    encoding,
    ...(layout ? { layout } : {}),
    a11y: { description: 'y over x' },
  };
}

function assertNoCorrelation(tag, res) {
  const text = [res.summary, ...res.keyFindings].join(' | ');
  check(`${tag}: analysis.correlation is undefined`, res.analysis.correlation === undefined,
    `correlation=${res.analysis.correlation}`);
  check(`${tag}: no 'Correlation coefficient' keyFinding`, !res.keyFindings.some((f) => /Correlation/i.test(f)),
    JSON.stringify(res.keyFindings));
  check(`${tag}: no 'relationship' sentence in summary`, !/relationship/i.test(res.summary), res.summary);
  check(`${tag}: token 0.98 nowhere in summary+keyFindings`, !/0[.,]98/.test(text), text);
  check(`${tag}: no 'strong positive' claim`, !/strong positive/i.test(text), text);
}

// --- S1a: F-SIMPSON faceted (the s159 CRIT fixture, memo §1.1) ---
const faceted = generateNarrativeSummary(
  pointSpec('simpson-facet', simpsonRows, {
    encoding: scatterEncoding(),
    layout: { trait: 'LayoutFacet', rows: { field: 'panel' } },
  })
);
console.log('S1a summary:', faceted.summary);
console.log('S1a keyFindings:', JSON.stringify(faceted.keyFindings));
assertNoCorrelation('S1a faceted F-SIMPSON', faceted);

// --- S1b: facet=none color-series twin (same 9 rows, panel bound to categorical color) ---
const twinEncoding = { ...scatterEncoding(), color: { field: 'panel', trait: 'EncodingColor' } };
const twin = generateNarrativeSummary(pointSpec('simpson-color', simpsonRows, { encoding: twinEncoding }));
console.log('S1b summary:', twin.summary);
console.log('S1b keyFindings:', JSON.stringify(twin.keyFindings));
assertNoCorrelation('S1b color-series twin', twin);

// --- K1: faceted sign-CONSISTENT keep-control → must still narrate r = -1 ---
const consistentRows = [
  { x: 1, y: 30, panel: 'A' }, { x: 2, y: 29, panel: 'A' }, { x: 3, y: 28, panel: 'A' },
  { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
];
const keep = generateNarrativeSummary(
  pointSpec('consistent-facet', consistentRows, {
    encoding: scatterEncoding(),
    layout: { trait: 'LayoutFacet', rows: { field: 'panel' } },
  })
);
console.log('K1 summary:', keep.summary);
console.log('K1 keyFindings:', JSON.stringify(keep.keyFindings));
check('K1: sign-consistent faceted r = -1 STILL NARRATES (hand oracle: pooled -154/154 = -1)',
  keep.analysis.correlation === -1, `correlation=${keep.analysis.correlation}`);
check('K1: strong negative sentence present', /strong negative/i.test(keep.summary), keep.summary);
check('K1: Correlation coefficient keyFinding present', keep.keyFindings.some((f) => /Correlation coefficient/.test(f)),
  JSON.stringify(keep.keyFindings));

// --- K2: single-series scatter keep-control r = -1 (hand: perfect descending line) ---
const single = generateNarrativeSummary(
  pointSpec('single', [{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }], { encoding: scatterEncoding() })
);
check('K2: single-series r = -1 narrates', single.analysis.correlation === -1,
  `correlation=${single.analysis.correlation}`);

// --- S1c: multi-series LINE variant — the mark-INDEPENDENT keyFindings site (narrative-generator
// buildKeyFindings emits 'Correlation coefficient' for ANY mark). Same Simpson rows, MarkLine +
// color grouping: the phantom must be suppressed at this second emission site too.
const lineEncoding = { ...scatterEncoding(), color: { field: 'panel', trait: 'EncodingColor' } };
const lineSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'simpson-line', name: 'simpson-line',
  data: { name: 'sl', values: simpsonRows },
  marks: [{ trait: 'MarkLine', encodings: { ...lineEncoding } }],
  encoding: lineEncoding,
  a11y: { description: 'y over x' },
};
const lineRes = generateNarrativeSummary(lineSpec);
console.log('S1c summary:', lineRes.summary);
console.log('S1c keyFindings:', JSON.stringify(lineRes.keyFindings));
check('S1c multi-series LINE: analysis.correlation undefined', lineRes.analysis.correlation === undefined,
  `correlation=${lineRes.analysis.correlation}`);
check('S1c multi-series LINE: no Correlation keyFinding (the mark-independent site)',
  !lineRes.keyFindings.some((f) => /Correlation/i.test(f)), JSON.stringify(lineRes.keyFindings));
check('S1c multi-series LINE: token 0.98 nowhere', !/0[.,]98/.test([lineRes.summary, ...lineRes.keyFindings].join('|')),
  [lineRes.summary, ...lineRes.keyFindings].join('|'));

console.log(failures.length === 0 ? '\nS1 RE-KILL CONFIRMED (all checks pass)' : `\nS1 SURVIVOR ALIVE / WEAKENED: ${failures.length} failure(s)`);
process.exit(failures.length === 0 ? 0 : 1);
