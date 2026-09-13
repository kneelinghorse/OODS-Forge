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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Canonical research lifecycle. The API remains authoritative; do not coerce an unknown server value." label="Status" :options="[{'label':'Draft','value':'draft'},{'label':'Queued','value':'queued'},{'label':'In Progress','value':'in_progress'},{'label':'Completed','value':'completed'},{'label':'Blocked','value':'blocked'},{'label':'Cancelled','value':'cancelled'},{'label':'Validation Failed','value':'validation_failed'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
                      <CancellationForm id="form-ve-title-29" data-oods-component="CancellationForm" :allowedReasons="[]" codeHelp="Structured reason code chosen from the allowedReasons parameter." embedded reasonHelp="Free-form detail describing why cancellation occurred." :reason="cancellationReason" :reasonCode="cancellationReasonCode" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Textarea id="form-slot-field-0-3" data-oods-component="Textarea" help="Display projection of title; retain the complete source field." label="Label" :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Created at." label="Created at" placeholder="Created at." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" :modelValue="handleChange_ownership_roleState" @update:modelValue="setHandleChange_ownership_roleState" @change="handleChange_ownership_role" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Computed number of tags assigned to the entity." label="Tag count" placeholder="Enter tag count" required type="number" :modelValue="handleChange_tag_countState" @update:modelValue="setHandleChange_tag_countState" @change="handleChange_tag_count" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-5-17" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" :modelValue="handleChange_searchActiveState" @update:modelValue="setHandleChange_searchActiveState" @change="handleChange_searchActive" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Hint copy surfaced in form fields when the label is empty." label="Placeholder" placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Authoritative nullable server owner_id. Not exposed by the current response; unavailable until the API exposes it. Never derive from created_by, user_id, or project owner." label="Owner id" placeholder="Enter owner id" :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" :modelValue="handleChange_pageState" @update:modelValue="setHandleChange_pageState" @change="handleChange_page" />
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
import { Banner, Button, CancellationForm, Checkbox, FormLabelGroup, Input, Stack, StatusSelector, TagInput, Textarea } from '@oods/components-vue';
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
  background?: string;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
  cancellationReasonCode?: string;
  cancellationRequestedAt?: string;
  completedAt?: string;
  constraints?: string[];
  context?: Record<string, unknown>;
  coverageThresholds?: Record<string, unknown>;
  createdAt?: string;
  createdBy?: string;
  currentPhase?: string;
  deepsearchAttemptCount?: number;
  deepsearchJobId?: string;
  deliverableFormat?: string;
  deliverables?: string[];
  description?: string;
  errorMessage?: string;
  excludedEntities?: string[];
  executionMetadata?: Record<string, unknown>;
  expectedOutputSchema?: Record<string, unknown>;
  filterCount?: number;
  filters?: Record<string, unknown>[];
  focus?: string;
  id?: string;
  label?: string;
  lastEvent?: string;
  lastEventAt?: string;
  leaseExpiresAt?: string;
  materializationAttemptCount?: number;
  materializationError?: string;
  materializationPending?: boolean;
  materializationStatus?: string;
  maxLoops?: number;
  metadata?: Record<string, unknown>;
  minLoops?: number;
  missionId?: string;
  objective?: string;
  ownerId?: string;
  ownerType?: 'user';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  page?: number;
  pageSize?: number;
  placeholder?: string;
  progressPercent?: number;
  projectId?: string;
  projectName?: string;
  queuedAt?: string;
  references?: Record<string, unknown>[];
  requiredEntities?: string[];
  researchPhases?: Record<string, unknown>;
  resultDocumentIds?: string[];
  resultMarkdown?: string;
  resultProtocol?: Record<string, unknown>;
  resultReportId?: string;
  searchReady?: boolean;
  searchActive?: boolean;
  searchQuery?: string;
  startedAt?: string;
  stateHistory?: unknown[];
  status?: 'draft' | 'queued' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'validation_failed';
  successCriteria?: string[];
  tagCount?: number;
  tagMetadata?: Record<string, unknown>[];
  tags?: string[];
  title?: string;
  totalItems?: number;
  totalPages?: number;
  updatedAt?: string;
  validationThresholds?: Record<string, unknown>;
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
/** Background. */
const background = ref<string>(generatedProps.background ?? '');
/** TraceLab cancellation is immediate; no billing period exists. Period-end controls must not be used. */
const cancelAtPeriodEnd = ref<boolean>(generatedProps.cancelAtPeriodEnd ?? false);
/** Free-form detail describing why cancellation occurred. */
const cancellationReason = ref<string>(generatedProps.cancellationReason ?? '');
/** Structured reason code chosen from the allowedReasons parameter. */
const cancellationReasonCode = ref<string>(generatedProps.cancellationReasonCode ?? '');
/** Timestamp capturing when the cancellation workflow was initiated. */
const cancellationRequestedAt = ref<string>(generatedProps.cancellationRequestedAt ?? '');
/** Completed at. */
const completedAt = ref<string>(generatedProps.completedAt ?? '');
/** Constraints. */
const constraints = ref<string[]>(generatedProps.constraints ?? []);
/** Context. */
const context = ref<Record<string, unknown>>(generatedProps.context ?? {});
/** Coverage thresholds. */
const coverageThresholds = ref<Record<string, unknown>>(generatedProps.coverageThresholds ?? {});
/** Created at. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Created by. */
const createdBy = ref<string>(generatedProps.createdBy ?? '');
/** Current phase. */
const currentPhase = ref<string>(generatedProps.currentPhase ?? '');
/** Deepsearch attempt count. */
const deepsearchAttemptCount = ref<number>(generatedProps.deepsearchAttemptCount ?? 0);
/** Deepsearch job id. */
const deepsearchJobId = ref<string>(generatedProps.deepsearchJobId ?? '');
/** Deliverable format. */
const deliverableFormat = ref<string>(generatedProps.deliverableFormat ?? '');
/** Deliverables. */
const deliverables = ref<string[]>(generatedProps.deliverables ?? []);
/** Display projection of objective; never truncates persisted content. */
const description = ref<string>(generatedProps.description ?? '');
/** Error message. */
const errorMessage = ref<string>(generatedProps.errorMessage ?? '');
/** Excluded entities. */
const excludedEntities = ref<string[]>(generatedProps.excludedEntities ?? []);
/** Execution metadata. */
const executionMetadata = ref<Record<string, unknown>>(generatedProps.executionMetadata ?? {});
/** Expected output schema. */
const expectedOutputSchema = ref<Record<string, unknown>>(generatedProps.expectedOutputSchema ?? {});
/** Computed count of currently active filters. */
const filterCount = ref<number>(generatedProps.filterCount ?? 0);
/** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
const filters = ref<Record<string, unknown>[]>(generatedProps.filters ?? []);
/** Focus. */
const focus = ref<string>(generatedProps.focus ?? '');
/** Id. */
const id = ref<string>(generatedProps.id ?? '');
/** Display projection of title; retain the complete source field. */
const label = ref<string>(generatedProps.label ?? '');
/** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
const lastEvent = ref<string>(generatedProps.lastEvent ?? '');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Lease expires at. */
const leaseExpiresAt = ref<string>(generatedProps.leaseExpiresAt ?? '');
/** Materialization attempt count. */
const materializationAttemptCount = ref<number>(generatedProps.materializationAttemptCount ?? 0);
/** Materialization error. */
const materializationError = ref<string>(generatedProps.materializationError ?? '');
/** Materialization pending. */
const materializationPending = ref<boolean>(generatedProps.materializationPending ?? false);
/** Materialization status. */
const materializationStatus = ref<string>(generatedProps.materializationStatus ?? '');
/** Max loops. */
const maxLoops = ref<number>(generatedProps.maxLoops ?? 0);
/** Metadata. */
const metadata = ref<Record<string, unknown>>(generatedProps.metadata ?? {});
/** Min loops. */
const minLoops = ref<number>(generatedProps.minLoops ?? 0);
/** Human-readable mission identifier (e.g., B16.1) */
const missionId = ref<string>(generatedProps.missionId ?? '');
/** What this mission aims to achieve (minimum 10 characters) */
const objective = ref<string>(generatedProps.objective ?? '');
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
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Progress percent. */
const progressPercent = ref<number>(generatedProps.progressPercent ?? 0);
/** Project id. */
const projectId = ref<string>(generatedProps.projectId ?? '');
/** Name of the associated project */
const projectName = ref<string>(generatedProps.projectName ?? '');
/** Queued at. */
const queuedAt = ref<string>(generatedProps.queuedAt ?? '');
/** References. */
const references = ref<Record<string, unknown>[]>(generatedProps.references ?? []);
/** Required entities. */
const requiredEntities = ref<string[]>(generatedProps.requiredEntities ?? []);
/** Research phases. */
const researchPhases = ref<Record<string, unknown>>(generatedProps.researchPhases ?? {});
/** Result document ids. */
const resultDocumentIds = ref<string[]>(generatedProps.resultDocumentIds ?? []);
/** Result markdown. */
const resultMarkdown = ref<string>(generatedProps.resultMarkdown ?? '');
/** Result protocol. */
const resultProtocol = ref<Record<string, unknown>>(generatedProps.resultProtocol ?? {});
/** Result report id. */
const resultReportId = ref<string>(generatedProps.resultReportId ?? '');
/** Search ready. */
const searchReady = ref<boolean>(generatedProps.searchReady ?? false);
/** Whether the search input is currently focused or has a non-empty query. */
const searchActive = ref<boolean>(generatedProps.searchActive ?? false);
/** The current search query string entered by the user. */
const searchQuery = ref<string>(generatedProps.searchQuery ?? '');
/** Started at. */
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
/** Canonical research lifecycle. The API remains authoritative; do not coerce an unknown server value. */
const status = ref<'draft' | 'queued' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'validation_failed'>(generatedProps.status ?? 'draft');
/** Array of measurable success conditions */
const successCriteria = ref<string[]>(generatedProps.successCriteria ?? []);
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
/** Tags. */
const tags = ref<string[]>(generatedProps.tags ?? []);
/** Mission title */
const title = ref<string>(generatedProps.title ?? '');
/** Total number of items across all pages. Used to compute total page count. */
const totalItems = ref<number>(generatedProps.totalItems ?? 0);
/** Computed total number of pages (ceil(totalItems / pageSize)). */
const totalPages = ref<number>(generatedProps.totalPages ?? 0);
/** Updated at. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Validation thresholds. */
const validationThresholds = ref<Record<string, unknown>>(generatedProps.validationThresholds ?? {});

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
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
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_searchActiveState = ref<boolean>(searchActive.value ?? false);
const setHandleChange_searchActiveState = (checked: boolean) => { handleChange_searchActiveState.value = checked; };
/* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (checked: boolean) => { setHandleChange_searchActiveState(checked); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tag_countState = ref<string>(String(tagCount.value ?? ''));
const setHandleChange_tag_countState = (value: string) => { handleChange_tag_countState.value = value; };
/* @oods-local-binding handleChange_tag_count */ const handleChange_tag_count = (value: string) => { setHandleChange_tag_countState(value); };
const handleChange_tagsState = ref<string>('');
const setHandleChange_tagsState = (value: string) => { handleChange_tagsState.value = value; };
/* @oods-local-binding handleChange_tags */ const handleChange_tags = (value: string) => { setHandleChange_tagsState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
