import { componentContracts, type NucleusComponentId } from '@oods/component-contracts';

import type { FieldSchemaEntry, UiElement, UiSchema } from '../schemas/generated.js';
import {
  analyzeBindings,
  ownFieldSchemaEntry,
  resolveChildContent,
  resolveFieldProps,
  resolveFrameworkChildContent,
} from './binding-utils.js';
import { normalizeSchemaForFramework } from './framework-normalization.js';
import type { CodegenFramework, CodegenIssue, CodegenValidationCheck } from './types.js';

const GENERIC_PROPS = new Set(['field', 'id']);
const CROSS_TARGET_PROP_EXTENSIONS: Readonly<
  Partial<Record<NucleusComponentId, ReadonlySet<string>>>
> = {
  Checkbox: new Set(['name']),
  DatePicker: new Set(['name']),
  Input: new Set(['name']),
  Select: new Set(['name']),
  Textarea: new Set(['name']),
};

const REQUIRED_PROPS: Readonly<Partial<Record<NucleusComponentId, readonly string[]>>> = {
  // Vue supplies an empty runtime default, but React's public TabsProps requires
  // items. The shared generation contract must compile against both packages.
  Tabs: ['items'],
};

type PropValueContract = {
  expected: string;
  accepts: (value: unknown) => boolean;
};

function valueContract(
  expected: string,
  accepts: (value: unknown) => boolean,
): PropValueContract {
  return { expected, accepts };
}

function enumContract(values: readonly string[]): PropValueContract {
  const allowed = new Set(values);
  return valueContract(
    values.map((value) => JSON.stringify(value)).join(' or '),
    (value) => typeof value === 'string' && allowed.has(value),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(record).every((key) => allowed.has(key));
}

const STRING_VALUE = valueContract('a string', (value) => typeof value === 'string');
const BOOLEAN_VALUE = valueContract('a boolean', (value) => typeof value === 'boolean');
const NUMBER_VALUE = valueContract(
  'a finite number',
  (value) => typeof value === 'number' && Number.isFinite(value),
);
const STRING_OR_NUMBER_VALUE = valueContract(
  'a string or finite number',
  (value) => typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)),
);
const ATTRIBUTE_VALUE = valueContract(
  'a string, finite number, or boolean',
  (value) => (
    typeof value === 'string'
    || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
  ),
);
const BOOLEANISH_VALUE = valueContract(
  'a boolean or the string "true" or "false"',
  (value) => value === true || value === false || value === 'true' || value === 'false',
);
const ARIA_CHECKED_VALUE = valueContract(
  'a boolean, "true", "false", or "mixed"',
  (value) => (
    value === true || value === false || value === 'true' || value === 'false' || value === 'mixed'
  ),
);
const ARIA_CURRENT_VALUE = valueContract(
  'a boolean, "true", "false", "page", "step", "location", "date", or "time"',
  (value) => (
    value === true
    || value === false
    || ['true', 'false', 'page', 'step', 'location', 'date', 'time'].includes(String(value))
  ),
);
const ARIA_HASPOPUP_VALUE = valueContract(
  'a boolean, "true", "false", "menu", "listbox", "tree", "grid", or "dialog"',
  (value) => (
    value === true
    || value === false
    || ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'].includes(String(value))
  ),
);
const ARIA_INVALID_VALUE = valueContract(
  'a boolean, "true", "false", "grammar", or "spelling"',
  (value) => (
    value === true
    || value === false
    || ['true', 'false', 'grammar', 'spelling'].includes(String(value))
  ),
);

/**
 * React's public nucleus props extend the corresponding DOM attribute types.
 * Keep this list explicit so an arbitrary JSON value cannot pass the build
 * gate and then fail the generated target's semantic TypeScript compile.
 */
