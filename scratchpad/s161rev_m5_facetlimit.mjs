import { toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const facetRenderedCellFilter = () => undefined;
const aggregateMarkRectCells = () => undefined;

function heatmapFacetSpec({ values, layout }) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'hm-facet',
    name: 'hm facet',
    data: { name: 'd', values },
    marks: [{ trait: 'MarkRect', encodings: {
      x: { field: 'col', trait: 'EncodingX', type: 'nominal' },
      y: { field: 'row', trait: 'EncodingY', type: 'nominal' },
      color: { field: 'v', trait: 'EncodingColor', type: 'quantitative' },
    } }],
    encoding: {
      x: { field: 'col', trait: 'EncodingX', type: 'nominal' },
      y: { field: 'row', trait: 'EncodingY', type: 'nominal' },
      color: { field: 'v', trait: 'EncodingColor', type: 'quantitative' },
    },
    ...(layout ? { layout } : {}),
    a11y: { description: 'heatmap' },
  };
}

// Cells: region A max 10, region B max 30, region C max 94. facet columns by region, limit 2.
const values = [
  { region: 'A', col: 'c1', row: 'r1', v: 5 },
  { region: 'A', col: 'c2', row: 'r1', v: 10 },
  { region: 'B', col: 'c1', row: 'r1', v: 20 },
  { region: 'B', col: 'c2', row: 'r1', v: 30 },
  { region: 'C', col: 'c1', row: 'r1', v: 80 },
  { region: 'C', col: 'c2', row: 'r1', v: 94 },
];

const spec = heatmapFacetSpec({ values, layout: { trait: 'LayoutFacet', columns: { field: 'region', limit: 2 } } });

const opt = toEChartsOption(spec);
console.log('=== FACET columns.limit:2, cells maxes A=10 B=30 C=94 ===');
console.log('visualMap =', JSON.stringify(opt.visualMap));
console.log('aggregateMarkRectCells =', JSON.stringify(aggregateMarkRectCells(spec)));

// base dataset source + derived datasets + series datasetIds
const datasets = opt.dataset;
console.log('\ndatasets:');
for (const ds of datasets) {
  console.log('  id=', ds.id, 'fromDatasetId=', ds.fromDatasetId, 'transform=', JSON.stringify(ds.transform), 'source_len=', ds.source ? ds.source.length : undefined);
}
console.log('base dataset source =', JSON.stringify(datasets[0].source));
console.log('\nseries count =', opt.series.length);
for (const s of opt.series) {
  console.log('  series datasetId=', s.datasetId, 'name=', s.name);
}

// Determine drawn cells: apply each derived dataset's filter transform to base source by hand
function applyFilters(source, transforms) {
  if (!transforms) return source;
  return source.filter((row) => transforms.every((t) => {
    const cfg = t.config;
    if (t.type !== 'filter') return true;
    if (cfg.operator === '==') return String(row[cfg.field]) === String(cfg.value);
    return true;
  }));
}
const base = datasets[0].source;
let drawnMax = -Infinity;
const drawnCells = [];
for (const ds of datasets.slice(1)) {
  const cells = applyFilters(base, ds.transform);
  for (const c of cells) { drawnCells.push(c); drawnMax = Math.max(drawnMax, Number(c.v)); }
}
console.log('\nDRAWN cells (across rendered derived datasets):', JSON.stringify(drawnCells));
console.log('DRAWN max v =', drawnMax);
console.log('visualMap.max =', opt.visualMap && (Array.isArray(opt.visualMap) ? opt.visualMap[0].max : opt.visualMap.max));

// NON-FACETED control: visualMap byte-identical baseline
const plain = heatmapFacetSpec({ values });
const optPlain = toEChartsOption(plain);
console.log('\n=== NON-FACETED control ===');
console.log('visualMap =', JSON.stringify(optPlain.visualMap));
