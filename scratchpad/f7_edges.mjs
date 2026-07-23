import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function specOf(xEnc, yEnc, extra, values, mark='MarkBar') {
  const enc = { x:xEnc, y:yEnc, ...(extra||{}) };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'s', name:'s',
    data:{ name:'d', values },
    marks:[{ trait:mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y:{ description:'' } };
}
function report(label, spec) {
  console.log('\n===== '+label+' =====');
  const rpc = resolvePrimaryChannels(spec);
  console.log('rpc:', JSON.stringify(rpc));
  const a = analyzeVizSpec(spec);
  console.log('corr:', JSON.stringify(a.correlation));
  const n = generateNarrativeSummary(spec);
  console.log('summary:', n.summary);
  console.log('keyFindings:', JSON.stringify(n.keyFindings));
}

// x quant via scale only (no type), y nominal string -> should still be measure=x
report('x stamped-via-scale-only, y nominal string', specOf(
  { field:'score', trait:'EncodingX', scale:{type:'linear'} },
  { field:'team', trait:'EncodingY', type:'nominal' },
  null,
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ] ));

// x UNSTAMPED numeric, y nominal string -> DISCLOSED measure=y. What does it narrate?
report('x UNSTAMPED numeric, y nominal string (disclosed measure=y)', specOf(
  { field:'score', trait:'EncodingX' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  null,
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ] ));

// x quant, y stamped quant via scale-linear only -> disqualifies rawHorizontalBar -> measure=y
report('x quant, y quant-via-scale (measure=y expected)', specOf(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'rank', trait:'EncodingY', scale:{type:'linear'} },
  null,
  [ {score:340,rank:1},{score:88,rank:9} ] ));

// x quant + bin -> disqualifies rawHorizontalBar (binned disclosed) -> measure=y
report('x quant BINNED, y nominal (binned disclosed measure=y)', specOf(
  { field:'score', trait:'EncodingX', type:'quantitative', bin:true },
  { field:'team', trait:'EncodingY', type:'nominal' },
  null,
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ] ));

// MarkArea raw horizontal
report('MarkArea raw horizontal (x quant, y nominal)', specOf(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  null,
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ], 'MarkArea' ));

// raw horizontal bar + quant SIZE channel -> does size corrupt anything / fabricate correlation?
report('raw horizontal bar + quant SIZE', specOf(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  { size:{ field:'weight', trait:'EncodingSize', type:'quantitative' } },
  [ {score:340,team:'Alpha',weight:5},{score:88,team:'Gamma',weight:1},{score:200,team:'Beta',weight:9} ] ));

// raw horizontal bar + facet -> correlation partition + measure interplay
report('raw horizontal bar + facet', (() => {
  const s = specOf(
    { field:'score', trait:'EncodingX', type:'quantitative' },
    { field:'team', trait:'EncodingY', type:'nominal' },
    null,
    [ {score:340,team:'Alpha',region:'N'},{score:88,team:'Gamma',region:'N'},
      {score:120,team:'Alpha',region:'S'},{score:400,team:'Gamma',region:'S'} ]);
  s.layout = { trait:'LayoutFacet', columns:{ field:'region' } };
  return s;
})());
