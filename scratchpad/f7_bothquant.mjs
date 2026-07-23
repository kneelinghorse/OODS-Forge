import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function spec(xEnc, yEnc, values, mark='MarkBar', extra) {
  const enc = { x:xEnc, y:yEnc, ...(extra||{}) };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'s', name:'s',
    data:{ name:'d', values }, marks:[{ trait:mark, encodings: JSON.parse(JSON.stringify(enc)) }],
    encoding: JSON.parse(JSON.stringify(enc)), a11y:{ description:'' } };
}
function report(label, s) {
  console.log('\n===== '+label+' =====');
  console.log('rpc:', JSON.stringify(resolvePrimaryChannels(s)));
  const a = analyzeVizSpec(s); console.log('corr:', JSON.stringify(a.correlation));
  const n = generateNarrativeSummary(s);
  console.log('summary:', n.summary); console.log('kf:', JSON.stringify(n.keyFindings));
}
// both explicitly quantitative, no aggregate -> DISCLOSED measure=y
report('bar both type:quantitative no-agg (disclosed measure=y)', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'rank', trait:'EncodingY', type:'quantitative' },
  [ {score:340,rank:1},{score:88,rank:9},{score:200,rank:5} ]));

// string-category silent variant: x quant, y string, only ONE row per category
report('single-row string-category raw horizontal bar', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:340,team:'Alpha'} ]));

// raw horizontal bar where x values include a total-looking sum? confirm no Total fabricated with many rows
report('raw horizontal bar many rows - Total check', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:10,team:'A'},{score:20,team:'B'},{score:30,team:'C'},{score:40,team:'D'},{score:50,team:'E'} ]));

// raw horizontal bar + color where color duplicates categories (grouped) - extrema honest?
report('raw horizontal bar color-grouped duplicate cats', spec(
  { field:'score', trait:'EncodingX', type:'quantitative' },
  { field:'team', trait:'EncodingY', type:'nominal' },
  [ {score:10,team:'A',seg:'X'},{score:90,team:'A',seg:'Y'},{score:20,team:'B',seg:'X'},{score:5,team:'B',seg:'Y'} ],
  'MarkBar', { color:{ field:'seg', trait:'EncodingColor' } }));
