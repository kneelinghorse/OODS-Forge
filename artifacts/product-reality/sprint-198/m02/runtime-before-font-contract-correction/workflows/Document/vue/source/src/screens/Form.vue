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
                      <FormLabelGroup id="form-ve-title-26" data-oods-component="FormLabelGroup" :label="label" :description="description" :placeholder="placeholder" />
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Canonical research lifecycle. Display projection only: explicit latest failure, then embedded, chunked, processed, pending; missing input remains unknown." label="Status" :options="[{'label':'Pending','value':'pending'},{'label':'Processed','value':'processed'},{'label':'Chunked','value':'chunked'},{'label':'Embedded','value':'embedded'},{'label':'Failed','value':'failed'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Description" :description="description" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Validation status." label="Validation status" placeholder="Enter validation status" :modelValue="handleChange_validation_statusState" @update:modelValue="setHandleChange_validation_statusState" @change="handleChange_validation_status" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="uploaded_at when present; unavailable otherwise." label="Created at" placeholder="uploaded_at when present; unavailable otherwise." type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" :modelValue="handleChange_ownership_roleState" @update:modelValue="setHandleChange_ownership_roleState" @change="handleChange_ownership_role" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-4-15" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" :modelValue="handleChange_filterCountState" @update:modelValue="setHandleChange_filterCountState" @change="handleChange_filterCount" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Display projection of name; retain the complete source field." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Hint copy surfaced in form fields when the label is empty." label="Placeholder" placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Authoritative nullable server owner_id. Not exposed by the current response; unavailable until the API exposes it. Never derive from created_by, user_id, or project owner." label="Owner id" placeholder="Enter owner id" :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
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
import { Banner, Button, Checkbox, ClassificationEditor, FormLabelGroup, Input, Stack, StatusSelector } from '@oods/components-vue';
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
  categories?: unknown[];
  chunkCount?: number;
  chunked?: boolean;
  chunks?: unknown[];
  classificationMetadata?: unknown;
  collectionDate?: string;
  content?: string;
  createdAt?: string;
  description?: string;
  embedded?: boolean;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  id?: string;
  label?: string;
  lastEvent?: string;
  lastEventAt?: string;
  mimeType?: string;
  name?: string;
  ownerId?: string;
  ownerType?: 'user';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  page?: number;
  pageSize?: number;
  participantCount?: number;
  placeholder?: string;
  preview?: string;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  processed?: boolean;
  processingEvents?: unknown[];
  projectId?: string;
  rawContent?: string;
  searchActive?: boolean;
  searchQuery?: string;
  sourceType?: string;
  stateHistory?: unknown[];
  status?: 'pending' | 'processed' | 'chunked' | 'embedded' | 'failed';
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
  totalTokens?: number;
  totalItems?: number;
  totalPages?: number;
  transcriptionAccuracy?: number;
  updatedAt?: string;
  uploadedAt?: string;
  validationStatus?: string;
  wordCount?: number;
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
/** Ordered taxonomy nodes scoped to the object. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Chunk count. */
const chunkCount = ref<number>(generatedProps.chunkCount ?? 0);
/** Chunked. */
const chunked = ref<boolean>(generatedProps.chunked ?? false);
/** Chunks. */
const chunks = ref<unknown[]>(generatedProps.chunks ?? []);
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** Collection date. */
const collectionDate = ref<string>(generatedProps.collectionDate ?? '');
/** Content. */
const content = ref<string>(generatedProps.content ?? '');
/** uploaded_at when present; unavailable otherwise. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Embedded. */
const embedded = ref<boolean>(generatedProps.embedded ?? false);
/** File path. */
const filePath = ref<string>(generatedProps.filePath ?? '');
/** File size. */
const fileSize = ref<number>(generatedProps.fileSize ?? 0);
/** File type. */
const fileType = ref<string>(generatedProps.fileType ?? '');
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
/** Mime type. */
const mimeType = ref<string>(generatedProps.mimeType ?? '');
/** Name. */
const name = ref<string>(generatedProps.name ?? '');
/** Authoritative nullable server owner_id. Not exposed by the current response; unavailable until the API exposes it. Never derive from created_by, user_id, or project owner. */
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
/** Participant count. */
const participantCount = ref<number>(generatedProps.participantCount ?? 0);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Preview. */
const preview = ref<string>(generatedProps.preview ?? '');
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Processed. */
const processed = ref<boolean>(generatedProps.processed ?? false);
/** Processing events. */
const processingEvents = ref<unknown[]>(generatedProps.processingEvents ?? []);
/** Project id. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Raw content. */
const rawContent = ref<string>(generatedProps.rawContent ?? '');
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** Source type. */
const sourceType = ref<string>(generatedProps.sourceType ?? '');
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
/** Canonical research lifecycle. Display projection only: explicit latest failure, then embedded, chunked, processed, pending; missing input remains unknown. */
const status = ref<'pending' | 'processed' | 'chunked' | 'embedded' | 'failed'>(generatedProps.status ?? 'pending');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Tags. */
const tags = ref<unknown[]>(generatedProps.tags ?? []);
/** Total tokens. */
const totalTokens = ref<number>(generatedProps.totalTokens ?? 0);
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Transcription accuracy. */
const transcriptionAccuracy = ref<number>(generatedProps.transcriptionAccuracy ?? 0);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Uploaded at. */
const uploadedAt = ref<string>(generatedProps.uploadedAt ?? '');
/** Validation status. */
const validationStatus = ref<string>(generatedProps.validationStatus ?? '');
/** Word count. */
const wordCount = ref<number>(generatedProps.wordCount ?? 0);

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
const handleChange_ownership_roleState = ref<string>(String(ownershipRole.value ?? ''));
const setHandleChange_ownership_roleState = (value: string) => { handleChange_ownership_roleState.value = value; };
/* @oods-local-binding handleChange_ownership_role */ const handleChange_ownership_role = (value: string) => { setHandleChange_ownership_roleState(value); };
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_validation_statusState = ref<string>(String(validationStatus.value ?? ''));
const setHandleChange_validation_statusState = (value: string) => { handleChange_validation_statusState.value = value; };
/* @oods-local-binding handleChange_validation_status */ const handleChange_validation_status = (value: string) => { setHandleChange_validation_statusState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
