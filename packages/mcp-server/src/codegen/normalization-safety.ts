import type { UiElement } from '../schemas/generated.js';
import type { CodegenFramework, CodegenIssue } from './types.js';

const REPRESENTED_TAB_CHILD_PROPS = new Set([
  'active',
  'body',
  'children',
  'content',
  'disabled',
  'isDisabled',
  'label',
  'panel',
  'text',
  'title',
  'value',
]);

function recordKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.keys(value as Record<string, unknown>).sort();
}

function bindingBearingDescendants(node: UiElement): UiElement[] {
  const result: UiElement[] = [];
  const stack = [...(node.children ?? [])].reverse();
  while (stack.length > 0) {
    const child = stack.pop()!;
    if (Object.keys(child.bindings ?? {}).length > 0) result.push(child);
    if (child.children) stack.push(...child.children.slice().reverse());
  }
  return result;
}

/**
 * Refuse schema shapes whose compatibility normalization would discard
 * executable semantics. React and Vue map Tabs children to the component's
 * panel surface; HTML still relies on the legacy scalar-item normalization.
 */
export function preflightNormalizationSafety(
  screens: readonly UiElement[],
  framework: CodegenFramework = 'html',
): CodegenIssue[] {
  const issues: CodegenIssue[] = [];
  const stack = [...screens].reverse();

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.component === 'Tabs' && node.children?.length) {
      const propKeys = recordKeys(node.props);
      const hasExplicitItems = propKeys.some((key) => (
        (key === 'items' || key === 'tabs')
        && Array.isArray((node.props as Record<string, unknown>)[key])
      ));
      if (hasExplicitItems) {
        issues.push({
          code: 'OODS-V007',
          message:
            `Tabs ${JSON.stringify(node.id)} cannot combine explicit items with children; `
            + 'normalization would discard the child tree.',
          nodeId: node.id,
          component: node.component,
        });
      } else if (framework === 'html') {
        for (const child of node.children) {
          if (child.children?.length) {
            issues.push({
              code: 'OODS-V007',
              message:
                `Nested content under Tabs child ${JSON.stringify(child.id)} cannot be preserved `
                + 'when the child is normalized into a scalar item record.',
              nodeId: child.id,
              component: child.component,
            });
          }

          const structuralFields = [
            ...(child.route !== undefined ? ['route'] : []),
            ...(recordKeys(child.layout).length > 0 ? ['layout'] : []),
            ...(recordKeys(child.style).length > 0 ? ['style'] : []),
            ...recordKeys(child.meta).filter((key) => key !== 'label').map((key) => `meta.${key}`),
          ];
          if (structuralFields.length > 0) {
            issues.push({
              code: 'OODS-V007',
              message:
                `Tabs child ${JSON.stringify(child.id)} uses ${structuralFields.join(', ')}, which `
                + 'cannot be preserved in the normalized item record.',
              nodeId: child.id,
              component: child.component,
            });
          }

          const discardedProps = recordKeys(child.props)
            .filter((key) => !REPRESENTED_TAB_CHILD_PROPS.has(key));
          if (discardedProps.length > 0) {
            issues.push({
              code: 'OODS-V007',
              message:
                `Tabs child ${JSON.stringify(child.id)} has props that normalization cannot `
                + `preserve: ${discardedProps.join(', ')}.`,
              nodeId: child.id,
              component: child.component,
            });
          }
        }

        for (const child of bindingBearingDescendants(node)) {
          issues.push({
            code: 'OODS-V007',
            message:
              `Binding-bearing node ${JSON.stringify(child.id)} cannot be preserved when Tabs `
              + `${JSON.stringify(node.id)} children are normalized into item records.`,
            nodeId: child.id,
            component: child.component,
          });
        }
      }
    }
    if (node.children) stack.push(...node.children.slice().reverse());
  }

  return issues;
}
