import type { UiElement } from '../schemas/generated.js';

export function chartNodes(nodes: UiElement[]): UiElement[] {
  return nodes.flatMap(node => [...(node.chart ? [node] : []), ...chartNodes(node.children ?? [])]);
}

