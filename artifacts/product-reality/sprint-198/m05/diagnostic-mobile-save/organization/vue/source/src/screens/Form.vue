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
                      <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" label="Status" :options="[{'label':'Prospect','value':'prospect'},{'label':'Onboarding','value':'onboarding'},{'label':'Active','value':'active'},{'label':'Churned','value':'churned'}]" :modelValue="handleChange_statusState" @update:modelValue="setHandleChange_statusState" @change="handleChange_status" />
                      <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" :modelValue="handleChange_tagsState" @update:modelValue="setHandleChange_tagsState" @change="handleChange_tags" :tags="tags" />
                      <AddressEditor id="form-ve-title-29" data-oods-component="AddressEditor" label="Addresses" :street="collectionAddress(addresses, defaultAddressRole).street" :city="collectionAddress(addresses, defaultAddressRole).city" :region="collectionAddress(addresses, defaultAddressRole).region" :postalCode="collectionAddress(addresses, defaultAddressRole).postalCode" data-oods-action="handleChange_addresses" @change="handleChange_addresses" />
                    </Stack>
              <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Stack id="form-slot-field-0-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                            <PreferenceEditor id="form-ve-field-0-30" data-oods-component="PreferenceEditor" :namespaces="preferenceNamespaces" :document="JSON.stringify(preferenceDocument ?? {}, null, 2)" />
                                            <RoleAssignmentForm id="form-ve-field-0-31" data-oods-component="RoleAssignmentForm" :availableRoles="roleCatalog" />
                                            <TemplatePicker id="form-ve-field-0-32" data-oods-component="TemplatePicker" :templates="templateCatalog" :channels="channelCatalog" />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)" />
                      <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-2-7" data-oods-component="Select" help="Billing plan currently assigned to the organization." label="Plan tier" :options="[{'value':'free','label':'free'},{'value':'growth','label':'growth'},{'value':'enterprise','label':'enterprise'}]" placeholder="Enter plan tier" required :modelValue="handleChange_plan_tierState" @update:modelValue="setHandleChange_plan_tierState" @change="handleChange_plan_tier" />
                              </Stack>
                      <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-3-13" data-oods-component="Input" help="Timestamp recording when ownership was last transferred." label="Ownership transferred at" placeholder="Timestamp recording when ownership was last transferred." type="datetime-local" :modelValue="handleChange_ownership_transferred_atState" @update:modelValue="setHandleChange_ownership_transferred_atState" @change="handleChange_ownership_transferred_at" />
                              </Stack>
                      <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-4-15" data-oods-component="Input" help="Computed number of tags assigned to the entity." label="Tag count" placeholder="Enter tag count" required type="number" :modelValue="handleChange_tag_countState" @update:modelValue="setHandleChange_tag_countState" @change="handleChange_tag_count" />
                              </Stack>
                      <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-5-17" data-oods-component="Input" help="Primary contact email for invoicing and finance escalations." label="Billing contact email" placeholder="Enter billing contact email" type="email" :modelValue="handleChange_billing_contact_emailState" @update:modelValue="setHandleChange_billing_contact_emailState" @change="handleChange_billing_contact_email" />
                              </Stack>
                      <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-6-19" data-oods-component="Input" help="Human-readable display name rendered in primary surfaces." label="Label" placeholder="Enter label" required :modelValue="handleChange_labelState" @update:modelValue="setHandleChange_labelState" @change="handleChange_label" />
                              </Stack>
                      <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-7-21" data-oods-component="Input" help="Hint copy surfaced in form fields when the label is empty." label="Placeholder" placeholder="Enter placeholder" :modelValue="handleChange_placeholderState" @update:modelValue="setHandleChange_placeholderState" @change="handleChange_placeholder" />
                              </Stack>
                      <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Input id="form-slot-field-8-23" data-oods-component="Input" help="Identifier of the owning principal scoped by owner_type." label="Owner id" placeholder="Enter owner id" required :modelValue="handleChange_owner_idState" @update:modelValue="setHandleChange_owner_idState" @change="handleChange_owner_id" />
                              </Stack>
                      <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                <Select id="form-slot-field-9-25" data-oods-component="Select" help="Categorical owner type sourced from the ownerTypes parameter." label="Owner type" :options="[{'label':'Parent Organization','value':'parent_organization'},{'label':'Reseller','value':'reseller'},{'label':'Platform','value':'platform'}]" required :modelValue="handleChange_owner_typeState" @update:modelValue="setHandleChange_owner_typeState" @change="handleChange_owner_type" />
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
import { AddressEditor, Banner, Button, FormLabelGroup, Input, PreferenceEditor, RoleAssignmentForm, Select, Stack, StatusSelector, TagInput, TemplatePicker } from '@oods/components-vue';
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
  billingContactEmail?: string;
  billingStatus?: 'good_standing' | 'past_due' | 'unpaid' | 'suspended';
  channelCatalog?: unknown[];
  conversations?: unknown[];
  createdAt?: string;
  dataResidency?: 'us' | 'eu' | 'apac' | 'latam';
  defaultAddressRole?: 'headquarters' | 'office' | 'warehouse' | 'branch';
  deliveryPolicies?: unknown[];
  description?: string;
  domain?: string;
  employeeCount?: number;
  industry?: string;
  label?: string;
  lastEvent?: 'created' | 'plan_upgraded' | 'plan_downgraded' | 'ownership_transferred';
  lastEventAt?: string;
  membershipRecords?: unknown[];
  messageStatuses?: unknown[];
  messages?: unknown[];
  organizationId?: string;
  ownerId?: string;
  ownerType?: 'parent_organization' | 'reseller' | 'platform';
  ownershipRole?: string;
  ownershipTransferredAt?: string;
  permissionCatalog?: unknown[];
  placeholder?: string;
  planTier?: 'free' | 'growth' | 'enterprise';
  preferenceDocument?: unknown;
  preferenceMetadata?: unknown;
  preferenceMutations?: number;
  preferenceNamespaces?: string[];
  preferenceVersion?: string;
  roleCatalog?: unknown[];
  roleHierarchyEdges?: unknown[];
  rolePermissions?: unknown;
  sessionRoles?: string[];
  stateHistory?: unknown[];
  status?: 'prospect' | 'onboarding' | 'active' | 'churned';
  tagCount?: number;
  tagMetadata?: Record<string, unknown>[];
  tags?: string[];
  templateCatalog?: unknown[];
  updatedAt?: string;
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
/** Primary contact email for invoicing and finance escalations. */
const billingContactEmail = ref<string>(generatedProps.billingContactEmail ?? '');
/** Coarse account-level financial standing used by the billing subsystem. Intentionally coarser than the subscription lifecycle: this is a 4-state account vocabulary {good_standing, past_due, unpaid, suspended}, NOT the 8-state billing.subscription.status set. See docs/billing/lifecycle-states.md. */
const billingStatus = ref<'good_standing' | 'past_due' | 'unpaid' | 'suspended'>(generatedProps.billingStatus ?? 'good_standing');
/** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
const channelCatalog = ref<unknown[]>(generatedProps.channelCatalog ?? []);
/** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
const conversations = ref<unknown[]>(generatedProps.conversations ?? []);
/** Timestamp recording when the entity was first created. */
const createdAt = ref<string>(generatedProps.createdAt ?? '');
/** Preferred data residency region selected during onboarding. */
const dataResidency = ref<'us' | 'eu' | 'apac' | 'latam'>(generatedProps.dataResidency ?? 'us');
/** Role surfaced in UI contexts when one address must be highlighted. */
const defaultAddressRole = ref<'headquarters' | 'office' | 'warehouse' | 'branch'>(generatedProps.defaultAddressRole ?? 'headquarters');
/** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
const deliveryPolicies = ref<unknown[]>(generatedProps.deliveryPolicies ?? []);
/** Supporting description used in detail and card contexts. */
const description = ref<string>(generatedProps.description ?? '');
/** Verified root domain associated with the organization. */
const domain = ref<string>(generatedProps.domain ?? '');
/** Reported number of active employees. */
const employeeCount = ref<number>(generatedProps.employeeCount ?? 0);
/** Optional NAICS-derived industry tag. */
const industry = ref<string>(generatedProps.industry ?? '');
/** Human-readable display name rendered in primary surfaces. */
const label = ref<string>(generatedProps.label ?? '');
/** Lifecycle event associated with the most recent timestamp mutation. */
const lastEvent = ref<'created' | 'plan_upgraded' | 'plan_downgraded' | 'ownership_transferred'>(generatedProps.lastEvent ?? 'created');
/** Timestamp for the lifecycle event captured in last_event. */
const lastEventAt = ref<string>(generatedProps.lastEventAt ?? '');
/** SaaS membership triple (user_id, organization_id, role_id) with UNIQUE constraint (TABLE 4). */
const membershipRecords = ref<unknown[]>(generatedProps.membershipRecords ?? []);
/** Delivery state machine transitions (queued → sent → delivered → failed → retried → read). */
const messageStatuses = ref<unknown[]>(generatedProps.messageStatuses ?? []);
/** Atomic message payloads queued for delivery (R20.6 Part 1.2 primitives). */
const messages = ref<unknown[]>(generatedProps.messages ?? []);
/** Primary identifier for the organization tenant. */
const organizationId = ref<string>(generatedProps.organizationId ?? '');
/** Identifier of the owning principal scoped by owner_type. */
const ownerId = ref<string>(generatedProps.ownerId ?? '');
/** Categorical owner type sourced from the ownerTypes parameter. */
const ownerType = ref<'parent_organization' | 'reseller' | 'platform'>(generatedProps.ownerType ?? 'parent_organization');
/** Optional role name describing how the owner governs the entity. */
const ownershipRole = ref<string>(generatedProps.ownershipRole ?? '');
/** Timestamp recording when ownership was last transferred. */
const ownershipTransferredAt = ref<string>(generatedProps.ownershipTransferredAt ?? '');
/** Atomic permissions following resource:action notation (TABLE 2). */
const permissionCatalog = ref<unknown[]>(generatedProps.permissionCatalog ?? []);
/** Hint copy surfaced in form fields when the label is empty. */
const placeholder = ref<string>(generatedProps.placeholder ?? '');
/** Billing plan currently assigned to the organization. */
const planTier = ref<'free' | 'growth' | 'enterprise'>(generatedProps.planTier ?? 'free');
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
const status = ref<'prospect' | 'onboarding' | 'active' | 'churned'>(generatedProps.status ?? 'prospect');
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
/** Timestamp for the most recent modification, when available. */
const updatedAt = ref<string>(generatedProps.updatedAt ?? '');

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange_addresses') || typeof actions.handleChange_addresses !== 'function') { throw new Error('GeneratedUI requires actions.handleChange_addresses.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

