import React from 'react';
import { Banner, Button, LabelCell, OwnerBadge, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, TagPills, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ label: string; description: string; placeholder?: string; status: 'draft' | 'queued' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'validation_failed'; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt: string; lastEvent?: string; lastEventAt?: string; ownerId?: string; ownerType?: 'user'; ownershipRole?: string; ownershipTransferredAt?: string; tags?: string[]; tagCount: number; tagMetadata?: Record<string, unknown>[]; cancelAtPeriodEnd?: boolean; cancellationReason?: string; cancellationReasonCode?: string; cancellationRequestedAt?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; missionId: string; title: string; objective: string; successCriteria: string[]; id: string; projectId?: string; projectName?: string; context?: Record<string, unknown>; deliverables?: string[]; researchPhases?: Record<string, unknown>; metadata?: Record<string, unknown>; background?: string; focus?: string; references?: Record<string, unknown>[]; requiredEntities?: string[]; excludedEntities?: string[]; expectedOutputSchema?: Record<string, unknown>; coverageThresholds?: Record<string, unknown>; validationThresholds?: Record<string, unknown>; deliverableFormat?: string; maxLoops?: number; minLoops?: number; constraints?: string[]; queuedAt?: string; startedAt?: string; completedAt?: string; deepsearchJobId?: string; executionMetadata?: Record<string, unknown>; resultDocumentIds?: string[]; resultReportId?: string; resultMarkdown?: string; resultProtocol?: Record<string, unknown>; errorMessage?: string; createdBy?: string; progressPercent?: number; currentPhase?: string; deepsearchAttemptCount?: number; leaseExpiresAt?: string; materializationPending: boolean; materializationStatus?: string; materializationAttemptCount?: number; materializationError?: string; searchReady: boolean }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
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
type LabelCellProps = React.ComponentPropsWithoutRef<typeof LabelCell>;
type OwnerBadgeProps = React.ComponentPropsWithoutRef<typeof OwnerBadge>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TagPillsProps = React.ComponentPropsWithoutRef<typeof TagPills>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, background, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, completedAt, constraints, context, coverageThresholds, createdAt, createdBy, currentPhase, deepsearchAttemptCount, deepsearchJobId, deliverableFormat, deliverables, description, errorMessage, excludedEntities, executionMetadata, expectedOutputSchema, filterCount, filters, focus, id, label, lastEvent, lastEventAt, leaseExpiresAt, materializationAttemptCount, materializationError, materializationPending, materializationStatus, maxLoops, metadata, minLoops, missionId, objective, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, progressPercent, projectId, projectName, queuedAt, references, requiredEntities, researchPhases, resultDocumentIds, resultMarkdown, resultProtocol, resultReportId, searchActive, searchQuery, searchReady, startedAt, stateHistory, status, successCriteria, tagCount, tagMetadata, tags, title, totalItems, totalPages, updatedAt, validationThresholds, rows = [], collectionQuery = {} }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };

  return (
    <>
      <Stack id="list-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'error' && (
              <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {(uiState === 'success' || uiState === 'empty') && (
              <Stack id="list-screen-list-9-success" data-oods-component="Stack" data-oods-state={uiState === 'success' ? 'success' : undefined} data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                      <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                                <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" value={collectionQuery.search ?? ''} clearable={true} onValueChange={(search) => handleFilter({ ...collectionQuery, search })} />
                                <Select id="list-slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'draft', 'label': 'Draft'}, {'value': 'queued', 'label': 'Queued'}, {'value': 'in_progress', 'label': 'In Progress'}, {'value': 'completed', 'label': 'Completed'}, {'value': 'blocked', 'label': 'Blocked'}, {'value': 'cancelled', 'label': 'Cancelled'}, {'value': 'validation_failed', 'label': 'Validation Failed'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('title')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ label, description, placeholder, status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, ownerId, ownerType, ownershipRole, ownershipTransferredAt, tags, tagCount, tagMetadata, cancelAtPeriodEnd, cancellationReason, cancellationReasonCode, cancellationRequestedAt, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, missionId, title, objective, successCriteria, id, projectId, projectName, context, deliverables, researchPhases, metadata, background, focus, references, requiredEntities, excludedEntities, expectedOutputSchema, coverageThresholds, validationThresholds, deliverableFormat, maxLoops, minLoops, constraints, queuedAt, startedAt, completedAt, deepsearchJobId, executionMetadata, resultDocumentIds, resultReportId, resultMarkdown, resultProtocol, errorMessage, createdBy, progressPercent, currentPhase, deepsearchAttemptCount, leaseExpiresAt, materializationPending, materializationStatus, materializationAttemptCount, materializationError, searchReady }, collectionIndex) => <li key={String(id)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(id)} onClick={() => handleRowClick(String(id))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{title}</Text>
                      <LabelCell id={'list-ve-items-10-' + collectionIndex} data-oods-component="LabelCell" truncate description={description} label={label} />
                      <StatusBadge id={'list-ve-items-14-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} />
                      <RelativeTimestamp id={'list-ve-items-15-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
                      <OwnerBadge id={'list-ve-items-16-' + collectionIndex} data-oods-component="OwnerBadge" owner={ownerId} ownerType={ownerType} />
                      <TagPills id={'list-ve-items-17-' + collectionIndex} data-oods-component="TagPills" maxVisible={3} overflowLabel="+{{ tag_count }}" tags={tags} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
