import React from 'react';
import { Banner, CancellationEvent, Card, DetailHeader, FilterPanel, OwnershipSummary, SearchInput, Stack, StatusTimeline, Tabs, TagSummary, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleCancel: () => void;
  handleDelete: () => void;
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
type FilterPanelProps = React.ComponentPropsWithoutRef<typeof FilterPanel>;
type OwnershipSummaryProps = React.ComponentPropsWithoutRef<typeof OwnershipSummary>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusTimelineProps = React.ComponentPropsWithoutRef<typeof StatusTimeline>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TagSummaryProps = React.ComponentPropsWithoutRef<typeof TagSummary>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, background, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, completedAt, constraints, context, coverageThresholds, createdAt, createdBy, currentPhase, deepsearchAttemptCount, deepsearchJobId, deliverableFormat, deliverables, description, errorMessage, excludedEntities, executionMetadata, expectedOutputSchema, filterCount, filters, focus, id, label, lastEvent, lastEventAt, leaseExpiresAt, materializationAttemptCount, materializationError, materializationPending, materializationStatus, maxLoops, metadata, minLoops, missionId, objective, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, progressPercent, projectId, projectName, queuedAt, references, requiredEntities, researchPhases, resultDocumentIds, resultMarkdown, resultProtocol, resultReportId, searchActive, searchQuery, searchReady, startedAt, stateHistory, status, successCriteria, tagCount, tagMetadata, tags, title, totalItems, totalPages, updatedAt, validationThresholds }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleCancel') || typeof actions.handleCancel !== 'function') { throw new Error('GeneratedUI requires actions.handleCancel.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleCancel */ const handleCancel = () => { actions.handleCancel(); };
  /* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  const [handleUpdate_searchQueryState, setHandleUpdate_searchQueryState] = React.useState<string>(String(searchQuery ?? ''));
  /* @oods-local-binding handleUpdate_searchQuery */ const handleUpdate_searchQuery = (value: string) => { setHandleUpdate_searchQueryState(value); };
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
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" title={label} subtitle={description} level={1} />
                                              <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason history={stateHistory} allowedTransitions={allowedTransitions} status={status} />
                                              <SearchInput id="detail-ve-header-26" data-oods-component="SearchInput" label="Search Query" placeholder="Enter searchQuery" value={handleUpdate_searchQueryState} onUpdate={handleUpdate_searchQuery} />
                                              <OwnershipSummary id="detail-ve-header-28" data-oods-component="OwnershipSummary" ownerId={ownerId} ownerType={ownerType} role={ownershipRole} />
                                              <TagSummary id="detail-ve-header-29" data-oods-component="TagSummary" label="Tags" tagCount={tagCount} tags={tags} />
                                              <CancellationEvent id="detail-ve-header-30" data-oods-component="CancellationEvent" title="Cancellation" timestamp={cancellationRequestedAt} reason={cancellationReason} code={cancellationReasonCode} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                                  <div data-sidebar-main>
                                    <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                      { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                          <StatusTimeline id="detail-slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                              <Text id="detail-pg-status-timeline-32" data-oods-component="Text" label="Status">{status}</Text>
                                              <Text id="detail-pg-status-timeline-33" data-oods-component="Text" label="Allowed transitions">{Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : ''}</Text>
                                            </StatusTimeline>
                                          <Text id="detail-slot-tab-2-8" data-oods-component="Text" label="Created at">{createdAt}</Text>
                                        </Stack>
                                      ) }
                                    ]} />
                                  </div>
                                  <aside data-sidebar-aside>
                                    <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                                  <FilterPanel id="detail-slot-metadata-12" data-oods-component="FilterPanel" activeFilters={activeFilters} filters={filters} />
                                                </Stack>
                                  </aside>
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleCancel" onClick={() => handleCancel()}>Cancel record</button>
          <button type="button" data-oods-action="handleDelete" onClick={() => handleDelete()}>Archive</button>
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
