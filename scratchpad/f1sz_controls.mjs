import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function run(label, values, sizeChannel) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative', scale: { type: 'linear' } },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
    color: { field: 'seg', trait: 'EncodingColor', type: 'nominal' },
    ...(sizeChannel ? { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative', scale: { type: 'linear' } } } : {}),
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'c', name: 'c',
    data: { name: 'd', values }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc,
    a11y: { description: 'x' } };
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  console.log(`\n[${label}] correlation=${a.correlation}  ::  ${n.summary}`);
}

// CONTROL 1: WITH size, UNEVEN per-x counts (the survivor) -> should be SUPPRESSED if honest
run('uneven+size (SURVIVOR)', [
  { x: 1, y: 100, seg: 'A', sz: 1 },
  { x: 2, y: 90, seg: 'A', sz: 2 }, { x: 2, y: 80, seg: 'A', sz: 3 }, { x: 2, y: 70, seg: 'A', sz: 4 },
  { x: 3, y: 300, seg: 'B', sz: 1 },
  { x: 4, y: 290, seg: 'B', sz: 2 }, { x: 4, y: 280, seg: 'B', sz: 3 }, { x: 4, y: 270, seg: 'B', sz: 4 },
], true);

// CONTROL 2: SAME data, NO size channel. Now drawnCellKeyFields = [seg]; pooled cells == collapsed
// cells (per x,seg sums). The chart draws per-x sums, which genuinely rise -> HONEST to narrate up.
run('uneven, NO size (honest-baseline)', [
  { x: 1, y: 100, seg: 'A' },
  { x: 2, y: 90, seg: 'A' }, { x: 2, y: 80, seg: 'A' }, { x: 2, y: 70, seg: 'A' },
  { x: 3, y: 300, seg: 'B' },
  { x: 4, y: 290, seg: 'B' }, { x: 4, y: 280, seg: 'B' }, { x: 4, y: 270, seg: 'B' },
], false);

// CONTROL 3: WITH size but EVEN per-x counts (1 cell per x). collapse == drawn -> classifier sees
// the true per-color DOWN -> should SUPPRESS. Confirms uneven-count is load-bearing.
run('even+size (should suppress)', [
  { x: 1, y: 100, seg: 'A', sz: 1 }, { x: 2, y: 70, seg: 'A', sz: 2 },
  { x: 3, y: 300, seg: 'B', sz: 1 }, { x: 4, y: 270, seg: 'B', sz: 2 },
], true);
