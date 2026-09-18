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
              <Input id="form-form-title-1" data-oods-component="Input" help="What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own." label="Target name" placeholder="What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own." required :modelValue="handleChange_target_nameState" @update:modelValue="setHandleChange_target_nameState" @change="handleChange_target_name" />
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
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="When they were obtained." label="Obtained" placeholder="When they were obtained." required type="datetime-local" :modelValue="handleChange_provenance_atState" @update:modelValue="setHandleChange_provenance_atState" @change="handleChange_provenance_at" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-4-15" data-oods-component="Select" help="The capture mode. Every run a run view reads is app; suite runs aggregate targets and carry no a11y report of their own." label="Mode" :options="[{'value':'app','label':'app'},{'value':'suite','label':'suite'}]" placeholder="Enter mode" required :modelValue="handleChange_modeState" @update:modelValue="setHandleChange_modeState" @change="handleChange_mode" />
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
  artifactCount?: number;
  authType?: string;
  criticalCount?: number;
  evidenceRetained?: boolean;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  findingCount?: number;
  minorCount?: number;
  mode?: 'app' | 'suite';
  moderateCount?: number;
  page?: number;
  pageCount?: number;
  pageSize?: number;
  passCount?: number;
  passesFailed?: number;
  provenanceAt?: string;
  provenanceLocator?: string;
  provenanceMethod?: string;
  provenanceRecord?: string;
  provenanceSource?: string;
  runId?: string;
  searchActive?: boolean;
  searchQuery?: string;
  seriousCount?: number;
  targetName?: string;
  targetUrl?: string;
  totalItems?: number;
  totalPages?: number;
  unknownCount?: number;
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
/** How many artifacts the run's index lists. */
const artifactCount = ref<number>(generatedProps.artifactCount ?? 0);
/** The authentication the manifest RECORDS. Shown as recorded, never inferred: Sprint 204 measured "none" on a capture that was authenticated, which is Stage1's to correct. */
const authType = ref<string>(generatedProps.authType ?? '');
/** Findings of critical impact. */
const criticalCount = ref<number>(generatedProps.criticalCount ?? 0);
/** Whether the run kept its evidence directory (evidence_retention.retained). */
const evidenceRetained = ref<boolean>(generatedProps.evidenceRetained ?? false);
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** How many rule failures the run found across its pages (a11y rollup.violation_count). */
const findingCount = ref<number>(generatedProps.findingCount ?? 0);
/** Findings of minor impact. */
const minorCount = ref<number>(generatedProps.minorCount ?? 0);
/** The capture mode. Every run a run view reads is app; suite runs aggregate targets and carry no a11y report of their own. */
const mode = ref<'app' | 'suite'>(generatedProps.mode ?? 'app');
/** Findings of moderate impact. */
const moderateCount = ref<number>(generatedProps.moderateCount ?? 0);
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** How many pages the accessibility pass read. */
const pageCount = ref<number>(generatedProps.pageCount ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** How many capture passes ran. */
const passCount = ref<number>(generatedProps.passCount ?? 0);
/** How many of those passes did not finish ok. */
const passesFailed = ref<number>(generatedProps.passesFailed ?? 0);
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
/** The capture's own id, a uuid Stage1 assigns; the directory name under out/stage1/<suite>/. */
const runId = ref<string>(generatedProps.runId ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** Findings of serious impact. */
const seriousCount = ref<number>(generatedProps.seriousCount ?? 0);
/** What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own. */
const targetName = ref<string>(generatedProps.targetName ?? '');
/** Where the capture started (targets[0].url). */
const targetUrl = ref<string>(generatedProps.targetUrl ?? '');
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Findings whose impact the engine did not state. Its own bucket: never folded into minor. */
const unknownCount = ref<number>(generatedProps.unknownCount ?? 0);

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_modeState = ref<string>(String(mode.value ?? ''));
const setHandleChange_modeState = (value: string) => { handleChange_modeState.value = value; };
/* @oods-local-binding handleChange_mode */ const handleChange_mode = (value: string) => { setHandleChange_modeState(value); };
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
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_searchQueryState = ref<string>(String(searchQuery.value ?? ''));
const setHandleChange_searchQueryState = (value: string) => { handleChange_searchQueryState.value = value; };
/* @oods-local-binding handleChange_searchQuery */ const handleChange_searchQuery = (value: string) => { setHandleChange_searchQueryState(value); };
const handleChange_target_nameState = ref<string>(String(targetName.value ?? ''));
const setHandleChange_target_nameState = (value: string) => { handleChange_target_nameState.value = value; };
/* @oods-local-binding handleChange_target_name */ const handleChange_target_name = (value: string) => { setHandleChange_target_nameState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
