import { recordCollectionEvents, type CollectionEvent } from '@oods/component-contracts';
import { sampleData } from './sample-data';


export type DomainRecord = {
  "label": string;
  "description": string;
  "placeholder"?: string;
  "status": 'draft' | 'queued' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'validation_failed';
  "state_history"?: unknown[];
  "allowed_transitions"?: string[];
  "created_at": string;
  "updated_at": string;
  "last_event"?: string;
  "last_event_at"?: string;
  "owner_id"?: string;
  "owner_type"?: 'user';
  "ownership_role"?: string;
  "ownership_transferred_at"?: string;
  "tags"?: string[];
  "tag_count": number;
  "tag_metadata"?: Record<string, unknown>[];
  "cancel_at_period_end"?: boolean;
  "cancellation_reason"?: string;
  "cancellation_reason_code"?: string;
  "cancellation_requested_at"?: string;
  "searchQuery"?: string;
  "searchActive"?: boolean;
  "filters"?: Record<string, unknown>[];
  "activeFilters"?: Record<string, unknown>[];
  "filterCount": number;
  "page": number;
  "pageSize": number;
  "totalItems"?: number;
  "totalPages"?: number;
  "mission_id": string;
  "title": string;
  "objective": string;
  "success_criteria": string[];
  "id": string;
  "project_id"?: string;
  "project_name"?: string;
  "context"?: Record<string, unknown>;
  "deliverables"?: string[];
  "research_phases"?: Record<string, unknown>;
  "metadata"?: Record<string, unknown>;
  "background"?: string;
  "focus"?: string;
  "references"?: Record<string, unknown>[];
  "required_entities"?: string[];
  "excluded_entities"?: string[];
  "expected_output_schema"?: Record<string, unknown>;
  "coverage_thresholds"?: Record<string, unknown>;
  "validation_thresholds"?: Record<string, unknown>;
  "deliverable_format"?: string;
  "max_loops"?: number;
  "min_loops"?: number;
  "constraints"?: string[];
  "queued_at"?: string;
  "started_at"?: string;
  "completed_at"?: string;
  "deepsearch_job_id"?: string;
  "execution_metadata"?: Record<string, unknown>;
  "result_document_ids"?: string[];
  "result_report_id"?: string;
  "result_markdown"?: string;
  "result_protocol"?: Record<string, unknown>;
  "error_message"?: string;
  "created_by"?: string;
  "progress_percent"?: number;
  "current_phase"?: string;
  "deepsearch_attempt_count"?: number;
  "lease_expires_at"?: string;
  "materialization_pending": boolean;
  "materialization_status"?: string;
  "materialization_attempt_count"?: number;
  "materialization_error"?: string;
  "search_ready": boolean;
};

