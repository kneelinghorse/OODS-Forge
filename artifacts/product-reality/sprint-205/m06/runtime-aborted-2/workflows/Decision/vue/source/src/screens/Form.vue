<template>
  <Stack id="form-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
              <DetailHeader id="form-form-title-1" data-oods-component="DetailHeader" />
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Supersession reason" :description="supersessionReason" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Whether this record still stands. Named apart from Stateful's `status` so an object can carry&#10;both a lifecycle and a supersession lineage.&#10;" label="Supersession status" placeholder="Enter supersession status" required :modelValue="handleChange_supersession_statusState" @update:modelValue="setHandleChange_supersession_statusState" @change="handleChange_supersession_status" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Identifier of the record that replaced this one. Present when the store records the forward&#10;pointer. Absent means not replaced, or not known — the two are distinguished by&#10;supersession_status, never by the pointer alone.&#10;" label="Superseded by" placeholder="Enter superseded by" :modelValue="handleChange_superseded_byState" @update:modelValue="setHandleChange_superseded_byState" @change="handleChange_superseded_by" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Identifier of the record this one replaced. Present when the store records the backward&#10;pointer. Never inferred from ordering.&#10;" label="Supersedes" placeholder="Enter supersedes" :modelValue="handleChange_supersedesState" @update:modelValue="setHandleChange_supersedesState" @change="handleChange_supersedes" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-7-21" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Captured','value':'captured'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Identifier of the canonical taxonomy node." label="Primary category id" placeholder="Enter primary category id" :modelValue="handleChange_primary_category_idState" @update:modelValue="setHandleChange_primary_category_idState" @change="handleChange_primary_category_id" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Human-readable breadcrumb path (Electronics &gt; Mobile &gt; Android)." label="Primary category path" placeholder="Enter primary category path" :modelValue="handleChange_primary_category_pathState" @update:modelValue="setHandleChange_primary_category_pathState" @change="handleChange_primary_category_path" />
                              </Stack>
                    </Stack>
              <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
                      <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Banner, Button, ClassificationEditor, DetailHeader, Input, Select, Stack } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  activeFilters?: Record<string, unknown>[];
  categories?: unknown[];
  classificationMetadata?: unknown;
  createdAt?: string;
  decisionId?: string;
  decisionText?: string;
  evidence?: Record<string, unknown>[];
  filterCount?: number;
  filters?: Record<string, unknown>[];
  lastEvent?: 'captured';
  lastEventAt?: string;
  missionId?: string;
  page?: number;
  pageSize?: number;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  projectDomain?: string;
  projectId?: string;
  searchActive?: boolean;
  searchQuery?: string;
  sessionId?: string;
  sprintId?: string;
  supersededAt?: string | null;
  supersededBy?: string;
  supersedes?: string;
  supersessionReason?: string;
  supersessionStatus?: string;
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
  totalItems?: number;
  totalPages?: number;
  updatedAt?: string;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
const activeFilters = ref<Record<string, unknown>[]>(generatedProps.activeFilters ?? []);
/** Ordered taxonomy nodes scoped to the object. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** The record's own identifier. CMOS assigns an integer; the object declares a string so the same shape carries another store's identifiers without coercion. */
const decisionId = ref<string>(generatedProps.decisionId ?? '');
/** The decision as it was written. The longest free text this registry carries: 61 to 8,418 characters in the live store, with 197 of 1,933 rows over 2,000, so every context that shows it must stay readable at 390 without hiding meaning. */
const decisionText = ref<string>(generatedProps.decisionText ?? '');
/** What the decision cites, as {type, id} references. Sparse (null on 1,923 rows) but real, and the rows a preview shows beside a design. */
const evidence = ref<Record<string, unknown>[]>(generatedProps.evidence ?? []);
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'captured'>(generatedProps.lastEvent ?? 'captured');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** The mission that captured it, as CMOS stores it. Recorded loosely — often a bare "m02" rather than a fully qualified "s203-m02" — so it is shown as a label and never as a resolved link. */
const missionId = ref<string>(generatedProps.missionId ?? '');
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Optional area within the project. Sparse — null on 1,850 of 1,933 rows. */
const projectDomain = ref<string>(generatedProps.projectDomain ?? '');
/** The project the decision belongs to. A slug such as "forge", never a uuid. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** The session that recorded the decision. Null on 838 of 1,933 rows. */
const sessionId = ref<string>(generatedProps.sessionId ?? '');
/** The sprint the decision was taken in. Every non-null value in the live store resolves against a sprint, none dangling. */
const sprintId = ref<string>(generatedProps.sprintId ?? '');
/** When the replacement happened, when the store records it. CMOS does not, so a Decision leaves
it absent rather than borrowing the replacement's creation time.
 */
const supersededAt = ref<string | null>(generatedProps.supersededAt ?? '');
/** Identifier of the record that replaced this one. Present when the store records the forward
pointer. Absent means not replaced, or not known — the two are distinguished by
supersession_status, never by the pointer alone.
 */
const supersededBy = ref<string>(generatedProps.supersededBy ?? '');
/** Identifier of the record this one replaced. Present when the store records the backward
pointer. Never inferred from ordering.
 */
const supersedes = ref<string>(generatedProps.supersedes ?? '');
/** Why the record was replaced, when the store carries a reason. */
const supersessionReason = ref<string>(generatedProps.supersessionReason ?? '');
/** Whether this record still stands. Named apart from Stateful's `status` so an object can carry
both a lifecycle and a supersession lineage.
 */
const supersessionStatus = ref<string>(generatedProps.supersessionStatus ?? '');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Canonical tag collection after synonym collapse. */
const tags = ref<unknown[]>(generatedProps.tags ?? []);
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_primary_category_idState = ref<string>(String(primaryCategoryId.value ?? ''));
const setHandleChange_primary_category_idState = (value: string) => { handleChange_primary_category_idState.value = value; };
/* @oods-local-binding handleChange_primary_category_id */ const handleChange_primary_category_id = (value: string) => { setHandleChange_primary_category_idState(value); };
const handleChange_primary_category_pathState = ref<string>(String(primaryCategoryPath.value ?? ''));
const setHandleChange_primary_category_pathState = (value: string) => { handleChange_primary_category_pathState.value = value; };
/* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (value: string) => { setHandleChange_primary_category_pathState(value); };
const handleChange_superseded_byState = ref<string>(String(supersededBy.value ?? ''));
const setHandleChange_superseded_byState = (value: string) => { handleChange_superseded_byState.value = value; };
/* @oods-local-binding handleChange_superseded_by */ const handleChange_superseded_by = (value: string) => { setHandleChange_superseded_byState(value); };
const handleChange_supersedesState = ref<string>(String(supersedes.value ?? ''));
const setHandleChange_supersedesState = (value: string) => { handleChange_supersedesState.value = value; };
/* @oods-local-binding handleChange_supersedes */ const handleChange_supersedes = (value: string) => { setHandleChange_supersedesState(value); };
const handleChange_supersession_statusState = ref<string>(String(supersessionStatus.value ?? ''));
const setHandleChange_supersession_statusState = (value: string) => { handleChange_supersession_statusState.value = value; };
/* @oods-local-binding handleChange_supersession_status */ const handleChange_supersession_status = (value: string) => { setHandleChange_supersession_statusState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
