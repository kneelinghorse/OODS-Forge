// S165 CRITIC — quantify the two over-suppression classes the draft opens.
// D1: rho=0.5 is applied to the CATEGORICAL partition axis for the first time (clause (c) fires
//     whenever EVERY drawn series is honestly directional but below the floor).
// D2: removing the partition prefix pools marks from DIFFERENT visual series into an S-keyed
//     "band", manufacturing n=2 votes that contradict each other.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5, signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pr(xs, ys) { const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n; let nu = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { nu += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const d = Math.sqrt(dx * dy); return d === 0 ? null : Math.round((nu / d) * 1000) / 1000; }
function cls(xs, ys) { const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n; let d = 0; for (const x of xs) d += (x - mx) ** 2; if (d === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let c = 0; for (let i = 0; i < 2; i++) c += (xs[i] - mx) * (ys[i] - my); return signOf(c); }
  const r = pr(xs, ys); if (r === null) return 0; return Math.abs(r) >= RHO ? signOf(r) : 0; }
const keyFor = (r, f) => f.map((k) => (r[k] === null || r[k] === undefined ? '\0null' : String(r[k]))).join('\0');
function redA(v, a) { if (a === 'count') return v.length; const n = v.map(Number).filter(Number.isFinite); if (!n.length) return undefined;
  if (a === 'sum') return n.reduce((x, y) => x + y, 0); if (a === 'average') return n.reduce((x, y) => x + y, 0) / n.length; return undefined; }
function subs(i) { const o = [[]]; for (const t of i) { const l = o.length; for (let k = 0; k < l; k++) o.push([...o[k], t]); } return o; }
function ser(rows, dim, meas, kf, agg) { const m = new Map();
  const push = (s, x, y) => { let e = m.get(s); if (!e) { e = { xs: [], ys: [] }; m.set(s, e); } e.xs.push(x); e.ys.push(y); };
  if (agg) { const c = new Map(); for (const r of rows) { const k = keyFor(r, [dim, ...kf]); let e = c.get(k);
      if (!e) { e = { sub: keyFor(r, kf), dim: r[dim], v: [] }; c.set(k, e); } e.v.push(r[meas]); }
    for (const e of c.values()) { const v = redA(e.v, agg), x = Number(e.dim); if (v === undefined || !Number.isFinite(x)) continue; push(e.sub, x, v); } }
  else for (const r of rows) { const x = Number(r[dim]), y = Number(r[meas]); if (Number.isFinite(x) && Number.isFinite(y)) push(keyFor(r, kf), x, y); }
  return [...m.values()]; }
function g1p(rows, dim, meas, sep, agg, pooled) {
  const ps = signOf(pooled), votes = []; let any = false, shares = false;
  if (!sep.length) return { s: false, why: 'no-op' };
  const rec = (d) => { if (d === 'unknown') return; any = true; if (d !== 0) votes.push(d); if (d !== 0 && d === ps) shares = true; };
  let fine = false, ev = null; const trace = [];
  for (const S of subs(sep)) for (const se of ser(rows, dim, meas, S, agg)) {
    if (new Set(se.xs).size < 2) continue; const d = cls(se.xs, se.ys); if (d === 'unknown') continue;
    if (!S.length) { ev = d; continue; } fine = true; rec(d);
    trace.push(`S={${S}} n=${se.xs.length} r=${se.xs.length >= 3 ? pr(se.xs, se.ys) : '(n=2 slope)'} dir=${d}`); }
  if (!fine && ev !== null) rec(ev);
  let s, why;
  if (!any) { s = false; why = 'fallback'; }
  else if (new Set(votes).size > 1) { s = true; why = '(a) votes span both signs'; }
  else if (votes.some((v) => v === -ps)) { s = true; why = '(b) real opposite'; }
  else { s = ps !== 0 && !shares; why = s ? '(c) EVERY drawn band FLAT under rho -> no band shares pooledSign' : 'narrate'; }
  return { s, why, votes, trace }; }
