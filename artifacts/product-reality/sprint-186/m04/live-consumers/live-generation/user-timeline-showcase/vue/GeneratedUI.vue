<template>
  <Stack id="screen-detail-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <Text id="slot-header-2" data-oods-component="Text" label="Ordered list of roles that currently have address entries.">{{ Array.isArray(addressRoles) ? addressRoles.join(', ') : '' }}</Text>
          </Stack>
      <Card id="detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-9" data-oods-component="Tabs" :items="[{'id':'detail-tab-panel-3','label':'Tab 1','panel':''},{'id':'detail-tab-panel-5','label':'Tab 2','panel':''},{'id':'detail-tab-panel-7','label':'Tab 3','panel':''},{'id':'detail-tab-panel-14','label':'Tab 4','panel':''},{'id':'detail-tab-panel-16','label':'Tab 5','panel':''},{'id':'detail-tab-panel-18','label':'Tab 6','panel':''},{'id':'detail-tab-panel-20','label':'Tab 7','panel':''},{'id':'detail-tab-panel-22','label':'Tab 8','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <StatusTimeline id="slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" showReason :history="stateHistory" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                  <Text id="pg-status-timeline-31" data-oods-component="Text" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;">{{ status }}</Text>
                                  <Text id="pg-status-timeline-32" data-oods-component="Text" label="Materialized list of valid next states from the current status, computed from the&#10;transitionRules parameter. When transitionRules is null (open model), this contains&#10;all states except the current one. Used by StatusSelector to disable invalid options&#10;and by StatusBadge to indicate available paths.&#10;">{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}</Text>
                                </StatusTimeline>
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-5'">
                            <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <AuditEvent id="slot-tab-1-6" data-oods-component="AuditEvent" :event="lastEvent" :timestamp="lastEventAt" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-7'">
                            <Stack id="detail-tab-panel-7" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <AddressValidationTimeline id="slot-tab-2-8" data-oods-component="AddressValidationTimeline" :events="addresses" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-14'">
                            <Stack id="detail-tab-panel-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <PreferenceTimeline id="slot-tab-3-15" data-oods-component="PreferenceTimeline" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-16'">
                            <Stack id="detail-tab-panel-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <MembershipAuditTimeline id="slot-tab-4-17" data-oods-component="MembershipAuditTimeline" :events="membershipRecords" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-18'">
                            <Stack id="detail-tab-panel-18" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <MessageEventTimeline id="slot-tab-5-19" data-oods-component="MessageEventTimeline" :messages="messages" :statuses="messageStatuses" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-20'">
                            <Stack id="detail-tab-panel-20" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Stack id="slot-tab-6-21" data-oods-component="Stack" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-22'">
                            <Stack id="detail-tab-panel-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-7-23" data-oods-component="Card" />
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
</template>

<script setup lang="ts">
import { AddressValidationTimeline, AuditEvent, Card, MembershipAuditTimeline, MessageEventTimeline, PreferenceTimeline, Stack, Tabs, Text } from '@oods/components-vue';
import { AuditTimeline, StatusTimeline } from '@oods/components-vue/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

interface Props {
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
  /** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
  channelCatalog: unknown[];
  /** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
  conversations?: unknown[];
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Role surfaced in UI contexts when one address must be highlighted. */
  defaultAddressRole?: string;
  /** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
  deliveryPolicies: unknown[];
  /** Supporting summary rendered in detail and card contexts. */
  description?: string;
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
  /** Human-friendly name rendered in headers and list contexts. */
  name: string;
  /** Atomic permissions following resource:action notation (TABLE 2). */
  permissionCatalog: unknown[];
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
  /** Preferred display name surfaced in collaborative tooling. */
  preferredName?: string;
  /** Canonical login email address for the user. */
  primaryEmail: string;
  /** Highest privilege role currently granted to the user. */
  role: 'end_user' | 'admin' | 'owner' | 'billing';
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
  /** Preferred timezone applied when rendering timestamps. */
  timezone?: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Primary identifier used to correlate identity across services. */
  userId: string;
}

const { addressRoles, addresses, allowedTransitions, channelCatalog, conversations, createdAt, defaultAddressRole, deliveryPolicies, description, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, name, permissionCatalog, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, preferredName, primaryEmail, role, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, timezone, updatedAt, userId } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
