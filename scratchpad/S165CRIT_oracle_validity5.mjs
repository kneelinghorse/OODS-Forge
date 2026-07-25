// PART 5: the memo §4 claim — "if anyone teaches the adapter a NEW splitting channel without
// updating separableFields, this goes RED". Test both extractor formulations.
import { toVegaLiteSpec, getEncodingBinding, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const rows = [{ x: 1, y: 10, seg: 'a', dash: 'D1' }, { x: 2, y: 20, seg: 'b', dash: 'D2' }];
const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, color: { field: 'seg', trait: 'EncodingColor' } };
const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkLine', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
const vl = toVegaLiteSpec(spec);
// SIMULATE a future adapter teaching a new splitting channel (VL strokeDash DOES split line paths):
vl.encoding.strokeDash = { field: 'dash', type: 'nominal' };

const ALLOW = ['color', 'size', 'shape', 'detail'];
const NON_SPLIT = new Set(['x', 'y', 'x2', 'y2', 'tooltip', 'order', 'text', 'href', 'key']);
const stripAxes = (set) => { const { measureChannel, dimensionChannel } = resolvePrimaryChannels(spec);
  set.delete(getEncodingBinding(spec, dimensionChannel)?.field); set.delete(getEncodingBinding(spec, measureChannel)?.field); return [...set]; };
const allowList = () => { const o = new Set(); for (const c of ALLOW) if (vl.encoding[c]?.field) o.add(vl.encoding[c].field); return stripAxes(o); };
const denyList = () => { const o = new Set(); for (const [c, b] of Object.entries(vl.encoding)) { if (NON_SPLIT.has(c)) continue; if (b?.field) o.add(b.field); } return stripAxes(o); };

const separable = ['seg']; // separableFields — unaware of strokeDash
console.log('compiled encoding channels :', Object.keys(vl.encoding));
console.log('separableFields            :', JSON.stringify(separable));
console.log('compiled ALLOW-list extractor:', JSON.stringify(allowList()), '-> oracle', allowList().every(f => separable.includes(f)) ? 'GREEN  ===> BLIND to the new channel' : 'RED');
console.log('compiled DENY-list extractor :', JSON.stringify(denyList()),  '-> oracle', denyList().every(f => separable.includes(f)) ? 'GREEN' : 'RED (catches it)');
