import { analyzeVizSpec, correlationSeparabilityEvidence, correlationGateFields } from '../packages/viz-core/src/a11y/data-analysis.js';
import { bubbleSpecs } from './S165M4_bubblegen.js';
const specs = bubbleSpecs(300, 0xb0b2, true) as any[];
const sgn = (r: number) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pearson(xs: number[], ys: number[]) {
  const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let nu = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { nu += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const d = Math.sqrt(dx * dy); return d === 0 ? null : Number((nu / d).toFixed(3));
}
for (const idx of [6, 59, 112]) {
  const spec = specs[idx];
  const rows: any[] = spec.data.values;
  const agg = spec.encoding.y.aggregate;
  const sf = correlationGateFields(spec).separableFields;
  console.log(`\n=== #${idx}  sf=[${sf}]  agg=${agg ?? 'none'}  detail=${!!spec.encoding.detail}  corr=${analyzeVizSpec(spec as never).correlation} ===`);
  const ev = correlationSeparabilityEvidence(spec);
  console.log(`  G1' pooledSign=${ev.pooledSign} votes=[${ev.votes}] suppresses=${ev.suppresses}`);
  // enumerate every subset band and label coherence + direction
  const subsets: string[][] = [[]];
  for (const f of sf) { const n = subsets.length; for (let i = 0; i < n; i++) subsets.push([...subsets[i], f]); }
  for (const S of subsets) {
    const others = sf.filter((f) => !S.includes(f));
    const bands = new Map<string, { byX: Map<number, number[]>; others: Set<string> }>();
    for (const r of rows) {
      const k = S.map((f) => String(r[f])).join('/') || '*';
      if (!bands.has(k)) bands.set(k, { byX: new Map(), others: new Set() });
      const b = bands.get(k)!;
      if (!b.byX.has(Number(r.x))) b.byX.set(Number(r.x), []);
      b.byX.get(Number(r.x))!.push(Number(r.y));
      b.others.add(others.map((f) => String(r[f])).join('/'));
    }
    for (const [k, b] of bands) {
      const xs = [...b.byX.keys()];
      const ys = xs.map((x) => { const v = b.byX.get(x)!; return agg ? v.reduce((s, q) => s + q, 0) / v.length : v[0]; });
      if (new Set(xs).size < 2) continue;
      const coherent = b.others.size <= 1;
      const r = xs.length === 2 ? null : pearson(xs, ys);
      const dir = xs.length === 2 ? sgn((xs[1] - xs[0]) * (ys[1] - ys[0])) : r === null ? 0 : Math.abs(r) >= 0.5 ? sgn(r) : 0;
      if (dir === -ev.pooledSign) {
        console.log(`  OPPOSES: S={${S}} band "${k}" n=${new Set(xs).size} r=${r} dir=${dir} coherent=${coherent}`);
      }
    }
  }
}
