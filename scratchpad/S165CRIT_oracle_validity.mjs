// S165 pre-lock critic — LENS: oracle-validity (§4 compiled-superset oracle)
// Attacks: separableFields(spec) ⊇ compiledSplitFields(spec) via toVegaLiteSpec.
import { toVegaLiteSpec, analyzeVizSpec, resolvePrimaryChannels, heatmapColorIsMeasure, getEncodingBinding }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const A11Y = { description: 'y over x' };
const mk = (marks, encoding, extra = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
  data: { name: 'd', values: extra.rows ?? [{ x: 1, y: 1 }, { x: 2, y: 2 }] },
  marks, encoding, a11y: A11Y, ...(extra.layout ? { layout: extra.layout } : {}),
  ...(extra.interactions ? { interactions: extra.interactions } : {}),
});

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE IMPLEMENTATION of §3.1 separableFields (memo table, verbatim rules)
// ─────────────────────────────────────────────────────────────────────────────
const normalizeMark = (t) => {
  const n = (t ?? '').toLowerCase();
  if (n.includes('markbar')) return 'bar';
  if (n.includes('markline')) return 'line';
  if (n.includes('markpoint')) return 'point';
  if (n.includes('markarea')) return 'area';
  return 'unknown';
};
const knownNormalizedMarks = (spec) => spec.marks.map((m) => normalizeMark(m.trait)).filter((m) => m !== 'unknown');
const markSplitsByRetina = (m) => m === 'point' || m === 'line' || m === 'area';
const resolveMark = (spec) => {
  const u = [...new Set(knownNormalizedMarks(spec))];
  return u.length === 1 ? u[0] : u.length > 1 ? 'mixed' : 'unknown';
};
const facetFields = (spec) => {
  if (spec.layout?.trait !== 'LayoutFacet') return [];
  return [spec.layout.rows, spec.layout.columns].filter((f) => f?.field).map((f) => f.field);
};
const rb = (spec, ch) => getEncodingBinding(spec, ch);

