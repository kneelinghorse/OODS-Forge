<template>
  <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <Stack id="slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <StatusTimeline id="ve-header-24" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                    <CancellationSummary id="ve-header-25" data-oods-component="CancellationSummary" :cancelAtPeriodEnd="cancelAtPeriodEnd" :requestedAt="cancellationRequestedAt" :reason="cancellationReason" :code="cancellationReasonCode" />
                    <ArchiveSummary id="ve-header-26" data-oods-component="ArchiveSummary" :isArchived="isArchived" :archivedAt="archivedAt" :reason="archiveReason" />
                  </Stack>
          </Stack>
      <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-9" data-oods-component="Tabs" :items="[{'id':'detail-tab-panel-3','label':'Billing','panel':''},{'id':'detail-tab-panel-5','label':'Status \x26 History','panel':''},{'id':'detail-tab-panel-7','label':'Details','panel':''},{'id':'detail-tab-panel-14','label':'Status','panel':''},{'id':'detail-tab-panel-16','label':'Dates \x26 History','panel':''},{'id':'detail-tab-panel-18','label':'Pricing','panel':''},{'id':'detail-tab-panel-20','label':'Details 7','panel':''},{'id':'detail-tab-panel-22','label':'Pricing 8','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <StatusTimeline id="slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                  <Text id="pg-status-timeline-28" data-oods-component="Text" label="Current lifecycle status of the subscription.">{{ status }}</Text>
                                  <Text id="pg-status-timeline-29" data-oods-component="Text" label="Materialized list of valid next states from the current status, computed from the&#10;transitionRules parameter. When transitionRules is null (open model), this contains&#10;all states except the current one. Used by StatusSelector to disable invalid options&#10;and by StatusBadge to indicate available paths.&#10;">{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}</Text>
                                </StatusTimeline>
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-5'">
                            <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-1-6" data-oods-component="Stack" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-7'">
                            <Stack id="detail-tab-panel-7" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-2-8" data-oods-component="Stack" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-14'">
                            <Stack id="detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <StatusBadge id="slot-tab-3-15" data-oods-component="StatusBadge" label="Outcome of the most recent collection attempt. Distinct from subscription&#10;lifecycle status — a subscription can be &quot;active&quot; with payment_status &quot;retrying&quot;.&#10;" :status="paymentStatus" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-16'">
                            <Stack id="detail-tab-panel-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Text id="slot-tab-4-17" data-oods-component="Text" label="Recurring price expressed in minor units (e.g., cents).">{{ amount }}</Text>
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-18'">
                            <Stack id="detail-tab-panel-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-5-19" data-oods-component="Card" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-20'">
                            <Stack id="detail-tab-panel-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-6-21" data-oods-component="Stack" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-22'">
                            <Stack id="detail-tab-panel-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-7-23" data-oods-component="Card" />
                            </Stack>
                          </template>
                        </template>
                      </Tabs>
            </div>
            <aside data-sidebar-aside>
              <Stack id="detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <AuditTimeline id="slot-metadata-12" data-oods-component="AuditTimeline" />
                      </Stack>
            </aside>
          </Card>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-detail-13">
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Delete</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
  </div>
</template>

<script setup lang="ts">
import { ArchiveSummary, AuditTimeline, CancellationSummary, Card, Stack, StatusBadge, StatusTimeline, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleDelete sha256:221fdee3330ccb3c003961fa632660ca61b4f1713ca9b67d2612c45fe63a1f43 */
  /* @oods-domain-source sha256:74252fa49ed24d37978bced342336a0b2aac9bed23e8fa0d6d3db7f99f0fe9fc */
  handleDelete: () => void;
  /* @oods-domain-action handleEdit sha256:8d06ae954d1e16d46333996b5945dbfef37c642e52d7bc1f68ece666c760d9b2 */
  /* @oods-domain-source sha256:c0d990cc2989feb07786ba35c93b878e524cccf8ecc11583869e8f3344f87f48 */
  handleEdit: () => void;
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
  archivedAt?: unknown;
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
  restoredAt?: unknown;
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

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
