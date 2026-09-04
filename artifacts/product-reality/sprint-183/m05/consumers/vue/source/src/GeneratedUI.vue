<template>
  <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <Text id="slot-header-2" data-oods-component="Text" />
          </Stack>
      <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-9" data-oods-component="Tabs" :items="[{'id':'detail-tab-panel-3','label':'Tab 1','panel':''},{'id':'detail-tab-panel-5','label':'Tab 2','panel':''},{'id':'detail-tab-panel-7','label':'Tab 3','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-0-4" data-oods-component="Stack" />
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
                        </template>
                      </Tabs>
            </div>
            <aside data-sidebar-aside>
              <Stack id="detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <Stack id="slot-metadata-12" data-oods-component="Stack" />
                      </Stack>
            </aside>
          </Card>
    </Stack>
</template>

<script setup lang="ts">
import { Card, Stack, Tabs, Text } from '@oods/components-vue';
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
  /** Immutable customer identifier for linking CRM and billing. */
  accountKey?: string;
  /** Customer or workspace name tied to the subscription. */
  accountName: string;
  /** Customer success owner assigned to the account. */
  accountOwner?: string;
  /** Contact email for the assigned customer owner. */
  accountOwnerEmail?: string;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: unknown;
  /** Contract value expressed in minor currency units. */
  amountMinor: number;
  /** Day of month used to anchor renewals when prorating. */
  billingAnchorDay?: number;
  /** Billing cadence name selected from supportedIntervals. */
  billingInterval: string;
  /** When the subscription will cancel if pending. */
  cancellationEffectiveAt?: string;
  /** How billing is collected (charge_automatically, send_invoice). */
  collectionMethod?: string;
  /** Actual quantity consumed in the active period. */
  consumedQuantity: number;
  /** Remaining credit memo balance that can be applied to invoices. */
  creditMemoBalanceMinor?: number;
  /** Category of credit memo tied to business justification. */
  creditMemoType?: string;
  /** ISO 4217 currency for the plan price. */
  currency: string;
  /** Timestamp when the active billing period ends. */
  currentPeriodEnd: string;
  /** Timestamp when the active billing period began. */
  currentPeriodStart: string;
  /** Derived account health indicator (0-100). */
  healthScore?: number;
  /** Quantity included in base plan before overages. */
  includedQuantity: number;
  /** Multiplier for interval (ex: 12 with monthly => yearly cadence). */
  intervalCount?: number;
  /** Timestamp when the most recent refund was issued. */
  lastRefundAt?: string;
  /** Friendly metered feature name shown in UI (ex: Analytics Seats). */
  meterName: string;
  /** Free form account summary for success and finance teams. */
  notes?: string;
  /** Cost per additional unit expressed in minor currency units. */
  overageRateMinor?: number;
  /** Date the usage accumulation window ends. */
  periodEnd: string;
  /** Date the usage accumulation window began. */
  periodStart: string;
  /** Provider specific identifier for the plan or price. */
  planCode: string;
  /** Human readable plan label rendered in list and detail contexts. */
  planName: string;
  /** Price strategy (flat, per_unit, tiered, package). */
  pricingModel?: string;
  /** Forecasted overage spend derived from consumption trends. */
  projectedOverageMinor?: number;
  /** Source system providing subscription data (ex: stripe, chargebee). */
  provider: string;
  /** Provider specific identifier used during reconciliation. */
  providerSubscriptionId?: string;
  /** Link to customer facing refund or cancellation policy. */
  refundPolicyUrl?: string;
  /** Date when refund eligibility window ends for this record. */
  refundableUntil?: string;
  /** Expected renewal price in minor currency units including discounts. */
  renewalRateMinor?: number;
  /** Indicates if finance manager approval is required before issuing refund. */
  requiresManagerApproval?: boolean;
  /** Customer stratification label (ex: at_risk, stable, expansion). */
  riskSegment?: string;
  /** Strategy for unused units (inherits rolloverStrategy parameter). */
  rolloverStrategy?: string;
  /** Rolling usage measurements for charts or anomaly detection. */
  samples?: unknown;
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
  stateHistory?: unknown;
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: string;
  /** Short context on the current lifecycle status (ex: payment retrying). */
  statusNote?: string;
  /** Stable identifier shared across billing surfaces. */
  subscriptionId: string;
  /** Cumulative amount refunded in minor currency units. */
  totalRefundedMinor?: number;
  /** Date when trialing subscriptions will convert or expire. */
  trialEndAt?: string;
  /** Length of introductory trial period in days. */
  trialPeriodDays?: number;
  /** Label for display, defaults to the unit parameter. */
  unitLabel: string;
}

const { actions, accountKey, accountName, accountOwner, accountOwnerEmail, allowedTransitions, amountMinor, billingAnchorDay, billingInterval, cancellationEffectiveAt, collectionMethod, consumedQuantity, creditMemoBalanceMinor, creditMemoType, currency, currentPeriodEnd, currentPeriodStart, healthScore, includedQuantity, intervalCount, lastRefundAt, meterName, notes, overageRateMinor, periodEnd, periodStart, planCode, planName, pricingModel, projectedOverageMinor, provider, providerSubscriptionId, refundPolicyUrl, refundableUntil, renewalRateMinor, requiresManagerApproval, riskSegment, rolloverStrategy, samples, stateHistory, status, statusNote, subscriptionId, totalRefundedMinor, trialEndAt, trialPeriodDays, unitLabel } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
