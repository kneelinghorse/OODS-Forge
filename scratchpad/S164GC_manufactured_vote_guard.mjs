import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(rows, encExtra = {}, mark = 'MarkPoint', yAgg = 'average') {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(yAgg ? { aggregate: yAgg } : {}) },
    ...encExtra,
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: rows },
    marks: [{ trait: mark, encodings: enc }],
    encoding: enc, a11y: { description: 'y over x' },
  };
}

// hand pearson
function pear(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

function run(label, spec, bands) {
  const corr = analyzeVizSpec(spec).correlation;
  const sum = generateNarrativeSummary(spec).summary;
  console.log('\n=== ' + label + ' ===');
  console.log('corr=', corr, '| narrated:', /[Cc]orrelation coefficient/.test(sum) ? sum.match(/[Cc]orrelation coefficient[^.]*/)[0] : '(silent)');
  if (bands) for (const [name, xs, ys] of bands) {
    console.log('  band', name, 'n=' + xs.length, 'distinctX=' + new Set(xs).size, 'pearson=', pear(xs, ys) === null ? 'null' : pear(xs, ys).toFixed(3));
  }
}

// ---------- A: continuous ramp (DISCLOSED narrate) ----------
// sz unique per point; each (x,sz) 1-point band; over-x rises.
{
  const rows = [];
  for (let x = 1; x <= 6; x++) rows.push({ x, y: x * 2, sz: x }); // sz==x, y rises
  const spec = mk(rows, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', null);
  run('A ramp: sz==x unique 1-pt bands, over-x rises', spec, [['over-x', rows.map(r => r.x), rows.map(r => r.y)]]);
}

// ---------- B: all-flat-offset (SUPPRESS) ----------
// two sz bands, each flat, offset, overlapping x → pooled positive between-band.
{
  const rows = [];
  for (let x = 1; x <= 4; x++) rows.push({ x, y: 10, sz: 1 });   // band lo x, flat low  -> but need offset with x
  // make between-band trend: band1 at low x low y, band2 at high x high y, each flat
  const r2 = [];
  for (let x = 1; x <= 3; x++) r2.push({ x, y: 5, sz: 1 });
  for (let x = 4; x <= 6; x++) r2.push({ x, y: 20, sz: 2 });
  const spec = mk(r2, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', null);
  run('B all-flat-offset: sz=1 flat@5 (x1-3), sz=2 flat@20 (x4-6)', spec, [
    ['sz1', [1, 2, 3], [5, 5, 5]], ['sz2', [4, 5, 6], [20, 20, 20]],
  ]);
}

// ---------- C: flat finer band drops emptyVote, agreeing band shares pooled ----------
// Band A(sz=1): rises n=3 (agrees +). Band B(sz=2): single point. over-x maybe falls?
{
  const r = [
    { x: 1, y: 1, sz: 1 }, { x: 2, y: 2, sz: 1 }, { x: 3, y: 3, sz: 1 }, // band A rises
    { x: 1, y: 100, sz: 2 }, // band B single point high at low x -> pulls over-x DOWN
  ];
  const spec = mk(r, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', null);
  run('C bandA rises(sz1) + bandB 1pt high@x1(sz2); pool may fall', spec, [
    ['sz1', [1, 2, 3], [1, 2, 3]], ['sz2', [1], [100]],
  ]);
}

// ---------- D: real FALLING votable band, pooled positive -> MUST SUPPRESS (control) ----------
{
  const r = [
    { x: 1, y: 10, sz: 1 }, { x: 2, y: 8, sz: 1 }, { x: 3, y: 6, sz: 1 }, // FALLS |r|=1
    { x: 1, y: 20, sz: 2 }, { x: 2, y: 30, sz: 2 }, { x: 3, y: 40, sz: 2 }, // rises, offset up
  ];
  const spec = mk(r, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', null);
  run('D control: sz1 FALLS |r|=1, sz2 rises', spec, [
    ['sz1', [1, 2, 3], [10, 8, 6]], ['sz2', [1, 2, 3], [20, 30, 40]],
  ]);
}

// ---------- E: opposing series only at COARSER subset (multi-field) ----------
// groupingFields=[sz, shp]. Finest (sz,shp) cells 1-point. But by sz alone -> multi-point falling.
{
  const r = [
    { x: 1, y: 10, sz: 1, shp: 'a' }, { x: 2, y: 8, sz: 1, shp: 'b' }, { x: 3, y: 6, sz: 1, shp: 'c' }, // sz=1 falls, each shp unique
    { x: 1, y: 20, sz: 2, shp: 'a' }, { x: 2, y: 30, sz: 2, shp: 'b' }, { x: 3, y: 40, sz: 2, shp: 'c' }, // sz=2 rises
  ];
  // shp quantitative? no -> categorical -> partition. Make shp quantitative to keep in grouping.
  const spec = mk(r, {
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    shape: { field: 'shp', trait: 'EncodingShape' },
  }, 'MarkPoint', null);
  run('E coarser-subset: sz1 falls / sz2 rises, shp splits finest to 1-pt (shp categorical=partition)', spec, [
    ['sz1', [1, 2, 3], [10, 8, 6]], ['sz2', [1, 2, 3], [20, 30, 40]],
  ]);
}

// ---------- F: rho boundary opposing band n=3 |r|~0.45 (DISCLOSED narrate) vs 0.55 (suppress) ----------
{
  // build a band with |r| just below 0.5 opposing, plus agreeing band
  const below = [{ x: 1, y: 5 }, { x: 2, y: 4.6 }, { x: 3, y: 5.2 }, { x: 4, y: 4.4 }]; // weak fall
  console.log('\n F helper pearson below=', pear(below.map(r => r.x), below.map(r => r.y)).toFixed(3));
}

// ---------- G: aggregate path, flat votable band + 1-pt bands, over-x opposes ----------
// Under declared aggregate average. sz=1 flat band (x1,2,3 -> avg flat). sz varies for other x 1-pt.
{
  const r = [
    { x: 1, y: 50, sz: 1 }, { x: 2, y: 50, sz: 1 }, { x: 3, y: 50, sz: 1 }, // flat votable band avg 50
    { x: 4, y: 10, sz: 2 }, // 1-pt
    { x: 5, y: 5, sz: 3 },  // 1-pt  -> over-x from x1..5 falls (50->5)
  ];
  const spec = mk(r, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average');
  run('G agg: flat votable sz1@50 + falling 1-pt bands; over-x falls', spec, [
    ['sz1', [1, 2, 3], [50, 50, 50]], ['over-x', [1, 2, 3, 4, 5], [50, 50, 50, 10, 5]],
  ]);
}