function separableFields(spec) {
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  const dimensionField = rb(spec, dimensionChannel)?.field;
  const measureField = rb(spec, measureChannel)?.field;
  const out = [];
  const add = (f) => { if (f && f !== dimensionField && f !== measureField && !out.includes(f)) out.push(f); };
  for (const f of facetFields(spec)) add(f);
  for (const ch of ['x', 'y']) { if (ch === measureChannel) continue; add(rb(spec, ch)?.field); }
  add(rb(spec, 'color')?.field);           // ALWAYS — categorical AND quantitative
  add(rb(spec, 'size')?.field);            // ALWAYS
  add(rb(spec, 'detail')?.field);          // ALWAYS (fail-safe)
  const km = knownNormalizedMarks(spec);
  const shapeSeparable = km.length === 0 ? true : (resolveMark(spec) === 'mixed' ? true : km.some(markSplitsByRetina));
  if (shapeSeparable) add(rb(spec, 'shape')?.field);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// compiledSplitFields — TWO plausible formulations from the compiled VL output
// ─────────────────────────────────────────────────────────────────────────────
const SPLIT_CHANNELS = ['color', 'size', 'shape', 'detail'];
const walkEncodings = (node, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (node.encoding) out.push(node.encoding);
  for (const k of ['layer', 'hconcat', 'vconcat', 'concat']) if (Array.isArray(node[k])) node[k].forEach((c) => walkEncodings(c, out));
  if (node.spec) walkEncodings(node.spec, out);
  return out;
};

// (a) NAIVE / allow-list: every field on a known splitting channel + facet + non-measure positional.
function compiledSplitFieldsNaive(vl, spec) {
  const out = new Set();
  if (vl.facet) for (const k of ['row', 'column']) if (vl.facet[k]?.field) out.add(vl.facet[k].field);
  for (const enc of walkEncodings(vl)) {
    for (const ch of SPLIT_CHANNELS) if (enc[ch]?.field) out.add(enc[ch].field);
    // a positional axis that is NOT the measure — recoverable from compiled output only by
    // guessing "the aggregated axis is the measure".
    for (const ch of ['x', 'y']) {
      const b = enc[ch];
      if (!b?.field) continue;
      const other = enc[ch === 'x' ? 'y' : 'x'];
      const isMeasure = b.aggregate !== undefined || (other?.field && other.aggregate === undefined && b.type === 'quantitative' && other.type !== 'quantitative');
      if (!isMeasure) out.add(b.field);
    }
  }
  // the correlation's own axes are excluded by the gate itself
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  out.delete(rb(spec, dimensionChannel)?.field);
  out.delete(rb(spec, measureChannel)?.field);
  return [...out];
}

// (b) DENY-list: every channel in the compiled encoding that is not a known non-splitter.
const NON_SPLIT = new Set(['x', 'y', 'x2', 'y2', 'tooltip', 'order', 'text', 'href', 'key']);
function compiledSplitFieldsDeny(vl, spec) {
  const out = new Set();
  if (vl.facet) for (const k of ['row', 'column']) if (vl.facet[k]?.field) out.add(vl.facet[k].field);
  for (const enc of walkEncodings(vl)) {
    for (const [ch, b] of Object.entries(enc)) {
      if (NON_SPLIT.has(ch)) continue;
      if (b && typeof b === 'object' && typeof b.field === 'string') out.add(b.field);
      if (Array.isArray(b)) b.forEach((e) => { if (e?.field) out.add(e.field); });
    }
  }
  const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  out.delete(rb(spec, dimensionChannel)?.field);
  out.delete(rb(spec, measureChannel)?.field);
  return [...out];
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBE CORPUS
// ─────────────────────────────────────────────────────────────────────────────
const rowsAB = [
  { x: 1, y: 10, seg: 'a', sz: 1, sh: 'p', c: 100, det: 'd1' },
  { x: 2, y: 20, seg: 'a', sz: 2, sh: 'q', c: 200, det: 'd2' },
  { x: 3, y: 30, seg: 'b', sz: 1, sh: 'p', c: 100, det: 'd1' },
];

const cases = [];

// SURVIVOR A: mixed marks + shape
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, shape: { field: 'sh', trait: 'EncodingShape' } };
  cases.push(['A mixed[line,point]+shape', mk([{ trait: 'MarkLine', encodings: enc }, { trait: 'MarkPoint', encodings: enc }], enc, { rows: rowsAB })]);
}
// CONTROL A': single BAR mark + shape  (separableFields EXCLUDES shape; compiled EMITS shape)
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' }, shape: { field: 'sh', trait: 'EncodingShape' } };
  cases.push(['A\' BAR + shape (mark-gated OUT)', mk([{ trait: 'MarkBar', encodings: enc }], enc, { rows: rowsAB })]);
}
// CONTROL A'': RECT mark (unknown) + shape
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' }, shape: { field: 'sh', trait: 'EncodingShape' } };
  cases.push(['A\'\' RECT(unknown) + shape', mk([{ trait: 'MarkRect', encodings: enc }], enc, { rows: rowsAB })]);
}
// SURVIVOR B: stacked bar + quantitative color ramp
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' }, color: { field: 'c', trait: 'EncodingColor', type: 'quantitative' } };
  cases.push(['B bar+sum+quant color ramp', mk([{ trait: 'MarkBar', encodings: enc }], enc, { rows: rowsAB })]);
}
// SURVIVOR C: categorical color collinear with x + quantitative size
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
  cases.push(['C color+size', mk([{ trait: 'MarkPoint', encodings: enc }], enc, { rows: rowsAB })]);
}
// LAYERED with DIFFERENT per-mark color fields (resolveBinding takes the FIRST)
{
  const base = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } };
  const m1 = { trait: 'MarkLine', encodings: { ...base, color: { field: 'seg', trait: 'EncodingColor' } } };
  const m2 = { trait: 'MarkPoint', encodings: { ...base, color: { field: 'det', trait: 'EncodingColor' } } };
  cases.push(['L per-layer DIFFERENT color fields', mk([m1, m2], undefined, { rows: rowsAB })]);
}
// FACET
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' } };
  cases.push(['F facet rows=det', mk([{ trait: 'MarkPoint', encodings: enc }], enc, { rows: rowsAB, layout: { trait: 'LayoutFacet', rows: { field: 'det' } } })]);
}
// HEATMAP (color IS the measure)
{
  const enc = { x: { field: 'x', trait: 'EncodingX' }, y: { field: 'det', trait: 'EncodingY' }, color: { field: 'y', trait: 'EncodingColor', aggregate: 'sum' } };
  cases.push(['H heatmap color=measure', mk([{ trait: 'MarkRect', encodings: enc }], enc, { rows: rowsAB })]);
}
// RAW HORIZONTAL BAR (measure = x, NO aggregate anywhere — s162 m2 arm)
{
  const enc = { x: { field: 'y', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'seg', trait: 'EncodingY' }, color: { field: 'det', trait: 'EncodingColor' } };
  cases.push(['R raw horizontal bar', mk([{ trait: 'MarkBar', encodings: enc }], enc, { rows: rowsAB })]);
}
// INTERACTION bindTo visual property=color (OVERWRITES the compiled color encoding)
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' } };
  cases.push(['I interaction visual->color', mk([{ trait: 'MarkPoint', encodings: enc }], enc, {
    rows: rowsAB,
    interactions: [{ id: 'hl', select: { type: 'point' }, rule: { bindTo: 'visual', property: 'color', condition: { value: 'red' }, else: { value: 'grey' } } }],
  })]);
}
// INTERACTION bindTo tooltip (adds encoding.tooltip=[{field}])
{
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' } };
  cases.push(['T interaction tooltip fields', mk([{ trait: 'MarkPoint', encodings: enc }], enc, {
    rows: rowsAB,
    interactions: [{ id: 'tt', select: { type: 'point' }, rule: { bindTo: 'tooltip', fields: ['det', 'sz'] } }],
  })]);
}

