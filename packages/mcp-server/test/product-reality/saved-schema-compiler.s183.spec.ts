import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildSavedSchemaCorpusEvidence,
  type SavedSchemaCorpusEvidence,
} from '../../../../scripts/product-reality/s183-m04-saved-schema-corpus.js';
import { handle as codeGenerate } from '../../src/tools/code.generate.js';

describe('Sprint 183 M04 saved-schema compiler', () => {
  let evidence: SavedSchemaCorpusEvidence;

  beforeAll(async () => {
    evidence = await buildSavedSchemaCorpusEvidence();
  });

  it('uses the genuine pre-sprint record and records all 32 target dispositions', () => {
    const manifest = evidence.corpusManifest as {
      records: unknown[];
      exitGateSubject: Record<string, unknown>;
      excludedShadowFixture: Record<string, unknown>;
    };
    expect(manifest.records).toHaveLength(16);
    expect(manifest.exitGateSubject).toEqual(expect.objectContaining({
      name: 'tier1-acceptance-sub-detail',
      schemaRef: 'compose-7d860337',
      createdAt: '2026-03-05T03:43:57.111Z',
      sha256: 'sha256:f842c3c61933caf7cf26af48e02b7a7de84c5f60fd49b8c03458821fdd55318b',
      preExisting: true,
    }));
    expect(manifest.excludedShadowFixture).toEqual(expect.objectContaining({
      schemaRef: 's182-tier1-bounded-foundation-v1',
    }));

    const targetDispositions = evidence.dispositions.flatMap((record) => (
      Object.values(record.targets)
    ));
    expect(targetDispositions).toHaveLength(32);
    expect(targetDispositions.filter(({ disposition }) => disposition === 'compiled')).toHaveLength(2);
    expect(targetDispositions.filter(({ disposition }) => disposition === 'typed-gap')).toHaveLength(30);
    expect(targetDispositions.flatMap((disposition) => (
      disposition.disposition === 'typed-gap' ? disposition.gaps : []
    ))).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'OODS-N015', component: 'SearchInput', target: 'react' }),
      expect.objectContaining({ code: 'OODS-N015', component: 'SearchInput', target: 'vue' }),
    ]));
    expect(evidence.compilationReport).not.toHaveProperty('passRate');
    expect(evidence.compilationReport).not.toHaveProperty('percentage');
  });

  it('emits complete deterministic React and Vue artifacts with actions and live Tabs panels', async () => {
    const subject = evidence.dispositions.find(({ schemaRef }) => schemaRef === 'compose-7d860337');
    expect(subject).toBeDefined();
    for (const target of ['react', 'vue'] as const) {
      const disposition = subject!.targets[target];
      expect(disposition.disposition).toBe('compiled');
      if (disposition.disposition !== 'compiled') continue;
      expect(disposition.artifact.actions.map(({ name }) => name)).toEqual(['handleDelete', 'handleEdit']);
      expect(disposition.artifact.dependencies.every(({ version }) => version.length > 0)).toBe(true);
      const source = disposition.artifact.files[0]!.contents;
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
    }

    const repeated = await buildSavedSchemaCorpusEvidence();
    expect(repeated.files).toEqual(evidence.files);
  });

  it('turns a fallback-for-typed-gap mutation red', async () => {
    await expect(buildSavedSchemaCorpusEvidence({
      generator: async (input) => {
        const result = await codeGenerate(input);
        if (result.errors?.some(({ code }) => code === 'OODS-N015')) {
          return { ...result, status: 'ok' };
        }
        return result;
      },
    })).rejects.toThrow(/returned a generated artifact.*typed gap required/i);
  });
});
