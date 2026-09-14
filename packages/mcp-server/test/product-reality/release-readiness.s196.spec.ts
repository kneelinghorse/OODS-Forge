import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BASELINE_PATH, FACTS_PATH, PACKET_PATH, START, END, collectPackageFacts,
  collectReleaseReadiness, generateReleaseReadiness, parseReadinessArgs, renderReleaseFacts,
} from '../../../../scripts/product-reality/s196-release-readiness.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const facts = collectReleaseReadiness(root);
const portable = 'artifacts/product-reality/sprint-196/m03/ci';
const release = 'artifacts/product-reality/sprint-196/m05/ci-followthrough';
const temporary: string[] = [];
afterEach(() => { for (const directory of temporary.splice(0)) fs.rmSync(directory, { recursive: true, force: true }); });
function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-gate2-facts-')); temporary.push(directory);
  for (const file of [...facts.inputs.map(input => input.path), FACTS_PATH, PACKET_PATH]) {
    const target = path.join(directory, file); fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }
  return directory;
}
function edit(directory: string, relative: string, mutate: (document: any) => void) {
  const file = path.join(directory, relative), document = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(document); fs.writeFileSync(file, JSON.stringify(document, null, 2) + '\n');
}
// Re-seal only the isolated test receipt index to prove semantic checks do not
// rely exclusively on its hash claim. Original retained evidence never changes.
function editPortableEvidence(directory: string, suffix: string, mutate: (document: any) => void) {
  const relative = `node20/${suffix}`;
  edit(directory, `${portable}/${relative}`, mutate);
  const bytes = fs.readFileSync(path.join(directory, portable, relative));
  edit(directory, `${portable}/node20/verification.json`, receipt => {
    const row = receipt.evidence.find((entry: any) => entry.path === relative); assert(row);
    row.bytes = bytes.length; row.sha256 = createHash('sha256').update(bytes).digest('hex');
  });
}

