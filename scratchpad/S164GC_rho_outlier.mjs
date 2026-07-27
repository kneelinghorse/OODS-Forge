import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let cov=0,vx=0,vy=0;for(let i=0;i<n;i++){cov+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}return cov/Math.sqrt(vx*vy);}
function run(label, rowsA, rowsB){
  const rows=[...rowsA,...rowsB];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'t',name:'t',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
  const rB=pearson(rowsB.map(r=>r.x),rowsB.map(r=>r.y));
  const corr=analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===\n  B y=${JSON.stringify(rowsB.map(r=>r.y))} r=${rB.toFixed(3)}  SUT corr=${corr}  ${generateNarrativeSummary(spec).summary.slice(0,70)}`);
}
const A=[{x:1,y:1,sz:10},{x:2,y:2,sz:10},{x:3,y:3,sz:10}];
// single-spike-then-flat: the ONLY monotone-noninc shape with |r|<0.5 (r=-0.48). Human reads "one spike then flat", not "falling".
run('single-spike B [50,0,0,0,0,0]', A,
  [{x:5,y:50,sz:20},{x:6,y:0,sz:20},{x:7,y:0,sz:20},{x:8,y:0,sz:20},{x:9,y:0,sz:20},{x:10,y:0,sz:20}]);
