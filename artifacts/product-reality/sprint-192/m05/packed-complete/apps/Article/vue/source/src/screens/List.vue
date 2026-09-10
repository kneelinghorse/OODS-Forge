<template>
  <Stack id="list-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="list-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="list-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="list-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success' || uiState === 'empty'">
        <Stack id="list-screen-list-9" data-oods-component="Stack" :data-oods-state="uiState === 'success' ? 'success' : undefined" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="list-list-toolbar-4" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <SearchInput id="list-slot-search-1" label="Search" placeholder="Search records" :value="collectionQuery.search ?? ''" :clearable="true" @value-change="handleFilter({ ...collectionQuery, search: $event })" />
                      <Select id="list-slot-filters-2" label="Status" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'draft', 'label': 'draft'}, {'value': 'in_review', 'label': 'in review'}, {'value': 'scheduled', 'label': 'scheduled'}, {'value': 'published', 'label': 'published'}, {'value': 'archived', 'label': 'archived'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('article_id')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ label, description, placeholder, status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, articleId, slug, authorId, contentType, excerpt, bodyMarkdown, heroMediaId, readingTimeMinutes, locale, publishedAt }, collectionIndex) in rows" :key="String(articleId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(articleId)" @click="handleRowClick(String(articleId))"><Text :id="'list-list-items-5-title-' + collectionIndex" data-oods-component="Text">{{ articleId }}</Text>
              <LabelCell :id="'list-ve-items-10-' + collectionIndex" data-oods-component="LabelCell" truncate :description="description" :label="label" />
              <StatusBadge :id="'list-ve-items-11-' + collectionIndex" data-oods-component="StatusBadge" tone="lifecycle" :status="status" />
              <RelativeTimestamp :id="'list-ve-items-12-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" />
              <ClassificationBadge :id="'list-slot-toolbar-actions-3-' + collectionIndex" data-oods-component="ClassificationBadge" mode="{classification_mode}" :category="primaryCategoryId" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, ClassificationBadge, LabelCell, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ label: string; description?: string; placeholder?: string; status: string; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt?: string; lastEvent: string; lastEventAt?: string; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; articleId: string; slug: string; authorId: string; contentType: 'knowledge_base' | 'announcement' | 'release_notes' | 'how_to'; excerpt?: string; bodyMarkdown: string; heroMediaId?: string; readingTimeMinutes?: number; locale?: string; publishedAt?: string }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Primary identifier for the article document. */
  articleId: string;
  /** Reference to the authoring user. */
  authorId: string;
  /** Markdown content rendered in CMS detail views. */
  bodyMarkdown: string;
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Editorial template driving layout and governance workflows. */
  contentType: 'knowledge_base' | 'announcement' | 'release_notes' | 'how_to';
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Summary text used in list + SEO contexts. */
  excerpt?: string;
  /** Optional Media object identifier referenced in hero slots. */
  heroMediaId?: string;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Locale tag determining headline, copy, and SEO metadata. */
  locale?: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Timestamp when the article was published live. */
  publishedAt?: string;
  /** Estimated reading time derived from body length. */
  readingTimeMinutes?: number;
  /** Canonical slug rendered in URLs and breadcrumb links. */
  slug: string;
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
  status: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, allowedTransitions, articleId, authorId, bodyMarkdown, categories, classificationMetadata, contentType, createdAt, description, excerpt, heroMediaId, label, lastEvent, lastEventAt, locale, placeholder, primaryCategoryId, primaryCategoryPath, publishedAt, readingTimeMinutes, slug, stateHistory, status, tagCount, tagPreview, tags, updatedAt, rows = [], collectionQuery = {} } = defineProps<Props>();

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
