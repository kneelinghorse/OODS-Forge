import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function mk(enc, rows){ return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} }; }
const rows = [
  {x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},
  {x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2},
];
// NON-collinear: seg maps to sz-tier (spans all x). Gate should then catch it via partition=seg direction.
const rowsNonCollinear = [
  {x:1,y:10,seg:'low',sz:1},{x:2,y:8,seg:'low',sz:1},{x:3,y:6,seg:'low',sz:1},
  {x:1,y:20,seg:'high',sz:2},{x:2,y:30,seg:'high',sz:2},{x:3,y:40,seg:'high',sz:2},
];
const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
console.log('collinear seg   ->', analyzeVizSpec(mk(enc,rows)).correlation);
console.log('NON-collinear seg (color==size tier) ->', analyzeVizSpec(mk(enc,rowsNonCollinear)).correlation);
const rowsMonth = [
  {x:1,y:10,seg:'Jan',sz:1},{x:2,y:8,seg:'Feb',sz:1},{x:3,y:6,seg:'Mar',sz:1},
  {x:1,y:20,seg:'Jan',sz:2},{x:2,y:30,seg:'Feb',sz:2},{x:3,y:40,seg:'Mar',sz:2},
];
console.log('month-label collinear ->', analyzeVizSpec(mk(enc,rowsMonth)).correlation, '|', generateNarrativeSummary(mk(enc,rowsMonth)).summary);
