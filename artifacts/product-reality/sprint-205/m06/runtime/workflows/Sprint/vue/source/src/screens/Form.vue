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
              <Stack id="form-form-title-1" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Active','value':'active'},{'label':'Completed','value':'completed'},{'label':'Archived','value':'archived'},{'label':'Reverted','value':'reverted'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Textarea id="form-slot-field-0-3" data-oods-component="Textarea" help="Supporting description used in detail and card contexts." label="Description" :modelValue="handleChange_descriptionState" @update:modelValue="setHandleChange_descriptionState" @change="handleChange_description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-3-13" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="When the sprint began. Null on 54 of 186 rows, and not uniformly shaped: some rows carry a date and some a full timestamp, so it is declared as text and never reformatted as if it were known to be one or the other." label="Start date" placeholder="When the sprint began. Null on 54 of 186 rows, and not uniformly shaped: some rows carry a date and some a full timestamp, so it is declared as text and never reformatted as if it were known to be one or the other." :modelValue="handleChange_start_dateState" @update:modelValue="setHandleChange_start_dateState" @change="handleChange_start_date" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="When the sprint ended, on the same terms. Null on 47 of 186 rows." label="End date" placeholder="When the sprint ended, on the same terms. Null on 47 of 186 rows." :modelValue="handleChange_end_dateState" @update:modelValue="setHandleChange_end_dateState" @change="handleChange_end_date" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-7-21" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Started','value':'started'},{'label':'Ended','value':'ended'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" :modelValue="handleChange_pageState" @update:modelValue="setHandleChange_pageState" @change="handleChange_page" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Number of items displayed per page." label="Page Size" placeholder="Enter pageSize" required type="number" :modelValue="handleChange_pageSizeState" @update:modelValue="setHandleChange_pageSizeState" @change="handleChange_pageSize" />
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
import { Banner, Button, Checkbox, Input, Select, Stack, StatusSelector, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  activeFilters?: Record<string, unknown>[];
  allowedTransitions?: string[];
  completedMissionCount?: number;
  createdAt?: string;
  description?: string;
  endDate?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  focus?: string;
  label?: string;
  lastEvent?: 'started' | 'ended';
  lastEventAt?: string;
  missionCount?: number;
  page?: number;
  pageSize?: number;
  placeholder?: string;
  projectId?: string;
  searchActive?: boolean;
  searchQuery?: string;
  sprintId?: string;
  startDate?: string;
  stateHistory?: unknown[];
  status?: 'active' | 'completed' | 'archived' | 'reverted';
  title?: string;
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
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** How many of those missions are completed, counted the same way. */
const completedMissionCount = ref<number>(generatedProps.completedMissionCount ?? 0);
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** When the sprint ended, on the same terms. Null on 47 of 186 rows. */
const endDate = ref<string>(generatedProps.endDate ?? '');
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** What the sprint is for, in the author's own words. Present on all 186 rows and long free text, so it carries the same readability risk as a decision. */
const focus = ref<string>(generatedProps.focus ?? '');
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'started' | 'ended'>(generatedProps.lastEvent ?? 'started');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** How many missions the sprint carries, counted from the missions table. CMOS also declares total_missions and completed_missions columns, but they are null on 176 and 177 of 186 rows, so this object counts rather than reading a counter that is almost always blank. */
const missionCount = ref<number>(generatedProps.missionCount ?? 0);
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** The project the sprint belongs to. A slug, never a uuid. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** The sprint's identifier, treated as opaque and never parsed: the live store holds both "sprint-203" and "Sprint 22" and both are authoritative. */
const sprintId = ref<string>(generatedProps.sprintId ?? '');
/** When the sprint began. Null on 54 of 186 rows, and not uniformly shaped: some rows carry a date and some a full timestamp, so it is declared as text and never reformatted as if it were known to be one or the other. */
const startDate = ref<string>(generatedProps.startDate ?? '');
/** Chronological log of state transitions. Each entry records the before/after states,
timestamp, and (when governance is enabled) the actor, reason, and transition metadata.
Rendered by StatusTimeline in the detail and timeline views.

Entry structure:
  - from: string (previous state)
  - to: string (new state)
  - timestamp: ISO 8601 datetime
  - actor_id: string (user/system who triggered the transition, optional)
  - reason: string (human-readable justification, required when requireTransitionReason is true)
  - transition_metadata: Record<string, unknown> (arbitrary context, optional)
 */
const stateHistory = ref<unknown[]>(generatedProps.stateHistory ?? []);
/** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
const status = ref<'active' | 'completed' | 'archived' | 'reverted'>(generatedProps.status ?? 'active');
/** The sprint's title, present on all 186 rows. */
const title = ref<string>(generatedProps.title ?? '');
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
const handleChange_descriptionState = ref<string>(String(description.value ?? ''));
const setHandleChange_descriptionState = (value: string) => { handleChange_descriptionState.value = value; };
/* @oods-local-binding handleChange_description */ const handleChange_description = (value: string) => { setHandleChange_descriptionState(value); };
const handleChange_end_dateState = ref<string>(String(endDate.value ?? ''));
const setHandleChange_end_dateState = (value: string) => { handleChange_end_dateState.value = value; };
/* @oods-local-binding handleChange_end_date */ const handleChange_end_date = (value: string) => { setHandleChange_end_dateState(value); };
const handleChange_filterCountState = ref<string>(String(filterCount.value ?? ''));
const setHandleChange_filterCountState = (value: string) => { handleChange_filterCountState.value = value; };
/* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (value: string) => { setHandleChange_filterCountState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_pageState = ref<string>(String(page.value ?? ''));
const setHandleChange_pageState = (value: string) => { handleChange_pageState.value = value; };
/* @oods-local-binding handleChange_page */ const handleChange_page = (value: string) => { setHandleChange_pageState(value); };
const handleChange_pageSizeState = ref<string>(String(pageSize.value ?? ''));
const setHandleChange_pageSizeState = (value: string) => { handleChange_pageSizeState.value = value; };
/* @oods-local-binding handleChange_pageSize */ const handleChange_pageSize = (value: string) => { setHandleChange_pageSizeState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_start_dateState = ref<string>(String(startDate.value ?? ''));
const setHandleChange_start_dateState = (value: string) => { handleChange_start_dateState.value = value; };
/* @oods-local-binding handleChange_start_date */ const handleChange_start_date = (value: string) => { setHandleChange_start_dateState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
