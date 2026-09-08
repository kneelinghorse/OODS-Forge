import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { assertSprint188ApprovalChanges, validateSprint188Timeout } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { auditSprint188ApprovalChanges, auditSprint188Timeout } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const base = 'artifacts/product-reality/sprint-188/m06';
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const historical = new Map<string, Buffer>();
const fromGit = (head: string, file: string) => {
  const key = `${head}:${file}`;
  if (!historical.has(key)) historical.set(key, execFileSync('git', ['show', key], {cwd: root}));
  return historical.get(key)!;
};
function fixture() {
  const overrides = new Map<string, Buffer>();
  const readBytes = (file: string): Buffer => overrides.get(file) ?? readFileSync(path.join(root, file));
  const approval = JSON.parse(readBytes(`${base}/accepted-timeout/approval.json`).toString());
  const accounting = JSON.parse(readBytes(`${base}/closeout/suite-accounting.json`).toString());
  accounting.closeoutFailures[0].status = 'approved-timeout-disclosed';
  const approvalRef = {path: `${base}/accepted-timeout/approval.json`, sha256: sha(readBytes(`${base}/accepted-timeout/approval.json`))};
  accounting.closeoutFailures[0].approval = approvalRef;
  accounting.timeoutAcceptance = {decisionId: 1830, status: 'accepted-observed-timeout', file: approval.file,
    testKey: approval.testKey, observedFailureCount: 1, retryPassed: 7, sprintReview: approval.sprintReview, approval: approvalRef};
  let alteredSource = false;
  const readHistorical = (head: string, file: string) => alteredSource && head === approval.proposalHead ? Buffer.from('changed spec') : fromGit(head, file);
  const rewrite = (file: string, mutate: (value: any) => void, reseal = false) => {
    const value = JSON.parse(readBytes(file).toString()); mutate(value);
    overrides.set(file, Buffer.from(JSON.stringify(value)));
    if (reseal) {
      const diagnostic = JSON.parse(readBytes(approval.diagnostic).toString());
      diagnostic.files.find((row: any) => row.path === file).sha256 = sha(readBytes(file));
      overrides.set(approval.diagnostic, Buffer.from(JSON.stringify(diagnostic)));
    }
  };
  const change = (kind: string) => {
    const failure = accounting.closeoutFailures[0];
    if (kind === 'unapproved') approval.approved = false;
    if (kind === 'wrong-test') approval.testKey = 'another test#0';
    if (kind === 'second-failure') accounting.closeoutFailures.push(structuredClone(failure));
    if (kind === 'not-timeout') failure.failureEvidence.cause = 'Error: assertions differ';
    if (kind === 'retry-failure') rewrite(`${base}/timeout-diagnostic/isolation.vitest.json`, value => { value.numFailedTests = 1; value.success = false; }, true);
    if (kind === 'retry-caption') rewrite(`${base}/timeout-diagnostic/isolation.vitest.json`, value => { value.testResults[0].assertionResults[0].fullName = 'a different test'; }, true);
    if (kind === 'ci-red') rewrite(`${base}/timeout-diagnostic/ci-complete.json`, value => { value.conclusion = 'failure'; }, true);
    if (kind === 'changed-spec') alteredSource = true;
    if (kind === 'review-follow-up-omitted') approval.sprintReview.nextSprintAdjustmentRequired = false;
    if (kind === 'hidden-count') accounting.executions.find((row: any) => row.cohort === 'closeout' && row.suite === 'root-core').counts.failed = 0;
    if (kind === 'tampered-raw-log') overrides.set(failure.failureEvidence.log.path, Buffer.from('changed log'));
    if (kind === 'relabeled-execution') approval.executionHead = '0'.repeat(40);
  };
  return {approval, accounting, readBytes, readHistorical, change};
}

for (const mode of ['producer', 'independent-auditor']) describe(`Decision 1830 ${mode} exception boundary`, () => {
  const verify = (f: ReturnType<typeof fixture>) => mode === 'producer'
    ? validateSprint188Timeout({...f, failures: f.accounting.closeoutFailures, executions: f.accounting.executions})
    : auditSprint188Timeout(f);
  it('accepts the exact retained timeout without changing its raw failed count', () => {
    const f = fixture(); expect(verify(f)).toBeTruthy();
    expect(f.accounting.executions.find((row: any) => row.cohort === 'closeout' && row.suite === 'root-core').counts.failed).toBe(1);
  });
  it.each(['unapproved', 'wrong-test', 'second-failure', 'not-timeout', 'retry-failure', 'retry-caption',
    'ci-red', 'changed-spec', 'review-follow-up-omitted', 'hidden-count', 'tampered-raw-log', 'relabeled-execution'])(
    'rejects %s so one user exception cannot hide another defect', kind => {
      const f = fixture(); f.change(kind); expect(() => verify(f)).toThrow();
    });
});

for (const [name, guard] of [['producer', assertSprint188ApprovalChanges], ['independent-auditor', auditSprint188ApprovalChanges]] as const) {
  describe(`${name} post-capture input boundary`, () => {
    it('allows additive approval evidence and the named audit derivation changes', () => {
      expect(() => guard([{status: 'A', path: `${base}/accepted-timeout/approval.json`},
        {status: 'M', path: 'scripts/product-reality/s185-closeout.mjs'}], () => Buffer.from('same'), () => Buffer.from('same'))).not.toThrow();
    });
    it.each([
      {status: 'M', path: 'packages/mcp-server/src/codegen/workflow-emitter.ts'},
      {status: 'M', path: 'packages/mcp-server/test/product-reality/sprint-wide-movers.s185.spec.ts'},
      {status: 'M', path: `${base}/four-suite-closeout/run-1/root-core.log`},
      {status: 'A', path: 'packages/mcp-server/src/new-runtime.ts'},
      {status: 'D', path: 'scripts/product-reality/s185-closeout.mjs'},
    ])('rejects an uncaptured or rewritten input: $path', change => {
      expect(() => guard([change], () => {throw new Error('Absent from submitted proposal');}, () => Buffer.from('new'))).toThrow();
    });
  });
}
