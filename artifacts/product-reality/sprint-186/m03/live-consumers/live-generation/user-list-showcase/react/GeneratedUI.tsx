import React from 'react';
import { AddressSummaryBadge, Button, MessageStatusBadge, PreferenceSummaryBadge, RoleBadgeList, Select, Stack, TagPills } from '@oods/components-react';
import { PaginationBar, RelativeTimestamp, SearchInput, StatusBadge } from '@oods/components-react/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

export interface GeneratedUIActions {
  /* @oods-domain-action handleFilter sha256:16ab1e92d1fca94435e207207864ab7015dc274fc62e2f211a0df55cc291ea36 */
  /* @oods-domain-source sha256:8e5f3caefc9ad5e749948c77de5f5978bb91ef33958f95a5a2be4b419cff400e */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handleRowClick sha256:773eb5947f10b9c469abd54e200f61529df89035100d7d19eaa88adcd565efc0 */
  /* @oods-domain-source sha256:2691a39947329776a84396671cd57ad501e6855e24bc09bfe575a98e1fde4a88 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSort sha256:757d6df84825c12c0f0cf60e76596eb7c5d0f48a6a4d4cf4186ee36063811b44 */
  /* @oods-domain-source sha256:a44f6b01c1934ac2bd84da820758bea74479e3a4ec56f169390a3d3eeaf34649 */
  handleSort: (column: string) => void;
}

export interface PageProps {
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

type AddressSummaryBadgeProps = React.ComponentPropsWithoutRef<typeof AddressSummaryBadge>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type MessageStatusBadgeProps = React.ComponentPropsWithoutRef<typeof MessageStatusBadge>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type PreferenceSummaryBadgeProps = React.ComponentPropsWithoutRef<typeof PreferenceSummaryBadge>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type RoleBadgeListProps = React.ComponentPropsWithoutRef<typeof RoleBadgeList>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TagPillsProps = React.ComponentPropsWithoutRef<typeof TagPills>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, addressRoles, addresses, allowedTransitions, channelCatalog, conversations, createdAt, defaultAddressRole, deliveryPolicies, description, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, name, permissionCatalog, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, preferredName, primaryEmail, role, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, timezone, updatedAt, userId }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };

  return (
    <>
      <>
        <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
              <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                      <Stack id="slot-search-1" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <SearchInput id="primary-search-17" data-oods-component="SearchInput" />
                                <MessageStatusBadge id="ve-search-10" data-oods-component="MessageStatusBadge" />
                              </Stack>
                      <Select id="slot-filters-2" data-oods-component="Select" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required value={lastEvent} />
                      <Stack id="slot-toolbar-actions-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Button id="primary-toolbar-actions-18" data-oods-component="Button" />
                                <AddressSummaryBadge id="ve-toolbar-actions-14" data-oods-component="AddressSummaryBadge" label="Role surfaced in UI contexts when one address must be highlighted." role={defaultAddressRole} />
                                <PreferenceSummaryBadge id="ve-toolbar-actions-15" data-oods-component="PreferenceSummaryBadge" version={preferenceVersion} />
                                <RoleBadgeList id="ve-toolbar-actions-16" data-oods-component="RoleBadgeList" roles={sessionRoles} />
                              </Stack>
                    </Stack>
              <Stack id="list-items-5" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                      <Stack id="slot-items-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <StatusBadge id="ve-items-11" data-oods-component="StatusBadge" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" tone="lifecycle" status={status} />
                                <RelativeTimestamp id="ve-items-12" data-oods-component="RelativeTimestamp" label="Timestamp for the most recent modification, when available." datetime={updatedAt ?? createdAt} />
                                <TagPills id="ve-items-13" data-oods-component="TagPills" maxVisible={3} overflowLabel="+{{ tag_count }}" tags={tags} />
                              </Stack>
                    </Stack>
              <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                      <PaginationBar id="slot-pagination-8" data-oods-component="PaginationBar" />
                    </Stack>
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-list-9">
          <button type="button" data-oods-action="handleFilter" onClick={() => handleFilter({})}>Filter</button>
          <button type="button" data-oods-action="handleRowClick" onClick={() => handleRowClick(userId)}>Open row</button>
          <button type="button" data-oods-action="handleSort" onClick={() => handleSort('status')}>Sort</button>
        </div>
      </>
    </>
  );
};
