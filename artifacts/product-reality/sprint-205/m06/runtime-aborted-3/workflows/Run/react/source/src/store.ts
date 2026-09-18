import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "searchQuery"?: string;
  "searchActive"?: boolean;
  "filters"?: Record<string, unknown>[];
  "activeFilters"?: Record<string, unknown>[];
  "filterCount": number;
  "page": number;
  "pageSize": number;
  "totalItems"?: number;
  "totalPages"?: number;
  "provenance_source": string;
  "provenance_record": string;
  "provenance_locator"?: string;
  "provenance_method": string;
  "provenance_at": string;
  "run_id": string;
  "target_name": string;
  "target_url": string;
  "mode": 'app' | 'suite';
  "auth_type": string;
  "page_count": number;
  "finding_count": number;
  "critical_count": number;
  "serious_count": number;
  "moderate_count": number;
  "minor_count": number;
  "unknown_count": number;
  "pass_count": number;
  "passes_failed": number;
  "artifact_count": number;
  "evidence_retained"?: boolean;
};

export const idField = "run_id" as const;
export const titleField = "target_name" as const;
export const fieldLabels: Record<string, string> = {"searchQuery":"Search Query","searchActive":"Search Active","filters":"Filters","activeFilters":"Active Filters","filterCount":"Filter Count","page":"Page","pageSize":"Page Size","totalItems":"Total Items","totalPages":"Total Pages","provenance_source":"Source","provenance_record":"Record","provenance_locator":"Read from","provenance_method":"Obtained by","provenance_at":"Obtained","run_id":"Run id","target_name":"Target name","target_url":"Target url","mode":"Mode","auth_type":"Auth type","page_count":"Page count","finding_count":"Finding count","critical_count":"Critical count","serious_count":"Serious count","moderate_count":"Moderate count","minor_count":"Minor count","unknown_count":"Unknown count","pass_count":"Pass count","passes_failed":"Passes failed","artifact_count":"Artifact count","evidence_retained":"Evidence retained"};
export const fieldTypes: Record<string, string> = {"searchQuery":"string","searchActive":"boolean","filters":"object[]","activeFilters":"object[]","filterCount":"number","page":"number","pageSize":"number","totalItems":"number","totalPages":"number","provenance_source":"string","provenance_record":"string","provenance_locator":"string","provenance_method":"string","provenance_at":"datetime","run_id":"string","target_name":"string","target_url":"string","mode":"string","auth_type":"string","page_count":"integer","finding_count":"integer","critical_count":"integer","serious_count":"integer","moderate_count":"integer","minor_count":"integer","unknown_count":"integer","pass_count":"integer","passes_failed":"integer","artifact_count":"integer","evidence_retained":"boolean"};
export const traits: readonly string[] = ["Searchable","Filterable","Pageable","Provenanced"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  searchQuery: record["searchQuery"],
  searchActive: record["searchActive"],
  filters: record["filters"],
  activeFilters: record["activeFilters"],
  filterCount: record["filterCount"],
  page: record["page"],
  pageSize: record["pageSize"],
  totalItems: record["totalItems"],
  totalPages: record["totalPages"],
  provenanceSource: record["provenance_source"],
  provenanceRecord: record["provenance_record"],
  provenanceLocator: record["provenance_locator"],
  provenanceMethod: record["provenance_method"],
  provenanceAt: record["provenance_at"],
  runId: record["run_id"],
  targetName: record["target_name"],
  targetUrl: record["target_url"],
  mode: record["mode"],
  authType: record["auth_type"],
  pageCount: record["page_count"],
  findingCount: record["finding_count"],
  criticalCount: record["critical_count"],
  seriousCount: record["serious_count"],
  moderateCount: record["moderate_count"],
  minorCount: record["minor_count"],
  unknownCount: record["unknown_count"],
  passCount: record["pass_count"],
  passesFailed: record["passes_failed"],
  artifactCount: record["artifact_count"],
  evidenceRetained: record["evidence_retained"],

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
      const states: readonly string[] = [];
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
