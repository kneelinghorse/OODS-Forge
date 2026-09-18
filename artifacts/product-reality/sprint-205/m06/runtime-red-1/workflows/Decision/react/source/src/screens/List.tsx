import React from 'react';
import { Banner, Button, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ supersessionStatus: string; supersededBy?: string; supersedes?: string; supersededAt?: string | null; supersessionReason?: string; createdAt: string; updatedAt?: string; lastEvent: 'captured'; lastEventAt?: string; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; decisionId: string; decisionText: string; sprintId?: string; missionId?: string; sessionId?: string; projectId: string; projectDomain?: string; evidence?: Record<string, unknown>[] }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** The record's own identifier. CMOS assigns an integer; the object declares a string so the same shape carries another store's identifiers without coercion. */
  decisionId: string;
  /** The decision as it was written. The longest free text this registry carries: 61 to 8,418 characters in the live store, with 197 of 1,933 rows over 2,000, so every context that shows it must stay readable at 390 without hiding meaning. */
  decisionText: string;
  /** What the decision cites, as {type, id} references. Sparse (null on 1,923 rows) but real, and the rows a preview shows beside a design. */
  evidence?: Record<string, unknown>[];
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'captured';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** The mission that captured it, as CMOS stores it. Recorded loosely — often a bare "m02" rather than a fully qualified "s203-m02" — so it is shown as a label and never as a resolved link. */
  missionId?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Optional area within the project. Sparse — null on 1,850 of 1,933 rows. */
  projectDomain?: string;
  /** The project the decision belongs to. A slug such as "forge", never a uuid. */
  projectId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The session that recorded the decision. Null on 838 of 1,933 rows. */
  sessionId?: string;
  /** The sprint the decision was taken in. Every non-null value in the live store resolves against a sprint, none dangling. */
  sprintId?: string;
  /** When the replacement happened, when the store records it. CMOS does not, so a Decision leaves
it absent rather than borrowing the replacement's creation time.
 */
  supersededAt?: string | null;
  /** Identifier of the record that replaced this one. Present when the store records the forward
pointer. Absent means not replaced, or not known — the two are distinguished by
supersession_status, never by the pointer alone.
 */
  supersededBy?: string;
  /** Identifier of the record this one replaced. Present when the store records the backward
pointer. Never inferred from ordering.
 */
  supersedes?: string;
  /** Why the record was replaced, when the store carries a reason. */
  supersessionReason?: string;
  /** Whether this record still stands. Named apart from Stateful's `status` so an object can carry
both a lifecycle and a supersession lineage.
 */
  supersessionStatus: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, categories, classificationMetadata, createdAt, decisionId, decisionText, evidence, filterCount, filters, lastEvent, lastEventAt, missionId, page, pageSize, primaryCategoryId, primaryCategoryPath, projectDomain, projectId, searchActive, searchQuery, sessionId, sprintId, supersededAt, supersededBy, supersedes, supersessionReason, supersessionStatus, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, rows = [], collectionQuery = {} }) => {
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
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('decision_id')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ supersessionStatus, supersededBy, supersedes, supersededAt, supersessionReason, createdAt, updatedAt, lastEvent, lastEventAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, decisionId, decisionText, sprintId, missionId, sessionId, projectId, projectDomain, evidence }, collectionIndex) => <li key={String(decisionId)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(decisionId)} onClick={() => handleRowClick(String(decisionId))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{decisionId}</Text>
                      <RelativeTimestamp id={'list-slot-items-6-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} />
                      <StatusBadge id={'list-ve-toolbar-actions-13-' + collectionIndex} data-oods-component="StatusBadge" emphasis="subtle" showIcon={false} status={supersessionStatus} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
