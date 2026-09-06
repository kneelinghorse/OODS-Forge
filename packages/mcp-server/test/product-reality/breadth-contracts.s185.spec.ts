import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { preflightTargetContracts } from '../../src/codegen/target-contracts.js';
import { normalizeSchemaForFramework } from '../../src/codegen/framework-normalization.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const FRAMEWORKS = ['react', 'vue'] as const;
const BREADTH_COMPONENTS = [
  'DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview',
] as const;
type BreadthComponent = (typeof BREADTH_COMPONENTS)[number];
type Framework = (typeof FRAMEWORKS)[number];

const TARGET_CELLS = BREADTH_COMPONENTS.flatMap((component) => (
  FRAMEWORKS.map((framework) => ({ component, framework }))
));

const VALID_PROPS: Record<BreadthComponent, Record<string, unknown>> = {
  DetailHeader: {
    title: 'Plan', label: 'Plan label', text: 'Plan text', subtitle: 'Billing',
    sublabel: 'Billing label', description: 'Plan details', metadata: 'Active',
    meta: 'Monthly', level: 2, as: 'h1',
  },
  CardHeader: {
    title: 'User', label: 'User label', text: 'User text', supporting: 'Account owner',
    supportingText: 'Primary account', subtitle: 'Details', description: 'User details',
    level: 3, as: 'h2',
  },
  ColorSwatch: { color: '#265cff', value: 'blue', state: 'active', label: 'Ocean blue' },
  ColorizedBadge: {
    label: 'Active', text: 'Available', state: 'active', value: 'enabled',
    status: 'active', color: '#265cff', hue: 'blue', swatch: 'ocean',
    variant: 'colorized', tone: 'info', emphasis: 'subtle',
  },
  VizAreaPreview: { width: 640, height: 360 },
};

// One invalid declared value per family makes deletion of any single family
// from PROP_VALUE_CONTRACTS observable. bogusProp alone only tests name checks.
const INVALID_TYPED_PROP: Record<
  BreadthComponent,
  { prop: string; value: unknown; expected: string }
> = {
  DetailHeader: { prop: 'title', value: false, expected: 'a string' },
  CardHeader: { prop: 'supportingText', value: false, expected: 'a string' },
  ColorSwatch: { prop: 'color', value: 42, expected: 'a string' },
  ColorizedBadge: { prop: 'color', value: 42, expected: 'a string' },
  VizAreaPreview: { prop: 'width', value: 'wide', expected: 'a finite number' },
};

// These are the measured, immutable operands; keep node identities explicit so
// dropping a target node from a saved schema cannot turn this into a vacuous pass.
const SAVED_SCHEMA_TARGET_NODES = {
  'cmos-messages-redesign': [{ id: 'slot-header-2', component: 'DetailHeader' }],
  'plan-form-dark': [{ id: 'form-title-1', component: 'DetailHeader' }],
  'pt-shop-parts-entry-router-v1': [{ id: 'slot-hero-2', component: 'DetailHeader' }],
  'user-card-showcase': [{ id: 'slot-metadata-12', component: 'CardHeader' }],
  'cmos-dashboard-redesign': [
    { id: 'slot-header-2', component: 'DetailHeader' },
    { id: 'slot-metrics-6', component: 'VizAreaPreview' },
  ],
  'the-academy-landing-v1': [
    { id: 'slot-header-2', component: 'DetailHeader' },
    { id: 'slot-metrics-5', component: 'ColorizedBadge' },
    { id: 'slot-main-section-4-21', component: 'ColorSwatch' },
  ],
};

function schema(component: BreadthComponent, props: Record<string, unknown>): UiSchema {
  return {
    version: '1.0',
    screens: [{ id: `breadth-${component}`, component, props }],
  };
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), 'utf8')) as T;
}

function allNodes(screens: readonly UiElement[]): UiElement[] {
  return screens.flatMap((node) => [node, ...allNodes(node.children ?? [])]);
}

async function buildAtContractBoundary(
  component: BreadthComponent,
  framework: Framework,
  props: Record<string, unknown>,
) {
  // m02 precedes framework ports. This existing dependency seam bypasses ONLY
  // target readiness, so the real build-profile prop check can execute before
  // m03 supplies implementations. This is contract enforcement evidence;
  // live generation without injection and packed consumers remain later gates.
  return generateCode(
    { framework, profile: 'build', schema: schema(component, props) },
    { targetCapabilityPreflight: () => [] },
  );
}

