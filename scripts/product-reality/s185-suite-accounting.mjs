#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_ROOT = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout';
const BASELINES = {
  before: 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-before/four-suite-baseline.json',
  after: 'artifacts/product-reality/sprint-185/m01/four-suite-baseline-after/four-suite-baseline.json',
};
const INITIAL_CLOSEOUT = 'artifacts/product-reality/sprint-185/m05/four-suite-closeout-attempt-1/four-suite-baseline.json';
export const SUITES = Object.freeze(['viz-core', 'viz-render', 'mcp-server', 'root-core']);
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const countTests = assertions => ({ total: assertions.length,
  passed: assertions.filter(row => row.status === 'passed').length,
  failed: assertions.filter(row => row.status === 'failed').length,
  skipped: assertions.filter(row => row.status === 'skipped').length,
  todo: assertions.filter(row => row.status === 'todo').length });
const countFiles = files => ({ total: files.length, passed: files.filter(row => row.status === 'passed').length,
  failed: files.filter(row => row.status === 'failed').length, skipped: files.filter(row => row.status === 'skipped').length });
const status = value => ['pending', 'disabled', 'skipped'].includes(value) ? 'skipped' : value;

export function projectVitest(raw, workspace) {
  const files = raw.testResults.map(file => {
    const filePath = path.relative(workspace, file.name).replaceAll('\\', '/');
    assert(filePath && !filePath.startsWith('../') && !path.isAbsolute(filePath), `Test path escapes the captured workspace: ${file.name}`);
    const occurrences = new Map();
    const assertions = (file.assertionResults ?? []).map(row => {
      const name = row.fullName ?? [...(row.ancestorTitles ?? []), row.title].join(' ');
      const occurrence = occurrences.get(name) ?? 0;
      occurrences.set(name, occurrence + 1);
      const observed = status(row.status);
      assert(['passed', 'failed', 'skipped', 'todo'].includes(observed), `Unknown assertion status: ${row.status}`);
      return { key: `${name}#${occurrence}`, name, caption: [...(row.ancestorTitles ?? []), row.title ?? name].join(' > '),
        ancestorTitles: row.ancestorTitles ?? [], status: observed, failureMessages: row.failureMessages ?? [] };
    }).sort((a, b) => a.key.localeCompare(b.key));
    return { path: filePath, status: status(file.status), tests: countTests(assertions), assertions,
      collectionMessage: file.message ?? '', failureMessages: file.failureMessages ?? [] };
  }).sort((a, b) => a.path.localeCompare(b.path));
  assert.equal(new Set(files.map(file => file.path)).size, files.length, 'Duplicate test-file execution in one Vitest report.');
  const tests = countTests(files.flatMap(file => file.assertions));
  assert.deepEqual(tests, { total: raw.numTotalTests, passed: raw.numPassedTests, failed: raw.numFailedTests,
    skipped: raw.numPendingTests, todo: raw.numTodoTests }, 'Vitest headline differs from actual assertion rows.');
  return { success: raw.success === true, tests, fileCounts: countFiles(files), files };
}

export function compareFilePopulations(before, after) {
  const previous = new Map(before.map(file => [file.path, file]));
  const current = new Map(after.map(file => [file.path, file]));
  const changes = [];
  for (const file of [...new Set([...previous.keys(), ...current.keys()])].sort()) {
    const old = previous.get(file); const next = current.get(file);
    const oldAssertions = new Map((old?.assertions ?? []).map(row => [row.key, row]));
    const newAssertions = new Map((next?.assertions ?? []).map(row => [row.key, row]));
    const addedAssertions = [...newAssertions.keys()].filter(key => !oldAssertions.has(key));
    const removedAssertions = [...oldAssertions.keys()].filter(key => !newAssertions.has(key));
    const changedStatuses = [...oldAssertions.keys()].filter(key => newAssertions.has(key) && oldAssertions.get(key).status !== newAssertions.get(key).status)
      .map(key => ({ key, before: oldAssertions.get(key).status, after: newAssertions.get(key).status,
        beforeFailureMessages: oldAssertions.get(key).failureMessages, afterFailureMessages: newAssertions.get(key).failureMessages }));
    if (!old || !next || addedAssertions.length || removedAssertions.length || changedStatuses.length || old.status !== next.status) changes.push({
      file, kind: !old ? 'added-file' : !next ? 'removed-or-excluded-file' : 'changed-file-observations',
      before: old ? { status: old.status, tests: old.tests, collectionMessage: old.collectionMessage } : null,
      after: next ? { status: next.status, tests: next.tests, collectionMessage: next.collectionMessage } : null,
      addedAssertions, removedAssertions, changedStatuses,
    });
  }
  return changes;
}

