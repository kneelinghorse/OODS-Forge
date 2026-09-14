import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classifySoakObservation } from '../../../../scripts/product-reality/s195-soak-observation.mjs';

const root = resolve(import.meta.dirname, '../../../..');
const originalLog = readFileSync(resolve(root, 'artifacts/product-reality/sprint-195/m06/soak/head.log'), 'utf8');
const observed = JSON.parse(/ECHARTS_SOAK_EVIDENCE resources-observed (\{[^\n]+\})/.exec(originalLog)![1]);
const report = () => ({ numPendingTests: 0, testResults: [{ assertionResults: [
  { fullName: 'concurrency', status: 'passed', failureMessages: [] },
  { fullName: 'latency', status: 'passed', failureMessages: [] },
  { fullName: 'plateaus after 100 warmups plus 2,000 unique-geo renders and disposes faulted charts', status: 'passed', failureMessages: [] },
] }] });

describe('the soak retains diagnostic trends without hiding any remaining gate failure', () => {
  it('accepts the measured positive trend only when all remaining cases and hard ceilings pass', () => {
    expect(classifySoakObservation(report(), observed, 0)).toMatchObject({ status: 'passed', originalExitCode: 0, soakStatus: 'passed', retentionCertification: 'not-established', hardResourceCeilingsPassed: true });
  });
  it.each([
    ['missing measurements', (value: any) => { value.samples = []; }],
    ['missing budgets', (value: any) => { delete value.budgets; }],
    ['hard heap ceiling', (value: any) => { value.workerHeapDeltaBytes = value.budgets.workerHeapAbsoluteDeltaBytes + 1; }],
    ['hard heap slope', (value: any) => { value.heapTrend.slope = value.budgets.workerHeapSlopeBytesPerWindow + 1; }],
    ['hard RSS slope', (value: any) => { value.rssTrend.slope = value.budgets.processRssSlopeBytesPerWindow + 1; }],
    ['chart leak', (value: any) => { value.afterFault.chartsDisposed -= 1; }],
    ['map leak', (value: any) => { value.afterFault.geoRegistrySize = 2; }],
    ['fault swallowed', (value: any) => { value.afterFault.renderFaults = value.beforeFault.renderFaults; }],
    ['realm not restored', (value: any) => { value.afterFault.randomRestored = false; }],
    ['geometry stale', (value: any) => { value.afterFault.lastGeometryHash = '0'.repeat(64); }],
  ])('keeps %s blocking', (_label, mutate) => {
    const evidence = structuredClone(observed); mutate(evidence);
    expect(classifySoakObservation(report(), evidence, 0).status).toBe('failed');
  });
  it('does not classify skipped, unrelated, missing-report or infrastructure failures as observations', () => {
    const skipped = report(); skipped.numPendingTests = 1;
    const other = report(); other.testResults[0].assertionResults[0].status = 'failed';
    const wrongFailure = report(); wrongFailure.testResults[0].assertionResults[2].status = 'failed'; wrongFailure.testResults[0].assertionResults[2].failureMessages = ['some other assertion'];
    for (const input of [undefined, skipped, other, wrongFailure]) expect(classifySoakObservation(input, observed, 0).status).toBe('failed');
    expect(classifySoakObservation(report(), observed, 1).status).toBe('failed');
    expect(classifySoakObservation(report(), observed, null).status).toBe('failed');
    expect(classifySoakObservation(report(), observed, 1, 'Vitest caught 1 unhandled error\nUnhandled Rejection').status).toBe('failed');
  });
  it('does not claim retention certification from either positive or nonpositive diagnostic trends', () => {
    const passed = report(); passed.testResults[0].assertionResults[2] = { ...passed.testResults[0].assertionResults[2], status: 'passed', failureMessages: [] };
    const evidence = structuredClone(observed); evidence.heapTrend.positiveTrendLower99 = -1; evidence.rssTrend.positiveTrendLower99 = -1;
    expect(classifySoakObservation(passed, evidence, 0)).toMatchObject({ status: 'passed', soakStatus: 'passed', retentionCertification: 'not-established' });
    expect(classifySoakObservation(passed, observed, 0)).toMatchObject({ status: 'passed', retentionCertification: 'not-established' });
  });
});
