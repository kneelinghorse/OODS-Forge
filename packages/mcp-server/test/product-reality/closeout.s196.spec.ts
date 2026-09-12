import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, renameSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { derivePublicHeadEquivalence, verifySprint196HeadRelations, verifySprint196Release, verifySprint196Portable, verifySprint196MissionEvidence, verifySprint196Attestation, verifySprint196Roadmap } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditPublicRuntimeBytes, auditSprintRange, auditSprint196HeadRelations, auditSprint196Release, auditSprint196Portable, auditSprint196Claims, auditSprint196Attribution, auditSprint196Roadmap, auditSprint196Attestation } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { S196_BASE, S196_PUBLIC_RUNTIME_SCOPE, S195_PUBLIC_RUNTIME_SCOPE, deriveRange, deriveMovers } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { buildNotices, requestHash } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const read = (file: string) => readFileSync(path.join(root, file));
const json = (file: string) => JSON.parse(read(file).toString());
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
// Immutable historical proof operands, never relabelled as Sprint196 closeout execution.
const historical = 'artifacts/product-reality/sprint-196/m03';
const releasePath = `${historical}/bootstrap-runtime/release-cells.v1.json`;
const releaseInput = () => ({ release: json(releasePath), releasePath, measurementManifest: json(`${historical}/bootstrap-archive/forge-runtime.manifest.json`), read });
const checkRelease = (input: ReturnType<typeof releaseInput>) => {
  const producer = verifySprint196Release({ ...input, implementationHead: input.release.bundleHead });
  const auditor = auditSprint196Release({ ...input, head: input.release.bundleHead, readFrozen: input.read });
  expect(auditor).toEqual(producer); return producer;
};

describe('Sprint196 release proof keeps containing archive and measured release distinct', () => {
  it('independently verifies all42 original bundle cells, retained requests/responses and exact tarball bytes', () => {
    expect(checkRelease(releaseInput())).toMatchObject({ cells: 42, pass: 42, fail: 0 });
  });
  it.each(['missing-cell', 'wrong-archive', 'false-parity', 'gate-promotion', 'report-tamper', 'request-tamper', 'host-tamper', 'tarball-tamper'] as const)('both checks reject %s despite a green top-level summary', fault => {
    const input = releaseInput();
    if (fault === 'missing-cell') input.release.rows.pop();
    if (fault === 'wrong-archive') input.measurementManifest.archive.sha256 = '0'.repeat(64);
    if (fault === 'false-parity') input.release.rows[0].hashEqualToHost = false;
    if (fault === 'gate-promotion') input.release.rows[0].gates[0].status = 'fail';
    input.read = (file: string) => {
      const bytes = read(file);
      if (fault === 'tarball-tamper' && file.endsWith('.tgz')) return Buffer.from('different package');
      if (fault === 'request-tamper' && file.endsWith('-request.json') && file.includes('/parity/')) return Buffer.from('{}');
      if (fault === 'host-tamper' && file.endsWith('-host.json') && file.includes('/parity/')) { const value = JSON.parse(bytes.toString()); value.artifact.files[0].contents += 'changed'; return Buffer.from(JSON.stringify(value)); }
      if (fault === 'report-tamper' && file.endsWith(input.release.rows[0].report)) return Buffer.from('{}');
      return bytes;
    };
    expect(() => verifySprint196Release({ ...input, implementationHead: input.release.bundleHead })).toThrow();
    expect(() => auditSprint196Release({ ...input, head: input.release.bundleHead, readFrozen: input.read })).toThrow();
  });
  it.each([20, 24])('accepts the actual Node%s E2E while preserving the earlier served release identity', nodeMajor => {
    const e2e = json(`${historical}/e2e-node${nodeMajor}.json`), manifest = json(`${historical}/final-archive/forge-runtime.manifest.json`);
    const releaseSummary = checkRelease(releaseInput());
    expect(manifest.commit).not.toBe(releaseSummary.bundleHead);
    expect(() => verifySprint196Portable({ e2e, manifest, releaseSummary, nodeMajor })).not.toThrow();
    expect(() => auditSprint196Portable({ report: e2e, archive: manifest, releaseSummary, nodeMajor })).not.toThrow();
  });
  it.each(['relabeled-release', 'erased-native-code', 'process-leak', 'wrong-node-floor', 'bridge-mismatch'] as const)('refuses %s in portable execution', fault => {
    const e2e = json(`${historical}/e2e-node20.json`), manifest = json(`${historical}/final-archive/forge-runtime.manifest.json`), releaseSummary = checkRelease(releaseInput());
    if (fault === 'relabeled-release') e2e.calls.health.release.bundleHead = manifest.commit;
    if (fault === 'erased-native-code') delete e2e.calls.outcomes['brand.apply'].code;
    if (fault === 'process-leak') e2e.lifecycle.restart.sigterm.forcedKill = true;
    if (fault === 'wrong-node-floor') e2e.nodeVersion = 'v20.19.0';
    if (fault === 'bridge-mismatch') e2e.calls.bridge.revision.commit = releaseSummary.bundleHead;
    expect(() => verifySprint196Portable({ e2e, manifest, releaseSummary, nodeMajor: 20 })).toThrow();
    expect(() => auditSprint196Portable({ report: e2e, archive: manifest, releaseSummary, nodeMajor: 20 })).toThrow();
  });
});

