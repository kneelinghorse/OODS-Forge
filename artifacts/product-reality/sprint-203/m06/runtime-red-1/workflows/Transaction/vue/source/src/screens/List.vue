<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9-success" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Status" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'pending', 'label': 'Pending'}, {'value': 'authorized', 'label': 'Authorized'}, {'value': 'settled', 'label': 'Settled'}, {'value': 'failed', 'label': 'Failed'}, {'value': 'refunded', 'label': 'Refunded'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('transaction_id')" />
                    </Stack>
              <Tabs id="list-list-items-5-archive-tabs" ariaLabel="Archive views" :selectedId="collectionQuery.archived ? 'archived' : 'active'" :items="[{'id': 'active', 'label': 'Active', 'panel': ''}, {'id': 'archived', 'label': 'Archived', 'panel': ''}]" @change="handleFilter({ ...collectionQuery, archived: $event === 'archived' })"><template #panel="{ selected }"><template v-if="selected"><section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, unitAmountCents, currency, pricingModel, billingInterval, taxBehavior, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, isArchived, archivedAt, restoredAt, archiveReason, archivedBy, archiveMetadata, restorationMetadata, transactionId, userId, organizationId, occurredAt, paymentMethod, channel, paymentReference, riskScore }, collectionIndex) in rows" :key="String(transactionId)"><ArchivedRowOverlay :id="'list-ve-items-13-' + collectionIndex" data-oods-component="ArchivedRowOverlay" separateTab showBadge tabLabel="Archived" :isArchived="isArchived" :label="transactionId">
                      <Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(transactionId)" @click="handleRowClick(String(transactionId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ transactionId }}</Text>
                      <StatusBadge :id="'list-ve-items-10-' + collectionIndex" data-oods-component="StatusBadge" tone="lifecycle" :status="status" />
                      <RelativeTimestamp :id="'list-ve-items-11-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" />
                      <PriceBadge :id="'list-ve-items-12-' + collectionIndex" data-oods-component="PriceBadge" :amount="unitAmountCents" :currency="currency" /></Button>
                    </ArchivedRowOverlay></li></ol></section></template></template></Tabs>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { ArchivedRowOverlay, Banner, Button, PaginationBar, PriceBadge, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ status: 'pending' | 'authorized' | 'settled' | 'failed' | 'refunded'; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt?: string; lastEvent: 'initiated' | 'authorized' | 'settled' | 'refunded' | 'failed'; lastEventAt?: string; unitAmountCents: number; currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'; pricingModel: 'one_time' | 'usage_based'; billingInterval?: 'one_time'; taxBehavior: 'exclusive' | 'inclusive'; cancelAtPeriodEnd: boolean; cancellationReason?: string; cancellationReasonCode?: 'customer_request' | 'suspected_fraud' | 'duplicate_charge' | 'payment_method_error'; cancellationRequestedAt?: string; isArchived: boolean; archivedAt?: string | null; restoredAt?: string | null; archiveReason?: string; archivedBy?: string; archiveMetadata?: Record<string, unknown>; restorationMetadata?: Record<string, unknown>; transactionId: string; userId: string; organizationId?: string; occurredAt: string; paymentMethod: 'card' | 'bank_transfer' | 'digital_wallet' | 'invoice'; channel: 'online' | 'in_app' | 'point_of_sale' | 'partner'; paymentReference?: string; riskScore?: number }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Structured metadata about the archival action for compliance and audit purposes.

Properties:
  - method: "manual" | "automated" | "policy" — how the archive was triggered
  - compliance_tags: string[] — regulatory labels (e.g., ["GDPR", "SOX", "HIPAA"])
  - retention_policy_id: string — reference to the retention policy that triggered archival
  - original_status: string — the Stateful status before archival
  - related_entity_count: number — count of related entities also archived (cascade)
 */
  archiveMetadata?: Record<string, unknown>;
  /** Human-readable narrative describing why the entity was archived. */
  archiveReason?: string;
  /** Timestamp for when the entity entered the archived state. */
  archivedAt?: string | null;
  /** User ID or system identifier of the actor who archived this entity.
Set to "system" for automated/policy-driven archival. Supports audit trail queries
like "show all entities archived by user X" or "show all auto-archived entities".
 */
  archivedBy?: string;
  /** Billing cadence when pricing_model indicates recurring revenue. */
  billingInterval?: 'one_time';
  /** Whether cancellation occurs at the natural period end instead of immediately. When true the entity is in a REVERSIBLE pending-cancellation state: the schedule can be undone (set back to false) any time before period end, returning the entity to active. This is distinct from a terminal cancellation (a `terminated`/canceled subscription), which is irreversible and non-reactivatable. Mirrors Stripe's cancel_at_period_end flag (docs.stripe.com/billing/subscriptions/cancel). */
  cancelAtPeriodEnd: boolean;
  /** Free-form detail describing why cancellation occurred. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: 'customer_request' | 'suspected_fraud' | 'duplicate_charge' | 'payment_method_error';
  /** Timestamp capturing when the cancellation workflow was initiated. */
  cancellationRequestedAt?: string;
  /** Sales channel through which the transaction was initiated. */
  channel: 'online' | 'in_app' | 'point_of_sale' | 'partner';
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO currency code for the unit amount. */
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';
  /** Flag indicating whether the entity is currently archived (soft-deleted). */
  isArchived: boolean;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'initiated' | 'authorized' | 'settled' | 'refunded' | 'failed';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp when the transaction occurred in the source system. */
  occurredAt: string;
  /** Tenant organization responsible for the transaction. */
  organizationId?: string;
  /** Funding source used to complete the transaction. */
  paymentMethod: 'card' | 'bank_transfer' | 'digital_wallet' | 'invoice';
  /** Provider reference code linking to the payment processor. */
  paymentReference?: string;
  /** Monetization model applied to the entity. */
  pricingModel: 'one_time' | 'usage_based';
  /** Metadata about the most recent restoration action.

Properties:
  - restored_by: string — user ID or "system"
  - restored_fields: string[] — when partial restore, which fields were restored
  - restoration_reason: string — why the entity was restored
  - restored_from_snapshot: boolean — whether restored from a point-in-time snapshot
 */
  restorationMetadata?: Record<string, unknown>;
  /** Timestamp for when the entity was most recently restored from an archived state. */
  restoredAt?: string | null;
  /** Fraud assessment score assigned during authorization. */
  riskScore?: number;
  /** Chronological log of state transitions. Each entry records the before/after states,
timestamp, and (when governance is enabled) the actor, reason, and transition metadata.
Rendered by StatusTimeline in the detail and timeline views.

Entry structure:
  - from: string (previous state)
  - to: string (new state)
  - timestamp: ISO 8601 datetime
  - actor_id: string (user/system who triggered the transition, optional)
  - reason: string (human-readable justification, required when requireTransitionReason is true)
  - transition_metadata: Record<string, unknown> (arbitrary context, optional)
 */
  stateHistory?: unknown[];
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: 'pending' | 'authorized' | 'settled' | 'failed' | 'refunded';
  /** Defines whether taxes are included in the displayed price. */
  taxBehavior: 'exclusive' | 'inclusive';
  /** Unique identifier for the transaction record. */
  transactionId: string;
  /** Base unit price expressed in the smallest currency denomination. */
  unitAmountCents: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Identifier of the user associated with the transaction. */
  userId: string;
}

const { actions, uiState, allowedTransitions, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, channel, createdAt, currency, isArchived, lastEvent, lastEventAt, occurredAt, organizationId, paymentMethod, paymentReference, pricingModel, restorationMetadata, restoredAt, riskScore, stateHistory, status, taxBehavior, transactionId, unitAmountCents, updatedAt, userId, rows = [], collectionQuery = {} } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
