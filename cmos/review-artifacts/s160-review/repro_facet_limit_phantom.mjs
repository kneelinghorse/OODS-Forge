// FINDING REPRO — facet limit/maxPanels: narrated High + visualMap max name a cell in an UNRENDERED panel.
// Fixture: aggregated MarkRect heatmap, facet columns site {A,B,C} with limit:2 (also reproduces with maxPanels:2).
// HAND ORACLE (independent of SUT): cells per (region,hour,site): A=10, B=30, C=94.
//   ECharts renders ONE panel per collected facet value UP TO limit → panels A and B only
//   (echarts-layout-mapper.ts collectFacetValues honors limit; expandSeries repoints ALL series
//   at panel datasets, so the base dataset's site-C cell is referenced by NO series → not drawn).
//   Drawn max on the ECharts output = 30. Narrative + visualMap must not exceed drawn.
// OBSERVED: narrative "High Temp: Temp 94", analysis.max=94, visualMap max=94, but only 2 panels
//   (filters site==A, site==B) exist; no series consumes the site-C cell.
import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const B = (field, trait, extra = {}) => ({ field, trait, ...extra });
const colorSum = B('temp', 'EncodingColor', { scale: 'linear', aggregate: 'sum' });
const make = (layout) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'lf', name: 'limited facet heatmap',
  data: { name: 'lf', values: [
    { site: 'A', region: 'N', hour: '9', temp: 10 },
    { site: 'B', region: 'N', hour: '9', temp: 30 },
    { site: 'C', region: 'N', hour: '9', temp: 94 },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }), color: { ...colorSum },
  }}],
  encoding: {
    x: B('region', 'EncodingX', { scale: 'band' }), y: B('hour', 'EncodingY', { scale: 'band' }), color: { ...colorSum },
  },
  layout,
  a11y: { description: 'temp' },
});

for (const [label, layout] of [
  ['limit:2', { trait: 'LayoutFacet', columns: { field: 'site', limit: 2 } }],
  ['maxPanels:2', { trait: 'LayoutFacet', columns: { field: 'site' }, maxPanels: 2 }],
]) {
  const spec = make(layout);
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  const o = toEChartsOption(spec);
  const panels = o.dataset.filter((d) => d.fromDatasetId !== undefined);
  const panelSites = panels.flatMap((p) => (p.transform ?? []).map((t) => t.config.value));
  const drawnCells = (o.dataset[0].source ?? []).filter((r) => panelSites.includes(r.site));
  const drawnMax = Math.max(...drawnCells.map((r) => r.temp));
  console.log(`--- ${label} ---`);
  console.log('rendered panels (sites):', JSON.stringify(panelSites), '→ drawn max =', drawnMax, '(hand: 30)');
  console.log('narrated analysis.max =', a.max?.value, '| visualMap max =', o.visualMap?.max);
  console.log('keyFindings:', JSON.stringify(n.keyFindings));
  console.log('PHANTOM?', a.max?.value !== drawnMax || o.visualMap?.max !== drawnMax);
}
