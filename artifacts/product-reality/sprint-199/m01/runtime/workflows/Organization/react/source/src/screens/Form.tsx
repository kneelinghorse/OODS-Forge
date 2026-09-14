import { collectionAddress, collectionSummary } from '../store';
import React from 'react';
import { AddressEditor, Banner, Button, FormLabelGroup, Input, PreferenceEditor, RoleAssignmentForm, Select, Stack, StatusSelector, TagInput, TemplatePicker } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleChange_addresses: (address: Record<string, unknown>) => void;
  handleSubmit: () => void;
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

type AddressEditorProps = React.ComponentPropsWithoutRef<typeof AddressEditor>;
type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type FormLabelGroupProps = React.ComponentPropsWithoutRef<typeof FormLabelGroup>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type PreferenceEditorProps = React.ComponentPropsWithoutRef<typeof PreferenceEditor>;
type RoleAssignmentFormProps = React.ComponentPropsWithoutRef<typeof RoleAssignmentForm>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;
type TagInputProps = React.ComponentPropsWithoutRef<typeof TagInput>;
type TemplatePickerProps = React.ComponentPropsWithoutRef<typeof TemplatePicker>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, addressRoles, addresses, allowedTransitions, billingContactEmail, billingStatus, channelCatalog, conversations, createdAt, dataResidency, defaultAddressRole, deliveryPolicies, description, domain, employeeCount, industry, label, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, organizationId, ownerId, ownerType, ownershipRole, ownershipTransferredAt, permissionCatalog, placeholder, planTier, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, updatedAt }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange_addresses') || typeof actions.handleChange_addresses !== 'function') { throw new Error('GeneratedUI requires actions.handleChange_addresses.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  /* @oods-domain-binding handleChange_addresses */ const handleChange_addresses = (address: Record<string, unknown>) => { actions.handleChange_addresses(address); };
  const [handleChange_billing_contact_emailState, setHandleChange_billing_contact_emailState] = React.useState<string>(String(billingContactEmail ?? ''));
  /* @oods-local-binding handleChange_billing_contact_email */ const handleChange_billing_contact_email = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_billing_contact_emailState(event.currentTarget.value); };
  const [handleChange_labelState, setHandleChange_labelState] = React.useState<string>(String(label ?? ''));
  /* @oods-local-binding handleChange_label */ const handleChange_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_labelState(event.currentTarget.value); };
  const [handleChange_owner_idState, setHandleChange_owner_idState] = React.useState<string>(String(ownerId ?? ''));
  /* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_owner_idState(event.currentTarget.value); };
  const [handleChange_owner_typeState, setHandleChange_owner_typeState] = React.useState<string>(String(ownerType ?? ''));
  /* @oods-local-binding handleChange_owner_type */ const handleChange_owner_type = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_owner_typeState(event.currentTarget.value); };
  const [handleChange_ownership_transferred_atState, setHandleChange_ownership_transferred_atState] = React.useState<string>(String(ownershipTransferredAt ?? ''));
  /* @oods-local-binding handleChange_ownership_transferred_at */ const handleChange_ownership_transferred_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_ownership_transferred_atState(event.currentTarget.value); };
  const [handleChange_placeholderState, setHandleChange_placeholderState] = React.useState<string>(String(placeholder ?? ''));
  /* @oods-local-binding handleChange_placeholder */ const handleChange_placeholder = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_placeholderState(event.currentTarget.value); };
  const [handleChange_plan_tierState, setHandleChange_plan_tierState] = React.useState<string>(String(planTier ?? ''));
  /* @oods-local-binding handleChange_plan_tier */ const handleChange_plan_tier = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_plan_tierState(event.currentTarget.value); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
  const [handleChange_tag_countState, setHandleChange_tag_countState] = React.useState<string>(String(tagCount ?? ''));
  /* @oods-local-binding handleChange_tag_count */ const handleChange_tag_count = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_tag_countState(event.currentTarget.value); };
  const [handleChange_tagsState, setHandleChange_tagsState] = React.useState<string>('');
  /* @oods-local-binding handleChange_tags */ const handleChange_tags = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_tagsState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <Stack id="form-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                      <Stack id="form-form-title-1" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <FormLabelGroup id="form-ve-title-26" data-oods-component="FormLabelGroup" label={label} description={description} placeholder={placeholder} />
                                <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" options={[{"label":"Prospect","value":"prospect"},{"label":"Onboarding","value":"onboarding"},{"label":"Active","value":"active"},{"label":"Churned","value":"churned"}]} value={handleChange_statusState} onChange={handleChange_status} />
                                <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" value={handleChange_tagsState} onChange={handleChange_tags} tags={tags} />
                                <AddressEditor id="form-ve-title-29" data-oods-component="AddressEditor" label="Addresses" street={collectionAddress(addresses, defaultAddressRole).street} city={collectionAddress(addresses, defaultAddressRole).city} region={collectionAddress(addresses, defaultAddressRole).region} postalCode={collectionAddress(addresses, defaultAddressRole).postalCode} data-oods-action="handleChange_addresses" onChange={handleChange_addresses} />
                              </Stack>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Stack id="form-slot-field-0-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                                          <PreferenceEditor id="form-ve-field-0-30" data-oods-component="PreferenceEditor" namespaces={preferenceNamespaces} document={JSON.stringify(preferenceDocument ?? {}, null, 2)} />
                                                          <RoleAssignmentForm id="form-ve-field-0-31" data-oods-component="RoleAssignmentForm" availableRoles={roleCatalog} />
                                                          <TemplatePicker id="form-ve-field-0-32" data-oods-component="TemplatePicker" templates={templateCatalog} channels={channelCatalog} />
                                                        </Stack>
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-2-7" data-oods-component="Select" help="Billing plan currently assigned to the organization." label="Plan tier" options={[{"value":"free","label":"free"},{"value":"growth","label":"growth"},{"value":"enterprise","label":"enterprise"}]} placeholder="Enter plan tier" required value={handleChange_plan_tierState} onChange={handleChange_plan_tier} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Timestamp recording when ownership was last transferred." label="Ownership transferred at" placeholder="Timestamp recording when ownership was last transferred." type="datetime-local" value={handleChange_ownership_transferred_atState} onChange={handleChange_ownership_transferred_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Number of tags assigned to this record." label="Tag count" placeholder="Enter tag count" required type="number" value={handleChange_tag_countState} onChange={handleChange_tag_count} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Primary contact email for invoicing and finance escalations." label="Billing contact email" placeholder="Enter billing contact email" type="email" value={handleChange_billing_contact_emailState} onChange={handleChange_billing_contact_email} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required value={handleChange_labelState} onChange={handleChange_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Shown when the label is empty." label="Placeholder" placeholder="Enter placeholder" value={handleChange_placeholderState} onChange={handleChange_placeholder} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Identifier of the owner." label="Owner id" placeholder="Enter owner id" required value={handleChange_owner_idState} onChange={handleChange_owner_id} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-9-25" data-oods-component="Select" help="Choose the kind of owner." label="Owner type" options={[{"label":"Parent Organization","value":"parent_organization"},{"label":"Reseller","value":"reseller"},{"label":"Platform","value":"platform"}]} required value={handleChange_owner_typeState} onChange={handleChange_owner_type} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                                <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
