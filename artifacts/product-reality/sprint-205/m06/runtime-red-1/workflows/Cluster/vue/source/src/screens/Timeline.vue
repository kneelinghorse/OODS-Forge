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
                      <TimelineEntryLabel id="timeline-slot-entry-0-4" data-oods-component="TimelineEntryLabel" compact :label="label" />
                    </Stack>
              <section id="timeline-timeline-entries-13" data-oods-collection="events"><template v-if="events.length === 0"><Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." /></template><ol v-else aria-label="Lifecycle history" class="oods-collection"><li v-for="(collectionEvent, collectionIndex) in chronologicalEvents(events)" :key="collectionEvent.id"><Card :id="'timeline-timeline-entries-13-entry-' + collectionIndex"><strong>{{ collectionEvent.title }}</strong><time :datetime="collectionEvent.at">{{ formatDateTime(collectionEvent.at) }}</time><p>{{ collectionEvent.description }}</p></Card></li></ol></section>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';
import { Banner, Card, Stack, TimelineEntryLabel } from '@oods/components-vue';
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

const { uiState, activeFilters, categories, classificationMetadata, clusterId, createdAt, description, dominantCategory, filterCount, filters, isTrending, label, lastEvent, lastEventAt, leadTitle, leadUrl, lens, maxSimilarity, meanSimilarity, memberCount, memberPeopleCount, members, page, pageSize, people, placeholder, primaryCategoryId, primaryCategoryPath, searchActive, searchQuery, tagCount, tagPreview, tags, totalItems, totalPages, updatedAt, windowDays, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
