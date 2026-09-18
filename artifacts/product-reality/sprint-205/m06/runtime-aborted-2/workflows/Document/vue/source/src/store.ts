import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "label": string;
  "description"?: string;
  "placeholder"?: string;
  "status": 'pending' | 'processed' | 'chunked' | 'embedded' | 'failed';
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at"?: string;
  "updated_at"?: string;
  "last_event"?: string;
  "last_event_at"?: string;
  "owner_id"?: string;
  "owner_type"?: 'user';
  "ownership_role"?: string;
  "ownership_transferred_at"?: string;
  "classification_metadata": unknown;
  "categories"?: unknown[];
  "primary_category_id"?: string;
  "primary_category_path"?: string;
  "tags"?: unknown[];
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
  "project_id": string;
  "name": string;
  "file_path"?: string;
  "file_type"?: string;
  "content"?: string;
  "raw_content"?: string;
  "uploaded_at"?: string;
  "file_size"?: number;
  "mime_type"?: string;
  "source_type"?: string;
  "participant_count"?: number;
  "collection_date"?: string;
  "processed"?: boolean;
  "chunked"?: boolean;
  "embedded"?: boolean;
  "transcription_accuracy"?: number;
  "validation_status"?: string;
  "id": string;
  "chunks"?: unknown[];
  "processing_events"?: unknown[];
  "chunk_count"?: number;
  "total_tokens"?: number;
  "word_count"?: number;
  "preview"?: string;
};

export const idField = "id" as const;
export const titleField = "name" as const;
export const fieldLabels: Record<string, string> = {"label":"Label","description":"Description","placeholder":"Placeholder","status":"Status","state_history":"State history","allowed_transitions":"Allowed transitions","created_at":"Created at","updated_at":"Updated at","last_event":"Last event","last_event_at":"Last event at","owner_id":"Owner id","owner_type":"Owner type","ownership_role":"Ownership role","ownership_transferred_at":"Ownership transferred at","classification_metadata":"Classification metadata","categories":"Categories","primary_category_id":"Primary category id","primary_category_path":"Primary category path","tags":"Tags","tag_count":"Tag count","tag_preview":"Tag preview","searchQuery":"Search Query","searchActive":"Search Active","filters":"Filters","activeFilters":"Active Filters","filterCount":"Filter Count","page":"Page","pageSize":"Page Size","totalItems":"Total Items","totalPages":"Total Pages","project_id":"Project id","name":"Name","file_path":"File path","file_type":"File type","content":"Content","raw_content":"Raw content","uploaded_at":"Uploaded at","file_size":"File size","mime_type":"Mime type","source_type":"Source type","participant_count":"Participant count","collection_date":"Collection date","processed":"Processed","chunked":"Chunked","embedded":"Embedded","transcription_accuracy":"Transcription accuracy","validation_status":"Validation status","id":"Id","chunks":"Chunks","processing_events":"Processing events","chunk_count":"Chunk count","total_tokens":"Total tokens","word_count":"Word count","preview":"Preview"};
export const fieldTypes: Record<string, string> = {"label":"string","description":"string","placeholder":"string","status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","owner_id":"uuid","owner_type":"string","ownership_role":"string","ownership_transferred_at":"datetime","classification_metadata":"ClassificationMetadata","categories":"CategoryNode[]","primary_category_id":"string","primary_category_path":"string","tags":"DocumentTagRead[]","tag_count":"number","tag_preview":"string","searchQuery":"string","searchActive":"boolean","filters":"object[]","activeFilters":"object[]","filterCount":"number","page":"number","pageSize":"number","totalItems":"number","totalPages":"number","project_id":"uuid","name":"string","file_path":"string","file_type":"string","content":"string","raw_content":"string","uploaded_at":"datetime","file_size":"number","mime_type":"string","source_type":"string","participant_count":"number","collection_date":"string","processed":"boolean","chunked":"boolean","embedded":"boolean","transcription_accuracy":"number","validation_status":"string","id":"uuid","chunks":"DocumentChunkRead[]","processing_events":"DocumentProcessingStatusRead[]","chunk_count":"number","total_tokens":"number","word_count":"number","preview":"string"};
export const traits: readonly string[] = ["Labelled","Stateful","Timestampable","Ownerable","Classifiable","Searchable","Filterable","Pageable"];
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
  projectId: record["project_id"],
  name: record["name"],
  filePath: record["file_path"],
  fileType: record["file_type"],
  content: record["content"],
  rawContent: record["raw_content"],
  uploadedAt: record["uploaded_at"],
  fileSize: record["file_size"],
  mimeType: record["mime_type"],
  sourceType: record["source_type"],
  participantCount: record["participant_count"],
  collectionDate: record["collection_date"],
  processed: record["processed"],
  chunked: record["chunked"],
  embedded: record["embedded"],
  transcriptionAccuracy: record["transcription_accuracy"],
  validationStatus: record["validation_status"],
  id: record["id"],
  chunks: record["chunks"],
  processingEvents: record["processing_events"],
  chunkCount: record["chunk_count"],
  totalTokens: record["total_tokens"],
  wordCount: record["word_count"],
  preview: record["preview"],

  };
}
export function history(record: DomainRecord): HistoryEntry[] {
  const value = (record as Record<string, unknown>).state_history;
  return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry => !!entry && typeof entry === 'object' && typeof entry.to === 'string' && typeof entry.at === 'string') : [];
}
export function collectionEvents(record: DomainRecord): CollectionEvent[] {
  return recordCollectionEvents(record, {"historyField":"state_history","payments":[],"minorUnits":100});
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
    const events: readonly string[] = ["created","updated"];
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
      const states: readonly string[] = ["pending","processed","chunked","embedded","failed"];
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
