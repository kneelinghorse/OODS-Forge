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
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" :description="description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-2-7" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Name shown for this record." label="Name" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-7-21" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Updated','value':'updated'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
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
import { Banner, Button, Checkbox, ClassificationEditor, Input, Select, Stack } from '@oods/components-vue';
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
  clusterId?: string;
  createdAt?: string;
  description?: string;
  dominantCategory?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  isTrending?: boolean;
  label?: string;
  lastEvent?: 'updated';
  lastEventAt?: string;
  leadTitle?: string;
  leadUrl?: string;
  lens?: 'entity' | 'semantic';
  maxSimilarity?: number;
  meanSimilarity?: number;
  memberCount?: number;
  memberPeopleCount?: number;
  members?: Record<string, unknown>[];
  page?: number;
  pageSize?: number;
  people?: Record<string, unknown>[];
  placeholder?: string;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  searchActive?: boolean;
  searchQuery?: string;
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
  totalItems?: number;
  totalPages?: number;
  updatedAt?: string;
  windowDays?: number;
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
/** Hive's identifier for the cluster, an integer surrogate key declared as a string. Present on the entity lens; the semantic lens computes clusters on the fly and does not persist one. */
const clusterId = ref<string>(generatedProps.clusterId ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** The category most of its articles carry. Deliberately unconstrained: the server is authoritative and an unknown category is not coerced into the cohort's topic vocabulary, which is a different list serving a different purpose. */
const dominantCategory = ref<string>(generatedProps.dominantCategory ?? '');
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** Whether Hive marks the conversation as trending. */
const isTrending = ref<boolean>(generatedProps.isTrending ?? false);
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'updated'>(generatedProps.lastEvent ?? 'updated');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** The title of the article that leads the conversation. */
const leadTitle = ref<string>(generatedProps.leadTitle ?? '');
/** Where that article is. */
const leadUrl = ref<string>(generatedProps.leadUrl ?? '');
/** Which clusterer produced this record. Not a detail: the two lenses answer different questions and disagree by design — entity is the persisted entity-and-title-token clusterer that the co-talker counts are built from, semantic is an on-the-fly pgvector cosine at threshold 0.80 that finds two people writing about one idea in different vocabulary. A cluster is only meaningful beside the lens that produced it. */
const lens = ref<'entity' | 'semantic'>(generatedProps.lens ?? 'entity');
/** Semantic lens only: the strongest cosine similarity in the cluster. Absent on the entity lens, where it does not exist — absence means the lens did not produce it, never a similarity of zero. */
const maxSimilarity = ref<number>(generatedProps.maxSimilarity ?? 0);
/** Semantic lens only, on the same terms. */
const meanSimilarity = ref<number>(generatedProps.meanSimilarity ?? 0);
/** How many articles are in the conversation. */
const memberCount = ref<number>(generatedProps.memberCount ?? 0);
/** How many distinct cohort members are in it — the number that makes a cluster worth reading, since Hive's default is the multi-person cluster its own signal uniquely produces. */
const memberPeopleCount = ref<number>(generatedProps.memberPeopleCount ?? 0);
/** The articles themselves, as {article_id, title, url, published_at, category, person_id, person_name}. */
const members = ref<Record<string, unknown>[]>(generatedProps.members ?? []);
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** The cohort members in the conversation, as {person_id, name, primary_topic, article_count_in_cluster}. primary_topic travels with each of them so a cluster that spans several slices of the cohort can be read without a second lookup. */
const people = ref<Record<string, unknown>[]>(generatedProps.people ?? []);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
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
/** The lookback this record was read for. Every count here is only true of a window. */
const windowDays = ref<number>(generatedProps.windowDays ?? 0);

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
const handleChange_primary_category_idState = ref<string>(String(primaryCategoryId.value ?? ''));
const setHandleChange_primary_category_idState = (value: string) => { handleChange_primary_category_idState.value = value; };
/* @oods-local-binding handleChange_primary_category_id */ const handleChange_primary_category_id = (value: string) => { setHandleChange_primary_category_idState(value); };
const handleChange_primary_category_pathState = ref<string>(String(primaryCategoryPath.value ?? ''));
const setHandleChange_primary_category_pathState = (value: string) => { handleChange_primary_category_pathState.value = value; };
/* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (value: string) => { setHandleChange_primary_category_pathState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
