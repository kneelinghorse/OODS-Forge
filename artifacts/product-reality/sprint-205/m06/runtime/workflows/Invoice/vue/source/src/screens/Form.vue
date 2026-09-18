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
              <Input id="form-form-title-1" data-oods-component="Input" help="Customer billing contact receiving the invoice." label="Billing contact name" placeholder="Customer billing contact receiving the invoice." :modelValue="handleChange_billing_contact_nameState" @update:modelValue="setHandleChange_billing_contact_nameState" @change="handleChange_billing_contact_name" />
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-0-3" data-oods-component="Select" help="Choose the current status." label="Status" :options="[{'label':'Draft','value':'draft'},{'label':'Posted','value':'posted'},{'label':'Open','value':'open'},{'label':'Processing','value':'processing'},{'label':'Past Due','value':'past_due'},{'label':'Paid','value':'paid'},{'label':'Refunded','value':'refunded'},{'label':'Uncollectible','value':'uncollectible'},{'label':'Void','value':'void'}]" required :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp when the invoice was finalized or posted." label="Issued at" placeholder="Timestamp when the invoice was finalized or posted." required type="datetime-local" :modelValue="handleChange_issued_atState" @update:modelValue="setHandleChange_issued_atState" @change="handleChange_issued_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="ISO 4217 currency for the invoice." label="Currency" placeholder="Enter currency" required :modelValue="handleChange_currencyState" @update:modelValue="setHandleChange_currencyState" @change="handleChange_currency" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Dunning phase or retry program detail presented to success teams." label="Collection state" placeholder="Dunning phase or retry program detail presented to success teams." :modelValue="handleChange_collection_stateState" @update:modelValue="setHandleChange_collection_stateState" @change="handleChange_collection_state" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Number of automatic payment attempts made on this invoice (Stripe smart-retries attempt_count). Increments on each retry in the dunning window. Source: docs.stripe.com/billing/revenue-recovery/smart-retries." label="Attempt count" placeholder="Enter attempt count" type="number" :modelValue="handleChange_attempt_countState" @update:modelValue="setHandleChange_attempt_countState" @change="handleChange_attempt_count" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Number of days outstanding grouped for aging reports." label="Aging bucket days" placeholder="Enter aging bucket days" type="number" :modelValue="handleChange_aging_bucket_daysState" @update:modelValue="setHandleChange_aging_bucket_daysState" @change="handleChange_aging_bucket_days" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Link to customer facing refund or cancellation policy." label="Refund policy url" placeholder="Enter refund policy url" :modelValue="handleChange_refund_policy_urlState" @update:modelValue="setHandleChange_refund_policy_urlState" @change="handleChange_refund_policy_url" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Human readable invoice identifier presented to customers." label="Invoice number" placeholder="Enter invoice number" required :modelValue="handleChange_invoice_numberState" @update:modelValue="setHandleChange_invoice_numberState" @change="handleChange_invoice_number" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Total amount due expressed in minor currency units." label="Total minor" placeholder="Enter total minor" required type="number" :modelValue="handleChange_total_minorState" @update:modelValue="setHandleChange_total_minorState" @change="handleChange_total_minor" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Remaining amount outstanding in minor units." label="Balance minor" placeholder="Enter balance minor" type="number" :modelValue="handleChange_balance_minorState" @update:modelValue="setHandleChange_balance_minorState" @change="handleChange_balance_minor" />
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
import { Banner, Button, Input, Select, Stack } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  agingBucketDays?: number;
  attachments?: unknown[];
  attemptCount?: number;
  balanceMinor?: number;
  billingContactEmail?: string;
  billingContactName?: string;
  collectionState?: string;
  createdAt?: string;
  creditMemoBalanceMinor?: number;
  creditMemoType?: 'service_failure' | 'retention_incentive' | 'goodwill';
  currency?: string;
  discountMinor?: number;
  dueAt?: string;
  dunningStep?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  issuedAt?: string;
  lastEvent?: 'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off';
  lastEventAt?: string;
  lastRefundAt?: string;
  lastReminderAt?: string;
  lineItems?: unknown[];
  memo?: string;
  nextPaymentAttempt?: string;
  notes?: string;
  paidAt?: string;
  paymentSource?: string;
  paymentTerms?: 'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45';
  portalUrl?: string;
  provider?: string;
  providerInvoiceId?: string;
  providerStatus?: string;
  refundPolicyUrl?: string;
  refundableUntil?: string;
  requiresManagerApproval?: boolean;
  status?: 'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void';
  subscriptionId?: string;
  subtotalMinor?: number;
  taxMinor?: number;
  totalMinor?: number;
  totalRefundedMinor?: number;
  updatedAt?: string;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Number of days outstanding grouped for aging reports. */
