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
                                <DetailHeader id="detail-ve-header-24" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="2" />
                                <StatusTimeline id="detail-ve-header-25" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Stack id="detail-pg-status-timeline-29-read-field" data-oods-component="Stack">
                                                    <Text id="detail-pg-status-timeline-29-label" data-oods-component="Text" as="strong" content="Allowed transitions" />
                                                    <Text id="detail-pg-status-timeline-29-value" data-oods-component="Text">{{ formatReadOnlyValue(allowedTransitions, "string[]", false) }}</Text>
                                                  </Stack>
                                            </Stack>
                                          <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                              <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Asset type" />
                                              <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(assetType, "string", true) }}</Text>
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
                                          <Stack id="detail-detail-tabs-9-media_id-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-media_id-label" data-oods-component="Text" as="strong" content="Media id" />
                                              <Text id="detail-detail-tabs-9-media_id-value" data-oods-component="Text">{{ formatReadOnlyValue(mediaId, "uuid", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-mime_type-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-mime_type-label" data-oods-component="Text" as="strong" content="Mime type" />
                                              <Text id="detail-detail-tabs-9-mime_type-value" data-oods-component="Text">{{ formatReadOnlyValue(mimeType, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-storage_bucket-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-storage_bucket-label" data-oods-component="Text" as="strong" content="Storage bucket" />
                                              <Text id="detail-detail-tabs-9-storage_bucket-value" data-oods-component="Text">{{ formatReadOnlyValue(storageBucket, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-object_key-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-object_key-label" data-oods-component="Text" as="strong" content="Object key" />
                                              <Text id="detail-detail-tabs-9-object_key-value" data-oods-component="Text">{{ formatReadOnlyValue(objectKey, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-source_url-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-source_url-label" data-oods-component="Text" as="strong" content="Source url" />
                                              <Text id="detail-detail-tabs-9-source_url-value" data-oods-component="Text">{{ formatReadOnlyValue(sourceUrl, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-checksum-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-checksum-label" data-oods-component="Text" as="strong" content="Checksum" />
                                              <Text id="detail-detail-tabs-9-checksum-value" data-oods-component="Text">{{ formatReadOnlyValue(checksum, "string", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-file_size_bytes-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-file_size_bytes-label" data-oods-component="Text" as="strong" content="File size bytes" />
                                              <Text id="detail-detail-tabs-9-file_size_bytes-value" data-oods-component="Text">{{ formatReadOnlyValue(fileSizeBytes, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-width_px-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-width_px-label" data-oods-component="Text" as="strong" content="Width px" />
                                              <Text id="detail-detail-tabs-9-width_px-value" data-oods-component="Text">{{ formatReadOnlyValue(widthPx, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-height_px-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-height_px-label" data-oods-component="Text" as="strong" content="Height px" />
                                              <Text id="detail-detail-tabs-9-height_px-value" data-oods-component="Text">{{ formatReadOnlyValue(heightPx, "number", false) }}</Text>
                                            </Stack>
                                          <Stack id="detail-detail-tabs-9-duration_seconds-read-field" data-oods-component="Stack">
                                              <Text id="detail-detail-tabs-9-duration_seconds-label" data-oods-component="Text" as="strong" content="Duration seconds" />
                                              <Text id="detail-detail-tabs-9-duration_seconds-value" data-oods-component="Text">{{ formatReadOnlyValue(durationSeconds, "number", false) }}</Text>
                                            </Stack>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                                    <ClassificationPanel id="detail-slot-metadata-12" data-oods-component="ClassificationPanel">
                                                  <Stack id="detail-slot-metadata-12-primary_category_id-read-field" data-oods-component="Stack">
                                                                  <Text id="detail-slot-metadata-12-primary_category_id-label" data-oods-component="Text" as="strong" content="Primary category id" />
                                                                  <Text id="detail-slot-metadata-12-primary_category_id-value" data-oods-component="Text">{{ formatReadOnlyValue(primaryCategoryId, "string", false) }}</Text>
                                                                </Stack>
                                                  <Stack id="detail-slot-metadata-12-tags-read-field" data-oods-component="Stack">
                                                                  <Text id="detail-slot-metadata-12-tags-label" data-oods-component="Text" as="strong" content="Tags" />
                                                                  <Text id="detail-slot-metadata-12-tags-value" data-oods-component="Text">{{ formatReadOnlyValue(tags, "Tag[]", false) }}</Text>
                                                                </Stack>
                                                </ClassificationPanel>
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
import { Banner, Card, ClassificationPanel, DetailHeader, Stack, StatusTimeline, Tabs, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
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

const { actions, uiState, allowedTransitions, assetType, categories, checksum, classificationMetadata, createdAt, description, durationSeconds, fileSizeBytes, heightPx, label, lastEvent, lastEventAt, mediaId, mimeType, objectKey, placeholder, primaryCategoryId, primaryCategoryPath, sourceUrl, stateHistory, status, storageBucket, tagCount, tagPreview, tags, transcodingProfiles, updatedAt, widthPx } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
