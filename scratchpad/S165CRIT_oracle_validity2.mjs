// S165 critic / oracle-validity — PART 2: the gated-vs-ungated DILEMMA, and the live "L" phantom.
import { toVegaLiteSpec, analyzeVizSpec, resolvePrimaryChannels, getEncodingBinding }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const A11Y = { description: 'y over x' };
const mk = (marks, encoding, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
  data: { name: 'd', values: extra.rows }, marks, encoding, a11y: A11Y,
});
const normalizeMark = (t) => { const n = (t ?? '').toLowerCase();
  if (n.includes('markbar')) return 'bar'; if (n.includes('markline')) return 'line';
  if (n.includes('markpoint')) return 'point'; if (n.includes('markarea')) return 'area'; return 'unknown'; };
const knownNormalizedMarks = (s) => s.marks.map((m) => normalizeMark(m.trait)).filter((m) => m !== 'unknown');
const markSplitsByRetina = (m) => m === 'point' || m === 'line' || m === 'area';
const resolveMark = (s) => { const u = [...new Set(knownNormalizedMarks(s))]; return u.length === 1 ? u[0] : u.length > 1 ? 'mixed' : 'unknown'; };
const rb = (s, c) => getEncodingBinding(s, c);

const shapeRuleS165 = (spec) => { const km = knownNormalizedMarks(spec); return km.length === 0 ? true : (resolveMark(spec) === 'mixed' ? true : km.some(markSplitsByRetina)); };
const shapeRuleTODAY = (spec) => markSplitsByRetina(resolveMark(spec));

function separableFields(spec, shapeRule = shapeRuleS165) {
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  const dimF = rb(spec, dimensionChannel)?.field, meaF = rb(spec, measureChannel)?.field;
  const out = []; const add = (f) => { if (f && f !== dimF && f !== meaF && !out.includes(f)) out.push(f); };
  for (const ch of ['x', 'y']) { if (ch === measureChannel) continue; add(rb(spec, ch)?.field); }
  add(rb(spec, 'color')?.field); add(rb(spec, 'size')?.field); add(rb(spec, 'detail')?.field);
  if (shapeRule(spec)) add(rb(spec, 'shape')?.field);
  return out;
}
const walkEnc = (n, out = []) => { if (!n || typeof n !== 'object') return out; if (n.encoding) out.push(n.encoding);
  for (const k of ['layer', 'hconcat', 'vconcat', 'concat']) if (Array.isArray(n[k])) n[k].forEach((c) => walkEnc(c, out));
  if (n.spec) walkEnc(n.spec, out); return out; };

// UNGATED extractor (pure "what fields sit on split channels in the compiled JSON")
function compiledUngated(vl, spec) {
  const out = new Set();
  for (const enc of walkEnc(vl)) for (const ch of ['color', 'size', 'shape', 'detail']) if (enc[ch]?.field) out.add(enc[ch].field);
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  out.delete(rb(spec, dimensionChannel)?.field); out.delete(rb(spec, measureChannel)?.field);
  return [...out];
}
// GATED extractor — the ONLY way to be sound on bar+shape: re-embed the SAME mark-applicability
// knowledge markSplitsByRetina encodes (Vega-Lite ignores `shape` on non-point marks).
function compiledGated(vl, spec, shapeRule = shapeRuleS165) {
  const out = new Set();
  for (const enc of walkEnc(vl)) for (const ch of ['color', 'size', 'shape', 'detail']) {
    if (!enc[ch]?.field) continue;
    if (ch === 'shape' && !shapeRule(spec)) continue;   // <- shared derivation
    out.add(enc[ch].field);
  }
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  out.delete(rb(spec, dimensionChannel)?.field); out.delete(rb(spec, measureChannel)?.field);
  return [...out];
}
const superset = (a, b) => b.every((x) => a.includes(x));

