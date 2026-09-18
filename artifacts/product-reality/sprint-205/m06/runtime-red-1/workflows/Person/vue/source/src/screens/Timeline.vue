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
                      <TimelineEntryLabel id="timeline-ve-entry-0-15" data-oods-component="TimelineEntryLabel" compact :label="name" />
                    </Stack>
              <section id="timeline-timeline-entries-13" data-oods-collection="events"><template v-if="events.length === 0"><Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" data-oods-state="empty" content="No events yet." /></template><ol v-else aria-label="Lifecycle history" class="oods-collection"><li v-for="(collectionEvent, collectionIndex) in chronologicalEvents(events)" :key="collectionEvent.id"><Card :id="'timeline-timeline-entries-13-entry-' + collectionIndex"><strong>{{ collectionEvent.title }}</strong><time :datetime="collectionEvent.at">{{ formatDateTime(collectionEvent.at) }}</time><p>{{ collectionEvent.description }}</p></Card></li></ol></section>
              <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                      <StateTransitionEvent id="timeline-ve-entry-0-16" data-oods-component="StateTransitionEvent" showActor showReason :history="stateHistory" :status="status" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';
import { Banner, Card, Stack, StateTransitionEvent, TimelineEntryLabel } from '@oods/components-vue';
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

const { uiState, activeFilters, allowedTransitions, articleCount, articles, blurb, categories, classificationMetadata, coTalkers, description, filterCount, filters, label, name, org, page, pageSize, personId, placeholder, primaryCategoryId, primaryCategoryPath, primaryTopic, role, searchActive, searchQuery, stateHistory, status, tagCount, tagPreview, tags, topClusters, totalItems, totalPages, windowDays, xHandle, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
