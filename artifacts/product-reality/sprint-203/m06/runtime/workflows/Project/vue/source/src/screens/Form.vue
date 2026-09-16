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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Active','value':'active'},{'label':'Archived','value':'archived'},{'label':'Completed','value':'completed'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Textarea id="form-slot-field-0-3" data-oods-component="Textarea" help="Display projection of description; never truncates persisted content." label="Description" :modelValue="handleChange_descriptionState" @update:modelValue="setHandleChange_descriptionState" @change="handleChange_description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" :modelValue="handleChange_pageState" @update:modelValue="setHandleChange_pageState" @change="handleChange_page" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Created at." label="Created at" placeholder="Created at." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" :modelValue="handleChange_ownership_roleState" @update:modelValue="setHandleChange_ownership_roleState" @change="handleChange_ownership_role" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Number of items displayed per page." label="Page Size" placeholder="Enter pageSize" required type="number" :modelValue="handleChange_pageSizeState" @update:modelValue="setHandleChange_pageSizeState" @change="handleChange_pageSize" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Identifier of the owner." label="Owner id" placeholder="Enter owner id" :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
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
import { Banner, Button, Input, Stack, StatusSelector, TagInput, Textarea } from '@oods/components-vue';
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
  chunkCount?: number;
  createdAt?: string;
  description?: string;
  documentCount?: number;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  id?: string;
  label?: string;
  lastEvent?: string;
  lastEventAt?: string;
  lastQualityCheck?: string;
  lastUpdated?: string;
  methodology?: string;
  missionProtocolId?: string;
  name?: string;
  ownerId?: string;
  ownerType?: 'user';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  page?: number;
  pageSize?: number;
  placeholder?: string;
  projectId?: string;
  qualityScore?: number;
  reportCount?: number;
  researchType?: string;
  searchActive?: boolean;
  searchQuery?: string;
  stateHistory?: unknown[];
  status?: 'active' | 'archived' | 'completed';
  tagCount?: number;
  tagMetadata?: Record<string, unknown>[];
  tags?: string[];
  totalTokens?: number;
  totalItems?: number;
  totalPages?: number;
  updatedAt?: string;
  userId?: string;
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
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** Chunk count. */
const chunkCount = ref<number>(generatedProps.chunkCount ?? 0);
/** Created at. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Display projection of description; never truncates persisted content. */
const description = ref<string>(generatedProps.description ?? '');
/** Document count. */
const documentCount = ref<number>(generatedProps.documentCount ?? 0);
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
/** Display projection of name; retain the complete source field. */
const label = ref<string>(generatedProps.label ?? '');
/** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
const lastEvent = ref<string>(generatedProps.lastEvent ?? '');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Last quality check. */
const lastQualityCheck = ref<string>(generatedProps.lastQualityCheck ?? '');
/** Last updated. */
const lastUpdated = ref<string>(generatedProps.lastUpdated ?? '');
/** Methodology. */
const methodology = ref<string>(generatedProps.methodology ?? '');
/** Mission protocol id. */
const missionProtocolId = ref<string>(generatedProps.missionProtocolId ?? '');
/** Name. */
const name = ref<string>(generatedProps.name ?? '');
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
/** Project id. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Quality score. */
const qualityScore = ref<number>(generatedProps.qualityScore ?? 0);
/** Report count. */
const reportCount = ref<number>(generatedProps.reportCount ?? 0);
/** Research type. */
const researchType = ref<string>(generatedProps.researchType ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
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
/** Canonical research lifecycle. The API remains authoritative; do not coerce an unknown server value. */
const status = ref<'active' | 'archived' | 'completed'>(generatedProps.status ?? 'active');
/** Computed number of tags assigned to the entity. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Per-tag governance metadata. Each entry corresponds to a tag in the tags array and
tracks provenance and usage for taxonomy health monitoring.

Entry structure:
  - tag: string (the tag value, matches entry in tags array)
  - created_at: ISO 8601 datetime
  - created_by: string (user ID or "system" for allow-list tags)
  - usage_count: number (how many entities use this tag, computed)
  - moderation_status: "approved" | "pending" | "rejected" (when allowTagModeration is true)
  - canonical_form: string (resolved synonym target, when synonymResolution is enabled)
 */
const tagMetadata = ref<Record<string, unknown>[]>(generatedProps.tagMetadata ?? []);
/** Ordered list of tags assigned to the entity. */
const tags = ref<string[]>(generatedProps.tags ?? []);
/** Total tokens. */
const totalTokens = ref<number>(generatedProps.totalTokens ?? 0);
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Updated at. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** User id. */
const userId = ref<string>(generatedProps.userId ?? '');
/** Workspace id. */
const workspaceId = ref<string>(generatedProps.workspaceId ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_descriptionState = ref<string>(String(description.value ?? ''));
const setHandleChange_descriptionState = (value: string) => { handleChange_descriptionState.value = value; };
/* @oods-local-binding handleChange_description */ const handleChange_description = (value: string) => { setHandleChange_descriptionState(value); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_owner_idState = ref<string>(String(ownerId.value ?? ''));
const setHandleChange_owner_idState = (value: string) => { handleChange_owner_idState.value = value; };
/* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (value: string) => { setHandleChange_owner_idState(value); };
const handleChange_ownership_roleState = ref<string>(String(ownershipRole.value ?? ''));
const setHandleChange_ownership_roleState = (value: string) => { handleChange_ownership_roleState.value = value; };
/* @oods-local-binding handleChange_ownership_role */ const handleChange_ownership_role = (value: string) => { setHandleChange_ownership_roleState(value); };
const handleChange_pageState = ref<string>(String(page.value ?? ''));
const setHandleChange_pageState = (value: string) => { handleChange_pageState.value = value; };
/* @oods-local-binding handleChange_page */ const handleChange_page = (value: string) => { setHandleChange_pageState(value); };
const handleChange_pageSizeState = ref<string>(String(pageSize.value ?? ''));
const setHandleChange_pageSizeState = (value: string) => { handleChange_pageSizeState.value = value; };
/* @oods-local-binding handleChange_pageSize */ const handleChange_pageSize = (value: string) => { setHandleChange_pageSizeState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tagsState = ref<string>('');
const setHandleChange_tagsState = (value: string) => { handleChange_tagsState.value = value; };
/* @oods-local-binding handleChange_tags */ const handleChange_tags = (value: string) => { setHandleChange_tagsState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