const mk = (rows, o = {}) => { const e = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(o.agg ? { aggregate: o.agg } : {}) } };
  if (o.color) e.color = { field: o.color, trait: 'EncodingColor', ...(o.colorQuant ? { type: 'quantitative' } : {}) };
  if (o.size) e.size = { field: o.size, trait: 'EncodingSize', type: 'quantitative' };
  if (o.detail) e.detail = { field: o.detail, trait: 'EncodingDetail', type: 'quantitative' };
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 'q', name: 'q', data: { name: 'd', values: rows }, marks: [{ trait: o.mark ?? 'MarkLine', encodings: e }], encoding: e,
    ...(o.facet ? { layout: { trait: 'LayoutFacet', columns: { field: o.facet } } } : {}), a11y: { description: 'y over x' } }; };

// ═══ D1: the rho floor now applies to the CATEGORICAL series/facet axis ═══
console.log('══════ D1 — rho=0.5 newly applied to CATEGORICAL series (clause (c)) ══════');
console.log('  3 series, ALL sharing the same TRUE positive slope, per-series |r| swept.\n');
console.log('   per-series r | pooled r | CURRENT     | PROPOSAL');
console.log('   -------------+----------+-------------+----------');
// construct a series with a controlled r: y = x + k*wiggle, tune k
function seriesWithR(nX, targetR) {
  // deterministic zig-zag; binary search the wiggle amplitude for the target |r|
  const zig = (i) => (i % 2 === 0 ? -1 : 1) * (1 + (i % 3));
  let lo = 0, hi = 200;
  for (let it = 0; it < 60; it++) {
    const amp = (lo + hi) / 2;
    const ys = []; for (let i = 0; i < nX; i++) ys.push(i + amp * zig(i));
    const r = pr([...Array(nX).keys()], ys);
    if (r > targetR) lo = amp; else hi = amp;
  }
  const amp = (lo + hi) / 2; const ys = []; for (let i = 0; i < nX; i++) ys.push(i + amp * zig(i));
  return ys;
}
for (const target of [0.9, 0.7, 0.55, 0.49, 0.45, 0.40, 0.30, 0.20]) {
  const base = seriesWithR(8, target);
  const rows = []; ['North', 'South', 'East'].forEach((seg, s) => base.forEach((y, i) => rows.push({ x: i + 1, y: y + s * 500, seg })));
  const spec = mk(rows, { color: 'seg' });
  const cur = analyzeVizSpec(spec).correlation;
  const perR = pr([...Array(8).keys()], base);
  if (cur === undefined) { console.log(`   ${String(perR).padStart(12)} |          | SUPPRESSED  | (n/a)`); continue; }
  const g = g1p(rows, 'x', 'y', ['seg'], undefined, cur);
  console.log(`   ${String(perR).padStart(12)} | ${String(cur).padStart(8)} | narrates    | ${g.s ? '*** SILENCED *** ' + g.why : 'narrates'}`);
}
console.log('\n  Same sweep, FACETED small-multiples (facet=region) instead of color:');
for (const target of [0.9, 0.49, 0.40, 0.30]) {
  const base = seriesWithR(8, target);
  const rows = []; ['N', 'S', 'E'].forEach((reg, s) => base.forEach((y, i) => rows.push({ x: i + 1, y: y + s * 500, reg })));
  const spec = mk(rows, { facet: 'reg' });
  const cur = analyzeVizSpec(spec).correlation;
  if (cur === undefined) { console.log(`   per-panel r=${target}: CURRENT already SUPPRESSED`); continue; }
  const g = g1p(rows, 'x', 'y', ['reg'], undefined, cur);
  console.log(`   per-panel r=${String(pr([...Array(8).keys()], base)).padStart(6)} pooled=${String(cur).padStart(6)}  CURRENT narrates -> PROPOSAL ${g.s ? '*** SILENCED ***' : 'narrates'}`);
}

