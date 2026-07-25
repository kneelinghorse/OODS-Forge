import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) { cov += (xs[i]-mx)*(ys[i]-my); vx += (xs[i]-mx)**2; vy += (ys[i]-my)**2; }
  return cov / Math.sqrt(vx * vy);
}
// monotonicity metric: fraction of consecutive steps that go down
function downFrac(ys) {
  let down = 0, tot = 0;
  for (let i = 1; i < ys.length; i++) { tot++; if (ys[i] < ys[i-1]) down++; }
  return down / tot;
}
function run(label, rowsA, rowsB) {
  const rows = [...rowsA, ...rowsB];
  const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  const bYs = rowsB.map(r=>r.y);
  const rA = pearson(rowsA.map(r=>r.x), rowsA.map(r=>r.y));
  const rB = pearson(rowsB.map(r=>r.x), bYs);
  const rPooled = pearson(rows.map(r=>r.x), rows.map(r=>r.y));
  const corr = analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===`);
  console.log(`  A y=${JSON.stringify(rowsA.map(r=>r.y))} r=${rA.toFixed(3)}`);
  console.log(`  B y=${JSON.stringify(bYs)} r=${rB.toFixed(3)} |r|<0.5?${Math.abs(rB)<0.5} down-steps=${(downFrac(bYs)*100).toFixed(0)}% net=${(bYs[bYs.length-1]-bYs[0])}`);
  console.log(`  pooled(hand)=${rPooled.toFixed(3)}  SUT corr=${corr}`);
  console.log(`  narrative: ${generateNarrativeSummary(spec).summary.slice(0,80)}`);
}

const A = [{x:1,y:1,sz:10},{x:2,y:2,sz:10},{x:3,y:3,sz:10}];
// G1: strictly monotone NON-increasing but |r|<0.5 (drop concentrated at one end)
run('G1 mono-noninc drop-at-start',
  A, [{x:5,y:20,sz:20},{x:6,y:5,sz:20},{x:7,y:5,sz:20},{x:8,y:4,sz:20},{x:9,y:4,sz:20},{x:10,y:3,sz:20}]);
// G2: strictly monotone DEcreasing every step, low r via convex shape (fast then flat)
run('G2 mono-dec convex',
  A, [{x:5,y:40,sz:20},{x:6,y:10,sz:20},{x:7,y:8,sz:20},{x:8,y:7,sz:20},{x:9,y:6,sz:20},{x:10,y:5,sz:20}]);
// G3: gentle noisy decline, net down, |r|<0.5
run('G3 noisy net-down',
  A, [{x:5,y:100,sz:20},{x:6,y:104,sz:20},{x:7,y:97,sz:20},{x:8,y:99,sz:20},{x:9,y:95,sz:20},{x:10,y:96,sz:20}]);
// G4: every-step-down but tiny, big noise -> |r| very low
run('G4 mono-dec tiny-slope big-noise',
  A, [{x:5,y:60,sz:20},{x:6,y:50,sz:20},{x:7,y:80,sz:20},{x:8,y:40,sz:20},{x:9,y:70,sz:20},{x:10,y:30,sz:20}]);
