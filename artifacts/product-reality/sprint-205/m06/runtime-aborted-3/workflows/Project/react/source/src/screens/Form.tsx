import React from 'react';
import { Banner, Button, Input, Stack, StatusSelector, TagInput, Textarea } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Chunk count. */
  chunkCount: number;
  /** Created at. */
  createdAt: string;
  /** Display projection of description; never truncates persisted content. */
  description?: string;
  /** Document count. */
  documentCount: number;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Id. */
  id: string;
  /** Display projection of name; retain the complete source field. */
  label: string;
  /** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
  lastEvent?: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Last quality check. */
  lastQualityCheck?: string;
  /** Last updated. */
  lastUpdated?: string;
  /** Methodology. */
  methodology?: string;
  /** Mission protocol id. */
  missionProtocolId?: string;
  /** Name. */
  name: string;
  /** Authoritative nullable server owner_id. Present in this response. */
  ownerId?: string;
  /** user only when an authoritative owner_id is present. */
  ownerType?: 'user';
  /** Optional role name describing how the owner governs the entity. */
  ownershipRole?: string;
  /** Timestamp recording when ownership was last transferred. */
  ownershipTransferredAt?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Project id. */
  projectId: string;
  /** Quality score. */
  qualityScore?: number;
  /** Report count. */
  reportCount: number;
  /** Research type. */
  researchType?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
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
  /** Canonical research lifecycle. The API remains authoritative; do not coerce an unknown server value. */
  status: 'active' | 'archived' | 'completed';
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
  /** Total tokens. */
  totalTokens: number;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Updated at. */
  updatedAt: string;
  /** User id. */
  userId?: string;
  /** Workspace id. */
  workspaceId?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;
type TagInputProps = React.ComponentPropsWithoutRef<typeof TagInput>;
type TextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, chunkCount, createdAt, description, documentCount, filterCount, filters, id, label, lastEvent, lastEventAt, lastQualityCheck, lastUpdated, methodology, missionProtocolId, name, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, projectId, qualityScore, reportCount, researchType, searchActive, searchQuery, stateHistory, status, tagCount, tagMetadata, tags, totalItems, totalPages, totalTokens, updatedAt, userId, workspaceId }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
  const [handleChange_descriptionState, setHandleChange_descriptionState] = React.useState<string>(String(description ?? ''));
  /* @oods-local-binding handleChange_description */ const handleChange_description = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setHandleChange_descriptionState(event.currentTarget.value); };
  const [handleChange_labelState, setHandleChange_labelState] = React.useState<string>(String(label ?? ''));
  /* @oods-local-binding handleChange_label */ const handleChange_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_labelState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_owner_idState, setHandleChange_owner_idState] = React.useState<string>(String(ownerId ?? ''));
  /* @oods-local-binding handleChange_owner_id */ const handleChange_owner_id = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_owner_idState(event.currentTarget.value); };
  const [handleChange_ownership_roleState, setHandleChange_ownership_roleState] = React.useState<string>(String(ownershipRole ?? ''));
  /* @oods-local-binding handleChange_ownership_role */ const handleChange_ownership_role = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_ownership_roleState(event.currentTarget.value); };
  const [handleChange_pageState, setHandleChange_pageState] = React.useState<string>(String(page ?? ''));
  /* @oods-local-binding handleChange_page */ const handleChange_page = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_pageState(event.currentTarget.value); };
  const [handleChange_pageSizeState, setHandleChange_pageSizeState] = React.useState<string>(String(pageSize ?? ''));
  /* @oods-local-binding handleChange_pageSize */ const handleChange_pageSize = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_pageSizeState(event.currentTarget.value); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
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
                                <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" options={[{"label":"Active","value":"active"},{"label":"Archived","value":"archived"},{"label":"Completed","value":"completed"}]} value={handleChange_statusState} onChange={handleChange_status} />
                                <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" value={handleChange_tagsState} onChange={handleChange_tags} tags={tags} />
                              </Stack>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Textarea id="form-slot-field-0-3" data-oods-component="Textarea" help="Display projection of description; never truncates persisted content." label="Description" value={handleChange_descriptionState} onChange={handleChange_description} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-1-5" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" value={handleChange_pageState} onChange={handleChange_page} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="Created at." label="Created at" placeholder="Created at." required type="datetime-local" value={handleChange_created_atState} onChange={handleChange_created_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" value={handleChange_ownership_roleState} onChange={handleChange_ownership_role} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Number of items displayed per page." label="Page Size" placeholder="Enter pageSize" required type="number" value={handleChange_pageSizeState} onChange={handleChange_pageSize} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Enter label" required value={handleChange_labelState} onChange={handleChange_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" value={handleChange_last_eventState} onChange={handleChange_last_event} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Identifier of the owner." label="Owner id" placeholder="Enter owner id" value={handleChange_owner_idState} onChange={handleChange_owner_id} />
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
