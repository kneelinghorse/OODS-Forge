import { parseBillingAmount } from '@oods/component-contracts';
import { createStore, idField, titleField, fieldTypes, screenProps, history, collectionEvents, type DomainRecord, type ListQuery, type StoreOptions } from './store';
import { sampleData } from './sample-data';
import type { WorkflowActions } from './actions';
export { idField, titleField, screenProps, history, collectionEvents };
export type Screen = 'list' | 'detail' | 'form' | 'timeline';
export type UIState = 'loading' | 'empty' | 'error' | 'success';
export const routes = {"list":"/","detail":"/:id","form":"/:id/edit","timeline":"/:id/timeline"};
export const cancellable = false;
export const deferredCancellation = true;
export const objectLabel = "decision";
export const statuses = [];
export const archivePresentation = {"archivedField":"is_archived","showBadge":true,"separateTab":true,"tabLabel":"Archived"};
export const supplementalFields: Array<{ name: string; label: string; help: string }> = [{"name":"decision_text","label":"Decision text","help":"The decision as it was written. The longest free text this registry carries: 61 to 8,418 characters in the live store, with 197 of 1,933 rows over 2,000, so every context that shows it must stay readable at 390 without hiding meaning."},{"name":"project_id","label":"Project id","help":"The project the decision belongs to. A slug such as \"forge\", never a uuid."}];
export const cancellationFormProps = {"allowedReasons":[]};
const fieldByNodeId: Record<string, string> = {"list-list-toolbar-4-sort":"decision_id","list-list-items-5-row":"decision_id","list-list-items-5-title":"decision_id","list-slot-items-6":"updated_at","detail-pg-status-timeline-31-value":"supersession_status","detail-pg-status-timeline-32-value":"updated_at","detail-slot-tab-1-6-value":"superseded_by","detail-slot-tab-2-8-value":"supersedes","detail-slot-tab-3-15-value":"supersession_reason","detail-detail-tabs-9-created_at-value":"created_at","detail-detail-tabs-9-last_event-value":"last_event","detail-detail-tabs-9-last_event_at-value":"last_event_at","detail-detail-tabs-9-decision_text-value":"decision_text","detail-detail-tabs-9-sprint_id-value":"sprint_id","detail-detail-tabs-9-mission_id-value":"mission_id","detail-detail-tabs-9-session_id-value":"session_id","detail-detail-tabs-9-project_id-value":"project_id","detail-detail-tabs-9-project_domain-value":"project_domain","detail-ve-metadata-28-primary_category_id-value":"primary_category_id","detail-ve-metadata-28-tags-value":"tags","form-slot-field-0-3":"supersession_reason","form-slot-field-1-5":"created_at","form-slot-field-3-13":"filterCount","form-slot-field-4-15":"supersession_status","form-slot-field-5-17":"superseded_by","form-slot-field-6-19":"supersedes","form-slot-field-7-21":"last_event","form-slot-field-8-23":"primary_category_id","form-slot-field-9-25":"primary_category_path","timeline-timeline-header-1-title":"decision_id"};
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
