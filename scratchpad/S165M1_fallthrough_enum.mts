// s165 m1 RULE 13b: EXHAUSTIVELY enumerate the structural classes that newly fall THROUGH the re-gated
// early return — i.e. partitionFields=∅ AND groupingFields=∅ (the shipped 2-clause form returned the
// pooled r here) AND separableFields≠∅ (the 3-clause form now reaches the gates).
import { correlationGateFields } from '../packages/viz-core/src/a11y/data-analysis.js';

const rows = [
  { x: 1, y: 30, f: 'a', q: 1 }, { x: 2, y: 20, f: 'a', q: 1 }, { x: 3, y: 10, f: 'a', q: 1 },
  { x: 4, y: 130, f: 'b', q: 2 }, { x: 5, y: 120, f: 'b', q: 2 }, { x: 6, y: 110, f: 'b', q: 2 },
];

const MARKS: [string, string[]][] = [
  ['bar', ['MarkBar']],
  ['line', ['MarkLine']],
  ['point', ['MarkPoint']],
  ['area', ['MarkArea']],
  ['unknown(MarkRule)', ['MarkRule']],
  ['mixed[line,point]', ['MarkLine', 'MarkPoint']],
  ['mixed[point,bar]', ['MarkPoint', 'MarkBar']],
];
const AGGS: (string | undefined)[] = [undefined, 'sum', 'count', 'average'];
const CHANNELS = ['color', 'size', 'shape', 'detail'] as const;
const TYPES: [string, Record<string, unknown>][] = [
  ['categorical', {}],
  ['quantitative', { type: 'quantitative' }],
];
const TRAIT: Record<string, string> = {
  color: 'EncodingColor',
  size: 'EncodingSize',
  shape: 'EncodingShape',
  detail: 'EncodingDetail',
};

type Hit = { mark: string; agg: string; channel: string; kind: string; facet: boolean; sf: string[] };
const hits: Hit[] = [];
let considered = 0;

for (const [markLabel, traits] of MARKS)
  for (const agg of AGGS)
    for (const channel of CHANNELS)
      for (const [kind, typeStamp] of TYPES)
        for (const facet of [false, true]) {
          considered += 1;
          const enc: Record<string, unknown> = {
            x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
            y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(agg ? { aggregate: agg } : {}) },
            [channel]: { field: kind === 'quantitative' ? 'q' : 'f', trait: TRAIT[channel], ...typeStamp },
          };
          const spec = {
            $schema: 'https://oods.dev/viz-spec/v1',
            id: 'e', name: 'e',
            data: { name: 'd', values: rows },
            marks: traits.map((t) => ({ trait: t, encodings: enc })),
            encoding: enc,
            a11y: { description: 'y over x' },
            ...(facet ? { layout: { trait: 'LayoutFacet', columns: { field: 'f' } } } : {}),
          } as any;
          const g = correlationGateFields(spec);
          if (g.partitionFields.length === 0 && g.groupingFields.length === 0 && g.separableFields.length > 0) {
            hits.push({ mark: markLabel, agg: agg ?? 'none', channel, kind, facet, sf: g.separableFields });
          }
        }

console.log(`considered ${considered} structural combinations; ${hits.length} newly fall through\n`);
for (const h of hits) {
  console.log(`  mark=${h.mark.padEnd(18)} agg=${h.agg.padEnd(8)} ${h.channel}:${h.kind.padEnd(13)} facet=${h.facet}  sf=[${h.sf}]`);
}

// Group into named classes
const byReason = new Map<string, Hit[]>();
for (const h of hits) {
  const stacking = (h.agg === 'sum' || h.agg === 'count') && ['bar', 'area'].includes(h.mark);
  const reason =
    h.channel === 'shape' && h.kind === 'categorical'
      ? 'A: categorical shape on a mark the s164 retinal gate calls non-splitting'
      : h.kind === 'quantitative' && stacking
        ? 'C: a quantitative-only retinal under stacking'
        : h.kind === 'quantitative' && !stacking
          ? 'D: a quantitative retinal NOT under stacking (partition skips quant; grouping keeps it — check!)'
          : stacking
            ? 'B: a categorical retinal dropped by stacking'
            : 'UNCLASSIFIED';
  byReason.set(reason, [...(byReason.get(reason) ?? []), h]);
}
console.log('\n=== structural classes ===');
for (const [reason, hs] of byReason) console.log(`  [${hs.length}] ${reason}`);
