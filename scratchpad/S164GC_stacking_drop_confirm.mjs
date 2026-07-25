import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [
  { x:1, c:100, y:50 }, { x:2, c:100, y:40 }, { x:3, c:100, y:30 },
  { x:1, c:200, y:10 }, { x:2, c:200, y:60 }, { x:3, c:200, y:110 },
];
const enc = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
  color:{field:'c',trait:'EncodingColor',type:'quantitative'},
};
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'total y over x, colored by ramp c'} };
const a = analyzeVizSpec(spec);
console.log('correlation =', a.correlation);
const s = generateNarrativeSummary(spec);
console.log('FULL summary:', s.summary);
console.log('has "Correlation" text:', /correlation/i.test(JSON.stringify(s)));
console.log('JSON keys mentioning corr:', JSON.stringify(s).match(/[^,{}"]*orrelation[^,{}"]*/g));
