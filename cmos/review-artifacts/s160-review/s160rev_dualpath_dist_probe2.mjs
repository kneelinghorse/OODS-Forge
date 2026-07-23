// s160 review — dual-path lens — EXTENDED dist probes beyond the pinned fixtures (still on the
// claimed surface: ECharts MarkRect aggregate path keyed by the spine, facet + detail crosses).
// HAND ORACLES:
//  Q1 multi-row-per-panel-cell faceted heatmap:
//     rows: A/N: 10,20 -> sum 30 ; A/S: 5 -> 5 ; B/N: 7,3 -> 10
//     cells sorted = [5,10,30]; vm [5,30]; narrative min 5 / max 30 / total 5+10+30 = 45.
//  Q2 facet x detail cross:
//     site A: (N,9,d1)=4, (N,9,d2)=6 ; site B: (N,9,d1)=11
//     cells sorted = [4,6,11]; vm [4,11]; total 21; panels non-empty.
import * as viz from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

let failures = 0;
function check(name, actual, expected) {
  const pass = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) failures += 1;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}

function heatSpec(rows, { facetField, detailField } = {}) {
  const color = { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' };
  const encoding = {
    x: { field: 'region', trait: 'EncodingX', scale: 'band' },
    y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
    color: { ...color },
  };
  if (detailField) encoding.detail = { field: detailField, trait: 'EncodingDetail' };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'rev-x',
    name: 'rev extended heat',
    data: { name: 'x', values: rows },
    marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
    encoding,
    ...(facetField ? { layout: { trait: 'LayoutFacet', columns: { field: facetField } } } : {}),
    a11y: { description: 'temp' },
  };
}

function vmOf(opt) {
  return Array.isArray(opt.visualMap) ? opt.visualMap[0] : opt.visualMap;
}
function baseOf(opt) {
  return (opt.dataset ?? [])[0]?.source ?? [];
}
function panelsNonEmpty(opt) {
  const base = baseOf(opt);
  const derived = (opt.dataset ?? []).filter((d) => d.fromDatasetId !== undefined);
  if (derived.length === 0) return 'no-derived';
  return derived.every((p) => {
    const filters = p.transform ?? [];
    return filters.length > 0 &&
      base.some((row) => filters.every((t) => row[t.config.field] === t.config.value));
  });
}

// Q1
const q1rows = [
  { site: 'A', region: 'N', hour: '9', temp: 10 },
  { site: 'A', region: 'N', hour: '9', temp: 20 },
  { site: 'A', region: 'S', hour: '9', temp: 5 },
  { site: 'B', region: 'N', hour: '9', temp: 7 },
  { site: 'B', region: 'N', hour: '9', temp: 3 },
];
const q1spec = heatSpec(q1rows, { facetField: 'site' });
const q1opt = viz.toEChartsOption(q1spec);
check('Q1 cells', baseOf(q1opt).map((r) => Number(r.temp)).sort((a, b) => a - b), [5, 10, 30]);
check('Q1 vm.min', vmOf(q1opt)?.min, 5);
check('Q1 vm.max', vmOf(q1opt)?.max, 30);
check('Q1 panels non-empty', panelsNonEmpty(q1opt), true);
const q1a = viz.analyzeVizSpec(q1spec);
check('Q1 narrative min', q1a.min?.value, 5);
check('Q1 narrative max', q1a.max?.value, 30);
check('Q1 narrative total', q1a.total, 45);

// Q2 facet x detail
const q2rows = [
  { site: 'A', region: 'N', hour: '9', line: 'd1', temp: 4 },
  { site: 'A', region: 'N', hour: '9', line: 'd2', temp: 6 },
  { site: 'B', region: 'N', hour: '9', line: 'd1', temp: 11 },
];
const q2spec = heatSpec(q2rows, { facetField: 'site', detailField: 'line' });
const q2opt = viz.toEChartsOption(q2spec);
check('Q2 cells', baseOf(q2opt).map((r) => Number(r.temp)).sort((a, b) => a - b), [4, 6, 11]);
check('Q2 cells carry site+line', baseOf(q2opt).every((r) => 'site' in r && 'line' in r), true);
check('Q2 vm.min', vmOf(q2opt)?.min, 4);
check('Q2 vm.max', vmOf(q2opt)?.max, 11);
check('Q2 panels non-empty', panelsNonEmpty(q2opt), true);
const q2a = viz.analyzeVizSpec(q2spec);
check('Q2 narrative min', q2a.min?.value, 4);
check('Q2 narrative max', q2a.max?.value, 11);
check('Q2 narrative total', q2a.total, 21);

console.log(failures === 0 ? 'ALL EXTENDED PROBES PASS' : `${failures} EXTENDED PROBE FAILURES`);
process.exit(failures === 0 ? 0 : 1);
