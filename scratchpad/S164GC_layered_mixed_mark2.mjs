import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const rows = [
  { x: 1, y: 10, sh: 'A', col: 'A' },
  { x: 2, y: 9,  sh: 'A', col: 'A' },
  { x: 3, y: 8,  sh: 'A', col: 'A' },
  { x: 4, y: 20, sh: 'B', col: 'B' },
  { x: 5, y: 19, sh: 'B', col: 'B' },
  { x: 6, y: 18, sh: 'B', col: 'B' },
];
const mk = (extra) => ({ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, ...extra });

function run(label, enc, marks){
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'chart', data:{name:'d',values:rows}, marks, encoding:enc, a11y:{description:'y over x'} };
  const a = analyzeVizSpec(spec);
  console.log(`\n[${label}] corr=`, a.correlation);
  console.log('  summary:', generateNarrativeSummary(spec).summary);
}

// shape on mixed (defect), shape on point (control), color on mixed (control: color not mark-gated)
const encShape = mk({ shape:{field:'sh',trait:'EncodingShape'} });
const encColor = mk({ color:{field:'col',trait:'EncodingColor'} });
const P=(e)=>[{trait:'MarkPoint',encodings:e}];
const PL=(e)=>[{trait:'MarkPoint',encodings:e},{trait:'MarkLine',encodings:e}];

run('shape / point (control -> suppress)', encShape, P(encShape));
run('shape / mixed point+line (DEFECT)', encShape, PL(encShape));
run('color / mixed point+line (control -> suppress, color not mark-gated)', encColor, PL(encColor));
run('shape+color / mixed (color still partitions -> suppress?)', mk({shape:{field:'sh',trait:'EncodingShape'},color:{field:'col',trait:'EncodingColor'}}), PL(mk({shape:{field:'sh',trait:'EncodingShape'},color:{field:'col',trait:'EncodingColor'}})));
