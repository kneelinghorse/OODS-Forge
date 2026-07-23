import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// F1 lens: pooled VALUE keys cells by drawnCellKeyFields (INCLUDES quantitative size,
// unconditional). DIRECTION classifier re-projects each color-partition group with
// groupingFields=[] -> COLLAPSES size. Under a SUM aggregate with UNEVEN per-x cell counts,
// the collapse flips each color-series' TRUE (drawn) DOWN direction into UP (count-weighted sum),
// hiding a COLOR-partition Simpson reversal: both color series FALL, pooled RISES.
//
// Drawn cells (per x,seg,sz) — one raw row each, so sum == that value:
//   Color A (low-x region):   (x1,100) | (x2,90)(x2,80)(x2,70)   -> within A: DOWN
//   Color B (high-x region):  (x3,300) | (x4,290)(x4,280)(x4,270)-> within B: DOWN
//   pooled over all cells: A low-y at low-x, B high-y at high-x  -> UP
//   collapsed sum per (x,seg):  A x1=100 x2=240 UP ; B x3=300 x4=840 UP -> classes [UP,UP] agrees pooled UP -> NARRATE

const values = [
  // Color A
  { x: 1, y: 100, seg: 'A', sz: 1 },
  { x: 2, y: 90,  seg: 'A', sz: 2 },
  { x: 2, y: 80,  seg: 'A', sz: 3 },
  { x: 2, y: 70,  seg: 'A', sz: 4 },
  // Color B
  { x: 3, y: 300, seg: 'B', sz: 1 },
  { x: 4, y: 290, seg: 'B', sz: 2 },
  { x: 4, y: 280, seg: 'B', sz: 3 },
  { x: 4, y: 270, seg: 'B', sz: 4 },
];

const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
  color: { field: 'seg', trait: 'EncodingColor', type: 'nominal' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative', scale: { type: 'linear' } },
};

const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'f1sz', name: 'f1sz',
  data: { name: 'd', values },
  marks: [{ trait: 'MarkPoint', encodings: enc }],
  encoding: enc,
  a11y: { description: 'size collapse probe' },
};

console.log('resolvePrimaryChannels:', resolvePrimaryChannels(spec));
const a = analyzeVizSpec(spec);
console.log('analysis.correlation:', a.correlation);
const n = generateNarrativeSummary(spec);
console.log('summary:', n.summary);
console.log('keyFindings:', JSON.stringify(n.keyFindings, null, 2));

// Ground truth checks:
// within-color TRUE drawn direction (over per-(x,sz) drawn cells):
function pearson(pts){const n=pts.length;const mx=pts.reduce((s,p)=>s+p[0],0)/n;const my=pts.reduce((s,p)=>s+p[1],0)/n;let cov=0,vx=0,vy=0;for(const[x,y]of pts){cov+=(x-mx)*(y-my);vx+=(x-mx)**2;vy+=(y-my)**2;}return cov/Math.sqrt(vx*vy);}
const A=[[1,100],[2,90],[2,80],[2,70]], B=[[3,300],[4,290],[4,280],[4,270]];
console.log('\n-- ground truth --');
console.log('true drawn dir color A (per-cell pearson):', pearson(A).toFixed(3), '(negative = FALLING)');
console.log('true drawn dir color B (per-cell pearson):', pearson(B).toFixed(3), '(negative = FALLING)');
const all=[...A,...B];
console.log('pooled over drawn cells:', pearson(all).toFixed(3), '(positive = RISING)');
