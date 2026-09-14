import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
import { chartSvgByRecord } from './chart-assets';

export type DomainRecord = {
  "invoice_number": string;
  "status": 'draft' | 'posted' | 'open' | 'processing' | 'past_due' | 'paid' | 'refunded' | 'uncollectible' | 'void';
  "provider_status"?: string;
  "issued_at": string;
  "due_at"?: string;
  "paid_at"?: string;
  "total_minor": number;
  "balance_minor"?: number;
  "currency": string;
  "payment_terms"?: 'due_upon_receipt' | 'net_15' | 'net_30' | 'net_45';
  "collection_state"?: string;
  "last_reminder_at"?: string;
  "aging_bucket_days"?: number;
  "attempt_count"?: number;
  "next_payment_attempt"?: string;
  "memo"?: string;
  "refundable_until"?: string;
  "refund_policy_url"?: string;
  "total_refunded_minor"?: number;
  "credit_memo_balance_minor"?: number;
  "credit_memo_type"?: 'service_failure' | 'retention_incentive' | 'goodwill';
  "last_refund_at"?: string;
  "requires_manager_approval"?: boolean;
  "notes"?: string;
  "created_at": string;
  "updated_at"?: string;
  "last_event": 'created' | 'posted' | 'payment_initiated' | 'payment_cleared' | 'payment_failed' | 'voided' | 'written_off';
  "last_event_at"?: string;
  "invoice_id": string;
  "subscription_id": string;
  "provider": string;
  "provider_invoice_id"?: string;
  "billing_contact_name"?: string;
  "billing_contact_email"?: string;
  "tax_minor"?: number;
  "discount_minor"?: number;
  "subtotal_minor"?: number;
  "line_items"?: unknown[];
  "attachments"?: unknown[];
  "portal_url"?: string;
  "dunning_step"?: string;
  "payment_source"?: string;
};

