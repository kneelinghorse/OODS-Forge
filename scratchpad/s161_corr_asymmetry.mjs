import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function handR(pairs) {
  const n = pairs.length;
  if (n < 3) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx2 += (x - mx) ** 2; dy2 += (y - my) ** 2; }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? null : num / den;
}

// Build raw rows. group A: x=1 (1 row y=10), x=2 (100 rows y=-1), x=3 (100 rows y=0)
// group B: x=4 (1 row y=30), x=5 (100 rows y=19), x=6 (100 rows y=20)
// declared aggregate=average on y => drawn cells per (x,color):
//   A: (1,10),(2,-1),(3,0)  -> agg trend FALLING (cov=-10)
//   B: (4,30),(5,19),(6,20) -> agg trend FALLING (cov=-10)
// RAW within-group pearson (count-weighted): A cov=+34.3 => +1, B cov=+34.3 => +1
// pooled over 6 drawn cells => +0.61 rising
const rows = [];
const push = (x, y, g, k) => { for (let i = 0; i < k; i++) rows.push({ x, y, seg: g }); };
push(1, 10, 'A', 1); push(2, -1, 'A', 100); push(3, 0, 'A', 100);
push(4, 30, 'B', 1); push(5, 19, 'B', 100); push(6, 20, 'B', 100);

// hand oracles
console.log('RAW group A pearson =', handR(rows.filter(r=>r.seg==='A').map(r=>[r.x,r.y]))?.toFixed(4));
console.log('RAW group B pearson =', handR(rows.filter(r=>r.seg==='B').map(r=>[r.x,r.y]))?.toFixed(4));
console.log('DRAWN cells A (agg avg) pearson =', handR([[1,10],[2,-1],[3,0]])?.toFixed(4));
console.log('DRAWN cells B (agg avg) pearson =', handR([[4,30],[5,19],[6,20]])?.toFixed(4));
console.log('POOLED over 6 drawn cells =', handR([[1,10],[2,-1],[3,0],[4,30],[5,19],[6,20]])?.toFixed(4));

const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'corr-asym',
  name: 'corr asym',
  data: { name: 'c', values: rows },
  marks: [{ trait: 'MarkPoint', encodings: {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
  } }],
  encoding: {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
  },
  a11y: { description: 'y over x' },
};

const analysis = analyzeVizSpec(spec);
const { summary, keyFindings } = generateNarrativeSummary(spec);
console.log('\nSUT analysis.correlation =', analysis.correlation);
console.log('SUT summary =', summary);
console.log('SUT keyFindings =', JSON.stringify(keyFindings));

// faceted twin (facet by seg instead of color)
const specF = JSON.parse(JSON.stringify(spec));
delete specF.marks[0].encodings.color; delete specF.encoding.color;
specF.layout = { trait: 'LayoutFacet', columns: { field: 'seg' } };
specF.id = 'corr-asym-facet';
const aF = analyzeVizSpec(specF);
console.log('\nFACET analysis.correlation =', aF.correlation);
console.log('FACET summary =', generateNarrativeSummary(specF).summary);
