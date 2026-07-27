// s165 m3 §3.6: measure analyzeVizSpec cost at 10k / 20k / 50k rows with a high-cardinality detail —
// the shape the draft measured at 4.4× s164 (20k) and 2,184 ms (50k). Runs against SRC.
import { analyzeVizSpec } from '../packages/viz-core/src/a11y/data-analysis.js';

function build(rowCount: number, detailCardinality: number) {
  const rows: Record<string, unknown>[] = [];
  const segs = ['A', 'B', 'C'];
  for (let i = 0; i < rowCount; i += 1) {
    rows.push({
      x: i % 400,
      y: 100 + (i % 400) * 3 + (i % 7),
      seg: segs[i % segs.length],
      sz: (i % 4) * 10 + 10,
      dt: i % detailCardinality,
    });
  }
  const encoding: Record<string, unknown> = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'perf', name: 'perf',
    data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
    encoding, a11y: { description: 'y over x' },
  } as never;
}

const cases: [number, number][] = [
  [10_000, 50],
  [10_000, 2_000],
  [20_000, 2_000],
  [50_000, 5_000],
];

for (const [rowCount, card] of cases) {
  const spec = build(rowCount, card);
  analyzeVizSpec(spec); // warm
  const t0 = performance.now();
  const runs = 3;
  for (let i = 0; i < runs; i += 1) analyzeVizSpec(spec);
  const ms = (performance.now() - t0) / runs;
  console.log(`rows=${String(rowCount).padStart(6)} detailCardinality=${String(card).padStart(5)}  ${ms.toFixed(1)} ms  corr=${analyzeVizSpec(spec).correlation}`);
}
