import React from 'react';
import { Banner, Button, CancellationForm, Checkbox, Input, Stack, StatusSelector, TagInput } from '@oods/components-react';
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
  /** Background. */
  background?: string;
  /** TraceLab cancellation is immediate; no billing period exists. Period-end controls must not be used. */
  cancelAtPeriodEnd?: boolean;
  /** Free-form detail describing why cancellation occurred. */
  cancellationReason?: string;
  /** Structured reason code chosen from the allowedReasons parameter. */
  cancellationReasonCode?: string;
  /** Timestamp capturing when the cancellation workflow was initiated. */
  cancellationRequestedAt?: string;
  /** Completed at. */
  completedAt?: string;
  /** Constraints. */
  constraints?: string[];
  /** Context. */
  context?: Record<string, unknown>;
  /** Coverage thresholds. */
  coverageThresholds?: Record<string, unknown>;
  /** Created at. */
  createdAt: string;
  /** Created by. */
  createdBy?: string;
  /** Current phase. */
  currentPhase?: string;
  /** Deepsearch attempt count. */
  deepsearchAttemptCount?: number;
  /** Deepsearch job id. */
  deepsearchJobId?: string;
  /** Deliverable format. */
  deliverableFormat?: string;
  /** Deliverables. */
  deliverables?: string[];
  /** Display projection of objective; never truncates persisted content. */
  description: string;
  /** Error message. */
  errorMessage?: string;
  /** Excluded entities. */
  excludedEntities?: string[];
  /** Execution metadata. */
  executionMetadata?: Record<string, unknown>;
  /** Expected output schema. */
  expectedOutputSchema?: Record<string, unknown>;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Focus. */
  focus?: string;
  /** Id. */
  id: string;
  /** Display projection of title; retain the complete source field. */
  label: string;
  /** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
  lastEvent?: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Lease expires at. */
  leaseExpiresAt?: string;
  /** Materialization attempt count. */
  materializationAttemptCount?: number;
  /** Materialization error. */
  materializationError?: string;
  /** Materialization pending. */
  materializationPending: boolean;
  /** Materialization status. */
  materializationStatus?: string;
  /** Max loops. */
  maxLoops?: number;
  /** Metadata. */
  metadata?: Record<string, unknown>;
  /** Min loops. */
  minLoops?: number;
  /** Human-readable mission identifier (e.g., B16.1) */
  missionId: string;
  /** What this mission aims to achieve (minimum 10 characters) */
  objective: string;
  /** Authoritative nullable server owner_id. Not exposed by the current response; unavailable until the API exposes it. Never derive from created_by, user_id, or project owner. */
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
  /** Progress percent. */
  progressPercent?: number;
  /** Project id. */
  projectId?: string;
  /** Name of the associated project */
  projectName?: string;
  /** Queued at. */
  queuedAt?: string;
  /** References. */
  references?: Record<string, unknown>[];
  /** Required entities. */
  requiredEntities?: string[];
  /** Research phases. */
  researchPhases?: Record<string, unknown>;
  /** Result document ids. */
  resultDocumentIds?: string[];
  /** Result markdown. */
  resultMarkdown?: string;
  /** Result protocol. */
  resultProtocol?: Record<string, unknown>;
  /** Result report id. */
  resultReportId?: string;
  /** Search ready. */
  searchReady: boolean;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Started at. */
  startedAt?: string;
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
  status: 'draft' | 'queued' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'validation_failed';
  /** Array of measurable success conditions */
  successCriteria: string[];
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
  /** Tags. */
  tags?: string[];
  /** Mission title */
  title: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Updated at. */
  updatedAt: string;
  /** Validation thresholds. */
  validationThresholds?: Record<string, unknown>;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CancellationFormProps = React.ComponentPropsWithoutRef<typeof CancellationForm>;
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusSelectorProps = React.ComponentPropsWithoutRef<typeof StatusSelector>;
type TagInputProps = React.ComponentPropsWithoutRef<typeof TagInput>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, background, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, completedAt, constraints, context, coverageThresholds, createdAt, createdBy, currentPhase, deepsearchAttemptCount, deepsearchJobId, deliverableFormat, deliverables, description, errorMessage, excludedEntities, executionMetadata, expectedOutputSchema, filterCount, filters, focus, id, label, lastEvent, lastEventAt, leaseExpiresAt, materializationAttemptCount, materializationError, materializationPending, materializationStatus, maxLoops, metadata, minLoops, missionId, objective, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, progressPercent, projectId, projectName, queuedAt, references, requiredEntities, researchPhases, resultDocumentIds, resultMarkdown, resultProtocol, resultReportId, searchActive, searchQuery, searchReady, startedAt, stateHistory, status, successCriteria, tagCount, tagMetadata, tags, title, totalItems, totalPages, updatedAt, validationThresholds }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_created_atState, setHandleChange_created_atState] = React.useState<string>(String(createdAt ?? ''));
  /* @oods-local-binding handleChange_created_at */ const handleChange_created_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_created_atState(event.currentTarget.value); };
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
  const [handleChange_searchActiveState, setHandleChange_searchActiveState] = React.useState<boolean>(searchActive ?? false);
  /* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_searchActiveState(event.currentTarget.checked); };
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
                                <StatusSelector id="form-ve-title-27" data-oods-component="StatusSelector" help="Choose the current status." label="Status" options={[{"label":"Draft","value":"draft"},{"label":"Queued","value":"queued"},{"label":"In Progress","value":"in_progress"},{"label":"Completed","value":"completed"},{"label":"Blocked","value":"blocked"},{"label":"Cancelled","value":"cancelled"},{"label":"Validation Failed","value":"validation_failed"}]} value={handleChange_statusState} onChange={handleChange_status} />
                                <TagInput id="form-ve-title-28" data-oods-component="TagInput" label="Tags" placeholder="Enter tags" value={handleChange_tagsState} onChange={handleChange_tags} tags={tags} />
                                <CancellationForm id="form-ve-title-29" data-oods-component="CancellationForm" allowedReasons={[]} codeHelp="Structured reason code chosen from the allowedReasons parameter." embedded reasonHelp="Free-form detail describing why cancellation occurred." reason={cancellationReason} reasonCode={cancellationReasonCode} />
                              </Stack>
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-0-3" data-oods-component="Input" help="Name shown for this record." label="Label" placeholder="Display projection of title; retain the complete source field." required value={handleChange_labelState} onChange={handleChange_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="Created at." label="Created at" placeholder="Created at." required type="datetime-local" value={handleChange_created_atState} onChange={handleChange_created_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Optional role name describing how the owner governs the entity." label="Ownership role" placeholder="Enter ownership role" value={handleChange_ownership_roleState} onChange={handleChange_ownership_role} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Checkbox id="form-slot-field-5-17" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" checked={handleChange_searchActiveState} onChange={handleChange_searchActive} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }} />
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event." label="Last event" placeholder="Enter last event" value={handleChange_last_eventState} onChange={handleChange_last_event} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Identifier of the owner." label="Owner id" placeholder="Enter owner id" value={handleChange_owner_idState} onChange={handleChange_owner_id} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" value={handleChange_pageState} onChange={handleChange_page} />
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
