import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { deriveCloseout } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditFinalCloseout, auditPublicRuntimeBytes } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

// Independent hand-built source bytes, not producer outputs or checker helpers.
// These tests test derivation integrity; they are not the real sprint capture.
const executionHead = 'a'.repeat(40);
const reviewHead = 'b'.repeat(40);
const prefix = 'artifacts/product-reality/sprint-185/m05/closeout';
const hash = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
const literalCriteria = Array.from({ length: 8 }, (_, index) => `CMOS criterion ${index}: exact punctuation — and spacing.\nSecond line ${index}.`);

function fixture() {
  const files = new Map<string, Buffer>();
  const historical = new Map<string, Buffer>();
  const readHistorical = (_commit: string, file: string): Buffer => {
    const bytes = historical.get(file); if (!bytes) throw new Error(`Missing historical source: ${file}`); return bytes;
  };
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
  const derive = (): Record<string, any> => {
    put(manifest.manifestPath, manifest);
    return deriveCloseout({ executionHead, reviewHead, manifest, suiteAccounting, readFrozen, readHistorical, publicHeadEquivalence: undefined, finalAudit: undefined });
  };
  const replaceSource = (name: string, value: any): void => {
    put(sources[name]!, value);
    // Reseal the input binding: semantic negative controls must reach their
    // actual predicate, not be masked by an earlier hash mismatch.
    for (const input of manifest.executions[0].inputs) if (input.path === sources[name]) input.sha256 = hash(files.get(input.path)!);
  };
  return { files, put, ref, snapshots, manifest, suiteAccounting, derive, replaceSource, readFrozen, historical, readHistorical };
}