const ARIA_VALUE_CONTRACTS: Readonly<Record<string, PropValueContract>> = {
  'aria-activedescendant': STRING_VALUE,
  'aria-atomic': BOOLEANISH_VALUE,
  'aria-autocomplete': enumContract(['none', 'inline', 'list', 'both']),
  'aria-braillelabel': STRING_VALUE,
  'aria-brailleroledescription': STRING_VALUE,
  'aria-busy': BOOLEANISH_VALUE,
  'aria-checked': ARIA_CHECKED_VALUE,
  'aria-colcount': NUMBER_VALUE,
  'aria-colindex': NUMBER_VALUE,
  'aria-colindextext': STRING_VALUE,
  'aria-colspan': NUMBER_VALUE,
  'aria-controls': STRING_VALUE,
  'aria-current': ARIA_CURRENT_VALUE,
  'aria-describedby': STRING_VALUE,
  'aria-description': STRING_VALUE,
  'aria-details': STRING_VALUE,
  'aria-disabled': BOOLEANISH_VALUE,
  'aria-dropeffect': enumContract(['none', 'copy', 'execute', 'link', 'move', 'popup']),
  'aria-errormessage': STRING_VALUE,
  'aria-expanded': BOOLEANISH_VALUE,
  'aria-flowto': STRING_VALUE,
  'aria-grabbed': BOOLEANISH_VALUE,
  'aria-haspopup': ARIA_HASPOPUP_VALUE,
  'aria-hidden': BOOLEANISH_VALUE,
  'aria-invalid': ARIA_INVALID_VALUE,
  'aria-keyshortcuts': STRING_VALUE,
  'aria-label': STRING_VALUE,
  'aria-labelledby': STRING_VALUE,
  'aria-level': NUMBER_VALUE,
  'aria-live': enumContract(['off', 'assertive', 'polite']),
  'aria-modal': BOOLEANISH_VALUE,
  'aria-multiline': BOOLEANISH_VALUE,
  'aria-multiselectable': BOOLEANISH_VALUE,
  'aria-orientation': enumContract(['horizontal', 'vertical']),
  'aria-owns': STRING_VALUE,
  'aria-placeholder': STRING_VALUE,
  'aria-posinset': NUMBER_VALUE,
  'aria-pressed': ARIA_CHECKED_VALUE,
  'aria-readonly': BOOLEANISH_VALUE,
  'aria-relevant': enumContract([
    'additions',
    'additions removals',
    'additions text',
    'all',
    'removals',
    'removals additions',
    'removals text',
    'text',
    'text additions',
    'text removals',
  ]),
  'aria-required': BOOLEANISH_VALUE,
  'aria-roledescription': STRING_VALUE,
  'aria-rowcount': NUMBER_VALUE,
  'aria-rowindex': NUMBER_VALUE,
  'aria-rowindextext': STRING_VALUE,
  'aria-rowspan': NUMBER_VALUE,
  'aria-selected': BOOLEANISH_VALUE,
  'aria-setsize': NUMBER_VALUE,
  'aria-sort': enumContract(['none', 'ascending', 'descending', 'other']),
  'aria-valuemax': NUMBER_VALUE,
  'aria-valuemin': NUMBER_VALUE,
  'aria-valuenow': NUMBER_VALUE,
  'aria-valuetext': STRING_VALUE,
};
const TONE_VALUE = enumContract([
  'neutral', 'info', 'accent', 'positive', 'success', 'warning', 'critical', 'danger',
]);
const EMPHASIS_VALUE = enumContract(['subtle', 'solid']);
const SIZE_VALUE = enumContract(['sm', 'md', 'lg']);
const VALIDATION_VALUE = valueContract(
  'an object with state "error", "warning", or "success" and a string message',
  (value) => {
    if (!isRecord(value) || !hasOnlyKeys(value, ['state', 'message'])) return false;
    return (
      (value.state === 'error' || value.state === 'warning' || value.state === 'success')
      && typeof value.message === 'string'
    );
  },
);
const SELECT_OPTIONS_VALUE = valueContract(
  'an array of { value: string, label: string, disabled?: boolean } objects',
  (value) => Array.isArray(value) && value.every((option) => (
    isRecord(option)
    && hasOnlyKeys(option, ['value', 'label', 'disabled'])
    && typeof option.value === 'string'
    && typeof option.label === 'string'
    && (option.disabled === undefined || typeof option.disabled === 'boolean')
  )),
);
const TABLE_COLUMNS_VALUE = valueContract(
  'an array of { key: string, label: string } objects',
  (value) => Array.isArray(value) && value.every((column) => (
    isRecord(column)
    && hasOnlyKeys(column, ['key', 'label'])
    && typeof column.key === 'string'
    && typeof column.label === 'string'
  )),
);
const TABLE_ROWS_VALUE = valueContract(
  'an array of objects with string ids',
  (value) => Array.isArray(value) && value.every((row) => (
    isRecord(row) && typeof row.id === 'string'
  )),
);
const TAB_ITEMS_VALUE = valueContract(
  'an array of { id: string, label: string|number, panel: string|number, disabled?: boolean } objects',
  (value) => Array.isArray(value) && value.every((item) => (
    isRecord(item)
    && hasOnlyKeys(item, ['id', 'label', 'panel', 'disabled', 'isDisabled'])
    && typeof item.id === 'string'
    && (typeof item.label === 'string' || typeof item.label === 'number')
    && (typeof item.panel === 'string' || typeof item.panel === 'number')
    && (item.disabled === undefined || typeof item.disabled === 'boolean')
    && (item.isDisabled === undefined || typeof item.isDisabled === 'boolean')
  )),
);

