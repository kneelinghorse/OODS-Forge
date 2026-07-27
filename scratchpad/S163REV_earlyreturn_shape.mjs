import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const mk=(enc,rows,id)=>({ $schema:'https://oods.dev/viz-spec/v1', id, name:id,
  data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} });
// quant-shape (schema-allowed, perceptually degenerate) + Simpson bands, no categorical partition.
const rows=[{x:1,y:120,s:1},{x:2,y:90,s:1},{x:3,y:60,s:1},{x:4,y:220,s:2},{x:5,y:190,s:2},{x:6,y:160,s:2}];
const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
            y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
            shape:{field:'s',trait:'EncodingShape',type:'quantitative'} };
console.log('quant-shape early-return correlation:', analyzeVizSpec(mk(enc,rows,'sh')).correlation);
// CATEGORICAL shape (the normal case) -> becomes a partition -> gate active -> suppress
const enc2={...enc, shape:{field:'s',trait:'EncodingShape'}};
console.log('categorical-shape (gate active) correlation:', analyzeVizSpec(mk(enc2,rows,'sh2')).correlation);
