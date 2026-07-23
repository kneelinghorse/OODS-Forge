import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const base = (marks, encoding, values, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'x', name: 'x',
  data: { name: 'd', values }, marks, encoding,
  a11y: { description: 'test' }, ...extra,
});
const mk = (trait, enc) => [{ trait, encodings: enc }];

function show(label, spec) {
  const corr = analyzeVizSpec(spec).correlation;
  let narr;
  try { narr = generateNarrativeSummary(spec); } catch (e) { narr = { summary: 'NARR-ERR:' + e.message, keyFindings: [] }; }
  console.log('\n=== ' + label + ' ===');
  console.log('  correlation:', JSON.stringify(corr));
  console.log('  summary    :', narr.summary);
  console.log('  keyFindings:', JSON.stringify(narr.keyFindings));
}

// DETAIL Simpson declared-agg -> suppress, narration must NOT mention correlation
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    detail: { field: 'seg', trait: 'EncodingDetail' },
  };
  const values = [
    { x: 1, y: 100, seg: 'A' }, { x: 2, y: 90, seg: 'A' },
    { x: 10, y: 200, seg: 'B' }, { x: 11, y: 190, seg: 'B' },
  ];
  show('DETAIL n=2 declared-agg Simpson', base(mk('MarkPoint', enc), enc, values));
}

// AGREEING single scatter -> should narrate a correlation sentence
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  const values = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }, { x: 4, y: 8 }];
  show('AGREEING scatter (control, should narrate correlation)', base(mk('MarkPoint', enc), enc, values));
}

// raw horizontal bar narration
{
  const enc = { x: { field: 'v', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  const s = base(mk('MarkBar', enc), enc, [{ v: 10, cat: 'p' }, { v: 30, cat: 'q' }, { v: 20, cat: 'r' }]);
  show('raw-hbar narration (measure should be v: max 30, total 60)', s);
}

// heatmap narration
{
  const enc = {
    x: { field: 'col', trait: 'EncodingX', type: 'nominal' },
    y: { field: 'row', trait: 'EncodingY', type: 'nominal' },
    color: { field: 'temp', trait: 'EncodingColor', type: 'quantitative' },
  };
  const s = base([{ trait: 'MarkRect', encodings: enc }], enc, [
    { col: 'a', row: 'x', temp: 5 }, { col: 'b', row: 'y', temp: 9 }, { col: 'a', row: 'y', temp: 1 },
  ]);
  show('heatmap narration (measure should be temp)', s);
}
