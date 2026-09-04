import { createRequire } from 'node:module';

import type { UiElement } from '../schemas/generated.js';
import type { CodegenIssue, CodegenFramework } from './types.js';

type TargetFramework = Extract<CodegenFramework, 'react' | 'vue'>;

type CapabilityBaseline = {
  rows: Array<{
    id: string;
    surfaces?: Partial<Record<TargetFramework, { state?: string }>>;
  }>;
};

type TargetReadiness = {
  target: TargetFramework;
  rows: Array<{
    componentId: string;
    state: string;
    emissionEligible: boolean;
  }>;
};

const require = createRequire(import.meta.url);

// These are intentionally loaded through the packages' public JSON subpaths. The
// code-generation target gate must consume the same evidence a packed consumer
// sees, rather than reaching into another workspace package's source tree.
const capabilityBaseline = require(
  '@oods/component-contracts/registry/capabilities',
) as CapabilityBaseline;
const reactReadiness = require('@oods/components-react/readiness') as TargetReadiness;
const vueReadiness = require('@oods/components-vue/readiness') as TargetReadiness;

const baselineByComponent = new Map(
  capabilityBaseline.rows.map((row) => [row.id, row] as const),
);

const readinessByTarget: Readonly<Record<TargetFramework, ReadonlyMap<string, TargetReadiness['rows'][number]>>> = {
  react: new Map(reactReadiness.rows.map((row) => [row.componentId, row] as const)),
  vue: new Map(vueReadiness.rows.map((row) => [row.componentId, row] as const)),
};

export function isKnownComponentForCodegen(
  componentId: string,
  structuredRegistryNames: ReadonlySet<string>,
): boolean {
  return structuredRegistryNames.size > 0
    ? structuredRegistryNames.has(componentId)
    : baselineByComponent.has(componentId);
}

function nodesInDocumentOrder(screens: readonly UiElement[]): UiElement[] {
  const ordered: UiElement[] = [];
  const stack = [...screens].reverse();

  while (stack.length > 0) {
    const node = stack.pop()!;
    ordered.push(node);
    if (node.children) stack.push(...node.children.slice().reverse());
  }

  return ordered;
}

/**
 * Check every requested component/target pair before a framework emitter runs.
 * Known components without target evidence are distinct from unknown components:
 * callers receive one OODS-N015 issue per affected node in document order.
 */
export function preflightTargetCapabilities(
  screens: readonly UiElement[],
  framework: TargetFramework,
): CodegenIssue[] {
  const targetReadiness = readinessByTarget[framework];
  const issues: CodegenIssue[] = [];

  for (const node of nodesInDocumentOrder(screens)) {
    const baseline = baselineByComponent.get(node.component);
    const readiness = targetReadiness.get(node.component);

    // A target package assertion is only actionable for a component that also
    // exists in the controlling capability baseline.
    if (baseline && readiness?.emissionEligible === true) continue;

    const state = readiness?.state
      ?? baseline?.surfaces?.[framework]?.state
      ?? 'unavailable';
    issues.push({
      code: 'OODS-N015',
      message:
        `Component ${node.component} is not emission-eligible for ${framework}; `
        + `evidence state: ${state}.`,
      nodeId: node.id,
      component: node.component,
    });
  }

  return issues;
}
