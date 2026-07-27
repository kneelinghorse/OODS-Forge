// MAIN-LOOP independent reproduction of three agent-surfaced candidates. Written from the MECHANISM
// description only — my own rows, my own pearson, my own controls. Nothing copied from agent probes.
import { analyzeVizSpec, generateNarrativeSummary }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const bands = (rows, key) => {
  const m = new Map();
  for (const r of rows) { const k = r[key]; (m.get(k) ?? m.set(k, []).get(k)).push([r.x, r.y]); }
  return [...m].map(([k, ps]) => `${k}:${pearson(ps)?.toFixed(3)}`).join('  ');
};
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Y = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const mk = (marks, enc, values) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
  data: { name: 'd', values }, marks, encoding: enc, a11y: { description: 'y over x' },
});
function run(label, s, extra) {
  const a = analyzeVizSpec(s);
  const n = generateNarrativeSummary(s);
  console.log(`  ${label.padEnd(60)} corr=${String(a.correlation).padEnd(8)}${a.correlation === undefined ? 'SUPPRESSED' : 'NARRATED'}`);
  if (a.correlation !== undefined) console.log(`      "${n.summary}"  ${JSON.stringify((n.keyFindings ?? []).filter((k) => /correlat/i.test(k)))}`);
  if (extra) console.log(`      trend=${a.trend} trendDelta=${a.trendDelta}  keyFindings=${JSON.stringify(n.keyFindings)}`);
  return a;
}

// ================================================================ VE-1: detail id + A6 n=2 rule
console.log('#### VE-1 — plain MarkPoint scatter, shape=product + detail=rowId ####');
// FIVE products, each drawn as a 2-point series that FALLS perfectly; the offsets make the pool rise.
const ve1 = [];
['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].forEach((p, i) => {
  ve1.push({ x: 2 * i + 1, y: 100 + 200 * i, prod: p, rid: `r${i}a` });
  ve1.push({ x: 2 * i + 2, y: 40 + 200 * i, prod: p, rid: `r${i}b` });
});
console.log('  drawn per-product r:', bands(ve1, 'prod'));
console.log('  pooled r           :', pearson(ve1.map((r) => [r.x, r.y])).toFixed(3));
const encVE1 = { x: X, y: Y, shape: { field: 'prod', trait: 'EncodingShape' }, detail: { field: 'rid', trait: 'EncodingDetail' } };
run('MAIN shape=prod + detail=rid (2 pts per band)', mk([{ trait: 'MarkPoint', encodings: encVE1 }], encVE1, ve1));
const encNoDetail = { x: X, y: Y, shape: { field: 'prod', trait: 'EncodingShape' } };
run('CTRL a: drop the detail channel only', mk([{ trait: 'MarkPoint', encodings: encNoDetail }], encNoDetail, ve1));
// CTRL b: give every band a THIRD point so distinctX>=3 clears the A6 threshold; bands still fall
const ve1c = [];
['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].forEach((p, i) => {
  ve1c.push({ x: 3 * i + 1, y: 100 + 200 * i, prod: p, rid: `r${i}a` });
  ve1c.push({ x: 3 * i + 2, y: 70 + 200 * i, prod: p, rid: `r${i}b` });
  ve1c.push({ x: 3 * i + 3, y: 40 + 200 * i, prod: p, rid: `r${i}c` });
});
console.log('  ctrl-b drawn per-product r:', bands(ve1c, 'prod'));
run('CTRL b: same channels, 3 pts per band (clears A6 n>=3)', mk([{ trait: 'MarkPoint', encodings: encVE1 }], encVE1, ve1c));
const ve1h = ve1.map((r, i) => (i % 2 === 0 ? { ...r, y: r.y - 60 } : r)); // flip each band to RISE
console.log('  ctrl-c drawn per-product r:', bands(ve1h, 'prod'));
run('CTRL c: honest twin, every band RISES', mk([{ trait: 'MarkPoint', encodings: encVE1 }], encVE1, ve1h));

// ================================================================ VE-2: pooledSign === 0 / -0
console.log('\n#### VE-2 — pooled r rounds to exactly 0, every drawn band falls ####');
console.log('  JS: (-1 === -0) =', -1 === -0, ' (1 === -0) =', 1 === -0, ' Object.is(-0,0) =', Object.is(-0, 0));
const ve2 = [
  { x: 1, y: 200, seg: 'N' }, { x: 2, y: 140, seg: 'N' }, { x: 3, y: 80, seg: 'N' },
  { x: 4, y: 220, seg: 'C' }, { x: 5, y: 160, seg: 'C' }, { x: 6, y: 100, seg: 'C' },
  { x: 7, y: 240, seg: 'S' }, { x: 8, y: 180, seg: 'S' }, { x: 9, y: 120, seg: 'S' },
];
console.log('  drawn per-seg r:', bands(ve2, 'seg'), ' | pooled r =', pearson(ve2.map((r) => [r.x, r.y])).toFixed(6));
const encVE2 = { x: X, y: Y, color: { field: 'seg', trait: 'EncodingColor' } };
run('MAIN pooled == 0 exactly', mk([{ trait: 'MarkPoint', encodings: encVE2 }], encVE2, ve2));
const bump = (d) => ve2.map((r, i) => (i === 8 ? { ...r, y: r.y + d } : r));
console.log('  ctrl +1 pooled r =', pearson(bump(1).map((r) => [r.x, r.y])).toFixed(6));
run('CTRL +1 on one y (bands unchanged, pooled just positive)', mk([{ trait: 'MarkPoint', encodings: encVE2 }], encVE2, bump(1)));
console.log('  ctrl -1 pooled r =', pearson(bump(-1).map((r) => [r.x, r.y])).toFixed(6));
run('CTRL -1 on one y (bands unchanged, pooled just negative)', mk([{ trait: 'MarkPoint', encodings: encVE2 }], encVE2, bump(-1)));

// ================================================================ OC-1: trend on survivor A
console.log('\n#### OC-1 — s165 survivor-A geometry: correlation silent, TREND still asserted ####');
const oc = [
  { x: 1, y: 30, g: 'circle' }, { x: 2, y: 20, g: 'circle' }, { x: 3, y: 10, g: 'circle' },
  { x: 4, y: 130, g: 'square' }, { x: 5, y: 120, g: 'square' }, { x: 6, y: 110, g: 'square' },
];
console.log('  drawn per-shape r:', bands(oc, 'g'), '(both FALL; nothing drawn rises)');
const encOC = { x: X, y: Y, shape: { field: 'g', trait: 'EncodingShape' } };
run('MAIN marks=[MarkLine,MarkArea] + shape', mk([{ trait: 'MarkLine', encodings: encOC }, { trait: 'MarkArea', encodings: encOC }], encOC, oc), true);
const encOCcolor = { x: X, y: Y, color: { field: 'g', trait: 'EncodingColor' } };
run('CTRL a: same marks, shape -> color', mk([{ trait: 'MarkLine', encodings: encOCcolor }, { trait: 'MarkArea', encodings: encOCcolor }], encOCcolor, oc), true);
run('CTRL b: same shape encoding, SINGLE MarkLine', mk([{ trait: 'MarkLine', encodings: encOC }], encOC, oc), true);
