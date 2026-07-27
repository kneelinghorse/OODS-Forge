import { analyzeVizSpec, correlationSeparabilityEvidence, correlationOppositionEvidence, correlationGateFields } from '../packages/viz-core/src/a11y/data-analysis.js';
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const values = [
  { x: 1, y: 10, seg: 'A', sz: 10 }, { x: 2, y: 20, seg: 'A', sz: 10 },
  { x: 1, y: 300, seg: 'A', sz: 20 },
  { x: 1, y: 10, seg: 'B', sz: 10 }, { x: 2, y: 200, seg: 'B', sz: 10 }, { x: 3, y: 400, seg: 'B', sz: 10 },
];
const spec = { $schema:'https://oods.dev/viz-spec/v1', id:'r2', name:'r2', data:{name:'d',values},
  marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'d'} } as any;
console.log('gate  =', JSON.stringify(correlationGateFields(spec)));
console.log('corr  =', analyzeVizSpec(spec).correlation);
const g1p = correlationSeparabilityEvidence(spec), g1 = correlationOppositionEvidence(spec);
console.log("G1'   =", JSON.stringify(g1p));
console.log('G1_164=', JSON.stringify({votes:g1.votes, sharesPooled:g1.sharesPooled, anyVotable:g1.anyVotable, pooledSign:g1.pooledSign, suppresses:g1.suppresses}));