export const idField = "invoice_id" as const;
export const titleField = "invoice_id" as const;
export const fieldTypes: Record<string, string> = {"invoice_number":"string","status":"string","provider_status":"string","issued_at":"datetime","due_at":"datetime","paid_at":"datetime","total_minor":"integer","balance_minor":"integer","currency":"string","payment_terms":"string","collection_state":"string","last_reminder_at":"datetime","aging_bucket_days":"integer","attempt_count":"integer","next_payment_attempt":"datetime","memo":"string","refundable_until":"datetime","refund_policy_url":"string","total_refunded_minor":"integer","credit_memo_balance_minor":"integer","credit_memo_type":"string","last_refund_at":"datetime","requires_manager_approval":"boolean","notes":"string","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","invoice_id":"string","subscription_id":"string","provider":"string","provider_invoice_id":"string","billing_contact_name":"string","billing_contact_email":"email","tax_minor":"integer","discount_minor":"integer","subtotal_minor":"integer","line_items":"InvoiceLineItem[]","attachments":"AssetReference[]","portal_url":"string","dunning_step":"string","payment_source":"string"};
export const traits: readonly string[] = ["SaaSBillingPayable","SaaSBillingRefundable","Timestampable","MarkBar"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  invoiceNumber: record["invoice_number"],
  status: record["status"],
  providerStatus: record["provider_status"],
  issuedAt: record["issued_at"],
  dueAt: record["due_at"],
  paidAt: record["paid_at"],
  totalMinor: record["total_minor"],
  balanceMinor: record["balance_minor"],
  currency: record["currency"],
  paymentTerms: record["payment_terms"],
  collectionState: record["collection_state"],
  lastReminderAt: record["last_reminder_at"],
  agingBucketDays: record["aging_bucket_days"],
  attemptCount: record["attempt_count"],
  nextPaymentAttempt: record["next_payment_attempt"],
  memo: record["memo"],
  refundableUntil: record["refundable_until"],
  refundPolicyUrl: record["refund_policy_url"],
  totalRefundedMinor: record["total_refunded_minor"],
  creditMemoBalanceMinor: record["credit_memo_balance_minor"],
  creditMemoType: record["credit_memo_type"],
  lastRefundAt: record["last_refund_at"],
  requiresManagerApproval: record["requires_manager_approval"],
  notes: record["notes"],
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  invoiceId: record["invoice_id"],
  subscriptionId: record["subscription_id"],
  provider: record["provider"],
  providerInvoiceId: record["provider_invoice_id"],
  billingContactName: record["billing_contact_name"],
  billingContactEmail: record["billing_contact_email"],
  taxMinor: record["tax_minor"],
  discountMinor: record["discount_minor"],
  subtotalMinor: record["subtotal_minor"],
  lineItems: record["line_items"],
  attachments: record["attachments"],
  portalUrl: record["portal_url"],
  dunningStep: record["dunning_step"],
  paymentSource: record["payment_source"],
  svg: chartSvgByRecord[String(record[idField])],
  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  return recordCollectionEvents(record, {"payments":[],"minorUnits":100});
}
export function createStore(options: StoreOptions = {}) {
  let records = structuredClone(options.seed ?? (options.empty ? [] : sampleData));
  let fail = options.fail ?? false;
  const now = options.now ?? (() => new Date().toISOString());
  const requireTrait = (trait: string) => { if (!traits.includes(trait)) throw new Error('Object does not support ' + trait); };
  const get = (id: string) => {
    const record = records.find((entry) => String(entry[idField]) === id);
    if (!record) throw new Error('Record not found: ' + id);
    return structuredClone(record);
  };
  const save = (record: DomainRecord) => {
    const index = records.findIndex((entry) => entry[idField] === record[idField]);
    if (index < 0) throw new Error('Cannot save a missing record');
    records[index] = structuredClone(record);
    return get(String(record[idField]));
  };
  const setArchived = (id: string, archived: boolean) => {
    requireTrait('Archivable');
    const record = get(id);
    Object.assign(record, { is_archived: archived, archived_at: archived ? now() : null });
    return save(record);
  };
  return {
    get, save,
    async ready() {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, options.latency ?? 180)));
      if (fail) throw new Error('Simulated data service failure');
    },
    setFailure(value: boolean) { fail = value; },
    list(query: ListQuery = {}) {
      const search = (query.search ?? '').trim().toLowerCase();
      const filtered = records.filter((record) => {
        const values = record as Record<string, unknown>;
        return Boolean(values.is_archived) === (query.archived ?? false)
          && (!query.status || values.status === query.status)
          && (!search || Object.values(record).some((value) => String(value).toLowerCase().includes(search)));
      });
      const sort = query.sort ?? titleField;
      filtered.sort((a, b) => {
        const left = a[sort]; const right = b[sort];
        const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
        return (query.descending ? -1 : 1) * order;
      });
      const pageSize = Math.max(1, Math.floor(query.pageSize ?? 10));
      const page = Math.max(1, Math.floor(query.page ?? 1));
      return { total: filtered.length, page, pageSize, records: structuredClone(filtered.slice((page - 1) * pageSize, page * pageSize)) };
    },
    cancel(id: string, reason: string, code: string, atPeriodEnd: boolean) {
      requireTrait('Cancellable');
      const record = get(id);
      const values = record as Record<string, unknown>;
      const states: readonly string[] = ["draft","posted","open","processing","past_due","paid","refunded","uncollectible","void"];
      const immediate = states.includes('cancelled') && !states.includes('pending_cancellation');
      const target = immediate ? 'cancelled' : 'pending_cancellation';
      if (values.is_archived || values.status === 'terminated' || values.status === 'pending_cancellation' || (immediate && ['completed', 'cancelled', 'final'].includes(String(values.status)))) throw new Error('This record cannot be cancelled in its current state');
      
      const at = now();
      const deferred = target === 'pending_cancellation' && atPeriodEnd;
      const entry: HistoryEntry = { title: target === 'cancelled' ? 'Cancelled' : 'Pending Cancellation', from: String(values.status), to: target, at, reason: reason.trim(), code, atPeriodEnd: deferred };
      Object.assign(record, { status: target, cancellation_reason: reason.trim(), cancellation_reason_code: code, cancel_at_period_end: deferred, cancellation_requested_at: at, state_history: [...history(record), entry], updated_at: at });
      return save(record);
    },
    archive(id: string) { return setArchived(id, true); },
    restore(id: string) { return setArchived(id, false); },
  };
}
