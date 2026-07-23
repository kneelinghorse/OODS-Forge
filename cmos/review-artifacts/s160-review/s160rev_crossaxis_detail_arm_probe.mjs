// s160 review — does the UNTESTED claimed arm (correlation x DETAIL grouping) actually work?
// Hand oracle: F-SIMPSON grouped by a DETAIL channel (not color): per-group r = -1 exactly,
// pooled r = 594/606 = +0.9802 -> the Shape-B gate must suppress.
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const F_ROWS = [
  { x: 1, y: 10, panel: 'A' }, { x: 2, y: 9, panel: 'A' }, { x: 3, y: 8, panel: 'A' },
  { x: 11, y: 20, panel: 'B' }, { x: 12, y: 19, panel: 'B' }, { x: 13, y: 18, panel: 'B' },
  { x: 21, y: 30, panel: 'C' }, { x: 22, y: 29, panel: 'C' }, { x: 23, y: 28, panel: 'C' },
];
const encoding = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  detail: { field: 'panel', trait: 'EncodingDetail' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'detail-simpson',
  name: 'detail-simpson',
  data: { name: 'd', values: F_ROWS },
  marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
  encoding,
  a11y: { description: 'y over x by panel detail' },
};
const a = analyzeVizSpec(spec);
const narr = generateNarrativeSummary(spec);
console.log('detail-grouped Simpson correlation:', a.correlation, a.correlation === undefined ? '(SUPPRESSED - arm works)' : '(NARRATES - PHANTOM!)');
console.log('narrative:', narr.summary, '|', narr.keyFindings.join(' ; '));
process.exit(a.correlation === undefined ? 0 : 1);
