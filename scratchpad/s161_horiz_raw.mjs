import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(x) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'hr', name: 'score by year',
    data: { name: 'hr', values: [
      { year: 2020, score: 120 }, { year: 2021, score: 340 }, { year: 2022, score: 90 },
    ]},
    marks: [{ trait: 'MarkBar', encodings: {
      x: { field: 'score', trait: 'EncodingX', scale: 'linear', type: 'quantitative', ...x },
      y: { field: 'year', trait: 'EncodingY', scale: 'band' },
    }}],
    encoding: {
      x: { field: 'score', trait: 'EncodingX', scale: 'linear', type: 'quantitative', ...x },
      y: { field: 'year', trait: 'EncodingY', scale: 'band' },
    },
    a11y: { description: 'score by year' },
  };
}

for (const [name, x] of [['G2 raw (no aggregate)', {}], ['F aggregated (control)', { aggregate: 'sum' }]]) {
  const spec = mk(x);
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  console.log(`\n=== ${name} ===`);
  console.log('max:', JSON.stringify(a.max), 'min:', JSON.stringify(a.min), 'total:', a.total, 'corr:', a.correlation);
  console.log('summary:', n.summary);
  console.log('keyFindings:', JSON.stringify(n.keyFindings));
  const vl = toVegaLiteSpec(spec);
  console.log('VL encoding:', JSON.stringify(vl.encoding));
}