const relationFixture = () => {
  const implementationHead = 'a'.repeat(40), executionHead = 'b'.repeat(40);
  const paths = ['packages/mcp-server/registry/release-cells.v1.json', 'packages/mcp-server/registry/runtime-cells.v1.json'];
  const values = new Map(paths.map(file => [file, Buffer.from(JSON.stringify(file.includes('/release-') ? { bundleHead: implementationHead } : { head: implementationHead }))]));
  const runtimePath = 'measurements/runtime.json', releasePath = 'measurements/release.json';
  values.set(runtimePath, values.get(paths[1]!)!); values.set(releasePath, values.get(paths[0]!)!);
  const read = (file: string) => values.get(file)!;
  const relation = { implementationHead, executionHead, carryHead: executionHead, allowedLedgerPaths: paths, excludedDocumentationPaths: ['cmos/foundational-docs/roadmap/near.md'], changedPaths: paths, references: paths.map(file => ({ path: file, sha256: sha(read(file)) })) };
  const observed = { implementationHead, executionHead, ancestor: true, scope: S196_PUBLIC_RUNTIME_SCOPE, changedPaths: paths };
  return { implementationHead, executionHead, relation, observed, runtimePath, releasePath, read, readHistorical: (_head: string, file: string) => read(file) };
};

