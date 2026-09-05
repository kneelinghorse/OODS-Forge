import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  FRAMEWORKS,
  GATE_NAMES,
  REPOSITORY_ROOT,
  SCHEMA_NAMES,
  runLiveWorkflowProof,
} from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { handle as codeGenerate } from '../../src/tools/code.generate.js';

const temporaryRoots: string[] = [];

describe('Sprint 184 m06 live Subscription workflow consumers', () => {
  let result: Awaited<ReturnType<typeof runLiveWorkflowProof>>;
  let invocationCount = 0;
  let proofRoot = '';

  beforeAll(async () => {
    const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s184-m06-live-proof-'));
    temporaryRoots.push(temporaryRoot);
    proofRoot = path.join(temporaryRoot, 'proof');
    result = await runLiveWorkflowProof({
      artifactRoot: proofRoot,
      generate: async (...args) => {
        invocationCount += 1;
        return codeGenerate(...args);
      },
    });
  }, 900_000);

  afterAll(async () => {
    await Promise.all(temporaryRoots.splice(0).map((root) => (
      fs.rm(root, { recursive: true, force: true })
    )));
  });

  it('invokes code.generate live once for every immutable schema/target cell and consumes that output', async () => {
    expect(invocationCount).toBe(4);
    expect(result.report).toMatchObject({
      status: 'passed',
      selected: 32,
      passed: 32,
      failed: 0,
      skipped: 0,
      schemaCount: 2,
      frameworkCount: 2,
      cellCount: 4,
      expectedCellCount: 4,
    });
    expect(result.generationCells.map(({ schema, framework }) => ({ schema, framework }))).toEqual(
      SCHEMA_NAMES.flatMap((schema) => FRAMEWORKS.map((framework) => ({ schema, framework }))),
    );
    for (const generation of result.generationCells) {
      expect(generation.generationFingerprint).toMatchObject({
        handler: 'code.generate',
        invocation: 'live-in-process',
        profile: 'build',
        sourceOfArtifact: 'current-in-run-output',
        artifactContentHash: generation.artifact.contentHash,
      });
      expect(generation.source).toBe(generation.artifact.files[0]!.contents);
      expect(await fs.readFile(path.join(proofRoot, generation.sourcePath), 'utf8')).toBe(
        generation.source,
      );
    }

    const harnessSource = await fs.readFile(path.join(
      REPOSITORY_ROOT,
      'scripts/product-reality/s184-m06-live-consumers.ts',
    ), 'utf8');
    expect(harnessSource).not.toMatch(/compilation-report|\.artifact\.json|\/compiled\/|loadCommittedRunnableArtifacts/);
  });

  it('holds all four cells to the same eight named gates and retains every raw log', async () => {
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
    expect(result.cells).toHaveLength(4);
    for (const cell of result.cells) {
      expect(cell).toMatchObject({
        status: 'passed',
        selected: 8,
        passed: 8,
        failed: 0,
        skipped: 0,
        logPathBase: 'artifact-root',
        gates: GATE_NAMES.map((name) => ({ name, status: 'passed' })),
        accounting: {
          totalGateCount: 8,
          provenCount: 8,
          namedUnprovenCount: 0,
          namedUnproven: [],
          balanced: true,
        },
        isolation: {
          outsidePnpmWorkspace: true,
          freshNodeModules: true,
          emptyVerifierOwnedNpmConfiguration: true,
          installScripts: false,
          localPackagesFromBuiltTarballsOnly: true,
          workspaceAliases: false,
          workspaceSymlinks: false,
          repositorySourceImports: false,
          inheritedNodeModules: false,
          allResolvedPathsOutsideRepository: true,
        },
      });
      const gates = cell.gates as Array<{ name: string; status: string; logs: string[] }>;
      for (const gate of gates) {
        expect(gate.logs.length, `${String(cell.schema)}/${String(cell.framework)}/${gate.name}`).toBeGreaterThan(0);
        for (const log of gate.logs) {
          expect(log).toMatch(/\.log$/);
          expect((await fs.stat(path.join(proofRoot, log))).isFile()).toBe(true);
        }
      }
    }
  });

  it('makes the generated component the sole owner of every clicked selector and action callsite', async () => {
    for (const cell of result.cells) {
      const ownership = cell.sourceOwnership as {
        bindingMarkerCount: number;
        generatedOwnsEverySelector: boolean;
        generatedForwardsEveryAction: boolean;
        selectorOccurrencesInConsumerEntries: number;
        consumerComponentDeclarations: string[];
        consumerEntryFiles: string[];
        actionSelectors: Array<{
          action: string;
          selector: string;
          generatedSourceOccurrences: number;
          generatedRenderCallOccurrences: number;
        }>;
      };
      expect(ownership.bindingMarkerCount).toBeGreaterThan(0);
      expect(ownership.generatedOwnsEverySelector).toBe(true);
      expect(ownership.generatedForwardsEveryAction).toBe(true);
      expect(ownership.selectorOccurrencesInConsumerEntries).toBe(0);
      expect(ownership.consumerComponentDeclarations).toEqual([]);
      expect(ownership.actionSelectors.length).toBeGreaterThan(0);

      const sourceRoot = path.join(
        proofRoot,
        'cells',
        String(cell.schema),
        String(cell.framework),
        'source',
      );
      for (const file of ownership.consumerEntryFiles) {
        expect(await fs.readFile(path.join(sourceRoot, file), 'utf8')).not.toContain('data-oods-action');
      }
      for (const selector of ownership.actionSelectors) {
        expect(selector.generatedSourceOccurrences).toBeGreaterThanOrEqual(1);
        expect(selector.generatedRenderCallOccurrences).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('clicks generated controls with the exact schema-derived runtime operands', () => {
    for (const cell of result.cells) {
      const browser = cell.browser as {
        hydration: string;
        hydrationProbe: {
          selectorCount: number;
          eventHandlerAttached: boolean;
          reusedServerNodes: { root: boolean; action: boolean };
        };
        actionCounts: Record<string, number>;
        actionArgs: Record<string, unknown[][]>;
      };
      expect(browser.hydration).toBe('passed');
      expect(browser.hydrationProbe).toMatchObject({
        selectorCount: 1,
        eventHandlerAttached: true,
        reusedServerNodes: { root: true, action: true },
      });
      if (cell.schema === 'subscription-list-dark') {
        expect(browser.actionCounts).toEqual({ handleFilter: 1, handleRowClick: 1, handleSort: 1 });
        expect(browser.actionArgs).toEqual({
          handleFilter: [[{}]],
          handleRowClick: [['sub-s184-001']],
          handleSort: [['status']],
        });
      } else {
        expect(browser.actionCounts).toEqual({ handleDelete: 1, handleEdit: 1 });
        expect(browser.actionArgs).toEqual({ handleDelete: [[]], handleEdit: [[]] });
      }
    }
  });
});
