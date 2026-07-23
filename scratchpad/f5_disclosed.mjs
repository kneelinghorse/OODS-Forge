import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const base = (marks, encoding, values, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'x', name: 'x',
  data: { name: 'd', values }, marks, encoding, a11y: { description: 'test' }, ...extra,
});
const mk = (trait, enc) => [{ trait, encodings: enc }];
function chans(spec){ return JSON.stringify(resolvePrimaryChannels(spec)); }

// DISCLOSED: horizontal LINE (quant x, nominal y, no agg) -> measure=y (inverts). Confirm disclosure honest.
{
  const enc = { x: { field: 'v', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  console.log('DISCLOSED horiz-LINE  -> expect y (disclosed):', chans(base(mk('MarkLine', enc), enc, [{v:10,cat:'p'},{v:20,cat:'q'}])));
}
// DISCLOSED: raw horizontal bar with UNSTAMPED numeric x -> measure=y. Confirm disclosure honest.
{
  const enc = { x: { field: 'v', trait: 'EncodingX' }, y: { field: 'cat', trait: 'EncodingY', type: 'nominal' } };
  console.log('DISCLOSED unstamped-x hbar -> expect y (disclosed):', chans(base(mk('MarkBar', enc), enc, [{v:10,cat:'p'},{v:20,cat:'q'}])));
}
// DISCLOSED: both-quant no-agg bar -> measure=y
{
  const enc = { x: { field: 'a', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'b', trait: 'EncodingY', type: 'quantitative' } };
  console.log('DISCLOSED both-quant bar -> expect y (disclosed):', chans(base(mk('MarkBar', enc), enc, [{a:10,b:5},{a:20,b:9}])));
}
// DISCLOSED: all-n=1 vacuous-pass — declared-agg Simpson where each group has ONE distinct x -> narrates pooled
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', aggregate: 'average' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  // each group single distinct x -> projects to n=1 -> unknown -> empty evidence -> vacuous narrate
  const values = [
    { x: 1, y: 10, seg: 'A' }, { x: 1, y: 12, seg: 'A' },
    { x: 5, y: 50, seg: 'B' }, { x: 5, y: 52, seg: 'B' },
    { x: 9, y: 90, seg: 'C' }, { x: 9, y: 92, seg: 'C' },
  ];
  const spec = base(mk('MarkPoint', enc), enc, values);
  console.log('DISCLOSED all-n=1 vacuous-pass -> correlation:', JSON.stringify(analyzeVizSpec(spec).correlation), '(disclosed all-n<=1 escape)');
}
// DISCLOSED: quant-size-only Simpson — size stamped quantitative groups pooled key but NOT partition
{
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  };
  const values = [
    { x: 1, y: 100, sz: 1 }, { x: 2, y: 90, sz: 1 }, { x: 3, y: 80, sz: 1 },
    { x: 10, y: 200, sz: 2 }, { x: 11, y: 190, sz: 2 }, { x: 12, y: 180, sz: 2 },
  ];
  const spec = base(mk('MarkPoint', enc), enc, values);
  console.log('DISCLOSED quant-size Simpson -> correlation:', JSON.stringify(analyzeVizSpec(spec).correlation), '(disclosed quant-size escape)');
}
