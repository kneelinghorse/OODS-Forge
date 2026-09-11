#!/usr/bin/env node
/** Keep the strict soak result; only its known statistical floor is observational. */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function classifySoakObservation(report, evidence, exitCode, log = '') {
  const failed = reason => ({ status: 'failed', code: 'OODS-SOAK-1442', reason, originalExitCode: exitCode, retentionCertification: 'not-established' });
  if (/Unhandled (?:Errors|Rejection|Exception)|Uncaught Exception/i.test(log)) return failed('An unhandled runtime error is not a resource observation.');
  const assertions = report?.testResults?.flatMap(result => result.assertionResults ?? []) ?? [];
  if (assertions.length !== 3 || report.numPendingTests !== 0) return failed('All three original soak cases must run; no skips or missing cases are observational.');
  const resource = assertions.find(test => test.fullName?.includes('plateaus after 100 warmups plus 2,000 unique-geo renders'));
  if (!resource || assertions.filter(test => test !== resource).some(test => test.status !== 'passed')) return failed('A non-resource soak case failed.');
  if (!evidence || evidence.samples?.length !== 21 || evidence.warmupRenders !== 100 || evidence.measuredRenders !== 2000) return failed('Exact original resource measurements are required.');
  const { heapTrend, rssTrend, budgets, beforeFault: before, afterFault: after } = evidence;
  if (![evidence.workerHeapDeltaBytes, heapTrend?.slope, heapTrend?.positiveTrendLower99, rssTrend?.slope, rssTrend?.positiveTrendLower99].every(Number.isFinite)) return failed('Resource statistics are missing or non-finite.');
  if (![budgets?.workerHeapAbsoluteDeltaBytes, budgets?.workerHeapSlopeBytesPerWindow, budgets?.processRssSlopeBytesPerWindow].every(value => Number.isFinite(value) && value > 0)) return failed('Original hard resource budgets are required.');
  if (evidence.workerHeapDeltaBytes > budgets.workerHeapAbsoluteDeltaBytes || heapTrend.slope > budgets.workerHeapSlopeBytesPerWindow || rssTrend.slope > budgets.processRssSlopeBytesPerWindow) return failed('An unchanged hard resource ceiling failed.');
  if (!before || !after || before.activeCharts !== 0 || before.geoRegistrySize !== 1 || !/^[a-f0-9]{64}$/.test(before.lastGeometryHash ?? '') || after.lastGeometryHash !== before.lastGeometryHash || before.chartsCreated !== 2100 || before.chartsDisposed !== 2100 || after.chartsCreated !== 2101 || after.chartsDisposed !== 2101 || after.activeCharts !== 0 || after.renderFaults !== before.renderFaults + 1 || after.geoRegistrationCount !== 2100 || after.geoRegistrySize !== 1 || !after.randomRestored || !after.clockGuardRestored || after.ambientAccesses !== 0) return failed('Disposal, forced-fault cleanup, map bound, or deterministic-realm safety failed.');
  const positiveTrend = heapTrend.positiveTrendLower99 > 0 || rssTrend.positiveTrendLower99 > 0;
  if (resource.status === 'failed') {
    if (exitCode !== 1 || !positiveTrend || resource.failureMessages?.length !== 1 || !resource.failureMessages[0].includes('OODS-SOAK-1442: statistically positive retained resource trend')) return failed('The failure is not solely the named statistical lower bound.');
  } else if (resource.status !== 'passed' || exitCode !== 0 || positiveTrend) return failed('The strict result and measured statistics disagree.');
  return { status: 'observation', code: 'OODS-SOAK-1442', reason: 'The strict statistical result is retained as an observation after unchanged latency, concurrency, hard resource, disposal, and map-bound gates pass; no retention cause was established by the bounded investigation.', originalExitCode: exitCode,
    strictSoakStatus: resource.status, retentionCertification: 'not-established', hardResourceCeilingsPassed: true, allThreeCasesRan: true, heapTrend, rssTrend };
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.env.OODS_SOAK_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
  const output = resolve(process.env.OODS_SOAK_OUTPUT ?? resolve(root, 'artifacts/echarts-soak'));
  mkdirSync(output, { recursive: true });
  const command = [process.execPath, '--expose-gc', resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', 'vitest.echarts-soak.config.ts', '--reporter=json', `--outputFile=${resolve(output, 'vitest.json')}`];
  const run = spawnSync(command[0], command.slice(1), { cwd: resolve(root, 'packages/mcp-server'), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const log = `${run.stdout ?? ''}${run.stderr ?? ''}${run.error ?? ''}`;
  writeFileSync(resolve(output, 'strict-soak.log'), log);
  let report;
  try { report = JSON.parse(readFileSync(resolve(output, 'vitest.json'), 'utf8')); } catch { /* Missing reports fail closed below. */ }
  const match = /ECHARTS_SOAK_EVIDENCE resources-observed (\{[^\n]+\})/.exec(log);
  let evidence;
  try { evidence = match ? JSON.parse(match[1]) : undefined; } catch { /* Invalid measurements fail closed below. */ }
  const result = { schemaVersion: 1, ...classifySoakObservation(report, evidence, run.status, log), command, evidence, builderSelfCertified: false };
  writeFileSync(resolve(output, 'observation.json'), JSON.stringify(result, null, 2) + '\n');
  const summary = `### ECharts resource trend: ${result.status}\n\n${result.code}: ${result.reason}\n\nStrict soak exit: ${String(run.status)}. Retention certification: not established. Original assertions, thresholds, JSON report, and raw samples are retained.\n`;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(JSON.stringify({ status: result.status, code: result.code, originalExitCode: run.status, report: resolve(output, 'observation.json') }));
  process.exitCode = result.status === 'failed' ? 1 : 0;
}
