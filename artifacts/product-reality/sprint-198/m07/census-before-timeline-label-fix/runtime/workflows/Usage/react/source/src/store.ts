import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
import { chartSvgByRecord } from './chart-assets';

export type DomainRecord = {
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
  "created_at": string;
  "updated_at"?: string;
  "last_event": 'reading_captured' | 'anomaly_detected' | 'reset';
  "last_event_at"?: string;
  "usage_id": string;
  "subscription_id": string;
  "meter_id": string;
  "provider": string;
  "status"?: 'ok' | 'delayed' | 'investigating';
  "trend_percent"?: number;
  "variance_minor"?: number;
  "last_reported_at": string;
  "anomalies"?: unknown[];
};

export const idField = "usage_id" as const;
export const titleField = "usage_id" as const;
export const fieldTypes: Record<string, string> = {"meter_name":"string","included_quantity":"integer","consumed_quantity":"integer","unit_label":"string","period_start":"date","period_end":"date","rollover_strategy":"string","overage_rate_minor":"integer","projected_overage_minor":"integer","samples":"UsageSample[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","usage_id":"string","subscription_id":"string","meter_id":"string","provider":"string","status":"string","trend_percent":"number","variance_minor":"integer","last_reported_at":"datetime","anomalies":"UsageAnomaly[]"};
export const traits: readonly string[] = ["SaaSBillingMetered","Timestampable","MarkLine"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
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
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  usageId: record["usage_id"],
  subscriptionId: record["subscription_id"],
  meterId: record["meter_id"],
  provider: record["provider"],
  status: record["status"],
  trendPercent: record["trend_percent"],
  varianceMinor: record["variance_minor"],
  lastReportedAt: record["last_reported_at"],
  anomalies: record["anomalies"],
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
      const states: readonly string[] = ["ok","delayed","investigating"];
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
