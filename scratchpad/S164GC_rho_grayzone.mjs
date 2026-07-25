import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) {
    cov += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
    vy += (ys[i] - my) ** 2;
  }
  return cov / Math.sqrt(vx * vy);
}

// Build a Simpson: band A rises strongly (votes +), band B is the gray-zone faller.
// grouping axis = quantitative size sz. partition empty -> whole chart one group.
function run(label, rowsA, rowsB) {
  const rows = [...rowsA, ...rowsB];
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  };
  const spec = {
    $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: rows },
    marks: [{ trait: 'MarkPoint', encodings: enc }],
    encoding: enc, a11y: { description: 'y over x' },
  };
  const bandA = { xs: rowsA.map(r => r.x), ys: rowsA.map(r => r.y) };
  const bandB = { xs: rowsB.map(r => r.x), ys: rowsB.map(r => r.y) };
  const rA = pearson(bandA.xs, bandA.ys);
  const rB = pearson(bandB.xs, bandB.ys);
  const rPooled = pearson(rows.map(r => r.x), rows.map(r => r.y));
  const corr = analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===`);
  console.log(`  band A (sz=${rowsA[0].sz}) y=${JSON.stringify(bandA.ys)}  r=${rA.toFixed(3)}`);
  console.log(`  band B (sz=${rowsB[0].sz}) y=${JSON.stringify(bandB.ys)}  r=${rB.toFixed(3)}  |r|<0.5? ${Math.abs(rB) < 0.5}`);
  console.log(`  pooled r (hand) = ${rPooled.toFixed(3)}`);
  console.log(`  SUT corr = ${corr}  | ${generateNarrativeSummary(spec).summary.slice(0, 90)}`);
}

// Case 1: band B near-monotone falling but low |r| via a single up-blip (peak) -> NOT clearly falling
run('C1 peak-in-B',
  [{ x: 1, y: 1, sz: 10 }, { x: 2, y: 2, sz: 10 }, { x: 3, y: 3, sz: 10 }, { x: 4, y: 4, sz: 10 }],
  [{ x: 6, y: 5, sz: 20 }, { x: 7, y: 8, sz: 20 }, { x: 8, y: 4, sz: 20 }, { x: 9, y: 3, sz: 20 }]);

// Case 2: band B step-down-at-start (monotone nonincreasing, outlier first point) -> |r| just over/under 0.5
run('C2 stepdown-start',
  [{ x: 1, y: 1, sz: 10 }, { x: 2, y: 2, sz: 10 }, { x: 3, y: 3, sz: 10 }],
  [{ x: 5, y: 10, sz: 20 }, { x: 6, y: 0, sz: 20 }, { x: 7, y: 0, sz: 20 }, { x: 8, y: 0, sz: 20 }, { x: 9, y: 0, sz: 20 }]);

// Case 3: genuinely scattered gentle decline (DISCLOSED gray-zone, human=roughly flat)
run('C3 gentle-noisy-decline',
  [{ x: 1, y: 1, sz: 10 }, { x: 2, y: 2, sz: 10 }, { x: 3, y: 3, sz: 10 }],
  [{ x: 5, y: 100, sz: 20 }, { x: 6, y: 98, sz: 20 }, { x: 7, y: 101, sz: 20 }, { x: 8, y: 97, sz: 20 }, { x: 9, y: 99, sz: 20 }, { x: 10, y: 96, sz: 20 }]);

// Case 4 (CONTROL): band B clearly falling |r|>=0.5 -> MUST suppress (clean)
run('C4 clear-faller-control',
  [{ x: 1, y: 1, sz: 10 }, { x: 2, y: 2, sz: 10 }, { x: 3, y: 3, sz: 10 }],
  [{ x: 5, y: 30, sz: 20 }, { x: 6, y: 22, sz: 20 }, { x: 7, y: 18, sz: 20 }, { x: 8, y: 10, sz: 20 }]);
