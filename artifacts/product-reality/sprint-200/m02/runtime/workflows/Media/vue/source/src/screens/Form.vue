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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Ingested','value':'ingested'},{'label':'Processing','value':'processing'},{'label':'Available','value':'available'},{'label':'Deprecated','value':'deprecated'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <ClassificationEditor id="form-slot-field-0-3" data-oods-component="ClassificationEditor" label="Tag preview" :description="tagPreview" />
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-3-13" data-oods-component="Select" help="Media form factor guiding viewer presentation." label="Asset type" :options="[{'value':'image','label':'image'},{'value':'video','label':'video'},{'value':'audio','label':'audio'},{'value':'document','label':'document'}]" placeholder="Enter asset type" required :modelValue="handleChange_asset_typeState" @update:modelValue="setHandleChange_asset_typeState" @change="handleChange_asset_type" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Shown when the label is empty." label="Placeholder" placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-6-19" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Ingested','value':'ingested'},{'label':'Transcoded','value':'transcoded'},{'label':'Published','value':'published'},{'label':'Archived','value':'archived'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Identifier of the canonical taxonomy node." label="Primary category id" placeholder="Enter primary category id" :modelValue="handleChange_primary_category_idState" @update:modelValue="setHandleChange_primary_category_idState" @change="handleChange_primary_category_id" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Human-readable breadcrumb path (Electronics &gt; Mobile &gt; Android)." label="Primary category path" placeholder="Enter primary category path" :modelValue="handleChange_primary_category_pathState" @update:modelValue="setHandleChange_primary_category_pathState" @change="handleChange_primary_category_path" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Number of tags assigned to this record." label="Tag count" placeholder="Enter tag count" type="number" :modelValue="handleChange_tag_countState" @update:modelValue="setHandleChange_tag_countState" @change="handleChange_tag_count" />
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
import { Banner, Button, ClassificationEditor, FormLabelGroup, Input, Select, Stack, StatusSelector } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  allowedTransitions?: string[];
  assetType?: 'image' | 'video' | 'audio' | 'document';
  categories?: unknown[];
  checksum?: string;
  classificationMetadata?: unknown;
  createdAt?: string;
  description?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  heightPx?: number;
  label?: string;
  lastEvent?: 'ingested' | 'transcoded' | 'published' | 'archived';
  lastEventAt?: string;
  mediaId?: string;
  mimeType?: string;
  objectKey?: string;
  placeholder?: string;
  primaryCategoryId?: string;
  primaryCategoryPath?: string;
  sourceUrl?: string;
  stateHistory?: unknown[];
  status?: 'ingested' | 'processing' | 'available' | 'deprecated';
  storageBucket?: string;
  tagCount?: number;
  tagPreview?: string;
  tags?: unknown[];
  transcodingProfiles?: string[];
  updatedAt?: string;
  widthPx?: number;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** Media form factor guiding viewer presentation. */
const assetType = ref<'image' | 'video' | 'audio' | 'document'>(generatedProps.assetType ?? 'image');
/** Ordered taxonomy nodes scoped to the object. */
const categories = ref<unknown[]>(generatedProps.categories ?? []);
/** Hex-encoded checksum (SHA-256) for deduplication. */
const checksum = ref<string>(generatedProps.checksum ?? '');
/** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
const classificationMetadata = ref<unknown>(generatedProps.classificationMetadata ?? '');
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Media playback duration for video/audio assets. */
const durationSeconds = ref<number>(generatedProps.durationSeconds ?? 0);
/** Size of the binary payload in bytes. */
const fileSizeBytes = ref<number>(generatedProps.fileSizeBytes ?? 0);
/** Pixel height for images/videos when available. */
const heightPx = ref<number>(generatedProps.heightPx ?? 0);
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'ingested' | 'transcoded' | 'published' | 'archived'>(generatedProps.lastEvent ?? 'ingested');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Primary identifier for the media asset across services. */
const mediaId = ref<string>(generatedProps.mediaId ?? '');
/** IANA MIME type recorded at ingestion. */
const mimeType = ref<string>(generatedProps.mimeType ?? '');
/** Provider-specific path or key referencing the binary object. */
const objectKey = ref<string>(generatedProps.objectKey ?? '');
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Identifier of the canonical taxonomy node. */
const primaryCategoryId = ref<string>(generatedProps.primaryCategoryId ?? '');
/** Human-readable breadcrumb path (Electronics > Mobile > Android). */
const primaryCategoryPath = ref<string>(generatedProps.primaryCategoryPath ?? '');
/** Canonical CDN URL for public consumption. */
const sourceUrl = ref<string>(generatedProps.sourceUrl ?? '');
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
const status = ref<'ingested' | 'processing' | 'available' | 'deprecated'>(generatedProps.status ?? 'ingested');
/** Storage namespace (S3 bucket, GCS bucket) backing the asset. */
const storageBucket = ref<string>(generatedProps.storageBucket ?? '');
/** Number of canonical tags assigned to the object. */
const tagCount = ref<number>(generatedProps.tagCount ?? 0);
/** Denormalized comma-delimited preview for list renders. */
const tagPreview = ref<string>(generatedProps.tagPreview ?? '');
/** Canonical tag collection after synonym collapse. */
const tags = ref<unknown[]>(generatedProps.tags ?? []);
/** List of transcoding profiles generated for the asset. */
const transcodingProfiles = ref<string[]>(generatedProps.transcodingProfiles ?? []);
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Pixel width for images/videos when available. */
const widthPx = ref<number>(generatedProps.widthPx ?? 0);

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_asset_typeState = ref<string>(String(assetType.value ?? ''));
const setHandleChange_asset_typeState = (value: string) => { handleChange_asset_typeState.value = value; };
/* @oods-local-binding handleChange_asset_type */ const handleChange_asset_type = (value: string) => { setHandleChange_asset_typeState(value); };
const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_primary_category_idState = ref<string>(String(primaryCategoryId.value ?? ''));
const setHandleChange_primary_category_idState = (value: string) => { handleChange_primary_category_idState.value = value; };
/* @oods-local-binding handleChange_primary_category_id */ const handleChange_primary_category_id = (value: string) => { setHandleChange_primary_category_idState(value); };
const handleChange_primary_category_pathState = ref<string>(String(primaryCategoryPath.value ?? ''));
const setHandleChange_primary_category_pathState = (value: string) => { handleChange_primary_category_pathState.value = value; };
/* @oods-local-binding handleChange_primary_category_path */ const handleChange_primary_category_path = (value: string) => { setHandleChange_primary_category_pathState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tag_countState = ref<string>(String(tagCount.value ?? ''));
const setHandleChange_tag_countState = (value: string) => { handleChange_tag_countState.value = value; };
/* @oods-local-binding handleChange_tag_count */ const handleChange_tag_count = (value: string) => { setHandleChange_tag_countState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
