import type { UiElement, UiSchema } from '../schemas/generated.js';

const walk = (nodes: UiElement[]): UiElement[] => nodes.flatMap(node => [node, ...walk(node.children ?? [])]);
const shortName = (name: string) => name.replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase());

/** Standalone lists expose the same public state operand as workflow screens. */
export function populateListStates(schema: UiSchema): void {
  for (const screen of schema.screens) {
    if (!walk([screen]).some(node => node.collection?.source === 'rows') || walk([screen]).some(node => node.state)) continue;
    screen.children = [
      ...(['loading', 'empty', 'error'] as const).map(state => ({
        id: `${screen.id}-${state}`, component: 'Banner', state,
        props: {
          title: state === 'loading' ? 'Loading' : state === 'empty' ? 'No records found' : 'Unable to load records',
          message: state === 'error' ? 'Try again or choose another record.' : state === 'empty' ? 'Change the filters or add a record.' : 'Loading your records.',
        },
      })),
      { id: `${screen.id}-success`, component: 'Stack', state: 'success', layout: screen.layout, children: screen.children },
    ];
  }
}

/** Collection data belongs to the screen; objectSchema still describes one record. */
export function populateCollections(schema: UiSchema, context: string, objectName: string, minorUnits = 100): void {
  if (!schema.objectSchema || !['list', 'timeline'].includes(context)) return;
  const fields = schema.objectSchema;
  const keyField = Object.keys(fields).find(name => name === 'id')
    ?? Object.keys(fields).find(name => name === `${objectName.toLowerCase()}_id`)
    ?? Object.keys(fields).find(name => name.endsWith('_id'))
    ?? Object.keys(fields)[0]!;
  const labelField = ['plan_name', 'name', 'title', 'display_name'].find(name => fields[name]) ?? keyField;
  for (const screen of schema.screens) {
    const nodes = walk([screen]);
    if (context === 'list') {
      const items = nodes.find(node => node.id.startsWith('list-items-'));
      const toolbar = nodes.find(node => node.id.startsWith('list-toolbar-'));
      if (!items || !toolbar) continue;
      const rowContent = (nodes: UiElement[]): UiElement[] => nodes.flatMap(node => node.component === 'Stack' ? rowContent(node.children ?? []) : [node]);
      const toolbarRecipes = rowContent(toolbar.children ?? []).flatMap(node => node.meta?.intent === 'slot:search' ? rowContent(node.children ?? []) : [node]).filter(node => !['SearchInput', 'PaginationBar'].includes(node.component) && node.meta?.intent !== 'slot:filters' && !['Input', 'Select', 'Button'].includes(node.component));
      const sortIndicator = nodes.find(node => node.component === 'SortIndicator');
      const rowNodes = [...rowContent(items.children ?? []), ...toolbarRecipes].filter(node => node !== sortIndicator);
      const overlay = rowNodes.find(node => node.component === 'ArchivedRowOverlay');
      const billing = nodes.find(node => node.component === 'BillingSummaryBadge');
      const content: UiElement[] = [
        { id: `${items.id}-title`, component: 'Text', props: { field: labelField } },
        ...rowNodes.filter(node => node !== overlay),
        ...(billing && !rowNodes.includes(billing) ? [billing] : []),
      ];
      for (const node of content) {
        if (['RelativeTimestamp', 'StatusBadge'].includes(node.component) && node.props) delete node.props.label;
        if (node.component === 'StatusBadge' && typeof node.props?.field === 'string') { node.props.statusField = node.props.field; delete node.props.field; }
      }
      const row: UiElement = { id: `${items.id}-row`, component: 'Button', collectionControl: 'open', props: { field: keyField }, layout: { type: 'inline', gapToken: 'cluster-default' }, children: content };
      if (overlay) { overlay.children = [row]; overlay.props = { ...overlay.props, labelField }; }
      items.collection = { source: 'rows', keyField, labelField };
      items.children = [overlay ?? row, { id: `${items.id}-empty`, component: 'Banner', props: { message: 'No records found.' }, collectionControl: 'empty' }];
      const searchSlot = toolbar.children?.find(node => node.meta?.intent === 'slot:search');
      const search = searchSlot ? walk([searchSlot]).find(node => node.component === 'SearchInput') : undefined;
      const filter = toolbar.children?.find(node => node.meta?.intent === 'slot:filters');
      const filterField = fields.status ? 'status' : Object.keys(fields).find(name => fields[name]!.enum?.length);
      if (search) { search.bindings = undefined; search.collectionControl = 'search'; search.props = { label: 'Search', placeholder: 'Search records', clearable: true }; }
      if (filter && filterField) {
        filter.component = 'Select'; filter.children = undefined; filter.bindings = undefined; filter.collectionControl = 'filter';
        filter.props = { label: shortName(filterField), options: [{ value: '', label: 'All states' }, ...(fields[filterField]!.enum ?? []).map(value => ({ value: String(value), label: String(value).replaceAll('_', ' ') }))] };
      }
      if (sortIndicator) {
        sortIndicator.bindings = { ...sortIndicator.bindings, onChange: 'handleSortChange' };
        if (screen.bindings) delete screen.bindings.onSort;
      }
      toolbar.children = [
        ...(search ? [search] : []), ...(filter && filterField ? [filter] : []), ...(sortIndicator ? [sortIndicator] : []),
        ...(sortIndicator ? [] : [{ id: `${toolbar.id}-sort`, component: 'Select', collectionControl: 'sort' as const, props: { field: labelField, label: 'Sort', options: [{ value: 'asc', label: 'Name A–Z' }, { value: 'desc', label: 'Name Z–A' }] } }]),
      ];
      if (overlay?.props?.separateTab) screen.children!.splice(screen.children!.indexOf(items), 1, {
        id: `${items.id}-archive-tabs`, component: 'Tabs', collectionControl: 'archive',
        children: [items],
        props: { ariaLabel: 'Archive views', items: [{ id: 'active', label: 'Active', panel: '' }, { id: 'archived', label: String(overlay.props.tabLabel ?? 'Archived'), panel: '' }] },
      });
      const paginationSlot = nodes.find(node => node.meta?.intent === 'slot:pagination');
      const pagination = paginationSlot ? walk([paginationSlot]).find(node => node.component === 'PaginationBar') ?? paginationSlot : undefined;
      if (pagination) { pagination.component = 'PaginationBar'; pagination.children = undefined; pagination.bindings = undefined; pagination.collectionControl = 'page'; pagination.props = { showItemRange: true }; }
      screen.bindings = { ...screen.bindings, onPageChange: 'handlePageChange' };
    } else {
      const header = nodes.find(node => node.id.startsWith('timeline-header-'));
      const entries = nodes.find(node => node.id.startsWith('timeline-entries-'));
      if (!header || !entries) continue;
      const payment = nodes.find(node => node.component === 'PaymentEventTimeline');
      const label = nodes.find(node => node.component === 'TimelineEntryLabel');
      const traitEvents = nodes.filter(node => ['ArchiveEvent', 'CancellationEvent', 'StateTransitionEvent'].includes(node.component));
      header.children = [{ id: `${header.id}-title`, component: 'Text', props: { field: labelField } }];
      if (fields.amount && fields.currency) header.children.push({ id: `${header.id}-billing`, component: 'BillingSummaryBadge', props: { amountField: 'amount', currencyField: 'currency', intervalField: 'billing_interval', minorUnits } });
      entries.collection = { source: 'events', keyField: 'id', labelField: 'title', historyField: fields.state_history ? 'state_history' : undefined };
      if (payment) payment.collectionControl = 'payment-event';
      entries.children = [
        { id: `${entries.id}-entry`, component: 'Card', collectionControl: 'event', children: [...(label ? [label] : []), ...(payment ? [payment] : [])] },
        { id: `${entries.id}-empty`, component: 'Banner', props: { message: 'No events yet.' }, collectionControl: 'empty' },
      ];
      // These recipes read the selected object's fields/history, not one generic
      // collection event. Preserve them once outside the repeated collection.
      if (traitEvents.length) screen.children!.push({ id: `${entries.id}-trait-events`, component: 'Stack', children: traitEvents });
    }
  }
}
