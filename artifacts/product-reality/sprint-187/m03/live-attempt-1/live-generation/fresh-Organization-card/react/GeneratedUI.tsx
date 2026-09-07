import React from 'react';
import { Button, Card, CardHeader, OwnershipMeta, Stack, StatusBadge, TagSummary } from '@oods/components-react';
import '@oods/component-styles/css';

export interface PageProps {
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

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type CardHeaderProps = React.ComponentPropsWithoutRef<typeof CardHeader>;
type OwnershipMetaProps = React.ComponentPropsWithoutRef<typeof OwnershipMeta>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TagSummaryProps = React.ComponentPropsWithoutRef<typeof TagSummary>;

export const GeneratedUI: React.FC<PageProps> = ({ addressRoles, addresses, allowedTransitions, billingContactEmail, billingStatus, channelCatalog, conversations, createdAt, dataResidency, defaultAddressRole, deliveryPolicies, description, domain, employeeCount, industry, label, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, organizationId, ownerId, ownerType, ownershipRole, ownershipTransferredAt, permissionCatalog, placeholder, planTier, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, updatedAt }) => {
  return (
    <>
      <Card id="screen-card-7" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="card-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-squish)' }}>
                    <Stack id="slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <CardHeader id="ve-header-8" data-oods-component="CardHeader" title={label} supporting={description} />
                              <StatusBadge id="ve-header-9" data-oods-component="StatusBadge" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" variant="subtle" status={status} />
                            </Stack>
                  </Stack>
            <Stack id="card-body-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                    <Card id="slot-body-4" data-oods-component="Card" />
                  </Stack>
            <Stack id="card-footer-5" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-squish)' }}>
                    <Stack id="slot-footer-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                              <Button id="primary-footer-12" data-oods-component="Button" />
                              <OwnershipMeta id="ve-footer-10" data-oods-component="OwnershipMeta" ownerType={ownerType} role={ownershipRole} />
                              <TagSummary id="ve-footer-11" data-oods-component="TagSummary" label="Ordered list of tags assigned to the entity." tagCount={tagCount} tags={tags} />
                            </Stack>
                  </Stack>
          </Card>
    </>
  );
};
