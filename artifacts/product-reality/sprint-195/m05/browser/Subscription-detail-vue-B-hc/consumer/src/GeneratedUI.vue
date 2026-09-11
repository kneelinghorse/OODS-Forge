<template>
  <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <Stack id="slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <VizAreaPreview id="ve-header-26" data-oods-component="VizAreaPreview" :svg="svg ?? defaultChartSvg" description="Recorded sample payments in major currency units." :height="200" title="Payment amounts" :width="360" />
                    <StatusTimeline id="ve-header-27" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                    <CancellationSummary id="ve-header-28" data-oods-component="CancellationSummary" :cancelAtPeriodEnd="cancelAtPeriodEnd" :requestedAt="cancellationRequestedAt" :reason="cancellationReason" :code="cancellationReasonCode" />
                    <ArchiveSummary id="ve-header-29" data-oods-component="ArchiveSummary" :isArchived="isArchived" :archivedAt="archivedAt" :reason="archiveReason" />
                  </Stack>
          </Stack>
      <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-tab-panel-3','label':'Billing','panel':''},{'id':'detail-tab-panel-14','label':'Details','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <CycleProgressCard id="slot-tab-0-4" data-oods-component="CycleProgressCard" :progress="currentPeriodProgress" :periodStart="currentPeriodStart" :periodEnd="currentPeriodEnd" :interval="billingInterval" />
                              <PaymentTimeline id="slot-tab-1-6" data-oods-component="PaymentTimeline" :lastPayment="lastPaymentAt" :nextPayment="nextPaymentDueAt" :paymentStatus="paymentStatus" :paymentMethod="paymentMethodType" :amount="amount" :currency="currency" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-14'">
                            <Stack id="detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <StatusBadge id="slot-tab-3-15" data-oods-component="StatusBadge" label="Payment status" :status="paymentStatus" />
                              <Text id="slot-tab-4-17" data-oods-component="Text" label="Amount">{{ amount }}</Text>
                            </Stack>
                          </template>
                        </template>
                      </Tabs>
            </div>
            <aside data-sidebar-aside>
              <Stack id="detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)" />
            </aside>
          </Card>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-detail-13">
    <button type="button" data-oods-action="handleCancel" @click="handleCancel()">Cancel subscription</button>
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Delete</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { ArchiveSummary, CancellationSummary, Card, CycleProgressCard, PaymentTimeline, Stack, StatusBadge, StatusTimeline, Tabs, Text, VizAreaPreview } from '@oods/components-vue';
import '@oods/component-styles/css';
const defaultChartSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"370\" height=\"210\" viewBox=\"0 0 370 210\"><rect width=\"370\" height=\"210\" fill=\"Canvas\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(43,33)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h306v140h-306Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,140)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,108)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,76)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,45)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,13)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Date' for a time scale with values from Monday, 01 June 2026, 7:00:00 AM to Tuesday, 01 September 2026, 7:00:00 AM\"><g transform=\"translate(0.5,140.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(19,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(42,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(66,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(89,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(112,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(135,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(159,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(182,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(205,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(229,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(252,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(275,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(298,0)\" x2=\"0\" y2=\"5\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(18.98641304347826,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">Jun 07</text><text text-anchor=\"middle\" transform=\"translate(42.26902173913044,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jun 14</text><text text-anchor=\"middle\" transform=\"translate(65.55163043478261,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jun 21</text><text text-anchor=\"middle\" transform=\"translate(88.83423913043478,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jun 28</text><text text-anchor=\"middle\" transform=\"translate(112.11684782608695,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">Jul 05</text><text text-anchor=\"middle\" transform=\"translate(135.39945652173913,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jul 12</text><text text-anchor=\"middle\" transform=\"translate(158.6820652173913,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jul 19</text><text text-anchor=\"middle\" transform=\"translate(181.96467391304347,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Jul 26</text><text text-anchor=\"middle\" transform=\"translate(205.24728260869563,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">Aug 02</text><text text-anchor=\"middle\" transform=\"translate(228.5298913043478,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Aug 09</text><text text-anchor=\"middle\" transform=\"translate(251.8125,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Aug 16</text><text text-anchor=\"middle\" transform=\"translate(275.0951086956522,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"0\">Aug 23</text><text text-anchor=\"middle\" transform=\"translate(298.3777173913043,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">Aug 30</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"306\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(153,30)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"CanvasText\" opacity=\"1\">Date</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'Amount' for a linear scale with values from 0 to 22\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,140)\" x2=\"-5\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,108)\" x2=\"-5\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,76)\" x2=\"-5\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,45)\" x2=\"-5\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,13)\" x2=\"-5\" y2=\"0\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,143)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,111.18181818181817)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">5</text><text text-anchor=\"end\" transform=\"translate(-7,79.36363636363636)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">10</text><text text-anchor=\"end\" transform=\"translate(-7,47.545454545454554)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">15</text><text text-anchor=\"end\" transform=\"translate(-7,15.727272727272732)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"CanvasText\" opacity=\"1\">20</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,140)\" x2=\"0\" y2=\"-140\" stroke=\"CanvasText\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-27,70) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"CanvasText\" opacity=\"1\">Amount</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-area role-mark marks\" role=\"graphics-object\" aria-roledescription=\"area mark container\"><path aria-label=\"Date: Jun 01, 2026; Amount: 15.2\" role=\"graphics-symbol\" aria-roledescription=\"area mark\" d=\"M0,43.273L99.783,7L202.891,31.182L306,19.091L306,140L202.891,140L99.783,140L0,140Z\" fill=\"oklch(0.56 0.1737 264.97)\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-38,-28)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Payment amounts'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"CanvasText\" opacity=\"1\">Payment amounts</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>";

