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
                                <DetailHeader id="detail-ve-header-22" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="2" />
                                <VizGraphPreview id="detail-ve-header-23" data-oods-component="VizGraphPreview" :svg="svg ?? defaultChartSvg" description="Synthetic neighborhood edges illustrating relationships that share an endpoint; these are examples, not live graph data." :height="400" title="Example connected relationships" :width="720" />
                                <StatusTimeline id="detail-ve-header-24" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <OwnershipSummary id="detail-ve-header-25" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                                <TagSummary id="detail-ve-header-26" data-oods-component="TagSummary" label="Tags" :tagCount="tagCount" :tags="tags" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
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
                                          <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Created at" />
                                          <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(createdAt, "datetime", false) }}</Text>
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
                                      <Stack id="detail-detail-tabs-9-relationship_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-relationship_id-label" data-oods-component="Text" as="strong" content="Relationship id" />
                                          <Text id="detail-detail-tabs-9-relationship_id-value" data-oods-component="Text">{{ formatReadOnlyValue(relationshipId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-source_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-source_id-label" data-oods-component="Text" as="strong" content="Source id" />
                                          <Text id="detail-detail-tabs-9-source_id-value" data-oods-component="Text">{{ formatReadOnlyValue(sourceId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-target_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-target_id-label" data-oods-component="Text" as="strong" content="Target id" />
                                          <Text id="detail-detail-tabs-9-target_id-value" data-oods-component="Text">{{ formatReadOnlyValue(targetId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-relationship_type-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-relationship_type-label" data-oods-component="Text" as="strong" content="Relationship type" />
                                          <Text id="detail-detail-tabs-9-relationship_type-value" data-oods-component="Text">{{ formatReadOnlyValue(relationshipType, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-direction-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-direction-label" data-oods-component="Text" as="strong" content="Direction" />
                                          <Text id="detail-detail-tabs-9-direction-value" data-oods-component="Text">{{ formatReadOnlyValue(direction, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-strength-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-strength-label" data-oods-component="Text" as="strong" content="Strength" />
                                          <Text id="detail-detail-tabs-9-strength-value" data-oods-component="Text">{{ formatReadOnlyValue(strength, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-origin_source-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-origin_source-label" data-oods-component="Text" as="strong" content="Origin source" />
                                          <Text id="detail-detail-tabs-9-origin_source-value" data-oods-component="Text">{{ formatReadOnlyValue(originSource, "string", true) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-is_bidirectional-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-is_bidirectional-label" data-oods-component="Text" as="strong" content="Is bidirectional" />
                                          <Text id="detail-detail-tabs-9-is_bidirectional-value" data-oods-component="Text">{{ formatReadOnlyValue(isBidirectional, "boolean", false) }}</Text>
                                        </Stack>
                                    </Stack>
                                  </template>
                                </template>
                              </Tabs>
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
import { Banner, Card, DetailHeader, OwnershipSummary, Stack, StatusTimeline, Tabs, TagSummary, Text, VizGraphPreview } from '@oods/components-vue';
import '@oods/component-styles/css';
const defaultChartSvg = "<svg width=\"720\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" baseProfile=\"full\" viewBox=\"0 0 720 400\">\n<rect width=\"720\" height=\"400\" x=\"0\" y=\"0\" fill=\"#F9FAFC\"></rect>\n<path d=\"M401.6 141.4Q430.6 203.2 389.7 257.8\" fill=\"none\" pointer-events=\"visible\" stroke=\"rgb(88, 9, 24)\" stroke-opacity=\"0.5\" ecmeta_series_index=\"0\" ecmeta_data_index=\"0\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-0\"></path>\n<path d=\"M389.7 257.8Q322.1 259.6 288.6 200.8\" fill=\"none\" pointer-events=\"visible\" stroke=\"rgb(88, 9, 24)\" stroke-opacity=\"0.5\" ecmeta_series_index=\"0\" ecmeta_data_index=\"1\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-0\"></path>\n<path d=\"M288.6 200.8Q356.3 199 389.7 257.8\" fill=\"none\" pointer-events=\"visible\" stroke=\"rgb(88, 9, 24)\" stroke-opacity=\"0.5\" ecmeta_series_index=\"0\" ecmeta_data_index=\"2\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-0\"></path>\n<path d=\"M1 0A1 1 0 1 1 1 -0.1A1 1 0 0 1 1 0\" transform=\"matrix(5,0,0,5,288.5975,200.7815)\" fill=\"rgb(88, 9, 24)\" ecmeta_series_index=\"0\" ecmeta_data_index=\"0\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-1\"></path>\n<path d=\"M1 0A1 1 0 1 1 1 -0.1A1 1 0 0 1 1 0\" transform=\"matrix(5,0,0,5,389.7297,257.8033)\" fill=\"rgb(88, 9, 24)\" ecmeta_series_index=\"0\" ecmeta_data_index=\"1\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-1\"></path>\n<path d=\"M1 0A1 1 0 1 1 1 -0.1A1 1 0 0 1 1 0\" transform=\"matrix(5,0,0,5,401.6459,141.4062)\" fill=\"rgb(88, 9, 24)\" ecmeta_series_index=\"0\" ecmeta_data_index=\"2\" ecmeta_ssr_type=\"chart\" class=\"oods-zr-1\"></path>\n<text dominant-baseline=\"central\" text-anchor=\"start\" style=\"font-size:12px;font-family:sans-serif;\" transform=\"translate(298.5975 200.7815)\" fill=\"#1A1D23\">example-document</text>\n<text dominant-baseline=\"central\" text-anchor=\"start\" style=\"font-size:12px;font-family:sans-serif;\" transform=\"translate(399.7297 257.8033)\" fill=\"#1A1D23\">example-project</text>\n<text dominant-baseline=\"central\" text-anchor=\"start\" style=\"font-size:12px;font-family:sans-serif;\" transform=\"translate(411.6459 141.4062)\" fill=\"#1A1D23\">example-team</text>\n<path d=\"M-108.1 -5l216.2 0l0 24l-216.2 0Z\" transform=\"translate(360 13)\" fill=\"rgb(0,0,0)\" fill-opacity=\"0\" stroke=\"#3c3c41\" stroke-width=\"0\" class=\"oods-zr-2\"></path>\n<text dominant-baseline=\"central\" text-anchor=\"middle\" style=\"font-size:14px;font-family:sans-serif;font-weight:600;\" xml:space=\"preserve\" y=\"7\" transform=\"translate(360 13)\" fill=\"#1A1D23\">Example connected relationships</text>\n<style ><![CDATA[\n.oods-zr-0:hover {\ncursor:pointer;\nstroke-width:4;\n}\n.oods-zr-1:hover {\ncursor:pointer;\nfill:rgba(96,9,26,1);\n}\n.oods-zr-2:hover {\npointer-events:none;\n}\n\n]]>\n\n</style>\n</svg>";

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

interface Props {
  svg?: string;
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Materialized list of valid next states from the current status, computed from the
transitionRules parameter. When transitionRules is null (open model), this contains
all states except the current one. Used by StatusSelector to disable invalid options
and by StatusBadge to indicate available paths.
 */
  allowedTransitions?: string[];
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Supporting description used in detail and card contexts. */
  description?: string;
  /** Directionality applied when traversing the relationship. */
  direction: 'unidirectional' | 'bidirectional';
  /** Flag indicating whether the relationship is symmetric. */
  isBidirectional: boolean;
  /** Human-readable display name rendered in primary surfaces. */
  label: string;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'created' | 'activated' | 'paused' | 'terminated' | 'reactivated';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Edge records sharing an endpoint with this relationship, each containing source_id and target_id strings and an is_bidirectional boolean. Generated sample rows are explicitly synthetic. */
  neighborhood?: unknown[];
  /** System that originated or inferred the relationship. */
  originSource?: 'manual' | 'ingestion' | 'analytics' | 'integration';
  /** Identifier of the owning principal scoped by owner_type. */
  ownerId: string;
  /** Categorical owner type sourced from the ownerTypes parameter. */
  ownerType: 'organization' | 'team' | 'platform';
  /** Optional role name describing how the owner governs the entity. */
  ownershipRole?: string;
  /** Timestamp recording when ownership was last transferred. */
  ownershipTransferredAt?: string;
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Primary identifier for the relationship edge. */
  relationshipId: string;
  /** Semantic type describing the edge between the source and target. */
  relationshipType: 'membership' | 'ownership' | 'follows' | 'depends_on' | 'references';
  /** Identifier of the source node in the relationship. */
  sourceId: string;
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
  status: 'proposed' | 'active' | 'paused' | 'completed' | 'terminated';
  /** Signal representing how strongly the entities are connected. */
  strength?: 'low' | 'medium' | 'high';
  /** Computed number of tags assigned to the entity. */
  tagCount: number;
  /** Per-tag governance metadata. Each entry corresponds to a tag in the tags array and
tracks provenance and usage for taxonomy health monitoring.

Entry structure:
  - tag: string (the tag value, matches entry in tags array)
  - created_at: ISO 8601 datetime
  - created_by: string (user ID or "system" for allow-list tags)
  - usage_count: number (how many entities use this tag, computed)
  - moderation_status: "approved" | "pending" | "rejected" (when allowTagModeration is true)
  - canonical_form: string (resolved synonym target, when synonymResolution is enabled)
 */
  tagMetadata?: Record<string, unknown>[];
  /** Ordered list of tags assigned to the entity. */
  tags?: string[];
  /** Identifier of the target node in the relationship. */
  targetId: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
}

const { actions, uiState, allowedTransitions, createdAt, description, direction, isBidirectional, label, lastEvent, lastEventAt, neighborhood, originSource, ownerId, ownerType, ownershipRole, ownershipTransferredAt, placeholder, relationshipId, relationshipType, sourceId, stateHistory, status, strength, tagCount, tagMetadata, tags, targetId, updatedAt, svg } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