const PROP_VALUE_CONTRACTS: Readonly<
  Record<NucleusComponentId, Readonly<Record<string, PropValueContract>>>
> = {
  Badge: {
    content: STRING_OR_NUMBER_VALUE,
    status: STRING_VALUE,
    domain: STRING_VALUE,
    tone: TONE_VALUE,
    emphasis: EMPHASIS_VALUE,
    icon: STRING_OR_NUMBER_VALUE,
  },
  Banner: {
    title: STRING_VALUE,
    detail: STRING_VALUE,
    content: STRING_OR_NUMBER_VALUE,
    status: STRING_VALUE,
    domain: STRING_VALUE,
    tone: TONE_VALUE,
    emphasis: EMPHASIS_VALUE,
    dismissLabel: STRING_VALUE,
  },
  Button: {
    content: STRING_OR_NUMBER_VALUE,
    intent: enumContract(['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']),
    size: SIZE_VALUE,
    disabled: BOOLEAN_VALUE,
    type: enumContract(['button', 'submit', 'reset']),
  },
  Card: {
    elevated: BOOLEAN_VALUE,
    as: enumContract(['div', 'section', 'article', 'aside']),
  },
  Checkbox: {
    id: STRING_VALUE,
    label: STRING_VALUE,
    checked: BOOLEAN_VALUE,
    defaultChecked: BOOLEAN_VALUE,
    required: BOOLEAN_VALUE,
    disabled: BOOLEAN_VALUE,
    help: STRING_VALUE,
    validation: VALIDATION_VALUE,
  },
  DatePicker: {
    id: STRING_VALUE,
    label: STRING_VALUE,
    value: STRING_VALUE,
    defaultValue: STRING_VALUE,
    min: STRING_VALUE,
    max: STRING_VALUE,
    step: STRING_OR_NUMBER_VALUE,
    required: BOOLEAN_VALUE,
    disabled: BOOLEAN_VALUE,
    readOnly: BOOLEAN_VALUE,
    help: STRING_VALUE,
    validation: VALIDATION_VALUE,
  },
  Grid: {
    columns: valueContract(
      'a finite number or "auto-fit"',
      (value) => value === 'auto-fit' || (typeof value === 'number' && Number.isFinite(value)),
    ),
    minColumnWidth: STRING_VALUE,
    gap: STRING_VALUE,
    align: STRING_VALUE,
    justify: STRING_VALUE,
  },
  Input: {
    id: STRING_VALUE,
    label: STRING_VALUE,
    type: STRING_VALUE,
    value: STRING_VALUE,
    defaultValue: STRING_VALUE,
    placeholder: STRING_VALUE,
    required: BOOLEAN_VALUE,
    disabled: BOOLEAN_VALUE,
    readOnly: BOOLEAN_VALUE,
    help: STRING_VALUE,
    validation: VALIDATION_VALUE,
  },
  Select: {
    id: STRING_VALUE,
    label: STRING_VALUE,
    value: STRING_VALUE,
    defaultValue: STRING_VALUE,
    required: BOOLEAN_VALUE,
    disabled: BOOLEAN_VALUE,
    options: SELECT_OPTIONS_VALUE,
    help: STRING_VALUE,
    validation: VALIDATION_VALUE,
  },
  Stack: {
    direction: enumContract(['row', 'column']),
    gap: STRING_VALUE,
    align: STRING_VALUE,
    justify: STRING_VALUE,
    wrap: BOOLEAN_VALUE,
  },
  Table: {
    caption: STRING_VALUE,
    columns: TABLE_COLUMNS_VALUE,
    rows: TABLE_ROWS_VALUE,
    density: enumContract(['compact']),
    selectable: BOOLEAN_VALUE,
  },
  Tabs: {
    items: TAB_ITEMS_VALUE,
    selectedId: STRING_VALUE,
    defaultSelectedId: STRING_VALUE,
    size: SIZE_VALUE,
    overflowLabel: STRING_VALUE,
    ariaLabel: STRING_VALUE,
  },
  Text: {
    content: STRING_OR_NUMBER_VALUE,
    as: enumContract([
      'span', 'p', 'strong', 'em', 'small', 'div', 'label',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ]),
    size: SIZE_VALUE,
    weight: enumContract(['regular', 'medium', 'semibold']),
  },
  Textarea: {
    id: STRING_VALUE,
    label: STRING_VALUE,
    value: STRING_VALUE,
    defaultValue: STRING_VALUE,
    rows: NUMBER_VALUE,
    placeholder: STRING_VALUE,
    required: BOOLEAN_VALUE,
    disabled: BOOLEAN_VALUE,
    readOnly: BOOLEAN_VALUE,
    help: STRING_VALUE,
    validation: VALIDATION_VALUE,
  },
};

