import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  allowedReviewEvidence, assertEvidenceOnlyHeadChanges, assertUniqueExecutions,
  classifyFailure, compareFilePopulations, deriveSuiteAccounting, extractRawLogFailure, projectVitest,
  observeUnhandledErrors, resolveFailureEvidence, retainedCaptureReference,
  SUITES,
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
    expect(result.files[0].assertions.find((row: { status: string }) => row.status === 'failed')!.failureMessages).toEqual(['Observed failure, retained verbatim.']);
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
    const previous = { ...failure, cohort: 'before', workspace: '/old-checkout', messages: ['Error: Test timed out in 20000ms.\n    at /old-checkout/tests/compiler.spec.ts:5:2'],
      receiptPath: 'artifacts/retained-root-core.json' };
    const disposition = { suite: failure.suite, file: failure.file, testKey: failure.testKey,
      baselineReceipt: previous.receiptPath, reason: 'The same timed-out assertion was measured on the named earlier host/run; this receipt remains failed.' };
    expect(classifyFailure(failure, [previous], [disposition]).status).toBe('inherited-failure-disclosed');
    expect(classifyFailure(failure, [previous], []).status).toBe('unexplained-failure');
    expect(classifyFailure({ ...failure, messages: ['AssertionError: wrong rendered content'] }, [previous], [disposition]).status).toBe('unexplained-failure');
    expect(classifyFailure(failure, [previous], [{ ...disposition, baselineReceipt: 'invented-receipt' }]).status).toBe('unexplained-failure');
    expect(classifyFailure({ ...failure, messages: [] }, [{ ...previous, messages: [] }], [disposition]).status).toBe('unexplained-failure');
    expect(classifyFailure({ ...failure, messages: ['Error'] }, [{ ...previous, messages: ['Error'] }], [disposition]).status).toBe('unexplained-failure');
    expect(classifyFailure(failure, [{ ...previous, cohort: 'closeout-attempt-1' }], [disposition]).status).toBe('unexplained-failure');
  });

  it('uses one exact raw-log cause only when the original JSON cause is empty or a generic placeholder', () => {
    const failure = { suite: 'mcp-server', file: 'packages/mcp-server/test/compiler.spec.ts',
      testKey: 'compiler Vue#0', caption: 'compiler > Vue', workspace: fixtureRoot,
      messages: ['Error: STACK_TRACE_ERROR\n    at /captured-worktree/test/compiler.spec.ts:1:1'] };
    const text = ' FAIL  test/compiler.spec.ts > compiler > Vue\nError: Test timed out in 120000ms.\n ❯ test/compiler.spec.ts:1:1\n⎯⎯⎯[1/1]⎯\n';
    const log = { path: 'retained/mcp-server.log', sha256: 'retained-log-sha' };
    expect(resolveFailureEvidence(failure, { text, log })).toMatchObject({ source: 'raw-log', log,
      matchedHeaderLine: 1, startLine: 1, bodyStartLine: 2, endLine: 3, cause: 'Error: Test timed out in 120000ms.',
      text: ' FAIL  test/compiler.spec.ts > compiler > Vue\nError: Test timed out in 120000ms.\n ❯ test/compiler.spec.ts:1:1' });
    expect(failure.messages).toEqual(['Error: STACK_TRACE_ERROR\n    at /captured-worktree/test/compiler.spec.ts:1:1']);
    expect(resolveFailureEvidence({ ...failure, messages: ['TypeError: meaningful JSON cause'] }, { text, log })).toEqual({ source: 'vitest-json' });
    const previous = { ...failure, cohort: 'after', receiptPath: 'baseline.json' };
    const disposition = { suite: failure.suite, file: failure.file, testKey: failure.testKey, baselineReceipt: 'baseline.json', reason: 'Exact retained timeout cause; both executions remain failed.' };
    expect(classifyFailure(failure, [previous], [disposition]).status).toBe('unexplained-failure');
    const observed = { ...failure, evidence: resolveFailureEvidence(failure, { text, log }) };
    expect(classifyFailure(observed, [{ ...previous, evidence: observed.evidence }], [disposition]).status).toBe('inherited-failure-disclosed');
    const different = resolveFailureEvidence(previous, { text: text.replace('120000ms', '20000ms'), log });
    expect(classifyFailure(observed, [{ ...previous, evidence: different }], [disposition]).status).toBe('unexplained-failure');
  });

  it('refuses wrong suites, files, captions, repeated sections and duplicate parameterized assertion captions', () => {
    const input = { suite: 'root-core', file: 'tests/compiler.spec.ts', testKey: 'compiler Vue#0', caption: 'compiler > Vue',
      text: ' FAIL  |core| tests/compiler.spec.ts > compiler > Vue\nError: Test timed out in 20000ms.\n⎯⎯⎯[1/1]⎯\n' };
    expect(extractRawLogFailure(input).status).toBe('resolved');
    for (const changed of [{ suite: 'mcp-server' }, { file: 'tests/other.spec.ts' }, { caption: 'compiler > React' },
      { text: input.text.replace('|core|', '|a11y|') }, { text: input.text.replace('Error: Test timed out in 20000ms.', 'Error: STACK_TRACE_ERROR') },
      { text: input.text + input.text }, { captionOccurrences: 2 }]) {
      expect(extractRawLogFailure({ ...input, ...changed }), JSON.stringify(changed)).toMatchObject({ status: 'unresolved' });
    }
  });

  it('matches declared setup scopes and collection headers without borrowing an assertion failure from the same file', () => {
    const input = { suite: 'root-core', file: 'tests/state.spec.ts', testKey: null,
      text: ' FAIL  |core| tests/state.spec.ts > state axis\nError: runtime build failed\n    at buildRuntime tests/state.spec.ts:1:1\n⎯⎯⎯[1/1]⎯\n' };
    expect(extractRawLogFailure({ ...input, scopeCaptions: ['state axis'] })).toMatchObject({ status: 'resolved', cause: 'Error: runtime build failed' });
    expect(extractRawLogFailure(input).status).toBe('unresolved');
    expect(extractRawLogFailure({ ...input, scopeCaptions: ['state axis'], text: input.text.replace(' > state axis', ' > state axis > renders') }).status).toBe('unresolved');
    expect(extractRawLogFailure({ ...input, text: input.text.replace(' > state axis', ' [ tests/state.spec.ts ]') }).status).toBe('resolved');
  });

  it('handles consecutive exact failure captions sharing a reporter body while retaining the original section', () => {
    const text = ' FAIL  test/rows.spec.ts > readiness > React\n FAIL  test/rows.spec.ts > readiness > Vue\nAssertionError: row omitted\n⎯⎯⎯[1/2]⎯\n';
    const result = extractRawLogFailure({ text, suite: 'mcp-server', file: 'packages/mcp-server/test/rows.spec.ts', testKey: 'readiness Vue#0', caption: 'readiness > Vue' });
    expect(result).toMatchObject({ status: 'resolved', matchedHeaderLine: 2, startLine: 1, bodyStartLine: 3, cause: 'AssertionError: row omitted' });
    expect(result).toMatchObject({ text: expect.stringContaining('readiness > React\n FAIL') });
  });

  it('recovers the measured initial Vue timeout from its exact retained section and rejects its generic JSON as a cause', () => {
    const directory = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout-attempt-1';
    const aggregate = JSON.parse(readFileSync(path.join(root, directory, 'four-suite-baseline.json'), 'utf8'));
    const projected = projectVitest(JSON.parse(readFileSync(path.join(root, directory, 'run-1/mcp-server.vitest.json'), 'utf8')), aggregate.workspace);
    const file = projected.files.find((row: { path: string }) => row.path.endsWith('/typed-action-protocol.s183.spec.ts'))!;
    const assertion = file.assertions.find((row: { name: string }) => row.name.endsWith('Vue TypeScript rejects each individually omitted domain action'))!;
    const evidence = resolveFailureEvidence({ suite: 'mcp-server', file: file.path, testKey: assertion.key,
      caption: assertion.caption, messages: assertion.failureMessages, workspace: aggregate.workspace }, {
      text: readFileSync(path.join(root, directory, 'run-1/mcp-server.log'), 'utf8'),
      log: { path: `${directory}/run-1/mcp-server.log` }, captionOccurrences: file.assertions.filter((row: { caption: string }) => row.caption === assertion.caption).length,
    });
    expect(evidence).toMatchObject({ source: 'raw-log', cause: expect.stringContaining('Error: Test timed out in 120000ms.') });
    expect(evidence).not.toEqual(expect.objectContaining({ cause: expect.stringContaining('ETIMEDOUT') }));
    expect(assertion.failureMessages.join('\n')).toContain('STACK_TRACE_ERROR');
  });

  it('recovers the historical state-axis setup failure without relabeling its pending assertions as executed', () => {
    const directory = 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after';
    const aggregate = JSON.parse(readFileSync(path.join(root, directory, 'four-suite-baseline.json'), 'utf8'));
    const projected = projectVitest(JSON.parse(readFileSync(path.join(root, directory, 'run-1/root-core.vitest.json'), 'utf8')), aggregate.workspace);
    const file = projected.files.find((row: { path: string }) => row.path.endsWith('/state-axis.s184.spec.ts'))!;
    expect(file.assertions.every((row: { status: string }) => row.status === 'skipped')).toBe(true);
    expect(file.collectionMessage).toBe('');
    const evidence = resolveFailureEvidence({ suite: 'root-core', file: file.path, testKey: null,
      messages: [file.collectionMessage, ...file.failureMessages].filter(Boolean), workspace: aggregate.workspace }, {
      text: readFileSync(path.join(root, directory, 'run-1/root-core.log'), 'utf8'), log: { path: `${directory}/run-1/root-core.log` },
      scopeCaptions: file.assertions.flatMap((row: { ancestorTitles: string[] }) => row.ancestorTitles),
    });
    expect(evidence).toMatchObject({ source: 'raw-log', caption: 'Sprint 184 m05 workflow state axis',
      cause: expect.stringContaining('Error: react state runtime failed to build:') });
    expect(evidence).toMatchObject({ cause: expect.stringContaining("open '@oods/tokens/css'") });
  });

  it('maps the retained initial attempt references explicitly without rewriting them or admitting them after the final execution head', () => {
    const aggregatePath = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout-attempt-1/four-suite-baseline.json';
    const original = 'four-suite-closeout/run-1/mcp-server.log';
    const retained = retainedCaptureReference(aggregatePath, original, 'four-suite-closeout');
    expect(retained).toBe('artifacts/product-reality/sprint-185/m05/four-suite-closeout-attempt-1/run-1/mcp-server.log');
    expect(allowedReviewEvidence(retained)).toBe(false);
    expect(() => retainedCaptureReference(aggregatePath, 'another-capture/run-1/mcp-server.log', 'four-suite-closeout')).toThrow(/original root/);
    expect(() => retainedCaptureReference(aggregatePath, 'four-suite-closeout/../source.ts', 'four-suite-closeout')).toThrow(/Invalid captured/);
  });

  it('blocks final unhandled errors independently of assertion dispositions and retains historical sections without hiding their counts', () => {
    const text = '⎯⎯⎯ Unhandled Errors ⎯⎯⎯\n\nVitest caught 1 unhandled error during the test run.\nError: worker stopped\n\n Test Files  1 failed\n';
    const log = { path: 'retained/root-core.log', sha256: 'exact-log-sha' };
    expect(observeUnhandledErrors(text, { cohort: 'closeout', log })).toMatchObject({ count: 1, blocking: true, log,
      sections: [{ reportedCount: 1, summaryLine: 3, startLine: 1, endLine: 5, text: expect.stringContaining('Error: worker stopped') }] });
    expect(observeUnhandledErrors(text, { cohort: 'before', log })).toMatchObject({ count: 1, blocking: false });
    expect(observeUnhandledErrors(text, { cohort: 'closeout-attempt-1', log })).toMatchObject({ count: 1, blocking: false });
    expect(observeUnhandledErrors('All tests passed.\n', { cohort: 'closeout', log })).toMatchObject({ count: 0, blocking: false, sections: [] });
    expect(observeUnhandledErrors(text + text, { cohort: 'closeout', log })).toMatchObject({ count: null, blocking: true });
    const historical = readFileSync(path.join(root, 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after/run-1/root-core.log'), 'utf8');
    expect(observeUnhandledErrors(historical, { cohort: 'after', log })).toMatchObject({ count: 2, blocking: false });
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

  it('derives valid accounting across primary baselines, an immutable failed initial attempt and one distinct final four-suite capture', () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 's185-suite-accounting-fixture-'));
    const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=Accounting Fixture',
      '-c', 'user.email=accounting-fixture@example.invalid', ...args], { cwd: fixture, encoding: 'utf8' }).trim();
    const bytes = (file: string, content: string) => {
      mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true });
      writeFileSync(path.join(fixture, file), content);
      return { path: file, sha256: createHash('sha256').update(content).digest('hex') };
    };
    const json = (file: string, value: unknown) => bytes(file, `${JSON.stringify(value, null, 2)}\n`);
    const sourcePath = (suite: string) => suite === 'root-core' ? 'tests/fixture.spec.ts' : `packages/${suite}/test/fixture.spec.ts`;
    const evidence = 'artifacts/product-reality/sprint-185';
    let sequence = 0;
    const capture = (directory: string, cohort: string, measuredHead: string, originalRoot = path.basename(directory)) => {
      const suites = SUITES.map(suite => {
        const failed = cohort === 'initial' && suite === 'mcp-server';
        const file = sourcePath(suite);
        const raw = { ...report([{ name: file, statuses: [failed ? 'failed' : 'passed'], names: [`${suite} fixture assertion`] }]), fixtureExecution: `${cohort}:${suite}` };
        raw.testResults[0].name = path.join(fixture, file);
        const projection = projectVitest(raw, fixture);
        json(`${directory}/run-1/${suite}.vitest.json`, raw);
        const log = bytes(`${directory}/run-1/${suite}.log`, `${cohort}/${suite}: synthetic unit fixture; no real suite execution.\n`);
        const observedFile = projection.files[0];
        const receipt = { suite, measuredHead, startedAt: `2026-01-01T00:00:${String(sequence++).padStart(2, '0')}.000Z`,
          endedAt: '2026-01-01T00:01:00.000Z', exitCode: failed ? 1 : 0, status: failed ? 'failed' : 'passed',
          cleanBefore: { clean: true }, cleanAfter: { clean: true },
          log: { ...log, path: `${originalRoot}/run-1/${suite}.log` }, retainedReport: `${originalRoot}/run-1/${suite}.vitest.json`,
          vitest: { success: projection.success, tests: projection.tests, files: projection.fileCounts,
            fileResults: [{ path: file, status: observedFile.status, tests: observedFile.tests }] } };
        const retained = json(`${directory}/run-1/${suite}.json`, receipt);
        return { ...receipt, receipt: { ...retained, path: `${originalRoot}/run-1/${suite}.json` } };
      });
      json(`${directory}/four-suite-baseline.json`, { measuredHead, workspace: fixture, captureLabel: cohort,
        status: cohort === 'initial' ? 'failed' : 'passed', suiteSelection: 'all', namedRetry: cohort === 'final',
        host: { hostname: 'synthetic-unit-fixture', node: 'fixture', vitest: 'fixture' }, setup: [],
        cleanBeforeSetup: { clean: true }, cleanAfterSetup: { clean: true },
        runs: [{ run: 1, cleanBefore: { clean: true }, cleanAfter: { clean: true }, suites }] });
    };
    try {
      git('init', '--quiet');
      for (const suite of SUITES) bytes(sourcePath(suite), 'export {};\n');
      git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic unchanged executable input');
      const baselineHead = git('rev-parse', 'HEAD');
      capture(`${evidence}/m01/four-suite-baseline-before`, 'before', baselineHead);
      capture(`${evidence}/m01/four-suite-baseline-after`, 'after', baselineHead);
      capture(`${evidence}/m05/four-suite-closeout-attempt-1`, 'initial', baselineHead, 'four-suite-closeout');
      git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic retained baselines and failed initial capture');
      const executionHead = git('rev-parse', 'HEAD');
      capture(`${evidence}/m05/four-suite-closeout`, 'final', executionHead);
      git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic final capture evidence only');
      const reviewHead = git('rev-parse', 'HEAD');
      const result = deriveSuiteAccounting({ root: fixture, executionHead, reviewHead });
      expect(result).toMatchObject({ status: 'passed', executionHead, reviewHead, validationIssues: [], unattributedDeltas: [],
        closeoutFailures: [], headRelation: { ancestor: true, executableInputsUnchanged: true } });
      expect(result.executions).toHaveLength(SUITES.length * 4);
      expect(new Set(result.executions.map((row: { id: string }) => row.id)).size).toBe(result.executions.length);
      expect(result.comparisons).toHaveLength(SUITES.length * 2);
      expect(result.comparisons.every((row: { afterExecutionId: string }) => row.afterExecutionId.startsWith('closeout:'))).toBe(true);
      expect(result.closeoutAttempts).toMatchObject([{ name: 'initial-failed-closeout', status: 'failed', measuredHead: baselineHead }]);
      const initial = result.executions.filter((row: { cohort: string }) => row.cohort === 'closeout-attempt-1');
      expect(initial).toHaveLength(SUITES.length);
      expect(initial.every((row: { log: { path: string }; rawReport: { path: string } }) => row.log.path.includes('/four-suite-closeout-attempt-1/') && row.rawReport.path.includes('/four-suite-closeout-attempt-1/'))).toBe(true);
      expect(initial.filter((row: { status: string }) => row.status === 'failed')).toHaveLength(1);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it('cannot reuse an old baseline execution as the newly measured closeout run', () => {
    expect(() => deriveSuiteAccounting({ root, executionHead: '40a9fe2085259a9160125a36fb39a976bedef982',
      reviewHead: '40a9fe2085259a9160125a36fb39a976bedef982',
      capturePath: 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after/four-suite-baseline.json' })).toThrow(/relabeled/);
  });
});
