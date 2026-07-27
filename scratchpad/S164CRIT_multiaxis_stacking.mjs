// S164 pre-lock critic — lens multiaxis_stacking (F4/F5).
// Read-only vs FRESH dist. Establishes CURRENT SUT behavior, then I HAND-SIMULATE the draft
// algorithm (decompose direction over each (partition ∪ grouping) sub-series, n>=2 votes,
// contradiction-first, fallback only when EVERY sub-series n<2).
import {
  analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length; if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const sign = (r) => (r == null ? 'unk' : r > 1e-9 ? '+1' : r < -1e-9 ? '-1' : '0');

// group rows by a tuple of fields, aggregate y per x with `agg`, return per-x cells sorted
function subCells(rows, keyFields, xf, yf, agg = 'avg') {
  const groups = new Map();
  for (const r of rows) {
    const k = keyFields.map((f) => r[f]).join('|');
    if (!groups.has(k)) groups.set(k, new Map());
    const g = groups.get(k);
    if (!g.has(r[xf])) g.set(r[xf], []);
    g.get(r[xf]).push(r[yf]);
  }
  const out = new Map();
  for (const [k, g] of groups) {
    const cells = [...g.entries()].map(([x, ys]) => {
      const v = agg === 'sum' ? ys.reduce((a, b) => a + b, 0) : ys.reduce((a, b) => a + b, 0) / ys.length;
      return [x, v];
    }).sort((a, b) => a[0] - b[0]);
    out.set(k, cells);
  }
  return out;
}

// HAND-SIMULATE the draft decomposition given the per-sub-series cells + the pooled value.
function draftDecision(pooled, subSeriesCells) {
  const votes = [];
  let anyVotable = false;
  for (const [k, cells] of subSeriesCells) {
    const distinctX = new Set(cells.map((c) => c[0])).size;
    if (distinctX < 2) { votes.push([k, 'n<2 (no vote)']); continue; }
    anyVotable = true;
    votes.push([k, sign(pearson(cells))]);
  }
  const voting = votes.filter((v) => v[1] === '+1' || v[1] === '-1' || v[1] === '0');
  let decision;
  if (!anyVotable) decision = 'FALLBACK -> narrate pooled ' + pooled.toFixed(3);
  else {
    const ps = sign(pooled);
    const contradict = voting.some((v) => v[1] !== 'unk' && v[1] !== '0' && v[1] !== ps && v[1] !== '+1' && v[1] !== '-1' ? false : (v[1] === '+1' || v[1] === '-1') && v[1] !== ps);
    // contradiction-first per narratableCorrelation: >1 distinct nonzero sign OR sign opposite pooled
    const signs = new Set(voting.map((v) => v[1]));
    let suppress = false;
    if (signs.size > 1) suppress = true;                       // groups disagree
    else { const s = [...signs][0]; if (s === '0') suppress = ps !== '0'; else suppress = !(ps === '0' || ps === s); }
    decision = suppress ? 'SUPPRESS -> undefined' : 'NARRATE pooled ' + pooled.toFixed(3);
  }
  return { votes, decision };
}

function run(label, spec, rows, { partition, grouping, agg = 'avg', xf = 'x', yf = 'y' }) {
  const a = analyzeVizSpec(spec);
  const { summary } = generateNarrativeSummary(spec);
  console.log('\n================ ' + label + ' ================');
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('CURRENT SUT correlation:', a.correlation, '|', summary.slice(0, 70));
  const keyFields = [...partition, ...grouping];
  const cells = subCells(rows, keyFields, xf, yf, agg);
  const allPairs = [...subCells(rows, [], xf, yf, agg).values()][0]; // pooled over drawn cells (single group over dim)
  const pooled = pearson(allPairs);
  console.log('  sub-series key =', JSON.stringify(keyFields), ' pooled(over drawn per-x cells) =', pooled?.toFixed(4));
  for (const [k, c] of cells) console.log('   sub', k, JSON.stringify(c), 'pearson', pearson(c)?.toFixed(4));
  const d = draftDecision(pooled ?? 0, cells);
  console.log('  DRAFT sim votes:', JSON.stringify(d.votes), '\n  DRAFT sim decision:', d.decision);
  return a.correlation;
}

// ---- F4a: TWO quant grouping axes (size + detail), categorical partition color=seg. Simpson on BOTH.
{
  const rows = [];
  for (const seg of ['A', 'B']) for (const sz of [10, 20]) for (const dt of [1, 2]) {
    // each (seg,sz,dt) sub-series FALLS in x; between-band offset creates a rising pooled Simpson
    const base = sz * 3 + dt * 40 + (seg === 'A' ? 0 : 5);
    rows.push({ x: 1, y: base + 100, seg, sz, dt });
    rows.push({ x: 2, y: base + 90, seg, sz, dt });
    rows.push({ x: 3, y: base + 80, seg, sz, dt });
  }
  // add cross-band rising offset by x so pooled rises: bump later-x bands up
  for (const r of rows) r.y += r.x * 300; // pooled now RISES though every sub-series falls
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' },
  };
  const spec = { $schema: 'x', id: 'm', name: 'm', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
  run('F4a two quant axes (size+detail) Simpson', spec, rows, { partition: ['seg'], grouping: ['sz', 'dt'] });
}

// ---- F4b: HONEST multi-axis — every fine sub-series RISES; must still narrate (over-suppression check)
{
  const rows = [];
  for (const seg of ['A', 'B']) for (const sz of [10, 20]) for (const dt of [1, 2]) {
    const base = sz + dt * 5 + (seg === 'A' ? 0 : 3);
    rows.push({ x: 1, y: base + 1, seg, sz, dt });
    rows.push({ x: 2, y: base + 5, seg, sz, dt });
    rows.push({ x: 3, y: base + 10, seg, sz, dt });
  }
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' },
  };
  const spec = { $schema: 'x', id: 'm', name: 'm', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
  run('F4b HONEST multi-axis (all rise) — must NARRATE', spec, rows, { partition: ['seg'], grouping: ['sz', 'dt'] });
}

// ---- F4c: HONEST overall rise but ONE thin fine slice dips (over-shred over-suppression risk)
{
  const rows = [];
  for (const seg of ['A', 'B']) for (const sz of [10, 20]) for (const dt of [1, 2]) {
    const base = sz + dt * 5 + (seg === 'A' ? 0 : 3);
    let ys = [base + 1, base + 5, base + 10];
    if (seg === 'B' && sz === 20 && dt === 2) ys = [base + 10, base + 9, base + 8]; // one thin slice dips
    rows.push({ x: 1, y: ys[0], seg, sz, dt });
    rows.push({ x: 2, y: ys[1], seg, sz, dt });
    rows.push({ x: 3, y: ys[2], seg, sz, dt });
  }
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' },
  };
  const spec = { $schema: 'x', id: 'm', name: 'm', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
  run('F4c honest rise + ONE thin dipping slice — draft SUPPRESSES (over-suppression?)', spec, rows, { partition: ['seg'], grouping: ['sz', 'dt'] });
}

// ---- F5: stacking with an EXTRA quant size on the bar (size does not split bars). Simpson on segments.
{
  const rows = [];
  // A falls, B rises, total rises — classic stacking Simpson; sz present but bars don't split by size
  const data = [
    [1, 30, 'A', 10], [2, 20, 'A', 10], [3, 10, 'A', 10],
    [1, 5, 'B', 20], [2, 25, 'B', 20], [3, 60, 'B', 20],
  ];
  for (const [x, y, seg, sz] of data) rows.push({ x, y, seg, sz });
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  };
  const spec = { $schema: 'x', id: 'stk', name: 'stk', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkBar', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
  // under stacking grouping = [] so sub-series = partition {seg} only, aggregate sum
  run('F5 stacked bar Simpson + quant size (bars do not split by size)', spec, rows, { partition: ['seg'], grouping: [], agg: 'sum' });
}