function propValueContract(
  component: NucleusComponentId,
  prop: string,
): PropValueContract | undefined {
  const canonical = PROP_VALUE_CONTRACTS[component][prop];
  if (canonical) return canonical;
  if (component === 'Tabs' && prop === 'aria-label') return STRING_VALUE;
  if (GENERIC_PROPS.has(prop)) return STRING_VALUE;
  if (CROSS_TARGET_PROP_EXTENSIONS[component]?.has(prop)) return STRING_VALUE;
  if (prop.startsWith('data-')) return ATTRIBUTE_VALUE;
  if (prop.startsWith('aria-')) return ARIA_VALUE_CONTRACTS[prop];
  return undefined;
}

function isKnownAriaProp(prop: string): boolean {
  return ARIA_VALUE_CONTRACTS[prop] !== undefined;
}

function valueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number' && !Number.isFinite(value)) return 'non-finite number';
  return typeof value;
}
const CONTRACT_CHECK_ORDER: readonly CodegenValidationCheck[] = [
  'props-contract',
  'slots-contract',
  'events-contract',
];

function nodesInDocumentOrder(screens: readonly UiElement[]): UiElement[] {
  const nodes: UiElement[] = [];
  const stack = [...screens].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    nodes.push(node);
    if (node.children) stack.push(...node.children.slice().reverse());
  }
  return nodes;
}

function contractFor(component: string) {
  return componentContracts[component as NucleusComponentId];
}

function semanticEventName(bindingEvent: string): string {
  if (!bindingEvent.startsWith('on') || bindingEvent.length <= 2) return bindingEvent;
  return `${bindingEvent[2]!.toLowerCase()}${bindingEvent.slice(3)}`;
}

