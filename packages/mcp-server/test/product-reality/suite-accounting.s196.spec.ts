import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertEvidenceOnlyHeadChanges, deriveSuiteAccounting, projectVitest,
  S192_SUITES, S196_SUITES, parseAccountingChanges, readAccountingChanges, validateCloseoutCaptureLimit,
} from '../../../../scripts/product-reality/s185-suite-accounting.mjs';

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const sha = (value: string) => createHash('sha256').update(value).digest('hex');
const base = 'artifacts/product-reality/sprint-196/m07';
const captureDirectory = `${base}/five-suite-closeout`;
const historicalMigration = 'artifacts/product-reality/sprint-196/m05/golden-migration/golden-attribution.json';

// These are explicitly synthetic accounting fixtures, never campaign receipts.
function fixture(options: { attempt?: boolean; finalFailure?: boolean; finalTimeout?: boolean; missingSuite?: boolean; duplicateSuite?: boolean; runs?: number; unicode?: boolean } = {}) {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), 's196-accounting-fixture-')));
  roots.push(root);
  const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=Accounting Fixture',
    '-c', 'user.email=accounting-fixture@example.invalid', ...args], { cwd: root, encoding: 'utf8' }).trim();
  const bytes = (file: string, content: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
    return { path: file, sha256: sha(content) };
  };
  const json = (file: string, value: unknown) => bytes(file, JSON.stringify(value, null, 2) + '\n');
  const testPath = (suite: string) => suite === 'root-core' ? 'tests/fixture.spec.ts' : `packages/${suite}/test/${options.unicode && suite === 'mcp-server' ? 'épreuve — Ω\t' : 'fixture'}.spec.ts`;
  let sequence = 0;
  const capture = (directory: string, cohort: string, measuredHead: string, failed: boolean, sprintId: string) => {
    const originalRoot = path.basename(directory);
    let suites = S192_SUITES.map(suite => {
      const statuses = [failed && suite === 'mcp-server' ? 'failed' : 'passed', 'pending', ...(options.unicode && cohort === 'final' && suite === 'mcp-server' ? ['passed'] : [])];
      const file = testPath(suite);
      const raw = { fixtureExecution: `${cohort}:${suite}`, success: !statuses.includes('failed'), numTotalTests: statuses.length,
        numPassedTests: statuses.filter(value => value === 'passed').length,
        numFailedTests: statuses.filter(value => value === 'failed').length, numPendingTests: 1, numTodoTests: 0,
        testResults: [{ name: path.join(root, file), status: statuses.includes('failed') ? 'failed' : 'passed',
          assertionResults: statuses.map((status, index) => ({ fullName: `${suite} assertion ${index}`, status,
            failureMessages: status === 'failed' ? [cohort === 'final' && options.finalTimeout
              ? 'Error: Test timed out in 5000ms (synthetic unit fixture)'
              : 'AssertionError: synthetic predicate failure, not an actual campaign run'] : [] })) }] };
      const projection = projectVitest(raw, root);
      json(`${directory}/run-1/${suite}.vitest.json`, raw);
      const log = bytes(`${directory}/run-1/${suite}.log`, `${cohort}/${suite}: synthetic unit fixture; no suite execution.\n`);
      const receipt = { suite, measuredHead, startedAt: `2026-01-01T00:00:${String(sequence++).padStart(2, '0')}.000Z`, endedAt: '2026-01-01T00:01:00.000Z',
        exitCode: raw.success ? 0 : 1, status: raw.success ? 'passed' : 'failed', cleanBefore: { clean: true }, cleanAfter: { clean: true },
        log: { ...log, path: `${originalRoot}/run-1/${suite}.log` }, retainedReport: `${originalRoot}/run-1/${suite}.vitest.json`,
        vitest: { success: projection.success, tests: projection.tests, files: projection.fileCounts,
          fileResults: projection.files.map((row: { status: string; tests: unknown }) => ({ path: file, status: row.status, tests: row.tests })) } };
      const retained = json(`${directory}/run-1/${suite}.json`, receipt);
      return { ...receipt, receipt: { ...retained, path: `${originalRoot}/run-1/${suite}.json` } };
    });
    if (cohort === 'final' && options.missingSuite) suites = suites.filter(row => row.suite !== 'component-packages');
    if (cohort === 'final' && options.duplicateSuite) suites.push(suites[0]!);
    json(`${directory}/four-suite-baseline.json`, { sprintId, missionId: sprintId === 'sprint-195' ? 's195-m07' : 's196-m07',
      measuredHead, workspace: root, captureLabel: cohort, status: failed ? 'failed' : 'passed', suiteSelection: 'all', namedRetry: false,
      host: { hostname: 'synthetic-unit-fixture', node: 'fixture', vitest: 'fixture' }, setup: [],
      cleanBeforeSetup: { clean: true }, cleanAfterSetup: { clean: true },
      runs: Array.from({ length: cohort === 'final' ? options.runs ?? 1 : 1 }, (_, index) => ({ run: index + 1, cleanBefore: { clean: true }, cleanAfter: { clean: true }, suites })) });
  };
  git('init', '--quiet');
  for (const suite of S192_SUITES) bytes(testPath(suite), 'export {};\n');
  bytes('docs/palette.md', 'before palette\n');
  git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic baseline source');
  const baselineHead = git('rev-parse', 'HEAD');
  capture('artifacts/product-reality/sprint-195/m07/five-suite-closeout', 'baseline', baselineHead, false, 'sprint-195');
  const history = json(historicalMigration, { beforeHead: baselineHead, qualificationHead: baselineHead,
    files: [{ file: 'docs/palette.md', beforeSha256: sha('before palette\n'), afterSha256: sha('before palette\n') }] });
  const attemptDirectory = `${base}/five-suite-closeout-attempt-1`;
  if (options.attempt) capture(attemptDirectory, 'initial', baselineHead, true, 'sprint-196');
  bytes(testPath('mcp-server'), 'export {}; // corrected synthetic predicate\n');
  bytes('docs/palette.md', 'final palette documentation\n');
  json(`${base}/golden-attribution.json`, { beforeHead: baselineHead,
    files: [{ file: 'docs/palette.md', beforeSha256: sha('before palette\n'), afterSha256: sha('final palette documentation\n') }] });
  git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic implementation and retained earlier evidence');
  const executionHead = git('rev-parse', 'HEAD');
  capture(captureDirectory, 'final', executionHead, options.finalFailure || options.finalTimeout || false, 'sprint-196');
  let timeoutRerun: string | undefined;
  if (options.finalTimeout) {
    timeoutRerun = `${captureDirectory}/timeout-rerun.json`;
    const rawReport = json(`${captureDirectory}/timeout-rerun.vitest.json`, { success: true, numFailedTests: 0, numPassedTests: 1,
      testResults: [{ name: path.join(root, testPath('mcp-server')), assertionResults: [{ fullName: 'mcp-server assertion 0', status: 'passed' }] }] });
    const log = bytes(`${captureDirectory}/timeout-rerun.log`, 'Synthetic isolated timeout retry; no suite execution.\n');
    json(timeoutRerun, { executionHead, file: testPath('mcp-server'), testKey: 'mcp-server assertion 0#0', attempts: 1, exitCode: 0,
      argv: ['vitest', 'run', testPath('mcp-server'), '-t', 'mcp-server assertion 0'], rawReport, log });
  }
  git('add', '.'); git('commit', '--quiet', '-m', 'Synthetic final capture only');
  const reviewHead = git('rev-parse', 'HEAD');
  const input = { root, executionHead, reviewHead, sprintId: 'sprint-196', missionId: 's196-m07',
    baselinePath: undefined, approvedTimeout: undefined, timeoutRerun, postCaptureDerivation: undefined, captureExtension: undefined,
    attempts: options.attempt ? [{ name: 'retained-initial', path: `${attemptDirectory}/four-suite-baseline.json`, reason: 'Synthetic assertion failure followed by a code correction.' }] : [] };
  return { root, input, baselineHead, history, git, json };
}

