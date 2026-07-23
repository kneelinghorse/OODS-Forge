// s160 adversarial review — parent-defect re-kill S2 (s159 HIGH survivor, m5 regression):
// faceted aggregated ECharts heatmap — base dataset must NOT pool across panels; panel filters
// must be NON-empty; visualMap extent == narrative extrema.
//
// HAND ORACLE (independent):
//   raw rows (color aggregate 'sum' on temp):
//     site P1: (N,9): 4+6      = 10   (S,9): 50+4 = 54
//     site P2: (N,9): 10+20    = 30   (S,9): 90+4 = 94
//   DRAWN per-panel cells = {10, 54, 30, 94}  → extent 10..94, Σ = 188
//   The s159 bug pooled by (x,y) only: (N,9)=4+6+10+20=40, (S,9)=50+4+90+4=148 → {40,148},
//   and panel filters (site == P1/P2) matched NOTHING because cells dropped the site field.
const path = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.cjs';
const { toEChartsOption, generateNarrativeSummary } = require(path);

const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name}: ${detail}`);
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${cond ? '' : ' :: ' + detail}`);
}

const rows = [
  { region: 'N', hour: '9', site: 'P1', temp: 4 },
  { region: 'N', hour: '9', site: 'P1', temp: 6 },
  { region: 'S', hour: '9', site: 'P1', temp: 50 },
  { region: 'S', hour: '9', site: 'P1', temp: 4 },
  { region: 'N', hour: '9', site: 'P2', temp: 10 },
  { region: 'N', hour: '9', site: 'P2', temp: 20 },
  { region: 'S', hour: '9', site: 'P2', temp: 90 },
  { region: 'S', hour: '9', site: 'P2', temp: 4 },
];
const encoding = {
  x: { field: 'region', trait: 'EncodingX', scale: 'band' },
  y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
  color: { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'facet-heat', name: 'facet-heat',
  data: { name: 'fh', values: rows },
  marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
  encoding,
  layout: { trait: 'LayoutFacet', columns: { field: 'site' } },
  a11y: { description: 'temp by region/hour per site' },
};

const option = toEChartsOption(spec);
const datasets = option.dataset;
const base = datasets[0];
const source = base.source;
console.log('base dataset source:', JSON.stringify(source));

// 1) base dataset = the 4 per-panel drawn cells, NOT the 2 pooled cells
const temps = source.map((r) => r.temp).sort((a, b) => a - b);
check('S2: base dataset cell values are exactly [10,30,54,94] (hand-summed per panel)',
  JSON.stringify(temps) === JSON.stringify([10, 30, 54, 94]), JSON.stringify(temps));
check('S2: NO pooled 40 in dataset', !temps.includes(40), JSON.stringify(temps));
check('S2: NO pooled 148 in dataset', !temps.includes(148), JSON.stringify(temps));
check('S2: every cell CARRIES the facet field `site`', source.every((r) => 'site' in r),
  JSON.stringify(source));

// 2) every per-panel dataset filter is NON-empty when applied by hand to the base source
const panelDatasets = datasets.filter((d) => d.fromDatasetId === base.id);
check('S2: exactly 2 panel datasets (site P1, P2)', panelDatasets.length === 2, `n=${panelDatasets.length}`);
for (const pd of panelDatasets) {
  const filters = (pd.transform ?? []).filter((t) => t.type === 'filter').map((t) => t.config);
  const matched = source.filter((row) => filters.every((f) => row[f.field] === f.value));
  check(`S2: panel ${pd.id} filter ${JSON.stringify(filters)} matches ${matched.length} cells (must be 2, NON-empty)`,
    matched.length === 2, `matched=${matched.length} of source=${JSON.stringify(source)}`);
}

// 3) visualMap extent = drawn extent 10..94 (not raw 4..90, not pooled 40..148)
const vm = Array.isArray(option.visualMap) ? option.visualMap[0] : option.visualMap;
console.log('visualMap:', JSON.stringify(vm));
check('S2: visualMap.min === 10', vm && vm.min === 10, `min=${vm && vm.min}`);
check('S2: visualMap.max === 94', vm && vm.max === 94, `max=${vm && vm.max}`);

// 4) narrative extrema/total match the same drawn cells (render == narrative)
const res = generateNarrativeSummary(spec);
console.log('narrative summary:', res.summary);
console.log('narrative keyFindings:', JSON.stringify(res.keyFindings));
check('S2: narrative max = 94', res.analysis.max && res.analysis.max.value === 94,
  JSON.stringify(res.analysis.max));
check('S2: narrative min = 10', res.analysis.min && res.analysis.min.value === 10,
  JSON.stringify(res.analysis.min));
check('S2: narrative total = 188 (10+30+54+94 by hand)', res.analysis.total === 188,
  `total=${res.analysis.total}`);
check('S2: High keyFinding names 94', res.keyFindings.some((f) => /^High /.test(f) && /94/.test(f)),
  JSON.stringify(res.keyFindings));
check('S2: Low keyFinding names 10', res.keyFindings.some((f) => /^Low /.test(f) && /10/.test(f)),
  JSON.stringify(res.keyFindings));
check('S2: no phantom 40/148/62/32 anywhere in narrative',
  !/(?<![0-9.])(40|148|62|32)(?![0-9])/.test([res.summary, ...res.keyFindings].join(' | ')),
  [res.summary, ...res.keyFindings].join(' | '));

console.log(failures.length === 0 ? '\nS2 RE-KILL CONFIRMED (all checks pass)' : `\nS2 SURVIVOR ALIVE / WEAKENED: ${failures.length} failure(s)`);
process.exit(failures.length === 0 ? 0 : 1);
