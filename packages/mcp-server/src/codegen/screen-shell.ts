import type { UiElement, UiSchema } from '../schemas/generated.js';
import type { CodegenOptions } from './types.js';

/**
 * The shell of a standalone generated screen (Sprint 202 m01): one `main` landmark around the screen and one
 * level-one heading. The composer names every screen root (`meta.label`) after its object and context; a
 * screen that places its own level-one heading (a detail's record title) keeps it, any other screen's shell
 * renders the label as its `h1`. Workflow screens are embedded in the workflow app, which owns both.
 */
export interface ScreenShell {
  screenId: string;
  /** The heading the shell renders; undefined when the screen tree already carries a level-one heading or has no label. */
  heading?: string;
}

/** "Subscription" from "Subscription", "Address Entry" from "AddressEntry". */
export function objectLabel(object: string): string {
  return object.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
}

/** The plural the workflow app also uses for its list heading, with the common English endings. */
export function pluralLabel(label: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}

/** The page title of one screen: the object's plural for a list, the object with its context otherwise. */
export function screenTitle(object: string, context: string | undefined): string {
  const label = objectLabel(object);
  switch (context) {
    case 'list': return pluralLabel(label);
    case 'form': return `${label} form`;
    case 'timeline': return `${label} timeline`;
    default: return label;
  }
}

const contextFromId = (id: string): string | undefined => /^screen-([a-z]+)-\d+$/.exec(id)?.[1];

/** Name every screen root after its object and context; an authored label is kept. */
export function labelScreens(schema: UiSchema, object: string | undefined, context: string | undefined): void {
  if (!object) return;
  for (const screen of schema.screens) {
    if (screen.meta?.label) continue;
    const screenContext = context && context !== 'workflow' ? context : contextFromId(screen.id);
    screen.meta = { ...(screen.meta ?? {}), label: screenTitle(object, screenContext) };
  }
}

const level = (value: unknown): number | undefined => typeof value === 'number' ? value : typeof value === 'string' && /^h[1-6]$/.test(value) ? Number(value.slice(1)) : undefined;

/** Whether a node renders a level-one heading: a DetailHeader or CardHeader at level 1, a Text or Heading as h1. */
export function isLevelOneHeading(node: UiElement): boolean {
  const props = node.props ?? {};
  if (node.component === 'DetailHeader' || node.component === 'CardHeader') return level(props.headingLevel) === 1 || level(props.level) === 1 || level(props.as) === 1;
  if (node.component === 'Text' || node.component === 'Heading') return level(props.as) === 1 || level(props.level) === 1;
  return false;
}

export function hasLevelOneHeading(nodes: readonly UiElement[]): boolean {
  return nodes.some(node => isLevelOneHeading(node) || hasLevelOneHeading(node.children ?? []));
}

/** The shell a standalone emission wraps its screens in; none for a workflow screen (the app is the shell). */
export function screenShell(schema: Pick<UiSchema, 'screens'>, options: Pick<CodegenOptions, 'workflowCollections'>): ScreenShell | undefined {
  if (options.workflowCollections) return undefined;
  const first = schema.screens[0];
  if (!first) return undefined;
  const label = typeof first.meta?.label === 'string' && first.meta.label.trim() ? first.meta.label.trim() : undefined;
  return { screenId: first.id, ...(label && !hasLevelOneHeading(schema.screens) ? { heading: label } : {}) };
}
