// MAIN-LOOP dual-path verification of the bin phantom through the LIVE bridge (:4466), the surface a
// real MCP consumer actually calls. Three arms in ONE run so the suppression side always has a control
// that MUST narrate (standing process rule from s165 decision 1329 — a suppression result with no
// discriminating control in the same run is not evidence).
const BR = 'http://127.0.0.1:4466/run';
async function run(input) {
  const r = await fetch(BR, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tool: 'viz_render', input }) });
  return await r.json();
}

// Two clusters of grp, every raw value distinct; both drawn bins FALL at pearson -1.0; pooled rises.
const rows = [
  { x: 1, y: 50, grp: 1 }, { x: 2, y: 44, grp: 2 }, { x: 3, y: 38, grp: 3 }, { x: 4, y: 32, grp: 4 }, { x: 5, y: 26, grp: 5 },
  { x: 6, y: 250, grp: 91 }, { x: 7, y: 244, grp: 92 }, { x: 8, y: 238, grp: 93 }, { x: 9, y: 232, grp: 94 }, { x: 10, y: 226, grp: 95 },
];
// same rows, grp replaced by the BIN LABEL a viewer reads off the legend
const labelled = rows.map((r) => ({ x: r.x, y: r.y, grp: r.grp < 50 ? 'bin_0_50' : 'bin_50_100' }));

const base = { chartType: 'scatter', output: { includeA11y: true } };
const xy = { x: { field: 'x', type: 'quantitative' }, y: { field: 'y', type: 'quantitative' } };

const arms = [
  ['PHANTOM  — colour bin:true over continuous grp (2 drawn bins, BOTH fall)', rows,
    { ...xy, color: { field: 'grp', type: 'quantitative', bin: true } }],
  ['CONTROL A — must NARRATE: plain single-series rise (no splitter)', rows.map((r) => ({ x: r.x, y: r.x * 10 })),
    { ...xy }],
  ['CONTROL B — must SUPPRESS: identical falling rows keyed by the BIN LABEL', labelled,
    { ...xy, color: 'grp' }],
];

for (const [name, data, encodings] of arms) {
  const body = await run({ ...base, rows: data, encodings });
  const full = JSON.stringify(body);
  if (body.ok === false || /"error"/.test(full)) {
    console.log(`\n### ${name} ###\n  !! REQUEST FAILED — not evidence:`, full.slice(0, 400));
    continue;
  }
  const summary = full.match(/"summary":"([^"]*)"/)?.[1] ?? '(none)';
  const kf = full.match(/"keyFindings":(\[[^\]]*\])/)?.[1] ?? '(none)';
  const corr = full.match(/[Cc]orrelation coefficient[^"]*/g) ?? full.match(/(strong|moderate|weak) (positive|negative) relationship/g);
  console.log(`\n### ${name} (ok=${body.ok}) ###`);
  console.log('  summary    :', summary);
  console.log('  keyFindings:', kf);
  console.log('  >>> correlation claim emitted?', corr ? JSON.stringify(corr) : 'NONE');
}
