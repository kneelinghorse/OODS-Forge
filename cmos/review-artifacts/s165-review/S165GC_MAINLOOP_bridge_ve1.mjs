// MAIN-LOOP dual-path verification of the strongest survivor through the LIVE bridge (:4466) —
// viz_render, the documented MCP consumer surface, which exposes both `shape` and `detail`.
// Three arms in ONE run, so the suppressed arms always sit beside an arm that MUST narrate.
const BR = 'http://127.0.0.1:4466/run';
const run = async (input) => (await fetch(BR, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ tool: 'viz_render', input }),
})).json();

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}

// Five products, each drawn as a 2-point series that falls perfectly; offsets make the pool rise.
const rows = [];
['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].forEach((p, i) => {
  rows.push({ year: 2 * i + 1, revenue: 100 + 200 * i, product: p, recordId: `R${i}A` });
  rows.push({ year: 2 * i + 2, revenue: 40 + 200 * i, product: p, recordId: `R${i}B` });
});
// 3-point twin: identical channels, but each band now clears the A6 n>=3 threshold
const rows3 = [];
['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].forEach((p, i) => {
  rows3.push({ year: 3 * i + 1, revenue: 100 + 200 * i, product: p, recordId: `R${i}A` });
  rows3.push({ year: 3 * i + 2, revenue: 70 + 200 * i, product: p, recordId: `R${i}B` });
  rows3.push({ year: 3 * i + 3, revenue: 40 + 200 * i, product: p, recordId: `R${i}C` });
});
const per = (rs) => [...new Set(rs.map((r) => r.product))]
  .map((p) => `${p}:${pearson(rs.filter((r) => r.product === p).map((r) => [r.year, r.revenue])).toFixed(2)}`).join(' ');
console.log('drawn per-product r (2pt):', per(rows), '| pooled', pearson(rows.map((r) => [r.year, r.revenue])).toFixed(3));
console.log('drawn per-product r (3pt):', per(rows3), '| pooled', pearson(rows3.map((r) => [r.year, r.revenue])).toFixed(3));

const xy = { x: { field: 'year', type: 'quantitative' }, y: { field: 'revenue', type: 'quantitative' } };
const arms = [
  ['PHANTOM   shape=product + detail=recordId, 2 pts per band', rows, { ...xy, shape: 'product', detail: 'recordId' }],
  ['CONTROL a same channels, 3 pts per band (clears A6 n>=3)', rows3, { ...xy, shape: 'product', detail: 'recordId' }],
  ['CONTROL b drop detail, keep shape', rows, { ...xy, shape: 'product' }],
  ['CONTROL c must NARRATE: plain single rising series', [1, 2, 3, 4].map((n) => ({ year: n, revenue: n * 10 })), { ...xy }],
];

for (const [name, data, encodings] of arms) {
  const body = await run({ rows: data, chartType: 'scatter', encodings, output: { includeA11y: true } });
  const full = JSON.stringify(body);
  if (body.ok === false || /"error"/.test(full)) {
    console.log(`\n### ${name}\n  !! REQUEST FAILED — NOT evidence:`, full.slice(0, 300)); continue;
  }
  const summary = full.match(/"summary":"([^"]*)"/)?.[1] ?? '(none)';
  const kf = full.match(/"keyFindings":(\[[^\]]*\])/)?.[1] ?? '(none)';
  const corr = full.match(/Correlation coefficient[^"]*/g);
  console.log(`\n### ${name} (ok=${body.ok})`);
  console.log('  summary    :', summary);
  console.log('  keyFindings:', kf);
  console.log('  >>> correlation claim?', corr ? JSON.stringify(corr) : 'NONE');
}
