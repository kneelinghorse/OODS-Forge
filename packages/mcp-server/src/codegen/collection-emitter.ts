import type { FieldSchemaEntry, UiElement } from '../schemas/generated.js';
import { mapFieldType, snakeToCamel } from './binding-utils.js';
import { escapeDoubleQuotedAttribute, javascriptSingleQuotedString } from './emission-safety.js';
import type { CodegenIssue } from './types.js';

const literal = (value: unknown): string => {
  if (typeof value === 'string') return javascriptSingleQuotedString(value);
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).map(([key, entry]) => `${literal(key)}: ${literal(entry)}`).join(', ')}}`;
  return JSON.stringify(value) ?? 'undefined';
};
const walk = (nodes: readonly UiElement[]): UiElement[] => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);
export const collectionSources = (nodes: readonly UiElement[]) => new Set(walk(nodes).flatMap(node => node.collection ? [node.collection.source] : []));

export function preflightCollections(nodes: readonly UiElement[], fields: Record<string, FieldSchemaEntry> | undefined): CodegenIssue[] {
  const issues: CodegenIssue[] = [];
  const components = { search: 'SearchInput', filter: 'Select', sort: 'Select', page: 'PaginationBar', archive: 'Tabs', open: 'Button', event: 'Card', 'payment-event': 'PaymentEventTimeline', empty: 'Banner' };
  for (const node of walk(nodes)) {
    const fail = (message: string) => issues.push({ code: 'OODS-V007', message, nodeId: node.id, component: node.component });
    if (node.collection && (!fields || Object.keys(fields).length === 0)) fail('Object collection screens require an objectSchema.');
    if (node.collection?.source === 'rows') {
      for (const name of [node.collection.keyField, node.collection.labelField]) {
        if (!fields?.[name]) fail(`Collection field ${JSON.stringify(name)} is not declared by the object.`);
      }
    }
    if (node.collectionControl && components[node.collectionControl] !== node.component) {
      fail(`Collection control ${node.collectionControl} requires ${components[node.collectionControl]}, received ${node.component}.`);
    }
  }
  return issues;
}

export function collectionProps(nodes: readonly UiElement[], fields: Record<string, FieldSchemaEntry>): string[] {
  const sources = collectionSources(nodes);
  const row = Object.entries(fields).map(([name, field]) => `${snakeToCamel(name)}${field.required ? '' : '?'}: ${mapFieldType(field)}`).join('; ');
  return [
    ...(sources.has('rows') ? [`rows?: Array<{ ${row} }>;`, 'collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };'] : []),
    ...(sources.has('events') ? ['events?: CollectionEvent[];'] : []),
  ];
}

export function collectionParameters(nodes: readonly UiElement[]): string[] {
  const sources = collectionSources(nodes);
  return [...(sources.has('rows') ? ['rows = []', 'collectionQuery = {}'] : []), ...(sources.has('events') ? ['events = []'] : [])];
}

/** Screen bindings retain provenance but controls, rather than duplicate buttons, invoke them. */
export function wiredCollectionAction(node: UiElement, event: string): boolean {
  const controls = new Set(walk([node]).map(child => child.collectionControl));
  return event === 'onRowClick' && controls.has('open')
    || event === 'onFilter' && (controls.has('search') || controls.has('filter'))
    || event === 'onSort' && controls.has('sort')
    || event === 'onPageChange' && controls.has('page');
}

/** Lower explicit collection semantics while delegating row content to the ordinary emitter. */
export function emitCollectionNode(
  node: UiElement,
  framework: 'react' | 'vue',
  fields: Record<string, FieldSchemaEntry>,
  emit: (node: UiElement) => string,
): string | undefined {
  const react = framework === 'react';
  const attr = (name: string, expression: string) => react ? `${name}={${expression}}` : `:${name}="${escapeDoubleQuotedAttribute(expression)}"`;
  const on = (name: string, expression: string) => react ? `on${name}={${expression}}` : `@${name.replace(/[A-Z]/g, (letter, index) => (index ? '-' : '') + letter.toLowerCase())}="${escapeDoubleQuotedAttribute(expression)}"`;
  const id = `id="${escapeDoubleQuotedAttribute(node.id)}"`;
  const value = (expression: string) => react ? `{${expression}}` : `{{ ${expression} }}`;
  const children = () => (node.children ?? []).map(emit).join('\n');
  if (node.collection) {
    const source = node.collection.source;
    const empty = node.children?.find(child => child.collectionControl === 'empty');
    const content = (node.children ?? []).filter(child => child !== empty).map(emit).join('\n');
    // Repeated controls must not introduce duplicate DOM IDs.
    const indexed = content.replace(/(?<=\s)id="([^"]+)"/g, (_, original: string) => attr('id', `${literal(original + '-')} + collectionIndex`));
    const emptyCode = empty ? emit({ ...empty, collectionControl: undefined }) : '';
    const items = source === 'events' ? 'chronologicalEvents(events)' : 'rows';
    const label = source === 'events' ? 'Lifecycle history' : 'Records';
    const key = source === 'events' ? 'collectionEvent.id' : `String(${snakeToCamel(node.collection.keyField)})`;
    const binding = source === 'events' ? 'collectionEvent' : `{ ${Object.keys(fields).map(snakeToCamel).join(', ')} }`;
    if (react) return `<section ${id} data-oods-collection="${source}">{${source}.length === 0 ? (${emptyCode}) : (<ol aria-label="${label}" className="oods-collection">{${items}.map((${binding}, collectionIndex) => <li key={${key}}>${indexed}</li>)}</ol>)}</section>`;
    return `<section ${id} data-oods-collection="${source}"><template v-if="${source}.length === 0">${emptyCode}</template><ol v-else aria-label="${label}" class="oods-collection"><li v-for="(${escapeDoubleQuotedAttribute(binding)}, collectionIndex) in ${items}" :key="${escapeDoubleQuotedAttribute(key)}">${indexed}</li></ol></section>`;
  }
  switch (node.collectionControl) {
    case 'empty': return emit({ ...node, collectionControl: undefined });
    case 'search': return `<SearchInput ${id} label="Search" placeholder="Search records" ${attr('value', "collectionQuery.search ?? ''")} ${attr('clearable', 'true')} ${on(react ? 'ValueChange' : 'valueChange', react ? `(search) => handleFilter({ ...collectionQuery, search })` : `handleFilter({ ...collectionQuery, search: $event })`)} />`;
    case 'filter': return `<Select ${id} label="${escapeDoubleQuotedAttribute(String(node.props?.label ?? 'Status'))}" ${attr('value', "collectionQuery.status ?? ''")} ${attr('options', literal(node.props?.options ?? []))} ${on('Change', react ? `(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })` : `handleFilter({ ...collectionQuery, status: $event })`)} />`;
    case 'sort': return `<Select ${id} label="Sort" ${attr('value', "collectionQuery.descending ? 'desc' : 'asc'")} ${attr('options', literal(node.props?.options ?? []))} ${on('Change', react ? `() => handleSort(${literal(node.props?.field)})` : `handleSort(${literal(node.props?.field)})`)} />`;
    case 'page': return `<PaginationBar ${id} ${attr('page', 'collectionQuery.page ?? 1')} ${attr('pageSize', 'collectionQuery.pageSize ?? 10')} ${attr('totalItems', 'collectionQuery.total ?? rows.length')} ${on(react ? 'PageChange' : 'pageChange', 'handlePageChange')} />`;
    case 'archive': {
      const items = (node.props?.items ?? []) as Array<{ id: string; label: string }>;
      const panels = react ? '[' + items.map(item => `{ id: ${literal(item.id)}, label: ${literal(item.label)}, panel: (collectionQuery.archived ? 'archived' : 'active') === ${literal(item.id)} ? (<>${children()}</>) : null }`).join(', ') + ']' : literal(items);
      const attrs = `${id} ariaLabel="Archive views" ${attr('selectedId', "collectionQuery.archived ? 'archived' : 'active'")} ${attr('items', panels)} ${on('Change', react ? `(id) => handleFilter({ ...collectionQuery, archived: id === 'archived' })` : `handleFilter({ ...collectionQuery, archived: $event === 'archived' })`)}`;
      return react ? `<Tabs ${attrs} />` : `<Tabs ${attrs}><template #panel="{ selected }"><template v-if="selected">${children()}</template></template></Tabs>`;
    }
    case 'open': {
      const key = `String(${snakeToCamel(String(node.props?.field))})`;
      return `<Button ${id} type="button" ${react ? 'className' : 'class'}="oods-collection-row" ${attr('data-record-id', key)} ${on('Click', react ? `() => handleRowClick(${key})` : `handleRowClick(${key})`)}>${children()}</Button>`;
    }
    case 'event': {
      const payment = node.children?.find(child => child.collectionControl === 'payment-event');
      const label = node.children?.find(child => child.component === 'TimelineEntryLabel');
      const state = `${label ? emit(label) : ''}<strong>${value('collectionEvent.title')}</strong><time ${attr(react ? 'dateTime' : 'datetime', 'collectionEvent.at')}>${value('formatDateTime(collectionEvent.at)')}</time><p>${value('collectionEvent.description')}</p>`;
      const body = payment ? (react ? `{collectionEvent.kind === 'payment' ? (${emit(payment)}) : (<>${state}</>)}` : `<template v-if="collectionEvent.kind === 'payment'">${emit(payment)}</template><template v-else>${state}</template>`) : state;
      return `<Card ${id}>${body}</Card>`;
    }
    case 'payment-event': return `<PaymentEventTimeline ${id} ${attr('event', 'collectionEvent')} />`;
    default: return undefined;
  }
}