function wave2Fixture() {
  const f = fixture();
  const outputPrefix = 'artifacts/product-reality/sprint-186/m06/closeout';
  const base = '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2';
  const oldNucleus = Array.from({ length: 19 }, (_, index) => `Base${index}`);
  const formerPorted = Array.from({ length: 8 }, (_, index) => `Former${index}`);
  const added = Array.from({ length: 23 }, (_, index) => `Added${index}`).sort();
  const nucleus = [...oldNucleus, ...formerPorted, ...added].sort();
  const declaration = (name: string, ids: string[]) => `export const ${name} = [${ids.map(id => `'${id}'`).join(', ')}] as const;`;
  const typesPath = 'packages/component-contracts/src/types.ts';
  f.put(typesPath, `${declaration('NUCLEUS_COMPONENT_IDS', nucleus)}\nexport type GovernedComponentId = NucleusComponentId;`);
  f.historical.set(typesPath, Buffer.from(`${declaration('NUCLEUS_COMPONENT_IDS', oldNucleus)}\n${declaration('PORTED_COMPONENT_IDS', formerPorted)}`));
  const proofPath = f.put('frozen/surface-proof.json', { rows: added.map(componentId => ({ componentId, passed: true })) });
  const before = { rows: [...nucleus, ...Array.from({ length: 59 }, (_, index) => `Other${index}`)].map(id => ({
    id, proposedClassification: 'recipe', reconciliationState: 'unchanged',
    surfaces: Object.fromEntries(['react', 'vue', 'generatedConsumer'].map(surface => [surface, { state: 'unavailable', evidence: [] }])),
  })) };
  const baseline = structuredClone(before);
  for (const row of baseline.rows.filter(row => added.includes(row.id))) for (const surface of Object.keys(row.surfaces))
    row.surfaces[surface] = { state: 'implemented-evidence-complete', evidence: [`${proofPath}#${row.id}`] } as never;
  const baselinePath = f.put('packages/component-contracts/registry/component-capability-baseline.v1.json', baseline);
  f.historical.set(baselinePath, Buffer.from(JSON.stringify(before)));
  f.put('packages/component-contracts/registry/component-reconciliation.proposed.v1.json', { approvedRuntimeCensus: null });
  f.replaceSource('baselineFold', { sourceHashes: [f.ref(baselinePath)], readinessReferences: [{ resolved: true }] });
  const packedConsumers = Object.fromEntries(['react', 'vue'].map(framework => [framework, f.put(`frozen/${framework}-packed.json`, {
    status: 'passed', strictCompatibilityCompile: { status: 'passed', skipLibCheck: false },
    [framework === 'react' ? 'proof' : 'packedProof']: { rootRuntimeIds: formerPorted, aliasRuntimeIds: formerPorted,
      compatibilitySpecifiers: { root: `/consumer/node_modules/@oods/components-${framework}/dist/index.js`, alias: `/consumer/node_modules/@oods/components-${framework}/dist/index.js` },
      compatibilityResolution: { runtimeSame: true, readinessSame: true, cssSame: true },
      resolvedSpecifiers: { [`@oods/components-${framework}`]: `/consumer/node_modules/@oods/components-${framework}/dist/index.js`,
        [`@oods/components-${framework}/ported`]: `/consumer/node_modules/@oods/components-${framework}/dist/index.js`,
        [`@oods/components-${framework}/readiness-ported`]: `/consumer/node_modules/@oods/components-${framework}/evidence/readiness.json`,
        '@oods/component-styles/css': '/consumer/node_modules/@oods/component-styles/dist/components.css',
        '@oods/component-styles/css-ported': '/consumer/node_modules/@oods/component-styles/dist/components.css' },
      compatibilityProof: formerPorted.map(componentId => ({ componentId, esmSame: true, cjsSame: true, ssrSame: true,
        rootMarkup: `<div data-oods-component="${componentId}"></div>`, aliasMarkup: `<div data-oods-component="${componentId}"></div>` })) },
  })]));
  f.manifest.sources.unionFold = f.put('frozen/unionFold.json', { nucleusComponents: nucleus, formerPortedComponents: formerPorted,
    aliasHorizon: 'sprint-187', readers: [{ path: 'emitter.ts', disposition: 'Root imports replace the former cohort split.' }], packedConsumers });
  const range = { base, head: executionHead, canonicalPaths: ['canonical.ts'], publicPaths: ['canonical.ts', 'root.ts'] };
  f.replaceSource('movers', { status: 'passed', s186: range, comparison: { s186: Object.fromEntries(['canonicalPaths', 'publicPaths']
    .map(key => [key, { missingFromDeclaration: [], extraInDeclaration: [] }])) } });
  f.manifest.sources.moversDeclaration = f.put('frozen/moversDeclaration.json', { s186: range });
  const notices = ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'].map(targetAddress => {
    const request = { targetAddress, body: [...added, ...formerPorted, 'Union fold', '/ported', '/readiness-ported', '/css-ported', 'Sprint 187', 'Emitter movers:', 'Deployment:'].join(' ') };
    return { request, requestSha256: hash(JSON.stringify(request)) };
  });
  f.replaceSource('noticePlan', { implementationHead: executionHead, addedNucleus: added, formerPorted, aliasHorizon: 'sprint-187', notices });
  f.replaceSource('deliveries', notices.map((notice, index) => ({ targetAddress: notice.request.targetAddress,
    requestSha256: notice.requestSha256, status: 'sent', messageId: `00000000-0000-4000-8000-00000000000${index + 1}` })));
  f.replaceSource('cmosMission', { id: 's186-m06', successCriteria: literalCriteria.slice(0, 6) });
  f.replaceSource('cmosOriginalMission', { id: 's186-m06', successCriteria: literalCriteria.slice(0, 6) });
  f.replaceSource('cmosSprint', { id: 'sprint-186', status: 'Active' });
  f.replaceSource('near', 'Sprint 186: BUILT, REVIEW PENDING.');
  f.manifest.missionId = 's186-m06'; f.manifest.manifestPath = 'artifacts/product-reality/sprint-186/m06/closeout-inputs/manifest.json';
  const currentRows = f.suiteAccounting.executions.map((row: any, index: number) => {
    const counts = { ...row.counts, todo: 0 };
    const raw = { testResults: [{ name: `/captured/tests/${row.suite}.spec.ts`, status: 'passed', assertionResults:
      Array.from({ length: counts.total }, (_, n) => ({ fullName: `assertion ${n}`, status: 'passed' })) }] };
    const rawReport = f.ref(f.put(`frozen/${row.suite}-current-raw.json`, { ...raw, startedAt: `current-${index}` }));
    const receipt = f.ref(f.put(`frozen/${row.suite}-current-receipt.json`, { suite: row.suite, measuredHead: executionHead, exitCode: 0,
      cleanBefore: { clean: true }, cleanAfter: { clean: true }, vitest: { tests: counts } }));
    return { ...row, counts, rawReport, receipt, raw };
  });
  const baselineRows = currentRows.map((row: any, index: number) => ({ ...row, id: `baseline-${row.id}`, cohort: 'sprint185Closeout', measuredHead: base,
    rawReport: f.ref(f.put(`frozen/${row.suite}-baseline-raw.json`, { ...row.raw, startedAt: `baseline-${index}` })),
    receipt: f.ref(f.put(`frozen/${row.suite}-baseline-receipt.json`, { suite: row.suite, measuredHead: base, exitCode: 0,
      cleanBefore: { clean: true }, cleanAfter: { clean: true }, vitest: { tests: row.counts } })),
  }));
  f.suiteAccounting.executions = [...baselineRows, ...currentRows];
  f.suiteAccounting.baselines = { sprint185Closeout: { aggregate: f.ref(f.put('frozen/baseline-aggregate.json', { workspace: '/captured' })),
    runs: [{ suiteExecutionIds: baselineRows.map((row: any) => row.id) }] } };
  f.suiteAccounting.closeout.aggregate = f.ref(f.put('frozen/current-aggregate.json', { workspace: '/captured' }));
  f.suiteAccounting.comparisons = currentRows.map((row: any, index: number) => ({ beforeExecutionId: baselineRows[index].id, afterExecutionId: row.id, fileDeltas: [] }));
  f.suiteAccounting.closeoutFailures = [];
  f.manifest.claimBindings = literalCriteria.slice(0, 6).map((_, criterionIndex) => ({ criterionIndex,
    executionIds: criterionIndex === 4 ? [] : ['supplemental-proof'],
    ...(criterionIndex === 4 ? { suiteBindings: currentRows.map((row: any) => row.suite) } : {}),
    evidencePaths: [...Object.values(f.manifest.sources).filter(value => typeof value === 'string'), 'frozen/supplemental.log', ...currentRows.map((row: any) => row.log.path)],
  }));
  for (const file of [f.manifest.sources.unionFold, f.manifest.sources.moversDeclaration]) f.manifest.executions[0].inputs.push(f.ref(file));
  const audit = (outputs: Record<string, any>) => auditFinalCloseout({ executionHead, reviewHead,
    manifestPath: f.manifest.manifestPath, readFrozen: f.readFrozen, readHistorical: f.readHistorical,
    readOutput: (file: string) => Buffer.from(`${JSON.stringify(outputs[file], null, 2)}\n`),
    gitEvidence: { ancestor: true, changes: [] }, publicGitEvidence: undefined, rangeGitEvidence: range });
  return { ...f, outputPrefix, added, baselinePath, packedConsumers, range, audit };
}

