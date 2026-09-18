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
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('target_name')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ searchQuery, searchActive, filters, activeFilters, filterCount, page, pageSize, totalItems, totalPages, provenanceSource, provenanceRecord, provenanceLocator, provenanceMethod, provenanceAt, runId, targetName, targetUrl, mode, authType, pageCount, findingCount, criticalCount, seriousCount, moderateCount, minorCount, unknownCount, passCount, passesFailed, artifactCount, evidenceRetained }, collectionIndex) in rows" :key="String(runId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(runId)" @click="handleRowClick(String(runId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ targetName }}</Text>
              <RelativeTimestamp :id="'list-ve-toolbar-actions-13-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="provenanceAt" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ searchQuery?: string; searchActive?: boolean; filters?: Record<string, unknown>[]; activeFilters?: Record<string, unknown>[]; filterCount: number; page: number; pageSize: number; totalItems?: number; totalPages?: number; provenanceSource: string; provenanceRecord: string; provenanceLocator?: string; provenanceMethod: string; provenanceAt: string; runId: string; targetName: string; targetUrl: string; mode: 'app' | 'suite'; authType: string; pageCount: number; findingCount: number; criticalCount: number; seriousCount: number; moderateCount: number; minorCount: number; unknownCount: number; passCount: number; passesFailed: number; artifactCount: number; evidenceRetained?: boolean }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** How many artifacts the run's index lists. */
  artifactCount: number;
  /** The authentication the manifest RECORDS. Shown as recorded, never inferred: Sprint 204 measured "none" on a capture that was authenticated, which is Stage1's to correct. */
  authType: string;
  /** Findings of critical impact. */
  criticalCount: number;
  /** Whether the run kept its evidence directory (evidence_retention.retained). */
  evidenceRetained?: boolean;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** How many rule failures the run found across its pages (a11y rollup.violation_count). */
  findingCount: number;
  /** Findings of minor impact. */
  minorCount: number;
  /** The capture mode. Every run a run view reads is app; suite runs aggregate targets and carry no a11y report of their own. */
  mode: 'app' | 'suite';
  /** Findings of moderate impact. */
  moderateCount: number;
  /** Current page number (1-based). */
  page: number;
  /** How many pages the accessibility pass read. */
  pageCount: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** How many capture passes ran. */
  passCount: number;
  /** How many of those passes did not finish ok. */
  passesFailed: number;
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
  /** The capture's own id, a uuid Stage1 assigns; the directory name under out/stage1/<suite>/. */
  runId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Findings of serious impact. */
  seriousCount: number;
  /** What was captured, as the run names it (targets[0].name). Every run read carries exactly one target, so the subject is two fields here rather than an object of its own. */
  targetName: string;
  /** Where the capture started (targets[0].url). */
  targetUrl: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Findings whose impact the engine did not state. Its own bucket: never folded into minor. */
  unknownCount: number;
}

const { actions, uiState, activeFilters, artifactCount, authType, criticalCount, evidenceRetained, filterCount, filters, findingCount, minorCount, mode, moderateCount, page, pageCount, pageSize, passCount, passesFailed, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, runId, searchActive, searchQuery, seriousCount, targetName, targetUrl, totalItems, totalPages, unknownCount, rows = [], collectionQuery = {} } = defineProps<Props>();

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
