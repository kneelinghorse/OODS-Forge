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
                      <StatusSelector id="form-ve-title-26" data-oods-component="StatusSelector" help="Choose the current status." label="Status" :options="[{'label':'Invited','value':'invited'},{'label':'Active','value':'active'},{'label':'Suspended','value':'suspended'},{'label':'Deactivated','value':'deactivated'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <TagInput id="form-ve-title-27" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
                      <AddressEditor id="form-ve-title-28" data-oods-component="AddressEditor" label="Addresses" :street="collectionAddress(addresses, defaultAddressRole).street" :city="collectionAddress(addresses, defaultAddressRole).city" :region="collectionAddress(addresses, defaultAddressRole).region" :postalCode="collectionAddress(addresses, defaultAddressRole).postalCode" data-oods-action="handleChange_addresses" @change="handleChange_addresses" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Stack id="form-slot-field-0-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                            <PreferenceEditor id="form-ve-field-0-29" data-oods-component="PreferenceEditor" :namespaces="preferenceNamespaces" :document="JSON.stringify(preferenceDocument ?? {}, null, 2)" />
                                            <TemplatePicker id="form-ve-field-0-31" data-oods-component="TemplatePicker" :templates="templateCatalog" :channels="channelCatalog" />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-1-5" data-oods-component="Input" help="Timestamp recording when the entity was first created." label="Created at" placeholder="Timestamp recording when the entity was first created." required type="datetime-local" :modelValue="handleChange_created_atState" @update:modelValue="setHandleChange_created_atState" @change="handleChange_created_at" />
                              </Stack>
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-2-7" data-oods-component="Input" help="Preferred timezone applied when rendering timestamps." label="Timezone" placeholder="Preferred timezone applied when rendering timestamps." :modelValue="handleChange_timezoneState" @update:modelValue="setHandleChange_timezoneState" @change="handleChange_timezone" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-3-13" data-oods-component="Select" help="Highest privilege role currently granted to the user." label="Role" :options="[{'value':'end_user','label':'end_user'},{'value':'admin','label':'admin'},{'value':'owner','label':'owner'},{'value':'billing','label':'billing'}]" placeholder="Enter role" required :modelValue="handleChange_roleState" @update:modelValue="setHandleChange_roleState" @change="handleChange_role" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Human-friendly name rendered in headers and list contexts." label="Name" placeholder="Human-friendly name rendered in headers and list contexts." required :modelValue="handleChange_nameState" @update:modelValue="setHandleChange_nameState" @change="handleChange_name" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Canonical login email address for the user." label="Primary email" placeholder="Enter primary email" required type="email" :modelValue="handleChange_primary_emailState" @update:modelValue="setHandleChange_primary_emailState" @change="handleChange_primary_email" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-6-19" data-oods-component="Select" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" :options="[{'label':'Created','value':'created'},{'label':'Profile Updated','value':'profile_updated'},{'label':'Status Changed','value':'status_changed'},{'label':'Role Updated','value':'role_updated'}]" required :modelValue="handleChange_last_eventState" @update:modelValue="setHandleChange_last_eventState" @change="handleChange_last_event" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-9-25" data-oods-component="Input" help="Primary identifier used to correlate identity across services." label="User id" placeholder="Enter user id" required :modelValue="handleChange_user_idState" @update:modelValue="setHandleChange_user_idState" @change="handleChange_user_id" />
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
import { collectionAddress, collectionSummary } from '../store';

