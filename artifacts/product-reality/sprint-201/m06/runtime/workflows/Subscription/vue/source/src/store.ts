import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
import { chartSvgByRecord } from './chart-assets';

export type DomainRecord = {
  "status": 'future' | 'trialing' | 'active' | 'paused' | 'pending_cancellation' | 'past_due' | 'unpaid' | 'terminated';
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "cancel_at_period_end": boolean;
  "cancellation_reason"?: string;
  "cancellation_reason_code"?: string;
  "cancellation_requested_at"?: string;
  "created_at": string;
  "updated_at"?: string;
  "last_event": 'billing_cycle_started' | 'billing_cycle_completed' | 'payment_received' | 'cancellation_requested';
  "last_event_at"?: string;
  "amount": number;
  "currency": string;
  "billing_interval"?: string;
  "payment_status"?: 'pending' | 'succeeded' | 'failed' | 'retrying' | 'refunded';
  "payment_method_type"?: 'card' | 'ach' | 'wire' | 'invoice' | 'other';
  "proration_amount"?: number;
  "proration_date"?: number;
  "last_payment_at"?: string;
  "next_payment_due_at"?: string;
  "current_period_start": string;
  "current_period_end": string;
  "current_period_progress"?: number;
  "is_archived": boolean;
  "archived_at"?: string | null;
  "restored_at"?: string | null;
  "archive_reason"?: string;
  "archived_by"?: string;
  "archive_metadata"?: Record<string, unknown>;
  "restoration_metadata"?: Record<string, unknown>;
  "subscription_id": string;
  "plan_name": string;
  "plan_code"?: string;
  "plan_interval"?: string;
  "customer_name"?: string;
  "customer_email"?: string;
  payment_history: Array<{ at: string; amount: number }>;
};

