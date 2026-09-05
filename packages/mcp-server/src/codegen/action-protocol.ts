import type {
  BindingAnalysis,
  ResolvedBindingOccurrence,
} from './binding-utils.js';
import type { GeneratedArtifactAction } from './types.js';

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Project the normalized binding analysis into the portable artifact contract.
 * Compatible occurrences share one consumer action while retaining every
 * schema declaration site. Screen-root declarations drive generated action
 * controls rather than fictional props on a layout component.
 */
export function artifactActionsFromBindings(
  analysis: BindingAnalysis,
): GeneratedArtifactAction[] {
  return analysis.handlers
    .filter((handler) => handler.kind === 'domain')
    .map((handler): GeneratedArtifactAction => {
      const sources = handler.occurrences
        .map((occurrence) => ({
          nodeId: occurrence.nodeId,
          component: occurrence.component,
          event: occurrence.event,
        }))
        .sort((left, right) => compareCodePoint(
          `${left.nodeId}\u0000${left.event}\u0000${left.component}`,
          `${right.nodeId}\u0000${right.event}\u0000${right.component}`,
        ));
      const firstSource = sources[0];
      if (!firstSource) {
        throw new Error(`Domain action '${handler.handlerName}' has no schema declaration source.`);
      }
      return {
        name: handler.handlerName,
        parameters: handler.signature.parameters.map((parameter) => ({ ...parameter })),
        sources: [firstSource, ...sources.slice(1)],
      };
    })
    .sort((left, right) => compareCodePoint(left.name, right.name));
}

/** Binding occurrences for one uniquely identified schema node. */
export function bindingsForNode(
  analysis: BindingAnalysis,
  nodeId: string,
): ResolvedBindingOccurrence[] {
  return analysis.occurrences
    .filter((occurrence): occurrence is ResolvedBindingOccurrence => (
      occurrence.kind !== 'unknown' && occurrence.nodeId === nodeId
    ))
    .sort((left, right) => compareCodePoint(left.event, right.event));
}