import { ref } from 'vue';
import { AddressEditor, Banner, Button, Input, PreferenceEditor, Select, Stack, StatusSelector, TagInput, TemplatePicker } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleChange_addresses: (address: Record<string, unknown>) => void;
  handleSubmit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  addressRoles?: string[];
  addresses?: unknown[];
  allowedTransitions?: string[];
  channelCatalog?: unknown[];
  conversations?: unknown[];
  createdAt?: string;
  defaultAddressRole?: 'home' | 'billing' | 'shipping';
  deliveryPolicies?: unknown[];
  description?: string;
  lastEvent?: 'created' | 'profile_updated' | 'status_changed' | 'role_updated';
  lastEventAt?: string;
  membershipRecords?: unknown[];
  messageStatuses?: unknown[];
  messages?: unknown[];
  name?: string;
  permissionCatalog?: unknown[];
  preferenceDocument?: unknown;
  preferenceMetadata?: unknown;
  preferenceMutations?: number;
  preferenceNamespaces?: string[];
  preferenceVersion?: string;
  preferredName?: string;
  primaryEmail?: string;
  role?: 'end_user' | 'admin' | 'owner' | 'billing';
  roleCatalog?: unknown[];
  roleHierarchyEdges?: unknown[];
  rolePermissions?: unknown;
  sessionRoles?: string[];
  stateHistory?: unknown[];
  status?: 'invited' | 'active' | 'suspended' | 'deactivated';
  tagCount?: number;
  tagMetadata?: Record<string, unknown>[];
  tags?: string[];
  templateCatalog?: unknown[];
  timezone?: string;
  updatedAt?: string;
  userId?: string;
}
const generatedProps = defineProps<Props>();
const actions = generatedProps.actions;
const uiState = generatedProps.uiState;
/** Ordered list of roles that currently have address entries. */
const addressRoles = ref<string[]>(generatedProps.addressRoles ?? []);
/** Collection of { role, address, metadata } entries keyed by role. */
const addresses = ref<unknown[]>(generatedProps.addresses ?? []);
/** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
const allowedTransitions = ref<string[]>(generatedProps.allowedTransitions ?? []);
/** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
const channelCatalog = ref<unknown[]>(generatedProps.channelCatalog ?? []);
/** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
const conversations = ref<unknown[]>(generatedProps.conversations ?? []);
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Role surfaced in UI contexts when one address must be highlighted. */
const defaultAddressRole = ref<'home' | 'billing' | 'shipping'>(generatedProps.defaultAddressRole ?? 'home');
/** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
const deliveryPolicies = ref<unknown[]>(generatedProps.deliveryPolicies ?? []);
/** Supporting summary rendered in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'created' | 'profile_updated' | 'status_changed' | 'role_updated'>(generatedProps.lastEvent ?? 'created');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** SaaS membership triple (user_id, organization_id, role_id) with UNIQUE constraint (TABLE 4). */
const membershipRecords = ref<unknown[]>(generatedProps.membershipRecords ?? []);
/** Delivery state machine transitions (queued → sent → delivered → failed → retried → read). */
const messageStatuses = ref<unknown[]>(generatedProps.messageStatuses ?? []);
/** Atomic message payloads queued for delivery (R20.6 Part 1.2 primitives). */
const messages = ref<unknown[]>(generatedProps.messages ?? []);
/** Human-friendly name rendered in headers and list contexts. */
const name = ref<string>(generatedProps.name ?? '');
/** Atomic permissions following resource:action notation (TABLE 2). */
const permissionCatalog = ref<unknown[]>(generatedProps.permissionCatalog ?? []);
/** Normalized preference payload captured by PreferenceStore (version, preferences map, metadata). */
const preferenceDocument = ref<unknown>(generatedProps.preferenceDocument ?? '');
/** Tracks schema version, lastUpdated timestamp, migration records, and source. */
const preferenceMetadata = ref<unknown>(generatedProps.preferenceMetadata ?? '');
/** Monotonic counter incremented whenever preferences mutate (invalidates caches). */
const preferenceMutations = ref<number>(generatedProps.preferenceMutations ?? 0);
/** Materialized namespace list resolved from parameters/registry for auditing. */
const preferenceNamespaces = ref<string[]>(generatedProps.preferenceNamespaces ?? []);
/** SemVer mirror of preference_document.version for indexing and analytics. */
const preferenceVersion = ref<string>(generatedProps.preferenceVersion ?? '');
/** Preferred display name surfaced in collaborative tooling. */
const preferredName = ref<string>(generatedProps.preferredName ?? '');
/** Canonical login email address for the user. */
const primaryEmail = ref<string>(generatedProps.primaryEmail ?? '');
/** Highest privilege role currently granted to the user. */
const role = ref<'end_user' | 'admin' | 'owner' | 'billing'>(generatedProps.role ?? 'end_user');
/** Canonical RBAC roles (R21.2 Part 4.2 TABLE 1). */
const roleCatalog = ref<unknown[]>(generatedProps.roleCatalog ?? []);
/** Parent→child adjacency list for hierarchical RBAC (Part 3.1). */
const roleHierarchyEdges = ref<unknown[]>(generatedProps.roleHierarchyEdges ?? []);
/** Junction map for role→permission edges (TABLE 3). */
const rolePermissions = ref<unknown>(generatedProps.rolePermissions ?? '');
/** Materialized roles granted within the current session/token exchange. */
const sessionRoles = ref<string[]>(generatedProps.sessionRoles ?? []);
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
const status = ref<'invited' | 'active' | 'suspended' | 'deactivated'>(generatedProps.status ?? 'invited');
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
/** Localized template definitions with declared variables per R20.1 Part 2.3. */
const templateCatalog = ref<unknown[]>(generatedProps.templateCatalog ?? []);
/** Preferred timezone applied when rendering timestamps. */
const timezone = ref<string>(generatedProps.timezone ?? '');
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');
/** Primary identifier used to correlate identity across services. */
const userId = ref<string>(generatedProps.userId ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange_addresses') || typeof actions.handleChange_addresses !== 'function') { throw new Error('GeneratedUI requires actions.handleChange_addresses.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

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
const handleChange_primary_emailState = ref<string>(String(primaryEmail.value ?? ''));
const setHandleChange_primary_emailState = (value: string) => { handleChange_primary_emailState.value = value; };
/* @oods-local-binding handleChange_primary_email */ const handleChange_primary_email = (value: string) => { setHandleChange_primary_emailState(value); };
const handleChange_roleState = ref<string>(String(role.value ?? ''));
const setHandleChange_roleState = (value: string) => { handleChange_roleState.value = value; };
/* @oods-local-binding handleChange_role */ const handleChange_role = (value: string) => { setHandleChange_roleState(value); };
const handleChange_statusState = ref<string>(String(status.value ?? ''));
const setHandleChange_statusState = (value: string) => { handleChange_statusState.value = value; };
/* @oods-local-binding handleChange_status */ const handleChange_status = (value: string) => { setHandleChange_statusState(value); };
const handleChange_tagsState = ref<string>('');
const setHandleChange_tagsState = (value: string) => { handleChange_tagsState.value = value; };
/* @oods-local-binding handleChange_tags */ const handleChange_tags = (value: string) => { setHandleChange_tagsState(value); };
const handleChange_timezoneState = ref<string>(String(timezone.value ?? ''));
const setHandleChange_timezoneState = (value: string) => { handleChange_timezoneState.value = value; };
/* @oods-local-binding handleChange_timezone */ const handleChange_timezone = (value: string) => { setHandleChange_timezoneState(value); };
const handleChange_user_idState = ref<string>(String(userId.value ?? ''));
const setHandleChange_user_idState = (value: string) => { handleChange_user_idState.value = value; };
/* @oods-local-binding handleChange_user_id */ const handleChange_user_id = (value: string) => { setHandleChange_user_idState(value); };
/* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
