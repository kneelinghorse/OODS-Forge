<template>
  <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <SearchInput id="slot-search-1" data-oods-component="SearchInput" />
            <Select id="slot-filters-2" data-oods-component="Select" label="Whether the subscription will cancel at the natural billing period end." placeholder="Enter cancel at period end" required :modelValue="String(cancelAtPeriodEnd)" />
            <BillingSummaryBadge id="slot-toolbar-actions-3" data-oods-component="BillingSummaryBadge" :amount="amount" :currency="currency" :interval="billingInterval" />
          </Stack>
      <Stack id="list-items-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
            <Stack id="slot-items-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <StatusBadge id="ve-items-10" data-oods-component="StatusBadge" label="Current lifecycle status of the subscription." tone="lifecycle" :status="status" />
                    <RelativeTimestamp id="ve-items-11" data-oods-component="RelativeTimestamp" label="Timestamp for the most recent modification, when available." :datetime="updatedAt ?? createdAt" />
                  </Stack>
          </Stack>
      <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
            <PaginationBar id="slot-pagination-8" data-oods-component="PaginationBar" />
          </Stack>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-list-9">
    <button type="button" data-oods-action="handleFilter" @click="handleFilter({})">Filter</button>
    <button type="button" data-oods-action="handleRowClick" @click="handleRowClick(subscriptionId)">Open row</button>
    <button type="button" data-oods-action="handleSort" @click="handleSort('status')">Sort</button>
  </div>
</template>

<script setup lang="ts">
import { BillingSummaryBadge, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleFilter sha256:16ab1e92d1fca94435e207207864ab7015dc274fc62e2f211a0df55cc291ea36 */
  /* @oods-domain-source sha256:8e5f3caefc9ad5e749948c77de5f5978bb91ef33958f95a5a2be4b419cff400e */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handleRowClick sha256:773eb5947f10b9c469abd54e200f61529df89035100d7d19eaa88adcd565efc0 */
  /* @oods-domain-source sha256:2691a39947329776a84396671cd57ad501e6855e24bc09bfe575a98e1fde4a88 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSort sha256:757d6df84825c12c0f0cf60e76596eb7c5d0f48a6a4d4cf4186ee36063811b44 */
  /* @oods-domain-source sha256:a44f6b01c1934ac2bd84da820758bea74479e3a4ec56f169390a3d3eeaf34649 */
  handleSort: (column: string) => void;
}

interface Props {
  actions: GeneratedUIActions;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Recurring price expressed in minor units (e.g., cents). */
  amount: number;
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
  /** Recurrence cadence (monthly, yearly, quarterly, etc.). */
  billingInterval?: string;
  /** Whether the subscription will cancel at the natural billing period end. */
  cancelAtPeriodEnd: boolean;
  /** Free-form explanation captured during cancellation workflows. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: string;
  /** Timestamp when cancellation was initiated. */
  cancellationRequestedAt?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** ISO 4217 currency code used for billing. */
  currency: string;
  /** End timestamp of the current billing cycle. */
  currentPeriodEnd: string;
  /** Decimal progress (0-1) through the active billing cycle. */
  currentPeriodProgress?: number;
  /** Start timestamp of the current billing cycle. */
  currentPeriodStart: string;
  /** Billing contact email address. */
  customerEmail?: string;
  /** Customer or account name associated with the subscription. */
  customerName?: string;
  /** Flag indicating whether the entity is currently archived (soft-deleted). */
  isArchived: boolean;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp of the most recent successful payment. */
  lastPaymentAt?: string;
  /** Timestamp when the next payment attempt should occur. */
  nextPaymentDueAt?: string;
  /** Payment instrument category used for collection. */
  paymentMethodType?: 'card' | 'ach' | 'wire' | 'invoice' | 'other';
  /** Outcome of the most recent collection attempt. Distinct from subscription
lifecycle status — a subscription can be "active" with payment_status "retrying".
 */
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded';
  /** Internal plan code or price identifier. */
  planCode?: string;
  /** Billing interval descriptor (monthly, yearly, etc.). */
  planInterval?: string;
  /** Human-readable plan label shown in headers. */
  planName: string;
  /** Prorated credit or charge in minor currency units generated by a mid-cycle
plan change. Positive values are charges; negative values are credits.
Only populated when the supportProration parameter is true.
 */
  prorationAmount?: number;
  /** Unix timestamp (epoch SECONDS) at which proration is calculated. Pinned when an
upcoming-invoice PREVIEW is requested and MUST be passed identically on commit so the
committed charge equals the previewed amount. The preview is read-only and does NOT
mutate the subscription. Stored as an integer (not a datetime) so the value round-trips
byte-identically between preview and commit — an ISO string normalization could shift it
and desync the previewed vs charged amount. Only populated when supportProration is true.
Source: docs.stripe.com/billing/subscriptions/prorations.
 */
  prorationDate?: number;
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
  /** Current lifecycle status of the subscription. */
  status: 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated';
  /** Primary identifier used across billing and lifecycle systems. */
  subscriptionId: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, allowedTransitions, amount, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, currency, currentPeriodEnd, currentPeriodProgress, currentPeriodStart, customerEmail, customerName, isArchived, lastEvent, lastEventAt, lastPaymentAt, nextPaymentDueAt, paymentMethodType, paymentStatus, planCode, planInterval, planName, prorationAmount, prorationDate, restorationMetadata, restoredAt, stateHistory, status, subscriptionId, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