describe('Sprint 196 accounting keeps five-suite identities and historical evidence separate', () => {
  it('uses Sprint 195 by default and validates all five final comparisons, skips, and final golden bytes', () => {
    const value = fixture();
    const result = deriveSuiteAccounting(value.input);
    expect(result).toMatchObject({ mission: 's196-m07', kind: 'five-suite-execution-and-delta-accounting', status: 'passed',
      closeoutFailures: [], validationIssues: [], unattributedDeltas: [], builderSelfCertified: false });
    expect(Object.keys(result.baselines)).toEqual(['sprint195Closeout']);
    expect(result.baselines.sprint195Closeout.measuredHead).toBe(value.baselineHead);
    expect(result.executions).toHaveLength(10);
    expect(result.comparisons.map(row => row.suite)).toEqual(S196_SUITES);
    expect(S196_SUITES).toEqual(S192_SUITES);
    expect(result.executions.every(row => row.counts.skipped === 1)).toBe(true);
    expect(result.goldenAttribution.files[0].afterSha256).toBe(sha('final palette documentation\n'));
    expect(sha(readFileSync(path.join(value.root, historicalMigration), 'utf8'))).toBe(value.history.sha256);
    expect(result.references.some(row => row.path === historicalMigration)).toBe(false);
  });

  it('retains one failed initial capture without substituting it into final comparisons', () => {
    const result = deriveSuiteAccounting(fixture({ attempt: true }).input);
    expect(result.status).toBe('passed');
    expect(result.executions).toHaveLength(15);
    expect(result.closeoutAttempts).toMatchObject([{ name: 'retained-initial', status: 'failed' }]);
    expect(result.executions.filter(row => row.cohort === 'closeout-attempt-1' && row.exitCode === 1)).toHaveLength(1);
    expect(result.comparisons.every(row => row.afterExecutionId.startsWith('closeout:'))).toBe(true);
    expect(result.closeoutFailures).toEqual([]);
  });

  it('uses the same Sprint 196 defaults through the CLI and rejects stale derived output', () => {
    const value = fixture();
    const entry = path.join(value.root, 'scripts/product-reality/s185-suite-accounting.mjs');
    mkdirSync(path.dirname(entry), { recursive: true });
    copyFileSync(new URL('../../../../scripts/product-reality/s185-suite-accounting.mjs', import.meta.url), entry);
    const args = ['--sprint', 'sprint-196', '--execution-head', value.input.executionHead, '--review-head', value.input.reviewHead];
    expect(execFileSync(process.execPath, [entry, '--write', ...args], { cwd: value.root, encoding: 'utf8' })).toContain('passed: 10 distinct retained receipts');
    const output = path.join(value.root, base, 'closeout/suite-accounting.json');
    expect(JSON.parse(readFileSync(output, 'utf8')).mission).toBe('s196-m07');
    expect(() => execFileSync(process.execPath, [entry, '--check', ...args], { cwd: value.root, stdio: 'pipe' })).not.toThrow();
    writeFileSync(output, '{}\n');
    expect(() => execFileSync(process.execPath, [entry, '--check', ...args], { cwd: value.root, stdio: 'pipe' })).toThrow();
  });

  it.each([{ missingSuite: true }, { duplicateSuite: true }])('rejects an incomplete or duplicated suite roster: %j', options => {
    expect(() => deriveSuiteAccounting(fixture(options).input)).toThrow(/missing or duplicated/);
  });

  it('does not call a final assertion failure successful accounting', () => {
    const result = deriveSuiteAccounting(fixture({ finalFailure: true }).input);
    expect(result.status).toBe('failed');
    expect(result.closeoutFailures).toMatchObject([{ status: 'unexplained-failure', suite: 'mcp-server' }]);
    expect(result.executions.find(row => row.cohort === 'closeout' && row.suite === 'mcp-server')?.exitCode).toBe(1);
  });

  it('accepts only one retained isolated timeout retry without erasing the failed original execution', () => {
    const value = fixture({ finalTimeout: true });
    const result = deriveSuiteAccounting(value.input);
    expect(result.status).toBe('passed');
    expect(result.closeoutFailures).toMatchObject([{ status: 'isolated-timeout-disclosed', suite: 'mcp-server' }]);
    expect(result.executions.find(row => row.cohort === 'closeout' && row.suite === 'mcp-server')?.exitCode).toBe(1);
    expect(deriveSuiteAccounting({ ...value.input, timeoutRerun: undefined }).status).toBe('failed');
    const retained = JSON.parse(readFileSync(path.join(value.root, value.input.timeoutRerun!), 'utf8'));
    value.json(value.input.timeoutRerun!, { ...retained, attempts: 2 });
    expect(() => deriveSuiteAccounting(value.input)).toThrow();
    value.json(value.input.timeoutRerun!, { ...retained, executionHead: value.baselineHead });
    expect(() => deriveSuiteAccounting(value.input)).toThrow();
    value.json(value.input.timeoutRerun!, retained);
    writeFileSync(path.join(value.root, retained.rawReport.path), '{}\n');
    expect(() => deriveSuiteAccounting(value.input)).toThrow();
  });

  it('requires one final run and no third attempt or borrowed historical exception', () => {
    expect(() => deriveSuiteAccounting(fixture({ runs: 2 }).input)).toThrow(/exactly one full run/);
    const input = { sprintId: 'sprint-196', closeout: { runs: [{}] }, attempts: [{}], extension: undefined };
    expect(validateCloseoutCaptureLimit(input)).toBeUndefined();
    expect(() => validateCloseoutCaptureLimit({ ...input, attempts: [{}, {}] })).toThrow(/Decision 1833/);
    expect(() => validateCloseoutCaptureLimit({ ...input, extension: { decisionId: 1911 } })).toThrow();
  });

  it('allows only added closeout/capture/CI evidence after the execution head', () => {
    for (const file of [`${captureDirectory}/run-1/component-packages.vitest.json`, `${base}/closeout/manifest.json`, `${base}/ci/observed.json`,
      `${base}/final-archive/manifest.json`, `${base}/final-archive/SBOM.json`, `${base}/final-archive/forge-runtime.tar.gz.sha256`,
      `${base}/e2e-node20.json`, `${base}/e2e-node24.json`, `${base}/movers/manifest.json`,
      `${base}/movers/commit-diffs/measured.patch`, `${base}/movers/blame/measured.txt`]) {
      expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: file }], 'sprint-196')).not.toThrow();
      for (const status of ['M', 'D']) expect(() => assertEvidenceOnlyHeadChanges([{ status, path: file }], 'sprint-196')).toThrow();
    }
    for (const file of [`${base}/runtime/runtime-cells.v1.json`, `${base}/golden-attribution.json`, historicalMigration,
      'packages/mcp-server/src/tools/health.ts', `${base}/closeout/changed-fixture.ts`, 'artifacts/product-reality/sprint-195/m07/ci/observed.json',
      `${base}/final-archive/forge-runtime.tar.gz`, `${base}/final-archive/changed-fixture.ts`, `${base}/final-archive/runner.mjs`,
      `${base}/e2e-node22.json`, `${base}/e2e-node20.log`, `${base}/other-archive/manifest.json`,
      `${base}/movers/derive-attribution.py`, `${base}/movers/change.ts`, `${base}/movers/runner.mjs`]) {
      expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: file }], 'sprint-196')).toThrow(/executable input/);
    }
  });

  it('rejects a relabeled final execution head or post-capture source edit', () => {
    const value = fixture();
    expect(() => deriveSuiteAccounting({ ...value.input, executionHead: value.baselineHead })).toThrow(/actual capture/);
    writeFileSync(path.join(value.root, 'docs/palette.md'), 'changed after capture\n');
    value.git('add', '.'); value.git('commit', '--quiet', '-m', 'Synthetic forbidden post-capture source edit');
    expect(() => deriveSuiteAccounting({ ...value.input, reviewHead: value.git('rev-parse', 'HEAD') })).toThrow(/executable input/);
  });
});


