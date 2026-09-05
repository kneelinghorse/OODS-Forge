import { COMPONENT_CONTRACT_VERSION } from './contracts.js';
import type { ComponentContract, PortedComponentId } from './types.js';

/**
 * Contracts for the separately governed Sprint 184 port tranche.
 *
 * These are intentionally not merged into `componentContracts`: that map is
 * the frozen 14-component foundation-v1 nucleus.
 */
export const portedComponentContracts: Readonly<
  Record<PortedComponentId, ComponentContract>
> = {
  AuditTimeline: {
    id: 'AuditTimeline', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'title', 'events', 'history', 'entries', 'auditLog', 'auditLogField',
      'createdField', 'updatedField', 'eventField', 'eventTimestampField',
      'eventOptionsParameter', 'maxVisible', 'showFromState', 'showActorId', 'showReason',
    ],
    slots: ['default'], events: [], states: ['populated', 'empty'],
    tokenRoles: ['timeline.background', 'timeline.border', 'timeline.text', 'timeline.marker'],
    accessibility: ['Ordered audit events retain chronological semantics', 'Empty history is named'],
    compatibility: 'Configures the shared timeline primitive with audit semantics.',
  },
  CancellationSummary: {
    id: 'CancellationSummary', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'title', 'label', 'cancelAtPeriodEnd', 'requestedAt', 'reason', 'code',
      'cancelAtPeriodEndField', 'requestedAtField', 'reasonField', 'codeField',
    ],
    slots: ['default'], events: [], states: ['scheduled', 'not-scheduled'],
    tokenRoles: ['summary.background', 'summary.border', 'summary.text', 'summary.label'],
    accessibility: ['Summary terms and values preserve description-list relationships'],
    compatibility: 'Boolean cancellation state renders a declared label, never a raw boolean literal.',
  },
  PaginationBar: {
    id: 'PaginationBar', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'page', 'pageSize', 'totalItems', 'totalPages', 'pageSizeOptions',
      'showPageSizeSelector', 'showGotoPage', 'showItemRange',
      'pageField', 'pageSizeField', 'totalItemsField', 'totalPagesField',
      'pageSizeOptionsParameter', 'showPageSizeSelectorParameter',
      'showGotoPageParameter', 'showItemRangeParameter',
    ],
    slots: [], events: ['pageChange', 'pageSizeChange', 'change', 'update'],
    states: ['first-page', 'middle-page', 'last-page', 'empty'],
    tokenRoles: ['pagination.background', 'pagination.border', 'pagination.text', 'pagination.focus'],
    accessibility: ['Navigation is named', 'Current page is exposed with aria-current'],
    compatibility: 'Uses page/pageSize/totalItems while preserving the legacy page/count headless behavior.',
  },
  PriceBadge: {
    id: 'PriceBadge', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'amountCents', 'unitAmountCents', 'amount', 'unitAmount', 'currency', 'currencyCode',
      'label', 'value', 'emphasis', 'amountField', 'currencyField', 'intervalField',
      'minorUnitsParameter',
    ],
    slots: ['default'], events: [], states: ['priced', 'missing-price'],
    tokenRoles: ['badge.background', 'badge.border', 'badge.text'],
    accessibility: ['Formatted amount and currency remain visible text'],
    compatibility: 'Currency is formatted content; the emitted badge variant remains price.',
  },
  RelativeTimestamp: {
    id: 'RelativeTimestamp', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'datetime', 'timestamp', 'value', 'updatedAt', 'createdAt', 'relative', 'label', 'text',
      'timezone', 'now', 'fallbackField', 'timezoneParameter',
    ],
    slots: ['default'], events: [], states: ['relative', 'absolute', 'empty'],
    tokenRoles: ['text.body', 'text.muted'],
    accessibility: ['Machine-readable datetime accompanies visible relative text'],
    compatibility: 'Falls back from the primary timestamp field without changing document order.',
  },
  SearchInput: {
    id: 'SearchInput', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'id', 'label', 'value', 'defaultValue', 'placeholder', 'clearable', 'debounceMs',
      'debounce', 'minQueryLength', 'disabled', 'placeholderParameter', 'debounceParameter',
      'minQueryLengthParameter', 'clearableParameter',
    ],
    slots: [], events: ['valueChange', 'update', 'search', 'clear'],
    states: ['empty', 'valued', 'disabled'],
    tokenRoles: ['input.background', 'input.border', 'input.text', 'input.placeholder', 'input.focus'],
    accessibility: ['Native search input semantics', 'Clear control has an accessible label'],
    compatibility: 'Debounce and minimum-query settings preserve value updates across both targets.',
  },
  StatusBadge: {
    id: 'StatusBadge', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'status', 'value', 'label', 'content', 'domain', 'tone', 'emphasis', 'showIcon', 'variant',
      'statusField', 'domainField', 'readOnly', 'compact',
    ],
    slots: ['default'], events: [], states: ['subtle', 'solid'],
    tokenRoles: ['badge.background', 'badge.border', 'badge.text', 'badge.icon'],
    accessibility: ['Status label is visible', 'Color is not the sole status signal'],
    compatibility: 'Both targets share the lifecycle status-to-tone table.',
  },
  StatusTimeline: {
    id: 'StatusTimeline', version: COMPONENT_CONTRACT_VERSION,
    props: [
      'title', 'events', 'history', 'entries', 'stateHistory', 'status', 'allowedTransitions',
      'historyField', 'statesParameter', 'showActorId', 'showReason', 'maxVisible',
    ],
    slots: ['default'], events: [], states: ['populated', 'empty'],
    tokenRoles: ['timeline.background', 'timeline.border', 'timeline.text', 'timeline.marker'],
    accessibility: ['Ordered status events retain chronological semantics', 'Current state is named'],
    compatibility: 'Configures the shared timeline primitive with status-transition semantics.',
  },
};
