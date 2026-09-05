import type { SharedScenario } from './types.js';

/** Behavioral scenarios for the separate, non-nucleus port tranche. */
export const portedScenarios: readonly SharedScenario[] = [
  {
    id: 'audit-timeline-transitions', oodsComponentId: 'AuditTimeline',
    props: { events: [{ label: 'Subscription created', timestamp: '2026-09-05T12:00:00Z' }] },
    slots: {}, initialState: { eventCount: 1 },
    event: { name: 'render', trigger: 'mount', expected: 'one ordered audit event is visible' },
    assertions: ['timeline is named', 'event timestamp remains machine readable'],
  },
  {
    id: 'cancellation-summary-boolean', oodsComponentId: 'CancellationSummary',
    props: { cancelAtPeriodEnd: true, requestedAt: '2026-09-05T12:00:00Z', reason: 'Customer request' },
    slots: {}, initialState: { cancelAtPeriodEnd: true },
    event: { name: 'render', trigger: 'mount', expected: 'scheduled cancellation label is visible' },
    assertions: ['boolean state is not rendered as literal true', 'terms name their values'],
  },
  {
    id: 'pagination-bar-navigation', oodsComponentId: 'PaginationBar',
    props: { page: 2, pageSize: 25, totalItems: 80, showItemRange: true },
    slots: {}, initialState: { page: 2 },
    event: { name: 'pageChange', trigger: 'activate next page', expected: 'page 3 emitted once' },
    assertions: ['navigation is named', 'current page is exposed'],
  },
  {
    id: 'price-badge-currency', oodsComponentId: 'PriceBadge',
    props: { amountCents: 2500, currency: 'usd' }, slots: {},
    initialState: { amountCents: 2500, currency: 'usd' },
    event: { name: 'render', trigger: 'mount', expected: 'USD 25 is visible as a price badge' },
    assertions: ['price variant is stable', 'currency is not used as the variant'],
  },
  {
    id: 'relative-timestamp-fixed', oodsComponentId: 'RelativeTimestamp',
    props: { datetime: '2026-09-05T12:00:00Z', relative: '2 hours ago' }, slots: {},
    initialState: { now: '2026-09-05T14:00:00Z' },
    event: { name: 'render', trigger: 'mount', expected: 'relative label and absolute datetime are both present' },
    assertions: ['time element is semantic', 'datetime is machine readable'],
  },
  {
    id: 'search-input-clear', oodsComponentId: 'SearchInput',
    props: { value: 'past due', placeholder: 'Search subscriptions', clearable: true }, slots: {},
    initialState: { value: 'past due' },
    event: { name: 'clear', trigger: 'activate clear control', expected: 'empty value emitted once' },
    assertions: ['input has search semantics', 'clear control is named'],
  },
  {
    id: 'status-badge-mapped', oodsComponentId: 'StatusBadge',
    props: { status: 'past_due', tone: 'lifecycle', emphasis: 'subtle' }, slots: {},
    initialState: { status: 'past_due' },
    event: { name: 'render', trigger: 'mount', expected: 'human-readable lifecycle status is visible' },
    assertions: ['status text is visible', 'tone is not the only status signal'],
  },
  {
    id: 'status-timeline-history', oodsComponentId: 'StatusTimeline',
    props: { status: 'active', allowedTransitions: ['past_due', 'cancelled'] }, slots: {},
    initialState: { status: 'active' },
    event: { name: 'render', trigger: 'mount', expected: 'current status and allowed transitions are visible' },
    assertions: ['timeline is named', 'status order is preserved'],
  },
];
