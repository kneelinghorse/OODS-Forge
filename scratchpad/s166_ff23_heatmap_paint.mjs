// s166 m01 (FF#23, Forge-Demos intel_alert 6b595d87) — RED reproduction at HEAD.
// A dataset-backed MarkRect heatmap with TRAILING non-measure fields emits a
// dimensionless visualMap; ECharts binds it to the LAST dataset dimension (a
// string: 'segment') and every cell paints fill:none while option-level probes
// (visualMap present, min/max correct, inRange colors resolved) stay green.
// SUT observed from fresh dist; paint observed via echarts@6 SSR renderToSVGString.
// ECharts SSR marks each drawn datum: <path ... ecmeta_ssr_type="chart" ecmeta_data_index="N">.
import { toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import * as echarts from 'echarts';

function heatmapSpec(rows) {
  const color = { field: 'revenue', trait: 'EncodingColor', type: 'quantitative', title: 'Revenue' };
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'ff23',
    name: 'Revenue Heatmap',
    data: { name: 'grid', values: rows },
    marks: [
      {
        trait: 'MarkRect',
        encodings: {
          x: { field: 'region', trait: 'EncodingX', scale: 'band' },
          y: { field: 'quarter', trait: 'EncodingY', scale: 'band' },
          color: { ...color },
        },
      },
    ],
    encoding: {
      x: { field: 'region', trait: 'EncodingX', scale: 'band' },
      y: { field: 'quarter', trait: 'EncodingY', scale: 'band' },
      color: { ...color },
    },
    a11y: { description: 'Revenue by region and quarter.' },
  };
}

// TRAILING non-measure field (the Demo 04 Hero 2 shape): measure NOT last.
const TRAILING_ROWS = [
  { region: 'North', quarter: 'Q1', revenue: 120, segment: 'retail' },
  { region: 'South', quarter: 'Q1', revenue: 200, segment: 'retail' },
  { region: 'North', quarter: 'Q2', revenue: 150, segment: 'online' },
  { region: 'South', quarter: 'Q2', revenue: 220, segment: 'online' },
];

// CONTROL: identical grid, measure LAST (every existing fixture's shape).
const MEASURE_LAST_ROWS = TRAILING_ROWS.map(({ region, quarter, segment, revenue }) => ({ region, quarter, segment, revenue }));

function renderSvg(spec) {
  const option = toEChartsOption(spec);
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 400, height: 300 });
  chart.setOption(option);
  const svg = chart.renderToSVGString();
  chart.dispose();
  return { option, svg };
}

// Drawn-datum geometry: ECharts SSR tags every series-drawn element with ecmeta_ssr_type="chart".
function chartCellFills(svg) {
  return [...svg.matchAll(/<path[^>]*ecmeta_ssr_type="chart"[^>]*>/g)]
    .map((m) => (m[0].match(/fill="([^"]*)"/) ?? [])[1]);
}

for (const [label, rows] of [
  ['TRAILING-FIELD (measure not last)', TRAILING_ROWS],
  ['CONTROL (measure last)', MEASURE_LAST_ROWS],
]) {
  const { option, svg } = renderSvg(heatmapSpec(rows));
  const fills = chartCellFills(svg);
  console.log(`\n=== ${label} ===`);
  console.log('visualMap.dimension:', JSON.stringify(option.visualMap?.dimension));
  console.log('dataset dims:', JSON.stringify(option.dataset?.[0]?.dimensions));
  console.log(`drawn cells: ${fills.length}, fills: ${JSON.stringify(fills)}`);
  const painted = fills.filter((f) => f && f !== 'none');
  console.log(`painted: ${painted.length}/${fills.length}${painted.length === 0 ? '  <-- BLANK PAINT' : ''}`);
}
