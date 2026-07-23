import { resolvePrimaryChannels, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk({ mark='MarkBar', x, y, color, extra={}, values }) {
  const enc = { x, y }; if (color) enc.color = color;
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

// (4) STRING scale log/sqrt, nominal y (bar length = measure on log/sqrt)
run('(4a) scale:"log" x, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: 'log' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: 50, y: 'Alpha' }, { x: 90, y: 'Beta' }, { x: 20, y: 'Gamma' }],
}));
run('(4b) scale:"sqrt" x, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: 'sqrt' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: 50, y: 'Alpha' }, { x: 90, y: 'Beta' }, { x: 20, y: 'Gamma' }],
}));

// (1) TEMPORAL x horizontal bar with NUMERIC-STRING y (the real inversion risk).
// x is the drawn bar length (a duration/timestamp measure); y is numeric category codes.
// If arm misses -> measure=y -> narrates y CODES as measure = INVERSION.
run('(1c) type:"temporal" x, NUMERIC y-codes', mk({
  x: { field: 'x', trait: 'EncodingX', type: 'temporal' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: '2020-01-01', y: 2020 }, { x: '2021-06-01', y: 2021 }, { x: '2019-03-01', y: 2019 }],
}));
run('(1d) scale:"temporal" x, NUMERIC y-codes', mk({
  x: { field: 'x', trait: 'EncodingX', scale: 'temporal' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: '2020-01-01', y: 2020 }, { x: '2021-06-01', y: 2021 }, { x: '2019-03-01', y: 2019 }],
}));

// A more natural temporal horizontal bar: x = numeric-year-as-temporal is odd.
// Real case: a Gantt-ish horizontal bar where x = duration measure but stamped temporal,
// y = numeric store ID. Test x numeric measure but declared temporal:
run('(1e) type:"temporal" x with NUMERIC x-values, numeric y-codes', mk({
  x: { field: 'x', trait: 'EncodingX', type: 'temporal' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: 50, y: 101 }, { x: 90, y: 202 }, { x: 20, y: 303 }],
}));

// baseline: string scale linear (no type) — does arm fire?
run('BASELINE scale:"linear" (no type) x, nominal y', mk({
  x: { field: 'x', trait: 'EncodingX', scale: 'linear' },
  y: { field: 'y', trait: 'EncodingY', type: 'nominal' },
  values: [{ x: 50, y: 'Alpha' }, { x: 90, y: 'Beta' }, { x: 20, y: 'Gamma' }],
}));
