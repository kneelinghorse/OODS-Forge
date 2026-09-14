import { collectionAddress, collectionSummary } from '../store';
import React from 'react';
import { AddressCollectionPanel, Banner, Card, CommunicationDetailPanel, DetailHeader, MembershipPanel, PreferencePanel, Stack, StatusTimeline, Tabs, TagSummary, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleDelete: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

export interface PageProps {
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

type AddressCollectionPanelProps = React.ComponentPropsWithoutRef<typeof AddressCollectionPanel>;
type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type CommunicationDetailPanelProps = React.ComponentPropsWithoutRef<typeof CommunicationDetailPanel>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type MembershipPanelProps = React.ComponentPropsWithoutRef<typeof MembershipPanel>;
type PreferencePanelProps = React.ComponentPropsWithoutRef<typeof PreferencePanel>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TagSummaryProps = React.ComponentPropsWithoutRef<typeof TagSummary>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addressRoles, addresses, allowedTransitions, channelCatalog, conversations, createdAt, defaultAddressRole, deliveryPolicies, description, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, name, permissionCatalog, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, preferredName, primaryEmail, role, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, timezone, updatedAt, userId }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

  return (
    <>
      <>
        <Stack id="detail-screen" data-oods-component="Stack">
              {uiState === 'loading' && (
                <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
              )}
              {uiState === 'empty' && (
                <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
              )}
              {uiState === 'error' && (
                <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
              )}
              {uiState === 'success' && (
                <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <DetailHeader id="detail-detail-header-1-record-title" data-oods-component="DetailHeader" title={name} level={2} />
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <StatusTimeline id="detail-ve-header-28" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                              <TagSummary id="detail-ve-header-29" data-oods-component="TagSummary" label="Tags" tagCount={tagCount} tags={tags} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tabs-9-read-fields","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tabs-9-read-fields" data-oods-component="Stack">
                                        <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                            <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                            <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{formatReadOnlyValue(updatedAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                            <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{formatReadOnlyValue(lastEvent, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                            <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{formatReadOnlyValue(lastEventAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-user_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-user_id-label" data-oods-component="Text" as="strong" content="User id" />
                                            <Text id="detail-detail-tabs-9-user_id-value" data-oods-component="Text">{formatReadOnlyValue(userId, "uuid", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-preferred_name-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-preferred_name-label" data-oods-component="Text" as="strong" content="Preferred name" />
                                            <Text id="detail-detail-tabs-9-preferred_name-value" data-oods-component="Text">{formatReadOnlyValue(preferredName, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-description-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-description-label" data-oods-component="Text" as="strong" content="Description" />
                                            <Text id="detail-detail-tabs-9-description-value" data-oods-component="Text">{formatReadOnlyValue(description, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-primary_email-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-primary_email-label" data-oods-component="Text" as="strong" content="Primary email" />
                                            <Text id="detail-detail-tabs-9-primary_email-value" data-oods-component="Text">{formatReadOnlyValue(primaryEmail, "email", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-role-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-role-label" data-oods-component="Text" as="strong" content="Role" />
                                            <Text id="detail-detail-tabs-9-role-value" data-oods-component="Text">{formatReadOnlyValue(role, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-timezone-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-timezone-label" data-oods-component="Text" as="strong" content="Timezone" />
                                            <Text id="detail-detail-tabs-9-timezone-value" data-oods-component="Text">{formatReadOnlyValue(timezone, "string", false)}</Text>
                                          </Stack>
                                        <CommunicationDetailPanel id="detail-slot-tab-0-4" data-oods-component="CommunicationDetailPanel" channels={channelCatalog} templates={templateCatalog} policies={deliveryPolicies} conversations={conversations} />
                                        <MembershipPanel id="detail-slot-tab-1-6" data-oods-component="MembershipPanel" />
                                        <AddressCollectionPanel id="detail-slot-tab-2-8" data-oods-component="AddressCollectionPanel" summary={collectionSummary(addresses)} />
                                        <PreferencePanel id="detail-slot-tab-3-15" data-oods-component="PreferencePanel" />
                                      </Stack>
                                    ) }
                                  ]} />
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleDelete" onClick={() => handleDelete()}>Archive</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
