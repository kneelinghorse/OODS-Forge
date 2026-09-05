import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { componentContracts } from '@oods/component-contracts';

import {
  createTargetCapabilityPreflight,
  preflightTargetCapabilities,
  type TargetReadiness,
} from '../../src/codegen/target-readiness.js';
import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import type { CodegenValidationProfile } from '../../src/codegen/types.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';
import { FOUNDATION_V1_IDS, FOUNDATION_V1_SHOWCASE_SCHEMA } from './foundation-fixture.s182.js';
import { verifyReadinessRefs } from '../../../../scripts/product-reality/verify-readiness-refs.mjs';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(TEST_DIRECTORY, '../../../..');
const REACT_INDEX = path.join(REPOSITORY_ROOT, 'packages/components-react/src/index.ts');
const VUE_INDEX = path.join(REPOSITORY_ROOT, 'packages/components-vue/src/index.ts');
const PROTOTYPE_KEYS = [
  'constructor',
  'toString',
  'valueOf',
  '__proto__',
  'hasOwnProperty',
] as const;

function readJson<T>(repositoryPath: string): T {
  return JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, repositoryPath), 'utf8')) as T;
}

const readiness: Record<'react' | 'vue', TargetReadiness> = {
  react: readJson('packages/components-react/evidence/react-readiness.v1.json'),
  vue: readJson('packages/components-vue/evidence/vue-readiness.v1.json'),
};

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function shallowNodes(): UiElement[] {
  return FOUNDATION_V1_IDS.map((component, index) => ({
    id: `readiness-${index}`,
    component,
  }));
}

function schemaFor(component: string): UiSchema {
  const propsByComponent: Record<string, Record<string, unknown>> = {
    Badge: { content: 'Ready' },
    Banner: { title: 'Ready' },
    Button: { content: 'Continue' },
    Card: {},
    Checkbox: { label: 'Enabled' },
    DatePicker: { label: 'Date' },
    Grid: {},
    Input: { label: 'Name' },
    Select: { label: 'Choice', options: [{ value: 'yes', label: 'Yes' }] },
    Stack: {},
    Table: { columns: [{ key: 'name', label: 'Name' }], rows: [{ id: '1', name: 'One' }] },
    Tabs: { items: [{ id: 'one', label: 'One', panel: 'First' }] },
    Text: { content: 'Ready' },
    Textarea: { label: 'Notes' },
  };
  return {
    version: '2026.09',
    screens: [{
      id: `screen-${component}`,
      component,
      props: Object.hasOwn(propsByComponent, component) ? propsByComponent[component] : {},
    }],
  };
}

function withoutExport(source: string, symbol: string): string {
  return source.replace(new RegExp(`\\b${symbol},\\s*`), '');
}

function runWithConstructorPrototypeValue(
  prototypeValue: unknown,
  contractProps: readonly string[],
  nodeProps: Record<string, unknown>,
): { thrown?: unknown; issues?: ReturnType<typeof preflightTargetContracts>['issues'] } {
  const contracts = componentContracts as unknown as Record<string, unknown>;
  const contractDescriptor = Object.getOwnPropertyDescriptor(contracts, 'constructor');
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, 'constructor')!;
  let result: ReturnType<typeof preflightTargetContracts> | undefined;
  let thrown: unknown;
  try {
    Object.defineProperty(contracts, 'constructor', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {
        id: 'Button',
        version: '1.0.0',
        props: contractProps,
        slots: [],
        events: [],
        states: [],
        tokenRoles: [],
        accessibility: [],
        compatibility: 'Contained own-key regression probe.',
      },
    });
    Object.defineProperty(Object.prototype, 'constructor', {
      ...prototypeDescriptor,
      value: prototypeValue,
    });
    result = preflightTargetContracts({
      version: '2026.09',
      screens: [{ id: 'constructor-probe', component: 'constructor', props: nodeProps }],
    }, 'react');
  } catch (error) {
    thrown = error;
  } finally {
    Object.defineProperty(Object.prototype, 'constructor', prototypeDescriptor);
    if (contractDescriptor) Object.defineProperty(contracts, 'constructor', contractDescriptor);
    else delete contracts.constructor;
  }
  return thrown === undefined ? { issues: result!.issues } : { thrown };
}