const agingBucketDays = ref<number>(generatedProps.agingBucketDays ?? 0);
/** Supporting documents or credit memos associated with the invoice. */
const attachments = ref<unknown[]>(generatedProps.attachments ?? []);
/** Number of automatic payment attempts made on this invoice (Stripe smart-retries attempt_count). Increments on each retry in the dunning window. Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
const attemptCount = ref<number>(generatedProps.attemptCount ?? 0);
/** Remaining amount outstanding in minor units. */
const balanceMinor = ref<number>(generatedProps.balanceMinor ?? 0);
/** Email address for the billing contact. */
const billingContactEmail = ref<string>(generatedProps.billingContactEmail ?? '');
/** Customer billing contact receiving the invoice. */
const billingContactName = ref<string>(generatedProps.billingContactName ?? '');
/** Dunning phase or retry program detail presented to success teams. */
const collectionState = ref<string>(generatedProps.collectionState ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Remaining credit memo balance that can be applied to invoices. */
const creditMemoBalanceMinor = ref<number>(generatedProps.creditMemoBalanceMinor ?? 0);
/** Category of credit memo tied to business justification. */
const creditMemoType = ref<'service_failure' | 'retention_incentive' | 'goodwill'>(generatedProps.creditMemoType ?? 'service_failure');
/** ISO 4217 currency for the invoice. */
const currency = ref<string>(generatedProps.currency ?? '');
/** Total discounts applied to the invoice in minor units. */
const discountMinor = ref<number>(generatedProps.discountMinor ?? 0);
/** Payment due timestamp derived from payment terms. */
const dueAt = ref<string>(generatedProps.dueAt ?? '');
/** Current dunning playbook step label (ex: reminder_1, reminder_final, collections). The structured retry window (attempt_count + next_payment_attempt) is provided by the composed SaaSBillingPayable trait; this field is the human-readable step name. */
const dunningStep = ref<string>(generatedProps.dunningStep ?? '');
/** Primary identifier for the invoice inside the billing domain. */
const invoiceId = ref<string>(generatedProps.invoiceId ?? '');
/** Human readable invoice identifier presented to customers. */
const invoiceNumber = ref<string>(generatedProps.invoiceNumber ?? '');
/** Timestamp when the invoice was finalized or posted. */
const issuedAt = ref<string>(generatedProps.issuedAt ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off'>(generatedProps.lastEvent ?? 'created');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Timestamp when the most recent refund was issued. */
const lastRefundAt = ref<string>(generatedProps.lastRefundAt ?? '');
/** Timestamp of most recent payment reminder issued to customer. */
const lastReminderAt = ref<string>(generatedProps.lastReminderAt ?? '');
/** Normalized line items with quantity, amount_minor, and description fields. */
const lineItems = ref<unknown[]>(generatedProps.lineItems ?? []);
/** Internal finance note or customer visible memo. */
const memo = ref<string>(generatedProps.memo ?? '');
/** When the next automatic payment retry is scheduled (Stripe smart-retries next_payment_attempt). Defines the open end of the retry window — modeled on the Refundable.refundable_until datetime-window precedent. Absent/null when no further attempts are scheduled (retries exhausted → invoice goes uncollectible, mirroring the subscription `unpaid` state). Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
const nextPaymentAttempt = ref<string>(generatedProps.nextPaymentAttempt ?? '');
/** Internal commentary about refund actions or policy exceptions. */
const notes = ref<string>(generatedProps.notes ?? '');
/** Timestamp when full payment cleared. */
const paidAt = ref<string>(generatedProps.paidAt ?? '');
/** Payment method used or expected (card, ach, wire). */
const paymentSource = ref<string>(generatedProps.paymentSource ?? '');
/** Payment term label describing when payment is expected. */
const paymentTerms = ref<'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45'>(generatedProps.paymentTerms ?? 'due_upon_receipt');
/** Link to the hosted invoice or customer billing portal. */
const portalUrl = ref<string>(generatedProps.portalUrl ?? '');
/** Source system providing invoice data. */
const provider = ref<string>(generatedProps.provider ?? '');
/** Native provider identifier retained for audit trails. */
const providerInvoiceId = ref<string>(generatedProps.providerInvoiceId ?? '');
/** Original provider reported status or badge. */
const providerStatus = ref<string>(generatedProps.providerStatus ?? '');
/** Link to customer facing refund or cancellation policy. */
const refundPolicyUrl = ref<string>(generatedProps.refundPolicyUrl ?? '');
/** Date when refund eligibility window ends for this record. */
const refundableUntil = ref<string>(generatedProps.refundableUntil ?? '');
/** Indicates if finance manager approval is required before issuing refund. */
const requiresManagerApproval = ref<boolean>(generatedProps.requiresManagerApproval ?? false);
/** Canonical invoice status after provider mapping. */
const status = ref<'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void'>(generatedProps.status ?? 'draft');
/** Subscription identifier this invoice is associated with. */
const subscriptionId = ref<string>(generatedProps.subscriptionId ?? '');
/** Subtotal before discounts and tax in minor units. */
const subtotalMinor = ref<number>(generatedProps.subtotalMinor ?? 0);
/** Tax amount collected on the invoice in minor currency units. */
const taxMinor = ref<number>(generatedProps.taxMinor ?? 0);
/** Total amount due expressed in minor currency units. */
const totalMinor = ref<number>(generatedProps.totalMinor ?? 0);
/** Cumulative amount refunded in minor currency units. */
const totalRefundedMinor = ref<number>(generatedProps.totalRefundedMinor ?? 0);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_aging_bucket_daysState = ref<string>(String(agingBucketDays.value ?? ''));
const setHandleChange_aging_bucket_daysState = (value: string) => { handleChange_aging_bucket_daysState.value = value; };
/* @oods-local-binding handleChange_aging_bucket_days */ const handleChange_aging_bucket_days = (value: string) => { setHandleChange_aging_bucket_daysState(value); };
const handleChange_attempt_countState = ref<string>(String(attemptCount.value ?? ''));
const setHandleChange_attempt_countState = (value: string) => { handleChange_attempt_countState.value = value; };
/* @oods-local-binding handleChange_attempt_count */ const handleChange_attempt_count = (value: string) => { setHandleChange_attempt_countState(value); };
const handleChange_balance_minorState = ref<string>(String(balanceMinor.value ?? ''));
const setHandleChange_balance_minorState = (value: string) => { handleChange_balance_minorState.value = value; };
/* @oods-local-binding handleChange_balance_minor */ const handleChange_balance_minor = (value: string) => { setHandleChange_balance_minorState(value); };
const handleChange_billing_contact_nameState = ref<string>(String(billingContactName.value ?? ''));
const setHandleChange_billing_contact_nameState = (value: string) => { handleChange_billing_contact_nameState.value = value; };
/* @oods-local-binding handleChange_billing_contact_name */ const handleChange_billing_contact_name = (value: string) => { setHandleChange_billing_contact_nameState(value); };
const handleChange_collection_stateState = ref<string>(String(collectionState.value ?? ''));
const setHandleChange_collection_stateState = (value: string) => { handleChange_collection_stateState.value = value; };
/* @oods-local-binding handleChange_collection_state */ const handleChange_collection_state = (value: string) => { setHandleChange_collection_stateState(value); };
const handleChange_currencyState = ref<string>(String(currency.value ?? ''));
const setHandleChange_currencyState = (value: string) => { handleChange_currencyState.value = value; };
/* @oods-local-binding handleChange_currency */ const handleChange_currency = (value: string) => { setHandleChange_currencyState(value); };
const handleChange_invoice_numberState = ref<string>(String(invoiceNumber.value ?? ''));
const setHandleChange_invoice_numberState = (value: string) => { handleChange_invoice_numberState.value = value; };
/* @oods-local-binding handleChange_invoice_number */ const handleChange_invoice_number = (value: string) => { setHandleChange_invoice_numberState(value); };
const handleChange_issued_atState = ref<string>(String(issuedAt.value ?? ''));
const setHandleChange_issued_atState = (value: string) => { handleChange_issued_atState.value = value; };
/* @oods-local-binding handleChange_issued_at */ const handleChange_issued_at = (value: string) => { setHandleChange_issued_atState(value); };
const handleChange_refund_policy_urlState = ref<string>(String(refundPolicyUrl.value ?? ''));
const setHandleChange_refund_policy_urlState = (value: string) => { handleChange_refund_policy_urlState.value = value; };
/* @oods-local-binding handleChange_refund_policy_url */ const handleChange_refund_policy_url = (value: string) => { setHandleChange_refund_policy_urlState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_total_minorState = ref<string>(String(totalMinor.value ?? ''));
const setHandleChange_total_minorState = (value: string) => { handleChange_total_minorState.value = value; };
/* @oods-local-binding handleChange_total_minor */ const handleChange_total_minor = (value: string) => { setHandleChange_total_minorState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