export const idField = "subscription_id" as const;
export const titleField = "plan_name" as const;
export const fieldLabels: Record<string, string> = {"status":"Status","state_history":"State history","allowed_transitions":"Allowed transitions","cancel_at_period_end":"Cancel at period end","cancellation_reason":"Cancellation reason","cancellation_reason_code":"Cancellation reason code","cancellation_requested_at":"Cancellation requested at","created_at":"Created at","updated_at":"Updated at","last_event":"Last event","last_event_at":"Last event at","amount":"Amount","currency":"Currency","billing_interval":"Billing interval","payment_status":"Payment status","payment_method_type":"Payment method type","proration_amount":"Proration amount","proration_date":"Proration date","last_payment_at":"Last payment at","next_payment_due_at":"Next payment due at","current_period_start":"Current period start","current_period_end":"Current period end","current_period_progress":"Current period progress","is_archived":"Is archived","archived_at":"Archived at","restored_at":"Restored at","archive_reason":"Archive reason","archived_by":"Archived by","archive_metadata":"Archive metadata","restoration_metadata":"Restoration metadata","subscription_id":"Subscription id","plan_name":"Plan name","plan_code":"Plan code","plan_interval":"Plan interval","customer_name":"Customer name","customer_email":"Customer email"};
export const fieldTypes: Record<string, string> = {"status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","cancel_at_period_end":"boolean","cancellation_reason":"string","cancellation_reason_code":"string","cancellation_requested_at":"datetime","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","amount":"integer","currency":"string","billing_interval":"string","payment_status":"string","payment_method_type":"string","proration_amount":"integer","proration_date":"integer","last_payment_at":"datetime","next_payment_due_at":"datetime","current_period_start":"datetime","current_period_end":"datetime","current_period_progress":"number","is_archived":"boolean","archived_at":"datetime?","restored_at":"datetime?","archive_reason":"string","archived_by":"string","archive_metadata":"object","restoration_metadata":"object","subscription_id":"string","plan_name":"string","plan_code":"string","plan_interval":"string","customer_name":"string","customer_email":"email"};
export const traits: readonly string[] = ["Stateful","Cancellable","Timestampable","Billable","Archivable","MarkArea"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  status: record["status"],
  stateHistory: record["state_history"],
  allowedTransitions: record["allowed_transitions"],
  cancelAtPeriodEnd: record["cancel_at_period_end"],
  cancellationReason: record["cancellation_reason"],
  cancellationReasonCode: record["cancellation_reason_code"],
  cancellationRequestedAt: record["cancellation_requested_at"],
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  amount: record["amount"],
  currency: record["currency"],
  billingInterval: record["billing_interval"],
  paymentStatus: record["payment_status"],
  paymentMethodType: record["payment_method_type"],
  prorationAmount: record["proration_amount"],
  prorationDate: record["proration_date"],
  lastPaymentAt: record["last_payment_at"],
  nextPaymentDueAt: record["next_payment_due_at"],
  currentPeriodStart: record["current_period_start"],
  currentPeriodEnd: record["current_period_end"],
  currentPeriodProgress: record["current_period_progress"],
  isArchived: record["is_archived"],
  archivedAt: record["archived_at"],
  restoredAt: record["restored_at"],
  archiveReason: record["archive_reason"],
  archivedBy: record["archived_by"],
  archiveMetadata: record["archive_metadata"],
  restorationMetadata: record["restoration_metadata"],
  subscriptionId: record["subscription_id"],
  planName: record["plan_name"],
  planCode: record["plan_code"],
  planInterval: record["plan_interval"],
  customerName: record["customer_name"],
  customerEmail: record["customer_email"],
  svg: chartSvgByRecord[String(record[idField])],
  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  return recordCollectionEvents(record, {"historyField":"state_history","payments":[{"field":"last_payment_at","title":"Last payment"},{"field":"next_payment_due_at","title":"Next payment"}],"minorUnits":100});
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
  // A saved edit is history: the record's state history gains an entry naming the changed fields.
  const update = (record: DomainRecord) => {
    const previous = records.find((entry) => entry[idField] === record[idField]);
    if (!previous) throw new Error('Cannot save a missing record');
    const values = record as Record<string, unknown>;
    const before = previous as Record<string, unknown>;
    const changed = Object.keys(values).filter((name) => Object.hasOwn(fieldTypes, name) && name !== 'state_history' && name !== 'updated_at' && JSON.stringify(values[name]) !== JSON.stringify(before[name]));
    if (changed.length === 0) return save(record);
    const at = now();
    const next = structuredClone(record);
    const target = next as Record<string, unknown>;
    if (Object.hasOwn(fieldTypes, 'updated_at')) target.updated_at = at;
    if (Object.hasOwn(fieldTypes, 'state_history')) {
      const status = String(target.status ?? before.status ?? '');
      const moved = changed.includes('status');
      const entry: HistoryEntry = { title: moved ? String(status).split(/[_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : 'Updated', from: moved ? String(before.status ?? '') : null, to: status, at, reason: 'Edited ' + changed.map((name) => fieldLabels[name] ?? name).join(', ') };
      target.state_history = [...history(next), entry];
    }
    const events: readonly string[] = ["billing_cycle_started","billing_cycle_completed","payment_received","cancellation_requested"];
    const updateEvent = events.find((event) => /updat|edit|profile|chang/.test(event));
    if (updateEvent && Object.hasOwn(fieldTypes, 'last_event')) { target.last_event = updateEvent; if (Object.hasOwn(fieldTypes, 'last_event_at')) target.last_event_at = at; }
    return save(next);
  };
  const setArchived = (id: string, archived: boolean) => {
    requireTrait('Archivable');
    const record = get(id);
    Object.assign(record, { is_archived: archived, archived_at: archived ? now() : null });
    return save(record);
  };
  return {
    get, save, update,
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
      const states: readonly string[] = ["future","trialing","active","paused","pending_cancellation","past_due","unpaid","terminated"];
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
