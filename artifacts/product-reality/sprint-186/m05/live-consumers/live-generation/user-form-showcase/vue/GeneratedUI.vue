<template>
  <Stack id="screen-form-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default); padding: var(--ref-space-inset-default)">
      <Stack id="form-title-1" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
            <StatusSelector id="ve-title-26" data-oods-component="StatusSelector" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
            <TagInput id="ve-title-27" data-oods-component="TagInput" label="Ordered list of tags assigned to the entity." placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
            <AddressEditor id="ve-title-28" data-oods-component="AddressEditor" label="Collection of { role, address, metadata } entries keyed by role." data-oods-action="handleChange_addresses" @change="handleChange_addresses" />
          </Stack>
      <Stack id="form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
            <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <StatusTimeline id="slot-field-0-3" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                              <Text id="pg-status-timeline-134" data-oods-component="Text" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;">{{ handleChange_statusState }}</Text>
                              <Text id="pg-status-timeline-135" data-oods-component="Text" label="Materialized list of valid next states from the current status, computed from the&#10;transitionRules parameter. When transitionRules is null (open model), this contains&#10;all states except the current one. Used by StatusSelector to disable invalid options&#10;and by StatusBadge to indicate available paths.&#10;">{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}</Text>
                              <PreferenceEditor id="ve-field-0-29" data-oods-component="PreferenceEditor" :namespaces="preferenceNamespaces" />
                              <RoleAssignmentForm id="ve-field-0-30" data-oods-component="RoleAssignmentForm" :availableRoles="roleCatalog" />
                              <TemplatePicker id="ve-field-0-31" data-oods-component="TemplatePicker" :templates="templateCatalog" :channels="channelCatalog" />
                            </StatusTimeline>
                  </Stack>
            <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <DatePicker id="slot-field-1-5" data-oods-component="DatePicker" label="Field 1" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                  </Stack>
            <Stack id="form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-2-7" data-oods-component="Input" label="Computed number of tags assigned to the entity." placeholder="Enter tag count" required type="number" :modelValue="handleChange_tag_countState" @update:modelValue="setHandleChange_tag_countState" @change="handleChange_tag_count" />
                  </Stack>
            <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
            <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Textarea id="slot-field-4-15" data-oods-component="Textarea" label="Field 4" :modelValue="handleChange_nameState" @update:modelValue="setHandleChange_nameState" @change="handleChange_name" />
                  </Stack>
            <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
            <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
            <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Input id="slot-field-7-21" data-oods-component="Input" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                  </Stack>
            <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
            <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
          </Stack>
      <Stack id="form-actions-9" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: flex-end; padding: var(--ref-space-inset-default)">
            <Button id="form-submit-10" data-oods-component="Button" content="Save" type="submit" />
          </Stack>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-form-11">
    <button type="button" data-oods-action="handleChange" @click="handleChange()">Change</button>
    <button type="button" data-oods-action="handleSubmit" @click="handleSubmit()">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AddressEditor, Button, DatePicker, Input, PreferenceEditor, RoleAssignmentForm, Stack, StatusSelector, TagInput, TemplatePicker, Text, Textarea } from '@oods/components-vue';
import { StatusTimeline } from '@oods/components-vue/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:8d34e74d5c32a0ac604752249e369630e382e03991b58d88a9199a0add05b4a7 */
  /* @oods-domain-source sha256:7c3ae6feb9000b30f9248b6c15aa7765871a2d01e93cf9825373f138d43582d9 */
  handleChange: () => void;
  /* @oods-domain-action handleChange_addresses sha256:515e0ddc15637cc03dc89c12405207ef9209f322a44e5789c0d2512481433edd */
  /* @oods-domain-source sha256:25011d651f081b3092177dacc679d8ab188cd6d23254b5602458c8c07450f661 */
  handleChange_addresses: (address: Record<string, unknown>) => void;
  /* @oods-domain-action handleSubmit sha256:40dcacd8dc443bb231a9f4e83cdd8390bbf86979dacc3ed885912064ac94f846 */
  /* @oods-domain-source sha256:39f1e2024f9e76dc58ee38b1ae09943135d4d3f956ac63b59852fef68c598a99 */
  handleSubmit: () => void;
}