// the dramatic instance: pooled 0.99, every series honestly positive but below rho
console.log('\n  Dramatic instance — pooled strongly positive, every drawn series positive-but-noisy:');
{
  const base = seriesWithR(8, 0.45);
  const rows = []; ['North', 'South', 'East'].forEach((seg, s) => base.forEach((y, i) => rows.push({ x: i + 1, y: y + s * 200, seg })));
  const spec = mk(rows, { color: 'seg' });
  const cur = analyzeVizSpec(spec).correlation;
  const g = g1p(rows, 'x', 'y', ['seg'], undefined, cur);
  console.log(`   per-series r = ${pr([...Array(8).keys()], base)} (all THREE identical, all POSITIVE, none contradicts)`);
  console.log(`   CURRENT narrates ${cur}; PROPOSAL ${g.s ? 'SILENCES — ' + g.why : 'narrates'}`);
}

// ═══ D2: cross-partition band pooling manufactures contradictory n=2 votes ═══
console.log('\n══════ D2 — unprefixed S-keyed bands pool marks ACROSS visual series ══════');
function d2trial(nSeg, nX, szLevels, seedInit) {
  let seed = seedInit; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const rows = [];
  for (let s = 0; s < nSeg; s++) for (let i = 1; i <= nX; i++)
    rows.push({ x: i, y: s * 1000 + 10 * i, seg: `S${s}`, sz: 1 + Math.floor(rnd() * szLevels) });
  const spec = mk(rows, { color: 'seg', size: 'sz', agg: 'average', mark: 'MarkPoint' });
  const cur = analyzeVizSpec(spec).correlation;
  if (cur === undefined) return 'already-suppressed';
  const g = g1p(rows, 'x', 'y', ['seg', 'sz'], 'average', cur);
  return g.s ? 'SILENCED' : 'narrates';
}
console.log('  Every series is a PERFECT monotone rise (r=+1). size = an unrelated 3rd variable.');
for (const [nSeg, nX, lv] of [[2, 4, 3], [3, 5, 4], [3, 6, 5], [4, 6, 3], [5, 8, 5]]) {
  let sil = 0, nar = 0, sup = 0;
  for (let t = 0; t < 100; t++) { const r = d2trial(nSeg, nX, lv, 1000 + t * 7717); if (r === 'SILENCED') sil++; else if (r === 'narrates') nar++; else sup++; }
  console.log(`   ${nSeg} series x ${nX} points, ${lv} size levels -> newly SILENCED ${String(sil).padStart(3)}/100   narrates ${String(nar).padStart(3)}   already-suppressed ${sup}`);
}
// same with a quantitative DETAIL and with a quantitative COLOR RAMP (both "always separable" per §3.1)
console.log('\n  Same shape but the 3rd channel is a quantitative COLOR RAMP (§3.1 now includes it):');
function d2ramp(seedInit) {
  let seed = seedInit; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const rows = []; for (let s = 0; s < 3; s++) for (let i = 1; i <= 6; i++) rows.push({ x: i, y: s * 1000 + 10 * i, seg: `S${s}`, c: 1 + Math.floor(rnd() * 4) });
  const spec = mk(rows, { color: 'c', colorQuant: true, detail: undefined, agg: 'average', mark: 'MarkPoint' });
  // note: with a quant color there is NO categorical partition today -> sep=[c]
  const cur = analyzeVizSpec(spec).correlation;
  if (cur === undefined) return 'already-suppressed';
  const g = g1p(rows, 'x', 'y', ['c'], 'average', cur);
  return g.s ? 'SILENCED' : 'narrates';
}
{ let sil = 0, nar = 0, sup = 0; for (let t = 0; t < 100; t++) { const r = d2ramp(500 + t * 3313); if (r === 'SILENCED') sil++; else if (r === 'narrates') nar++; else sup++; }
  console.log(`   3 rising series + 4-level quant color ramp -> SILENCED ${sil}/100  narrates ${nar}  already-suppressed ${sup}`); }
