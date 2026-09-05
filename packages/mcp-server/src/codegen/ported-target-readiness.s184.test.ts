import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { NUCLEUS_COMPONENT_IDS, PORTED_COMPONENT_IDS } from '@oods/component-contracts';

import {
  createTargetCapabilityPreflight,
  mergeTargetReadiness,
  preflightTargetCapabilities,
  resolveReadinessRowReferences,
  type TargetReadiness,
} from './target-readiness.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(TEST_DIRECTORY, '../../../..');

function readJson<T>(repositoryPath: string): T {
  return JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, repositoryPath), 'utf8')) as T;
}

const nucleusReadiness: Readonly<Record<'react' | 'vue', TargetReadiness>> = {
  react: readJson('packages/components-react/evidence/react-readiness.v1.json'),
  vue: readJson('packages/components-vue/evidence/vue-readiness.v1.json'),
};
const portedReadiness: Readonly<Record<'react' | 'vue', TargetReadiness>> = {
  react: readJson('packages/components-react/evidence/react-ported-readiness.v1.json'),
  vue: readJson('packages/components-vue/evidence/vue-readiness-ported.v1.json'),
};
const mergedReadiness: Readonly<Record<'react' | 'vue', TargetReadiness>> = {
  react: mergeTargetReadiness(nucleusReadiness.react, portedReadiness.react),
  vue: mergeTargetReadiness(nucleusReadiness.vue, portedReadiness.vue),
};

const PORTED_NODES = PORTED_COMPONENT_IDS.map((component, index) => ({
  id: `ported-readiness-${index}`,
  component,
}));
const ALL_GOVERNED_NODES = [...NUCLEUS_COMPONENT_IDS, ...PORTED_COMPONENT_IDS]
  .map((component, index) => ({ id: `governed-readiness-${index}`, component }));

const IMPLEMENTATION_SOURCE: Readonly<Record<'react' | 'vue', string>> = {
  react: path.join(REPOSITORY_ROOT, 'packages/components-react/src/ported.tsx'),
  vue: path.join(REPOSITORY_ROOT, 'packages/components-vue/src/ported.ts'),
};

function removeNamedDeclaration(source: string, symbol: string): string {
  return source.replace(
    new RegExp(`\\bexport\\s+const\\s+${symbol}\\b`),
    `const ${symbol}`,
  );
}

describe('Sprint 184 merged target readiness', () => {
  it.each(['react', 'vue'] as const)(
    'merges the frozen 14-row %s manifest with the separate sorted eight-row manifest',
    (framework) => {
      expect(nucleusReadiness[framework].rows.map(({ componentId }) => componentId)).toEqual(
        NUCLEUS_COMPONENT_IDS,
      );
      expect(portedReadiness[framework].rows.map(({ componentId }) => componentId)).toEqual(
        PORTED_COMPONENT_IDS,
      );
      expect(mergedReadiness[framework].rows.map(({ componentId }) => componentId)).toEqual([
        ...NUCLEUS_COMPONENT_IDS,
        ...PORTED_COMPONENT_IDS,
      ]);
      expect(mergedReadiness[framework].rows).toHaveLength(22);
    },
  );

  it('fails loud on mismatched targets and duplicate component rows', () => {
    expect(() => mergeTargetReadiness(nucleusReadiness.react, portedReadiness.vue))
      .toThrow(/cannot merge readiness for react.*vue/i);
    expect(() => mergeTargetReadiness(nucleusReadiness.react, {
      target: 'react',
      rows: [nucleusReadiness.react.rows[0]!],
    })).toThrow(/duplicate react readiness row for badge/i);
  });

  it.each(['react', 'vue'] as const)(
    'resolves all six physical evidence classes for every ported %s row',
    (framework) => {
      for (const row of portedReadiness[framework].rows) {
        expect(
          resolveReadinessRowReferences(row, { repositoryRoot: REPOSITORY_ROOT }),
          row.componentId,
        ).toEqual([]);
      }
    },
  );

  it.each(['react', 'vue'] as const)(
    'keeps all 22 governed %s capability outcomes green through the production preflight',
    (framework) => {
      expect(preflightTargetCapabilities(ALL_GOVERNED_NODES, framework)).toEqual([]);
    },
  );

  it.each(['react', 'vue'] as const)(
    'isolates each deleted %s export to exactly its one ported readiness cell',
    (framework) => {
      for (const component of PORTED_COMPONENT_IDS) {
        const preflight = createTargetCapabilityPreflight({
          repositoryRoot: REPOSITORY_ROOT,
          readiness: mergedReadiness,
          readFile: (absolutePath) => {
            const source = readFileSync(absolutePath, 'utf8');
            return absolutePath === IMPLEMENTATION_SOURCE[framework]
              ? removeNamedDeclaration(source, component)
              : source;
          },
        });

        expect(preflight(PORTED_NODES, framework), component).toMatchObject([
          { code: 'OODS-N015', component },
        ]);
        expect(
          preflight(PORTED_NODES, framework === 'react' ? 'vue' : 'react'),
          `${component}/cross-framework`,
        ).toEqual([]);
      }
    },
  );
});
