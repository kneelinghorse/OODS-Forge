import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  { x:1,y:10,sh:'A' },{ x:2,y:9,sh:'A' },{ x:3,y:8,sh:'A' },
  { x:4,y:20,sh:'B' },{ x:5,y:19,sh:'B' },{ x:6,y:18,sh:'B' },
];
const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, shape:{field:'sh',trait:'EncodingShape'} };
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'Sales', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{} };
const r = generateNarrativeSummary(spec);
console.log('corr=', analyzeVizSpec(spec).correlation);
console.log('summary:', r.summary);
console.log('keyFindings:', JSON.stringify(r.keyFindings,null,1));
