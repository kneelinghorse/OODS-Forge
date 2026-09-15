import React from 'react';
import { Banner, Button, LabelCell, OwnerBadge, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ label: string; description?: string; placeholder?: string; status: 'pending' | 'processed' | 'chunked' | 'embedded' | 'failed'; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt?: string; updatedAt?: string; lastEvent?: string; lastEventAt?: string; ownerId?: string; ownerType?: 'user'; ownershipRole?: string; ownershipTransferredAt?: string; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; projectId: string; name: string; filePath?: string; fileType?: string; content?: string; rawContent?: string; uploadedAt?: string; fileSize?: number; mimeType?: string; sourceType?: string; participantCount?: number; collectionDate?: string; processed?: boolean; chunked?: boolean; embedded?: boolean; transcriptionAccuracy?: number; validationStatus?: string; id: string; chunks?: unknown[]; processingEvents?: unknown[]; chunkCount?: number; totalTokens?: number; wordCount?: number; preview?: string }>;
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
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Chunk count. */
  chunkCount?: number;
  /** Chunked. */
  chunked?: boolean;
  /** Chunks. */
  chunks?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Collection date. */
  collectionDate?: string;
  /** Content. */
  content?: string;
  /** uploaded_at when present; unavailable otherwise. */
  createdAt?: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Embedded. */
  embedded?: boolean;
  /** File path. */
  filePath?: string;
  /** File size. */
  fileSize?: number;
  /** File type. */
  fileType?: string;
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
  /** Mime type. */
  mimeType?: string;
  /** Name. */
  name: string;
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
  /** Participant count. */
  participantCount?: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Preview. */
  preview?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Processed. */
  processed?: boolean;
  /** Processing events. */
  processingEvents?: unknown[];
  /** Project id. */
  projectId: string;
  /** Raw content. */
  rawContent?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Source type. */
  sourceType?: string;
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
  /** Canonical research lifecycle. Display projection only: explicit latest failure, then embedded, chunked, processed, pending; missing input remains unknown. */
  status: 'pending' | 'processed' | 'chunked' | 'embedded' | 'failed';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Tags. */
  tags?: unknown[];
  /** Total tokens. */
  totalTokens?: number;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Transcription accuracy. */
  transcriptionAccuracy?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Uploaded at. */
  uploadedAt?: string;
  /** Validation status. */
  validationStatus?: string;
  /** Word count. */
  wordCount?: number;
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
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, categories, chunkCount, chunked, chunks, classificationMetadata, collectionDate, content, createdAt, description, embedded, filePath, fileSize, fileType, filterCount, filters, id, label, lastEvent, lastEventAt, mimeType, name, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, participantCount, placeholder, preview, primaryCategoryId, primaryCategoryPath, processed, processingEvents, projectId, rawContent, searchActive, searchQuery, sourceType, stateHistory, status, tagCount, tagPreview, tags, totalItems, totalPages, totalTokens, transcriptionAccuracy, updatedAt, uploadedAt, validationStatus, wordCount, rows = [], collectionQuery = {} }) => {
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
                                <Select id="list-slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'pending', 'label': 'Pending'}, {'value': 'processed', 'label': 'Processed'}, {'value': 'chunked', 'label': 'Chunked'}, {'value': 'embedded', 'label': 'Embedded'}, {'value': 'failed', 'label': 'Failed'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('name')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ label, description, placeholder, status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, ownerId, ownerType, ownershipRole, ownershipTransferredAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, projectId, name, filePath, fileType, content, rawContent, uploadedAt, fileSize, mimeType, sourceType, participantCount, collectionDate, processed, chunked, embedded, transcriptionAccuracy, validationStatus, id, chunks, processingEvents, chunkCount, totalTokens, wordCount, preview }, collectionIndex) => <li key={String(id)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(id)} onClick={() => handleRowClick(String(id))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{name}</Text>
                      <LabelCell id={'list-ve-items-10-' + collectionIndex} data-oods-component="LabelCell" truncate description={description} label={label} />
                      <StatusBadge id={'list-ve-items-14-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} />
                      <RelativeTimestamp id={'list-ve-items-15-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
                      <OwnerBadge id={'list-ve-items-16-' + collectionIndex} data-oods-component="OwnerBadge" owner={ownerId} ownerType={ownerType} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
