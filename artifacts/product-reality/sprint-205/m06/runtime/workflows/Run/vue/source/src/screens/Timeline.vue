<template>
  <Stack id="timeline-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="timeline-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="timeline-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="timeline-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="timeline-screen-timeline-14" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="timeline-timeline-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{{ targetName }}</Text>
                    </Stack>
              <section id="timeline-timeline-entries-13" data-oods-collection="events"><template v-if="events.length === 0"><Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." /></template><ol v-else aria-label="Lifecycle history" class="oods-collection"><li v-for="(collectionEvent, collectionIndex) in chronologicalEvents(events)" :key="collectionEvent.id"><Card :id="'timeline-timeline-entries-13-entry-' + collectionIndex"><strong>{{ collectionEvent.title }}</strong><time :datetime="collectionEvent.at">{{ formatDateTime(collectionEvent.at) }}</time><p>{{ collectionEvent.description }}</p></Card></li></ol></section>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';
import { Banner, Card, Stack, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface Props {
  events?: CollectionEvent[];
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

const { uiState, activeFilters, artifactCount, authType, criticalCount, evidenceRetained, filterCount, filters, findingCount, minorCount, mode, moderateCount, page, pageCount, pageSize, passCount, passesFailed, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, runId, searchActive, searchQuery, seriousCount, targetName, targetUrl, totalItems, totalPages, unknownCount, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
