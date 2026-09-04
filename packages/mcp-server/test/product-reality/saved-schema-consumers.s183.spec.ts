import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  GATE_NAMES,
  canonicalize,
  runSavedSchemaConsumerProof,
  sha256,
  validateRunnableArtifact,
} from '../../../../scripts/product-reality/s183-m05-saved-schema-consumers.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const compiledRoot = path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-183/m04/compiled/tier1-acceptance-sub-detail',
);
const frameworks = ['react', 'vue'] as const;
type Framework = (typeof frameworks)[number];

const expectedDependencies = {
  react: [
    { name: '@oods/component-styles', version: '0.1.0', kind: 'dependency' },
    { name: '@oods/components-react', version: '0.1.0', kind: 'dependency' },
    { name: 'react', version: '19.2.0', kind: 'peerDependency' },
    { name: 'react-dom', version: '19.2.0', kind: 'peerDependency' },
  ],
  vue: [
    { name: '@oods/component-styles', version: '0.1.0', kind: 'dependency' },
    { name: '@oods/components-vue', version: '0.1.0', kind: 'dependency' },
    { name: 'vue', version: '3.5.42', kind: 'peerDependency' },
  ],
} as const;

const expectedLocalClosure = {
  react: [
    '@oods/component-contracts@0.1.0',
    '@oods/component-styles@0.1.0',
    '@oods/components-react@0.1.0',
    '@oods/tokens@0.1.0',
  ],
  vue: [
    '@oods/component-contracts@0.1.0',
    '@oods/component-styles@0.1.0',
    '@oods/components-vue@0.1.0',
    '@oods/tokens@0.1.0',
  ],
} as const;

const expectedContentHashes = {
  react: 'sha256:233162f22841a9d903d1b0ddbe8646749b3fb770c14ea7f8c8e54f20b1bf5c71',
  vue: 'sha256:912e48c78bed5b17d51fc52dd816bf080bbf150a0cf12af5041b62e96314d21c',
} as const;

const expectedInstalledNames = {
  react: [
    '@oods/component-contracts',
    '@oods/component-styles',
    '@oods/components-react',
    '@oods/tokens',
    'react',
    'react-dom',
  ],
  vue: [
    '@oods/component-contracts',
    '@oods/component-styles',
    '@oods/components-vue',
    '@oods/tokens',
    'vue',
  ],
} as const;

const temporaryRoots: string[] = [];

function dependencyKeys(records: Array<{ name: string; version: string }>): string[] {
  return [...new Set(records.map(({ name, version }) => `${name}@${version}`))].sort();
}

function rehashArtifact(artifact: Record<string, any>): void {
  const { contentHash: _contentHash, ...payload } = artifact;
  artifact.contentHash = `sha256:${sha256(canonicalize(payload))}`;
}

async function loadArtifacts(): Promise<Record<Framework, any>> {
  return Object.fromEntries(await Promise.all(frameworks.map(async (framework) => [
    framework,
    JSON.parse(await fs.readFile(path.join(compiledRoot, `${framework}.artifact.json`), 'utf8')),
  ]))) as Record<Framework, any>;
}

