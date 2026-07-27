import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// shape A falling, shape B falling, but pooled rises (Simpson)
const rows = [
  { x:1, y:10, sh:'A' }, { x:2, y:9, sh:'A' }, { x:3, y:8, sh:'A' },
  { x:4, y:20, sh:'B' }, { x:5, y:19, sh:'B' }, { x:6, y:18, sh:'B' },
];

const enc = {
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative'},
  shape:{field:'sh',trait:'EncodingShape'}, // categorical (no type)
};

// mixed / layered spec: point + line
const spec = {
  $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t',
  data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}],
  encoding:enc,
  a11y:{description:'y over x'}
};

const res = analyzeVizSpec(spec);
console.log('MIXED shape corr=', res.correlation);
const narr = generateNarrativeSummary(spec);
console.log('narrative=', JSON.stringify(narr.summary));
console.log('keyFindings=', JSON.stringify(narr.keyFindings));

// contrast: pure point mark
const specPoint = { ...spec, marks:[{trait:'MarkPoint',encodings:enc}] };
console.log('POINT shape corr=', analyzeVizSpec(specPoint).correlation);

// contrast: color instead of shape, mixed mark
const encColor = { x:enc.x, y:enc.y, color:{field:'sh',trait:'EncodingColor'} };
const specColorMixed = { ...spec, marks:[{trait:'MarkPoint',encodings:encColor},{trait:'MarkLine',encodings:encColor}], encoding:encColor };
console.log('MIXED color corr=', analyzeVizSpec(specColorMixed).correlation);

// hand pearson
function pearson(pts){
  const n=pts.length; const mx=pts.reduce((a,p)=>a+p[0],0)/n, my=pts.reduce((a,p)=>a+p[1],0)/n;
  let sxy=0,sx=0,sy=0; for(const [x,y] of pts){sxy+=(x-mx)*(y-my);sx+=(x-mx)**2;sy+=(y-my)**2;}
  return sxy/Math.sqrt(sx*sy);
}
console.log('A pearson=', pearson([[1,10],[2,9],[3,8]]));
console.log('B pearson=', pearson([[4,20],[5,19],[6,18]]));
console.log('pooled pearson=', pearson(rows.map(r=>[r.x,r.y])));

console.log('resolvePrimaryChannels mark=', resolvePrimaryChannels(spec)?.mark ?? '(n/a)');
