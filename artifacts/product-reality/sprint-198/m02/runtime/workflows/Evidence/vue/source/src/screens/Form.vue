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
              <FormLabelGroup id="form-form-title-1" data-oods-component="FormLabelGroup" :label="label" :description="description" :placeholder="placeholder" />
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" :description="description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Created at." label="Created at" placeholder="Created at." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-2-7" data-oods-component="Select" help="user only when an authoritative owner_id is present." label="Owner type" :options="[{'value':'user','label':'user'}]" placeholder="Enter owner type" :modelValue="handleChange_owner_typeState" @update:modelValue="setHandleChange_owner_typeState" @change="handleChange_owner_type" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Number of canonical tags assigned to the object." label="Tag count" placeholder="Enter tag count" type="number" :modelValue="handleChange_tag_countState" @update:modelValue="setHandleChange_tag_countState" @change="handleChange_tag_count" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Display projection of claim; retain the complete source field." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Hint copy surfaced in form fields when the label is empty." label="Placeholder" placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Authoritative nullable server owner_id. Present in this response." label="Owner id" placeholder="Enter owner id" :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
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
import { Banner, Button, ClassificationEditor, FormLabelGroup, Input, Select, Stack } from '@oods/components-vue';
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
  claim?: string;
  classificationMetadata?: unknown;
  createdAt?: string;
  description?: string;
  disposition?: 'supporting' | 'contradicting' | 'rejected' | 'background';
  filterCount?: number;
  filters?: Record<string, unknown>[];
  id?: string;
  label?: string;
  lastEvent?: string;
  lastEventAt?: string;
  missionId?: string;
  origin?: 'mcp-agent' | 'deepsearch-worker';
  ownerId?: string;
  ownerType?: 'user';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  page?: number;
  pageSize?: number;
  placeholder?: string;
  primaryCategoryId?: 'supporting' | 'contradicting' | 'rejected' | 'background';
  primaryCategoryPath?: string;
  projectId?: string;
  query?: string;
  searchActive?: boolean;
  searchQuery?: string;
  sessionKey?: string;
  snippet?: string;
  sourceId?: string;
  sourceSightingCount?: number;
  sourceUrl?: string;
  summary?: string;
  tagCount?: number;
  tagPreview?: string;
  tags?: string[];
  totalItems?: number;
  totalPages?: number;
  updatedAt?: string;
  workspaceId?: string;
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
/** One fixed category with id and label derived from disposition; no inferred taxonomy. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Claim. */
const claim = ref<string>(generatedProps.claim ?? '');
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** Created at. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Display projection of summary; never truncates persisted content. */
const description = ref<string>(generatedProps.description ?? '');
/** Disposition. */
const disposition = ref<'supporting' | 'contradicting' | 'rejected' | 'background'>(generatedProps.disposition ?? 'supporting');
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** Id. */
const id = ref<string>(generatedProps.id ?? '');
/** Display projection of claim; retain the complete source field. */
const label = ref<string>(generatedProps.label ?? '');
/** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
const lastEvent = ref<string>(generatedProps.lastEvent ?? '');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Mission id. */
const missionId = ref<string>(generatedProps.missionId ?? '');
/** Origin. */
const origin = ref<'mcp-agent' | 'deepsearch-worker'>(generatedProps.origin ?? 'mcp-agent');
/** Authoritative nullable server owner_id. Present in this response. */
const ownerId = ref<string>(generatedProps.ownerId ?? '');
/** user only when an authoritative owner_id is present. */
const ownerType = ref<'user'>(generatedProps.ownerType ?? 'user');
/** Optional role name describing how the owner governs the entity. */
const ownershipRole = ref<string>(generatedProps.ownershipRole ?? '');
/** Timestamp recording when ownership was last transferred. */
const ownershipTransferredAt = ref<string>(generatedProps.ownershipTransferredAt ?? '');
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Exact disposition; classification dimension, never a lifecycle state. */
const primaryCategoryId = ref<'supporting' | 'contradicting' | 'rejected' | 'background'>(generatedProps.primaryCategoryId ?? 'supporting');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Project id. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Query. */
const query = ref<string>(generatedProps.query ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** Session key. */
const sessionKey = ref<string>(generatedProps.sessionKey ?? '');
/** Snippet. */
const snippet = ref<string>(generatedProps.snippet ?? '');
/** Source id. */
const sourceId = ref<string>(generatedProps.sourceId ?? '');
/** Source sighting count. */
const sourceSightingCount = ref<number>(generatedProps.sourceSightingCount ?? 0);
/** Source url. */
const sourceUrl = ref<string>(generatedProps.sourceUrl ?? '');
/** Summary. */
const summary = ref<string>(generatedProps.summary ?? '');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Tags. */
const tags = ref<string[]>(generatedProps.tags ?? []);
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Updated at. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Workspace id. */
const workspaceId = ref<string>(generatedProps.workspaceId ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_owner_idState = ref<string>(String(ownerId.value ?? ''));
const setHandleChange_owner_idState = (value: string) => { handleChange_owner_idState.value = value; };
/* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (value: string) => { setHandleChange_owner_idState(value); };
const handleChange_owner_typeState = ref<string>(String(ownerType.value ?? ''));
const setHandleChange_owner_typeState = (value: string) => { handleChange_owner_typeState.value = value; };
/* @oods-local-binding handleChange_owner_type */ const handleChange_owner_type = (value: string) => { setHandleChange_owner_typeState(value); };
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_primary_category_pathState = ref<string>(String(primaryCategoryPath.value ?? ''));
const setHandleChange_primary_category_pathState = (value: string) => { handleChange_primary_category_pathState.value = value; };
/* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (value: string) => { setHandleChange_primary_category_pathState(value); };
const handleChange_tag_countState = ref<string>(String(tagCount.value ?? ''));
const setHandleChange_tag_countState = (value: string) => { handleChange_tag_countState.value = value; };
/* @oods-local-binding handleChange_tag_count */ const handleChange_tag_count = (value: string) => { setHandleChange_tag_countState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
