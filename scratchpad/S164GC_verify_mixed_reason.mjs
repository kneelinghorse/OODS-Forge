import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, shape:{field:'shp',trait:'EncodingShape'} };
const rows = [{x:1,y:20,shp:'a'},{x:2,y:16,shp:'a'},{x:3,y:12,shp:'a'},{x:3,y:40,shp:'b'},{x:4,y:36,shp:'b'},{x:5,y:32,shp:'b'}];
const mk = (marks) => ({ $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks, encoding:enc, a11y:{} });
// Same as color channel (which DOES split on mixed?) - swap shape->color to test whether color survives too
const encColor = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, color:{field:'shp',trait:'EncodingColor'} };
const mkC = (marks) => ({ $schema:'x', id:'t', name:'t', data:{name:'d',values:rows}, marks, encoding:encColor, a11y:{} });
console.log('mixed point+line SHAPE:', analyzeVizSpec(mk([{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}])).correlation);
console.log('mixed point+line COLOR (color has no mark-gate):', analyzeVizSpec(mkC([{trait:'MarkPoint',encodings:encColor},{trait:'MarkLine',encodings:encColor}])).correlation);
console.log('mixed line+area SHAPE:', analyzeVizSpec(mk([{trait:'MarkLine',encodings:enc},{trait:'MarkArea',encodings:enc}])).correlation);
