import React from 'react';
import { AddressEditor, Button, DatePicker, Input, PreferenceEditor, RoleAssignmentForm, Select, Stack, StatusSelector, TagInput, TemplatePicker, Textarea } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleChange sha256:8d34e74d5c32a0ac604752249e369630e382e03991b58d88a9199a0add05b4a7 */
  /* @oods-domain-source sha256:7c3ae6feb9000b30f9248b6c15aa7765871a2d01e93cf9825373f138d43582d9 */
  handleChange: () => void;
  /* @oods-domain-action handleChange_addresses sha256:515e0ddc15637cc03dc89c12405207ef9209f322a44e5789c0d2512481433edd */
  /* @oods-domain-source sha256:25011d651f081b3092177dacc679d8ab188cd6d23254b5602458c8c07450f661 */
  handleChange_addresses: (address: Record<string, unknown>) => void;
  /* @oods-domain-action handleSubmit sha256:40dcacd8dc443bb231a9f4e83cdd8390bbf86979dacc3ed885912064ac94f846 */
  /* @oods-domain-source sha256:39f1e2024f9e76dc58ee38b1ae09943135d4d3f956ac63b59852fef68c598a99 */
  handleSubmit: () => void;
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

type AddressEditorProps = React.ComponentPropsWithoutRef<typeof AddressEditor>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type DatePickerProps = React.ComponentPropsWithoutRef<typeof DatePicker>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type PreferenceEditorProps = React.ComponentPropsWithoutRef<typeof PreferenceEditor>;
type RoleAssignmentFormProps = React.ComponentPropsWithoutRef<typeof RoleAssignmentForm>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;
type TagInputProps = React.ComponentPropsWithoutRef<typeof TagInput>;
type TemplatePickerProps = React.ComponentPropsWithoutRef<typeof TemplatePicker>;
type TextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, addressRoles, addresses, allowedTransitions, channelCatalog, conversations, createdAt, defaultAddressRole, deliveryPolicies, description, lastEvent, lastEventAt, membershipRecords, messageStatuses, messages, name, permissionCatalog, preferenceDocument, preferenceMetadata, preferenceMutations, preferenceNamespaces, preferenceVersion, preferredName, primaryEmail, role, roleCatalog, roleHierarchyEdges, rolePermissions, sessionRoles, stateHistory, status, tagCount, tagMetadata, tags, templateCatalog, timezone, updatedAt, userId }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange') || typeof actions.handleChange !== 'function') { throw new Error('GeneratedUI requires actions.handleChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleChange_addresses') || typeof actions.handleChange_addresses !== 'function') { throw new Error('GeneratedUI requires actions.handleChange_addresses.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  /* @oods-domain-binding handleChange */ const handleChange = () => { actions.handleChange(); };
  /* @oods-domain-binding handleChange_addresses */ const handleChange_addresses = (address: Record<string, unknown>) => { actions.handleChange_addresses(address); };
  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_nameState, setHandleChange_nameState] = React.useState<string>(String(name ?? ''));
  /* @oods-local-binding handleChange_name */ const handleChange_name = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setHandleChange_nameState(event.currentTarget.value); };
  const [handleChange_preference_mutationsState, setHandleChange_preference_mutationsState] = React.useState<string>(String(preferenceMutations ?? ''));
  /* @oods-local-binding handleChange_preference_mutations */ const handleChange_preference_mutations = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_preference_mutationsState(event.currentTarget.value); };
  const [handleChange_preference_versionState, setHandleChange_preference_versionState] = React.useState<string>(String(preferenceVersion ?? ''));
  /* @oods-local-binding handleChange_preference_version */ const handleChange_preference_version = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_preference_versionState(event.currentTarget.value); };
  const [handleChange_primary_emailState, setHandleChange_primary_emailState] = React.useState<string>(String(primaryEmail ?? ''));
  /* @oods-local-binding handleChange_primary_email */ const handleChange_primary_email = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_primary_emailState(event.currentTarget.value); };
  const [handleChange_roleState, setHandleChange_roleState] = React.useState<string>(String(role ?? ''));
  /* @oods-local-binding handleChange_role */ const handleChange_role = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_roleState(event.currentTarget.value); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
  const [handleChange_tagsState, setHandleChange_tagsState] = React.useState<string>('');
  /* @oods-local-binding handleChange_tags */ const handleChange_tags = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_tagsState(event.currentTarget.value); };
  const [handleChange_timezoneState, setHandleChange_timezoneState] = React.useState<string>(String(timezone ?? ''));
  /* @oods-local-binding handleChange_timezone */ const handleChange_timezone = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_timezoneState(event.currentTarget.value); };
  const [handleChange_user_idState, setHandleChange_user_idState] = React.useState<string>(String(userId ?? ''));
  /* @oods-local-binding handleChange_user_id */ const handleChange_user_id = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_user_idState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <>
        <Stack id="screen-form-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
              <Stack id="form-title-1" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <StatusSelector id="ve-title-26" data-oods-component="StatusSelector" label="Canonical lifecycle state derived from the states parameter. This is the single source&#10;of truth for the entity's current lifecycle position. Consumed by Colorized to resolve&#10;visual tokens, and by view extensions to render StatusBadge and StatusTimeline.&#10;" value={handleChange_statusState} onChange={handleChange_status} />
                      <TagInput id="ve-title-27" data-oods-component="TagInput" label="Ordered list of tags assigned to the entity." placeholder="Enter tags" value={handleChange_tagsState} onChange={handleChange_tags} tags={tags} />
                      <AddressEditor id="ve-title-28" data-oods-component="AddressEditor" label="Collection of { role, address, metadata } entries keyed by role." data-oods-action="handleChange_addresses" onChange={handleChange_addresses} />
                    </Stack>
              <Stack id="form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Stack id="slot-field-0-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                            <PreferenceEditor id="ve-field-0-29" data-oods-component="PreferenceEditor" namespaces={preferenceNamespaces} />
                                            <RoleAssignmentForm id="ve-field-0-30" data-oods-component="RoleAssignmentForm" availableRoles={roleCatalog} />
                                            <TemplatePicker id="ve-field-0-31" data-oods-component="TemplatePicker" templates={templateCatalog} channels={channelCatalog} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <DatePicker id="slot-field-1-5" data-oods-component="DatePicker" label="Field 1" value={handleChange_created_atState} onChange={handleChange_created_at} />
                              </Stack>
                      <Stack id="form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <DatePicker id="slot-field-2-7" data-oods-component="DatePicker" label="Field 2" value={handleChange_timezoneState} onChange={handleChange_timezone} />
                              </Stack>
                      <Stack id="form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Select id="slot-field-3-13" data-oods-component="Select" label="Highest privilege role currently granted to the user." options={[{"value":"end_user","label":"end_user"},{"value":"admin","label":"admin"},{"value":"owner","label":"owner"},{"value":"billing","label":"billing"}]} placeholder="Enter role" required value={handleChange_roleState} onChange={handleChange_role} />
                              </Stack>
                      <Stack id="form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Textarea id="slot-field-4-15" data-oods-component="Textarea" label="Field 4" value={handleChange_nameState} onChange={handleChange_name} />
                              </Stack>
                      <Stack id="form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-5-17" data-oods-component="Input" label="Canonical login email address for the user." placeholder="Enter primary email" required type="email" value={handleChange_primary_emailState} onChange={handleChange_primary_email} />
                              </Stack>
                      <Stack id="form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-6-19" data-oods-component="Input" label="Lifecycle event associated with the most recent timestamp mutation." placeholder="Enter last event" required value={handleChange_last_eventState} onChange={handleChange_last_event} />
                              </Stack>
                      <Stack id="form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-7-21" data-oods-component="Input" label="SemVer mirror of preference_document.version for indexing and analytics." placeholder="Enter preference version" required value={handleChange_preference_versionState} onChange={handleChange_preference_version} />
                              </Stack>
                      <Stack id="form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-8-23" data-oods-component="Input" label="Monotonic counter incremented whenever preferences mutate (invalidates caches)." placeholder="Enter preference mutations" type="number" value={handleChange_preference_mutationsState} onChange={handleChange_preference_mutations} />
                              </Stack>
                      <Stack id="form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                <Input id="slot-field-9-25" data-oods-component="Input" label="Primary identifier used to correlate identity across services." placeholder="Enter user id" required value={handleChange_user_idState} onChange={handleChange_user_id} />
                              </Stack>
                    </Stack>
              <Stack id="form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                      <Button id="form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                    </Stack>
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-form-11">
          <button type="button" data-oods-action="handleChange" onClick={() => handleChange()}>Change</button>
          <button type="button" data-oods-action="handleSubmit" onClick={() => handleSubmit()}>Submit</button>
        </div>
      </>
    </>
  );
};
