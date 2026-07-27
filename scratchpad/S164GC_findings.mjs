import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  {x:1,seg:100,y:50},{x:2,seg:100,y:40},{x:3,seg:100,y:30},
  {x:1,seg:200,y:10},{x:2,seg:200,y:60},{x:3,seg:200,y:110},
];
function mk(encExtra, mark, yAgg){
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg}, ...encExtra };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}
for (const [lbl, ex, mark] of [
  ['QUANT DETAIL area', { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkArea'],
  ['QUANT COLOR area', { color:{field:'c',trait:'EncodingColor',type:'quantitative'} }, 'MarkArea'],
  ['QUANT SIZE area', { size:{field:'sz',trait:'EncodingSize',type:'quantitative'} }, 'MarkArea'],
  ['QUANT DETAIL bar', { detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkBar'],
]) {
  const useRows = lbl.includes('COLOR') ? rows.map(r=>({x:r.x,c:r.seg,y:r.y})) : lbl.includes('SIZE') ? rows.map(r=>({x:r.x,sz:r.seg,y:r.y})) : rows;
  const spec = mk(ex, mark, 'sum');
  spec.data.values = useRows;
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  console.log(`\n=== ${lbl} ===`);
  console.log('  correlation=', a.correlation);
  console.log('  summary:', n.summary);
  console.log('  keyFindings:', JSON.stringify(n.keyFindings));
  console.log('  HAS "Correlation coefficient" finding:', (n.keyFindings||[]).some(f=>/Correlation coefficient/.test(f)));
}
