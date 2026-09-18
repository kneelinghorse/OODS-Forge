<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-screen-list-9-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-screen-list-9-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9-success" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-oods-collection-toolbar="true" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Impact" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'critical', 'label': 'Critical'}, {'value': 'serious', 'label': 'Serious'}, {'value': 'moderate', 'label': 'Moderate'}, {'value': 'minor', 'label': 'Minor'}, {'value': 'unknown', 'label': 'Unknown'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('title')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, resultState, provenanceSource, provenanceRecord, provenanceLocator, provenanceMethod, provenanceAt, findingId, title, description, impact, ruleId, route, pageUrl, nodeCount, selectors, criteria, helpUrl }, collectionIndex) in rows" :key="String(findingId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(findingId)" @click="handleRowClick(String(findingId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ title }}</Text>
              <StatusBadge :id="'list-ve-toolbar-actions-13-' + collectionIndex" data-oods-component="StatusBadge" domain="result" emphasis="subtle" :showIcon="false" tone="neutral" :status="resultState" />
              <RelativeTimestamp :id="'list-ve-toolbar-actions-14-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="provenanceAt" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; resultState: 'violation' | 'passed' | 'needs_review' | 'not_applicable' | 'not_measured'; provenanceSource: string; provenanceRecord: string; provenanceLocator?: string; provenanceMethod: string; provenanceAt: string; findingId: string; title: string; description: string; impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown'; ruleId: string; route: string; pageUrl: string; nodeCount: number; selectors: string[]; criteria?: string[]; helpUrl?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** The rule's tags: WCAG criteria, best-practice and the standards it maps to. */
  criteria?: string[];
  /** What the rule checks, in the engine's words. */
  description: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** The page route and the rule, "<route>#<rule_id>": one rule failing on one page is one finding. */
  findingId: string;
  /** The engine's page for the rule. */
  helpUrl?: string;
  /** The engine's impact for the rule. Stage1 keeps an unknown bucket beside axe's four. */
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';
  /** How many elements on the page fail the rule. */
  nodeCount: number;
  /** Current page number (1-based). */
  page: number;
  /** The page's full URL. */
  pageUrl: string;
  /** Number of items displayed per page. */
  pageSize: number;
  /** When they were obtained. */
  provenanceAt: string;
  /** Where in that record the values were read. */
  provenanceLocator?: string;
  /** How the values were obtained. */
  provenanceMethod: string;
  /** Which record there. */
  provenanceRecord: string;
  /** The system that produced the record. */
  provenanceSource: string;
  /** What the engine concluded: violation on every finding of this run, because Stage1 writes needs-review, passed and not-applicable only as page counts. */
  resultState: 'violation' | 'passed' | 'needs_review' | 'not_applicable' | 'not_measured';
  /** The page the finding is on, as a route. */
  route: string;
  /** The engine's rule id. */
  ruleId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The failing elements, as the engine's selectors. */
  selectors: string[];
  /** The rule's one-line statement of what must hold (axe `help`), which names the finding. */
  title: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
}

const { actions, uiState, activeFilters, criteria, description, filterCount, filters, findingId, helpUrl, impact, nodeCount, page, pageSize, pageUrl, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, resultState, route, ruleId, searchActive, searchQuery, selectors, title, totalItems, totalPages, rows = [], collectionQuery = {} } = defineProps<Props>();

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
