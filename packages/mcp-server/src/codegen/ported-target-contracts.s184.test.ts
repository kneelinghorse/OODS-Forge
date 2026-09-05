import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PORTED_COMPONENT_IDS } from '@oods/component-contracts';

import type { UiSchema } from '../schemas/generated.js';
import { preflightTargetContracts } from './target-contracts.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(TEST_DIRECTORY, '../../../..');

const VALID_PROPS: Readonly<Record<(typeof PORTED_COMPONENT_IDS)[number], Record<string, unknown>>> = {
  AuditTimeline: {
    title: 'Audit history',
    events: [{ label: 'Created' }],
    history: [],
    entries: [],
    auditLog: [],
    auditLogField: 'audit_log',
    createdField: 'created_at',
    updatedField: 'updated_at',
    eventField: 'last_event',
    eventTimestampField: 'last_event_at',
    eventOptionsParameter: 'recordedEvents',
    maxVisible: 7,
    showFromState: true,
    showActorId: true,
    showReason: true,
  },
  CancellationSummary: {
    title: 'Cancellation',
    label: 'Cancellation summary',
    cancelAtPeriodEnd: true,
    requestedAt: '2026-09-05T12:00:00Z',
    reason: 'Customer request',
    code: 'customer_request',
    cancelAtPeriodEndField: 'cancel_at_period_end',
    requestedAtField: 'cancellation_requested_at',
    reasonField: 'cancellation_reason',
    codeField: 'cancellation_reason_code',
  },
  PaginationBar: {
    page: 2,
    pageSize: 25,
    totalItems: 80,
    totalPages: 4,
    pageSizeOptions: [10, 25, 50],
    showPageSizeSelector: true,
    showGotoPage: true,
    showItemRange: true,
    pageField: 'page',
    pageSizeField: 'pageSize',
    totalItemsField: 'totalItems',
    totalPagesField: 'totalPages',
    pageSizeOptionsParameter: 'pageSizeOptions',
    showPageSizeSelectorParameter: 'showPageSizeSelector',
    showGotoPageParameter: 'showGotoPage',
    showItemRangeParameter: 'showItemRange',
  },
  PriceBadge: {
    amountCents: 2500,
    unitAmountCents: 2500,
    amount: 25,
    unitAmount: 25,
    currency: 'usd',
    currencyCode: 'USD',
    label: 'USD 25',
    value: 25,
    emphasis: 'subtle',
    amountField: 'amount',
    currencyField: 'currency',
    intervalField: 'billing_interval',
    minorUnitsParameter: 'minorUnits',
  },
  RelativeTimestamp: {
    datetime: '2026-09-05T12:00:00Z',
    timestamp: '2026-09-05T12:00:00Z',
    value: '2026-09-05T12:00:00Z',
    updatedAt: '2026-09-05T12:00:00Z',
    createdAt: '2026-09-04T12:00:00Z',
    relative: '2 hours ago',
    label: 'Updated 2 hours ago',
    text: '2 hours ago',
    timezone: 'UTC',
    now: 1788616800000,
    fallbackField: 'created_at',
    timezoneParameter: 'timezone',
  },
  SearchInput: {
    id: 'subscription-search',
    label: 'Search subscriptions',
    value: 'past due',
    defaultValue: '',
    placeholder: 'Search subscriptions',
    clearable: true,
    debounceMs: 200,
    debounce: 200,
    minQueryLength: 2,
    disabled: false,
    placeholderParameter: 'placeholder',
    debounceParameter: 'debounceMs',
    minQueryLengthParameter: 'minQueryLength',
    clearableParameter: 'clearable',
  },
  StatusBadge: {
    status: 'past_due',
    value: 'past_due',
    label: 'Past due',
    content: 'Past due',
    domain: 'subscription',
    tone: 'lifecycle',
    emphasis: 'subtle',
    showIcon: true,
    variant: 'subtle',
    statusField: 'status',
    domainField: 'domain',
    readOnly: true,
    compact: true,
  },
  StatusTimeline: {
    title: 'Status history',
    events: [{ label: 'Activated' }],
    history: [],
    entries: [],
    stateHistory: [],
    status: 'active',
    allowedTransitions: ['past_due', 'cancelled'],
    historyField: 'state_history',
    statesParameter: 'states',
    showActorId: true,
    showReason: true,
    maxVisible: 7,
  },
};

const INVALID_TYPED_PROP: Readonly<
  Record<(typeof PORTED_COMPONENT_IDS)[number], Record<string, unknown>>
> = {
  AuditTimeline: { maxVisible: 'seven' },
  CancellationSummary: { cancelAtPeriodEnd: 'true' },
  PaginationBar: { page: 'two' },
  PriceBadge: { amountCents: '2500' },
  RelativeTimestamp: { timezone: false },
  SearchInput: { clearable: 'true' },
  StatusBadge: { showIcon: 'true' },
  StatusTimeline: { allowedTransitions: [false] },
};

function schema(component: string, props: Record<string, unknown>): UiSchema {
  return {
    version: '2026.09',
    screens: [{ id: `ported-${component}`, component, props }],
  };
}

function savedSchema(name: 'subscription-list-dark' | 'subscription-detail-dark'): UiSchema {
  const file = path.join(
    REPOSITORY_ROOT,
    'artifacts/product-reality/sprint-183/m04/saved-schema-store',
    `${name}.json`,
  );
  const saved = JSON.parse(readFileSync(file, 'utf8')) as { schema: UiSchema };
  return saved.schema;
}

describe('Sprint 184 ported target contracts', () => {
  it.each(['react', 'vue'] as const)(
    'accepts every declared prop on all eight %s contracts',
    (framework) => {
      for (const component of PORTED_COMPONENT_IDS) {
        expect(
          preflightTargetContracts(schema(component, VALID_PROPS[component]), framework).issues,
          component,
        ).toEqual([]);
      }
    },
  );

  it.each(['react', 'vue'] as const)(
    'bites an invalid typed prop independently on all eight %s contracts',
    (framework) => {
      for (const component of PORTED_COMPONENT_IDS) {
        const result = preflightTargetContracts(
          schema(component, INVALID_TYPED_PROP[component]),
          framework,
        );
        expect(result.checks).toEqual(['props-contract', 'slots-contract', 'events-contract']);
        expect(result.issues, component).toHaveLength(1);
        expect(result.issues[0]).toMatchObject({
          code: 'OODS-V007',
          nodeId: `ported-${component}`,
          component,
        });
      }
    },
  );

  it.each(['react', 'vue'] as const)(
    'keeps the %s tier-three census empty for both immutable Subscription schemas',
    (framework) => {
      for (const name of ['subscription-list-dark', 'subscription-detail-dark'] as const) {
        expect(
          preflightTargetContracts(savedSchema(name), framework).issues,
          `${name}/${framework}`,
        ).toEqual([]);
      }
    },
  );
});
