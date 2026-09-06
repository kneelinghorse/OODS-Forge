import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { deriveCloseout } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditFinalCloseout } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

// Independent hand-built source bytes, not producer outputs or checker helpers.
// These tests test derivation integrity; they are not the real sprint capture.
const executionHead = 'a'.repeat(40);
const reviewHead = 'b'.repeat(40);
const prefix = 'artifacts/product-reality/sprint-185/m05/closeout';
const hash = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
const literalCriteria = Array.from({ length: 8 }, (_, index) => `CMOS criterion ${index}: exact punctuation — and spacing.\nSecond line ${index}.`);

function fixture() {
  const files = new Map<string, Buffer>();
  const put = (file: string, value: unknown) => {
    files.set(file, Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)));
    return file;
  };
  const ref = (file: string) => ({ path: file, sha256: hash(files.get(file)!) });
  const snapshots: Record<string, any> = {
    cmosMission: { rawResponse: { structuredContent: { data: { id: 's185-m05', successCriteria: [...literalCriteria] } } } },
    cmosOriginalMission: { rawResponse: { structuredContent: { data: { id: 's185-m05', successCriteria: [...literalCriteria] } } } },
    cmosSprint: { rawResponse: { structuredContent: { data: { id: 'sprint-185', status: 'Active' } } } },
    baselineFold: { denominator: 109, identityClassificationAndReconciliationUnchanged: true, approvedRuntimeCensus: null,
      newNucleusComponents: ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'],
      portedComponents: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], changedComponentCount: 13, changedSurfaceCellCount: 39,
      readinessReferences: [{ resolved: true }], overlayRetirement: { readers: [{ disposition: 'repointed' }, { disposition: 'repointed' }] } },
    movers: { status: 'passed', s185: { head: executionHead }, comparison: {
      s184: { canonical: { missingFromDeclaration: [], extraInDeclaration: [] }, public: { missingFromDeclaration: [], extraInDeclaration: [] } },
      s185: { canonical: { missingFromDeclaration: [], extraInDeclaration: [] }, public: { missingFromDeclaration: [], extraInDeclaration: [] } },
    }, tableControl: { status: 'passed' } },
    noticePlan: { implementationHead: executionHead, notices: ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'].map(targetAddress => {
      const request = { targetAddress, body: 'Combined Sprint 184 and Sprint 185 movers; two unions retained.' };
      return { request, requestSha256: hash(JSON.stringify(request)) };
    }), retired: { decisionId: 1719, messageId: null } },
    reviewCarries: { b2: { nextStepId: 1364 }, c13: { nextStepId: 1365, commit: '9cd02da94bd342e269a1d68faa7a9a82c8c2f6f1', subjects: [{ name: 'subscription-detail-dark' }, { name: 'subscription-list-dark' }] },
      c5: { controls: Array.from({ length: 4 }, () => ({ disposition: 'historical, output never captured', countsAsCurrentProof: false })) },
      increment3: { nextStepId: 1366, disposition: 'PARTIAL', subscriptionWorkflow: { stateAxis: 'state-neutral' } },
      unabsorbedMaintenance: [1315, 1318, 1319, 1320, 1321, 1322].map(id => ({ id, status: 'pending', completedByThisRecord: false })) },
    behaviorBites: { outcomes: ['react', 'vue'].map(framework => ({ id: `${framework}-void-zero`, framework,
      preGreen: true, selectedRed: true, restoredGreen: true, originalContentHash: 'original', restoredContentHash: 'original',
      mutatedContentHash: 'mutated', originalSource: 'setOwnState(input);', mutatedSource: 'void 0;', issues: ['own state not updated'] })) },
    bridge: { status: 'disclosed-skip', reason: 'Build worktree is not the served checkout.', buildWorktree: '/work/build',
      processes: [{ name: 'oods-forge-bridge', cwd: '/work/served' }], rebuildExecuted: false, restartExecuted: false, healthAfterRestart: null },
    m04BuildRecord: { status: 'passed', builderSelfCertified: false, separateReviewRequired: true },
    near: 'Sprint 185: BUILT, REVIEW PENDING. Increment 3 is PARTIAL.',
  };
  snapshots.deliveries = snapshots.noticePlan.notices.map((notice: any, index: number) => ({
    targetAddress: notice.request.targetAddress, requestSha256: notice.requestSha256, messageId: `actual-message-${index}`, status: 'sent',
  }));
  const sources = Object.fromEntries(Object.entries(snapshots).map(([name, data]) => [name, put(`frozen/${name}.json`, data)]));
  const manifest: any = { missionId: 's185-m05', sources, executions: [{
    id: 'supplemental-proof', command: 'node verify-evidence.mjs', cwd: '/work/build', host: 'fixture-host', exitCode: 0,
    executionHead, sourceState: 'worktree', inputs: Object.values(sources).map(ref),
    logs: [ref(put('frozen/supplemental.log', 'supplemental proof passed\n'))],
  }], claimBindings: literalCriteria.map((_, criterionIndex) => ({
    criterionIndex, executionIds: ['supplemental-proof'], evidencePaths: [...Object.values(sources), 'frozen/supplemental.log'],
  })) };
  const suites = ['viz-core', 'viz-render', 'mcp-server', 'root-core'].map((id, index) => ({
    id, executionHead, measuredHead: executionHead, cohort: 'closeout', suite: id, cleanBefore: true, cleanAfter: true,
    command: `test ${id}`, cwd: '/work/build', host: 'fixture-host', exitCode: 0,
    counts: { total: index + 1, passed: index + 1, failed: 0, skipped: 0 },
    receipt: ref(put(`frozen/${id}-receipt.json`, { id, suite: id, exitCode: 0, measuredHead: executionHead,
      cleanBefore: { clean: true }, cleanAfter: { clean: true }, vitest: { tests: { total: index + 1, passed: index + 1, failed: 0, skipped: 0 } } })),
    log: ref(put(`frozen/${id}.log`, `${id} passed\n`)), rawReport: ref(put(`frozen/${id}-raw.json`, { id, tests: index + 1 })),
  }));
  const suiteAccounting: any = { executionHead, reviewHead, references: [ref(put('frozen/capture.json', { executionHead }))],
    executions: suites, status: 'passed', validationIssues: [], unattributedDeltas: [],
    headRelation: { ancestor: true, executableInputsUnchanged: true }, closeout: { runs: [{ suiteExecutionIds: suites.map(row => row.id) }] } };
  manifest.claimBindings[6].executionIds = suites.map(row => row.id);
  manifest.claimBindings[6].evidencePaths.push(...suites.map(row => row.log.path));
  manifest.sources.derivationInputs = [put('frozen/producer.mjs', 'export const rule = 1;'), put('frozen/independent.spec.ts', 'assert(rule);')];
  manifest.manifestPath = 'artifacts/product-reality/sprint-185/m05/closeout-inputs/manifest.json';
  const readFrozen = (file: string): Buffer => { const bytes = files.get(file); if (!bytes) throw new Error(`Missing frozen byte source: ${file}`); return bytes; };
  const derive = () => {
    put(manifest.manifestPath, manifest);
    return deriveCloseout({ executionHead, reviewHead, manifest, suiteAccounting, readFrozen });
  };
  const replaceSource = (name: string, value: any): void => {
    put(sources[name]!, value);
    // Reseal the input binding: semantic negative controls must reach their
    // actual predicate, not be masked by an earlier hash mismatch.
    for (const input of manifest.executions[0].inputs) if (input.path === sources[name]) input.sha256 = hash(files.get(input.path)!);
  };
  return { files, put, ref, snapshots, manifest, suiteAccounting, derive, replaceSource, readFrozen };
}

