import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "label": string;
  "description"?: string;
  "placeholder"?: string;
  "created_at": string;
  "updated_at": string;
  "last_event"?: string;
  "last_event_at"?: string;
  "owner_id"?: string;
  "owner_type"?: 'user';
  "ownership_role"?: string;
  "ownership_transferred_at"?: string;
  "classification_metadata": unknown;
  "categories": unknown[];
  "primary_category_id": 'supporting' | 'contradicting' | 'rejected' | 'background';
  "primary_category_path"?: string;
  "tags": string[];
  "tag_count"?: number;
  "tag_preview"?: string;
  "searchQuery"?: string;
  "searchActive"?: boolean;
  "filters"?: Record<string, unknown>[];
  "activeFilters"?: Record<string, unknown>[];
  "filterCount": number;
  "page": number;
  "pageSize": number;
  "totalItems"?: number;
  "totalPages"?: number;
  "id": string;
  "project_id": string;
  "mission_id"?: string;
  "session_key": string;
  "origin": 'mcp-agent' | 'deepsearch-worker';
  "claim": string;
  "summary"?: string;
  "source_url": string;
  "source_id": string;
  "source_sighting_count": number;
  "snippet"?: string;
  "query"?: string;
  "disposition": 'supporting' | 'contradicting' | 'rejected' | 'background';
  "workspace_id"?: string;
};

export const idField = "id" as const;
export const titleField = "label" as const;
export const fieldTypes: Record<string, string> = {"label":"string","description":"string","placeholder":"string","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","owner_id":"uuid","owner_type":"string","ownership_role":"string","ownership_transferred_at":"datetime","classification_metadata":"ClassificationMetadata","categories":"CategoryNode[]","primary_category_id":"string","primary_category_path":"string","tags":"string[]","tag_count":"number","tag_preview":"string","searchQuery":"string","searchActive":"boolean","filters":"object[]","activeFilters":"object[]","filterCount":"number","page":"number","pageSize":"number","totalItems":"number","totalPages":"number","id":"uuid","project_id":"uuid","mission_id":"uuid","session_key":"string","origin":"string","claim":"string","summary":"string","source_url":"string","source_id":"uuid","source_sighting_count":"number","snippet":"string","query":"string","disposition":"string","workspace_id":"uuid"};
export const traits: readonly string[] = ["Labelled","Timestampable","Ownerable","Classifiable","Searchable","Filterable","Pageable"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  label: record["label"],
  description: record["description"],
  placeholder: record["placeholder"],
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  ownerId: record["owner_id"],
  ownerType: record["owner_type"],
  ownershipRole: record["ownership_role"],
  ownershipTransferredAt: record["ownership_transferred_at"],
  classificationMetadata: record["classification_metadata"],
  categories: record["categories"],
  primaryCategoryId: record["primary_category_id"],
  primaryCategoryPath: record["primary_category_path"],
  tags: record["tags"],
  tagCount: record["tag_count"],
  tagPreview: record["tag_preview"],
  searchQuery: record["searchQuery"],
  searchActive: record["searchActive"],
  filters: record["filters"],
  activeFilters: record["activeFilters"],
  filterCount: record["filterCount"],
  page: record["page"],
  pageSize: record["pageSize"],
  totalItems: record["totalItems"],
  totalPages: record["totalPages"],
  id: record["id"],
  projectId: record["project_id"],
  missionId: record["mission_id"],
  sessionKey: record["session_key"],
  origin: record["origin"],
  claim: record["claim"],
  summary: record["summary"],
  sourceUrl: record["source_url"],
  sourceId: record["source_id"],
  sourceSightingCount: record["source_sighting_count"],
  snippet: record["snippet"],
  query: record["query"],
  disposition: record["disposition"],
  workspaceId: record["workspace_id"],

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
          && (!query.status || values["owner_type"] === query.status)
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