describe('Sprint 185 m02 — breadth target contracts', () => {
  // Establish that validation executes before asserting any accepted operands.
  it.each(TARGET_CELLS)(
    'executes the $component prop check at $framework build (m02 readiness fixture)',
    async ({ component, framework }) => {
      const result = await buildAtContractBoundary(component, framework, { bogusProp: 'reject' });

      expect(result.status).toBe('error');
      expect(result.artifact).toBeUndefined();
      expect(result.code).toBe('');
      expect(result.validationReceipt).toMatchObject({ profile: 'build' });
      expect(result.validationReceipt.checks).toContain('props-contract');
      expect(result.errors).toEqual([{
        code: 'OODS-V007',
        nodeId: `breadth-${component}`,
        component,
        message: `Prop "bogusProp" is not in the canonical ${component} contract.`,
      }]);
    },
  );

  it('retains the pre-registration control showing that zero issues meant no prop check ran', () => {
    const baseline = readJson<{
      sourceCommit: string;
      results: Array<{
        component: BreadthComponent;
        framework: Framework;
        registered: boolean;
        preflight: { checks: string[]; issues: unknown[]; bindingSafetyIssues: unknown[] };
        generated: { status: string; errorCodes: string[]; hasArtifact: boolean };
      }>;
    }>('artifacts/product-reality/sprint-185/m02/validation-baseline.json');

    expect(baseline.sourceCommit).toBe('8fd78b25b76088c1945be548d64d0539021fef27');
    expect(baseline.results.map(({ component, framework }) => ({ component, framework })))
      .toEqual(TARGET_CELLS);
    for (const cell of baseline.results) {
      expect(cell.registered).toBe(false);
      expect(cell.preflight).toEqual({
        checks: ['events-contract'], issues: [], bindingSafetyIssues: [],
      });
      expect(cell.generated).toMatchObject({
        status: 'error', errorCodes: ['OODS-N015'], hasArtifact: false,
      });
    }
  });

  it.each(TARGET_CELLS)(
    'bites a declared invalid value for $component at $framework build (m02 readiness fixture)',
    async ({ component, framework }) => {
      const invalid = INVALID_TYPED_PROP[component];
      const result = await buildAtContractBoundary(component, framework, {
        [invalid.prop]: invalid.value,
      });

      expect(result.status).toBe('error');
      expect(result.artifact).toBeUndefined();
      expect(result.code).toBe('');
      expect(result.validationReceipt).toMatchObject({ profile: 'build' });
      expect(result.validationReceipt.checks).toContain('props-contract');
      expect(result.errors).toEqual([{
        code: 'OODS-V007',
        nodeId: `breadth-${component}`,
        component,
        message: `Prop "${invalid.prop}" on ${component} must be ${invalid.expected}; `
          + `received ${typeof invalid.value}.`,
      }]);
    },
  );

  it.each(TARGET_CELLS)(
    'accepts the HTML-derived declared props for $component on $framework',
    ({ component, framework }) => {
      const result = preflightTargetContracts(schema(component, VALID_PROPS[component]), framework);
      expect(result.checks).toEqual(['props-contract', 'slots-contract', 'events-contract']);
      expect(result.issues).toEqual([]);
      expect(result.bindingSafetyIssues).toEqual([]);
    },
  );

  it.each(Object.entries(SAVED_SCHEMA_TARGET_NODES).flatMap(([name, nodes]) => (
    FRAMEWORKS.map((framework) => ({ name, nodes, framework }))
  )))(
    'validates every measured breadth node in $name on $framework without OODS-V007',
    ({ name, nodes, framework }) => {
      const saved = readJson<{ schema: UiSchema }>(
        `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`,
      ).schema;
      const targetNodes = allNodes(saved.screens)
        .filter((node) => BREADTH_COMPONENTS.includes(node.component as BreadthComponent));
      expect(targetNodes.map(({ id, component }) => ({ id, component }))).toEqual(nodes);
      // Check that normalization retains each measured node without isolating
      // a read-only heading from the form field whose state it subscribes to.
      const normalizedTargetNodes = allNodes(normalizeSchemaForFramework(saved, framework).screens)
        .filter((node) => BREADTH_COMPONENTS.includes(node.component as BreadthComponent));
      expect(normalizedTargetNodes.map(({ id, component }) => ({ id, component }))).toEqual(nodes);

      const result = preflightTargetContracts(saved, framework);
      expect(result.checks).toEqual(['props-contract', 'slots-contract', 'events-contract']);
      expect(result.issues).toEqual([]);
      expect(result.bindingSafetyIssues).toEqual([]);
    },
  );

  it.each(FRAMEWORKS)('keeps heading elements and finite preview dimensions typed on %s', (framework) => {
    for (const component of ['DetailHeader', 'CardHeader'] as const) {
      for (const props of [{ as: 'div' }, { level: 0 }, { level: 7 }, { level: 1.5 }, { level: '2' }]) {
        expect(preflightTargetContracts(schema(component, props), framework).issues)
          .toEqual([expect.objectContaining({ code: 'OODS-V007', component })]);
      }
      for (let level = 1; level <= 6; level += 1) {
        expect(preflightTargetContracts(schema(component, { level, as: `h${level}` }), framework).issues)
          .toEqual([]);
      }
    }
    for (const props of [{ width: Number.NaN }, { height: Number.POSITIVE_INFINITY }]) {
      expect(preflightTargetContracts(schema('VizAreaPreview', props), framework).issues)
        .toEqual([expect.objectContaining({ code: 'OODS-V007', component: 'VizAreaPreview' })]);
    }
  });
});