describe('Sprint 185 claim ledger derives from literal frozen sources and real execution bindings', () => {
  it('copies exact CMOS text and independently checks every output/input hash and review flag', () => {
    const f = fixture(); const outputs = f.derive();
    const ledger = outputs[`${prefix}/claim-ledger.json`];
    expect(ledger.claims.map((row: any) => row.criterion)).toEqual(literalCriteria);
    expect(ledger.headline, JSON.stringify(ledger.unproven)).toEqual({ total: 8, proven: 8, unproven: 0 });
    expect(ledger).toMatchObject({ executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true });
    const executions = new Map(ledger.executions.map((row: any) => [row.id, row]));
    for (const claim of ledger.claims) {
      expect(claim.executionIds.length).toBeGreaterThan(0);
      for (const id of claim.executionIds) expect(executions.has(id)).toBe(true);
      for (const evidence of claim.evidence) expect(evidence.sha256).toBe(hash(f.files.get(evidence.path)!));
    }
    expect(outputs[`${prefix}/review-handoff.json`]).toMatchObject({ executionHead, reviewHead, sprintStatus: 'Active', builderSelfCertified: false, separateReviewRequired: true, approvalStatus: 'pending-independent-review' });
    const index = outputs[`${prefix}/evidence-index.json`];
    expect(index.selfExcluded).toBe(true);
    expect(index.generatedOutputs.map((row: any) => row.path)).not.toContain(`${prefix}/evidence-index.json`);
    for (const row of index.generatedOutputs) expect(row.sha256).toBe(hash(`${JSON.stringify(outputs[row.path], null, 2)}\n`));
    for (const row of index.frozenInputs) expect(row.sha256).toBe(hash(f.files.get(row.path)!));
  });

  it.each(['claims', 'criteria'] as const)('rejects manifest-supplied %s instead of using it as an oracle', key => {
    const f = fixture(); f.manifest[key] = ['builder says passed'];
    expect(f.derive).toThrow(/cannot be supplied/);
  });
  it.each(['criterion', 'status'] as const)('rejects a binding override of %s', key => {
    const f = fixture(); f.manifest.claimBindings[0][key] = 'builder says passed';
    expect(f.derive).toThrow(/cannot override/);
  });
  it('reads edited literal CMOS bytes only when their input hash is honestly resealed', () => {
    const f = fixture();
    f.snapshots.cmosMission.rawResponse.structuredContent.data.successCriteria[0] += ' Amended upstream.';
    f.replaceSource('cmosMission', f.snapshots.cmosMission);
    expect(f.derive()[`${prefix}/claim-ledger.json`].claims[0].criterion).toBe(`${literalCriteria[0]} Amended upstream.`);
  });

  it.each(['changed-hash', 'missing-file', 'output-input', 'unknown-execution', 'duplicate-execution', 'empty-binding', 'missing-required-source', 'duplicate-criterion', 'missing-derivation-rules'] as const)('rejects %s in the evidence graph', kind => {
    const f = fixture();
    if (kind === 'changed-hash') f.files.set(f.manifest.sources.near, Buffer.from('changed after receipt'));
    if (kind === 'missing-file') f.files.delete(f.manifest.sources.near);
    if (kind === 'output-input') f.manifest.sources.near = `${prefix}/claim-ledger.json`;
    if (kind === 'unknown-execution') f.manifest.claimBindings[0].executionIds = ['never-ran'];
    if (kind === 'duplicate-execution') f.manifest.executions.push(structuredClone(f.manifest.executions[0]));
    if (kind === 'empty-binding') f.manifest.claimBindings[0].executionIds = [];
    if (kind === 'missing-required-source') f.manifest.claimBindings[0].evidencePaths = [f.manifest.sources.near];
    if (kind === 'duplicate-criterion') f.manifest.claimBindings[0].criterionIndex = 1;
    if (kind === 'missing-derivation-rules') f.manifest.sources.derivationInputs = [];
    expect(f.derive).toThrow();
  });

  it.each(['relabeled-head', 'duplicate-suite-raw'] as const)('rejects %s in suite accounting', kind => {
    const f = fixture();
    if (kind === 'relabeled-head') f.suiteAccounting.executionHead = reviewHead;
    if (kind === 'duplicate-suite-raw') f.suiteAccounting.executions[1].rawReport = f.suiteAccounting.executions[0].rawReport;
    expect(f.derive).toThrow();
  });

  it.each(['unknown', 'duplicate'] as const)('%s suite ID cannot prove a four-suite capture', kind => {
    const f = fixture();
    f.suiteAccounting.closeout.runs[0].suiteExecutionIds[0] = kind === 'unknown' ? 'never-ran' : f.suiteAccounting.closeout.runs[0].suiteExecutionIds[1];
    expect(f.derive()[`${prefix}/claim-ledger.json`].claims[6].status).toBe('unproven');
  });

  it.each([
    ['baseline denominator', 'baselineFold', 0, (source: any) => { source.denominator = 110; }],
    ['runtime census approval', 'baselineFold', 0, (source: any) => { source.approvedRuntimeCensus = 19; }],
    ['mover omission', 'movers', 1, (source: any) => { source.comparison.s185.public.missingFromDeclaration = ['src/Table.tsx']; }],
    ['duplicate delivery', 'deliveries', 2, (source: any) => { source[1].messageId = source[0].messageId; }],
    ['historical control promoted', 'reviewCarries', 3, (source: any) => { source.c5.controls[0].countsAsCurrentProof = true; }],
    ['maintenance silently absorbed', 'reviewCarries', 4, (source: any) => { source.unabsorbedMaintenance[0].completedByThisRecord = true; }],
    ['served checkout equals build worktree', 'bridge', 5, (source: any) => { source.processes[0].cwd = source.buildWorktree; }],
    ['self-certified build', 'm04BuildRecord', 7, (source: any) => { source.builderSelfCertified = true; }],
    ['sprint incorrectly closed', 'cmosSprint', 7, (source: any) => { source.rawResponse.structuredContent.data.status = 'Completed'; }],
  ] as const)('%s remains unproven even with correctly resealed evidence', (_label, name, criterionIndex, mutate) => {
    const f = fixture(); mutate(f.snapshots[name]); f.replaceSource(name, f.snapshots[name]);
    const ledger = f.derive()[`${prefix}/claim-ledger.json`];
    expect(ledger.claims[criterionIndex].status).toBe('unproven');
    expect(ledger.claims[criterionIndex].unproven.length).toBeGreaterThan(0);
    expect(ledger.status).toBe('incomplete');
  });

  it('a failed command cannot be the only execution proving a claim', () => {
    const f = fixture(); f.manifest.executions[0].exitCode = 1;
    const ledger = f.derive()[`${prefix}/claim-ledger.json`];
    expect(ledger.claims[0].status).toBe('unproven');
    expect(ledger.executions.find((row: any) => row.id === 'supplemental-proof').exitCode).toBe(1);
  });
  it('an unrelated successful command cannot be borrowed to prove a claim', () => {
    const f = fixture();
    f.manifest.executions[0].inputs = [f.ref(f.put('frozen/unrelated-input.txt', 'unrelated input'))];
    expect(f.derive()[`${prefix}/claim-ledger.json`].claims[0].status).toBe('unproven');
  });
  it('a four-suite claim must bind the four actual suite executions', () => {
    const f = fixture(); f.manifest.claimBindings[6].executionIds = ['supplemental-proof'];
    expect(f.derive()[`${prefix}/claim-ledger.json`].claims[6].status).toBe('unproven');
  });
  it('pre-capture suite selectors resolve to actual future execution IDs without relabeling', () => {
    const f = fixture();
    f.manifest.claimBindings[6].executionIds = [];
    f.manifest.claimBindings[6].suiteBindings = ['viz-core', 'viz-render', 'mcp-server', 'root-core'];
    for (const row of f.suiteAccounting.executions) row.id = `${row.id}:actual-future-start-time`;
    f.suiteAccounting.closeout.runs[0].suiteExecutionIds = f.suiteAccounting.executions.map((row: any) => row.id);
    const claim = f.derive()[`${prefix}/claim-ledger.json`].claims[6];
    expect(claim.status).toBe('passed');
    expect(claim.executionIds).toEqual(['viz-core:actual-future-start-time', 'viz-render:actual-future-start-time', 'mcp-server:actual-future-start-time', 'root-core:actual-future-start-time']);
    expect(f.manifest.claimBindings[6].executionIds).toEqual([]);
  });
  it.each(['duplicate', 'unknown'] as const)('rejects %s pre-capture selector', kind => {
    const f = fixture(); f.manifest.claimBindings[6].executionIds = [];
    f.manifest.claimBindings[6].suiteBindings = ['viz-core', 'viz-render', 'mcp-server', kind === 'duplicate' ? 'mcp-server' : 'never-ran'];
    expect(f.derive).toThrow();
  });
});

