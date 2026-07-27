// S164 v2 RE-CRITIC — lens "magfloor".
// ATTACK: the τ floor is relative to range(pooled cell values). In a Simpson, the BETWEEN-group
// vertical separation is what CREATES the misleading pooled sign — and it inflates range(pooled).
// So a STRONG-separation Simpson (large offset) has within-series falls that are large & visible
// yet SMALL relative to pooled range => below τ => v2 G1 records NO opposition => NARRATES.
// This is defect-5's own class (size-only, n>=2 per band), which §4 claims CLOSED.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
// fitted change across x = OLS slope * (xmax - xmin)  (the memo §10 Δ_subseries)
function fittedDelta(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0; for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; }
  if (dx === 0) return null; const slope = num / dx;
  const xs = pairs.map(p => p[0]); return slope * (Math.max(...xs) - Math.min(...xs));
}

function runCase(label, rows, enc, bands, bandField) {
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: label, name: label,
    data: { name: 'd', values: rows },
    marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'avg y over x' },
  };
  const a = analyzeVizSpec(spec);
  const { summary } = generateNarrativeSummary(spec);
  const pooledPairs = rows.map(r => [r.x, r.y]);
  const pooled = pearson(pooledPairs);
  const ys = rows.map(r => r.y);
  const range = Math.max(...ys) - Math.min(...ys);
  console.log(`\n===== ${label} =====`);
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('CURRENT SUT correlation:', a.correlation, '| summary:', summary.slice(0, 90));
  console.log(`pooled pearson = ${pooled?.toFixed(4)}  (pooledSign=${Math.sign(pooled)})`);
  console.log(`range(pooled cell values) = ${range}`);
  for (const tau of [0.10, 0.15, 0.05]) console.log(`  tau=${tau} -> floor = tau*range = ${(tau*range).toFixed(1)}`);
  console.log('drawn sub-series (each is a band the viewer sees):');
  let anyOpposeAt10 = false;
  for (const b of bands) {
    const sub = rows.filter(r => r[bandField] === b).map(r => [r.x, r.y]);
    const r = pearson(sub); const d = fittedDelta(sub);
    const opposeSign = Math.sign(d) === -Math.sign(pooled);
    const floor10 = 0.10 * range;
    const meaningful = Math.abs(d) >= floor10;
    const opposes = opposeSign && meaningful;
    if (opposes) anyOpposeAt10 = true;
    console.log(`  band ${bandField}=${b}: pearson=${r?.toFixed(3)} fittedΔ=${d?.toFixed(1)} ` +
      `|Δ|=${Math.abs(d).toFixed(1)} vs floor(τ=.10)=${floor10.toFixed(1)} -> ` +
      `${opposeSign ? 'opposite-sign' : 'same-sign'}, ${meaningful ? 'ABOVE-τ' : 'BELOW-τ'} => ` +
      `${opposes ? 'OPPOSES(vote)' : 'no vote'}`);
  }
  console.log(`>>> HAND-SIM v2 G1 (τ=0.10): any votable sub-series opposes? ${anyOpposeAt10}` +
    ` => v2 ${anyOpposeAt10 ? 'SUPPRESSES (undefined)' : 'NARRATES pooled = ' + pooled?.toFixed(3)}`);
}

// ---- CASE A: strong-separation size-only Simpson. Each band PLUNGES 80 units (visible), pooled +.
const A = [];
const addA = (x, y, sz) => A.push({ x, y, sz });
addA(1,100,10); addA(2,60,10); addA(3,20,10);          // band sz10: 100->20 (an 80% intra-band drop!)
addA(4,2000,50); addA(5,1960,50); addA(6,1920,50);     // band sz50: 2000->1920
addA(7,4000,90); addA(8,3960,90); addA(9,3920,90);     // band sz90: 4000->3920
const encQ = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
runCase('A: strong-sep SIZE-ONLY Simpson (defect-5 class)', A, encQ, [10,50,90], 'sz');

// ---- CASE B: same shape but CATEGORICAL color partition (has a G0 backstop) for contrast.
const B = [];
const addB = (x, y, seg) => B.push({ x, y, seg });
addB(1,100,'a'); addB(2,60,'a'); addB(3,20,'a');
addB(4,2000,'b'); addB(5,1960,'b'); addB(6,1920,'b');
addB(7,4000,'c'); addB(8,3960,'c'); addB(9,3920,'c');
const encC = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor', type: 'nominal' },
};
runCase('B: strong-sep COLOR Simpson (G0 categorical backstop)', B, encC, ['a','b','c'], 'seg');

// ---- CASE C: monotone-but-shallow r=-1 sub-series (attack c): perfect fall, small magnitude.
const C = [];
const addC = (x, y, sz) => C.push({ x, y, sz });
addC(1,100,10); addC(2,99,10); addC(3,98,10); addC(4,97,10); addC(5,96,10);   // r=-1 exactly, Δ=-4
addC(6,900,50); addC(7,899,50); addC(8,898,50); addC(9,897,50); addC(10,896,50);
addC(11,1800,90); addC(12,1799,90); addC(13,1798,90); addC(14,1797,90); addC(15,1796,90);
runCase('C: r=-1.0 shallow sub-series (perfect fall, small Δ)', C, encQ, [10,50,90], 'sz');
