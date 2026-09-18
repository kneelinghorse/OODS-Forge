import React from 'react';
import { Banner, Button, LabelCell, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ label: string; description?: string; placeholder?: string; createdAt: string; updatedAt?: string; lastEvent: 'updated'; lastEventAt?: string; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; clusterId: string; leadTitle: string; leadUrl?: string; lens: 'entity' | 'semantic'; memberCount?: number; memberPeopleCount?: number; dominantCategory?: string; isTrending?: boolean; windowDays?: number; maxSimilarity?: number; meanSimilarity?: number; people?: Record<string, unknown>[]; members?: Record<string, unknown>[] }>;
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
  /** Hive's identifier for the cluster, an integer surrogate key declared as a string. Present on the entity lens; the semantic lens computes clusters on the fly and does not persist one. */
  clusterId: string;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** The category most of its articles carry. Deliberately unconstrained: the server is authoritative and an unknown category is not coerced into the cohort's topic vocabulary, which is a different list serving a different purpose. */
  dominantCategory?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Whether Hive marks the conversation as trending. */
  isTrending?: boolean;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'updated';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** The title of the article that leads the conversation. */
  leadTitle: string;
  /** Where that article is. */
  leadUrl?: string;
  /** Which clusterer produced this record. Not a detail: the two lenses answer different questions and disagree by design — entity is the persisted entity-and-title-token clusterer that the co-talker counts are built from, semantic is an on-the-fly pgvector cosine at threshold 0.80 that finds two people writing about one idea in different vocabulary. A cluster is only meaningful beside the lens that produced it. */
  lens: 'entity' | 'semantic';
  /** Semantic lens only: the strongest cosine similarity in the cluster. Absent on the entity lens, where it does not exist — absence means the lens did not produce it, never a similarity of zero. */
  maxSimilarity?: number;
  /** Semantic lens only, on the same terms. */
  meanSimilarity?: number;
  /** How many articles are in the conversation. */
  memberCount?: number;
  /** How many distinct cohort members are in it — the number that makes a cluster worth reading, since Hive's default is the multi-person cluster its own signal uniquely produces. */
  memberPeopleCount?: number;
  /** The articles themselves, as {article_id, title, url, published_at, category, person_id, person_name}. */
  members?: Record<string, unknown>[];
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** The cohort members in the conversation, as {person_id, name, primary_topic, article_count_in_cluster}. primary_topic travels with each of them so a cluster that spans several slices of the cohort can be read without a second lookup. */
  people?: Record<string, unknown>[];
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
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
  /** The lookback this record was read for. Every count here is only true of a window. */
  windowDays?: number;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type LabelCellProps = React.ComponentPropsWithoutRef<typeof LabelCell>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, categories, classificationMetadata, clusterId, createdAt, description, dominantCategory, filterCount, filters, isTrending, label, lastEvent, lastEventAt, leadTitle, leadUrl, lens, maxSimilarity, meanSimilarity, memberCount, memberPeopleCount, members, page, pageSize, people, placeholder, primaryCategoryId, primaryCategoryPath, searchActive, searchQuery, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, windowDays, rows = [], collectionQuery = {} }) => {
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
                                <Select id="list-slot-filters-2" label="Lens" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'entity', 'label': 'Entity'}, {'value': 'semantic', 'label': 'Semantic'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('label')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ label, description, placeholder, createdAt, updatedAt, lastEvent, lastEventAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, clusterId, leadTitle, leadUrl, lens, memberCount, memberPeopleCount, dominantCategory, isTrending, windowDays, maxSimilarity, meanSimilarity, people, members }, collectionIndex) => <li key={String(clusterId)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(clusterId)} onClick={() => handleRowClick(String(clusterId))}><LabelCell id={'list-ve-items-10-' + collectionIndex} data-oods-component="LabelCell" truncate description={description} label={label} />
                      <RelativeTimestamp id={'list-ve-items-14-' + collectionIndex} data-oods-component="RelativeTimestamp" datetime={updatedAt ?? createdAt} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
