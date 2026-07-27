import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  { x:1,y:10,c:'A' },{ x:2,y:9,c:'A' },{ x:3,y:8,c:'A' },
  { x:4,y:20,c:'B' },{ x:5,y:19,c:'B' },{ x:6,y:18,c:'B' },
];
const base = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'} };
const withColor = { ...base, color:{field:'c',trait:'EncodingColor'} };
// color ONLY on marks[1]; top-level + marks[0] lack it. Two point layers to keep single mark type? use point+point
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:base},{trait:'MarkPoint',encodings:withColor}], encoding:base, a11y:{} };
console.log('color only marks[1], point+point (single mark type): corr=', analyzeVizSpec(spec).correlation);
const specPL = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:base},{trait:'MarkLine',encodings:withColor}], encoding:base, a11y:{} };
console.log('color only marks[1], point+line (mixed): corr=', analyzeVizSpec(specPL).correlation);
