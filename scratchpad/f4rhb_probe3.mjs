import { resolvePrimaryChannels, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk({ mark='MarkBar', enc, extra={}, values }) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
    data: { name: 'd', values },
    marks: [{ trait: mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y: { description: 'x' }, ...extra,
  };
}
function run(label, spec) {
  console.log('\n===== ' + label + ' =====');
  console.log('rpc:', JSON.stringify(resolvePrimaryChannels(spec)));
  const nar = generateNarrativeSummary(spec);
  console.log('summary:', nar.summary);
  console.log('keyFindings:', JSON.stringify(nar.keyFindings));
}

// (6) x2 range bar: x + x2 (start/end), y nominal. Bar length = x2-x. measure should be x-ish.
run('(6a) x + x2 range bar, nominal y', mk({
  enc: {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    x2: { field: 'x2', trait: 'EncodingX2', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  },
  values: [{ x: 10, x2: 50, y: 'Alpha' }, { x: 20, x2: 90, y: 'Beta' }, { x: 5, x2: 20, y: 'Gamma' }],
}));

// x2 only-quant, x unstamped, y numeric-code
run('(6b) x2 range bar, x unstamped, numeric y', mk({
  enc: {
    x: { field: 'x', trait: 'EncodingX' },
    x2: { field: 'x2', trait: 'EncodingX2', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  },
  values: [{ x: 10, x2: 50, y: 101 }, { x: 20, x2: 90, y: 202 }, { x: 5, x2: 20, y: 303 }],
}));

// mark normalization: 'MarkRect' contains no bar/area/point/line -> shape 'unknown'.
// Confirm rect horizontal -> measure=y and what it narrates with numeric y.
run('(5c) MarkRect quant-x, NUMERIC y-codes', mk({
  mark: 'MarkRect',
  enc: {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  },
  values: [{ x: 50, y: 101 }, { x: 90, y: 202 }, { x: 20, y: 303 }],
}));

// The strongest realistic inversion attempt: horizontal bar, x is stamped-quant MEASURE,
// but delivered as numeric-STRING values (which analysis may still narrate). Confirm arm holds.
run('CONTROL quant-x numeric-string values, nominal y', mk({
  enc: {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  },
  values: [{ x: '50', y: 'Alpha' }, { x: '90', y: 'Beta' }, { x: '20', y: 'Gamma' }],
}));
