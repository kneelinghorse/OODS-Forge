import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// Candidate: BOTH axes aggregated. x=sum(v), y=sum(w), mark=bar, no dimension.
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'both', name: 'both axes agg',
  data: { name: 'both', values: [
    { v: 10, w: 100 }, { v: 30, w: 200 }, { v: 20, w: 300 },
  ]},
  marks: [{ trait: 'MarkBar', encodings: {
    x: { field: 'v', trait: 'EncodingX', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
    y: { field: 'w', trait: 'EncodingY', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
  }}],
  encoding: {
    x: { field: 'v', trait: 'EncodingX', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
    y: { field: 'w', trait: 'EncodingY', scale: 'linear', aggregate: 'sum', type: 'quantitative' },
  },
  a11y: { description: 'both axes aggregated' },
};

const a = analyzeVizSpec(spec);
console.log('analysis.max:', JSON.stringify(a.max));
console.log('analysis.min:', JSON.stringify(a.min));
console.log('analysis.total:', a.total);
const n = generateNarrativeSummary(spec);
console.log('summary:', n.summary);
console.log('keyFindings:', JSON.stringify(n.keyFindings, null, 1));
console.log('VL encoding:', JSON.stringify(toVegaLiteSpec(spec).encoding));
