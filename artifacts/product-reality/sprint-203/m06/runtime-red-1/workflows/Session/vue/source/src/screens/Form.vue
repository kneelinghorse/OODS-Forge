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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Active','value':'active'},{'label':'Completed','value':'completed'},{'label':'Abandoned','value':'abandoned'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" :description="description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-5-17" data-oods-component="Select" help="What kind of sitting it was. The live store holds review, planning, custom, check-in and research — a classification, not a lifecycle, so it is Classifiable rather than a second state set." label="Session type" :options="[{'value':'review','label':'review'},{'value':'planning','label':'planning'},{'value':'custom','label':'custom'},{'value':'check-in','label':'check-in'},{'value':'research','label':'research'}]" placeholder="Enter session type" required :modelValue="handleChange_session_typeState" @update:modelValue="setHandleChange_session_typeState" @change="handleChange_session_type" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-8-23" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Started','value':'started'},{'label':'Completed','value':'completed'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Identifier of the canonical taxonomy node." label="Primary category id" placeholder="Enter primary category id" :modelValue="handleChange_primary_category_idState" @update:modelValue="setHandleChange_primary_category_idState" @change="handleChange_primary_category_id" />
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
import { Banner, Button, ClassificationEditor, Input, Select, Stack, StatusSelector } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  activeFilters?: Record<string, unknown>[];
  agent?: string;
  allowedTransitions?: string[];
  captures?: Record<string, unknown>[];
  categories?: unknown[];
  classificationMetadata?: unknown;
  completedAt?: string;
  createdAt?: string;
  description?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  label?: string;
  lastEvent?: 'started' | 'completed';
  lastEventAt?: string;
  nextSteps?: Record<string, unknown>[];
  page?: number;
  pageSize?: number;
  placeholder?: string;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  projectId?: string;
  searchActive?: boolean;
  searchQuery?: string;
  sessionId?: string;
  sessionType?: 'review' | 'planning' | 'custom' | 'check-in' | 'research';
  sprintId?: string;
  startedAt?: string;
  stateHistory?: unknown[];
  status?: 'active' | 'completed' | 'abandoned';
  summary?: string;
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
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
/** Who held the session — an agent rather than a user: assistant, codex, claude-opus-5 and others in the live store. No existing object models the actor as a non-user agent, which is why this is a field of its own rather than Ownerable. */
const agent = ref<string>(generatedProps.agent ?? '');
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** What the session recorded as it ran, as {timestamp, category, content} entries. */
const captures = ref<Record<string, unknown>[]>(generatedProps.captures ?? []);
/** Ordered taxonomy nodes scoped to the object. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** When it closed. Present on all 499 rows in the live store, but declared optional because an open session has none. */
const completedAt = ref<string>(generatedProps.completedAt ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
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
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'started' | 'completed'>(generatedProps.lastEvent ?? 'started');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** What it left for next time, in the same shape. Null on 45 of 499 rows. */
const nextSteps = ref<Record<string, unknown>[]>(generatedProps.nextSteps ?? []);
/** Current page number (1-based). */
const page = ref<number>(generatedProps.page ?? 0);
/** Number of items displayed per page. */
const pageSize = ref<number>(generatedProps.pageSize ?? 0);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** The project the session belongs to. A slug, never a uuid. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** The session's identifier, such as "PS-2026-09-16-002". */
const sessionId = ref<string>(generatedProps.sessionId ?? '');
/** What kind of sitting it was. The live store holds review, planning, custom, check-in and research — a classification, not a lifecycle, so it is Classifiable rather than a second state set. */
const sessionType = ref<'review' | 'planning' | 'custom' | 'check-in' | 'research'>(generatedProps.sessionType ?? 'review');
/** The sprint the session belongs to. 301 of 499 rows resolve against a sprint, none dangling, 198 null. */
const sprintId = ref<string>(generatedProps.sprintId ?? '');
/** When the session opened. Present on all 499 rows. */
const startedAt = ref<string>(generatedProps.startedAt ?? '');
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
const status = ref<'active' | 'completed' | 'abandoned'>(generatedProps.status ?? 'active');
/** What the session amounted to, in its own words. Present on all 499 rows and long free text. */
const summary = ref<string>(generatedProps.summary ?? '');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Canonical tag collection after synonym collapse. */
const tags = ref<unknown[]>(generatedProps.tags ?? []);
/** What the session was called, present on all 499 rows. */
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
const handleChange_session_typeState = ref<string>(String(sessionType.value ?? ''));
const setHandleChange_session_typeState = (value: string) => { handleChange_session_typeState.value = value; };
/* @oods-local-binding handleChange_session_type */ const handleChange_session_type = (value: string) => { setHandleChange_session_typeState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
