// s160 adversarial review — cross-axis hunter probes (dist import, read-only).
// Lenses: (a) correlation x facet {row, column, matrix}; (c) spine x no-dimension stableSum;
// (f) m3 suppression -> mean fallback numeric correctness; adapter x facet-direction cross.
// All expected values HAND-COMPUTED independently (textbook Pearson inline; literal float sums).
import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

let failures = 0;
function check(name, cond, detail) {
  const ok = Boolean(cond);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  | ' + detail : ''}`);
}

// ── independent textbook Pearson (NOT the SUT's stats.ts) ──
function handPearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx2 += (xs[i] - mx) ** 2;
    dy2 += (ys[i] - my) ** 2;
  }
  return num / Math.sqrt(dx2 * dy2);
}

const F_ROWS = [
  { x: 1, y: 10, panel: 'A' }, { x: 2, y: 9, panel: 'A' }, { x: 3, y: 8, panel: 'A' },
  { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
  { x: 21, y: 30, panel: 'C' }, { x: 22, y: 29, panel: 'C' }, { x: 23, y: 28, panel: 'C' },
];
// hand oracle: pooled r = 594/606 = 0.98019...; every per-panel r = -1 exactly.
const pooled = handPearson(F_ROWS.map(r => r.x), F_ROWS.map(r => r.y));
check('hand oracle sanity: pooled r ~= 0.9802', Math.abs(pooled - 594 / 606) < 1e-12, `pooled=${pooled}`);
for (const p of ['A', 'B', 'C']) {
  const g = F_ROWS.filter(r => r.panel === p);
  check(`hand oracle sanity: panel ${p} r = -1`, Math.abs(handPearson(g.map(r => r.x), g.map(r => r.y)) - (-1)) < 1e-12);
}

function scatter(layout) {
  const encoding = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'simpson-x',
    name: 'simpson-x',
    data: { name: 's', values: F_ROWS },
    marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
    encoding,
    ...(layout ? { layout } : {}),
    a11y: { description: 'y over x by panel' },
  };
}

// (a) ROW-faceted (parity baseline, chartered) — suppression expected.
const rowA = analyzeVizSpec(scatter({ trait: 'LayoutFacet', rows: { field: 'panel' } }));
check('(a) ROW-facet Simpson: correlation SUPPRESSED', rowA.correlation === undefined, `r=${rowA.correlation}`);

// (a) COLUMN-faceted twin — the partition must see the columns arm of the layout.
const colA = analyzeVizSpec(scatter({ trait: 'LayoutFacet', columns: { field: 'panel' } }));
check('(a) COLUMN-facet Simpson twin: correlation SUPPRESSED', colA.correlation === undefined, `r=${colA.correlation}`);
const colNarr = generateNarrativeSummary(scatter({ trait: 'LayoutFacet', columns: { field: 'panel' } }));
check('(a) COLUMN-facet twin: no "0.98" phantom in narrative',
  !(`${colNarr.summary} ${colNarr.keyFindings.join(' ')}`).includes('0.98'),
  colNarr.summary);

// (a) MATRIX facet (rows+columns) — both directions at once.
const matRows = F_ROWS.map((r, i) => ({ ...r, g: i % 2 === 0 ? 'e' : 'o' }));
const matSpec = scatter({ trait: 'LayoutFacet', rows: { field: 'g' }, columns: { field: 'panel' } });
matSpec.data = { name: 's', values: matRows };
const matA = analyzeVizSpec(matSpec);
// hand oracle: partition (g x panel) gives 6 groups of 1-2 rows -> all pearson-null -> VACUOUS-PASS
// (disclosed small-group escape) OR suppression; either way this records the live behavior.
console.log(`INFO  (a) matrix-facet (g x panel): correlation=${matA.correlation} (vacuous-pass class if defined)`);

// (a) facet=none control: pooled 0.98 honestly narrates (nothing else encoded).
const noneA = analyzeVizSpec(scatter(undefined));
check('(a) facet=none control: pooled r NARRATES (0.98)', noneA.correlation !== undefined && Math.abs(noneA.correlation - 0.98) <= 0.0005, `r=${noneA.correlation}`);

// (f) m3 suppression side-effect: the mean that NOW narrates must be numerically correct.
// hand oracle: y values sum 171 over 9 points -> mean exactly 19; min 8 (x=3), max 30 (x=21).
const rowNarr = generateNarrativeSummary(scatter({ trait: 'LayoutFacet', rows: { field: 'panel' } }));
check('(f) suppressed-correlation fallback narrates', rowNarr.summary.includes('averaging'), rowNarr.summary);
check('(f) fallback mean == hand 19', rowNarr.summary.includes('averaging 19'), rowNarr.summary);
check('(f) fallback min 8 / max 30 (hand extrema of drawn points)',
  rowNarr.summary.includes('from 8 (3) to 30 (21)'), rowNarr.summary);
check('(f) analysis.mean exact 19', rowA.mean === 19, `mean=${rowA.mean}`);

