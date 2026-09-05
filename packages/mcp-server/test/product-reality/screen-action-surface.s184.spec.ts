import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { validateGeneratedArtifact } from '../../src/codegen/artifact-envelope.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');

const CASES = [
  {
    name: 'subscription-list-dark',
    screenId: 'screen-list-9',
    actions: ['handleFilter', 'handleRowClick', 'handleSort'],
  },
  {
    name: 'subscription-detail-dark',
    screenId: 'screen-detail-13',
    actions: ['handleDelete', 'handleEdit'],
  },
] as const;

const FRAMEWORKS = ['react', 'vue'] as const;

function savedSchema(name: typeof CASES[number]['name']): UiSchema {
  const record = JSON.parse(readFileSync(path.join(
    repositoryRoot,
    `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`,
  ), 'utf8')) as { schema: UiSchema };
  return record.schema;
}

function occurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function generatedBehaviorWithoutGuards(source: string, framework: typeof FRAMEWORKS[number]): string {
  const body = framework === 'react'
    ? source.slice(source.indexOf('export const GeneratedUI'))
    : source.slice(source.indexOf('<script setup'), source.indexOf('</script>'));
  return body
    .split('\n')
    .filter((line) => !line.includes("typeof actions."))
    .join('\n');
}

describe('Sprint 184 m06 generated screen action surface', () => {
  it.each(CASES.flatMap((schemaCase) => (
    FRAMEWORKS.map((framework) => ({ ...schemaCase, framework }))
  )))(
    'wires every declared action into $name/$framework render output',
    async ({ name, screenId, actions, framework }) => {
      const result = await generateCode({
        framework,
        profile: 'build',
        schema: savedSchema(name),
      });

      expect(result.status, JSON.stringify(result.errors ?? [])).toBe('ok');
      expect(result.artifact).toBeDefined();
      expect(validateGeneratedArtifact(result.artifact!)).toEqual([]);
      expect(result.artifact!.actions.map((action) => action.name)).toEqual(actions);
      expect(result.code).toContain(`data-oods-screen-actions="${screenId}"`);
      expect(result.code.match(/@oods-(?:local|domain)-binding/g)?.length ?? 0).toBeGreaterThan(0);
      expect(occurrences(result.code, '@oods-domain-binding')).toBe(actions.length);

      const generatedBehavior = generatedBehaviorWithoutGuards(result.code, framework);
      for (const action of actions) {
        expect(
          occurrences(result.code, `data-oods-action="${action}"`),
          `${name}/${framework} must expose exactly one generated control for ${action}`,
        ).toBe(1);
        expect(result.code).toContain(`/* @oods-domain-binding ${action} */`);
        expect(
          occurrences(generatedBehavior, `actions.${action}(`),
          `${name}/${framework} must call ${action} outside its precondition guard`,
        ).toBeGreaterThanOrEqual(1);
      }
    },
  );

  it.each(FRAMEWORKS)(
    '%s uses the saved Subscription id and deterministic action operands',
    async (framework) => {
      const result = await generateCode({
        framework,
        profile: 'build',
        schema: savedSchema('subscription-list-dark'),
      });
      expect(result.status, JSON.stringify(result.errors ?? [])).toBe('ok');
      expect(result.code).toContain(framework === 'react'
        ? 'onClick={() => handleRowClick(subscriptionId)}'
        : '@click="handleRowClick(subscriptionId)"');
      expect(result.code).toContain(framework === 'react'
        ? "onClick={() => handleSort('status')}"
        : "@click=\"handleSort('status')\"");
      expect(result.code).toContain(framework === 'react'
        ? 'onClick={() => handleFilter({})}'
        : '@click="handleFilter({})"');
    },
  );
});
