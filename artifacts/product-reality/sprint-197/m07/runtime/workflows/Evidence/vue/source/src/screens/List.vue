<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="list-screen-list-9-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9-success" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Owner type" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'user', 'label': 'user'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('id')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ label, description, placeholder, createdAt, updatedAt, lastEvent, lastEventAt, ownerId, ownerType, ownershipRole, ownershipTransferredAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, id, projectId, missionId, sessionKey, origin, claim, summary, sourceUrl, sourceId, sourceSightingCount, snippet, query, disposition, workspaceId }, collectionIndex) in rows" :key="String(id)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(id)" @click="handleRowClick(String(id))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ id }}</Text>
              <LabelCell :id="'list-ve-items-10-' + collectionIndex" data-oods-component="LabelCell" truncate :description="description" :label="label" />
              <RelativeTimestamp :id="'list-ve-items-14-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" />
              <OwnerBadge :id="'list-ve-items-15-' + collectionIndex" data-oods-component="OwnerBadge" :owner="ownerId" :ownerType="ownerType" />
              <ClassificationBadge :id="'list-ve-toolbar-actions-16-' + collectionIndex" data-oods-component="ClassificationBadge" mode="{classification_mode}" :category="primaryCategoryId" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, ClassificationBadge, LabelCell, OwnerBadge, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ label: string; description?: string; placeholder?: string; createdAt: string; updatedAt: string; lastEvent?: string; lastEventAt?: string; ownerId?: string; ownerType?: 'user'; ownershipRole?: string; ownershipTransferredAt?: string; classificationMetadata: unknown; categories: unknown[]; primaryCategoryId: 'supporting' | 'contradicting' | 'rejected' | 'background'; primaryCategoryPath?: string; tags: string[]; tagCount?: number; tagPreview?: string; searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; id: string; projectId: string; missionId?: string; sessionKey: string; origin: 'mcp-agent' | 'deepsearch-worker'; claim: string; summary?: string; sourceUrl: string; sourceId: string; sourceSightingCount: number; snippet?: string; query?: string; disposition: 'supporting' | 'contradicting' | 'rejected' | 'background'; workspaceId?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** One fixed category with id and label derived from disposition; no inferred taxonomy. */
  categories: unknown[];
  /** Claim. */
  claim: string;
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Created at. */
  createdAt: string;
  /** Display projection of summary; never truncates persisted content. */
  description?: string;
  /** Disposition. */
  disposition: 'supporting' | 'contradicting' | 'rejected' | 'background';
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
  /** Display projection of claim; retain the complete source field. */
  label: string;
  /** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
  lastEvent?: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Mission id. */
  missionId?: string;
  /** Origin. */
  origin: 'mcp-agent' | 'deepsearch-worker';
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
  /** Exact disposition; classification dimension, never a lifecycle state. */
  primaryCategoryId: 'supporting' | 'contradicting' | 'rejected' | 'background';
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Project id. */
  projectId: string;
  /** Query. */
  query?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Session key. */
  sessionKey: string;
  /** Snippet. */
  snippet?: string;
  /** Source id. */
  sourceId: string;
  /** Source sighting count. */
  sourceSightingCount: number;
  /** Source url. */
  sourceUrl: string;
  /** Summary. */
  summary?: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Tags. */
  tags: string[];
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Updated at. */
  updatedAt: string;
  /** Workspace id. */
  workspaceId?: string;
}

const { actions, uiState, activeFilters, categories, claim, classificationMetadata, createdAt, description, disposition, filterCount, filters, id, label, lastEvent, lastEventAt, missionId, origin, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, primaryCategoryId, primaryCategoryPath, projectId, query, searchActive, searchQuery, sessionKey, snippet, sourceId, sourceSightingCount, sourceUrl, summary, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, workspaceId, rows = [], collectionQuery = {} } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handlePageChange') || typeof actions.handlePageChange !== 'function') { throw new Error('GeneratedUI requires actions.handlePageChange.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

/* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
/* @oods-domain-binding handlePageChange */ const handlePageChange = (page: number) => { actions.handlePageChange(page); };
/* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
/* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