const eq = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const superset = (a, b) => b.every((x) => a.includes(x));

console.log('name'.padEnd(34), '| separableFields'.padEnd(30), '| compiled(NAIVE)'.padEnd(30), '| compiled(DENY)'.padEnd(30), '| ⊇naive ⊇deny  identical?');
console.log('-'.repeat(160));
for (const [name, spec] of cases) {
  let vl;
  try { vl = toVegaLiteSpec(spec); } catch (e) { console.log(name.padEnd(34), '| COMPILE ERROR:', e.message); continue; }
  const sf = separableFields(spec);
  const cn = compiledSplitFieldsNaive(vl, spec);
  const cd = compiledSplitFieldsDeny(vl, spec);
  console.log(
    name.padEnd(34),
    ('| ' + JSON.stringify(sf)).padEnd(30),
    ('| ' + JSON.stringify(cn)).padEnd(30),
    ('| ' + JSON.stringify(cd)).padEnd(30),
    '|', superset(sf, cn) ? 'GREEN' : 'RED  ', superset(sf, cd) ? 'GREEN' : 'RED  ',
    ' identicalToNaive=' + eq(sf, cn),
  );
}

// ── MUTATION (v): drop color from separableFields → does the oracle go RED?
console.log('\n=== MUTATION (v) drop `color` from separableFields ===');
function separableFieldsNoColor(spec) { return separableFields(spec).filter((f) => f !== rb(spec, 'color')?.field); }
for (const [name, spec] of cases) {
  let vl; try { vl = toVegaLiteSpec(spec); } catch { continue; }
  const sf = separableFieldsNoColor(spec);
  const cn = compiledSplitFieldsNaive(vl, spec);
  const cd = compiledSplitFieldsDeny(vl, spec);
  console.log(name.padEnd(34), 'naive:', superset(sf, cn) ? 'GREEN(no bite)' : 'RED(bites)', ' deny:', superset(sf, cd) ? 'GREEN(no bite)' : 'RED(bites)');
}

// ── MUTATION: drop `shape` mark-gating fix (revert to collapsed resolveMark) → survivor A returns
console.log('\n=== MUTATION (i) revert shape to collapsed resolveMark → does the §4 oracle notice? ===');
function separableFieldsShapeCollapsed(spec) {
  const out = separableFields(spec);
  if (!markSplitsByRetina(resolveMark(spec))) return out.filter((f) => f !== rb(spec, 'shape')?.field);
  return out;
}
for (const [name, spec] of cases) {
  let vl; try { vl = toVegaLiteSpec(spec); } catch { continue; }
  const sf = separableFieldsShapeCollapsed(spec);
  const cn = compiledSplitFieldsNaive(vl, spec);
  console.log(name.padEnd(34), 'sf=', JSON.stringify(sf), ' naive-oracle:', superset(sf, cn) ? 'GREEN' : 'RED');
}
