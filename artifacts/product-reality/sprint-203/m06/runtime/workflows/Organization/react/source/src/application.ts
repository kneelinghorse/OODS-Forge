import { parseBillingAmount } from '@oods/component-contracts';
import { collectionAddressIndex, createStore, idField, titleField, fieldTypes, screenProps, history, collectionEvents, type DomainRecord, type ListQuery, type StoreOptions } from './store';
import { sampleData } from './sample-data';
import type { WorkflowActions } from './actions';
export { idField, titleField, screenProps, history, collectionEvents };
export type Screen = 'list' | 'detail' | 'form' | 'timeline';
export type UIState = 'loading' | 'empty' | 'error' | 'success';
export const routes = {"list":"/","detail":"/:id","form":"/:id/edit","timeline":"/:id/timeline"};
export const cancellable = false;
export const deferredCancellation = true;
export const objectLabel = "organization";
export const statuses = ["prospect","onboarding","active","churned"];
export const archivePresentation = {"archivedField":"is_archived","showBadge":true,"separateTab":true,"tabLabel":"Archived"};
export const supplementalFields: Array<{ name: string; label: string; help: string }> = [{"name":"domain","label":"Domain","help":"Verified root domain associated with the organization."}];
export const cancellationFormProps = {"allowedReasons":[]};
const fieldByNodeId: Record<string, string> = {"list-list-toolbar-4-sort":"label","list-list-items-5-row":"organization_id","list-ve-items-10":"label","list-ve-items-14":"updated_at","list-ve-items-15":"tags","detail-ve-header-29":"status","detail-ve-header-31":"tags","detail-slot-tab-1-6-membership_records-value":"membership_records","detail-slot-tab-2-8":"addresses","detail-slot-tab-3-15-preference_namespaces-value":"preference_namespaces","detail-slot-tab-3-15-preference_version-value":"preference_version","detail-detail-tabs-9-created_at-value":"created_at","detail-detail-tabs-9-updated_at-value":"updated_at","detail-detail-tabs-9-last_event-value":"last_event","detail-detail-tabs-9-last_event_at-value":"last_event_at","detail-detail-tabs-9-organization_id-value":"organization_id","detail-detail-tabs-9-domain-value":"domain","detail-detail-tabs-9-plan_tier-value":"plan_tier","detail-detail-tabs-9-billing_status-value":"billing_status","detail-detail-tabs-9-industry-value":"industry","detail-detail-tabs-9-employee_count-value":"employee_count","detail-detail-tabs-9-billing_contact_email-value":"billing_contact_email","detail-detail-tabs-9-data_residency-value":"data_residency","form-ve-title-27":"status","form-ve-title-28":"tags","form-ve-title-29":"addresses","form-slot-field-2-7":"plan_tier","form-slot-field-3-13":"ownership_transferred_at","form-slot-field-5-17":"billing_contact_email","form-slot-field-6-19":"label","form-slot-field-8-23":"owner_id","form-slot-field-9-25":"owner_type","timeline-ve-entry-0-15":"label"};
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
    handleChange_addresses: (address) => {
      const entries = state.draft["addresses"] ?? [];
      const requestedRole = String(value("default_address_role") || "headquarters");
      const index = collectionAddressIndex(entries, requestedRole);
      const previous = index < 0 ? {} : entries[index] as Record<string, unknown>;
      const role = String(previous.role ?? requestedRole);
      const entry = { ...previous, role, address: { ...((previous.address ?? {}) as Record<string, unknown>), countryCode: ((previous.address ?? {}) as Record<string, unknown>).countryCode ?? 'US', addressLines: [String(address.street ?? '')], locality: String(address.city ?? ''), administrativeArea: String(address.region ?? ''), postalCode: String(address.postalCode ?? '') }, isDefault: true, updatedAt: (options.now ?? (() => new Date().toISOString()))() };
      const next = [...entries]; if (index < 0) next.push(entry); else next[index] = entry;
      publish({ draft: { ...state.draft, ["addresses"]: next }, notice: 'Unsaved changes' });
    },
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
