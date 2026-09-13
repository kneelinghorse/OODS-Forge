import { chronologicalEvents, billingSummary, type CollectionEvent } from '@oods/component-contracts';
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
