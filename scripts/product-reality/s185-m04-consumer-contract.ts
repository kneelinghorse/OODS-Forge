import { createRequire } from 'node:module';
import type { GeneratedArtifactAction } from '../../packages/mcp-server/src/codegen/types.js';
import type { UiElement, UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';

const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: { fragment(html: string): DocumentFragment };
};

export const S185_SCHEMA_NAMES = Object.freeze([
  'cmos-messages-redesign',
  'plan-form-dark',
  'pt-shop-parts-entry-router-v1',
  'user-card-showcase',
  'cmos-dashboard-redesign',
  'the-academy-landing-v1',
] as const);

/** Sprint 186 wave-2 subjects; each mission appends its schema once its components are root exports. */
export const S186_SCHEMA_NAMES = Object.freeze([
  'test-tagged-schema',
  'user-detail-showcase',
  'user-list-showcase',
  'user-timeline-showcase',
  'user-form-showcase',
] as const);

export type ConsumerInteraction =
  | { kind: 'tabs'; nodeId: string; component: 'Tabs'; selector: string }
  | { kind: 'action'; nodeId: string; component: string; selector: string; action: string }
  | { kind: 'field'; nodeId: string; component: string; selector: string; inputType: string }
  | { kind: 'none'; reason: string; disabledPaginationNodeIds: string[] };

export type BoundFieldProbe = { field: string; writerId: string; readerId: string };

export function deriveBoundFieldProbe(schema: UiSchema): BoundFieldProbe | null {
  const nodes = schemaNodes(schema);
  for (const reader of nodes.filter((node) => ['DetailHeader', 'CardHeader'].includes(node.component))) {
    const field = reader.props?.field;
    const handler = reader.bindings?.onChange;
    if (typeof field !== 'string' || !handler) continue;
    const writer = nodes.find((node) => ['Input', 'Textarea'].includes(node.component)
      && node.props?.field === field && node.bindings?.onChange === handler
      && node.props?.disabled !== true && node.props?.readOnly !== true);
    if (writer) return { field, writerId: writer.id, readerId: reader.id };
  }
  return null;
}

export function schemaNodes(schema: UiSchema): UiElement[] {
  const nodes: UiElement[] = [];
  const visit = (node: UiElement) => { nodes.push(node); node.children?.forEach(visit); };
  schema.screens.forEach(visit);
  return nodes;
}

export const selectorForNode = (id: string): string => `[id=${JSON.stringify(id)}]`;
const camel = (name: string) => name.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

export type ValueProbe = { nodeId: string; field: string; kind: 'numeric-input' | 'boolean-text' | 'status' | 'query-input' | 'family-text'; selector?: string; expected: string; editable: boolean };

/** Repaired bindings must visibly represent the supplied datum, including zero and false. */
export function deriveValueProbes(schema: UiSchema, model: Record<string, unknown>): ValueProbe[] {
  return schemaNodes(schema).flatMap((node): ValueProbe[] => {
    const textProbe = (field: unknown, selector?: string, truncate = false): ValueProbe[] => {
      if (typeof field !== 'string' || !schema.objectSchema?.[field]) return [];
      let expected = String(model[camel(field)] ?? '');
      if (truncate) {
        const limit = Number(node.props?.maxLength ?? (node.props?.truncate ? 40 : NaN));
        if (Number.isFinite(limit) && limit > 0 && expected.length > limit) expected = expected.slice(0, Math.max(0, limit - 1)).trimEnd() + '...';
      }
      return [{ nodeId: node.id, field, kind: 'family-text', ...(selector ? { selector } : {}), expected, editable: false }];
    };
    if (node.component === 'LabelCell') return [
      ...textProbe(node.props?.field, '[data-oods-label-cell-primary]', true),
      ...textProbe(node.props?.descriptionField, '[data-oods-label-cell-description]', true),
    ];
    if (node.component === 'InlineLabel') return textProbe(node.props?.field, undefined, true);
    if (node.component === 'FormLabelGroup') return [
      ...textProbe(node.props?.labelField, '[data-oods-form-label]'),
      ...textProbe(node.props?.placeholderField ?? node.props?.descriptionField, '[data-oods-form-hint]'),
    ];
    if (node.component === 'ClassificationBadge') return textProbe(node.props?.primaryCategoryField, '[data-oods-badge-label]');
    if (node.component === 'ClassificationEditor') return textProbe(node.props?.field, '[data-form-subtitle]');
    const field = node.props?.field;
    if (typeof field !== 'string') return [];
    const entry = schema.objectSchema?.[field];
    const value = model[camel(field)];
    const base = { nodeId: node.id, field, editable: false };
    if (node.component === 'Input' && node.props?.type === 'number' && ['integer', 'number'].includes(entry?.type ?? '')) {
      return [{ ...base, kind: 'numeric-input', expected: String(value ?? ''), editable: !!node.bindings?.onChange }];
    }
    if (node.component === 'SearchInput' && entry?.type === 'string') return [{ ...base, kind: 'query-input', expected: String(value ?? '') }];
    if (node.component === 'Text' && entry?.type === 'boolean') {
      return [{ ...base, kind: 'boolean-text', expected: value == null ? '' : value ? 'Yes' : 'No' }];
    }
    if (node.component === 'StatusTimeline' && typeof value === 'string') {
      const label = value.split(/[_-]/).filter(Boolean).map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(' ');
      return [{ ...base, kind: 'status', expected: `Current status: ${label}` }];
    }
    return [];
  });
}

