<template>
  <Stack id="detail-screen" data-oods-component="Stack">
      <template v-if="uiState === 'loading'">
        <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
      </template>
      <template v-if="uiState === 'empty'">
        <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
      </template>
      <template v-if="uiState === 'error'">
        <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
      </template>
      <template v-if="uiState === 'success'">
        <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style="align-items: space-between; display: flex; flex-direction: column; gap: var(--ref-space-stack-default); padding: var(--ref-space-inset-default)">
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" :title="name" :subtitle="description" :level="2" />
                                <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <OwnershipSummary id="detail-ve-header-29" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Stack id="detail-pg-status-timeline-32-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-32-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                    <Text id="detail-pg-status-timeline-32-value" data-oods-component="Text">{{ formatReadOnlyValue(allowedTransitions, "string[]", false) }}</Text>
                                                  </Stack>
                                            </Stack>
                                          <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Filter Count" />
                                              <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(filterCount, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                              <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-updated_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-updated_at-label" data-oods-component="Text" as="strong" content="Updated at" />
                                              <Text id="detail-detail-tabs-9-updated_at-value" data-oods-component="Text">{{ formatReadOnlyValue(updatedAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                              <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEvent, "string", true) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                              <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{{ formatReadOnlyValue(lastEventAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                              <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{{ formatReadOnlyValue(projectId, "uuid", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-file_path-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-file_path-label" data-oods-component="Text" as="strong" content="File path" />
                                              <Text id="detail-detail-tabs-9-file_path-value" data-oods-component="Text">{{ formatReadOnlyValue(filePath, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-file_type-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-file_type-label" data-oods-component="Text" as="strong" content="File type" />
                                              <Text id="detail-detail-tabs-9-file_type-value" data-oods-component="Text">{{ formatReadOnlyValue(fileType, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-content-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-content-label" data-oods-component="Text" as="strong" content="Content" />
                                              <Text id="detail-detail-tabs-9-content-value" data-oods-component="Text">{{ formatReadOnlyValue(content, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-raw_content-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-raw_content-label" data-oods-component="Text" as="strong" content="Raw content" />
                                              <Text id="detail-detail-tabs-9-raw_content-value" data-oods-component="Text">{{ formatReadOnlyValue(rawContent, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-uploaded_at-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-uploaded_at-label" data-oods-component="Text" as="strong" content="Uploaded at" />
                                              <Text id="detail-detail-tabs-9-uploaded_at-value" data-oods-component="Text">{{ formatReadOnlyValue(uploadedAt, "datetime", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-file_size-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-file_size-label" data-oods-component="Text" as="strong" content="File size" />
                                              <Text id="detail-detail-tabs-9-file_size-value" data-oods-component="Text">{{ formatReadOnlyValue(fileSize, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-mime_type-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-mime_type-label" data-oods-component="Text" as="strong" content="Mime type" />
                                              <Text id="detail-detail-tabs-9-mime_type-value" data-oods-component="Text">{{ formatReadOnlyValue(mimeType, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-source_type-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-source_type-label" data-oods-component="Text" as="strong" content="Source type" />
                                              <Text id="detail-detail-tabs-9-source_type-value" data-oods-component="Text">{{ formatReadOnlyValue(sourceType, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-participant_count-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-participant_count-label" data-oods-component="Text" as="strong" content="Participant count" />
                                              <Text id="detail-detail-tabs-9-participant_count-value" data-oods-component="Text">{{ formatReadOnlyValue(participantCount, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-collection_date-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-collection_date-label" data-oods-component="Text" as="strong" content="Collection date" />
                                              <Text id="detail-detail-tabs-9-collection_date-value" data-oods-component="Text">{{ formatReadOnlyValue(collectionDate, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-processed-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-processed-label" data-oods-component="Text" as="strong" content="Processed" />
                                              <Text id="detail-detail-tabs-9-processed-value" data-oods-component="Text">{{ formatReadOnlyValue(processed, "boolean", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-chunked-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-chunked-label" data-oods-component="Text" as="strong" content="Chunked" />
                                              <Text id="detail-detail-tabs-9-chunked-value" data-oods-component="Text">{{ formatReadOnlyValue(chunked, "boolean", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-embedded-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-embedded-label" data-oods-component="Text" as="strong" content="Embedded" />
                                              <Text id="detail-detail-tabs-9-embedded-value" data-oods-component="Text">{{ formatReadOnlyValue(embedded, "boolean", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-transcription_accuracy-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-transcription_accuracy-label" data-oods-component="Text" as="strong" content="Transcription accuracy" />
                                              <Text id="detail-detail-tabs-9-transcription_accuracy-value" data-oods-component="Text">{{ formatReadOnlyValue(transcriptionAccuracy, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-validation_status-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-validation_status-label" data-oods-component="Text" as="strong" content="Validation status" />
                                              <Text id="detail-detail-tabs-9-validation_status-value" data-oods-component="Text">{{ formatReadOnlyValue(validationStatus, "string", true) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-id-label" data-oods-component="Text" as="strong" content="Id" />
                                              <Text id="detail-detail-tabs-9-id-value" data-oods-component="Text">{{ formatReadOnlyValue(id, "uuid", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-total_tokens-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-total_tokens-label" data-oods-component="Text" as="strong" content="Total tokens" />
                                              <Text id="detail-detail-tabs-9-total_tokens-value" data-oods-component="Text">{{ formatReadOnlyValue(totalTokens, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-word_count-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-word_count-label" data-oods-component="Text" as="strong" content="Word count" />
                                              <Text id="detail-detail-tabs-9-word_count-value" data-oods-component="Text">{{ formatReadOnlyValue(wordCount, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-preview-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-preview-label" data-oods-component="Text" as="strong" content="Preview" />
                                              <Text id="detail-detail-tabs-9-preview-value" data-oods-component="Text">{{ formatReadOnlyValue(preview, "string", false) }}</Text>
                                            </Stack>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                                    <Stack id="detail-slot-metadata-12" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                                  <ClassificationPanel id="detail-ve-metadata-26" data-oods-component="ClassificationPanel">
                                                                  <Stack id="detail-ve-metadata-26-primary_category_id-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-26-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                                    <Text id="detail-ve-metadata-26-primary_category_id-value" data-oods-component="Text">{{ formatReadOnlyValue(primaryCategoryId, "string", false) }}</Text>
                                                                                  </Stack>
                                                                  <Stack id="detail-ve-metadata-26-tags-read-field" data-oods-component="Stack">
                                                                                    <Text id="detail-ve-metadata-26-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                                    <Text id="detail-ve-metadata-26-tags-value" data-oods-component="Text">{{ formatReadOnlyValue(tags, "DocumentTagRead[]", false) }}</Text>
                                                                                  </Stack>
                                                                </ClassificationPanel>
                                                </Stack>
                                  </Stack>
                      </aside>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { formatReadOnlyValue } from '@oods/component-contracts';
import { Banner, Card, ClassificationPanel, DetailHeader, OwnershipSummary, Stack, StatusTimeline, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
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
  /** Ordered taxonomy nodes scoped to the object. */
  categories?: unknown[];
  /** Chunk count. */
  chunkCount?: number;
  /** Chunked. */
  chunked?: boolean;
  /** Chunks. */
  chunks?: unknown[];
  /** Operational metadata describing mode, storage model, governance rules, and audit timestamps.
 */
  classificationMetadata: unknown;
  /** Collection date. */
  collectionDate?: string;
  /** Content. */
  content?: string;
  /** uploaded_at when present; unavailable otherwise. */
  createdAt?: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Embedded. */
  embedded?: boolean;
  /** File path. */
  filePath?: string;
  /** File size. */
  fileSize?: number;
  /** File type. */
  fileType?: string;
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
  /** Display projection of name; retain the complete source field. */
  label: string;
  /** Only from an explicit event or timestamp projection; absence is unknown, not a fabricated audit event. */
  lastEvent?: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Mime type. */
  mimeType?: string;
  /** Name. */
  name: string;
  /** Authoritative nullable server owner_id. Not exposed by the current response; unavailable until the API exposes it. Never derive from created_by, user_id, or project owner. */
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
  /** Participant count. */
  participantCount?: number;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Preview. */
  preview?: string;
  /** Identifier of the canonical taxonomy node. */
  primaryCategoryId?: string;
  /** Human-readable breadcrumb path (Electronics > Mobile > Android). */
  primaryCategoryPath?: string;
  /** Processed. */
  processed?: boolean;
  /** Processing events. */
  processingEvents?: unknown[];
  /** Project id. */
  projectId: string;
  /** Raw content. */
  rawContent?: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** Source type. */
  sourceType?: string;
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
  /** Canonical research lifecycle. Display projection only: explicit latest failure, then embedded, chunked, processed, pending; missing input remains unknown. */
  status: 'pending' | 'processed' | 'chunked' | 'embedded' | 'failed';
  /** Number of canonical tags assigned to the object. */
  tagCount?: number;
  /** Denormalized comma-delimited preview for list renders. */
  tagPreview?: string;
  /** Tags. */
  tags?: unknown[];
  /** Total tokens. */
  totalTokens?: number;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Transcription accuracy. */
  transcriptionAccuracy?: number;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Uploaded at. */
  uploadedAt?: string;
  /** Validation status. */
  validationStatus?: string;
  /** Word count. */
  wordCount?: number;
}

const { actions, uiState, activeFilters, allowedTransitions, categories, chunkCount, chunked, chunks, classificationMetadata, collectionDate, content, createdAt, description, embedded, filePath, fileSize, fileType, filterCount, filters, id, label, lastEvent, lastEventAt, mimeType, name, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, participantCount, placeholder, preview, primaryCategoryId, primaryCategoryPath, processed, processingEvents, projectId, rawContent, searchActive, searchQuery, sourceType, stateHistory, status, tagCount, tagPreview, tags, totalItems, totalPages, totalTokens, transcriptionAccuracy, updatedAt, uploadedAt, validationStatus, wordCount } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