describe('Sprint 183 M05 genuine saved-schema consumers', () => {
  let artifacts: Record<Framework, any>;
  let proof: any;

  beforeAll(async () => {
    artifacts = await loadArtifacts();
    const artifactRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s183-m05-consumers-'));
    temporaryRoots.push(artifactRoot);
    proof = await runSavedSchemaConsumerProof({
      artifactRoot,
      artifacts,
      runMutations: true,
    });
  }, 900_000);

  afterAll(async () => {
    await Promise.all(temporaryRoots.splice(0).map((root) => (
      fs.rm(root, { recursive: true, force: true })
    )));
  });

  it('installs exactly the versioned runtime closure derived from each artifact manifest', () => {
    for (const framework of frameworks) {
      const artifact = artifacts[framework];
      expect(() => validateRunnableArtifact({ artifact, framework })).not.toThrow();
      expect(artifact.contentHash).toBe(expectedContentHashes[framework]);
      expect(artifact.dependencies).toEqual(expectedDependencies[framework]);
      expect(artifact.actions.map(({ name }: { name: string }) => name)).toEqual([
        'handleDelete',
        'handleEdit',
      ]);

      const frameworkReport = proof.frameworkReports.find(
        (candidate: { framework: Framework }) => candidate.framework === framework,
      );
      expect(frameworkReport).toBeDefined();
      expect(frameworkReport.artifact).toMatchObject({
        contentHash: artifact.contentHash,
        dependencies: artifact.dependencies,
      });
      expect(frameworkReport.dependencyPlan.artifactDependencies).toEqual(artifact.dependencies);
      expect(frameworkReport.consumerManifest.artifactDependencies).toEqual(artifact.dependencies);
      expect(frameworkReport.consumerManifest.installedDependencies).toEqual(
        frameworkReport.dependencyPlan.installedDependencies,
      );

      const manifestedLocalRoots = frameworkReport.dependencyPlan.artifactDependencies.filter(
        ({ name }: { name: string }) => name.startsWith('@oods/'),
      );
      expect(dependencyKeys([
        ...manifestedLocalRoots,
        ...frameworkReport.dependencyPlan.transitiveLocalClosure,
      ])).toEqual([...expectedLocalClosure[framework]]);
      expect(frameworkReport.dependencyPlan.installedDependencies.map(
        ({ name }: { name: string }) => name,
      )).toEqual([...expectedInstalledNames[framework]]);

      for (const dependency of artifact.dependencies) {
        const install = frameworkReport.dependencyPlan.installedDependencies.find(
          ({ name }: { name: string }) => name === dependency.name,
        );
        expect(install).toBeDefined();
        expect(install.source).toBe('artifact-manifest');
        if (dependency.name.startsWith('@oods/')) {
          expect(install.installSpec).toMatch(
            new RegExp(`^file:<submitted-tarballs>/.+-${dependency.version.replaceAll('.', '\\.')}\\.tgz$`),
          );
        } else {
          expect(install.installSpec).toBe(dependency.version);
        }
      }
      expect(frameworkReport.dependencyPlan.installedDependencies.some(
        ({ installSpec }: { installSpec: string }) => /^(?:workspace|link):/.test(installSpec),
      )).toBe(false);

      const runtimeNames = new Set(frameworkReport.dependencyPlan.installedDependencies.map(
        ({ name }: { name: string }) => name,
      ));
      expect(Object.keys(frameworkReport.dependencyPlan.verifierDependencies).every(
        (name) => !runtimeNames.has(name),
      )).toBe(true);
    }
  });

  it('rejects a missing or versionless artifact dependency before an install can start', () => {
    const missing = structuredClone(artifacts.react);
    missing.dependencies = missing.dependencies.filter(
      ({ name }: { name: string }) => name !== '@oods/component-styles',
    );
    rehashArtifact(missing);
    expect(() => validateRunnableArtifact({ artifact: missing, framework: 'react' })).toThrow(
      /@oods\/component-styles|manifested dependency|dependency closure/i,
    );

    const versionless = structuredClone(artifacts.vue);
    delete versionless.dependencies.find(
      ({ name }: { name: string }) => name === '@oods/components-vue',
    ).version;
    rehashArtifact(versionless);
    expect(() => validateRunnableArtifact({ artifact: versionless, framework: 'vue' })).toThrow(
      /@oods\/components-vue|exact version|version|invalid dependency record/i,
    );
  });

  it('holds React and Vue to the same eight clean-consumer gates with no skipped check', () => {
    expect(GATE_NAMES).toEqual([
      'fresh-exact-tarball-install',
      'strict-typecheck',
      'production-build',
      'server-render',
      'mount',
      'hydration',
      'shared-css-resolution',
      'interaction-evidence',
    ]);
    expect(proof.report).toMatchObject({
      status: 'passed',
      selected: 16,
      passed: 16,
      failed: 0,
      skipped: 0,
    });
    expect(proof.frameworkReports.map(({ framework }: { framework: Framework }) => framework)).toEqual(frameworks);

    for (const frameworkReport of proof.frameworkReports) {
      expect(frameworkReport).toMatchObject({
        status: 'passed',
        selected: 8,
        passed: 8,
        failed: 0,
        skipped: 0,
        gates: GATE_NAMES.map((name: string) => ({ name, status: 'passed' })),
        isolation: {
          outsidePnpmWorkspace: true,
          freshNodeModules: true,
          emptyVerifierOwnedNpmConfiguration: true,
          inheritedNodeModules: false,
          workspaceSymlinks: false,
          repositorySourceImports: false,
        },
        browser: {
          mount: 'passed',
          hydration: 'passed',
          hydrationInvariant: { equal: true },
          runtimeErrors: [],
          interactions: {
            initialSelectedTab: 'detail-tab-panel-3',
            initialVisiblePanelContentId: 'slot-tab-0-4',
            initialFirstTabSelected: true,
            initialFirstPanelHidden: false,
            selectedTab: 'detail-tab-panel-5',
            selectedPanel: 'slot-tab-1-6',
            selectedTabPanelDomId: expect.stringMatching(/panel-detail-tab-panel-5$/),
            firstTabSelectedAfter: false,
            firstPanelHiddenAfter: true,
            secondTabSelectedAfter: true,
            secondPanelHiddenAfter: false,
            domainActions: {
              handleEdit: 1,
              handleDelete: 1,
            },
          },
        },
      });
    }
  });

  it('turns both behavioral mutations red at the gate whose behavior they remove', () => {
    for (const frameworkReport of proof.frameworkReports) {
      expect(frameworkReport.mutationControls).toEqual(expect.arrayContaining([
        expect.objectContaining({
          framework: frameworkReport.framework,
          kind: 'tabs-selection-behavior-removed',
          status: 'detected',
          observed: expect.objectContaining({ gate: 'interaction-evidence', status: 'failed' }),
          replay: expect.objectContaining({
            patch: 'mutation.patch',
            patchSha256: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
            checkExitCode: 0,
            applyExitCode: 0,
            matchesDeterministicTransform: true,
          }),
        }),
        expect.objectContaining({
          framework: frameworkReport.framework,
          kind: 'domain-action-handle-edit-inert',
          status: 'detected',
          observed: expect.objectContaining({ gate: 'interaction-evidence', status: 'failed' }),
          replay: expect.objectContaining({
            patch: 'mutation.patch',
            patchSha256: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
            checkExitCode: 0,
            applyExitCode: 0,
            matchesDeterministicTransform: true,
          }),
        }),
      ]));
      expect(frameworkReport.mutationControls).toHaveLength(2);
    }
  });
});
