import React from 'react';
import { Banner, CancellationEvent, Card, Stack, StateTransitionEvent, TimelineEntryLabel } from '@oods/components-react';
import '@oods/component-styles/css';
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface PageProps {
  events?: CollectionEvent[];
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
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StateTransitionEventProps = React.ComponentPropsWithoutRef<typeof StateTransitionEvent>;
type TimelineEntryLabelProps = React.ComponentPropsWithoutRef<typeof TimelineEntryLabel>;

export const GeneratedUI: React.FC<PageProps> = ({ uiState, activeFilters, allowedTransitions, background, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, completedAt, constraints, context, coverageThresholds, createdAt, createdBy, currentPhase, deepsearchAttemptCount, deepsearchJobId, deliverableFormat, deliverables, description, errorMessage, excludedEntities, executionMetadata, expectedOutputSchema, filterCount, filters, focus, id, label, lastEvent, lastEventAt, leaseExpiresAt, materializationAttemptCount, materializationError, materializationPending, materializationStatus, maxLoops, metadata, minLoops, missionId, objective, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, progressPercent, projectId, projectName, queuedAt, references, requiredEntities, researchPhases, resultDocumentIds, resultMarkdown, resultProtocol, resultReportId, searchActive, searchQuery, searchReady, startedAt, stateHistory, status, successCriteria, tagCount, tagMetadata, tags, title, totalItems, totalPages, updatedAt, validationThresholds, events = [] }) => {
  return (
    <>
      <Stack id="timeline-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <TimelineEntryLabel id="timeline-ve-entry-0-15" data-oods-component="TimelineEntryLabel" compact label={title} />
                              </Stack>
                      <section id="timeline-timeline-entries-13" data-oods-collection="events">{events.length === 0 ? (<Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" content="No events yet." />) : (<ol aria-label="Lifecycle history" className="oods-collection">{chronologicalEvents(events).map((collectionEvent, collectionIndex) => <li key={collectionEvent.id}><Card id={'timeline-timeline-entries-13-entry-' + collectionIndex}><strong>{collectionEvent.title}</strong><time dateTime={collectionEvent.at}>{formatDateTime(collectionEvent.at)}</time><p>{collectionEvent.description}</p></Card></li>)}</ol>)}</section>
                      <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                                <StateTransitionEvent id="timeline-ve-entry-0-16" data-oods-component="StateTransitionEvent" showActor showReason history={stateHistory} status={status} />
                                <CancellationEvent id="timeline-ve-entry-0-17" data-oods-component="CancellationEvent" timestamp={cancellationRequestedAt} reason={cancellationReason} code={cancellationReasonCode} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
