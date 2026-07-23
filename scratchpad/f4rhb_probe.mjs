import { resolvePrimaryChannels, generateNarrativeSummary, analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk({ mark='MarkBar', x, y, color, extra={}, values }) {
  const enc = { x, y };
  if (color) enc.color = color;
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
    data: { name: 'd', values },
    marks: [{ trait: mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y: { description: 'x' },
    ...extra,
  };
  return spec;
}

function run(label, spec) {
  console.log('\n===== ' + label + ' =====');
  try {
    const rpc = resolvePrimaryChannels(spec);
    console.log('resolvePrimaryChannels:', JSON.stringify(rpc));
  } catch (e) { console.log('rpc ERR', e.message); }
  try {
    const nar = generateNarrativeSummary(spec);
    console.log('summary:', nar.summary);
    console.log('keyFindings:', JSON.stringify(nar.keyFindings, null, 0));
  } catch (e) { console.log('nar ERR', e.message); }
}

// Category values: y is category name, x is the measure (bar length).
// A raw horizontal bar: x quant, y nominal. measure SHOULD be x.
// Baseline sanity: stamped-quant x, nominal y -> arm fires -> measure x
const baseValues = [
  { x: 50, y: 'Alpha' }, { x: 90, y: 'Beta' }, { x: 20, y: 'Gamma' },
];
run('BASELINE stamped-quant x, nominal y (expect measure=x)', mk({
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));

// (1) TEMPORAL x horizontal bar. x is temporal (dates), y nominal category.
// Would a horizontal bar ever have temporal x as measure? Unusual, but test.
const tempValues = [
  { x: '2020-01-01', y: 'Alpha' }, { x: '2021-06-01', y: 'Beta' }, { x: '2019-03-01', y: 'Gamma' },
];
run('(1a) TEMPORAL type x, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', type: 'temporal' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: tempValues,
}));

// temporal via scale.type=time
run('(1b) scale time x, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: { type: 'time' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: tempValues,
}));

// (2) mark=area parity
run('(2) MarkArea stamped-quant x, nominal y', mk({
  mark: 'MarkArea',
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));

// (3) x quant, y ORDINAL numeric-string. e.g. y='2020' ordinal - horizontal bar of counts per year?
const yearValues = [
  { x: 340, y: '2020' }, { x: 512, y: '2021' }, { x: 208, y: '2019' },
];
run('(3) stamped-quant x, y ordinal numeric-string', mk({
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'ordinal' },
  values: yearValues,
}));

// (4) x scale log / sqrt
run('(4a) x scale log, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: { type: 'log' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));
run('(4b) x scale sqrt, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: { type: 'sqrt' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));

// (5) mark=rect / tick horizontal
run('(5a) MarkRect stamped-quant x, nominal y', mk({
  mark: 'MarkRect',
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));
run('(5b) MarkTick stamped-quant x, nominal y', mk({
  mark: 'MarkTick',
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: baseValues,
}));
