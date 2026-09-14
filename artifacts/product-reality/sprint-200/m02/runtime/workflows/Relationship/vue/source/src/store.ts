import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';
import { chartSvgByRecord } from './chart-assets';

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
