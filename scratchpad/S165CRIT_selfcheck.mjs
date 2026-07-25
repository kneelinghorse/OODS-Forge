// Validate the s164 reference implementation against the BUILT dist before trusting any s165 prediction.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { refCorrelation } from './S165CRIT_ref.mjs';

const mk = (marks, encoding, rows, layout) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
  data: { name: 'd', values: rows }, marks, encoding, layout, a11y: { description: 'y over x' },
});
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Yq = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const Yavg = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' };
const Ysum = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' };
const Cseg = { field: 'seg', trait: 'EncodingColor' };
const Cq = { field: 'c', trait: 'EncodingColor', type: 'quantitative' };
const SZ = { field: 'sz', trait: 'EncodingSize', type: 'quantitative' };
const SH = { field: 'sh', trait: 'EncodingShape' };
const DET = { field: 'det', trait: 'EncodingDetail' };

const cases = [];
// A: shape on mixed marks
const aRows = [
  { x: 1, y: 50, sh: 'circle' }, { x: 2, y: 40, sh: 'circle' }, { x: 3, y: 30, sh: 'circle' },
  { x: 1, y: 10, sh: 'square' }, { x: 2, y: 5, sh: 'square' }, { x: 3, y: 0, sh: 'square' },
  { x: 4, y: 200, sh: 'circle' }, { x: 4, y: 160, sh: 'square' },
];
cases.push(['A shape×mixed', mk([{ trait: 'MarkLine', encodings: { x: X, y: Yq, shape: SH } }, { trait: 'MarkPoint', encodings: { x: X, y: Yq, shape: SH } }], { x: X, y: Yq, shape: SH }, aRows)]);
cases.push(['A-ctrl shape×point-only', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq, shape: SH } }], { x: X, y: Yq, shape: SH }, aRows)]);
// B: quant color on sum stack
const bRows = [
  { x: 1, y: 50, c: 100 }, { x: 2, y: 40, c: 100 }, { x: 3, y: 30, c: 100 },
  { x: 1, y: 10, c: 200 }, { x: 2, y: 60, c: 200 }, { x: 3, y: 110, c: 200 },
];
cases.push(['B quantcolor×sumstack', mk([{ trait: 'MarkBar', encodings: { x: X, y: Ysum, color: Cq } }], { x: X, y: Ysum, color: Cq }, bRows)]);
cases.push(['B-ctrl catcolor×sumstack', mk([{ trait: 'MarkBar', encodings: { x: X, y: Ysum, color: Cseg } }], { x: X, y: Ysum, color: { field: 'c', trait: 'EncodingColor' } }, bRows)]);
// C: collinear cat + size
const cRows = [
  { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 },
  { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 },
];
cases.push(['C collinear seg + size', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yavg, color: Cseg, size: SZ } }], { x: X, y: Yavg, color: Cseg, size: SZ }, cRows)]);
cases.push(['C-ctrl size only', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yavg, size: SZ } }], { x: X, y: Yavg, size: SZ }, cRows)]);
// honest controls
const riseRows = [{ x: 1, y: 1, seg: 'a' }, { x: 2, y: 2, seg: 'a' }, { x: 3, y: 3, seg: 'a' }, { x: 1, y: 10, seg: 'b' }, { x: 2, y: 12, seg: 'b' }, { x: 3, y: 14, seg: 'b' }];
cases.push(['honest all-rise 2 series', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq, color: Cseg } }], { x: X, y: Yq, color: Cseg }, riseRows)]);
cases.push(['plain scatter no channels', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq } }], { x: X, y: Yq }, [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 9 }])]);
cases.push(['single falling series', mk([{ trait: 'MarkLine', encodings: { x: X, y: Yq } }], { x: X, y: Yq }, [{ x: 1, y: 9 }, { x: 2, y: 5 }, { x: 3, y: 2 }])]);
// facet
const fRows = [{ x: 1, y: 1, f: 'A' }, { x: 2, y: 2, f: 'A' }, { x: 3, y: 3, f: 'A' }, { x: 1, y: 9, f: 'B' }, { x: 2, y: 5, f: 'B' }, { x: 3, y: 2, f: 'B' }];
cases.push(['facet Simpson', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq } }], { x: X, y: Yq }, fRows, { trait: 'LayoutFacet', columns: { field: 'f' } })]);
// detail
cases.push(['detail Simpson', mk([{ trait: 'MarkLine', encodings: { x: X, y: Yq, detail: DET } }], { x: X, y: Yq, detail: DET }, [{ x: 1, y: 1, det: 'a' }, { x: 2, y: 3, det: 'a' }, { x: 3, y: 6, det: 'a' }, { x: 1, y: 40, det: 'b' }, { x: 2, y: 30, det: 'b' }, { x: 3, y: 25, det: 'b' }])]);
// bar + size
cases.push(['bar + size quant', mk([{ trait: 'MarkBar', encodings: { x: X, y: Yavg, size: SZ } }], { x: X, y: Yavg, size: SZ }, cRows)]);
// no aggregate + size
cases.push(['raw scatter + size Simpson', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq, size: SZ } }], { x: X, y: Yq, size: SZ }, cRows)]);
// layered different color fields
const lRows = [
  { x: 1, y: 50, a: 'k', b: 'p' }, { x: 2, y: 40, a: 'k', b: 'p' }, { x: 3, y: 30, a: 'k', b: 'p' },
  { x: 1, y: 10, a: 'k', b: 'q' }, { x: 2, y: 60, a: 'k', b: 'q' }, { x: 3, y: 110, a: 'k', b: 'q' },
];
cases.push(['layered diff color fields', mk([{ trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'a', trait: 'EncodingColor' } } }, { trait: 'MarkPoint', encodings: { x: X, y: Yq, color: { field: 'b', trait: 'EncodingColor' } } }], undefined, lRows)]);

let bad = 0;
for (const [label, spec] of cases) {
  const dist = analyzeVizSpec(spec).correlation;
  const ref = refCorrelation(spec, 's164');
  const ok = dist === ref.correlation;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'MISMATCH'} ${label.padEnd(30)} dist=${String(dist).padEnd(8)} ref164=${String(ref.correlation).padEnd(8)} ${ok ? '' : JSON.stringify(ref)}`);
}
console.log(`\n${bad === 0 ? 'REFERENCE IMPL VALIDATED (s164 arm matches dist on all ' + cases.length + ' cases)' : bad + ' MISMATCHES — ref impl not trustworthy'}`);
