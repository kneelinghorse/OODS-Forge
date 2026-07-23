import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// Both axes aggregated bar: x=sum(v), y=sum(w), no dimension channel
const rows = [
  { v: 10, w: 100 },
  { v: 20, w: 200 },
  { v: 10, w: 300 },
];
const encoding = {
  x: { field: 'v', trait: 'EncodingX', type: 'quantitative', aggregate: 'sum' },
  y: { field: 'w', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'both-agg', name: 'both agg',
  data: { name: 'd', values: rows },
  marks: [{ trait: 'MarkBar', encodings: { ...encoding } }],
  encoding,
  a11y: { description: 'both aggregated' },
};

const analysis = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('measure/dimension:', JSON.stringify(analysis.primaryChannels ?? '(n/a)'));
console.log('summary =', summary);
console.log('keyFindings =', JSON.stringify(keyFindings, null, 1));
