// s165 m3 §3.6: a STRUCTURAL cost measure that bites deterministically (no wall clock). Each row is a
// Proxy counting property reads. A 2^k row-walk implementation reads O(2^k × rows); bucket-once reads
// O(rows). Measure both so the proof-spec threshold provably separates them.
import { analyzeVizSpec } from '../packages/viz-core/src/a11y/data-analysis.js';

function build(rowCount: number, counter: { n: number }) {
  const rows: unknown[] = [];
  const segs = ['A', 'B', 'C'];
  for (let i = 0; i < rowCount; i += 1) {
    const raw: Record<string, unknown> = {
      x: i % 40,
      y: 100 + (i % 40) * 3 + (i % 7),
      seg: segs[i % segs.length],
      sz: (i % 4) * 10 + 10,
      dt: i % 25,
    };
    rows.push(
      new Proxy(raw, {
        get(target, prop, receiver) {
          if (typeof prop === 'string') counter.n += 1;
          return Reflect.get(target, prop, receiver);
        },
      })
    );
  }
  const encoding: Record<string, unknown> = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
    detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'reads', name: 'reads',
    data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
    encoding, a11y: { description: 'y over x' },
  } as never;
}

for (const rowCount of [500, 1000, 2000]) {
  const counter = { n: 0 };
  const spec = build(rowCount, counter);
  const corr = analyzeVizSpec(spec).correlation;
  console.log(`rows=${String(rowCount).padStart(5)}  row property reads=${String(counter.n).padStart(9)}  reads/row=${(counter.n / rowCount).toFixed(1)}  corr=${corr}`);
}