describe('Sprint 186 uses the existing ledger and independently audits six current claims', () => {
  it('derives six claims from plain CMOS snapshots without inherited review-carry requirements', () => {
    const f = wave2Fixture(); const outputs = f.derive();
    expect(outputs[`${f.outputPrefix}/claim-ledger.json`].headline).toEqual({ total: 6, proven: 6, unproven: 0 });
    expect(f.audit(outputs)).toMatchObject({ status: 'passed', checkedCriteria: 6, builderSelfCertified: false });
  });

  it.each(['boolean', 'markup', 'specifier'] as const)('rejects a root alias %s mismatch even when packed status flags and producer observations remain green', mismatch => {
    const f = wave2Fixture(); const outputs = f.derive();
    const file = f.packedConsumers.react; const packed = JSON.parse(f.files.get(file)!.toString());
    if (mismatch === 'boolean') packed.proof.compatibilityProof[0].esmSame = false;
    if (mismatch === 'markup') packed.proof.compatibilityProof[0].aliasMarkup = '<div>different content</div>';
    if (mismatch === 'specifier') packed.proof.compatibilitySpecifiers.alias = '/consumer/node_modules/@oods/components-react/dist/other.js';
    f.put(file, packed);
    const ledger = f.derive()[`${f.outputPrefix}/claim-ledger.json`];
    expect(ledger.claims[0].status).toBe('unproven');
    // Reseal the output index so this audit must inspect semantics, not only a stale hash.
    const index = outputs[`${f.outputPrefix}/evidence-index.json`];
    index.frozenInputs.find((row: any) => row.path === file).sha256 = hash(f.files.get(file)!);
    expect(() => f.audit(outputs)).toThrow(/Packed aliases differ|alias markup differs|alias resolves to another file/);
  });

  it('rejects fabricated census-free baseline identity promotion and actual mover omissions', () => {
    const f = wave2Fixture(); const outputs = f.derive();
    f.range.publicPaths.push('omitted-runtime.ts');
    expect(() => f.audit(outputs)).toThrow(/independent Git diff/);
    const second = wave2Fixture();
    const baseline = JSON.parse(second.files.get(second.baselinePath)!.toString()); baseline.rows[0].proposedClassification = 'native';
    second.put(second.baselinePath, baseline);
    second.replaceSource('baselineFold', { sourceHashes: [second.ref(second.baselinePath)], readinessReferences: [{ resolved: true }] });
    expect(second.derive()[`${second.outputPrefix}/claim-ledger.json`].claims[1].status).toBe('unproven');
  });

  it('independently rejects a missing comparison and changed raw assertion counts', () => {
    const f = wave2Fixture(); f.suiteAccounting.comparisons.pop();
    expect(() => f.audit(f.derive())).toThrow(/comparison is absent/);
    const second = wave2Fixture(); const row = second.suiteAccounting.executions.at(-1);
    const raw = JSON.parse(second.files.get(row.rawReport.path)!.toString()); raw.testResults[0].assertionResults.pop();
    second.put(row.rawReport.path, raw); row.rawReport.sha256 = hash(second.files.get(row.rawReport.path)!);
    expect(() => second.audit(second.derive())).toThrow(/actual raw assertion rows/);
  });
});

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
    const audit = () => auditFinalCloseout({ executionHead, reviewHead, gitEvidence, publicGitEvidence: undefined, readFrozen: f.readFrozen,
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
    const audit = auditFinalCloseout({ executionHead, reviewHead, gitEvidence: { ancestor: true, changes: [] }, publicGitEvidence: undefined, readFrozen: f.readFrozen,
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

describe('Independent public runtime equality uses actual Git bytes and disclosed test exclusions', () => {
  it.each(['test-only', 'runtime-change', 'runtime-renamed-to-test'] as const)('%s preserves the reviewed runtime boundary', kind => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'oods-s185-audit-git-'));
    const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    const commit = () => { git('add', '.'); git('-c', 'user.name=Audit fixture', '-c', 'user.email=audit@example.invalid', 'commit', '-qm', 'fixture'); return git('rev-parse', 'HEAD'); };
    try {
      git('init', '-q');
      const directory = path.join(root, 'packages/mcp-server/src/codegen'); mkdirSync(directory, { recursive: true });
      writeFileSync(path.join(directory, 'runtime.ts'), 'export const runtime = 1;\n');
      writeFileSync(path.join(directory, 'readiness.test.ts'), 'expect(rows).toHaveLength(14);\n');
      const implementationHead = commit();
      if (kind === 'test-only') writeFileSync(path.join(directory, 'readiness.test.ts'), 'expect(rows).toHaveLength(nucleus.length);\n');
      if (kind === 'runtime-change') writeFileSync(path.join(directory, 'runtime.ts'), 'export const runtime = 2;\n');
      if (kind === 'runtime-renamed-to-test') renameSync(path.join(directory, 'runtime.ts'), path.join(directory, 'runtime.test.ts'));
      const proof = auditPublicRuntimeBytes({ root, implementationHead, executionHead: commit() });
      expect(proof.excludeTests).toBe(true);
      if (kind === 'test-only') {
        expect(proof.changedPaths).toEqual([]);
        expect(proof.excludedTestPaths).toEqual(['packages/mcp-server/src/codegen/readiness.test.ts']);
      } else expect(proof.changedPaths).toEqual(['packages/mcp-server/src/codegen/runtime.ts']);
      if (kind === 'runtime-renamed-to-test') expect(proof.excludedTestPaths).toEqual(['packages/mcp-server/src/codegen/runtime.test.ts']);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

// Synthetic seven-criterion graph. It exercises new predicates, not real build claims.
function freshFixture() {
  const f = wave2Fixture();
  const base = '21c7c31906fbb81d049b943155c64ed78409fb9f';
  const outputPrefix = 'artifacts/product-reality/sprint-187/m06/closeout';
  const paths = ['User/detail', 'Product/detail', 'Usage/list', 'Subscription/inline', 'Transaction/timeline', 'Product/list', 'Product/form', 'Product/inline', 'Organization/list', 'Organization/detail', 'Organization/card', 'Subscription/detail', 'Subscription/form', 'Subscription/card'];
  const targets = ['react', 'vue'];
  const added = Array.from({ length: 14 }, (_, index) => `New${index}`).sort();
  const prior = Array.from({ length: 50 }, (_, index) => `Prior${index}`);
  const ids = [...prior, ...added].sort();
  const declaration = (values: string[]) => `export const NUCLEUS_COMPONENT_IDS = [${values.map(value => `'${value}'`).join(',')}] as const;`;
  const types = 'packages/component-contracts/src/types.ts'; f.put(types, declaration(ids)); f.historical.set(types, Buffer.from(declaration(prior)));
  const source = (name: string, value: unknown) => { const file = f.put(`frozen/fresh/${name}.json`, value); f.manifest.sources[name] = file; return file; };
  source('cmosMission', { id: 's187-m06', successCriteria: literalCriteria.slice(0, 7) });
  source('cmosOriginalMission', { id: 's187-m06', successCriteria: literalCriteria.slice(0, 7) });
  source('cmosSprint', { id: 'sprint-187', status: 'Active' }); source('near', 'Sprint 187: BUILT, REVIEW PENDING.');
  const names = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
  const contexts = ['detail', 'list', 'form', 'timeline', 'card', 'inline'];
  source('freshCensus', { head: executionHead, profile: 'build', schemaCount: 66, greenSchemas: 66, generationCells: 132, greenCells: 132, governedComponentCount: 64, objects: names, contexts,
    rows: names.flatMap(object => contexts.map(context => ({ input: { object, context }, composed: true, green: true, ungoverned: [],
      cells: targets.map(framework => ({ framework, status: 'ok', artifactPresent: true, errors: [] })) }))) });
  source('cohort', { groups: [{ paths }], frameworks: targets });
  const runtimeDir = 'frozen/live';
  f.put(`${runtimeDir}/source.diff`, ''); f.put(`${runtimeDir}/submitted-packages/tarballs/package.tgz`, 'packed');
  const gates = ['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render', 'mount', 'hydration', 'shared-css-resolution', 'interaction-evidence'];
  const cells = paths.flatMap(value => targets.map(framework => {
    const [object, context] = value.split('/'); const schemaName = `fresh-${object}-${context}`;
    const schema = { version: '1.0.0', screens: [{ id: 'root', component: 'Text' }] };
    const composition = { input: { object, context }, sourceHead: executionHead, sourceDiffSha256: `sha256:${hash('')}`, sourceDiffPath: 'source.diff', schemaSha256: `sha256:${hash(`${JSON.stringify(schema, null, 2)}\n`)}` };
    f.put(`${runtimeDir}/live-generation/${schemaName}/composition.json`, { schema, composition });
    const contents = `source ${value} ${framework}`;
    f.put(`${runtimeDir}/live-generation/${schemaName}/${framework}/artifact.json`, { contentHash: 'artifact', files: [{ contents, contentHash: `sha256:${hash(contents)}` }] });
    const sourcePath = `live-generation/${schemaName}/${framework}/Generated.ts`; f.put(`${runtimeDir}/${sourcePath}`, contents);
    const report = `cells/${schemaName}/${framework}/report.json`;
    const log = `cells/${schemaName}/${framework}/proof.log`; f.put(`${runtimeDir}/${log}`, 'Synthetic command and browser observations.');
    f.put(`${runtimeDir}/${report}`, { framework, status: 'passed', gates: gates.map(name => ({ name, status: 'passed', logs: [log] })),
      accounting: { balanced: true, namedUnprovenCount: 0 }, localTarballs: [{ name: 'package', installSpec: 'file:./tarballs/package.tgz', sha256: `sha256:${hash('packed')}`, bytes: 6 }],
      browser: { runtimeErrors: [], hydrationInvariant: { equal: true }, boundValues: [{ passed: true, visible: true }], componentCounts: Object.fromEntries(added.map(name => [name, 1])) } });
    return { schema: schemaName, framework, composition, report, reportSha256: f.ref(`${runtimeDir}/${report}`).sha256,
      generation: { sourcePath, sourceSha256: `sha256:${hash(contents)}`, artifactContentHash: 'artifact', fingerprint: { profile: 'build', sourceOfArtifact: 'current-in-run-output' } } };
  }));
  const livePath = f.put(`${runtimeDir}/report.json`, { status: 'passed', freshInputs: paths.map(value => { const [object, context] = value.split('/'); return { object, context }; }), selected: 224, passed: 224, notApplicable: 0, applicable: 224, failed: 0, skipped: 0, cellCount: 28, cells });
  f.manifest.sources.liveConsumers = livePath;
  for (const name of ['savedOriginal', 'savedSuccessor']) {
    const rows = Array.from({ length: 16 }, (_, i) => {
      const input = f.ref(f.put(`frozen/stores/${name}/${i}.json`, { schema: i }));
      return { input, reachable: true, cells: targets.map(framework => {
        const file = `frozen/fresh/${name}-${i}-${framework}.json`; f.put(file, { status: 'ok', artifact: {} });
        return { framework, status: 'ok', artifactPresent: true, response: { path: path.basename(file), sha256: f.ref(file).sha256 } };
      }) };
    });
    source(name, { head: executionHead, total: 16, reachable: 16, generatedCells: 32, rows });
  }
  source('savedCompatibility', { originalInputsUnchanged: true, successorInputsUnchanged: true, historicalNegativeRetained: true, originalBaseline: 15, successorBaseline: 16, originalDeltaExplanation: 'Synthetic repaired source; historical bytes retained.', references: [f.ref(f.put('frozen/old-negative.json', { status: 'error' }))] });
  const oldRows = [...ids, ...Array.from({ length: 45 }, (_, i) => `Other${i}`)].map(id => ({ id, proposedClassification: 'native', reconciliationState: 'historical', surfaces: {} }));
  const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json'; f.historical.set(baselinePath, Buffer.from(JSON.stringify({ rows: oldRows })));
  const baseline = structuredClone(oldRows) as any[]; const surfaceFile = f.put('frozen/fresh/surfaces.json', { rows: added.map(componentId => ({ componentId })) });
  for (const row of baseline.filter(row => added.includes(row.id))) row.surfaces = Object.fromEntries(['react', 'vue', 'generatedConsumer', 'accessibility', 'theme', 'interaction'].map(surface => [surface,
    { state: ['react', 'vue', 'generatedConsumer'].includes(surface) ? 'implemented-evidence-complete' : 'unverified', evidence: [`${surfaceFile}#${row.id}`] }]));
  f.put(baselinePath, { rows: baseline });
  f.put('packages/component-contracts/registry/component-obligation-scope.v1.json', { decisionId: 1788, controllingObligationDenominator: 109, approvedRuntimeCensus: null });
  source('baselineFold', { denominator: 109, readinessReferences: [{ resolved: true }], sourceHashes: [f.ref(baselinePath)] });
  const readiness = f.ref(f.put('frozen/fresh/readiness.json', { status: 'passed', failures: [], totals: { references: 778, resolved: 778 } }));
  const cellNames = added.flatMap(name => targets.map(target => `${target}/${name}`));
  const rawTests = (red?: string) => ({ success: !red, numPassedTests: red ? 27 : 28, numFailedTests: red ? 1 : 0, numPendingTests: 0, testResults: [{ assertionResults: cellNames.map(name => ({ fullName: `Sprint 187 built package export cells '${name}'`, status: name === red ? 'failed' : 'passed' })) }] });
  const positiveExports = f.ref(f.put('frozen/fresh/positive.json', rawTests()));
  const mutants = cellNames.map(selectedCell => {
    const [framework, component] = selectedCell.split('/'); const prefix = `frozen/mutants/${selectedCell}`;
    const packageReport = f.put(`${prefix}-red.json`, rawTests(selectedCell));
    const readinessReport = f.put(`${prefix}-readiness.json`, { status: 'failed', failures: [{ target: framework, componentId: component }] });
    const log = f.put(`${prefix}.log`, `${selectedCell} observed red and restore`);
    return { selectedCell, status: 'passed', sourceSha256Before: 'before', sourceSha256Deleted: 'deleted', restoredByteIdentically: true,
      selectedRed: { packageRedCells: [selectedCell], readinessRedCells: [selectedCell], packageReport, readinessReport, packageRun: { exitCode: 1, log }, readinessRun: { exitCode: 1, log } },
      restoredGreen: { packageReport: positiveExports.path, readinessReport: readiness.path, observations: cellNames.map(cell => ({ cell, status: 'passed' })), packageRun: { exitCode: 0, log }, readinessRun: { exitCode: 0, log } } };
  });
  source('rootEvidence', { governedIds: ids, addedIds: added, readiness, positiveExports, mutations: [f.ref(f.put('frozen/fresh/mutations.json', { mutants }))] });
  const range = { base, head: executionHead, canonicalPaths: ['canonical.ts'], publicPaths: ['canonical.ts', 'discovery.ts'] };
  source('movers', { status: 'passed', s187: range, comparison: { s187: Object.fromEntries(['canonicalPaths', 'publicPaths'].map(key => [key, { missingFromDeclaration: [], extraInDeclaration: [] }])) } });
  source('moversDeclaration', { s187: range });
  const notices = ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos'].map(targetAddress => { const request = { targetAddress, body: [...added, 'Deployment: pending', 'retain-109', '/ported', '/readiness-ported', '/css-ported'].join(' ') }; return { request, requestSha256: hash(JSON.stringify(request)) }; });
  source('noticePlan', { implementationHead: executionHead, addedNucleus: added, notices, status: 'prepared', sendsExecuted: 0, deployment: 'pending' });
  source('deliveries', notices.map(row => ({ targetAddress: row.request.targetAddress, requestSha256: row.requestSha256, status: 'prepared', messageId: null })));
  source('carries', { greenfieldWorkflow: 'partial', builderSelfCertified: false, rows: [1315, 1318, 1319, 1320, 1321, 1322, 1372, 1374, 1375, 1379, 1384].map(id => ({ id, status: 'pending', remainingWork: 'Named work remains owed.' })) });
  const previous = f.suiteAccounting.baselines.sprint185Closeout;
  f.suiteAccounting.baselines = { sprint186Closeout: { ...previous, measuredHead: '740e8405fa8e094ab903a19e6e551fbe8bff2de2' } };
  for (const row of f.suiteAccounting.executions) if (row.cohort === 'sprint185Closeout') row.cohort = 'sprint186Closeout';
  f.manifest.missionId = 's187-m06'; f.manifest.manifestPath = 'artifacts/product-reality/sprint-187/m06/closeout-inputs/manifest.json';
  const sourcePaths = Object.values(f.manifest.sources).filter((value): value is string => typeof value === 'string');
  f.manifest.executions[0].inputs = sourcePaths.map(f.ref);
  const suiteRows = f.suiteAccounting.executions.filter((row: any) => row.cohort === 'closeout');
  f.manifest.claimBindings = literalCriteria.slice(0, 7).map((_, criterionIndex) => ({ criterionIndex, executionIds: criterionIndex === 5 ? [] : ['supplemental-proof'],
    ...(criterionIndex === 5 ? { suiteBindings: suiteRows.map((row: any) => row.suite) } : {}), evidencePaths: [...sourcePaths, 'frozen/supplemental.log', ...suiteRows.map((row: any) => row.log.path)] }));
  const replace = (key: string, value: unknown) => { f.put(f.manifest.sources[key], value); f.manifest.executions[0].inputs = sourcePaths.map(f.ref); };
  const audit = (outputs: Record<string, any>) => auditFinalCloseout({ executionHead, reviewHead, manifestPath: f.manifest.manifestPath,
    readFrozen: f.readFrozen, readHistorical: f.readHistorical, readOutput: (file: string) => Buffer.from(`${JSON.stringify(outputs[file], null, 2)}\n`),
    gitEvidence: { ancestor: true, changes: [] }, publicGitEvidence: undefined, rangeGitEvidence: range });
  return { ...f, outputPrefix, replace, audit };
}

describe('Sprint 187 proves seven literal criteria without claiming served delivery', () => {
  it('derives and independently audits the complete synthetic graph', () => {
    const f = freshFixture(); const output = f.derive();
    expect(output[`${f.outputPrefix}/claim-ledger.json`].headline).toEqual({ total: 7, proven: 7, unproven: 0 });
    expect(f.audit(output)).toMatchObject({ status: 'passed', checkedCriteria: 7, builderSelfCertified: false });
  });
  it.each(['freshCensus', 'liveConsumers', 'deliveries', 'carries'])('rejects a resealed false %s claim at its semantic gate', (key) => {
    const f = freshFixture(); const value = JSON.parse(f.readFrozen(f.manifest.sources[key]).toString());
    if (key === 'freshCensus') value.rows[0].input.context = 'card';
    if (key === 'liveConsumers') value.cells[0].composition.sourceHead = 'c'.repeat(40);
    if (key === 'deliveries') { value[0].status = 'sent'; value[0].messageId = 'invented'; }
    if (key === 'carries') value.rows[0].status = 'completed';
    f.replace(key, value); const outputs = f.derive();
    expect(outputs[`${f.outputPrefix}/claim-ledger.json`].headline.unproven).toBeGreaterThan(0);
    expect(() => f.audit(outputs)).toThrow();
  });
  it('rejects a passed runtime gate whose command logs were removed and report hashes resealed', () => {
    const f = freshFixture(); const live = JSON.parse(f.readFrozen(f.manifest.sources.liveConsumers).toString());
    const file = `frozen/live/${live.cells[0].report}`; const report = JSON.parse(f.readFrozen(file).toString());
    report.gates[0].logs = []; f.put(file, report); live.cells[0].reportSha256 = f.ref(file).sha256;
    f.replace('liveConsumers', live); const output = f.derive();
    expect(output[`${f.outputPrefix}/claim-ledger.json`].headline.unproven).toBeGreaterThan(0);
    expect(() => f.audit(output)).toThrow();
  });
  it('independent audit checks raw export observations even when a positive headline is forged', () => {
    const f = freshFixture(); const outputs = f.derive();
    const root = JSON.parse(f.readFrozen(f.manifest.sources.rootEvidence).toString());
    const raw = JSON.parse(f.readFrozen(root.positiveExports.path).toString()); raw.testResults[0].assertionResults[0].status = 'failed';
    f.put(root.positiveExports.path, raw); root.positiveExports.sha256 = f.ref(root.positiveExports.path).sha256; f.replace('rootEvidence', root);
    const resealed = f.derive();
    expect(() => f.audit(resealed)).toThrow();
    expect(outputs[`${f.outputPrefix}/review-handoff.json`].sprintStatus).toBe('Active');
  });
});