export const idField = "id" as const;
export const titleField = "title" as const;
export const fieldLabels: Record<string, string> = {"label":"Label","description":"Description","placeholder":"Placeholder","status":"Status","state_history":"State history","allowed_transitions":"Allowed transitions","created_at":"Created at","updated_at":"Updated at","last_event":"Last event","last_event_at":"Last event at","owner_id":"Owner id","owner_type":"Owner type","ownership_role":"Ownership role","ownership_transferred_at":"Ownership transferred at","tags":"Tags","tag_count":"Tag count","tag_metadata":"Tag metadata","cancel_at_period_end":"Cancel at period end","cancellation_reason":"Cancellation reason","cancellation_reason_code":"Cancellation reason code","cancellation_requested_at":"Cancellation requested at","searchQuery":"Search Query","searchActive":"Search Active","filters":"Filters","activeFilters":"Active Filters","filterCount":"Filter Count","page":"Page","pageSize":"Page Size","totalItems":"Total Items","totalPages":"Total Pages","mission_id":"Mission id","title":"Title","objective":"Objective","success_criteria":"Success criteria","id":"Id","project_id":"Project id","project_name":"Project name","context":"Context","deliverables":"Deliverables","research_phases":"Research phases","metadata":"Metadata","background":"Background","focus":"Focus","references":"References","required_entities":"Required entities","excluded_entities":"Excluded entities","expected_output_schema":"Expected output schema","coverage_thresholds":"Coverage thresholds","validation_thresholds":"Validation thresholds","deliverable_format":"Deliverable format","max_loops":"Max loops","min_loops":"Min loops","constraints":"Constraints","queued_at":"Queued at","started_at":"Started at","completed_at":"Completed at","deepsearch_job_id":"Deepsearch job id","execution_metadata":"Execution metadata","result_document_ids":"Result document ids","result_report_id":"Result report id","result_markdown":"Result markdown","result_protocol":"Result protocol","error_message":"Error message","created_by":"Created by","progress_percent":"Progress percent","current_phase":"Current phase","deepsearch_attempt_count":"Deepsearch attempt count","lease_expires_at":"Lease expires at","materialization_pending":"Materialization pending","materialization_status":"Materialization status","materialization_attempt_count":"Materialization attempt count","materialization_error":"Materialization error","search_ready":"Search ready"};
export const fieldTypes: Record<string, string> = {"label":"string","description":"string","placeholder":"string","status":"string","state_history":"StateTransition[]","allowed_transitions":"string[]","created_at":"datetime","updated_at":"datetime","last_event":"string","last_event_at":"datetime","owner_id":"uuid","owner_type":"string","ownership_role":"string","ownership_transferred_at":"datetime","tags":"string[]","tag_count":"number","tag_metadata":"object[]","cancel_at_period_end":"boolean","cancellation_reason":"string","cancellation_reason_code":"string","cancellation_requested_at":"datetime","searchQuery":"string","searchActive":"boolean","filters":"object[]","activeFilters":"object[]","filterCount":"number","page":"number","pageSize":"number","totalItems":"number","totalPages":"number","mission_id":"string","title":"string","objective":"string","success_criteria":"string[]","id":"uuid","project_id":"uuid","project_name":"string","context":"object","deliverables":"string[]","research_phases":"object","metadata":"object","background":"string","focus":"string","references":"object[]","required_entities":"string[]","excluded_entities":"string[]","expected_output_schema":"object","coverage_thresholds":"object","validation_thresholds":"object","deliverable_format":"string","max_loops":"number","min_loops":"number","constraints":"string[]","queued_at":"datetime","started_at":"datetime","completed_at":"datetime","deepsearch_job_id":"string","execution_metadata":"object","result_document_ids":"uuid[]","result_report_id":"uuid","result_markdown":"string","result_protocol":"object","error_message":"string","created_by":"string","progress_percent":"number","current_phase":"string","deepsearch_attempt_count":"number","lease_expires_at":"datetime","materialization_pending":"boolean","materialization_status":"string","materialization_attempt_count":"number","materialization_error":"string","search_ready":"boolean"};
export const traits: readonly string[] = ["Labelled","Stateful","Timestampable","Ownerable","Taggable","Cancellable","Searchable","Filterable","Pageable"];
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
  cancelAtPeriodEnd: record["cancel_at_period_end"],
  cancellationReason: record["cancellation_reason"],
  cancellationReasonCode: record["cancellation_reason_code"],
  cancellationRequestedAt: record["cancellation_requested_at"],
  searchQuery: record["searchQuery"],
  searchActive: record["searchActive"],
  filters: record["filters"],
  activeFilters: record["activeFilters"],
  filterCount: record["filterCount"],
  page: record["page"],
  pageSize: record["pageSize"],
  totalItems: record["totalItems"],
  totalPages: record["totalPages"],
  missionId: record["mission_id"],
  title: record["title"],
  objective: record["objective"],
  successCriteria: record["success_criteria"],
  id: record["id"],
  projectId: record["project_id"],
  projectName: record["project_name"],
  context: record["context"],
  deliverables: record["deliverables"],
  researchPhases: record["research_phases"],
  metadata: record["metadata"],
  background: record["background"],
  focus: record["focus"],
  references: record["references"],
  requiredEntities: record["required_entities"],
  excludedEntities: record["excluded_entities"],
  expectedOutputSchema: record["expected_output_schema"],
  coverageThresholds: record["coverage_thresholds"],
  validationThresholds: record["validation_thresholds"],
  deliverableFormat: record["deliverable_format"],
  maxLoops: record["max_loops"],
  minLoops: record["min_loops"],
  constraints: record["constraints"],
  queuedAt: record["queued_at"],
  startedAt: record["started_at"],
  completedAt: record["completed_at"],
  deepsearchJobId: record["deepsearch_job_id"],
  executionMetadata: record["execution_metadata"],
  resultDocumentIds: record["result_document_ids"],
  resultReportId: record["result_report_id"],
  resultMarkdown: record["result_markdown"],
  resultProtocol: record["result_protocol"],
  errorMessage: record["error_message"],
  createdBy: record["created_by"],
  progressPercent: record["progress_percent"],
  currentPhase: record["current_phase"],
  deepsearchAttemptCount: record["deepsearch_attempt_count"],
  leaseExpiresAt: record["lease_expires_at"],
  materializationPending: record["materialization_pending"],
  materializationStatus: record["materialization_status"],
  materializationAttemptCount: record["materialization_attempt_count"],
  materializationError: record["materialization_error"],
  searchReady: record["search_ready"],

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
    const events: readonly string[] = ["created","queued","started","completed","updated"];
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
      const states: readonly string[] = ["draft","queued","in_progress","completed","blocked","cancelled","validation_failed"];
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
