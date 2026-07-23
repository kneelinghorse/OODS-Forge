import { toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function hm({ values, layout, colorAggregate, colorType = 'quantitative' }) {
  const color = { field: 'v', trait: 'EncodingColor', type: colorType };
  if (colorAggregate) color.aggregate = colorAggregate;
  const enc = {
    x: { field: 'col', trait: 'EncodingX', type: 'nominal' },
    y: { field: 'row', trait: 'EncodingY', type: 'nominal' },
    color,
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'hm', name: 'hm',
    data: { name: 'd', values },
    marks: [{ trait: 'MarkRect', encodings: { ...enc } }],
    encoding: enc,
    ...(layout ? { layout } : {}),
    a11y: { description: 'heatmap' },
  };
}

function applyFilters(source, transforms) {
  if (!transforms) return source;
  return source.filter((row) => transforms.every((t) => {
    if (t.type !== 'filter') return true;
    const cfg = t.config;
    if (cfg.operator === '==') return String(row[cfg.field]) === String(cfg.value);
    return true;
  }));
}

function analyze(name, spec) {
  const opt = toEChartsOption(spec);
  const vm = opt.visualMap && (Array.isArray(opt.visualMap) ? opt.visualMap[0] : opt.visualMap);
  const base = opt.dataset[0].source;
  const derived = opt.dataset.slice(1);
  let drawnMax = -Infinity, drawnMin = Infinity;
  const drawn = [];
  const usedIds = new Set(opt.series.map((s) => s.datasetId));
  for (const ds of derived) {
    if (!usedIds.has(ds.id)) continue; // only datasets an actual series draws
    for (const c of applyFilters(base, ds.transform)) {
      drawn.push(Number(c.v)); drawnMax = Math.max(drawnMax, Number(c.v)); drawnMin = Math.min(drawnMin, Number(c.v));
    }
  }
  // non-faceted: series draws base directly
  if (derived.length === 0) {
    for (const c of base) { drawn.push(Number(c.v)); drawnMax = Math.max(drawnMax, Number(c.v)); drawnMin = Math.min(drawnMin, Number(c.v)); }
  }
  const exceed = vm ? drawn.filter((d) => d > vm.max || d < vm.min) : [];
  console.log(`\n=== ${name} ===`);
  console.log('  visualMap min/max =', vm ? `${vm.min}/${vm.max}` : 'NONE', '| base src =', JSON.stringify(base));
  console.log('  series datasetIds =', opt.series.map((s) => s.datasetId).join(', '));
  console.log('  DRAWN values =', JSON.stringify(drawn.sort((a, b) => a - b)), '| drawnMin/Max =', drawnMin + '/' + drawnMax);
  console.log('  >>> CELLS OUTSIDE visualMap =', JSON.stringify(exceed), exceed.length ? '  <<< PHANTOM' : '(none)');
}

// A) aggregate + facet-limit: color sum aggregate, facet columns region limit 2, region C(94) dropped
analyze('A aggregate(sum)+facet-limit region C dropped', hm({
  values: [
    { region: 'A', col: 'c1', row: 'r1', v: 5 }, { region: 'A', col: 'c1', row: 'r1', v: 5 },
    { region: 'B', col: 'c1', row: 'r1', v: 15 }, { region: 'B', col: 'c1', row: 'r1', v: 15 },
    { region: 'C', col: 'c1', row: 'r1', v: 47 }, { region: 'C', col: 'c1', row: 'r1', v: 47 },
  ],
  colorAggregate: 'sum',
  layout: { trait: 'LayoutFacet', columns: { field: 'region', limit: 2 } },
}));

// B) 2D facet row+column, maxPanels truncation drops the high cell's panel
analyze('B 2D facet row+col maxPanels:2 (drops high panel)', hm({
  values: [
    { rr: 'R1', region: 'A', col: 'c1', row: 'r1', v: 10 },
    { rr: 'R1', region: 'B', col: 'c1', row: 'r1', v: 30 },
    { rr: 'R2', region: 'A', col: 'c1', row: 'r1', v: 94 },
  ],
  layout: { trait: 'LayoutFacet', rows: { field: 'rr' }, columns: { field: 'region' }, maxPanels: 2 },
}));

// C) NUMERIC facet field (year) limit 2, year 2022 (94) dropped — String vs numeric compare
analyze('C numeric facet year limit:2 (2022=94 dropped)', hm({
  values: [
    { year: 2020, col: 'c1', row: 'r1', v: 10 },
    { year: 2021, col: 'c1', row: 'r1', v: 30 },
    { year: 2022, col: 'c1', row: 'r1', v: 94 },
  ],
  layout: { trait: 'LayoutFacet', columns: { field: 'year', limit: 2 } },
}));

// D) row-facet limit (rows.limit) — is limit honored for rows dimension?
analyze('D row-facet rows.limit:2 (region C=94 dropped)', hm({
  values: [
    { region: 'A', col: 'c1', row: 'r1', v: 10 },
    { region: 'B', col: 'c1', row: 'r1', v: 30 },
    { region: 'C', col: 'c1', row: 'r1', v: 94 },
  ],
  layout: { trait: 'LayoutFacet', rows: { field: 'region', limit: 2 } },
}));

// E) facet-limit but the HIGH cell is in a RENDERED panel (sanity: no truncation of high)
analyze('E facet-limit, high cell RENDERED (A=94 rendered, C=10 dropped)', hm({
  values: [
    { region: 'A', col: 'c1', row: 'r1', v: 94 },
    { region: 'B', col: 'c1', row: 'r1', v: 30 },
    { region: 'C', col: 'c1', row: 'r1', v: 10 },
  ],
  layout: { trait: 'LayoutFacet', columns: { field: 'region', limit: 2 } },
}));