function issue(message: string, node?: UiElement): CodegenIssue {
  return {
    code: 'OODS-V007',
    message,
    ...(node ? { nodeId: node.id, component: node.component } : {}),
  };
}

type FieldValueKind = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'unknown';

function fieldValueKind(entry: FieldSchemaEntry): FieldValueKind {
  if (entry.enum?.length) return 'string';
  if (['string', 'datetime', 'email', 'date', 'url', 'uuid'].includes(entry.type)) {
    return 'string';
  }
  if (entry.type === 'integer' || entry.type === 'number') return 'number';
  if (entry.type === 'boolean') return 'boolean';
  if (entry.type === 'object') return 'object';
  if (entry.type === 'array') return 'array';
  return 'unknown';
}

function acceptedFieldKinds(
  framework: CodegenFramework,
  propName: string | undefined,
  isChildren: boolean,
  localStateType: string | undefined,
): readonly FieldValueKind[] {
  // HTML materializes a visible, named placeholder rather than passing the
  // runtime datum through a typed component prop. Existence/representation is
  // still mandatory, but the placeholder itself is always a string.
  if (framework === 'html') return ['string', 'number', 'boolean', 'object', 'array', 'unknown'];
  if (localStateType === 'boolean') return ['boolean'];
  if (localStateType === 'string') return ['string', 'number', 'boolean'];
  if (propName === 'checked') return ['boolean'];
  if (propName === 'value') return framework === 'vue' ? ['string'] : ['string', 'number'];
  if (propName === 'content') return ['string', 'number'];
  if (propName === 'status') return ['string'];
  if (isChildren) return ['string', 'number'];
  return [];
}

function fieldContractIssues(
  node: UiElement,
  schema: UiSchema,
  framework: CodegenFramework,
  localStateType: string | undefined,
): CodegenIssue[] {
  const fieldName = node.props?.field;
  if (typeof fieldName !== 'string') return [];
  const fieldEntry = ownFieldSchemaEntry(schema.objectSchema, fieldName);
  if (!fieldEntry) {
    return [issue(
      `Field ${JSON.stringify(fieldName)} referenced by ${node.component} does not exist in objectSchema.`,
      node,
    )];
  }

  const resolution = framework === 'html'
    ? resolveChildContent(node, schema.objectSchema)
    : resolveFrameworkChildContent(node, schema.objectSchema);
  if (!resolution) {
    return [issue(
      `Field ${JSON.stringify(fieldName)} cannot be represented by ${node.component} on the `
      + `${framework} target; generation would discard the binding.`,
      node,
    )];
  }

  const actualKind = fieldValueKind(fieldEntry);
  const acceptedKinds = acceptedFieldKinds(
    framework,
    resolution.propName,
    resolution.isChildren,
    localStateType,
  );
  if (!acceptedKinds.includes(actualKind)) {
    const targetSurface = resolution.isChildren
      ? `${node.component} children`
      : `${node.component}.${resolution.propName}`;
    return [issue(
      `Field ${JSON.stringify(fieldName)} has ${actualKind} data, which cannot bind to `
      + `${targetSurface} on the ${framework} target; accepted field kinds: `
      + `${acceptedKinds.join(', ') || 'none'}.`,
      node,
    )];
  }
  return [];
}

