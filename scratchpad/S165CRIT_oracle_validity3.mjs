// S165 critic / oracle-validity — PART 3: does the §4 oracle's OWN first honest run go RED at HEAD,
// and is the field it flags a LIVE 4th phantom of survivor-A's class?
import { toVegaLiteSpec, analyzeVizSpec, generateNarrativeSummary, getEncodingBinding }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const pear = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let c = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { c += (xs[i] - mx) * (ys[i] - my); sx += (xs[i] - mx) ** 2; sy += (ys[i] - my) ** 2; }
  return sx === 0 || sy === 0 ? null : +(c / Math.sqrt(sx * sy)).toFixed(3); };

// Simpson: every `grp` band FALLS; every `seg` band RISES; pooled RISES.
const rows = [
  { x: 1, y: 50, seg: 'a', grp: 'G1' },
  { x: 2, y: 40, seg: 'b', grp: 'G1' },
  { x: 3, y: 30, seg: 'c', grp: 'G1' },
  { x: 4, y: 90, seg: 'a', grp: 'G2' },
  { x: 5, y: 80, seg: 'b', grp: 'G2' },
  { x: 6, y: 70, seg: 'c', grp: 'G2' },
];
const base = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } };
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows },
  marks: [
    { trait: 'MarkLine', encodings: { ...base, color: { field: 'seg', trait: 'EncodingColor' } } },
    { trait: 'MarkPoint', encodings: { ...base, color: { field: 'grp', trait: 'EncodingColor' } } },
  ],
  a11y: { description: 'y over x' },
};

const bandsOf = (f) => { const b = {}; for (const r of rows) { (b[r[f]] ??= { xs: [], ys: [] }); b[r[f]].xs.push(r.x); b[r[f]].ys.push(r.y); }
  return Object.entries(b).map(([k, v]) => `${k}: n=${v.xs.length} r=${pear(v.xs, v.ys)}`).join('   '); };

console.log('pooled r over all drawn cells :', pear(rows.map(r => r.x), rows.map(r => r.y)));
console.log('drawn bands by seg (layer-1 color):', bandsOf('seg'));
console.log('drawn bands by grp (layer-2 color):', bandsOf('grp'));
const vl = toVegaLiteSpec(spec);
console.log('compiled VL layer colors           :', JSON.stringify(vl.layer.map(l => l.encoding.color?.field)));
console.log('resolveBinding(spec,"color").field :', getEncodingBinding(spec, 'color')?.field, '   <-- FIRST mark only');
const a = analyzeVizSpec(spec);
console.log('analyzeVizSpec(spec).correlation   :', a.correlation);
const n = generateNarrativeSummary(spec);
const txt = typeof n === 'string' ? n : JSON.stringify(n);
console.log('narrative mentions correlation     :', /[Cc]orrelation/.test(txt) ? txt.match(/[^.]*[Cc]orrelation[^.]*\./)?.[0]?.trim() : 'NONE');

console.log('\nCONTROL — same rows, grp as the ONLY (top-level) color:');
const ctrl = { ...spec, encoding: { ...base, color: { field: 'grp', trait: 'EncodingColor' } },
  marks: [{ trait: 'MarkPoint', encodings: { ...base, color: { field: 'grp', trait: 'EncodingColor' } } }] };
console.log('  correlation =', analyzeVizSpec(ctrl).correlation, '(suppressed => the grp Simpson IS detectable when visible to resolveBinding)');
console.log('CONTROL — same rows, seg as the ONLY color:');
const ctrl2 = { ...spec, encoding: { ...base, color: { field: 'seg', trait: 'EncodingColor' } },
  marks: [{ trait: 'MarkPoint', encodings: { ...base, color: { field: 'seg', trait: 'EncodingColor' } } }] };
console.log('  correlation =', analyzeVizSpec(ctrl2).correlation);
