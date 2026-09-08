import { formatBillingAmount } from './billing.js';

export interface BillingCycleValues {
  progress?: number;
  periodStart?: string;
  periodEnd?: string;
  interval?: string;
  now?: string;
}

/** Use an injected clock in deterministic consumers and SSR. Dates are UTC instants. */
export function billingCycle(values: BillingCycleValues) {
  const start = Date.parse(values.periodStart ?? '');
  const end = Date.parse(values.periodEnd ?? '');
  const now = values.now === undefined ? Date.now() : Date.parse(values.now);
  const ended = Number.isFinite(end) && Number.isFinite(now) && now >= end;
  const fraction = ended ? 1 : values.progress ?? (end > start && Number.isFinite(now) ? (now - start) / (end - start) : undefined);
  const percent = fraction === undefined || !Number.isFinite(fraction) ? undefined : Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  const remainingDays = Number.isFinite(end) && Number.isFinite(now) ? Math.max(0, Math.ceil((end - now) / 86_400_000)) : undefined;
  const announcement = `${percent === undefined ? 'Progress unavailable' : `${percent}% complete`} · ${remainingDays === undefined ? 'Remaining days unavailable' : `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} remaining`}`;
  return { percent, remainingDays, announcement, ended };
}

export interface BillingPaymentValues {
  lastPayment?: string;
  nextPayment?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  minorUnits?: number;
}

export const NO_NEXT_PAYMENT = 'No payment scheduled';
export const NO_LAST_PAYMENT = 'No previous payment';

export function billingDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

/** Both public payment IDs share this chronological value model. Undated terms follow dated events. */
export function billingPaymentRows(values: BillingPaymentValues) {
  const rows = [
    { kind: 'last', label: 'Last payment', at: values.lastPayment, empty: NO_LAST_PAYMENT },
    { kind: 'next', label: 'Next payment', at: values.nextPayment, empty: NO_NEXT_PAYMENT },
  ];
  return rows.map((row) => ({ ...row, at: row.at && Number.isFinite(Date.parse(row.at)) ? row.at : undefined }))
    .sort((a, b) => (a.at ? Date.parse(a.at) : Infinity) - (b.at ? Date.parse(b.at) : Infinity))
    .map((row) => ({ ...row, text: row.at ? billingDate(row.at) : row.empty }));
}

export function billingPaymentSummary(values: BillingPaymentValues): string {
  return `${formatBillingAmount(values.amount, values.currency, values.minorUnits)} ${(values.currency ?? 'usd').toUpperCase()} · ${(values.paymentStatus ?? 'pending').replaceAll('_', ' ')}`;
}

