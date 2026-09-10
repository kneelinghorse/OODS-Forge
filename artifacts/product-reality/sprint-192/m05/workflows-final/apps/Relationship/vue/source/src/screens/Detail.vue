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
              <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
                      <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                <DetailHeader id="detail-ve-header-22" data-oods-component="DetailHeader" :title="label" :subtitle="description" :level="1" />
                                <StatusTimeline id="detail-ve-header-23" data-oods-component="StatusTimeline" showActorId showReason :history="stateHistory" :allowedTransitions="allowedTransitions" :status="status" />
                                <OwnershipSummary id="detail-ve-header-24" data-oods-component="OwnershipSummary" :ownerId="ownerId" :ownerType="ownerType" :role="ownershipRole" />
                                <TagManager id="detail-ve-header-25" data-oods-component="TagManager" :tags="tags" />
                              </Stack>
                    </Stack>
              <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
                      <div data-sidebar-main>
                        <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" :items="[{'id':'detail-detail-tab-panel-3','label':'Details','panel':''}]">
                                    <template #panel="{ item }">
                                      <template v-if="item.id === 'detail-detail-tab-panel-3'">
                                        <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                                          <StatusTimeline id="detail-slot-tab-0-4" data-oods-component="StatusTimeline" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                              <Text id="detail-pg-status-timeline-27" data-oods-component="Text" label="Status">{{ status }}</Text>
                                              <Text id="detail-pg-status-timeline-28" data-oods-component="Text" label="Allowed transitions">{{ Array.isArray(allowedTransitions) ? allowedTransitions.join(', ') : '' }}</Text>
                                            </StatusTimeline>
                                          <Text id="detail-slot-tab-2-8" data-oods-component="Text" label="Created at">{{ createdAt }}</Text>
                                        </Stack>
                                      </template>
                                    </template>
                                  </Tabs>
                      </div>
                      <aside data-sidebar-aside>
                        <Stack id="detail-detail-meta-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)" />
                      </aside>
                    </Card>
            </Stack>
      </template>
    </Stack>
  <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
    <button type="button" data-oods-action="handleDelete" @click="handleDelete()">Archive</button>
    <button type="button" data-oods-action="handleEdit" @click="handleEdit()">Edit</button>
    <button type="button" data-oods-action="handleViewTimeline" @click="handleViewTimeline()">View timeline</button>
  </div>
</template>

<script setup lang="ts">
import { Banner, Card, DetailHeader, OwnershipSummary, Stack, StatusTimeline, Tabs, TagManager, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface GeneratedUIActions {
  handleDelete: () => void;
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
  lastEvent: string;
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** System that originated or inferred the relationship. */
  originSource?: 'manual' | 'ingestion' | 'analytics' | 'integration';
  /** Identifier of the owning principal scoped by owner_type. */
  ownerId: string;
  /** Categorical owner type sourced from the ownerTypes parameter. */
  ownerType: string;
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
  status: string;
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

const { actions, uiState, allowedTransitions, createdAt, description, direction, isBidirectional, label, lastEvent, lastEventAt, originSource, ownerId, ownerType, ownershipRole, ownershipTransferredAt, placeholder, relationshipId, relationshipType, sourceId, stateHistory, status, strength, tagCount, tagMetadata, tags, targetId, updatedAt } = defineProps<Props>();

if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleDelete') || typeof actions.handleDelete !== 'function') { throw new Error('GeneratedUI requires actions.handleDelete.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

/* @oods-domain-binding handleDelete */ const handleDelete = () => { actions.handleDelete(); };
/* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
/* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
