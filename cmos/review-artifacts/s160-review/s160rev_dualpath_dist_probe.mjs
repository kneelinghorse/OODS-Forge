// s160 adversarial review — dual-path live verifier — DIST-IMPORT probes (public barrel only).
// Every expected value is HAND-DERIVED in this file, independent of the SUT:
//   P1 faceted aggregated heatmap: 4 rows, one row per (panel,x,y) cell -> sums are the raw values
//      {10,30,54,94}; vm extent = [min,max] of drawn cells = [10,94]; total = 10+30+54+94 = 188.
//   P2 F-SIMPSON: pooled r = 594/606 (hand arithmetic below) ~ +0.98; each panel r = -1 exactly
//      (perfect descending lines) -> Shape B sign gate MUST suppress (sign(+) != common sign(-)).
//   P3 no-dimension sum [1e9,-1e9,0.1,0.2]: expected total = explicit ascending-order fold
//      computed HERE on my own literal array (documented stableSum order: sort asc, left fold).
import * as viz from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const results = [];
function check(name, actual, expected) {
  const pass = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, expected, actual });
}

// ---------- P0: DIST-SANITY (internal names absent from the runtime barrel) ----------
for (const internal of ['drawnCellKeyFields', 'narrateNumber', 'findNonDrawnNarrativeValues',
  'enforceDrawnValueInvariant', 'expectedNarratableCorrelation']) {
  check(`P0 barrel lacks ${internal}`, viz[internal] === undefined, true);
}
check('P0 barrel has analyzeVizSpec', typeof viz.analyzeVizSpec, 'function');
check('P0 barrel has toEChartsOption', typeof viz.toEChartsOption, 'function');
check('P0 barrel has generateNarrativeSummary', typeof viz.generateNarrativeSummary, 'function');

// ---------- P1: faceted aggregated ECharts heatmap ----------
const facetRows = [
  { site: 'A', region: 'N', hour: '9', temp: 10 },
  { site: 'B', region: 'N', hour: '9', temp: 30 },
  { site: 'A', region: 'S', hour: '9', temp: 54 },
  { site: 'B', region: 'S', hour: '9', temp: 94 },
];
const heatColor = { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' };
const heatEnc = {
  x: { field: 'region', trait: 'EncodingX', scale: 'band' },
  y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
  color: { ...heatColor },
};
const facetSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'rev-facet-heat',
  name: 'review faceted heatmap',
  data: { name: 'fh', values: facetRows },
  marks: [{ trait: 'MarkRect', encodings: { ...heatEnc } }],
  encoding: heatEnc,
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
  a11y: { description: 'temp by region and hour per site' },
};
// HAND-DERIVED: each (site,region,hour) group has exactly 1 row => sum == that row's temp.
// cells sorted asc = [10,30,54,94]; min 10; max 94; total 10+30 = 40, +54 = 94, +94 = 188.
const opt = viz.toEChartsOption(facetSpec);
const base = (opt.dataset ?? [])[0]?.source ?? [];
check('P1 base cell count', base.length, 4);
check('P1 cells carry facet field site', base.every((r) => 'site' in r), true);
check('P1 cell temps sorted', base.map((r) => Number(r.temp)).sort((a, b) => a - b), [10, 30, 54, 94]);
const vm = Array.isArray(opt.visualMap) ? opt.visualMap[0] : opt.visualMap;
check('P1 visualMap.min', vm?.min, 10);
check('P1 visualMap.max', vm?.max, 94);
const derived = (opt.dataset ?? []).filter((d) => d.fromDatasetId !== undefined);
check('P1 derived panel dataset count >= 2', derived.length >= 2, true);
let allPanelsNonEmpty = derived.length > 0;
const panelMatches = [];
for (const p of derived) {
  const filters = p.transform ?? [];
  const matches = base.filter((row) => filters.every((t) => row[t.config.field] === t.config.value));
  panelMatches.push(matches.length);
  if (filters.length === 0 || matches.length === 0) allPanelsNonEmpty = false;
}
check('P1 every panel filter non-empty', allPanelsNonEmpty, true);
results.push({ name: 'P1 panel match counts (info)', pass: true, expected: 'info', actual: panelMatches });
const facetAnalysis = viz.analyzeVizSpec(facetSpec);
check('P1 narrative min', facetAnalysis.min?.value, 10);
check('P1 narrative max', facetAnalysis.max?.value, 94);
check('P1 narrative total', facetAnalysis.total, 188);

