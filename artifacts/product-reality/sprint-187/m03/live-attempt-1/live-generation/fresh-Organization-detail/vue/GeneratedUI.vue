<template>
  <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <Stack id="slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                    <DetailHeader id="ve-header-28" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="1" />
                    <StatusTimeline id="ve-header-29" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                    <OwnershipSummary id="ve-header-30" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                    <TagManager id="ve-header-31" data-oods-component="TagManager" :tags="tags" />
                  </Stack>
          </Stack>
      <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-9" data-oods-component="Tabs" :items="[{'id':'detail-tab-panel-3','label':'Overview','panel':''},{'id':'detail-tab-panel-5','label':'Content','panel':''},{'id':'detail-tab-panel-7','label':'Communication','panel':''},{'id':'detail-tab-panel-14','label':'Status \x26 History','panel':''},{'id':'detail-tab-panel-16','label':'Structure','panel':''},{'id':'detail-tab-panel-18','label':'Behavior','panel':''},{'id':'detail-tab-panel-20','label':'Details','panel':''},{'id':'detail-tab-panel-22','label':'Details 8','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <StatusTimeline id="slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                  <Text id="pg-status-timeline-32" data-oods-component="Text" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;">{{ status }}</Text>
                                  <Text id="pg-status-timeline-33" data-oods-component="Text" label="Materialized list of valid next states from the current status, computed from the&#10;transitionRules parameter. When transitionRules is null (open model), this contains&#10;all states except the current one. Used by StatusSelector to disable invalid options&#10;and by StatusBadge to indicate available paths.&#10;">{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}</Text>
                                </StatusTimeline>
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-5'">
                            <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <MembershipPanel id="slot-tab-1-6" data-oods-component="MembershipPanel" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-7'">
                            <Stack id="detail-tab-panel-7" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <AddressCollectionPanel id="slot-tab-2-8" data-oods-component="AddressCollectionPanel" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-14'">
                            <Stack id="detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <PreferencePanel id="slot-tab-3-15" data-oods-component="PreferencePanel" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-16'">
                            <Stack id="detail-tab-panel-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-4-17" data-oods-component="Card" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-18'">
                            <Stack id="detail-tab-panel-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-5-19" data-oods-component="Stack" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-20'">
                            <Stack id="detail-tab-panel-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-6-21" data-oods-component="Card" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-22'">
                            <Stack id="detail-tab-panel-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-7-23" data-oods-component="Stack" />
                            </Stack>
                          </template>
                        </template>
                      </Tabs>
            </div>
            <aside data-sidebar-aside>
              <Stack id="detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <AuditTimeline id="slot-metadata-12" data-oods-component="AuditTimeline" />
                      </Stack>
            </aside>
          </Card>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-detail-13">
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Delete</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
  </div>
</template>

<script setup lang="ts">
import { AddressCollectionPanel, AuditTimeline, Card, DetailHeader, MembershipPanel, OwnershipSummary, PreferencePanel, Stack, StatusTimeline, Tabs, TagManager, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

interface GeneratedUIActions {
  /* @oods-domain-action handleDelete sha256:221fdee3330ccb3c003961fa632660ca61b4f1713ca9b67d2612c45fe63a1f43 */
  /* @oods-domain-source sha256:74252fa49ed24d37978bced342336a0b2aac9bed23e8fa0d6d3db7f99f0fe9fc */
  handleDelete: () => void;
  /* @oods-domain-action handleEdit sha256:8d06ae954d1e16d46333996b5945dbfef37c642e52d7bc1f68ece666c760d9b2 */
  /* @oods-domain-source sha256:c0d990cc2989feb07786ba35c93b878e524cccf8ecc11583869e8f3344f87f48 */
  handleEdit: () => void;
}

interface Props {
  actions: GeneratedUIActions;
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
  defaultAddressRole?: string;
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
  lastEvent: string;
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
  ownerType: string;
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
  status: string;
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

const { actions, addressRoles, addresses, allowedTransitions, billingContactEmail, billingStatus, channelCatalog, conversations, createdAt, dataResidency, defaultAddressRole, deliveryPolicies, description, domain, employeeCount, industry, label, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, organizationId, ownerId, ownerType, ownershipRole, ownershipTransferredAt, permissionCatalog, placeholder, planTier, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
