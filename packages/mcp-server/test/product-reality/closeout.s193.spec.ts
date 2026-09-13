import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveRange, deriveMovers, S193_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprintRange, auditSprint193CaptureLimit } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { SUITES, S192_SUITES, assertEvidenceOnlyHeadChanges, validateCloseoutCaptureLimit } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { validateRuntimeLedger } from '../../src/lib/runtime-ledger.js';
import { derivePublicHeadEquivalence } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { buildNotices } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const base = execFileSync('git', ['rev-parse', 'c098237f'], { cwd: root, encoding: 'utf8' }).trim();
const measured = execFileSync('git', ['rev-parse', 'ebb307e6'], { cwd: root, encoding: 'utf8' }).trim();
const range = deriveRange(base, measured, root, S193_PUBLIC_RUNTIME_SCOPE);
const options = { sprintId: 'sprint-193', missionId: 's193-m07', base };

describe('Sprint 193 bounded closeout', () => {
  it('binds the final extension to decision1911 and both failed heads, without allowing another capture', () => {
    const extension = JSON.parse(readFileSync(`${root}/artifacts/product-reality/sprint-193/m07/capture-extension.json`, 'utf8'));
    const attempts = extension.priorExecutionHeads.map((measuredHead: string) => ({ measuredHead }));
    const input = { sprintId: 'sprint-193', closeout: { runs: [{}] }, attempts, extension };
    expect(validateCloseoutCaptureLimit(input)).toMatchObject({ decisionId: 1911, totalCaptures: 3, stopAfterThisCapture: true });
    for (const invalid of [
      { ...input, extension: undefined },
      { ...input, attempts: attempts.slice(0, 1) },
      { ...input, attempts: [...attempts, { measuredHead: 'a'.repeat(40) }] },
      { ...input, attempts: [...attempts].reverse() },
      { ...input, closeout: { runs: [{}, {}] } },
      { ...input, sprintId: 'sprint-192' },
      { ...input, extension: { ...extension, decisionId: 1833 } },
      { ...input, extension: { ...extension, allowedTotalCaptures: 4 } },
      { ...input, extension: { ...extension, stopAfterThisCapture: false } },
    ]) expect(() => validateCloseoutCaptureLimit(invalid)).toThrow();
  });
  it('preserves the default two-capture limit for every existing bounded sprint', () => {
    for (const sprintId of ['sprint-189', 'sprint-190', 'sprint-191', 'sprint-192', 'sprint-193']) {
      const input = { sprintId, closeout: { runs: [{}] }, attempts: [{ measuredHead: measured }] };
      expect(validateCloseoutCaptureLimit(input)).toBeUndefined();
      expect(() => validateCloseoutCaptureLimit({ ...input, attempts: [...input.attempts, ...input.attempts] })).toThrow(/Decision 1833/);
    }
  });
  it('independently checks the extension receipt and all five suites from both actual retained failures', () => {
    const receipt = { path: 'artifacts/product-reality/sprint-193/m07/capture-extension.json' };
    const extension = JSON.parse(readFileSync(`${root}/${receipt.path}`, 'utf8'));
    const closeoutAttempts = [1, 2].map(index => {
      const directory = `artifacts/product-reality/sprint-193/m07/five-suite-closeout-attempt-${index}`;
      const aggregate = { path: `${directory}/four-suite-baseline.json` };
      const raw = JSON.parse(readFileSync(`${root}/${aggregate.path}`, 'utf8'));
      return { aggregate, measuredHead: raw.measuredHead, suites: raw.runs[0].suites, directory };
    });
    const executions = closeoutAttempts.flatMap((attempt, index) => attempt.suites.map((suite: { suite: string }) => ({
      cohort: `closeout-attempt-${index + 1}`, suite: suite.suite, rawReport: { path: `${attempt.directory}/run-1/${suite.suite}.vitest.json` },
    })));
    const accounting = { closeout: { runs: [{}] }, closeoutAttempts, executions,
      captureExtensionAcceptance: { decisionId: 1911, totalCaptures: 3, priorExecutionHeads: extension.priorExecutionHeads, stopAfterThisCapture: true, receipt } };
    const manifest = { accounting: { captureExtension: receipt.path } };
    const verify = (ref: { path: string }) => readFileSync(`${root}/${ref.path}`);
    expect(() => auditSprint193CaptureLimit({ accounting, manifest, verify })).not.toThrow();
    expect(() => auditSprint193CaptureLimit({ accounting: { ...accounting, executions: executions.slice(1) }, manifest, verify })).toThrow();
    expect(() => auditSprint193CaptureLimit({ accounting, manifest: { accounting: { captureExtension: 'unbound.json' } }, verify })).toThrow();
    expect(() => auditSprint193CaptureLimit({ accounting: { ...accounting, closeoutAttempts: [...closeoutAttempts, closeoutAttempts[0]] }, manifest, verify })).toThrow();
    const falsified = (ref: { path: string }) => ref.path === receipt.path ? Buffer.from(JSON.stringify({ ...extension, decisionId: 1833 })) : verify(ref);
    expect(() => auditSprint193CaptureLimit({ accounting, manifest, verify: falsified })).toThrow();
  });
  it('independently enumerates the catalog, contracts, styles, tokens and export boundary', () => {
    expect(S193_PUBLIC_RUNTIME_SCOPE).toEqual(expect.arrayContaining([
      'schemas/traits', 'generated/types/traits', 'generated/types/index.ts',
      'cmos/foundational-docs/closeout-checklist.md',
    ]));
    const audit = auditSprintRange({ root, base, head: measured, sprintId: 'sprint-193' });
    expect(range.canonicalPaths).toEqual(audit.canonicalPaths);
    expect(range.publicPaths).toEqual(audit.publicPaths);
    expect(range.publicPaths).toEqual(expect.arrayContaining([
      'packages/mcp-server/src/schemas/health.output.json',
      'packages/component-contracts/registry/component-capability-ledger.v1.json',
      'packages/component-styles/src/components.css',
      'artifacts/structured-data/oods-components-2026-09-11-s193-m05.json',
    ]));
  });
  it('rejects an omitted catalog schema in the declared sprint diff', () => {
    const declaration = { s193: { ...range, canonicalPaths: range.canonicalPaths.filter(file => !file.endsWith('health.output.json')) } };
    expect(() => deriveMovers(measured, declaration, root, options)).toThrow(/declared mover union differs/);
  });
  it('prepares exactly the three active destinations without sending or approving classifications', () => {
    const movers = deriveMovers(measured, { s193: range }, root, options);
    const plan = buildNotices(movers, root);
    expect(plan).toMatchObject({ sent: false, sendsExecuted: 0, targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'], deliverySprint: 'sprint-194' });
    for (const notice of plan.notices) for (const text of ['catalog_list productReality.surfaces', '2026-09-11-s193-m07', 'health productReality.runtime', 'health productReality.tools', 'approvedRuntimeCensus remains null']) expect(notice.request.body).toContain(text);
  });
  it('keeps historical four-suite profiles and root-core unchanged while adding the fifth suite', () => {
    expect(SUITES).toEqual(['viz-core', 'viz-render', 'mcp-server', 'root-core']);
    expect(S192_SUITES).toEqual([...SUITES, 'component-packages']);
    expect(execFileSync('git', ['show', `${measured}:vitest.config.ts`], { cwd: root })).toEqual(execFileSync('git', ['show', `${base}:vitest.config.ts`], { cwd: root }));
  });
  it('keeps the final 154-cell proof tied to its recorded implementation on later evidence commits', () => {
    const ledger = JSON.parse(readFileSync(`${root}/artifacts/product-reality/sprint-193/m07/runtime/runtime-cells.v1.json`, 'utf8'));
    // This frozen Sprint 193 receipt proves its historical eleven-object cohort.
    const historicalObjects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const historicalIdentities = historicalObjects.flatMap(object => ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`)));
    expect(validateRuntimeLedger(ledger, true, historicalIdentities)).toEqual([]);
    expect(ledger.summary).toEqual({ cells: 154, pass: 154, typedGap: 0, fail: 0 });
    // s194-m01: the historical proof binds its recorded execution, not future sprints' HEAD.
    const manifest = JSON.parse(readFileSync(`${root}/artifacts/product-reality/sprint-193/m07/closeout/manifest.json`, 'utf8'));
    const capture = JSON.parse(readFileSync(`${root}/artifacts/product-reality/sprint-193/m07/five-suite-closeout/four-suite-baseline.json`, 'utf8'));
    expect(manifest.implementationHead).toBe(ledger.head);
    expect(manifest.executionHead).toBe(capture.measuredHead);
    expect(derivePublicHeadEquivalence({ root, implementationHead: ledger.head, executionHead: manifest.executionHead, sprintId: 'sprint-193' }).changedPaths).toEqual([]);
    expect(derivePublicHeadEquivalence({ root, implementationHead: ledger.head, executionHead: 'db8d24d200c0ee888900359fb3a9f1c257206ca5', sprintId: 'sprint-193' }).changedPaths).toEqual(expect.arrayContaining(['.github/workflows/ci.yml', 'package.json']));
  });
  it('permits only additive receipt descendants after execution, never source edits or rewritten evidence', () => {
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: 'artifacts/product-reality/sprint-193/m07/five-suite-closeout/run-1/result.json' }], 'sprint-193')).not.toThrow();
    for (const row of [
      { status: 'M', path: 'artifacts/product-reality/sprint-193/m07/five-suite-closeout/run-1/result.json' },
      { status: 'A', path: 'artifacts/product-reality/sprint-193/m07/closeout/patch.mjs' },
      { status: 'M', path: 'packages/component-contracts/src/contracts.ts' },
      { status: 'M', path: 'artifacts/product-reality/sprint-193/m02/README.md' },
    ]) expect(() => assertEvidenceOnlyHeadChanges([row], 'sprint-193')).toThrow();
  });
});
