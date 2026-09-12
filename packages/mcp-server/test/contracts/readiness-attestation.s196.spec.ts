import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  READINESS_ATTESTATION_PATH,
  READINESS_DOCUMENT_PATHS,
  readinessAttestationClaims,
  readinessAttestationJson,
  readinessSha256,
  shippedReadinessPackageFiles,
  verifyReadinessAttestation,
  type AttestedReadinessDocuments,
  type ReadinessAttestation,
} from '../../src/codegen/readiness-attestation.js';
import { createTargetCapabilityPreflight, READINESS_EVIDENCE_CLASSES } from '../../src/codegen/target-readiness.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

let root: string;
let documents: AttestedReadinessDocuments;
let attestation: ReadinessAttestation;

function write(relative: string, bytes: string): void {
  const destination = path.join(root, relative);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);
}

function seal(): void {
  const { sha256: _oldDigest, ...payload } = attestation;
  attestation.sha256 = readinessSha256(readinessAttestationJson(payload));
  write(READINESS_ATTESTATION_PATH, readinessAttestationJson(attestation));
}

function preflight() {
  return createTargetCapabilityPreflight({
    repositoryRoot: root,
    readiness: documents,
    capabilityBaseline: { rows: [{ id: 'Text' }] },
  });
}

function verify() {
  return verifyReadinessAttestation(root, documents, READINESS_EVIDENCE_CLASSES);
}

function expectRefusal(): void {
  expect(verify()).toMatchObject({ status: 'invalid' });
  for (const target of ['react', 'vue'] as const) {
    expect(preflight()([{ id: 'text', component: 'Text' }], target)).toMatchObject([{
      code: 'OODS-N015', component: 'Text', message: expect.stringContaining('attestation-invalid'),
    }]);
  }
}