describe('NUL-safe accounting preserves real Git path identity', () => {
  it('parses spaces, Unicode, tabs, newlines and trailing whitespace without trimming filenames', () => {
    const file = 'tests/épreuve — Ω\twith\nnewline .spec.ts ';
    expect(parseAccountingChanges(Buffer.from(`M\0${file}\0A\0docs/other.md\0`))).toEqual([
      { status: 'M', path: file }, { status: 'A', path: 'docs/other.md' },
    ]);
    expect(parseAccountingChanges('')).toEqual([]);
    for (const malformed of ['M\tfile\n', 'M\0', 'M\0file\0A\0', 'R100\0old\0new\0', 'M\0../outside\0']) {
      expect(() => parseAccountingChanges(malformed)).toThrow();
    }
  });

  it('attributes a changed Unicode/tab-named test from actual Git under either quotePath setting', () => {
    const value = fixture({ unicode: true });
    for (const setting of ['true', 'false']) {
      value.git('config', 'core.quotePath', setting);
      const result = deriveSuiteAccounting(value.input);
      expect(result.status).toBe('passed');
      const delta = result.comparisons.find(row => row.suite === 'mcp-server')!.fileDeltas[0];
      expect(delta.file).toBe('packages/mcp-server/test/épreuve — Ω\t.spec.ts');
      expect(delta).toMatchObject({ attribution: { kind: 'changed-test-file', references: [{ commit: value.input.executionHead, path: delta.file }] } });
      expect(delta.addedAssertions).toHaveLength(1);
      expect(result.unattributedDeltas).toEqual([]);
    }
  });

  it('preserves added Unicode evidence but still rejects any post-capture executable change', () => {
    const value = fixture();
    const evidence = `${base}/ci/évidence — Ω\t.log`;
    mkdirSync(path.dirname(path.join(value.root, evidence)), { recursive: true });
    writeFileSync(path.join(value.root, evidence), 'Synthetic evidence only\n');
    value.git('add', '.'); value.git('commit', '--quiet', '-m', 'Synthetic Unicode evidence');
    const reviewHead = value.git('rev-parse', 'HEAD');
    expect(readAccountingChanges(value.root, value.input.reviewHead, reviewHead)).toEqual([{ status: 'A', path: evidence }]);
    expect(deriveSuiteAccounting({ ...value.input, reviewHead }).headRelation.changedEvidencePaths).toContainEqual({ status: 'A', path: evidence });
    const source = 'packages/mcp-server/test/éditeur — Ω\n.spec.ts';
    writeFileSync(path.join(value.root, source), 'export {};\n');
    value.git('add', '.'); value.git('commit', '--quiet', '-m', 'Synthetic forbidden post-capture source');
    expect(() => deriveSuiteAccounting({ ...value.input, reviewHead: value.git('rev-parse', 'HEAD') })).toThrow(/executable input/);
  });
});
