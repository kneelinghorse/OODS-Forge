<template>
  <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <SearchInput id="slot-search-1" data-oods-component="SearchInput" />
            <Input id="slot-filters-2" data-oods-component="Input" label="Recurring price expressed in minor units (e.g., cents)." placeholder="Enter amount" required type="number" :modelValue="handleChange_amountState" @update:modelValue="setHandleChange_amountState" @change="handleChange_amount" />
            <Button id="slot-toolbar-actions-3" data-oods-component="Button" />
          </Stack>
      <Stack id="list-items-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
            <Table id="slot-items-6" data-oods-component="Table" />
          </Stack>
      <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
            <PaginationBar id="slot-pagination-8" data-oods-component="PaginationBar" />
          </Stack>
    </Stack>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, PaginationBar, SearchInput, Stack, Table } from '@oods/components-vue';
import '@oods/component-styles/css';

interface Props {
  allowedTransitions?: string[];
  amount?: number;
  archiveMetadata?: Record<string, unknown>;
  archiveReason?: string;
  archivedAt?: string | null;
  archivedBy?: string;
  billingInterval?: string;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
  cancellationReasonCode?: string;
  cancellationRequestedAt?: string;
  createdAt?: string;
  currency?: string;
  currentPeriodEnd?: string;
  currentPeriodProgress?: number;
  currentPeriodStart?: string;
  customerEmail?: string;
  customerName?: string;
  isArchived?: boolean;
  lastEvent?: string;
  lastEventAt?: string;
  lastPaymentAt?: string;
  nextPaymentDueAt?: string;
  paymentMethodType?: 'card' | 'ach' | 'wire' | 'invoice' | 'other';
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded';
  planCode?: string;
  planInterval?: string;
  planName?: string;
  prorationAmount?: number;
  prorationDate?: number;
  restorationMetadata?: Record<string, unknown>;
  restoredAt?: string | null;
  stateHistory?: unknown[];
  status?: 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated';
  subscriptionId?: string;
  updatedAt?: string;
}
const generatedProps = defineProps<Props>();
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** Recurring price expressed in minor units (e.g., cents). */
const amount = ref<number>(generatedProps.amount ?? 0);
/** Structured metadata about the archival action for compliance and audit purposes.

Properties:
  - method: "manual" | "automated" | "policy" — how the archive was triggered
  - compliance_tags: string[] — regulatory labels (e.g., ["GDPR", "SOX", "HIPAA"])
  - retention_policy_id: string — reference to the retention policy that triggered archival
  - original_status: string — the Stateful status before archival
  - related_entity_count: number — count of related entities also archived (cascade)
 */
const archiveMetadata = ref<Record<string, unknown>>(generatedProps.archiveMetadata ?? {});
/** Human-readable narrative describing why the entity was archived. */
const archiveReason = ref<string>(generatedProps.archiveReason ?? '');
/** Timestamp for when the entity entered the archived state. */
const archivedAt = ref<string | null>(generatedProps.archivedAt ?? '');
/** User ID or system identifier of the actor who archived this entity.
Set to "system" for automated/policy-driven archival. Supports audit trail queries
like "show all entities archived by user X" or "show all auto-archived entities".
 */
