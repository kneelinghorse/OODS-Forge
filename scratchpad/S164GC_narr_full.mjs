import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  {x:1,seg:100,y:50},{x:2,seg:100,y:40},{x:3,seg:100,y:30},
  {x:1,seg:200,y:10},{x:2,seg:200,y:60},{x:3,seg:200,y:110},
];
function mk(encExtra, mark, yAgg){
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:yAgg}, ...encExtra };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}
const spec = mk({ detail:{field:'seg',trait:'EncodingDetail',type:'quantitative'} }, 'MarkArea','sum');
const a = analyzeVizSpec(spec);
console.log('correlation=', a.correlation);
console.log('--- FULL SUMMARY ---');
console.log(generateNarrativeSummary(spec).summary);
console.log('--- analysis keys ---', Object.keys(a));
console.log('correlationStrength=', a.correlationStrength, 'correlationDescription=', a.correlationDescription);

// contrast: a plain 2-var strong positive that SHOULD narrate
const enc2={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'} };
const plain = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:[{x:1,y:10},{x:2,y:20},{x:3,y:35},{x:4,y:50}]}, marks:[{trait:'MarkPoint',encodings:enc2}], encoding:enc2, a11y:{description:'y over x'} };
console.log('\n--- PLAIN strong positive summary ---');
console.log('correlation=', analyzeVizSpec(plain).correlation);
console.log(generateNarrativeSummary(plain).summary);
