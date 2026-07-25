import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function mk(rows, encExtra = {}, mark = 'MarkPoint', yAgg = 'average') {
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(yAgg ? { aggregate: yAgg } : {}) }, ...encExtra };
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks: [{ trait: mark, encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
}
function show(label, spec) { const a = analyzeVizSpec(spec); console.log(label, '=> corr=', a.correlation, '|', generateNarrativeSummary(spec).summary); }

const rows = [
  { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 },
  { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 },
];

// 1) RAW rows (no y-aggregate) — collinear color + quant size
show("RAW  collinear-color + quant-size ", mk(rows, { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', null));

// 2) color made QUANTITATIVE -> becomes a grouping axis (not partition). size in grouping too. Expect SUPPRESS.
show("color QUANT (grouping not partition)", mk(rows, { color: { field: 'seg2', trait: 'EncodingColor', type: 'quantitative' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));

// 3) DETAIL channel collinear with x (categorical) instead of color
show("DETAIL collinear + quant-size    ", mk(rows, { detail: { field: 'seg', trait: 'EncodingDetail' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));

// 4) size-only, NO categorical (control) -> the pure size-Simpson s164 closes. Expect SUPPRESS.
show("size-only, no categorical        ", mk(rows, { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));
