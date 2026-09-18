<template>
  <Stack id="detail-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style="align-items: space-between; display: flex; flex-direction: column; gap: var(--ref-space-stack-default); padding: var(--ref-space-inset-default)">
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <DetailHeader id="detail-ve-header-28" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="2" />
                                <StatusTimeline id="detail-ve-header-29" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <OwnershipSummary id="detail-ve-header-30" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                                <TagSummary id="detail-ve-header-31" data-oods-component="TagSummary" label="Tags" :tagCount="tagCount" :tags="tags" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                      <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                <template #panel="{ item }">
                                  <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                    <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                      <CommunicationDetailPanel id="detail-slot-tab-0-4" data-oods-component="CommunicationDetailPanel" :channels="channelCatalog" :templates="templateCatalog" :policies="deliveryPolicies" :conversations="conversations" />
                                      <MembershipPanel id="detail-slot-tab-1-6" data-oods-component="MembershipPanel">
                                          <Stack id="detail-slot-tab-1-6-membership_records-read-field" data-oods-component="Stack">
                                                <Text id="detail-slot-tab-1-6-membership_records-label" data-oods-component="Text" as="strong" content="Membership records" />
                                                <Text id="detail-slot-tab-1-6-membership_records-value" data-oods-component="Text">{{ formatReadOnlyValue(membershipRecords, "AuthzMembershipDocument[]", false) }}</Text>
                                              </Stack>
                                        </MembershipPanel>
                                      <AddressCollectionPanel id="detail-slot-tab-2-8" data-oods-component="AddressCollectionPanel" :summary="collectionSummary(addresses)" />
                                      <PreferencePanel id="detail-slot-tab-3-15" data-oods-component="PreferencePanel">
                                          <Stack id="detail-slot-tab-3-15-preference_namespaces-read-field" data-oods-component="Stack">
                                                <Text id="detail-slot-tab-3-15-preference_namespaces-label" data-oods-component="Text" as="strong" content="Preference namespaces" />
                                                <Text id="detail-slot-tab-3-15-preference_namespaces-value" data-oods-component="Text">{{ formatReadOnlyValue(preferenceNamespaces, "string[]", false) }}</Text>
                                              </Stack>
                                          <Stack id="detail-slot-tab-3-15-preference_version-read-field" data-oods-component="Stack">
                                                <Text id="detail-slot-tab-3-15-preference_version-label" data-oods-component="Text" as="strong" content="Preference version" />
                                                <Text id="detail-slot-tab-3-15-preference_version-value" data-oods-component="Text">{{ formatReadOnlyValue(preferenceVersion, "string", false) }}</Text>
                                              </Stack>
                                        </PreferencePanel>
                                      <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                          <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                          <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{{ formatReadOnlyValue(updatedAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                          <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEvent, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                          <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEventAt, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-organization_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-organization_id-label" data-oods-component="Text" as="strong" content="Organization id" />
                                          <Text id="detail-detail-tabs-9-organization_id-value" data-oods-component="Text">{{ formatReadOnlyValue(organizationId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-domain-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-domain-label" data-oods-component="Text" as="strong" content="Domain" />
                                          <Text id="detail-detail-tabs-9-domain-value" data-oods-component="Text">{{ formatReadOnlyValue(domain, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-plan_tier-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-plan_tier-label" data-oods-component="Text" as="strong" content="Plan tier" />
                                          <Text id="detail-detail-tabs-9-plan_tier-value" data-oods-component="Text">{{ formatReadOnlyValue(planTier, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-billing_status-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-billing_status-label" data-oods-component="Text" as="strong" content="Billing status" />
                                          <Text id="detail-detail-tabs-9-billing_status-value" data-oods-component="Text">{{ formatReadOnlyValue(billingStatus, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-industry-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-industry-label" data-oods-component="Text" as="strong" content="Industry" />
                                          <Text id="detail-detail-tabs-9-industry-value" data-oods-component="Text">{{ formatReadOnlyValue(industry, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-employee_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-employee_count-label" data-oods-component="Text" as="strong" content="Employee count" />
                                          <Text id="detail-detail-tabs-9-employee_count-value" data-oods-component="Text">{{ formatReadOnlyValue(employeeCount, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-billing_contact_email-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-billing_contact_email-label" data-oods-component="Text" as="strong" content="Billing contact email" />
                                          <Text id="detail-detail-tabs-9-billing_contact_email-value" data-oods-component="Text">{{ formatReadOnlyValue(billingContactEmail, "email", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-data_residency-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-data_residency-label" data-oods-component="Text" as="strong" content="Data residency" />
                                          <Text id="detail-detail-tabs-9-data_residency-value" data-oods-component="Text">{{ formatReadOnlyValue(dataResidency, "string", true) }}</Text>
                                        </Stack>
                                    </Stack>
                                  </template>
                                </template>
                              </Tabs>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { collectionAddress, collectionSummary } from '../store';

import { formatReadOnlyValue } from '@oods/component-contracts';
import { AddressCollectionPanel, Banner, Card, CommunicationDetailPanel, DetailHeader, MembershipPanel, OwnershipSummary, PreferencePanel, Stack, StatusTimeline, Tabs, TagSummary, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Ordered list of roles that currently have address entries. */
  addressRoles: string[];
  /** Collection of { role, address, metadata } entries keyed by role. */
  addresses?: unknown[];
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Primary contact email for invoicing and finance escalations. */
  billingContactEmail?: string;
  /** Coarse account-level financial standing used by the billing subsystem. Intentionally coarser than the subscription lifecycle: this is a 4-state account vocabulary {good_standing, past_due, unpaid, suspended}, NOT the 8-state billing.subscription.status set. See docs/billing/lifecycle-states.md. */
  billingStatus: 'good_standing' | 'past_due' | 'unpaid' | 'suspended';
  /** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
  channelCatalog: unknown[];
  /** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
  conversations?: unknown[];
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Preferred data residency region selected during onboarding. */
  dataResidency?: 'us' | 'eu' | 'apac' | 'latam';
  /** Role surfaced in UI contexts when one address must be highlighted. */
  defaultAddressRole?: 'headquarters' | 'office' | 'warehouse' | 'branch';
  /** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
  deliveryPolicies: unknown[];
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Verified root domain associated with the organization. */
  domain: string;
  /** Reported number of active employees. */
  employeeCount?: number;
  /** Optional NAICS-derived industry tag. */
  industry?: string;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'plan_upgraded' | 'plan_downgraded' | 'ownership_transferred';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** SaaS membership triple (user_id, organization_id, role_id) with UNIQUE constraint (TABLE 4). */
  membershipRecords: unknown[];
  /** Delivery state machine transitions (queued → sent → delivered → failed → retried → read). */
  messageStatuses?: unknown[];
  /** Atomic message payloads queued for delivery (R20.6 Part 1.2 primitives). */
  messages?: unknown[];
  /** Primary identifier for the organization tenant. */
  organizationId: string;
  /** Identifier of the owning principal scoped by owner_type. */
  ownerId: string;
  /** Categorical owner type sourced from the ownerTypes parameter. */
  ownerType: 'parent_organization' | 'reseller' | 'platform';
  /** Optional role name describing how the owner governs the entity. */
  ownershipRole?: string;
  /** Timestamp recording when ownership was last transferred. */
  ownershipTransferredAt?: string;
  /** Atomic permissions following resource:action notation (TABLE 2). */
  permissionCatalog: unknown[];
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Billing plan currently assigned to the organization. */
  planTier: 'free' | 'growth' | 'enterprise';
  /** Normalized preference payload captured by PreferenceStore (version, preferences map, metadata). */
  preferenceDocument: unknown;
  /** Tracks schema version, lastUpdated timestamp, migration records, and source. */
  preferenceMetadata: unknown;
  /** Monotonic counter incremented whenever preferences mutate (invalidates caches). */
  preferenceMutations?: number;
  /** Materialized namespace list resolved from parameters/registry for auditing. */
  preferenceNamespaces: string[];
  /** SemVer mirror of preference_document.version for indexing and analytics. */
  preferenceVersion: string;
  /** Canonical RBAC roles (R21.2 Part 4.2 TABLE 1). */
  roleCatalog: unknown[];
  /** Parent→child adjacency list for hierarchical RBAC (Part 3.1). */
  roleHierarchyEdges?: unknown[];
  /** Junction map for role→permission edges (TABLE 3). */
  rolePermissions: unknown;
  /** Materialized roles granted within the current session/token exchange. */
  sessionRoles?: string[];
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
  stateHistory?: unknown[];
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: 'prospect' | 'onboarding' | 'active' | 'churned';
  /** Computed number of tags assigned to the entity. */
  tagCount: number;
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
  tagMetadata?: Record<string, unknown>[];
  /** Ordered list of tags assigned to the entity. */
  tags?: string[];
  /** Localized template definitions with declared variables per R20.1 Part 2.3. */
  templateCatalog: unknown[];
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, addressRoles, addresses, allowedTransitions, billingContactEmail, billingStatus, channelCatalog, conversations, createdAt, dataResidency, defaultAddressRole, deliveryPolicies, description, domain, employeeCount, industry, label, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, organizationId, ownerId, ownerType, ownershipRole, ownershipTransferredAt, permissionCatalog, placeholder, planTier, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