describe('Sprint196 post-measurement changes cannot hide product changes', () => {
  it('admits only hash-bound generated ledger successors and the named roadmap update', () => {
    const input = relationFixture();
    expect(() => verifySprint196HeadRelations(input)).not.toThrow();
    expect(() => auditSprint196HeadRelations({ ...input, actual: input.observed, readFrozen: input.read })).not.toThrow();
  });
  it.each(['source-change', 'expanded-exception', 'relabeled-ledger', 'capture-relabel', 'false-path-list', 'snapshot-divergence'] as const)('rejects %s independently', fault => {
    const input = relationFixture();
    if (fault === 'source-change') input.observed.changedPaths = input.relation.changedPaths = ['packages/mcp-server/src/tools/health.ts'];
    if (fault === 'expanded-exception') input.relation.excludedDocumentationPaths.push('packages/mcp-server/src/tools/health.ts');
    if (fault === 'relabeled-ledger') input.read = () => Buffer.from(JSON.stringify({ head: input.executionHead }));
    if (fault === 'capture-relabel') input.relation.executionHead = input.implementationHead;
    if (fault === 'false-path-list') input.relation.changedPaths = [];
    if (fault === 'snapshot-divergence') { const original = input.read; input.read = file => file === input.runtimePath ? Buffer.from(JSON.stringify({ head: input.implementationHead, fabricated: true })) : original(file); }
    expect(() => verifySprint196HeadRelations(input)).toThrow();
    expect(() => auditSprint196HeadRelations({ ...input, actual: input.observed, readFrozen: input.read })).toThrow();
  });
  it('both independent Git scopes preserve Unicode/tab paths and include generated docs and Gate2', () => {
    const temp = mkdtempSync(path.join(os.tmpdir(), 's196-closeout-scope-'));
    const git = (...args: string[]) => execFileSync('git', args, { cwd: temp, encoding: 'utf8' }).trim();
    try {
      git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.test'); git('commit', '--allow-empty', '-qm', 'base'); const base = git('rev-parse', 'HEAD');
      const files = ['docs/components/Café\tCard.md', 'cmos/planning/forge-gate2-decision-packet.md', 'docs/README.md', 'scripts/docs/generate-forge-claims.ts'];
      for (const file of files) { mkdirSync(path.dirname(path.join(temp, file)), { recursive: true }); writeFileSync(path.join(temp, file), 'fixture\n'); }
      git('add', '.'); git('commit', '-qm', 'docs'); const head = git('rev-parse', 'HEAD');
      const producer = deriveRange(base, head, temp, S196_PUBLIC_RUNTIME_SCOPE), auditor = auditSprintRange({ root: temp, base, head, sprintId: 'sprint-196' });
      expect(producer.publicPaths).toEqual(files.sort()); expect(auditor.publicPaths).toEqual(producer.publicPaths);
      expect(auditor.patches.map((row: any) => row.path)).toEqual(producer.publicPaths);
      expect(derivePublicHeadEquivalence({ root: temp, implementationHead: base, executionHead: head, sprintId: 'sprint-196' })).toEqual(auditPublicRuntimeBytes({ root: temp, implementationHead: base, executionHead: head, sprintId: 'sprint-196' }));
    } finally { rmSync(temp, { recursive: true, force: true }); }
  });
});

describe('Sprint196 literal claims and prepared reconnect', () => {
  it('requires the locked sprint base instead of accepting a narrower mission range', () => {
    expect(() => deriveMovers(S196_BASE, {}, root, { sprintId: 'sprint-196', missionId: 's196-m07', base: 'HEAD' })).toThrow(/locked build base/);
  });
  const claimsFixture = () => {
    const ref = { path: 'fixture/receipt.json', sha256: sha('{}') };
    const missions = Array.from({ length: 7 }, (_, i) => ({ id: `s196-m0${i + 1}`, successCriteria: Array.from({ length: i === 6 ? 2 : 4 }, (_, j) => `Literal fixture criterion ${i}/${j}`) }));
    const executions = [{ id: 'fixture', head: 'a'.repeat(40), evidence: [ref] }];
    const claims = missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion, status: 'proven', executionIds: ['fixture'], evidence: [ref] })));
    return { missions, executions, claims, verify: () => Buffer.from('{}'), readHistorical: () => Buffer.from('{}') };
  };
  it('audits all26 literal criteria without relying on future m07 outputs', () => expect(auditSprint196Claims(claimsFixture())).toEqual({ criteria: 26, executions: 1 }));
  it.each(['omitted', 'reworded', 'missing-execution'] as const)('rejects %s claim evidence', fault => {
    const input = claimsFixture(); if (fault === 'omitted') input.claims.pop(); if (fault === 'reworded') input.claims[0]!.criterion += ' implied'; if (fault === 'missing-execution') input.executions = [];
    expect(() => auditSprint196Claims(input)).toThrow();
  });
  it('prepares three hash-bound notices naming new portable behavior while keeping delivery unsent', () => {
    const movers = { missionId: 's196-m07', status: 'passed', s196: { base: S196_BASE, head: '944f4dda5f784e266310978b31f65b3d452e6387', publicPaths: ['docs/README.md'] } };
    const plan = buildNotices(movers, root, { measurementHead: movers.s196.head });
    expect(plan).toMatchObject({ status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliveryState: 'pending-independent-review' });
    expect(plan.targets).toEqual(['cmos-dashboard', 'forge-demos', 'aquex-mcp']);
    for (const row of plan.notices) { expect(requestHash(row.request)).toBe(row.requestSha256); for (const term of ['OODS-N020', 'OODS-N019', 'Readiness attestation', 'Structured native errors', 'health.productReality.release', 'not approved']) expect(row.request.body).toContain(term); }
    expect(() => buildNotices(movers, root)).toThrow(/measurement head/);
  });
});


