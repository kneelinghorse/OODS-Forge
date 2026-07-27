// S165 CRITIC lens 2 — (1) REAL CORPUS fixtures, (2) Monte-Carlo damage rate on ordinary noisy
// multi-series charts, (3) the NEW n=2 cross-partition band mechanism.
import fs from 'node:fs';
import path from 'node:path';
import { analyzeVizSpec, resolvePrimaryChannels, isNormalizedVizSpec }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5;
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pr(xs, ys) { const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0; for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : Math.round((num / den) * 1000) / 1000; }
function cls(xs, ys) { const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n; let d = 0; for (const x of xs) d += (x - mx) ** 2; if (d === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let c = 0; for (let i = 0; i < 2; i++) c += (xs[i] - mx) * (ys[i] - my); return signOf(c); }
  const r = pr(xs, ys); if (r === null) return 0; return Math.abs(r) >= RHO ? signOf(r) : 0; }
const keyFor = (row, f) => f.map((k) => (row[k] === null || row[k] === undefined ? '\0null' : String(row[k]))).join('\0');
function red(vals, agg) { if (agg === 'count') return vals.length;
  const n = vals.map(Number).filter(Number.isFinite); if (!n.length) return undefined;
  if (agg === 'sum') return n.reduce((a, b) => a + b, 0); if (agg === 'average') return n.reduce((a, b) => a + b, 0) / n.length;
  if (agg === 'min') return Math.min(...n); if (agg === 'max') return Math.max(...n);
  if (agg === 'median') { const s = [...n].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; }
  return undefined; }
function subs(items) { const o = [[]]; for (const it of items) { const l = o.length; for (let i = 0; i < l; i++) o.push([...o[i], it]); } return o; }
function series(rows, dim, meas, kf, agg) { const m = new Map();
  const push = (s, x, y) => { let e = m.get(s); if (!e) { e = { xs: [], ys: [] }; m.set(s, e); } e.xs.push(x); e.ys.push(y); };
  if (agg) { const cells = new Map();
    for (const r of rows) { const k = keyFor(r, [dim, ...kf]); let c = cells.get(k);
      if (!c) { c = { sub: keyFor(r, kf), dim: r[dim], v: [] }; cells.set(k, c); } c.v.push(r[meas]); }
    for (const c of cells.values()) { const v = red(c.v, agg), x = Number(c.dim); if (v === undefined || !Number.isFinite(x)) continue; push(c.sub, x, v); }
  } else { for (const r of rows) { const x = Number(r[dim]), y = Number(r[meas]); if (!Number.isFinite(x) || !Number.isFinite(y)) continue; push(keyFor(r, kf), x, y); } }
  return [...m.values()]; }

const MARK = { MarkPoint: 'point', MarkLine: 'line', MarkArea: 'area', MarkBar: 'bar' };
function separableFields(spec, dim, meas) {
  const enc = spec.encoding ?? {}; const out = [];
  const add = (f) => { if (f && f !== dim && f !== meas && !out.includes(f)) out.push(f); };
  if (spec.layout?.trait === 'LayoutFacet') for (const f of [spec.layout.rows, spec.layout.columns]) if (f?.field) add(f.field);
  for (const ch of ['x', 'y']) add(enc[ch]?.field);
  add(enc.color?.field); add(enc.size?.field); add(enc.detail?.field);
  const known = (spec.marks ?? []).map((m) => MARK[m.trait] ?? 'unknown').filter((m) => m !== 'unknown');
  if (known.length === 0 || known.some((m) => m === 'point' || m === 'line' || m === 'area')) add(enc.shape?.field);
  return out;
}
function g1p(rows, dim, meas, sep, agg, pooled) {
  const ps = signOf(pooled); const votes = []; let any = false, shares = false;
  if (!sep.length) return { s: false, why: 'no-op' };
  const rec = (d) => { if (d === 'unknown') return; any = true; if (d !== 0) votes.push(d); if (d !== 0 && d === ps) shares = true; };
  let fine = false, ev = null; const trace = [];
  for (const S of subs(sep)) for (const se of series(rows, dim, meas, S, agg)) {
    if (new Set(se.xs).size < 2) continue; const d = cls(se.xs, se.ys); if (d === 'unknown') continue;
    if (!S.length) { ev = d; continue; }
    fine = true; rec(d); trace.push(`S={${S}} n=${se.xs.length} r=${se.xs.length >= 3 ? pr(se.xs, se.ys) : 'n2'} dir=${d}`);
  }
  if (!fine && ev !== null) rec(ev);
  let s, why;
  if (!any) { s = false; why = 'fallback'; }
  else if (new Set(votes).size > 1) { s = true; why = '(a) votes span both signs'; }
  else if (votes.some((v) => v === -ps)) { s = true; why = '(b) real opposite'; }
  else { s = ps !== 0 && !shares; why = s ? '(c) no band shares pooledSign (all bands FLAT under rho)' : 'narrate'; }
  return { s, why, votes, trace };
}
function dimMeas(spec) {
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  return { dim: spec.encoding?.[dimensionChannel]?.field, meas: measureChannel === 'color' ? spec.encoding?.color?.field : spec.encoding?.[measureChannel]?.field, mc: measureChannel };
}

