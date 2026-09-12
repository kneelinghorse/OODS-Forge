import { chartNodes } from './chart-declaration.js';
import { emitCollectionNode, collectionProps, collectionParameters, collectionSources, wiredCollectionAction } from './collection-emitter.js';
import { emitWorkflow } from './workflow-emitter.js';
import type { UiElement, UiLayout, UiSchema, UiStyle, FieldSchemaEntry } from '../schemas/generated.js';
import type { CodegenIssue, CodegenOptions, CodegenResult } from './types.js';
import type {
  BindingAnalysis,
  DomainBindingOccurrence,
  LocalBindingOccurrence,
  ResolvedBindingHandler,
} from './binding-utils.js';
import {
  buildTailwindStaticClasses,
  buildTailwindVariantExpression,
  responsiveLayoutClasses,
  type TailwindVariantDefinition,
} from './tailwind-codegen-utils.js';
import {
  mapFieldType,
  snakeToCamel,
  fieldValuePropTarget,
  resolveFrameworkChildContent,
  resolveFrameworkRecipeProps,
  ownFieldSchemaEntry,
  resolveFieldProps,
} from './binding-utils.js';
import { artifactActionsFromBindings, bindingsForNode } from './action-protocol.js';
import {
  generatedActionContractDigest,
  generatedActionSourceDigest,
} from './artifact-envelope.js';
import { runPreEmit } from './pre-emit.js';
import { resolveSpacingLeaf } from '../render/spacing-leaf.js';
import { normalizeSchemaForFramework, takeEmittedId } from './framework-normalization.js';
import {
  escapeBlockComment,
  escapeDoubleQuotedAttribute,
  javascriptSingleQuotedString,
  tokenOverrideVariableName,
} from './emission-safety.js';
import { executeCompositionDirectives } from './composition-directives.js';
import { collectUiStateBranches } from './state-contract.js';

// ---------------------------------------------------------------------------
// Token + layout helpers (mirrors tree-renderer.ts logic in React style format)
// ---------------------------------------------------------------------------

function normalizeToken(token: string): string {
  return token.trim().replace(/[.\s_]+/g, '-');
}

function tokenVar(group: string, token: string): string {
  // #552: the spacing group's canonical reference prefix is --ref-space-* (what
  // packages/tokens emits); 'spacing' was a dead namespace that never resolved.
  // Other groups (radius/shadow/color/typography) keep their --ref-<group>- prefix.
  // sprint-125 m03: a bare t-shirt size (sm/md/lg) resolves to its scale-<size>
  // leaf so var(--ref-space-md) → var(--ref-space-scale-md) actually resolves.
  if (group === 'spacing') {
    return `var(--ref-space-${normalizeToken(resolveSpacingLeaf(token))})`;
  }
  return `var(--ref-${group}-${normalizeToken(token)})`;
}

const ALIGN_MAP: Record<NonNullable<UiLayout['align']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

type StyleObj = Record<string, string>;

function resolveLayoutStyles(layout?: UiLayout): StyleObj {
  if (!layout?.type) return {};
  const s: StyleObj = {};

  switch (layout.type) {
    case 'stack':
      s.display = 'flex';
      s.flexDirection = 'column';
      break;
    case 'inline':
      s.display = 'flex';
      s.flexDirection = 'row';
      break;
    case 'grid':
      s.display = 'grid';
      s.gridTemplateColumns = 'repeat(auto-fit, minmax(0, 1fr))';
      break;
    case 'sidebar':
      s.display = 'grid';
      s.gridTemplateColumns = 'minmax(0, 1fr) minmax(16rem, 24rem)';
      s.alignItems = 'start';
      break;
    case 'section':
      s.display = 'block';
      break;
  }

  if (layout.align) {
    const value = ALIGN_MAP[layout.align];
    if (layout.type === 'stack') {
      s.alignItems = value;
    } else if (layout.type === 'inline') {
      s.justifyContent = value;
    } else {
      s.justifyContent = value;
    }
  }

  if (layout.gapToken) {
    s.gap = tokenVar('spacing', layout.gapToken);
  }

  return s;
}

function resolveStyleTokens(style?: UiStyle): StyleObj {
  if (!style) return {};
  const s: StyleObj = {};
  if (style.spacingToken) s.padding = tokenVar('spacing', style.spacingToken);
  if (style.radiusToken) s.borderRadius = tokenVar('radius', style.radiusToken);
  if (style.shadowToken) s.boxShadow = tokenVar('shadow', style.shadowToken);
  if (style.colorToken) s.color = tokenVar('color', style.colorToken);
  if (style.typographyToken) s.font = tokenVar('typography', style.typographyToken);
  return s;
}

function mergeStyleObjects(layout: StyleObj, tokens: StyleObj): StyleObj {
  return { ...layout, ...tokens };
}

// ---------------------------------------------------------------------------
// JSX string helpers
// ---------------------------------------------------------------------------

function indent(code: string, depth: number): string {
  const pad = '  '.repeat(depth);
  return code
    .split('\n')
    .map((line) => (line.trim() ? `${pad}${line}` : ''))
    .join('\n');
}

