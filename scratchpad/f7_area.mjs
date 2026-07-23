import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function spec(xEnc, yEnc, values, mark='MarkArea', extra) {
  const enc = { x:xEnc, y:yEnc, ...(extra||{}) };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'s', name:'s',
    data:{ name:'d', values },
    marks:[{ trait:mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)),
    a11y:{ description:'' } };
}
function report(label, s) {
  console.log('\n===== '+label+' =====');
  console.log('rpc:', JSON.stringify(resolvePrimaryChannels(s)));
  const a = analyzeVizSpec(s);
  console.log('mark:', a.mark, 'trend:', JSON.stringify(a.trend), 'first:', JSON.stringify(a.first), 'last:', JSON.stringify(a.last));
  const n = generateNarrativeSummary(s);
  console.log('summary:', n.summary);
  console.log('keyFindings:', JSON.stringify(n.keyFindings));
}

// HORIZONTAL area (m2 reoriented measure=x) over nominal category -> trend?
report('HORIZONTAL area x=quant score, y=nominal team', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ]));

// VERTICAL area baseline: x=nominal team, y=quant score -> pre-existing measure=y. Trend?
report('VERTICAL area x=nominal team, y=quant score (baseline)', spec(
  { field:'team', trait:'EncodingX', type:'nominal' },
  { field:'score', trait:'EncodingY', type:'quantitative' },
  [ {team:'Alpha',score:340},{team:'Gamma',score:88} ]));

// HORIZONTAL BAR (not area) over nominal -> trend? (should be none for bar)
report('HORIZONTAL BAR x=quant score, y=nominal team', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:340,team:'Alpha'},{score:88,team:'Gamma'} ], 'MarkBar'));

// HORIZONTAL area with more categories, mixed direction
report('HORIZONTAL area 4 categories mixed', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:100,team:'A'},{score:400,team:'B'},{score:50,team:'C'},{score:300,team:'D'} ], 'MarkArea'));