describe('s184-m02 readiness reference enforcement', () => {
  it('keeps the frozen foundation predicate pure and the packed consumer evidence unchanged', () => {
    const foundation = readFileSync(
      path.join(REPOSITORY_ROOT, 'packages/component-contracts/src/foundation-v1.ts'),
      'utf8',
    );
    for (const forbidden of ['existsSync', 'readFileSync', 'require.resolve', 'import.meta.resolve', 'node:fs']) {
      expect(foundation, forbidden).not.toContain(forbidden);
    }
    expect(sha256(foundation)).toBe('7f4c9ae5e2863880859c312a2587254322a36f194f5a66eb25c34a993ba4194f');

    const consumer = readFileSync(
      path.join(REPOSITORY_ROOT, 'artifacts/product-reality/sprint-182/m03/package-verification/consumer.mjs'),
      'utf8',
    );
    expect(sha256(consumer)).toBe('f1d6dd4518bfd3036b2dca89b0d61f041d531a76e7e8de6a1c7325d37fe67491');
    const packedReport = readJson<{
      status: string;
      selected: number;
      passed: number;
      failed: number;
      skipped: number;
      externalArtifactRoot: boolean;
      sprint182StatusBeforeAndAfterIdentical: boolean;
      packedProof: { readinessRows: number; esmCanonicalExports: number; cjsCanonicalExports: number };
    }>('artifacts/product-reality/sprint-184/m02/emission/fresh-vue-packed-import.json');
    expect(packedReport).toMatchObject({
      status: 'passed',
      selected: 6,
      passed: 6,
      failed: 0,
      skipped: 0,
      externalArtifactRoot: true,
      sprint182StatusBeforeAndAfterIdentical: true,
    });
    expect(packedReport.packedProof).toMatchObject({
      readinessRows: 14,
      esmCanonicalExports: 14,
      cjsCanonicalExports: 14,
    });
  });

  it('independently verifies the exact 178/150/28 readiness-ref inventory', () => {
    const report = verifyReadinessRefs(REPOSITORY_ROOT);
    expect(report).toMatchObject({
      status: 'passed',
      totals: { references: 178, resolved: 178, classA: 150, classB: 28 },
      targets: {
        react: { rows: 14, references: 84, resolved: 84, classA: 70, classB: 14 },
        vue: { rows: 14, references: 94, resolved: 94, classA: 80, classB: 14 },
      },
      evidenceClasses: {
        versionedContract: 28,
        targetImplementation: 28,
        packageExport: 28,
        publicDeclaration: 28,
        dependencyClosure: 28,
        frameworkScenario: 38,
      },
      failures: [],
    });
  });

  it.each(['react', 'vue'] as const)(
    'accepts all 14 %s rows when declarations and Class A refs resolve',
    (framework) => {
      expect(preflightTargetCapabilities(shallowNodes(), framework)).toEqual([]);
    },
  );

  it('resolves each row once when an evidence view is constructed', () => {
    let reads = 0;
    const preflight = createTargetCapabilityPreflight({
      repositoryRoot: REPOSITORY_ROOT,
      readiness,
      readFile: (absolutePath) => {
        reads += 1;
        return readFileSync(absolutePath, 'utf8');
      },
    });
    const constructionReads = reads;
    expect(constructionReads).toBeGreaterThan(0);
    expect(preflight(shallowNodes(), 'react')).toEqual([]);
    expect(preflight(shallowNodes(), 'vue')).toEqual([]);
    expect(preflight(shallowNodes(), 'react')).toEqual([]);
    expect(reads).toBe(constructionReads);
  });

  it('rejects a truthy appended row whose physical export does not exist', async () => {
    const fabricatedReact = structuredClone(readiness.react);
    const fabricated = structuredClone(
      fabricatedReact.rows.find(({ componentId }) => componentId === 'Badge')!,
    );
    fabricated.componentId = 'StatusBadge';
    fabricated.evidence!.targetImplementation!.refs = [
      'packages/does-not-exist/NOPE.tsx#Imaginary',
    ];
    expect(fabricated.emissionEligible).toBe(true);
    expect(Object.values(fabricated.evidence!).every(({ status }) => status === 'passed')).toBe(true);
    fabricatedReact.rows.push(fabricated);
    const targetCapabilityPreflight = createTargetCapabilityPreflight({
      repositoryRoot: REPOSITORY_ROOT,
      readiness: { react: fabricatedReact },
    });

    const result = await generateCode(
      { framework: 'react', profile: 'build', schema: schemaFor('StatusBadge') },
      { targetCapabilityPreflight },
    );
    expect(result).toMatchObject({
      status: 'error',
      code: '',
      imports: [],
      errors: [{ code: 'OODS-N015', component: 'StatusBadge' }],
    });
    expect(result.errors?.[0]?.message).toContain('evidence state: reference-unresolved');
    expect(result.errors?.map(({ code }) => code)).toEqual(['OODS-N015']);
    expect(result.meta?.unknownComponents).toBeUndefined();
  });

  it.each(['react', 'vue'] as const)(
    'fails all %s rows closed with declaration-unbuilt when the target dist is absent',
    async (framework) => {
      const distSegment = `/packages/components-${framework}/dist/`;
      const targetCapabilityPreflight = createTargetCapabilityPreflight({
        repositoryRoot: REPOSITORY_ROOT,
        readiness,
        readFile: (absolutePath) => {
          if (absolutePath.replaceAll(path.sep, '/').includes(distSegment)) throw new Error('ENOENT');
          return readFileSync(absolutePath, 'utf8');
        },
      });
      const issues = targetCapabilityPreflight(shallowNodes(), framework);
      expect(issues).toHaveLength(14);
      expect(new Set(issues.map(({ component }) => component))).toEqual(new Set(FOUNDATION_V1_IDS));
      expect(issues.every(({ message }) => message.includes('evidence state: declaration-unbuilt'))).toBe(true);

      const result = await generateCode(
        { framework, profile: 'build', schema: schemaFor('Text') },
        { targetCapabilityPreflight },
      );
      expect(result).toMatchObject({
        status: 'error',
        code: '',
        imports: [],
        errors: [{ code: 'OODS-N015', component: 'Text' }],
      });
    },
  );

  it.each([
    ['react', REACT_INDEX],
    ['vue', VUE_INDEX],
  ] as const)(
    'makes exactly Badge red and leaves the other 13 %s generations green when its export vanishes',
    async (framework, targetIndex) => {
      const targetCapabilityPreflight = createTargetCapabilityPreflight({
        repositoryRoot: REPOSITORY_ROOT,
        readiness,
        readFile: (absolutePath) => {
          const source = readFileSync(absolutePath, 'utf8');
          return absolutePath === targetIndex ? withoutExport(source, 'Badge') : source;
        },
      });
      expect(targetCapabilityPreflight(shallowNodes(), framework)).toMatchObject([
        { code: 'OODS-N015', component: 'Badge' },
      ]);

      for (const component of FOUNDATION_V1_IDS) {
        const result = await generateCode(
          { framework, profile: 'build', schema: schemaFor(component) },
          { targetCapabilityPreflight },
        );
        if (component === 'Badge') {
          expect(result.status, component).toBe('error');
          expect(result.errors, component).toMatchObject([{ code: 'OODS-N015', component }]);
        } else {
          expect(result.status, component).toBe('ok');
          expect(result.errors ?? [], component).toEqual([]);
        }
      }
    },
  );

  it('keeps a source-pruned portable evidence view loadable and build-fail-closed', async () => {
    const targetCapabilityPreflight = createTargetCapabilityPreflight({
      repositoryRoot: path.join(REPOSITORY_ROOT, '.nonexistent-portable-root'),
      readiness,
    });
    for (const framework of ['react', 'vue'] as const) {
      expect(targetCapabilityPreflight(shallowNodes(), framework)).toHaveLength(14);
      const result = await generateCode(
        { framework, profile: 'build', schema: schemaFor('Text') },
        { targetCapabilityPreflight },
      );
      expect(result.errors).toMatchObject([{ code: 'OODS-N015', component: 'Text' }]);
      expect(result.code).toBe('');
      expect(result.artifact).toBeUndefined();
    }
  });

  it('does not inherit a REQUIRED_PROPS entry for an own contract named constructor', () => {
    const probe = runWithConstructorPrototypeValue(Object, [], {});
    expect(probe.thrown).toBeUndefined();
    expect(probe.issues).toEqual([]);
  });

  it('does not inherit a CROSS_TARGET_PROP_EXTENSIONS entry', () => {
    const probe = runWithConstructorPrototypeValue([], [], { imaginary: 'value' });
    expect(probe.thrown).toBeUndefined();
    expect(probe.issues).toMatchObject([{
      code: 'OODS-V007',
      component: 'constructor',
      message: 'Prop "imaginary" is not in the canonical constructor contract.',
    }]);
  });

  it('does not inherit a PROP_VALUE_CONTRACTS component or prop rule', () => {
    const probe = runWithConstructorPrototypeValue(new Set(['prototype']), ['has'], { has: 'value' });
    expect(probe.thrown).toBeUndefined();
    expect(probe.issues).toEqual([]);
  });

  it.each(PROTOTYPE_KEYS)(
    'returns typed V119 + N015 envelopes without throwing for prototype key %s',
    async (component) => {
      for (const framework of ['react', 'vue'] as const) {
        for (const profile of ['draft', 'build', 'release'] as CodegenValidationProfile[]) {
          const result = await generateCode({ framework, profile, schema: schemaFor(component) });
          const issues = [...result.warnings, ...(result.errors ?? [])];
          expect(issues.map(({ code }) => code), `${component}/${framework}/${profile}`)
            .toEqual(expect.arrayContaining(['OODS-V119', 'OODS-N015']));
          expect(issues, `${component}/${framework}/${profile}`).toEqual(expect.arrayContaining([
            expect.objectContaining({ code: 'OODS-V119', message: expect.any(String) }),
            expect.objectContaining({
              code: 'OODS-N015',
              message: expect.any(String),
              nodeId: `screen-${component}`,
              component,
            }),
          ]));
          expect(result.meta?.unknownComponents, `${component}/${framework}/${profile}`)
            .toEqual([component]);
          if (profile !== 'draft') {
            expect(result).toMatchObject({ status: 'error', code: '', imports: [] });
            expect(result.artifact).toBeUndefined();
          }
        }
      }
    },
  );

  it.each(['react', 'vue'] as const)(
    'runs the complete frozen 14-family %s showcase through build',
    async (framework) => {
      const result = await generateCode({
        framework,
        profile: 'build',
        schema: FOUNDATION_V1_SHOWCASE_SCHEMA,
      });
      expect(result.status).toBe('ok');
      expect(result.errors ?? []).toEqual([]);
      expect(result.artifact?.files).toHaveLength(1);
    },
  );
});
