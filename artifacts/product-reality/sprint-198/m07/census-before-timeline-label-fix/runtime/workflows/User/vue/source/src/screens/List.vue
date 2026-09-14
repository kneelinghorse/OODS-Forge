<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="list-screen-list-9-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9-success" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-primary-search-17" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Status" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'invited', 'label': 'invited'}, {'value': 'active', 'label': 'active'}, {'value': 'suspended', 'label': 'suspended'}, {'value': 'deactivated', 'label': 'deactivated'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('name')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, tags, tagCount, tagMetadata, addressRoles, defaultAddressRole, addresses, preferenceDocument, preferenceMetadata, preferenceVersion, preferenceNamespaces, preferenceMutations, roleCatalog, permissionCatalog, rolePermissions, membershipRecords, roleHierarchyEdges, sessionRoles, channelCatalog, templateCatalog, deliveryPolicies, messages, conversations, messageStatuses, userId, name, preferredName, description, primaryEmail, role, timezone }, collectionIndex) in rows" :key="String(userId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(userId)" @click="handleRowClick(String(userId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ name }}</Text>
              <StatusBadge :id="'list-ve-items-11-' + collectionIndex" data-oods-component="StatusBadge" tone="lifecycle" :status="status" />
              <RelativeTimestamp :id="'list-ve-items-12-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" />
              <TagPills :id="'list-ve-items-13-' + collectionIndex" data-oods-component="TagPills" :maxVisible="3" overflowLabel="+{{ tag_count }}" :tags="tags" />
              <MessageStatusBadge :id="'list-ve-search-10-' + collectionIndex" data-oods-component="MessageStatusBadge" />
              <AddressSummaryBadge :id="'list-ve-toolbar-actions-14-' + collectionIndex" data-oods-component="AddressSummaryBadge" label="Default address role" :role="defaultAddressRole" />
              <PreferenceSummaryBadge :id="'list-ve-toolbar-actions-15-' + collectionIndex" data-oods-component="PreferenceSummaryBadge" :version="preferenceVersion" />
              <RoleBadgeList :id="'list-ve-toolbar-actions-16-' + collectionIndex" data-oods-component="RoleBadgeList" :roles="sessionRoles" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { AddressSummaryBadge, Banner, Button, MessageStatusBadge, PaginationBar, PreferenceSummaryBadge, RelativeTimestamp, RoleBadgeList, SearchInput, Select, Stack, StatusBadge, TagPills, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ status: 'invited' | 'active' | 'suspended' | 'deactivated'; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt?: string; lastEvent: 'created' | 'profile_updated' | 'status_changed' | 'role_updated'; lastEventAt?: string; tags?: string[]; tagCount: number; tagMetadata?: Record<string, unknown>[]; addressRoles: string[]; defaultAddressRole?: 'home' | 'billing' | 'shipping'; addresses?: unknown[]; preferenceDocument: unknown; preferenceMetadata: unknown; preferenceVersion: string; preferenceNamespaces: string[]; preferenceMutations?: number; roleCatalog: unknown[]; permissionCatalog: unknown[]; rolePermissions: unknown; membershipRecords: unknown[]; roleHierarchyEdges?: unknown[]; sessionRoles?: string[]; channelCatalog: unknown[]; templateCatalog: unknown[]; deliveryPolicies: unknown[]; messages?: unknown[]; conversations?: unknown[]; messageStatuses?: unknown[]; userId: string; name: string; preferredName?: string; description?: string; primaryEmail: string; role: 'end_user' | 'admin' | 'owner' | 'billing'; timezone?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
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
  /** Provider configuration for each channel (SMTP/Twilio/FCM/Webhook). */
  channelCatalog: unknown[];
  /** Multi-party threaded conversations with membership metadata (R20.6 Part 3.3). */
  conversations?: unknown[];
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Role surfaced in UI contexts when one address must be highlighted. */
  defaultAddressRole?: 'home' | 'billing' | 'shipping';
  /** Retry/throttle/quiet-hour policies (R20.1 Part 3 lifecycle). */
  deliveryPolicies: unknown[];
  /** Supporting summary rendered in detail and card contexts. */
  description?: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'profile_updated' | 'status_changed' | 'role_updated';
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
  status: 'invited' | 'active' | 'suspended' | 'deactivated';
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

const { actions, uiState, addressRoles, addresses, allowedTransitions, channelCatalog, conversations, createdAt, defaultAddressRole, deliveryPolicies, description, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, name, permissionCatalog, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, preferredName, primaryEmail, role, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, timezone, updatedAt, userId, rows = [], collectionQuery = {} } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
