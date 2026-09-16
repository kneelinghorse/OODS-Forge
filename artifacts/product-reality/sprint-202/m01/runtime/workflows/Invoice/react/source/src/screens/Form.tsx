import React from 'react';
import { Banner, Button, Input, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Number of days outstanding grouped for aging reports. */
  agingBucketDays?: number;
  /** Supporting documents or credit memos associated with the invoice. */
  attachments?: unknown[];
  /** Number of automatic payment attempts made on this invoice (Stripe smart-retries attempt_count). Increments on each retry in the dunning window. Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
  attemptCount?: number;
  /** Remaining amount outstanding in minor units. */
  balanceMinor?: number;
  /** Email address for the billing contact. */
  billingContactEmail?: string;
  /** Customer billing contact receiving the invoice. */
  billingContactName?: string;
  /** Dunning phase or retry program detail presented to success teams. */
  collectionState?: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Remaining credit memo balance that can be applied to invoices. */
  creditMemoBalanceMinor?: number;
  /** Category of credit memo tied to business justification. */
  creditMemoType?: 'service_failure' | 'retention_incentive' | 'goodwill';
  /** ISO 4217 currency for the invoice. */
  currency: string;
  /** Total discounts applied to the invoice in minor units. */
  discountMinor?: number;
  /** Payment due timestamp derived from payment terms. */
  dueAt?: string;
  /** Current dunning playbook step label (ex: reminder_1, reminder_final, collections). The structured retry window (attempt_count + next_payment_attempt) is provided by the composed SaaSBillingPayable trait; this field is the human-readable step name. */
  dunningStep?: string;
  /** Primary identifier for the invoice inside the billing domain. */
  invoiceId: string;
  /** Human readable invoice identifier presented to customers. */
  invoiceNumber: string;
  /** Timestamp when the invoice was finalized or posted. */
  issuedAt: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp when the most recent refund was issued. */
  lastRefundAt?: string;
  /** Timestamp of most recent payment reminder issued to customer. */
  lastReminderAt?: string;
  /** Normalized line items with quantity, amount_minor, and description fields. */
  lineItems?: unknown[];
  /** Internal finance note or customer visible memo. */
  memo?: string;
  /** When the next automatic payment retry is scheduled (Stripe smart-retries next_payment_attempt). Defines the open end of the retry window — modeled on the Refundable.refundable_until datetime-window precedent. Absent/null when no further attempts are scheduled (retries exhausted → invoice goes uncollectible, mirroring the subscription `unpaid` state). Source: docs.stripe.com/billing/revenue-recovery/smart-retries. */
  nextPaymentAttempt?: string;
  /** Internal commentary about refund actions or policy exceptions. */
  notes?: string;
  /** Timestamp when full payment cleared. */
  paidAt?: string;
  /** Payment method used or expected (card, ach, wire). */
  paymentSource?: string;
  /** Payment term label describing when payment is expected. */
  paymentTerms?: 'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45';
  /** Link to the hosted invoice or customer billing portal. */
  portalUrl?: string;
  /** Source system providing invoice data. */
  provider: string;
  /** Native provider identifier retained for audit trails. */
  providerInvoiceId?: string;
  /** Original provider reported status or badge. */
  providerStatus?: string;
  /** Link to customer facing refund or cancellation policy. */
  refundPolicyUrl?: string;
  /** Date when refund eligibility window ends for this record. */
  refundableUntil?: string;
  /** Indicates if finance manager approval is required before issuing refund. */
  requiresManagerApproval?: boolean;
  /** Canonical invoice status after provider mapping. */
  status: 'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void';
  /** Subscription identifier this invoice is associated with. */
  subscriptionId: string;
  /** Subtotal before discounts and tax in minor units. */
  subtotalMinor?: number;
  /** Tax amount collected on the invoice in minor currency units. */
  taxMinor?: number;
  /** Total amount due expressed in minor currency units. */
  totalMinor: number;
  /** Cumulative amount refunded in minor currency units. */
  totalRefundedMinor?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, agingBucketDays, attachments, attemptCount, balanceMinor, billingContactEmail, billingContactName, collectionState, createdAt, creditMemoBalanceMinor, creditMemoType, currency, discountMinor, dueAt, dunningStep, invoiceId, invoiceNumber, issuedAt, lastEvent, lastEventAt, lastRefundAt, lastReminderAt, lineItems, memo, nextPaymentAttempt, notes, paidAt, paymentSource, paymentTerms, portalUrl, provider, providerInvoiceId, providerStatus, refundPolicyUrl, refundableUntil, requiresManagerApproval, status, subscriptionId, subtotalMinor, taxMinor, totalMinor, totalRefundedMinor, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_aging_bucket_daysState, setHandleChange_aging_bucket_daysState] = React.useState<string>(String(agingBucketDays ?? ''));
  /* @oods-local-binding handleChange_aging_bucket_days */ const handleChange_aging_bucket_days = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_aging_bucket_daysState(event.currentTarget.value); };
  const [handleChange_attempt_countState, setHandleChange_attempt_countState] = React.useState<string>(String(attemptCount ?? ''));
  /* @oods-local-binding handleChange_attempt_count */ const handleChange_attempt_count = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_attempt_countState(event.currentTarget.value); };
  const [handleChange_balance_minorState, setHandleChange_balance_minorState] = React.useState<string>(String(balanceMinor ?? ''));
  /* @oods-local-binding handleChange_balance_minor */ const handleChange_balance_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_balance_minorState(event.currentTarget.value); };
  const [handleChange_collection_stateState, setHandleChange_collection_stateState] = React.useState<string>(String(collectionState ?? ''));
  /* @oods-local-binding handleChange_collection_state */ const handleChange_collection_state = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_collection_stateState(event.currentTarget.value); };
  const [handleChange_currencyState, setHandleChange_currencyState] = React.useState<string>(String(currency ?? ''));
  /* @oods-local-binding handleChange_currency */ const handleChange_currency = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_currencyState(event.currentTarget.value); };
  const [handleChange_invoice_numberState, setHandleChange_invoice_numberState] = React.useState<string>(String(invoiceNumber ?? ''));
  /* @oods-local-binding handleChange_invoice_number */ const handleChange_invoice_number = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_invoice_numberState(event.currentTarget.value); };
  const [handleChange_issued_atState, setHandleChange_issued_atState] = React.useState<string>(String(issuedAt ?? ''));
  /* @oods-local-binding handleChange_issued_at */ const handleChange_issued_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_issued_atState(event.currentTarget.value); };
  const [handleChange_refund_policy_urlState, setHandleChange_refund_policy_urlState] = React.useState<string>(String(refundPolicyUrl ?? ''));
  /* @oods-local-binding handleChange_refund_policy_url */ const handleChange_refund_policy_url = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_refund_policy_urlState(event.currentTarget.value); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
  const [handleChange_total_minorState, setHandleChange_total_minorState] = React.useState<string>(String(totalMinor ?? ''));
  /* @oods-local-binding handleChange_total_minor */ const handleChange_total_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_total_minorState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <Stack id="form-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                      <Input id="form-form-title-1" data-oods-component="Input" help="Customer billing contact receiving the invoice." label="Billing contact name" placeholder="Customer billing contact receiving the invoice." value={billingContactName} />
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-0-3" data-oods-component="Select" help="Choose the current status." label="Status" options={[{"label":"Draft","value":"draft"},{"label":"Posted","value":"posted"},{"label":"Open","value":"open"},{"label":"Processing","value":"processing"},{"label":"Past Due","value":"past_due"},{"label":"Paid","value":"paid"},{"label":"Refunded","value":"refunded"},{"label":"Uncollectible","value":"uncollectible"},{"label":"Void","value":"void"}]} required value={handleChange_statusState} onChange={handleChange_status} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp when the invoice was finalized or posted." label="Issued at" placeholder="Timestamp when the invoice was finalized or posted." required type="datetime-local" value={handleChange_issued_atState} onChange={handleChange_issued_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="ISO 4217 currency for the invoice." label="Currency" placeholder="Enter currency" required value={handleChange_currencyState} onChange={handleChange_currency} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Dunning phase or retry program detail presented to success teams." label="Collection state" placeholder="Dunning phase or retry program detail presented to success teams." value={handleChange_collection_stateState} onChange={handleChange_collection_state} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Number of automatic payment attempts made on this invoice (Stripe smart-retries attempt_count). Increments on each retry in the dunning window. Source: docs.stripe.com/billing/revenue-recovery/smart-retries." label="Attempt count" placeholder="Enter attempt count" type="number" value={handleChange_attempt_countState} onChange={handleChange_attempt_count} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Number of days outstanding grouped for aging reports." label="Aging bucket days" placeholder="Enter aging bucket days" type="number" value={handleChange_aging_bucket_daysState} onChange={handleChange_aging_bucket_days} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Link to customer facing refund or cancellation policy." label="Refund policy url" placeholder="Enter refund policy url" value={handleChange_refund_policy_urlState} onChange={handleChange_refund_policy_url} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Human readable invoice identifier presented to customers." label="Invoice number" placeholder="Enter invoice number" required value={handleChange_invoice_numberState} onChange={handleChange_invoice_number} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Total amount due expressed in minor currency units." label="Total minor" placeholder="Enter total minor" required type="number" value={handleChange_total_minorState} onChange={handleChange_total_minor} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Remaining amount outstanding in minor units." label="Balance minor" placeholder="Enter balance minor" type="number" value={handleChange_balance_minorState} onChange={handleChange_balance_minor} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                                <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