export function assertUniqueExecutions(executions) {
  const ids = executions.map(row => row.id);
  assert.equal(new Set(ids).size, ids.length, 'One execution was rolled up under more than one row.');
  const rawReports = executions.filter(row => row.rawReport).map(row => row.rawReport.sha256);
  assert.equal(new Set(rawReports).size, rawReports.length, 'The same retained Vitest execution was relabeled as another run.');
}

export function failureSignature(messages, workspace) {
  return messages.map(message => message.replaceAll(workspace, '<workspace>').split('\n')
    .filter(line => !/^\s+at\s/.test(line)).join('\n').trim()).filter(Boolean).join('\n');
}

function meaningfulFailure(messages, workspace = '') {
  const signature = failureSignature(messages, workspace || '\0');
  return signature.split('\n').some(line => line.trim()
    && !/^(?:(?:[A-Za-z]*Error:\s*)?STACK_TRACE_ERROR|[A-Za-z]*Error:?)\s*$/.test(line.trim()));
}

/**
 * The receipt selects the suite; the exact reporter file and caption select its cause.
 * @param {{text: string, suite: string, file: string, testKey: string|null, caption?: string|null, scopeCaptions?: string[], captionOccurrences?: number}} options
 */
export function extractRawLogFailure({ text, suite, file, testKey, caption = null, scopeCaptions = [], captionOccurrences = 1 }) {
  assert(SUITES.includes(suite), `Unknown captured suite: ${suite}`);
  if (testKey !== null && captionOccurrences !== 1) return { status: 'unresolved', reason: 'ambiguous-assertion-caption' };
  const prefix = suite === 'root-core' ? '' : `packages/${suite}/`;
  if (!file.startsWith(prefix)) return { status: 'unresolved', reason: 'file-outside-suite' };
  const reporterFile = file.slice(prefix.length);
  const rawLines = text.split('\n');
  const lines = rawLines.map(line => line.replace(/\u001b\[[0-9;]*m/g, '').replace(/\r$/, ''));
  const matches = [];
  for (let index = 0; index < lines.length; index++) {
    if (!/^\s*FAIL\s+/.test(lines[index])) continue;
    const start = index;
    const headers = [];
    while (index < lines.length && /^\s*FAIL\s+/.test(lines[index])) {
      const match = lines[index].match(/^\s*FAIL\s+(?:\|([^|]+)\|\s+)?(.+)$/);
      const expectedProject = suite === 'root-core' ? 'core' : undefined;
      if (match?.[1] === expectedProject) {
        const tail = match[2];
        const matchedCaption = tail.startsWith(`${reporterFile} > `) ? tail.slice(reporterFile.length + 3)
          : tail === reporterFile || tail === `${reporterFile} [ ${reporterFile} ]` ? null : undefined;
        const matchesCaption = testKey === null
          ? matchedCaption === null || scopeCaptions.includes(matchedCaption)
          : matchedCaption === caption;
        if (matchedCaption !== undefined && matchesCaption) headers.push({ line: index + 1, caption: matchedCaption, project: match[1] ?? null });
      }
      index++;
    }
    const bodyStart = index;
    while (index < lines.length && !/^\s*(?:⎯{3,}|FAIL\s+)/.test(lines[index])) index++;
    const end = index;
    const body = lines.slice(bodyStart, end);
    const stackStart = body.findIndex(line => /^\s+(?:❯|at\s)/.test(line));
    const cause = body.slice(0, stackStart < 0 ? body.length : stackStart).join('\n').trim();
    if (/^[A-Za-z]*Error(?: \[[^\]]+\])?:\s*\S/.test(cause) && meaningfulFailure([cause])) {
      for (const header of headers) matches.push({ suite, file, caption: header.caption, project: header.project,
        matchedHeaderLine: header.line, startLine: start + 1, bodyStartLine: bodyStart + 1, endLine: end,
        text: rawLines.slice(start, end).join('\n'), cause });
    }
    index--;
  }
  return matches.length === 1 ? { status: 'resolved', ...matches[0] }
    : { status: 'unresolved', reason: matches.length > 1 ? 'ambiguous-log-match' : 'no-exact-meaningful-log-match' };
}