describe('Sprint196 retained readiness and exact review-pending roadmap', () => {
  it('binds both109 readiness rows to actual historical source and shipped declaration hashes', () => {
    const attestation = json(`${historical}/final-archive/readiness-attestation.v1.json`);
    const readHistorical = (head: string, file: string) => execFileSync('git', ['show', `${head}:${file}`], { cwd: root, maxBuffer: 32 * 1024 * 1024 });
    expect(() => verifySprint196Attestation({ attestation, head: attestation.sourceHead, readHistorical })).not.toThrow();
    expect(() => auditSprint196Attestation({ attestation, head: attestation.sourceHead, readHistorical })).not.toThrow();
    attestation.targets.react.rows[0].references[0].sha256 = '0'.repeat(64);
    expect(() => verifySprint196Attestation({ attestation, head: attestation.sourceHead, readHistorical })).toThrow();
    expect(() => auditSprint196Attestation({ attestation, head: attestation.sourceHead, readHistorical })).toThrow();
  });
  const text = '## Increment 15 — Sprint 196: Release proof — BUILT, REVIEW PENDING\n[Gate 2](../../planning/forge-gate2-decision-packet.md)\n';
  it('requires the precise current heading and a real packet link', () => {
    expect(() => verifySprint196Roadmap(text)).not.toThrow(); expect(() => auditSprint196Roadmap(text)).not.toThrow();
  });
  it.each(['old-labels', 'packet-link-missing'])('rejects %s without treating old review labels as current proof', fault => {
    const changed = fault === 'old-labels' ? 'Increment 15 remains next.\n## Increment 14 — BUILT, REVIEW PENDING\n[Gate2](forge-gate2-decision-packet.md)' : text.split('\n')[0]!;
    expect(() => verifySprint196Roadmap(changed)).toThrow(); expect(() => auditSprint196Roadmap(changed)).toThrow();
  });
});


it('Sprint196 advertises both endpoints of real Git renames while preserving Sprint195 behavior', () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), 's196-closeout-rename-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: temp, encoding: 'utf8' }).trim();
  try {
    git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.test');
    const before = 'docs/api/Café\tlegacy.md', after = 'docs/api/Café\tcurrent.md';
    mkdirSync(path.join(temp, 'docs/api'), { recursive: true }); writeFileSync(path.join(temp, before), 'An unchanged documentation body.\n'.repeat(30));
    git('add', '.'); git('commit', '-qm', 'base'); const base = git('rev-parse', 'HEAD');
    renameSync(path.join(temp, before), path.join(temp, after)); writeFileSync(path.join(temp, 'docs/api/excluded.test.ts'), 'Excluded test hunk must not enter advertised patch.\n'); git('add', '-A'); git('commit', '-qm', 'rename'); const head = git('rev-parse', 'HEAD');
    const current = deriveRange(base, head, temp, S196_PUBLIC_RUNTIME_SCOPE), independently = auditSprintRange({ root: temp, base, head, sprintId: 'sprint-196' });
    expect(current.canonicalPaths).toEqual([after, before].sort()); expect(current.publicPaths).toEqual([after, before].sort());
    expect(independently.patch).not.toContain('Excluded test hunk'); expect(independently.patches.map((row: any) => row.path)).toEqual([after, before].sort());
    expect(independently.canonicalPaths).toEqual(current.canonicalPaths); expect(independently.publicPaths).toEqual(current.publicPaths);
    expect(current.canonicalCommand).toContain('--no-renames'); expect(current.publicCommand).toContain('--no-renames');
    const historical = deriveRange(base, head, temp, S195_PUBLIC_RUNTIME_SCOPE);
    expect(historical.publicPaths).toEqual([after]); expect(historical.publicCommand).not.toContain('--no-renames');
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