interface GeneratedUIActions {
  /* @oods-domain-action handleCancel sha256:6b38facf9a5444017d5ec9c9512afa85cd529766082f4083efbf78a828756dea */
  /* @oods-domain-source sha256:96dd13d3bceda46750b6ffb99e7fb056eb02b88cf021245be6983ceaf015d17b */
  handleCancel: () => void;
  /* @oods-domain-action handleDelete sha256:221fdee3330ccb3c003961fa632660ca61b4f1713ca9b67d2612c45fe63a1f43 */
  /* @oods-domain-source sha256:74252fa49ed24d37978bced342336a0b2aac9bed23e8fa0d6d3db7f99f0fe9fc */
  handleDelete: () => void;
  /* @oods-domain-action handleEdit sha256:8d06ae954d1e16d46333996b5945dbfef37c642e52d7bc1f68ece666c760d9b2 */
  /* @oods-domain-source sha256:c0d990cc2989feb07786ba35c93b878e524cccf8ecc11583869e8f3344f87f48 */
  handleEdit: () => void;
  /* @oods-domain-action handleViewTimeline sha256:71b845bd5c850e444bda9b61a19589b098d52255006045a1c1979efd3844a6b1 */
  /* @oods-domain-source sha256:67df05e1fca7b25d68f0c064be69dd0ac5d61fc1682331b45d695c043e2a4dda */
  handleViewTimeline: () => void;
}

interface Props {
  svg?: string;
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

const { actions, allowedTransitions, amount, archiveMetadata, archiveReason, archivedAt, archivedBy, billingInterval, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, createdAt, currency, currentPeriodEnd, currentPeriodProgress, currentPeriodStart, customerEmail, customerName, isArchived, lastEvent, lastEventAt, lastPaymentAt, nextPaymentDueAt, paymentMethodType, paymentStatus, planCode, planInterval, planName, prorationAmount, prorationDate, restorationMetadata, restoredAt, stateHistory, status, subscriptionId, updatedAt, svg } = defineProps<Props>();

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