const rows = [{ x: 1, y: 10, sh: 'p' }, { x: 2, y: 20, sh: 'q' }, { x: 3, y: 30, sh: 'p' }];
const encPL = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, shape: { field: 'sh', trait: 'EncodingShape' } };
const specA = mk([{ trait: 'MarkLine', encodings: encPL }, { trait: 'MarkPoint', encodings: encPL }], encPL, { rows });
const encBar = { ...encPL, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' } };
const specAp = mk([{ trait: 'MarkBar', encodings: encBar }], encBar, { rows });

console.log('=== THE DILEMMA: soundness on bar+shape  XOR  bite on mutation (i) ===');
for (const [label, extractor] of [['UNGATED', compiledUngated], ['GATED(shares markSplitsByRetina)', compiledGated]]) {
  const sfA = separableFields(specA), sfAp = separableFields(specAp);
  const cA = extractor(toVegaLiteSpec(specA), specA), cAp = extractor(toVegaLiteSpec(specAp), specAp);
  // mutation (i): revert the shape rule to today's collapsed resolveMark
  const mA = separableFields(specA, shapeRuleTODAY);
  const cAm = label === 'UNGATED' ? cA : compiledGated(toVegaLiteSpec(specA), specA, shapeRuleTODAY);
  console.log(`\n[${label}]`);
  console.log('  A  (mixed+shape)   sf=', JSON.stringify(sfA), ' compiled=', JSON.stringify(cA), ' ->', superset(sfA, cA) ? 'GREEN' : 'RED (false failure)');
  console.log("  A' (bar+shape)     sf=", JSON.stringify(sfAp), ' compiled=', JSON.stringify(cAp), ' ->', superset(sfAp, cAp) ? 'GREEN' : 'RED (FALSE FAILURE on a legit spec — VL ignores shape on bar)');
  console.log('  MUTATION (i) on A: sf=', JSON.stringify(mA), ' compiled=', JSON.stringify(cAm), ' -> oracle', superset(mA, cAm) ? 'GREEN  ===> MUTATION DOES NOT BITE (vacuous)' : 'RED  (bites)');
}

// ─────────────────────────────────────────────────────────────────────────────
// The "L" superset violation that exists at HEAD — is it a LIVE phantom too?
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== L: per-layer DIFFERENT color fields — live behaviour at HEAD ===');
// layer1 color=seg (2 rising bands), layer2 color=grp; the grp bands both FALL.
const Lrows = [
  { x: 1, y: 10, seg: 'a', grp: 'G1' }, { x: 2, y: 8, seg: 'a', grp: 'G2' },
  { x: 3, y: 30, seg: 'b', grp: 'G1' }, { x: 4, y: 28, seg: 'b', grp: 'G2' },
  { x: 5, y: 50, seg: 'a', grp: 'G1' }, { x: 6, y: 48, seg: 'a', grp: 'G2' },
];
const base = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } };
const specL = mk([
  { trait: 'MarkLine', encodings: { ...base, color: { field: 'seg', trait: 'EncodingColor' } } },
  { trait: 'MarkPoint', encodings: { ...base, color: { field: 'grp', trait: 'EncodingColor' } } },
], undefined, { rows: Lrows });
const vlL = toVegaLiteSpec(specL);
console.log('  compiled layer colors:', vlL.layer.map((l) => l.encoding.color?.field));
console.log('  separableFields      :', JSON.stringify(separableFields(specL)));
console.log('  compiledUngated      :', JSON.stringify(compiledUngated(vlL, specL)));
console.log('  analyzeVizSpec.correlation =', analyzeVizSpec(specL).correlation);

// pearson helper for the drawn bands
const pear = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let c = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { c += (xs[i] - mx) * (ys[i] - my); sx += (xs[i] - mx) ** 2; sy += (ys[i] - my) ** 2; }
  return sx === 0 || sy === 0 ? null : +(c / Math.sqrt(sx * sy)).toFixed(3); };
for (const f of ['seg', 'grp']) {
  const bands = {};
  for (const r of Lrows) { (bands[r[f]] ??= { xs: [], ys: [] }); bands[r[f]].xs.push(r.x); bands[r[f]].ys.push(r.y); }
  console.log(`  drawn bands by ${f}:`, Object.entries(bands).map(([k, v]) => `${k}: r=${pear(v.xs, v.ys)}`).join('  '));
}