function styleObjToJsx(style: StyleObj): string {
  if (Object.keys(style).length === 0) return '';
  const entries = Object.entries(style)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}: ${javascriptSingleQuotedString(value)}`)
    .join(', ');
  return `{ ${entries} }`;
}

function isReservedProp(key: string, omitClassProps = false): boolean {
  if (key === 'children' || key === 'style') return true;
  if (omitClassProps && (key === 'className' || key === 'class')) return true;
  return false;
}

function jsonValueToJsx(value: unknown): string {
  if (value === null) return '{null}';
  if (value === undefined) return '{undefined}';
  if (typeof value === 'string') return `"${escapeDoubleQuotedAttr(value)}"`;
  if (typeof value === 'boolean') return value ? '' : `{${String(value)}}`;
  if (typeof value === 'number') return `{${String(value)}}`;
  return `{${JSON.stringify(value)}}`;
}

function childValueToJsx(value: unknown): string {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function boolAttr(key: string, value: unknown): string {
  if (value === true) return key;
  if (value === false) return `${key}={false}`;
  return `${key}=${jsonValueToJsx(value)}`;
}

function propsToJsxAttrs(props: Record<string, unknown>, omitClassProps = false): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props).sort(([a], [b]) => a.localeCompare(b))) {
    if (isReservedProp(key, omitClassProps) || value === undefined) continue;
    if (typeof value === 'boolean') {
      parts.push(boolAttr(key, value));
    } else {
      parts.push(`${key}=${jsonValueToJsx(value)}`);
    }
  }
  return parts.join(' ');
}

function escapeDoubleQuotedAttr(value: string): string {
  return escapeDoubleQuotedAttribute(value);
}

function buildReactClassAttr(staticClasses: string, variantExpression: string | null): string | null {
  const hasStatic = staticClasses.trim().length > 0;

  if (variantExpression && hasStatic) {
    return `className={[${variantExpression}, ${javascriptSingleQuotedString(staticClasses)}].filter(Boolean).join(' ')}`;
  }
  if (variantExpression) {
    return `className={${variantExpression}}`;
  }
  if (hasStatic) {
    return `className="${escapeDoubleQuotedAttr(staticClasses)}"`;
  }
  return null;
}

function localBindingForNode(
  analysis: BindingAnalysis,
  nodeId: string,
): LocalBindingOccurrence | undefined {
  return bindingsForNode(analysis, nodeId).find(
    (occurrence): occurrence is LocalBindingOccurrence => occurrence.kind === 'local',
  );
}

function reactControlledProp(occurrence: LocalBindingOccurrence): string | null {
  if (occurrence.component === 'Checkbox') return 'checked';
  if (
    occurrence.component === 'DatePicker'
    || occurrence.component === 'Input'
    || occurrence.component === 'SearchInput'
    || occurrence.component === 'Select'
    || occurrence.component === 'Textarea'
    || occurrence.component === 'StatusSelector'
    || occurrence.component === 'TagInput'
    || occurrence.component === 'ColorStatePicker'
  ) return 'value';
  if (occurrence.component === 'Tabs') return 'selectedId';
  return null;
}

/** A field lowered to the node's own form value is carried by its local state; a data prop is not. */
function fieldRepresentedByState(propName: string | undefined, controlledProp: string | null): boolean {
  return controlledProp !== null
    && (propName === undefined || propName === 'value' || propName === 'checked' || propName === controlledProp);
}

function reactBindingAttrs(
  node: UiElement,
  analysis: BindingAnalysis,
): string[] {
  const occurrences = bindingsForNode(analysis, node.id);
  const local = occurrences.find(
    (occurrence): occurrence is LocalBindingOccurrence => occurrence.kind === 'local',
  );
  const attrs: string[] = [];
  const controlledProp = local ? reactControlledProp(local) : null;
  if (local && controlledProp) {
    attrs.push(`${controlledProp}={${local.localSymbols.state}}`);
  }
  // A component-scoped domain binding owns its action selector on the element
  // itself; screen-scoped actions own theirs on the generated action surface.
  const domain = occurrences.find((occurrence) => occurrence.scope !== 'screen' && occurrence.kind === 'domain');
  if (domain) attrs.push(`data-oods-action="${escapeDoubleQuotedAttr(domain.handlerName)}"`);
  for (const occurrence of occurrences) {
    // Screen bindings are semantic consumer requirements, not arbitrary props
    // on the layout component used as the schema root.
    if (occurrence.scope === 'screen') continue;
    attrs.push(`${occurrence.event}={${occurrence.handlerName}}`);
  }
  return attrs;
}

const SCREEN_ACTION_LABELS: Readonly<Record<string, string>> = {
  onCancel: 'Cancel record',
  onViewTimeline: 'View timeline',
  onChange: 'Change',
  onDelete: 'Delete',
  onEdit: 'Edit',
  onFilter: 'Filter',
  onPageChange: 'Change page',
  onRowClick: 'Open row',
  onSort: 'Sort',
  onSubmit: 'Submit',
};

function screenActionArgumentExpressions(
  occurrence: DomainBindingOccurrence,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string[] {
  const fieldNames = Object.keys(objectSchema ?? {}).sort();
  const requiredStringFields = fieldNames.filter((fieldName) => {
    const entry = ownFieldSchemaEntry(objectSchema, fieldName);
    return entry?.required === true && mapFieldType(entry) === 'string';
  });
  const rowIdField = requiredStringFields.find((fieldName) => fieldName === 'id')
    ?? requiredStringFields.find((fieldName) => fieldName.endsWith('_id'));
  const column = fieldNames.includes('status') ? 'status' : fieldNames[0] ?? 'column';

  return occurrence.signature.parameters.map((parameter) => {
    if (parameter.name === 'rowId') {
      return rowIdField ? snakeToCamel(rowIdField) : javascriptSingleQuotedString('generated-row');
    }
    if (parameter.name === 'column') return javascriptSingleQuotedString(column);
    if (parameter.name === 'criteria') return '{}';
    if (parameter.name === 'page') return '1';
    if (parameter.type === 'string') return javascriptSingleQuotedString('');
    if (parameter.type === 'number') return '0';
    if (parameter.type === 'boolean') return 'false';
    if (parameter.type === 'Record<string, unknown>') return '{}';
    return 'undefined';
  });
}

function hasSubmitControl(node: UiElement): boolean {
  return node.component === 'Button' && node.props?.type === 'submit' || Boolean(node.children?.some(hasSubmitControl));
}

function reactScreenActionSurface(
  node: UiElement,
  analysis: BindingAnalysis,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  const occurrences = bindingsForNode(analysis, node.id).filter(
    (occurrence): occurrence is DomainBindingOccurrence => (
      occurrence.kind === 'domain' && occurrence.scope === 'screen' && !wiredCollectionAction(node, occurrence.event)
      && !(occurrence.event === 'onSubmit' && hasSubmitControl(node))
    ),
  );
  if (occurrences.length === 0) return '';

  const buttons = occurrences.map((occurrence) => {
    const args = screenActionArgumentExpressions(occurrence, objectSchema).join(', ');
    const label = occurrence.event === 'onCancel' && !objectSchema?.status?.enum?.includes('cancelled')
      ? 'Cancel subscription' : SCREEN_ACTION_LABELS[occurrence.event] ?? occurrence.event;
    return `<button type="button" data-oods-action="${escapeDoubleQuotedAttr(occurrence.handlerName)}" onClick={() => ${occurrence.handlerName}(${args})}>${childValueToJsx(label)}</button>`;
  });
  return [
    `<div role="group" aria-label="Screen actions" data-oods-screen-actions="${escapeDoubleQuotedAttr(node.id)}">`,
    ...buttons.map((button) => indent(button, 1)),
    '</div>',
  ].join('\n');
}

function wrapReactScreenActionSurface(
  code: string,
  node: UiElement,
  analysis: BindingAnalysis,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  const actionSurface = reactScreenActionSurface(node, analysis, objectSchema);
  if (!actionSurface) return code;
  return [
    '<>',
    indent(code, 1),
    indent(actionSurface, 1),
    '</>',
  ].join('\n');
}

function wrapReactLocalNode(
  code: string,
  occurrence: LocalBindingOccurrence | undefined,
): string {
  if (occurrence?.component !== 'Banner') return code;
  return `{${occurrence.localSymbols.state} && (\n${indent(code, 1)}\n)}`;
}

function wrapReactStateNode(
  code: string,
  state: string | undefined,
  occurrence: LocalBindingOccurrence | undefined,
  keepCollectionControls = false,
): string {
  if (state === undefined) return wrapReactLocalNode(code, occurrence);
  const stateBody = occurrence?.component === 'Banner'
    ? `${occurrence.localSymbols.state} && (\n${indent(code, 1)}\n)`
    : code;
  const condition = `uiState === ${javascriptSingleQuotedString(state)}`;
  return `{${keepCollectionControls ? `(${condition} || uiState === 'empty')` : condition} && (\n${indent(stateBody, 1)}\n)}`;
}

function reactFieldExpression(
  node: UiElement,
  fieldName: string,
  propName: string | undefined,
  isChildren: boolean,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  const sourceField = node.props?.field;
  const entry = typeof sourceField === 'string'
    ? ownFieldSchemaEntry(objectSchema, sourceField)
    : undefined;
  if (node.component === 'Select' && propName === 'value' && entry?.type === 'boolean') {
    return `String(${fieldName})`;
  }
  if (node.component === 'Text' && isChildren && entry?.type === 'boolean') {
    return `${fieldName} == null ? '' : ${fieldName} ? 'Yes' : 'No'`;
  }
  if (
    node.component === 'Text'
    && isChildren
    && (entry?.type === 'array' || entry?.type.endsWith('[]'))
  ) {
    return `Array.isArray(${fieldName}) ? ${fieldName}.join(', ') : ''`;
  }
  return fieldName;
}

// ---------------------------------------------------------------------------
// JSX tree emitter
// ---------------------------------------------------------------------------

function emitNode(
  node: UiElement,
  depth: number,
  warnings: CodegenIssue[],
  options: CodegenOptions,
  tailwindVariants: Map<string, TailwindVariantDefinition>,
  bindingAnalysis: BindingAnalysis,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  const collectionCode = emitCollectionNode(node, 'react', objectSchema ?? {}, child => emitNode(child, depth, warnings, options, tailwindVariants, bindingAnalysis, objectSchema));
  if (collectionCode !== undefined) return collectionCode;
  const tag = node.component;
  const children = Array.isArray(node.children) ? node.children : [];
  const computedStyle = mergeStyleObjects(
    resolveLayoutStyles(node.layout),
    resolveStyleTokens(node.style),
  );
  let propsObject = node.props && typeof node.props === 'object'
    ? { ...(node.props as Record<string, unknown>) }
    : null;
  const tailwindVariant = tailwindVariants.get(tag);
  const localBinding = localBindingForNode(bindingAnalysis, node.id);
  const readonlyField = bindingAnalysis.readonlyFieldSubscriptions.find((subscription) => subscription.nodeId === node.id);
  const controlledProp = localBinding ? reactControlledProp(localBinding) : null;
  const recipeProps = resolveFrameworkRecipeProps(node, objectSchema, options.workflowCollections);
  const finish = (code: string): string => wrapReactStateNode(
    wrapReactScreenActionSurface(code, node, bindingAnalysis, objectSchema),
    node.state,
    localBinding,
    node.state === 'success' && collectionSources([node]).has('rows'),
  );
  if (localBinding?.component === 'Banner' && propsObject?.dismissLabel === undefined) {
    propsObject = { ...(propsObject ?? {}), dismissLabel: 'Dismiss notification' };
  }

  // Enrich props from objectSchema metadata (labels, placeholders, required, options, type)
  const enriched = resolveFieldProps(node, objectSchema);
  if (enriched) {
    if (!propsObject) propsObject = {};
    for (const [key, value] of Object.entries(enriched)) {
      if (key === 'label' && (tag === 'Badge' || tag === 'Button')) continue;
      if (propsObject[key] === undefined) propsObject[key] = value;
    }
  }

  const emittedId = propsObject ? takeEmittedId(node, propsObject) : node.id;
  const staticChild = propsObject?.children;
  if (propsObject) {
    delete propsObject.children;
    // `field` is a UiSchema binding directive, not a public component prop.
    delete propsObject.field;
    for (const sourceProp of recipeProps.consumedProps) delete propsObject[sourceProp];
    if (controlledProp === 'checked') {
      delete propsObject.checked;
      delete propsObject.defaultChecked;
      delete propsObject.modelValue;
    } else if (controlledProp === 'selectedId') {
      delete propsObject.selectedId;
      delete propsObject.defaultSelectedId;
    } else if (controlledProp === 'value') {
      delete propsObject.value;
      delete propsObject.defaultValue;
      delete propsObject.modelValue;
    }
  }

  const richTabItems = tag === 'Tabs'
    && children.length > 0
    && Array.isArray(propsObject?.items)
    && propsObject.items.length === children.length
    ? propsObject.items as Record<string, unknown>[]
    : undefined;
  if (richTabItems && propsObject) delete propsObject.items;

  // Build attributes list
  const attrParts: string[] = [];

  // id is always passed
  attrParts.push(`id="${escapeDoubleQuotedAttr(emittedId)}"`);

  // data-oods-component for runtime identification
  attrParts.push(`data-oods-component="${tag}"`);
  if (node.state !== undefined) {
    attrParts.push(node.state === 'success' && collectionSources([node]).has('rows') ? `data-oods-state={uiState === 'success' ? 'success' : undefined}` : `data-oods-state="${escapeDoubleQuotedAttr(node.state)}"`);
  }

  // layout data attribute
  if (node.layout?.type) {
    attrParts.push(`data-layout="${node.layout.type}"`);
  }

  if (node.chart && typeof propsObject?.svg === 'string') {
    attrParts.push(`svg={svg ?? ${JSON.stringify(propsObject.svg)}}`);
    delete propsObject.svg;
  }
  // Spread user props (except style and children)
  if (propsObject) {
    const propsStr = propsToJsxAttrs(propsObject, options.styling === 'tailwind');
    if (propsStr) attrParts.push(propsStr);
  }

  attrParts.push(...recipeProps.bindings.map(({ targetProp, expression }) => (
    `${targetProp}={${expression}}`
  )));

  attrParts.push(...reactBindingAttrs(node, bindingAnalysis));

  if (options.styling === 'tailwind') {
    const variantExpression = buildTailwindVariantExpression(node, tailwindVariant);
    const baseClasses = buildTailwindStaticClasses(node, computedStyle, {
      includeVariantFallback: !tailwindVariant,
    });
    const responsive = responsiveLayoutClasses(node.layout);
    const staticClasses = responsive ? `${baseClasses} ${responsive}`.trim() : baseClasses;
    const classAttr = buildReactClassAttr(staticClasses, variantExpression);
    if (classAttr) attrParts.push(classAttr);
  } else if (Object.keys(computedStyle).length > 0) {
    // Merged style attribute
    attrParts.push(`style={${styleObjToJsx(computedStyle)}}`);
  }

  if (richTabItems) {
    const itemEntries = richTabItems.map((item, index) => {
      const itemProps = { ...item };
      delete itemProps.panel;
      const panel = emitNode(
        children[index]!,
        0,
        warnings,
        options,
        tailwindVariants,
        bindingAnalysis,
        objectSchema,
      );
      return [
        `{ ...${JSON.stringify(itemProps)}, panel: (`,
        indent(panel, 1),
        ') }',
      ].join('\n');
    });
    attrParts.push([
      'items={[',
      ...itemEntries.map((entry, index) => (
        `${indent(entry, 1)}${index < itemEntries.length - 1 ? ',' : ''}`
      )),
      ']}',
    ].join('\n'));
  }

  const attrs = attrParts.length > 0 ? ` ${attrParts.join(' ')}` : '';

  if (richTabItems) return finish(`<${tag}${attrs} />`);

  // Sidebar layout needs wrapper elements
  if (node.layout?.type === 'sidebar' && children.length > 0) {
    const [mainChild, ...asideChildren] = children;
    const mainJsx = mainChild ? emitNode(mainChild, depth + 2, warnings, options, tailwindVariants, bindingAnalysis, objectSchema) : '';
    const asideJsxParts = asideChildren.map((c) => emitNode(c, depth + 2, warnings, options, tailwindVariants, bindingAnalysis, objectSchema));

    const inner = [
      `<div data-sidebar-main>`,
      mainJsx ? indent(mainJsx, 1) : '',
      `</div>`,
      `<aside data-sidebar-aside>`,
      ...asideJsxParts.map((jsx) => indent(jsx, 1)),
      `</aside>`,
    ]
      .filter(Boolean)
      .join('\n');

    return finish(`<${tag}${attrs}>\n${indent(inner, depth + 1)}\n${'  '.repeat(depth)}</${tag}>`);
  }

  // Section layout wraps in a section element
  if (node.layout?.type === 'section') {
    const innerJsx = children.map((c) => emitNode(c, depth + 2, warnings, options, tailwindVariants, bindingAnalysis, objectSchema)).join('\n');
    let sectionClassOrStyle = '';
    if (options.styling === 'tailwind') {
      const sectionClasses = buildTailwindStaticClasses(node, computedStyle, {
        includeUserClass: false,
        includeInteractiveStates: false,
        includeVariantFallback: false,
      });
      if (sectionClasses) {
        sectionClassOrStyle = ` className="${escapeDoubleQuotedAttr(sectionClasses)}"`;
      }
    } else if (Object.keys(computedStyle).length > 0) {
      sectionClassOrStyle = ` style={${styleObjToJsx(computedStyle)}}`;
    }

    // Section wraps the component output
    const sectionOpen = `<section data-layout="section" data-layout-node-id="${escapeDoubleQuotedAttr(node.id)}"${sectionClassOrStyle}>`;
    const stateAttr = node.state === undefined
      ? ''
      : ` data-oods-state="${escapeDoubleQuotedAttr(node.state)}"`;
    const componentOpen = `<${tag} id="${escapeDoubleQuotedAttr(emittedId)}" data-oods-component="${tag}"${stateAttr}`;
    const sectionFieldContent = children.length === 0
      ? resolveFrameworkChildContent(node, objectSchema)
      : null;
    if (
      sectionFieldContent?.propName
      && propsObject?.[sectionFieldContent.propName] !== undefined
    ) {
      delete propsObject[sectionFieldContent.propName];
    }

    // Props for inner component (without layout style — that's on section)
    const innerAttrParts: string[] = [];
    if (propsObject) {
      const propsStr = propsToJsxAttrs(propsObject, options.styling === 'tailwind');
      if (propsStr) innerAttrParts.push(propsStr);
    }
    innerAttrParts.push(...recipeProps.bindings.map(({ targetProp, expression }) => (
      `${targetProp}={${expression}}`
    )));
    // Event bindings belong on the component, not the section wrapper
    innerAttrParts.push(...reactBindingAttrs(node, bindingAnalysis));
    if (options.styling === 'tailwind') {
      const variantExpression = buildTailwindVariantExpression(node, tailwindVariant);
      const staticClasses = buildTailwindStaticClasses(node, {}, {
        includeVariantFallback: !tailwindVariant,
      });
      const classAttr = buildReactClassAttr(staticClasses, variantExpression);
      if (classAttr) innerAttrParts.push(classAttr);
    }
    if (sectionFieldContent?.propName && !sectionFieldContent.isChildren && !fieldRepresentedByState(sectionFieldContent.propName, controlledProp)) {
      const fieldExpression = reactFieldExpression(
        node,
        sectionFieldContent.fieldName,
        sectionFieldContent.propName,
        sectionFieldContent.isChildren,
        objectSchema,
      );
      innerAttrParts.push(
        `${sectionFieldContent.propName}={${fieldExpression}}`,
      );
    }
    const innerAttrs = innerAttrParts.length > 0 ? ` ${innerAttrParts.join(' ')}` : '';

    if (children.length === 0 && sectionFieldContent?.isChildren) {
      const fieldExpression = readonlyField?.writer.localSymbols.state ?? reactFieldExpression(
        node,
        sectionFieldContent.fieldName,
        sectionFieldContent.propName,
        sectionFieldContent.isChildren,
        objectSchema,
      );
      return finish([
        sectionOpen,
        indent(`${componentOpen}${innerAttrs}>{${fieldExpression}}</${tag}>`, 1),
        `${'  '.repeat(depth)}</section>`,
      ].join('\n'));
    }

    if (children.length === 0 && staticChild !== undefined) {
      return finish([
        sectionOpen,
        indent(`${componentOpen}${innerAttrs}>${childValueToJsx(staticChild)}</${tag}>`, 1),
        `${'  '.repeat(depth)}</section>`,
      ].join('\n'));
    }

    if (children.length === 0) {
      return finish(`${sectionOpen}\n${indent(`${componentOpen}${innerAttrs} />`, 1)}\n${'  '.repeat(depth)}</section>`);
    }

    return finish([
      sectionOpen,
      indent(`${componentOpen}${innerAttrs}>`, 1),
      indent(innerJsx, 0),
      indent(`</${tag}>`, 1),
      `${'  '.repeat(depth)}</section>`,
    ].join('\n'));
  }

  // Self-closing if no children — but inject field content if bound
  if (children.length === 0) {
    const fieldContent = resolveFrameworkChildContent(node, objectSchema);
    if (fieldContent) {
      if (fieldContent.isChildren) {
        const fieldExpression = readonlyField?.writer.localSymbols.state ?? reactFieldExpression(
          node,
          fieldContent.fieldName,
          fieldContent.propName,
          fieldContent.isChildren,
          objectSchema,
        );
        return finish(`<${tag}${attrs}>{${fieldExpression}}</${tag}>`);
      }
      if (fieldRepresentedByState(fieldContent.propName, controlledProp)) {
        return finish(`<${tag}${attrs} />`);
      }
      // Prop-based injection: rebuild attrs without the conflicting static prop
      // to avoid emitting both label="static" and label={dynamic}
      let cleanAttrs = attrs;
      if (fieldContent.propName && propsObject?.[fieldContent.propName] !== undefined) {
        delete propsObject[fieldContent.propName];
        const rebuiltAttrParts: string[] = [];
        rebuiltAttrParts.push(`id="${escapeDoubleQuotedAttr(emittedId)}"`);
        rebuiltAttrParts.push(`data-oods-component="${tag}"`);
        if (node.state !== undefined) {
          rebuiltAttrParts.push(`data-oods-state="${escapeDoubleQuotedAttr(node.state)}"`);
        }
        if (node.layout?.type) rebuiltAttrParts.push(`data-layout="${node.layout.type}"`);
        if (propsObject) {
          const propsStr = propsToJsxAttrs(propsObject, options.styling === 'tailwind');
          if (propsStr) rebuiltAttrParts.push(propsStr);
        }
        rebuiltAttrParts.push(...recipeProps.bindings.map(({ targetProp, expression }) => (
          `${targetProp}={${expression}}`
        )));
        rebuiltAttrParts.push(...reactBindingAttrs(node, bindingAnalysis));
        if (options.styling === 'tailwind') {
          const variantExpression = buildTailwindVariantExpression(node, tailwindVariant);
          const baseClasses = buildTailwindStaticClasses(node, computedStyle, { includeVariantFallback: !tailwindVariant });
          const responsive = responsiveLayoutClasses(node.layout);
          const staticClasses = responsive ? `${baseClasses} ${responsive}`.trim() : baseClasses;
          const classAttr = buildReactClassAttr(staticClasses, variantExpression);
          if (classAttr) rebuiltAttrParts.push(classAttr);
        } else if (Object.keys(computedStyle).length > 0) {
          rebuiltAttrParts.push(`style={${styleObjToJsx(computedStyle)}}`);
        }
        cleanAttrs = rebuiltAttrParts.length > 0 ? ` ${rebuiltAttrParts.join(' ')}` : '';
      }
      const fieldExpression = reactFieldExpression(
        node,
        fieldContent.fieldName,
        fieldContent.propName,
        fieldContent.isChildren,
        objectSchema,
      );
      const propAttr = `${fieldContent.propName}={${fieldExpression}}`;
      return finish(`<${tag}${cleanAttrs} ${propAttr} />`);
    }
    if (staticChild !== undefined) {
      return finish(`<${tag}${attrs}>${childValueToJsx(staticChild)}</${tag}>`);
    }
    return finish(`<${tag}${attrs} />`);
  }

  const childrenJsx = children.map((c) => emitNode(c, depth + 1, warnings, options, tailwindVariants, bindingAnalysis, objectSchema)).join('\n');
  return finish(`<${tag}${attrs}>\n${indent(childrenJsx, depth + 1)}\n${'  '.repeat(depth)}</${tag}>`);
}

// ---------------------------------------------------------------------------
// TypeScript prop type generation
// ---------------------------------------------------------------------------

function generatePropTypes(components: Set<string>): string {
  const types = Array.from(components)
    .sort()
    .map((name) => `type ${name}Props = React.ComponentPropsWithoutRef<typeof ${name}>;`)
    .join('\n');
  return types;
}

// ---------------------------------------------------------------------------
// Object schema → TypeScript type mapping (delegates to binding-utils)
// ---------------------------------------------------------------------------

/**
 * Generate a typed PageProps interface from the UiSchema's objectSchema.
 * Required fields are non-optional; optional fields use `?`.
 */
function generatePagePropsInterface(
  objectSchema: Record<string, FieldSchemaEntry>,
  includeActions = false,
  includeState = false,
  collectionFields: string[] = [],
): string {
  const lines: string[] = ['export interface PageProps {', ...collectionFields.map(field => '  ' + field)];

  if (includeActions) lines.push('  actions: GeneratedUIActions;');
  if (includeState) lines.push('  uiState: GeneratedUIState;');

  for (const [fieldName, entry] of Object.entries(objectSchema).sort(([a], [b]) => a.localeCompare(b))) {
    const tsType = mapFieldType(entry);
    const optional = entry.required ? '' : '?';
    const camelName = snakeToCamel(fieldName);

    if (entry.description) {
      lines.push(`  /** ${escapeBlockComment(entry.description)} */`);
    }
    lines.push(`  ${camelName}${optional}: ${tsType};`);
  }

  lines.push('}');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Typed local behavior + consumer domain-action protocol
// ---------------------------------------------------------------------------

function nodesById(screens: readonly UiElement[]): Map<string, UiElement> {
  const nodes = new Map<string, UiElement>();
  const stack = [...screens].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    nodes.set(node.id, node);
    if (node.children) stack.push(...node.children.slice().reverse());
  }
  return nodes;
}

function semanticParameters(
  handler: ResolvedBindingHandler,
  typescript: boolean,
): string {
  return handler.signature.parameters
    .map((parameter) => (
      typescript ? `${parameter.name}: ${parameter.type}` : parameter.name
    ))
    .join(', ');
}

function generateReactActionTypes(
  analysis: BindingAnalysis,
  typescript: boolean,
  hasObjectSchema: boolean,
  hasStateBranches: boolean,
): string {
  const domainHandlers = analysis.handlers.filter((handler) => handler.kind === 'domain');
  if (domainHandlers.length === 0) return '';
  const actionsByName = new Map(
    artifactActionsFromBindings(analysis).map((action) => [action.name, action]),
  );
  const markerLines = (handler: ResolvedBindingHandler): string[] => {
    const action = actionsByName.get(handler.handlerName)!;
    return [
      `/* @oods-domain-action ${action.name} ${generatedActionContractDigest(action)} */`,
      ...action.sources.map((source) => (
        `/* @oods-domain-source ${generatedActionSourceDigest(action.name, source)} */`
      )),
    ];
  };
  if (typescript) {
    const lines = ['export interface GeneratedUIActions {'];
    for (const handler of domainHandlers) {
      lines.push(...markerLines(handler).map((line) => `  ${line}`));
      lines.push(`  ${handler.handlerName}: (${semanticParameters(handler, true)}) => void;`);
    }
    lines.push('}');
    if (!hasObjectSchema) {
      lines.push('', 'export interface GeneratedUIProps {', '  actions: GeneratedUIActions;');
      if (hasStateBranches) lines.push('  uiState: GeneratedUIState;');
      lines.push('}');
    }
    return lines.join('\n');
  }

  const properties = domainHandlers
    .map((handler) => `${handler.handlerName}: (${semanticParameters(handler, true)}) => void`)
    .join(', ');
  return [
    ...domainHandlers.flatMap(markerLines),
    `/** @typedef {{ ${properties} }} GeneratedUIActions */`,
    hasStateBranches
      ? '/** @typedef {{ actions: GeneratedUIActions, uiState: GeneratedUIState }} GeneratedUIProps */'
      : '/** @typedef {{ actions: GeneratedUIActions }} GeneratedUIProps */',
  ].join('\n');
}

function generateReactStateTypes(
  states: readonly string[],
  typescript: boolean,
  hasObjectSchema: boolean,
  hasDomainActions: boolean,
): string {
  if (states.length === 0) return '';
  const union = states.map(javascriptSingleQuotedString).join(' | ');
  const alias = typescript
    ? `export type GeneratedUIState = ${union};`
    : `/** @typedef {${union}} GeneratedUIState */`;
  const actionTypesOwnProps = hasDomainActions && (!typescript || !hasObjectSchema);
  const needsProps = (!hasObjectSchema && !hasDomainActions)
    || (!typescript && !actionTypesOwnProps);
  if (!needsProps) return alias;
  return typescript
    ? `${alias}\n\nexport interface GeneratedUIProps {\n  uiState: GeneratedUIState;\n}`
    : `${alias}\n/** @typedef {{ uiState: GeneratedUIState }} GeneratedUIProps */`;
}

function explicitInitialValue(
  node: UiElement,
  occurrence: LocalBindingOccurrence,
): unknown {
  const props = (node.props ?? {}) as Record<string, unknown>;
  if (occurrence.component === 'Checkbox') {
    return props.modelValue ?? props.checked ?? props.defaultChecked;
  }
  if (occurrence.component === 'Tabs') {
    const explicit = props.selectedId ?? props.defaultSelectedId;
    if (explicit !== undefined) return explicit;
    const items = Array.isArray(props.items) ? props.items : [];
    const first = items.find((item) => (
      typeof item === 'object'
      && item !== null
      && (item as Record<string, unknown>).disabled !== true
      && (item as Record<string, unknown>).isDisabled !== true
      && typeof (item as Record<string, unknown>).id === 'string'
    ));
    return first ? (first as Record<string, unknown>).id : undefined;
  }
  return props.modelValue ?? props.value ?? props.defaultValue;
}

function reactLocalInitialExpression(
  node: UiElement,
  occurrence: LocalBindingOccurrence,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  if (occurrence.component === 'Banner') return 'true';

  const explicit = explicitInitialValue(node, occurrence);
  if (explicit !== undefined) {
    if (occurrence.signature.parameters[0]?.type === 'boolean') {
      return explicit === true ? 'true' : 'false';
    }
    return javascriptSingleQuotedString(String(explicit));
  }

  const field = node.props?.field;
  // A field lowered to a data prop (TagInput's tags) is not the control's own text.
  if (typeof field === 'string' && ownFieldSchemaEntry(objectSchema, field) && fieldValuePropTarget(occurrence.component) === undefined) {
    const fallback = occurrence.signature.parameters[0]?.type === 'boolean' ? 'false' : "''";
    const source = snakeToCamel(field);
    return occurrence.signature.parameters[0]?.type === 'boolean'
      ? `${source} ?? ${fallback}`
      : `String(${source} ?? ${fallback})`;
  }
  return occurrence.signature.parameters[0]?.type === 'boolean' ? 'false' : "''";
}

function reactElementType(component: string): string {
  if (component === 'Select' || component === 'StatusSelector') return 'HTMLSelectElement';
  if (component === 'Textarea') return 'HTMLTextAreaElement';
  return 'HTMLInputElement';
}

function generateReactLocalHandler(
  handler: ResolvedBindingHandler,
  node: UiElement,
  options: CodegenOptions,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string[] {
  const occurrence = handler.occurrences[0] as LocalBindingOccurrence;
  const symbols = occurrence.localSymbols;
  const type = occurrence.component === 'Banner'
    ? 'boolean'
    : occurrence.signature.parameters[0]?.type ?? 'unknown';
  const initial = reactLocalInitialExpression(node, occurrence, objectSchema);
  const stateType = options.typescript ? `<${type}>` : '';
  const lines = [
    `  const [${symbols.state}, ${symbols.setter}] = React.useState${stateType}(${initial});`,
  ];

  let params = '()';
  let nextValue = 'false';
  let jsDocParameter: string | null = null;
  if (occurrence.component !== 'Banner') {
    const parameter = occurrence.signature.parameters[0]!;
    const receivesNativeEvent = occurrence.component !== 'Tabs'
      && occurrence.component !== 'ColorStatePicker'
      && (occurrence.event === 'onChange' || occurrence.event === 'onInput');
    if (receivesNativeEvent) {
      // A shared field may be edited by distinct native controls (for example
      // StatusSelector and Input). Type every event source, not only the first.
      const eventType = [...new Set(handler.occurrences.map((source) => {
        const reactEvent = source.event === 'onInput' ? 'React.FormEvent' : 'React.ChangeEvent';
        return `${reactEvent}<${reactElementType(source.component)}>`;
      }))].join(' | ');
      params = options.typescript ? `(event: ${eventType})` : '(event)';
      jsDocParameter = `  /** @param {${eventType}} event */`;
      nextValue = parameter.type === 'boolean'
        ? 'event.currentTarget.checked'
        : 'event.currentTarget.value';
    } else {
      params = options.typescript
        ? `(${parameter.name}: ${parameter.type})`
        : `(${parameter.name})`;
      jsDocParameter = `  /** @param {${parameter.type}} ${parameter.name} */`;
      nextValue = parameter.name;
    }
  }
  if (!options.typescript && jsDocParameter) lines.push(jsDocParameter);
  lines.push(
    `  /* @oods-local-binding ${handler.handlerName} */ const ${handler.handlerName} = ${params} => { ${symbols.setter}(${nextValue}); };`,
  );
  return lines;
}

function generateReactBindingProtocol(
  analysis: BindingAnalysis,
  screens: readonly UiElement[],
  options: CodegenOptions,
  objectSchema?: Record<string, FieldSchemaEntry>,
): string {
  const lines: string[] = [];
  const nodes = nodesById(screens);
  for (const handler of analysis.handlers) {
    if (handler.kind === 'local') {
      const node = nodes.get(handler.occurrences[0]!.nodeId);
      if (!node) continue;
      lines.push(...generateReactLocalHandler(handler, node, options, objectSchema));
      continue;
    }

    const params = semanticParameters(handler, options.typescript);
    const args = handler.signature.parameters.map((parameter) => parameter.name).join(', ');
    if (!options.typescript && handler.signature.parameters.length > 0) {
      lines.push(...handler.signature.parameters.map(
        (parameter) => `  /** @param {${parameter.type}} ${parameter.name} */`,
      ));
    }
    lines.push(
      `  /* @oods-domain-binding ${handler.handlerName} */ const ${handler.handlerName} = (${params}) => { actions.${handler.handlerName}(${args}); };`,
    );
  }
  return lines.join('\n');
}

function generateReactActionGuards(analysis: BindingAnalysis): string {
  return analysis.handlers
    .filter((handler) => handler.kind === 'domain')
    .map((handler) => (
      `  if (!actions || !Object.prototype.hasOwnProperty.call(actions, ${javascriptSingleQuotedString(handler.handlerName)}) `
      + `|| typeof actions.${handler.handlerName} !== 'function') { `
      + `throw new Error(${javascriptSingleQuotedString(`GeneratedUI requires actions.${handler.handlerName}.`)}); }`
    ))
    .join('\n');
}

// ---------------------------------------------------------------------------
// Top-level code assembly
// ---------------------------------------------------------------------------

function buildImportBlock(components: Set<string>, includeCva: boolean): string {
  const nucleus = Array.from(components).sort();
  const lines: string[] = [`import React from 'react';`];
  if (nucleus.length > 0) {
    lines.push(`import { ${nucleus.join(', ')} } from '@oods/components-react';`);
  }
  if (nucleus.length > 0) lines.push(`import '@oods/component-styles/css';`);
  if (includeCva) {
    lines.push(`import { cva } from 'class-variance-authority';`);
  }
  return lines.join('\n');
}

function buildImportList(components: Set<string>, includeCva: boolean): string[] {
  return [
    'react',
    ...(components.size > 0 ? ['@oods/components-react', '@oods/component-styles/css'] : []),
    ...(includeCva ? ['class-variance-authority'] : []),
  ];
}

/**
 * React/TSX emitter — generates importable React component code from a UiSchema.
 */
export function emit(schema: UiSchema, options: CodegenOptions): CodegenResult {
  if (schema.workflow) return emitWorkflow(schema, options, 'react', emit);
  const warnings: CodegenIssue[] = [];
  const expandedSchema = executeCompositionDirectives(schema);
  const normalizedSchema = normalizeSchemaForFramework(expandedSchema, 'react');
  const ctx = runPreEmit(normalizedSchema, { options });
  const components = ctx.components;
  const tailwindVariants = ctx.tailwindVariants;
  const bindingAnalysis = ctx.bindingAnalysis;

  // Generate JSX for each screen
  const screenJsx = ctx.tree
    .map((screen) => emitNode(
      screen,
      2,
      warnings,
      options,
      tailwindVariants,
      bindingAnalysis,
      ctx.objectSchema,
    ))
    .join('\n');

  // Build the complete file
  const importBlock = buildImportBlock(components, tailwindVariants.size > 0);
  const imports = buildImportList(components, tailwindVariants.size > 0);
  if (collectionSources(ctx.tree).has('events')) imports.push('@oods/component-contracts');

  const typeAnnotations = options.typescript ? generatePropTypes(components) : '';
  const hasObjectSchema = normalizedSchema.objectSchema && Object.keys(normalizedSchema.objectSchema).length > 0;
  const hasDomainActions = bindingAnalysis.handlers.some((handler) => handler.kind === 'domain');
  const stateNames = Array.from(new Set(
    collectUiStateBranches(ctx.tree).map(({ state }) => state),
  ));
  const hasStateBranches = stateNames.length > 0;
  const stateTypes = generateReactStateTypes(
    stateNames,
    options.typescript,
    Boolean(hasObjectSchema),
    hasDomainActions,
  );
  const actionTypes = generateReactActionTypes(
    bindingAnalysis,
    options.typescript,
    Boolean(hasObjectSchema),
    hasStateBranches,
  );
  const pagePropsInterface = options.typescript && hasObjectSchema
    ? generatePagePropsInterface(
      normalizedSchema.objectSchema!,
      hasDomainActions,
      hasStateBranches,
      [...collectionProps(ctx.tree, ctx.objectSchema ?? {}), ...(chartNodes(ctx.tree).length ? ['svg?: string;'] : [])],
    )
    : '';
  const returnType = options.typescript
    ? (hasObjectSchema
        ? ': React.FC<PageProps>'
        : hasDomainActions || hasStateBranches
          ? ': React.FC<GeneratedUIProps>'
          : ': React.FC')
    : '';

  const lines: string[] = [
    importBlock,
    ...(collectionSources(ctx.tree).has('events') ? [`import { chronologicalEvents, formatDateTime${options.typescript ? ', type CollectionEvent' : ''} } from '@oods/component-contracts';`] : []),
    '',
  ];

  // Emit token overrides as CSS variable declarations comment
  if (normalizedSchema.tokenOverrides && Object.keys(normalizedSchema.tokenOverrides).length > 0) {
    lines.push('/**');
    lines.push(' * Object-level token overrides (apply via CSS custom properties):');
    for (const [key, value] of Object.entries(normalizedSchema.tokenOverrides).sort(([a], [b]) => a.localeCompare(b))) {
      const varName = tokenOverrideVariableName(key);
      lines.push(` *   ${varName}: ${escapeBlockComment(value)};`);
    }
    lines.push(' */');
    lines.push('');
  }

  if (stateTypes) {
    lines.push(stateTypes, '');
  }

  if (actionTypes) {
    lines.push(actionTypes, '');
  }

  // Emit PageProps interface when objectSchema is present
  if (pagePropsInterface) {
    lines.push(pagePropsInterface, '');
  }

  if (typeAnnotations) {
    lines.push(typeAnnotations, '');
  }

  const bindingProtocol = generateReactBindingProtocol(
    bindingAnalysis,
    ctx.tree,
    options,
    ctx.objectSchema,
  );
  const actionGuards = generateReactActionGuards(bindingAnalysis);

  // Prop defaults from objectSchema field values (collected in the shared pre-emit pass)
  const propDefaults = hasObjectSchema ? ctx.propDefaults : null;

  // Destructure object schema fields from props for type-safe JSX references
  if (hasObjectSchema || hasDomainActions || hasStateBranches) {
    const fieldNames = Object.keys(normalizedSchema.objectSchema ?? {})
      .map(snakeToCamel)
      .sort();
    const parameterNames = [
      ...(hasDomainActions ? ['actions'] : []),
      ...(hasStateBranches ? ['uiState'] : []),
      ...fieldNames,
      ...collectionParameters(ctx.tree),
      ...(chartNodes(ctx.tree).length ? ['svg'] : []),
    ];
    const destructure = `{ ${parameterNames.join(', ')} }`;
    if (!options.typescript && (hasDomainActions || hasStateBranches)) {
      lines.push('/** @param {GeneratedUIProps & Record<string, any>} props */');
      lines.push(`export const GeneratedUI = (props) => {`);
      lines.push(`  const ${destructure} = props;`);
    } else {
      lines.push(`export const GeneratedUI${returnType} = (${destructure}) => {`);
    }
  } else {
    lines.push(`export const GeneratedUI${returnType} = () => {`);
  }

  if (actionGuards) {
    lines.push(actionGuards, '');
  }

  if (bindingProtocol) {
    lines.push(bindingProtocol);
    lines.push('');
  }

  // Emit prop default declarations — but skip any names already destructured
  // from the component params to avoid illegal const redeclarations
  if (propDefaults && propDefaults.size > 0) {
    const destructuredNames = hasObjectSchema
      ? new Set(Object.keys(normalizedSchema.objectSchema!).map(snakeToCamel))
      : new Set<string>();
    let emittedAny = false;
    for (const [propName, { formatted, isExpression }] of propDefaults) {
      if (destructuredNames.has(propName)) continue;
      const rhs = isExpression ? formatted : JSON.stringify(formatted);
      lines.push(`  const ${propName} = ${rhs};`);
      emittedAny = true;
    }
    if (emittedAny) lines.push('');
  }

  if (tailwindVariants.size > 0) {
    const sortedDefinitions = Array.from(tailwindVariants.values())
      .sort((a, b) => a.variableName.localeCompare(b.variableName));
    for (const { definition } of sortedDefinitions) {
      lines.push(indent(definition, 1));
    }
    lines.push('');
  }

  lines.push(
    `  return (`,
    `    <>`,
    indent(screenJsx, 3),
    `    </>`,
    `  );`,
    `};`,
    '',
  );

  const code = lines.join('\n');

  return {
    status: 'ok',
    framework: 'react',
    code,
    fileExtension: options.typescript ? '.tsx' : '.jsx',
    imports,
    warnings,
    actions: artifactActionsFromBindings(bindingAnalysis),
  };
}
