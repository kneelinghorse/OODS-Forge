import { parseBillingAmount } from '@oods/component-contracts';
import { createStore, idField, titleField, fieldTypes, screenProps, history, collectionEvents, type DomainRecord, type ListQuery, type StoreOptions } from './store';
import { sampleData } from './sample-data';
import type { WorkflowActions } from './actions';
export { idField, titleField, screenProps, history, collectionEvents };
export type Screen = 'list' | 'detail' | 'form' | 'timeline';
export type UIState = 'loading' | 'empty' | 'error' | 'success';
export const routes = {"list":"/","detail":"/:id","form":"/:id/edit","timeline":"/:id/timeline"};
export const cancellable = true;
export const deferredCancellation = false;
export const objectLabel = "mission";
export const statuses = ["draft","queued","in_progress","completed","blocked","cancelled","validation_failed"];
export const archivePresentation = {"archivedField":"is_archived","showBadge":true,"separateTab":true,"tabLabel":"Archived"};
export const supplementalFields: Array<{ name: string; label: string; help: string }> = [{"name":"description","label":"Description","help":"Display projection of objective; never truncates persisted content."},{"name":"mission_id","label":"Mission id","help":"Human-readable mission identifier (e.g., B16.1)"},{"name":"title","label":"Title","help":"Mission title"},{"name":"objective","label":"Objective","help":"What this mission aims to achieve (minimum 10 characters)"}];
export const cancellationFormProps = {"allowedReasons":[],"reasonHelp":"Free-form detail describing why cancellation occurred.","codeHelp":"Structured reason code chosen from the allowedReasons parameter."};
const fieldByNodeId: Record<string, string> = {"list-list-toolbar-4-sort":"title","list-list-items-5-row":"id","list-list-items-5-title":"title","list-ve-items-15":"updated_at","list-ve-items-17":"tags","detail-ve-header-25":"status","detail-ve-header-29":"tags","detail-pg-status-timeline-33-value":"allowed_transitions","detail-slot-tab-2-8-value":"created_at","detail-detail-tabs-9-updated_at-value":"updated_at","detail-detail-tabs-9-last_event-value":"last_event","detail-detail-tabs-9-last_event_at-value":"last_event_at","detail-detail-tabs-9-mission_id-value":"mission_id","detail-detail-tabs-9-objective-value":"objective","detail-detail-tabs-9-id-value":"id","detail-detail-tabs-9-project_id-value":"project_id","detail-detail-tabs-9-project_name-value":"project_name","detail-detail-tabs-9-background-value":"background","detail-detail-tabs-9-focus-value":"focus","detail-detail-tabs-9-deliverable_format-value":"deliverable_format","detail-detail-tabs-9-max_loops-value":"max_loops","detail-detail-tabs-9-min_loops-value":"min_loops","detail-detail-tabs-9-queued_at-value":"queued_at","detail-detail-tabs-9-started_at-value":"started_at","detail-detail-tabs-9-completed_at-value":"completed_at","detail-detail-tabs-9-deepsearch_job_id-value":"deepsearch_job_id","detail-detail-tabs-9-result_report_id-value":"result_report_id","detail-detail-tabs-9-result_markdown-value":"result_markdown","detail-detail-tabs-9-error_message-value":"error_message","detail-detail-tabs-9-created_by-value":"created_by","detail-detail-tabs-9-progress_percent-value":"progress_percent","detail-detail-tabs-9-current_phase-value":"current_phase","detail-detail-tabs-9-deepsearch_attempt_count-value":"deepsearch_attempt_count","detail-detail-tabs-9-lease_expires_at-value":"lease_expires_at","detail-detail-tabs-9-materialization_pending-value":"materialization_pending","detail-detail-tabs-9-materialization_status-value":"materialization_status","detail-detail-tabs-9-materialization_attempt_count-value":"materialization_attempt_count","detail-detail-tabs-9-materialization_error-value":"materialization_error","detail-detail-tabs-9-search_ready-value":"search_ready","form-ve-title-27":"status","form-ve-title-28":"tags","form-slot-field-0-3":"label","form-slot-field-2-7":"created_at","form-slot-field-3-13":"ownership_role","form-slot-field-5-17":"searchActive","form-slot-field-7-21":"last_event","form-slot-field-8-23":"owner_id","form-slot-field-9-25":"page","timeline-ve-entry-0-15":"title"};
export interface AppState { screen: Screen; uiState: UIState; id: string; draft: DomainRecord; records: DomainRecord[]; total: number; page: number; pageSize: number; search: string; status: string; descending: boolean; archived: boolean; error: string; notice: string; revision: number; cancelOpen: boolean }
export function createWorkflow(options: StoreOptions = {}) {
  const store = createStore(options);
  let query: ListQuery = {};
  let request = 0;
  const first = store.list().records[0] ?? sampleData[0]!;
  let state: AppState = { screen: 'list', uiState: 'loading', id: String(first[idField]), draft: structuredClone(first), records: [], total: 0, page: 1, pageSize: 10, search: '', status: '', descending: false, archived: false, error: '', notice: '', revision: 0, cancelOpen: false };
  const listeners = new Set<(state: AppState) => void>();
  const publish = (patch: Partial<AppState>) => { state = { ...state, ...patch }; listeners.forEach((listener) => listener(state)); };
  const value = (field: string) => (state.draft as Record<string, unknown>)[field];
  async function navigate(screen: Screen, id = state.id) {
    const ticket = ++request;
    publish({ screen, id, cancelOpen: false, uiState: 'loading', error: '', revision: state.revision + 1 });
    try {
      await store.ready();
      if (ticket !== request) return;
      const list = store.list(query);
      const selected = screen === 'list' ? list.records[0] : store.list({ archived: query.archived, pageSize: 10000 }).records.find((record) => String(record[idField]) === id);
      const draft = selected ?? sampleData[0]!;
      publish({ records: list.records, total: list.total, page: list.page, pageSize: list.pageSize, search: query.search ?? '', status: query.status ?? '', descending: query.descending ?? false, archived: query.archived ?? false, draft: structuredClone(draft), id: selected ? String(selected[idField]) : id, uiState: selected ? 'success' : 'empty' });
    } catch (error) { if (ticket === request) publish({ uiState: 'error', error: error instanceof Error ? error.message : String(error) }); }
  }
  function refreshList() {
    const list = store.list(query);
    const selected = list.records[0];
    publish({ records: list.records, total: list.total, page: list.page, pageSize: list.pageSize, search: query.search ?? '', status: query.status ?? '', descending: query.descending ?? false, archived: query.archived ?? false, uiState: selected ? 'success' : 'empty' });
  }
  async function change(operation: () => DomainRecord, destination: Screen) {
    publish({ uiState: 'loading', error: '' });
    try { await store.ready(); operation(); publish({ notice: 'Changes saved in this session.' }); await navigate(destination); }
    catch (error) { publish({ uiState: 'error', error: error instanceof Error ? error.message : String(error) }); }
  }
  const actions: WorkflowActions = {
    handleCancel: () => { publish({ cancelOpen: true }); },
    handleEdit: () => { void navigate("form"); },
    handleFilter: (criteria) => { query = { ...query, search: String(criteria.search ?? ""), status: String(criteria.status ?? ""), archived: Boolean(criteria.archived ?? query.archived), page: 1 }; refreshList(); },
    handlePageChange: (page) => { query = { ...query, page }; refreshList(); },
    handleRowClick: (id) => { void navigate("detail", id); },
    handleSort: (column) => { if (column in fieldTypes) { query = { ...query, sort: column as keyof DomainRecord, descending: !query.descending }; refreshList(); } },
    handleSubmit: () => { void change(() => store.update(state.draft), "detail"); },
    handleViewTimeline: () => { void navigate("timeline"); },
  };
  function edit(event: Event) {
    if (state.screen !== 'form' && state.screen !== 'detail') return;
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    // A native select commits on change. Publishing during input can redraw its
    // old controlled value before change reads the keyboard selection in Vue.
    if (target instanceof HTMLSelectElement && event.type === 'input') return;
    let field = target.name;
    if (target.closest('[data-oods-component="CancellationForm"]')) field = ({ reason: 'cancellation_reason', reasonCode: 'cancellation_reason_code' } as Record<string, string>)[field] ?? field;
    let element: HTMLElement | null = target;
    while (!Object.hasOwn(fieldTypes, field) && element) { field = fieldByNodeId[element.id] ?? ''; element = element.parentElement; }
    if (!Object.hasOwn(fieldTypes, field)) return;
    const type = fieldTypes[field];
    // Collection editors dispatch whole domain values; their native inputs are not scalar record fields.
    if (type?.endsWith('[]')) return;
    if (target instanceof HTMLInputElement && target.dataset.billingMinorUnits !== undefined) {
      const result = parseBillingAmount(target.value, Number(target.dataset.billingMinorUnits));
      if (result.valid) publish({ draft: { ...state.draft, [field]: result.value }, notice: 'Unsaved changes' });
      return;
    }
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked
      : type === 'number' || type === 'integer' ? Number(target.value) : target instanceof HTMLInputElement && target.type === 'datetime-local' && target.value ? new Date(target.value + 'Z').toISOString() : target.value;
    publish({ draft: { ...state.draft, [field]: value }, notice: 'Unsaved changes' });
  }
  return {
    snapshot: () => state,
    subscribe(listener: (state: AppState) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    navigate, actions, edit,
    confirmCancellation() { return change(() => store.cancel(state.id, String(value("cancellation_reason") ?? ""), String(value("cancellation_reason_code") ?? ""), Boolean(value("cancel_at_period_end"))), 'detail'); },
    dismissCancellation() { publish({ cancelOpen: false }); },
    filter(search: string, status = query.status ?? '') { query = { ...query, search, status, page: 1 }; return refreshList(); },
    sort(descending: boolean) { query = { ...query, sort: titleField, descending }; return refreshList(); },
    page(page: number) { query = { ...query, page }; return refreshList(); },
    archived(archived: boolean) { query = { ...query, archived, page: 1 }; return refreshList(); },
    restore() { return change(() => store.restore(state.id), 'list'); },
    retry() { store.setFailure(false); return navigate(state.screen); },
    dispose() { request++; listeners.clear(); },
  };
}
