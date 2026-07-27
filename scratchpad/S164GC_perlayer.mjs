import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  { x:1,y:10,sh:'A' },{ x:2,y:9,sh:'A' },{ x:3,y:8,sh:'A' },
  { x:4,y:20,sh:'B' },{ x:5,y:19,sh:'B' },{ x:6,y:18,sh:'B' },
];
const base = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'} };
const withShape = { ...base, shape:{field:'sh',trait:'EncodingShape'} };
// shape ONLY on marks[1] (line layer); top-level + marks[0] lack it -> resolveBinding reads top-level then marks[0] -> misses shape
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:base},{trait:'MarkLine',encodings:withShape}], encoding:base, a11y:{} };
console.log('shape only on marks[1], not top-level: corr=', analyzeVizSpec(spec).correlation);
// shape on top-level only, single POINT mark stays point (control): should suppress
const spec2 = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:base}], encoding:withShape, a11y:{} };
console.log('shape top-level, single point (control): corr=', analyzeVizSpec(spec2).correlation);
