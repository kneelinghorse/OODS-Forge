import React from 'react';
import { Banner, Button, PaginationBar, SearchInput, Select, Stack, StatusBadge, Text } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

export interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

export interface PageProps {
  rows?: Array<{ label: string; description?: string; placeholder?: string; status: 'active' | 'tracked_unfeeded' | 'dormant'; stateHistory?: unknown[]; allowedTransitions?: string[]; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; personId: string; name: string; primaryTopic: 'ai_research' | 'design' | 'ai_engineering' | 'writers' | 'meaning_layer' | 'founders' | 'other' | 'product'; role?: string; org?: string; xHandle?: string; blurb?: string; articleCount?: number; windowDays?: number; articles?: Record<string, unknown>[]; topClusters?: Record<string, unknown>[]; coTalkers?: Record<string, unknown>[] }>;
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
  /** How many articles they published in the window this record was read for. */
  articleCount?: number;
  /** What they published in the window, as {article_id, title, url, published_at, category}. */
  articles?: Record<string, unknown>[];
  /** Why they are worth following, in Derek's own words. Unbounded free text and one of the two readability risks this sprint carries into the craft pass. */
  blurb?: string;
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Who else was in those conversations, as {person_id, name, shared_entity_clusters, shared_semantic_clusters}. Derived for the window, not a stored edge, which is why the universal Relationship object does not carry it: Relationship needs uuid endpoints, a relationship_type, a direction and an is_bidirectional flag, has its own lifecycle and an owner, and expresses strength as one string — while these are two independent counts that disagree (a person can share 0 entity clusters and 2 semantic ones with the same peer). */
  coTalkers?: Record<string, unknown>[];
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** The person's name, as the cohort records it. Present on every row. */
  name: string;
  /** Where they are, when the cohort knows. Free text and frequently absent — null for Simon Willison on the sampled read — and never a reference to an organisation record. */
  org?: string;
  /** Current page number (1-based). */
  page: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Hive's identifier for the person. An integer surrogate key in the store, declared as a string here so it is never treated as arithmetic and so the same shape carries another cohort's ids. */
  personId: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Which slice of the cohort they belong to. Measured from cohort_list, which is the slice-discovery authority: ai_research 167, design 152, ai_engineering 119, writers 85, meaning_layer 71, founders 68, other 39, product 39. */
  primaryTopic: 'ai_research' | 'design' | 'ai_engineering' | 'writers' | 'meaning_layer' | 'founders' | 'other' | 'product';
  /** What they do, in free text as the cohort records it ("Datasette; daily LLM posts"). Deliberately unconstrained: it is a description, not a membership role, which is why core/User cannot carry a cohort member — User's role is an enum of account roles (end_user, admin, owner, billing). */
  role?: string;
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
  /** Canonical lifecycle state derived from the states parameter. This is the single source
of truth for the entity's current lifecycle position. Consumed by Colorized to resolve
visual tokens, and by view extensions to render StatusBadge and StatusTimeline.
 */
  status: 'active' | 'tracked_unfeeded' | 'dormant';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** The conversations they turned up in, as {cluster_id, lead_title, member_count, member_people_count, dominant_category, person_article_count_in_cluster}. */
  topClusters?: Record<string, unknown>[];
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** The lookback the counts and lists on this record were derived for. Every derived field here is only true of a window, so the window travels with them rather than being implied. */
  windowDays?: number;
  /** Their handle, with the leading @ as the cohort stores it. */
  xHandle?: string;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, allowedTransitions, articleCount, articles, blurb, categories, classificationMetadata, coTalkers, description, filterCount, filters, label, name, org, page, pageSize, personId, placeholder, primaryCategoryId, primaryCategoryPath, primaryTopic, role, searchActive, searchQuery, stateHistory, status, tagCount, tagPreview, tags, topClusters, totalItems, totalPages, windowDays, xHandle, rows = [], collectionQuery = {} }) => {
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
                                <Select id="list-slot-filters-2" label="Status" value={collectionQuery.status ?? ''} options={[{'value': '', 'label': 'All states'}, {'value': 'active', 'label': 'Active'}, {'value': 'tracked_unfeeded', 'label': 'Tracked Unfeeded'}, {'value': 'dormant', 'label': 'Dormant'}]} onChange={(event) => handleFilter({ ...collectionQuery, status: event.currentTarget.value })} />
                                <Select id="list-list-toolbar-4-sort" label="Sort" value={collectionQuery.descending ? 'desc' : 'asc'} options={[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]} onChange={() => handleSort('name')} />
                              </Stack>
                      <section id="list-list-items-5" data-oods-collection="rows">{rows.length === 0 ? (<Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." />) : (<ol aria-label="Records" className="oods-collection">{rows.map(({ label, description, placeholder, status, stateHistory, allowedTransitions, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, personId, name, primaryTopic, role, org, xHandle, blurb, articleCount, windowDays, articles, topClusters, coTalkers }, collectionIndex) => <li key={String(personId)}><Button id={'list-list-items-5-row-' + collectionIndex} type="button" className="oods-collection-row" data-record-id={String(personId)} onClick={() => handleRowClick(String(personId))}><Text id={'list-list-items-5-title-' + collectionIndex} data-oods-component="Text">{name}</Text>
                      <StatusBadge id={'list-ve-items-14-' + collectionIndex} data-oods-component="StatusBadge" tone="lifecycle" status={status} /></Button></li>)}</ol>)}</section>
                      <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                                <PaginationBar id="list-slot-pagination-8" page={collectionQuery.page ?? 1} pageSize={collectionQuery.pageSize ?? 10} totalItems={collectionQuery.total ?? rows.length} onPageChange={handlePageChange} />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
