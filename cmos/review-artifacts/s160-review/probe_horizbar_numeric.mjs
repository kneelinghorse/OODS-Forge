// s160 review — horizontal aggregated bar with NUMERIC y-categories (e.g. year codes)
// Chart draws: sum(hours) per year → 2021: 110, 2022: 40 (horizontal bars).
// The analysis model resolves measure=y ('year') because measureChannel is orientation-blind for bars.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'hbn', name: 'hours by year',
  data: { name: 'hbn', values: [
    { year: 2021, hours: 60 }, { year: 2021, hours: 50 }, { year: 2022, hours: 40 },
  ]},
  marks: [{ trait: 'MarkBar', encodings: {
    x: { field: 'hours', trait: 'EncodingX', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
    y: { field: 'year', trait: 'EncodingY', scale: 'band' },
  }}],
  encoding: {
    x: { field: 'hours', trait: 'EncodingX', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
    y: { field: 'year', trait: 'EncodingY', scale: 'band' },
  },
  a11y: { description: 'hours by year' },
};

const a = analyzeVizSpec(spec);
console.log('analysis.max:', JSON.stringify(a.max));
console.log('analysis.min:', JSON.stringify(a.min));
console.log('analysis.total:', a.total);
const n = generateNarrativeSummary(spec);
console.log('summary:', n.summary);
console.log('keyFindings:', JSON.stringify(n.keyFindings, null, 1));
console.log('VL encoding (what Vega actually draws):', JSON.stringify(toVegaLiteSpec(spec).encoding));
