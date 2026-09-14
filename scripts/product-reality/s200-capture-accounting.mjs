import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { projectVitest, S192_SUITES } from './s185-suite-accounting.mjs';

const [captureDirectory, outputFile] = process.argv.slice(2);
assert(captureDirectory && outputFile, 'Usage: node scripts/product-reality/s200-capture-accounting.mjs <capture-directory> <output-file>');
const capture = JSON.parse(fs.readFileSync(path.join(captureDirectory, 'four-suite-baseline.json'), 'utf8'));
assert.equal(capture.runs.length, 1, 'Account each numbered capture separately');
const run = capture.runs[0];
assert.deepEqual(run.suites.map(row => row.suite), S192_SUITES);
const suites = run.suites.map(receipt => {
  assert.equal(receipt.measuredHead, capture.measuredHead);
  const rawPath = `run-${run.run}/${receipt.suite}.vitest.json`;
  const raw = JSON.parse(fs.readFileSync(path.join(captureDirectory, rawPath), 'utf8'));
  const result = projectVitest(raw, capture.workspace, capture.host.platform);
  assert.deepEqual(result.tests, receipt.vitest.tests, 'Receipt totals must agree with raw assertion rows');
  const failed = result.files.filter(file => file.status === 'failed');
  const uncollected = failed.filter(file => file.tests.total === 0);
  const skipped = result.files.flatMap(file => file.assertions.filter(row => row.status === 'skipped').map(row => ({ file: file.path, test: row.name })));
  return {
    suite: receipt.suite, status: receipt.status, exitCode: receipt.exitCode,
    durationMs: receipt.durationMs,
    counts: { passedAssertions: result.tests.passed, failedAssertions: result.tests.failed,
      skipped: result.tests.skipped, failedFiles: failed.length, uncollectedFiles: uncollected.length },
    totalAssertions: result.tests.total, todo: result.tests.todo,
    failedFiles: failed.map(file => ({ file: file.path, uncollected: file.tests.total === 0,
      tests: file.tests, message: file.collectionMessage, failureMessages: file.failureMessages,
      assertions: file.assertions.filter(row => row.status === 'failed'), log: `run-${run.run}/${receipt.suite}.log` })),
    skipped, rawReport: rawPath,
  };
});
const checkpoints = [capture.cleanBeforeSetup, capture.cleanAfterSetup, run.cleanBefore, run.cleanAfter,
  ...run.suites.flatMap(row => [row.cleanBefore, row.cleanAfter])];
const accounting = {
  builderSelfCertified: false, measuredHead: capture.measuredHead, captureStatus: capture.status,
  counts: Object.fromEntries(Object.keys(suites[0].counts).map(key => [key, suites.reduce((sum, suite) => sum + suite.counts[key], 0)])),
  totalAssertions: suites.reduce((sum, suite) => sum + suite.totalAssertions, 0),
  todo: suites.reduce((sum, suite) => sum + suite.todo, 0),
  uncollectedDefinition: 'A failed test file with zero collected assertion rows; included in failedFiles as well.',
  optionalStage1: 'The same 16 optional external Stage1 cases are collected by both MCP and root; 32 skipped executions are expected and listed individually.',
  startedAt: capture.setup[0].startedAt, endedAt: run.suites.at(-1).endedAt,
  cleanlinessCheckpoints: checkpoints.length, allCheckpointsClean: checkpoints.every(row => row.clean),
  suites,
};
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(accounting, null, 2) + '\n');
console.log(JSON.stringify({ measuredHead: accounting.measuredHead, status: accounting.captureStatus, ...accounting.counts, allCheckpointsClean: accounting.allCheckpointsClean }));
