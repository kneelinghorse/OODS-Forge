import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { handle as codegenHandle } from '../../src/tools/code.generate.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { createValidationReceipt, recordValidationChecks } from '../../src/codegen/validation-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/ui');
const GOLDEN_DIR = path.resolve(__dirname, '../fixtures/codegen');

const FIXTURES = [
  {
    name: 'dashboard-page',
    schemaFile: 'dashboard-page.ui-schema.json',
    expectedFile: 'dashboard-page.n015.json',
  },
  {
    name: 'form-page',
    schemaFile: 'form-page.ui-schema.json',
    expectedFile: 'form-page.n015.json',
  },
  {
    name: 'detail-page',
    schemaFile: 'detail-page.ui-schema.json',
    expectedFile: 'detail-page.n015.json',
  },
];

const options = { styling: 'tokens', typescript: true } as const;

function loadSchema(fileName: string): UiSchema {
  const schemaPath = path.join(FIXTURE_DIR, fileName);
  return JSON.parse(readFileSync(schemaPath, 'utf8')) as UiSchema;
}

type UnreadyGolden = {
  meta: { nodeCount: number; componentCount: number };
  affectedNodes: Array<{ nodeId: string; component: string; state: string }>;
  portedReadyComponents?: string[];
};

function loadGolden(fileName: string): UnreadyGolden {
  const filePath = path.join(GOLDEN_DIR, fileName);
  return JSON.parse(readFileSync(filePath, 'utf8')) as UnreadyGolden;
}

function expectedTargetReadinessReceipt(framework: 'react' | 'vue') {
  return recordValidationChecks(
    createValidationReceipt(undefined, framework),
    'schema-structure',
    'component-registry',
    'target-readiness',
  );
}

describe('code.generate golden readiness outcomes', () => {
  for (const fixture of FIXTURES) {
    for (const framework of ['react', 'vue'] as const) {
      it(`matches ${framework} OODS-N015 golden outcome for ${fixture.name}`, async () => {
        const schema = loadSchema(fixture.schemaFile);
        const expected = loadGolden(fixture.expectedFile);
        const result = await codegenHandle({ schema, framework, options });

        for (const component of expected.portedReadyComponents ?? []) {
          expect(
            result.errors?.some((error) => error.component === component) ?? false,
            `${component} should no longer contribute an OODS-N015 error`,
          ).toBe(false);
        }

        expect(result).toEqual({
          status: 'error',
          framework,
          code: '',
          fileExtension: '',
          imports: [],
          warnings: [],
          validationReceipt: expectedTargetReadinessReceipt(framework),
          errors: expected.affectedNodes.map(({ nodeId, component, state }) => ({
            code: 'OODS-N015',
            message: `Component ${component} is not emission-eligible for ${framework}; evidence state: ${state}.`,
            nodeId,
            component,
          })),
          meta: expected.meta,
        });
      });
    }
  }
});
