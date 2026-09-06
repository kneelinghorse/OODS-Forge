import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  NUCLEUS_COMPONENT_IDS,
  componentContracts,
} from '@oods/component-contracts';
import { describe, expect, it } from 'vitest';

import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import type { UiSchema } from '../../src/schemas/generated.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const evidenceRoot = path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-184/m03',
);

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), 'utf8')) as T;
}

function sha256(relativePath: string): string {
  return createHash('sha256')
    .update(readFileSync(path.join(repositoryRoot, relativePath)))
    .digest('hex');
}

function git(...args: string[]): string {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  return result.stdout.trim();
}

function savedSchema(relativePath: string): UiSchema {
  return readJson<{ schema: UiSchema }>(relativePath).schema;
}

type FrozenFile = {
  path: string;
  bytes: number;
  sha256: string;
};

type BaselineIssue = {
  code: string;
  message: string;
  nodeId: string;
  component: string;
};

type BaselineRecord = {
  sourceCommit: string;
  isolation: { removedAfterCapture: boolean; sourceStatusBeforeProbe: string };
  probe: {
    expectedControlCounts: Record<string, Record<'react' | 'vue', number>>;
    observedControlCounts: Record<string, Record<'react' | 'vue', number>>;
    countAssertion: string;
  };
  results: Array<{
    name: string;
    path: string;
    targets: Record<'react' | 'vue', { issueCount: number; issues: BaselineIssue[] }>;
  }>;
  status: string;
};

type MoverRecord = {
  baseCommit: string;
  measuredImplementationCommit: string;
  derivation: { includedPrefixes: string[] };
  expectedCount: number;
  observedCount: number;
  movers: string[];
  consumer: string;
  status: string;
};

