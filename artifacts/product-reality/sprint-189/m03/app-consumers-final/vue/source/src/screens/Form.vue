<template>
  <Stack id="form-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
              <Stack id="form-form-title-1" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <StatusSelector id="form-ve-title-28" data-oods-component="StatusSelector" label="Current lifecycle status of the subscription." :options="[{'label':'Future','value':'future'},{'label':'Trialing','value':'trialing'},{'label':'Active','value':'active'},{'label':'Paused','value':'paused'},{'label':'Pending Cancellation','value':'pending_cancellation'},{'label':'Past Due','value':'past_due'},{'label':'Unpaid','value':'unpaid'},{'label':'Terminated','value':'terminated'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <CancellationForm id="form-ve-title-29" data-oods-component="CancellationForm" :reason="cancellationReason" :reasonCode="cancellationReasonCode" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Stack id="form-slot-field-0-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                            <BillingIntervalSelector id="form-ve-field-0-26" data-oods-component="BillingIntervalSelector" :intervals="['monthly','yearly']" :interval="billingInterval" />
                                            <BillingAmountInput id="form-ve-field-0-27" data-oods-component="BillingAmountInput" :minorUnits="100" :amount="amount" :currency="currency" />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-1-5" data-oods-component="Checkbox" label="Whether the subscription will cancel at the natural billing period end." :modelValue="handleChange_cancel_at_period_endState" @update:modelValue="setHandleChange_cancel_at_period_endState" @change="handleChange_cancel_at_period_end" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Textarea id="form-slot-field-2-7" data-oods-component="Textarea" label="Free-form explanation captured during cancellation workflows." :modelValue="handleChange_cancellation_reasonState" @update:modelValue="setHandleChange_cancellation_reasonState" @change="handleChange_cancellation_reason" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <DatePicker id="form-slot-field-3-13" data-oods-component="DatePicker" label="Timestamp when cancellation was initiated." :modelValue="handleChange_cancellation_requested_atState" @update:modelValue="setHandleChange_cancellation_requested_atState" @change="handleChange_cancellation_requested_at" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" label="ISO 4217 currency code used for billing." placeholder="Enter currency" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-5-17" data-oods-component="Select" label="Payment instrument category used for collection." :options="[{'value':'card','label':'card'},{'value':'ach','label':'ach'},{'value':'wire','label':'wire'},{'value':'invoice','label':'invoice'},{'value':'other','label':'other'}]" placeholder="Enter payment method type" :modelValue="handleChange_payment_method_typeState" @update:modelValue="setHandleChange_payment_method_typeState" @change="handleChange_payment_method_type" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" label="Billing contact email address." placeholder="Enter customer email" type="email" :modelValue="handleChange_customer_emailState" @update:modelValue="setHandleChange_customer_emailState" @change="handleChange_customer_email" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" label="Recurring price expressed in minor units (e.g., cents)." placeholder="Enter amount" required type="number" :modelValue="handleChange_amountState" @update:modelValue="setHandleChange_amountState" @change="handleChange_amount" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" label="Recurrence cadence (monthly, yearly, quarterly, etc.)." placeholder="Enter billing interval" :modelValue="handleChange_billing_intervalState" @update:modelValue="setHandleChange_billing_intervalState" @change="handleChange_billing_interval" />
                              </Stack>
                    </Stack>
              <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
                      <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="form-screen">
    <button type="button" data-oods-action="handleCancel" @click="handleCancel()">Cancel subscription</button>
    <button type="button" data-oods-action="handleChange" @click="handleChange()">Change</button>
    <button type="button" data-oods-action="handleSubmit" @click="handleSubmit()">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Banner, BillingAmountInput, BillingIntervalSelector, Button, CancellationForm, Checkbox, DatePicker, Input, Select, Stack, StatusSelector, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleCancel: () => void;
  handleChange: () => void;
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
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
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
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

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

/* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
/* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
const handleChange_amountState = ref<string>(String(amount.value ?? ''));
const setHandleChange_amountState = (value: string) => { handleChange_amountState.value = value; };
/* @oods-local-binding handleChange_amount */ const handleChange_amount = (value: string) => { setHandleChange_amountState(value); };
const handleChange_billing_intervalState = ref<string>(String(billingInterval.value ?? ''));
const setHandleChange_billing_intervalState = (value: string) => { handleChange_billing_intervalState.value = value; };
/* @oods-local-binding handleChange_billing_interval */ const handleChange_billing_interval = (value: string) => { setHandleChange_billing_intervalState(value); };
const handleChange_cancel_at_period_endState = ref<boolean>(cancelAtPeriodEnd.value ?? false);
const setHandleChange_cancel_at_period_endState = (checked: boolean) => { handleChange_cancel_at_period_endState.value = checked; };
/* @oods-local-binding handleChange_cancel_at_period_end */ const handleChange_cancel_at_period_end = (checked: boolean) => { setHandleChange_cancel_at_period_endState(checked); };
const handleChange_cancellation_reasonState = ref<string>(String(cancellationReason.value ?? ''));
const setHandleChange_cancellation_reasonState = (value: string) => { handleChange_cancellation_reasonState.value = value; };
/* @oods-local-binding handleChange_cancellation_reason */ const handleChange_cancellation_reason = (value: string) => { setHandleChange_cancellation_reasonState(value); };
const handleChange_cancellation_requested_atState = ref<string>(String(cancellationRequestedAt.value ?? ''));
const setHandleChange_cancellation_requested_atState = (value: string) => { handleChange_cancellation_requested_atState.value = value; };
/* @oods-local-binding handleChange_cancellation_requested_at */ const handleChange_cancellation_requested_at = (value: string) => { setHandleChange_cancellation_requested_atState(value); };
const handleChange_currencyState = ref<string>(String(currency.value ?? ''));
const setHandleChange_currencyState = (value: string) => { handleChange_currencyState.value = value; };
/* @oods-local-binding handleChange_currency */ const handleChange_currency = (value: string) => { setHandleChange_currencyState(value); };
const handleChange_customer_emailState = ref<string>(String(customerEmail.value ?? ''));
const setHandleChange_customer_emailState = (value: string) => { handleChange_customer_emailState.value = value; };
/* @oods-local-binding handleChange_customer_email */ const handleChange_customer_email = (value: string) => { setHandleChange_customer_emailState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_payment_method_typeState = ref<string>(String(paymentMethodType.value ?? ''));
const setHandleChange_payment_method_typeState = (value: string) => { handleChange_payment_method_typeState.value = value; };
/* @oods-local-binding handleChange_payment_method_type */ const handleChange_payment_method_type = (value: string) => { setHandleChange_payment_method_typeState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
