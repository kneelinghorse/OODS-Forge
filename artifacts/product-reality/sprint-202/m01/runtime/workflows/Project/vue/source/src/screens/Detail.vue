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
                                <OwnershipSummary id="detail-ve-header-28" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                                <TagSummary id="detail-ve-header-29" data-oods-component="TagSummary" label="Tags" :tagCount="tagCount" :tags="tags" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
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
                                          <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Chunk count" />
                                          <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{{ formatReadOnlyValue(chunkCount, "number", false) }}</Text>
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
                                      <Stack id="detail-detail-tabs-9-mission_protocol_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-mission_protocol_id-label" data-oods-component="Text" as="strong" content="Mission protocol id" />
                                          <Text id="detail-detail-tabs-9-mission_protocol_id-value" data-oods-component="Text">{{ formatReadOnlyValue(missionProtocolId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-research_type-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-research_type-label" data-oods-component="Text" as="strong" content="Research type" />
                                          <Text id="detail-detail-tabs-9-research_type-value" data-oods-component="Text">{{ formatReadOnlyValue(researchType, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-methodology-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-methodology-label" data-oods-component="Text" as="strong" content="Methodology" />
                                          <Text id="detail-detail-tabs-9-methodology-value" data-oods-component="Text">{{ formatReadOnlyValue(methodology, "string", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-quality_score-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-quality_score-label" data-oods-component="Text" as="strong" content="Quality score" />
                                          <Text id="detail-detail-tabs-9-quality_score-value" data-oods-component="Text">{{ formatReadOnlyValue(qualityScore, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_quality_check-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_quality_check-label" data-oods-component="Text" as="strong" content="Last quality check" />
                                          <Text id="detail-detail-tabs-9-last_quality_check-value" data-oods-component="Text">{{ formatReadOnlyValue(lastQualityCheck, "datetime", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-id-label" data-oods-component="Text" as="strong" content="Id" />
                                          <Text id="detail-detail-tabs-9-id-value" data-oods-component="Text">{{ formatReadOnlyValue(id, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-user_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-user_id-label" data-oods-component="Text" as="strong" content="User id" />
                                          <Text id="detail-detail-tabs-9-user_id-value" data-oods-component="Text">{{ formatReadOnlyValue(userId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-workspace_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-workspace_id-label" data-oods-component="Text" as="strong" content="Workspace id" />
                                          <Text id="detail-detail-tabs-9-workspace_id-value" data-oods-component="Text">{{ formatReadOnlyValue(workspaceId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-project_id-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-project_id-label" data-oods-component="Text" as="strong" content="Project id" />
                                          <Text id="detail-detail-tabs-9-project_id-value" data-oods-component="Text">{{ formatReadOnlyValue(projectId, "uuid", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-document_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-document_count-label" data-oods-component="Text" as="strong" content="Document count" />
                                          <Text id="detail-detail-tabs-9-document_count-value" data-oods-component="Text">{{ formatReadOnlyValue(documentCount, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-report_count-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-report_count-label" data-oods-component="Text" as="strong" content="Report count" />
                                          <Text id="detail-detail-tabs-9-report_count-value" data-oods-component="Text">{{ formatReadOnlyValue(reportCount, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-total_tokens-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-total_tokens-label" data-oods-component="Text" as="strong" content="Total tokens" />
                                          <Text id="detail-detail-tabs-9-total_tokens-value" data-oods-component="Text">{{ formatReadOnlyValue(totalTokens, "number", false) }}</Text>
                                        </Stack>
                                      <Stack id="detail-detail-tabs-9-last_updated-read-field" data-oods-component="Stack">
                                          <Text id="detail-detail-tabs-9-last_updated-label" data-oods-component="Text" as="strong" content="Last updated" />
                                          <Text id="detail-detail-tabs-9-last_updated-value" data-oods-component="Text">{{ formatReadOnlyValue(lastUpdated, "datetime", false) }}</Text>
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
import { Banner, Card, DetailHeader, OwnershipSummary, Stack, StatusTimeline, Tabs, TagSummary, Text } from '@oods/components-vue';
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
  /** Chunk count. */
  chunkCount: number;
  /** Created at. */
  createdAt: string;
  /** Display projection of description; never truncates persisted content. */
  description?: string;
  /** Document count. */
  documentCount: number;
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
  /** Last quality check. */
  lastQualityCheck?: string;
  /** Last updated. */
  lastUpdated?: string;
  /** Methodology. */
  methodology?: string;
  /** Mission protocol id. */
  missionProtocolId?: string;
  /** Name. */
  name: string;
  /** Authoritative nullable server owner_id. Present in this response. */
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
  /** Hint copy surfaced in form fields when the label is empty. */
  placeholder?: string;
  /** Project id. */
  projectId: string;
  /** Quality score. */
  qualityScore?: number;
  /** Report count. */
  reportCount: number;
  /** Research type. */
  researchType?: string;
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
  /** Canonical research lifecycle. The API remains authoritative; do not coerce an unknown server value. */
  status: 'active' | 'archived' | 'completed';
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
  /** Total tokens. */
  totalTokens: number;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
  /** Updated at. */
  updatedAt: string;
  /** User id. */
  userId?: string;
  /** Workspace id. */
  workspaceId?: string;
}

const { actions, uiState, activeFilters, allowedTransitions, chunkCount, createdAt, description, documentCount, filterCount, filters, id, label, lastEvent, lastEventAt, lastQualityCheck, lastUpdated, methodology, missionProtocolId, name, ownerId, ownerType, ownershipRole, ownershipTransferredAt, page, pageSize, placeholder, projectId, qualityScore, reportCount, researchType, searchActive, searchQuery, stateHistory, status, tagCount, tagMetadata, tags, totalItems, totalPages, totalTokens, updatedAt, userId, workspaceId } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