// (c) spine x no-dimension arm: [1e9,-1e9,0.1,0.2] declared-sum bar.
// hand oracle for stableSum (ascending sort): ((-1e9 + 0.1) + 0.2) + 1e9 computed literally here.
const HAND_STABLE = ((-1e9 + 0.1) + 0.2) + 1e9;
const noDimSpec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'nodim',
  name: 'nodim',
  data: { name: 'n', values: [{ v: 1e9 }, { v: -1e9 }, { v: 0.1 }, { v: 0.2 }] },
  marks: [{ trait: 'MarkBar', encodings: { y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } } }],
  encoding: { y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
  a11y: { description: 'nodim total' },
};
const noDimA = analyzeVizSpec(noDimSpec);
check('(c) no-dimension Total DEFINED (guard does NOT false-fire totalPhantom)', noDimA.total !== undefined, `total=${noDimA.total}`);
check('(c) Total == hand stableSum constant', noDimA.total === HAND_STABLE, `total=${noDimA.total} hand=${HAND_STABLE}`);
check('(c) extrema stay NULLED (pinned intended: raw 1e9 drawn on no mark)', noDimA.max === undefined && noDimA.min === undefined);
const noDimNarr = generateNarrativeSummary(noDimSpec);
check('(c) "Total value" keyFinding narrates', noDimNarr.keyFindings.some(f => f.startsWith('Total')), JSON.stringify(noDimNarr.keyFindings));

// (c) control [1,2,3]: total 6 stays.
const ctrl = analyzeVizSpec({ ...noDimSpec, data: { name: 'n', values: [{ v: 1 }, { v: 2 }, { v: 3 }] } });
check('(c) control total 6', ctrl.total === 6, `total=${ctrl.total}`);

// ── adapter x facet-DIRECTION cross (m2/m5 surface): the shipped adapter spec covers COLUMN facet;
// cross the spine against the ROW arm + the facet+detail COMBINED arm on the LIVE adapter path.
function heatmap(rows, layout, detailField) {
  const encoding = {
    x: { field: 'region', trait: 'EncodingX', scale: 'band' },
    y: { field: 'hour', trait: 'EncodingY', scale: 'band' },
    color: { field: 'temp', trait: 'EncodingColor', scale: 'linear', aggregate: 'sum' },
    ...(detailField ? { detail: { field: detailField, trait: 'EncodingDetail' } } : {}),
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'heat-x',
    name: 'heat-x',
    data: { name: 'h', values: rows },
    marks: [{ trait: 'MarkRect', encodings: { ...encoding } }],
    encoding,
    ...(layout ? { layout } : {}),
    a11y: { description: 'temp by region and hour' },
  };
}
const HROWS = [
  { site: 'A', region: 'N', hour: '9', temp: 10 },
  { site: 'B', region: 'N', hour: '9', temp: 30 },
  { site: 'A', region: 'S', hour: '9', temp: 54 },
  { site: 'B', region: 'S', hour: '9', temp: 94 },
];
// hand oracle: per-(region,hour,site) cells = 10/30/54/94 (each group is a single row).
const optRow = toEChartsOption(heatmap(HROWS, { trait: 'LayoutFacet', rows: { field: 'site' } }));
const srcRow = (optRow.dataset?.[0]?.source) ?? [];
check('(adapter) ROW-facet heatmap: 4 per-panel cells (not pooled {40,148})', srcRow.length === 4, `cells=${JSON.stringify(srcRow.map(r => r.temp))}`);
check('(adapter) ROW-facet cells carry the facet field', srcRow.every(r => 'site' in r));
check('(adapter) ROW-facet visualMap 10..94', optRow.visualMap?.min === 10 && optRow.visualMap?.max === 94, `vm=${optRow.visualMap?.min}..${optRow.visualMap?.max}`);
const derivedRow = (optRow.dataset ?? []).filter(d => d.fromDatasetId !== undefined);
check('(adapter) ROW-facet: >=2 panel datasets', derivedRow.length >= 2, `derived=${derivedRow.length}`);
for (const panel of derivedRow) {
  const filters = panel.transform ?? [];
  const matches = srcRow.filter(row => filters.every(t => row[t.config.field] === t.config.value));
  check(`(adapter) ROW-facet panel ${panel.id} filter NON-EMPTY`, filters.length > 0 && matches.length > 0, `matches=${matches.length}`);
}

// facet COLUMN + detail COMBINED: hand cells per (region,hour,site-implicit-none,line)... rows below:
const CROWS = [
  { site: 'A', region: 'N', hour: '9', line: 'd1', temp: 10 },
  { site: 'A', region: 'N', hour: '9', line: 'd2', temp: 30 },
  { site: 'B', region: 'N', hour: '9', line: 'd1', temp: 54 },
  { site: 'B', region: 'N', hour: '9', line: 'd2', temp: 94 },
];
const optC = toEChartsOption(heatmap(CROWS, { trait: 'LayoutFacet', columns: { field: 'site' } }, 'line'));
const srcC = (optC.dataset?.[0]?.source) ?? [];
check('(adapter) COLUMN-facet + detail: 4 cells 10/30/54/94', srcC.length === 4 && JSON.stringify(srcC.map(r => r.temp).sort((a, b) => a - b)) === '[10,30,54,94]', JSON.stringify(srcC.map(r => r.temp)));
check('(adapter) COLUMN-facet + detail: cells carry site AND line', srcC.every(r => 'site' in r && 'line' in r));
check('(adapter) COLUMN-facet + detail visualMap 10..94', optC.visualMap?.min === 10 && optC.visualMap?.max === 94, `vm=${optC.visualMap?.min}..${optC.visualMap?.max}`);
const aC = analyzeVizSpec(heatmap(CROWS, { trait: 'LayoutFacet', columns: { field: 'site' } }, 'line'));
check('(adapter) narrative parity: analysis min 10 / max 94 / total 188', aC.min?.value === 10 && aC.max?.value === 94 && aC.total === 188, `min=${aC.min?.value} max=${aC.max?.value} total=${aC.total}`);

console.log(failures === 0 ? '\nALL PROBES PASS' : `\n${failures} PROBE FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