// ═══════════ (1) REAL CORPUS ═══════════
console.log('══════ (1) REAL CORPUS FIXTURES (examples/viz/**) ══════');
const root = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/examples/viz';
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.spec.json')) files.push(p); } })(root);
let corpNarr = 0, corpSil = 0; const corpHits = [];
for (const f of files.sort()) {
  let spec; try { spec = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
  if (!isNormalizedVizSpec(spec)) continue;
  let a; try { a = analyzeVizSpec(spec); } catch (e) { continue; }
  if (a.correlation === undefined) continue;
  corpNarr++;
  const { dim, meas, mc } = dimMeas(spec);
  if (!dim || !meas) continue;
  const agg = spec.encoding?.[mc]?.aggregate;
  const sep = separableFields(spec, dim, meas);
  const rows = spec.data?.values ?? [];
  const g = g1p(rows, dim, meas, sep, agg, a.correlation);
  const tag = g.s ? '*** NEWLY SILENCED ***' : 'still narrates';
  if (g.s) { corpSil++; corpHits.push({ f: path.relative(root, f), corr: a.correlation, why: g.why, trace: g.trace }); }
  console.log(`  ${path.relative(root, f).padEnd(48)} corr=${String(a.correlation).padEnd(8)} sep=[${sep}]  ${tag}${g.s ? ' — ' + g.why : ''}`);
}
console.log(`\n  CORPUS: ${corpNarr} fixtures narrate today; PROPOSAL silences ${corpSil} (${corpNarr ? ((corpSil / corpNarr) * 100).toFixed(0) : 0}%)`);
for (const h of corpHits) { console.log(`    - ${h.f} (was ${h.corr}) ${h.why}`); for (const t of (h.trace ?? []).slice(0, 6)) console.log(`        ${t}`); }

// ═══════════ (2) MONTE-CARLO: ordinary noisy multi-series charts ═══════════
console.log('\n══════ (2) MONTE-CARLO — ordinary honest noisy multi-series (categorical color only) ══════');
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
function mcTrial(nSeg, nX, slope, noise) {
  const rows = [];
  for (let s = 0; s < nSeg; s++) for (let i = 1; i <= nX; i++)
    rows.push({ x: i, y: s * 100 + slope * i + (rnd() - 0.5) * 2 * noise, seg: `S${s}` });
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' }, color: { field: 'seg', trait: 'EncodingColor' } };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'm', name: 'm', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkLine', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  const cur = analyzeVizSpec(spec).correlation;
  if (cur === undefined) return 'already-suppressed';
  const g = g1p(rows, 'x', 'y', ['seg'], undefined, cur);
  return g.s ? 'SILENCED' : 'narrates';
}
// "honest" = every series shares the SAME true slope sign; noise varies the per-series |r|
for (const noise of [0, 2, 5, 10, 20, 40]) {
  let sil = 0, nar = 0, sup = 0;
  for (let t = 0; t < 200; t++) { const r = mcTrial(3, 6, 3, noise); if (r === 'SILENCED') sil++; else if (r === 'narrates') nar++; else sup++; }
  console.log(`  noise=±${String(noise).padStart(2)}  (all 3 series share a +3/step TRUE slope, 6 x-points)  ->  newly SILENCED ${String(sil).padStart(3)}/200 (${(sil / 2).toFixed(0)}%)   still narrates ${nar}   already-suppressed ${sup}`);
}

// ═══════════ (3) the NEW n=2 cross-partition band mechanism ═══════════
console.log('\n══════ (3) NEW mechanism: unprefixed {size} bands manufacture n=2 votes ACROSS partitions ══════');
// Honest chart: 2 segments, BOTH rise monotonically and strongly. size is a 3rd variable with
// values that repeat across segments -> the UNPREFIXED S={sz} band pairs points from DIFFERENT
// segments at different x, and n=2 votes its slope UNCONDITIONALLY.
const rows3 = [
  { x: 1, y: 10, seg: 'A', sz: 1 }, { x: 2, y: 20, seg: 'A', sz: 2 }, { x: 3, y: 30, seg: 'A', sz: 3 },
  { x: 1, y: 300, seg: 'B', sz: 3 }, { x: 2, y: 310, seg: 'B', sz: 2 }, { x: 3, y: 320, seg: 'B', sz: 1 },
];
const enc3 = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
const spec3 = { $schema: 'https://oods.dev/viz-spec/v1', id: 'n2', name: 'n2', data: { name: 'd', values: rows3 }, marks: [{ trait: 'MarkPoint', encodings: enc3 }], encoding: enc3, a11y: { description: 'y over x' } };
const cur3 = analyzeVizSpec(spec3).correlation;
console.log('  seg A: (1,10)(2,20)(3,30) r=+1   seg B: (1,300)(2,310)(3,320) r=+1  -> BOTH rise, honest');
console.log('  CURRENT corr =', cur3);
const g3 = g1p(rows3, 'x', 'y', ['seg', 'sz'], 'average', cur3 ?? 1);
console.log('  PROPOSAL:', g3.s ? '*** SILENCED ***' : 'narrates', '-', g3.why);
for (const t of g3.trace) console.log('     ', t);
