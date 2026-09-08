import * as React from 'react';
import { billingCycle, billingPaymentRows, billingPaymentSummary, billingSummary, type BillingCycleValues, type BillingPaymentValues } from '@oods/component-contracts';

export interface CycleProgressCardProps extends BillingCycleValues { id?: string; title?: string }
export function CycleProgressCard({ id, title = 'Billing cycle', ...values }: CycleProgressCardProps) {
  const cycle = billingCycle(values);
  return <section id={id} className="oods-billing-cycle" data-oods-component="CycleProgressCard" aria-label={title}>
    <h3>{title}</h3><p>{cycle.announcement}</p>
    {cycle.percent !== undefined && <progress max={100} value={cycle.percent} aria-label={cycle.announcement} />}
    {values.interval && <p className="oods-billing-muted">{values.interval}</p>}
  </section>;
}

export interface PaymentTimelineProps extends BillingPaymentValues { id?: string; title?: string }
function BillingTimeline({ id, title, component, includeMethod, ...values }: PaymentTimelineProps & { component: string; includeMethod: boolean }) {
  const heading = title ?? (includeMethod ? 'Payments' : 'Payment events');
  return <section id={id} className="oods-payment-timeline" data-oods-component={component} role="log" aria-label={heading}>
    <h3>{heading}</h3><p>{billingPaymentSummary(values)}</p>
    {includeMethod && <p className="oods-billing-muted">{`Payment method: ${values.paymentMethod ?? 'Not provided'}`}</p>}
    <ol>{billingPaymentRows(values).map((row) => <li key={row.kind} data-payment-kind={row.kind}><strong>{row.label}</strong>{row.at ? <time dateTime={row.at}>{row.text}</time> : <span>{row.text}</span>}</li>)}</ol>
  </section>;
}
export function PaymentTimeline(props: PaymentTimelineProps) { return <BillingTimeline {...props} component="PaymentTimeline" includeMethod />; }
export type PaymentEventTimelineProps = Omit<PaymentTimelineProps, 'paymentMethod'>;
export function PaymentEventTimeline(props: PaymentEventTimelineProps) { return <BillingTimeline {...props} component="PaymentEventTimeline" includeMethod={false} />; }

export interface BillingCardMetaProps { id?: string; amount?: number; currency?: string; minorUnits?: number; interval?: string }
export function BillingCardMeta({ id, amount, currency, minorUnits, interval }: BillingCardMetaProps) {
  return <span id={id} className="oods-billing-card-meta" data-oods-component="BillingCardMeta">{billingSummary(amount, currency, minorUnits, interval)}</span>;
}

export interface ArchivedRowOverlayProps {
  id?: string; isArchived?: boolean; style?: 'grayed'; showBadge?: boolean; separateTab?: boolean; tabLabel?: string; label?: string; children?: React.ReactNode;
}
export function ArchivedRowOverlay({ id, isArchived = false, showBadge = true, separateTab = true, tabLabel = 'Archived', label, children }: ArchivedRowOverlayProps) {
  return <span id={id} className="oods-archived-row" data-oods-component="ArchivedRowOverlay" data-archived={isArchived ? 'true' : undefined}
    data-archive-tab={separateTab ? tabLabel : undefined} role={isArchived ? 'group' : undefined} aria-hidden={isArchived ? false : undefined} aria-label={isArchived ? `${tabLabel}${label ? `: ${label}` : ''}` : undefined}>
    {children}{isArchived && showBadge && <span className="oods-archive-badge">{tabLabel}</span>}
  </span>;
}
