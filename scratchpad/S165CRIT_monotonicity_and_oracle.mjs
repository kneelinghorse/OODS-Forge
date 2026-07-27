// S165 pre-lock critic — targeted probes: (1) the §3.2 MONOTONICITY claim, (2) the §4 oracle's
// independence, (3) what the narrative actually SAYS on the layered-survivor fixtures.
import { analyzeVizSpec, generateNarrativeSummary, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { refCorrelation, separableFields } from './S165CRIT_ref.mjs';

const mk = (marks, encoding, rows, layout) => ({ $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks, encoding, layout, a11y: { description: 'y over x' } });
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Yq = { field: 'y', trait: 'EncodingY', type: 'quantitative' };

console.log('==================================================================');
console.log(' DEFECT PROBE 1 — §3.2 "monotone: can only add suppression" is FALSE');
console.log('==================================================================');
// Clause (c) of the s164 decision is NEGATIVE evidence:
//     suppresses = pooledSign !== 0 && !sharesPooled
// i.e. it fires exactly when anyVotable && votes==[] (every admitted band FLAT) && pooled != 0.
// ADDING a band that votes +pooledSign SETS sharesPooled -> clause (c) turns OFF -> NARRATE.
// The proposed unprefixed scan adds exactly such bands ({sz} across seg — the band that kills C).
//
// Construction: color=seg partitions; size=sz. Inside EACH seg group both sz bands are FLAT
// (n=2, equal y -> covariance 0 -> vote 0), but the group's pooled direction RISES (between-band
// offset) so G0 narrates. s164's G1 records two FLAT votes per group -> votes=[] -> clause (c)
// SUPPRESSES. s165's new cross-seg {sz} band rises -> sharesPooled -> clause (c) OFF -> NARRATES.
const monoRows = [
  { x: 1, y: 10, seg: 'A', sz: 1 }, { x: 2, y: 10, seg: 'A', sz: 1 },
  { x: 3, y: 100, seg: 'A', sz: 2 }, { x: 4, y: 100, seg: 'A', sz: 2 },
  { x: 5, y: 1000, seg: 'B', sz: 1 }, { x: 6, y: 1000, seg: 'B', sz: 1 },
  { x: 7, y: 5000, seg: 'B', sz: 2 }, { x: 8, y: 5000, seg: 'B', sz: 2 },
];
const monoEnc = { x: X, y: Yq, color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
const monoSpec = mk([{ trait: 'MarkPoint', encodings: monoEnc }], monoEnc, monoRows);
const m164 = refCorrelation(monoSpec, 's164');
const m165 = refCorrelation(monoSpec, 's165');
console.log('  drawn (seg,sz) bands (all n=2, equal y => FLAT):');
console.log('    A/sz1 y=[10,10]  A/sz2 y=[100,100]  B/sz1 y=[1000,1000]  B/sz2 y=[5000,5000]');
console.log('  SHIPPED dist(s164)      =', analyzeVizSpec(monoSpec).correlation, '(SUPPRESSED)');
console.log('  ref s164                =', m164.correlation, '| G0 narrates =', m164.g0, '| G1 votes =', JSON.stringify(m164.g1.votes), 'anyVotable =', m164.g1.anyVotable, 'sharesPooled =', m164.g1.sharesPooled, '=> suppresses', m164.g1.suppresses);
console.log('  PROPOSED s165           =', m165.correlation, '| G1\' votes =', JSON.stringify(m165.g1.votes), 'anyVotable =', m165.g1.anyVotable, 'sharesPooled =', m165.g1.sharesPooled, '=> suppresses', m165.g1.suppresses);
console.log('  separableFields         =', JSON.stringify(separableFields(monoSpec, 'x', 'y')));
console.log('  VERDICT:', m164.correlation === undefined && m165.correlation !== undefined
  ? 'MONOTONICITY VIOLATED — s164 SUPPRESSES, the proposal NARRATES ' + m165.correlation
  : 'not reproduced');
console.log('  narrative under the proposal would read:', JSON.stringify((generateNarrativeSummary(monoSpec).keyFindings || []).map(k => k.value ?? k)));

// second, simpler instance without size: quantitative color makes seg the ONLY s164 grouping.
const mono2Rows = [
  { x: 1, y: 10, seg: 'A', det: 'u' }, { x: 2, y: 10, seg: 'A', det: 'u' },
  { x: 3, y: 100, seg: 'A', det: 'v' }, { x: 4, y: 100, seg: 'A', det: 'v' },
  { x: 5, y: 1000, seg: 'B', det: 'u' }, { x: 6, y: 1000, seg: 'B', det: 'u' },
  { x: 7, y: 5000, seg: 'B', det: 'v' }, { x: 8, y: 5000, seg: 'B', det: 'v' },
];
const mono2Enc = { x: X, y: Yq, color: { field: 'seg', trait: 'EncodingColor' }, detail: { field: 'det', trait: 'EncodingDetail' } };
const mono2 = mk([{ trait: 'MarkPoint', encodings: mono2Enc }], mono2Enc, mono2Rows);
console.log('\n  variant (color=seg + detail=det, no size):');
console.log('    dist(s164) =', analyzeVizSpec(mono2).correlation, ' PROPOSED s165 =', refCorrelation(mono2, 's165').correlation);

console.log('\n\n==================================================================');
console.log(' DEFECT PROBE 2 — the §4 oracle vs the shape MARK-GATE');
console.log('==================================================================');
// §3.1 keeps shape mark-gated (separable only when some known mark splits by retina).
// The vega-lite adapter emits `shape` unconditionally as a nominal channel (vega-lite-adapter.ts:501).
const shpEnc = { x: X, y: Yq, shape: { field: 'shp', trait: 'EncodingShape' } };
const barShape = mk([{ trait: 'MarkBar', encodings: shpEnc }], shpEnc, [
  { x: 1, y: 30, shp: 'c' }, { x: 2, y: 20, shp: 'c' }, { x: 3, y: 10, shp: 'c' },
  { x: 4, y: 130, shp: 's' }, { x: 5, y: 120, shp: 's' }, { x: 6, y: 110, shp: 's' },
]);
const vlBar = toVegaLiteSpec(barShape);
console.log('  MarkBar + shape: compiled VL encoding keys =', JSON.stringify(Object.keys(vlBar.encoding ?? {})));
console.log('  compiled shape channel                    =', JSON.stringify(vlBar.encoding?.shape));
console.log('  separableFields(spec)                     =', JSON.stringify(separableFields(barShape, 'x', 'y')));
console.log('  => a naive compiledSplitFields() reads shp from the compiled encoding, separableFields does NOT.');
console.log('     The §4 assert separableFields ⊇ compiledSplitFields therefore either goes RED here,');
console.log('     or compiledSplitFields must re-apply the SAME mark gate — which makes the two operands');
console.log('     share a derivation (the rule-13a tautology the s162 critic caught).');
console.log('  s165 decision on this spec                 =', refCorrelation(barShape, 's165').correlation, '(both shape bands pearson -1.0)');

// Unmodelled-mark fail-safe hole: knownNormalizedMarks FILTERS unknown, so resolveMark is NEVER
// 'unknown' when at least one known mark is present.
const barRect = mk([{ trait: 'MarkBar', encodings: shpEnc }, { trait: 'MarkRect', encodings: shpEnc }], shpEnc, barShape.data.values);
console.log('\n  [MarkBar, MarkRect] + shape: separableFields =', JSON.stringify(separableFields(barRect, 'x', 'y')),
  '| s165 =', refCorrelation(barRect, 's165').correlation);
console.log('  memo §3.1 says shape is separable "always for mixed/unknown" — but knownNormalizedMarks');
console.log('  filters MarkRect out, so resolveMark = "bar" and the fail-safe never arms.');

console.log('\n\n==================================================================');
console.log(' DEFECT PROBE 3 — what the narrative SAYS on the layered survivors');
console.log('==================================================================');
const l1Rows = [
  { x: 1, y: 50, a: 'only', b: 'p' }, { x: 2, y: 40, a: 'only', b: 'p' }, { x: 3, y: 30, a: 'only', b: 'p' },
  { x: 4, y: 230, a: 'only', b: 'q' }, { x: 5, y: 220, a: 'only', b: 'q' }, { x: 6, y: 210, a: 'only', b: 'q' },
];
const l1 = mk([
  { trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'a', trait: 'EncodingColor' } } },
  { trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'b', trait: 'EncodingColor' } } },
], undefined, l1Rows);
const n1 = generateNarrativeSummary(l1);
console.log('  P1 layered color-on-marks[1]:');
console.log('    dist =', analyzeVizSpec(l1).correlation, ' PROPOSED s165 =', refCorrelation(l1, 's165').correlation);
console.log('    keyFindings =', JSON.stringify(n1.keyFindings));
console.log('    compiled layer color fields =', JSON.stringify(toVegaLiteSpec(l1).layer?.map((L) => L.encoding?.color?.field)));
console.log('    drawn b=p pearson = -1.000 ; drawn b=q pearson = -1.000  => NARRATED +0.832 over two FALLING drawn series');

const mRows = [{ x: 1, v1: 1, v2: 90 }, { x: 2, v1: 5, v2: 60 }, { x: 3, v1: 9, v2: 30 }];
const m1s = mk([
  { trait: 'MarkLine', encodings: { x: X, y: { field: 'v1', trait: 'EncodingY', type: 'quantitative' } } },
  { trait: 'MarkLine', encodings: { x: X, y: { field: 'v2', trait: 'EncodingY', type: 'quantitative' } } },
], undefined, mRows);
console.log('\n  P4 dual-measure layers:');
console.log('    dist =', analyzeVizSpec(m1s).correlation, ' PROPOSED s165 =', refCorrelation(m1s, 's165').correlation,
  ' separableFields =', JSON.stringify(separableFields(m1s, 'x', 'v1')));
console.log('    keyFindings =', JSON.stringify(generateNarrativeSummary(m1s).keyFindings));
console.log('    compiled layer y fields =', JSON.stringify(toVegaLiteSpec(m1s).layer?.map((L) => L.encoding?.y?.field)));
