const BASE = 'http://127.0.0.1:4466';
const dash = (extra = {}) => ({
  schemaVersion: 'v0.1',
  datasets: [{ id: 'd1', rows: [{ region: 'West', revenue: 100 }, { region: 'East', revenue: 80 }] }],
  panels: [{ id: 'bars', kind: 'chart', chartType: 'bar', datasetId: 'd1', encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } } }],
  a11y: { description: 'live brand check' },
  output: { html: true, contrastScan: true },
  ...extra,
});
async function run(tool, input) {
  const res = await fetch(`${BASE}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tool, input }),
  });
  const body = await res.json().catch(() => null);
  return { httpStatus: res.status, body, result: body?.result ?? body?.data ?? body };
}

console.log('--- 1. brand:"B" accepted ---');
const b = await run('dashboard.render', dash({ brand: 'B' }));
console.log('http', b.httpStatus, '| status', b.result?.status, '| output.brand', JSON.stringify(b.result?.output?.brand));
console.log('a11yContrast.summary', JSON.stringify(b.result?.a11yContrast?.summary));
const bFg = (b.result?.html ?? '').match(/--oods-color-fg:([^;]+);/)?.[1];
console.log('brand B --oods-color-fg =', bFg);
if (b.httpStatus !== 200) console.log('   raw:', JSON.stringify(b.body).slice(0, 300));

console.log('\n--- 2. absent brand ---');
const none = await run('dashboard.render', dash());
console.log('http', none.httpStatus, '| output.brand', JSON.stringify(none.result?.output?.brand));
const nFg = (none.result?.html ?? '').match(/--oods-color-fg:([^;]+);/)?.[1];
console.log('absent --oods-color-fg =', nFg, '| differs from B:', nFg !== bFg);
console.log('a11yContrast.summary', JSON.stringify(none.result?.a11yContrast?.summary));

console.log('\n--- 3. absent vs explicit A byte-identical except the echo ---');
const a = await run('dashboard.render', dash({ brand: 'A' }));
const strip = (o) => { const c = JSON.parse(JSON.stringify(o ?? {})); if (c.output) delete c.output.brand; delete c.specRef; delete c.specRefCreatedAt; delete c.specRefExpiresAt; return JSON.stringify(c); };
console.log('identical:', strip(none.result) === strip(a.result));

console.log('\n--- 4. brand:"C" rejected ---');
const c = await run('dashboard.render', dash({ brand: 'C' }));
console.log('http', c.httpStatus, '| code', c.body?.error?.code);
console.log('message:', (c.body?.error?.message ?? '').slice(0, 200));

console.log('\n--- 5. repl render brand=B over the wire ---');
const r = await run('repl', { action: 'render', mode: 'full', schema: { version: '1.0', screens: [{ id: 's', component: 'Stack' }] }, apply: true, brand: 'B', output: { format: 'document', compact: false } });
console.log('http', r.httpStatus, '| status', r.result?.status, '| data-brand="B" present:', /data-brand="B"/.test(r.result?.html ?? ''));
if (r.httpStatus !== 200) console.log('   raw:', JSON.stringify(r.body).slice(0, 300));

console.log('\n--- 6. repl render brand=C rejected ---');
const rc = await run('repl', { action: 'render', mode: 'full', schema: { version: '1.0', screens: [{ id: 's', component: 'Stack' }] }, apply: true, brand: 'C', output: { format: 'document' } });
console.log('http', rc.httpStatus, '| code', rc.body?.error?.code, '|', (rc.body?.error?.message ?? '').slice(0, 160));
