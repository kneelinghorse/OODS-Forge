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
              <Input id="form-form-title-1" data-oods-component="Input" help="What the rule checks, in the engine's words." label="Description" placeholder="What the rule checks, in the engine's words." required v-model="description" />
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-0-3" data-oods-component="Input" help="The current search query string entered by the user." label="Search Query" placeholder="The current search query string entered by the user." :modelValue="handleChange_searchQueryState" @update:modelValue="setHandleChange_searchQueryState" @change="handleChange_searchQuery" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-1-5" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-3-13" data-oods-component="Select" help="What the engine concluded: violation on every finding of this run, because Stage1 writes needs-review, passed and not-applicable only as page counts." label="Result state" :options="[{'value':'violation','label':'violation'},{'value':'passed','label':'passed'},{'value':'needs_review','label':'needs_review'},{'value':'not_applicable','label':'not_applicable'},{'value':'not_measured','label':'not_measured'}]" placeholder="Enter result state" required :modelValue="handleChange_result_stateState" @update:modelValue="setHandleChange_result_stateState" @change="handleChange_result_state" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="When they were obtained." label="Obtained" placeholder="When they were obtained." required type="datetime-local" :modelValue="handleChange_provenance_atState" @update:modelValue="setHandleChange_provenance_atState" @change="handleChange_provenance_at" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" :modelValue="handleChange_pageState" @update:modelValue="setHandleChange_pageState" @change="handleChange_page" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Number of items displayed per page." label="Page Size" placeholder="Enter pageSize" required type="number" :modelValue="handleChange_pageSizeState" @update:modelValue="setHandleChange_pageSizeState" @change="handleChange_pageSize" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="The system that produced the record." label="Source" placeholder="Enter provenance source" required :modelValue="handleChange_provenance_sourceState" @update:modelValue="setHandleChange_provenance_sourceState" @change="handleChange_provenance_source" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Which record there." label="Record" placeholder="Enter provenance record" required :modelValue="handleChange_provenance_recordState" @update:modelValue="setHandleChange_provenance_recordState" @change="handleChange_provenance_record" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Where in that record the values were read." label="Read from" placeholder="Enter provenance locator" :modelValue="handleChange_provenance_locatorState" @update:modelValue="setHandleChange_provenance_locatorState" @change="handleChange_provenance_locator" />
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
import { Banner, Button, Checkbox, Input, Select, Stack } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  activeFilters?: Record<string, unknown>[];
  criteria?: string[];
  description?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  findingId?: string;
  helpUrl?: string;
  impact?: 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';
  nodeCount?: number;
  page?: number;
  pageUrl?: string;
  pageSize?: number;
  provenanceAt?: string;
  provenanceLocator?: string;
  provenanceMethod?: string;
  provenanceRecord?: string;
  provenanceSource?: string;
  resultState?: 'violation' | 'passed' | 'needs_review' | 'not_applicable' | 'not_measured';
  route?: string;
  ruleId?: string;
  searchActive?: boolean;
  searchQuery?: string;
  selectors?: string[];
  title?: string;
  totalItems?: number;
  totalPages?: number;
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
/** The rule's tags: WCAG criteria, best-practice and the standards it maps to. */
const criteria = ref<string[]>(generatedProps.criteria ?? []);
/** What the rule checks, in the engine's words. */
const description = ref<string>(generatedProps.description ?? '');
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** The page route and the rule, "<route>#<rule_id>": one rule failing on one page is one finding. */
const findingId = ref<string>(generatedProps.findingId ?? '');
/** The engine's page for the rule. */
const helpUrl = ref<string>(generatedProps.helpUrl ?? '');
/** The engine's impact for the rule. Stage1 keeps an unknown bucket beside axe's four. */
const impact = ref<'critical' | 'serious' | 'moderate' | 'minor' | 'unknown'>(generatedProps.impact ?? 'critical');
/** How many elements on the page fail the rule. */
const nodeCount = ref<number>(generatedProps.nodeCount ?? 0);
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** The page's full URL. */
const pageUrl = ref<string>(generatedProps.pageUrl ?? '');
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** When they were obtained. */
const provenanceAt = ref<string>(generatedProps.provenanceAt ?? '');
/** Where in that record the values were read. */
const provenanceLocator = ref<string>(generatedProps.provenanceLocator ?? '');
/** How the values were obtained. */
const provenanceMethod = ref<string>(generatedProps.provenanceMethod ?? '');
/** Which record there. */
const provenanceRecord = ref<string>(generatedProps.provenanceRecord ?? '');
/** The system that produced the record. */
const provenanceSource = ref<string>(generatedProps.provenanceSource ?? '');
/** What the engine concluded: violation on every finding of this run, because Stage1 writes needs-review, passed and not-applicable only as page counts. */
const resultState = ref<'violation' | 'passed' | 'needs_review' | 'not_applicable' | 'not_measured'>(generatedProps.resultState ?? 'violation');
/** The page the finding is on, as a route. */
const route = ref<string>(generatedProps.route ?? '');
/** The engine's rule id. */
const ruleId = ref<string>(generatedProps.ruleId ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** The failing elements, as the engine's selectors. */
const selectors = ref<string[]>(generatedProps.selectors ?? []);
/** The rule's one-line statement of what must hold (axe `help`), which names the finding. */
const title = ref<string>(generatedProps.title ?? '');
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_pageState = ref<string>(String(page.value ?? ''));
const setHandleChange_pageState = (value: string) => { handleChange_pageState.value = value; };
/* @oods-local-binding handleChange_page */ const handleChange_page = (value: string) => { setHandleChange_pageState(value); };
const handleChange_pageSizeState = ref<string>(String(pageSize.value ?? ''));
const setHandleChange_pageSizeState = (value: string) => { handleChange_pageSizeState.value = value; };
/* @oods-local-binding handleChange_pageSize */ const handleChange_pageSize = (value: string) => { setHandleChange_pageSizeState(value); };
const handleChange_provenance_atState = ref<string>(String(provenanceAt.value ?? ''));
const setHandleChange_provenance_atState = (value: string) => { handleChange_provenance_atState.value = value; };
/* @oods-local-binding handleChange_provenance_at */ const handleChange_provenance_at = (value: string) => { setHandleChange_provenance_atState(value); };
const handleChange_provenance_locatorState = ref<string>(String(provenanceLocator.value ?? ''));
const setHandleChange_provenance_locatorState = (value: string) => { handleChange_provenance_locatorState.value = value; };
/* @oods-local-binding handleChange_provenance_locator */ const handleChange_provenance_locator = (value: string) => { setHandleChange_provenance_locatorState(value); };
const handleChange_provenance_recordState = ref<string>(String(provenanceRecord.value ?? ''));
const setHandleChange_provenance_recordState = (value: string) => { handleChange_provenance_recordState.value = value; };
/* @oods-local-binding handleChange_provenance_record */ const handleChange_provenance_record = (value: string) => { setHandleChange_provenance_recordState(value); };
const handleChange_provenance_sourceState = ref<string>(String(provenanceSource.value ?? ''));
const setHandleChange_provenance_sourceState = (value: string) => { handleChange_provenance_sourceState.value = value; };
/* @oods-local-binding handleChange_provenance_source */ const handleChange_provenance_source = (value: string) => { setHandleChange_provenance_sourceState(value); };
const handleChange_result_stateState = ref<string>(String(resultState.value ?? ''));
const setHandleChange_result_stateState = (value: string) => { handleChange_result_stateState.value = value; };
/* @oods-local-binding handleChange_result_state */ const handleChange_result_state = (value: string) => { setHandleChange_result_stateState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_searchQueryState = ref<string>(String(searchQuery.value ?? ''));
const setHandleChange_searchQueryState = (value: string) => { handleChange_searchQueryState.value = value; };
/* @oods-local-binding handleChange_searchQuery */ const handleChange_searchQuery = (value: string) => { setHandleChange_searchQueryState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
