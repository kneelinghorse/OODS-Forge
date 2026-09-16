import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
import { chartSvgByRecord, chartSvgNarrowByRecord } from './chart-assets';

export type DomainRecord = {
  "label": string;
  "description"?: string;
  "placeholder"?: string;
  "status": 'proposed' | 'active' | 'paused' | 'completed' | 'terminated';
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at": string;
  "updated_at"?: string;
  "last_event": 'created' | 'activated' | 'paused' | 'terminated' | 'reactivated';
  "last_event_at"?: string;
  "owner_id": string;
  "owner_type": 'organization' | 'team' | 'platform';
  "ownership_role"?: string;
  "ownership_transferred_at"?: string;
  "tags"?: string[];
  "tag_count": number;
  "tag_metadata"?: Record<string, unknown>[];
  "neighborhood"?: unknown[];
  "relationship_id": string;
  "source_id": string;
  "target_id": string;
  "relationship_type": 'membership' | 'ownership' | 'follows' | 'depends_on' | 'references';
  "direction": 'unidirectional' | 'bidirectional';
  "strength"?: 'low' | 'medium' | 'high';
  "origin_source"?: 'manual' | 'ingestion' | 'analytics' | 'integration';
  "is_bidirectional": boolean;
};

export const idField = "relationship_id" as const;
export const titleField = "label" as const;
export const fieldLabels: Record<string, string> = {"label":"Label","description":"Description","placeholder":"Placeholder","status":"Status","state_history":"State history","allowed_transitions":"Allowed transitions","created_at":"Created at","updated_at":"Updated at","last_event":"Last event","last_event_at":"Last event at","owner_id":"Owner id","owner_type":"Owner type","ownership_role":"Ownership role","ownership_transferred_at":"Ownership transferred at","tags":"Tags","tag_count":"Tag count","tag_metadata":"Tag metadata","neighborhood":"Neighborhood","relationship_id":"Relationship id","source_id":"Source id","target_id":"Target id","relationship_type":"Relationship type","direction":"Direction","strength":"Strength","origin_source":"Origin source","is_bidirectional":"Is bidirectional"};
export const fieldTypes: Record<string, string> = {"label":"string","description":"string","placeholder":"string","status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","owner_id":"string","owner_type":"string","ownership_role":"string","ownership_transferred_at":"datetime","tags":"string[]","tag_count":"number","tag_metadata":"object[]","neighborhood":"array","relationship_id":"uuid","source_id":"uuid","target_id":"uuid","relationship_type":"string","direction":"string","strength":"string","origin_source":"string","is_bidirectional":"boolean"};
export const traits: readonly string[] = ["Labelled","Stateful","Timestampable","Ownerable","Taggable","MarkGraph"];
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
  tags: record["tags"],
  tagCount: record["tag_count"],
  tagMetadata: record["tag_metadata"],
  neighborhood: record["neighborhood"],
  relationshipId: record["relationship_id"],
  sourceId: record["source_id"],
  targetId: record["target_id"],
  relationshipType: record["relationship_type"],
  direction: record["direction"],
  strength: record["strength"],
  originSource: record["origin_source"],
  isBidirectional: record["is_bidirectional"],
  svg: chartSvgByRecord[String(record[idField])],
  svgNarrow: chartSvgNarrowByRecord[String(record[idField])],
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
    const events: readonly string[] = ["created","activated","paused","terminated","reactivated"];
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
      const states: readonly string[] = ["proposed","active","paused","completed","terminated"];
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
