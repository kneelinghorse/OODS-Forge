<template>
  <Stack id="detail-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <VizAreaPreview id="detail-ve-header-26" data-oods-component="VizAreaPreview" :svg="svg ?? defaultChartSvg" description="Recorded and scheduled sample payments in major currency units." :height="200" title="Payment amounts" :width="360" />
                                <StatusTimeline id="detail-ve-header-27" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <CancellationSummary id="detail-ve-header-28" data-oods-component="CancellationSummary" :cancelAtPeriodEnd="cancelAtPeriodEnd" :requestedAt="cancellationRequestedAt" :reason="cancellationReason" :code="cancellationReasonCode" />
                                <ArchiveSummary id="detail-ve-header-29" data-oods-component="ArchiveSummary" :isArchived="isArchived" :archivedAt="archivedAt" :reason="archiveReason" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Billing','panel':''},{'id':'detail-detail-tab-panel-14','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <CycleProgressCard id="detail-slot-tab-0-4" data-oods-component="CycleProgressCard" :progress="currentPeriodProgress" :periodStart="currentPeriodStart" :periodEnd="currentPeriodEnd" :interval="billingInterval" />
                                          <PaymentTimeline id="detail-slot-tab-1-6" data-oods-component="PaymentTimeline" :lastPayment="lastPaymentAt" :nextPayment="nextPaymentDueAt" :paymentStatus="paymentStatus" :paymentMethod="paymentMethodType" :amount="amount" :currency="currency" />
                                        </Stack>
                                      </template>
                                      <template v-if="item.id === 'detail-detail-tab-panel-14'">
                                        <Stack id="detail-detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <StatusBadge id="detail-slot-tab-3-15" data-oods-component="StatusBadge" label="Payment status" :status="paymentStatus" />
                                          <Text id="detail-slot-tab-4-17" data-oods-component="Text" label="Amount">{{ amount }}</Text>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                                    <AuditTimeline id="detail-slot-metadata-12" data-oods-component="AuditTimeline" :auditLog="stateHistory" />
                                  </Stack>
                      </aside>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleCancel" @click="handleCancel()">Cancel subscription</button>
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Archive</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { ArchiveSummary, AuditTimeline, Banner, CancellationSummary, Card, CycleProgressCard, PaymentTimeline, Stack, StatusBadge, StatusTimeline, Tabs, Text, VizAreaPreview } from '@oods/components-vue';
import '@oods/component-styles/css';
const defaultChartSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"370\" height=\"210\" viewBox=\"0 0 370 210\"><rect width=\"370\" height=\"210\" fill=\"#FDF3DE\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(43,38)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h322v135h-322Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,135)\" x2=\"322\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,101)\" x2=\"322\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,68)\" x2=\"322\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,34)\" x2=\"322\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"322\" y2=\"0\" stroke=\"#DAD0BA\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Date' for a time scale with values from Tuesday, 01 September 2026, 7:00:00 AM to Thursday, 01 October 2026, 7:00:00 AM\"><g transform=\"translate(0.5,135.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(18,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(40,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(61,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(83,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(104,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(126,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(147,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(169,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(190,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(212,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(233,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(254,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(276,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(297,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(319,0)\" x2=\"0\" y2=\"5\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(18.336111111111112,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Thu 03</text><text text-anchor=\"middle\" transform=\"translate(39.80277777777778,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Sat 05</text><text text-anchor=\"middle\" transform=\"translate(61.26944444444444,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Mon 07</text><text text-anchor=\"middle\" transform=\"translate(82.7361111111111,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Wed 09</text><text text-anchor=\"middle\" transform=\"translate(104.20277777777778,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Fri 11</text><text text-anchor=\"middle\" transform=\"translate(125.66944444444445,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Sep 13</text><text text-anchor=\"middle\" transform=\"translate(147.13611111111112,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Tue 15</text><text text-anchor=\"middle\" transform=\"translate(168.6027777777778,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Thu 17</text><text text-anchor=\"middle\" transform=\"translate(190.06944444444446,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Sat 19</text><text text-anchor=\"middle\" transform=\"translate(211.5361111111111,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Mon 21</text><text text-anchor=\"middle\" transform=\"translate(233.00277777777777,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Wed 23</text><text text-anchor=\"middle\" transform=\"translate(254.46944444444443,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Fri 25</text><text text-anchor=\"middle\" transform=\"translate(275.9361111111111,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">Sep 27</text><text text-anchor=\"middle\" transform=\"translate(297.40277777777777,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">Tue 29</text><text text-anchor=\"middle\" transform=\"translate(318.86944444444447,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"0\">October</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"322\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(161,30)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#18233C\" opacity=\"1\">Date</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'Amount' for a linear scale with values from 0 to 20\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,135)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,101)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,68)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,34)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"-5\" y2=\"0\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,138)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,104.25)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">5</text><text text-anchor=\"end\" transform=\"translate(-7,70.5)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">10</text><text text-anchor=\"end\" transform=\"translate(-7,36.75)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">15</text><text text-anchor=\"end\" transform=\"translate(-7,3)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#4B4D5A\" opacity=\"1\">20</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,135)\" x2=\"0\" y2=\"-135\" stroke=\"#D6DAE4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-27,67.5) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#18233C\" opacity=\"1\">Amount</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-area role-mark marks\" role=\"graphics-object\" aria-roledescription=\"area mark container\"><path aria-label=\"Date: Sep 01, 2026; Amount: 19\" role=\"graphics-symbol\" aria-roledescription=\"area mark\" d=\"M0,6.75L322,6.75L322,135L0,135Z\" fill=\"#416CD9\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-38,-33)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Sample payments'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"#18233C\" opacity=\"1\">Sample payments</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>";

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleCancel: () => void;
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  svg?: string;
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
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

const { actions, uiState, allowedTransitions, amount, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, currency, currentPeriodEnd, currentPeriodProgress, currentPeriodStart, customerEmail, customerName, isArchived, lastEvent, lastEventAt, lastPaymentAt, nextPaymentDueAt, paymentMethodType, paymentStatus, planCode, planInterval, planName, prorationAmount, prorationDate, restorationMetadata, restoredAt, stateHistory, status, subscriptionId, updatedAt, svg } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
