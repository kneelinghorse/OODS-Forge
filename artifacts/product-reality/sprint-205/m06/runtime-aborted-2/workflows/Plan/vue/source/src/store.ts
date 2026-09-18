import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "plan_code": string;
  "plan_name": string;
  "billing_interval": 'monthly' | 'quarterly' | 'annual';
  "interval_count"?: number;
  "amount_minor": number;
  "currency": string;
  "trial_period_days"?: number;
  "collection_method"?: string;
  "billing_anchor_day"?: number;
  "pricing_model"?: string;
  "meter_name": string;
  "included_quantity": number;
  "consumed_quantity": number;
  "unit_label": string;
  "period_start": string;
  "period_end": string;
  "rollover_strategy"?: string;
  "overage_rate_minor"?: number;
  "projected_overage_minor"?: number;
  "samples"?: unknown[];
  "owner_id": string;
  "owner_type": 'organization' | 'team' | 'user';
  "ownership_role"?: string;
  "ownership_transferred_at"?: string;
  "plan_id": string;
  "product_family": string;
  "status": 'active' | 'deprecated' | 'private_beta' | 'legacy';
  "feature_matrix"?: unknown[];
  "add_on_ids"?: string[];
  "upgrade_targets"?: string[];
  "downgrade_targets"?: string[];
  "notes"?: string;
};

export const idField = "plan_id" as const;
export const titleField = "plan_name" as const;
export const fieldLabels: Record<string, string> = {"plan_code":"Plan code","plan_name":"Plan name","billing_interval":"Billing interval","interval_count":"Interval count","amount_minor":"Amount minor","currency":"Currency","trial_period_days":"Trial period days","collection_method":"Collection method","billing_anchor_day":"Billing anchor day","pricing_model":"Pricing model","meter_name":"Meter name","included_quantity":"Included quantity","consumed_quantity":"Consumed quantity","unit_label":"Unit label","period_start":"Period start","period_end":"Period end","rollover_strategy":"Rollover strategy","overage_rate_minor":"Overage rate minor","projected_overage_minor":"Projected overage minor","samples":"Samples","owner_id":"Owner id","owner_type":"Owner type","ownership_role":"Ownership role","ownership_transferred_at":"Ownership transferred at","plan_id":"Plan id","product_family":"Product family","status":"Status","feature_matrix":"Feature matrix","add_on_ids":"Add on ids","upgrade_targets":"Upgrade targets","downgrade_targets":"Downgrade targets","notes":"Notes"};
export const fieldTypes: Record<string, string> = {"plan_code":"string","plan_name":"string","billing_interval":"string","interval_count":"integer","amount_minor":"integer","currency":"string","trial_period_days":"integer","collection_method":"string","billing_anchor_day":"integer","pricing_model":"string","meter_name":"string","included_quantity":"integer","consumed_quantity":"integer","unit_label":"string","period_start":"date","period_end":"date","rollover_strategy":"string","overage_rate_minor":"integer","projected_overage_minor":"integer","samples":"UsageSample[]","owner_id":"string","owner_type":"string","ownership_role":"string","ownership_transferred_at":"datetime","plan_id":"string","product_family":"string","status":"string","feature_matrix":"FeatureDescriptor[]","add_on_ids":"string[]","upgrade_targets":"string[]","downgrade_targets":"string[]","notes":"string"};
export const traits: readonly string[] = ["SaaSBillingBillable","SaaSBillingMetered","Ownerable"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  planCode: record["plan_code"],
  planName: record["plan_name"],
  billingInterval: record["billing_interval"],
  intervalCount: record["interval_count"],
  amountMinor: record["amount_minor"],
  currency: record["currency"],
  trialPeriodDays: record["trial_period_days"],
  collectionMethod: record["collection_method"],
  billingAnchorDay: record["billing_anchor_day"],
  pricingModel: record["pricing_model"],
  meterName: record["meter_name"],
  includedQuantity: record["included_quantity"],
  consumedQuantity: record["consumed_quantity"],
  unitLabel: record["unit_label"],
  periodStart: record["period_start"],
  periodEnd: record["period_end"],
  rolloverStrategy: record["rollover_strategy"],
  overageRateMinor: record["overage_rate_minor"],
  projectedOverageMinor: record["projected_overage_minor"],
  samples: record["samples"],
  ownerId: record["owner_id"],
  ownerType: record["owner_type"],
  ownershipRole: record["ownership_role"],
  ownershipTransferredAt: record["ownership_transferred_at"],
  planId: record["plan_id"],
  productFamily: record["product_family"],
  status: record["status"],
  featureMatrix: record["feature_matrix"],
  addOnIds: record["add_on_ids"],
  upgradeTargets: record["upgrade_targets"],
  downgradeTargets: record["downgrade_targets"],
  notes: record["notes"],

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
    const events: readonly string[] = [];
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
      const states: readonly string[] = ["active","deprecated","private_beta","legacy"];
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