const archivedBy = ref<string>(generatedProps.archivedBy ?? '');
/** Recurrence cadence (monthly, yearly, quarterly, etc.). */
const billingInterval = ref<string>(generatedProps.billingInterval ?? '');
/** Whether the subscription will cancel at the natural billing period end. */
const cancelAtPeriodEnd = ref<boolean>(generatedProps.cancelAtPeriodEnd ?? false);
/** Free-form explanation captured during cancellation workflows. */
const cancellationReason = ref<string>(generatedProps.cancellationReason ?? '');
/** Structured reason code chosen from the allowedReasons parameter. */
const cancellationReasonCode = ref<string>(generatedProps.cancellationReasonCode ?? '');
/** Timestamp when cancellation was initiated. */
const cancellationRequestedAt = ref<string>(generatedProps.cancellationRequestedAt ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** ISO 4217 currency code used for billing. */
const currency = ref<string>(generatedProps.currency ?? '');
/** End timestamp of the current billing cycle. */
const currentPeriodEnd = ref<string>(generatedProps.currentPeriodEnd ?? '');
/** Decimal progress (0-1) through the active billing cycle. */
const currentPeriodProgress = ref<number>(generatedProps.currentPeriodProgress ?? 0);
/** Start timestamp of the current billing cycle. */
const currentPeriodStart = ref<string>(generatedProps.currentPeriodStart ?? '');
/** Billing contact email address. */
const customerEmail = ref<string>(generatedProps.customerEmail ?? '');
/** Customer or account name associated with the subscription. */
const customerName = ref<string>(generatedProps.customerName ?? '');
/** Flag indicating whether the entity is currently archived (soft-deleted). */
const isArchived = ref<boolean>(generatedProps.isArchived ?? false);
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<string>(generatedProps.lastEvent ?? '');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Timestamp of the most recent successful payment. */
const lastPaymentAt = ref<string>(generatedProps.lastPaymentAt ?? '');
/** Timestamp when the next payment attempt should occur. */
const nextPaymentDueAt = ref<string>(generatedProps.nextPaymentDueAt ?? '');
/** Payment instrument category used for collection. */
const paymentMethodType = ref<'card' | 'ach' | 'wire' | 'invoice' | 'other'>(generatedProps.paymentMethodType ?? 'card');
/** Outcome of the most recent collection attempt. Distinct from subscription
lifecycle status — a subscription can be "active" with payment_status "retrying".
 */
const paymentStatus = ref<'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded'>(generatedProps.paymentStatus ?? 'pending');
/** Internal plan code or price identifier. */
const planCode = ref<string>(generatedProps.planCode ?? '');
/** Billing interval descriptor (monthly, yearly, etc.). */
const planInterval = ref<string>(generatedProps.planInterval ?? '');
/** Human-readable plan label shown in headers. */
const planName = ref<string>(generatedProps.planName ?? '');
/** Prorated credit or charge in minor currency units generated by a mid-cycle
plan change. Positive values are charges; negative values are credits.
Only populated when the supportProration parameter is true.
 */
const prorationAmount = ref<number>(generatedProps.prorationAmount ?? 0);
/** Unix timestamp (epoch SECONDS) at which proration is calculated. Pinned when an
upcoming-invoice PREVIEW is requested and MUST be passed identically on commit so the
committed charge equals the previewed amount. The preview is read-only and does NOT
mutate the subscription. Stored as an integer (not a datetime) so the value round-trips
byte-identically between preview and commit — an ISO string normalization could shift it
and desync the previewed vs charged amount. Only populated when supportProration is true.
Source: docs.stripe.com/billing/subscriptions/prorations.
 */
const prorationDate = ref<number>(generatedProps.prorationDate ?? 0);
/** Metadata about the most recent restoration action.

Properties:
  - restored_by: string — user ID or "system"
  - restored_fields: string[] — when partial restore, which fields were restored
  - restoration_reason: string — why the entity was restored
  - restored_from_snapshot: boolean — whether restored from a point-in-time snapshot
 */
const restorationMetadata = ref<Record<string, unknown>>(generatedProps.restorationMetadata ?? {});
/** Timestamp for when the entity was most recently restored from an archived state. */
const restoredAt = ref<string | null>(generatedProps.restoredAt ?? '');
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
const stateHistory = ref<unknown[]>(generatedProps.stateHistory ?? []);
/** Current lifecycle status of the subscription. */
const status = ref<'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated'>(generatedProps.status ?? 'future');
/** Primary identifier used across billing and lifecycle systems. */
const subscriptionId = ref<string>(generatedProps.subscriptionId ?? '');
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

const handleChange_amountState = ref<string>(String(amount.value ?? ''));
const setHandleChange_amountState = (value: string) => { handleChange_amountState.value = value; };
/* @oods-local-binding handleChange_amount */ const handleChange_amount = (value: string) => { setHandleChange_amountState(value); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
