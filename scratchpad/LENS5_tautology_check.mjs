// LENS 5 — hand-simulate design (B)'s classifier-key derivation for arbitrary field sets
// and show the memo's set-equality machine-assert is TAUTOLOGICAL (always true by construction),
// independent of what drawnCellKeyFields / correlationPartitionFields actually return.

const setEq = (a, b) => a.length === b.length && a.every((x) => b.includes(x)) && b.every((x) => a.includes(x));

// design (B) exactly as §2-m1 prescribes:
function deriveB(drawnKeyFields, dim, partitionFields) {
  const valueKey = drawnKeyFields.filter((f) => f !== dim);
  const effectivePartition = partitionFields.filter((f) => valueKey.includes(f));
  const groupingFields = valueKey.filter((f) => !effectivePartition.includes(f));
  const union = [...effectivePartition, ...groupingFields];
  return { valueKey, effectivePartition, groupingFields, assertGreen: setEq(union, valueKey) };
}

// Throw ARBITRARY / even ADVERSARIAL inputs at it — including a "future channel" (opacity),
// a partition field NOT in the drawn key (the stacking corner), garbage, etc.
const cases = [
  ['size fixture', ['x', 'seg', 'sz'], 'x', ['seg']],
  ['facet twin', ['x', 'facetCol', 'sz'], 'x', ['facetCol']],
  ['stacking corner (partition has field value dropped)', ['x'], 'x', ['seg']], // valueKey=[]
  ['FUTURE new channel opacity added to drawnKey only', ['x', 'seg', 'sz', 'opacity'], 'x', ['seg']],
  ['classifier path drifts: partition has a phantom field', ['x', 'seg'], 'x', ['seg', 'ghost']],
  ['garbage', ['a', 'b', 'c', 'd'], 'a', ['q', 'r']],
];

let allGreen = true;
for (const [name, drawnKey, dim, part] of cases) {
  const r = deriveB(drawnKey, dim, part);
  allGreen = allGreen && r.assertGreen;
  console.log(name.padEnd(52), 'assert', r.assertGreen ? 'GREEN' : 'RED',
    '| valueKey', JSON.stringify(r.valueKey),
    'eff', JSON.stringify(r.effectivePartition),
    'grp', JSON.stringify(r.groupingFields));
}
console.log('\nset-equality assert GREEN on EVERY case incl. adversarial drift:', allGreen);
console.log('=> the assert union===valueKey is TAUTOLOGICAL (both carved from valueKey); it can never go RED.');
