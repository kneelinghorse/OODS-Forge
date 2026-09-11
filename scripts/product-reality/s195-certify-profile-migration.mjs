import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'artifacts/product-reality/sprint-195/m04/certify');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const before = read('before.json');
const after = read('after.json');
const changes = [];
const addedRules = { force_graph: ['OODS-V173'], bubble_map: ['OODS-V168', 'OODS-V169', 'OODS-V170'], flow_map: ['OODS-V171', 'OODS-V172'] };
const diff = (a, b, prefix = '') => {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(key => diff(a[key], b[key], prefix ? `${prefix}.${key}` : key));
  }
  return [{ path: prefix, before: a ?? null, after: b ?? null }];
};
assert.equal(before.rows.length, 8);
assert.equal(after.rows.length, 8);
for (const previous of before.rows) {
  const current = after.rows.find(row => row.chartType === previous.chartType);
  assert.ok(current);
  const type = current.chartType;
  assert.deepEqual(current.input, previous.input, `${type}: source input moved`);
  assert.equal(previous.operand.coverage, 'uncertified');
  assert.equal(previous.operand.conformant, null);
  assert.equal(current.operand.coverage, 'certified');
  assert.equal(current.operand.conformant, type !== 'bubble_map');
  assert.equal(current.operand.pillars.a11yEquivalence, 'pass');
  assert.equal(current.operand.pillars.accuracy, type === 'bubble_map' ? 'fail' : 'pass');
  assert.deepEqual(current.operand.determinism, previous.operand.determinism, `${type}: option/render hash moved`);
  assert.deepEqual(current.operand.a11yNotApplicable, previous.operand.a11yNotApplicable, `${type}: N/A moved`);
  assert.deepEqual(current.operand.findings.filter(f => f.code.startsWith('OODS-A11Y-')), previous.operand.findings);
  assert.equal(current.operand.accuracySummary.failing, type === 'bubble_map' ? 1 : 0);
  if (addedRules[type]) {
    assert.deepEqual(current.operand.accuracyRules, addedRules[type]);
    assert.equal(current.operand.accuracySummary.rulesEvaluated, addedRules[type].length);
    assert.equal(previous.operand.accuracySummary.rulesEvaluated, 0);
  } else assert.deepEqual(current.operand.accuracySummary, previous.operand.accuracySummary);
  assert.deepEqual(current.operand.notes.slice(1), previous.operand.notes.slice(1).filter(note => !note.startsWith('No accuracy rule is offered for')));
  assert.match(current.operand.notes[0], /The declared operand profile grades/);
  const operandChanges = diff(previous.operand, current.operand);
  const allowed = new Set(['coverage', 'conformant', 'pillars.a11yEquivalence', 'notes']);
  if (addedRules[type]) ['accuracyRules', 'accuracySummary.rulesEvaluated', 'pillars.accuracy'].forEach(key => allowed.add(key));
  if (type === 'bubble_map') ['accuracySummary.failing', 'findings'].forEach(key => allowed.add(key));
  assert.deepEqual(operandChanges.filter(change => !allowed.has(change.path)), [], `${type}: undeclared operand mover`);

  assert.equal(current.specOnly.coverage, 'uncertified');
  assert.equal(current.specOnly.conformant, null);
  assert.deepEqual(current.specOnly.pillars, previous.specOnly.pillars);
  assert.deepEqual(current.specOnly.notes.slice(1), previous.specOnly.notes.slice(1));
  assert.match(current.specOnly.notes[0], /Without the `data` operand there is nothing to evaluate/);
  assert.deepEqual(current.specOnly.accuracyRules, current.operand.accuracyRules);
  const specOnlyChanges = diff(previous.specOnly, current.specOnly);
  assert.deepEqual(specOnlyChanges.filter(change => change.path !== 'notes' && !(addedRules[type] && change.path === 'accuracyRules')), [], `${type}: undeclared spec-only mover`);
  changes.push({ chartType: type, sourceInputsUnchanged: true, optionAndRenderHashesUnchanged: true, a11yFindingsAndNotApplicableUnchanged: true, operandChanges, specOnlyChanges });
}
const receipt = {
  baseline: { file: 'before.json', buildRevision: before.buildRevision, provenance: 'Captured before m04 source edits from the retained final m03 dist. The dist revision predates the m03 commit; it is an observed compiled baseline, not a claim of a fresh a10afdff build.' },
  current: { file: 'after.json', buildRevision: after.buildRevision },
  interpretation: 'The memo conjunction contrast not fail retains the existing fault guard: contrast ungradeable is attempted evaluation that faulted and cannot pass. A positive sankey control plus a thrown contrast evaluator records certified/false/ungradeable in boundary/contrast-fault.json. Exempt and explicitly limited geometry-free bubble option proof retain their established semantics.',
  historicalGoldenPolicy: 's172-certify-spec-only-baseline.json and s179-certify-operand-baseline.json remain untouched. The regression tests explicitly project only the declared profile, new rule set, actual bubble V169 and path-specific note movers over those immutable baselines.',
  counts: { operandTypes: 8, certified: 8, conformant: 7, nonconformant: 1, specOnlyUncertifiedNull: 8, unchangedOptionAndRenderHashes: 8 },
  changes,
};
fs.writeFileSync(path.join(directory, 'migration.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt.counts, null, 2));