/** Validate canonical nucleus props, default-slot use, and supported event mappings. */
export function preflightTargetContracts(
  schema: UiSchema,
  framework: CodegenFramework,
): {
  checks: CodegenValidationCheck[];
  issues: CodegenIssue[];
  bindingSafetyIssues: CodegenIssue[];
} {
  const normalized = normalizeSchemaForFramework(schema, framework);
  const nodes = nodesInDocumentOrder(normalized.screens);
  const bindingAnalysis = analyzeBindings(normalized.screens);
  const hasNucleusComponent = nodes.some((node) => contractFor(node.component) !== undefined);
  const issues: CodegenIssue[] = [];

  for (const node of nodes) {
    const contract = contractFor(node.component);
    if (!contract) continue;
    const localStateType = bindingAnalysis.occurrences.find((occurrence) => (
      occurrence.kind === 'local' && occurrence.nodeId === node.id
    ))?.signature?.parameters[0]?.type;
    issues.push(...fieldContractIssues(node, normalized, framework, localStateType));
    const enrichedProps = resolveFieldProps(node, schema.objectSchema);
    const props: Record<string, unknown> = {
      ...(node.props ?? {}),
      ...(enrichedProps ?? {}),
    };
    // Button/Badge field values are emitted through canonical content; their
    // legacy label enrichment is intentionally suppressed by both emitters.
    if (
      (node.component === 'Button' || node.component === 'Badge')
      && node.props?.label === undefined
    ) {
      delete props.label;
    }
    const allowedProps = new Set(contract.props);
    const component = node.component as NucleusComponentId;
    const targetExtensions = CROSS_TARGET_PROP_EXTENSIONS[component];
    for (const requiredProp of REQUIRED_PROPS[component] ?? []) {
      if (props[requiredProp] === undefined) {
        issues.push(issue(
          `Required prop ${JSON.stringify(requiredProp)} is missing from the canonical `
          + `${node.component} contract.`,
          node,
        ));
      }
    }
    for (const prop of Object.keys(props).sort()) {
      const isDefaultSlotContent = prop === 'children' && contract.slots.includes('default');
      if (
        !allowedProps.has(prop)
        && !GENERIC_PROPS.has(prop)
        && !targetExtensions?.has(prop)
        && !prop.startsWith('data-')
        && !(prop.startsWith('aria-') && isKnownAriaProp(prop))
        && !isDefaultSlotContent
      ) {
        issues.push(issue(
          `Prop ${JSON.stringify(prop)} is not in the canonical ${node.component} contract.`,
          node,
        ));
        continue;
      }

      const value = props[prop];
      const valueRule = propValueContract(component, prop);
      if (value !== undefined && valueRule && !valueRule.accepts(value)) {
        issues.push(issue(
          `Prop ${JSON.stringify(prop)} on ${node.component} must be ${valueRule.expected}; `
          + `received ${valueType(value)}.`,
          node,
        ));
      }
    }

    if (node.children?.length && !contract.slots.includes('default')) {
      issues.push(issue(
        `Component ${node.component} has children but its canonical contract has no default slot.`,
        node,
      ));
    }
  }

  const bindingSafetyIssues = bindingAnalysis.issues.map((bindingIssue): CodegenIssue => ({
    code: 'OODS-V007',
    message: bindingIssue.message,
    ...(bindingIssue.nodeId ? { nodeId: bindingIssue.nodeId } : {}),
    ...(bindingIssue.component ? { component: bindingIssue.component } : {}),
  }));

  for (const occurrence of bindingAnalysis.occurrences) {
    if (framework === 'html') {
      issues.push({
        code: 'OODS-V007',
        message:
          `HTML target cannot preserve binding ${occurrence.component}.${occurrence.event} `
          + `to ${occurrence.handlerName}; static output would discard executable behavior.`,
        nodeId: occurrence.nodeId,
        component: occurrence.component,
      });
      continue;
    }
    if (occurrence.scope !== 'component') continue;
    const contract = contractFor(occurrence.component);
    if (!contract) continue;
    const eventName = semanticEventName(occurrence.event);
    if (!contract.events.includes(eventName)) {
      issues.push({
        code: 'OODS-V007',
        message:
          `Binding ${occurrence.component}.${occurrence.event} does not map to a canonical `
          + `${occurrence.component} event.`,
        nodeId: occurrence.nodeId,
        component: occurrence.component,
      });
    }
  }

  return {
    checks: CONTRACT_CHECK_ORDER.filter((check) => (
      check === 'events-contract' || hasNucleusComponent
    )),
    issues,
    bindingSafetyIssues,
  };
}
