import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const base = (marks, encoding, values, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'x', name: 'x',
  data: { name: 'd', values },
  marks, encoding, ...extra,
});

const mk = (trait, enc) => [{ trait, encodings: enc }];

function show(label, spec) {
  let corr, chans, narr;
  try { corr = analyzeVizSpec(spec).correlation; } catch (e) { corr = 'ERR:' + e.message; }
  try { chans = resolvePrimaryChannels(spec); } catch (e) { chans = 'ERR:' + e.message; }
  try { narr = generateNarrativeSummary(spec); } catch (e) { narr = { summary: 'ERR:' + e.message, keyFindings: [] }; }
  console.log('\n=== ' + label + ' ===');
  console.log('  correlation:', JSON.stringify(corr));
  console.log('  channels   :', JSON.stringify(chans));
  console.log('  summary    :', narr.summary);
  const corrFind = (narr.keyFindings || []).filter(f => /correlat|relationship|positive|negative/i.test(JSON.stringify(f)));
  if (corrFind.length) console.log('  corrFinding:', JSON.stringify(corrFind));
}

// ---------- (1) DETAIL-grouped declared-aggregate Simpson ----------
// Two detail groups. Within each group, aggregate by dim (x), measure y=avg.
// Group A: as x rises, y FALLS. Group B: as x rises, y FALLS. Pooled: rises (Simpson).
// Detail must be partitioned -> both groups fall -> pooled positive must SUPPRESS.
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    detail: { field: 'seg', trait: 'EncodingDetail' },
  };
  // Group A low x (1,2) high y; Group B high x (10,11) low-ish y but each group internally falling.
  const values = [
    // group A: x small, y large, falling within group
    { x: 1, y: 100, seg: 'A' }, { x: 1, y: 100, seg: 'A' },
    { x: 2, y: 90, seg: 'A' }, { x: 2, y: 90, seg: 'A' },
    // group B: x large, y large (higher than A) -> pooled positive; within group falling
    { x: 10, y: 200, seg: 'B' }, { x: 10, y: 200, seg: 'B' },
    { x: 11, y: 190, seg: 'B' }, { x: 11, y: 190, seg: 'B' },
  ];
  show('(1) DETAIL declared-agg Simpson (both groups FALL, pooled RISES) -> expect SUPPRESS (corr undefined)',
    base(mk('MarkPoint', enc), enc, values));
}

// ---------- (1b) same but COLOR grouping (control it partitions) ----------
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  const values = [
    { x: 1, y: 100, seg: 'A' }, { x: 1, y: 100, seg: 'A' },
    { x: 2, y: 90, seg: 'A' }, { x: 2, y: 90, seg: 'A' },
    { x: 10, y: 200, seg: 'B' }, { x: 10, y: 200, seg: 'B' },
    { x: 11, y: 190, seg: 'B' }, { x: 11, y: 190, seg: 'B' },
  ];
  show('(1b) COLOR declared-agg Simpson control -> expect SUPPRESS',
    base(mk('MarkPoint', enc), enc, values));
}

// ---------- (2) n=2 declared-aggregate Simpson ----------
// Each group only 2 distinct x cells after projection. Both fall. Pooled rises.
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  const values = [
    { x: 1, y: 50, seg: 'A' }, { x: 2, y: 40, seg: 'A' },   // A: 2 cells, falls
    { x: 10, y: 150, seg: 'B' }, { x: 11, y: 140, seg: 'B' }, // B: 2 cells, falls
  ];
  show('(2) n=2 declared-agg Simpson (each group exactly 2 drawn cells, both FALL) -> expect SUPPRESS',
    base(mk('MarkPoint', enc), enc, values));
}

// ---------- (2b) n=2 NON-aggregate Simpson ----------
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  const values = [
    { x: 1, y: 50, seg: 'A' }, { x: 2, y: 40, seg: 'A' },
    { x: 10, y: 150, seg: 'B' }, { x: 11, y: 140, seg: 'B' },
  ];
  show('(2b) n=2 NON-agg Simpson -> expect SUPPRESS',
    base(mk('MarkPoint', enc), enc, values));
}

// ---------- (3) The 7 SUT-resolved orientation manifest ----------
console.log('\n\n######## (3) SUT-RESOLVED MANIFEST — 7 orientations ########');

// vertical-bar -> y
{
  const enc = { x: { field: 'cat', trait: 'EncodingX', type: 'nominal' }, y: { field: 'v', trait: 'EncodingY', type: 'quantitative' } };
  const s = base(mk('MarkBar', enc), enc, [{ cat: 'p', v: 10 }, { cat: 'q', v: 20 }]);
  console.log('vertical-bar   -> expect y   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// vertical-line -> y
{
  const enc = { x: { field: 't', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'v', trait: 'EncodingY', type: 'quantitative' } };
  const s = base(mk('MarkLine', enc), enc, [{ t: 1, v: 10 }, { t: 2, v: 20 }]);
  console.log('vertical-line  -> expect y   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// vertical-area -> y
{
  const enc = { x: { field: 't', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'v', trait: 'EncodingY', type: 'quantitative' } };
  const s = base(mk('MarkArea', enc), enc, [{ t: 1, v: 10 }, { t: 2, v: 20 }]);
  console.log('vertical-area  -> expect y   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// horizontal-strip (MarkPoint) -> x
{
  const enc = { x: { field: 'v', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  const s = base(mk('MarkPoint', enc), enc, [{ v: 10, cat: 'p' }, { v: 20, cat: 'q' }]);
  console.log('horiz-strip    -> expect x   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// declared-aggregate-horizontal-bar -> x
{
  const enc = { x: { field: 'v', trait: 'EncodingX', type: 'quantitative', aggregate: 'sum' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  const s = base(mk('MarkBar', enc), enc, [{ v: 10, cat: 'p' }, { v: 20, cat: 'q' }]);
  console.log('decl-agg-hbar  -> expect x   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// raw-horizontal-bar (stamped-quant x, un-binned) -> x
{
  const enc = { x: { field: 'v', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  const s = base(mk('MarkBar', enc), enc, [{ v: 10, cat: 'p' }, { v: 20, cat: 'q' }]);
  console.log('raw-hbar       -> expect x   :', JSON.stringify(resolvePrimaryChannels(s)));
}
// heatmap-color-is-measure -> color
{
  const enc = {
    x: { field: 'col', trait: 'EncodingX', type: 'nominal' },
    y: { field: 'row', trait: 'EncodingY', type: 'nominal' },
    color: { field: 'temp', trait: 'EncodingColor', type: 'quantitative' },
  };
  const s = base([{ trait: 'MarkRect', encodings: enc }], enc, [{ col: 'a', row: 'x', temp: 5 }, { col: 'b', row: 'y', temp: 9 }]);
  console.log('heatmap        -> expect color:', JSON.stringify(resolvePrimaryChannels(s)));
}
