import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const base = (marks, encoding, values, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'x', name: 'x',
  data: { name: 'd', values }, marks, encoding, ...extra,
});
const mk = (trait, enc) => [{ trait, encodings: enc }];

function show(label, spec) {
  const corr = analyzeVizSpec(spec).correlation;
  let narr;
  try { narr = generateNarrativeSummary(spec); } catch (e) { narr = { summary: 'NARR-ERR:' + e.message, keyFindings: [] }; }
  console.log('\n=== ' + label + ' ===');
  console.log('  correlation:', JSON.stringify(corr));
  console.log('  status     :', narr.status);
  console.log('  summary    :', narr.summary);
  console.log('  keyFindings:', JSON.stringify(narr.keyFindings));
}

// AGREEING declared-agg case: both groups RISE, pooled RISES -> should NARRATE (corr defined).
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  const values = [
    { x: 1, y: 10, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 30, seg: 'A' },
    { x: 1, y: 15, seg: 'B' }, { x: 2, y: 25, seg: 'B' }, { x: 3, y: 35, seg: 'B' },
  ];
  show('AGREEING declared-agg (both RISE, pooled RISES) -> expect DEFINED correlation (guard NOT vacuous)',
    base(mk('MarkPoint', enc), enc, values));
}

// Plain single-series positive, no grouping, non-agg -> should narrate defined corr (sanity)
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  const values = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }, { x: 4, y: 8 }];
  show('SANITY plain positive scatter -> expect DEFINED positive correlation + narrated',
    base(mk('MarkPoint', enc), enc, values));
}

// FACET Simpson: layout facet by seg, each panel FALLS, pooled RISES -> expect SUPPRESS
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  const values = [
    { x: 1, y: 100, seg: 'A' }, { x: 2, y: 90, seg: 'A' }, { x: 3, y: 80, seg: 'A' },
    { x: 10, y: 200, seg: 'B' }, { x: 11, y: 190, seg: 'B' }, { x: 12, y: 180, seg: 'B' },
  ];
  const spec = base(mk('MarkPoint', enc), enc, values, {
    layout: { trait: 'LayoutFacet', columns: { field: 'seg' } },
  });
  show('FACET Simpson (each panel FALLS, pooled RISES) -> expect SUPPRESS', spec);
}

// FACET agreeing: each panel RISES, pooled RISES -> narrate (facet not over-suppressing)
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  };
  const values = [
    { x: 1, y: 10, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 30, seg: 'A' },
    { x: 10, y: 100, seg: 'B' }, { x: 11, y: 110, seg: 'B' }, { x: 12, y: 120, seg: 'B' },
  ];
  const spec = base(mk('MarkPoint', enc), enc, values, {
    layout: { trait: 'LayoutFacet', columns: { field: 'seg' } },
  });
  show('FACET agreeing (each panel RISES) -> expect DEFINED', spec);
}
