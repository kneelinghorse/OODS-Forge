import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildSavedSchemaCorpusEvidence,
} from '../../../../scripts/product-reality/s183-m04-saved-schema-corpus.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as codeGenerate } from '../../src/tools/code.generate.js';
import type { CodeGenerateOutput } from '../../src/tools/types.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const evidenceRoot = path.join(repositoryRoot, 'artifacts/product-reality/sprint-183/m04');
const corpusRoot = path.join(evidenceRoot, 'saved-schema-store');
const targets = ['react', 'vue'] as const;
const requiredLiveCompiled = [
  'tier1-acceptance-sub-detail',
  'subscription-detail-dark',
  'subscription-list-dark',
] as const;

type Target = typeof targets[number];

type HistoricalTargetDisposition = {
  disposition: 'compiled' | 'typed-gap';
  gaps?: Array<{ code: string; component?: string; nodeId?: string; target?: Target }>;
};

type HistoricalReport = {
  results: Array<{
    name: string;
    targets: Record<Target, HistoricalTargetDisposition>;
  }>;
  summary: {
    schemaDispositions: {
      compiledBothTargets: string[];
      typedGap: string[];
    };
  };
};

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function savedSchema(name: string): UiSchema {
  return readJson<{ schema: UiSchema }>(path.join(corpusRoot, `${name}.json`)).schema;
}

