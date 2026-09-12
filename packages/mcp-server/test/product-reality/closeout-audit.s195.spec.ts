import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  auditSprint195Runtime, auditSprint195Viz, auditSprint195Bites, auditSprint195Soak,
  auditSprint195Theme, auditSprint195Attribution, auditSprintRange, auditSprint195Ci, auditSprint195Claims, auditPublicRuntimeBytes, auditSprint195CertificationProfiles, auditSprint195BiteIndex, auditSprint195ToolProof,
} from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

const root = resolve(import.meta.dirname, '../../../..');
// These source operands belong to the retained Sprint195 proofs; UTC intentionally
// changed the live registry and renderer in Sprint196. Do not rewrite old receipts.
const historicalVizPaths = new Set(['packages/viz-core/src/registry/viz-patterns.v1.json', 'packages/viz-core/src/registry/viz-recipes.v1.json', 'packages/viz-core/src/adapters/vega-lite-adapter.ts']);
const historicalViz = new Map<string, Buffer>();
const bytes = (file: string): Buffer => {
  if (!historicalVizPaths.has(file)) return readFileSync(resolve(root, file));
  if (!historicalViz.has(file)) historicalViz.set(file, execFileSync('git', ['show', `1d100e20bcc0911031192406625357638adecbe5:${file}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 }));
  return historicalViz.get(file)!;
};
const json = (file: string): any => JSON.parse(bytes(file).toString());
const hash = (file: string) => createHash('sha256').update(bytes(file)).digest('hex');
const runtimePath = 'artifacts/product-reality/sprint-195/m06/runtime-final/runtime-cells.v1.json';
const dashboardPath = 'artifacts/product-reality/sprint-195/m06/runtime-final/layouts/dashboard/runtime-cells.v1.json';
const runtime = () => ({ runtime: json(runtimePath), dashboard: json(dashboardPath), placement: json('artifacts/product-reality/sprint-195/m06/runtime-verification.json'), runtimePath, dashboardPath, readFrozen: bytes, head: 'c6453c97883feb38dda203628684a7bb9643765d' });
const viz = () => ({ registry: json('packages/viz-core/src/registry/viz-recipes.v1.json'), observations: json('artifacts/product-reality/sprint-195/m06/viz-census/viz-observations.json'), patterns: json('packages/viz-core/src/registry/viz-patterns.v1.json'), patternCensus: json('artifacts/product-reality/sprint-195/m05/patterns/pattern-observations.json'), taxonomy: json('packages/viz-core/src/registry/viz-taxonomy.v1.json'), classification: json('packages/viz-core/src/registry/viz-classification.v1.json'), patternSources: json('packages/viz-core/src/patterns/viz-pattern-sources.v1.json'), readFrozen: bytes });
const bitesPath = 'artifacts/product-reality/sprint-195/m06/bites/verification.json';
const soakPath = 'artifacts/product-reality/sprint-195/m06/soak/investigation.json';

// These are immutable retained operands for the independent predicates, not a
// closeout claim about the current checkout. No producer/registry validator import.
describe('Sprint 195 independent closeout predicates reject false greens', () => {
  it('checks 154 canonical +4 dashboard +48 chart scopes against one real pack/run and retained artifacts', () => {
    expect(auditSprint195Runtime(runtime())).toEqual({ canonical: 154, dashboard: 4, chartThemes: 48, packCount: 1 });
  });
  it.each(['different-run', 'different-head', 'unions', 'missing-dashboard', 'fake-theme-summary'])(
    'rejects runtime %s even when pass counters remain green', mutation => {
      const data = runtime();
      if (mutation === 'different-run') data.dashboard.runId = 'another-run';
      if (mutation === 'different-head') data.placement.head = '0'.repeat(40);
      if (mutation === 'unions') data.runtime.historicalReceiptsUnioned = true;
      if (mutation === 'missing-dashboard') data.dashboard.rows.pop();
      if (mutation === 'fake-theme-summary') data.placement.proof[0].svgHash = '0'.repeat(64);
      expect(() => auditSprint195Runtime(data)).toThrow();
    },
  );
  it('independently reconciles13 type identities,78 outcomes,21 pattern identities,84 outcomes and34 taxonomy identities', () => {
    expect(auditSprint195Viz(viz())).toMatchObject({ classified: 34, coreSurfaceComplete: 13, typedGaps: 7 });
  });
  it.each(['promoted-false', 'hc-errors-lost', 'stale-pattern-sha', 'same-family-wrong-cell', 'unknown-family', 'duplicate-pattern', 'fake-pixels'])(
    'rejects viz %s without trusting advertised summary fields', mutation => {
      const data = viz();
      if (mutation === 'promoted-false') data.observations.observations.find((row: any) => row.chartType === 'bubble_map').scopes[0].conformant = true;
      if (mutation === 'hc-errors-lost') data.observations.observations.find((row: any) => row.chartType === 'heatmap').scopes.find((row: any) => row.theme === 'hc').errors = [];
      if (mutation === 'stale-pattern-sha') data.patterns[0].specSha256 = '0'.repeat(64);
      if (mutation === 'same-family-wrong-cell') data.taxonomy.coreCells[0].identities = ['bar'];
      if (mutation === 'unknown-family') data.taxonomy.identities[0].family = 'invented';
      if (mutation === 'duplicate-pattern') data.patterns[0] = data.patterns[1];
      if (mutation === 'fake-pixels') data.patternCensus.cells.find((row: any) => row.rendered.status === 'ok').rendered.svg += ' ';
      expect(() => auditSprint195Viz(data)).toThrow();
    },
  );
  it('reads real red/green bite commands and restored source hashes including the final measurement correction', () => {
    expect(auditSprint195Bites(json(bitesPath), bitesPath, bytes)).toEqual({ bites: 3, restored: true });
  });
  it.each(['missing-bite', 'not-restored', 'faked-red', 'measured-missing-palette'])(
    'rejects %s in the actual mutation proof', mutation => {
      const index = json(bitesPath);
      if (mutation === 'missing-bite') index.bites.pop();
      if (mutation === 'not-restored') index.bites[0].restoredSha256 = '0'.repeat(64);
      const mutatedBytes = (file: string) => {
        if (mutation === 'faked-red' && file.endsWith('attempt-3/bites.json')) { const value = json(file); value.records[0].commands.find((row: any) => row.log.endsWith('disabled-census.log')).exitCode = 0; return Buffer.from(JSON.stringify(value)); }
        if (mutation === 'measured-missing-palette' && file.endsWith('attempt-3/palette/disabled-proof.json')) { const value = json(file); value.grade.contrastResults[0].measured = true; return Buffer.from(JSON.stringify(value)); }
        return bytes(file);
      };
      expect(() => auditSprint195Bites(index, bitesPath, mutatedBytes)).toThrow();
    },
  );
  it('traverses all four bite families and the nested three visualization mutations instead of trusting wrapper status', () => {
    const paths = ['artifacts/product-reality/sprint-195/m01/gate/verification.json', 'artifacts/product-reality/sprint-195/m04/bite/accuracy-bite.json', bitesPath, 'artifacts/product-reality/sprint-195/m06/runtime-final/emitter-bite.json'];
    const ids = ['retirement-gate', 'accuracy-rule', 'viz-mutations', 'runtime-emitter'], missions = ['s195-m01', 's195-m04', 's195-m06', 's195-m07'];
    const index = { head: runtime().head, builderSelfCertified: false, rows: paths.map((path, i) => ({ id: ids[i], missionId: missions[i], status: 'passed', receipt: { path, sha256: hash(path) } })) };
    expect(auditSprint195BiteIndex(index, bytes, runtime().runtime)).toEqual({ mutationFamilies: 4, visualizationBites: 3 });
    index.rows.pop(); expect(() => auditSprint195BiteIndex(index, bytes, runtime().runtime)).toThrow();
  });
  it('retains the strict soak failure and recomputes its measured trend without granting retention certification', () => {
    expect(auditSprint195Soak(json(soakPath), soakPath, bytes)).toEqual({ strictPassed: 2, strictFailed: 1, strictSkipped: 0, retentionCertified: false });
    const promoted = json(soakPath); promoted.disposition.retentionCertification = 'passed';
    expect(() => auditSprint195Soak(promoted, soakPath, bytes)).toThrow();
  });
  it('checks all six exact component scopes and their real ratios/pixels', () => {
    const file = 'artifacts/product-reality/sprint-193/m07/react-theme/report.json';
    const report = json(file), ids = json('packages/component-contracts/registry/component-capability-ledger.v1.json').rows.map((row: any) => row.id);
    expect(auditSprint195Theme({ report, reportPath: file, target: 'react', ids, readFrozen: bytes })).toEqual({ cells: 6, components: 109 });
    const missing = structuredClone(report); missing.cells[0].rows.pop();
    expect(() => auditSprint195Theme({ report: missing, reportPath: file, target: 'react', ids, readFrozen: bytes })).toThrow();
    report.cells[0].rows[0].pairs[0].ratio = 0;
    expect(() => auditSprint195Theme({ report, reportPath: file, target: 'react', ids, readFrozen: bytes })).toThrow();
  });
  it('keeps palette historical after hashes qualified at m05 rather than mutable current source', () => {
    const receipt = 'artifacts/product-reality/sprint-195/m05/golden-migration/golden-attribution.json';
    const head = 'c6453c97883feb38dda203628684a7bb9643765d';
    const data = { attribution: { base: '5b25c3c9ec795315bf52a698d135c96bffd66393', head, rows: [], unattributedPaths: [], patch: { path: 'empty.patch', sha256: createHash('sha256').update('').digest('hex') } }, movers: { s195: { head, publicPaths: [] } }, migration: { qualificationHead: '52b0da991705c4c565987bc9faf7738ba00d885e', receipt: { path: receipt, sha256: hash(receipt) }, builderSelfCertified: false }, rangeGitEvidence: { base: '5b25c3c9ec795315bf52a698d135c96bffd66393', head, patch: '' }, readFrozen: (file: string) => file === 'empty.patch' ? Buffer.from('') : bytes(file),
      readHistorical: (revision: string, file: string) => execFileSync('git', ['show', `${revision}:${file}`], { cwd: root, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }) };
    expect(auditSprint195Attribution(data)).toEqual({ paths: 0, historicalMatrixRows: 910, superseded: 231 });
    const file = 'docs/viz/taxonomy.md';
    const actualPatch = execFileSync('git', ['diff', '--no-ext-diff', '--no-renames', '--unified=0', data.attribution.base, head, '--', file], { cwd: root, encoding: 'utf8' });
    const row = { path: file, beforeSha256: null, afterSha256: createHash('sha256').update(data.readHistorical(head, file)).digest('hex'), missions: ['s195-m02'], commits: [head], reason: 'Generated taxonomy documents measured public backing.', evidence: [data.migration.receipt], hunks: actualPatch.split('\n').filter(line => line.startsWith('@@ ')).map(header => ({ header, missions: ['s195-m02'], commits: [head], reason: 'Each generated taxonomy hunk records the measured source mapping.' })) };
    const complete = { ...data, attribution: { ...data.attribution, rows: [row], patch: { path: 'advertised.patch', sha256: createHash('sha256').update(actualPatch).digest('hex') } }, movers: { s195: { head, publicPaths: [file] } }, rangeGitEvidence: { ...data.rangeGitEvidence, patch: actualPatch }, readFrozen: (path: string) => path === 'advertised.patch' ? Buffer.from(actualPatch) : data.readFrozen(path) };
    expect(auditSprint195Attribution(complete).paths).toBe(1);
    const noHunk = structuredClone(complete.attribution); noHunk.rows[0].hunks.pop();
    expect(() => auditSprint195Attribution({ ...complete, attribution: noHunk })).toThrow();
    const wrongSource = structuredClone(complete.attribution); wrongSource.rows[0].afterSha256 = '0'.repeat(64);
    expect(() => auditSprint195Attribution({ ...complete, attribution: wrongSource })).toThrow();
    const omitted = structuredClone(data.attribution); omitted.patch.sha256 = createHash('sha256').update('omitted hunk').digest('hex');
    expect(() => auditSprint195Attribution({ ...data, attribution: omitted })).toThrow();
    const missing = { ...data, movers: { s195: { head, publicPaths: ['docs/viz/taxonomy.md'] } } };
    expect(() => auditSprint195Attribution(missing)).toThrow();
    data.migration.qualificationHead = head;
    expect(() => auditSprint195Attribution(data)).toThrow();
  });
  it('binds all28 literal criteria and their evidence to existing executions', () => {
    const missions = json('artifacts/product-reality/sprint-195/m07/missions.json').missions;
    const ref = { path: 'proof.json', sha256: createHash('sha256').update('proof').digest('hex') }, head = 'c6453c97883feb38dda203628684a7bb9643765d';
    const executions = [{ id: 'measured', head, evidence: [ref], historical: false }];
    const claims = missions.flatMap((mission: any) => mission.successCriteria.map((criterion: string, index: number) => ({ missionId: mission.id, criterionIndex: index + 1, criterion, status: 'proven', executionIds: ['measured'], evidence: [ref] })));
    const data = { missions, claims, executions, verify: (ref: { sha256: string }) => { if (ref.sha256 !== createHash('sha256').update('proof').digest('hex')) throw new Error('Proof hash differs'); return Buffer.from('proof'); }, readHistorical: () => Buffer.from('proof') };
    expect(auditSprint195Claims(data)).toEqual({ criteria: 28, executions: 1 });
    for (const mutate of [
      (copy: any) => { copy.claims[0].criterion += ' rewritten'; },
      (copy: any) => { copy.claims.pop(); },
      (copy: any) => { copy.claims[0].executionIds = ['invented']; },
      (copy: any) => { copy.claims[0].evidence[0].sha256 = 'b'.repeat(64); },
      (copy: any) => { copy.claims[0].status = 'proven-with-documented-limit'; },
      (copy: any) => { copy.executions[0].head = 'friendly-head-label'; },
    ]) {
      const copy = structuredClone({ missions, claims, executions }); mutate(copy);
      expect(() => auditSprint195Claims({ ...data, ...copy })).toThrow();
    }
  });
  it('binds each selected CI job to its actual raw run/job and independently compared source bytes', () => {
    const head = 'c6453c97883feb38dda203628684a7bb9643765d';
    const scope = auditPublicRuntimeBytes({ root, implementationHead: head, executionHead: head, sprintId: 'sprint-195' }).scope;
    const names = ['coverage', 'product-reality-consumers', 'component-packages', 'a11y-contract', 'portable-runtime', 'runtime-cells', 'viz-determinism'];
    const run = { id: 100, head_sha: head, status: 'completed' };
    const jobs = { jobs: names.map((name, index) => ({ id: 200 + index, run_id: 100, name, status: 'completed', conclusion: 'success' })) };
    const raw = (value: unknown) => Buffer.from(JSON.stringify(value)), digest = (value: unknown) => createHash('sha256').update(raw(value)).digest('hex');
    const ci = { baseRefName: 'OODS-pro', headRefName: 'codex/sprint-195-visualization-breadth', jobs: jobs.jobs.map(job => ({ name: job.name, jobId: job.id, runId: job.run_id, status: job.status, conclusion: job.conclusion, headSha: head, run: { path: 'run.json', sha256: digest(run) }, jobInventory: { path: 'jobs.json', sha256: digest(jobs) } })), sourceEquivalence: [{ headSha: head, implementationHead: head, scope, changedPaths: [] }] };
    const data = { ci, implementationHead: head, readFrozen: (file: string) => file === 'run.json' ? raw(run) : raw(jobs), changedPaths: () => [] };
    expect(auditSprint195Ci(data)).toEqual({ jobs: 7, actualHeads: 1 });
    const renamed = structuredClone(ci); renamed.jobs[0].jobId = 999;
    expect(() => auditSprint195Ci({ ...data, ci: renamed })).toThrow();
    const mislabeled = structuredClone(ci); mislabeled.jobs[0].headSha = '0'.repeat(40); mislabeled.sourceEquivalence.push({ ...mislabeled.sourceEquivalence[0], headSha: '0'.repeat(40) });
    expect(() => auditSprint195Ci({ ...data, ci: mislabeled })).toThrow();
    expect(() => auditSprint195Ci({ ...data, changedPaths: () => ['packages/viz-core/src/accuracy/accuracy-rules.ts'] })).toThrow();
    const failed = structuredClone(jobs); failed.jobs[0].conclusion = 'failure'; const falsified = structuredClone(ci); falsified.jobs.forEach(row => { row.jobInventory.sha256 = digest(failed); });
    expect(() => auditSprint195Ci({ ...data, ci: falsified, readFrozen: (file: string) => file === 'run.json' ? raw(run) : raw(failed) })).toThrow();
  });
  it('retains all eight spec-only uncertified/null outcomes apart from matching-operand certification', () => {
    const receipt = json('artifacts/product-reality/sprint-195/m04/certify/after.json');
    expect(auditSprint195CertificationProfiles(receipt)).toEqual({ operands: 8, specOnlyUncertified: 8, operandConformant: 7 });
    receipt.rows[0].specOnly.coverage = 'certified'; receipt.rows[0].specOnly.conformant = true;
    expect(() => auditSprint195CertificationProfiles(receipt)).toThrow();
  });
  it('keeps the recorded tool census head distinct from the later runtime implementation while binding current source bytes', () => {
    const ledgerPath = 'packages/mcp-server/registry/tool-capability-ledger.v1.json', tools = json(ledgerPath);
    const implementationHead = '38eb20c4d7e08f32cad77bb4e6eaf71441d07c19';
    const proof = { censusHead: tools.head, implementationHead, byteIdentical: true, sha256: hash(ledgerPath), summary: tools.summary };
    const data = { tools, proof, implementationHead, ledgerPath, readFrozen: bytes };
    expect(tools.head).not.toBe(implementationHead);
    expect(auditSprint195ToolProof(data)).toEqual({ censusHead: tools.head, implementationHead, entries: 24 });
    expect(() => auditSprint195ToolProof({ ...data, proof: { ...proof, censusHead: implementationHead } })).toThrow();
    expect(() => auditSprint195ToolProof({ ...data, proof: { ...proof, implementationHead: tools.head } })).toThrow();
    expect(() => auditSprint195ToolProof({ ...data, proof: { ...proof, sha256: '0'.repeat(64) } })).toThrow();
    const changed = (file: string) => file === tools.rows[0].inputSchemaPath ? Buffer.concat([bytes(file), Buffer.from(' ')]) : bytes(file);
    expect(() => auditSprint195ToolProof({ ...data, readFrozen: changed })).toThrow();
  });
  it('includes the actual added viz documents and domain declarations in its independent scope', () => {
    const range = auditSprintRange({ root, base: '5b25c3c9ec795315bf52a698d135c96bffd66393', head: 'c6453c97883feb38dda203628684a7bb9643765d', sprintId: 'sprint-195' });
    expect(range.publicPaths).toEqual(expect.arrayContaining(['docs/viz/taxonomy.md', 'domains/saas-billing/objects/Usage.object.yaml', 'scripts/product-reality/s195-viz-taxonomy.ts']));
  });
});
