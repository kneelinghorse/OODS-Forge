import React from 'react';
import { Banner, CancellationEvent, Card, DetailHeader, OwnershipSummary, Stack, StatusTimeline, Tabs, TagSummary, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleCancel: () => void;
  handleEdit: () => void;
  handleViewTimeline: () => void;
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
type CancellationEventProps = React.ComponentPropsWithoutRef<typeof CancellationEvent>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type OwnershipSummaryProps = React.ComponentPropsWithoutRef<typeof OwnershipSummary>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TagSummaryProps = React.ComponentPropsWithoutRef<typeof TagSummary>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, background, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, completedAt, constraints, context, coverageThresholds, createdAt, createdBy, currentPhase, deepsearchAttemptCount, deepsearchJobId, deliverableFormat, deliverables, description, errorMessage, excludedEntities, executionMetadata, expectedOutputSchema, filterCount, filters, focus, id, label, lastEvent, lastEventAt, leaseExpiresAt, materializationAttemptCount, materializationError, materializationPending, materializationStatus, maxLoops, metadata, minLoops, missionId, objective, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, progressPercent, projectId, projectName, queuedAt, references, requiredEntities, researchPhases, resultDocumentIds, resultMarkdown, resultProtocol, resultReportId, searchActive, searchQuery, searchReady, startedAt, stateHistory, status, successCriteria, tagCount, tagMetadata, tags, title, totalItems, totalPages, updatedAt, validationThresholds }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
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
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" title={title} subtitle={description} level={2} />
                                              <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                              <OwnershipSummary id="detail-ve-header-28" data-oods-component="OwnershipSummary" ownerId={ownerId} ownerType={ownerType} role={ownershipRole} />
                                              <TagSummary id="detail-ve-header-29" data-oods-component="TagSummary" label="Tags" tagCount={tagCount} tags={tags} />
                                              <CancellationEvent id="detail-ve-header-30" data-oods-component="CancellationEvent" title="Cancellation" timestamp={cancellationRequestedAt} reason={cancellationReason} code={cancellationReasonCode} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                        <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Stack id="detail-pg-status-timeline-33-read-field" data-oods-component="Stack">
                                                  <Text id="detail-pg-status-timeline-33-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                  <Text id="detail-pg-status-timeline-33-value" data-oods-component="Text">{formatReadOnlyValue(allowedTransitions, "string[]", false)}</Text>
                                                </Stack>
                                          </Stack>
                                        <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Created at" />
                                            <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
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
                                        <Stack id="detail-detail-tabs-9-mission_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-mission_id-label" data-oods-component="Text" as="strong" content="Mission id" />
                                            <Text id="detail-detail-tabs-9-mission_id-value" data-oods-component="Text">{formatReadOnlyValue(missionId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-objective-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-objective-label" data-oods-component="Text" as="strong" content="Objective" />
                                            <Text id="detail-detail-tabs-9-objective-value" data-oods-component="Text">{formatReadOnlyValue(objective, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-id-label" data-oods-component="Text" as="strong" content="Id" />
                                            <Text id="detail-detail-tabs-9-id-value" data-oods-component="Text">{formatReadOnlyValue(id, "uuid", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                            <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{formatReadOnlyValue(projectId, "uuid", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-project_name-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-project_name-label" data-oods-component="Text" as="strong" content="Project name" />
                                            <Text id="detail-detail-tabs-9-project_name-value" data-oods-component="Text">{formatReadOnlyValue(projectName, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-background-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-background-label" data-oods-component="Text" as="strong" content="Background" />
                                            <Text id="detail-detail-tabs-9-background-value" data-oods-component="Text">{formatReadOnlyValue(background, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-focus-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-focus-label" data-oods-component="Text" as="strong" content="Focus" />
                                            <Text id="detail-detail-tabs-9-focus-value" data-oods-component="Text">{formatReadOnlyValue(focus, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-deliverable_format-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-deliverable_format-label" data-oods-component="Text" as="strong" content="Deliverable format" />
                                            <Text id="detail-detail-tabs-9-deliverable_format-value" data-oods-component="Text">{formatReadOnlyValue(deliverableFormat, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-max_loops-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-max_loops-label" data-oods-component="Text" as="strong" content="Max loops" />
                                            <Text id="detail-detail-tabs-9-max_loops-value" data-oods-component="Text">{formatReadOnlyValue(maxLoops, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-min_loops-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-min_loops-label" data-oods-component="Text" as="strong" content="Min loops" />
                                            <Text id="detail-detail-tabs-9-min_loops-value" data-oods-component="Text">{formatReadOnlyValue(minLoops, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-queued_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-queued_at-label" data-oods-component="Text" as="strong" content="Queued at" />
                                            <Text id="detail-detail-tabs-9-queued_at-value" data-oods-component="Text">{formatReadOnlyValue(queuedAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-started_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-started_at-label" data-oods-component="Text" as="strong" content="Started at" />
                                            <Text id="detail-detail-tabs-9-started_at-value" data-oods-component="Text">{formatReadOnlyValue(startedAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-completed_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-completed_at-label" data-oods-component="Text" as="strong" content="Completed at" />
                                            <Text id="detail-detail-tabs-9-completed_at-value" data-oods-component="Text">{formatReadOnlyValue(completedAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-deepsearch_job_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-deepsearch_job_id-label" data-oods-component="Text" as="strong" content="Deepsearch job id" />
                                            <Text id="detail-detail-tabs-9-deepsearch_job_id-value" data-oods-component="Text">{formatReadOnlyValue(deepsearchJobId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-result_report_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-result_report_id-label" data-oods-component="Text" as="strong" content="Result report id" />
                                            <Text id="detail-detail-tabs-9-result_report_id-value" data-oods-component="Text">{formatReadOnlyValue(resultReportId, "uuid", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-result_markdown-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-result_markdown-label" data-oods-component="Text" as="strong" content="Result markdown" />
                                            <Text id="detail-detail-tabs-9-result_markdown-value" data-oods-component="Text">{formatReadOnlyValue(resultMarkdown, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-error_message-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-error_message-label" data-oods-component="Text" as="strong" content="Error message" />
                                            <Text id="detail-detail-tabs-9-error_message-value" data-oods-component="Text">{formatReadOnlyValue(errorMessage, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-created_by-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-created_by-label" data-oods-component="Text" as="strong" content="Created by" />
                                            <Text id="detail-detail-tabs-9-created_by-value" data-oods-component="Text">{formatReadOnlyValue(createdBy, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-progress_percent-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-progress_percent-label" data-oods-component="Text" as="strong" content="Progress percent" />
                                            <Text id="detail-detail-tabs-9-progress_percent-value" data-oods-component="Text">{formatReadOnlyValue(progressPercent, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-current_phase-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-current_phase-label" data-oods-component="Text" as="strong" content="Current phase" />
                                            <Text id="detail-detail-tabs-9-current_phase-value" data-oods-component="Text">{formatReadOnlyValue(currentPhase, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-deepsearch_attempt_count-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-deepsearch_attempt_count-label" data-oods-component="Text" as="strong" content="Deepsearch attempt count" />
                                            <Text id="detail-detail-tabs-9-deepsearch_attempt_count-value" data-oods-component="Text">{formatReadOnlyValue(deepsearchAttemptCount, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-lease_expires_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-lease_expires_at-label" data-oods-component="Text" as="strong" content="Lease expires at" />
                                            <Text id="detail-detail-tabs-9-lease_expires_at-value" data-oods-component="Text">{formatReadOnlyValue(leaseExpiresAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-materialization_pending-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-materialization_pending-label" data-oods-component="Text" as="strong" content="Materialization pending" />
                                            <Text id="detail-detail-tabs-9-materialization_pending-value" data-oods-component="Text">{formatReadOnlyValue(materializationPending, "boolean", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-materialization_status-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-materialization_status-label" data-oods-component="Text" as="strong" content="Materialization status" />
                                            <Text id="detail-detail-tabs-9-materialization_status-value" data-oods-component="Text">{formatReadOnlyValue(materializationStatus, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-materialization_attempt_count-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-materialization_attempt_count-label" data-oods-component="Text" as="strong" content="Materialization attempt count" />
                                            <Text id="detail-detail-tabs-9-materialization_attempt_count-value" data-oods-component="Text">{formatReadOnlyValue(materializationAttemptCount, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-materialization_error-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-materialization_error-label" data-oods-component="Text" as="strong" content="Materialization error" />
                                            <Text id="detail-detail-tabs-9-materialization_error-value" data-oods-component="Text">{formatReadOnlyValue(materializationError, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-search_ready-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-search_ready-label" data-oods-component="Text" as="strong" content="Search ready" />
                                            <Text id="detail-detail-tabs-9-search_ready-value" data-oods-component="Text">{formatReadOnlyValue(searchReady, "boolean", false)}</Text>
                                          </Stack>
                                      </Stack>
                                    ) }
                                  ]} />
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleCancel" onClick={() => handleCancel()}>Cancel record</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
