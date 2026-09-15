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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Proposed','value':'proposed'},{'label':'Active','value':'active'},{'label':'Paused','value':'paused'},{'label':'Completed','value':'completed'},{'label':'Terminated','value':'terminated'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
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
                                <Select id="form-slot-field-3-13" data-oods-component="Select" help="Semantic type describing the edge between the source and target." label="Relationship type" :options="[{'value':'membership','label':'membership'},{'value':'ownership','label':'ownership'},{'value':'follows','label':'follows'},{'value':'depends_on','label':'depends_on'},{'value':'references','label':'references'}]" placeholder="Enter relationship type" required :modelValue="handleChange_relationship_typeState" @update:modelValue="setHandleChange_relationship_typeState" @change="handleChange_relationship_type" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Checkbox id="form-slot-field-5-17" data-oods-component="Checkbox" help="Flag indicating whether the relationship is symmetric." label="Is bidirectional" :modelValue="handleChange_is_bidirectionalState" @update:modelValue="setHandleChange_is_bidirectionalState" @change="handleChange_is_bidirectional" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Name shown for this record." label="Name" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-8-23" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Created','value':'created'},{'label':'Activated','value':'activated'},{'label':'Paused','value':'paused'},{'label':'Terminated','value':'terminated'},{'label':'Reactivated','value':'reactivated'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Identifier of the owner." label="Owner id" placeholder="Enter owner id" required :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
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
import { Banner, Button, Checkbox, Input, Select, Stack, StatusSelector, TagInput, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  allowedTransitions?: string[];
  createdAt?: string;
  description?: string;
  direction?: 'unidirectional' | 'bidirectional';
  isBidirectional?: boolean;
  label?: string;
  lastEvent?: 'created' | 'activated' | 'paused' | 'terminated' | 'reactivated';
  lastEventAt?: string;
  neighborhood?: unknown[];
  originSource?: 'manual' | 'ingestion' | 'analytics' | 'integration';
  ownerId?: string;
  ownerType?: 'organization' | 'team' | 'platform';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  placeholder?: string;
  relationshipId?: string;
  relationshipType?: 'membership' | 'ownership' | 'follows' | 'depends_on' | 'references';
  sourceId?: string;
  stateHistory?: unknown[];
  status?: 'proposed' | 'active' | 'paused' | 'completed' | 'terminated';
  strength?: 'low' | 'medium' | 'high';
  tagCount?: number;
  tagMetadata?: Record<string, unknown>[];
  tags?: string[];
  targetId?: string;
  updatedAt?: string;
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
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Directionality applied when traversing the relationship. */
const direction = ref<'unidirectional' | 'bidirectional'>(generatedProps.direction ?? 'unidirectional');
/** Flag indicating whether the relationship is symmetric. */
const isBidirectional = ref<boolean>(generatedProps.isBidirectional ?? false);
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'created' | 'activated' | 'paused' | 'terminated' | 'reactivated'>(generatedProps.lastEvent ?? 'created');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** Edge records sharing an endpoint with this relationship, each containing source_id and target_id strings and an is_bidirectional boolean. Generated sample rows are explicitly synthetic. */
const neighborhood = ref<unknown[]>(generatedProps.neighborhood ?? []);
/** System that originated or inferred the relationship. */
const originSource = ref<'manual' | 'ingestion' | 'analytics' | 'integration'>(generatedProps.originSource ?? 'manual');
/** Identifier of the owning principal scoped by owner_type. */
const ownerId = ref<string>(generatedProps.ownerId ?? '');
/** Categorical owner type sourced from the ownerTypes parameter. */
const ownerType = ref<'organization' | 'team' | 'platform'>(generatedProps.ownerType ?? 'organization');
/** Optional role name describing how the owner governs the entity. */
const ownershipRole = ref<string>(generatedProps.ownershipRole ?? '');
/** Timestamp recording when ownership was last transferred. */
const ownershipTransferredAt = ref<string>(generatedProps.ownershipTransferredAt ?? '');
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Primary identifier for the relationship edge. */
const relationshipId = ref<string>(generatedProps.relationshipId ?? '');
/** Semantic type describing the edge between the source and target. */
const relationshipType = ref<'membership' | 'ownership' | 'follows' | 'depends_on' | 'references'>(generatedProps.relationshipType ?? 'membership');
/** Identifier of the source node in the relationship. */
const sourceId = ref<string>(generatedProps.sourceId ?? '');
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
const status = ref<'proposed' | 'active' | 'paused' | 'completed' | 'terminated'>(generatedProps.status ?? 'proposed');
/** Signal representing how strongly the entities are connected. */
const strength = ref<'low' | 'medium' | 'high'>(generatedProps.strength ?? 'low');
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
/** Identifier of the target node in the relationship. */
const targetId = ref<string>(generatedProps.targetId ?? '');
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_descriptionState = ref<string>(String(description.value ?? ''));
const setHandleChange_descriptionState = (value: string) => { handleChange_descriptionState.value = value; };
/* @oods-local-binding handleChange_description */ const handleChange_description = (value: string) => { setHandleChange_descriptionState(value); };
const handleChange_is_bidirectionalState = ref<boolean>(isBidirectional.value ?? false);
const setHandleChange_is_bidirectionalState = (checked: boolean) => { handleChange_is_bidirectionalState.value = checked; };
/* @oods-local-binding handleChange_is_bidirectional */ const handleChange_is_bidirectional = (checked: boolean) => { setHandleChange_is_bidirectionalState(checked); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_owner_idState = ref<string>(String(ownerId.value ?? ''));
const setHandleChange_owner_idState = (value: string) => { handleChange_owner_idState.value = value; };
/* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (value: string) => { setHandleChange_owner_idState(value); };
const handleChange_relationship_typeState = ref<string>(String(relationshipType.value ?? ''));
const setHandleChange_relationship_typeState = (value: string) => { handleChange_relationship_typeState.value = value; };
/* @oods-local-binding handleChange_relationship_type */ const handleChange_relationship_type = (value: string) => { setHandleChange_relationship_typeState(value); };
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
