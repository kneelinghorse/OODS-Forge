import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveSprint195Closeout, verifySprint195Runtime, verifySprint195Viz, verifySprint195Attribution, verifySprint195Bites, verifySprint195CI } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { deriveRange, deriveMovers, S195_BASE, S195_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { buildNotices, requestHash } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const read = (file: string) => readFileSync(`${root}/${file}`);
const json = (file: string) => JSON.parse(read(file).toString());
// These are historical operands used to exercise the verifier, never current-head claims.
const head = 'c6453c97883feb38dda203628684a7bb9643765d';
const runtimePath = 'artifacts/product-reality/sprint-195/m06/runtime-final/runtime-cells.v1.json';
const runtimeInput = () => ({ implementationHead: head, runtimePath, read,
  runtime: json(runtimePath), dashboard: json('artifacts/product-reality/sprint-195/m06/runtime-final/layouts/dashboard/runtime-cells.v1.json'),
  placement: json('artifacts/product-reality/sprint-195/m06/runtime-verification.json') });
const vizInput = () => ({ read,
  registry: json('packages/viz-core/src/registry/viz-recipes.v1.json'), census: json('artifacts/product-reality/sprint-195/m06/viz-census/viz-census.json'),
  observations: json('artifacts/product-reality/sprint-195/m06/viz-census/viz-observations.json'),
  patterns: json('packages/viz-core/src/registry/viz-patterns.v1.json'), patternCensus: json('artifacts/product-reality/sprint-195/m05/patterns/pattern-observations.json'),
  taxonomy: json('packages/viz-core/src/registry/viz-taxonomy.v1.json') });

describe('Sprint195 closeout producer verifies retained reality rather than summary promotion', () => {
  it('accepts the actual154+4+48 proof populations without claiming HTML full applications', () => {
    expect(verifySprint195Runtime(runtimeInput())).toEqual({ canonical: 154, dashboard: 4, chartThemeScopes: 48 });
  });
  it.each(['wrong-head', 'missing-dashboard', 'missing-theme', 'promoted-html'] as const)('rejects %s in the runtime claim', fault => {
    const input = runtimeInput();
    if (fault === 'wrong-head') input.implementationHead = S195_BASE;
    if (fault === 'missing-dashboard') input.dashboard.rows.pop();
    if (fault === 'missing-theme') input.placement.proof.pop();
    if (fault === 'promoted-html') input.placement.htmlFullApplicationProof = 'passed';
    expect(() => verifySprint195Runtime(input)).toThrow();
  });
  it.each(['matchesPublicSvg', 'named-image', 'certification', 'svg-bytes', 'installed-pack'] as const)('rejects a corrupted raw %s operand despite a green summary', fault => {
    const input = runtimeInput(), prefix = 'artifacts/product-reality/sprint-195/m06/runtime-final/cells/Invoice/detail/react';
    input.read = (file: string) => {
      if (fault === 'named-image' && file === `${prefix}/chart-themes/A-light-accessibility-tree.txt`) return Buffer.from('generic image');
      const value = read(file);
      if (fault === 'matchesPublicSvg' && file === `${prefix}/chart-themes/report.json`) { const row = JSON.parse(value.toString()); row.cells[0].charts[0].matchesPublicSvg = false; return Buffer.from(JSON.stringify(row)); }
      if (['certification', 'svg-bytes'].includes(fault) && file === `${prefix}/chart-themes/A-light-certification.json`) { const row = JSON.parse(value.toString()); if (fault === 'certification') row.certification.conformant = false; else row.rendered.svg += ' '; return Buffer.from(JSON.stringify(row)); }
      if (fault === 'installed-pack' && file.endsWith('/submitted-packages/inventory.json')) { const rows = JSON.parse(value.toString()); rows[0].sha256 = '0'.repeat(64); return Buffer.from(JSON.stringify(rows)); }
      return value;
    };
    expect(() => verifySprint195Runtime(input)).toThrow();
  });
  it('accepts measured public pixels, structural authoring limits, HC deferrals and bubble failures together', () => {
    expect(verifySprint195Viz(vizInput())).toMatchObject({ classified: 34, coreSurfaceComplete: 13, typedGaps: 7 });
  });
  it.each(['hc-promoted', 'pattern-dropped', 'pattern-source', 'bubble-promoted', 'accuracy-control', 'gap-untyped', 'wrong-family'] as const)('rejects %s instead of upgrading coverage', fault => {
    const input = vizInput();
    if (fault === 'hc-promoted') input.observations.observations.find((row: any) => row.chartType === 'heatmap').scopes.find((row: any) => row.theme === 'hc').status = 'rendered';
    if (fault === 'pattern-dropped') input.patternCensus.cells.pop();
    if (fault === 'pattern-source') input.read = (file: string) => file === input.patterns[0].specPath ? Buffer.from('{}') : read(file);
    if (fault === 'bubble-promoted') input.observations.observations.find((row: any) => row.chartType === 'bubble_map').scopes[0].conformant = true;
    if (fault === 'accuracy-control') input.observations.accuracyControls[0].grade.findings = [];
    if (fault === 'wrong-family') input.taxonomy.identities[0].family = 'financial';
    if (fault === 'gap-untyped') delete input.taxonomy.coreCells.find((row: any) => row.status === 'typed-gap').reason;
    expect(() => verifySprint195Viz(input)).toThrow();
  });
  const biteInput = () => ({ implementationHead: head, read, index: { head, builderSelfCertified: false, rows: [
    ['retirement-gate', 's195-m01', 'artifacts/product-reality/sprint-195/m01/gate/verification.json'],
    ['accuracy-rule', 's195-m04', 'artifacts/product-reality/sprint-195/m04/bite/accuracy-bite.json'],
    ['viz-mutations', 's195-m06', 'artifacts/product-reality/sprint-195/m06/bites/verification.json'],
    ['runtime-emitter', 's195-m07', 'artifacts/product-reality/sprint-195/m06/runtime-final/emitter-bite.json'],
  ].map(([id, missionId, path]) => ({ id, missionId, status: 'passed', receipt: { path, sha256: createHash('sha256').update(read(path!)).digest('hex') } })) } });
  it('binds actual retirement, accuracy, three selected viz mutations and emitter red-to-green receipts', () => {
    expect(() => verifySprint195Bites(biteInput())).not.toThrow();
  });
  it.each(['missing', 'wrong-head', 'wrong-hash', 'wrong-attempt'] as const)('rejects %s mutation evidence even when the index says passed', fault => {
    const input = biteInput();
    if (fault === 'missing') input.index.rows.pop();
    if (fault === 'wrong-head') input.implementationHead = S195_BASE;
    if (fault === 'wrong-hash') input.index.rows[0]!.receipt.sha256 = '0'.repeat(64);
    if (fault === 'wrong-attempt') input.read = (file: string) => { const value = read(file); if (!file.endsWith('/m06/bites/attempt-3/bites.json')) return value; const result = JSON.parse(value.toString()); result.records[0].restoredByteIdentically = false; return Buffer.from(JSON.stringify(result)); };
    expect(() => verifySprint195Bites(input)).toThrow();
  });
});

describe('Sprint195 producer manifest contract', () => {
  // In-memory orchestration fixture: its synthetic metadata is never written as executed proof.
  const fixture = () => {
    const base = 'artifacts/product-reality/sprint-195/m07', buffers = new Map<string, Buffer>();
    const aliases = new Map<string, string>([[`${base}/runtime`, 'artifacts/product-reality/sprint-195/m06/runtime-final']]);
    const sources: Record<string, string> = {};
    const sha = (value: Buffer) => createHash('sha256').update(value).digest('hex');
    const put = (key: string, value: unknown, file = `${base}/${key}.json`) => { sources[key] = file; buffers.set(file, Buffer.from(JSON.stringify(value))); };
    const link = (key: string, file: string) => { sources[key] = file; };
    const readFrozen = (file: string): Buffer => { if (buffers.has(file)) return buffers.get(file)!; for (const [prefix, actual] of aliases) if (file.startsWith(`${prefix}/`)) return read(`${actual}${file.slice(prefix.length)}`); return read(file); };
    const history = new Map<string, Buffer>();
    const readHistorical = (commit: string, file: string) => { const key = `${commit}:${file}`; if (!history.has(key)) history.set(key, execFileSync('git', ['show', key], { cwd: root, maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] })); return history.get(key)!; };
    const reference = (path: string) => ({ path, sha256: sha(readFrozen(path)) });
    link('missions', `${base}/missions.json`);
    put('runtime', json(runtimePath), `${base}/runtime/runtime-cells.v1.json`);
    put('dashboardRuntime', runtimeInput().dashboard); put('runtimePlacement', runtimeInput().placement); put('runtimeValidation', { issues: [] });
    link('componentLedger', 'artifacts/product-reality/sprint-193/m07/component-ledger.json'); link('componentExport', 'artifacts/structured-data/oods-components-2026-09-11-s193-m07.json');
    const proofRefs = [];
    for (const target of ['react', 'vue']) {
      const prefix = `${base}/${target}-theme`; aliases.set(prefix, `artifacts/product-reality/sprint-193/m07/${target}-theme`);
      put(`${target}Theme`, json(`artifacts/product-reality/sprint-193/m07/${target}-theme/report.json`), `${prefix}/report.json`);
      put(`${target}Measured`, json(`artifacts/product-reality/sprint-193/m07/${target}-measured.json`));
      proofRefs.push(reference(sources[`${target}Theme`]!), reference(sources[`${target}Measured`]!));
    }
    put('componentProof', { head, status: 'passed', references: proofRefs, sourceInputs: ['packages/component-contracts/package.json', 'packages/component-styles/package.json', 'packages/components-react/package.json', 'packages/components-vue/package.json', 'packages/tokens/src/tokens/brands/A/base.json', 'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs'].map(reference) }); put('componentRetention', { base: S195_BASE, head, changedPaths: [], scope: ['packages/components-react/src'] });
    const viz = vizInput(); for (const [key, value] of Object.entries({ registry: viz.registry, vizCensus: viz.census, vizObservations: viz.observations, patternRegistry: viz.patterns, patternCensus: viz.patternCensus, taxonomy: viz.taxonomy })) put(key, value);
    put('taxonomyCensus', { status: 'passed', head, summary: viz.taxonomy.summary, sha256: sha(readFrozen(sources.taxonomy!)) });
    link('toolLedger', 'packages/mcp-server/registry/tool-capability-ledger.v1.json'); const tools = json(sources.toolLedger!);
    // A census can precede the runtime implementation commit; these are distinct identities.
    tools.head = S195_BASE; put('toolLedger', tools, sources.toolLedger!);
    put('toolProof', { censusHead: tools.head, implementationHead: head, byteIdentical: true, sha256: sha(readFrozen(sources.toolLedger!)) });
    put('health', { status: 'ok', productReality: { runtime: { ...runtimeInput().runtime.summary, head }, viz: viz.taxonomy.summary, tools: { entries: 24, byTier: tools.summary.byTier, head: tools.head } } });
    put('componentCensus', { ...json('artifacts/product-reality/sprint-195/m06/final-composition/report.json'), head }); link('schemaMovement', 'artifacts/product-reality/sprint-195/m06/schema-movement.json');
    link('originalStore', 'artifacts/product-reality/sprint-194/m07/saved-original/report.json'); link('successorStore', 'artifacts/product-reality/sprint-194/m07/saved-successor/report.json'); link('compatibility', 'artifacts/product-reality/sprint-194/m07/saved-compatibility.json');
    put('paletteMigration', { qualificationHead: '52b0da991705c4c565987bc9faf7738ba00d885e', builderSelfCertified: false, receipt: reference('artifacts/product-reality/sprint-195/m05/golden-migration/golden-attribution.json') });
    put('bitesIndex', { head, builderSelfCertified: false, rows: [
      ['retirement-gate', 's195-m01', 'artifacts/product-reality/sprint-195/m01/gate/verification.json'],
      ['accuracy-rule', 's195-m04', 'artifacts/product-reality/sprint-195/m04/bite/accuracy-bite.json'],
      ['viz-mutations', 's195-m06', 'artifacts/product-reality/sprint-195/m06/bites/verification.json'],
      ['runtime-emitter', 's195-m07', 'artifacts/product-reality/sprint-195/m06/runtime-final/emitter-bite.json'],
    ].map(([id, missionId, file]) => ({ id, missionId, status: 'passed', receipt: reference(file!) })) });
    link('soak', 'artifacts/product-reality/sprint-195/m06/soak/investigation.json');
    put('reportFixture', { success: true }); put('preFreeze', { status: 'passed', skipped: 0, reports: [{ failed: 0, skipped: 0, ...reference(sources.reportFixture!) }] });
    const movedPath = 'domains/saas-billing/objects/Invoice.object.yaml';
    put('movers', { status: 'passed', s195: { base: S195_BASE, head, publicPaths: [movedPath] } });
    put('patchFixture', 'diff fixture'); put('moverAttribution', { base: S195_BASE, head, unattributedPaths: [], patch: reference(sources.patchFixture!), rows: [{ path: movedPath, missions: ['s195-m06'], commits: [head], reason: 'In-memory manifest contract only.', beforeSha256: sha(readHistorical(S195_BASE, movedPath)), afterSha256: sha(readHistorical(head, movedPath)), evidence: [reference(sources.reportFixture!)], hunks: [{ missions: ['s195-m06'], commits: [head], reason: 'Authored chart declaration.' }] }] });
    const request = { body: "theme:'hc' pattern artifact.certify health.productReality.viz builderSelfCertified:false" };
    put('noticePlan', { implementationHead: head, status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliverySprint: 'sprint-196', targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'], notices: Array.from({ length: 3 }, () => ({ request, requestSha256: requestHash(request) })) });
    const jobNames = ['coverage', 'product-reality-consumers', 'component-packages', 'a11y-contract', 'portable-runtime', 'runtime-cells', 'viz-determinism'];
    put('rawRun', { id: 1, head_sha: head }); put('rawJobs', { jobs: jobNames.map((name, index) => ({ id: index + 1, name, conclusion: 'success', status: 'completed' })) });
    put('ci', { baseRefName: 'OODS-pro', headRefName: 'codex/sprint-195-visualization-breadth', url: 'https://github.com/fixture/only', sourceEquivalence: [{ headSha: head, implementationHead: head, scope: S195_PUBLIC_RUNTIME_SCOPE, changedPaths: [] }], jobs: jobNames.map((name, index) => ({ name, jobId: index + 1, conclusion: 'success', runId: 1, headSha: head, run: reference(sources.rawRun!), jobInventory: reference(sources.rawJobs!) })) });
    put('prose', { exitCode: 0 }); put('near', 'Increment 14 BUILT, REVIEW PENDING');
    const missions = json(sources.missions!).missions;
    const manifest: any = { missionId: 's195-m07', implementationHead: head, sources, executions: [{ id: 'fixture', head, evidencePaths: [sources.reportFixture] }], bindings: missions.flatMap((mission: any) => mission.successCriteria.map((_: string, index: number) => ({ missionId: mission.id, criterionIndex: index + 1, executionIds: ['fixture'], evidencePaths: [sources.reportFixture] }))) };
    const suiteAccounting = { status: 'passed', executionHead: head, reviewHead: head, validationIssues: [], unattributedDeltas: [], closeout: { runs: [{ suiteExecutionIds: ['a', 'b', 'c', 'd', 'e'] }] }, comparisons: [{}, {}, {}, {}, {}], references: [] };
    return { executionHead: head, reviewHead: head, manifest, readFrozen, readHistorical, suiteAccounting, publicHeadEquivalence: { ancestor: true, scope: S195_PUBLIC_RUNTIME_SCOPE, changedPaths: [] } };
  };
  it('derives28 literal claims with fresh-proof source shapes and preserves all recorded limits', () => {
    const result = deriveSprint195Closeout(fixture());
    const ledger = result['artifacts/product-reality/sprint-195/m07/closeout/claim-ledger.json'];
    expect(ledger.headline).toEqual({ total: 28, proven: 28, unproven: 0 }); expect(ledger.builderSelfCertified).toBe(false);
    const handoff = result['artifacts/product-reality/sprint-195/m07/closeout/review-handoff.json'];
    expect(handoff.limitations.join(' ')).toContain('retention certification is not established');
  });
  it.each(['censusHead', 'implementationHead'])('rejects a tool proof with the wrong %s binding', field => {
    const input = fixture(), proofPath = input.manifest.sources.toolProof;
    const proof = JSON.parse(input.readFrozen(proofPath).toString());
    proof[field] = field === 'censusHead' ? head : S195_BASE;
    const readFrozen = input.readFrozen;
    expect(() => deriveSprint195Closeout({ ...input, readFrozen: (file: string) => file === proofPath ? Buffer.from(JSON.stringify(proof)) : readFrozen(file) })).toThrow();
  });
  it('rejects duplicate criterion bindings and unrecorded decision qualifications', () => {
    const input = fixture(); input.manifest.bindings[1] = input.manifest.bindings[0];
    expect(() => deriveSprint195Closeout(input)).toThrow();
    const qualified = fixture(); Object.assign(qualified.manifest.bindings[0], { disposition: 'documented-limit', decisionIds: [99999], qualification: 'No such approved decision.' });
    expect(() => deriveSprint195Closeout(qualified)).toThrow();
  });
  it('rejects relabeled CI run heads and unbound raw job conclusions', () => {
    const input = fixture(), ci = JSON.parse(input.readFrozen(input.manifest.sources.ci).toString());
    expect(() => verifySprint195CI({ ci, implementationHead: head, read: input.readFrozen })).not.toThrow();
    const relabeled = structuredClone(ci); relabeled.jobs[0].headSha = S195_BASE;
    expect(() => verifySprint195CI({ ci: relabeled, implementationHead: head, read: input.readFrozen })).toThrow();
    const promoted = structuredClone(ci); promoted.jobs[0].conclusion = 'failure';
    expect(() => verifySprint195CI({ ci: promoted, implementationHead: head, read: input.readFrozen })).toThrow();
  });
});

describe('Sprint195 mover and reconnect boundaries', () => {
  const range = deriveRange(S195_BASE, head, root, S195_PUBLIC_RUNTIME_SCOPE);
  const options = { sprintId: 'sprint-195', missionId: 's195-m07', base: S195_BASE };
  it('covers authored domain data, taxonomy, schemas and the producing scripts from the locked base', () => {
    expect(range.publicPaths).toEqual(expect.arrayContaining(['domains/saas-billing/objects/Invoice.object.yaml', 'domains/saas-billing/examples/usage-api-calls.json', 'docs/viz/taxonomy.md', 'src/core/trait-definition.ts', 'scripts/product-reality/s195-pattern-input-schema.ts']));
    expect(deriveMovers(head, { s195: range }, root, options).status).toBe('passed');
    const omitted = { ...range, publicPaths: range.publicPaths.filter((file: string) => !file.endsWith('Invoice.object.yaml')) };
    expect(() => deriveMovers(head, { s195: omitted }, root, options)).toThrow(/declared mover union differs/);
    expect(() => deriveMovers(head, { s195: range }, root, { ...options, base: head })).toThrow(/locked build base/);
  });
  it('requires every moved path to carry mission, full commit and hashed execution evidence', () => {
    const movers = deriveMovers(head, { s195: range }, root, options);
    const attribution = { base: S195_BASE, head, patch: { path: 'complete.diff', sha256: 'b'.repeat(64) }, unattributedPaths: [], rows: range.publicPaths.map((path: string) => ({ path, missions: ['s195-m06'], commits: [head], reason: 'Bound fixture for validation; production rows cite the real mission.', evidence: [{ path: 'receipt.json', sha256: 'a'.repeat(64) }], hunks: [{ reason: 'Exact changed lines have a mission.', missions: ['s195-m06'], commits: [head] }] })) };
    expect(() => verifySprint195Attribution({ movers, attribution, implementationHead: head })).not.toThrow();
    for (const mutate of [(row: any) => row.rows.pop(), (row: any) => row.rows[0].missions = [], (row: any) => row.rows[0].commits = ['c6453c97'], (row: any) => row.rows[0].evidence = [], (row: any) => row.rows[0].hunks = [], (row: any) => row.patch = undefined]) { const broken = structuredClone(attribution); mutate(broken); expect(() => verifySprint195Attribution({ movers, attribution: broken, implementationHead: head })).toThrow(); }
  });
  it('prepares three exact hashed notices for196 with all four contract changes and limitations', () => {
    const plan = buildNotices(deriveMovers(head, { s195: range }, root, options), root);
    expect(plan).toMatchObject({ deliverySprint: 'sprint-196', sent: false, sendsExecuted: 0, targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'] });
    for (const notice of plan.notices) { expect(notice.requestSha256).toBe(requestHash(notice.request)); for (const phrase of ["theme:'hc'", 'pattern:viz:*', 'artifact.certify', 'health.productReality.viz', 'authoring-only', 'conformant:false', 'decision1944', 'OODS-SOAK-1442', 'builderSelfCertified:false']) expect(notice.request.body).toContain(phrase); }
  });
  it('pins the fixture head to a recorded commit rather than the current checkout', () => {
    expect(execFileSync('git', ['rev-parse', head], { cwd: root, encoding: 'utf8' }).trim()).toBe(head);
  });
});
