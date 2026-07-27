// S165 CRITIC — the two citable instances, printed in full.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO = 0.5, sg = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pr(xs, ys) { const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n; let nu = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { nu += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const d = Math.sqrt(dx * dy); return d === 0 ? null : Math.round((nu / d) * 1000) / 1000; }
function cls(xs, ys) { const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n; let d = 0; for (const x of xs) d += (x - mx) ** 2; if (d === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let c = 0; for (let i = 0; i < 2; i++) c += (xs[i] - mx) * (ys[i] - my); return sg(c); }
  const r = pr(xs, ys); if (r === null) return 0; return Math.abs(r) >= RHO ? sg(r) : 0; }
const kf = (r, f) => f.map((k) => String(r[k])).join('\0');
const redA = (v, a) => { const n = v.map(Number).filter(Number.isFinite); if (!n.length) return undefined;
  return a === 'sum' ? n.reduce((x, y) => x + y, 0) : a === 'average' ? n.reduce((x, y) => x + y, 0) / n.length : undefined; };
const subs = (i) => { const o = [[]]; for (const t of i) { const l = o.length; for (let k = 0; k < l; k++) o.push([...o[k], t]); } return o; };
function ser(rows, dim, meas, f, agg) { const m = new Map();
  const push = (s, x, y) => { let e = m.get(s); if (!e) { e = { xs: [], ys: [], rows: [] }; m.set(s, e); } e.xs.push(x); e.ys.push(y); };
  if (agg) { const c = new Map(); for (const r of rows) { const k = kf(r, [dim, ...f]); let e = c.get(k);
      if (!e) { e = { sub: kf(r, f), dim: r[dim], v: [] }; c.set(k, e); } e.v.push(r[meas]); }
    for (const e of c.values()) { const v = redA(e.v, agg), x = Number(e.dim); if (v === undefined || !Number.isFinite(x)) continue; push(e.sub, x, v); } }
  else for (const r of rows) push(kf(r, f), Number(r[dim]), Number(r[meas]));
  return [...m.entries()].map(([k, v]) => ({ key: k.replace(/\0/g, '|'), ...v })); }
function g1p(rows, dim, meas, sep, agg, pooled, verbose) {
  const ps = sg(pooled), votes = []; let any = false, shares = false, fine = false, ev = null;
  const rec = (d) => { if (d === 'unknown') return; any = true; if (d !== 0) votes.push(d); if (d !== 0 && d === ps) shares = true; };
  for (const S of subs(sep)) for (const se of ser(rows, dim, meas, S, agg)) {
    if (new Set(se.xs).size < 2) continue; const d = cls(se.xs, se.ys); if (d === 'unknown') continue;
    if (!S.length) { ev = d; continue; } fine = true; rec(d);
    if (verbose) console.log(`      S={${S.join(',')}} key="${se.key}" pts=${se.xs.map((x, i) => `(${x},${Math.round(se.ys[i] * 100) / 100})`).join('')} ${se.xs.length >= 3 ? 'r=' + pr(se.xs, se.ys) : 'n=2 slope'} VOTE=${d}`); }
  if (!fine && ev !== null) rec(ev);
  let s, why;
  if (!any) { s = false; why = 'fallback'; }
  else if (new Set(votes).size > 1) { s = true; why = '(a) votes span both signs'; }
  else if (votes.some((v) => v === -ps)) { s = true; why = '(b) real opposite'; }
  else { s = ps !== 0 && !shares; why = s ? '(c) every band FLAT under rho' : 'narrate'; }
  return { s, why, votes }; }
const mk = (rows, o) => { const e = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(o.agg ? { aggregate: o.agg } : {}) } };
  if (o.color) e.color = { field: o.color, trait: 'EncodingColor' };
  if (o.size) e.size = { field: o.size, trait: 'EncodingSize', type: 'quantitative' };
  if (o.detail) e.detail = { field: o.detail, trait: 'EncodingDetail', type: 'quantitative' };
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 'i', name: 'i', data: { name: 'd', values: rows }, marks: [{ trait: o.mark ?? 'MarkPoint', encodings: e }], encoding: e, a11y: { description: 'y over x' } }; };

console.log('════ INSTANCE 1 (D1) — the SHIPPED s164 keep-control at correlation-drawn-mark-direction-s164.spec.ts:271');
console.log('    "weak-consistent categorical-only partition (no quant retinal) still NARRATES (no rho over-suppression)"');
const rows1 = []; const g = (seg, b) => rows1.push({ x: 1, y: b, seg }, { x: 2, y: b + 3, seg }, { x: 3, y: b - 1, seg }, { x: 4, y: b + 4, seg });
g('R', 0); g('S', 100); g('T', 200);
const s1 = mk(rows1, { color: 'seg' });
const c1 = analyzeVizSpec(s1).correlation;
console.log('    per-series pearson (all 3 identical):', pr([1, 2, 3, 4], [0, 3, -1, 4]), '  -> all POSITIVE, none contradicts');
console.log('    CURRENT dist correlation =', c1, '(NARRATES; this is the shipped GREEN assertion)');
console.log('    PROPOSAL G1\' trace:');
const r1 = g1p(rows1, 'x', 'y', ['seg'], undefined, c1, true);
console.log('    PROPOSAL =>', r1.s ? 'SUPPRESSED (undefined)  — ' + r1.why : 'narrates');
console.log('    ==> shipped test s164.spec.ts:271 goes RED.\n');

console.log('════ INSTANCE 2 (D2) — honest bubble chart, EVERY drawn series a perfect r=+1 rise');
const rows2 = [
  { x: 1, y: 10, seg: 'North', sz: 1 }, { x: 2, y: 20, seg: 'North', sz: 2 }, { x: 3, y: 30, seg: 'North', sz: 3 },
  { x: 1, y: 300, seg: 'South', sz: 3 }, { x: 2, y: 310, seg: 'South', sz: 2 }, { x: 3, y: 320, seg: 'South', sz: 1 },
];
const s2 = mk(rows2, { color: 'seg', size: 'sz', agg: 'average' });
const c2 = analyzeVizSpec(s2).correlation;
console.log('    North: (1,10)(2,20)(3,30) r=+1     South: (1,300)(2,310)(3,320) r=+1');
console.log('    NOTHING in this chart falls. CURRENT dist correlation =', c2, '(NARRATES)');
console.log('    PROPOSAL G1\' trace (note the S={sz} bands pool North and South marks together):');
const r2 = g1p(rows2, 'x', 'y', ['seg', 'sz'], 'average', c2, true);
console.log('    PROPOSAL =>', r2.s ? 'SUPPRESSED (undefined) — ' + r2.why : 'narrates');
console.log('    ==> a chart with ZERO falling drawn series is silenced by a "band" that spans two colours.\n');

console.log('════ INSTANCE 3 (D2 with detail, which §3.1 makes ALWAYS separable) ════');
const rows3 = [];
['A', 'B', 'C'].forEach((seg, s) => [1, 2, 3, 4].forEach((x) => rows3.push({ x, y: s * 500 + 10 * x, seg, d: ((x + s) % 3) + 1 })));
const s3 = mk(rows3, { color: 'seg', detail: 'd', agg: 'average' });
const c3 = analyzeVizSpec(s3).correlation;
console.log('    3 series, each a perfect +10/step rise (r=+1). detail d is an unrelated 3-level id.');
console.log('    CURRENT dist correlation =', c3);
const r3 = g1p(rows3, 'x', 'y', ['seg', 'd'], 'average', c3, true);
console.log('    PROPOSAL =>', r3.s ? 'SUPPRESSED — ' + r3.why : 'narrates');