export type SharedNativeFieldProbe = { field: string; inputId: string; selectId: string; selectContainer: boolean };

/** Exercise both native writers when an authentic schema shares one local field handler. */
export function deriveSharedNativeFieldProbes(schema: UiSchema): SharedNativeFieldProbe[] {
  const nodes = schemaNodes(schema);
  return nodes.flatMap((select): SharedNativeFieldProbe[] => {
    if (!['Select', 'StatusSelector'].includes(select.component) || !select.bindings?.onChange) return [];
    const field = select.props?.field;
    if (typeof field !== 'string' || schema.objectSchema?.[field]?.type !== 'string') return [];
    const input = nodes.find((node) => node.component === 'Input' && node.props?.field === field
      && node.bindings?.onChange === select.bindings?.onChange);
    return input ? [{ field, inputId: input.id, selectId: select.id, selectContainer: select.component === 'StatusSelector' }] : [];
  });
}

export type MountObligation = { nodeId: string; component: string; requiredInitially: boolean; reason?: string };

/** Canonical emitted ids/markers define the obligations; SSR output cannot erase them. */
export function deriveMountObligations(schema: UiSchema, source: string): MountObligation[] {
  const inactive = new Map<string, string>();
  const visit = (node: UiElement, inherited?: string) => {
    if (inherited) inactive.set(node.id, inherited);
    const children = node.children ?? [];
    const preferred = node.props?.selectedId ?? node.props?.defaultSelectedId ?? node.props?.active ?? node.props?.activeTab;
    const active = children.find((child) => child.id === preferred)
      ?? children.find((child) => child.props?.active === true)
      ?? children.find((child) => child.props?.disabled !== true && child.props?.isDisabled !== true);
    for (const child of children) visit(child, inherited ?? (node.component === 'Tabs' && child !== active
      ? `inactive initial Tabs panel ${child.id} under ${node.id}` : undefined));
  };
  schema.screens.forEach((node) => visit(node));
  const obligations = Array.from(source.matchAll(/\bid="([^"]+)"\s+data-oods-component="([^"]+)"/g), (match) => ({
    nodeId: match[1]!, component: match[2]!, requiredInitially: !inactive.has(match[1]!),
    ...(inactive.has(match[1]!) ? { reason: inactive.get(match[1]!) } : {}),
  }));
  if (!obligations.length) throw new Error('Generated source has no canonical node/component mount obligations.');
  return [...new Map(obligations.map((entry) => [`${entry.nodeId}/${entry.component}`, entry])).values()];
}

export function observeMountObligations(obligations: MountObligation[], html: string) {
  const root = JSDOM.fragment(html);
  return obligations.map((obligation) => {
    const node = root.querySelector(selectorForNode(obligation.nodeId));
    const owner = node?.closest(`[data-oods-component=${JSON.stringify(obligation.component)}]`);
    const present = !!node && !!owner;
    return { ...obligation, present, passed: !obligation.requiredInitially || present };
  });
}

