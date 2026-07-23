// s160 adversarial review — parent-defect re-kill S3 (s159 MED survivor, same root as S2):
// detail-grouping collapse on an aggregated heatmap — visualMap/dataset must show {30,10}
// not the pooled {40}, narrative must match, and series encode.detail must not dangle.
//
// HAND ORACLE (independent):
//   rows: (N,9,d1): 12+18 = 30 ; (N,9,d2): 4+6 = 10   (color aggregate 'sum' on temp)
//   drawn cells (keyed x,y,detail) = {30, 10} → extent 10..30, Σ = 40
//   s159 bug: cell key [x,y] only → ONE pooled cell 12+18+4+6 = 40 → vm 40/40, detail column
//   dropped from the aggregated source while series encode.detail still referenced it (dangling).
const path = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.cjs';
const { toEChartsOption, generateNarrativeSummary } = require(path);

const failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(`${name}: ${detail}`);
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${cond ? '' : ' :: ' + detail}`);
}

const rows = [
  { region: 'N', hour: '9', line: 'd1', temp: 12 },
  { region: 'N', hour: '9', line: 'd1', temp: 18 },
  { region: 'N', hour: '9', line: 'd2', temp: 4 },
  { region: 'N', hour: '9', line: 'd2', temp: 6 },
];
const encoding = {
  x: { field: 'region', trait: 'EncodingX', scale: 'band' },
  y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
  color: { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' },
  detail: { field: 'line', trait: 'EncodingDetail' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'detail-heat', name: 'detail-heat',
  data: { name: 'dh', values: rows },
  marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
  encoding,
  a11y: { description: 'temp by region/hour per line' },
};

const option = toEChartsOption(spec);
const base = option.dataset[0];
const source = base.source;
console.log('base dataset source:', JSON.stringify(source));

// 1) dataset = per-(x,y,detail) cells {30,10}, NOT pooled {40}
const temps = source.map((r) => r.temp).sort((a, b) => a - b);
check('S3: dataset cells are exactly [10,30] (hand: 4+6 / 12+18)',
  JSON.stringify(temps) === JSON.stringify([10, 30]), JSON.stringify(temps));
check('S3: pooled 40 NOT in dataset', !temps.includes(40), JSON.stringify(temps));

// 2) the aggregated source CARRIES the detail column → encode.detail no longer dangles
check('S3: every aggregated cell carries the `line` column', source.every((r) => 'line' in r),
  JSON.stringify(source));
const series = option.series[0];
console.log('series encode:', JSON.stringify(series.encode));
check('S3: series encode.detail === "line"', series.encode && series.encode.detail === 'line',
  JSON.stringify(series.encode));
check('S3: dataset dimensions include "line"', (base.dimensions ?? []).includes('line'),
  JSON.stringify(base.dimensions));

// 3) visualMap 10..30, not 40/40
const vm = Array.isArray(option.visualMap) ? option.visualMap[0] : option.visualMap;
console.log('visualMap:', JSON.stringify(vm));
check('S3: visualMap.min === 10 (not 40)', vm && vm.min === 10, `min=${vm && vm.min}`);
check('S3: visualMap.max === 30 (not 40)', vm && vm.max === 30, `max=${vm && vm.max}`);

// 4) narrative matches: High 30 / Low 10 / Total 40 (Σ drawn = 30+10 IS honestly 40)
const res = generateNarrativeSummary(spec);
console.log('narrative summary:', res.summary);
console.log('narrative keyFindings:', JSON.stringify(res.keyFindings));
check('S3: narrative max = 30', res.analysis.max && res.analysis.max.value === 30,
  JSON.stringify(res.analysis.max));
check('S3: narrative min = 10', res.analysis.min && res.analysis.min.value === 10,
  JSON.stringify(res.analysis.min));
check('S3: High keyFinding names 30', res.keyFindings.some((f) => /^High /.test(f) && /\b30\b/.test(f)),
  JSON.stringify(res.keyFindings));
check('S3: Low keyFinding names 10', res.keyFindings.some((f) => /^Low /.test(f) && /\b10\b/.test(f)),
  JSON.stringify(res.keyFindings));
check('S3: no keyFinding narrates a 40 extremum (High/Low must not read 40)',
  !res.keyFindings.some((f) => /^(High|Low) /.test(f) && /\b40\b/.test(f)),
  JSON.stringify(res.keyFindings));

console.log(failures.length === 0 ? '\nS3 RE-KILL CONFIRMED (all checks pass)' : `\nS3 SURVIVOR ALIVE / WEAKENED: ${failures.length} failure(s)`);
process.exit(failures.length === 0 ? 0 : 1);