describe('Independent final-output audit checks actual bytes without the producer checker', () => {
  function auditFixture() {
    const f = fixture(); const outputs = f.derive();
    const gitEvidence = { ancestor: true, changes: [] as { status: string; path: string }[] };
    const audit = () => auditFinalCloseout({ executionHead, reviewHead, gitEvidence, readFrozen: f.readFrozen,
      readOutput: (file: string) => Buffer.from(`${JSON.stringify(outputs[file], null, 2)}\n`) });
    return { ...f, outputs, gitEvidence, audit };
  }
  it('audits all eight exact criteria and keeps audit output outside its own stable input graph', () => {
    const f = auditFixture(); const audited = f.audit();
    expect(audited).toMatchObject({ status: 'passed', executionHead, reviewHead, checkedCriteria: 8, checkedExecutions: 5, builderSelfCertified: false, separateReviewRequired: true });
    expect(audited.ledgerSha256).toBe(hash(`${JSON.stringify(f.outputs[`${prefix}/claim-ledger.json`], null, 2)}\n`));
    expect(audited.accountingSha256).toBe(hash(`${JSON.stringify(f.outputs[`${prefix}/suite-accounting.json`], null, 2)}\n`));
    expect(audited.auditedInputs.every((row: any) => !row.path.startsWith(`${prefix}/`))).toBe(true);
  });
  it('independently resolves pre-capture selectors against actual suite receipts', () => {
    const f = fixture(); f.manifest.claimBindings[6].executionIds = [];
    f.manifest.claimBindings[6].suiteBindings = ['viz-core', 'viz-render', 'mcp-server', 'root-core'];
    const outputs = f.derive();
    const audit = auditFinalCloseout({ executionHead, reviewHead, gitEvidence: { ancestor: true, changes: [] }, readFrozen: f.readFrozen,
      readOutput: (file: string) => Buffer.from(`${JSON.stringify(outputs[file], null, 2)}\n`) });
    expect(audit.status).toBe('passed');
  });
  it.each(['criterion', 'frozen-hash', 'relabel', 'invented-execution', 'missing-dependency', 'self-certified', 'source-change', 'rewritten-log'] as const)('rejects %s after output production', kind => {
    const f = auditFixture(); const ledger = f.outputs[`${prefix}/claim-ledger.json`];
    if (kind === 'criterion') ledger.claims[0].criterion += ' Relaxed by builder.';
    if (kind === 'frozen-hash') f.files.set(f.manifest.sources.near, Buffer.from('Changed after capture.'));
    if (kind === 'relabel') ledger.executionHead = reviewHead;
    if (kind === 'invented-execution') ledger.executions.push({ id: 'invented', exitCode: 0 });
    if (kind === 'missing-dependency') ledger.executions.find((row: any) => row.id === 'supplemental-proof').inputs = [];
    if (kind === 'self-certified') f.outputs[`${prefix}/review-handoff.json`].builderSelfCertified = true;
    if (kind === 'source-change') f.gitEvidence.changes = [{ status: 'A', path: 'packages/mcp-server/src/new-runtime.ts' }];
    if (kind === 'rewritten-log') f.gitEvidence.changes = [{ status: 'M', path: 'artifacts/product-reality/sprint-185/m05/four-suite-closeout/run-1/mcp-server.log' }];
    // Reseal changed generated ledger bytes in the index. This must still fail
    // at literal-source/receipt/graph checks rather than only an index hash.
    const indexed = f.outputs[`${prefix}/evidence-index.json`].generatedOutputs.find((row: any) => row.path === `${prefix}/claim-ledger.json`);
    indexed.sha256 = hash(`${JSON.stringify(ledger, null, 2)}\n`);
    expect(f.audit).toThrow();
  });
});