describe('s196 release readiness derives facts without making Gate 2 decisions', () => {
  it('discovers all 21 workspaces and the separate root, preserving absent publish fields', () => {
    const rows = collectPackageFacts(root), baseline = JSON.parse(fs.readFileSync(path.join(root, BASELINE_PATH), 'utf8'));
    expect(rows).toHaveLength(22); expect(rows[0].path).toBe('package.json');
    expect(rows.filter(row => row.path.startsWith('tools/'))).toHaveLength(4);
    expect(rows.filter(row => row.path.startsWith('apps/'))).toHaveLength(1);
    expect(baseline.sourceHead).toBe('8fd3d04ddf9af7d17863308ab579e3023ef4f491');
    expect(baseline.packages.map((row: any) => row.path).sort()).toEqual(rows.map(row => row.path).sort());
    expect(baseline.packages.find((row: any) => row.path === 'package.json').shape).not.toHaveProperty('private');
    expect(rows[0].fields.private).toBe(true);
    expect(rows.find(row => row.name === '@oods/mcp-server')!.fields).not.toHaveProperty('license');
    expect(rows.find(row => row.name === '@oods/tokens')!.fields.private).toBe(true);
    expect(facts.packageSummary).toEqual({ workspaces: 21, workspacePrivate: 21, workspaceWithoutLicenseField: 12, workspacePublishConfig: 0, workspaceLicenseFiles: 5, rootLicenseFiles: 1 });
  });

  it('checks generated JSON and the marked facts block while preserving authored prose', () => {
    expect(() => generateReleaseReadiness(root, true)).not.toThrow();
    const directory = fixture(), file = path.join(directory, PACKET_PATH);
    fs.writeFileSync(file, `Author before\n${START}\n${END}\nAuthor after\n`);
    generateReleaseReadiness(directory);
    const document = fs.readFileSync(file, 'utf8');
    expect(document.startsWith('Author before\n')).toBe(true); expect(document.endsWith('\nAuthor after\n')).toBe(true);
    expect(() => generateReleaseReadiness(directory, true)).not.toThrow();
    // No .git, installed dependencies, build output or original checkout needed.
    expect(fs.existsSync(path.join(directory, '.git'))).toBe(false);
    expect(collectReleaseReadiness(directory)).toEqual(facts);
  });

  it('writes selectable current facts while refusing every sealed Sprint 195–199 output', () => {
    const directory = fixture();
    const output = 'artifacts/product-reality/sprint-200/m01/readiness-test.json';
    expect(generateReleaseReadiness(directory, false, output)).toEqual(facts);
    expect(() => generateReleaseReadiness(directory, true, output)).not.toThrow();
    expect(fs.readFileSync(path.join(directory, PACKET_PATH), 'utf8')).toContain(output);
    for (const sprint of [195, 196, 197, 198, 199]) {
      const sealed = `artifacts/product-reality/sprint-${sprint}/m06/release-readiness-facts.json`;
      expect(() => generateReleaseReadiness(directory, false, sealed)).toThrow('sealed Sprint 195–199 receipts');
      expect(fs.existsSync(path.join(directory, sealed))).toBe(false);
    }
    expect(parseReadinessArgs(['--facts', output, '--check'])).toMatchObject({ factsPath: output, check: true });
    expect(() => parseReadinessArgs(['--facts'])).toThrow('Missing value');
  });

  it.each(['private', 'license', 'publishConfig', 'files', 'exports', 'version'])('detects actual package %s movement and regenerates from the isolated root', field => {
    const directory = fixture();
    edit(directory, 'tools/agents-smoke/package.json', manifest => { manifest[field] = field === 'private' ? false : field === 'version' ? '9.0.0' : field === 'files' ? ['alternate'] : field === 'exports' ? { '.': './other.js' } : field === 'publishConfig' ? { access: 'restricted' } : 'UNLICENSED'; });
    expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
    const current = generateReleaseReadiness(directory);
    expect(current.workspaces.find(row => row.name === '@oods/agents-smoke')).not.toEqual(facts.workspaces.find(row => row.name === '@oods/agents-smoke'));
    expect(() => generateReleaseReadiness(directory, true)).not.toThrow();
    expect(collectReleaseReadiness(root)).toEqual(facts);
  });

  it('detects added workspace membership and added, removed or changed LICENSE bytes', () => {
    const directory = fixture(), extra = path.join(directory, 'apps/extra'); fs.mkdirSync(extra);
    fs.writeFileSync(path.join(extra, 'package.json'), JSON.stringify({ name: '@oods/extra', version: '1.0.0', private: true }));
    expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
    expect(collectPackageFacts(directory)).toHaveLength(23);
    fs.rmSync(extra, { recursive: true });
    const license = path.join(directory, 'packages/sdk/LICENSE'); fs.writeFileSync(license, 'A separately measured license document\n');
    expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
    expect(collectPackageFacts(directory).find(row => row.name === '@oods/sdk')!.licenseFiles).toHaveLength(1);
    fs.rmSync(license); fs.appendFileSync(path.join(directory, 'LICENSE'), '\nchanged terms\n');
    expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
    fs.rmSync(path.join(directory, 'LICENSE'));
    expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
  });

  it('detects hand edits to either output and requires unique correctly ordered markers', () => {
    for (const output of [FACTS_PATH, PACKET_PATH]) {
      const directory = fixture(), file = path.join(directory, output);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('>=20.11.1', '>=18.0.0'));
      expect(() => generateReleaseReadiness(directory, true)).toThrow('Generated release readiness drift');
    }
    for (const text of [`${START}\n${START}\n${END}`, `${END}\n${START}`, 'no markers']) {
      const directory = fixture(); fs.writeFileSync(path.join(directory, PACKET_PATH), text);
      expect(() => generateReleaseReadiness(directory)).toThrow(/marker/);
    }
  });

  it('rejects changed raw proof bytes before trusting a retained verification summary', () => {
    const directory = fixture(); fs.appendFileSync(path.join(directory, portable, 'node20/job.log'), 'changed raw evidence');
    expect(() => collectReleaseReadiness(directory)).toThrow(/Evidence (size|digest) changed/);
  });

  it.each([
    ['typed dependency code', (e2e: any) => { e2e.calls.outcomes['brand.apply'].code = 'OODS-S019'; }],
    ['actual success', (e2e: any) => { e2e.calls.outcomes['tokens.build'].outcome = 'typed'; }],
    ['bridge parity', (e2e: any) => { e2e.calls.bridge.parity = false; }],
    ['forced lifecycle kill', (e2e: any) => { e2e.lifecycle.restart.sigterm.forcedKill = true; }],
    ['restored tree', (e2e: any) => { e2e.extractionTree.after = 'a'.repeat(64); }],
    ['runtime Node version', (e2e: any) => { e2e.nodeVersion = 'v18.0.0'; }],
    ['executed manifest head', (e2e: any) => { e2e.manifest.commit = 'a'.repeat(40); }],
  ])('rejects altered %s even when the isolated receipt hash index is recomputed', (_name, mutate) => {
    const directory = fixture(); editPortableEvidence(directory, 'portable-runtime-e2e.json', mutate);
    expect(() => collectReleaseReadiness(directory)).toThrow();
  });

  it('independently checks archive metadata, attestation seal, and CI job success', () => {
    const changes: Array<[string, (document: any) => void]> = [
      ['forge-runtime-out-1/forge-runtime.manifest.json', manifest => { manifest.archive.sha256 = 'a'.repeat(64); }],
      ['forge-runtime-work-1/payload/packages/mcp-server/dist/registry/readiness-attestation.v1.json', attestation => { attestation.targets.react.rows[0].references[0].sha256 = 'a'.repeat(64); }],
      ['job.json', job => { job.conclusion = 'failure'; }],
    ];
    for (const [suffix, mutate] of changes) {
      const directory = fixture(); editPortableEvidence(directory, suffix, mutate);
      expect(() => collectReleaseReadiness(directory)).toThrow();
    }
  });

  it('keeps source/merge, portable archive, measured release archive and served earlier ledger distinct', () => {
    expect(facts.portable.map(cell => cell.nodeVersion)).toEqual(['v20.11.1', 'v24.20.0']);
    expect(facts.release.sourceCommit).toBe('944f4dda5f784e266310978b31f65b3d452e6387');
    expect(facts.release.executedMergeCommit).toBe('d8b6b052d2a1ac896279005ba62b9384b9f22c01');
    expect(facts.portable[0].sourceCommit).toBe('415c7cc02822e64d64e2c8a9696d852d7faa2db7');
    expect(facts.portable[0].executedMergeCommit).toBe('405315b16b109aab8ff4e87f9389888c59d43668');
    expect(facts.release.bundle.archive.sha256).not.toBe(facts.portable[0].bundle.archive.sha256);
    expect(facts.portable[0].servedRelease.bundleHead).not.toBe(facts.portable[0].bundle.commit);
    expect(renderReleaseFacts(facts)).toContain('not the current UTC runtime');
    const directory = fixture(); edit(directory, `${release}/merge-commit.remote.json`, commit => { commit.tree.sha = 'a'.repeat(40); });
    expect(() => collectReleaseReadiness(directory)).toThrow('Remote source and synthetic merge trees differ');
  });

  it('rejects forged release membership or host equality in the actual retained ledger', () => {
    for (const mutate of [(ledger: any) => { ledger.rows[0].object = 'Other'; }, (ledger: any) => { ledger.rows[0].hostArtifactHash = `sha256:${'a'.repeat(64)}`; }]) {
      const directory = fixture(); edit(directory, `${release}/release/release-cells.v1.json`, mutate);
      expect(() => collectReleaseReadiness(directory)).toThrow();
    }
  });

  it('rejects missing/unknown CLI arguments and unsupported workspace patterns instead of using the live checkout', () => {
    for (const args of [['--root'], ['--root', '--check'], ['--bogus'], ['--check', '--check'], ['--freeze-baseline'], ['--check', '--freeze-baseline', 'a'.repeat(40)]]) expect(() => parseReadinessArgs(args)).toThrow();
    const directory = fixture(); expect(parseReadinessArgs(['--root', directory, '--check'])).toMatchObject({ root: directory, check: true });
    fs.writeFileSync(path.join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/**\n');
    expect(() => collectPackageFacts(directory)).toThrow('Unsupported workspace pattern');
  });
});