/* @oods-domain-binding handleChange_addresses */ const handleChange_addresses = (address: Record<string, unknown>) => { actions.handleChange_addresses(address); };
const handleChange_billing_contact_emailState = ref<string>(String(billingContactEmail.value ?? ''));
const setHandleChange_billing_contact_emailState = (value: string) => { handleChange_billing_contact_emailState.value = value; };
/* @oods-local-binding handleChange_billing_contact_email */ const handleChange_billing_contact_email = (value: string) => { setHandleChange_billing_contact_emailState(value); };
const handleChange_labelState = ref<string>(String(label.value ?? ''));
const setHandleChange_labelState = (value: string) => { handleChange_labelState.value = value; };
/* @oods-local-binding handleChange_label */ const handleChange_label = (value: string) => { setHandleChange_labelState(value); };
const handleChange_owner_idState = ref<string>(String(ownerId.value ?? ''));
const setHandleChange_owner_idState = (value: string) => { handleChange_owner_idState.value = value; };
/* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (value: string) => { setHandleChange_owner_idState(value); };
const handleChange_owner_typeState = ref<string>(String(ownerType.value ?? ''));
const setHandleChange_owner_typeState = (value: string) => { handleChange_owner_typeState.value = value; };
/* @oods-local-binding handleChange_owner_type */ const handleChange_owner_type = (value: string) => { setHandleChange_owner_typeState(value); };
const handleChange_ownership_transferred_atState = ref<string>(String(ownershipTransferredAt.value ?? ''));
const setHandleChange_ownership_transferred_atState = (value: string) => { handleChange_ownership_transferred_atState.value = value; };
/* @oods-local-binding handleChange_ownership_transferred_at */ const handleChange_ownership_transferred_at = (value: string) => { setHandleChange_ownership_transferred_atState(value); };
const handleChange_placeholderState = ref<string>(String(placeholder.value ?? ''));
const setHandleChange_placeholderState = (value: string) => { handleChange_placeholderState.value = value; };
/* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (value: string) => { setHandleChange_placeholderState(value); };
const handleChange_plan_tierState = ref<string>(String(planTier.value ?? ''));
const setHandleChange_plan_tierState = (value: string) => { handleChange_plan_tierState.value = value; };
/* @oods-local-binding handleChange_plan_tier */ const handleChange_plan_tier = (value: string) => { setHandleChange_plan_tierState(value); };
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
