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
                      <Text id="timeline-timeline-header-1-title" data-oods-component="Text">{{ label }}</Text>
                    </Stack>
              <section id="timeline-timeline-entries-13" data-oods-collection="events"><template v-if="events.length === 0"><Banner id="timeline-timeline-entries-13-empty" data-oods-component="Banner" content="No events yet." /></template><ol v-else aria-label="Lifecycle history" class="oods-collection"><li v-for="(collectionEvent, collectionIndex) in chronologicalEvents(events)" :key="collectionEvent.id"><Card :id="'timeline-timeline-entries-13-entry-' + collectionIndex"><TimelineEntryLabel :id="'timeline-ve-entry-0-15-' + collectionIndex" data-oods-component="TimelineEntryLabel" compact :label="label" /><strong>{{ collectionEvent.title }}</strong><time :datetime="collectionEvent.at">{{ formatDateTime(collectionEvent.at) }}</time><p>{{ collectionEvent.description }}</p></Card></li></ol></section>
              <Stack id="timeline-timeline-entries-13-trait-events" data-oods-component="Stack">
                      <StateTransitionEvent id="timeline-ve-entry-0-16" data-oods-component="StateTransitionEvent" showActor showReason :history="stateHistory" :status="status" />
                    </Stack>
            </Stack>
      </template>
    </Stack>
</template>

<script setup lang="ts">
import { chronologicalEvents, formatDateTime, type CollectionEvent } from '@oods/component-contracts';
import { Banner, Card, Stack, StateTransitionEvent, Text, TimelineEntryLabel } from '@oods/components-vue';
import '@oods/component-styles/css';

type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

interface Props {
  events?: CollectionEvent[];
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

const { uiState, allowedTransitions, createdAt, description, direction, isBidirectional, label, lastEvent, lastEventAt, originSource, ownerId, ownerType, ownershipRole, ownershipTransferredAt, placeholder, relationshipId, relationshipType, sourceId, stateHistory, status, strength, tagCount, tagMetadata, tags, targetId, updatedAt, events = [] } = defineProps<Props>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
