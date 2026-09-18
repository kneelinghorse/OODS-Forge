import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "status": 'invited' | 'active' | 'suspended' | 'deactivated';
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at": string;
  "updated_at"?: string;
  "last_event": 'created' | 'profile_updated' | 'status_changed' | 'role_updated';
  "last_event_at"?: string;
  "tags"?: string[];
  "tag_count": number;
  "tag_metadata"?: Record<string, unknown>[];
  "address_roles": string[];
  "default_address_role"?: 'home' | 'billing' | 'shipping';
  "addresses"?: unknown[];
  "preference_document": unknown;
  "preference_metadata": unknown;
  "preference_version": string;
  "preference_namespaces": string[];
  "preference_mutations"?: number;
  "role_catalog": unknown[];
  "permission_catalog": unknown[];
  "role_permissions": unknown;
  "membership_records": unknown[];
  "role_hierarchy_edges"?: unknown[];
  "session_roles"?: string[];
  "channel_catalog": unknown[];
  "template_catalog": unknown[];
  "delivery_policies": unknown[];
  "messages"?: unknown[];
  "conversations"?: unknown[];
  "message_statuses"?: unknown[];
  "user_id": string;
  "name": string;
  "preferred_name"?: string;
  "description"?: string;
  "primary_email": string;
  "role": 'end_user' | 'admin' | 'owner' | 'billing';
  "timezone"?: string;
};

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
export function collectionAddressIndex(entries: unknown[] | undefined, role?: string): number {
  const index = entries?.findIndex(value => asRecord(value).role === role) ?? -1;
  return index >= 0 ? index : entries?.length ? 0 : -1;
}
export function collectionAddress(entries: unknown[] | undefined, role?: string) {
  const entry = asRecord(entries?.[collectionAddressIndex(entries, role)]);
  const address = asRecord(entry.address);
  return { street: Array.isArray(address.addressLines) ? address.addressLines.map(String).join(', ') : '', city: String(address.locality ?? ''), region: String(address.administrativeArea ?? ''), postalCode: String(address.postalCode ?? '') };
}
export function collectionSummary(entries: unknown[] | undefined): string {
  return (entries ?? []).map(entry => { const address = collectionAddress([entry]); return [asRecord(entry).role, address.street, address.city, address.region, address.postalCode].filter(Boolean).join(', '); }).join('; ');
}

export const idField = "user_id" as const;
export const titleField = "name" as const;
export const fieldLabels: Record<string, string> = {"status":"Status","state_history":"State history","allowed_transitions":"Allowed transitions","created_at":"Created at","updated_at":"Updated at","last_event":"Last event","last_event_at":"Last event at","tags":"Tags","tag_count":"Tag count","tag_metadata":"Tag metadata","address_roles":"Address roles","default_address_role":"Default address role","addresses":"Addresses","preference_document":"Preference document","preference_metadata":"Preference metadata","preference_version":"Preference version","preference_namespaces":"Preference namespaces","preference_mutations":"Preference mutations","role_catalog":"Role catalog","permission_catalog":"Permission catalog","role_permissions":"Role permissions","membership_records":"Membership records","role_hierarchy_edges":"Role hierarchy edges","session_roles":"Session roles","channel_catalog":"Channel catalog","template_catalog":"Template catalog","delivery_policies":"Delivery policies","messages":"Messages","conversations":"Conversations","message_statuses":"Message statuses","user_id":"User id","name":"Name","preferred_name":"Preferred name","description":"Description","primary_email":"Primary email","role":"Role","timezone":"Timezone"};
export const fieldTypes: Record<string, string> = {"status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","tags":"string[]","tag_count":"number","tag_metadata":"object[]","address_roles":"string[]","default_address_role":"string","addresses":"AddressableEntry[]","preference_document":"PreferenceDocument","preference_metadata":"PreferenceMetadata","preference_version":"string","preference_namespaces":"string[]","preference_mutations":"number","role_catalog":"AuthzRoleDocument[]","permission_catalog":"AuthzPermissionDocument[]","role_permissions":"Record<string, string[]>","membership_records":"AuthzMembershipDocument[]","role_hierarchy_edges":"AuthzRoleHierarchyEdge[]","session_roles":"string[]","channel_catalog":"Channel[]","template_catalog":"Template[]","delivery_policies":"DeliveryPolicy[]","messages":"Message[]","conversations":"Conversation[]","message_statuses":"MessageStatusEntry[]","user_id":"uuid","name":"string","preferred_name":"string","description":"string","primary_email":"email","role":"string","timezone":"string"};
export const traits: readonly string[] = ["Stateful","Timestampable","Taggable","Addressable","Preferenceable","Authable","Communicable"];
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
  tags: record["tags"],
  tagCount: record["tag_count"],
  tagMetadata: record["tag_metadata"],
  addressRoles: record["address_roles"],
  defaultAddressRole: record["default_address_role"],
  addresses: record["addresses"],
  preferenceDocument: record["preference_document"],
  preferenceMetadata: record["preference_metadata"],
  preferenceVersion: record["preference_version"],
  preferenceNamespaces: record["preference_namespaces"],
  preferenceMutations: record["preference_mutations"],
  roleCatalog: record["role_catalog"],
  permissionCatalog: record["permission_catalog"],
  rolePermissions: record["role_permissions"],
  membershipRecords: record["membership_records"],
  roleHierarchyEdges: record["role_hierarchy_edges"],
  sessionRoles: record["session_roles"],
  channelCatalog: record["channel_catalog"],
  templateCatalog: record["template_catalog"],
  deliveryPolicies: record["delivery_policies"],
  messages: record["messages"],
  conversations: record["conversations"],
  messageStatuses: record["message_statuses"],
  userId: record["user_id"],
  name: record["name"],
  preferredName: record["preferred_name"],
  description: record["description"],
  primaryEmail: record["primary_email"],
  role: record["role"],
  timezone: record["timezone"],

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
    const events: readonly string[] = ["created","profile_updated","status_changed","role_updated"];
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
      const states: readonly string[] = ["invited","active","suspended","deactivated"];
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
