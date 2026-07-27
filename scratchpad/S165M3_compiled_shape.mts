import { toVegaLiteSpec } from '../packages/viz-core/src/adapters/vega-lite-adapter.js';
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  shape: { field: 'shp', trait: 'EncodingShape' },
  detail: { field: 'dt', trait: 'EncodingDetail' },
};
const rows = [{ x: 1, y: 2, seg: 'a', sz: 10, shp: 'c', dt: 'p' }];
const spec = (extra: any = {}, marks = [{ trait: 'MarkPoint', encodings: enc }]) => ({
  $schema: 'https://oods.dev/viz-spec/v1', id: 'z', name: 'z',
  data: { name: 'd', values: rows }, marks, encoding: enc, a11y: { description: 'd' }, ...extra,
}) as any;
const show = (label: string, s: any) => {
  const out = toVegaLiteSpec(s) as any;
  console.log(`\n=== ${label} ===`);
  console.log('top-level keys:', Object.keys(out).join(', '));
  if (out.usermeta) console.log('usermeta keys:', Object.keys(out.usermeta).join(', '));
  const json = JSON.stringify(out);
  console.log('usermeta size:', JSON.stringify(out.usermeta ?? {}).length, ' total:', json.length);
  if (out.encoding) console.log('encoding channels:', Object.keys(out.encoding).join(', '));
  if (out.layer) console.log('layer count:', out.layer.length, 'layer0 channels:', Object.keys(out.layer[0].encoding ?? {}).join(', '));
  if (out.facet) console.log('facet:', JSON.stringify(out.facet), ' spec channels:', Object.keys(out.spec?.encoding ?? {}).join(', '));
};
show('single mark', spec());
show('layered 2 marks', spec({}, [{ trait: 'MarkLine', encodings: enc }, { trait: 'MarkPoint', encodings: enc }]));
show('faceted', spec({ layout: { trait: 'LayoutFacet', columns: { field: 'seg' }, rows: { field: 'shp' } } }));
for (const t of ['MarkRule', 'MarkText', 'MarkArc', 'MarkGeoshape']) {
  try { toVegaLiteSpec(spec({}, [{ trait: t, encodings: enc }])); console.log(`${t}: compiled OK`); }
  catch (e) { console.log(`${t}: THROWS -> ${(e as Error).message}`); }
}
