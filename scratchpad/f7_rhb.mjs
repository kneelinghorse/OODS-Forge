import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk({ mark='MarkBar', xAgg, yAgg, xType='quantitative', yType='nominal', xScale, yScale, xBin, color, size, values, facet }) {
  const xEnc = { field:'x', trait:'EncodingX', ...(xType?{type:xType}:{}), ...(xAgg?{aggregate:xAgg}:{}), ...(xScale?{scale:{type:xScale}}:{}), ...(xBin?{bin:true}:{}) };
  const yEnc = { field:'y', trait:'EncodingY', ...(yType?{type:yType}:{}), ...(yAgg?{aggregate:yAgg}:{}), ...(yScale?{scale:{type:yScale}}:{}) };
  const enc = { x:xEnc, y:yEnc };
  if (color) enc.color = { field:color, trait:'EncodingColor' };
  if (size) enc.size = { field:size, trait:'EncodingSize', type:'quantitative' };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'s', name:'s',
    data:{ name:'d', values },
    marks:[{ trait:mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y:{ description:'' } };
  if (facet) spec.layout = { trait:'LayoutFacet', columns:{ field:facet } };
  return spec;
}

function report(label, spec) {
  console.log('\n===== '+label+' =====');
  try {
    const rpc = resolvePrimaryChannels(spec);
    console.log('resolvePrimaryChannels:', JSON.stringify(rpc));
  } catch(e){ console.log('rpc ERR', e.message); }
  try {
    const a = analyzeVizSpec(spec);
    console.log('correlation:', JSON.stringify(a.correlation), 'dataPoints:', a.dataPoints);
  } catch(e){ console.log('analyze ERR', e.message); }
  try {
    const n = generateNarrativeSummary(spec);
    console.log('summary:', n.summary);
    console.log('keyFindings:', JSON.stringify(n.keyFindings, null, 1));
  } catch(e){ console.log('narr ERR', e.message); }
}

// (3) STRING-category raw horizontal bar: y = nominal string, x = quant score.
report('STRING-category raw horizontal bar (y=nominal string, x=score)', mk({
  mark:'MarkBar', xType:'quantitative', yType:'nominal',
  values:[ {x:340,y:'Alpha'},{x:210,y:'Beta'},{x:88,y:'Gamma'} ]
}));

// (1) raw horizontal bar WITH color grouping (two series) + check correlation not corrupted
report('raw horizontal bar + color grouping', mk({
  mark:'MarkBar', xType:'quantitative', yType:'nominal', color:'seg',
  values:[ {x:340,y:'Alpha',seg:'North'},{x:210,y:'Beta',seg:'North'},{x:88,y:'Gamma',seg:'North'},
           {x:120,y:'Alpha',seg:'South'},{x:60,y:'Beta',seg:'South'},{x:400,y:'Gamma',seg:'South'} ]
}));

// (1b) raw horizontal bar with BOTH axes quantitative (y quant) -> should be measure=y per disclosure
report('bar both-axes-quant no aggregate (disclosed measure=y)', mk({
  mark:'MarkBar', xType:'quantitative', yType:'quantitative',
  values:[ {x:340,y:10},{x:210,y:20},{x:88,y:30} ]
}));

// (4) findAggregatedMeasure for raw horizontal bar - no aggregate -> no Total fabricated
report('raw horizontal bar - confirm no fabricated Total', mk({
  mark:'MarkBar', xType:'quantitative', yType:'nominal',
  values:[ {x:18,y:'Onboarding'},{x:-12,y:'Reporting'},{x:7,y:'Billing'} ]
}));
