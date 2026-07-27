// F7 assert_proxy lens. Two questions:
//  (1) Would the PROPOSED decomposition (direction per (partition∪grouping) sub-series,
//      contradiction-first) suppress the current phantom?  HAND-SIMULATE.
//  (2) Is an INDEPENDENT drawn-marks oracle (operand a from drawnCellKeyFields cells) actually
//      independent of the runtime narrate decision (operand b = SUT.correlation)?  Demonstrate the
//      shape the rule-14 assert MUST take to bite a revert-to-pooled.
import { analyzeVizSpec, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const sign = (r) => (r == null ? 'unk' : r > 0 ? 1 : r < 0 ? -1 : 0);

// same fixture family as the survivor: seg categorical (partition), band quantitative (grouping)
const rows = [];
const push = (x, y, seg, band) => rows.push({ x, y, seg, sz: band });
for (const seg of ['A', 'B']) {
  const base = seg === 'A' ? 0 : 1000;
  push(1, base + 50, seg, 100); push(2, base + 40, seg, 100); push(3, base + 30, seg, 100);
  push(4, base + 250, seg, 200); push(5, base + 240, seg, 200); push(6, base + 230, seg, 200);
}
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 's', name: 's',
  data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc,
  a11y: { description: 'avg y over x' } };

// operand (b): the SUT's ACTUAL narrate decision
const sutCorr = analyzeVizSpec(spec).correlation;

// operand (a): INDEPENDENT drawn-marks oracle. Project raw rows to drawn cells keyed by
// (dim ∪ partition ∪ grouping) = (x, seg, sz), avg the measure, then per (seg,sz) sub-series pearson.
// Computed ENTIRELY here — calls NO runtime classifier/grouping helper.
const cellMap = new Map();
for (const r of rows) {
  const k = `${r.seg}|${r.sz}|${r.x}`;
  if (!cellMap.has(k)) cellMap.set(k, { seg: r.seg, sz: r.sz, x: r.x, ys: [] });
  cellMap.get(k).ys.push(r.y);
}
const cells = [...cellMap.values()].map((c) => ({ seg: c.seg, sz: c.sz, x: c.x, y: c.ys.reduce((a, b) => a + b, 0) / c.ys.length }));
const subKeys = [...new Set(cells.map((c) => `${c.seg}|${c.sz}`))];
const pooled = pearson(cells.map((c) => [c.x, c.y]));
console.log('pooled over drawn cells:', pooled?.toFixed(4), 'sign', sign(pooled));
const subDirs = [];
for (const sk of subKeys) {
  const sub = cells.filter((c) => `${c.seg}|${c.sz}` === sk).map((c) => [c.x, c.y]);
  const d = sub.length >= 2 ? sign(pearson(sub)) : 'n<2';
  subDirs.push({ sk, n: sub.length, dir: d });
}
console.log('per-sub-series directions (operand a):', JSON.stringify(subDirs));

// PROPOSED decomposition verdict: contradiction-first — suppress if ANY n>=2 sub-series contradicts pooled sign
const voting = subDirs.filter((s) => s.dir === 1 || s.dir === -1 || s.dir === 0);
const contradicts = voting.some((s) => s.dir !== sign(pooled) && sign(pooled) !== 0);
const proposedNarrate = voting.length === 0 ? true : !contradicts; // fallback only when NO sub-series votes
console.log('\nPROPOSED algorithm -> narrate?', proposedNarrate, '(false = suppressed = honest here)');

// rule-14 DIRECT assert shape: no narrated direction may contradict any n>=2 drawn sub-series
const narrated = sutCorr !== undefined && sutCorr !== null;
const honestViolation = narrated && voting.some((s) => s.dir !== sign(sutCorr) && s.dir !== 0);
console.log('\n=== rule-14 assert (INDEPENDENT operands) ===');
console.log('operand b (SUT decision): correlation =', sutCorr, '(narrated=' + narrated + ')');
console.log('operand a (drawn sub dirs):', voting.map((s) => s.dir).join(','));
console.log('ASSERT violated by CURRENT dist?', honestViolation, '(true = the assert bites TODAY, pre-fix)');
console.log('\nKEY: operand (a) here calls NO runtime grouping helper. A revert of the runtime');
console.log('decomposition to the pooled vote would move operand (b) to narrate but leave (a) falling');
console.log('-> assert RED. IF instead operand (a) shared the runtime decomposition helper (memo §3');
console.log('bullet 1 lists the assert as a CONSUMER), the revert moves BOTH -> tautology, cannot bite.');