beforeEach(() => {
  root = mkdtempSync(path.join(os.tmpdir(), 'forge-readiness-attestation-'));
  for (const packageName of ['component-contracts', 'components-react', 'components-vue', 'mcp-server']) {
    write(`packages/${packageName}/package.json`, JSON.stringify({ name: `@oods/${packageName}` }));
    write(`packages/${packageName}/dist/index.js`, 'export const Text = () => null;\n');
    write(`packages/${packageName}/dist/index.d.ts`, 'export declare const Text: unknown;\n');
  }
  documents = Object.fromEntries((['react', 'vue'] as const).map((target) => [target, {
    target,
    rows: [{
      componentId: 'Text', state: 'implemented-evidence-complete', emissionEligible: true,
      evidence: Object.fromEntries(READINESS_EVIDENCE_CLASSES.map((evidenceClass) => [evidenceClass, {
        status: 'passed',
        refs: [evidenceClass === 'publicDeclaration'
          ? `packages/components-${target}/dist/index.d.ts#Text`
          : `packages/components-${target}/${evidenceClass === 'frameworkScenario' ? 'test' : 'src'}/${evidenceClass}.ts#Text`],
      }])),
    }],
  }])) as AttestedReadinessDocuments;
  for (const target of ['react', 'vue'] as const) write(READINESS_DOCUMENT_PATHS[target], JSON.stringify(documents[target]));
  // Fixture seal represents host-resolved source bytes. The runtime contains
  // only compiled code, declarations and evidence JSON, as the real bundle does.
  attestation = {
    schemaVersion: 'forge-readiness-attestation/v1',
    generatedAt: '2026-09-12T00:00:00Z',
    sourceHead: '1'.repeat(40),
    targets: Object.fromEntries(Object.entries(readinessAttestationClaims(documents, READINESS_EVIDENCE_CLASSES)).map(([target, { rows }]) => [target, {
      rows: rows.map(({ references, ...row }) => ({
        ...row,
        references: references.map((reference) => ({
          ...reference,
          sha256: reference.class === 'publicDeclaration'
            ? readinessSha256(readFileSync(path.join(root, reference.ref.split('#')[0]!)))
            : readinessSha256('host-resolved evidence'),
        })),
      })),
    }])) as ReadinessAttestation['targets'],
    shippedPackageHashes: shippedReadinessPackageFiles(root),
    sha256: '',
  };
  seal();
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('portable readiness attestation', () => {
  it.each(['react', 'vue'] as const)('emits real %s code with source and test references absent', async (framework) => {
    expect(verify()).toEqual({ status: 'verified' });
    const result = await generateCode({
      framework, profile: 'build',
      schema: { version: '2026.09', screens: [{ id: 'text', component: 'Text', props: { content: 'Portable proof' } }] },
    }, { targetCapabilityPreflight: preflight() });
    expect(result.status).toBe('ok');
    expect(result.errors ?? []).toEqual([]);
    expect(result.code).toContain('Portable proof');
    expect(result.code).toContain(`@oods/components-${framework}`);
    expect(result.artifact?.files.length).toBeGreaterThan(0);
    expect(Object.keys(attestation.targets)).toEqual(['react', 'vue']);
    expect(Object.values(attestation.targets).flatMap(({ rows }) => rows.flatMap(({ references }) => references))).toHaveLength(12);
  });

  it('preserves false emission eligibility even with every reference and package hash intact', () => {
    documents.react.rows[0]!.emissionEligible = false;
    attestation.targets.react.rows[0]!.emissionEligible = false;
    seal();
    expect(verify()).toEqual({ status: 'verified' });
    expect(preflight()([{ id: 'text', component: 'Text' }], 'react')).toMatchObject([{ code: 'OODS-N015' }]);
    expect(preflight()([{ id: 'text', component: 'Text' }], 'vue')).toEqual([]);
  });

  it('does not admit a component that lacks a controlling capability baseline', () => {
    const check = createTargetCapabilityPreflight({ repositoryRoot: root, readiness: documents, capabilityBaseline: { rows: [] } });
    expect(check([{ id: 'text', component: 'Text' }], 'react')).toMatchObject([{ code: 'OODS-N015' }]);
  });

  it('binds the source head to the embedded release manifest', () => {
    write('forge-runtime.manifest.json', JSON.stringify({ commit: attestation.sourceHead }));
    expect(verify()).toEqual({ status: 'verified' });
    attestation.sourceHead = '2'.repeat(40);
    seal();
    expectRefusal();
  });

  it.each(['sourceHead', 'generatedAt'] as const)('rejects invalid %s provenance even with a recomputed digest', (field) => {
    attestation[field] = 'invalid';
    seal();
    expectRefusal();
  });

  it('keeps source-pruned installations without an attestation fail-closed', () => {
    rmSync(path.join(root, READINESS_ATTESTATION_PATH));
    expect(verify()).toEqual({ status: 'absent' });
    expect(preflight()([{ id: 'text', component: 'Text' }], 'react')).toMatchObject([{ code: 'OODS-N015' }]);
  });

  it.each(['reference hash', 'package hash', 'eligibility', 'malformed JSON'])(
    'refuses tampered %s with a typed readiness failure', (mutation) => {
      if (mutation === 'reference hash') attestation.targets.react.rows[0]!.references[0]!.sha256 = '0'.repeat(64);
      if (mutation === 'package hash') attestation.shippedPackageHashes[0]!.sha256 = '0'.repeat(64);
      if (mutation === 'eligibility') attestation.targets.react.rows[0]!.emissionEligible = false;
      write(READINESS_ATTESTATION_PATH, mutation === 'malformed JSON' ? '{broken' : readinessAttestationJson(attestation));
      expectRefusal();
    },
  );

  it.each(['changed code', 'missing declaration', 'added file', 'empty inventory', 'missing target', 'missing evidence', 'changed evidence class'])(
    'rejects %s even when the envelope digest is recomputed', (mutation) => {
      if (mutation === 'changed code') write('packages/components-vue/dist/index.js', 'export const Text = () => "changed";');
      if (mutation === 'missing declaration') rmSync(path.join(root, 'packages/components-react/dist/index.d.ts'));
      if (mutation === 'added file') write('packages/components-react/dist/extra.js', 'export const extra = true;');
      if (mutation === 'empty inventory') attestation.shippedPackageHashes = [];
      if (mutation === 'missing target') delete (attestation.targets as Partial<ReadinessAttestation['targets']>).vue;
      if (mutation === 'missing evidence') attestation.targets.react.rows[0]!.references.pop();
      if (mutation === 'changed evidence class') attestation.targets.react.rows[0]!.references[0]!.class = 'packageExport';
      seal();
      expectRefusal();
    },
  );

  it('requires any available source evidence to still match the host receipt', () => {
    const reference = attestation.targets.react.rows[0]!.references[0]!;
    write(reference.ref.split('#')[0]!, 'different host evidence');
    attestation.shippedPackageHashes = shippedReadinessPackageFiles(root);
    seal();
    expectRefusal();
  });

  it('rejects symlinked first-party bytes instead of reading an external source tree', () => {
    const entry = path.join(root, 'packages/components-react/dist/index.js');
    rmSync(entry);
    symlinkSync(path.join(root, 'packages/components-vue/dist/index.js'), entry);
    expectRefusal();
  });

  it('rechecks the installation after a running preflight has already succeeded', () => {
    const check = preflight();
    const screens = [{ id: 'text', component: 'Text' }];
    expect(check(screens, 'react')).toEqual([]);
    write('packages/components-react/dist/index.js', 'corrupted after startup');
    expect(check(screens, 'react')).toMatchObject([{ code: 'OODS-N015' }]);
    rmSync(path.join(root, READINESS_ATTESTATION_PATH));
    expect(check(screens, 'react')).toMatchObject([{ code: 'OODS-N015' }]);
  });
});