describe('Sprint 184 m03 contract-resolution closeout', () => {
  it('retains the exact independently reconstructed 2/6/0 red control', () => {
    const baseline = readJson<BaselineRecord>(
      'artifacts/product-reality/sprint-184/m03/baseline-red-control.json',
    );
    const expected = {
      'subscription-list-dark': { react: 2, vue: 2 },
      'subscription-detail-dark': { react: 6, vue: 6 },
      'tier1-acceptance-sub-detail': { react: 0, vue: 0 },
    };

    expect(baseline.sourceCommit).toBe('d51fb5ba80d7e67d7d4e25e16e2943e694019683');
    expect(baseline.probe.expectedControlCounts).toEqual(expected);
    expect(baseline.probe.observedControlCounts).toEqual(expected);
    expect(baseline.probe.countAssertion).toBe('passed');
    expect(baseline.isolation).toEqual(expect.objectContaining({
      removedAfterCapture: true,
      sourceStatusBeforeProbe: 'clean',
    }));
    expect(baseline.status).toBe('passed');

    const issues = baseline.results.flatMap((record) => (
      Object.values(record.targets).flatMap((target) => target.issues)
    ));
    expect(issues).toHaveLength(16);
    expect(new Set(issues.map((issue) => issue.nodeId))).toEqual(new Set([
      'slot-filters-2',
      'slot-tab-0-4',
      'pg-status-timeline-25',
      'pg-status-timeline-26',
      'slot-tab-4-17',
    ]));

    const factClasses = new Set(issues.map((issue) => {
      const prop = issue.message.match(/^Prop "([^"]+)"/)?.[1];
      if (prop) return `${issue.component}.prop.${prop}`;
      if (issue.message.includes('Select.value')) return 'Select.binding.value.boolean';
      if (issue.message.includes('Text children')) return 'Text.binding.children.string[]';
      return issue.message;
    }));
    expect(factClasses).toEqual(new Set([
      'Select.binding.value.boolean',
      'Select.prop.placeholder',
      'Stack.prop.fields',
      'Stack.prop.patternComponent',
      'Text.binding.children.string[]',
      'Text.prop.label',
    ]));
  });

  it('holds all six live target/schema cells at zero issues', () => {
    const cells = [
      'subscription-list-dark',
      'subscription-detail-dark',
      'tier1-acceptance-sub-detail',
    ].flatMap((name) => (['react', 'vue'] as const).map((framework) => {
      const relativePath = `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`;
      return {
        name,
        framework,
        issues: preflightTargetContracts(savedSchema(relativePath), framework).issues,
      };
    }));

    expect(cells).toHaveLength(6);
    expect(cells.map(({ name, framework, issues }) => ({
      name,
      framework,
      issueCount: issues.length,
    }))).toEqual([
      { name: 'subscription-list-dark', framework: 'react', issueCount: 0 },
      { name: 'subscription-list-dark', framework: 'vue', issueCount: 0 },
      { name: 'subscription-detail-dark', framework: 'react', issueCount: 0 },
      { name: 'subscription-detail-dark', framework: 'vue', issueCount: 0 },
      { name: 'tier1-acceptance-sub-detail', framework: 'react', issueCount: 0 },
      { name: 'tier1-acceptance-sub-detail', framework: 'vue', issueCount: 0 },
    ]);
  });

  it('keeps all three saved-schema operands byte-exact and absent from the sprint diff', () => {
    const freeze = readJson<{ files: FrozenFile[] }>(
      'artifacts/product-reality/sprint-184/m01/saved-schema-freeze.json',
    );
    expect(freeze.files).toHaveLength(3);
    for (const file of freeze.files) {
      expect(statSync(path.join(repositoryRoot, file.path)).size, file.path).toBe(file.bytes);
      expect(sha256(file.path), file.path).toBe(file.sha256);
    }

    expect(git(
      'diff',
      '--name-only',
      'd51fb5ba80d7e67d7d4e25e16e2943e694019683..HEAD',
      '--',
      'artifacts/product-reality/sprint-183/m04/saved-schema-store',
    )).toBe('');
  });

  it('versions exactly Select, Stack, and Text at 1.1.0 without moving the nucleus key set', () => {
    const entries = Object.entries(componentContracts);
    const version11 = entries.filter(([, contract]) => contract.version === '1.1.0');
    const version10 = entries.filter(([, contract]) => contract.version === '1.0.0');

    expect(version11.map(([id]) => id).sort()).toEqual(['Select', 'Stack', 'Text']);
    expect(version10.map(([id]) => id).sort()).toEqual(
      [...NUCLEUS_COMPONENT_IDS].filter((id) => !['Select', 'Stack', 'Text'].includes(id)).sort(),
    );
    expect(entries).toHaveLength(version11.length + version10.length);
    expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());
  });

  it('derives the exact advertised implementation movers in both directions for m07', () => {
    const record = readJson<MoverRecord>(
      'artifacts/product-reality/sprint-184/m03/advertised-movers.json',
    );
    const diff = git(
      'diff',
      '--name-only',
      `${record.baseCommit}..${record.measuredImplementationCommit}`,
      '--',
      ...record.derivation.includedPrefixes,
    ).split('\n').filter(Boolean);
    const actual = diff.filter((file) => (
      !file.includes('/test/') && !file.includes('.test.')
    ));

    expect(record.status).toBe('passed');
    expect(record.consumer).toBe('Sprint 184 m07 reconnect audit');
    expect(record.expectedCount).toBe(16);
    expect(record.observedCount).toBe(16);
    expect(actual).toEqual(record.movers);
    expect(record.movers).toEqual(actual);
  });

  it('preserves the historical readiness manifests while every current nucleus ref resolves', () => {
    const closeout = readJson<{
      measuredImplementationCommit: string;
      readinessManifestDisposition: {
        stranded: boolean;
        files: Array<FrozenFile & {
          contractVersion: string;
          rowCount: number;
          m01Sha256: string;
          measuredSha256: string;
          byteFreezeAssertion: string;
        }>;
      };
    }>('artifacts/product-reality/sprint-184/m03/closeout-report.json');

    // Sprint 185 m01 (#1722/#1725): the Sprint 184 m03 record is history. Its
    // measured digests are checked against the manifests AS THEY WERE at the
    // measured implementation commit, not against the live manifests, so the
    // live readiness surface is free to grow with the nucleus.
    expect(closeout.readinessManifestDisposition.stranded).toBe(false);
    for (const file of closeout.readinessManifestDisposition.files) {
      const historical = spawnSync(
        'git',
        ['show', `${closeout.measuredImplementationCommit}:${file.path}`],
        { cwd: repositoryRoot, encoding: null, maxBuffer: 32 * 1024 * 1024 },
      );
      expect(historical.status, file.path).toBe(0);
      const historicalRows = (JSON.parse(historical.stdout.toString('utf8')) as { rows: unknown[] }).rows;
      expect(file.contractVersion).toBe('1.0.0');
      expect(historicalRows).toHaveLength(file.rowCount);
      expect(file.m01Sha256).toBe(file.measuredSha256);
      expect(createHash('sha256').update(historical.stdout).digest('hex')).toBe(file.measuredSha256);
      expect(file.byteFreezeAssertion).toBe('passed');
    }

    const verification = spawnSync(
      process.execPath,
      ['scripts/product-reality/verify-readiness-refs.mjs'],
      { cwd: repositoryRoot, encoding: 'utf8' },
    );
    expect(verification.status, verification.stderr).toBe(0);
    const report = JSON.parse(verification.stdout) as {
      totals: { references: number; resolved: number };
      failures: unknown[];
      status: string;
    };
    expect(report.totals).toEqual(expect.objectContaining({ references: NUCLEUS_COMPONENT_IDS.length * 12 + 10, resolved: NUCLEUS_COMPONENT_IDS.length * 12 + 10 }));
    expect(report.failures).toEqual([]);
    expect(report.status).toBe('passed');
  });

  it('retains seven discriminating and byte-restored mutation controls', () => {
    const manifest = readJson<{
      implementationCommit: string;
      summary: {
        requested: number;
        killed: number;
        survived: number;
        restoredByteIdentically: number;
        gaps: unknown[];
      };
      mutants: Array<{
        id: string;
        patch: string;
        selectors: Array<{ exitCode: number }>;
        restoredDiffExitCode: number;
        restoredSelectorExitCode: number;
        status: string;
      }>;
      finalRestoration: {
        gitStatusShort: string;
        gitStatusExitCode: number;
        canonicalSuiteExitCode: number;
        runtimeSuiteExitCode: number;
      };
    }>('artifacts/product-reality/sprint-184/m03/mutations/mutation-manifest.json');

    expect(manifest.implementationCommit).toBe('b4697e40fb67dfd59e638f7c847f103d9f06a8d2');
    expect(manifest.summary).toEqual({
      requested: 7,
      killed: 7,
      survived: 0,
      restoredByteIdentically: 7,
      gaps: [],
    });
    expect(manifest.mutants).toHaveLength(7);
    expect(manifest.mutants.map((mutant) => mutant.id)).toEqual([
      'M01-select-placeholder-contract',
      'M02-text-label-contract',
      'M03-stack-pattern-component-contract',
      'M04-stack-fields-contract',
      'M05-boolean-select-field-kind',
      'M06-array-text-field-kind',
      'M07-bypass-composition-directives',
    ]);
    for (const mutant of manifest.mutants) {
      expect(statSync(path.join(evidenceRoot, 'mutations', mutant.patch)).isFile()).toBe(true);
      expect(mutant.selectors.length).toBeGreaterThan(0);
      expect(mutant.selectors.every(({ exitCode }) => exitCode !== 0)).toBe(true);
      expect(mutant.restoredDiffExitCode).toBe(0);
      expect(mutant.restoredSelectorExitCode).toBe(0);
      expect(mutant.status).toBe('killed');
    }
    expect(manifest.finalRestoration).toEqual(expect.objectContaining({
      gitStatusShort: '',
      gitStatusExitCode: 0,
      canonicalSuiteExitCode: 0,
      runtimeSuiteExitCode: 0,
    }));
  });

  it('summarizes every m03 gate as passed with no silently omitted check', () => {
    const resolution = readJson<{
      issueAccounting: {
        logicalFactClasses: number;
        affectedNodeCount: number;
        baselineTargetIssueRows: number;
        resolved: { cells: Array<{ issues: number }>; assertion: string };
      };
      compositionDirective: {
        nodeId: string;
        fields: string[];
        preservedChildren: Array<{ id: string; field: string }>;
        surfaces: Array<{ surface: string; rawDirectiveAttributes: boolean }>;
        mutationControl: string;
      };
      invalidPropMatrix: {
        targetCells: number;
        observedErrorCells: number;
        observedNoArtifactCells: number;
        companionCountAssertion: string;
      };
      advertisedSurface: {
        implementationMovers: number;
        testMovers: number;
        setEqualityBothDirections: string;
        forwardConsumer: string;
      };
      mutationEvidence: { requested: number; killed: number; survived: number; status: string };
      unrunChecks: unknown[];
      status: string;
    }>('artifacts/product-reality/sprint-184/m03/contract-resolution.json');

    expect(resolution.issueAccounting).toEqual(expect.objectContaining({
      logicalFactClasses: 6,
      affectedNodeCount: 5,
      baselineTargetIssueRows: 16,
    }));
    expect(resolution.issueAccounting.resolved.cells).toHaveLength(6);
    expect(resolution.issueAccounting.resolved.cells.every(({ issues }) => issues === 0)).toBe(true);
    expect(resolution.issueAccounting.resolved.assertion).toBe('passed');
    expect(resolution.compositionDirective).toEqual(expect.objectContaining({
      nodeId: 'slot-tab-0-4',
      fields: ['status', 'allowed_transitions'],
      preservedChildren: [
        { id: 'pg-status-timeline-25', field: 'status' },
        { id: 'pg-status-timeline-26', field: 'allowed_transitions' },
      ],
      mutationControl: 'M07-bypass-composition-directives',
    }));
    expect(resolution.compositionDirective.surfaces.map(({ surface }) => surface)).toEqual([
      'html',
      'react',
      'vue',
    ]);
    expect(resolution.compositionDirective.surfaces.every(
      ({ rawDirectiveAttributes }) => rawDirectiveAttributes === false,
    )).toBe(true);
    expect(resolution.invalidPropMatrix).toEqual(expect.objectContaining({
      targetCells: 8,
      observedErrorCells: 8,
      observedNoArtifactCells: 8,
      companionCountAssertion: 'passed',
    }));
    expect(resolution.advertisedSurface).toEqual({
      source: 'artifacts/product-reality/sprint-184/m03/advertised-movers.json',
      implementationMovers: 16,
      testMovers: 6,
      setEqualityBothDirections: 'passed',
      forwardConsumer: 's184-m07',
    });
    expect(resolution.mutationEvidence).toEqual(expect.objectContaining({
      requested: 7,
      killed: 7,
      survived: 0,
      status: 'passed',
    }));
    expect(resolution.unrunChecks).toEqual([]);
    expect(resolution.status).toBe('passed');
  });

  it('publishes the closeout records from the retained evidence directory', () => {
    const closeout = readJson<{
      componentContractAmendment: {
        contractCount: number;
        versionCounts: Record<string, number>;
      };
      m01FreezeAccounting: {
        uniquePathCount: number;
        unchangedPathCount: number;
        moverCount: number;
        movers: Array<{ path: string }>;
      };
      relatedEvidence: string[];
      scopeStatus: string;
    }>('artifacts/product-reality/sprint-184/m03/closeout-report.json');

    expect(closeout.componentContractAmendment).toEqual(expect.objectContaining({
      contractCount: 14,
      versionCounts: { '1.0.0': 11, '1.1.0': 3 },
    }));
    expect(closeout.m01FreezeAccounting).toEqual(expect.objectContaining({
      uniquePathCount: 33,
      unchangedPathCount: 31,
      moverCount: 2,
    }));
    expect(closeout.m01FreezeAccounting.movers.map(({ path: file }) => file)).toEqual([
      'packages/component-contracts/src/contracts.ts',
      'packages/components-vue/dist/index.d.ts',
    ]);
    expect(closeout.relatedEvidence).toEqual(expect.arrayContaining([
      'artifacts/product-reality/sprint-184/m03/baseline-red-control.json',
      'artifacts/product-reality/sprint-184/m03/advertised-movers.json',
    ]));
    expect(closeout.scopeStatus).toBe('captured');
    expect(statSync(evidenceRoot).isDirectory()).toBe(true);
  });
});
