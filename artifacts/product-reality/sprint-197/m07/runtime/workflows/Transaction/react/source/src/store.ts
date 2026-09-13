import { chronologicalEvents, billingSummary, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "status": string;
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at": string;
  "updated_at"?: string;
  "last_event": string;
  "last_event_at"?: string;
  "unit_amount_cents": number;
  "currency": string;
  "pricing_model": string;
  "billing_interval"?: string;
  "tax_behavior": 'exclusive' | 'inclusive';
  "cancel_at_period_end": boolean;
  "cancellation_reason"?: string;
  "cancellation_reason_code"?: string;
  "cancellation_requested_at"?: string;
  "is_archived": boolean;
  "archived_at"?: string | null;
  "restored_at"?: string | null;
  "archive_reason"?: string;
  "archived_by"?: string;
  "archive_metadata"?: Record<string, unknown>;
  "restoration_metadata"?: Record<string, unknown>;
  "transaction_id": string;
  "user_id": string;
  "organization_id"?: string;
  "occurred_at": string;
  "payment_method": 'card' | 'bank_transfer' | 'digital_wallet' | 'invoice';
  "channel": 'online' | 'in_app' | 'point_of_sale' | 'partner';
  "payment_reference"?: string;
  "risk_score"?: number;
};

export const idField = "transaction_id" as const;
export const titleField = "transaction_id" as const;
export const fieldTypes: Record<string, string> = {"status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","unit_amount_cents":"number","currency":"string","pricing_model":"string","billing_interval":"string","tax_behavior":"string","cancel_at_period_end":"boolean","cancellation_reason":"string","cancellation_reason_code":"string","cancellation_requested_at":"datetime","is_archived":"boolean","archived_at":"datetime?","restored_at":"datetime?","archive_reason":"string","archived_by":"string","archive_metadata":"object","restoration_metadata":"object","transaction_id":"uuid","user_id":"uuid","organization_id":"uuid","occurred_at":"datetime","payment_method":"string","channel":"string","payment_reference":"string","risk_score":"number"};
export const traits: readonly string[] = ["Stateful","Timestampable","Priceable","Cancellable","Archivable"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  status: record["status"],
  stateHistory: record["state_history"],
  allowedTransitions: record["allowed_transitions"],
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  unitAmountCents: record["unit_amount_cents"],
  currency: record["currency"],
  pricingModel: record["pricing_model"],
  billingInterval: record["billing_interval"],
  taxBehavior: record["tax_behavior"],
  cancelAtPeriodEnd: record["cancel_at_period_end"],
  cancellationReason: record["cancellation_reason"],
  cancellationReasonCode: record["cancellation_reason_code"],
  cancellationRequestedAt: record["cancellation_requested_at"],
  isArchived: record["is_archived"],
  archivedAt: record["archived_at"],
  restoredAt: record["restored_at"],
  archiveReason: record["archive_reason"],
  archivedBy: record["archived_by"],
  archiveMetadata: record["archive_metadata"],
  restorationMetadata: record["restoration_metadata"],
  transactionId: record["transaction_id"],
  userId: record["user_id"],
  organizationId: record["organization_id"],
  occurredAt: record["occurred_at"],
  paymentMethod: record["payment_method"],
  channel: record["channel"],
  paymentReference: record["payment_reference"],
  riskScore: record["risk_score"],

  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  const values = record as Record<string, unknown>;
  const source = values["state_history"];
  const events: CollectionEvent[] = Array.isArray(source) ? source.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || typeof entry.at !== 'string' || typeof entry.to !== 'string') return [];
    return [{ id: 'state-' + index, title: entry.title ?? entry.to.split(/[_-]/).filter(Boolean).map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '), at: entry.at, description: String(entry.reason ?? ''), kind: 'state' as const }];
  }) : [];
  for (const source of [] as Array<{ field: string; title: string }>) {
    const at = values[source.field];
    if (typeof at === 'string') events.push({ id: 'payment-' + source.field, title: source.title, at, description: billingSummary(Number(values.amount), String(values.currency), 100, String(values.billing_interval)), kind: 'payment' });
  }
  return chronologicalEvents(events);
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
      const states: readonly string[] = ["pending","authorized","settled","failed","refunded"];
      const immediate = states.includes('cancelled') && !states.includes('pending_cancellation');
      const target = immediate ? 'cancelled' : 'pending_cancellation';
      if (values.is_archived || values.status === 'terminated' || values.status === 'pending_cancellation' || (immediate && ['completed', 'cancelled', 'final'].includes(String(values.status)))) throw new Error('This record cannot be cancelled in its current state');
      if (!reason.trim()) throw new Error('Enter a cancellation reason');
      if (!code || (["customer_request","suspected_fraud","duplicate_charge","payment_method_error"].length > 0 && !(["customer_request","suspected_fraud","duplicate_charge","payment_method_error"] as readonly string[]).includes(code))) throw new Error('Choose an allowed cancellation reason code');
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