/** Fill the actual public object shape, retaining established fixture values where compatible. */
export function deriveConsumerModel(schema: UiSchema, established: Record<string, unknown> = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(schema.objectSchema ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, field]) => {
    const key = camel(name);
    const previous = established[key];
    let value: unknown;
    if (field.enum?.length) value = field.enum.includes(previous as string) ? previous : field.enum[0];
    else if (Object.hasOwn(established, key)) value = previous;
    else if (field.type === 'array' || field.type.endsWith('[]')) value = [];
    else if (field.type === 'object' || field.type.startsWith('Record<')) value = {};
    else if (field.type === 'integer' || field.type === 'number') value = 0;
    else if (field.type === 'boolean') value = false;
    else if (field.type === 'date') value = '2026-09-05';
    else if (field.type === 'datetime') value = '2026-09-05T12:00:00.000Z';
    else if (field.type === 'email') value = 'consumer@example.test';
    else if (field.type === 'url') value = 'https://example.test';
    else value = name.endsWith('_id') ? `consumer-${name.replace(/_/g, '-')}` : `Consumer ${name.replace(/_/g, ' ')}`;
    return [key, value];
  }));
}

/** Choose behavior declared by the saved tree, never a control invented by the consumer. */
/** Text the live consumer types into an editor-owned action's first text input. */
export const EDITOR_TYPED_TEXT = 'generated';

/** Operands an AddressEditor emits after the consumer types into its Street input. */
export const TYPED_ADDRESS_RECORD = Object.freeze({ street: EDITOR_TYPED_TEXT, city: '', region: '', postalCode: '' });

export function deriveInteraction(schema: UiSchema, actions: GeneratedArtifactAction[]): ConsumerInteraction {
  const nodes = schemaNodes(schema);
  const tabs = nodes.find((node) => node.component === 'Tabs' && node.props?.disabled !== true
    && ((node.children?.length ?? 0) > 1 || (Array.isArray(node.props?.items) && node.props.items.length > 1)));
  if (tabs) return { kind: 'tabs', nodeId: tabs.id, component: 'Tabs', selector: selectorForNode(tabs.id) };
  if (actions.length > 0) {
    const enabled = (source: GeneratedArtifactAction['sources'][number]) =>
      nodes.some((node) => node.id === source.nodeId && node.props?.disabled !== true);
    // Prefer an action the consumer can click: a screen-scoped action owns a
    // generated surface button and a Button activation is a click. A domain
    // binding on an editor's change event fires from input, not from a click.
    const screenRoots = new Set(schema.screens.map((screen) => screen.id));
    const clickable = (source: GeneratedArtifactAction['sources'][number]) =>
      enabled(source) && (screenRoots.has(source.nodeId) || source.event === 'onActivate');
    const action = actions.find((candidate) => candidate.sources.some(clickable))
      ?? actions.find((candidate) => candidate.sources.some(enabled));
    if (!action) throw new Error('No declared domain action has an enabled schema source.');
    const declaration = action.sources.find(clickable) ?? action.sources.find(enabled)!;
    return {
      kind: 'action', nodeId: declaration.nodeId, component: declaration.component,
      selector: `[data-oods-action=${JSON.stringify(action.name)}]`, action: action.name,
    };
  }
  const fields = new Set(['Input', 'SearchInput', 'Textarea', 'Select', 'Checkbox', 'DatePicker']);
  const field = nodes.find((node) => fields.has(node.component) && node.props?.disabled !== true && node.props?.readOnly !== true);
  if (field) return {
    kind: 'field', nodeId: field.id, component: field.component, selector: selectorForNode(field.id),
    inputType: field.component === 'DatePicker' ? 'date' : String(field.props?.type ?? 'text'),
  };
  const interactive = nodes.filter((node) => fields.has(node.component) || ['Tabs', 'Button', 'PaginationBar'].includes(node.component));
  if (interactive.length === 0) return { kind: 'none', reason: 'no interactive element declared', disabledPaginationNodeIds: [] };
  if (interactive.every((node) => node.component === 'PaginationBar'
    && Object.keys(node.props ?? {}).length === 0 && Object.keys(node.bindings ?? {}).length === 0)) {
    return {
      kind: 'none',
      reason: 'no enabled interaction declared; unbound PaginationBar defaults to zero items',
      disabledPaginationNodeIds: interactive.map((node) => node.id),
    };
  }
  throw new Error('The saved schema declares controls without a supported executable interaction; this is not a not-applicable gate.');
}