function sha256(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

describe('Sprint 183 M04 saved-schema compiler', () => {
  const liveResults = new Map<string, CodeGenerateOutput>();
  const historicalReportPath = path.join(evidenceRoot, 'compilation-report.json');
  const historicalReport = readJson<HistoricalReport>(historicalReportPath);
  const historicalManifest = readJson<{
    records: unknown[];
    exitGateSubject: Record<string, unknown>;
    excludedShadowFixture: Record<string, unknown>;
  }>(path.join(evidenceRoot, 'corpus-manifest.json'));
  const corpusIndex = readJson<{ schemas: Array<{ name: string }> }>(path.join(corpusRoot, '_index.json'));

  beforeAll(async () => {
    for (const { name } of corpusIndex.schemas) {
      for (const target of targets) {
        liveResults.set(
          `${name}/${target}`,
          await codeGenerate({
            framework: target,
            profile: 'build',
            schema: savedSchema(name),
            options: { styling: 'tokens', typescript: true },
          }),
        );
      }
    }
  });

  it('keeps the immutable Sprint 183 baseline at its genuine 2 compiled and 30 typed-gap cells', () => {
    expect(sha256(historicalReportPath)).toBe(
      '368b287e01f6b67768560b98fe581d285a3fa348ce4a09f070e1c83e3fd1af45',
    );
    expect(historicalManifest.records).toHaveLength(16);
    expect(historicalManifest.exitGateSubject).toEqual(expect.objectContaining({
      name: 'tier1-acceptance-sub-detail',
      schemaRef: 'compose-7d860337',
      createdAt: '2026-03-05T03:43:57.111Z',
      sha256: 'sha256:f842c3c61933caf7cf26af48e02b7a7de84c5f60fd49b8c03458821fdd55318b',
      preExisting: true,
    }));
    expect(historicalManifest.excludedShadowFixture).toEqual(expect.objectContaining({
      schemaRef: 's182-tier1-bounded-foundation-v1',
    }));

    const targetDispositions = historicalReport.results.flatMap(({ targets: resultTargets }) => (
      Object.values(resultTargets)
    ));
    expect(targetDispositions).toHaveLength(32);
    expect(targetDispositions.filter(({ disposition }) => disposition === 'compiled')).toHaveLength(2);
    expect(targetDispositions.filter(({ disposition }) => disposition === 'typed-gap')).toHaveLength(30);
    expect(targetDispositions.flatMap(({ disposition, gaps }) => (
      disposition === 'typed-gap' ? gaps ?? [] : []
    ))).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'OODS-N015', component: 'SearchInput', target: 'react' }),
      expect.objectContaining({ code: 'OODS-N015', component: 'SearchInput', target: 'vue' }),
    ]));
    expect(historicalReport).not.toHaveProperty('passRate');
    expect(historicalReport).not.toHaveProperty('percentage');
  });

  it('measures current live readiness separately from the frozen Sprint 183 baseline', () => {
    expect(liveResults).toHaveLength(32);
    const compiledByTarget = new Map<Target, string[]>();
    for (const target of targets) {
      const compiled = corpusIndex.schemas
        .filter(({ name }) => liveResults.get(`${name}/${target}`)?.status === 'ok')
        .map(({ name }) => name);
      const typedGap = corpusIndex.schemas
        .filter(({ name }) => liveResults.get(`${name}/${target}`)?.status === 'error')
        .map(({ name }) => name);

      compiledByTarget.set(target, compiled);
      expect(compiled).toEqual(expect.arrayContaining(requiredLiveCompiled));
      expect(compiled.length).toBeGreaterThan(
        historicalReport.summary.schemaDispositions.compiledBothTargets.length,
      );
      for (const name of typedGap) {
        const result = liveResults.get(`${name}/${target}`)!;
        expect(result.artifact, `${name}/${target}`).toBeUndefined();
        expect(result.errors?.length, `${name}/${target}`).toBeGreaterThan(0);
        expect(result.errors?.every(({ code }) => code === 'OODS-N015'), `${name}/${target}`).toBe(true);
      }
    }
    expect(compiledByTarget.get('react')).toEqual(compiledByTarget.get('vue'));
    expect(historicalReport.summary.schemaDispositions.compiledBothTargets).toEqual([
      'tier1-acceptance-sub-detail',
    ]);
  });

  it('retains the archived complete artifacts and keeps the live exit-gate result deterministic', async () => {
    for (const target of targets) {
      const artifact = readJson<NonNullable<CodeGenerateOutput['artifact']>>(path.join(
        evidenceRoot,
        'compiled/tier1-acceptance-sub-detail',
        `${target}.artifact.json`,
      ));
      expect(artifact.actions.map(({ name }) => name)).toEqual(['handleDelete', 'handleEdit']);
      expect(artifact.dependencies.every(({ version }) => version.length > 0)).toBe(true);
      const source = artifact.files[0]!.contents;
      for (const nodeId of [
        'detail-tabs-9',
        'detail-tab-panel-3',
        'slot-tab-0-4',
        'detail-tab-panel-5',
        'slot-tab-1-6',
        'detail-tab-panel-7',
        'slot-tab-2-8',
      ]) {
        expect(source).toContain(nodeId);
      }
      if (target === 'react') {
        expect(source).toMatch(/panel: \(\s*<Stack id="detail-tab-panel-3"/);
      } else {
        expect(source).toContain('<template #panel="{ item }">');
        expect(source).toContain("item.id === 'detail-tab-panel-3'");
      }

      const input = {
        framework: target,
        profile: 'build' as const,
        schema: savedSchema('tier1-acceptance-sub-detail'),
        options: { styling: 'tokens' as const, typescript: true },
      };
      const first = await codeGenerate(input);
      const second = await codeGenerate(input);
      expect(first).toEqual(second);
      expect(first.status).toBe('ok');
      expect(first.artifact?.files[0]?.contents.length).toBeGreaterThan(0);
    }
  });

  it('turns a fallback-for-a-current-typed-gap mutation red', async () => {
    let mutatedTypedGaps = 0;
    await expect(buildSavedSchemaCorpusEvidence({
      generator: async (input) => {
        const result = await codeGenerate(input);
        if (result.errors?.some(({ code }) => code === 'OODS-N015')) {
          mutatedTypedGaps += 1;
          return { ...result, status: 'ok' };
        }
        return result;
      },
    })).rejects.toThrow(/returned a generated artifact.*typed gap required/i);
    expect(mutatedTypedGaps).toBeGreaterThan(0);
  });
});
