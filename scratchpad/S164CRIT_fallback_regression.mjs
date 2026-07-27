// S164 pre-lock critic — the FALLBACK REGRESSION (BLOCK candidate).
// A classic BETWEEN-PARTITION Simpson: color=seg has two series that BOTH FALL, offset in x so the
// pooled RISES. correlationPartitionFields={seg} catches this today (s163 suppresses). Now add a
// CONTINUOUS all-distinct quant size. The DRAFT's fallback condition is "every (partition ∪ grouping)
// sub-series has n<2". grouping={sz}; sz all-distinct -> every (seg,sz) sub-series is n=1 -> the
// FALLBACK fires -> narrate the pooled Simpson. But the PARTITION-level (seg) decomposition still has
// n>=2 and both segs FALL. So the draft REGRESSES from s163 and narrates a between-partition phantom.
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

function build(sizeMode) {
  // seg A low-x/low-y falling; seg B high-x/high-y falling => pooled RISES, each seg FALLS.
  const base = [
    ['A', 1, 20], ['A', 2, 10],
    ['B', 3, 100], ['B', 4, 90],
  ];
  const rows = [];
  let c = 0;
  for (const [seg, x, y] of base) {
    c += 1;
    const sz = sizeMode === 'none' ? undefined
      : sizeMode === 'discrete' ? (x <= 2 ? 10 : 20)      // 2 values -> (seg,sz) has n>=1... actually n per (seg,sz)
      : 1.0 + c * 0.5;                                    // continuous: ALL-DISTINCT
    rows.push(sz === undefined ? { x, y, seg } : { x, y, seg, sz });
  }
  return rows;
}

function specFor(rows, withSize) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  if (withSize) enc.size = { field: 'sz', trait: 'EncodingSize', type: 'quantitative' };
  return { $schema: 'x', id: 's', name: 's', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'x' } };
}

function report(label, rows, withSize) {
  const spec = specFor(rows, withSize);
  const a = analyzeVizSpec(spec);
  console.log('\n================ ' + label + ' ================');
  console.log('CURRENT SUT correlation:', a.correlation);
  // pooled over drawn cells (avg per (x,seg,sz)); with continuous size each cell = 1 row
  const pooled = pearson(rows.map((r) => [r.x, r.y]));
  console.log('  pooled(raw cells) pearson:', pooled?.toFixed(4), '(RISES = the Simpson lift)');
  for (const seg of ['A', 'B']) {
    const cells = rows.filter((r) => r.seg === seg).map((r) => [r.x, r.y]);
    console.log('  PARTITION seg=' + seg + ' cells', JSON.stringify(cells), 'pearson', pearson(cells)?.toFixed(4), '(the drawn color series -> FALLS)');
  }
  if (withSize) {
    const fk = new Map();
    for (const r of rows) { const k = r.seg + '|' + r.sz; if (!fk.has(k)) fk.set(k, new Set()); fk.get(k).add(r.x); }
    const anyVotable = [...fk.values()].some((xs) => xs.size >= 2);
    console.log('  DRAFT full-key (seg,sz) groups:', fk.size, '| any n>=2 distinct-x?', anyVotable);
    console.log('  => DRAFT decision:', anyVotable ? 'decompose (catches)' : 'EVERY sub-series n<2 -> FALLBACK -> NARRATE pooled ' + pooled?.toFixed(3) + '  <-- PHANTOM (both segs fall)');
  }
  return a.correlation;
}

report('BASELINE no size — s163 partition={seg} suppresses', build('none'), false);
report('CONTINUOUS size — DRAFT fallback re-opens?', build('continuous'), true);