// ---------- P2: faceted Simpson correlation SUPPRESSED ----------
// HAND ORACLE for pooled r: x = 1,2,3,11,12,13,21,22,23 (mean 108/9 = 12);
// y = 10,9,8,20,19,18,30,29,28 (mean 171/9 = 19).
// dx = [-11,-10,-9,-1,0,1,9,10,11]; dy = [-9,-10,-11,1,0,-1,11,10,9]
// sum(dx*dy) = 99+100+99-1+0-1+99+100+99 = 594; sum(dx^2) = sum(dy^2) = 606
// pooled r = 594/606 = +0.9802 -> narrates "0.98" IF NOT suppressed.
// Each panel: x asc 1-unit, y desc 1-unit, perfectly linear -> r = -1 exactly.
// Shape B: sign(pooled)=+1, every computable group sign=-1 -> MUST SUPPRESS.
const simpsonRows = [
  { x: 1, y: 10, panel: 'A' }, { x: 2, y: 9, panel: 'A' }, { x: 3, y: 8, panel: 'A' },
  { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
  { x: 21, y: 30, panel: 'C' }, { x: 22, y: 29, panel: 'C' }, { x: 23, y: 28, panel: 'C' },
];
const scatterEnc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const simpsonFacetSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'rev-simpson',
  name: 'review simpson facet',
  data: { name: 's', values: simpsonRows },
  marks: [{ trait: 'MarkPoint', encodings: { ...scatterEnc } }],
  encoding: scatterEnc,
  layout: { trait: 'LayoutFacet', rows: { field: 'panel' } },
  a11y: { description: 'y over x by panel' },
};
const sa = viz.analyzeVizSpec(simpsonFacetSpec);
check('P2 analysis.correlation suppressed', sa.correlation, undefined);
const sn = viz.generateNarrativeSummary(simpsonFacetSpec);
const sText = [sn.summary, ...(sn.keyFindings ?? [])].join(' | ');
check('P2 narrative has no correlation token', /orrelation|relationship/i.test(sText), false);
check('P2 narrative has no 0.98', sText.includes('0.98'), false);
results.push({ name: 'P2 narrative (info)', pass: true, expected: 'info', actual: sText.slice(0, 300) });

// P2b: facet=none color-series twin (same rows, panel bound to color) must ALSO suppress.
const twinEnc = { ...scatterEnc, color: { field: 'panel', trait: 'EncodingColor' } };
const simpsonColorSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'rev-simpson-color',
  name: 'review simpson color twin',
  data: { name: sc => 'sc', values: simpsonRows },
  marks: [{ trait: 'MarkPoint', encodings: { ...twinEnc } }],
  encoding: twinEnc,
  a11y: { description: 'y over x by panel series' },
};
simpsonColorSpec.data = { name: 'sc', values: simpsonRows };
const sca = viz.analyzeVizSpec(simpsonColorSpec);
check('P2b color-twin correlation suppressed', sca.correlation, undefined);
const scn = viz.generateNarrativeSummary(simpsonColorSpec);
const scText = [scn.summary, ...(scn.keyFindings ?? [])].join(' | ');
check('P2b twin narrative no correlation token', /orrelation/i.test(scText), false);

// P2c KEEP-CONTROL: a single-series descending scatter must STILL narrate r = -1.
// HAND ORACLE: rows (1,3),(2,2),(3,1): dx=[-1,0,1], dy=[1,0,-1], r = -2/(sqrt2*sqrt2) = -1.
const descSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'rev-desc',
  name: 'review descending scatter',
  data: { name: 'd', values: [{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }] },
  marks: [{ trait: 'MarkPoint', encodings: { ...scatterEnc } }],
  encoding: scatterEnc,
  a11y: { description: 'y over x' },
};
const da = viz.analyzeVizSpec(descSpec);
check('P2c keep-control r = -1', da.correlation, -1);
const dn = viz.generateNarrativeSummary(descSpec);
const dText = [dn.summary, ...(dn.keyFindings ?? [])].join(' | ');
check('P2c keep-control narrates correlation', /orrelation/i.test(dText), true);
results.push({ name: 'P2c narrative (info)', pass: true, expected: 'info', actual: dText.slice(0, 300) });

// ---------- P3: no-dimension Total, extrema silent ----------
// HAND ORACLE: documented canonical order = sort ascending, left fold, computed HERE on
// literals (not via the SUT): [-1e9, 0.1, 0.2, 1e9].
const handFold = [[-1e9, 0.1, 0.2, 1e9]].map((arr) => arr.reduce((s, v) => s + v, 0))[0];
results.push({ name: 'P3 hand fold constant (info)', pass: true, expected: 'info', actual: handFold });
check('P3 hand fold equals claimed constant', handFold, 0.30000007152557373);
const noDimEnc = { y: { field: 'value', trait: 'EncodingY', aggregate: 'sum' } };
const noDimSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'rev-nodim',
  name: 'review no-dimension sum',
  data: { name: 'n', values: [1e9, -1e9, 0.1, 0.2].map((value) => ({ value })) },
  marks: [{ trait: 'MarkBar', encodings: { ...noDimEnc } }],
  encoding: noDimEnc,
  a11y: { description: 'sum of value' },
};
const na = viz.analyzeVizSpec(noDimSpec);
check('P3 analysis.total EXACT', na.total, 0.30000007152557373);
check('P3 max silent', na.max, undefined);
check('P3 min silent', na.min, undefined);
const nn = viz.generateNarrativeSummary(noDimSpec);
const nText = [nn.summary, ...(nn.keyFindings ?? [])].join(' | ');
check('P3 keyFindings carry a Total', (nn.keyFindings ?? []).some((f) => f.startsWith('Total ')), true);
check('P3 no High finding', (nn.keyFindings ?? []).some((f) => /^High/i.test(f)), false);
check('P3 no Low finding', (nn.keyFindings ?? []).some((f) => /^Low/i.test(f)), false);
results.push({ name: 'P3 narrative (info)', pass: true, expected: 'info', actual: nText.slice(0, 300) });

// ---------- report ----------
let failures = 0;
for (const r of results) {
  if (r.expected === 'info') { console.log(`[info] ${r.name}:`, JSON.stringify(r.actual)); continue; }
  if (!r.pass) failures += 1;
  console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name} expected=${JSON.stringify(r.expected)} actual=${JSON.stringify(r.actual)}`);
}
console.log(failures === 0 ? 'ALL DIST PROBES PASS' : `${failures} DIST PROBE FAILURES`);
process.exit(failures === 0 ? 0 : 1);
