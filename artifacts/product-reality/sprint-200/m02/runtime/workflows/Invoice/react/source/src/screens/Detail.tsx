import React from 'react';
import { Banner, BillingSummaryBadge, Card, DetailHeader, Stack, Tabs, Text, VizMarkPreview } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

export interface PageProps {
  svg?: string;
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
type BillingSummaryBadgeProps = React.ComponentPropsWithoutRef<typeof BillingSummaryBadge>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;
type VizMarkPreviewProps = React.ComponentPropsWithoutRef<typeof VizMarkPreview>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, agingBucketDays, attachments, attemptCount, balanceMinor, billingContactEmail, billingContactName, collectionState, createdAt, creditMemoBalanceMinor, creditMemoType, currency, discountMinor, dueAt, dunningStep, invoiceId, invoiceNumber, issuedAt, lastEvent, lastEventAt, lastRefundAt, lastReminderAt, lineItems, memo, nextPaymentAttempt, notes, paidAt, paymentSource, paymentTerms, portalUrl, provider, providerInvoiceId, providerStatus, refundPolicyUrl, refundableUntil, requiresManagerApproval, status, subscriptionId, subtotalMinor, taxMinor, totalMinor, totalRefundedMinor, updatedAt, svg }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

  return (
    <>
      <>
        <Stack id="detail-screen" data-oods-component="Stack">
              {uiState === 'loading' && (
                <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
              )}
              {uiState === 'empty' && (
                <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
              )}
              {uiState === 'error' && (
                <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
              )}
              {uiState === 'success' && (
                <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-primary-header-25" data-oods-component="DetailHeader" title={invoiceId} level={2} />
                                              <VizMarkPreview id="detail-ve-header-24" data-oods-component="VizMarkPreview" svg={svg ?? "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"730\" height=\"410\" viewBox=\"0 0 730 410\"><rect width=\"730\" height=\"410\" fill=\"#F9FAFC\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(83,38)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h642v265h-642Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,265)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,177)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,88)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,221)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,133)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,44)\" x2=\"642\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Line item' for a discrete scale with 1 value: Scale plan\"><g transform=\"translate(0.5,265.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(321,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(320.5,7) rotate(270) translate(0,3)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Scale plan</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"642\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(321,100)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">Line item</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'Amount (minor units)' for a linear scale with values from 0 to 300,000\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,265)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,177)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,88)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,0)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,221)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,133)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,44)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,268)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,179.66666666666669)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">100,000</text><text text-anchor=\"end\" transform=\"translate(-7,91.33333333333334)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">200,000</text><text text-anchor=\"end\" transform=\"translate(-7,3)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">300,000</text><text text-anchor=\"end\" transform=\"translate(-7,223.83333333333334)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">50,000</text><text text-anchor=\"end\" transform=\"translate(-7,135.5)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">150,000</text><text text-anchor=\"end\" transform=\"translate(-7,47.16666666666666)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">250,000</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,265)\" x2=\"0\" y2=\"-265\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-67,132.5) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">Amount (minor units)</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-rect role-mark marks\" role=\"graphics-object\" aria-roledescription=\"rect mark container\"><path aria-label=\"Line item: Scale plan; Amount (minor units): 284000\" role=\"graphics-symbol\" aria-roledescription=\"bar\" d=\"M32.099999999999966,14.133333333333336h577.8000000000001v250.86666666666667h-577.8000000000001Z\" fill=\"#580918\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-78.00000000000001,-33)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Invoice line item amounts'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"#1A1D23\" opacity=\"1\">Invoice line item amounts</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>"} description="Line-item amounts in minor currency units; matching descriptions are summed." height={400} title="Invoice line item amounts" width={720} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tabs-9-read-fields","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tabs-9-read-fields" data-oods-component="Stack">
                                        <Stack id="detail-detail-tabs-9-total_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-total_minor-label" data-oods-component="Text" as="strong" content="Total" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-total_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={totalMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-balance_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-balance_minor-label" data-oods-component="Text" as="strong" content="Balance" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-balance_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={balanceMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-total_refunded_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-total_refunded_minor-label" data-oods-component="Text" as="strong" content="Total refunded" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-total_refunded_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={totalRefundedMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-credit_memo_balance_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-credit_memo_balance_minor-label" data-oods-component="Text" as="strong" content="Credit memo balance" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-credit_memo_balance_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={creditMemoBalanceMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                            <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{formatReadOnlyValue(lastEvent, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                            <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{formatReadOnlyValue(lastEventAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-subscription_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-subscription_id-label" data-oods-component="Text" as="strong" content="Subscription id" />
                                            <Text id="detail-detail-tabs-9-subscription_id-value" data-oods-component="Text">{formatReadOnlyValue(subscriptionId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-provider-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-provider-label" data-oods-component="Text" as="strong" content="Provider" />
                                            <Text id="detail-detail-tabs-9-provider-value" data-oods-component="Text">{formatReadOnlyValue(provider, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-provider_invoice_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-provider_invoice_id-label" data-oods-component="Text" as="strong" content="Provider invoice id" />
                                            <Text id="detail-detail-tabs-9-provider_invoice_id-value" data-oods-component="Text">{formatReadOnlyValue(providerInvoiceId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-billing_contact_name-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-billing_contact_name-label" data-oods-component="Text" as="strong" content="Billing contact name" />
                                            <Text id="detail-detail-tabs-9-billing_contact_name-value" data-oods-component="Text">{formatReadOnlyValue(billingContactName, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-billing_contact_email-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-billing_contact_email-label" data-oods-component="Text" as="strong" content="Billing contact email" />
                                            <Text id="detail-detail-tabs-9-billing_contact_email-value" data-oods-component="Text">{formatReadOnlyValue(billingContactEmail, "email", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-tax_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-tax_minor-label" data-oods-component="Text" as="strong" content="Tax" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-tax_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={taxMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-discount_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-discount_minor-label" data-oods-component="Text" as="strong" content="Discount" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-discount_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={discountMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-subtotal_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-subtotal_minor-label" data-oods-component="Text" as="strong" content="Subtotal" />
                                            <BillingSummaryBadge id="detail-detail-tabs-9-subtotal_minor-value" data-oods-component="BillingSummaryBadge" minorUnits={100} showInterval={false} amount={subtotalMinor} currency={currency} />
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-portal_url-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-portal_url-label" data-oods-component="Text" as="strong" content="Portal url" />
                                            <Text id="detail-detail-tabs-9-portal_url-value" data-oods-component="Text">{formatReadOnlyValue(portalUrl, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-dunning_step-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-dunning_step-label" data-oods-component="Text" as="strong" content="Dunning step" />
                                            <Text id="detail-detail-tabs-9-dunning_step-value" data-oods-component="Text">{formatReadOnlyValue(dunningStep, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-payment_source-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-payment_source-label" data-oods-component="Text" as="strong" content="Payment source" />
                                            <Text id="detail-detail-tabs-9-payment_source-value" data-oods-component="Text">{formatReadOnlyValue(paymentSource, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Stack id="detail-pg-status-timeline-27-read-field" data-oods-component="Stack">
                                                  <Text id="detail-pg-status-timeline-27-label" data-oods-component="Text" as="strong" content="Status" />
                                                  <Text id="detail-pg-status-timeline-27-value" data-oods-component="Text">{formatReadOnlyValue(status, "string", true)}</Text>
                                                </Stack>
                                            <Stack id="detail-pg-status-timeline-28-read-field" data-oods-component="Stack">
                                                  <Text id="detail-pg-status-timeline-28-label" data-oods-component="Text" as="strong" content="Updated at" />
                                                  <Text id="detail-pg-status-timeline-28-value" data-oods-component="Text">{formatReadOnlyValue(updatedAt, "datetime", false)}</Text>
                                                </Stack>
                                          </Stack>
                                        <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Created at" />
                                            <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
                                          </Stack>
                                      </Stack>
                                    ) }
                                  ]} />
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
