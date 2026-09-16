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
                      <Select id="list-slot-filters-2" label="Status" :value="collectionQuery.status ?? ''" :options="[{'value': '', 'label': 'All states'}, {'value': 'ingested', 'label': 'Ingested'}, {'value': 'processing', 'label': 'Processing'}, {'value': 'available', 'label': 'Available'}, {'value': 'deprecated', 'label': 'Deprecated'}]" @change="handleFilter({ ...collectionQuery, status: $event })" />
                      <Select id="list-list-toolbar-4-sort" label="Sort" :value="collectionQuery.descending ? 'desc' : 'asc'" :options="[{'value': 'asc', 'label': 'Name A–Z'}, {'value': 'desc', 'label': 'Name Z–A'}]" @change="handleSort('label')" />
                    </Stack>
              <section id="list-list-items-5" data-oods-collection="rows"><template v-if="rows.length === 0"><Banner id="list-list-items-5-empty" data-oods-component="Banner" data-oods-state="empty" content="No records found." /></template><ol v-else aria-label="Records" class="oods-collection"><li v-for="({ label, description, placeholder, status, stateHistory, allowedTransitions, createdAt, updatedAt, lastEvent, lastEventAt, classificationMetadata, categories, primaryCategoryId, primaryCategoryPath, tags, tagCount, tagPreview, mediaId, assetType, mimeType, storageBucket, objectKey, sourceUrl, checksum, fileSizeBytes, widthPx, heightPx, durationSeconds, transcodingProfiles }, collectionIndex) in rows" :key="String(mediaId)"><Button :id="'list-list-items-5-row-' + collectionIndex" type="button" class="oods-collection-row" :data-record-id="String(mediaId)" @click="handleRowClick(String(mediaId))"><LabelCell :id="'list-ve-items-10-' + collectionIndex" data-oods-component="LabelCell" truncate :description="description" :label="label" />
              <StatusBadge :id="'list-ve-items-11-' + collectionIndex" data-oods-component="StatusBadge" tone="lifecycle" :status="status" />
              <RelativeTimestamp :id="'list-ve-items-12-' + collectionIndex" data-oods-component="RelativeTimestamp" :datetime="updatedAt ?? createdAt" /></Button></li></ol></section>
              <Stack id="list-list-pagination-7" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: center; padding: var(--ref-space-inset-default)">
                      <PaginationBar id="list-slot-pagination-8" :page="collectionQuery.page ?? 1" :pageSize="collectionQuery.pageSize ?? 10" :totalItems="collectionQuery.total ?? rows.length" @page-change="handlePageChange" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { Banner, Button, LabelCell, PaginationBar, RelativeTimestamp, SearchInput, Select, Stack, StatusBadge } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'error' | 'success' | 'empty';

interface GeneratedUIActions {
  handleFilter: (criteria: Record<string, unknown>) => void;
  handlePageChange: (page: number) => void;
  handleRowClick: (rowId: string) => void;
  handleSort: (column: string) => void;
}

interface Props {
  rows?: Array<{ label: string; description?: string; placeholder?: string; status: 'ingested' | 'processing' | 'available' | 'deprecated'; stateHistory?: unknown[]; allowedTransitions?: string[]; createdAt: string; updatedAt?: string; lastEvent: 'ingested' | 'transcoded' | 'published' | 'archived'; lastEventAt?: string; classificationMetadata: unknown; categories?: unknown[]; primaryCategoryId?: string; primaryCategoryPath?: string; tags?: unknown[]; tagCount?: number; tagPreview?: string; mediaId: string; assetType: 'image' | 'video' | 'audio' | 'document'; mimeType: string; storageBucket: string; objectKey: string; sourceUrl?: string; checksum?: string; fileSizeBytes: number; widthPx?: number; heightPx?: number; durationSeconds?: number; transcodingProfiles?: string[] }>;
  collectionQuery?: { search?: string; status?: string; descending?: boolean; archived?: boolean; page?: number; pageSize?: number; total?: number };
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Media form factor guiding viewer presentation. */
  assetType: 'image' | 'video' | 'audio' | 'document';
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Hex-encoded checksum (SHA-256) for deduplication. */
  checksum?: string;
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Media playback duration for video/audio assets. */
  durationSeconds?: number;
  /** Size of the binary payload in bytes. */
  fileSizeBytes: number;
  /** Pixel height for images/videos when available. */
  heightPx?: number;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'ingested' | 'transcoded' | 'published' | 'archived';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Primary identifier for the media asset across services. */
  mediaId: string;
  /** IANA MIME type recorded at ingestion. */
  mimeType: string;
  /** Provider-specific path or key referencing the binary object. */
  objectKey: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Canonical CDN URL for public consumption. */
  sourceUrl?: string;
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
  status: 'ingested' | 'processing' | 'available' | 'deprecated';
  /** Storage namespace (S3 bucket, GCS bucket) backing the asset. */
  storageBucket: string;
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Canonical tag collection after synonym collapse. */
  tags?: unknown[];
  /** List of transcoding profiles generated for the asset. */
  transcodingProfiles?: string[];
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Pixel width for images/videos when available. */
  widthPx?: number;
}

const { actions, uiState, allowedTransitions, assetType, categories, checksum, classificationMetadata, createdAt, description, durationSeconds, fileSizeBytes, heightPx, label, lastEvent, lastEventAt, mediaId, mimeType, objectKey, placeholder, primaryCategoryId, primaryCategoryPath, sourceUrl, stateHistory, status, storageBucket, tagCount, tagPreview, tags, transcodingProfiles, updatedAt, widthPx, rows = [], collectionQuery = {} } = defineProps<Props>();

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
