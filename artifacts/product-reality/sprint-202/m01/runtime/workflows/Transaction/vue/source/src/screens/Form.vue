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
                      <StatusSelector id="form-ve-title-26" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Pending','value':'pending'},{'label':'Authorized','value':'authorized'},{'label':'Settled','value':'settled'},{'label':'Failed','value':'failed'},{'label':'Refunded','value':'refunded'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <CancellationForm id="form-ve-title-27" data-oods-component="CancellationForm" :allowedReasons="['customer_request','suspected_fraud','duplicate_charge','payment_method_error']" codeHelp="Structured reason code chosen from the allowedReasons parameter." embedded reasonHelp="Free-form detail describing why cancellation occurred." :reason="cancellationReason" :reasonCode="cancellationReasonCode" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-2-7" data-oods-component="Select" help="ISO currency code for the unit amount." label="Currency" :options="[{'label':'USD','value':'USD'},{'label':'EUR','value':'EUR'},{'label':'GBP','value':'GBP'},{'label':'JPY','value':'JPY'},{'label':'AUD','value':'AUD'}]" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-3-13" data-oods-component="Select" help="Defines whether taxes are included in the displayed price." label="Tax behavior" :options="[{'value':'exclusive','label':'exclusive'},{'value':'inclusive','label':'inclusive'}]" placeholder="Enter tax behavior" required :modelValue="handleChange_tax_behaviorState" @update:modelValue="setHandleChange_tax_behaviorState" @change="handleChange_tax_behavior" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-4-15" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Initiated','value':'initiated'},{'label':'Authorized','value':'authorized'},{'label':'Settled','value':'settled'},{'label':'Refunded','value':'refunded'},{'label':'Failed','value':'failed'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Base unit price expressed in the smallest currency denomination." label="Unit amount cents" placeholder="Enter unit amount cents" required type="number" :modelValue="handleChange_unit_amount_centsState" @update:modelValue="setHandleChange_unit_amount_centsState" @change="handleChange_unit_amount_cents" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-6-19" data-oods-component="Select" help="Monetization model applied to the entity." label="Pricing model" :options="[{'label':'One Time','value':'one_time'},{'label':'Usage Based','value':'usage_based'}]" required :modelValue="handleChange_pricing_modelState" @update:modelValue="setHandleChange_pricing_modelState" @change="handleChange_pricing_model" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-7-21" data-oods-component="Select" help="Billing cadence when pricing_model indicates recurring revenue." label="Billing interval" :options="[{'label':'One Time','value':'one_time'}]" :modelValue="handleChange_billing_intervalState" @update:modelValue="setHandleChange_billing_intervalState" @change="handleChange_billing_interval" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Unique identifier for the transaction record." label="Transaction id" placeholder="Enter transaction id" required :modelValue="handleChange_transaction_idState" @update:modelValue="setHandleChange_transaction_idState" @change="handleChange_transaction_id" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Identifier of the user associated with the transaction." label="User id" placeholder="Enter user id" required :modelValue="handleChange_user_idState" @update:modelValue="setHandleChange_user_idState" @change="handleChange_user_id" />
                              </Stack>
                    </Stack>
              <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
                      <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Banner, Button, CancellationForm, Input, Select, Stack, StatusSelector } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  allowedTransitions?: string[];
  archiveMetadata?: Record<string, unknown>;
  archiveReason?: string;
  archivedAt?: string | null;
  archivedBy?: string;
  billingInterval?: 'one_time';
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
  cancellationReasonCode?: 'customer_request' | 'suspected_fraud' | 'duplicate_charge' | 'payment_method_error';
  cancellationRequestedAt?: string;
  channel?: 'online' | 'in_app' | 'point_of_sale' | 'partner';
  createdAt?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';
  isArchived?: boolean;
  lastEvent?: 'initiated' | 'authorized' | 'settled' | 'refunded' | 'failed';
  lastEventAt?: string;
  occurredAt?: string;
  organizationId?: string;
  paymentMethod?: 'card' | 'bank_transfer' | 'digital_wallet' | 'invoice';
  paymentReference?: string;
  pricingModel?: 'one_time' | 'usage_based';
  restorationMetadata?: Record<string, unknown>;
  restoredAt?: string | null;
  riskScore?: number;
  stateHistory?: unknown[];
  status?: 'pending' | 'authorized' | 'settled' | 'failed' | 'refunded';
  taxBehavior?: 'exclusive' | 'inclusive';
  transactionId?: string;
  unitAmountCents?: number;
  updatedAt?: string;
  userId?: string;
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
/** Billing cadence when pricing_model indicates recurring revenue. */
const billingInterval = ref<'one_time'>(generatedProps.billingInterval ?? 'one_time');
/** Whether cancellation occurs at the natural period end instead of immediately. When true the entity is in a REVERSIBLE pending-cancellation state: the schedule can be undone (set back to false) any time before period end, returning the entity to active. This is distinct from a terminal cancellation (a `terminated`/canceled subscription), which is irreversible and non-reactivatable. Mirrors Stripe's cancel_at_period_end flag (docs.stripe.com/billing/subscriptions/cancel). */
const cancelAtPeriodEnd = ref<boolean>(generatedProps.cancelAtPeriodEnd ?? false);
/** Free-form detail describing why cancellation occurred. */
const cancellationReason = ref<string>(generatedProps.cancellationReason ?? '');
/** Structured reason code chosen from the allowedReasons parameter. */
const cancellationReasonCode = ref<'customer_request' | 'suspected_fraud' | 'duplicate_charge' | 'payment_method_error'>(generatedProps.cancellationReasonCode ?? 'customer_request');
/** Timestamp capturing when the cancellation workflow was initiated. */
const cancellationRequestedAt = ref<string>(generatedProps.cancellationRequestedAt ?? '');
/** Sales channel through which the transaction was initiated. */
const channel = ref<'online' | 'in_app' | 'point_of_sale' | 'partner'>(generatedProps.channel ?? 'online');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** ISO currency code for the unit amount. */
const currency = ref<'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'>(generatedProps.currency ?? 'USD');
/** Flag indicating whether the entity is currently archived (soft-deleted). */
const isArchived = ref<boolean>(generatedProps.isArchived ?? false);
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'initiated' | 'authorized' | 'settled' | 'refunded' | 'failed'>(generatedProps.lastEvent ?? 'initiated');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Timestamp when the transaction occurred in the source system. */
const occurredAt = ref<string>(generatedProps.occurredAt ?? '');
/** Tenant organization responsible for the transaction. */
const organizationId = ref<string>(generatedProps.organizationId ?? '');
/** Funding source used to complete the transaction. */
const paymentMethod = ref<'card' | 'bank_transfer' | 'digital_wallet' | 'invoice'>(generatedProps.paymentMethod ?? 'card');
/** Provider reference code linking to the payment processor. */
const paymentReference = ref<string>(generatedProps.paymentReference ?? '');
/** Monetization model applied to the entity. */
const pricingModel = ref<'one_time' | 'usage_based'>(generatedProps.pricingModel ?? 'one_time');
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
/** Fraud assessment score assigned during authorization. */
const riskScore = ref<number>(generatedProps.riskScore ?? 0);
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
/** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
const status = ref<'pending' | 'authorized' | 'settled' | 'failed' | 'refunded'>(generatedProps.status ?? 'pending');
/** Defines whether taxes are included in the displayed price. */
const taxBehavior = ref<'exclusive' | 'inclusive'>(generatedProps.taxBehavior ?? 'exclusive');
/** Unique identifier for the transaction record. */
const transactionId = ref<string>(generatedProps.transactionId ?? '');
/** Base unit price expressed in the smallest currency denomination. */
const unitAmountCents = ref<number>(generatedProps.unitAmountCents ?? 0);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Identifier of the user associated with the transaction. */
const userId = ref<string>(generatedProps.userId ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_billing_intervalState = ref<string>(String(billingInterval.value ?? ''));
const setHandleChange_billing_intervalState = (value: string) => { handleChange_billing_intervalState.value = value; };
/* @oods-local-binding handleChange_billing_interval */ const handleChange_billing_interval = (value: string) => { setHandleChange_billing_intervalState(value); };
const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_currencyState = ref<string>(String(currency.value ?? ''));
const setHandleChange_currencyState = (value: string) => { handleChange_currencyState.value = value; };
/* @oods-local-binding handleChange_currency */ const handleChange_currency = (value: string) => { setHandleChange_currencyState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_pricing_modelState = ref<string>(String(pricingModel.value ?? ''));
const setHandleChange_pricing_modelState = (value: string) => { handleChange_pricing_modelState.value = value; };
/* @oods-local-binding handleChange_pricing_model */ const handleChange_pricing_model = (value: string) => { setHandleChange_pricing_modelState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tax_behaviorState = ref<string>(String(taxBehavior.value ?? ''));
const setHandleChange_tax_behaviorState = (value: string) => { handleChange_tax_behaviorState.value = value; };
/* @oods-local-binding handleChange_tax_behavior */ const handleChange_tax_behavior = (value: string) => { setHandleChange_tax_behaviorState(value); };
const handleChange_transaction_idState = ref<string>(String(transactionId.value ?? ''));
const setHandleChange_transaction_idState = (value: string) => { handleChange_transaction_idState.value = value; };
/* @oods-local-binding handleChange_transaction_id */ const handleChange_transaction_id = (value: string) => { setHandleChange_transaction_idState(value); };
const handleChange_unit_amount_centsState = ref<string>(String(unitAmountCents.value ?? ''));
const setHandleChange_unit_amount_centsState = (value: string) => { handleChange_unit_amount_centsState.value = value; };
/* @oods-local-binding handleChange_unit_amount_cents */ const handleChange_unit_amount_cents = (value: string) => { setHandleChange_unit_amount_centsState(value); };
const handleChange_user_idState = ref<string>(String(userId.value ?? ''));
const setHandleChange_user_idState = (value: string) => { handleChange_user_idState.value = value; };
/* @oods-local-binding handleChange_user_id */ const handleChange_user_id = (value: string) => { setHandleChange_user_idState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
