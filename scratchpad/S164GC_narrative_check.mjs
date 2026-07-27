import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows=[{x:1,y:10,g:'A'},{x:2,y:8,g:'A'},{x:3,y:6,g:'A'},{x:4,y:30,g:'B'},{x:5,y:28,g:'B'},{x:6,y:26,g:'B'}];
const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},shape:{field:'g',trait:'EncodingShape'}};
const spec={$schema:'https://oods.dev/viz-spec/v1',id:'t',name:'Chart',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
const n=generateNarrativeSummary(spec);
console.log('corr=', analyzeVizSpec(spec).correlation);
console.log('FULL narrative:\n', JSON.stringify(n, null, 2));