/**
 * @param {*} failure
 * @param {{text?: string, log?: {path: string, sha256?: string, bytes?: number}|null, scopeCaptions?: string[], captionOccurrences?: number}} [options]
 */
export function resolveFailureEvidence(failure, { text = '', log = null, scopeCaptions = [], captionOccurrences = 1 } = {}) {
  if (meaningfulFailure(failure.messages, failure.workspace)) return { source: 'vitest-json' };
  const extracted = extractRawLogFailure({ ...failure, text: text ?? '', scopeCaptions, captionOccurrences });
  return extracted.status === 'resolved' ? { source: 'raw-log', log, ...extracted }
    : { source: 'unresolved', reason: extracted.reason, ...(log ? { log } : {}) };
}

export function observeUnhandledErrors(text, { cohort, log }) {
  const rawLines = text.split('\n');
  const lines = rawLines.map(line => line.replace(/\u001b\[[0-9;]*m/g, '').replace(/\r$/, ''));
  const sections = [];
  for (let index = 0; index < lines.length; index++) {
    const summary = lines[index].match(/^Vitest caught (\d+) unhandled errors? during the test run\.$/);
    if (!summary) continue;
    let start = index;
    for (let previous = index - 1; previous >= Math.max(0, index - 3); previous--) {
      if (/⎯.*Unhandled Errors/.test(lines[previous])) { start = previous; break; }
    }
    let end = index + 1;
    while (end < lines.length && !/^\s*(?:Test Files\s|Tests\s{2,}|Start at\s|Duration\s|JSON report|ERR_PNPM_)/.test(lines[end])) end++;
    sections.push({ reportedCount: Number(summary[1]), summaryLine: index + 1, startLine: start + 1, endLine: end,
      text: rawLines.slice(start, end).join('\n') });
  }
  return { log, count: sections.length > 1 ? null : sections[0]?.reportedCount ?? 0, sections,
    blocking: cohort === 'closeout' && sections.some(section => section.reportedCount > 0) };
}

function effectiveFailureSignature(failure) {
  if (meaningfulFailure(failure.messages, failure.workspace)) return failureSignature(failure.messages, failure.workspace);
  return failure.evidence?.source === 'raw-log' ? failureSignature([failure.evidence.cause], failure.workspace) : '';
}

export function classifyFailure(failure, baselineFailures, dispositions) {
  const signature = effectiveFailureSignature(failure);
  const candidates = baselineFailures.filter(previous => Object.hasOwn(BASELINES, previous.cohort)
    && previous.suite === failure.suite && previous.file === failure.file
    && previous.testKey === failure.testKey && signature.length > 0
    && effectiveFailureSignature(previous) === signature);
  const disposition = dispositions.find(row => row.suite === failure.suite && row.file === failure.file && row.testKey === failure.testKey
    && row.reason?.trim() && candidates.some(previous => previous.receiptPath === row.baselineReceipt));
  return { suite: failure.suite, file: failure.file, testKey: failure.testKey, executionId: failure.executionId,
    status: disposition ? 'inherited-failure-disclosed' : 'unexplained-failure',
    signatureSha256: hash(signature), messages: failure.messages, failureEvidence: failure.evidence ?? { source: meaningfulFailure(failure.messages, failure.workspace) ? 'vitest-json' : 'unresolved' },
    matchingHistoricalReceipts: candidates.map(previous => previous.receiptPath),
    matchingHistoricalEvidence: candidates.map(previous => ({ receipt: previous.receiptPath, messages: previous.messages, evidence: previous.evidence ?? { source: 'vitest-json' } })),
    ...(disposition ? { reason: disposition.reason, historicalReceipt: disposition.baselineReceipt } : {}) };
}

export function retainedCaptureReference(aggregatePath, ref, originalRoot) {
  assert(typeof ref === 'string' && !path.isAbsolute(ref) && !ref.split('/').includes('..'), `Invalid captured evidence reference: ${ref}`);
  if (originalRoot) {
    assert(ref.startsWith(`${originalRoot}/`), `Attempt reference does not use its recorded original root: ${ref}`);
    return path.posix.join(path.posix.dirname(aggregatePath), ref.slice(originalRoot.length + 1));
  }
  return ref.startsWith('artifacts/') ? ref : path.posix.join(path.posix.dirname(path.posix.dirname(aggregatePath)), ref);
}

/** Decision 1741 permits captured receipts and named derived outputs, never arbitrary artifact fixtures. */
export function allowedReviewEvidence(file) {
  return /^artifacts\/product-reality\/sprint-185\/m05\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(file)
    || /^artifacts\/product-reality\/sprint-185\/m05\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(file);
}

export function assertEvidenceOnlyHeadChanges(changes) {
  for (const row of changes) assert(row.status === 'A' && allowedReviewEvidence(row.path),
    `Review descendant changes an executable input, fixture, or pre-existing evidence: ${row.status} ${row.path}`);
}

export function deriveSuiteAccounting({ root = ROOT, executionHead, reviewHead, attributions = [], failureDispositions = [], capturePath = `${EVIDENCE_ROOT}/four-suite-baseline.json` }) {
  assert(executionHead && reviewHead, 'Both actual execution head and separate frozen review head are required.');
  const issues = [];
  const refs = new Map();
  const bytes = file => {
    const content = readFileSync(path.join(root, file));
    refs.set(file, { path: file, bytes: content.length, sha256: hash(content) });
    return content;
  };
  const json = file => JSON.parse(bytes(file).toString('utf8'));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git(['rev-parse', executionHead]), executionHead, 'Execution head must be a full immutable commit id.');
  assert.equal(git(['rev-parse', reviewHead]), reviewHead, 'Review head must be a full immutable commit id.');
  const changedPaths = (before, after) => git(['diff', '--name-status', '--no-renames', before, after]).split('\n').filter(Boolean)
    .map(line => { const [status, file] = line.split('\t'); return { status, path: file }; });
  const executions = [];
  const executionDetails = new Map();
  const observedFailures = [];
  const loadCapture = (file, cohort, originalRoot) => {
    const aggregate = json(file);
    const captureRef = ref => retainedCaptureReference(file, ref, originalRoot);
    assert(aggregate.host?.hostname && aggregate.host.node && aggregate.host.vitest, 'Captured host versions are missing.');
    const capture = { aggregate: refs.get(file), measuredHead: aggregate.measuredHead, status: aggregate.status, label: aggregate.captureLabel,
      host: aggregate.host, namedRetry: aggregate.namedRetry ?? false, suiteSelection: aggregate.suiteSelection ?? 'all',
      cleanBeforeSetup: aggregate.cleanBeforeSetup, cleanAfterSetup: aggregate.cleanAfterSetup, runs: [] };
    capture.setup = (aggregate.setup ?? []).map(step => {
      const retainedPath = captureRef(step.log.path);
      bytes(retainedPath);
      assert.equal(refs.get(retainedPath).sha256, step.log.sha256, 'Setup log hash differs.');
      return { id: step.id, exitCode: step.exitCode, executedCommand: step.executedCommand, log: refs.get(retainedPath) };
    });
    for (const run of aggregate.runs) {
      const runOutput = { run: run.run, cleanBefore: run.cleanBefore, cleanAfter: run.cleanAfter, suiteExecutionIds: [] };
      const selected = capture.suiteSelection === 'all' ? SUITES : capture.suiteSelection;
      assert.deepEqual(run.suites.map(row => row.suite).sort(), [...selected].sort(), 'A captured suite is missing or duplicated.');
      for (const embedded of run.suites) {
        const receiptPath = captureRef(embedded.receipt.path);
        const receipt = json(receiptPath);
        assert.equal(refs.get(receiptPath).sha256, embedded.receipt.sha256, 'Receipt hash differs from aggregate.');
        assert.deepEqual(Object.fromEntries(Object.entries(embedded).filter(([key]) => key !== 'receipt')), receipt, 'Embedded receipt differs from retained receipt.');
        assert.equal(receipt.measuredHead, aggregate.measuredHead, 'Captured head differs within one execution.');
        const logPath = captureRef(receipt.log.path);
        const logText = bytes(logPath).toString('utf8');
        assert.equal(refs.get(logPath).sha256, receipt.log.sha256, 'Raw command log hash differs.');
        const rawPath = captureRef(receipt.retainedReport);
        const projection = projectVitest(json(rawPath), aggregate.workspace);
        assert.deepEqual(projection.tests, receipt.vitest.tests, 'Receipt test counts differ from raw assertions.');
        assert.deepEqual(projection.fileCounts, receipt.vitest.files, 'Receipt file counts differ from raw report.');
        assert.equal(receipt.vitest.success, projection.success, 'Receipt success differs from raw report.');
        const derivedStatus = receipt.exitCode === 0 && projection.success && receipt.cleanBefore.clean && receipt.cleanAfter.clean ? 'passed' : 'failed';
        assert.equal(receipt.status, derivedStatus, 'Receipt status differs from its actual exit, assertions, and clean-tree checks.');
        assert.deepEqual(projection.files.map(({ path, status, tests }) => ({ path, status, tests })),
          [...receipt.vitest.fileResults].sort((a, b) => a.path.localeCompare(b.path)).map(({ path, status: observed, tests }) => ({ path, status: status(observed), tests })),
        'Receipt per-file counts differ from raw report.');
        const id = `${cohort}:${run.run}:${receipt.suite}:${receipt.startedAt}`;
        const record = { id, cohort, run: run.run, suite: receipt.suite, measuredHead: receipt.measuredHead,
          receipt: refs.get(receiptPath), rawReport: refs.get(rawPath), log: refs.get(logPath),
          startedAt: receipt.startedAt, endedAt: receipt.endedAt, exitCode: receipt.exitCode, status: receipt.status,
          cleanBefore: receipt.cleanBefore.clean, cleanAfter: receipt.cleanAfter.clean,
          counts: projection.tests, fileCounts: projection.fileCounts,
          failureFiles: projection.files.filter(row => row.status === 'failed').map(row => ({ path: row.path, tests: row.tests,
            collectionMessage: row.collectionMessage, failures: row.assertions.filter(test => test.status === 'failed') })),
          skippedFiles: projection.files.filter(row => row.tests.skipped > 0).map(({ path, tests }) => ({ path, tests })) };
        executions.push(record); executionDetails.set(id, projection); runOutput.suiteExecutionIds.push(id);
        for (const file of projection.files) {
          const failedAssertions = file.assertions.filter(row => row.status === 'failed');
          const scopeCaptions = [...new Set(file.assertions.flatMap(test => test.ancestorTitles.map((_, index) => test.ancestorTitles.slice(0, index + 1).join(' > '))))];
          const observe = (test, messages) => {
            const failure = { executionId: id, cohort, suite: receipt.suite, file: file.path,
              testKey: test?.key ?? null, caption: test?.caption ?? null, messages, workspace: aggregate.workspace, receiptPath };
            failure.evidence = resolveFailureEvidence(failure, { text: logText, log: refs.get(logPath), scopeCaptions,
              captionOccurrences: test ? file.assertions.filter(row => row.caption === test.caption).length : 1 });
            observedFailures.push(failure);
          };
          for (const test of failedAssertions) observe(test, test.failureMessages);
          if (file.status === 'failed' && failedAssertions.length === 0) observe(null, [file.collectionMessage, ...file.failureMessages].filter(Boolean));
        }
        record.observedFailures = observedFailures.filter(row => row.executionId === id).map(({ file, testKey, messages, evidence }) => ({ file, testKey, messages, evidence }));
        record.unhandledErrors = observeUnhandledErrors(logText, { cohort, log: refs.get(logPath) });
        if (record.unhandledErrors.blocking) issues.push({ kind: 'unhandled-closeout-errors', executionId: id,
          receipt: receiptPath, evidence: record.unhandledErrors });
        if (cohort === 'closeout' && (!receipt.cleanBefore.clean || !receipt.cleanAfter.clean))
          issues.push({ kind: 'closeout-tree-not-clean', executionId: id, receipt: receiptPath });
        if (cohort === 'closeout' && (receipt.exitCode !== 0 || !projection.success) && !observedFailures.some(row => row.executionId === id))
          issues.push({ kind: 'unexplained-nonzero-exit-or-reporter-error', executionId: id, receipt: receiptPath });
      }
      capture.runs.push(runOutput);
    }
    return capture;
  };
  const baselines = Object.fromEntries(Object.entries(BASELINES).map(([cohort, file]) => [cohort, loadCapture(file, cohort)]));
  const closeout = loadCapture(capturePath, 'closeout');
  assert.equal(closeout.measuredHead, executionHead, 'Requested execution head does not match actual capture.');
  assert.equal(closeout.suiteSelection, 'all', 'Closeout must execute all four suites.');
  assert(closeout.runs.length > 0, 'Closeout captured no suite runs.');
  if (!closeout.cleanBeforeSetup.clean || !closeout.cleanAfterSetup.clean || closeout.runs.some(run => !run.cleanBefore.clean || !run.cleanAfter.clean))
    issues.push({ kind: 'closeout-tree-not-clean' });
  const closeoutAttempts = [{ name: 'initial-failed-closeout', originalReferenceRoot: 'four-suite-closeout',
    retainedRoot: path.posix.dirname(INITIAL_CLOSEOUT),
    reason: 'The first complete clean-tree closeout failed. Its original capture bytes and observed failures remain retained before the corrected source is captured again.',
    role: 'Retained initial capture only. These executions are neither final closeout comparisons nor historical failure candidates.',
    ...loadCapture(INITIAL_CLOSEOUT, 'closeout-attempt-1', 'four-suite-closeout') }];
  assertUniqueExecutions(executions);
  const historicalFailures = observedFailures.filter(row => Object.hasOwn(BASELINES, row.cohort));
  const closeoutFailures = observedFailures.filter(row => row.cohort === 'closeout').map(failure => {
    const classified = classifyFailure(failure, historicalFailures, failureDispositions);
    if (classified.status === 'unexplained-failure') issues.push({ kind: 'unexplained-closeout-failure', executionId: failure.executionId,
      file: failure.file, testKey: failure.testKey });
    const testSource = { commit: executionHead, path: failure.file, blob: git(['rev-parse', `${executionHead}:${failure.file}`]) };
    const historicalTestSources = classified.matchingHistoricalReceipts.map(receiptPath => {
      const execution = executions.find(row => row.receipt.path === receiptPath);
      return { commit: execution.measuredHead, path: failure.file, blob: git(['rev-parse', `${execution.measuredHead}:${failure.file}`]) };
    });
    return { ...classified, testSource, historicalTestSources };
  });
  const unusedFailureDispositions = failureDispositions.filter(row => !closeoutFailures.some(failure => failure.status === 'inherited-failure-disclosed'
    && failure.suite === row.suite && failure.file === row.file && failure.testKey === row.testKey && failure.historicalReceipt === row.baselineReceipt));
  if (unusedFailureDispositions.length) issues.push({ kind: 'unused-failure-dispositions', count: unusedFailureDispositions.length });
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', executionHead, reviewHead], { cwd: root }).status === 0;
  assert(ancestor, 'The review head must descend from the actual execution head.');
  const headChanges = changedPaths(executionHead, reviewHead);
  assertEvidenceOnlyHeadChanges(headChanges);
  const changedAt = new Map();
  const commitsFor = (before, file) => git(['log', '--format=%H', `${before}..${executionHead}`, '--', file]).split('\n').filter(Boolean)
    .map(commit => ({ commit, path: file }));
  const comparisons = [];
  const unattributedDeltas = [];
  const manualUse = new Set();
  for (const [cohort, baseline] of Object.entries(baselines)) {
    const changed = changedPaths(baseline.measuredHead, executionHead);
    changedAt.set(cohort, changed);
    for (const currentRun of closeout.runs) for (const baselineRun of baseline.runs) for (const suite of SUITES) {
      const oldId = baselineRun.suiteExecutionIds.find(id => executions.find(row => row.id === id).suite === suite);
      const newId = currentRun.suiteExecutionIds.find(id => executions.find(row => row.id === id).suite === suite);
      const old = executionDetails.get(oldId); const current = executionDetails.get(newId);
      const deltas = compareFilePopulations(old.files, current.files);
      for (const delta of deltas) {
        const identifier = `${cohort}/run-${baselineRun.run}->closeout/run-${currentRun.run}/${suite}/${delta.file}`;
        const direct = changed.find(row => row.path === delta.file);
        if (direct && ((delta.before && delta.after) || (delta.kind === 'added-file' && direct.status === 'A')
          || (delta.kind === 'removed-or-excluded-file' && direct.status === 'D'))) {
          delta.attribution = { kind: 'changed-test-file', reason: 'This test file changed in the measured commit range.', references: commitsFor(baseline.measuredHead, delta.file) };
          if (delta.kind === 'removed-or-excluded-file' && direct.status === 'D') delta.kind = 'removed-file';
        } else if (delta.before?.status === 'failed' && delta.before.tests.total === 0 && delta.addedAssertions.length > 0) {
          delta.attribution = { kind: 'previous-collection-failure', reason: 'The retained earlier file failed before collecting assertions; the new receipt contains the listed assertions. No source cause is inferred.',
            references: [executions.find(row => row.id === oldId).rawReport], collectionMessage: delta.before.collectionMessage };
        } else if (!delta.addedAssertions.length && !delta.removedAssertions.length && delta.changedStatuses.length > 0
          && delta.changedStatuses.every(row => ['failed', 'passed'].includes(row.before) && ['failed', 'passed'].includes(row.after))) {
          delta.attribution = { kind: 'retained-outcome-change', reason: 'Same assertions have different executed outcomes; retained failure messages and named host/run receipts are the evidence. No code or timing cause is inferred.',
            references: [executions.find(row => row.id === oldId).rawReport, executions.find(row => row.id === newId).rawReport] };
        } else {
          const manualIndex = attributions.findIndex(row => row.file === delta.file && row.suite === suite
            && (!row.baseline || row.baseline === cohort) && (!row.baselineRun || row.baselineRun === baselineRun.run)
            && (!row.closeoutRun || row.closeoutRun === currentRun.run));
          if (manualIndex >= 0) {
            const manual = attributions[manualIndex];
            assert(manual.reason?.trim() && manual.references?.length, `Attribution lacks a reason or source references: ${identifier}`);
            for (const ref of manual.references) {
              assert(changed.some(row => row.path === ref.path), `Attribution path did not change in this comparison: ${ref.path}`);
              assert(commitsFor(baseline.measuredHead, ref.path).some(row => row.commit === ref.commit), `Attribution commit does not change the named path: ${ref.commit}:${ref.path}`);
            }
            delta.attribution = { kind: manual.kind, reason: manual.reason, references: manual.references };
            if (delta.kind === 'removed-or-excluded-file' && manual.kind === 'configuration-exclusion') delta.kind = 'newly-excluded-file';
            manualUse.add(manualIndex);
          } else unattributedDeltas.push({ id: identifier, ...delta });
        }
      }
      comparisons.push({ baseline: cohort, baselineRun: baselineRun.run, closeoutRun: currentRun.run, suite,
        beforeExecutionId: oldId, afterExecutionId: newId, beforeCounts: old.tests, afterCounts: current.tests,
        fileDeltas: deltas });
    }
  }
  if (unattributedDeltas.length) issues.push({ kind: 'unattributed-suite-deltas', count: unattributedDeltas.length });
  const unusedAttributions = attributions.map((row, index) => ({ row, index })).filter(({ index }) => !manualUse.has(index)).map(({ row }) => row);
  if (unusedAttributions.length) issues.push({ kind: 'unused-manual-attributions', count: unusedAttributions.length });
  // Inventory named historical retries separately; they are not substituted into primary comparisons.
  const m01Root = 'artifacts/product-reality/sprint-185/m01';
  const historicalAttempts = readdirSync(path.join(root, m01Root), { withFileTypes: true }).filter(row => row.isDirectory())
    .map(row => `${m01Root}/${row.name}/four-suite-baseline.json`).filter(file => existsSync(path.join(root, file)) && !Object.values(BASELINES).includes(file))
    .sort().map(file => {
      const report = json(file);
      return { report: refs.get(file), measuredHead: report.measuredHead, host: report.host, status: report.status,
        label: report.captureLabel, namedRetry: report.namedRetry, suiteSelection: report.suiteSelection,
        role: 'Historical attempt inventory only; no receipt from this aggregate is substituted into the compared primary runs.',
        runs: report.runs.map(run => ({ run: run.run, suites: run.suites.map(row => ({ suite: row.suite, exitCode: row.exitCode,
          status: row.status, countsAsReportedHistorically: row.vitest?.tests ?? null, receipt: row.receipt })) })) };
    });
  return { schemaVersion: '1.0.0', mission: 's185-m05', kind: 'four-suite-execution-and-delta-accounting',
    status: issues.length ? 'failed' : 'passed', executionHead, reviewHead,
    headRelation: { decision: 1741, ancestor, changedEvidencePaths: headChanges, executableInputsUnchanged: true,
      limitation: 'Actual receipts retain executionHead. A later reviewHead is an evidence-only descendant, not a relabeled test execution.' },
    baselines, closeout, closeoutAttempts, executions, comparisons, historicalAttempts, closeoutFailures, unattributedDeltas, unusedAttributions,
    unusedFailureDispositions, validationIssues: issues,
    references: [...refs.values()].sort((a, b) => a.path.localeCompare(b.path)),
    countPolicy: 'Status describes accounting validity, not blanket suite greenness. Counts belong to individual executed receipts. Any disclosed inherited failure remains a failed execution; new or unmatched failures invalidate accounting. Skips and prior failures remain visible; no cross-suite or retry total claims unique tests.',
    builderSelfCertified: false, separateReviewRequired: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const mode = process.argv[2];
  assert(['--write', '--check'].includes(mode), 'Use --write|--check --execution-head <sha> --review-head <sha> [--attributions <json>] [--failures <json>]');
  const attributionPath = argument('--attributions');
  const failurePath = argument('--failures');
  const report = deriveSuiteAccounting({ executionHead: argument('--execution-head'), reviewHead: argument('--review-head'),
    ...(attributionPath ? { attributions: JSON.parse(readFileSync(path.resolve(ROOT, attributionPath), 'utf8')) } : {}),
    ...(failurePath ? { failureDispositions: JSON.parse(readFileSync(path.resolve(ROOT, failurePath), 'utf8')) } : {}) });
  const output = path.join(ROOT, EVIDENCE_ROOT, 'accounting.json');
  if (mode === '--write') writeFileSync(output, canonical(report));
  else assert.equal(readFileSync(output, 'utf8'), canonical(report), 'Suite accounting is stale.');
  process.stdout.write(`${report.status}: ${report.executions.length} distinct retained receipts; ${report.unattributedDeltas.length} unattributed deltas; ${report.validationIssues.length} issues.\n`);
  if (report.status !== 'passed') process.exitCode = 1;
}
