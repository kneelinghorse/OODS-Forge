import { chronologicalEvents, billingSummary, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "label": string;
  "description"?: string;
  "placeholder"?: string;
  "status": string;
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at": string;
  "updated_at"?: string;
  "last_event": string;
  "last_event_at"?: string;
  "classification_metadata": unknown;
  "categories"?: unknown[];
  "primary_category_id"?: string;
  "primary_category_path"?: string;
  "tags"?: unknown[];
  "tag_count"?: number;
  "tag_preview"?: string;
  "media_id": string;
  "asset_type": 'image' | 'video' | 'audio' | 'document';
  "mime_type": string;
  "storage_bucket": string;
  "object_key": string;
  "source_url"?: string;
  "checksum"?: string;
  "file_size_bytes": number;
  "width_px"?: number;
  "height_px"?: number;
  "duration_seconds"?: number;
  "transcoding_profiles"?: string[];
};

export const idField = "media_id" as const;
export const titleField = "label" as const;
export const fieldTypes: Record<string, string> = {"label":"string","description":"string","placeholder":"string","status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","classification_metadata":"ClassificationMetadata","categories":"CategoryNode[]","primary_category_id":"string","primary_category_path":"string","tags":"Tag[]","tag_count":"number","tag_preview":"string","media_id":"uuid","asset_type":"string","mime_type":"string","storage_bucket":"string","object_key":"string","source_url":"string","checksum":"string","file_size_bytes":"number","width_px":"number","height_px":"number","duration_seconds":"number","transcoding_profiles":"string[]"};
export const traits: readonly string[] = ["Labelled","Stateful","Timestampable","Classifiable"];
export interface StoreOptions { empty?: boolean; fail?: boolean; latency?: number; now?: () => string; seed?: DomainRecord[] }
export interface ListQuery { search?: string; status?: string; archived?: boolean; sort?: keyof DomainRecord; descending?: boolean; page?: number; pageSize?: number }
export interface HistoryEntry { title?: string; from: string | null; to: string; at: string; reason: string; code?: string; atPeriodEnd?: boolean }
export function screenProps(record: DomainRecord) {
  return {
  label: record["label"],
  description: record["description"],
  placeholder: record["placeholder"],
  status: record["status"],
  stateHistory: record["state_history"],
  allowedTransitions: record["allowed_transitions"],
  createdAt: record["created_at"],
  updatedAt: record["updated_at"],
  lastEvent: record["last_event"],
  lastEventAt: record["last_event_at"],
  classificationMetadata: record["classification_metadata"],
  categories: record["categories"],
  primaryCategoryId: record["primary_category_id"],
  primaryCategoryPath: record["primary_category_path"],
  tags: record["tags"],
  tagCount: record["tag_count"],
  tagPreview: record["tag_preview"],
  mediaId: record["media_id"],
  assetType: record["asset_type"],
  mimeType: record["mime_type"],
  storageBucket: record["storage_bucket"],
  objectKey: record["object_key"],
  sourceUrl: record["source_url"],
  checksum: record["checksum"],
  fileSizeBytes: record["file_size_bytes"],
  widthPx: record["width_px"],
  heightPx: record["height_px"],
  durationSeconds: record["duration_seconds"],
  transcodingProfiles: record["transcoding_profiles"],

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
      if (values.is_archived || values.status === 'terminated' || values.status === 'pending_cancellation') throw new Error('This record cannot be cancelled in its current state');
      
      const at = now();
      const entry: HistoryEntry = { title: 'Pending Cancellation', from: String(values.status), to: 'pending_cancellation', at, reason: reason.trim(), code, atPeriodEnd };
      Object.assign(record, { status: 'pending_cancellation', cancellation_reason: reason.trim(), cancellation_reason_code: code, cancel_at_period_end: atPeriodEnd, cancellation_requested_at: at, state_history: [...history(record), entry], updated_at: at });
      return save(record);
    },
    archive(id: string) { return setArchived(id, true); },
    restore(id: string) { return setArchived(id, false); },
  };
}