/** Ordered list of roles that currently have address entries. */
const addressRoles = ref<string[]>([]);
/** Collection of { role, address, metadata } entries keyed by role. */
const addresses = ref<unknown[]>([]);
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>([]);
/** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
const channelCatalog = ref<unknown[]>([]);
/** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
const conversations = ref<unknown[]>([]);
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>('');
/** Role surfaced in UI contexts when one address must be highlighted. */
const defaultAddressRole = ref<string>('');
/** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
const deliveryPolicies = ref<unknown[]>([]);
/** Supporting summary rendered in detail and card contexts. */
const description = ref<string>('');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<string>('');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>('');
/** SaaS membership triple (user_id, organization_id, role_id) with UNIQUE constraint (TABLE 4). */
const membershipRecords = ref<unknown[]>([]);
/** Delivery state machine transitions (queued → sent → delivered → failed → retried → read). */
const messageStatuses = ref<unknown[]>([]);
/** Atomic message payloads queued for delivery (R20.6 Part 1.2 primitives). */
const messages = ref<unknown[]>([]);
/** Human-friendly name rendered in headers and list contexts. */
const name = ref<string>('');
/** Atomic permissions following resource:action notation (TABLE 2). */
const permissionCatalog = ref<unknown[]>([]);
/** Normalized preference payload captured by PreferenceStore (version, preferences map, metadata). */
const preferenceDocument = ref<unknown>('');
/** Tracks schema version, lastUpdated timestamp, migration records, and source. */
const preferenceMetadata = ref<unknown>('');
/** Monotonic counter incremented whenever preferences mutate (invalidates caches). */
const preferenceMutations = ref<number>(0);
/** Materialized namespace list resolved from parameters/registry for auditing. */
const preferenceNamespaces = ref<string[]>([]);
/** SemVer mirror of preference_document.version for indexing and analytics. */
const preferenceVersion = ref<string>('');
/** Preferred display name surfaced in collaborative tooling. */
const preferredName = ref<string>('');
/** Canonical login email address for the user. */
const primaryEmail = ref<string>('');
/** Highest privilege role currently granted to the user. */
const role = ref<'end_user' | 'admin' | 'owner' | 'billing'>('end_user');
/** Canonical RBAC roles (R21.2 Part 4.2 TABLE 1). */
const roleCatalog = ref<unknown[]>([]);
/** Parent→child adjacency list for hierarchical RBAC (Part 3.1). */
const roleHierarchyEdges = ref<unknown[]>([]);
/** Junction map for role→permission edges (TABLE 3). */
const rolePermissions = ref<unknown>('');
/** Materialized roles granted within the current session/token exchange. */
const sessionRoles = ref<string[]>([]);
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
const stateHistory = ref<unknown[]>([]);
/** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
const status = ref<string>('');
/** Computed number of tags assigned to the entity. */
const tagCount = ref<number>(0);
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
const tagMetadata = ref<Record<string, unknown>[]>([]);
/** Ordered list of tags assigned to the entity. */
const tags = ref<string[]>([]);
/** Localized template definitions with declared variables per R20.1 Part 2.3. */
const templateCatalog = ref<unknown[]>([]);
/** Preferred timezone applied when rendering timestamps. */
const timezone = ref<string>('');
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>('');
/** Primary identifier used to correlate identity across services. */
const userId = ref<string>('');

const { actions } = defineProps<{ actions: GeneratedUIActions }>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange_addresses') || typeof actions.handleChange_addresses !== 'function') { throw new Error('GeneratedUI requires actions.handleChange_addresses.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

/* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
/* @oods-domain-binding handleChange_addresses */ const handleChange_addresses = (address: Record<string, unknown>) => { actions.handleChange_addresses(address); };
const handleChange_created_atState = ref<string>(String(createdAt.value ?? ''));
const setHandleChange_created_atState = (value: string) => { handleChange_created_atState.value = value; };
/* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (value: string) => { setHandleChange_created_atState(value); };
const handleChange_last_eventState = ref<string>(String(lastEvent.value ?? ''));
const setHandleChange_last_eventState = (value: string) => { handleChange_last_eventState.value = value; };
/* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (value: string) => { setHandleChange_last_eventState(value); };
const handleChange_nameState = ref<string>(String(name.value ?? ''));
const setHandleChange_nameState = (value: string) => { handleChange_nameState.value = value; };
/* @oods-local-binding handleChange_name */ const handleChange_name = (value: string) => { setHandleChange_nameState(value); };
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