/** Mirror the public screen-action operands using the saved schema and supplied consumer values. */
export function deriveActionArguments(
  schema: UiSchema, actions: GeneratedArtifactAction[], model: Record<string, unknown>,
): Record<string, unknown[][]> {
  const names = Object.keys(schema.objectSchema ?? {}).sort();
  const stringFields = names.filter((name) => {
    const field = schema.objectSchema![name]!;
    return field.required && !field.enum?.length && ['string', 'datetime', 'email', 'date', 'url', 'uuid'].includes(field.type);
  });
  const rowId = stringFields.find((name) => name === 'id') ?? stringFields.find((name) => name.endsWith('_id'));
  return Object.fromEntries(actions.map((action) => [action.name, [action.parameters.map((parameter) => {
    if (parameter.name === 'rowId') return rowId ? model[camel(rowId)] : 'generated-row';
    if (parameter.name === 'column') return names.includes('status') ? 'status' : names[0] ?? 'column';
    if (parameter.name === 'criteria') return {};
    if (parameter.name === 'page') return 1;
    // Sprint 186 m05: an AddressEditor's change carries the whole record after typing into Street.
    if (parameter.name === 'address') return { ...TYPED_ADDRESS_RECORD };
    if (parameter.type === 'string') return '';
    if (parameter.type === 'number') return 0;
    if (parameter.type === 'boolean') return false;
    if (parameter.type === 'Record<string, unknown>') return {};
    return undefined;
  })]]));
}

/** This function is serialized into the browser; it has no consumer-owned success flag. */
export function inspectFrameworkAttachment(framework: 'react' | 'vue'): {
  attached: boolean; containerProperty: string | null; rootProperty: string | null;
} {
  const container = document.getElementById('app') as (HTMLElement & Record<string, unknown>) | null;
  const root = container?.firstElementChild as (HTMLElement & Record<string, unknown>) | null;
  if (!container || !root) return { attached: false, containerProperty: null, rootProperty: null };
  if (framework === 'react') {
    const containerProperty = Object.keys(container).find((key) => key.startsWith('__reactContainer$')) ?? null;
    const rootProperty = Object.keys(root).find((key) => key.startsWith('__reactFiber$')) ?? null;
    return { attached: !!containerProperty && !!container[containerProperty] && !!rootProperty && !!root[rootProperty], containerProperty, rootProperty };
  }
  const app = container.__vue_app__ as { _container?: unknown } | undefined;
  const rootProperty = Object.hasOwn(root, '__vueParentComponent') ? '__vueParentComponent' : null;
  return { attached: !!app && app._container === container, containerProperty: app ? '__vue_app__' : null, rootProperty };
}

export function summarizeGateAccounting(rows: Array<{ name: string; status: string; reason?: string }>) {
  const provenCount = rows.filter(({ status }) => status === 'passed').length;
  const notApplicable = rows.filter(({ status }) => status === 'not-applicable')
    .map(({ name, reason }) => ({ name, reason: reason ?? 'No reason recorded.' }));
  const namedUnproven = rows.filter(({ status }) => status !== 'passed' && status !== 'not-applicable')
    .map(({ name, status, reason }) => ({ name, status, reason: reason ?? 'No reason recorded.' }));
  return {
    totalGateCount: rows.length, applicableGateCount: rows.length - notApplicable.length,
    provenCount, notApplicableCount: notApplicable.length, notApplicable,
    namedUnprovenCount: namedUnproven.length, namedUnproven,
    balanced: provenCount + notApplicable.length + namedUnproven.length === rows.length,
  };
}
