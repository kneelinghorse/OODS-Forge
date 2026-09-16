import React from 'react';
import { Banner, Card, Stack, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface PageProps {
  events?: CollectionEvent[];
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
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ uiState, agingBucketDays, attachments, attemptCount, balanceMinor, billingContactEmail, billingContactName, collectionState, createdAt, creditMemoBalanceMinor, creditMemoType, currency, discountMinor, dueAt, dunningStep, invoiceId, invoiceNumber, issuedAt, lastEvent, lastEventAt, lastRefundAt, lastReminderAt, lineItems, memo, nextPaymentAttempt, notes, paidAt, paymentSource, paymentTerms, portalUrl, provider, providerInvoiceId, providerStatus, refundPolicyUrl, refundableUntil, requiresManagerApproval, status, subscriptionId, subtotalMinor, taxMinor, totalMinor, totalRefundedMinor, updatedAt, events = [] }) => {
  return (
    <>
      <Stack id="timeline-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{invoiceId}</Text>
                              </Stack>
                      <section id="timeline-timeline-entries-13" data-oods-collection="events">{events.length === 0 ? (<Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." />) : (<ol aria-label="Lifecycle history" className="oods-collection">{chronologicalEvents(events).map((collectionEvent, collectionIndex) => <li key={collectionEvent.id}><Card id={'timeline-timeline-entries-13-entry-' + collectionIndex}><strong>{collectionEvent.title}</strong><time dateTime={collectionEvent.at}>{formatDateTime(collectionEvent.at)}</time><p>{collectionEvent.description}</p></Card></li>)}</ol>)}</section>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
