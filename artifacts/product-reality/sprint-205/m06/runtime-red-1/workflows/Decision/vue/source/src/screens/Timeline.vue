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
                      <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{{ decisionId }}</Text>
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

const { uiState, activeFilters, categories, classificationMetadata, createdAt, decisionId, decisionText, evidence, filterCount, filters, lastEvent, lastEventAt, missionId, page, pageSize, primaryCategoryId, primaryCategoryPath, projectDomain, projectId, searchActive, searchQuery, sessionId, sprintId, supersededAt, supersededBy, supersedes, supersessionReason, supersessionStatus, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
