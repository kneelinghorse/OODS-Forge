// s165 m1: what the new derivations return on the four survivors + the §3.5 arm attribution on the
// four corpus specs it fires for + the three rule-13b fall-through classes.
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  analyzeVizSpec,
  separableFields,
  layeredCorrelationUnsupported,
  resolvePrimaryChannels,
  getEncodingBinding,
} from '../packages/viz-core/src/a11y/data-analysis.js';

const REPO = path.resolve(import.meta.dirname, '..');
const sf = (spec: any) => {
  const ch = resolvePrimaryChannels(spec);
  return separableFields(
    spec,
    getEncodingBinding(spec, ch.dimensionChannel)?.field ?? '',
    getEncodingBinding(spec, ch.measureChannel)?.field ?? ''
  );
};
const show = (label: string, spec: any) =>
  console.log(
    `  ${label.padEnd(52)} sf=[${sf(spec)}]  layeredUnsupported=${layeredCorrelationUnsupported(spec)}  corr=${analyzeVizSpec(spec).correlation}`
  );

const XY = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const spec = (marks: any[], encoding: any, rows: any[], extra: any = {}) => ({
  $schema: 'https://oods.dev/viz-spec/v1',
  id: 'p',
  name: 'p',
  data: { name: 'd', values: rows },
  marks,
  encoding,
  a11y: { description: 'y over x' },
  ...extra,
});

console.log('### SURVIVOR A — mixed [MarkLine,MarkPoint] + categorical shape ###');
const aRows = [
  { x: 1, y: 30, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 10, shp: 'circle' },
  { x: 4, y: 130, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 110, shp: 'square' },
];
const aEnc = { ...XY, shape: { field: 'shp', trait: 'EncodingShape' } };
show('A mixed+shape', spec([{ trait: 'MarkLine', encodings: aEnc }, { trait: 'MarkPoint', encodings: aEnc }], aEnc, aRows));

console.log('\n### SURVIVOR B — sum-stacked MarkBar + QUANTITATIVE color ramp ###');
const bRows = [
  { x: 1, y: 50, c: 100 }, { x: 2, y: 40, c: 100 }, { x: 3, y: 30, c: 100 },
  { x: 1, y: 10, c: 200 }, { x: 2, y: 60, c: 200 }, { x: 3, y: 110, c: 200 },
];
const bEnc = {
  x: XY.x,
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
  color: { field: 'c', trait: 'EncodingColor', type: 'quantitative' },
};
show('B stacked+quant-color', spec([{ trait: 'MarkBar', encodings: bEnc }], bEnc, bRows));

console.log('\n### SURVIVOR C — collinear categorical color + quantitative size ###');
const cRows = [
  { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 },
  { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 },
];
const cEnc = {
  x: XY.x,
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
show('C collinear-cat+size', spec([{ trait: 'MarkPoint', encodings: cEnc }], cEnc, cRows));

console.log('\n### SURVIVOR D — per-layer color (seg on L0, grp on L1) ###');
const dRows = [
  { x: 1, y: 30, seg: 'only', grp: 'circle' }, { x: 2, y: 20, seg: 'only', grp: 'circle' }, { x: 3, y: 10, seg: 'only', grp: 'circle' },
  { x: 4, y: 130, seg: 'only', grp: 'square' }, { x: 5, y: 120, seg: 'only', grp: 'square' }, { x: 6, y: 110, seg: 'only', grp: 'square' },
];
show(
  'D per-layer color',
  spec(
    [
      { trait: 'MarkLine', encodings: { ...XY, color: { field: 'seg', trait: 'EncodingColor' } } },
      { trait: 'MarkPoint', encodings: { ...XY, color: { field: 'grp', trait: 'EncodingColor' } } },
    ],
    XY,
    dRows
  )
);

console.log('\n### RULE 13b — the three classes newly FALLING THROUGH the re-gated early return ###');
// (a) shape on a non-splitting/collapsed mark: MarkBar + shape (markSplitsByRetina(bar)=false)
const shpBarEnc = { ...XY, shape: { field: 'shp', trait: 'EncodingShape' } };
show('(a) MarkBar + shape (bar does not split by shape)', spec([{ trait: 'MarkBar', encodings: shpBarEnc }], shpBarEnc, aRows));
// (b) a stacking aggregate with no facet and no categorical retinal — but a quant retinal is class (c),
//     so class (b) is a stack with a SECOND POSITIONAL dimension only.
const stkEnc = {
  x: XY.x,
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
  detail: { field: 'd2', trait: 'EncodingDetail' },
};
show(
  '(b) sum-stacked bar, detail series (dropped by stacking)',
  spec([{ trait: 'MarkBar', encodings: stkEnc }], stkEnc, [
    { x: 1, y: 5, d2: 'u' }, { x: 2, y: 6, d2: 'u' }, { x: 3, y: 7, d2: 'u' },
    { x: 1, y: 15, d2: 'v' }, { x: 2, y: 16, d2: 'v' }, { x: 3, y: 17, d2: 'v' },
  ])
);
// (c) a quantitative-only retinal under stacking = survivor B's shape, above.
show('(c) quantitative-only retinal under stacking (= B)', spec([{ trait: 'MarkBar', encodings: bEnc }], bEnc, bRows));

console.log('\n### §3.5 arm attribution on the 4 corpus specs it fires for ###');
const GLOBS = ['examples/viz/patterns-v2/**/*.spec.json', 'examples/viz/patterns/**/*.spec.json'];
for (const file of [...new Set(GLOBS.flatMap((g) => globSync(path.join(REPO, g))))].sort()) {
  const s = JSON.parse(readFileSync(file, 'utf8')) as any;
  if (!Array.isArray(s.marks) || !layeredCorrelationUnsupported(s)) continue;
  const ch = resolvePrimaryChannels(s);
  const fromArm = s.marks.some((m: any) => m.from !== undefined);
  const measures = [
    ...new Set([s.encoding?.[ch.measureChannel]?.field, ...s.marks.map((m: any) => m.encodings?.[ch.measureChannel]?.field)].filter(Boolean)),
  ];
  console.log(`  ${path.relative(REPO, file)}`);
  console.log(`      from-arm=${fromArm}  measureChannel=${ch.measureChannel}  distinct measure fields=[${measures}]  corr=${analyzeVizSpec(s).correlation}`);
}
