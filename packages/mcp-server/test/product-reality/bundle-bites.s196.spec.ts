import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateGeneratedArtifact } from '../../src/codegen/artifact-envelope.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const reportPath = process.env.OODS_BUNDLE_BITES_REPORT
  ?? path.join(root, 'artifacts/product-reality/sprint-196/m05/bundle-bites/bites.json');
const directory = path.dirname(reportPath);
const text = (relative: string) => fs.readFileSync(path.join(directory, relative), 'utf8');
const json = (relative: string) => JSON.parse(text(relative));
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const record = (id: string) => report.records.find((row: { id: string }) => row.id === id);
const nativeResponses = (id: string, phase: string) => text(`${id}/${phase}-native.stdout.log`).trim().split('\n')
  .map(line => JSON.parse(line)).filter(response => response.result?.content)
  .map(response => JSON.parse(response.result.content[0].text));
const m02Head = '2d80ae017184b6a28d4b2d7a2bb02649a5c33718';

describe('s196 physical bundle bites retain the red and restored evidence', () => {
  it('binds four independent restored extractions to the exact m02 artifact and pinned helper bytes', () => {
    expect(report.status).toBe('passed');
    expect(report.summary).toEqual({ bites: 4, passed: 4, failed: 0, restored: 4 });
    expect(report.archive).toMatchObject({ head: m02Head, bytes: 32448215, sha256: '4ff4aeb05e5ba937b61d2062fcce2eb4d0d41fc1b3001ae07b472cb2c2663bba' });
    expect(new Set(report.records.map((row: { extraction: string }) => row.extraction)).size).toBe(4);
    for (const row of report.records) {
      expect(row.treeMutated.sha256).not.toBe(row.treeBefore.sha256);
      expect(row.treeRestoredBeforeProbe).toEqual(row.treeBefore);
      expect(row.treeAfter).toEqual(row.treeBefore);
      expect(row.restoredByteIdentically).toBe(true);
      expect(hash(fs.readFileSync(path.join(directory, row.id, 'file-before')))).toBe(row.fileBefore.sha256);
      if (!row.mutatedFile.absent) expect(hash(fs.readFileSync(path.join(directory, row.id, 'file-mutated')))).toBe(row.mutatedFile.sha256);
      expect(json(`${row.id}/restored-manifest.json`)).toMatchObject({ status: 'pass', manifest: { commit: m02Head } });
    }
    for (const helper of report.helpers) {
      expect(hash(fs.readFileSync(path.join(directory, helper.path)))).toBe(helper.sha256);
      expect(helper.head).toBe(helper.path.startsWith('helpers/current/') ? report.helperHead : m02Head);
    }
    expect(hash(text('helpers/m02/e2e.mjs'))).toBe('48f0e1dc79e4afcb2befa2b84198348351c24aae992866f2eb8159dbed10c402');
  });

  it('records an actual shipped-dist byte change and the unchanged manifest rejecting it', () => {
    expect(text('dist-integrity/file-mutated')).toBe(text('dist-integrity/file-before') + '\n// s196 owned integrity mutation\n');
    // Node's AssertionError appends the actual/expected hashes to this message.
    expect(json('dist-integrity/mutated-manifest.json')).toMatchObject({ status: 'rejected', message: expect.stringContaining('embedded payload tree digest mismatch') });
    expect(json('dist-integrity/mutated-manifest.json').message).toContain(json('dist-integrity/before-manifest.json').payload.sha256);
    expect(json('dist-integrity/restored-manifest.json').payload).toEqual(json('dist-integrity/before-manifest.json').payload);
  });

  it('separates degraded native taxonomy health from E2E rejection at the earlier manifest boundary', () => {
    const before = json('taxonomy-health/file-before');
    const mutated = json('taxonomy-health/file-mutated');
    expect(before.summary.classified).toBe(34);
    expect(mutated.summary.classified).toBe(35);
    mutated.summary.classified = 34;
    expect(mutated).toEqual(before);
    const disabled = json('taxonomy-health/mutated-native.json');
    expect(nativeResponses('taxonomy-health', 'mutated')).toEqual([disabled]);
    expect(disabled).toMatchObject({ status: 'degraded', productReality: { viz: null } });
    expect(disabled.warnings).toEqual(['viz taxonomy unavailable: Viz taxonomy rejected: summary differs from classified identities and core cells']);
    const restored = json('taxonomy-health/restored-native.json');
    expect(nativeResponses('taxonomy-health', 'restored')).toEqual([restored]);
    expect(restored).toMatchObject({ status: 'ok', productReality: { viz: { classified: 34 } } });
    const command = report.commands.find((row: { name: string }) => row.name === 'mutated-e2e');
    expect(command.code).toBe(1);
    expect(text(command.stderr)).toContain('embedded payload tree digest mismatch');
    expect(record('taxonomy-health').e2eRejectionBoundary).toContain('before adapter/health startup');
    for (const phase of ['baseline', 'restored']) {
      const proof = json(`taxonomy-health/${phase}-e2e.json`);
      expect(JSON.parse(text(`taxonomy-health/${phase}-e2e.stdout.log`))).toEqual(proof);
      expect(proof).toMatchObject({ status: 'pass', manifest: { commit: m02Head }, calls: { totalAcrossProcesses: 30 }, extractionTree: { unchanged: true } });
      expect(Object.values(proof.calls.outcomes).filter((value: any) => value.outcome === 'pass')).toHaveLength(17);
      expect(Object.values(proof.calls.outcomes).filter((value: any) => value.outcome === 'typed')).toHaveLength(2);
    }
  });

  it('records policy absence refusing startup and real healthy bridge restoration', () => {
    expect(record('bridge-policy').mutatedFile).toEqual({ absent: true });
    const refused = json('bridge-policy/mutated-bridge.json');
    expect(refused).toMatchObject({ exit: { code: 1, signal: null }, listenerAbsent: true, forcedKill: false });
    expect(text(refused.stderr)).toMatch(/BRIDGE_POLICY_MISSING.*startup refused/);
    for (const phase of ['baseline', 'restored']) {
      expect(json(`bridge-policy/${phase}-bridge.json`)).toMatchObject({ health: { revision: { commit: m02Head } }, exit: { code: 0 }, listenerAbsent: true, forcedKill: false });
    }
  });

  it('checks both actual wire N015 refusals and independently rehashes real restored React/Vue artifacts', () => {
    const before = json('readiness-attestation/file-before');
    const mutated = json('readiness-attestation/file-mutated');
    expect(mutated.sha256).not.toBe(before.sha256);
    mutated.sha256 = before.sha256;
    expect(mutated).toEqual(before);
    for (const phase of ['baseline', 'mutated', 'restored']) {
      const responses = json(`readiness-attestation/${phase}-native.json`);
      expect(Object.fromEntries(nativeResponses('readiness-attestation', phase).map(response => [response.framework, response]))).toEqual(responses);
      for (const framework of ['react', 'vue']) {
        const response = responses[framework];
        if (phase === 'mutated') {
          expect(response.status).toBe('error');
          expect(response.artifact).toBeUndefined();
          expect(response.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'OODS-N015', message: expect.stringContaining('attestation-invalid') })]));
        } else {
          expect(response.status).toBe('ok');
          expect(validateGeneratedArtifact(response.artifact)).toEqual([]);
          expect(response.artifact.contentHash).toBe(record('readiness-attestation').baselineArtifacts[framework]);
          expect(response.artifact.files.some((file: { path: string }) => file.path.endsWith(framework === 'react' ? '.tsx' : '.vue'))).toBe(true);
        }
      }
    }
  });

  it('retains exact subprocess streams and clean lifecycle without inherited repository overrides', () => {
    for (const command of report.commands) {
      expect(command.timedOut).toBe(false);
      expect(command.forcedKill).toBe(false);
      for (const key of ['stdoutEvidence', 'stderrEvidence']) expect(hash(fs.readFileSync(path.join(directory, command[key].path)))).toBe(command[key].sha256);
    }
    for (const row of report.records) for (const child of row.children) {
      const allowed = ['PATH', 'LANG', 'LC_ALL', 'TZ', 'NODE_ENV', 'NO_COLOR', 'MCP_BRIDGE_PORT', 'BRIDGE_TOKEN'];
      expect(Object.keys(child.environment).every(key => allowed.includes(key))).toBe(true);
      expect(child.cwd.startsWith(row.extraction + '/packages/')).toBe(true);
      if (child.stdinClose) expect(child.stdinClose).toEqual({ exited: true, code: 0, signal: null });
      else expect(child).toMatchObject({ forcedKill: false, listenerAbsent: true });
    }
  });
});
