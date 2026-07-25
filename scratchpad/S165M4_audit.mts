// Pass 2/2: with src at s165, find the specs HEAD narrated that s165 silences, and hand-audit each one
// off the rows (finest-band decomposition; no SUT enumeration) for a genuinely opposing drawn band.
import { readFileSync } from 'node:fs';
import { analyzeVizSpec } from '../packages/viz-core/src/a11y/data-analysis.js';
import { bubbleSpecs, POPULATIONS } from './S165M4_bubblegen.js';

const head = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Record<string, (number | null)[]>;
const RHO = 0.5;
function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : Number((num / den).toFixed(3));
}
const sgn = (r: number) => (r > 0 ? 1 : r < 0 ? -1 : 0);

for (const [label, honestOnly, seed] of POPULATIONS) {
  const specs = bubbleSpecs(300, seed, honestOnly);
  const headDecisions = head[label];
  const headNarrated = headDecisions.filter((d) => d !== null).length;
  let silenced = 0, honest = 0, over = 0, newNarration = 0;
  const detail: string[] = [];
  specs.forEach((spec: any, i) => {
    const sut = analyzeVizSpec(spec as never).correlation;
    const h = headDecisions[i];
    if (h === null && sut !== undefined) newNarration++;
    if (h === null || sut !== undefined) return;
    silenced++;
    // hand-audit: any FINEST coherent band genuinely opposing the pooled sign?
    const rows: any[] = spec.data.values;
    const agg = spec.encoding.y.aggregate;
    const keys = ['seg', 'sz', ...(spec.encoding.detail ? ['dt'] : [])];
    const byBand = new Map<string, Map<number, number[]>>();
    for (const r of rows) {
      const k = keys.map((f) => String(r[f])).join('/');
      if (!byBand.has(k)) byBand.set(k, new Map());
      const bx = byBand.get(k)!;
      if (!bx.has(Number(r.x))) bx.set(Number(r.x), []);
      bx.get(Number(r.x))!.push(Number(r.y));
    }
    const pooledSign = sgn(h);
    const opposing: string[] = [];
    for (const [k, bx] of byBand) {
      const xs = [...bx.keys()];
      const ys = xs.map((x) => { const v = bx.get(x)!; return agg ? v.reduce((s, q) => s + q, 0) / v.length : v[0]; });
      if (new Set(xs).size < 2) continue;
      let dir: number;
      if (xs.length === 2) dir = sgn((xs[1] - xs[0]) * (ys[1] - ys[0]));
      else { const r = pearson(xs, ys); dir = r === null ? 0 : Math.abs(r) >= RHO ? sgn(r) : 0; }
      if (dir !== 0 && dir === -pooledSign) opposing.push(k);
    }
    if (opposing.length) { honest++; detail.push(`  #${i} head=${h} -> silenced; OPPOSING finest bands: ${opposing.slice(0,3).join(',')}`); }
    else { over++; detail.push(`  #${i} head=${h} -> silenced; NO opposing finest band => OVER-SUPPRESSION`); }
  });
  const pct = headNarrated ? ((silenced / headNarrated) * 100).toFixed(1) : '0.0';
  console.log(`\n=== ${label} ===`);
  console.log(`  HEAD narrated ${headNarrated}/300; s165 newly silenced ${silenced} (${pct}% conditional, ${((silenced/300)*100).toFixed(1)}% of population); new narrations: ${newNarration}`);
  console.log(`  of the ${silenced} silenced: ${honest} carry a genuinely opposing drawn band, ${over} do NOT (over-suppression)`);
  for (const d of detail.slice(0, 12)) console.log(d);
}
