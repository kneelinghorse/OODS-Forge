import type { UiElement, UiSchema } from '../schemas/generated.js';

function executeNode(node: UiElement): UiElement {
  const children = node.children?.map(executeNode);
  const props = node.props && typeof node.props === 'object'
    ? { ...node.props }
    : undefined;

  if (
    node.component !== 'Stack'
    || props?.patternComponent !== 'StatusTimeline'
    || !Array.isArray(props.fields)
    || props.fields.length === 0
    || !props.fields.every((field) => typeof field === 'string' && field.length > 0)
  ) {
    return {
      ...node,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    };
  }

  const requestedFields = props.fields as string[];
  delete props.patternComponent;
  delete props.fields;

  const unusedChildren = [...(children ?? [])];
  const fieldChildren = requestedFields.map((field, index) => {
    const matchingIndex = unusedChildren.findIndex((child) => child.props?.field === field);
    if (matchingIndex >= 0) return unusedChildren.splice(matchingIndex, 1)[0]!;
    return {
      id: `${node.id}-field-${index + 1}`,
      component: 'Text',
      props: { field },
    } satisfies UiElement;
  });

  return {
    ...node,
    component: 'StatusTimeline',
    ...(Object.keys(props).length > 0 ? { props } : { props: undefined }),
    children: [...fieldChildren, ...unusedChildren],
  };
}

/**
 * Lower the bounded Stack composition directive into the named pattern before
 * component collection and target emission. Validation owns the directive
 * vocabulary; this pass owns its observable execution.
 */
export function executeCompositionDirectives(schema: UiSchema): UiSchema {
  return {
    ...schema,
    screens: schema.screens.map(executeNode) as UiSchema['screens'],
  };
}
