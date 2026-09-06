import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  allowedReviewEvidence, assertEvidenceOnlyHeadChanges, assertUniqueExecutions,
  classifyFailure, compareFilePopulations, deriveSuiteAccounting, projectVitest,
} from '../../../../scripts/product-reality/s185-suite-accounting.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const fixtureRoot = '/captured-worktree';
function report(files: Array<{ name: string; statuses: string[]; names?: string[] }>) {
  const statuses = files.flatMap(file => file.statuses);
  return {
    success: !statuses.includes('failed'), numTotalTests: statuses.length,
    numPassedTests: statuses.filter(status => status === 'passed').length,
    numFailedTests: statuses.filter(status => status === 'failed').length,
    numPendingTests: statuses.filter(status => status === 'pending').length,
    numTodoTests: statuses.filter(status => status === 'todo').length,
    testResults: files.map(file => ({ name: `${fixtureRoot}/${file.name}`,
      status: file.statuses.includes('failed') ? 'failed' : 'passed', message: '',
      assertionResults: file.statuses.map((status, index) => ({ fullName: file.names?.[index] ?? `test ${index}`, status,
        failureMessages: status === 'failed' ? ['Observed failure, retained verbatim.'] : [] })),
    })),
  };
}

describe('Sprint 185 four-suite accounting counts executions and explains population movement', () => {
  it('rederives passes, failures, inherited skips and todos from actual assertion rows', () => {
    const result = projectVitest(report([{ name: 'tests/a.spec.ts', statuses: ['passed', 'failed', 'pending', 'todo'] }]), fixtureRoot);
    expect(result.tests).toEqual({ total: 4, passed: 1, failed: 1, skipped: 1, todo: 1 });
    expect(result.success).toBe(false);
    expect(result.files[0].assertions.find(row => row.status === 'failed')!.failureMessages).toEqual(['Observed failure, retained verbatim.']);
  });

  it('rejects inconsistent headline counts and duplicate file executions', () => {
    const raw = report([{ name: 'tests/a.spec.ts', statuses: ['passed'] }]); raw.numPassedTests = 100;
    expect(() => projectVitest(raw, fixtureRoot)).toThrow(/headline differs/);
    expect(() => projectVitest(report([{ name: 'tests/a.spec.ts', statuses: [] }, { name: 'tests/a.spec.ts', statuses: [] }]), fixtureRoot)).toThrow(/Duplicate test-file/);
  });

  it('reports both added and removed files even when their assertion totals cancel', () => {
    const before = projectVitest(report([{ name: 'tests/removed.spec.ts', statuses: ['passed'] }]), fixtureRoot);
    const after = projectVitest(report([{ name: 'tests/added.spec.ts', statuses: ['passed'] }]), fixtureRoot);
    expect(compareFilePopulations(before.files, after.files).map(row => ({ file: row.file, kind: row.kind }))).toEqual([
      { file: 'tests/added.spec.ts', kind: 'added-file' }, { file: 'tests/removed.spec.ts', kind: 'removed-or-excluded-file' },
    ]);
  });

  it('accounts for added and removed assertions inside the same still-executed file', () => {
    const before = projectVitest(report([{ name: 'tests/a.spec.ts', statuses: ['passed', 'passed'], names: ['retained', 'removed'] }]), fixtureRoot);
    const after = projectVitest(report([{ name: 'tests/a.spec.ts', statuses: ['passed', 'passed'], names: ['retained', 'added'] }]), fixtureRoot);
    expect(compareFilePopulations(before.files, after.files)[0]).toMatchObject({
      kind: 'changed-file-observations', addedAssertions: ['added#0'], removedAssertions: ['removed#0'],
    });
  });

  it('keeps outcome movement and prior failure messages separate from assertion membership changes', () => {
    const before = projectVitest(report([{ name: 'tests/a.spec.ts', statuses: ['failed'] }]), fixtureRoot);
    const after = projectVitest(report([{ name: 'tests/a.spec.ts', statuses: ['passed'] }]), fixtureRoot);
    expect(compareFilePopulations(before.files, after.files)[0]).toMatchObject({ addedAssertions: [], removedAssertions: [],
      changedStatuses: [{ key: 'test 0#0', before: 'failed', after: 'passed', beforeFailureMessages: ['Observed failure, retained verbatim.'] }] });
  });

  it('rejects a repeated receipt and a copied raw execution relabeled as another run', () => {
    expect(() => assertUniqueExecutions([{ id: 'run-1' }, { id: 'run-1' }])).toThrow(/more than one row/);
    expect(() => assertUniqueExecutions([{ id: 'run-1', rawReport: { sha256: 'same' } }, { id: 'run-2', rawReport: { sha256: 'same' } }])).toThrow(/relabeled/);
    expect(() => assertUniqueExecutions([{ id: 'run-1', rawReport: { sha256: 'first' } }, { id: 'run-2', rawReport: { sha256: 'second' } }])).not.toThrow();
  });

  it('requires a matching retained failure and a specific named disposition to validate accounting for an inherited red', () => {
    const failure = { suite: 'root-core', file: 'tests/compiler.spec.ts', testKey: 'compiler#0',
      executionId: 'closeout:1', workspace: '/new-checkout', messages: ['Error: Test timed out in 20000ms.\n    at /new-checkout/tests/compiler.spec.ts:10:2'] };
    const previous = { ...failure, workspace: '/old-checkout', messages: ['Error: Test timed out in 20000ms.\n    at /old-checkout/tests/compiler.spec.ts:5:2'],
      receiptPath: 'artifacts/retained-root-core.json' };
    const disposition = { suite: failure.suite, file: failure.file, testKey: failure.testKey,
      baselineReceipt: previous.receiptPath, reason: 'The same timed-out assertion was measured on the named earlier host/run; this receipt remains failed.' };
    expect(classifyFailure(failure, [previous], [disposition]).status).toBe('inherited-failure-disclosed');
    expect(classifyFailure(failure, [previous], []).status).toBe('unexplained-failure');
    expect(classifyFailure({ ...failure, messages: ['AssertionError: wrong rendered content'] }, [previous], [disposition]).status).toBe('unexplained-failure');
    expect(classifyFailure(failure, [previous], [{ ...disposition, baselineReceipt: 'invented-receipt' }]).status).toBe('unexplained-failure');
    expect(classifyFailure({ ...failure, messages: [] }, [{ ...previous, messages: [] }], [disposition]).status).toBe('unexplained-failure');
  });

  it('permits only newly captured receipts and named derived outputs after the execution head', () => {
    const log = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout/run-1/root-core.log';
    const dispositions = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout/failure-dispositions.json';
    expect(allowedReviewEvidence(log)).toBe(true);
    expect(allowedReviewEvidence(dispositions)).toBe(true);
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: dispositions }])).not.toThrow();
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: log }])).not.toThrow();
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'M', path: log }])).toThrow(/pre-existing evidence/);
    for (const file of ['packages/component-contracts/registry/component-capability-baseline.v1.json', 'vitest.config.ts',
      'artifacts/product-reality/sprint-185/m05/fixture.json',
      'artifacts/product-reality/sprint-185/m05/four-suite-closeout/manifest.json',
      'artifacts/product-reality/sprint-185/m05/four-suite-closeout/run-1/generated.tsx',
      'artifacts/product-reality/sprint-185/m05/four-suite-closeout/run-1/source.patch']) {
      expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: file }])).toThrow(/executable input/);
    }
  });

  it('preserves the actual m01-after root-core reds and 38 skips instead of describing that baseline as green', () => {
    const directory = 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after';
    const aggregate = JSON.parse(readFileSync(path.join(root, directory, 'four-suite-baseline.json'), 'utf8'));
    expect(aggregate.status).toBe('failed');
    const observations = [1, 2].map(run => projectVitest(JSON.parse(readFileSync(path.join(root, directory, `run-${run}/root-core.vitest.json`), 'utf8')), aggregate.workspace));
    expect(observations.map(row => ({ success: row.success, ...row.tests }))).toEqual([
      { success: false, total: 5581, passed: 5538, failed: 5, skipped: 38, todo: 0 },
      { success: false, total: 5669, passed: 5629, failed: 2, skipped: 38, todo: 0 },
    ]);
  });

  it('cannot reuse an old baseline execution as the newly measured closeout run', () => {
    expect(() => deriveSuiteAccounting({ root, executionHead: '40a9fe2085259a9160125a36fb39a976bedef982',
      reviewHead: '40a9fe2085259a9160125a36fb39a976bedef982',
      capturePath: 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after/four-suite-baseline.json' })).toThrow(/relabeled/);
  });
});
